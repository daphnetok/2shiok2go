<template>
  <transition name="fade-slide">
    <router-link 
      v-if="showButton" 
      to="/cart" 
      class="floating-cart-button"
      :class="{ 'has-items': cartCount > 0 }"
    >
      <div class="cart-icon-wrapper">
        <i class="fa-solid fa-cart-shopping"></i>
        <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
      </div>
      <span class="cart-text">Go to Cart</span>
    </router-link>
  </transition>
</template>

<script>
import { computed } from 'vue';
import { useCart } from '@/assets/composables/useCart';

export default {
  name: 'FloatingCartButton',
  props: {
    showButton: {
      type: Boolean,
      default: true
    }
  },
  setup() {
    const { cartCount } = useCart();

    return {
      cartCount
    };
  }
};
</script>

<style scoped>
.floating-cart-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-radius: 50px;
  text-decoration: none;
  box-shadow: 0 6px 24px rgba(16, 185, 129, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
}

.floating-cart-button:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.5);
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
}

.floating-cart-button:active {
  transform: translateY(-2px) scale(1.02);
}

.floating-cart-button.has-items {
  animation: pulse-glow 2s ease-in-out infinite;
}

.cart-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.cart-text {
  white-space: nowrap;
}

/* Animations */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 6px 24px rgba(16, 185, 129, 0.4);
  }
  50% {
    box-shadow: 0 6px 32px rgba(16, 185, 129, 0.6), 0 0 20px rgba(16, 185, 129, 0.3);
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .floating-cart-button {
    bottom: 20px;
    right: 20px;
    padding: 14px 20px;
    font-size: 0.95rem;
  }

  .cart-icon-wrapper {
    font-size: 1.15rem;
  }

  .cart-text {
    display: none;
  }

  .floating-cart-button {
    border-radius: 50%;
    width: 56px;
    height: 56px;
    padding: 0;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .floating-cart-button {
    bottom: 16px;
    right: 16px;
    width: 52px;
    height: 52px;
  }

  .cart-badge {
    width: 18px;
    height: 18px;
    font-size: 0.65rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .floating-cart-button {
    box-shadow: 0 6px 24px rgba(16, 185, 129, 0.3);
  }

  .floating-cart-button:hover {
    box-shadow: 0 8px 32px rgba(16, 185, 129, 0.4);
  }
}
</style>
