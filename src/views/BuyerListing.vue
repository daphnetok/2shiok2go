<template>
 <div class="container">
    <div class="row">
      <!-- Desktop: Filter on left, full width of its column -->
      <SearchBar/>
    </div>

    <div class="row">
      <!-- Desktop: Main content area -->
      <!-- Mobile: Full width with SearchBar first, then Filter, then Grid -->
      <div class="col-lg-3 col-md-3 d-none d-md-block px-0">
        <FilterBar @filter-change="onFilterChange" class="w-100" />
      </div>
      <div class="col-lg-9 col-md-9 col-12">
        
        
        <!-- Mobile: Filter appears below SearchBar, full width -->
        <div class="d-md-none mb-3 px-0">
          <FilterBar @filter-change="onFilterChange" class="w-100" />
        </div>
        
        <ListingGrid
          :price-order="filters.priceOrder"
          :dietary="filters.dietary"
          :status="filters.status"
        />
      </div>

    </div>
    <BackToTop />
  </div>
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
        dietary: [],
        status: []
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
