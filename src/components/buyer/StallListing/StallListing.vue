<template>
  <div class="stall-listing">
    <!-- Show loading state while fetching hawker data -->
    <div v-if="loading && !hawker" class="text-center p-5">
      <p>Loading stall information...</p>
    </div>

    <!-- Show error if any -->
    <div v-else-if="errorMsg" class="alert alert-danger">
      {{ errorMsg }}
    </div>

    <!-- Show content only when hawker data is available -->
    <div v-else-if="hawker" class="container reset-style" style="position: relative;">
      <div class="row stall-info">
        <div class="col-md-5">
          <img :src="hawker.imageUrl" :alt="hawker.hawkerName" class="stallImg"/>
        </div>
        <div class="col-md-6">
          <div>
            <div class="stall-header">
            <h1>{{ hawker.hawkerName || 'Stall Name' }}</h1>
          </div>
          <p class="stall-address">
            <i class="fa-solid fa-map-pin pinIcon"></i> {{ hawker.address.formattedAddress || 'Address not available' }}
            <button @click="toggleMap" class="map-toggle-btn">
              <i class="fa-solid fa-map-location-dot"></i> {{ showMap ? 'Hide Map' : 'Show Map' }}
            </button>
          </p>
          
          <!-- Toggleable Embedded Google Maps -->
          <div v-if="showMap" class="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8!2d103.903265!3d1.305055!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMTgnMTguMiJOIDEwM8KwNTQnMTEuNyJF!5e0!3m2!1sen!2ssg!4v1234567890123!5m2!1sen!2ssg"
              width="75%"
              height="150"
              style="border:0;"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
          
          <p class="stall-distance">{{ hawker.distance || '?' }}km away </p>
          <p><i class="fa-solid fa-star starIcon"></i> {{ hawker.rating || 'N/A' }} stars</p>
          </div>
        </div>
      </div>

      <!-- Floating heart button placed at top-right of stall-card -->
      <div class="heart-container-overlay">
        <svg
          @click="toggleLike"
          :class="['heart-icon', { liked: isLiked }]"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>
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
                      <button @click.stop="increment(item)" :disabled="item.count >= item.itemQty">+</button>
                    </div>
                    <div v-else>
                      {{ item.count }}
                    </div>
                  </template>
                </div>
              </div>

              <div class="card-content">
                <div class="d-flex flex-column w-100">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="item-name">{{ item.itemName }}</span>
                    <span class="original-price">${{ item.itemPrice }}</span>
                  </div>
                  <div class="d-flex justify-content-between align-items-center mt-2">
                    <span class="item-stock">Quantity left: <span :class="{ 'low-stock': item.itemQty <= 5 }">{{ item.itemQty }}</span></span>
                    <span class="discounted-price">${{ (item.itemPrice * ((100-item.discount)/100)).toFixed(2) }}</span>
                  </div>
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


<script src="./StallListing.js"></script>

<style>
@import './StallListing.css';
</style>