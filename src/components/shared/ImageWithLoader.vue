<template>
  <div class="image-loader-container" :class="containerClass">
    <!-- Loading Spinner -->
    <div v-if="isLoading" class="image-loading-overlay">
      <div class="spinner-border spinner-border-sm text-success" role="status">
        <span class="visually-hidden">Loading image...</span>
      </div>
    </div>
    
    <!-- Actual Image -->
    <img
      :src="src"
      :alt="alt"
      :class="['loaded-image', imageClass, { 'image-hidden': isLoading }]"
      @load="onImageLoad"
      @error="onImageError"
    />
    
    <!-- Error Fallback -->
    <div v-if="hasError" class="image-error-placeholder" :class="placeholderClass">
      <i :class="errorIcon"></i>
      <span v-if="showErrorText" class="error-text">{{ errorText }}</span>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'ImageWithLoader',
  props: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: 'Image'
    },
    imageClass: {
      type: String,
      default: ''
    },
    containerClass: {
      type: String,
      default: ''
    },
    placeholderClass: {
      type: String,
      default: ''
    },
    errorIcon: {
      type: String,
      default: 'fas fa-image'
    },
    errorText: {
      type: String,
      default: 'Failed to load'
    },
    showErrorText: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const isLoading = ref(true);
    const hasError = ref(false);

    const onImageLoad = () => {
      isLoading.value = false;
      hasError.value = false;
      emit('load');
    };

    const onImageError = () => {
      isLoading.value = false;
      hasError.value = true;
      emit('error');
    };

    return {
      isLoading,
      hasError,
      onImageLoad,
      onImageError
    };
  }
};
</script>

<style scoped>
.image-loader-container {
  position: relative;
  display: inline-block;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.image-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(240, 253, 244, 0.9);
  z-index: 2;
}

.loaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.image-hidden {
  opacity: 0;
}

.image-error-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #9ca3af;
  font-size: 1.5rem;
  z-index: 1;
}

.error-text {
  font-size: 0.75rem;
  margin-top: 0.5rem;
  color: #6b7280;
}

/* Dark mode support */
.dark-mode .image-loading-overlay,
.dark-theme .image-loading-overlay {
  background: rgba(15, 23, 42, 0.9);
}

.dark-mode .image-error-placeholder,
.dark-theme .image-error-placeholder {
  background: #1e293b;
  color: #64748b;
}

.dark-mode .error-text,
.dark-theme .error-text {
  color: #94a3b8;
}
</style>
