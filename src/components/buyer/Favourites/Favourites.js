import { computed, ref, onMounted, onActivated } from 'vue';
import ListingCard from '../ListingCard/ListingCard.vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFavourites } from '../../../../firebase/firestore';

export default {
  name: 'Favourites',
  components: { ListingCard },
  props: {
    priceOrder: {
      type: String,
      default: null // 'asc' | 'desc' | null
    },
    dietary: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const auth = getAuth();
    const userId = ref(null);
    const allHawkers = ref([]);
    const loading = ref(true);

    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      if (user) {
        userId.value = user.uid;
        console.log('User authenticated in Favourites:', userId.value);
        fetchFavoritedHawkers();
      } else {
        userId.value = null;
        allHawkers.value = [];
        loading.value = false;
        console.log('No user authenticated in Favourites');
      }
    });

    // Helper functions for filtering and sorting
    const getDietary = (h) => {
      return (h.dietaryRestriction ?? '').toString().toLowerCase().trim();
    };

    const getDistance = (h) => {
      const d = Number((h.distance ?? '0').toString());
      return Number.isNaN(d) ? 0 : d;
    };

    const filteredHawkers = computed(() => {
      const list = (allHawkers.value || []).slice();

      // Filter by dietaryRestriction
      const filtered = props.dietary.length
        ? list.filter(h => {
            const tag = getDietary(h);
            return props.dietary
              .map(d => d.toString().toLowerCase().trim())
              .includes(tag);
          })
        : list;

      // Sort by distance if priceOrder provided
      if (props.priceOrder) {
        filtered.sort((a, b) => {
          const da = getDistance(a);
          const db = getDistance(b);
          return props.priceOrder === 'asc' ? da - db : db - da;
        });
      }

      return filtered;
    });

    // Fetch the user's favourited hawkers based on the userId
    const fetchFavoritedHawkers = async () => {
      if (!userId.value) {
        loading.value = false;
        return;
      }

      loading.value = true;
      try {
        const favourited = await getFavourites(userId.value);
        allHawkers.value = favourited;
        console.log('Fetched favourited hawkers:', favourited);
      } catch (error) {
        console.error('Error fetching favourited hawkers:', error);
      } finally {
        loading.value = false;
      }
    };

    // Refresh data when component is mounted
    onMounted(() => {
      if (userId.value) {
        fetchFavoritedHawkers();
      }
    });

    // Refresh data when navigating back to this page (if using keep-alive)
    onActivated(() => {
      if (userId.value) {
        fetchFavoritedHawkers();
      }
    });

    return {
      filteredHawkers,
      loading,
      fetchFavoritedHawkers // Expose for manual refresh if needed
    };
  }
};