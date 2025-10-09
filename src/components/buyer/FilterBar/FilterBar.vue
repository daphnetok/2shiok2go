<template>
<nav class="navbar navbar-expand-sm">
    <div class="container-fluid">
        
        <!-- Navbar Toggler Button -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="d-sm-none">Filter</span> <!-- 'Filter' text only for small screens -->
            <span class="d-none d-sm-block">Filter</span> <!-- 'Filter' text only for large screens -->
        </button>

        <!-- Expanded Navbar Content -->
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <div class="container">
                <!-- Display 'Filter' as H2 for larger screens -->
                <h2 class="d-none d-sm-block">Filter</h2>

                <!-- Price Section -->
                <div class="filterItem row">
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
</nav>


</template>

<script>
import Slider from '../Slider/Slider.vue';
export default {
  name: "FilterBar",
  components: {
    Slider
  },
  data() {
    return {
      // State for sidebar visibility
      isSidebarOpen: false, 
      
      // State for expanded sections
      isPriceExpanded: false,
      isDietaryExpanded: false,
    };
  },
  methods: {
    // Toggle the sidebar visibility (for the hamburger icon)
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },

    // Toggle the Price section expansion
    togglePriceExpand() {
      this.isPriceExpanded = !this.isPriceExpanded;
    },

    // Toggle the Dietary section expansion
    toggleDietaryExpand() {
      this.isDietaryExpanded = !this.isDietaryExpanded;
    }
  }
};
</script>



<style>
@import './FilterBar.css' 
</style>