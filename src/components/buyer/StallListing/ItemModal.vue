<template>
  <transition name="modal-fade">
    <div v-if="visible && item" class="modal-overlay" @click="handleClose">
      <div class="modal-container" @click.stop>
        <button class="modal-close" @click="handleClose">
          <i class="fa-solid fa-xmark"></i>
        </button>
        
        <div class="modal-content-wrapper">
          <!-- Left Side: Image -->
          <div class="modal-image-section">
            <ImageWithLoader 
              :src="item.imageUrl" 
              :alt="item.itemName" 
              image-class="modal-image"
              error-icon="fas fa-utensils"
            />
          </div>

          <!-- Right Side: Info -->
          <div class="modal-info-section">
            <!-- Title and Price -->
            <div class="modal-header">
              <h2 class="modal-title">{{ item.itemName }}</h2>
              
              <div class="modal-price-section">
                <span v-if="isDiscountApplied" class="modal-original-price">
                  ${{ item.itemPrice }}
                </span>
                <span class="modal-current-price">
                  ${{ isDiscountApplied 
                      ? (item.itemPrice * ((100 - item.discount) / 100)).toFixed(2)
                      : item.itemPrice }}
                </span>
                <span v-if="isDiscountApplied" class="discount-badge">
                  -{{ item.discount }}%
                </span>
              </div>
            </div>
            
            <!-- Stock Info -->
            <div class="modal-stock-info">
              <i class="fa-solid fa-box"></i>
              <span :class="{ 'low-stock': item.itemQty <= 5 }">
                {{ item.itemQty }} available
              </span>
            </div>
            
            <!-- Description -->
            <div v-if="item.description" class="modal-description">
              <h3 class="section-title">Description</h3>
              <p>{{ item.description }}</p>
            </div>
            
            <!-- Special Instructions -->
            <div class="modal-notes-section">
              <h3 class="section-title">Special Instructions</h3>
              <textarea 
                id="buyer-notes"
                v-model="buyerNotes"
                class="notes-textarea"
                placeholder="Add any special requests or dietary requirements..."
                rows="3"
                maxlength="200"
              ></textarea>
              <span class="char-count">{{ buyerNotes.length }}/200</span>
            </div>

            <!-- Quantity Controls -->
            <div class="modal-quantity-section">
              <h3 class="section-title">Quantity</h3>
              <div class="quantity-controls">
                <button 
                  class="qty-btn" 
                  @click="decrement"
                  :disabled="modalQuantity <= 0">
                  <i class="fa-solid fa-minus"></i>
                </button>
                <span class="qty-display">{{ modalQuantity }}</span>
                <button 
                  class="qty-btn" 
                  @click="increment"
                  :disabled="modalQuantity >= item.itemQty">
                  <i class="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="modal-actions">
              <button class="btn-cancel" @click="handleClose">Cancel</button>
              <button 
                class="btn-add-to-cart" 
                @click="handleAddToCart"
                :disabled="modalQuantity === 0 || !isStallOpen">
                <i class="fa-solid fa-cart-plus"></i>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, watch } from 'vue';
import ImageWithLoader from '@/components/shared/ImageWithLoader.vue';

export default {
  name: 'ItemModal',
  components: {
    ImageWithLoader
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    item: {
      type: Object,
      default: null
    },
    isDiscountApplied: {
      type: Boolean,
      default: false
    },
    isStallOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'add-to-cart'],
  setup(props, { emit }) {
    const modalQuantity = ref(0);
    const buyerNotes = ref('');

    // Watch for item changes to reset form
    watch(() => props.item, (newItem) => {
      if (newItem) {
        modalQuantity.value = newItem.count || 0;
        buyerNotes.value = newItem.notes || '';
      }
    }, { immediate: true });

    // Watch for visibility changes to manage body scroll
    watch(() => props.visible, (isVisible) => {
      if (isVisible) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    });

    const increment = () => {
      if (props.item && modalQuantity.value < props.item.itemQty) {
        modalQuantity.value++;
      }
    };

    const decrement = () => {
      if (modalQuantity.value > 0) {
        modalQuantity.value--;
      }
    };

    const handleClose = () => {
      emit('close');
    };

    const handleAddToCart = () => {
      if (!props.item || modalQuantity.value === 0) return;
      
      emit('add-to-cart', {
        item: props.item,
        quantity: modalQuantity.value,
        notes: buyerNotes.value
      });
    };

    return {
      modalQuantity,
      buyerNotes,
      increment,
      decrement,
      handleClose,
      handleAddToCart
    };
  }
}
</script>

<style scoped>
@import './ItemModal.css';
</style>
