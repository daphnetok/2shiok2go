<template>
  <div class="stall-listing">
    <!-- Show loading state while fetching hawker data -->
    <LoadingSpinner v-if="loading && !hawker" message="Loading stall information..." container-class="text-center p-5" />

    <!-- Show error if any -->
    <div v-else-if="errorMsg" class="alert alert-danger">
      {{ errorMsg }}
    </div>

    <!-- Show content only when hawker data is available -->
    <div v-else-if="hawker" class="container reset-style" style="position: relative;">
      <div class="row stall-info">
        <div class="col-md-6 col-12">
          <ImageWithLoader 
            :src="hawker.imageUrl" 
            :alt="hawker.hawkerName" 
            image-class="stallImg"
          />
        </div>
        <div class="col-md-6 col-12 ">
          <div class="stall-info-wrapper">
            <div class="stall-info-div">
              <StallStatus
                :opening-time="hawker.openingTime"
                :closing-time="hawker.closingTime"
                variant="inline"
                :show-icon="true"
                :show-hours="true"
              />
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
                v-if="hawker.address && hawker.address.latitude && hawker.address.longitude"
                :src="`https://www.google.com/maps?q=${hawker.address.latitude},${hawker.address.longitude}&hl=en&z=14&output=embed`"
                width="100%"
                height="200"
                style="border:0; pointer-events: auto;"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade">
              </iframe>
              <div v-else class="map-placeholder" style="width:100%; height:200px; background:#f0f0f0; display:flex; align-items:center; justify-content:center; border-radius:8px;">
                <p class="text-muted mb-0">Map unavailable</p>
              </div>
            </div>
            
            <p class="stall-distance">{{ hawker.distance || '?' }}km away </p>
            <!-- Stall Status -->
            <p><i class="fa-solid fa-star starIcon"></i> 
              <span v-if="hawker.reviews && hawker.reviews.stallRating !== undefined && hawker.reviews.stallRating !== null">
                {{ hawker.reviews.stallRating.toFixed(2) }} stars
              </span>
              <span v-else>No rating yet</span>
            </p>
            </div>
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
        <div class="d-flex justify-content-between align-items-center w-100 mb-3">
          <h4 class="mb-0">Available Listings</h4>
          <div class="small-search-container">
            <div class="small-search-box">
              <i class="fa-solid fa-search small-search-icon"></i>
              <input 
                type="text" 
                placeholder="Search for food items" 
                class="small-search-input" 
                v-model="localSearchQuery"
                @input="handleSearch"
              />
              <button 
                v-if="localSearchQuery" 
                @click="clearSearch" 
                class="small-clear-search-btn"
                type="button"
                aria-label="Clear search"
              >
                <i class="fa-solid fa-times"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="loading">Loading available listings...</div>
        
        <div v-else-if="filteredFoodItems.length === 0">
          <div v-if="searchQuery">No food items found matching "{{ searchQuery }}"</div>
          <div v-else>No food listings available for this stall.</div>
        </div>

        <div v-else class="row">
          <div v-for="item in filteredFoodItems" :key="item.id" class="col-md-4 col-sm-6 col-12 ">
            <ItemCard
              :item="item"
              :is-stall-open="isStallOpen()"
              @increment="increment"
              @decrement="decrement"
              @open-modal="openItemModal"
            />
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <ReviewsSection v-if="hawker" :hawker="hawker" />
    </div>

    <!-- Item Details Modal -->
    <ItemModal
      :visible="showModal"
      :item="selectedItem"
      :is-discount-applied="selectedItem ? isDiscountApplied(selectedItem) : false"
      :is-stall-open="isStallOpen()"
      @close="closeModal"
      @add-to-cart="handleAddToCart"
    />

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