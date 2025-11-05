import { reactive, ref, onBeforeUnmount, watch, nextTick } from 'vue';
import AddressAutocomplete from '@/components/shared/AddressAutocomplete.vue';
import { createHawker, updateHawker } from '/firebase/firestore';
import { uploadImage } from '/firebase/storage';
import { auth } from '/firebase/config';

export default {
  name: 'HawkerStallForm',
  components: {
    AddressAutocomplete
  },
  props: {
    mode: {
      type: String,
      default: 'create',
      validator: (value) => ['create', 'edit'].includes(value)
    },
    hawkerData: {
      type: Object,
      default: null
    }  
  },
  setup(props, { emit }) {
    const form = reactive({
      stallName: '',
      openingTime: '',
      closingTime: '',
      priceRange: null,
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

    // prepopulate form when hawkerData prop changes
    watch (() => props.hawkerData, async (data) => {
      if (data && props.mode === 'edit') {
        form.stallName = data.hawkerName || '';
        form.openingTime = data.openingTime || '';
        form.closingTime = data.closingTime || '';
        form.priceRange = data.priceRange || null;
        await nextTick();
        if (data.address) {
          form.address = {
            formattedAddress: data.address.formattedAddress || '',
            latitude: data.address.latitude || null,
            longitude: data.address.longitude || null,
            name: data.address.name || '',
            postalCode: data.address.postalCode || '',
            street: data.address.street || '',
            city: data.address.city || '',
            country: data.address.country || ''
          };
        }
        previewSelectedFileSRC.value = data.imageUrl || null;
      }
    }, { immediate: true });

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
        // Upload image logic (only if new file selected)
        let imageData;
        if (selectedFile.value) {
          imageData = await uploadImage(selectedFile.value, 'hawkerListings');
        } else if (props.mode === 'edit' && props.hawkerData) {
          // Keep existing image if in edit mode and no new file
          imageData = {
            url: props.hawkerData.imageUrl,
            name: props.hawkerData.imageName,
            path: props.hawkerData.imagePath
          };
        }

        const hawkerDataToSave = {
          hawkerName: form.stallName,
          closingTime: form.closingTime,
          openingTime: form.openingTime,
          priceRange: form.priceRange,
          address: { ...form.address },
          imageUrl: imageData.url,
          imageName: imageData.name,
          imagePath: imageData.path,
          userId: auth.currentUser.uid
        };

        if (props.mode === 'edit') {
          // Update existing hawker
          await updateHawker(props.hawkerData.id, hawkerDataToSave);
          successMsg.value = 'Hawker stall updated successfully!';
          emit('stallUpdated');
        } else {
          // Create new hawker
          const docRef = await createHawker(hawkerDataToSave);
          console.log('Hawker created with ID: ', docRef.id);
          successMsg.value = 'Hawker stall created successfully!';
          emit('stallCreated');
          
          // Only reset form in create mode
          form.stallName = '';
          form.closingTime = '';
          form.openingTime = '';
          form.priceRange = null;
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
        }
      } catch (error) {
        console.error('Error:', error);
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
