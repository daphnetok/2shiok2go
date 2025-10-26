import { ref, computed } from 'vue';
import { updateListing, deleteListing, useLoadListings, createListing } from '/firebase/firestore';
import { deleteImage } from '/firebase/storage';
import { auth } from '/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

// Initialize shared state ONCE at module load
const allListings = useLoadListings();
const currentUserId= ref(null);

onAuthStateChanged(auth, (user) => {
  currentUserId.value = user ? user.uid : null;
})

export const alert = ref({
  show: false,
  type: '',
  message: '',
  actionType: ''
});

let confirmResolve = null;

export const activeListings = computed(() => {
  return allListings.value.filter(listing => 
    listing.makeActive === true && listing.userId === currentUserId.value
  );
});

export const inactiveListings = computed(() => {
  return allListings.value.filter(listing => 
    listing.makeActive === false && listing.userId === currentUserId.value
  );
});

export const showAlert = (type, message) => {
  alert.value.show = true;
  alert.value.type = type;
  alert.value.message = message;

  if (type === 'success') {
    setTimeout(() => {
      closeAlert();
    }, 5000);
  }
};

export const closeAlert = () => {
  alert.value.show = false;
};

export const showConfirmation = (message, actionType) => {
  return new Promise((resolve) => {
    confirmResolve = resolve;
    alert.value.show = true;
    alert.value.type = 'confirmation';
    alert.value.message = message;
    alert.value.actionType = actionType;
  });
};

export const confirmationConfirm = () => {
  if (confirmResolve) {
    confirmResolve(true);
    confirmResolve = null;
  }
  closeAlert();
};

export const confirmationCancel = () => {
  if (confirmResolve) {
    confirmResolve(false);
    confirmResolve = null;
  }
  closeAlert();
};

export const deactivateListing = async (listingId) => {
  try {
    const confirmed = await showConfirmation(
      'Are you sure you want to deactivate this listing?',
      'Confirmation'
    );
    if (!confirmed) return;
    await updateListing(listingId, { makeActive: false });
    showAlert('success', 'Listing deactivated successfully!');
  } catch (error) {
    console.error("Error deactivating listing: ", error);
    showAlert('error', 'Error deactivating listing: ' + error.message);
  }
};

export const activateListing = async (listingId) => {
  try {
    const confirmed = await showConfirmation(
      'Are you sure you want to activate this listing? This will make the post live to customers.',
      'Confirmation'
    );
    if (!confirmed) return;
    await updateListing(listingId, { makeActive: true });
    showAlert('success', 'Listing activated successfully!');
  } catch (error) {
    console.error("Error activating listing: ", error);
    showAlert('error', 'Error activating listing: ' + error.message);
  }
};

export const deleteListingWithImage = async (listingId, imagePath) => {
  const confirmed = await showConfirmation(
    'Are you sure you want to permanently delete this listing?',
    'Delete'
  );

  if (!confirmed) return;

  try {
    if (imagePath) {
      await deleteImage(imagePath);
    }
    await deleteListing(listingId);
    showAlert('success', 'Listing deleted successfully!');
  } catch (error) {
    console.error("Error deleting listing: ", error);
    showAlert('error', 'Error deleting listing: ' + error.message);
  }
};

export const editListing = (listingId) => {
  console.log("Edit listing: ", listingId);
};

export const duplicateListing = async (listing) => {
  const confirmed = await showConfirmation(
    'Create a duplicate of this listing?',
    'Confirmation'
  );

  if (!confirmed) return;

  try {
    const duplicateData = {
      itemName: listing.itemName + " (Copy)",
      itemPrice: listing.itemPrice,
      discount: listing.discount,
      discountedPrice: listing.discountedPrice,
      itemQty: listing.itemQty,
      allergens: listing.allergens,
      tags: listing.tags,
      imageUrl: listing.imageUrl,
      imageName: listing.imageName,
      imagePath: listing.imagePath,
      makeActive: false,
      orders: 0,
      hawkerName: listing.hawkerName,
      userId: listing.userId
    };
    await createListing(duplicateData);
    showAlert('success', 'Listing duplicated successfully!');
  } catch (error) {
    console.error("Error duplicating listing: ", error);
    showAlert('error', 'Error duplicating listing: ' + error.message);
  }
};