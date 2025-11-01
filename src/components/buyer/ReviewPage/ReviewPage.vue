<template>
  <div class="review-page">
    <!-- Do it later link -->
    <div class="do-it-later">
      <router-link to="/buyer-listings" class="do-it-later-link">Do it later ></router-link>
    </div>

    <!-- Main Content -->
    <div class="review-container">
      <!-- Stall Image (Circular) -->
      <div v-if="hawkerImage" class="stall-image-container">
        <img :src="hawkerImage" :alt="stallName" class="stall-image" />
      </div>
      <div v-else-if="loadingOrder" class="stall-image-container">
        <div class="stall-image-placeholder">Loading...</div>
      </div>

      <!-- Title -->
      <h1 class="review-title">Leave {{ stallName }} a review!</h1>
      <p class="review-subtitle">Share your experience and help others discover great food</p>

      <!-- Rating Sections -->
      <div class="ratings-section">
        <!-- Food Quality -->
        <div class="rating-row">
          <label class="rating-label">Food Quality</label>
          <div class="stars-container">
            <span
              v-for="star in 5"
              :key="'food-' + star"
              :class="['star', { 'filled': star <= foodQuality }]"
              @click="setFoodQuality(star)"
            >★</span>
          </div>
        </div>

        <!-- Store Service -->
        <div class="rating-row">
          <label class="rating-label">Store Service</label>
          <div class="stars-container">
            <span
              v-for="star in 5"
              :key="'service-' + star"
              :class="['star', { 'filled': star <= storeService }]"
              @click="setStoreService(star)"
            >★</span>
          </div>
        </div>

        <!-- Value For Money -->
        <div class="rating-row">
          <label class="rating-label">Value For Money</label>
          <div class="stars-container">
            <span
              v-for="star in 5"
              :key="'value-' + star"
              :class="['star', { 'filled': star <= valueForMoney }]"
              @click="setValueForMoney(star)"
            >★</span>
          </div>
        </div>

        <!-- Divider -->
        <hr class="rating-divider" />

        <!-- Overall Rating (Computed) -->
        <div class="rating-row">
          <label class="rating-label">Overall Rating</label>
          <div class="stars-container">
            <span
              v-for="star in 5"
              :key="'overall-' + star"
              class="star readonly partial-star"
              :style="getStarFillStyle(star, overallRating)"
            >★</span>
          </div>
        </div>
      </div>

      <!-- Add Photos/Videos -->
      <div class="media-section">
        <label class="media-label">Add Photos or Videos(optional)</label>
        <div class="media-buttons">
          <button type="button" class="media-btn" @click="triggerPhotoUpload">
            <i class="fa-solid fa-camera"></i>
            <span>Photo</span>
          </button>
          <button type="button" class="media-btn" @click="triggerVideoUpload">
            <i class="fa-solid fa-video"></i>
            <span>Video</span>
          </button>
        </div>
        <input
          ref="photoInput"
          type="file"
          accept="image/*"
          multiple
          @change="handlePhotoUpload"
          style="display: none"
        />
        <input
          ref="videoInput"
          type="file"
          accept="video/*"
          @change="handleVideoUpload"
          style="display: none"
        />
        
        <!-- Media Preview (Photos and Videos) -->
        <div v-if="uploadedPhotos.length > 0 || uploadedVideos.length > 0" class="media-preview">
          <!-- Photos -->
          <div v-for="(photo, index) in uploadedPhotos" :key="'photo-' + index" class="media-item">
            <img :src="photo.url" :alt="`Photo ${index + 1}`" class="media-thumbnail" />
            <button @click="removePhoto(index)" class="remove-media-btn">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>
          
          <!-- Videos -->
          <div v-for="(video, index) in uploadedVideos" :key="'video-' + index" class="media-item video-media-item">
            <video 
              :ref="el => setVideoRef(el, index)"
              :src="video.url" 
              class="media-thumbnail video-thumbnail"
              @click.stop="playVideoPreview($event)"
              @play="expandVideoFullscreen($event)"
              @pause="exitVideoFullscreen($event)"
            ></video>
            <div class="video-play-overlay">
              <i class="fa-solid fa-play"></i>
            </div>
            <button @click.stop="removeVideo(index)" class="remove-media-btn">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Review Text Area -->
      <div class="review-text-section">
        <label class="review-text-label">Write a review (optional)</label>
        <textarea
          v-model="reviewText"
          class="review-textarea"
          placeholder="Tell us about your experience..."
          rows="4"
        ></textarea>
      </div>

      <!-- Submit Button -->
      <div class="submit-section">
        <button type="button" @click="submitReview" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? 'Submitting...' : 'Submit' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db, storage } from '/firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

