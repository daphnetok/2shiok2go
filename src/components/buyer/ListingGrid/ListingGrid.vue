<template>
  <div class="listings-container">
    <div class="header-with-location clickable" @click="toggleModal">
      <h2>{{ searchQuery ? 'Search Results' : 'Near Me' }}</h2>
      <h3 v-if="isLoadingAddress" class="location-text loading">
        Loading Address...
      </h3>
      <h3 v-else-if="formattedAddress" class="location-text">
        - {{ formattedAddress }}
      </h3>
    </div>

    <!-- location modal -->
     <LocationModal
      :isOpen="isModalOpen"
      :formattedAddress="formattedAddress"
      :currentGPSAddress="currentGPSAddress"
      @close="toggleModal"
      @locationSelected="handleLocationSelected"
    />
    
    <!-- location permission notice -->
    <div v-if="locationError" class="alert alert-warning">
      {{ locationError }} - Showing all stalls without distance sorting
    </div>
    <!-- Loading state -->
    <LoadingSpinner v-if="loading" message="Loading listings..." />
    <LoadingSpinner v-if="loading" message="Loading listings..." />
    
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
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue';
import { useLoadHawkers, useLoadListings } from '/firebase/firestore';
import { useGeolocation } from '@/assets/composables/useGeolocation';

