import { computed } from 'vue';
import ListingCard from './ListingCard.vue';
import { useLoadListings } from '/firebase/firestore';

export default {
  name: 'ListingsGrid',
  components: {
    ListingCard
  },
  props: {
    title: {
      type: String,
      default: 'All Listings'
    },
    filterActive: {
      type: Boolean,
      default: null // null means show all, true = active only, false = inactive only
    }
  },
  setup(props) {
    const allListings = useLoadListings();
    
    // Filter listings based on prop
    const listings = computed(() => {
      if (!allListings.value) return [];
      
      if (props.filterActive === null) {
        return allListings.value;
      }
      
      return allListings.value.filter(
        listing => listing.makeActive === props.filterActive
      );
    });
    
    // Loading state (you might need to add this to your useLoadListings composable)
    const loading = computed(() => {
      return allListings.value === null;
    });
    
    // Methods for handling actions
    const handleEdit = (listingId) => {
      console.log('Edit listing:', listingId);
      // Emit event to parent or handle edit logic
    };
    
    const handleDelete = (listingId) => {
      console.log('Delete listing:', listingId);
      // Emit event to parent or handle delete logic
    };
    
    return {
      listings,
      loading,
      handleEdit,
      handleDelete
    };
  }
}