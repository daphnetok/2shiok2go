<template>
  <Transition name="toast">
    <div v-if="visible" class="toast-notification">
      <div class="toast-content">
        <span class="toast-icon">🎉</span>
        <span class="toast-message">{{ message }}</span>
      </div>
      <button class="toast-close" @click="close">×</button>
    </div>
  </Transition>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'ToastNotification',
  props: {
    message: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      default: 5000
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const visible = ref(true);
    let timeout;

    const close = () => {
      visible.value = false;
      setTimeout(() => emit('close'), 300);
    };

    if (props.duration > 0) {
      timeout = setTimeout(close, props.duration);
    }

    return { visible, close };
  }
};
</script>

<style scoped>
.toast-notification {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 400px;
  z-index: 1000;
  border-left: 4px solid #4CAF50;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.toast-icon {
  font-size: 24px;
}

.toast-message {
  color: #333;
  font-size: 14px;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.toast-close:hover {
  color: #333;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

@media (max-width: 480px) {
  .toast-notification {
    left: 10px;
    right: 10px;
    max-width: calc(100% - 20px);
  }
}
</style>