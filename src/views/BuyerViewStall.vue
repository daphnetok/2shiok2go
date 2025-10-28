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
    FilterBar,
    SearchBar,
    StallListing,
    BackToTop
  }
};
</script>

<style scoped>
.checkout-fab {
  position: fixed;
  left: 100px;
  bottom: 30px;
  z-index: 1000;
  text-decoration: none;
}
.checkout-fab .btn {
  border-radius: 50px;
  padding: 16px 28px;
  font-size: 1.1rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.13);
}
</style>
