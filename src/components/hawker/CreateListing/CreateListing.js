// logic for add/update listing
import { reactive, ref, onBeforeUnmount, onMounted, computed } from 'vue';
import { createListing, updateListing, deleteListing, useLoadListings } from '/firebase/firestore';
import { uploadImage, deleteImage } from '/firebase/storage';
import { auth } from '/firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '/firebase/config';

export default {
    setup() {
        // initialise form
        const form = reactive({
            itemName: "",
            itemPrice: null,
            discount: null,
            itemQty: null,
            allergens: [],
            tags: [],
            makeActive: false
        });

        // initialise other variables
        const selectedFile = ref(null);
        const previewSelectedFileSRC = ref("");
        const allListings = useLoadListings();
        const isSubmitting = ref(null);
        const errorMsg = ref("");
        const successMsg = ref("");
        let unsubscribe = null;
        const fileInput = ref(null); 
        const currentUser = ref(null);
        const hawkerName = ref("");
        const userRole = ref("");
        const isHawker = ref(false);

        // computed properties
        const discountedPrice = computed(() => {
            if(!form.itemPrice || !form.discount) return '';
            let finalPrice = form.itemPrice - (form.itemPrice * form.discount) / 100;
            return finalPrice.toFixed(2);
        });

        const activeListings = computed(() => {
            return allListings.value.filter(listing => listing.makeActive === true);
        })

        const inactiveListings = computed(() => {
            return allListings.value.filter(listing => listing.makeActive === false);
        })

        // Fetch current user and their info
        const fetchUserInfo = async (uid) => {
            try {
                const userDoc = await getDoc(doc(db, 'users', uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    hawkerName.value = userData.displayName || userData.email;
                    userRole.value = userData.role;
                    
                    // Validate if user is a hawker
                    if (userData.role === 'hawker') {
                        isHawker.value = true;
                    } else {
                        isHawker.value = false;
                        errorMsg.value = '⚠️ Access denied. Only hawkers can create listings.';
                        console.warn('User is not a hawker. Role:', userData.role);
                    }
                    
                    return userData;
                } else {
                    errorMsg.value = '⚠️ User profile not found. Please contact support.';
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
                errorMsg.value = '⚠️ Error loading user profile: ' + error.message;
            }
        };

        // methods
        const onFileSelected = (event) => {
            console.log('onFileSelected triggered');
            console.log('Files:', event.target.files);
            const file = event.target.files[0];
            if (file) {
                console.log('File selected:', file.name);
                selectedFile.value = file;
                previewSelectedFileSRC.value = URL.createObjectURL(file);
                console.log('Preview URL created:', previewSelectedFileSRC.value);
            } else {
                console.log('No file selected');
            }
        };

        const removeFile = () => {
            if(previewSelectedFileSRC.value) {
                URL.revokeObjectURL(previewSelectedFileSRC.value);
            }
            previewSelectedFileSRC.value = "";
            selectedFile.value = null;
            // Reset the file input element
            if (fileInput.value) {
                fileInput.value.value = "";
            }
        }

        const onSubmit = async () => {
            // Validate hawker role
            if(!isHawker.value) {
                errorMsg.value = '⚠️ Only hawkers can create listings. Your role: ' + (userRole.value || 'unknown');
                return;
            }

            if(!selectedFile.value){
                errorMsg.value = '* You must upload a photo';
                return;
            }

            if(!currentUser.value) {
                errorMsg.value = '* You must be logged in to create a listing';
                return;
            }

            isSubmitting.value = true;
            errorMsg.value = '';
            successMsg.value = '';

            try {
                // upload image
                const imageData = await uploadImage(selectedFile.value, 'itemListings');

                // create listing object with hawker info
                const listingData = {
                    ...form,
                    discountedPrice: parseFloat(discountedPrice.value),
                    imageUrl: imageData.url,
                    imageName: imageData.name,
                    imagePath: imageData.path,
                    orders: 0,
                    hawkerId: currentUser.value.uid,  // Add hawker's UID
                    hawkerName: hawkerName.value,      // Add hawker's name
                    createdAt: new Date()              // Add timestamp
                };

                // add to firestore
                await createListing(listingData);
                successMsg.value = "✓ Listing created successfully!";
                resetForm();
            } catch (error) {
                console.error("Error creating listing: ", error);
                errorMsg.value = "Error: " + error.message;
            } finally {
                isSubmitting.value = false;
            }
        };

        const deactivateListing = async (listingId) => {
            try {
                await updateListing(listingId, { makeActive: false });
                console.log("Listing deactivated successfully!");
            } catch (error) {
                console.error("Error deactivating listing: ", error);
                alert("Error deactivating listing");
            }
        };

        const activateListing = async (listingId) => {
            try {
                await updateListing(listingId, { makeActive: true });
                console.log("Listing activated successfully!");
            } catch (error) {
                console.error("Error activating listing: ", error);
                alert("Error activating listing");
            }
        };

        const deleteListingWithImage = async (listingId, imagePath) => {
            if (!confirm('Are you sure you want to permanently delete this listing?')) return;

            try {
                // delete image from storage
                if (imagePath){
                    await deleteImage(imagePath);
                }
                // delete listing from firestore
                await deleteListing(listingId);
                alert("Listing deleted successfully!");
            } catch (error){
                console.error("Error deleting listing: ", error);
                alert("Error deleting listing: " + error.message);
            }
        };

        // tbd
        const editListing = (listingId) => {
            console.log("Edit listing: ", listingId);
        };

        const duplicateListing = async (listing) => {
            if (!confirm('Create a duplicate of this listing?')) return;
            
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
                    makeActive: false, // Duplicates start as inactive
                    orders: 0,
                    hawkerId: listing.hawkerId,      // Keep same hawker info
                    hawkerName: listing.hawkerName,
                    createdAt: new Date()
                };
                await createListing(duplicateData);
                alert("Listing duplicated successfully!");
            } catch (error) {
                console.error("Error duplicating listing: ", error);
                alert("Error duplicating listing: " + error.message);
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

            // clean up file-related data
            if (previewSelectedFileSRC.value) {
                URL.revokeObjectURL(previewSelectedFileSRC.value);
            }
            selectedFile.value = null;
            previewSelectedFileSRC.value = "";
            if (fileInput.value) {
                fileInput.value.value = "";
            }
        };
        
        // Lifecycle hooks
        onMounted(() => {
            // Get current authenticated user
            currentUser.value = auth.currentUser;
            if (currentUser.value) {
                fetchUserInfo(currentUser.value.uid);
            }
        });

        onBeforeUnmount(() => {
            // Clean up the listener when component is destroyed
            if (unsubscribe) {
                unsubscribe();
            }
            // Clean up any remaining object URLs
            if (previewSelectedFileSRC.value) {
                URL.revokeObjectURL(previewSelectedFileSRC.value);
            }
        });

        // Return everything to template
        return {
            form,
            selectedFile,
            previewSelectedFileSRC,
            allListings,
            isSubmitting,
            discountedPrice,
            activeListings,
            inactiveListings,
            successMsg,
            errorMsg,
            fileInput,
            currentUser,
            hawkerName,
            userRole,
            isHawker,
            onFileSelected,
            removeFile,
            onSubmit,
            deactivateListing,
            activateListing,
            deleteListingWithImage,
            editListing,
            duplicateListing,
        };
    }
};