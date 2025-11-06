<template>
  <router-link 
    :to="{
      name: 'BuyerViewStall',
      params: { userId: hawker.userId },
      state: { hawker: hawker }
    }"
    class="nav-link" 
    style="text-decoration: none; color: inherit;"
  >
    <div class="card mb-3">
      <!-- Image Carousel Container with Overlay -->
      <div class="image-container">
        <div class="carousel-wrapper">
          <div 
            class="carousel-track"
            :style="{ transform: `translateX(-${currentImageIndex * 100}%)` }"
          >
            <div 
              v-for="(image, index) in stallImages" 
              :key="index"
              class="carousel-slide"
            >
              <ImageWithLoader 
                :src="image" 
                :alt="`${hawker.hawkerName} - Image ${index + 1}`"
                image-class="card-img-top"
              />
            </div>
          </div>
        </div>
        
        <div class="image-overlay">
          <span class="view-menu-badge">View Menu</span>
        </div>
        
        <!-- Carousel Dots -->
        <div v-if="stallImages.length > 1" class="carousel-dots">
          <button
            v-for="(image, index) in stallImages"
            :key="index"
            :class="['dot', { active: currentImageIndex === index }]"
            @click.prevent="goToSlide(index)"
            :aria-label="`Go to image ${index + 1}`"
          ></button>
        </div>
        
        <!-- Status Badge -->
        <StallStatus
          :opening-time="hawker.openingTime"
          :closing-time="hawker.closingTime"
          variant="badge"
        />
      </div>

      <div class="card-body">
        <div class="card-header-section">
          <h3 class="stallName">{{ hawker.hawkerName }}</h3>
          <div class="rating-section" v-if="hawker.rating">
            <span class="star">★</span>
            <span class="rating-text">{{ hawker.rating }}</span>
          </div>
        </div>

        <div class="info-section">
          <div class="info-item">
            <svg class="icon clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" stroke-width="2"/>
              <path d="M12 6v6l4 2" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="info-text">
              <span class="label">Closes at</span>
              <span class="value">{{ hawker.closingTime }}</span>
            </span>
          </div>

          <div class="info-item">
            <svg class="icon pin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke-width="2"/>
              <circle cx="12" cy="10" r="3" stroke-width="2"/>
            </svg>
            <span class="info-text">
              <span class="label">Distance</span>
              <span class="value">{{ hawker.distance }}km away</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script>
import ImageWithLoader from '@/components/shared/ImageWithLoader.vue';
import StallStatus from '@/components/buyer/StallStatus/StallStatus.vue';

export default {
  name: 'ListingCard',
  components: { 
    ImageWithLoader,
    StallStatus
  },
  props: {
    hawker: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      currentImageIndex: 0,
      autoScrollInterval: null
    }
  },
  computed: {
    stallImages() {
      // If hawker has multiple images, use them; otherwise use the single imageUrl
      if (this.hawker.images && Array.isArray(this.hawker.images) && this.hawker.images.length > 0) {
        return this.hawker.images;
      }
      // Fallback to single image
      return [this.hawker.imageUrl];
    }
  },
  mounted() {
    this.startAutoScroll();
  },
  beforeUnmount() {
    this.stopAutoScroll();
  },
  methods: {
    startAutoScroll() {
      if (this.stallImages.length > 1) {
        this.autoScrollInterval = setInterval(() => {
          this.nextSlide();
        }, 3500); // Change image every 3.5 seconds
      }
    },
    stopAutoScroll() {
      if (this.autoScrollInterval) {
        clearInterval(this.autoScrollInterval);
        this.autoScrollInterval = null;
      }
    },
    nextSlide() {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.stallImages.length;
    },
    goToSlide(index) {
      this.currentImageIndex = index;
      // Reset auto-scroll timer when manually changing slides
      this.stopAutoScroll();
      this.startAutoScroll();
    }
  }
}
</script>

<style scoped>
@import './ListingCard.css';

/* Carousel Specific Styles */
.carousel-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.carousel-track {
  display: flex;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
}

.carousel-slide {
  min-width: 100%;
  flex-shrink: 0;
  height: 100%;
}

.carousel-slide :deep(.card-img-top) {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

/* Carousel Dots */
.carousel-dots {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 2;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.dot:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: scale(1.2);
}

.dot.active {
  background: white;
  width: 24px;
  border-radius: 4px;
}

/* Ensure image-container has proper positioning */
.image-container {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
}
</style>