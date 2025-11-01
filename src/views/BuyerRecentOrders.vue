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
      <div class="recent-orders-page" :class="{ 'dark-theme': isDarkMode }">
        <!-- Header with Theme Toggle -->
        <div class="container-fluid" style="padding-left: 3rem; padding-right: 3rem; padding-top: 2rem; padding-bottom: 1rem;">
          <div class="row mb-4 align-items-center">
            <div class="col-auto">
              <h2 class="mb-0 fw-bold d-flex align-items-center" style="color: #059669;">
                <i class="fas fa-shopping-bag" style="font-size: 2rem; margin-right: 0.75rem;"></i>
                Recent Orders
              </h2>
              <p class="mb-0 mt-2 text-muted">Track your food rescue orders</p>
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
          <!-- Filter Section -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="filter-card" :class="{ 'dark-mode-card': isDarkMode }">
                <div class="filter-content">
                  <div class="filter-group">
                    <label class="filter-label">Status:</label>
                    <select v-model="filterStatus" class="filter-select" :class="{ 'dark-select': isDarkMode }">
                      <option value="all">All Orders</option>
                      <option value="reserved">Reserved</option>
                      <option value="accepted">Accepted</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div class="filter-group">
                    <label class="filter-label">Sort By:</label>
                    <select v-model="sortBy" class="filter-select" :class="{ 'dark-select': isDarkMode }">
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="amount-high">Highest Amount</option>
                      <option value="amount-low">Lowest Amount</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="loading-state" :class="{ 'dark-mode-card': isDarkMode }">
            <div class="spinner-border text-success" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 mb-0">Loading your orders...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredOrders.length === 0" class="empty-state" :class="{ 'dark-mode-card': isDarkMode }">
            <i class="fas fa-shopping-bag empty-icon"></i>
            <h4 class="mb-2">No Orders Yet</h4>
            <p class="mb-3 text-muted">Start rescuing food to see your orders here!</p>
            <router-link to="/buyer-listings" class="btn btn-success" style="border-radius: 8px;">
              <i class="fas fa-search me-2"></i>Browse Listings
            </router-link>
          </div>

          <!-- Orders List -->
          <div v-else class="orders-list">
            <div v-for="order in filteredOrders" :key="order.id" class="order-card" :class="{ 'dark-mode-card': isDarkMode }">
              <div class="order-header">
                <div class="order-info">
                  <h5 class="order-id mb-1">Order #{{ order.id.substring(0, 8).toUpperCase() }}</h5>
                  <p class="order-date mb-0 text-muted">{{ formatDate(order.createdAt) }}</p>
                </div>
                <span class="order-status" :class="getStatusClass(order.status)">
                  <i :class="getStatusIcon(order.status)" class="me-1"></i>
                  {{ order.status.charAt(0).toUpperCase() + order.status.slice(1) }}
                </span>
              </div>
              
              <div class="order-body">
                <div class="order-details">
                  <div class="detail-row">
                    <span class="detail-label">
                      <i class="fas fa-store me-2"></i>Hawker:
                    </span>
                    <span class="detail-value">{{ order.hawkerName || 'Unknown Hawker' }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">
                      <i class="fas fa-utensils me-2"></i>Items:
                    </span>
                    <span class="detail-value">{{ getItemsList(order.items) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">
                      <i class="fas fa-box me-2"></i>Quantity:
                    </span>
                    <span class="detail-value">{{ getTotalQuantity(order.items) }} item(s)</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">
                      <i class="fas fa-clock me-2"></i>Pickup Time:
                    </span>
                    <span class="detail-value">{{ order.pickupTime || 'To be confirmed' }}</span>
                  </div>
                </div>
                
                <div class="order-summary">
                  <div class="summary-row">
                    <span class="summary-label">Subtotal:</span>
                    <span class="summary-value">${{ order.subtotal?.toFixed(2) || '0.00' }}</span>
                  </div>
                  <div class="summary-row total-row">
                    <span class="summary-label fw-bold">Total Amount:</span>
                    <span class="summary-value total-amount">${{ order.totalAmount?.toFixed(2) || '0.00' }}</span>
                  </div>
                </div>
              </div>

              <div class="order-footer">
                <button v-if="order.status === 'completed'" class="btn btn-outline-success btn-sm" style="border-radius: 8px;">
                  <i class="fas fa-star me-2"></i>Write Review
                </button>
                <button v-if="order.status === 'reserved' || order.status === 'accepted'" 
                        class="btn btn-outline-danger btn-sm" 
                        style="border-radius: 8px;"
                        @click="cancelOrder(order.id)">
                  <i class="fas fa-times me-2"></i>Cancel Order
                </button>
                <button class="btn btn-outline-primary btn-sm" style="border-radius: 8px;">
                  <i class="fas fa-info-circle me-2"></i>View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getOrdersByUser, cancelOrder as cancelOrderService } from '@/services/orderService'

export default {
  name: 'BuyerRecentOrders',
  setup() {
    const isDarkMode = ref(false)
    const loading = ref(true)
    const orders = ref([])
    const filterStatus = ref('all')
    const sortBy = ref('newest')
    const currentUserId = ref(null)

    const auth = getAuth()

    // Filter and sort orders
    const filteredOrders = computed(() => {
      let filtered = orders.value

      // Filter by status
      if (filterStatus.value !== 'all') {
        filtered = filtered.filter(order => order.status === filterStatus.value)
      }

      // Sort
      const sorted = [...filtered]
      switch (sortBy.value) {
        case 'newest':
          sorted.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
            return dateB - dateA
          })
          break
        case 'oldest':
          sorted.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
            return dateA - dateB
          })
          break
        case 'amount-high':
          sorted.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0))
          break
        case 'amount-low':
          sorted.sort((a, b) => (a.totalAmount || 0) - (b.totalAmount || 0))
          break
      }

      return sorted
    })

    // Fetch orders
    const fetchOrders = async () => {
      if (!currentUserId.value) return

      try {
        loading.value = true
        const fetchedOrders = await getOrdersByUser(currentUserId.value, 'buyer')
        orders.value = fetchedOrders
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        loading.value = false
      }
    }

    // Cancel order
    const cancelOrder = async (orderId) => {
      if (!confirm('Are you sure you want to cancel this order?')) return

      try {
        await cancelOrderService(orderId)
        await fetchOrders() // Refresh the list
      } catch (error) {
        console.error('Error cancelling order:', error)
        alert('Failed to cancel order. Please try again.')
      }
    }

    // Format date
    const formatDate = (date) => {
      if (!date) return 'N/A'
      const d = date.toDate ? date.toDate() : new Date(date)
      return d.toLocaleString('en-SG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Get items list
    const getItemsList = (items) => {
      if (!items || items.length === 0) return 'No items'
      return items.map(item => item.name || item.itemName).join(', ')
    }

    // Get total quantity
    const getTotalQuantity = (items) => {
      if (!items || items.length === 0) return 0
      return items.reduce((sum, item) => sum + (item.quantity || 1), 0)
    }

    // Get status class
    const getStatusClass = (status) => {
      const classes = {
        reserved: 'status-reserved',
        accepted: 'status-accepted',
        completed: 'status-completed',
        cancelled: 'status-cancelled'
      }
      return classes[status] || 'status-reserved'
    }

    // Get status icon
    const getStatusIcon = (status) => {
      const icons = {
        reserved: 'fas fa-clock',
        accepted: 'fas fa-check-circle',
        completed: 'fas fa-check-double',
        cancelled: 'fas fa-times-circle'
      }
      return icons[status] || 'fas fa-clock'
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

      // Listen for auth changes
      onAuthStateChanged(auth, (user) => {
        if (user) {
          currentUserId.value = user.uid
          fetchOrders()
        } else {
          currentUserId.value = null
          orders.value = []
          loading.value = false
        }
      })
    })

    return {
      isDarkMode,
      loading,
      orders,
      filterStatus,
      sortBy,
      filteredOrders,
      toggleTheme,
      cancelOrder,
      formatDate,
      getItemsList,
      getTotalQuantity,
      getStatusClass,
      getStatusIcon
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

.recent-orders-page {
  min-height: 100vh;
}

.recent-orders-page.dark-theme {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #e2e8f0;
}

/* Filter Card */
.filter-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.filter-card.dark-mode-card {
  background: #1e293b;
  border-color: #334155;
}

.filter-content {
  display: flex;
  gap: 2rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0;
}

.dark-theme .filter-label {
  color: #e2e8f0;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.filter-select.dark-select {
  background: #0f172a;
  border-color: #334155;
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
  color: #10b981;
  margin-bottom: 1rem;
}

.empty-state h4 {
  color: #374151;
  font-weight: 600;
}

.dark-theme .empty-state h4 {
  color: #e2e8f0;
}

/* Orders List */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Order Card */
.order-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.order-card.dark-mode-card {
  background: #1e293b;
  border-color: #334155;
}

/* Order Header */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-bottom: 1px solid #bbf7d0;
}

.dark-theme .order-header {
  background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
  border-bottom-color: #10b981;
}

.order-id {
  font-weight: 700;
  color: #059669;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.dark-theme .order-id {
  color: #10b981;
}

.order-date {
  font-size: 0.9rem;
  color: #6b7280;
}

.dark-theme .order-date {
  color: #94a3b8;
}

/* Order Status */
.order-status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
}

