<template>
  <div class="listings-container">
    <h2>Near Me</h2>
    
    <!-- location permission notice -->
    <div v-if="locationError" class="alert alert-warning">
      {{ locationError }} - Showing all stalls without distance sorting
    </div>
    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <p>Loading listings...</p>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="!filteredHawkers || filteredHawkers.length === 0" class="empty-state">
      <p>No listings available</p>
    </div>
    
    <!-- Listings grid -->
    <div v-else class="listings-grid">
      <ListingCard 
        v-for="hawker in filteredHawkers" 
        :key="hawker.id"
        :hawker="hawker"
      />
    </div>

    <!-- Toast Notifications -->
    <ToastNotification
      v-for="toast in toasts"
      :key="toast.id"
      :message="toast.message"
      :duration="5000"
      @close="removeToast(toast.id)"
    />
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import ListingCard from '../ListingCard/ListingCard.vue';
import ToastNotification from '../ToastNotification/ToastNotification.vue';
import { useLoadHawkers } from '/firebase/firestore.js';
import { useGeolocation } from '@/assets/composables/useGeolocation';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '/firebase/config';

export default {
  name: 'ListingGrid',
  components: { ListingCard, ToastNotification },
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
    const ROAD_FACTOR = 1.1; // for urban road detour estimate
    const MAX_DISTANCE_KM = 3; // 3km threshold for notifications
    let unsubscribeItems = null;
    
    // Toast notification state
    const toasts = ref([]);
    const toastIdCounter = ref(0);
    const trackedHawkers = ref(new Set()); // Track hawkers we've already notified about

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
          : hawker.distance
      }));
    });

    const loading = computed(() => {
      return hawkersRef.value?.value === null || !itemsLoaded.value;
    });

    // Helper: check if hawker has any active items listed
    const hasActiveItems = (hawker) => {
      const hawkerName = hawker.name || hawker.hawkerName || hawker.stallName;
      if (!hawkerName) return false;
      
      return itemListings.value.some(item => {
        const itemHawkerName = item.hawkerName || item.stallName;
        const isMatchingHawker = itemHawkerName && 
          itemHawkerName.toLowerCase().trim() === hawkerName.toLowerCase().trim();
        return isMatchingHawker && item.makeActive === true;
      });
    };

    // Helper: check if hawker is within distance threshold
    const isWithinRange = (hawker) => {
      const distance = hawker.distance;
      return distance !== 'N/A' && distance <= MAX_DISTANCE_KM;
    };

    // Helpers aligned to your schema
    const getDietary = (h) => {
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

      // Filter out hawkers with no active items
      list = list.filter(h => hasActiveItems(h));

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
      });

      return list;
    });

    // Watch for new hawkers within range with active items
    watch(
      [allHawkers, itemListings],
      ([newHawkers]) => {
        if (!itemsLoaded.value || loading.value) return;

        const nearbyNewHawkers = newHawkers.filter(hawker => {
          const hawkerId = hawker.id;
          const isNew = !trackedHawkers.value.has(hawkerId);
          const isNearby = isWithinRange(hawker);
          const hasItems = hasActiveItems(hawker);
          
          return isNew && isNearby && hasItems;
        });

        if (nearbyNewHawkers.length > 0) {
          // Add new hawkers to tracked set
          nearbyNewHawkers.forEach(h => trackedHawkers.value.add(h.id));

          // Create toast notification
          const message = nearbyNewHawkers.length === 1
            ? `New hawker near you: ${nearbyNewHawkers[0].name || nearbyNewHawkers[0].hawkerName}!`
            : `${nearbyNewHawkers.length} new hawkers near you!`;
          
          addToast(message);
        }
      },
      { deep: true }
    );

    // Toast management functions
    const addToast = (message) => {
      const id = toastIdCounter.value++;
      toasts.value.push({ id, message });
    };

    const removeToast = (id) => {
      const index = toasts.value.findIndex(t => t.id === id);
      if (index !== -1) {
        toasts.value.splice(index, 1);
      }
    };

    // Cleanup listener on component unmount
    onUnmounted(() => {
      if (unsubscribeItems) {
        unsubscribeItems();
      }
    });

    return { 
      filteredHawkers, 
      loading, 
      locationError,
      toasts,
      removeToast
    };
  }
};
</script>

<style scoped>
.listings-container {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #333;
  display: flex;
  justify-content: flex-start;
  padding-left: 10px;
}

.loading, .empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.listings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .listings-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .listings-grid {
    grid-template-columns: 1fr;
  }
}
</style>