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
          ? parseFloat((hawker.distance * ROAD_FACTOR).toFixed(2))
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

    const filteredHawkers = computed(() => {
      const list = (allHawkers.value || []).slice();

      // Filter by dietaryRestriction (string) if any selected
      const filtered = props.dietary.length
        ? list.filter(h => {
            const tag = getDietary(h); // e.g., "halal"
            // match if hawker's single tag is included in selected array
            return props.dietary
              .map(d => d.toString().toLowerCase().trim())
              .includes(tag); 
          })
        : list;

      // Price sort not available in schema; optionally sort by distance if priceOrder provided
      if (props.priceOrder) {
        filtered.sort((a, b) => {
          const da = getDistance(a);
          const db = getDistance(b);
          return props.priceOrder === 'asc' ? da - db : db - da;
        });
      }

      return filtered;
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