export default {
  name: 'ReviewPage',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const auth = getAuth();

    // Data
    const hawkerImage = ref(null);
    const stallName = ref('this stall');
    const foodQuality = ref(0);
    const storeService = ref(0);
    const valueForMoney = ref(0);
    const reviewText = ref('');
    const uploadedPhotos = ref([]);
    const uploadedVideos = ref([]);
    const isSubmitting = ref(false);
    const loadingOrder = ref(true);
    const photoInput = ref(null);
    const videoInput = ref(null);
    const currentOrderData = ref(null);
    const hawkerDocRef = ref(null);

    // Computed overall rating (average of the three ratings)
    const overallRating = computed(() => {
      const total = foodQuality.value + storeService.value + valueForMoney.value;
      if (total === 0) return 0;
      return Math.round((total / 3) * 10) / 10; // Round to 1 decimal place
    });

    // Rating setter functions
    const setFoodQuality = (stars) => {
      foodQuality.value = stars;
    };

    const setStoreService = (stars) => {
      storeService.value = stars;
    };

    const setValueForMoney = (stars) => {
      valueForMoney.value = stars;
    };

    // Media upload handlers
    const triggerPhotoUpload = () => {
      photoInput.value?.click();
    };

    const triggerVideoUpload = () => {
      videoInput.value?.click();
    };

    const handlePhotoUpload = (event) => {
      const files = Array.from(event.target.files);
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            uploadedPhotos.value.push({
              file: file,
              url: e.target.result,
              name: file.name
            });
          };
          reader.readAsDataURL(file);
        }
      });
    };

    const handleVideoUpload = (event) => {
      const files = Array.from(event.target.files);
      files.forEach(file => {
        if (file.type.startsWith('video/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            uploadedVideos.value.push({
              file: file,
              url: e.target.result,
              name: file.name
            });
          };
          reader.readAsDataURL(file);
        }
      });
    };

    const removePhoto = (index) => {
      uploadedPhotos.value.splice(index, 1);
    };

    const removeVideo = (index) => {
      uploadedVideos.value.splice(index, 1);
    };

    const videoRefs = ref([]);

    const setVideoRef = (el, idx) => {
      if (el) {
        videoRefs.value[idx] = el;
      }
    };

    const playVideoPreview = async (event) => {
      const video = event.target;
      const videoContainer = video.closest('.video-media-item');
      
      try {
        if (video.paused) {
          // Expand to fullscreen before playing
          videoContainer.classList.add('fullscreen');
          await video.play();
          // Request fullscreen API if available
          try {
            if (videoContainer.requestFullscreen) {
              await videoContainer.requestFullscreen();
            } else if (videoContainer.webkitRequestFullscreen) {
              await videoContainer.webkitRequestFullscreen();
            } else if (videoContainer.mozRequestFullScreen) {
              await videoContainer.mozRequestFullScreen();
            } else if (videoContainer.msRequestFullscreen) {
              await videoContainer.msRequestFullscreen();
            }
          } catch (fsError) {
            // Fullscreen request failed, but continue with custom fullscreen
            console.log('Fullscreen API not available, using custom fullscreen');
          }
        } else {
          video.pause();
        }
      } catch (error) {
        console.error('Error playing video:', error);
      }
    };

    const activeVideoRef = ref(null);

    const expandVideoFullscreen = (event) => {
      const video = event.target;
      const videoContainer = video.closest('.video-media-item');
      videoContainer.classList.add('playing');
      
      // Store reference to active video
      activeVideoRef.value = video;
      
      // Add escape key listener
      const handleEscape = (e) => {
        if (e.key === 'Escape' && activeVideoRef.value) {
          activeVideoRef.value.pause();
        }
      };
      document.addEventListener('keydown', handleEscape);
      
      // Store handler for cleanup
      video._escapeHandler = handleEscape;
    };

    const exitVideoFullscreen = (event) => {
      const video = event.target;
      const videoContainer = video.closest('.video-media-item');
      videoContainer.classList.remove('playing');
      
      // Remove escape key listener
      if (video._escapeHandler) {
        document.removeEventListener('keydown', video._escapeHandler);
        video._escapeHandler = null;
      }
      
      activeVideoRef.value = null;
      
      // Exit browser fullscreen if active
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (document.webkitFullscreenElement) {
        document.webkitExitFullscreen();
      } else if (document.mozFullScreenElement) {
        document.mozCancelFullScreen();
      } else if (document.msFullscreenElement) {
        document.msExitFullscreen();
      }
      
      videoContainer.classList.remove('fullscreen');
    };

    // Get star fill style for partial stars
    const getStarFillStyle = (starPosition, rating) => {
      const fillPercentage = Math.max(0, Math.min(1, rating - (starPosition - 1))) * 100;
      
      if (fillPercentage === 0) {
        return { color: '#ccc' };
      } else if (fillPercentage === 100) {
        return { color: '#ffd700' };
      } else {
        return {
          background: `linear-gradient(90deg, #ffd700 ${fillPercentage}%, #ccc ${fillPercentage}%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        };
      }
    };

    // Upload file to Firebase Storage
    const uploadFileToStorage = async (file, folderName, userId, timestamp) => {
      try {
        const fileExtension = file.name.split('.').pop();
        const fileName = `${userId}_${timestamp}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
        const fileRef = storageRef(storage, `${folderName}/${fileName}`);
        
        await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(fileRef);
        
        return downloadURL;
      } catch (error) {
        console.error(`Error uploading file to ${folderName}:`, error);
        throw error;
      }
    };

    // Fetch order and hawker data
    const fetchOrderData = async () => {
      try {
        loadingOrder.value = true;
        const orderId = route.query.orderId;

        if (!orderId) {
          console.log('No order ID in query params');
          loadingOrder.value = false;
          return;
        }

        // Fetch order
        const ordersQuery = query(
          collection(db, 'orders'),
          where('orderID', '==', parseInt(orderId))
        );

        const ordersSnapshot = await getDocs(ordersQuery);

        if (!ordersSnapshot.empty) {
          const orderDoc = ordersSnapshot.docs[0];
          const orderData = orderDoc.data();
          currentOrderData.value = orderData;
          stallName.value = orderData.hawkerName || 'this stall';

          // Fetch hawker image and store reference
          if (orderData.hawkerId) {
            const hawkerQuery = query(
              collection(db, 'hawkerListings'),
              where('userId', '==', orderData.hawkerId)
            );

            const hawkerSnapshot = await getDocs(hawkerQuery);
            if (!hawkerSnapshot.empty) {
              hawkerDocRef.value = doc(db, 'hawkerListings', hawkerSnapshot.docs[0].id);
              const hawkerData = hawkerSnapshot.docs[0].data();
              hawkerImage.value = hawkerData.imageUrl || null;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching order data:', error);
      } finally {
        loadingOrder.value = false;
      }
    };

    // Submit review
    const submitReview = async () => {
      if (!foodQuality.value || !storeService.value || !valueForMoney.value) {
        alert('Please fill in all three ratings (Food Quality, Store Service, and Value For Money)');
        return;
      }

      isSubmitting.value = true;

      try {
        const user = auth.currentUser;

        if (!user) {
          alert('Please log in to submit a review');
          isSubmitting.value = false;
          return;
        }

        const orderId = route.query.orderId;
        if (!orderId) {
          alert('Order ID is missing.');
          isSubmitting.value = false;
          return;
        }

        // Fetch order data
        const orderQuery = query(
          collection(db, 'orders'),
          where('orderID', '==', parseInt(orderId))
        );
        const orderSnapshot = await getDocs(orderQuery);

        if (orderSnapshot.empty) {
          alert('Order not found.');
          isSubmitting.value = false;
          return;
        }

        const orderData = orderSnapshot.docs[0].data();
        
        // Debug: Log order data to see what fields exist
        console.log('Order data:', orderData);
        console.log('Current user UID:', user.uid);
        console.log('Order buyerId:', orderData.buyerId);
        console.log('Order userId:', orderData.userId);
        console.log('Order customerId:', orderData.customerId);
        
        // Verify the current user is the one who made the order
        // Check multiple possible field names for buyer ID
        const orderBuyerId = orderData.buyerId || orderData.userId || orderData.customerId;
        
        if (!orderBuyerId) {
          console.error('No buyer ID found in order data');
          alert('Order data is incomplete. Cannot verify order ownership.');
          isSubmitting.value = false;
          return;
        }
        
        if (orderBuyerId !== user.uid) {
          console.error('User ID mismatch:', orderBuyerId, 'vs', user.uid);
          alert('You can only review orders you have made.');
          isSubmitting.value = false;
          return;
        }
        
        console.log('Verification passed! User is the order owner.');

        // Get item names from order
        const itemNames = orderData.items ? orderData.items.map(item => item.itemName) : [];

        // Get hawker document reference
        if (!hawkerDocRef.value) {
          const hawkerQuery = query(
            collection(db, 'hawkerListings'),
            where('userId', '==', orderData.hawkerId)
          );
          const hawkerSnapshot = await getDocs(hawkerQuery);
          
          if (hawkerSnapshot.empty) {
            throw new Error('Hawker not found');
          }
          
          hawkerDocRef.value = doc(db, 'hawkerListings', hawkerSnapshot.docs[0].id);
        }

        // Upload photos to Firebase Storage
        const timestamp = Date.now();
        const photoURLs = [];
        for (const photo of uploadedPhotos.value) {
          const url = await uploadFileToStorage(photo.file, 'reviewsPhotos', user.uid, timestamp);
          photoURLs.push(url);
        }

        // Upload videos to Firebase Storage
        const videoURLs = [];
        for (const video of uploadedVideos.value) {
          const url = await uploadFileToStorage(video.file, 'reviewsVideos', user.uid, timestamp);
          videoURLs.push(url);
        }

        // Get current hawker data
        const hawkerDoc = await getDoc(hawkerDocRef.value);
        
        if (!hawkerDoc.exists()) {
          throw new Error('Hawker document not found');
        }

        const hawkerData = hawkerDoc.data();
        const currentReviews = hawkerData.reviews || {};
        const currentUserRatings = currentReviews.userRatings || [];
        
        // Create new user rating entry
        const newUserRating = {
          itemname: itemNames,
          overallrating: overallRating.value,
          foodQuality: foodQuality.value,
          storeService: storeService.value,
          valueForMoney: valueForMoney.value,
          userid: user.uid,
          photo: photoURLs,
          video: videoURLs,
          writtenreview: reviewText.value.trim() || '', // Allow empty string
          createdAt: new Date()
        };
        
        // Add to userRatings array
        const updatedUserRatings = [...currentUserRatings, newUserRating];
        
        // Calculate new average stall rating
        const totalRating = updatedUserRatings.reduce((sum, rating) => sum + (rating.overallrating || 0), 0);
        const newStallRating = updatedUserRatings.length > 0 ? totalRating / updatedUserRatings.length : 0;
        
        // Update hawker document with reviews map
        const reviewsUpdate = {
          stallRating: Math.round(newStallRating * 100) / 100, // Round to 2 decimal places
          userRatings: updatedUserRatings
        };
        
        await updateDoc(hawkerDocRef.value, {
          reviews: reviewsUpdate
        });

        alert('Review submitted successfully!');
        router.push('/buyer-listings');
      } catch (error) {
        console.error('Error submitting review:', error);
        alert(`Failed to submit review: ${error.message}`);
      } finally {
        isSubmitting.value = false;
      }
    };

    onMounted(() => {
      fetchOrderData();
    });

    return {
      hawkerImage,
      stallName,
      foodQuality,
      storeService,
      valueForMoney,
      overallRating,
      reviewText,
      uploadedPhotos,
      uploadedVideos,
      isSubmitting,
      loadingOrder,
      photoInput,
      videoInput,
      setFoodQuality,
      setStoreService,
      setValueForMoney,
      triggerPhotoUpload,
      triggerVideoUpload,
      handlePhotoUpload,
      handleVideoUpload,
      removePhoto,
      removeVideo,
      setVideoRef,
      playVideoPreview,
      expandVideoFullscreen,
      exitVideoFullscreen,
      submitReview,
      getStarFillStyle
    };
  }
};
</script>

<style scoped>
@import './ReviewPage.css';
</style>