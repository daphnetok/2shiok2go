export default {
  name: 'CartHeader',
  props: {
    cartCount: {
      type: Number,
      required: true
    }
  },
  emits: ['go-back']
};

