import { reactive, ref, onBeforeUnmount, watch, nextTick, onMounted, computed } from 'vue';
import AddressAutocomplete from '@/components/shared/AddressAutocomplete.vue';
import { createHawker, updateHawker } from '/firebase/firestore';
import { createListing } from '/firebase/firestore';
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
    const priceRangeError = ref(false);
    const selectedFile = ref(null);
    const previewSelectedFileSRC = ref('');
    const fileInput = ref(null);
    const multiFileInput = ref(null);
    const showToast = ref(false);
    
    // Custom dropdown state
    const isDropdownOpen = ref(false);
    const dropdownRef = ref(null);
    const priceOptions = [
      { value: 1, text: '$2 - $5 ($)' },
      { value: 2, text: '$5 - $10 ($$)' },
      { value: 3, text: '$10 - $20 ($$$)' },
      { value: 4, text: '$20+ ($$$$)' }
    ];
    
    const selectedPriceText = ref('');
    
    // Multiple images state (for edit mode)
    const images = ref([]); // [{ file, previewUrl, main: boolean, existing: boolean, existingData: {url, name, path} }]
    const imageError = ref('');

    // Multilisting state
    const listings = ref([]);
    const listingFileInputs = ref({});
    const allergenOptions = ['Eggs', 'Dairy', 'Fish', 'Soy', 'Peanuts', 'Sesame'];
    const tagOptions = ['Halal', 'Vegetarian', 'Seafood', 'Dairy-free'];

    // Initialize with one empty listing
    const addListing = () => {
      listings.value.push({
        itemName: '',
        itemPrice: null,
        discount: 0,
        itemQty: null,
        allergens: [],
        tags: [],
        description: '',
        makeActive: false,
        selectedFile: null,
        previewUrl: '',
        imageError: ''
      });
    };

    const removeListing = (index) => {
      const listing = listings.value[index];
      // Clean up preview URL
      if (listing.previewUrl && listing.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(listing.previewUrl);
      }
      listings.value.splice(index, 1);
    };

    const triggerFileInput = (index) => {
      if (listingFileInputs.value[index]) {
        listingFileInputs.value[index].click();
      }
    };

    const onListingFileSelected = (event, index) => {
      const file = event.target.files[0];
      if (file) {
        const listing = listings.value[index];
        listing.selectedFile = file;
        listing.previewUrl = URL.createObjectURL(file);
        listing.imageError = '';
      }
    };

    const removeListingImage = (index) => {
      const listing = listings.value[index];
      if (listing.previewUrl && listing.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(listing.previewUrl);
      }
      listing.previewUrl = '';
      listing.selectedFile = null;
      listing.imageError = '';
      if (listingFileInputs.value[index]) {
        listingFileInputs.value[index].value = '';
      }
    };

    const handleMultilistingSubmit = async () => {
      loading.value = true;
      errorMsg.value = '';
      successMsg.value = '';

      try {
        // Validate listings
        const validListings = [];
        for (let i = 0; i < listings.value.length; i++) {
          const listing = listings.value[i];
          const errors = [];

          if (!listing.itemName || listing.itemName.trim() === '') {
            errors.push(`Listing ${i + 1}: Item name is required`);
          }
          if (!listing.selectedFile && !listing.previewUrl) {
            errors.push(`Listing ${i + 1}: Image is required`);
          }
          if (listing.itemPrice === null || listing.itemPrice < 0) {
            errors.push(`Listing ${i + 1}: Valid price is required`);
          }
          if (listing.itemQty === null || listing.itemQty < 0) {
            errors.push(`Listing ${i + 1}: Valid quantity is required`);
          }
          if (listing.discount < 0 || listing.discount > 100) {
            errors.push(`Listing ${i + 1}: Discount must be between 0 and 100`);
          }

          if (errors.length > 0) {
            errorMsg.value = errors.join('\n');
            loading.value = false;
            return;
          }

          validListings.push(listing);
        }

        if (validListings.length === 0) {
          errorMsg.value = 'Please add at least one valid listing.';
          loading.value = false;
          return;
        }

        // Upload images and create listings
        const createdListings = [];
        for (const listing of validListings) {
          if (!listing.selectedFile) {
            errorMsg.value = 'All listings must have an image uploaded.';
            loading.value = false;
            return;
          }

          // Upload image
          const imageData = await uploadImage(listing.selectedFile, 'itemListings');

          // Calculate discounted price
          const discountedPrice = listing.itemPrice - (listing.itemPrice * (listing.discount || 0)) / 100;

          // Create listing data
          const listingData = {
            itemName: listing.itemName.trim(),
            itemPrice: parseFloat(listing.itemPrice),
            discount: parseFloat(listing.discount || 0),
            discountedPrice: parseFloat(discountedPrice.toFixed(2)),
            itemQty: parseInt(listing.itemQty),
            allergens: listing.allergens || [],
            tags: listing.tags || [],
            description: listing.description.trim() || '',
            makeActive: listing.makeActive || false,
            imageUrl: imageData.url,
            imageName: imageData.name,
            imagePath: imageData.path,
            images: [{
              url: imageData.url,
              name: imageData.name,
              path: imageData.path,
              main: true,
              order: 0
            }],
            primaryImageUrl: imageData.url,
            orders: 0,
            hawkerName: auth.currentUser?.displayName || form.stallName,
            userId: auth.currentUser.uid
          };

          // Create listing in Firebase
          const docRef = await createListing(listingData);
          createdListings.push(docRef.id);
        }

        successMsg.value = `Successfully created ${createdListings.length} listing${createdListings.length !== 1 ? 's' : ''}!`;
        showToast.value = true;

        // Reset multilisting form
        listings.value.forEach(listing => {
          if (listing.previewUrl && listing.previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(listing.previewUrl);
          }
        });
        listings.value = [];
        addListing(); // Add one empty listing for next use

        emit('listingsCreated', createdListings);
      } catch (error) {
        console.error('Error creating listings:', error);
        errorMsg.value = error.message || 'Failed to create listings. Please try again.';
      } finally {
        loading.value = false;
      }
    };

    // prepopulate form when hawkerData prop changes
    watch (() => props.hawkerData, async (data) => {
      if (data && props.mode === 'edit') {
        form.stallName = data.hawkerName || '';
        form.openingTime = data.openingTime || '';
        form.closingTime = data.closingTime || '';
        form.priceRange = data.priceRange || null;
        priceRangeError.value = false; // Clear any error when loading data
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
        
        // Handle multiple images for edit mode
        images.value = [];
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
          // Load existing images from the images array
          data.images.forEach((img, index) => {
            // Explicitly use main value from Firebase (true or false)
            // Only fallback to index === 0 if main is undefined/null (for backward compatibility)
            const isMain = img.main === true || ((img.main === undefined || img.main === null) && index === 0);
            images.value.push({
              file: null,
              previewUrl: img.url,
              main: isMain,
              existing: true,
              existingData: {
                url: img.url,
                name: img.name || '',
                path: img.path || ''
              }
            });
          });
        } else if (data.imageUrl) {
          // Fallback: if only single imageUrl exists, convert it to images array format
          images.value.push({
            file: null,
            previewUrl: data.imageUrl,
            main: true,
            existing: true,
            existingData: {
              url: data.imageUrl,
              name: data.imageName || '',
              path: data.imagePath || ''
            }
          });
        }
      }
    }, { immediate: true });

    const onAddressSelected = (addressData) => {
      console.log('Address selected:', addressData);
      form.address = addressData;
    };

    // Single file selection (for both create and edit modes)
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
        fileInput.value.value = '';
      }
    }

    // Multiple file selection (for create mode - if needed in future)
    const processFiles = (files) => {
      imageError.value = '';
      if (!files || !files.length) return;
      const availableSlots = Math.max(0, 5 - images.value.length);
      const filesToAdd = Array.from(files).slice(0, availableSlots);
      if (files.length > availableSlots) {
        imageError.value = 'You can upload up to 5 photos.';
      }
      
      // Get existing image URLs to check for duplicates
      const existingUrls = new Set();
      images.value.forEach(img => {
        if (img.existing && img.existingData?.url) {
          existingUrls.add(img.existingData.url);
        }
      });
      
      for (const file of filesToAdd) {
        // Create a preview URL to check if this file already exists
        // Note: We can't directly compare File objects, but we can check by name and size
        const fileKey = `${file.name}_${file.size}`;
        const isDuplicate = images.value.some(img => {
          if (img.file) {
            return `${img.file.name}_${img.file.size}` === fileKey;
          }
          return false;
        });
        
        if (!isDuplicate) {
          const previewUrl = URL.createObjectURL(file);
          images.value.push({ file, previewUrl, main: false, existing: false });
        }
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

    const handleSubmit = async () => {
      loading.value = true;
      errorMsg.value = '';
      successMsg.value = '';

      try {
        // Validate price range - must be selected (values are 1, 2, 3, or 4)
        const validPriceRanges = [1, 2, 3, 4];
        if (!form.priceRange || !validPriceRanges.includes(Number(form.priceRange))) {
          errorMsg.value = 'Please select a price range.';
          priceRangeError.value = true;
          loading.value = false;
          return;
        }
        priceRangeError.value = false; // Clear error if validation passes

        // Validate images
        if (images.value.length === 0) {
          errorMsg.value = 'Please upload at least one photo.';
          loading.value = false;
          return;
        }

        // Ensure at least one image is marked as main
        if (!images.value.some(img => img.main)) {
          images.value[0].main = true;
        }

        let hawkerDataToSave;
        const imagesArray = [];
        const seenUrls = new Set(); // Track URLs to prevent duplicates

        // Upload new images and prepare images array
        for (let i = 0; i < images.value.length; i++) {
          const img = images.value[i];
          let imageData;

          if (img.file) {
            // New file - upload it
            imageData = await uploadImage(img.file, 'hawkerListings');
          } else if (img.existing && img.existingData) {
            // Existing image - use existing data
            imageData = {
              url: img.existingData.url,
              name: img.existingData.name,
              path: img.existingData.path
            };
          } else {
            // Skip invalid images
            continue;
          }

          // Check if this image URL already exists in the array
          if (seenUrls.has(imageData.url)) {
            // Skip duplicate image
            continue;
          }

          // Add to seen set and array
          seenUrls.add(imageData.url);
          imagesArray.push({
            url: imageData.url,
            name: imageData.name,
            path: imageData.path,
            main: img.main === true, // Explicitly set main: true or main: false
            order: imagesArray.length
          });
        }

        if (imagesArray.length === 0) {
          errorMsg.value = 'Please upload at least one valid photo.';
          loading.value = false;
          return;
        }

        // Get primary image (main image or first image)
        const primaryImage = imagesArray.find(img => img.main) || imagesArray[0];

        hawkerDataToSave = {
          hawkerName: form.stallName,
          closingTime: form.closingTime,
          openingTime: form.openingTime,
          priceRange: form.priceRange,
          address: { ...form.address },
          imageUrl: primaryImage.url,
          imageName: primaryImage.name,
          imagePath: primaryImage.path,
          images: imagesArray,
          userId: auth.currentUser.uid
        };

        if (props.mode === 'edit') {
          await updateHawker(props.hawkerData.id, hawkerDataToSave);
          successMsg.value = 'Hawker stall updated successfully!';
          showToast.value = true;
          emit('stallUpdated');
        } else {
          const docRef = await createHawker(hawkerDataToSave);
          console.log('Hawker created with ID: ', docRef.id);
          successMsg.value = 'Hawker stall created successfully!';
          emit('stallCreated');
          
          // Reset form in create mode
          form.stallName = '';
          form.closingTime = '';
          form.openingTime = '';
          form.priceRange = null;
          priceRangeError.value = false; // Clear error on reset
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
          // Clear images
          images.value.forEach(img => {
            if (img.previewUrl && !img.existing && img.previewUrl.startsWith('blob:')) {
              URL.revokeObjectURL(img.previewUrl);
            }
          });
          images.value = [];
          if (multiFileInput.value) {
            multiFileInput.value.value = '';
          }
        }
      } catch (error) {
        console.error('Error:', error);
        errorMsg.value = error.message;
      } finally {
        loading.value = false;
      }
    };

    const closeToast = () => {
      showToast.value = false;
      successMsg.value = false;
    }

    // Custom dropdown functions
    const toggleDropdown = () => {
      isDropdownOpen.value = !isDropdownOpen.value;
    };

    const selectOption = (value) => {
      form.priceRange = value;
      const selectedOption = priceOptions.find(opt => opt.value === value);
      selectedPriceText.value = selectedOption ? selectedOption.text : '';
      isDropdownOpen.value = false;
      priceRangeError.value = false; // Clear error when option is selected
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        isDropdownOpen.value = false;
      }
    };

    // Update selected text when priceRange changes
    watch(() => form.priceRange, (newValue) => {
      if (newValue) {
        const selectedOption = priceOptions.find(opt => opt.value === newValue);
        selectedPriceText.value = selectedOption ? selectedOption.text : '';
      } else {
        selectedPriceText.value = '';
      }
    }, { immediate: true });

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
      // Initialize with one empty listing
      if (props.mode === 'create') {
        addListing();
      }
    });

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside);
      // Clean up single image preview URL (for both create and edit modes)
      if(previewSelectedFileSRC.value) {
        // Only revoke if it's a blob URL (not an existing image URL)
        if (previewSelectedFileSRC.value.startsWith('blob:')) {
          URL.revokeObjectURL(previewSelectedFileSRC.value);
        }
      }
      // Clean up multiple image preview URLs (if any exist)
      images.value.forEach(img => {
        if (img.previewUrl && !img.existing && img.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
      // Clean up listing preview URLs
      listings.value.forEach(listing => {
        if (listing.previewUrl && listing.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(listing.previewUrl);
        }
      });
    })

    return {
      form,
      loading,
      errorMsg,
      successMsg,
      priceRangeError,
      selectedFile,
      previewSelectedFileSRC,
      fileInput,
      multiFileInput,
      images,
      imageError,
      onAddressSelected,
      handleSubmit,
      onFileSelected,
      removeFile,
      onMultiFileSelected,
      onFileDrop,
      removeImageAt,
      setMainImage,
      onDragStart,
      onDragOver,
      onDrop,
      showToast,
      closeToast,
      isDropdownOpen,
      dropdownRef,
      priceOptions,
      selectedPriceText,
      toggleDropdown,
      selectOption,
      // Multilisting
      listings,
      listingFileInputs,
      allergenOptions,
      tagOptions,
      addListing,
      removeListing,
      triggerFileInput,
      onListingFileSelected,
      removeListingImage,
      handleMultilistingSubmit
    };
  }
};
