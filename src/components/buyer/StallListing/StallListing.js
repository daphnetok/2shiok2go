import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { db } from '/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default {
  name: "StallListings",
  setup() {
    const route = useRoute();
    const saved = ref(false);
    const hawker = ref(null);
    const foodItems = ref([]);
    const loading = ref(true);
    const errorMsg = ref(null);
    const showToast = ref(false);

    const triggerToast = (duration = 1500) => {
      showToast.value = true;
      setTimeout(() => { showToast.value = false; }, duration);
    };
    
    const saveIcons = {
      heart: 'fa-regular fa-heart saveIcon',
      heartFilled: 'fa-solid fa-heart savedIcon'
    };

    const getHawkerData = async () => {
      if (history.state?.hawker) {
        hawker.value = history.state.hawker;
        console.log('Hawker from state:', hawker.value);
        return;
      }
      
      if (route.params.userId) {
        try {
          const hawkersRef = collection(db, 'hawkerListings');
          const q = query(hawkersRef, where('userId', '==', route.params.userId));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            hawker.value = {
              id: doc.id,
              ...doc.data()
            };
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
        console.log('First item:', foodItems.value[0]);
      } catch (error) {
        console.error('Error fetching item listings:', error);
        errorMsg.value = 'Error loading items: ' + error.message;
      } finally {
        loading.value = false;
      }
    };

    const toggleSave = () => {
      saved.value = !saved.value;
    };

    const increment = (item) => {
      if (item.itemQty > 0 && item.count < item.itemQty) {
        item.count++;
      }
    };

    const decrement = (item) => {
      if (item.count > 0) item.count--;
    };

    onMounted(async () => {
      await getHawkerData();
      if (hawker.value) {
        await fetchItemListings();
      }
    });

    return {
      saved,
      hawker,
      foodItems,
      loading,
      errorMsg,
      showToast,
      triggerToast,
      saveIcons,
      toggleSave,
      increment,
      decrement
    };
  },
  data() {
    return {
      isLiked: false
    };
  },
  methods: {
    toggleLike() {
      this.isLiked = !this.isLiked;
    }
  }
};