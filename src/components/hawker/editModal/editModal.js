import { ref, reactive, computed, watch, onBeforeUnmount } from 'vue';
import { uploadImage } from '/firebase/storage';
import { updateListing, useLoadListings } from '/firebase/firestore';
import AIFoodDescription from '../CreateListing/AIFoodDescription.vue';
import { userListings, activeListings, inactiveListings } from '@/components/hawker/useSharedListings';

export default {
  name: 'EditModal',
  components: { AIFoodDescription },
  props: {
    isVisible: Boolean,
    listing: Object
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
      makeActive: false,
      description: '',
      discountTime: '',
    });

    const allergenOptions = ['Eggs', 'Dairy', 'Fish', 'Soy', 'Peanuts', 'Sesame'];
    const tagOptions = ['Halal', 'Vegetarian', 'Seafood', 'Dairy-free'];

    // Image handling (single image)
    const imageFile = ref(null);
    const imagePreviewUrl = ref('');
    const imageError = ref('');
    const fileInput = ref(null);
    const existingImageUrl = ref('');
    const existingImageName = ref('');
    const existingImagePath = ref('');
    const isSubmitting = ref(false);
    const errorMessage = ref('');

    const selectedListing = ref("all");
    const selectedListings = ref([]);
    const selectAll = ref(false);
    const selectAllActive = ref(false);
    const selectAllInactive = ref(false);

    const applyDiscountTime = async () => {
        try {
          if (!editForm.discountTime) {
            errorMessage.value = 'Please set a discount start time first.';
            return;
          }
          const listingsToUpdate =
            selectAll.value
              ? userListings.value // if "All My Listings" is checked
              : userListings.value.filter(l => selectedListings.value.includes(l.id));
  
          for (const listing of listingsToUpdate) {
            await updateListing(listing.id, { discountTime: editForm.discountTime });
          }
  
          errorMessage.value = ''; // Clear any previous errors
        } catch (error) {
          console.error('Error updating listings:', error);
          errorMessage.value = 'Failed to apply discount time. Please try again.';
        }
      };



    const allListings = useLoadListings();

    // Load hawker's listings when modal opens
    watch(() => props.isVisible, (visible) => {
      if (visible) {
        const currentUserId = JSON.parse(localStorage.getItem('user'))?.uid;
        userListings.value = allListings.value.filter(l => l.userId === currentUserId);
      }
    });

    const calculatedDiscountedPrice = computed(() => {
      if (!editForm.itemPrice || !editForm.discount) return '';
      const final = editForm.itemPrice - (editForm.itemPrice * editForm.discount) / 100;
      return final.toFixed(2);
    });

    // Watch for prop listing
    watch(() => props.listing, (l) => {
      if (l) {
        Object.assign(editForm, {
          itemName: l.itemName,
          itemPrice: l.itemPrice,
          discount: l.discount,
          itemQty: l.itemQty,
          allergens: [...(l.allergens || [])],
          tags: [...(l.tags || [])],
          makeActive: l.makeActive,
          description: l.description,
          discountTime: l.discountTime,
        });
        
        if (l.imageUrl) {
          existingImageUrl.value = l.imageUrl;
          existingImageName.value = l.imageName || '';
          existingImagePath.value = l.imagePath || '';
          imagePreviewUrl.value = l.imageUrl;
        }
      }
    }, { immediate: true });

    const onFileSelected = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        imageError.value = 'Only JPG and PNG formats are allowed.';
        return;
      }

      if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value);
      imageFile.value = file;
      imagePreviewUrl.value = URL.createObjectURL(file);
      imageError.value = '';
      if (fileInput.value) fileInput.value.value = '';
    };

    const removeImage = () => {
      if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value);
      imageFile.value = null;
      imagePreviewUrl.value = '';
    };

    const closeModal = () => emit('close');

    const handleSubmit = async () => {

      errorMessage.value = '';
      isSubmitting.value = true;
      const errors = [];

      if (!imageFile.value && !existingImageUrl.value) {
        errors.push('Please upload one image.');
      }

      if (editForm.itemPrice == null || editForm.itemPrice < 0) {
        errors.push('Price cannot be negative or empty.');
      }

      if (editForm.itemQty == null || editForm.itemQty < 0) {
        errors.push('Quantity cannot be negative or empty.');
      }

      if (editForm.discount == null || editForm.discount < 0 || editForm.discount > 100) {
        errors.push('Discount must be between 0 and 100.');
      }

      if (!editForm.itemName || editForm.itemName.trim() === '') {
        errors.push('Item name cannot be empty.');
      }

      if (!editForm.discountTime) {
        errors.push('Please set a discount start time.');
      }

      if (errors.length > 0) {
        errorMessage.value = errors.join('\n');
        isSubmitting.value = false;
        return;
      }

      try {
        let uploadedImage = null;

        if (imageFile.value) {
          uploadedImage = await uploadImage(imageFile.value, 'itemListings');
        }

        const discountedPrice = parseFloat(
          (
            editForm.itemPrice -
            (editForm.itemPrice * (editForm.discount || 0)) / 100
          ).toFixed(2)
        );

        const updateData = {
          ...editForm,
          discountedPrice,
          description: editForm.description,
          discountTime: editForm.discountTime,
          imageUrl: uploadedImage?.url || existingImageUrl.value || '',
          primaryImageUrl: uploadedImage?.url || existingImageUrl.value || '',
          imageName: uploadedImage?.name || existingImageName.value || '',
          imagePath: uploadedImage?.path || existingImagePath.value || '',
        };
        // Prevent Firestore "undefined" errors
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === undefined) updateData[key] = '';
        });

        await updateListing(props.listing.id, updateData);

        // Apply discount time to other selected listings
        if (editForm.discountTime !== props.listing.discountTime) {
          await applyDiscountTime();
        }

        emit('saved');
        closeModal();
      } catch (err) {
        console.error('Error saving listing:', err);
        errorMessage.value = err.message;
      } finally {
        isSubmitting.value = false;
      }
    };


    // Select / Deselect all listings
    const toggleSelectAll = () => {
      const allIds = userListings.value.map(l => l.id);
      if (selectAll.value) {
        selectedListings.value = [...allIds];
      } else {
        selectedListings.value = [];
      }
    };

    // Select / Deselect all active listings
    const toggleSelectAllActive = () => {
      const activeIds = activeListings.value.map(l => l.id);
      if (selectAllActive.value) {
        // Add any missing active listings to selection
        selectedListings.value = Array.from(new Set([...selectedListings.value, ...activeIds]));
      } else {
        // Remove all active listings from selection
        selectedListings.value = selectedListings.value.filter(id => !activeIds.includes(id));
      }
    };

    // Select / Deselect all inactive listings
    const toggleSelectAllInactive = () => {
      const inactiveIds = inactiveListings.value.map(l => l.id);
      if (selectAllInactive.value) {
        selectedListings.value = Array.from(new Set([...selectedListings.value, ...inactiveIds]));
      } else {
        selectedListings.value = selectedListings.value.filter(id => !inactiveIds.includes(id));
      }
    };

    // --- WATCHERS FOR AUTO-DESELECT LOGIC ---
    // Watch selected listings
    watch(selectedListings, (newSelected) => {
      const allIds = userListings.value.map(l => l.id);
      const activeIds = activeListings.value.map(l => l.id);
      const inactiveIds = inactiveListings.value.map(l => l.id);

      // Update "Select All My Listings"
      selectAll.value = newSelected.length === allIds.length;

      // Update "Select All Active Listings"
      selectAllActive.value = activeIds.length > 0 && activeIds.every(id => newSelected.includes(id));

      // Update "Select All Inactive Listings"
      selectAllInactive.value = inactiveIds.length > 0 && inactiveIds.every(id => newSelected.includes(id));
    });

    // Cleanup on unmount
    onBeforeUnmount(() => {
    });

    return {
      editForm, allergenOptions, tagOptions,
      imageFile, existingImageUrl,
      imagePreviewUrl,
      imageError, fileInput,
      isSubmitting, errorMessage, calculatedDiscountedPrice,
      userListings, selectAll, selectedListings,
      toggleSelectAll, onFileSelected, removeImage,
      closeModal, handleSubmit,
      toggleSelectAllActive,
      toggleSelectAllInactive,
      activeListings,
      inactiveListings,
      selectAllActive,
      selectAllInactive,
      applyDiscountTime
    };
  }
};