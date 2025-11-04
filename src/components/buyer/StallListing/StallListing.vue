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
        <div class="col-md-5">
          <ImageWithLoader 
            :src="hawker.imageUrl" 
            :alt="hawker.hawkerName" 
            image-class="stallImg"
          />
        </div>
        <div class="col-md-6 col-12">
          <div>
            <p class="stall-status" :class="{ 'closed': !isStallOpen() }">
              <i class="fa-solid fa-clock"></i> 
              <span v-if="isStallOpen()">Open Now</span>
              <span v-else>Closed</span>
              <span class="opening-hours">
                ({{ hawker.openingTime }} - {{ hawker.closingTime }})
              </span>
            </p>
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
                placeholder="search for food item" 
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
        
        <div v-if="loading" class="col-12">Loading available listings...</div>
        
        <div v-else-if="filteredFoodItems.length === 0">
          <div v-if="searchQuery">No food items found matching "{{ searchQuery }}"</div>
          <div v-else>No food listings available for this stall.</div>
        </div>

        <div v-else class="row">
          <div v-for="item in filteredFoodItems" :key="item.id" class="col-md-4">
            <div class="listing-card" @click="isStallOpen() && item.itemQty > 0 ? openItemModal(item) : null" :class="{ 'disabled': !isStallOpen() || item.itemQty === 0 }">
              <div class="img-container">
                <ImageWithLoader 
                  :src="item.imageUrl" 
                  :alt="item.itemName"
                  image-class="foodImg"
                  error-icon="fas fa-utensils"
                />
                <div v-if="item.itemQty === 0" class="sold-out-overlay">
                  <span class="sold-out-text">SOLD OUT</span>
                </div>
                <div v-else class="counter-btn"
                  :class="{ 'square': item.count > 0, 'disabled': !isStallOpen() }"
                  @mouseenter="item.hover = true"
                  @mouseleave="item.hover = false"
                  @click.stop="isStallOpen() ? increment(item) : null">

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
                    <!-- show original price if discount applied -->
                    <span class="original-price" v-if="isDiscountApplied(item)">${{ item.itemPrice }}</span>
                  </div>
                  
                  <!-- Tags and Allergens -->
                  <div class="tags-container mt-2">
                    <span v-for="tag in item.tags" :key="tag" class="tag dietary-tag">
                      {{ tag }}
                    </span>
                    <span v-for="allergen in item.allergens" :key="allergen" class="tag allergen-tag">
                      <i class="fa-solid fa-triangle-exclamation"></i> {{ allergen }}
                    </span>
                  </div>
                  
                  <div class="d-flex justify-content-between align-items-center mt-2">
                    <span class="item-stock">Quantity left: <span :class="{ 'low-stock': item.itemQty <= 5 }">{{ item.itemQty }}</span></span>
                    <span class="discounted-price">${{ isDiscountApplied(item) 
                                                        ? (item.discountedPrice).toFixed(2)
                                                        : item.itemPrice.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <ReviewsSection v-if="hawker" :hawker="hawker" />
    </div>

    <!-- Item Details Modal -->
    <transition name="modal-fade">
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-container container-fluid" @click.stop>
          <button class="modal-close" @click="closeModal">
            <i class="fa-solid fa-xmark"></i>
          </button>  
            <div class="modal-info-section">
              <div class="modal-image-section">
                <ImageWithLoader 
                  :src="selectedItem.imageUrl" 
                  :alt="selectedItem.itemName" 
                  image-class="modal-image"
                  error-icon="fas fa-utensils"
                />
              </div>

            <div class="col-12">
              <div class="modal-heading">
                <h2 class="modal-title">{{ selectedItem.itemName }}</h2>
              
              <div class="modal-price-section">
                <span v-if="isDiscountApplied(selectedItem)" class="modal-original-price">
                  ${{ selectedItem.itemPrice }}
                </span>
                <span class="modal-current-price">
                  ${{ isDiscountApplied(selectedItem) 
                      ? (selectedItem.itemPrice * ((100 - selectedItem.discount) / 100)).toFixed(2)
                      : selectedItem.itemPrice }}
                </span>
              </div>

              </div>
              
              <!-- Description in Modal -->
              <div v-if="selectedItem.description" class="modal-description">
                <p>{{ selectedItem.description }}</p>
              </div>
              
              <div class="modal-stock-info">
                <span :class="{ 'low-stock': selectedItem.itemQty <= 5 }">
                  {{ selectedItem.itemQty }} available
                </span>
              </div>
              
              <div class="modal-notes-section">
                <label class="modal-label" for="buyer-notes">Special Instructions</label>
                <textarea 
                  id="buyer-notes"
                  v-model="buyerNotes"
                  class="notes-textarea"
                  placeholder="Add any special requests or dietary requirements..."
                  rows="4"
                  maxlength="200"
                ></textarea>
                <span class="char-count">{{ buyerNotes.length }}/200</span>
              </div>

              <div class="modal-quantity-section">
                <div class="quantity-controls">
                  <button 
                    class="qty-btn" 
                    @click="decrementModal"
                    :disabled="modalQuantity <= 0">
                    <i class="fa-solid fa-minus"></i>
                  </button>
                  <span class="qty-display">{{ modalQuantity }}</span>
                  <button 
                    class="qty-btn" 
                    @click="incrementModal"
                    :disabled="modalQuantity >= selectedItem.itemQty">
                    <i class="fa-solid fa-plus"></i>
                  </button>
                </div>
              </div>
              
              <div class="modal-actions row g-2">
                <div class="col-6">
                  <button class="btn-cancel w-100" @click="closeModal">Cancel</button>
                </div>
                <div class="col-6">
                  <button 
                    class="btn-add-to-cart w-100" 
                    @click="addToCartFromModal"
                    :disabled="modalQuantity === 0 || !isStallOpen()">
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

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