<template>
  <div class="loading-spinner-container" :class="containerClass">
    <div class="spinner-border text-success" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <p v-if="message" class="loading-message" :class="messageClass">{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: "LoadingSpinner",
  props: {
    message: {
      type: String,
      default: ''
    },
    containerClass: {
      type: String,
      default: ''
    },
    messageClass: {
      type: String,
      default: 'mt-3 mb-0'
    }
  }
}
</script>

<style scoped>
.loading-spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.loading-message {
  color: #6b7280;
  font-size: 0.95rem;
}

/* Dark mode support */
.dark-mode-card .loading-message,
.loading-spinner-container.dark-mode-card .loading-message {
  color: #9ca3af;
}
</style>