import { computed, onMounted, ref, watch, onBeforeUnmount } from 'vue';
import ListingCard from '../ListingCard/ListingCard.vue';
import LocationModal from '../BottomSheet/BottomSheet.vue';
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue';
import ToastNotification from '../ToastNotification/ToastNotification.vue';
import { useLoadHawkers, useLoadListings } from '/firebase/firestore';
import { useGeolocation, reverseGeocode } from '@/assets/composables/useGeolocation';
import { useRoute, useRouter } from 'vue-router';
import { auth, db } from '/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export default {
  name: 'ListingGrid',
  components: {
    ListingCard,
    LocationModal,
    LoadingSpinner,
    ToastNotification
  },
  props: {
    priceOrder: {
      type: String,
      default: null
    },
    priceMax: {
      type: Number,
      default: 4
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
    const ROAD_FACTOR = 1.1; 
    const formattedAddress = ref('');
    const currentGPSAddress = ref('');
    const isLoadingAddress = ref(false);
    const isModalOpen = ref(false);
    const route = useRoute();
    const router = useRouter();
    const isMounted = ref(true);
    const itemListings = useLoadListings();
    const isUsingCurrentLocation = ref(true);

    onMounted(async () => {
      // Check for newLocationId first
      if (route.query.newLocationId) {
        try {
          const user = auth.currentUser;
          if (user) {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
              const savedLocs = userDoc.data().savedLocations || [];
              const newLoc = savedLocs.find(loc => loc.id === route.query.newLocationId);
              
              if (newLoc) {
                userLocation.value = {
                  latitude: newLoc.latitude,
                  longitude: newLoc.longitude
                };
                formattedAddress.value = newLoc.formattedAddress;
                
                router.replace({ query: {} });
                return;
              }
            }
          }
        } catch (error) {
          console.error('Error loading new location:', error);
        }
      }
      
      // Only call if no newLocationId was found
      await getUserLocation();
    })

    watch(
      userLocation,
      async (newLocation) => {
        if (!newLocation) {
          hawkersRef.value = null;
          return;
        }
        
        hawkersRef.value = useLoadHawkers(newLocation);
        console.log(newLocation);

        if (newLocation?.latitude && newLocation?.longitude) {
          // HIGH #1 FIX: Explicit check for empty/Loading state
          if (!formattedAddress.value || 
              formattedAddress.value.trim() === '' || 
              formattedAddress.value === 'Loading...') {
            isLoadingAddress.value = true;
            const address = await reverseGeocode(
              newLocation.latitude,
              newLocation.longitude
            );
            formattedAddress.value = address;
            currentGPSAddress.value = address;
            isLoadingAddress.value = false;
          }
        }
      }
    );

    const headerText = computed(() => {
      if (props.searchQuery) return 'Search Results';
      return isUsingCurrentLocation.value ? 'Near Me' : 'Selected Location';
    });

    const allHawkers = computed(() => {
      const hawkers = hawkersRef.value?.value || [];
      return hawkers.map(hawker => ({
        ...hawker,
        distance: hawker.distance && hawker.distance != 'N/A'
          ? parseFloat((hawker.distance * ROAD_FACTOR).toFixed(1))
          : hawker.distance
      }));
    });
    
    const loading = computed(() => {
      return hawkersRef.value?.value === null
    });

    const hasActiveItems = (hawker) => {
      if (!hawker.userId) return false;
      
      return itemListings.value.some(item => {
        return item.userId === hawker.userId && item.makeActive === true;
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

    const getDietary = (h) => {
      return (h.dietaryRestriction ?? '').toString().toLowerCase().trim();
    };

    const getDistance = (h) => {
      return h.distance ?? 'N/A';
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

      // Filter by price range (1-4) - Position 4 shows all, positions 1-3 filter
      if (props.priceMax && props.priceMax < 4) {
        console.log(`💰 Price filter active: showing priceRange 1-${props.priceMax}`);
        list = list.filter(hawker => {
          // Get priceRange from hawker document (stored as 1, 2, 3, or 4)
          const hawkerPriceRange = parseInt(hawker.priceRange) || 0;
          const matches = hawkerPriceRange > 0 && hawkerPriceRange <= props.priceMax;
          
          if (!matches) {
            console.log(`❌ Hawker "${hawker.name || hawker.hawkerName}" priceRange=${hawkerPriceRange} exceeds max ${props.priceMax}`);
          } else {
            console.log(`✅ Hawker "${hawker.name || hawker.hawkerName}" priceRange=${hawkerPriceRange} within range 1-${props.priceMax}`);
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
          // PRIMARY SORT: Group by priceRange category (1=$, 2=$$, 3=$$$, 4=$$$$)
          const priceRangeA = parseInt(a.priceRange) || 999;
          const priceRangeB = parseInt(b.priceRange) || 999;
          
          if (priceRangeA !== priceRangeB) {
            // When priceOrder is 'asc', show $ first (1 < 2 < 3 < 4)
            // When priceOrder is 'desc', show $$$$ first (4 > 3 > 2 > 1)
            return props.priceOrder === 'asc' 
              ? priceRangeA - priceRangeB 
              : priceRangeB - priceRangeA;
          }
          
          // SECONDARY SORT: Within same priceRange, sort by distance (closest first)
          const da = getDistance(a);
          const db = getDistance(b);
          
          if (da === 'N/A' && db === 'N/A') return 0;
          if (da === 'N/A') return 1;
          if (db === 'N/A') return -1;
          
          return da - db;
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
    
    const toggleModal = () => {
      isModalOpen.value = !isModalOpen.value
    };

    const handleLocationSelected = async (locationData) => {
      if (locationData.type === 'current') {
        // Set to Loading... FIRST so watch runs reverseGeocode
        formattedAddress.value = 'Loading...';
        isLoadingAddress.value = true;
        isUsingCurrentLocation.value = true;
        
        try {
          await getUserLocation();
          // Watch will update both formattedAddress and currentGPSAddress
        } catch (err) {
          formattedAddress.value = currentGPSAddress.value || 'Location unavailable';
          console.error('Failed to get GPS:', err);
        } finally {
          isLoadingAddress.value = false;
        }
      } else if (locationData.type === 'saved') {
        isUsingCurrentLocation.value = false;
        userLocation.value = {
          latitude: locationData.data.latitude,
          longitude: locationData.data.longitude
        };
        formattedAddress.value = locationData.data.formattedAddress;
      }
    };

    // Handle image error fallback
    const handleImageError = (event) => {
      event.target.src = '/img/chicken_rice.jpg'; // Fallback image
    };

    onBeforeUnmount(() => {
      isMounted.value = false;
    });

    return {
      filteredHawkers,
      loading,
      locationError,
      formattedAddress,
      currentGPSAddress,
      isLoadingAddress,
      isModalOpen,
      toggleModal,
      handleLocationSelected,
      searchQuery: computed(() => props.searchQuery),
      handleImageError,
      headerText
    };
  }
};