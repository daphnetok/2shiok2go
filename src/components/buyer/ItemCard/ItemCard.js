import { ref, computed } from 'vue';
import ImageWithLoader from '@/components/shared/ImageWithLoader.vue';

export default {
  name: 'ItemCard',
  components: {
    ImageWithLoader
  },
  props: {
    item: {
      type: Object,
      required: true
    },
    isStallOpen: {
      type: Boolean,
      required: true
    }
  },
  emits: ['increment', 'decrement', 'open-modal'],
  setup(props, { emit }) {
    const localHover = ref(false);

    // Check if discount is applied based on current time
    const isDiscountApplied = computed(() => {
      if (!props.item || !props.item.discountTime) return false;

      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      const [hours, minutes] = props.item.discountTime.split(':');
      const discountStart = parseInt(hours) * 60 + parseInt(minutes);
      return currentTime >= discountStart;
    });

    const handleIncrement = () => {
      if (props.item.itemQty > 0 && props.item.count < props.item.itemQty) {
        emit('increment', props.item);
      }
    };

    const handleDecrement = () => {
      if (props.item.count > 0) {
        emit('decrement', props.item);
      }
    };

    const handleCardClick = () => {
      if (props.isStallOpen && props.item.itemQty > 0) {
        emit('open-modal', props.item);
      }
    };

    return {
      localHover,
      isDiscountApplied,
      handleIncrement,
      handleDecrement,
      handleCardClick
    };
  }
};

