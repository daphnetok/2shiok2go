<template>
  <div class="container mt-4">
    <h2>Buyer Listings</h2>
    <p>View nearby hawker stalls offering surplus meals.</p>

    <div class="row">
      <SearchBar />
    </div>

    <div class="row">

      <div class="col-md-3">
        <FilterBar />
      </div>

      <div class="col-md-9">
        <ListingCard />
      </div>
      
    </div>
  </div>
</template>

<script>
// Import the FilterBar component
import FilterBar from '../components/buyer/FilterBar/FilterBar.vue';
import SearchBar from '../components/shared/SearchBar.vue';
import ListingCard from '../components/buyer/ListingCard/ListingCard.vue'

export default { 
  name: "BuyerListings",
  components: {
    FilterBar, // Register the FilterBar component to use it in this file
    SearchBar,
    ListingCard
  }
};
</script>

<style src="src\assets\css\BuyerDashboard.css"></style>
