<template>
  <nav class="filterNav navbar-expand-md">

      <button 
        class="navbar-toggler filter-toggle-btn" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarSupportedContent" 
        aria-controls="navbarSupportedContent" 
        aria-expanded="false" 
        aria-label="Toggle navigation"
      >
        <i class="fas fa-filter me-2"></i>
        <span>Filters</span>
        <i class="fas fa-chevron-down ms-2"></i>
      </button>

      <div class="navbar-collapse w-100" id="navbarSupportedContent">
        <div class="filter-container w-100">
          <div class="filter-header-main">
            <h2><i class="fas fa-sliders-h me-2"></i>Filters</h2>
            <button 
              v-if="hasActiveFilters" 
              class="btn-clear-all" 
              @click="clearAllFilters"
            >
              Clear All
            </button>
          </div>

          <!-- Price Section -->
          <div class="filter-section">
            <button 
              class="filter-section-header" 
              @click="togglePriceExpand"
              :class="{ 'active': isPriceExpanded }"
            >
              <div class="filter-title">
                <i class="fas fa-tag"></i>
                <span>Price</span>
                <span v-if="priceOrder" class="active-indicator"></span>
              </div>
              <i class="fas" :class="isPriceExpanded ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
            </button>
            
            <transition name="expand">
              <div v-show="isPriceExpanded" class="filter-content">
                <div class="button-group">
                  <button 
                    type="button" 
                    class="filter-option-btn" 
                    :class="{ 'active': priceOrder === 'asc' }"
                    @click="setPriceOrder('asc')"
                  >
                    <i class="fas fa-arrow-up me-2"></i>Lowest First
                  </button>
                  <button 
                    type="button" 
                    class="filter-option-btn"
                    :class="{ 'active': priceOrder === 'desc' }"
                    @click="setPriceOrder('desc')"
                  >
                    <i class="fas fa-arrow-down me-2"></i>Highest First
                  </button>
                </div>
                <div class="slider-container">
                  <label class="slider-label">Price Range</label>
                  <Slider />
                </div>
              </div>
            </transition>
          </div>

          <!-- Status Section -->
          <div class="filter-section">
            <button 
              class="filter-section-header" 
              @click="toggleStatusExpand"
              :class="{ 'active': isStatusExpanded }"
            >
              <div class="filter-title">
                <i class="fas fa-clock"></i>
                <span>Status</span>
                <span v-if="status.length > 0" class="badge-count">{{ status.length }}</span>
              </div>
              <i class="fas" :class="isStatusExpanded ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
            </button>
            
            <transition name="expand">
              <div v-if="isStatusExpanded" class="filter-content">
                <label class="checkbox-option">
                  <input type="checkbox" value="open" v-model="status" @change="emitFilters">
                  <span class="checkbox-custom"></span>
                  <i class="fas fa-door-open me-2 status-open"></i>
                  <span class="filter-term">Open</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" value="closed" v-model="status" @change="emitFilters">
                  <span class="checkbox-custom"></span>
                  <i class="fas fa-door-closed me-2 status-closed"></i>
                  <span class="filter-term">Closed</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" value="opening-soon" v-model="status" @change="emitFilters">
                  <span class="checkbox-custom"></span>
                  <i class="fas fa-hourglass-half me-2 status-soon"></i>
                  <span class="filter-term">Opening Soon</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" value="closing-soon" v-model="status" @change="emitFilters">
                  <span class="checkbox-custom"></span>
                  <i class="fas fa-clock me-2 status-closing"></i>
                  <span class="filter-term">Closing Soon</span>
                </label>
              </div>
            </transition>
          </div>

          <!-- Dietary Restriction Section -->
          <div class="filter-section">
            <button 
              class="filter-section-header" 
              @click="toggleDietaryExpand"
              :class="{ 'active': isDietaryExpanded }"
            >
              <div class="filter-title">
                <i class="fas fa-leaf"></i>
                <span>Dietary</span>
                <span v-if="dietary.length > 0" class="badge-count">{{ dietary.length }}</span>
              </div>
              <i class="fas" :class="isDietaryExpanded ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
            </button>
            
            <transition name="expand">
              <div v-if="isDietaryExpanded" class="filter-content">
                <label class="checkbox-option">
                  <input type="checkbox" value="halal" v-model="dietary" @change="emitFilters">
                  <span class="checkbox-custom"></span>
                  <i class="fas fa-mosque me-2"></i>
                  <span class="filter-term">Halal</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" value="vegetarian" v-model="dietary" @change="emitFilters">
                  <span class="checkbox-custom"></span>
                  <i class="fas fa-seedling me-2"></i>
                  <span class="filter-term">Vegetarian</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" value="seafood" v-model="dietary" @change="emitFilters">
                  <span class="checkbox-custom"></span>
                  <i class="fas fa-fish me-2"></i>
                  <span class="filter-term">Seafood</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" value="dairy-free" v-model="dietary" @change="emitFilters">
                  <span class="checkbox-custom"></span>
                  <i class="fas fa-ban me-2"></i>
                  <span class="filter-term">Dairy-Free</span>
                </label>
              </div>
            </transition>
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
      isStatusExpanded: false,
      isDietaryExpanded: false,
      priceOrder: null,
      status: [],
      dietary: []
    };
  },
  computed: {
    hasActiveFilters() {
      return this.priceOrder !== null || this.status.length > 0 || this.dietary.length > 0;
    }
  },
  methods: {
    togglePriceExpand() {
      this.isPriceExpanded = !this.isPriceExpanded;
    },
    toggleStatusExpand() {
      this.isStatusExpanded = !this.isStatusExpanded;
    },
    toggleDietaryExpand() {
      this.isDietaryExpanded = !this.isDietaryExpanded;
    },
    setPriceOrder(order) {
      this.priceOrder = this.priceOrder === order ? null : order;
      this.emitFilters();
    },
    clearAllFilters() {
      this.priceOrder = null;
      this.status = [];
      this.dietary = [];
      this.emitFilters();
    },
    emitFilters() {
      this.$emit('filter-change', {
        priceOrder: this.priceOrder,
        status: this.status,
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
