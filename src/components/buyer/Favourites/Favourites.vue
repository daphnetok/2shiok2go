<template>
  <div class="listings-container">
    <h2>Your Favourited Hawkers</h2>

    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <p>Loading your favourite hawkers...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!filteredHawkers || filteredHawkers.length === 0" class="empty-state">
      <p>No favourite hawkers found</p>
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


<script src="./Favourites.js"></script>

<style>
@import './Favourites.css'
</style>