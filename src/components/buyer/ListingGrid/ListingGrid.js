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
      
      await getUserLocation();
    });

    watch(userLocation, async (newLocation) => {
      if (!newLocation) {
        hawkersRef.value = null;
        return;
      }

      hawkersRef.value = useLoadHawkers(newLocation);

      if (newLocation?.latitude && newLocation?.longitude) {
        if (!formattedAddress.value || formattedAddress.value === 'Loading...') {
          isLoadingAddress.value = true;
          const address = await reverseGeocode(newLocation.latitude, newLocation.longitude);
          formattedAddress.value = address;
          currentGPSAddress.value = address;
          isLoadingAddress.value = false;
        }
      }
    });

    const allHawkers = computed(() => {
      return hawkersRef.value?.value.map(hawker => ({
        ...hawker,
        distance: hawker.distance !== 'N/A' ? parseFloat((hawker.distance * ROAD_FACTOR).toFixed(1)) : hawker.distance
      })) || [];
    });

    const loading = computed(() => hawkersRef.value?.value === null);

    const getDietary = (hawker) => hawker.dietaryRestriction?.toString().toLowerCase().trim() || '';

    const getDistance = (hawker) => hawker.distance ?? 'N/A';

    const getStatus = (hawker) => {
      if (!hawker.openingTime || !hawker.closingTime) return 'unknown';
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [openHour, openMin] = hawker.openingTime.split(':').map(Number);
      const [closeHour, closeMin] = hawker.closingTime.split(':').map(Number);
      const openingTimeInMinutes = openHour * 60 + openMin;
      const closingTimeInMinutes = closeHour * 60 + closeMin;

      if (closingTimeInMinutes < openingTimeInMinutes) {
        return currentTime >= openingTimeInMinutes || currentTime < closingTimeInMinutes ? 'open' : 'closed';
      } else {
        return currentTime >= openingTimeInMinutes && currentTime < closingTimeInMinutes ? 'open' : 'closed';
      }
    };

    const hasActiveItems = (hawker) => hawker.items?.some(item => item.makeActive);

    const filteredHawkers = computed(() => {
      let list = allHawkers.value.slice();

      if (props.dietary.length) {
        list = list.filter(h => props.dietary.includes(getDietary(h)));
      }

      if (props.status.length) {
        list = list.filter(h => props.status.includes(getStatus(h)));
      }

      if (props.priceOrder) {
        list.sort((a, b) => {
          const priceA = a.items?.map(item => item.price)?.[0] || 0;
          const priceB = b.items?.map(item => item.price)?.[0] || 0;
          return props.priceOrder === 'asc' ? priceA - priceB : priceB - priceA;
        });
      }

      list = list.filter(h => hasActiveItems(h));
      
      list.sort((a, b) => {
        const statusA = getStatus(a);
        const statusB = getStatus(b);
        if (statusA === 'open' && statusB !== 'open') return -1;
        if (statusA !== 'open' && statusB === 'open') return 1;
        return 0;
      });

      return list;
    });

    const toggleModal = () => {
      isModalOpen.value = !isModalOpen.value;
    };

    const handleLocationSelected = async (locationData) => {
      if (locationData.type === 'current') {
        formattedAddress.value = 'Loading...';
        isLoadingAddress.value = true;

        try {
          await getUserLocation();
        } catch (err) {
          formattedAddress.value = currentGPSAddress.value || 'Location unavailable';
          console.error('Failed to get GPS:', err);
        } finally {
          isLoadingAddress.value = false;
        }
      } else if (locationData.type === 'saved') {
        userLocation.value = locationData.data;
        formattedAddress.value = locationData.data.formattedAddress;
      }
    };

    onBeforeUnmount(() => {
      isMounted.value = false;
    });

    const handleImageError = (event) => {
      event.target.src = '/img/chicken_rice.jpg'; // Fallback image
    };

    return {
      filteredHawkers,
      loading,
      locationError,
      handleImageError,
      toggleModal,
      handleLocationSelected
    };
  }
};
