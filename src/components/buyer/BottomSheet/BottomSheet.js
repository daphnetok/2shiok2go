import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export default {
  name: 'LocationModal',
  props: {
    isOpen: { type: Boolean, required: true },
    formattedAddress: { type: String, default: '' },
    currentGPSAddress: { type: String, default: '' } // NEW: Separate GPS address
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

    // UPDATED: Better error handling and logging
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

    const onLocationSelect = () => {
      // emit selected location data
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
      // close modal after selection
      startClose();
    };

    const router = useRouter();

    const onAddLocationClick = () => {
      router.push('/add-location');
    }

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

    // FIX #1: Fetch saved locations when sheet opens
    watch(() => props.isOpen, async (val) => {
      if (val) {
        await fetchSavedLocations(); // ADDED THIS LINE
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
        // progressive resistance for upward drag, capping at -100px
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
      onAddLocationClick
    };
  }
};