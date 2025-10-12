<template>
    <div class="container">
        <div class="row">
            <SearchBar/>
        </div>
        <div class="row">
            <StallListing/>
        </div>
    </div>
    <BackToTop />
    
</template>

<script>
// Import the FilterBar component
import FilterBar from '../components/buyer/FilterBar/FilterBar.vue';
import SearchBar from '../components/shared/SearchBar.vue';
import StallListing from '../components/buyer/StallListing/StallListing.vue';
import BackToTop from '@/components/buyer/BackToTop/BackToTop.vue';

export default { 
  name: "BuyerListings",
  components: {
    FilterBar, // Register the FilterBar component to use it in this file
    SearchBar,
    StallListing,
    BackToTop
  }
};
</script>
