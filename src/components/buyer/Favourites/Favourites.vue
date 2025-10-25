<template>
    <div class="listings-container">
    <h2>Your Favourites <i class="fa-solid fa-heart hearticon"></i></h2>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <p>Loading listings...</p>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="!filteredHawkers || filteredHawkers.length === 0" class="empty-state">
      <p>No listings available</p>
    </div>
    
    <!-- Listings grid -->
    <div v-else class="listings-grid">
      <ListingCard 
        v-for="hawker in filteredHawkers" 
        :key="hawker.id"
        :hawker="hawker"
      />
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import ListingCard from '../ListingCard/ListingCard.vue';
import { useLoadHawkers } from '/firebase/firestore';

export default {
  name: 'ListingGrid',
  components: { ListingCard },
  props: {
    priceOrder: {
      type: String,
      default: null // 'asc' | 'desc' | null
    },
    dietary: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const allHawkers = useLoadHawkers();

    const loading = computed(() => allHawkers.value === null);

    // Helpers aligned to your schema
    const getDietary = (h) => {
      // dietaryRestriction is a string like "Halal"
      return (h.dietaryRestriction ?? '').toString().toLowerCase().trim();
    };

    const getDistance = (h) => {
      // distance is a string, parse to number if needed
      const d = Number((h.distance ?? '0').toString());
      return Number.isNaN(d) ? 0 : d;
    };

    const filteredHawkers = computed(() => {
      const list = (allHawkers.value || []).slice();

      // Filter by dietaryRestriction (string) if any selected
      const filtered = props.dietary.length
        ? list.filter(h => {
            const tag = getDietary(h); // e.g., "halal"
            // match if hawker's single tag is included in selected array
            return props.dietary
              .map(d => d.toString().toLowerCase().trim())
              .includes(tag);
          })
        : list;

      // Price sort not available in schema; optionally sort by distance if priceOrder provided
      if (props.priceOrder) {
        filtered.sort((a, b) => {
          const da = getDistance(a);
          const db = getDistance(b);
          return props.priceOrder === 'asc' ? da - db : db - da;
        });
      }

      return filtered;
    });

    return { filteredHawkers, loading };
  }
};
</script>


<style>
@import './Favourites.css'
</style>