<template>
  <div class="review-page">
    <!-- Do it later link -->
    <div class="do-it-later">
      <a @click="handleDoItLater" class="do-it-later-link" style="cursor: pointer;">Do it later ></a>
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
            <img :src="photo.url" :alt="`Photo ${index + 1}`" class="media-thumbnail" @click="openImageModal(photo.url)" />
            <button @click.stop="removePhoto(index)" class="remove-media-btn">
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
              @timeupdate="updateVideoProgress($event, index)"
              :data-video-index="index"
            ></video>
            <div class="video-play-overlay">
              <i class="fa-solid fa-play"></i>
            </div>
            <button @click.stop="removeVideo(index)" class="remove-media-btn" v-if="!isVideoFullscreen(index)">
              <i class="fa-solid fa-times"></i>
            </button>
            <!-- Fullscreen exit button -->
            <button @click.stop="exitVideoFullscreen($event)" class="exit-fullscreen-btn" v-if="isVideoFullscreen(index)">
              <i class="fa-solid fa-times"></i>
            </button>
            <!-- Progress bar for fullscreen video -->
            <div class="video-progress-container" v-if="isVideoFullscreen(index)">
              <div class="video-progress-track" @click.stop="seekVideo($event, index)">
                <div class="video-progress-line" :style="{ width: getVideoProgress(index) + '%' }"></div>
              </div>
            </div>
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

    <!-- Image Modal -->
    <div v-if="selectedImage" class="image-modal" @click="closeImageModal">
      <div class="modal-content" @click.stop>
        <img :src="selectedImage" alt="Review image" />
        <button class="close-modal" @click="closeImageModal">
          <i class="fa-solid fa-times"></i>
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
    const selectedImage = ref(null);
    const videoProgress = ref({});
    const videoFullscreen = ref({});
    const videoDuration = ref({});
    const activeVideoRef = ref(null);

    // Computed overall rating (average of the three ratings)
    const overallRating = computed(() => {
      const total = foodQuality.value + storeService.value + valueForMoney.value;
      if (total === 0) return 0;
      return Math.round((total / 3) * 10) / 10;
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
      if (event.target) {
        event.target.value = '';
      }
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
      if (event.target) {
        event.target.value = '';
      }
    };

    const removePhoto = (index) => {
      uploadedPhotos.value.splice(index, 1);
      if (photoInput.value) {
        photoInput.value.value = '';
      }
    };

    const removeVideo = (index) => {
      uploadedVideos.value.splice(index, 1);
      if (videoInput.value) {
        videoInput.value.value = '';
      }
    };

    const videoRefs = ref([]);

    const setVideoRef = (el, idx) => {
      if (el) {
        videoRefs.value[idx] = el;
      }
    };

    const openImageModal = (imageUrl) => {
      selectedImage.value = imageUrl;
    };

    const closeImageModal = () => {
      selectedImage.value = null;
    };

    const playVideoPreview = async (event) => {
      const video = event.target;
      const videoContainer = video.closest('.video-media-item');
      const videoIndex = parseInt(video.getAttribute('data-video-index')) || 0;
      
      try {
        if (video.paused) {
          videoContainer.classList.add('fullscreen');
          videoFullscreen.value[videoIndex] = true;
          activeVideoRef.value = video;
          
          if (video.duration) {
            videoDuration.value[videoIndex] = video.duration;
          } else {
            video.addEventListener('loadedmetadata', () => {
              videoDuration.value[videoIndex] = video.duration;
            }, { once: true });
          }
          
          await video.play();
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
            console.log('Fullscreen API not available, using custom fullscreen');
          }
        } else {
          video.pause();
        }
      } catch (error) {
        console.error('Error playing video:', error);
      }
    };

    const expandVideoFullscreen = (event) => {
      const video = event.target;
      const videoContainer = video.closest('.video-media-item');
      videoContainer.classList.add('playing');
      
      activeVideoRef.value = video;
      
      const handleEscape = (e) => {
        if (e.key === 'Escape' && activeVideoRef.value) {
          activeVideoRef.value.pause();
        }
      };
      document.addEventListener('keydown', handleEscape);
      
      video._escapeHandler = handleEscape;
    };

    const exitVideoFullscreen = (event) => {
      event.stopPropagation();
      const video = event.target.closest('.video-media-item')?.querySelector('video') || 
                   event.target.querySelector('video') || 
                   activeVideoRef.value;
      
      if (!video) return;
      
      const videoContainer = video.closest('.video-media-item');
      const videoIndex = parseInt(video.getAttribute('data-video-index')) || 0;
      
      video.pause();
      videoContainer.classList.remove('playing');
      videoContainer.classList.remove('fullscreen');
      videoFullscreen.value[videoIndex] = false;
      
      if (video._escapeHandler) {
        document.removeEventListener('keydown', video._escapeHandler);
        video._escapeHandler = null;
      }
      
      activeVideoRef.value = null;
      
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (document.webkitFullscreenElement) {
        document.webkitExitFullscreen();
      } else if (document.mozFullScreenElement) {
        document.mozCancelFullScreen();
      } else if (document.msFullscreenElement) {
        document.msExitFullscreen();
      }
    };

    const isVideoFullscreen = (index) => {
      return videoFullscreen.value[index] === true;
    };

    const updateVideoProgress = (event, index) => {
      const video = event.target;
      if (video.duration) {
        const progress = (video.currentTime / video.duration) * 100;
        videoProgress.value[index] = progress;
      }
    };

    const getVideoProgress = (index) => {
      return videoProgress.value[index] || 0;
    };

    const seekVideo = (event, index) => {
      const video = videoRefs.value[index] || activeVideoRef.value;
      if (!video || !video.duration) return;
      
      const progressTrack = event.currentTarget;
      const rect = progressTrack.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const percentage = clickX / rect.width;
      video.currentTime = percentage * video.duration;
    };

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

        console.log('Fetching order with orderID:', orderId);

        // Fetch order using query
        const ordersQuery = query(
          collection(db, 'orders'),
          where('orderID', '==', orderId)
        );

        const ordersSnapshot = await getDocs(ordersQuery);
        console.log('Query executed, found docs:', ordersSnapshot.size);

        if (!ordersSnapshot.empty) {
          const orderDoc = ordersSnapshot.docs[0];
          const orderData = orderDoc.data();
          currentOrderData.value = orderData;
          stallName.value = orderData.hawkerName || 'this stall';

          console.log('Order data loaded:', orderData);

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
        } else {
          console.log('No order found with orderID:', orderId);
        }
      } catch (error) {
        console.error('Error fetching order data:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
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
          where('orderID', '==', orderId)
        );
        const orderSnapshot = await getDocs(orderQuery);

        if (orderSnapshot.empty) {
          alert('Order not found.');
          isSubmitting.value = false;
          return;
        }

        const orderDocRef = doc(db, 'orders', orderSnapshot.docs[0].id);
        const orderData = orderSnapshot.docs[0].data();
        
        console.log('Order data:', orderData);
        console.log('Current user UID:', user.uid);
        
        // Verify the current user is the one who made the order
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
          orderId: orderId, // Store orderId to link review to order
          photo: photoURLs,
          video: videoURLs,
          writtenreview: reviewText.value.trim() || '',
          createdAt: new Date()
        };
        
        // Add to userRatings array
        const updatedUserRatings = [...currentUserRatings, newUserRating];
        
        // Calculate new average stall rating
        const totalRating = updatedUserRatings.reduce((sum, rating) => sum + (rating.overallrating || 0), 0);
        const newStallRating = updatedUserRatings.length > 0 ? totalRating / updatedUserRatings.length : 0;
        
        // Update hawker document with reviews map
        const reviewsUpdate = {
          stallRating: Math.round(newStallRating * 100) / 100,
          userRatings: updatedUserRatings
        };
        
        console.log('Updating hawker document with reviews:', reviewsUpdate);
        
        await updateDoc(hawkerDocRef.value, {
          reviews: reviewsUpdate
        });

        // Mark order as review completed
        await updateDoc(orderDocRef, {
          reviewPending: false,
          reviewCompleted: true
        });

        alert('Review submitted successfully!');
        router.push('/buyer-listings');
      } catch (error) {
        console.error('Error submitting review:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        alert(`Failed to submit review: ${error.message}`);
      } finally {
        isSubmitting.value = false;
      }
    };

    // Handle "Do it later" - mark order as needing review
    const handleDoItLater = async () => {
      try {
        const orderId = route.query.orderId;
        if (!orderId) {
          router.push('/buyer-listings');
          return;
        }

        // Mark order as needing review
        const ordersQuery = query(
          collection(db, 'orders'),
          where('orderID', '==', orderId)
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        
        if (!ordersSnapshot.empty) {
          const orderDoc = ordersSnapshot.docs[0];
          await updateDoc(doc(db, 'orders', orderDoc.id), {
            reviewPending: true
          });
        }
        
        router.push('/buyer-listings');
      } catch (error) {
        console.error('Error marking order for review:', error);
        router.push('/buyer-listings');
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
      selectedImage,
      openImageModal,
      closeImageModal,
      playVideoPreview,
      expandVideoFullscreen,
      exitVideoFullscreen,
      isVideoFullscreen,
      updateVideoProgress,
      getVideoProgress,
      seekVideo,
      submitReview,
      getStarFillStyle,
      handleDoItLater
    };
  }
};
</script>

<style scoped>
@import './ReviewPage.css';
</style>