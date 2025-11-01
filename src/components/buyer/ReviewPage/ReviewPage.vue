<template>
  <div class="review-page">
    <div class="container">
      <!-- Header Section -->
      <div class="page-header">
        <h1 class="page-title">
          <i class="fa-solid fa-star"></i>
          Customer Reviews
        </h1>
        <p class="page-subtitle">Share your experience and help others discover great food</p>
      </div>

      <!-- Review Form Section -->
      <div class="review-form-section">
        <h2 class="section-title">Write a Review</h2>
        <form @submit.prevent="submitReview" class="review-form">
          <!-- Order Selection -->
          <div class="form-group">
            <label for="order-select" class="form-label">Select Order to Review</label>
            <select id="order-select" v-model="selectedOrder" class="form-select" required>
              <option value="">Choose an order...</option>
              <option v-for="order in recentOrders" :key="order.id" :value="order.id">
                {{ order.hawkerName }} - {{ order.date }} ({{ order.items.length }} items)
              </option>
            </select>
          </div>

          <!-- Rating Section -->
          <div class="form-group">
            <label class="form-label">Overall Rating</label>
            <div class="rating-container">
              <div class="star-rating">
                <i 
                  v-for="star in 5" 
                  :key="star" 
                  :class="['fa-star', star <= rating ? 'fas' : 'far']"
                  @click="setRating(star)"
                  class="star"
                ></i>
              </div>
              <span class="rating-text">{{ ratingText }}</span>
            </div>
          </div>

          <!-- Food Quality Rating -->
          <div class="form-group">
            <label class="form-label">Food Quality</label>
            <div class="rating-container">
              <div class="star-rating">
                <i 
                  v-for="star in 5" 
                  :key="star" 
                  :class="['fa-star', star <= foodQuality ? 'fas' : 'far']"
                  @click="setFoodQuality(star)"
                  class="star"
                ></i>
              </div>
              <span class="rating-text">{{ foodQualityText }}</span>
            </div>
          </div>

          <!-- Service Rating -->
          <div class="form-group">
            <label class="form-label">Service</label>
            <div class="rating-container">
              <div class="star-rating">
                <i 
                  v-for="star in 5" 
                  :key="star" 
                  :class="['fa-star', star <= service ? 'fas' : 'far']"
                  @click="setService(star)"
                  class="star"
                ></i>
              </div>
              <span class="rating-text">{{ serviceText }}</span>
            </div>
          </div>

          <!-- Value Rating -->
          <div class="form-group">
            <label class="form-label">Value for Money</label>
            <div class="rating-container">
              <div class="star-rating">
                <i 
                  v-for="star in 5" 
                  :key="star" 
                  :class="['fa-star', star <= value ? 'fas' : 'far']"
                  @click="setValue(star)"
                  class="star"
                ></i>
              </div>
              <span class="rating-text">{{ valueText }}</span>
            </div>
          </div>

          <!-- Review Text -->
          <div class="form-group">
            <label for="review-text" class="form-label">Your Review</label>
            <textarea 
              id="review-text"
              v-model="reviewText" 
              class="form-textarea" 
              placeholder="Tell us about your experience..."
              rows="4"
              required
            ></textarea>
          </div>

          <!-- Photo Upload -->
          <div class="form-group">
            <label for="review-photos" class="form-label">Photos (Optional)</label>
            <input 
              type="file" 
              id="review-photos"
              @change="handlePhotoUpload"
              multiple 
              accept="image/*"
              class="form-file"
            />
            <div v-if="uploadedPhotos.length > 0" class="photo-preview">
              <div v-for="(photo, index) in uploadedPhotos" :key="index" class="photo-item">
                <img :src="photo.url" :alt="`Review photo ${index + 1}`" />
                <button @click="removePhoto(index)" class="remove-photo-btn">
                  <i class="fa-solid fa-times"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              <i class="fa-solid fa-paper-plane"></i>
              {{ isSubmitting ? 'Submitting...' : 'Submit Review' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Recent Reviews Section -->
      <div class="reviews-section">
        <h2 class="section-title">Recent Reviews</h2>
        <div v-if="recentReviews.length === 0" class="no-reviews">
          <i class="fa-solid fa-comment-slash"></i>
          <p>No reviews yet. Be the first to share your experience!</p>
        </div>
        <div v-else class="reviews-grid">
          <div v-for="review in recentReviews" :key="review.id" class="review-card">
            <div class="review-header">
              <div class="reviewer-info">
                <div class="reviewer-avatar">
                  <i class="fa-solid fa-user"></i>
                </div>
                <div class="reviewer-details">
                  <h4 class="reviewer-name">{{ review.reviewerName }}</h4>
                  <p class="review-date">{{ formatDate(review.date) }}</p>
                </div>
              </div>
              <div class="review-rating">
                <div class="star-rating-display">
                  <i 
                    v-for="star in 5" 
                    :key="star" 
                    :class="['fa-star', star <= review.rating ? 'fas' : 'far']"
                  ></i>
                </div>
              </div>
            </div>
            
            <div class="review-content">
              <h5 class="review-hawker">{{ review.hawkerName }}</h5>
              <p class="review-text">{{ review.text }}</p>
              
              <!-- Detailed Ratings -->
              <div class="detailed-ratings">
                <div class="rating-item">
                  <span class="rating-label">Food Quality:</span>
                  <div class="mini-stars">
                    <i 
                      v-for="star in 5" 
                      :key="star" 
                      :class="['fa-star', star <= review.foodQuality ? 'fas' : 'far']"
                    ></i>
                  </div>
                </div>
                <div class="rating-item">
                  <span class="rating-label">Service:</span>
                  <div class="mini-stars">
                    <i 
                      v-for="star in 5" 
                      :key="star" 
                      :class="['fa-star', star <= review.service ? 'fas' : 'far']"
                    ></i>
                  </div>
                </div>
                <div class="rating-item">
                  <span class="rating-label">Value:</span>
                  <div class="mini-stars">
                    <i 
                      v-for="star in 5" 
                      :key="star" 
                      :class="['fa-star', star <= review.value ? 'fas' : 'far']"
                    ></i>
                  </div>
                </div>
              </div>

              <!-- Review Photos -->
              <div v-if="review.photos && review.photos.length > 0" class="review-photos">
                <img 
                  v-for="(photo, index) in review.photos" 
                  :key="index"
                  :src="photo" 
                  :alt="`Review photo ${index + 1}`"
                  @click="openPhotoModal(photo)"
                  class="review-photo"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Photo Modal -->
    <div v-if="selectedPhoto" class="photo-modal" @click="closePhotoModal">
      <div class="modal-content" @click.stop>
        <button @click="closePhotoModal" class="close-modal-btn">
          <i class="fa-solid fa-times"></i>
        </button>
        <img :src="selectedPhoto" alt="Review photo" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useReviewPage } from './ReviewPage.js';

export default {
  name: 'ReviewPage',
  setup() {
    const {
      // Form data
      selectedOrder,
      rating,
      foodQuality,
      service,
      value,
      reviewText,
      uploadedPhotos,
      isSubmitting,
      
      // Data
      recentOrders,
      recentReviews,
      
      // Methods
      setRating,
      setFoodQuality,
      setService,
      setValue,
      handlePhotoUpload,
      removePhoto,
      submitReview,
      formatDate,
      openPhotoModal,
      closePhotoModal,
      selectedPhoto
    } = useReviewPage();

    // Computed properties for rating text
    const ratingText = computed(() => {
      const texts = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
      return texts[rating.value];
    });

    const foodQualityText = computed(() => {
      const texts = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
      return texts[foodQuality.value];
    });

    const serviceText = computed(() => {
      const texts = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
      return texts[service.value];
    });

    const valueText = computed(() => {
      const texts = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
      return texts[value.value];
    });

    return {
      // Form data
      selectedOrder,
      rating,
      foodQuality,
      service,
      value,
      reviewText,
      uploadedPhotos,
      isSubmitting,
      
      // Data
      recentOrders,
      recentReviews,
      
      // Methods
      setRating,
      setFoodQuality,
      setService,
      setValue,
      handlePhotoUpload,
      removePhoto,
      submitReview,
      formatDate,
      openPhotoModal,
      closePhotoModal,
      selectedPhoto,
      
      // Computed
      ratingText,
      foodQualityText,
      serviceText,
      valueText
    };
  }
};
</script>

<style scoped>
@import './ReviewPage.css';
</style>
