import { reactive, ref, onBeforeUnmount, computed, onMounted, onUnmounted } from 'vue';
import { createListing, updateListing } from '/firebase/firestore';
import { uploadImage } from '/firebase/storage';
import { 
  alert, 
  showAlert, 
  closeAlert, 
  showConfirmation, 
  confirmationConfirm, 
  confirmationCancel ,
  userListings
} from '@/components/hawker/useSharedListings';
import AIFoodDescription from './AIFoodDescription.vue';
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../../../firebase/config';
import { getDoc, doc } from 'firebase/firestore';
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

    const selectedFile = ref(null);
    const previewSelectedFileSRC = ref("");
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
    const router = useRouter();

    const discountedPrice = computed(() => {
      if(!form.itemPrice || !form.discount) return '';
      let finalPrice = form.itemPrice - (form.itemPrice * form.discount) / 100;
      return finalPrice.toFixed(2);
    });

    const onFileSelected = (event) => {
      const file = event.target.files[0];
      if (file) {
        selectedFile.value = file;
        previewSelectedFileSRC.value = URL.createObjectURL(file);
      }
    };

    const removeFile = () => {
      if(previewSelectedFileSRC.value) {
        URL.revokeObjectURL(previewSelectedFileSRC.value);
      }
      previewSelectedFileSRC.value = "";
      selectedFile.value = null;
      if (fileInput.value) {
        fileInput.value.value = "";
      }
    };

    const onSubmit = async () => {
    const errors = [];
    if (!selectedFile.value) {
      errors.push("Please select an image for the listing.");
    }
    if (form.itemPrice < 0) {
      errors.push("Price cannot be less than 0.");
    }
    if (form.itemQty < 0) {
      errors.push("Quantity cannot be less than 0.");
    }
    if (form.discount > 100 || form.discount < 0) {
      errors.push("Discount must be in the range of 1 to 99.");
    }
    if (!currentUser.value) {
      errors.push("You must be logged in to create a listing.");
    }
    if (!currentUser.value?.displayName) {
      errors.push("Your account doesn't have a display name set.");
    }

    if (errors.length > 0) {
      const errorMessage = errors.join('\n');
      showAlert('error', errorMessage);
      return;
    }

    isSubmitting.value = true;
    try {
      const imageData = await uploadImage(selectedFile.value, 'itemListings');
      
      const listingData = {
        ...form,
        discountedPrice: parseFloat(discountedPrice.value),
        imageUrl: imageData.url,
        imageName: imageData.name,
        imagePath: imageData.path,
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
      selectedFile.value = null;
      form.description = "";
      previewSelectedFileSRC.value = "";
      if (fileInput.value) {
        fileInput.value = "";
      }
    };

    onBeforeUnmount(() => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (previewSelectedFileSRC.value) {
        URL.revokeObjectURL(previewSelectedFileSRC.value);
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

    const toggleSelectAll = () => {
      // Get all checkbox IDs from userListings
      const allIds = userListings.value.map((l) => l.id);

      // If selectAll is true, mark all as checked
      if (selectAll.value) {
        selectedListings.value = [...allIds];  // “checkbox.checked = true”
      } else {
        selectedListings.value = [];           // uncheck all
      }
    };

    const goBack = () => {
      router.go(-1);
    };

    return {
      form,
      selectedFile,
      previewSelectedFileSRC,
      isSubmitting,
      discountedPrice,
      successMsg,
      errorMsg,
      fileInput,
      onFileSelected,
      removeFile,
      onSubmit,
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
      selectedListings,
      selectAll,
      goBack
    };
  },
  components : {AIFoodDescription}
};