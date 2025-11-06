import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { db } from '/firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import ReviewsSection from '../ReviewsSection/ReviewsSection.vue';
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue';
import ImageWithLoader from '@/components/shared/ImageWithLoader.vue';
import StallStatus from '@/components/buyer/StallStatus/StallStatus.vue';
import ItemModal from './ItemModal.vue';
import ItemCard from '@/components/buyer/ItemCard/ItemCard.vue';
import { getUserLocation, calculateDistance } from '@/assets/composables/useGeolocation';

export default {
  name: "StallListings",
  components: {
    ReviewsSection,
    LoadingSpinner,
    ImageWithLoader,
    StallStatus,
    ItemModal,
    ItemCard
  },
  props: {
    searchQuery: {
      type: String,
      default: ''
    }
  },
  emits: ['search'],
  methods: {
    // Check if discount is applied for an item (used by ItemModal)
    isDiscountApplied(item) {
      if (!item || !item.discountTime) return false;
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [hours, minutes] = item.discountTime.split(':');
      const discountStart = parseInt(hours) * 60 + parseInt(minutes);
      return currentTime >= discountStart;
    },
    
    // Helper method to check if stall is open (still needed for conditional logic in template)
    // Returns true if stall is open or closing soon (users can still order)
    isStallOpen() {
      if (!this.hawker || !this.hawker.openingTime || !this.hawker.closingTime) {
        return false;
      }
      
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const [openHour, openMin] = this.hawker.openingTime.split(':').map(Number);
      const [closeHour, closeMin] = this.hawker.closingTime.split(':').map(Number);
      
      const openingTimeInMinutes = openHour * 60 + openMin;
      const closingTimeInMinutes = closeHour * 60 + closeMin;
      
      // Handle overnight stalls (e.g., 18:00 to 02:00)
      if (closingTimeInMinutes < openingTimeInMinutes) {
        // Stall operates overnight
        if (currentTime >= openingTimeInMinutes || currentTime < closingTimeInMinutes) {
          // Currently open - check if closing soon
          let minutesUntilClose;
          if (currentTime >= openingTimeInMinutes) {
            minutesUntilClose = (24 * 60 - currentTime) + closingTimeInMinutes;
          } else {
            minutesUntilClose = closingTimeInMinutes - currentTime;
          }
          // Return true if open (even if closing soon, users can still order)
          return minutesUntilClose > 0;
        }
        return false;
      } else {
        // Normal operating hours
        if (currentTime >= openingTimeInMinutes && currentTime < closingTimeInMinutes) {
          // Currently open - check if closing soon
          const minutesUntilClose = closingTimeInMinutes - currentTime;
          // Return true if open (even if closing soon, users can still order)
          return minutesUntilClose > 0;
        }
        return false;
      }
    },
  },
  setup(props, { emit }) {
    const route = useRoute();
    const isLiked = ref(false);
    const hawker = ref(null);
    const foodItems = ref([]);
    const loading = ref(true);
    const errorMsg = ref(null);
    const showToast = ref(false);
    const selectedItems = ref([]);
    const localSearchQuery = ref('');
    let debounceTimer = null;

    const auth = getAuth();
    const userId = ref(null);
    const authReady = ref(false);
    
    // Modal-related refs
    const showModal = ref(false);
    const selectedItem = ref(null);
    
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      if (user) {
        userId.value = user.uid;
        console.log('User authenticated:', userId.value);
      } else {
        userId.value = null;
        console.log('No user authenticated');
      }
      authReady.value = true;
    });

    const showMap = ref(false);

    const triggerToast = (duration = 1500) => {
      showToast.value = true;
      setTimeout(() => { showToast.value = false; }, duration);
    };

    const toggleMap = () => {
      showMap.value = !showMap.value;
    };
    
    const saveIcons = {
      heart: 'fa-regular fa-heart saveIcon',
      heartFilled: 'fa-solid fa-heart savedIcon'
    };

    // Modal functions
    const openItemModal = (item) => {
      selectedItem.value = item;
      showModal.value = true;
      console.log('Opening modal for item:', item.itemName, 'Image URL:', item.imageUrl);
    };

    const closeModal = () => {
      showModal.value = false;
      selectedItem.value = null;
    };

    const handleAddToCart = async (data) => {
      if (!data || !data.item || data.quantity === 0) return;

      // Check if user is authenticated before proceeding
      if (!userId.value) {
        errorMsg.value = 'Please log in to add items to cart';
        closeModal();
        return;
      }

      // Update the item's count and notes
      data.item.count = data.quantity;
      data.item.notes = data.notes;

      // Save to cart
      await saveToCart(data.item);
      saveItemToList(data.item);

      // Only show success message if user is authenticated
      if (userId.value) {
        triggerToast();
      }
      
      // Close modal
      closeModal();
    };

    // Fetch hawker data from Firestore
    const getHawkerData = async () => {
      if (history.state?.hawker) {
        hawker.value = history.state.hawker;
        console.log('Hawker from state:', hawker.value);
        
        if (userId.value && hawker.value.favouritedUser && hawker.value.favouritedUser.includes(userId.value)) {
          isLiked.value = true;
        }
        return;
      }
      
      if (route.params.userId) {
        try {
          // Get user location for distance calculation
          let userCoords = null;
          try {
            userCoords = await getUserLocation();
            console.log('User location obtained:', userCoords);
          } catch (locationError) {
            console.warn('Could not get user location:', locationError);
            // Continue without location - distance will be 'N/A'
          }

          const hawkersRef = collection(db, 'hawkerListings');
          const q = query(hawkersRef, where('userId', '==', route.params.userId));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const data = docSnap.data();
            hawker.value = {
              id: docSnap.id,
              ...data
            };

            // Calculate distance if we have both user and hawker coordinates
            if (userCoords && userCoords.latitude && userCoords.longitude && 
                data.address?.latitude && data.address?.longitude) {
              const distance = calculateDistance(
                userCoords.latitude,
                userCoords.longitude,
                data.address.latitude,
                data.address.longitude
              );
              // Apply same ROAD_FACTOR as ListingGrid (1.1x multiplier)
              hawker.value.distance = parseFloat((distance * 1.1).toFixed(1));
              console.log('Distance calculated:', hawker.value.distance);
            } else {
              hawker.value.distance = 'N/A';
              console.log('Distance set to N/A - missing coordinates');
            }

            if (hawker.value.favouritedUser && hawker.value.favouritedUser.includes(userId.value)) {
              isLiked.value = true;
            }

            console.log('Hawker from Firestore:', hawker.value);
          } else {
            errorMsg.value = 'Hawker not found';
          }
        } catch (error) {
          console.error('Error fetching hawker details:', error);
          errorMsg.value = 'Error loading hawker details: ' + error.message;
        }
      }
    };

    // Load cart data and restore quantities
    const loadCartData = async () => {
      if (!userId.value) {
        console.log('No user logged in, skipping cart load');
        return {};
      }

      try {
        const cartRef = doc(db, 'cart', userId.value);
        const cartSnap = await getDoc(cartRef);

        if (cartSnap.exists()) {
          const cartData = cartSnap.data();
          const cartItems = cartData.items || [];
          
          // Create a map of itemId to item data for easy lookup
          const cartMap = {};
          cartItems.forEach(item => {
            cartMap[item.itemId] = {
              qty: item.qty,
              notes: item.notes || ''
            };
          });
          
          console.log('Cart data loaded:', cartMap);
          return cartMap;
        }
      } catch (error) {
        console.error('Error loading cart data:', error);
      }
      
      return {};
    };

    // Fetch food items for the hawker
    const fetchItemListings = async () => {
      if (!hawker.value?.userId) {
        errorMsg.value = 'No hawker ID provided';
        loading.value = false;
        return;
      }

      loading.value = true;
      
      try {
        // Load cart data first
        const cartMap = await loadCartData();
        
        const itemsRef = collection(db, 'itemListings');
        const q = query(
          itemsRef, 
          where('userId', '==', hawker.value.userId), 
          where('makeActive', '==', true)
        );
        const querySnapshot = await getDocs(q);
        
        foodItems.value = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const itemId = doc.id;
          
          // Restore count and notes from cart if it exists
          const savedData = cartMap[itemId] || { qty: 0, notes: '' };
          
          const item = {
            id: itemId,
            itemName: data.itemName,
            itemPrice: data.itemPrice,
            itemQty: data.itemQty,
            discountedPrice: data.discountedPrice,
            discount: data.discount,
            discountTime: data.discountTime,
            imageUrl: data.imageUrl,
            description: data.description || '',
            tags: data.tags || [],
            allergens: data.allergens || [],
            count: savedData.qty,
            notes: savedData.notes
          };
          // Add to selectedItems if count > 0
          if (savedData.qty > 0) {
            selectedItems.value.push({ ...item });
          }
          
          return item;
        });

        console.log('Food items loaded with cart quantities:', foodItems.value);
      } catch (error) {
        console.error('Error fetching item listings:', error);
        errorMsg.value = 'Error loading items: ' + error.message;
      } finally {
        loading.value = false;
      }
    };

    // Toggle the favorite (like) state
    const toggleLike = async () => {
      if (!authReady.value) {
        console.warn('Auth not ready yet');
        errorMsg.value = 'Please wait, loading...';
        return;
      }

      if (!userId.value) {
        console.warn('Cannot toggle like: No user logged in');
        errorMsg.value = 'Please log in to favorite this stall';
        return;
      }

      if (!hawker.value || !hawker.value.id) {
        console.warn('Cannot toggle like: No hawker data');
        errorMsg.value = 'Hawker data not available';
        return;
      }

      const newLikedState = !isLiked.value;
      const hawkerRef = doc(db, 'hawkerListings', hawker.value.id);

      try {
        console.log('Attempting to update with user:', userId.value);
        
        if (newLikedState) {
          await updateDoc(hawkerRef, {
            favouritedUser: arrayUnion(userId.value)
          });
        } else {
          await updateDoc(hawkerRef, {
            favouritedUser: arrayRemove(userId.value)
          });
        }

        isLiked.value = newLikedState;
        
        if (!hawker.value.favouritedUser) {
          hawker.value.favouritedUser = [];
        }
        
        if (newLikedState) {
          if (!hawker.value.favouritedUser.includes(userId.value)) {
            hawker.value.favouritedUser.push(userId.value);
          }
        } else {
          hawker.value.favouritedUser = hawker.value.favouritedUser.filter(id => id !== userId.value);
        }

        console.log('Favourite status updated successfully');

      } catch (error) {
        console.error('Error updating favourite status:', error);
        console.error('Error code:', error.code);
        errorMsg.value = 'Failed to update favorite status. Please try again.';
      }
    };

    // Save item to cart in Firebase
    const saveToCart = async (item) => {
      if (!userId.value) {
        console.warn('Cannot save to cart: No user logged in');
        errorMsg.value = 'Please log in to add items to cart';
        return;
      }

      try {
        const cartRef = doc(db, 'cart', userId.value);
        const cartSnap = await getDoc(cartRef);

        const cartItem = {
          itemId: item.id,
          itemName: item.itemName,
          qty: item.count,
          itemPrice: item.itemPrice,
          discount: item.discount,
          imageUrl: item.imageUrl,
          hawkerId: hawker.value.userId,
          hawkerName: hawker.value.hawkerName,
          notes: item.notes || ''
        };

        if (cartSnap.exists()) {
          // Cart exists, update it
          const existingItems = cartSnap.data().items || [];
          const itemIndex = existingItems.findIndex(i => i.itemId === item.id);

          if (item.count === 0) {
            // Remove item if count is 0
            if (itemIndex !== -1) {
              existingItems.splice(itemIndex, 1);
            }
          } else if (itemIndex !== -1) {
            // Update existing item
            existingItems[itemIndex] = cartItem;
          } else {
            // Add new item
            existingItems.push(cartItem);
          }

          await updateDoc(cartRef, {
            items: existingItems,
            updatedAt: new Date()
          });
        } else {
          // Create new cart
          if (item.count > 0) {
            await setDoc(cartRef, {
              uid: userId.value,
              items: [cartItem],
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }

        console.log('Cart updated successfully');
      } catch (error) {
        console.error('Error saving to cart:', error);
        errorMsg.value = 'Failed to update cart. Please try again.';
      }
    };

    // Increment item count
    const increment = async (item) => {
      if (!userId.value) {
        errorMsg.value = 'Please log in to add items to cart';
        return;
      }
      
      if (item.itemQty > 0 && item.count < item.itemQty) {
        item.count++;
        await saveToCart(item);
        saveItemToList(item);
        
        // Only show success message if user is authenticated
        if (userId.value) {
          triggerToast();
        }
      }
    };

    // Decrement item count
    const decrement = async (item) => {
      if (item.count > 0) {
        item.count--;
        await saveToCart(item);
        saveItemToList(item);
      }
    };

    // Save selected item to local list (for internal tracking)
    const saveItemToList = (item) => {
      const existingItemIndex = selectedItems.value.findIndex(selectedItem => selectedItem.id === item.id);
      
      if (item.count === 0) {
        if (existingItemIndex !== -1) {
          selectedItems.value.splice(existingItemIndex, 1);
        }
      } else if (existingItemIndex !== -1) {
        selectedItems.value[existingItemIndex].count = item.count;
        selectedItems.value[existingItemIndex].notes = item.notes;
      } else {
        selectedItems.value.push({ ...item });
      }
    };

    // Handle search input
    const handleSearch = () => {
      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Set new timer for debounced search
      debounceTimer = setTimeout(() => {
        emit('search', localSearchQuery.value);
      }, 300);
    };

    // Clear search
    const clearSearch = () => {
      localSearchQuery.value = '';
      emit('search', '');
    };

    // Sync local search query with prop
    const syncSearchQuery = () => {
      localSearchQuery.value = props.searchQuery || '';
    };

    // Filter food items based on search query (partial matching)
    const filteredFoodItems = computed(() => {
      const queryToUse = props.searchQuery || localSearchQuery.value;
      if (!queryToUse || queryToUse.trim() === '') {
        return foodItems.value;
      }
      
      const query = queryToUse.toLowerCase().trim();
      return foodItems.value.filter(item => {
        const itemName = (item.itemName || '').toLowerCase();
        return itemName.includes(query);
      });
    });

    // onMounted lifecycle hook to fetch hawker data and food items
    onMounted(async () => {
      syncSearchQuery();
      await getHawkerData();
      if (hawker.value) {
        await fetchItemListings();
      }
    });

    return {
      isLiked,
      hawker,
      foodItems,
      filteredFoodItems,
      localSearchQuery,
      searchQuery: computed(() => props.searchQuery),
      loading,
      errorMsg,
      showToast,
      showMap,
      triggerToast,
      toggleMap,
      saveIcons,
      toggleLike,
      increment,
      decrement,
      selectedItems,
      handleSearch,
      clearSearch,
      // Modal
      showModal,
      selectedItem,
      openItemModal,
      closeModal,
      handleAddToCart
    };
  }
};