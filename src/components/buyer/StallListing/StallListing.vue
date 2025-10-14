<template>
  <div class="stall-card card p-4 mb-4">
    <!-- Show loading state while fetching hawker data -->
    <div v-if="loading && !hawker" class="text-center p-5">
      <p>Loading stall information...</p>
    </div>

    <!-- Show error if any -->
    <div v-else-if="errorMsg" class="alert alert-danger">
      {{ errorMsg }}
    </div>

    <!-- Show content only when hawker data is available -->
    <div v-else-if="hawker" class="container reset-style">
      <div class="row stall-info">
        <div class="col-md-5">
          <img :src="hawker.imageUrl" :alt="hawker.hawkerName" class="stallImg"/>
        </div>
        <div class="col-md-6">
          <div class="stall-header">
            <h1>{{ hawker.hawkerName || 'Stall Name' }}</h1>
          </div>
          <p class="stall-address">
            <i class="fa-solid fa-map-pin pinIcon"></i> {{ hawker.address || 'Address not available' }}
          </p>
          <button class="map-btn">Open in Maps <i class="fa-solid fa-map-location-dot"></i></button>
          <p class="stall-distance">{{ hawker.distance || '?' }}km away </p>
          <p><i class="fa-solid fa-star starIcon"></i> {{ hawker.rating || 'N/A' }} stars</p>
        </div>
        <div class="col-md-1">
          <button @click="toggleSave" class="heart-btn">
              <i :class="[saved ? saveIcons.heartFilled : saveIcons.heart]"></i>
          </button>
        </div>
      </div>

      <div class="row mt-4">
        <h4>Available Listings</h4>
        
        <div v-if="loading">Loading available listings...</div>
        
        <div v-else-if="foodItems.length === 0">No food listings available for this stall.</div>

        <div v-else class="row">
          <div v-for="item in foodItems" :key="item.id" class="col-md-4">
            <div class="listing-card">
              <div class="img-container">
                <img class="foodImg" :src="item.imageUrl" :alt="item.itemName"/>
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
                      {{ item.count }}
                    </div>
                  </template>
                </div>
              </div>

              <div class="card-content">
                <div class="d-none d-lg-flex flex-column w-100">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="item-name">{{ item.itemName }}</span>
                    <span class="original-price">${{ item.itemPrice }}</span>
                  </div>
                  <div class="d-flex justify-content-between align-items-center mt-2">
                    <span class="item-stock">Quantity left: <span :class="{ 'low-stock': item.itemQty <= 5 }">{{ item.itemQty }}</span></span>
                    <span class="discounted-price">{{ item.discountedPrice }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./StallListing.js">
export default {
  name: 'StallListing'
}
</script>

<style>
  @import './StallListing.css';
</style>