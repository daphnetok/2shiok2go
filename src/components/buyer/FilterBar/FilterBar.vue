<template>
  <!-- hamburger not working, page overflow idk why -->

  <!-- Hamburger icon for small screens -->
  <button class="navbar-toggler" type="button" @click="togglePanel" aria-controls="filter-panel" aria-expanded="isCollapsed" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>

  <!-- Sidebar Filter Panel -->
  <div id="filter-panel" class="navbar-collapse">
    <div class="d-flex flex-column p-3 bg-light" style="height: 100vh;">

      <h2>Filter</h2>

      <!-- Price Section -->
      <div class="container">
        <div class="row">
          <div class="col-10">
            <h4>Price</h4>
          </div>
          <div class="col-2">
            <button type="button" class="btn btn-outline-secondary btn-sm" @click="togglePriceExpand">
            {{ isPriceExpanded ? '-' : '+' }}
          </button>
          </div>
        </div>
        <div class="row">
          <div class="col" v-show="isPriceExpanded">
            <button type="button" class="btn btn-outline-success btn-sm mb-2">Lowest to Highest</button><br>
            <button type="button" class="btn btn-outline-success btn-sm mb-2">Highest to Lowest</button><br>
            <div class="d-flex align-items-center">
              <!-- <span class="me-2">Below:</span> 
              <input type="text" class="form-control mb-2" placeholder="Price" > -->
              <Slider :style="{ width: '80%'}" />
            </div>
          </div>
        </div>

        <!-- Dietary Restriction Section -->
        <div class="filterItem row">
          <div class="col-10">
            <h4>Dietary Restriction</h4>
          </div>
          <div class="col-2">
            <button type="button" class="btn btn-outline-success btn-sm" @click="toggleDietaryExpand">
            {{ isDietaryExpanded ? '-' : '+' }}
            </button>
          </div>
        </div>
        <div class="row">
          <div v-show="isDietaryExpanded">
            <input type="checkbox" id="halal"> Halal<br>
            <input type="checkbox" id="vegetarian"> Vegetarian<br>
            <input type="checkbox" id="seafood"> Seafood<br>
            <input type="checkbox" id="dairy-free"> Dairy-free<br>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { Colors } from 'chart.js';
import Slider from '../Slider/Slider.vue';
export default {
  name: "FilterBar",
  data() {
    return {
      isCollapsed: true, // For controlling the visibility of the whole filter panel
      isPriceExpanded: true, // Control whether the Price section is expanded or collapsed
      isDietaryExpanded: true, // Control whether the Dietary Restriction section is expanded or collapsed
    };
  },
  methods: {
    // Toggle the visibility of the filter panel
    togglePanel() {
      this.isCollapsed = !this.isCollapsed;
    },

    // Toggle the visibility of the Price section
    togglePriceExpand() {
      this.isPriceExpanded = !this.isPriceExpanded;
    },

    // Toggle the visibility of the Dietary Restriction section
    toggleDietaryExpand() {
      this.isDietaryExpanded = !this.isDietaryExpanded;
    },
  },
  components: {
    Slider
  }
};
</script>

<style scoped>
#filter-panel {
  transition: all 0.3s ease;
}

.filterItem{
  margin-top: 10%;
}

h2{
  color: rgb(71, 153, 71);
}

</style>
