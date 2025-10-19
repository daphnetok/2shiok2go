<template>
  <div class="stall-card card p-4 mb-4">
    <div v-if="!hawker">
      <div class="text-center p-5">Loading stall information...</div>
    </div>
    <div v-else>
      <!-- Top Stall Info -->
      <div class="container reset-style">
        <div class="row stall-info">
          <div class="col-md-5 stall-img" >
            <img :src="hawker.imageUrl || require('../../../assets/img/stall.jpg')" alt="" class="stallImg"/>
          </div>
          <div class="col-md-6">
            <div class="stall-header">
              <div class="stall-title">
                <h1>{{ hawker.hawkerName }}</h1>
              </div>
            </div>
            <p class="stall-address">
              <i class="fa-solid fa-map-pin pinIcon"></i> {{'Lau Pa Sat, 18 Raffles Quay, #01-10, Singapore 048582' }}
            </p>
            <button class="map-btn">Open in Maps <i class="fa-solid fa-map-location-dot"></i></button>
            <p class="stall-distance">{{ hawker.distance}}km away</p>
            <p><i class="fa-solid fa-star starIcon"></i> {{ hawker.rating }} stars</p>
          </div>
          <div class="col-md-1">
            <!-- <button @click="toggleSave" class="heart-btn">
                <i :class="[saved ? saveIcons.heartFilled : saveIcons.heart]"></i>
            </button> -->

            <div class="heart-container">
              <svg
                @click="toggleLike"
                :class="{ liked: isLiked }"
                class="heart-icon"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
            </div>

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
                <img class="foodImg" :src="item.imageUrl || require('../../../assets/img/stall.jpg')" :alt="item.itemName"/>
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
      hawkerName,
      hawker,
      showToast,
      saveIcons,
      toggleSave,
      increment,
      decrement
    };
  },
  data() {
    return {
      isLiked: false
    };
  },
  methods: {
    toggleLike() {
      this.isLiked = !this.isLiked;
    }
  }
};
</script>

<style>
@import './StallListing.css';
</style>