<!-- need to change pic and ensure it stays in same place even when screen size changes -->
<template>
    <div class="search-container">
      <div class="search-box">
        <i class="fa-solid fa-search search-icon"></i>
        <input 
          type="text" 
          placeholder="Search for Food or Location..." 
          class="search-input" 
          v-model="searchQuery"
          @input="handleSearch"
        />
        <button 
          v-if="searchQuery" 
          @click="clearSearch" 
          class="clear-search-btn"
          type="button"
          aria-label="Clear search"
        >
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: "SearchBar",
  emits: ['search'],
  setup(props, { emit }) {
    const searchQuery = ref('');
    let debounceTimer = null;

    const handleSearch = () => {
      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Set new timer for debounced search
      debounceTimer = setTimeout(() => {
        emit('search', searchQuery.value);
      }, 300);
    };

    const clearSearch = () => {
      searchQuery.value = '';
      emit('search', '');
    };

    return {
      searchQuery,
      handleSearch,
      clearSearch
    };
  }
}
</script>

<style>
@import './SearchBar.css'

</style>