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
          aria-label="Clear search"
        >
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: "SearchBar",
  emits: ['search'],
  setup(props, { emit }) {
    const searchQuery = ref('')
    let searchTimeout = null

    const handleSearch = () => {
      // Debounce search to avoid too many queries
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        emit('search', searchQuery.value.trim())
      }, 300) // 300ms debounce
    }

    const clearSearch = () => {
      searchQuery.value = ''
      emit('search', '')
    }

    return {
      searchQuery,
      handleSearch,
      clearSearch
    }
  }
}
</script>

<style>
@import './SearchBar.css'

</style>