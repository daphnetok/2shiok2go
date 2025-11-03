import { computed, onMounted, ref, watch } from 'vue';
import ListingCard from '../ListingCard/ListingCard.vue';
import LocationModal from '../BottomSheet/BottomSheet.vue';
import { useLoadHawkers } from '/firebase/firestore';
import { useGeolocation, reverseGeocode } from '@/assets/composables/useGeolocation';

export default {
  name: 'ListingGrid',
  components: {
    ListingCard,
    LocationModal
  },
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
    }
  },
  setup(props) {
    const { userLocation, locationError, getUserLocation } = useGeolocation();
    const hawkersRef = ref(null);
    const ROAD_FACTOR = 1.1; 
    const formattedAddress = ref('');
    const isLoadingAddress = ref(false);
    const isModalOpen = ref(false);

    onMounted(async () => {
      await getUserLocation();
    })

    watch(
      userLocation,
      async (newLocation) => {
        hawkersRef.value = useLoadHawkers(newLocation);
        console.log(newLocation);

        if (newLocation && newLocation.latitude && newLocation.longitude) {
          isLoadingAddress.value = true;
          formattedAddress.value = await reverseGeocode(
            newLocation.latitude,
            newLocation.longitude
          );
          isLoadingAddress.value = false;
        }
      }
    );

    const allHawkers = computed(() => {
      const hawkers = hawkersRef.value?.value || [];

      // apply road factor to all distances
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

    // ✨ NEW: Helper functions
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

    // filteredHawkers computed
    const filteredHawkers = computed(() => {
      let list = (allHawkers.value || []).slice();

      // Filter by dietaryRestriction
      if (props.dietary.length) {
        list = list.filter(h => {
          const tag = getDietary(h);
          return props.dietary.map(d => d.toString().toLowerCase().trim()).includes(tag);
        });
      }

      // Filter by status
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

    return {
      filteredHawkers,
      loading,
      locationError,
      formattedAddress,
      isLoadingAddress,
      isModalOpen,
      toggleModal
    };
  }
}