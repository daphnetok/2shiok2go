import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import ListingCard from '../ListingCard/ListingCard.vue';
import { useLoadHawkers } from '/firebase/firestore.js';
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
    }
  },
  setup(props) {
    const { userLocation, locationError, getUserLocation } = useGeolocation();
    const hawkersRef = ref(null);
    const itemListings = ref([]);
    const itemsLoaded = ref(false);
    const ROAD_FACTOR = 1.1 // for urban road detour estimate
    let unsubscribeItems = null;

    // fetch user location on mount
    onMounted(async () => {
      await getUserLocation();
      setupItemListingsListener();
    });

    // Set up real-time listener for item listings
    const setupItemListingsListener = () => {
      try {
        const itemsCollection = collection(db, 'itemListings');
        unsubscribeItems = onSnapshot(itemsCollection, (snapshot) => {
          itemListings.value = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          itemsLoaded.value = true;
        }, (error) => {
          console.error('Error loading item listings:', error);
          itemsLoaded.value = true; // Set to true even on error to show hawkers
        });
      } catch (error) {
        console.error('Error setting up item listings listener:', error);
        itemsLoaded.value = true;
      }
    };

    watch(
      userLocation,
      (newLocation) => {
        hawkersRef.value = useLoadHawkers(newLocation);
        console.log(newLocation);
      }
    );

    // load hawkers with user location (reactive)
    const allHawkers = computed(() => {
      const hawkers = hawkersRef.value?.value || [];

      // apply road factor to all hawker distances
      return hawkers.map(hawker => ({
        ...hawker,
        distance: hawker.distance && hawker.distance != 'N/A'
          ? parseFloat((hawker.distance * ROAD_FACTOR).toFixed(1))
          :hawker.distance
      }));
    });

    const loading = computed(() => {
      return hawkersRef.value?.value === null || !itemsLoaded.value;
    });

    // Helper: check if hawker has any items listed
    const hasItems = (hawker) => {
      // Check if any item in itemListings has matching hawkerName
      const hawkerName = hawker.name || hawker.hawkerName || hawker.stallName;
      if (!hawkerName) return false;
      
      return itemListings.value.some(item => {
        const itemHawkerName = item.hawkerName || item.stallName;
        return itemHawkerName && itemHawkerName.toLowerCase().trim() === hawkerName.toLowerCase().trim();
      });
    };

    // Helpers aligned to your schema
    const getDietary = (h) => {
      // dietaryRestriction is a string like "Halal"
      return (h.dietaryRestriction ?? '').toString().toLowerCase().trim();
    };

    const getDistance = (h) => {
      return h.distance ?? 'N/A';
    };

    // Helper: get status for a hawker (same logic as ListingCard)
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
          let minutesUntilClose;
          if (currentTime >= openingTimeInMinutes) {
            minutesUntilClose = (24 * 60 - currentTime) + closingTimeInMinutes;
          } else {
            minutesUntilClose = closingTimeInMinutes - currentTime;
          }
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

    const filteredHawkers = computed(() => {
      let list = (allHawkers.value || []).slice();

      // Filter out hawkers with no items listed
      list = list.filter(h => hasItems(h));

      // Filter by dietaryRestriction (string) if any selected
      if (props.dietary.length) {
        list = list.filter(h => {
          const tag = getDietary(h);
          return props.dietary.map(d => d.toString().toLowerCase().trim()).includes(tag);
        });
      }

      // Filter by status if any selected
      if (props.status && props.status.length) {
        list = list.filter(h => props.status.includes(getStatus(h)));
      }

      // //TODO: Add price sorting when price field is available in schema
      // if (props.priceOrder) {
      //   
      // }

      // default sort by distance
      const sortOrder = 'asc';
      list.sort((a, b) => {
        const da = getDistance(a);
        const db = getDistance(b);

        // handle 'N/A' distances
        if (da === 'N/A' && db === 'N/A') return 0;
        if (da === 'N/A') return 1;
        if (db === 'N/A') return -1;

        return sortOrder === 'asc' ? da - db : db - da;
      })

      return list;
    });

    // Cleanup listener on component unmount
    onUnmounted(() => {
      if (unsubscribeItems) {
        unsubscribeItems();
      }
    });

    return { filteredHawkers, loading, locationError };
  }
};