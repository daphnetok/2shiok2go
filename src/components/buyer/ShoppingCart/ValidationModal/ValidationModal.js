export default {
  name: 'ValidationModal',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    message: {
      type: String,
      required: true
    }
  },
  emits: ['close']
};

