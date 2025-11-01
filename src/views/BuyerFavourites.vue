<template>
  <div class="buyer-dashboard-wrapper" :class="{ 'dark-theme': isDarkMode }">
    <!-- Sidebar Navigation -->
    <div class="sidebar" :class="{ 'dark-sidebar': isDarkMode }">
      <nav class="sidebar-nav">
        <router-link to="/buyer-dashboard" class="nav-item" :class="{ active: $route.path === '/buyer-dashboard' }">
          <i class="fas fa-chart-line"></i>
          <span>Analytics</span>
        </router-link>
        <router-link to="/buyer-recent-orders" class="nav-item" :class="{ active: $route.path === '/buyer-recent-orders' }">
          <i class="fas fa-shopping-bag"></i>
          <span>Recent Orders</span>
        </router-link>
        <router-link to="/buyer-favourites" class="nav-item" :class="{ active: $route.path === '/buyer-favourites' }">
          <i class="fas fa-heart"></i>
          <span>Favourites</span>
        </router-link>
      </nav>
    </div>

    <!-- Main Content Area -->
    <div class="main-content">
      <div class="favourites-page" :class="{ 'dark-theme': isDarkMode }">
        <!-- Header with Theme Toggle -->
        <div class="container-fluid" style="padding-left: 3rem; padding-right: 3rem; padding-top: 2rem; padding-bottom: 1rem;">
          <div class="row mb-4 align-items-center">
            <div class="col-auto">
              <h2 class="mb-0 fw-bold d-flex align-items-center" style="color: #059669;">
                <i class="fas fa-heart" style="font-size: 2rem; margin-right: 0.75rem;"></i>
                Your Favourite Hawkers
              </h2>
              <p class="mb-0 mt-2 text-muted">Quick access to your favorite stalls</p>
            </div>
            <div class="col text-end">
              <button class="btn btn-outline-secondary" style="border-radius: 8px;" @click="toggleTheme">
                <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
                {{ isDarkMode ? 'Light' : 'Dark' }} Mode
              </button>
            </div>
          </div>
        </div>

        <div class="container-fluid" style="padding-left: 3rem; padding-right: 3rem;">
          <!-- Loading State -->
          <div v-if="loading" class="loading-state" :class="{ 'dark-mode-card': isDarkMode }">
            <div class="spinner-border text-success" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 mb-0">Loading your favourite hawkers...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="!filteredHawkers || filteredHawkers.length === 0" class="empty-state" :class="{ 'dark-mode-card': isDarkMode }">
            <i class="fas fa-heart-broken empty-icon"></i>
            <h4 class="mb-2">No Favourites Yet</h4>
            <p class="mb-3 text-muted">Start adding your favourite hawker stalls to see them here!</p>
            <router-link to="/buyer-listings" class="btn btn-success" style="border-radius: 8px;">
              <i class="fas fa-search me-2"></i>Browse Hawkers
            </router-link>
          </div>

          <!-- Favourites Grid -->
          <div v-else class="favourites-grid">
            <ListingCard 
              v-for="hawker in filteredHawkers" 
              :key="hawker.id"
              :hawker="hawker"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onActivated } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFavourites } from '/firebase/firestore'
import ListingCard from '@/components/buyer/ListingCard/ListingCard.vue'

