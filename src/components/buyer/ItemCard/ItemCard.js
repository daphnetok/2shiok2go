import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
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
    const currentImageIndex = ref(0);
    const autoScrollInterval = ref(null);

    // Get item images array
    const itemImages = computed(() => {
      if (!props.item) return [];
      
      // Check for images array first
      if (props.item.images && Array.isArray(props.item.images) && props.item.images.length > 0) {
        return props.item.images
          .filter(img => img && (img.url || img.path))
          .map(img => img.url || img.path)
          .sort((a, b) => {
            // Main images first
            const aMain = props.item.images.find(i => (i.url || i.path) === a)?.main;
            const bMain = props.item.images.find(i => (i.url || i.path) === b)?.main;
            if (aMain && !bMain) return -1;
            if (!aMain && bMain) return 1;
            return 0;
          });
      }
      
      // Fallback to single imageUrl
      return props.item.imageUrl ? [props.item.imageUrl] : [];
    });

    const startAutoScroll = () => {
      if (itemImages.value.length > 1) {
        autoScrollInterval.value = setInterval(() => {
          nextSlide();
        }, 3500);
      }
    };

    const stopAutoScroll = () => {
      if (autoScrollInterval.value) {
        clearInterval(autoScrollInterval.value);
        autoScrollInterval.value = null;
      }
    };

    const nextSlide = () => {
      currentImageIndex.value = (currentImageIndex.value + 1) % itemImages.value.length;
    };

    const goToSlide = (index) => {
      currentImageIndex.value = index;
      stopAutoScroll();
      startAutoScroll();
    };

    // Watch for item changes to reset carousel
    watch(() => props.item, () => {
      currentImageIndex.value = 0;
      stopAutoScroll();
      startAutoScroll();
    }, { immediate: true });

    onMounted(() => {
      startAutoScroll();
    });

    onBeforeUnmount(() => {
      stopAutoScroll();
    });

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
      itemImages,
      currentImageIndex,
      handleIncrement,
      handleDecrement,
      handleCardClick,
      goToSlide
    };
  }
};

