// logic for filters (price, dietary)
export default {
  data() {
    return {
      isPriceExpanded: false,
      isDietaryExpanded: false,
      priceOrder: null, // 'asc' or 'desc'
      dietary: [],
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
    toggleDietary(option) {
      if (this.dietary.includes(option)) {
        this.dietary = this.dietary.filter(d => d !== option);
      } else {
        this.dietary.push(option);
      }
      this.emitFilters();
    },
    emitFilters() {
      // Emit the filter state to the parent
      this.$emit('filter-change', {
        priceOrder: this.priceOrder,
        dietary: this.dietary
      });
    }
  }
};