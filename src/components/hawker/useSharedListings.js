import { ref, computed } from 'vue';
import { updateListing, deleteListing, useLoadListings, createListing, useListenToHawkerOrders } from '/firebase/firestore';
import { deleteImage } from '/firebase/storage';
import { auth } from '/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

// Initialize shared state ONCE at module load
const allListings = useLoadListings();
const currentUserId= ref(null);

// Get current user's hawker ID
const currentHawkerId = computed(() => auth.currentUser?.uid || null);

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
  return allListings.value
    .filter(listing => 
      listing.makeActive === true && listing.userId === currentUserId.value)
    .map(listing => ({
      ...listing,
      orders: getOrderCountForListing(listing.itemName)
    }))
});

export const inactiveListings = computed(() => {
  return allListings.value
  .filter(listing => 
    listing.makeActive === false && listing.userId === currentUserId.value)
  .map(listing => ({
      ...listing,
      orders: getOrderCountForListing(listing.itemName)
    }))
});

// both active and inactive listings
export const userListings = computed(() => {
  return allListings.value.filter(
    listing => listing.userId === currentUserId.value
  )
})

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

export const editModalVisible = ref(false);
export const listingToEdit = ref(null);

export const editListing = (listingId) => {
  const listing = allListings.value.find(l => l.id === listingId);
  if (listing) {
    listingToEdit.value = listing;
    editModalVisible.value = true;
  }
};

export const closeEditModal = () => {
  editModalVisible.value = false;
  listingToEdit.value = null;
};

export const onListingSaved = () => {
  showAlert('success', 'Listing updated successfully!');
  closeEditModal();
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
      imageUrl: listing.imageUrl ?? null,
      imageName: listing.imageName ?? null,
      imagePath: listing.imagePath ?? null,
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


// Listen to orders for current hawker
const hawkerOrders = computed(() => {
  if (!currentHawkerId.value) return ref([]);
  return useListenToHawkerOrders(currentHawkerId.value);
});

// Calculate order count for each listing
const getOrderCountForListing = (listingName) => {
  if (!hawkerOrders.value || !hawkerOrders.value.value) return 0;
  
  let totalOrders = 0;
  hawkerOrders.value.value.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        if (item.itemName === listingName) {
          totalOrders += item.qty || 1;
        }
      });
    }
  });
  
  return totalOrders;
};

export { getOrderCountForListing };