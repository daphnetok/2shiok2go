<template>
  <div :class="['stall-status', variant, statusClass]">
    <span v-if="showDot" class="status-dot"></span>
    <i v-if="showIcon && variant === 'inline'" class="fa-solid fa-clock"></i>
    <span>{{ statusText }}</span>
    <span v-if="showHours && openingTime && closingTime" class="opening-hours">
      ({{ openingTime }} - {{ closingTime }})
    </span>
  </div>
</template>

<script>
export default {
  name: 'StallStatus',
  props: {
    openingTime: {
      type: String,
      default: null
    },
    closingTime: {
      type: String,
      default: null
    },
    variant: {
      type: String,
      default: 'badge', // 'badge' or 'inline'
      validator: (value) => ['badge', 'inline'].includes(value)
    },
    showDot: {
      type: Boolean,
      default: true
    },
    showIcon: {
      type: Boolean,
      default: false
    },
    showHours: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    statusClass() {
      if (!this.openingTime || !this.closingTime) return 'unknown';
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      // Parse opening and closing times
      const [openHour, openMin] = this.openingTime.split(':').map(Number);
      const [closeHour, closeMin] = this.closingTime.split(':').map(Number);
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
          if (minutesUntilOpen <= 30 && minutesUntilOpen > 0) {
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
    statusText() {
      const status = this.statusClass;
      if (status === 'closed') return 'Closed';
      if (status === 'closing-soon') return 'Closing Soon';
      if (status === 'opening-soon') return 'Opening Soon';
      if (status === 'open') return 'Open Now';
      return 'Unknown';
    }
  }
}
</script>

<style scoped>
@import './StallStatus.css';
</style>
