import { reactive, ref, onBeforeUnmount, computed, onMounted, watch } from 'vue';
import { createListing, updateListing } from '/firebase/firestore';
import { uploadImage } from '/firebase/storage';
import { 
  alert, 
  showAlert, 
  closeAlert, 
  showConfirmation, 
  confirmationConfirm, 
  confirmationCancel ,
  userListings,
  activeListings,
  inactiveListings,
  findListingByHawkerAndName,
} from '@/components/hawker/useSharedListings';
import AIFoodDescription from './AIFoodDescription.vue';
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../../../firebase/config';
import { getDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'vue-router';

export default {
  components: { AIFoodDescription, LoadingSpinner },
  setup() {
    const form = reactive({
      itemName: "",
      itemPrice: null,
      discount: null,
      itemQty: null,
      allergens: [],
      tags: [],
      makeActive: false,
      description: "",
      discountTime: "",
    });

    // Images state (max 5), with drag-sort and main image selection
    const images = ref([]); // [{ file, previewUrl, main: boolean }]
    const imageError = ref("");
    const isSubmitting = ref(null);
    const errorMsg = ref("");
    const successMsg = ref("");
    const fileInput = ref(null);
    let unsubscribe = null;
    const currentUser = ref(null);
    const userRole = ref('');
    const isLoading = ref(true);
    const isHawker = computed(() => userRole.value === 'hawker');
    const hawkerListings = ref([]);
    const selectedListing = ref("all");
    const selectedListings = ref([]);
    const selectAll = ref(false);
    const selectAllActive = ref(false);
    const selectAllInactive = ref(false);
    const router = useRouter();
    const itemNameError = ref("");
    const priceError = ref("");
    const discountError = ref("");
    const qtyError = ref("");

    const discountedPrice = computed(() => {
      if (form.itemPrice == null || form.discount == null) return '';
      if (form.itemPrice < 0) return '';
      if (form.discount < 0 || form.discount > 100) return '';
      const finalPrice = form.itemPrice - (form.itemPrice * form.discount) / 100;
      return finalPrice.toFixed(2);
    });

    const showDiscountedPrice = computed(() => {
      return (
        form.itemPrice != null &&
        form.discount != null &&
        form.itemPrice >= 0 &&
        form.discount >= 0 &&
        form.discount <= 100
      );
    });

    const mainImageFile = computed(() => {
      const main = images.value.find(i => i.main);
      return main?.file || images.value[0]?.file || null;
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
        images.value.push({ file, previewUrl, main: false });
      }
      // If no main image yet, set the first as main
      if (!images.value.some(img => img.main) && images.value.length > 0) {
        images.value[0].main = true;
      }
    };

    const onFileSelected = (event) => {
      processFiles(event.target.files);
      // Reset input value to allow re-uploading the same file name
      if (fileInput.value) fileInput.value.value = "";
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
      if (img?.previewUrl) URL.revokeObjectURL(img.previewUrl);
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

    const onSubmit = async () => {
    const errors = [];
    priceError.value = '';
    discountError.value = '';
    qtyError.value = '';
    if (images.value.length === 0) {
      errors.push("Please upload at least one photo (max 5).");
    }
    if (form.itemPrice < 0) {
      priceError.value = "Price cannot be negative.";
      errors.push(priceError.value);
    }
    if (form.itemQty < 0) {
      qtyError.value = "Quantity cannot be negative.";
      errors.push(qtyError.value);
    }
    if (form.discount > 100 || form.discount < 0) {
      discountError.value = "Discount must be between 0 and 100.";
      errors.push(discountError.value);
    }
    if (!currentUser.value) {
      errors.push("You must be logged in to create a listing.");
    }
    if (!currentUser.value?.displayName) {
      errors.push("Your account doesn't have a display name set.");
    }
    if (itemNameError.value) {
      errors.push(itemNameError.value);
    }

    if (errors.length > 0) {
      const errorMessage = errors.join('\n');
      showAlert('error', errorMessage);
      return;
    }

    isSubmitting.value = true;
    try {
      // Upload images to Firebase Storage
      const uploaded = [];
      for (const [idx, img] of images.value.entries()) {
        const imageData = await uploadImage(img.file, 'itemListings');
        uploaded.push({
          url: imageData.url,
          name: imageData.name,
          path: imageData.path,
          main: !!img.main,
          order: idx
        });
      }
      // Ensure at least one main image
      if (!uploaded.some(u => u.main) && uploaded.length > 0) {
        uploaded[0].main = true;
      }
      
      const listingData = {
        ...form,
        discountedPrice: parseFloat(discountedPrice.value),
        images: uploaded,
        primaryImageUrl: uploaded.find(i => i.main)?.url || uploaded[0]?.url || '',
        imageUrl: uploaded.find(i => i.main)?.url || uploaded[0]?.url || '', // Keep for backward compatibility
        orders: 0,
        hawkerName: currentUser.value.displayName,
        userId: currentUser.value.uid,
        description: form.description,
        discountTime: form.discountTime
      };
      
      await createListing(listingData);
      await applyDiscountTime(); // Apply discount time to selected listings right after creating
      showAlert('redirect', 'What do you want to do next?');
      resetForm();
    } catch (error) {
      console.error("Error creating listing: ", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      errorMsg.value = "Error: " + error.message;
    } finally {
      isSubmitting.value = false;
    }
  };

    const resetForm = () => {
      form.itemName = "";
      form.itemPrice = null;
      form.discount = null;
      form.itemQty = null;
      form.allergens = [];
      form.tags = [];
      form.makeActive = false;
      images.value.forEach(img => { if (img.previewUrl) URL.revokeObjectURL(img.previewUrl); });
      images.value = [];
      form.description = "";
      if (fileInput.value) {
        fileInput.value.value = "";
      }
    };

    // Live validation
    watch(() => form.itemPrice, (val) => {
      if (val == null) { priceError.value = ""; return; }
      priceError.value = val < 0 ? "Price cannot be negative." : "";
    });
    watch(() => form.discount, (val) => {
      if (val == null) { discountError.value = ""; return; }
      discountError.value = (val < 0 || val > 100) ? "Discount must be between 0 and 100." : "";
    });
    watch(() => form.itemQty, (val) => {
      if (val == null) { qtyError.value = ""; return; }
      qtyError.value = val < 0 ? "Quantity cannot be negative." : "";
    });

    onBeforeUnmount(() => {
      if (unsubscribe) {
        unsubscribe();
      }
      images.value.forEach(img => { if (img.previewUrl) URL.revokeObjectURL(img.previewUrl); });
    });

    const close = () => {
      this.closeAlert();
    };
    // handleBackdropClick = () => {
    //   // Only close on backdrop click for success/error, not confirmation
    //   if (this.alert.type !== 'confirmation' && this.alert.type !== 'redirect') {
    //     this.closeAlert();
    //   }
    // }

    const createNewListing = () => {
      closeAlert();
      resetForm();
      window.scrollTo(0, 0);
    };

    const fetchUserRole = async (uid) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          return userDoc.data().role;
        }
        return null;
      } catch (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
    };

    //  Duplicate item name check (case-insensitive + trimmed)
     watch(
      () => form.itemName,
      async (newName) => {
        itemNameError.value = "";

        if (!newName || !currentUser.value) return;

        // Trim and lowercase user input
        const trimmedLowerName = newName.trim().toLowerCase();
        if (!trimmedLowerName) return;

        try {
          const listingsRef = collection(db, "itemListings");
          const q = query(listingsRef, where("userId", "==", currentUser.value.uid));
          const snapshot = await getDocs(q);

          let duplicateFound = false;
          snapshot.forEach((doc) => {
            const dbName = (doc.data().itemName || "").trim().toLowerCase();
            if (dbName === trimmedLowerName) {
              duplicateFound = true;
            }
          });

          if (duplicateFound) {
            itemNameError.value = "This food item name already exists. Please choose a different name.";
          }
        } catch (error) {
          console.error("Error checking duplicate name:", error);
        }
      }
    );

    onMounted(() => {
      onAuthStateChanged(auth, async (user) => {
        currentUser.value = user;
        if (user) {
          const role = await fetchUserRole(user.uid);
          userRole.value = role || '';

          // Load hawker’s existing listings
          // unsubscribe = stopListening; 
          // console.log(userListings)

        } else {
          userRole.value = '';
        }
        isLoading.value = false;
      });
    });

    const getCurrentTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };
    form.discountTime = getCurrentTime();


    const applyDiscountTime = async () => {
      try {
        if (!form.discountTime) {
          showAlert('error', 'Please set a discount start time first.');
          return;
        }

        const listingsPool = selectAll.value
          ? userListings.value
          : userListings.value.filter(l => selectedListings.value.includes(l.id));

        if (!listingsPool.length) {
          showAlert('error', 'Please select at least one listing.');
          return;
        }

        const seenKeys = new Set();
        let updatesPerformed = 0;

        for (const listing of listingsPool) {
          const itemName = listing?.itemName;
          const hawkerName = listing?.hawkerName;

          if (!itemName || !hawkerName) {
            continue;
          }

          const key = `${String(hawkerName).trim().toLowerCase()}::${String(itemName).trim().toLowerCase()}`;
          if (seenKeys.has(key)) {
            continue;
          }
          seenKeys.add(key);

          const match = findListingByHawkerAndName(itemName, hawkerName);
          if (!match?.id) {
            continue;
          }

          await updateListing(match.id, { discountTime: form.discountTime });
          updatesPerformed += 1;
        }

        if (updatesPerformed === 0) {
          showAlert('error', 'No matching listings found for the selected items.');
          return;
        }

        showAlert('success', 'Discount start time successfully applied!');
      } catch (error) {
        console.error('Error updating listings:', error);
        showAlert('error', 'Failed to apply discount time. Please try again.');
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


    const goBack = () => {
      router.go(-1);
    };

    return {
      form,
      images,
      imageError,
      isSubmitting,
      discountedPrice,
        showDiscountedPrice,
      successMsg,
      errorMsg,
      fileInput,
      onFileSelected,
      onFileDrop,
      removeImageAt,
      setMainImage,
      onDragStart,
      onDragOver,
      onDrop,
      onSubmit,
      mainImageFile,
        priceError,
        discountError,
        qtyError,
      alert,
      showAlert,
      closeAlert,
      showConfirmation,
      confirmationConfirm,
      confirmationCancel,
      close,
      createNewListing,
      currentUser,
      userRole,
      isHawker,
      isLoading,
      hawkerListings,
      selectedListing,
      applyDiscountTime,
      toggleSelectAll,
      userListings,
      activeListings,
      inactiveListings,
      selectedListings,
      selectAll,
      toggleSelectAllActive,
      toggleSelectAllInactive,
      selectAllActive,
      selectAllInactive,
      goBack,
      itemNameError
    };
  },
  components : {AIFoodDescription}
};
