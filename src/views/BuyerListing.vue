<template>
  <div class="container mt-4">
    <div class="row" >
      <div class="col-lg-3 col-md-4" >
        <FilterBar />
      </div>

      <div class="col-lg-9 col-md-8" >
        <SearchBar/>
        <ListingGrid />
      </div>

    </div>
  </div>
  <BackToTop />
</template>

<script>
// Import the FilterBar component
import FilterBar from '../components/buyer/FilterBar/FilterBar.vue';
import SearchBar from '../components/shared/SearchBar.vue';
import BackToTop from '../components/buyer/BackToTop/BackToTop.vue'
import ListingGrid from '@/components/buyer/ListingGrid/ListingGrid.vue';
import filterLogic from '../components/buyer/FilterBar/FilterBar.js';

export default { 
  name: "BuyerListings",
  components: {
    FilterBar, // Register the FilterBar component to use it in this file
    SearchBar,
    ListingGrid,
    BackToTop
  },
  mixins: [filterLogic],
};
</script>

<style src="@/assets/css/BuyerListing.css"></style>
