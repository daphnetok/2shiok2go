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
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue';
import ListingCard from '../ListingCard/ListingCard.vue';
import { useLoadHawkers } from '/firebase/firestore';
import { useGeolocation } from '@/assets/composables/useGeolocation';

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
    const ROAD_FACTOR = 1.1 // for urban road detour estimate

    // fetch user location on mount
    onMounted(async () => {
      await getUserLocation();
    });

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
      hawkersRef.value?.value === null;
    });

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

    return { filteredHawkers, loading, locationError };
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
  justify-content:flex-start;
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