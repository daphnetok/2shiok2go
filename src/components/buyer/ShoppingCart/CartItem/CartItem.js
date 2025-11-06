export default {
  name: 'CartItem',
  props: {
    item: {
      type: Object,
      required: true
    },
    editMode: {
      type: Boolean,
      default: false
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    updating: {
      type: Boolean,
      default: false
    },
    originalPrice: {
      type: String,
      required: true
    },
    itemTotal: {
      type: String,
      required: true
    }
  },
  emits: ['toggle-select', 'decrement', 'increment', 'update-quantity', 'validate-quantity']
};

