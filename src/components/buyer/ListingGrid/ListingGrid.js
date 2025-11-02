import { computed, ref, watch } from 'vue';
import ListingCard from '../ListingCard/ListingCard.vue';
import { useLoadHawkers, useLoadListings } from '/firebase/firestore';

export default {
  components: {
    ListingCard
  },
  props: {
    priceOrder: {
      type: String,
      default: null
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
    // Fetch ALL hawkers from Firestore
    const allHawkers = useLoadHawkers();
    const allItems = useLoadListings();
    const searchResults = ref([]);
    const searching = ref(false);

    // Helpers aligned to your schema
    const getDietary = (h) => {
      return (h.dietaryRestriction ?? '').toString().toLowerCase().trim();
    };

    const getDistance = (h) => {
      const d = Number((h.distance ?? '0').toString());
      return Number.isNaN(d) ? 0 : d;
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

    // Search function
    const performSearch = (query) => {
      if (!query || query.trim() === '') {
        searchResults.value = [];
        searching.value = false;
        return;
      }

      searching.value = true;
      const searchTerm = query.toLowerCase().trim();
      const matchingHawkerIds = new Set();
      const hawkerMatchingItems = new Map(); // Map: userId -> array of matching items
      const hawkersList = allHawkers.value || [];
      const itemsList = allItems.value || [];

      // Search by address in hawkerListings
      hawkersList.forEach(hawker => {
        const address = hawker.address?.formattedAddress || '';
        if (address.toLowerCase().includes(searchTerm)) {
          matchingHawkerIds.add(hawker.userId);
          // Initialize empty array for address-matched hawkers (no items)
          if (!hawkerMatchingItems.has(hawker.userId)) {
            hawkerMatchingItems.set(hawker.userId, []);
          }
        }
      });

      // Search by itemName in itemListings
      itemsList.forEach(item => {
        const itemName = item.itemName || '';
        if (itemName.toLowerCase().includes(searchTerm)) {
          // Find hawker by userId
          if (item.userId) {
            matchingHawkerIds.add(item.userId);
            // Add matching item to the hawker's list
            if (!hawkerMatchingItems.has(item.userId)) {
              hawkerMatchingItems.set(item.userId, []);
            }
            hawkerMatchingItems.get(item.userId).push({
              itemName: item.itemName,
              imageUrl: item.imageUrl
            });
          }
        }
      });

      // Get all matching hawkers with their matching items
      const matchedHawkers = hawkersList
        .filter(hawker => matchingHawkerIds.has(hawker.userId))
        .map(hawker => ({
          ...hawker,
          matchingItems: hawkerMatchingItems.get(hawker.userId) || []
        }));

      searchResults.value = matchedHawkers;
      searching.value = false;
    };

    // Watch for search query changes
    watch(() => props.searchQuery, (newQuery) => {
      performSearch(newQuery);
    }, { immediate: true });

    // Apply filters and search
    const filteredHawkers = computed(() => {
      let list = [];

      // If there's a search query, use search results
      if (props.searchQuery && props.searchQuery.trim() !== '') {
        list = searchResults.value.slice();
      } else {
        // Otherwise use all hawkers
        list = (allHawkers.value || []).slice();
      }

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

      // Price sort not available in schema; optionally sort by distance if priceOrder provided
      if (props.priceOrder) {
        list.sort((a, b) => {
          const da = getDistance(a);
          const db = getDistance(b);
          return props.priceOrder === 'asc' ? da - db : db - da;
        });
      }

      return list;
    });

    const loading = computed(() => {
      return allHawkers.value === null || searching.value;
    });

    return { 
      filteredHawkers, 
      loading,
      searchQuery: computed(() => props.searchQuery)
    };
  }
};
