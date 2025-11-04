import { ref, watch, onBeforeUnmount } from 'vue';
import AddressAutocomplete from '@/components/shared/AddressAutocomplete.vue';

export default {
  name: 'FormModal',
  components: {
    AddressAutocomplete
  },
  props: {
    address: { type: String, default: '' },
    isLoadingAddress: { type: Boolean, default: false },
    saveError: { type: String, default: '' }
  },
  emits: ['save', 'addressSelected', 'stateChange'],
  setup(props, { emit }) {
    const sheet = ref(null);
    const isCollapsed = ref(false); // Start expanded
    const locationName = ref('');
    const selectedAddress = ref({});

    const startY = ref(0);
    const currentY = ref(0);
    const isDragging = ref(false);
    const isMouseDown = ref(false);
    const isTransitioning = ref(false);

    watch(() => props.address, (newAddress) => {
      if (newAddress && !selectedAddress.value.formattedAddress) {
        selectedAddress.value = { formattedAddress: newAddress };
      }
    });

    const getY = (e) => e.touches ? e.touches[0].clientY : e.clientY;

    const onHandleMouseDown = (e) => {
      if (isTransitioning.value) return;
      if (!e.target.closest('.sheet-handle-area')) return;
      
      isMouseDown.value = true;
      startY.value = getY(e);
      if(sheet.value) sheet.value.style.transition = 'none';
      
      document.addEventListener('mousemove', onDragMove);
      document.addEventListener('mouseup', onDragEnd);
    };

    const onDragStart = (e) => {
      if (isTransitioning.value) return;
      if (!e.target.closest('.sheet-handle-area')) return;
      
      startY.value = getY(e);
      isDragging.value = true;
    };

    const onDragMove = (e) => { // ✅ CHANGED: COMPLETE REWRITE - was completely broken!
      if ((!isDragging.value && !isMouseDown.value) || isTransitioning.value) return;
      currentY.value = getY(e);
      let diff = currentY.value - startY.value;
      if (!sheet.value) return;

      // HARD STOP - no movement beyond the two fixed positions
      const collapsedHeight = window.innerHeight * 0.25;
      const expandedHeight = window.innerHeight * 0.60;
      const maxDrag = expandedHeight - collapsedHeight;

      if (isCollapsed.value) {
        // Collapsed: only allow drag UP to expanded, NO downward movement
        diff = Math.max(diff, -maxDrag); // Can't drag up more than expanded position
        diff = Math.min(diff, 0);         // Can't drag down at all
      } else {
        // Expanded: only allow drag DOWN to collapsed, NO upward movement
        diff = Math.min(diff, maxDrag);  // Can't drag down more than collapsed position
        diff = Math.max(diff, 0);         // Can't drag up at all
      }

      sheet.value.style.transform = `translateY(${diff}px)`; // ✅ CHANGED: Apply transform (was missing!)

      if (e.type.startsWith('touch')) e.preventDefault(); // ✅ CHANGED: Added preventDefault
    };

    const onDragEnd = () => {
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);

      if ((!isDragging.value && !isMouseDown.value) || isTransitioning.value) return;

      isDragging.value = false; // ✅ CHANGED: Reset flags BEFORE threshold check (was after)
      isMouseDown.value = false;
      if (!sheet.value) return;

      const diff = currentY.value - startY.value;
      const collapsedHeight = window.innerHeight * 0.25;
      const expandedHeight = window.innerHeight * 0.60;
      const heightDiff = expandedHeight - collapsedHeight;
      const threshold = heightDiff * 0.3; // ✅ CHANGED: Dynamic 30% threshold (was fixed 50px)

      sheet.value.style.transition = 'transform 0.3s ease-out, height 0.3s ease-out'; // ✅ CHANGED: Added transition

      if (isCollapsed.value && diff < -threshold) {
        expand();
      } else if (!isCollapsed.value && diff > threshold) {
        collapse();
      } else {
        sheet.value.style.transform = 'translateY(0)'; // ✅ CHANGED: Reset transform (was '')
      }
    };

    const expand = () => { // ✅ CHANGED: Complete rewrite with isTransitioning
      if (isTransitioning.value || !isCollapsed.value) return;
      isTransitioning.value = true;
      
      if (sheet.value) {
        sheet.value.style.transform = 'translateY(0)';
      }
      
      isCollapsed.value = false;
      emit('stateChange', false); // ✅ CHANGED: Added emit
      
      setTimeout(() => {
        isTransitioning.value = false;
      }, 300);
    };

    const collapse = () => { // ✅ CHANGED: Complete rewrite with isTransitioning
      if (isTransitioning.value || isCollapsed.value) return;
      isTransitioning.value = true;
      
      if (sheet.value) {
        sheet.value.style.transform = 'translateY(0)';
      }
      
      isCollapsed.value = true;
      emit('stateChange', true); // ✅ CHANGED: Added emit
      
      setTimeout(() => {
        isTransitioning.value = false;
      }, 300);
    };

    const onPlaceSelected = (addressData) => {
      selectedAddress.value = addressData;
      emit('addressSelected', addressData);
    };

    const onConfirm = () => {
      emit('save', {
        name: locationName.value,
        address: selectedAddress.value.formattedAddress || props.address
      });
    };

    onBeforeUnmount(() => { // ✅ CHANGED: Added cleanup
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
    });

    return {
      sheet,
      isCollapsed,
      locationName,
      selectedAddress,
      onHandleMouseDown,
      onDragStart,
      onDragMove,
      onDragEnd,
      expand,
      collapse,
      onPlaceSelected,
      onConfirm
    };
  }
};