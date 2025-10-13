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
                     :class="{ 'square': item.count > 0 }"
                     @mouseenter="item.hover = true"
                     @mouseleave="item.hover = false"
                     @click.stop="increment(item)">
                  <template v-if="item.count === 0">+</template>
                  <template v-else>
                    <div v-if="item.hover" class="hover-controls">
                      <button @click.stop="decrement(item)">-</button>
                      {{ item.quantity }}
                      <button @click.stop="increment(item)">+</button>
                    </div>
                    <div v-else>
                      {{ item.quantity }}
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
                  <div class="item-name mb-1">{{ item.quantity }}</div>
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
  </div>
</template>

<script>
import { getHawkerByName } from '/firebase/firestore'; // Import the service function
export default {
  name: "StallListing",
  data() {
    return {
      saved: false, // Start with false for the heart icon
      hawkerName: this.$route.params.hawkerName, // Retrieve hawkerName from the URL params
      hawker: null,
      saveIcons: {
        heart: 'fa-regular fa-heart saveIcon',
        heartFilled: 'fa-solid fa-heart savedIcon'
      }
    };
  },
  async created() {
    this.hawker = await getHawkerByName(this.hawkerName);
  },
  
  

  methods: {
    toggleSave() {
      this.saved = !this.saved;
      console.log("Saved:", this.saved);
    },
    increment(item) {
      item.count++;
    },
    decrement(item) {
      if (item.count > 0) item.count--;
    }
  }
};
</script>

<style>
  @import './StallListing.css';
</style>
