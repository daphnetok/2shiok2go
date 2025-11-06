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
      <!-- Image Container with Overlay -->
      <div class="image-container">
        <ImageWithLoader 
          :src="hawker.imageUrl" 
          :alt="hawker.hawkerName"
          image-class="card-img-top"
        />
        <div class="image-overlay">
          <span class="view-menu-badge">View Menu</span>
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
  }
}
</script>

<style>
  @import './ListingCard.css';  
</style>