 <template>
  <div class="filter-bar container my-3">
    <div class="row align-items-center">
      <div class="col-md-3 mb-2">
        <label for="priceRange" class="form-label fw-bold">Price Range</label>
        <select id="priceRange" class="form-select">
          <option value="">All</option>
          <option value="low">Below $3</option>
          <option value="mid">$3 - $5</option>
          <option value="high">Above $5</option>
        </select>
      </div>

      <div class="col-md-3 mb-2">
        <label for="dietary" class="form-label fw-bold">Dietary Preference</label>
        <select id="dietary" class="form-select">
          <option value="">All</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="halal">Halal</option>
          <option value="non-halal">Non-halal</option>
        </select>
      </div>

      <div class="col-md-3 mb-2">
        <label for="distance" class="form-label fw-bold">Distance</label>
        <select id="distance" class="form-select">
          <option value="">Any</option>
          <option value="1">Within 1km</option>
          <option value="3">Within 3km</option>
          <option value="5">Within 5km</option>
        </select>
      </div>

      <div class="col-md-3 text-center mb-2">
        <button class="btn btn-success w-100">
          Apply Filters
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "FilterBar",
  props: {
    // You can later use these to bind filter values from parent component (Listings.vue)
    filters: Object,
  },
  emits: ["updateFilters"], // emit event to parent when filters change
};
</script>

<!-- <style src="../../assets/css/FilterBar.css"></style> -->
