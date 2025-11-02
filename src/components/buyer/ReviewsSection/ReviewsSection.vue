<template>
  <div v-if="hawker" class="row mt-4">
    <h4>Reviews</h4>
    
    <div class="reviews-card">
    <div class="reviews-section-content">
    
    <!-- No Reviews Message -->
    <div v-if="!reviews || totalRatings === 0" class="no-reviews-message">
      <p>No reviews yet</p>
    </div>

    <!-- Overall Rating -->
    <div v-else class="rating-summary">
      <div class="overall-rating">
        <div class="rating-number">{{ displayRating.toFixed(2) }}</div>
        <div class="stars-display">
          <span
            v-for="star in 5"
            :key="'overall-' + star"
            class="star"
            :class="{ 'filled': star <= Math.floor(displayRating), 'partial': star === Math.ceil(displayRating) && displayRating % 1 !== 0 }"
            :style="getStarStyle(star, displayRating)"
          >★</span>
        </div>
        <div class="total-ratings">{{ totalRatings }} {{ totalRatings === 1 ? 'rating' : 'ratings' }}</div>
      </div>

      <!-- Rating Distribution -->
      <div class="rating-distribution">
        <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="rating-bar-item">
          <span class="rating-label">{{ rating }}.0</span>
          <div class="rating-bar-container">
            <div class="rating-bar-fill" :style="{ width: getRatingPercentage(rating) + '%' }"></div>
          </div>
          <span class="rating-count">{{ getRatingCount(rating) }} {{ getRatingCount(rating) === 1 ? 'review' : 'reviews' }}</span>
        </div>
      </div>
    </div>

    <!-- Individual Reviews (Latest 3) -->
    <div v-if="reviews && totalRatings > 0" class="reviews-list">
      <div
        v-for="review in displayedReviews"
        :key="review.id || review.createdAt?.toDate?.().getTime() || Math.random()"
        class="review-item"
      >
        <div class="review-header">
          <div class="reviewer-info">
            <div class="reviewer-avatar">
              <i class="fa-solid fa-user"></i>
            </div>
            <div>
              <div class="reviewer-name">User {{ (review.userId || review.userid || '').substring(0, 8) || 'Anonymous' }}</div>
              <div class="review-date">{{ formatDate(review.createdAt) }}</div>
            </div>
          </div>
          <div class="review-rating">
            <span class="rating-number-small">{{ (review.overallRating || review.overallrating || 0).toFixed(1) }}</span>
            <div class="stars-small">
              <span
                v-for="star in 5"
                :key="'review-' + star"
                class="star-small"
                :style="getStarStyle(star, review.overallRating || review.overallrating || 0)"
              >★</span>
            </div>
          </div>
        </div>
          <div class="review-text">{{ review.writtenReview || review.writtenreview || '' }}</div>
          <div v-if="hasMedia(review)" class="review-media">
            <img
              v-for="(photo, idx) in getPhotos(review).slice(0, 4)"
              :key="'photo-' + idx"
              :src="photo"
              :alt="'Review image ' + (idx + 1)"
              class="review-media-item"
            />
            <div
              v-for="(video, idx) in getVideos(review)"
              :key="'video-' + idx"
              class="review-media-item review-video-container"
            >
              <video
                :ref="el => setVideoRef(el, idx)"
                :src="video"
                class="review-media-item review-video"
                @click="playVideoInPictureInPicture($event)"
                @play="hidePlayButton($event)"
                @pause="showPlayButton($event)"
                :data-video-index="idx"
              ></video>
              <div class="video-icon-overlay">
                <i class="fa-solid fa-play"></i>
              </div>
            </div>
          </div>
          <div v-if="getItemNames(review).length > 0" class="review-items">
            <span class="review-items-label">Items reviewed:</span>
            <span v-for="(item, idx) in getItemNames(review)" :key="idx" class="item-tag">{{ item }}</span>
          </div>
      </div>
    </div>

    <!-- Read All Reviews Link -->
    <div v-if="reviews && allReviews.length > displayedReviews.length" class="read-all-container">
      <router-link
        :to="{ name: 'AllReviews', params: { userId: hawker.userId } }"
        class="read-all-link"
      >
        Read all reviews
        <i class="fa-solid fa-chevron-down"></i>
      </router-link>
    </div>
    </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted, watch } from 'vue';

export default {
  name: 'ReviewsSection',
  props: {
    hawker: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const reviews = ref(null);
    const allReviews = ref([]);

    // Computed properties
    const displayRating = computed(() => {
      return reviews.value?.stallRating || 0;
    });

    const totalRatings = computed(() => {
      return allReviews.value.length;
    });

    const displayedReviews = computed(() => {
      // Sort by date (newest first) and take latest 3
      const sorted = [...allReviews.value].sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : (a.createdAt ? new Date(a.createdAt) : new Date(0));
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : (b.createdAt ? new Date(b.createdAt) : new Date(0));
        return dateB - dateA;
      });
      return sorted.slice(0, 3);
    });

    // Fetch reviews from hawker data
    const fetchReviews = () => {
      if (props.hawker && props.hawker.reviews) {
        reviews.value = props.hawker.reviews;
        allReviews.value = props.hawker.reviews.userRatings || [];
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

    const playVideoInPictureInPicture = async (event) => {
      const video = event.target;
      
      try {
        // Play the video
        await video.play();
        
        // Check if picture-in-picture is supported
        if (document.pictureInPictureEnabled && !document.pictureInPictureElement) {
          // Enter picture-in-picture mode
          await video.requestPictureInPicture();
        }
      } catch (error) {
        console.error('Error playing video in picture-in-picture:', error);
        // Fallback: just try to play the video
        try {
          await video.play();
        } catch (playError) {
          console.error('Error playing video:', playError);
        }
      }
    };

    const hidePlayButton = (event) => {
      event.target.classList.add('playing');
    };

    const showPlayButton = (event) => {
      event.target.classList.remove('playing');
    };

    // Watch for hawker changes
    watch(() => props.hawker, () => {
      fetchReviews();
    }, { immediate: true, deep: true });

    onMounted(() => {
      fetchReviews();
    });

    return {
      reviews,
      allReviews,
      displayRating,
      totalRatings,
      displayedReviews,
      getStarStyle,
      getRatingCount,
      getRatingPercentage,
      formatDate,
      hasMedia,
      getPhotos,
      getVideos,
      getItemNames,
      setVideoRef,
      playVideoInPictureInPicture,
      hidePlayButton,
      showPlayButton
    };
  }
};
</script>

<style scoped>
@import './ReviewsSection.css';
</style>
