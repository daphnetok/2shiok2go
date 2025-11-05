import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '/firebase/config';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore'; // Added updateDoc and arrayRemove

export default {
  name: 'LocationModal',
  props: {
    isOpen: { type: Boolean, required: true },
    formattedAddress: { type: String, default: '' },
    currentGPSAddress: { type: String, default: '' }
  },
  emits: ['close', 'locationSelected'],
  setup(props, { emit }) {
    const sheet = ref(null);
    const startY = ref(0);
    const currentY = ref(0);
    const isDragging = ref(false);
    const isMouseDown = ref(false);
    const isClosing = ref(false);
    const justDragged = ref(false);
    const selectedOption = ref('current');
    const savedLocations = ref([]);

    const fetchSavedLocations = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.warn('No authenticated user');
          savedLocations.value = [];
          return;
        }

        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          savedLocations.value = userDoc.data().savedLocations || [];
        } else {
          console.warn('User document does not exist');
          savedLocations.value = [];
        }
      } catch (error) {
        console.error('Error fetching saved locations:', error);
        savedLocations.value = [];
      }
    };

    // NEW: Delete location function
    const deleteLocation = async (locationId, event) => {
      event.stopPropagation(); // Prevent radio selection when deleting
      
      try {
        const user = auth.currentUser;
        if (!user) {
          console.warn('No authenticated user');
          return;
        }

        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const currentLocations = userDoc.data().savedLocations || [];
          const locationToDelete = currentLocations.find(loc => loc.id === locationId);
          
          if (locationToDelete) {
            // Remove from Firestore
            await updateDoc(userRef, {
              savedLocations: arrayRemove(locationToDelete)
            });

            // Update local state immediately
            savedLocations.value = savedLocations.value.filter(loc => loc.id !== locationId);
            
            // If the deleted location was selected, reset to current location
            if (selectedOption.value === locationId) {
              selectedOption.value = 'current';
            }
          }
        }
      } catch (error) {
        console.error('Error deleting location:', error);
      }
    };

    const onLocationSelect = () => {
      if (selectedOption.value === 'current') {
        emit('locationSelected', { type: 'current' });
      } else {
        const location = savedLocations.value.find(loc => loc.id === selectedOption.value);
        if (location) {
          emit('locationSelected', {
            type: 'saved',
            data: location
          });
        }
      }
      startClose();
    };

    const router = useRouter();

    const onAddLocationClick = () => {
      router.push('/add-location');
    }

    // NEW: Check if user can add more locations
    const canAddMoreLocations = () => {
      return savedLocations.value.length < 3;
    };

    const getY = (e) => e.touches ? e.touches[0].clientY : e.clientY;

    const resetSheetPosition = () => {
      if (!sheet.value) return;
      
      sheet.value.style.transition = 'none';
      sheet.value.style.transform = 'translateY(100%)';
      void sheet.value.offsetHeight;
      
      sheet.value.style.transition = 'transform 0.3s ease-out';
      sheet.value.style.transform = 'translateY(0)';
      sheet.value.style.pointerEvents = '';
    };

    watch(() => props.isOpen, async (val) => {
      if (val) {
        await fetchSavedLocations();
        await nextTick();
        if (sheet.value) resetSheetPosition();
      }
    });

    onMounted(async () => {
      if (props.isOpen && sheet.value) resetSheetPosition();
      await fetchSavedLocations();
    });

    const startClose = () => {
      if (isClosing.value || !sheet.value) return;
      isClosing.value = true;

      sheet.value.style.transition = 'transform 0.3s ease-out';
      sheet.value.style.transform = 'translateY(100%)';
      sheet.value.style.pointerEvents = 'none';

      setTimeout(() => {
        emit('close');
        isClosing.value = false;
        resetSheetPosition();
      }, 300);
    };

    const onHandleMouseDown = (e) => {
      if (isClosing.value) return;
      isMouseDown.value = true;
      startY.value = getY(e);
      if (sheet.value) sheet.value.style.transition = 'none';
      
      document.addEventListener('mousemove', onDragMove);
      document.addEventListener('mouseup', onDragEnd);
    };

    const onDragStart = (e) => {
      if (isClosing.value) return;
      startY.value = getY(e);
      isDragging.value = true;
      if (sheet.value) sheet.value.style.transition = 'none';
    };

    const onDragMove = (e) => {
      if ((!isDragging.value && !isMouseDown.value) || isClosing.value) return;
      currentY.value = getY(e);
      let diff = currentY.value - startY.value;
      if (!sheet.value) return;

      if (diff < 0) {
        diff = Math.max(diff * 0.4, -100)
      }
      sheet.value.style.transform = `translateY(${diff}px)`;

      if (e.type.startsWith('touch')) e.preventDefault();
    };

    const onDragEnd = () => {
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
      
      if ((!isDragging.value && !isMouseDown.value) || isClosing.value) return;
      
      justDragged.value = true;
      setTimeout(() => { justDragged.value = false; }, 100);
      
      isDragging.value = false;
      isMouseDown.value = false;
      if (!sheet.value) return;

      const diff = currentY.value - startY.value;
      sheet.value.style.transition = 'transform 0.3s ease-out';
      const threshold = sheet.value.offsetHeight / 2;

      if (diff > 0 && diff > threshold) {
        startClose();
      } else {
        sheet.value.style.transform = 'translateY(0)';
      }
    };

    const onXClick = () => startClose();
    
    const onBackdropClick = () => {
      if (justDragged.value) return;
      startClose();
    };

    onBeforeUnmount(() => {
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
    });

    return {
      sheet,
      onHandleMouseDown,
      onDragStart,
      onDragMove,
      onDragEnd,
      onXClick,
      onBackdropClick,
      selectedOption,
      savedLocations,
      onLocationSelect,
      onAddLocationClick,
      deleteLocation, // NEW: Export delete function
      canAddMoreLocations // NEW: Export check function
    };
  }
};