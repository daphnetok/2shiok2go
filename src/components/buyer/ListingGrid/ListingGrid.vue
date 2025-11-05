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
    <h2>{{ searchQuery ? 'Search Results' : 'Near Me' }}</h2>
    
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

<script src="./ListingGrid.js">
</script>

<style scoped>
.listings-container {
  padding: 20px;
}

.header-with-location {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.header-with-location.clickable {
  cursor: pointer;
  transition: opacity 0.2s;
}

.header-with-location.clickable:hover {
  opacity: 0.7;
}


h2 {
  margin-bottom: 0;
  color: #333;
  padding-left: 10px;

}

.location-text {
  color: #333;
  font-size: 1.4rem;
  font-weight: 400;
  margin: 0;
}

.location-text.loading {
  color: #999;
  font-style: italic;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.alert-warning {
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  color: #856404;
}

.loading, .empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.listings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.hawker-result-wrapper {
  display: flex;
  flex-direction: column;
}

.matching-items {
  margin-top: 12px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.matching-items-header {
  margin-bottom: 8px;
}

.matching-items-label {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.matching-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.matching-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.matching-item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.matching-item-name {
  font-size: 12px;
  color: #555;
  text-align: center;
  word-break: break-word;
  max-width: 100%;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .listings-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 15px;
  }
  
  .matching-items-grid {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: 10px;
  }
  
  .matching-item-image {
    width: 70px;
    height: 70px;
  }

  .location-text {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .listings-grid {
    grid-template-columns: 1fr;
  }

  .header-with-location {
    flex-direction: column;
    align-items: flex-start;
  }
}
@import './ListingGrid.css'

</style>