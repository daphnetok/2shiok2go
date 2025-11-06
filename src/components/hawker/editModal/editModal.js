import { ref, reactive, computed, watch, onBeforeUnmount } from 'vue';
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

    // Multiple images state
    const images = ref([]); // [{ file, previewUrl, main: boolean, existing: boolean, existingData: {url, name, path} }]
    const imageError = ref('');
    const multiFileInput = ref(null);
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
        
        // Handle multiple images for edit mode
        images.value = [];
        if (l.images && Array.isArray(l.images) && l.images.length > 0) {
          // Load existing images into the images array
          l.images.forEach((img, idx) => {
            images.value.push({
              previewUrl: img.url || '',
              main: !!img.main,
              existing: true,
              existingData: {
                url: img.url || '',
                name: img.name || '',
                path: img.path || ''
              }
            });
          });
        } else if (l.imageUrl) {
          // Fallback: if only single imageUrl exists, convert it to images array format
          images.value.push({
            previewUrl: l.imageUrl,
            main: true,
            existing: true,
            existingData: {
              url: l.imageUrl || '',
              name: l.imageName || '',
              path: l.imagePath || ''
            }
          });
        }
      }
    }, { immediate: true });

    // Multiple file selection functions
    const processFiles = (files) => {
      imageError.value = '';
      if (!files || !files.length) return;
      const availableSlots = Math.max(0, 5 - images.value.length);
      const filesToAdd = Array.from(files).slice(0, availableSlots);
      if (files.length > availableSlots) {
        imageError.value = 'You can upload up to 5 photos.';
      }
      for (const file of filesToAdd) {
        const previewUrl = URL.createObjectURL(file);
        images.value.push({ file, previewUrl, main: false, existing: false });
      }
      // If no main image yet, set the first as main
      if (!images.value.some(img => img.main) && images.value.length > 0) {
        images.value[0].main = true;
      }
    };

    const onMultiFileSelected = (event) => {
      processFiles(event.target.files);
      // Reset input value to allow re-uploading the same file name
      if (multiFileInput.value) multiFileInput.value.value = '';
    };

    const onFileDrop = (event) => {
      event.preventDefault();
      const files = event.dataTransfer?.files;
      if (files) {
        processFiles(files);
      }
    };

    const removeImageAt = (index) => {
      const img = images.value[index];
      if (img?.previewUrl && !img.existing && img.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(img.previewUrl);
      }
      images.value.splice(index, 1);
      // Ensure there is still a main image
      if (!images.value.some(i => i.main) && images.value.length > 0) {
        images.value[0].main = true;
      }
    };

    const setMainImage = (index) => {
      images.value.forEach((img, i) => { img.main = i === index; });
    };

    // Drag and drop sorting
    const dragIndex = ref(null);
    const onDragStart = (index) => { dragIndex.value = index; };
    const onDragOver = (event) => { event.preventDefault(); };
    const onDrop = (event, index) => {
      event.preventDefault();
      if (dragIndex.value === null || dragIndex.value === index) return;
      const moved = images.value.splice(dragIndex.value, 1)[0];
      images.value.splice(index, 0, moved);
      dragIndex.value = null;
    };

    // Computed properties for main image (for AIFoodDescription component)
    const mainImageFile = computed(() => {
      const mainImg = images.value.find(img => img.main);
      return mainImg?.file || null;
    });

    const mainImageUrl = computed(() => {
      const mainImg = images.value.find(img => img.main);
      return mainImg?.previewUrl || '';
    });

    const closeModal = () => emit('close');

    const handleSubmit = async () => {
      try {
        isSubmitting.value = true;
        
        if (images.value.length === 0) {
          errorMessage.value = 'Please upload at least one photo.';
          return;
        }

        // Upload new images and keep existing ones
        const uploadedImages = [];
        for (const [idx, img] of images.value.entries()) {
          if (img.file) {
            // New file - upload it
            const imageData = await uploadImage(img.file, 'itemListings');
            uploadedImages.push({
              url: imageData.url,
              name: imageData.name,
              path: imageData.path,
              main: !!img.main,
              order: idx
            });
          } else if (img.existing && img.existingData) {
            // Existing image - keep it
            uploadedImages.push({
              url: img.existingData.url,
              name: img.existingData.name,
              path: img.existingData.path,
              main: !!img.main,
              order: idx
            });
          }
        }

        // Ensure at least one main image
        if (!uploadedImages.some(u => u.main) && uploadedImages.length > 0) {
          uploadedImages[0].main = true;
        }

        // Get primary image URL (for backward compatibility)
        const primaryImage = uploadedImages.find(i => i.main) || uploadedImages[0];

        await updateListing(props.listing.id, {
          ...editForm,
          discountedPrice: parseFloat(calculatedDiscountedPrice.value),
          images: uploadedImages,
          // Keep backward compatibility with single image fields
          imageUrl: primaryImage?.url || '',
          imageName: primaryImage?.name || '',
          imagePath: primaryImage?.path || '',
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

    // Cleanup on unmount
    onBeforeUnmount(() => {
      images.value.forEach(img => {
        if (img.previewUrl && !img.existing && img.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    });

    return {
      editForm, allergenOptions, tagOptions,
      images, imageError, multiFileInput,
      mainImageFile, mainImageUrl,
      isSubmitting, errorMessage, calculatedDiscountedPrice,
      userListings, selectAll, selectedListings,
      toggleSelectAll, onMultiFileSelected, onFileDrop,
      removeImageAt, setMainImage,
      onDragStart, onDragOver, onDrop,
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