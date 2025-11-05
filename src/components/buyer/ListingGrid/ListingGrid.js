import { computed, onMounted, ref, watch, onBeforeUnmount } from 'vue';
import ListingCard from '../ListingCard/ListingCard.vue';
import LocationModal from '../BottomSheet/BottomSheet.vue';
import { useLoadHawkers } from '/firebase/firestore';
import { useGeolocation, reverseGeocode } from '@/assets/composables/useGeolocation';
import { useRoute, useRouter } from 'vue-router';
import { auth, db } from '/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export default {
  name: 'ListingGrid',
  components: {
    ListingCard,
    LocationModal
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
      let list = (allHawkers.value || []).slice();

      if (props.dietary.length) {
        list = list.filter(h => {
          const tag = getDietary(h);
          return props.dietary.map(d => d.toString().toLowerCase().trim()).includes(tag);
        });
      }

      if (props.status && props.status.length) {
        list = list.filter(h => props.status.includes(getStatus(h)));
      }

      const sortOrder = 'asc';
      list.sort((a, b) => {
        const da = getDistance(a);
        const db = getDistance(b);

        if (da === 'N/A' && db === 'N/A') return 0;
        if (da === 'N/A') return 1;
        if (db === 'N/A') return -1;

        return sortOrder === 'asc' ? da - db : db - da;
      })

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
        userLocation.value = {
          latitude: locationData.data.latitude,
          longitude: locationData.data.longitude
        };
        formattedAddress.value = locationData.data.formattedAddress;
      }
    };

    // HIGH #2 FIX: Cleanup on unmount
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
      handleLocationSelected
    };
  }
}