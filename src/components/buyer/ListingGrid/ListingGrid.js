import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import ListingCard from '../ListingCard/ListingCard.vue';
import { useLoadHawkers, useLoadListings } from '/firebase/firestore';
import { useGeolocation } from '@/assets/composables/useGeolocation';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '/firebase/config';

export default {
  name: 'ListingGrid',
  components: { ListingCard },
  props: {
    priceOrder: {
      type: String,
      default: null // 'asc' | 'desc' | null
    },
    dietary: {
      type: Array,
      default: () => []
    },
    status: {
      type: Array,
      default: () => []
    },
    searchQuery: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const { userLocation, locationError, getUserLocation } = useGeolocation();
    const hawkersRef = ref(null);
    const itemListings = ref([]);
    const itemsLoaded = ref(false);
    const ROAD_FACTOR = 1.1; // for urban road detour estimate
    let unsubscribeItems = null;

    // Fetch hawkers and listings
    const allHawkers = useLoadHawkers();
    const allItems = useLoadListings();
    const searchResults = ref([]);
    const searching = ref(false);

    // Fetch user location on mount
    onMounted(async () => {
      await getUserLocation();
      setupItemListingsListener();
    });

    // Real-time listener for item listings
    const setupItemListingsListener = () => {
      try {
        const itemsCollection = collection(db, 'itemListings');
        unsubscribeItems = onSnapshot(
          itemsCollection,
          (snapshot) => {
            itemListings.value = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data()
            }));
            itemsLoaded.value = true;
          },
          (error) => {
            console.error('Error loading item listings:', error);
            itemsLoaded.value = true;
          }
        );
      } catch (error) {
        console.error('Error setting up item listings listener:', error);
        itemsLoaded.value = true;
      }
    };

    // Helper functions
    const getDietary = (h) => (h.dietaryRestriction ?? '').toString().toLowerCase().trim();

    const getDistance = (h) => {
      const d = Number((h.distance ?? '0').toString());
      return Number.isNaN(d) ? 0 : d;
    };

    const getStatus = (hawker) => {
      if (!hawker.openingTime || !hawker.closingTime) return 'unknown';
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [openHour, openMin] = hawker.openingTime.split(':').map(Number);
      const [closeHour, closeMin] = hawker.closingTime.split(':').map(Number);
      const openingTimeInMinutes = openHour * 60 + openMin;
      const closingTimeInMinutes = closeHour * 60 + closeMin;

      if (closingTimeInMinutes < openingTimeInMinutes) {
        if (currentTime >= openingTimeInMinutes || currentTime < closingTimeInMinutes) {
          const minutesUntilClose =
            currentTime >= openingTimeInMinutes
              ? 24 * 60 - currentTime + closingTimeInMinutes
              : closingTimeInMinutes - currentTime;
          if (minutesUntilClose <= 30) return 'closing-soon';
          return 'open';
        } else {
          const minutesUntilOpen = openingTimeInMinutes - currentTime;
          if (minutesUntilOpen <= 30) return 'opening-soon';
          return 'closed';
        }
      } else {
        if (currentTime >= openingTimeInMinutes && currentTime < closingTimeInMinutes) {
          const minutesUntilClose = closingTimeInMinutes - currentTime;
          if (minutesUntilClose <= 30) return 'closing-soon';
          return 'open';
        } else if (currentTime < openingTimeInMinutes) {
          const minutesUntilOpen = openingTimeInMinutes - currentTime;
          if (minutesUntilOpen <= 30) return 'opening-soon';
          return 'closed';
        } else {
          return 'closed';
        }
      }
    };

    // Search logic
    const performSearch = (query) => {
      if (!query || query.trim() === '') {
        searchResults.value = [];
        searching.value = false;
        return;
      }

      searching.value = true;
      const searchTerm = query.toLowerCase().trim();
      const matchingHawkerIds = new Set();
      const hawkerMatchingItems = new Map();
      const hawkersList = allHawkers.value || [];
      const itemsList = allItems.value || [];

      // Match hawkers by address
      hawkersList.forEach((hawker) => {
        const address = hawker.address?.formattedAddress || '';
        if (address.toLowerCase().includes(searchTerm)) {
          matchingHawkerIds.add(hawker.userId);
          if (!hawkerMatchingItems.has(hawker.userId)) hawkerMatchingItems.set(hawker.userId, []);
        }
      });

      // Match items by name
      itemsList.forEach((item) => {
        const itemName = item.itemName || '';
        if (itemName.toLowerCase().includes(searchTerm) && item.userId) {
          matchingHawkerIds.add(item.userId);
          if (!hawkerMatchingItems.has(item.userId)) hawkerMatchingItems.set(item.userId, []);
          hawkerMatchingItems.get(item.userId).push({
            itemName: item.itemName,
            imageUrl: item.imageUrl
          });
        }
      });

      const matchedHawkers = hawkersList
        .filter((hawker) => matchingHawkerIds.has(hawker.userId))
        .map((hawker) => ({
          ...hawker,
          matchingItems: hawkerMatchingItems.get(hawker.userId) || []
        }));

      searchResults.value = matchedHawkers;
      searching.value = false;
    };

    // Watch for search query updates
    watch(
      () => props.searchQuery,
      (newQuery) => performSearch(newQuery),
      { immediate: true }
    );

    // Filtered hawkers (apply search + filters)
    const filteredHawkers = computed(() => {
      let list = [];

      // Search or all hawkers
      if (props.searchQuery && props.searchQuery.trim() !== '') {
        list = searchResults.value.slice();
      } else {
        list = (allHawkers.value || []).slice();
      }

      // Filter by dietary
      if (props.dietary.length) {
        list = list.filter((h) => {
          const tag = getDietary(h);
          return props.dietary.map((d) => d.toLowerCase().trim()).includes(tag);
        });
      }

      // Filter by status
      if (props.status.length) {
        list = list.filter((h) => props.status.includes(getStatus(h)));
      }

      // Sort by distance if priceOrder provided
      if (props.priceOrder) {
        list.sort((a, b) => {
          const da = getDistance(a);
          const db = getDistance(b);
          return props.priceOrder === 'asc' ? da - db : db - da;
        });
      }

      return list;
    });

    const loading = computed(() => allHawkers.value === null || searching.value);

    // Clean up on unmount
    onUnmounted(() => {
      if (unsubscribeItems) unsubscribeItems();
    });

    return { filteredHawkers, loading, locationError };
  }
};

