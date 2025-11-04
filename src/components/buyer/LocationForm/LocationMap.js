import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import FormModal from './FormModal.vue';
import { getUserLocation, reverseGeocode } from '@/assets/composables/useGeolocation';
import { auth, db } from '/firebase/config';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default {
  name: 'LocationForm',
  components: {
    FormModal
  },
  setup() {
    const router = useRouter();
    const mapContainer = ref(null);
    const formModalRef = ref(null);
    let map = null;
    let dragTimeout = null;
    let mapDragListener = null; // FIX #7: Store listener reference
    
    const currentAddress = ref('');
    const currentCoords = ref({ lat: null, lng: null });
    const initialCoords = ref({ lat: null, lng: null });
    const isLoadingAddress = ref(false);
    const saveError = ref('');
    const isModalCollapsed = ref(false);

    const loadGoogleMapsScript = () => {
      return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Maps'));
        document.head.appendChild(script);
      });
    };

    const initMap = async () => {
      try {
        await loadGoogleMapsScript();
        
        const userLoc = await getUserLocation();
        
        if (!userLoc || !userLoc.latitude || !userLoc.longitude) {
          alert('Unable to get your location');
          router.go(-1);
          return;
        }

        currentCoords.value = {
          lat: userLoc.latitude,
          lng: userLoc.longitude
        };

        initialCoords.value = {
          lat: userLoc.latitude,
          lng: userLoc.longitude
        };

        map = new window.google.maps.Map(mapContainer.value, {
          center: { lat: userLoc.latitude, lng: userLoc.longitude },
          zoom: 18,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy'
        });

        updateAddress(userLoc.latitude, userLoc.longitude);

        // FIX #7: Store listener reference for cleanup
        mapDragListener = map.addListener('dragend', onMapDragEnd);

      } catch (error) {
        console.error('Map initialization error:', error);
        alert('Unable to get your location');
        router.go(-1);
      }
    };

    const onMapDragEnd = () => {
      if (dragTimeout) clearTimeout(dragTimeout);
      
      dragTimeout = setTimeout(() => {
        const center = map.getCenter();
        const lat = center.lat();
        const lng = center.lng();
        
        currentCoords.value = { lat, lng };
        updateAddress(lat, lng);
      }, 500);
    };

    const updateAddress = async (lat, lng) => {
      isLoadingAddress.value = true;
      try {
        const address = await reverseGeocode(lat, lng);
        currentAddress.value = address || 'Unable to find address';
      } catch (error) {
        console.error('Reverse geocode error:', error);
        currentAddress.value = 'Unable to find address';
      } finally {
        isLoadingAddress.value = false;
      }
    };

    const onAddressSelected = (addressData) => {
      if (!map || !addressData.latitude || !addressData.longitude) return;
      
      currentCoords.value = {
        lat: addressData.latitude,
        lng: addressData.longitude
      };

      map.panTo({ lat: addressData.latitude, lng: addressData.longitude });
      map.setZoom(18);

      currentAddress.value = addressData.formattedAddress;
    };

    // Smooth pan to initial location
    const smoothPanTo = (targetLat, targetLng) => {
      if (!map) return;
      
      const currentCenter = map.getCenter();
      const startLat = currentCenter.lat();
      const startLng = currentCenter.lng();
      
      const frames = 25;
      const duration = 800;
      const frameDuration = duration / frames;
      
      const latDiff = targetLat - startLat;
      const lngDiff = targetLng - startLng;
      
      let currentFrame = 0;
      
      const animate = () => {
        currentFrame++;
        const progress = currentFrame / frames;
        
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const newLat = startLat + (latDiff * easeOut);
        const newLng = startLng + (lngDiff * easeOut);
        
        map.panTo({ lat: newLat, lng: newLng });
        
        if (currentFrame < frames) {
          setTimeout(animate, frameDuration);
        } else {
          map.panTo({ lat: targetLat, lng: targetLng });
          map.setZoom(18);
        }
      };
      
      animate();
    };

    const onResetLocation = () => {
      if (!map || !initialCoords.value.lat || !initialCoords.value.lng) return;
      
      smoothPanTo(initialCoords.value.lat, initialCoords.value.lng);
      currentCoords.value = { ...initialCoords.value };
      updateAddress(initialCoords.value.lat, initialCoords.value.lng);
    };

    const onSave = async (formData) => {
      saveError.value = '';

      try {
        const user = auth.currentUser;
        if (!user) {
          saveError.value = 'You must be logged in';
          return;
        }

        if (!formData.name || !formData.name.trim()) {
          saveError.value = 'Please enter a location name';
          return;
        }

        if (!currentCoords.value || !currentCoords.value.lat || !currentCoords.value.lng) {
          saveError.value = 'Please select a valid location';
          return;
        }

        // FIX #5: Better unique ID generation
        const locationId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newLocation = {
          id: locationId,
          customName: formData.name.trim(),
          formattedAddress: formData.address || currentAddress.value,
          latitude: currentCoords.value.lat,
          longitude: currentCoords.value.lng,
          createdAt: new Date()
        };

        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          saveError.value = 'User profile not found';
          return;
        }

        const COORDINATE_THRESHOLD = 0.0001; // ~11 meters
        const existingLocations = userDoc.data().savedLocations || [];
        const isDuplicate = existingLocations.some(loc => {
            const latMatch = Math.abs(loc.latitude - currentCoords.value.lat) < COORDINATE_THRESHOLD;
            const lngMatch = Math.abs(loc.longitude - currentCoords.value.lng) < COORDINATE_THRESHOLD;
            const nameMatch = loc.customName.toLowerCase().trim() === formData.name.toLowerCase().trim();
            
            return (latMatch && lngMatch) || nameMatch;
        });

        if (isDuplicate) {
          saveError.value = 'A location with this name or coordinates already exists';
          return;
        }

        await updateDoc(userRef, {
          savedLocations: arrayUnion(newLocation)
        });

        router.push(`/buyer-listings?newLocationId=${locationId}`);

      } catch (error) {
        console.error('Save error:', error);
        saveError.value = 'Failed to save location';
      }
    };

    const onExit = () => {
      router.go(-1);
    };

    const onModalStateChange = (collapsed) => {
        isModalCollapsed.value = collapsed;
    };

    const collapseModal = () => {
        if (formModalRef.value && formModalRef.value.collapse) {
            formModalRef.value.collapse();
        }
    }

    onMounted(() => {
      initMap();
    });

    // FIX #7: Remove map listener on unmount
    onBeforeUnmount(() => {
      if (dragTimeout) clearTimeout(dragTimeout);
      if (mapDragListener) {
        window.google.maps.event.removeListener(mapDragListener);
      }
    });

    return {
      mapContainer,
      formModalRef,
      currentAddress,
      isLoadingAddress,
      saveError,
      isModalCollapsed,
      onSave,
      onExit,
      onAddressSelected,
      onResetLocation,
      onModalStateChange,
      collapseModal
    };
  }
};