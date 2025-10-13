<template>
  <div class="listings-container">
    <h2>Near Me</h2>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <p>Loading listings...</p>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="!hawkers || hawkers.length === 0" class="empty-state">
      <p>No listings available</p>
    </div>
    
    <!-- Listings grid -->
      <div v-else class="listings-grid">
        <!-- hawkers contain hawkerListing collection -->
        <ListingCard 
          v-for="hawker in hawkers" 
          :key="hawker.hawkerName"
          :hawker="hawker"
        />
    </div>
    
  </div>
</template>

<script src="./ListingGrid.js">
export default {
  name: ListingGrid
}
</script>

<style scoped>
.listings-container {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #333;
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
}

@media (max-width: 480px) {
  .listings-grid {
    grid-template-columns: 1fr;
  }
}
</style>