<template>
  <div class="container mt-4">

    <div class="row d-flex align-items-center mb-4">
      <!-- Search Bar aligned to the left -->
      <div class="col-10">
        <SearchBar/>
      </div>

      <!-- Font Awesome Icons aligned to the right -->
      <div class="col-2 d-flex justify-content-end">
        <font-awesome-icon icon="user" class="me-3" />
        <font-awesome-icon icon="shopping-cart"/>
      </div>
    </div>

    <div class="row">

      <div class="col-md-3">
        <FilterBar />
      </div>

      <div class="col-md-9">
        <h2 id="near">Near Me</h2>
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

<style src="@/assets/css/BuyerListing.css"></style>
