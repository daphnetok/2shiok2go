<template>
  <div class="listings-container">
    <div class="header-with-location clickable" @click="toggleModal">
      <h2>{{ searchQuery ? 'Search Results' : 'Near Me' }}</h2>
      <h3 v-if="isLoadingAddress" class="location-text loading">
        Loading Address...
      </h3>
      <h3 v-else-if="formattedAddress" class="location-text">
        - {{ formattedAddress }}
      </h3>
    </div>

    <!-- location modal -->
     <LocationModal
      :isOpen="isModalOpen"
      :formattedAddress="formattedAddress"
      :currentGPSAddress="currentGPSAddress"
      @close="toggleModal"
      @locationSelected="handleLocationSelected"
    />
    
    <!-- Toast Notification -->
    <ToastNotification 
      v-if="showToast"
      :message="toastMessage"
      :duration="5000"
      @close="showToast = false"
    />
    
    <!-- location permission notice -->
    <div v-if="locationError" class="alert alert-warning">
      {{ locationError }}, please enable location settings
    </div>
    
    <!-- Loading state -->
    <LoadingSpinner v-if="loading" message="Loading listings..." />
    
    <!-- Empty state -->
    <div v-else-if="!filteredHawkers || filteredHawkers.length === 0" class="empty-state">
      <p>{{ searchQuery ? 'No results found for your search' : 'No listings available' }}</p>
    </div>
    
    <!-- Listings grid -->
    <div v-else class="listings-grid">
      <div v-for="hawker in filteredHawkers" :key="hawker.id" class="hawker-result-wrapper">
        <ListingCard 
          :hawker="hawker"
        />
        <!-- Display matching items if search is active and items exist -->
        <div v-if="searchQuery && hawker.matchingItems && hawker.matchingItems.length > 0" class="matching-items">
          <div class="matching-items-header">
            <span class="matching-items-label">Matching items:</span>
          </div>
          <div class="matching-items-grid">
            <div 
              v-for="(item, idx) in hawker.matchingItems" 
              :key="idx" 
              class="matching-item"
            >
              <img 
                :src="item.imageUrl" 
                :alt="item.itemName"
                class="matching-item-image"
                @error="handleImageError"
              />
              <span class="matching-item-name">{{ item.itemName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./ListingGrid.js"></script>
<style src="./ListingGrid.css"></style>