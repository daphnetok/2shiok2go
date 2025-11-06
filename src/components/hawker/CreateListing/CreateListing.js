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

    // Single image state
    const selectedFile = ref(null);
    const previewImageUrl = ref('');
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
      return selectedFile.value || null;
    });

    // Single file selection - only allow one image
    const onFileSelected = (event) => {
      const files = event.target.files;
      if (files.length > 1) {
        imageError.value = 'Please upload only one image.';
        event.target.value = ''; // Reset input
        return;
      }
      const file = files[0];
      if (file) {
        selectedFile.value = file;
        previewImageUrl.value = URL.createObjectURL(file);
        imageError.value = '';
      }
    };

    const onFileDrop = (event) => {
      event.preventDefault();
      const files = event.dataTransfer?.files;
      if (files && files.length > 1) {
        imageError.value = 'Please upload only one image.';
        return;
      }
      const file = files?.[0];
      if (file) {
        selectedFile.value = file;
        previewImageUrl.value = URL.createObjectURL(file);
        imageError.value = '';
      }
    };

    const removeFile = () => {
      if (previewImageUrl.value) {
        URL.revokeObjectURL(previewImageUrl.value);
      }
      previewImageUrl.value = '';
      selectedFile.value = null;
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };

    const onSubmit = async () => {
    const errors = [];
    priceError.value = '';
    discountError.value = '';
    qtyError.value = '';
    if (!selectedFile.value && !previewImageUrl.value) {
      errors.push("Please upload a photo.");
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
      // Upload single image to Firebase Storage
      if (!selectedFile.value) {
        throw new Error('Please upload a photo.');
      }
      
      const imageData = await uploadImage(selectedFile.value, 'itemListings');
      
      const listingData = {
        ...form,
        discountedPrice: parseFloat(discountedPrice.value),
        // Store only as single image URL
        imageUrl: imageData.url,
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
      // Clear single image
      if (previewImageUrl.value) {
        URL.revokeObjectURL(previewImageUrl.value);
      }
      previewImageUrl.value = '';
      selectedFile.value = null;
      form.description = "";
      if (fileInput.value) {
        fileInput.value = "";
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
      // Clean up single image preview URL
      if (previewImageUrl.value) {
        URL.revokeObjectURL(previewImageUrl.value);
      }
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
      selectedFile,
      previewImageUrl,
      imageError,
      isSubmitting,
      discountedPrice,
        showDiscountedPrice,
      successMsg,
      errorMsg,
      fileInput,
      onFileSelected,
      onFileDrop,
      removeFile,
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
