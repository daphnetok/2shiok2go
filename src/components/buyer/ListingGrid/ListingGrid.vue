<template>
  <div class="listings-container">
    <div class="header-with-location clickable" @click="toggleModal">
      <h2>Near Me</h2>
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
    
    <!-- location permission notice -->
    <div v-if="locationError" class="alert alert-warning">
      {{ locationError }} - Showing all stalls without distance sorting
    </div>
    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <p>Loading listings...</p>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="!filteredHawkers || filteredHawkers.length === 0" class="empty-state">
      <p>No listings available</p>
    </div>
    
    <!-- Listings grid -->
    <div v-else class="listings-grid">
      <ListingCard 
        v-for="hawker in filteredHawkers" 
        :key="hawker.id"
        :hawker="hawker"
      />
    </div>
  </div>
</template>

<script src="./ListingGrid.js"></script>

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

/* Responsive adjustments */
@media (max-width: 768px) {
  .listings-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 15px;
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
</style>