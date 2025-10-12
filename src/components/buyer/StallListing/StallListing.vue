<template>
  <div class="stall-card card p-4 mb-4">
    <!-- Top Stall Info -->
    <div class="container reset-style">
      <div class="row stall-info">
        <div class="col-md-5">
          <img src="../../../assets/img/stall.jpg" alt="" class="stallImg"/>
        </div>
        <div class="col-md-6">
          <div class="stall-header">
            <h1>Maxwell Hainanese Chicken Rice</h1>
          </div>
          <p class="stall-address">
            <i class="fa-solid fa-map-pin pinIcon"></i> Lau Pa Sat, 18 Raffles Quay, #01-10, Singapore 048582
          </p>
          <button class="map-btn">Open in Maps <i class="fa-solid fa-map-location-dot"></i></button>
          <p class="stall-distance">0.6km away </p>
          <p><i class="fa-solid fa-star starIcon"></i> 4.4 stars</p>
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
      <div class="row">
        <div v-for="item in foodItems" :key="item.itemName" class="col-md-4">
          <div class="listing-card">
            <div class="img-container">
              <img class="foodImg" :src="item.image" :alt="item.itemName"/>
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
                    {{ item.count }}
                    <button @click.stop="increment(item)">+</button>
                  </div>
                  <div v-else>
                    <!-- Adjusted layout to show quantity and plus sign as plain text -->
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
                  <span class="item-stock">Quantity left: <span :class="{ 'low-stock': item.stock <= 5 }">{{ item.stock }}</span></span>
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
                <div class="item-stock">Quantity left: <span :class="{ 'low-stock': item.stock <= 5 }">{{ item.stock }}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Listings",
  data() {
    return {
      saved: false, // Start with false for the heart icon
      foodItems: [
        { itemName: "Chicken Rice", price: "3.00", stock: "5", image: "../img/chicken_rice.jpg", count: 0, hover: false },
        { itemName: "Roti Prata", price: "1.00", stock: "10", image: "../img/chicken_rice.jpg", count: 0, hover: false },
        { itemName: "Prawn Noodles", price: "4.00", stock: "2", image: "../img/chicken_rice.jpg", count: 0, hover: false },
        { itemName: "Laksa", price: "3.50", stock: "0", image: "../img/chicken_rice.jpg", count: 0, hover: false },
        { itemName: "Nasi Lemak", price: "3.00", stock: "7", image: "../img/chicken_rice.jpg", count: 0, hover: false },
        { itemName: "Mee Rebus", price: "3.00", stock: "4", image: "../img/chicken_rice.jpg", count: 0, hover: false },
        { itemName: "Hainanese Chicken Chop", price: "5.00", stock: "3", image: "../img/chicken_rice.jpg", count: 0, hover: false },
        { itemName: "Fried Kway Teow", price: "3.00", stock: "6", image: "../img/chicken_rice.jpg", count: 0, hover: false },
        { itemName: "Char Siew Rice", price: "3.50", stock: "8", image: "../img/chicken_rice.jpg", count: 0, hover: false }
      ],
      saveIcons: {
        heart: 'fa-regular fa-heart saveIcon',
        heartFilled: 'fa-solid fa-heart savedIcon'
      }
    };
  },
  methods: {
    toggleSave() {
      this.saved = !this.saved; // Toggle heart icon color
      console.log("Saved:", this.saved); // Debugging the heart state
    },
    increment(item) {
      item.count++;
    },
    decrement(item) {
      if (item.count > 0) item.count--;
    }
  }
}
</script>

<style>
  @import './StallListing.css';
</style>
