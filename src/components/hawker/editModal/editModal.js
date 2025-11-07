import { ref, reactive, computed, watch, onBeforeUnmount } from 'vue';
import { uploadImage } from '/firebase/storage';
import { updateListing, useLoadListings } from '/firebase/firestore';
import AIFoodDescription from '../CreateListing/AIFoodDescription.vue';
import { userListings, activeListings, inactiveListings, findListingByHawkerAndName } from '@/components/hawker/useSharedListings';

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

    // Images state (max 5), with drag-sort and main image selection
    const images = ref([]); // [{ file, previewUrl, main: boolean, existing: boolean, existingData: {url, name, path} }]
    const imageError = ref('');
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
            errorMessage.value = 'Please set a discount start time first.';
            return;
          }

          const listingsPool = selectAll.value
            ? userListings.value
            : userListings.value.filter(l => selectedListings.value.includes(l.id));

          if (!listingsPool.length) {
            errorMessage.value = 'Please select at least one listing.';
            return;
          }

          const seenKeys = new Set();
          let updatesPerformed = 0;

          for (const listing of listingsPool) {
            const itemName = listing?.itemName;
            const hawkerName = listing?.hawkerName;

            if (!itemName || !hawkerName) continue;

            const key = `${String(hawkerName).trim().toLowerCase()}::${String(itemName).trim().toLowerCase()}`;
            if (seenKeys.has(key)) continue;
            seenKeys.add(key);

            const match = findListingByHawkerAndName(itemName, hawkerName);
            if (!match?.id) continue;

            await updateListing(match.id, { discountTime: editForm.discountTime ?? '' });
            updatesPerformed += 1;
          }

          if (updatesPerformed === 0) {
            errorMessage.value = 'No matching listings found for the selected items.';
            return;
          }

          errorMessage.value = '';
        } catch (error) {
          console.error('Error updating listings:', error);
          errorMessage.value = 'Failed to apply discount time. Please try again.';
        }
      };

    const mainImageFile = computed(() => {
      const main = images.value.find(i => i.main);
      return main?.file || images.value.find(i => !i.existing)?.file || null;
    });

    const mainImageUrl = computed(() => {
      const main = images.value.find(i => i.main);
      if (main) {
        return main.existing ? main.existingData.url : main.previewUrl;
      }
      return images.value[0] ? (images.value[0].existing ? images.value[0].existingData.url : images.value[0].previewUrl) : '';
    });

    const processFiles = (files) => {
      imageError.value = "";
      if (!files || !files.length) return;
      const availableSlots = Math.max(0, 5 - images.value.length);
      const filesToAdd = Array.from(files).slice(0, availableSlots);
      if (files.length > availableSlots) {
        imageError.value = "You can upload up to 5 photos.";
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
          description: l.description ?? '',
          discountTime: l.discountTime ?? '',
        });
        
        // Load existing images
        images.value = [];
        if (l.images && Array.isArray(l.images) && l.images.length > 0) {
          // Multiple images exist
          l.images.forEach((img, idx) => {
            images.value.push({
              existing: true,
              existingData: {
                url: img.url || img.path || img,
                name: img.name,
                path: img.path
              },
              main: img.main === true || idx === 0,
              previewUrl: img.url || img.path || img
            });
          });
        } else if (l.imageUrl) {
          // Single image (backward compatibility)
          images.value.push({
            existing: true,
            existingData: {
              url: l.imageUrl,
              name: l.imageName,
              path: l.imagePath
            },
            main: true,
            previewUrl: l.imageUrl
          });
        }
      }
    }, { immediate: true });

    const onFileSelected = (event) => {
      processFiles(event.target.files);
      if (fileInput.value) fileInput.value.value = '';
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
      if (img?.previewUrl && !img.existing) {
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

    const closeModal = () => emit('close');

    const handleSubmit = async () => {
      try {
        isSubmitting.value = true;
        
        if (images.value.length === 0) {
          errorMessage.value = 'Please upload at least one photo.';
          isSubmitting.value = false;
          return;
        }

        // Upload new images and prepare image data
        const uploaded = [];
        for (const [idx, img] of images.value.entries()) {
          if (img.existing) {
            // Use existing image
            uploaded.push({
              url: img.existingData.url,
              name: img.existingData.name,
              path: img.existingData.path,
              main: !!img.main,
              order: idx
            });
          } else {
            // Upload new image
            const imageData = await uploadImage(img.file, 'itemListings');
            uploaded.push({
              url: imageData.url,
              name: imageData.name,
              path: imageData.path,
              main: !!img.main,
              order: idx
            });
          }
        }
        
        // Ensure at least one main image
        if (!uploaded.some(u => u.main) && uploaded.length > 0) {
          uploaded[0].main = true;
        }

        await updateListing(props.listing.id, {
          ...editForm,
          discountedPrice: parseFloat(calculatedDiscountedPrice.value),
          images: uploaded,
          primaryImageUrl: uploaded.find(i => i.main)?.url || uploaded[0]?.url || '',
          imageUrl: uploaded.find(i => i.main)?.url || uploaded[0]?.url || '', // Keep for backward compatibility
          selectedListings: selectedListings.value,
          description: editForm.description ?? '',
          discountTime: editForm.discountTime ?? ''
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
        if (img.previewUrl && !img.existing) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    });

    return {
      editForm, allergenOptions, tagOptions,
      images, imageError, fileInput,
      isSubmitting, errorMessage, calculatedDiscountedPrice,
      userListings, selectAll, selectedListings,
      toggleSelectAll, onFileSelected, onFileDrop,
      removeImageAt, setMainImage, onDragStart, onDragOver, onDrop,
      mainImageFile, mainImageUrl,
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