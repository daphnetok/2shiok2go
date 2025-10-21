<template>
  <nav class="navbar navbar-expand-md sticky" >
    <div class="container-fluid">
        <button class="navbar-toggler custom-btn-success " type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="d-md-none">Filter</span>
            <span class="d-none d-md-block">Filter</span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <div class="container-flex">
                <h2 class="d-none d-md-block">Filter</h2>

                <div class="colour">
                  <!-- Price Section -->
                  <div class="filterItem">
                    <div class="filter-header">
                      <h4><i class="fas fa-tag"></i> Price</h4>
                      <button type="button" class="btn btn-outline-success btn-sm" @click="togglePriceExpand">
                        {{ isPriceExpanded ? '-' : '+' }}
                      </button>
                    </div>
                    <div v-show="isPriceExpanded">
                      <button type="button" class="btn btn-outline-success btn-sm mb-2" @click="setPriceOrder('asc')">Lowest to Highest</button><br>
                      <button type="button" class="btn btn-outline-success btn-sm mb-2" @click="setPriceOrder('desc')">Highest to Lowest</button><br>
                      <div class="d-flex align-items-center">
                        <Slider :style="{ width: '80%'}" />
                      </div>
                    </div>
                  </div>

                  <!-- Dietary Restriction Section -->
                  <div class="filterItem">
                    <div class="filter-header">
                      <h4><i class="fas fa-leaf"></i> Dietary Restriction</h4>
                      <button type="button" class="btn btn-outline-success btn-sm" @click="toggleDietaryExpand">
                        {{ isDietaryExpanded ? '-' : '+' }}
                      </button>
                    </div>
                    <div v-show="isDietaryExpanded" class="pb-1">
                      <label><input type="checkbox" value="halal" v-model="dietary" @change="emitFilters"> Halal</label><br>
                      <label><input type="checkbox" value="vegetarian" v-model="dietary" @change="emitFilters"> Vegetarian</label><br>
                      <label><input type="checkbox" value="seafood" v-model="dietary" @change="emitFilters"> Seafood</label><br>
                      <label><input type="checkbox" value="dairy-free" v-model="dietary" @change="emitFilters"> Dairy-free</label><br>
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
  components: { Slider },
  emits: ['filter-change'],
  data() {
    return {
      isPriceExpanded: false,
      isDietaryExpanded: false,
      priceOrder: null, // 'asc' | 'desc' | null
      dietary: []       // e.g. ['halal', 'vegetarian']
    };
  },
  methods: {
    togglePriceExpand() {
      this.isPriceExpanded = !this.isPriceExpanded;
    },
    toggleDietaryExpand() {
      this.isDietaryExpanded = !this.isDietaryExpanded;
    },
    setPriceOrder(order) {
      this.priceOrder = order;
      this.emitFilters();
    },
    emitFilters() {
      this.$emit('filter-change', {
        priceOrder: this.priceOrder,
        dietary: this.dietary
      });
    }
  }
};
</script>

<style>
@import './FilterBar.css';

@media (max-width: 600px) {
  .filter-header h4 {
    font-size: 0.95rem;
  }
  .filter-header .btn {
    font-size: 0.9rem;
    padding: 2px 6px;
  }
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
  width: 100%;
}
</style>