.status-reserved {
  background: #fef3c7;
  color: #92400e;
}

.status-accepted {
  background: #dbeafe;
  color: #1e40af;
}

.status-completed {
  background: #dcfce7;
  color: #065f46;
}

.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

/* Order Body */
.order-body {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.detail-label {
  font-weight: 600;
  color: #6b7280;
  min-width: 120px;
}

.dark-theme .detail-label {
  color: #94a3b8;
}

.detail-value {
  color: #374151;
  flex: 1;
}

.dark-theme .detail-value {
  color: #e2e8f0;
}

/* Order Summary */
.order-summary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.dark-theme .order-summary {
  background: #0f172a;
  border-color: #334155;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  color: #6b7280;
  font-size: 0.95rem;
}

.dark-theme .summary-label {
  color: #94a3b8;
}

.summary-value {
  font-weight: 600;
  color: #374151;
}

.dark-theme .summary-value {
  color: #e2e8f0;
}

.total-row {
  padding-top: 0.75rem;
  border-top: 2px solid #e5e7eb;
  margin-top: 0.5rem;
}

.dark-theme .total-row {
  border-top-color: #334155;
}

.total-amount {
  font-size: 1.5rem;
  color: #059669;
}

.dark-theme .total-amount {
  color: #10b981;
}

/* Order Footer */
.order-footer {
  padding: 1.5rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.dark-theme .order-footer {
  background: #0f172a;
  border-top-color: #334155;
}

/* Responsive */
@media (max-width: 768px) {
  .buyer-dashboard-wrapper {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
  }

  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
  }

  .nav-item {
    border-left: none;
    border-bottom: 3px solid transparent;
  }

  .nav-item.active {
    border-left: none;
    border-bottom-color: #10b981;
  }

  .order-body {
    grid-template-columns: 1fr;
  }

  .filter-content {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select {
    width: 100%;
  }
}
</style>
