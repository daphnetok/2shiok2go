import { reactive, ref, onBeforeUnmount, computed, onMounted } from 'vue';
import { createListing } from '/firebase/firestore';
import { uploadImage } from '/firebase/storage';
import { 
  alert, 
  showAlert, 
  closeAlert, 
  showConfirmation, 
  confirmationConfirm, 
  confirmationCancel 
} from '@/components/hawker/useSharedListings';
import AIFoodDescription from './AIFoodDescription.vue';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../../../firebase/config';
import { getDoc, doc } from 'firebase/firestore';

export default {
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
          description: form.description
        };
        await createListing(listingData);
        showAlert('redirect', '✓ Listing created successfully! \n What do you want to do next?');
        resetForm();
      } catch (error) {
        console.error("Error creating listing: ", error);
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

    const goToHome = () => {
      closeAlert();
    };

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
        } else {
          userRole.value = '';
        }
        isLoading.value = false;
      });
    });

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
      goToHome,
      createNewListing,
      currentUser,
      userRole,
      isHawker,
      isLoading
    };
  },
  components : {AIFoodDescription}
};