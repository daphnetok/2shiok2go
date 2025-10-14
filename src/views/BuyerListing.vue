<template>
  <div class="container mt-4">
    <div class="row" >
      <div class="col-lg-3 col-md-4" >
        <FilterBar @filter-change="onFilterChange" />
      </div>

      <div class="col-lg-9 col-md-8" >
        <SearchBar/>
        <ListingGrid
          :price-order="filters.priceOrder"
          :dietary="filters.dietary"
        />
      </div>

    </div>
  </div>
  <BackToTop />
</template>

<script>
import FilterBar from '../components/buyer/FilterBar/FilterBar.vue';
import SearchBar from '../components/shared/SearchBar.vue';
import BackToTop from '../components/buyer/BackToTop/BackToTop.vue'
import ListingGrid from '@/components/buyer/ListingGrid/ListingGrid.vue';

export default { 
  name: "BuyerListings",
  components: {
    FilterBar,
    SearchBar,
    ListingGrid,
    BackToTop
  },
  data() {
    return {
      filters: {
        priceOrder: null,
        dietary: []
      }
    };
  },
  methods: {
    onFilterChange(payload) {
      this.filters = { ...this.filters, ...payload };
    }
  }
};
</script>

<style src="@/assets/css/BuyerListing.css"></style>
