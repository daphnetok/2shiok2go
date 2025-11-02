<template>
  <div class="listings-container">
    <h2 v-if="!searchQuery">Near Me</h2>
    <h2 v-else>Search Results</h2>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <p>Loading listings...</p>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="!filteredHawkers || filteredHawkers.length === 0" class="empty-state">
      <p v-if="searchQuery">No results found for "{{ searchQuery }}"</p>
      <p v-else>No listings available</p>
    </div>
    
    <!-- Listings grid -->
    <div v-else class="listings-grid">
      <div 
        v-for="hawker in filteredHawkers" 
        :key="hawker.id"
        class="hawker-result-wrapper"
      >
        <ListingCard :hawker="hawker" />
        
        <!-- Display matching items if search query exists and items matched -->
        <div v-if="searchQuery && hawker.matchingItems && hawker.matchingItems.length > 0" class="matching-items">
          <div class="matching-items-header">
            <span class="matching-items-label">Matching items:</span>
          </div>
          <div class="matching-items-grid">
            <div 
              v-for="(item, index) in hawker.matchingItems" 
              :key="index"
              class="matching-item"
            >
              <img 
                :src="item.imageUrl || require('../../assets/img/stall.jpg')" 
                :alt="item.itemName"
                class="matching-item-image"
                @error="$event.target.src = require('../../assets/img/stall.jpg')"
              />
              <span class="matching-item-name">{{ item.itemName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ListingGridJS from './ListingGrid.js';

export default {
  ...ListingGridJS,
  name: 'ListingGrid'
};
</script>

<style scoped>
.listings-container {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #333;
  display: flex;
  justify-content:flex-start;
  padding-left: 10px;

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
  margin-top: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.matching-items-header {
  margin-bottom: 10px;
}

.matching-items-label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.matching-items-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.matching-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 80px;
}

.matching-item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.matching-item-name {
  font-size: 0.85rem;
  color: #495057;
  text-align: center;
  word-break: break-word;
  max-width: 100px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .listings-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .listings-grid {
    grid-template-columns: 1fr;
  }
}
</style>