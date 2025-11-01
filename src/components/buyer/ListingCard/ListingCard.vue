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
        <img :src="hawker.imageUrl" class="card-img-top" :alt="hawker.hawkerName">
        <div class="image-overlay">
          <span class="view-menu-badge">View Menu</span>
        </div>
        <!-- Status Badge -->
        <div class="status-badge" :class="getStatusClass()">
          <span class="status-dot"></span>
          {{ getStatusText() }}
        </div>
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
export default {
  name: 'ListingCard',
  props: {
    hawker: {
      type: Object,
      required: true
    }
  },
  methods: {
    getStatusClass() {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      // Parse opening and closing times
      const [openHour, openMin] = this.hawker.openingTime.split(':').map(Number);
      const [closeHour, closeMin] = this.hawker.closingTime.split(':').map(Number);
      const openingTimeInMinutes = openHour * 60 + openMin;
      const closingTimeInMinutes = closeHour * 60 + closeMin;

      // Handle overnight stalls (e.g., 18:00 to 02:00)
      if (closingTimeInMinutes < openingTimeInMinutes) {
        // Stall operates overnight
        if (currentTime >= openingTimeInMinutes || currentTime < closingTimeInMinutes) {
          // Currently open
          let minutesUntilClose;
          if (currentTime >= openingTimeInMinutes) {
            // Evening: time until midnight + time from midnight to closing
            minutesUntilClose = (24 * 60 - currentTime) + closingTimeInMinutes;
          } else {
            // Morning: time until closing
            minutesUntilClose = closingTimeInMinutes - currentTime;
          }
          
          if (minutesUntilClose <= 30) {
            return 'closing-soon';
          }
          return 'open';
        } else {
          // Currently closed
          const minutesUntilOpen = openingTimeInMinutes - currentTime;
          if (minutesUntilOpen <= 30) {
            return 'opening-soon';
          }
          return 'closed';
        }
      } else {
        // Normal operating hours (e.g., 09:00 to 21:00)
        if (currentTime >= openingTimeInMinutes && currentTime < closingTimeInMinutes) {
          // Currently open
          const minutesUntilClose = closingTimeInMinutes - currentTime;
          if (minutesUntilClose <= 30) {
            return 'closing-soon';
          }
          return 'open';
        } else if (currentTime < openingTimeInMinutes) {
          // Before opening
          const minutesUntilOpen = openingTimeInMinutes - currentTime;
          if (minutesUntilOpen <= 30) {
            return 'opening-soon';
          }
          return 'closed';
        } else {
          // After closing
          return 'closed';
        }
      }
    },
    getStatusText() {
      const status = this.getStatusClass();
      if (status === 'closed') return 'Closed';
      if (status === 'closing-soon') return 'Closing Soon';
      if (status === 'opening-soon') return 'Opening Soon';
      return 'Open Now';
    }
  }
}
</script>

<style>
  @import './ListingCard.css';  
</style>