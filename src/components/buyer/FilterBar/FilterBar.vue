<template>
  <nav class="navbar navbar-expand-md sticky" >
    <div class="container-fluid">
        
        <!-- Navbar Toggler Button -->
        <button class="navbar-toggler custom-btn-success " type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="d-md-none">Filter</span> <!-- 'Filter' text only for md screens -->
            <span class="d-none d-md-block">Filter</span> <!-- 'Filter' text only for md screens -->
        </button>

        <!-- Expanded Navbar Content -->
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <div class="container-flex">
                <!-- Display 'Filter' as H2 for md screens -->
                <h2 class="d-none d-md-block">Filter</h2>

                <div class="colour">
                <!-- Price Section -->
                    <div class="filterItem row pt-1">
                        <div class="col-9">
                            <h4><i class="fas fa-tag"></i> Price</h4>
                        </div>
                        <div class="col-3">
                            <button type="button" class="btn btn-outline-success btn-sm" @click="togglePriceExpand">
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
                        <div class="col-9">
                            <h4><i class="fas fa-leaf"></i> Dietary Restriction</h4>
                        </div>
                        <div class="col-3">
                            <button type="button" class="btn btn-outline-success btn-sm" @click="toggleDietaryExpand">
                                {{ isDietaryExpanded ? '-' : '+' }}
                            </button>
                        </div>
                    </div>
                    <div class="row">
                        <div v-show="isDietaryExpanded" class="pb-1">
                            <input type="checkbox" id="halal"> Halal<br>
                            <input type="checkbox" id="vegetarian"> Vegetarian<br>
                            <input type="checkbox" id="seafood"> Seafood<br>
                            <input type="checkbox" id="dairy-free"> Dairy-free<br>
                        </div>
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
      isPriceExpanded: false,
      isDietaryExpanded: false,
    };
  },
  methods: {
    togglePriceExpand() {
      this.isPriceExpanded = !this.isPriceExpanded;
    },
    toggleDietaryExpand() {
      this.isDietaryExpanded = !this.isDietaryExpanded;
    }
  }
};
</script>

<style>
@import './FilterBar.css';
</style>
