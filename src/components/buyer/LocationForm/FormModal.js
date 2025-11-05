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
    const isCollapsed = ref(false);
    const locationName = ref('');
    const selectedAddress = ref({ formattedAddress: props.address });

    // Sync address prop with selectedAddress
    watch(() => props.address, (newAddress) => {
      if (newAddress && newAddress !== selectedAddress.value.formattedAddress) {
        selectedAddress.value = { 
          ...selectedAddress.value, 
          formattedAddress: newAddress 
        };
      }
    }, { immediate: true });

    const expand = () => {
      if (!isCollapsed.value) return;
      isCollapsed.value = false;
      emit('stateChange', false);
    };

    const collapse = () => {
      if (isCollapsed.value) return;
      isCollapsed.value = true;
      emit('stateChange', true);
    };

    const onAddressUpdate = (newValue) => {
      selectedAddress.value = newValue;
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

    return {
      sheet,
      isCollapsed,
      locationName,
      selectedAddress,
      expand,
      collapse,
      onAddressUpdate,
      onPlaceSelected,
      onConfirm
    };
  }
};