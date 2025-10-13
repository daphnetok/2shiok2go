import { computed } from 'vue';
import ListingCard from '../ListingCard/ListingCard.vue';
import { useLoadHawkers } from '/firebase/firestore';

export default {
  components: {
    ListingCard
  },
  setup() {
    // Fetch ALL hawkers from Firestore
    const allHawkers = useLoadHawkers();
    
    const hawkers = computed(() => {
      return allHawkers.value || [];
    });
    
    const loading = computed(() => {
      return allHawkers.value === null;
    });
    
    return {
      hawkers,  // This contains ALL hawker objects with imageUrl field
      loading
    };
  }
}