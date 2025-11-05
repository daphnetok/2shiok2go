import { ref, reactive, computed, watch } from 'vue';
import { uploadImage, deleteImage } from '/firebase/storage';
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

    const newImageFile = ref(null);
    const previewImageUrl = ref('');
    const fileInput = ref(null);
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
            showAlert('error', 'Please set a discount start time first.');
            return;
          }
          const listingsToUpdate =
            selectAll.value
              ? userListings.value // if "All My Listings" is checked
              : userListings.value.filter(l => selectedListings.value.includes(l.id));
  
          for (const listing of listingsToUpdate) {
            await updateListing(listing.id, { discountTime: form.discountTime });
          }
  
          showAlert('success', 'Discount start time successfully applied!');
        } catch (error) {
          console.error('Error updating listings:', error);
          showAlert('error', 'Failed to apply discount time. Please try again.');
        }
      };

    const calculatedDiscountedPrice = computed(() => {
      if (!editForm.itemPrice || !editForm.discount) return '';
      const final = editForm.itemPrice - (editForm.itemPrice * editForm.discount) / 100;
      return final.toFixed(2);
    });

    const allListings = useLoadListings();

    // Load hawker's listings when modal opens
    watch(() => props.isVisible, (visible) => {
      if (visible) {
        const currentUserId = JSON.parse(localStorage.getItem('user'))?.uid;
        userListings.value = allListings.value.filter(l => l.userId === currentUserId);
      }
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
        previewImageUrl.value = l.imageUrl;
      }
    }, { immediate: true });

    const onFileSelected = (e) => {
      const file = e.target.files[0];
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
      previewImageUrl.value = props.listing?.imageUrl || '';
      if (fileInput.value) fileInput.value.value = '';
    };

    const closeModal = () => emit('close');

    const handleSubmit = async () => {
      try {
        isSubmitting.value = true;
        const imageData = newImageFile.value
          ? await uploadImage(newImageFile.value, 'itemListings')
          : {
              url: props.listing.imageUrl,
              name: props.listing.imageName,
              path: props.listing.imagePath,
            };

        await updateListing(props.listing.id, {
          ...editForm,
          discountedPrice: parseFloat(calculatedDiscountedPrice.value),
          imageUrl: imageData.url,
          imageName: imageData.name,
          imagePath: imageData.path,
          selectedListings: selectedListings.value,
          description: editForm.description,
          discountTime: editForm.discountTime
        });

        emit('saved');
        closeModal();
      } catch (err) {
        console.error(err);
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

    return {
      editForm, allergenOptions, tagOptions,
      newImageFile, previewImageUrl, fileInput,
      isSubmitting, errorMessage, calculatedDiscountedPrice,
      userListings, selectAll, selectedListings,
      toggleSelectAll, onFileSelected, removeNewImage,
      closeModal, handleSubmit,
      toggleSelectAllActive,
      toggleSelectAllInactive,
      activeListings,
      inactiveListings,
      selectAllActive,
      selectAllInactive,
    };
  }
};