<template>
  <div class="container mt-4">

    <div class="row d-flex align-items-center mb-4">
      <!-- Search Bar aligned to the left -->
      <div class="col-10">
        <SearchBar/>
      </div>

      <!-- Font Awesome Icons aligned to the right -->
      <div class="col-2 d-flex justify-content-end">
        <a href=""><font-awesome-icon icon="shopping-cart" size="lg"/></a>
        <div class="me-3"></div>
        <!-- <a href=""><font-awesome-icon icon="user" size="lg" /></a> -->
         <div class="user-icon-container position-relative">
          <a href="" class="user-icon">
            <font-awesome-icon icon="user" size="lg" />
          </a>
          <div class="user-dropdown">
            <ul>
              <li><a href="#">Saved</a></li>
              <li><a href="#">Recent Orders</a></li>
              <li><a href="#">Settings</a></li>
            </ul>
          </div>
        </div>
        
      </div>
    </div>

    <div class="row">

      <div class="col-lg-3 col-md-4">
        <FilterBar />
      </div>

      <div class="col-lg-9 col-md-8">
        <h2 id="near">Near Me</h2>
        <ListingCard />
      </div>

    </div>
  </div>
  <BackToTop />
</template>

<script>
// Import the FilterBar component
import FilterBar from '../components/buyer/FilterBar/FilterBar.vue';
import SearchBar from '../components/shared/SearchBar.vue';
import ListingCard from '../components/buyer/ListingCard/ListingCard.vue';
import BackToTop from '../components/buyer/BackToTop/BackToTop.vue'

export default { 
  name: "BuyerListings",
  components: {
    FilterBar, // Register the FilterBar component to use it in this file
    SearchBar,
    ListingCard,
    BackToTop
  }
};
</script>

<style src="@/assets/css/BuyerListing.css"></style>
