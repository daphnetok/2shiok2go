import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { db } from '/firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default {
  name: "StallListings",
  setup() {
    const route = useRoute();
    const isLiked = ref(false);  // Changed from 'saved' to match template
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

    const triggerToast = (duration = 1500) => {
      showToast.value = true;
      setTimeout(() => { showToast.value = false; }, duration);
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
        
        // Check saved status even when loading from state
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

            // Check if the user has already favorited this hawker
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

    // Fetch food items for the hawker
    const fetchItemListings = async () => {
      if (!hawker.value?.userId) {
        errorMsg.value = 'No hawker ID provided';
        loading.value = false;
        return;
      }

      loading.value = true;
      
      try {
        const itemsRef = collection(db, 'itemListings');
        const q = query(
          itemsRef, 
          where('userId', '==', hawker.value.userId), 
          where('makeActive', '==', true)
        );
        const querySnapshot = await getDocs(q);
        
        foodItems.value = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            itemName: data.itemName,
            itemPrice: data.itemPrice,
            itemQty: data.itemQty,
            discountedPrice: data.discountedPrice,
            imageUrl: data.imageUrl,
            count: 0,
            hover: false
          };
        });

        console.log('Food items loaded:', foodItems.value);
      } catch (error) {
        console.error('Error fetching item listings:', error);
        errorMsg.value = 'Error loading items: ' + error.message;
      } finally {
        loading.value = false;
      }
    };

    // Toggle the favorite (like) state - Changed function name to match template
    const toggleLike = async () => {
      if (!userId.value) {
        console.warn('Cannot toggle like: No user logged in');
        errorMsg.value = 'Please log in to favorite this stall';
        return;
      }

      if (!hawker.value) {
        console.warn('Cannot toggle like: No hawker data');
        return;
      }

      const newLikedState = !isLiked.value;
      const hawkerRef = doc(db, 'hawkerListings', hawker.value.id);
      
      try {
        // First, get the current document to check if favouritedUser exists
        const hawkerDoc = await getDoc(hawkerRef);
        
        if (!hawkerDoc.exists()) {
          console.error('Hawker document not found');
          errorMsg.value = 'Hawker not found';
          return;
        }

        const hawkerData = hawkerDoc.data();
        
        if (newLikedState) {
          // Add user to favouritedUser array (creates array if it doesn't exist)
          await updateDoc(hawkerRef, {
            favouritedUser: arrayUnion(userId.value)
          });
          console.log(`User ${userId.value} added to favourites for ${hawker.value.hawkerName}`);
        } else {
          // Remove user from favouritedUser array
          await updateDoc(hawkerRef, {
            favouritedUser: arrayRemove(userId.value)
          });
          console.log(`User ${userId.value} removed from favourites for ${hawker.value.hawkerName}`);
        }
        
        // Update local state after successful Firebase operation
        isLiked.value = newLikedState;
        
        // Update the hawker object to reflect the change
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
        
      } catch (error) {
        console.error('Error updating favourite status:', error);
        errorMsg.value = 'Failed to update favorite status. Please try again.';
      }
    };

    // Increment item count
    const increment = (item) => {
      if (item.itemQty > 0 && item.count < item.itemQty) {
        item.count++;
        saveItemToList(item);
        triggerToast();
      }
    };

    // Decrement item count
    const decrement = (item) => {
      if (item.count > 0) {
        item.count--;
        saveItemToList(item);
      }
    };

    // Save selected item to list
    const saveItemToList = (item) => {
      const existingItemIndex = selectedItems.value.findIndex(selectedItem => selectedItem.id === item.id);
      
      if (item.count === 0) {
        // Remove item if count is 0
        if (existingItemIndex !== -1) {
          selectedItems.value.splice(existingItemIndex, 1);
        }
      } else if (existingItemIndex !== -1) {
        // Update existing item
        selectedItems.value[existingItemIndex].count = item.count;
      } else {
        // Add new item
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
      isLiked,  // Changed from 'saved' to match template
      hawker,
      foodItems,
      loading,
      errorMsg,
      showToast,
      triggerToast,
      saveIcons,
      toggleLike,  // Changed from 'toggleSave' to match template
      increment,
      decrement,
      selectedItems
    };
  }
};