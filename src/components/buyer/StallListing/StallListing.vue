<template>
  <div class="stall-card card p-4 mb-4">
    <div v-if="!hawker">
      <div class="text-center p-5">Loading stall information...</div>
    </div>
    <div v-else>
      <!-- Top Stall Info -->
      <div class="container reset-style">
        <div class="row stall-info">
          <div class="col-md-5">
            <img :src="hawker.imageUrl || require('../../../assets/img/stall.jpg')" alt="" class="stallImg"/>
          </div>
          <div class="col-md-6">
            <div class="stall-header">
              <h1>{{ hawker.hawkerName }}</h1>
            </div>
            <p class="stall-address">
              <i class="fa-solid fa-map-pin pinIcon"></i> {{'Lau Pa Sat, 18 Raffles Quay, #01-10, Singapore 048582' }}
            </p>
            <button class="map-btn">Open in Maps <i class="fa-solid fa-map-location-dot"></i></button>
            <p class="stall-distance">{{ hawker.distance || '0.6km' }} away</p>
            <p><i class="fa-solid fa-star starIcon"></i> {{ hawker.rating || '4.4' }} stars</p>
          </div>
          <div class="col-md-1">
            <button @click="toggleSave" class="heart-btn">
                <i :class="[saved ? saveIcons.heartFilled : saveIcons.heart]"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Food Listings -->
      <div class="row mt-4">
        <h4>Available Listings</h4>
        <div v-if="!hawker.itemsListing || hawker.itemsListing.length === 0" class="text-center p-4 text-muted">
          <p>No items available at the moment</p>
        </div>
        <div v-else class="row">
          <div v-for="item in hawker.itemsListing" :key="item.itemName" class="col-md-4">
            <div class="listing-card">
              <div class="img-container">
                <img class="foodImg" :src="item.image || require('../../../assets/img/stall.jpg')" :alt="item.itemName"/>
                <!-- Floating Counter / Add Button -->
                <div class="counter-btn"
                     :class="{ 'square': item.count > 0, 'adding': item.isAdding }"
                     @mouseenter="item.hover = true"
                     @mouseleave="item.hover = false"
                     @click.stop="increment(item)">
                  <template v-if="item.count === 0">+</template>
                  <template v-else>
                    <div v-if="item.hover" class="hover-controls">
                      <button @click.stop="decrement(item)" class="control-btn minus-btn">-</button>
                      <span class="count-display">{{ item.count }}</span>
                      <button @click.stop="increment(item)" class="control-btn plus-btn">+</button>
                    </div>
                    <div v-else class="count-only">
                      {{ item.count }}
                    </div>
                  </template>
                </div>
              </div>

              <div class="card-content">
                <!-- Desktop/Large screens -->
                <div class="d-none d-lg-flex flex-column w-100">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="item-name">{{ item.itemName }}</span>
                    <span class="original-price">${{ item.price }}</span>
                  </div>
                  <div class="d-flex justify-content-between align-items-center mt-2">
                    <span class="item-stock">Quantity left: <span :class="{ 'low-stock': item.quantity <= 5 }">{{ item.quantity }}</span></span>
                    <span class="discounted-price">${{ (parseFloat(item.price) * 0.8).toFixed(2) }}</span>
                  </div>
                </div>
                <!-- Mobile/Small screens -->
                <div class="d-lg-none w-100">
                  <div class="item-name mb-1">{{ item.itemName }}</div>
                  <div class="d-flex align-items-center mb-1">
                    <span class="original-price">${{ item.price }}</span>
                    <span class="discounted-price ms-2">${{ (parseFloat(item.price) * 0.8).toFixed(2) }}</span>
                  </div>
                  <div class="item-stock">Quantity left: <span :class="{ 'low-stock': item.quantity <= 5 }">{{ item.quantity }}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <transition name="slide-up">
      <div v-if="showToast" class="toast-notification">
        <i class="fa-solid fa-check-circle"></i>
        <span>Added to cart!</span>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getHawkerByName } from '/firebase/firestore';
import { useCart } from '@/composables/useCart';

export default {
  name: "StallListing",
  setup() {
    const route = useRoute();
    const { addToCart, updateItemCount } = useCart();
    
    const saved = ref(false);
    const hawkerName = ref(route.params.hawkerName);
    const hawker = ref(null);
    const showToast = ref(false);
    const saveIcons = {
      heart: 'fa-regular fa-heart saveIcon',
      heartFilled: 'fa-solid fa-heart savedIcon'
    };

    onMounted(async () => {
      hawker.value = await getHawkerByName(hawkerName.value);
      
      // Initialize count and hover properties for each item
      if (hawker.value && hawker.value.itemsListing) {
        hawker.value.itemsListing.forEach(item => {
          item.count = 0;
          item.hover = false;
          item.isAdding = false;
        });
      }
    });

    const toggleSave = () => {
      saved.value = !saved.value;
      console.log("Saved:", saved.value);
    };

    const increment = (item) => {
      if (item.count < item.quantity) {
        item.count++;
        item.isAdding = true;
        
        // Update cart
        addToCart({
          itemName: item.itemName,
          hawkerName: hawker.value.hawkerName,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          count: item.count
        });
        
        // Show toast
        showToast.value = true;
        setTimeout(() => {
          showToast.value = false;
        }, 2000);
        
        // Remove animation class
        setTimeout(() => {
          item.isAdding = false;
        }, 300);
      }
    };

    const decrement = (item) => {
      if (item.count > 0) {
        item.count--;
        
        // Update cart
        if (item.count === 0) {
          updateItemCount({
            itemName: item.itemName,
            hawkerName: hawker.value.hawkerName,
            count: 0
          });
        } else {
          addToCart({
            itemName: item.itemName,
            hawkerName: hawker.value.hawkerName,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
            count: item.count
          });
        }
      }
    };

    return {
      saved,
      hawkerName,
      hawker,
      showToast,
      saveIcons,
      toggleSave,
      increment,
      decrement
    };
  }
};
</script>

<style scoped>
@import './StallListing.css';

/* Enhanced Counter Button Styles */
.counter-btn {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.counter-btn.adding {
  animation: pop 0.3s ease;
}

@keyframes pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.hover-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
  animation: expandControls 0.3s ease;
}

@keyframes expandControls {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.control-btn {
  background: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.control-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.minus-btn {
  color: #ff4444;
}

.minus-btn:hover {
  background: #fff0f0;
}

.plus-btn {
  color: #44b544;
}

.plus-btn:hover {
  background: #f0fff0;
}

.count-display {
  font-weight: 600;
  color: white;
  min-width: 20px;
  text-align: center;
}

.count-only {
  font-weight: 600;
  color: white;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: linear-gradient(135deg, #44b544, #3a9d3a);
  color: white;
  padding: 16px 24px;
  border-radius: 50px;
  box-shadow: 0 8px 24px rgba(68, 181, 68, 0.4);
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  z-index: 1000;
}

.toast-notification i {
  font-size: 20px;
  animation: checkPop 0.5s ease;
}

@keyframes checkPop {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
}

/* Toast transition */
.slide-up-enter-active {
  animation: slideUpBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.slide-up-leave-active {
  animation: slideDown 0.3s ease;
}

@keyframes slideUpBounce {
  0% {
    transform: translateY(100px);
    opacity: 0;
  }
  60% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100px);
    opacity: 0;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .toast-notification {
    bottom: 20px;
    right: 20px;
    left: 20px;
    justify-content: center;
  }
}
</style>