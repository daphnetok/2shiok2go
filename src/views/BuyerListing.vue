<template>
 <main>
    <div class="row">
      <!-- Desktop: Filter on left, Search and Grid on right -->
      <div class="col-lg-2 col-md-3 d-none d-md-block">
        <FilterBar @filter-change="onFilterChange" />
      </div>

      <!-- Desktop: Main content area (wider now) -->
      <!-- Mobile: Full width with SearchBar first, then Filter, then Grid -->
      <div class="col-lg-10 col-md-9 col-12">
        <SearchBar/>
        
        <!-- Mobile: Filter appears below SearchBar -->
        <div class="d-md-none mb-3">
          <FilterBar @filter-change="onFilterChange" />
        </div>
        
        <ListingGrid
          :price-order="filters.priceOrder"
          :dietary="filters.dietary"
        />
      </div>

    </div>
    <BackToTop />
  </main>
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
