import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { db } from '/firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import ReviewsSection from '../ReviewsSection/ReviewsSection.vue';

export default {
  name: "StallListings",
  components: {
    ReviewsSection
  },
  methods: {
    isDiscountApplied() {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      if (!this.hawker.discountTime){
        return false
      }
      else{
        const [discountHour, discountMin] = this.hawker.discountTime.split(':').map(Number);
        const discountTimeInMinutes = discountHour * 60 + discountMin;

        if (currentTime>=discountTimeInMinutes) return true;
        else return false;
      }
    },
  },
  setup() {
    const route = useRoute();
    const isLiked = ref(false);
    const hawker = ref(null);
    const foodItems = ref([]);
    const loading = ref(true);
    const errorMsg = ref(null);
    const showToast = ref(false);
    const selectedItems = ref([]);

    const auth = getAuth();
    const userId = ref(null);
    const authReady = ref(false);
    
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
          const hawkersRef = collection(db, 'hawkerListings');
          const q = query(hawkersRef, where('userId', '==', route.params.userId));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            hawker.value = {
              id: docSnap.id,
              ...docSnap.data()
            };

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

    // NEW: Load cart data and restore quantities
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
          
          // Create a map of itemId to quantity for easy lookup
          const cartMap = {};
          cartItems.forEach(item => {
            cartMap[item.itemId] = item.qty;
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
          
          // Restore count from cart if it exists
          const savedCount = cartMap[itemId] || 0;
          
          const item = {
            id: itemId,
            itemName: data.itemName,
            itemPrice: data.itemPrice,
            itemQty: data.itemQty,
            discountedPrice: data.discountedPrice,
            discount: data.discount,  // Adding the discount property
            imageUrl: data.imageUrl,
            count: savedCount,
            hover: false
          };
          
          // Add to selectedItems if count > 0
          if (savedCount > 0) {
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
          hawkerName: hawker.value.hawkerName
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
      if (item.itemQty > 0 && item.count < item.itemQty) {
        item.count++;
        await saveToCart(item);
        saveItemToList(item);
        triggerToast();
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
      } else {
        selectedItems.value.push({ ...item });
      }
    };

    // onMounted lifecycle hook to fetch hawker data and food items
    onMounted(async () => {
      await getHawkerData();
      if (hawker.value) {
        await fetchItemListings();
      }
    });

    return {
      isLiked,
      hawker,
      foodItems,
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
      selectedItems
    };
  }
};