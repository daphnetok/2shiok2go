import { reactive, ref } from 'vue';
import AddressAutocomplete from '@/components/shared/AddressAutocomplete.vue';
import { createHawker } from '/firebase/firestore';

export default {
  name: 'HawkerStallForm',
  components: {
    AddressAutocomplete
  },
  setup() {
    const form = reactive({
      stallName: '',
      closingTime: '',
      address: {
        formattedAddress: '',
        latitude: null,
        longitude: null,
        name: '',
        postalCode: '',
        street: '',
        city: '',
        country: ''
      }
    });

    const loading = ref(false);
    const errorMsg = ref('');
    const successMsg = ref('');

    const onAddressSelected = (addressData) => {
      console.log('Address selected:', addressData);
      form.address = addressData;
    };

    const handleSubmit = async () => {
      loading.value = true;
      errorMsg.value = '';
      successMsg.value = '';

      try {
        // validate address
        if(!form.address.formattedAddress) {
          throw new Error('Please enter a valid address')
        }
        // create hawker document
        const hawkerData = {
          hawkerName: form.stallName,
          closingTime: form.closingTime,
          address: {
            formattedAddress: form.address.formattedAddress,
            latitude: form.address.latitude,
            longitude: form.address.longitude,
            name: form.address.name,
            postalCode: form.address.postalCode,
            street: form.address.street,
            city: form.address.city,
            country: form.address.country
          }
        };

        const docRef = await createHawker(hawkerData);
        console.log('Hawker created with ID: ', docRef.id);
        successMsg.value = 'Hawker stall created successfully!';
        // reset form
        form.stallName = '';
        form.closingTime = '';
        form.address = {
          formattedAddress: '',
          latitude: null,
          longitude: null,
          name: '',
          postalCode: '',
          street: '',
          city: '',
          country: ''
        };
      } catch (error) {
        console.error('Error creating hawker: ', error);
        errorMsg.value = error.message;
      } finally {
        loading.value = false;
      }
    };

    return {
      form,
      loading,
      errorMsg,
      successMsg,
      onAddressSelected,
      handleSubmit
    };
  }
};
