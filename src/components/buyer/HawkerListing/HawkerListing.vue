<template>
  <div class="container">
    <div class="row">
      <div class="col-4">
        <img src="../../../assets/img/stall.jpg" alt="" class="stallImg"/>
      </div>
      <div class="col-8">
        <div style="display: flex; align-items: center; gap: 10px;">
          <h2 style="margin: 0;">{{ hawkerName }}</h2>
          <!-- heart -->
          <div class="flex justify-center items-center min-h-screen bg-gray-100">
            <div
              :class="heartClass"
              class="text-6xl cursor-pointer transition-colors duration-300"
              @click="toggleHeart"
            >
              &#9825;
            </div>
          </div>

        </div>
        <p><i class="fa-solid fa-map-pin pinIcon"></i> Lau Pa Sat, 18 Raffles Quay, #01-10, Singapore 048582</p>
        <button>Open in Maps <i class="fa-solid fa-map-location-dot"></i></button>
        <p>0.6km away</p>
        <p><i class="fa-solid fa-star starIcon"></i>4.4 stars</p>
      </div>
    </div>
    
    <div class="row" style="margin-top: 30px;">
      <h4>Available Listings</h4>
      <div class="row">
        <div v-for="item in foodItems" :key="item.itemName" class="col-4" style="border: 1px solid #eee; border-radius: 10px; padding: 15px; min-width: 180px; background: #fafafa;">
          <div>
            <img :src="item.image" alt="food" style="object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
            <div><strong>{{ item.itemName }}</strong></div>
            <div>Price: {{ item.price }}</div>
            <div>Quantity left: <span :style="{color: item.stock == '0' ? 'red' : 'inherit'}">{{ item.stock }}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  data() {
    return {
      isHeartRed: false, // Track if the heart is red
    };
  },
  computed: {
    heartClass() {
      return this.isHeartRed ? 'text-red-500' : 'text-gray-500'; // Dynamically apply color
    },
  },
  methods: {
    toggleHeart() {
      this.isHeartRed = !this.isHeartRed; // Toggle the color state
    },
  },
};
</script>

<style>
  @import './StallListing.css';
  
</style>