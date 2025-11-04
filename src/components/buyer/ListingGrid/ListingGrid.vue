<template>
  <div class="listings-container">
    <h2>{{ searchQuery ? 'Search Results' : 'Near Me' }}</h2>
    
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
      <p>{{ searchQuery ? 'No results found for your search' : 'No listings available' }}</p>
    </div>
    
    <!-- Listings grid -->
    <div v-else class="listings-grid">
      <div v-for="hawker in filteredHawkers" :key="hawker.id" class="hawker-result-wrapper">
        <ListingCard 
          :hawker="hawker"
        />
        <!-- Display matching items if search is active and items exist -->
        <div v-if="searchQuery && hawker.matchingItems && hawker.matchingItems.length > 0" class="matching-items">
          <div class="matching-items-header">
            <span class="matching-items-label">Matching items:</span>
          </div>
          <div class="matching-items-grid">
            <div 
              v-for="(item, idx) in hawker.matchingItems" 
              :key="idx" 
              class="matching-item"
            >
              <img 
                :src="item.imageUrl" 
                :alt="item.itemName"
                class="matching-item-image"
                @error="handleImageError"
              />
              <span class="matching-item-name">{{ item.itemName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue';
import ListingCard from '../ListingCard/ListingCard.vue';
import { useLoadHawkers, useLoadListings } from '/firebase/firestore';
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
    },
    searchQuery: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const { userLocation, locationError, getUserLocation } = useGeolocation();
    const hawkersRef = ref(null);
    const itemListings = useLoadListings();
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
      return hawkersRef.value?.value === null;
    });

    // Perform search function
    const performSearch = (query) => {
      if (!query || query.trim() === '') {
        return null;
      }

      const searchTerm = query.toLowerCase().trim();
      const matchingHawkerIds = new Set(); // Store hawker IDs matched by address
      const matchingUserIds = new Set(); // Store userIds matched by items
      const hawkerItemMap = new Map(); // Map of hawker userId to matching items

      // Search in hawker addresses and stall names
      const hawkerListings = allHawkers.value || [];
      hawkerListings.forEach(hawker => {
        const address = hawker.address?.formattedAddress || '';
        const stallName = hawker.hawkerName || '';
        // Match by address or stall name
        if (address.toLowerCase().includes(searchTerm) || stallName.toLowerCase().includes(searchTerm)) {
          matchingHawkerIds.add(hawker.id);
        }
      });

      // Search in item names
      const items = itemListings.value || [];
      items.forEach(item => {
        const itemName = item.itemName || '';
        if (itemName.toLowerCase().includes(searchTerm)) {
          const userId = item.userId;
          if (userId) {
            matchingUserIds.add(userId);
            // Store matching item info
            if (!hawkerItemMap.has(userId)) {
              hawkerItemMap.set(userId, []);
            }
            hawkerItemMap.get(userId).push({
              itemName: item.itemName,
              imageUrl: item.imageUrl || ''
            });
          }
        }
      });

      // Return matching hawkers with their matching items
      // Match by either hawker.id (address match) or hawker.userId (item match)
      return hawkerListings
        .filter(hawker => matchingHawkerIds.has(hawker.id) || matchingUserIds.has(hawker.userId))
        .map(hawker => {
          const matchingItems = hawkerItemMap.get(hawker.userId) || [];
          return {
            ...hawker,
            matchingItems: matchingItems.length > 0 ? matchingItems : undefined
          };
        });
    };

    // Search results
    const searchResults = computed(() => {
      if (!props.searchQuery || props.searchQuery.trim() === '') {
        return null;
      }
      return performSearch(props.searchQuery);
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
      // Use search results if search is active, otherwise use all hawkers
      let list = searchResults.value !== null 
        ? (searchResults.value || []).slice()
        : (allHawkers.value || []).slice();

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

    // Handle image error fallback
    const handleImageError = (event) => {
      event.target.src = '/img/chicken_rice.jpg'; // Fallback image
    };

    return { 
      filteredHawkers, 
      loading, 
      locationError,
      searchQuery: computed(() => props.searchQuery),
      handleImageError
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

.hawker-result-wrapper {
  display: flex;
  flex-direction: column;
}

.matching-items {
  margin-top: 12px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.matching-items-header {
  margin-bottom: 8px;
}

.matching-items-label {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.matching-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.matching-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.matching-item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.matching-item-name {
  font-size: 12px;
  color: #555;
  text-align: center;
  word-break: break-word;
  max-width: 100%;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .listings-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 15px;
  }
  
  .matching-items-grid {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: 10px;
  }
  
  .matching-item-image {
    width: 70px;
    height: 70px;
  }
}

@media (max-width: 480px) {
  .listings-grid {
    grid-template-columns: 1fr;
  }
}
</style>