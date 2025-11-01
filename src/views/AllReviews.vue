<template>
  <div class="all-reviews-page">
    <div class="container">
      <div class="header-section">
        <router-link :to="{ name: 'BuyerViewStall', params: { userId: hawker?.userId } }" class="back-link">
          <i class="fa-solid fa-arrow-left"></i> Back to Stall
        </router-link>
        <h1 class="page-title">{{ hawker?.hawkerName || 'Stall' }} - All Reviews</h1>
      </div>

      <div v-if="loading" class="loading-state">
        <p>Loading reviews...</p>
      </div>

      <div v-else-if="errorMsg" class="error-state">
        <p>{{ errorMsg }}</p>
      </div>

      <div v-else-if="!hawker || !reviews || allReviews.length === 0" class="no-reviews">
        <p>No reviews yet for this stall.</p>
      </div>

      <div v-else class="reviews-content">
        <!-- Overall Rating Summary -->
        <div class="rating-summary-large">
          <div class="overall-rating-large">
            <div class="rating-number-large">{{ displayRating.toFixed(2) }}</div>
            <div class="stars-display-large">
              <span
                v-for="star in 5"
                :key="'overall-' + star"
                class="star-large"
                :class="{ 'filled': star <= Math.floor(displayRating), 'partial': star === Math.ceil(displayRating) && displayRating % 1 !== 0 }"
                :style="getStarStyle(star, displayRating)"
              >★</span>
            </div>
            <div class="total-ratings-large">{{ totalRatings }} {{ totalRatings === 1 ? 'rating' : 'ratings' }}</div>
          </div>

          <!-- Rating Distribution -->
          <div class="rating-distribution-large">
            <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="rating-bar-item-large">
              <span class="rating-label-large">{{ rating }}.0</span>
              <div class="rating-bar-container-large">
                <div class="rating-bar-fill-large" :style="{ width: getRatingPercentage(rating) + '%' }"></div>
              </div>
              <span class="rating-count-large">{{ getRatingCount(rating) }} {{ getRatingCount(rating) === 1 ? 'review' : 'reviews' }}</span>
            </div>
          </div>
        </div>

        <!-- All Reviews List -->
        <div class="all-reviews-list">
          <div
            v-for="review in sortedReviews"
            :key="review.id || review.createdAt?.toDate?.().getTime() || Math.random()"
            class="review-item-large"
          >
            <div class="review-header-large">
              <div class="reviewer-info-large">
                <div class="reviewer-avatar-large">
                  <i class="fa-solid fa-user"></i>
                </div>
                <div>
                  <div class="reviewer-name-large">User {{ (review.userId || review.userid || '').substring(0, 8) || 'Anonymous' }}</div>
                  <div class="review-date-large">{{ formatDate(review.createdAt) }}</div>
                </div>
              </div>
              <div class="review-rating-large">
                <span class="rating-number-small-large">{{ (review.overallRating || review.overallrating || 0).toFixed(1) }}</span>
                <div class="stars-small-large">
                  <span
                    v-for="star in 5"
                    :key="'review-' + star"
                    class="star-small-large"
                    :style="getStarStyle(star, review.overallRating || review.overallrating || 0)"
                  >★</span>
                </div>
              </div>
            </div>
            <div class="review-text-large">{{ review.writtenReview || review.writtenreview || '' }}</div>
            <div v-if="hasMedia(review)" class="review-media-large">
              <!-- Photos -->
              <img
                v-for="(photo, idx) in getPhotos(review)"
                :key="'photo-' + idx"
                :src="photo"
                :alt="'Review image ' + (idx + 1)"
                class="review-media-item-large"
                @click="openImageModal(photo)"
              />
              
              <!-- Videos -->
              <div
                v-for="(video, idx) in getVideos(review)"
                :key="'video-' + idx"
                class="review-media-item-large video-media-item-large"
              >
                <video
                  :ref="el => setVideoRef(el, idx)"
                  :src="video"
                  class="review-media-item-large video-thumbnail-large"
                  @click.stop="playVideoInPictureInPicture($event)"
                  @play="expandVideoFullscreen($event)"
                  @pause="exitVideoFullscreen($event)"
                  @timeupdate="updateVideoProgress($event, idx)"
                  :data-video-index="idx"
                ></video>
                <div class="video-play-overlay-large">
                  <i class="fa-solid fa-play"></i>
                </div>
                <!-- Fullscreen exit button -->
                <button @click.stop="exitVideoFullscreen($event)" class="exit-fullscreen-btn-large" v-if="isVideoFullscreen(idx)">
                  <i class="fa-solid fa-times"></i>
                </button>
                <!-- Progress bar for fullscreen video -->
                <div class="video-progress-container-large" v-if="isVideoFullscreen(idx)">
                  <div class="video-progress-track-large" @click.stop="seekVideo($event, idx)">
                    <div class="video-progress-line-large" :style="{ width: getVideoProgress(idx) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="getItemNames(review).length > 0" class="review-items-large">
              <span class="review-items-label">Items reviewed:</span>
              <span v-for="(item, idx) in getItemNames(review)" :key="idx" class="item-tag">{{ item }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div v-if="selectedImage" class="image-modal" @click="closeImageModal">
      <div class="modal-content">
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
import { useRoute } from 'vue-router';
import { db } from '/firebase/config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export default {
  name: 'AllReviews',
  setup() {
    const route = useRoute();
    const hawker = ref(null);
    const reviews = ref(null);
    const allReviews = ref([]);
      const loading = ref(true);
      const errorMsg = ref(null);
      const selectedImage = ref(null);
      const videoProgress = ref({});
      const videoFullscreen = ref({});
      const videoDuration = ref({});

    // Computed properties
    const displayRating = computed(() => {
      return reviews.value?.stallRating || 0;
    });

    const totalRatings = computed(() => {
      return allReviews.value.length;
    });

    const sortedReviews = computed(() => {
      return [...allReviews.value].sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      });
    });

    // Fetch hawker and reviews data
    const fetchData = async () => {
      try {
        loading.value = true;
        const userId = route.params.userId;

        if (!userId) {
          errorMsg.value = 'Hawker ID not found';
          loading.value = false;
          return;
        }

        // Fetch hawker data
        const hawkersRef = collection(db, 'hawkerListings');
        const q = query(hawkersRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          errorMsg.value = 'Hawker not found';
          loading.value = false;
          return;
        }

        const docSnap = querySnapshot.docs[0];
        hawker.value = {
          id: docSnap.id,
          ...docSnap.data()
        };

        // Get reviews from hawker data
        if (hawker.value.reviews) {
          reviews.value = hawker.value.reviews;
          allReviews.value = hawker.value.reviews.userRatings || [];

        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        errorMsg.value = 'Failed to load reviews';
      } finally {
        loading.value = false;
      }
    };

    // Helper functions
    const getStarStyle = (starPosition, rating) => {
      const fillPercentage = Math.max(0, Math.min(1, rating - (starPosition - 1))) * 100;

      if (fillPercentage === 0) {
        return { color: '#ccc' };
      } else if (fillPercentage === 100) {
        return { color: '#28a745' }; // Green
      } else {
        return {
          background: `linear-gradient(90deg, #28a745 ${fillPercentage}%, #ccc ${fillPercentage}%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        };
      }
    };

    const getRatingCount = (rating) => {
      return allReviews.value.filter(r => {
        const overallRating = r.overallRating || r.overallrating || 0;
        return Math.floor(overallRating) === rating;
      }).length;
    };

    const getRatingPercentage = (rating) => {
      if (totalRatings.value === 0) return 0;
      return (getRatingCount(rating) / totalRatings.value) * 100;
    };

    const formatDate = (date) => {
      if (!date) return 'Recently';

      let dateObj;
      if (date.toDate) {
        dateObj = date.toDate();
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        dateObj = new Date(date);
      }

      const now = new Date();
      const diffTime = Math.abs(now - dateObj);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 30) return `${diffDays} days ago`;
      if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} ${months === 1 ? 'month' : 'months'} ago`;
      }
      const years = Math.floor(diffDays / 365);
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    };

    const openImageModal = (imageUrl) => {
      selectedImage.value = imageUrl;
    };

    const closeImageModal = () => {
      selectedImage.value = null;
    };

    const hasMedia = (review) => {
      const hasPhotos = (review.photo && review.photo.length > 0) || (review.Photo && review.Photo.length > 0);
      const hasVideos = (review.video && review.video.length > 0) || (review.Video && review.Video.length > 0);
      return hasPhotos || hasVideos;
    };

    const getPhotos = (review) => {
      return review.photo || review.Photo || [];
    };

    const getVideos = (review) => {
      return review.video || review.Video || [];
    };

    const getItemNames = (review) => {
      return review.itemName || review.itemname || [];
    };

    const videoRefs = ref([]);

    const setVideoRef = (el, idx) => {
      if (el) {
        videoRefs.value[idx] = el;
      }
    };

    const activeVideoRef = ref(null);

    const playVideoInPictureInPicture = async (event) => {
      const video = event.target;
      const videoContainer = video.closest('.video-media-item-large');
      
      // Find video index
      let videoIndex = -1;
      const dataIndex = video.getAttribute('data-video-index');
      if (dataIndex !== null) {
        videoIndex = parseInt(dataIndex);
      } else {
        for (let i = 0; i < videoRefs.value.length; i++) {
          if (videoRefs.value[i] === video) {
            videoIndex = i;
            break;
          }
        }
      }
      
      try {
        if (video.paused) {
          // Expand to fullscreen before playing
          videoContainer.classList.add('fullscreen');
          if (videoIndex >= 0) {
            videoFullscreen.value[videoIndex] = true;
            
            // Get video duration
            if (video.readyState >= 2) {
              videoDuration.value[videoIndex] = video.duration;
            } else {
              video.addEventListener('loadedmetadata', () => {
                videoDuration.value[videoIndex] = video.duration;
              });
            }
          }
          
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
      const videoContainer = video.closest('.video-media-item-large');
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
      // Find video and index
      let video = null;
      let videoContainer = null;
      let videoIndex = -1;
      
      if (event && event.target) {
        // Check if it's the exit button
        const exitBtn = event.target.closest('.exit-fullscreen-btn-large');
        if (exitBtn) {
          videoContainer = exitBtn.closest('.video-media-item-large');
          video = videoContainer?.querySelector('video');
        } else {
          video = event.target.tagName === 'VIDEO' ? event.target : event.target.closest('.video-media-item-large')?.querySelector('video');
          videoContainer = video?.closest('.video-media-item-large');
        }
      } else if (activeVideoRef.value) {
        video = activeVideoRef.value;
        videoContainer = video.closest('.video-media-item-large');
      }
      
      if (!video || !videoContainer) return;
      
      // Find video index
      const dataIndex = video.getAttribute('data-video-index');
      if (dataIndex !== null) {
        videoIndex = parseInt(dataIndex);
      } else {
        for (let i = 0; i < videoRefs.value.length; i++) {
          if (videoRefs.value[i] === video) {
            videoIndex = i;
            break;
          }
        }
      }
      
      video.pause();
      videoContainer.classList.remove('playing');
      if (videoIndex >= 0) {
        videoFullscreen.value[videoIndex] = false;
      }
      
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
      
      videoContainer.classList.remove('fullscreen');
    };

    const isVideoFullscreen = (index) => {
      return videoFullscreen.value[index] === true;
    };

    const updateVideoProgress = (event, index) => {
      const video = event.target;
      if (video.duration) {
        const progress = (video.currentTime / video.duration) * 100;
        videoProgress.value[index] = progress;
        if (!videoDuration.value[index]) {
          videoDuration.value[index] = video.duration;
        }
      }
    };

    const getVideoProgress = (index) => {
      return videoProgress.value[index] || 0;
    };

    const seekVideo = (event, index) => {
      const video = videoRefs.value[index];
      if (!video || !video.duration) return;
      
      const progressContainer = event.currentTarget;
      const rect = progressContainer.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const percentage = (clickX / rect.width) * 100;
      const seekTime = (percentage / 100) * video.duration;
      
      video.currentTime = seekTime;
      videoProgress.value[index] = percentage;
    };

    onMounted(() => {
      fetchData();
    });

    return {
      hawker,
      reviews,
      allReviews,
      loading,
      errorMsg,
      displayRating,
      totalRatings,
      sortedReviews,
      selectedImage,
      getStarStyle,
      getRatingCount,
      getRatingPercentage,
      formatDate,
      openImageModal,
      closeImageModal,
      hasMedia,
      getPhotos,
      getVideos,
      getItemNames,
      setVideoRef,
      playVideoInPictureInPicture,
      expandVideoFullscreen,
      exitVideoFullscreen,
      isVideoFullscreen,
      updateVideoProgress,
      getVideoProgress,
      seekVideo
    };
  }
};
</script>

<style scoped>
.all-reviews-page {
  min-height: 100vh;
  background-color: #f0f2f5;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.header-section {
  margin-bottom: 2rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #28a745;
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 1rem;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: #218838;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #343a40;
}

.loading-state,
.error-state,
.no-reviews {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.reviews-content {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.rating-summary-large {
  display: flex;
  gap: 3rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e9ecef;
}

.overall-rating-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 150px;
}

.rating-number-large {
  font-size: 3.5rem;
  font-weight: 700;
  color: #343a40;
  margin-bottom: 0.5rem;
}

.stars-display-large {
  display: flex;
  gap: 0.2rem;
  margin-bottom: 0.5rem;
}

.star-large {
  font-size: 1.8rem;
  color: #ccc;
  line-height: 1;
}

.star-large.filled {
  color: #28a745;
}

.total-ratings-large {
  font-size: 1rem;
  color: #6c757d;
}

.rating-distribution-large {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rating-bar-item-large {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rating-label-large {
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
  min-width: 35px;
}

.rating-bar-container-large {
  flex: 1;
  height: 10px;
  background-color: #e9ecef;
  border-radius: 5px;
  overflow: hidden;
}

.rating-bar-fill-large {
  height: 100%;
  background-color: #28a745;
  transition: width 0.3s ease;
}

.rating-count-large {
  font-size: 0.9rem;
  color: #6c757d;
  min-width: 100px;
  text-align: right;
}

.all-reviews-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.review-item-large {
  padding-bottom: 2rem;
  border-bottom: 1px solid #e9ecef;
}

.review-item-large:last-child {
  border-bottom: none;
}

.review-header-large {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.reviewer-info-large {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.reviewer-avatar-large {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 1.5rem;
}

.reviewer-name-large {
  font-weight: 600;
  color: #343a40;
  font-size: 1.1rem;
}

.review-date-large {
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.review-rating-large {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-number-small-large {
  font-size: 1.3rem;
  font-weight: 700;
  color: #28a745;
}

.stars-small-large {
  display: flex;
  gap: 0.1rem;
}

.star-small-large {
  font-size: 1.1rem;
  color: #ccc;
  line-height: 1;
}

.star-small-large.filled {
  color: #28a745;
}

.review-text-large {
  color: #495057;
  line-height: 1.7;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.review-media-large {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.review-media-item-large {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.review-media-item-large:hover {
  transform: scale(1.05);
}

.video-media-item-large {
  position: relative;
  cursor: pointer;
}

.video-thumbnail-large {
  background-color: #000;
}

.video-play-overlay-large {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.video-play-overlay-large i {
  color: white;
  font-size: 20px;
  margin-left: 2px;
}

.video-media-item-large:hover .video-play-overlay-large {
  opacity: 0.9;
  transform: translate(-50%, -50%) scale(1.1);
}

.video-media-item-large.playing .video-play-overlay-large {
  opacity: 0;
}

.video-media-item-large.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 9999;
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;
}

.video-media-item-large.fullscreen .video-thumbnail-large {
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-width: 100%;
  max-height: 100%;
}

.exit-fullscreen-btn-large {
  display: none;
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(128, 128, 128, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  z-index: 10001;
  transition: background 0.2s ease;
}

.exit-fullscreen-btn-large:hover {
  background: rgba(128, 128, 128, 1);
}

.video-media-item-large.fullscreen .exit-fullscreen-btn-large {
  display: flex !important;
}

.video-progress-container-large {
  display: none;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 10001;
  padding: 12px 16px;
}

.video-media-item-large.fullscreen .video-progress-container-large {
  display: block;
}

.video-progress-track-large {
  position: relative;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  border-radius: 2px;
  overflow: hidden;
}

.video-progress-line-large {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background-color: white;
  transition: width 0.1s linear;
  border-radius: 2px;
}

.review-items-large {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin-top: 1rem;
}

.review-items-label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.item-tag {
  padding: 0.25rem 0.75rem;
  background-color: #e9ecef;
  border-radius: 12px;
  font-size: 0.85rem;
  color: #495057;
}

/* Image Modal */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: pointer;
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.modal-content img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
}

.close-modal {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
}

.close-modal:hover {
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 768px) {
  .rating-summary-large {
    flex-direction: column;
    gap: 1.5rem;
  }

  .overall-rating-large {
    align-items: flex-start;
  }

  .review-header-large {
    flex-direction: column;
    gap: 0.75rem;
  }

  .review-rating-large {
    align-self: flex-start;
  }
}
</style>