export default {
  name: 'BuyerFavourites',
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
    const isDarkMode = ref(false)
    const auth = getAuth()
    const userId = ref(null)
    const allHawkers = ref([])
    const loading = ref(true)

    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      if (user) {
        userId.value = user.uid
        console.log('User authenticated in Favourites:', userId.value)
        fetchFavoritedHawkers()
      } else {
        userId.value = null
        allHawkers.value = []
        loading.value = false
        console.log('No user authenticated in Favourites')
      }
    })

    // Helper functions for filtering and sorting
    const getDietary = (h) => {
      return (h.dietaryRestriction ?? '').toString().toLowerCase().trim()
    }

    const getDistance = (h) => {
      const d = Number((h.distance ?? '0').toString())
      return Number.isNaN(d) ? 0 : d
    }

    const filteredHawkers = computed(() => {
      const list = (allHawkers.value || []).slice()

      // Filter by dietaryRestriction
      const filtered = props.dietary.length
        ? list.filter(h => {
            const tag = getDietary(h)
            return props.dietary
              .map(d => d.toString().toLowerCase().trim())
              .includes(tag)
          })
        : list

      // Sort by distance if priceOrder provided
      if (props.priceOrder) {
        filtered.sort((a, b) => {
          const da = getDistance(a)
          const db = getDistance(b)
          return props.priceOrder === 'asc' ? da - db : db - da
        })
      }

      return filtered
    })

    // Fetch the user's favourited hawkers based on the userId
    const fetchFavoritedHawkers = async () => {
      if (!userId.value) {
        loading.value = false
        return
      }

      loading.value = true
      try {
        const favourited = await getFavourites(userId.value)
        allHawkers.value = favourited
        console.log('Fetched favourited hawkers:', favourited)
      } catch (error) {
        console.error('Error fetching favourited hawkers:', error)
      } finally {
        loading.value = false
      }
    }

    // Theme toggle
    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value
      document.body.classList.toggle('dark-mode', isDarkMode.value)
      document.documentElement.setAttribute('data-bs-theme', isDarkMode.value ? 'dark' : 'light')
      localStorage.setItem('buyer-theme', isDarkMode.value ? 'dark' : 'light')
    }

    // Initialize
    onMounted(() => {
      // Check saved theme
      const savedTheme = localStorage.getItem('buyer-theme')
      if (savedTheme === 'dark') {
        isDarkMode.value = true
        document.body.classList.add('dark-mode')
        document.documentElement.setAttribute('data-bs-theme', 'dark')
      }

      // Fetch favourites if user is already authenticated
      if (userId.value) {
        fetchFavoritedHawkers()
      }
    })

    // Refresh when page is activated (navigated back to)
    onActivated(() => {
      if (userId.value) {
        fetchFavoritedHawkers()
      }
    })

    return {
      isDarkMode,
      loading,
      allHawkers,
      filteredHawkers,
      toggleTheme,
      fetchFavoritedHawkers
    }
  }
}
</script>

<style scoped>
@import '@/assets/css/dashboard-theme.css';

/* Wrapper Layout */
.buyer-dashboard-wrapper {
  display: flex;
  min-height: 100vh;
}

.buyer-dashboard-wrapper.dark-theme {
  background: #0f172a;
}

/* Sidebar - Matching FilterBar Style */
.sidebar {
  width: 280px;
  background: white;
  border-radius: 16px;
  margin: 1rem;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 1rem;
  height: fit-content;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
}

.sidebar.dark-sidebar {
  background: #1e293b;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  color: #666;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  border-radius: 12px;
  background: #f8fdf9;
  border: 1px solid #e8f5e9;
}

.nav-item:hover {
  background: rgba(222, 252, 222, 0.623);
  border-color: #c8e6c9;
  box-shadow: 0 2px 8px rgba(56, 142, 60, 0.08);
  color: #2e7d32;
}

.dark-sidebar .nav-item {
  background: #0f172a;
  border-color: #334155;
  color: #94a3b8;
}

.dark-sidebar .nav-item:hover {
  background: #334155;
  border-color: #10b981;
  color: #10b981;
}

.nav-item.active {
  background: linear-gradient(135deg, #388e3c 0%, #2e7d32 100%);
  color: white;
  border-color: #388e3c;
  box-shadow: 0 2px 8px rgba(56, 142, 60, 0.2);
}

.dark-sidebar .nav-item.active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-color: #10b981;
}

.nav-item i {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
  color: #388e3c;
}

.nav-item.active i {
  color: white;
}

.dark-sidebar .nav-item i {
  color: #10b981;
}

.dark-sidebar .nav-item.active i {
  color: white;
}

/* Main Content */
.main-content {
  flex: 1;
  overflow-y: auto;
}

.favourites-page {
  min-height: 100vh;
}

.favourites-page.dark-theme {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #e2e8f0;
}

/* Loading State */
.loading-state {
  background: white;
  border-radius: 16px;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.loading-state.dark-mode-card {
  background: #1e293b;
  border-color: #334155;
  color: #e2e8f0;
}

/* Empty State */
.empty-state {
  background: white;
  border-radius: 16px;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.empty-state.dark-mode-card {
  background: #1e293b;
  border-color: #334155;
}

.empty-icon {
  font-size: 4rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.empty-state h4 {
  color: #374151;
  font-weight: 600;
}

.dark-theme .empty-state h4 {
  color: #e2e8f0;
}

/* Favourites Grid */
.favourites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding-bottom: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .buyer-dashboard-wrapper {
    flex-direction: column;
  }

  .sidebar {
    width: calc(100% - 2rem);
    position: relative;
    top: 0;
    max-height: none;
    margin: 1rem;
  }

  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    gap: 8px;
  }

  .nav-item {
    min-width: 150px;
    justify-content: center;
  }

  .favourites-grid {
    grid-template-columns: 1fr;
  }
}
</style>