export default {
  name: 'ListingGrid',
  components: { ListingCard, LoadingSpinner },
  props: {
    priceOrder: {
      type: String,
      default: null // 'asc' | 'desc' | null
    },
    priceMax: {
      type: Number,
      default: 20
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

    // Perform search function
    const performSearch = (query) => {
      if (!query || query.trim() === '') {
        return null;
      }

      const searchTerm = query.toLowerCase().trim();
      const searchWords = searchTerm.split(/\s+/); // Split into words for better matching
      const matchingHawkerIds = new Set(); // Store hawker IDs matched by address
      const matchingUserIds = new Set(); // Store userIds matched by items
      const hawkerItemMap = new Map(); // Map of hawker userId to matching items
      const hawkerScores = new Map(); // Track relevance scores

      // Search in hawker addresses and stall names
      const hawkerListings = allHawkers.value || [];
      hawkerListings.forEach(hawker => {
        const address = (hawker.address?.formattedAddress || '').toLowerCase();
        const stallName = (hawker.hawkerName || '').toLowerCase();
        const dietaryInfo = (hawker.dietaryRestriction || '').toLowerCase();
        let score = 0;
        
        // Exact match gets highest score
        if (stallName === searchTerm || address.includes(searchTerm)) {
          score += 10;
          matchingHawkerIds.add(hawker.id);
        } else {
          // Check if all search words are present
          const allWordsMatch = searchWords.every(word => 
            stallName.includes(word) || address.includes(word) || dietaryInfo.includes(word)
          );
          if (allWordsMatch) {
            score += 5;
            matchingHawkerIds.add(hawker.id);
          } else {
            // Check if any search word matches
            const anyWordMatch = searchWords.some(word => 
              stallName.includes(word) || address.includes(word) || dietaryInfo.includes(word)
            );
            if (anyWordMatch) {
              score += 2;
              matchingHawkerIds.add(hawker.id);
            }
          }
        }
        
        if (score > 0) {
          hawkerScores.set(hawker.id, score);
        }
      });

      // Search in item names
      const items = itemListings.value || [];
      items.forEach(item => {
        const itemName = (item.itemName || '').toLowerCase();
        const itemDescription = (item.description || '').toLowerCase();
        let score = 0;
        
        // Exact match
        if (itemName === searchTerm) {
          score += 10;
        } else if (itemName.includes(searchTerm)) {
          score += 8;
        } else {
          // Check all words match
          const allWordsMatch = searchWords.every(word => 
            itemName.includes(word) || itemDescription.includes(word)
          );
          if (allWordsMatch) {
            score += 6;
          } else {
            // Check if any word matches
            const anyWordMatch = searchWords.some(word => 
              itemName.includes(word) || itemDescription.includes(word)
            );
            if (anyWordMatch) {
              score += 3;
            }
          }
        }
        
        if (score > 0) {
          const userId = item.userId;
          if (userId) {
            matchingUserIds.add(userId);
            // Store matching item info
            if (!hawkerItemMap.has(userId)) {
              hawkerItemMap.set(userId, []);
            }
            hawkerItemMap.get(userId).push({
              itemName: item.itemName,
              imageUrl: item.imageUrl || '',
              score: score
            });
            
            // Add item score to hawker score
            const hawker = hawkerListings.find(h => h.userId === userId);
            if (hawker) {
              const currentScore = hawkerScores.get(hawker.id) || 0;
              hawkerScores.set(hawker.id, currentScore + score);
            }
          }
        }
      });

      // Return matching hawkers with their matching items, sorted by relevance
      const results = hawkerListings
        .filter(hawker => matchingHawkerIds.has(hawker.id) || matchingUserIds.has(hawker.userId))
        .map(hawker => {
          const matchingItems = hawkerItemMap.get(hawker.userId) || [];
          // Sort matching items by score
          matchingItems.sort((a, b) => b.score - a.score);
          return {
            ...hawker,
            matchingItems: matchingItems.length > 0 ? matchingItems : undefined,
            searchScore: hawkerScores.get(hawker.id) || 0
          };
        })
        .sort((a, b) => b.searchScore - a.searchScore); // Sort by relevance
      
      console.log(`🔍 Search for "${query}" found ${results.length} results`);
      return results;
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
      // Start with search results if search is active, otherwise all hawkers
      let list;
      
      if (props.searchQuery && props.searchQuery.trim() !== '') {
        // If search is active, start with search results
        const results = performSearch(props.searchQuery);
        if (!results || results.length === 0) {
          return []; // No search results
        }
        list = results.slice();
      } else {
        // No search, use all hawkers
        list = (allHawkers.value || []).slice();
      }

      // Filter out hawkers with no active items
      list = list.filter(h => hasActiveItems(h));

      // Filter by price range - check hawker's priceRange field
      if (props.priceMax && props.priceMax < 20) {
        console.log('💰 Price filter active: max price =', props.priceMax);
        list = list.filter(hawker => {
          // Get priceRange from hawker document (stored as string in Firebase)
          const hawkerPriceRange = parseFloat(hawker.priceRange) || 0;
          const matches = hawkerPriceRange <= props.priceMax;
          
          if (!matches) {
            console.log(`❌ Hawker "${hawker.name || hawker.hawkerName}" priceRange=${hawkerPriceRange} exceeds max ${props.priceMax}`);
          } else {
            console.log(`✅ Hawker "${hawker.name || hawker.hawkerName}" priceRange=${hawkerPriceRange} within max ${props.priceMax}`);
          }
          
          return matches;
        });
        console.log(`📊 After price filter: ${list.length} hawkers remaining`);
      }

      // Filter by dietaryRestriction (string) if any selected
      if (props.dietary.length) {
        console.log('🍽️ Dietary filter active:', props.dietary);
        list = list.filter(h => {
          const tag = getDietary(h);
          const normalizedFilters = props.dietary.map(d => d.toString().toLowerCase().trim());
          const matches = normalizedFilters.includes(tag);
          
          if (!matches) {
            console.log(`❌ Hawker "${h.name || h.hawkerName}" dietary="${tag}" doesn't match filters:`, normalizedFilters);
          } else {
            console.log(`✅ Hawker "${h.name || h.hawkerName}" dietary="${tag}" MATCHES!`);
          }
          
          return matches;
        });
        console.log(`📊 After dietary filter: ${list.length} hawkers remaining`);
      }

      // Filter by status if any selected
      if (props.status && props.status.length) {
        list = list.filter(h => props.status.includes(getStatus(h)));
      }

      // Sort by price if priceOrder is set
      if (props.priceOrder) {
        list.sort((a, b) => {
          // Get minimum price for each hawker
          const getMinPrice = (hawker) => {
            const hawkerName = hawker.name || hawker.hawkerName || hawker.stallName;
            if (!hawkerName) return Infinity;
            
            const hawkerItems = itemListings.value.filter(item => {
              const itemHawkerName = item.hawkerName || item.stallName;
              const isMatchingHawker = itemHawkerName && 
                itemHawkerName.toLowerCase().trim() === hawkerName.toLowerCase().trim();
              return isMatchingHawker && item.makeActive;
            });
            
            if (hawkerItems.length === 0) return Infinity;
            
            const prices = hawkerItems.map(item => item.discountedPrice || item.itemPrice || 0);
            return Math.min(...prices);
          };
          
          const priceA = getMinPrice(a);
          const priceB = getMinPrice(b);
          
          return props.priceOrder === 'asc' ? priceA - priceB : priceB - priceA;
        });
      } else {
        // Default sort by distance
        list.sort((a, b) => {
          const da = getDistance(a);
          const db = getDistance(b);

          // handle 'N/A' distances
          if (da === 'N/A' && db === 'N/A') return 0;
          if (da === 'N/A') return 1;
          if (db === 'N/A') return -1;

          return da - db;
        });
      }

      // Final sort: Open hawkers first, then closed (maintains previous sorting within each group)
      list.sort((a, b) => {
        const statusA = getStatus(a);
        const statusB = getStatus(b);
        
        // Priority: open/opening-soon/closing-soon come before closed
        const isOpenA = ['open', 'opening-soon', 'closing-soon'].includes(statusA);
        const isOpenB = ['open', 'opening-soon', 'closing-soon'].includes(statusB);
        
        if (isOpenA && !isOpenB) return -1; // A is open, B is closed: A comes first
        if (!isOpenA && isOpenB) return 1;  // B is open, A is closed: B comes first
        return 0; // Both same status, maintain existing order
      });

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

.header-with-location {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.header-with-location.clickable {
  cursor: pointer;
  transition: opacity 0.2s;
}

.header-with-location.clickable:hover {
  opacity: 0.7;
}


h2 {
  margin-bottom: 0;
  color: #333;
  padding-left: 10px;

}

.location-text {
  color: #333;
  font-size: 1.4rem;
  font-weight: 400;
  margin: 0;
}

.location-text.loading {
  color: #999;
  font-style: italic;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.alert-warning {
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  color: #856404;
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

  .location-text {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .listings-grid {
    grid-template-columns: 1fr;
  }

  .header-with-location {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>