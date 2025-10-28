import { reactive, ref, onBeforeUnmount } from 'vue';
import AddressAutocomplete from '@/components/shared/AddressAutocomplete.vue';
import { createHawker } from '/firebase/firestore';
import { uploadImage } from '/firebase/storage';
import { auth } from '/firebase/config';

export default {
  name: 'HawkerStallForm',
  components: {
    AddressAutocomplete
  },
  setup(props, { emit }) {
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
    const selectedFile = ref(null);
    const previewSelectedFileSRC = ref('');
    const fileInput = ref(null);

    const onAddressSelected = (addressData) => {
      console.log('Address selected:', addressData);
      form.address = addressData;
    };

    const onFileSelected = (event) => {
      const file = event.target.files[0];
      if(file) {
        selectedFile.value = file;
        previewSelectedFileSRC.value = URL.createObjectURL(file);
      }
    }

    const removeFile = () => {
      if(previewSelectedFileSRC.value) {
        URL.revokeObjectURL(previewSelectedFileSRC.value);
      }
      previewSelectedFileSRC.value = '';
      selectedFile.value = null;
      if(fileInput.value) {
        fileInput.value = '';
      }
    }

    const handleSubmit = async () => {
      loading.value = true;
      errorMsg.value = '';
      successMsg.value = '';

      try {
        // validate address
        if(!form.address.formattedAddress) {
          throw new Error('Please enter a valid address')
        }
        // upload image to storage
        const imageData = await uploadImage(selectedFile.value, 'hawkerListings');

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
          },
          imageUrl: imageData.url,
          imageName: imageData.name,
          imagePath: imageData.path,
          userId: auth.currentUser.uid
        };

        const docRef = await createHawker(hawkerData);
        console.log('Hawker created with ID: ', docRef.id);
        successMsg.value = 'Hawker stall created successfully!';
        emit('stallCreated');

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
      removeFile();
      } catch (error) {
        console.error('Error creating hawker: ', error);
        errorMsg.value = error.message;
      } finally {
        loading.value = false;
      }
    };

    onBeforeUnmount(() => {
      if(previewSelectedFileSRC.value) {
        URL.revokeObjectURL(previewSelectedFileSRC.value);
      }
    })

    return {
      form,
      loading,
      errorMsg,
      successMsg,
      selectedFile,
      previewSelectedFileSRC,
      fileInput,
      onAddressSelected,
      handleSubmit,
      onFileSelected,
      removeFile
    };
  }
};
