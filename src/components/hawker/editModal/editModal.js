import { reactive, ref, computed, watch } from 'vue';
import { uploadImage, deleteImage } from '/firebase/storage';
import { updateListing } from '/firebase/firestore';

export default {
  name: 'EditModal',
  props: {
    isVisible: {
      type: Boolean,
      required: true
    },
    listing: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const editForm = reactive({
      itemName: '',
      itemPrice: null,
      discount: null,
      itemQty: null,
      allergens: [],
      tags: [],
      makeActive: false
    });

    const allergenOptions = ['Eggs', 'Dairy', 'Fish', 'Soy', 'Peanuts', 'Sesame'];
    const tagOptions = ['Halal', 'Vegetarian', 'Seafood', 'Dairy-free'];

    const newImageFile = ref(null);
    const previewImageUrl = ref('');
    const fileInput = ref(null);
    const isSubmitting = ref(false);
    const errorMessage = ref('');

    const calculatedDiscountedPrice = computed(() => {
      if (!editForm.itemPrice || !editForm.discount) return '';
      const finalPrice = editForm.itemPrice - (editForm.itemPrice * editForm.discount) / 100;
      return finalPrice.toFixed(2);
    });

    // Watch for listing prop changes and populate form
    watch(() => props.listing, (newListing) => {
      if (newListing) {
        editForm.itemName = newListing.itemName;
        editForm.itemPrice = newListing.itemPrice;
        editForm.discount = newListing.discount;
        editForm.itemQty = newListing.itemQty;
        editForm.allergens = [...(newListing.allergens || [])];
        editForm.tags = [...(newListing.tags || [])];
        editForm.makeActive = newListing.makeActive;
        
        // Set existing image
        previewImageUrl.value = newListing.imageUrl;
        newImageFile.value = null;
      }
    }, { immediate: true });

    const onFileSelected = (event) => {
      const file = event.target.files[0];
      if (file) {
        newImageFile.value = file;
        previewImageUrl.value = URL.createObjectURL(file);
      }
    };

    const removeNewImage = () => {
      if (newImageFile.value && previewImageUrl.value) {
        URL.revokeObjectURL(previewImageUrl.value);
      }
      newImageFile.value = null;
      // Restore original image
      if (props.listing) {
        previewImageUrl.value = props.listing.imageUrl;
      }
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };

    const closeModal = () => {
      // Clean up
      if (newImageFile.value && previewImageUrl.value !== props.listing?.imageUrl) {
        URL.revokeObjectURL(previewImageUrl.value);
      }
      newImageFile.value = null;
      errorMessage.value = '';
      emit('close');
    };

    const handleSubmit = async () => {
      errorMessage.value = '';

      // Validation
      const errors = [];
      if (editForm.itemPrice < 0) {
        errors.push('Price cannot be less than 0.');
      }
      if (editForm.itemQty < 0) {
        errors.push('Quantity cannot be less than 0.');
      }
      if (editForm.discount > 100 || editForm.discount < 0) {
        errors.push('Discount must be between 0 and 100.');
      }

      if (errors.length > 0) {
        errorMessage.value = errors.join(' ');
        return;
      }

      isSubmitting.value = true;

      try {
        let imageData = {
          url: props.listing.imageUrl,
          name: props.listing.imageName,
          path: props.listing.imagePath
        };

        // If new image was uploaded
        if (newImageFile.value) {
          // Delete old image
          if (props.listing.imagePath) {
            try {
              await deleteImage(props.listing.imagePath);
            } catch (error) {
              console.error('Error deleting old image:', error);
              // Continue even if deletion fails
            }
          }

          // Upload new image
          imageData = await uploadImage(newImageFile.value, 'itemListings');
        }

        // Prepare update data
        const updateData = {
          itemName: editForm.itemName,
          itemPrice: editForm.itemPrice,
          discount: editForm.discount,
          discountedPrice: parseFloat(calculatedDiscountedPrice.value),
          itemQty: editForm.itemQty,
          allergens: editForm.allergens,
          tags: editForm.tags,
          makeActive: editForm.makeActive,
          imageUrl: imageData.url,
          imageName: imageData.name,
          imagePath: imageData.path
        };

        // Update listing in Firestore
        await updateListing(props.listing.id, updateData);

        // Emit success event
        emit('saved');
        closeModal();
      } catch (error) {
        console.error('Error updating listing:', error);
        errorMessage.value = 'Error updating listing: ' + error.message;
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      editForm,
      allergenOptions,
      tagOptions,
      newImageFile,
      previewImageUrl,
      fileInput,
      isSubmitting,
      errorMessage,
      calculatedDiscountedPrice,
      onFileSelected,
      removeNewImage,
      closeModal,
      handleSubmit
    };
  }
};