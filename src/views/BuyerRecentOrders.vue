<template>
  <div class="buyer-dashboard-wrapper" :class="{ 'dark-theme': isDarkMode }">

    <!-- Alert Box -->
    <transition name="alert-scale">
      <div 
        v-if="alert.show" 
        class="custom-alert-overlay"
        @click.self="alert.type !== 'confirmation' && alert.type !== 'redirect' && closeAlert()"
      >
        <div class="custom-alert-container" :class="alert.type">
          <div class="custom-alert-content">
            <!-- Close Button (top right) -->
            <button 
              v-if="alert.type !== 'confirmation'" 
              class="alert-close-btn-top" 
              @click="closeAlert"
            >
              <i class="fas fa-times"></i>
            </button>

            <!-- Icon Section -->
            <div class="alert-icon-section">
              <div v-if="alert.type === 'success'" class="alert-icon-circle success">
                <i class="fas fa-check"></i>
              </div>
              <div v-else-if="alert.type === 'error'" class="alert-icon-circle error">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <div v-else-if="alert.type === 'confirmation'" class="alert-icon-circle warning">
                <i class="fas fa-question"></i>
              </div>
            </div>

            <!-- Message Section -->
            <div class="alert-message-section">
              <h3 v-if="alert.type === 'success'" class="alert-title">Success!</h3>
              <h3 v-else-if="alert.type === 'error'" class="alert-title">Error</h3>
              <h3 v-else-if="alert.type === 'confirmation'" class="alert-title">Confirm Action</h3>
              
              <p class="alert-message">{{ alert.message }}</p>
            </div>

            <!-- Action Buttons Section -->
            <div class="mx-auto">
              <div class="alert-actions">
                <!-- Confirmation Buttons -->
                <div v-if="alert.type === 'confirmation'" class="button-group">
                  <button class="alert-btn alert-btn-cancel" @click="confirmationCancel">
                    <i class="fas fa-times"></i>
                    <span>Cancel</span>
                  </button>
                  <button 
                    v-if="alert.actionType === 'Delete' || alert.actionType === 'Cancel'" 
                    class="alert-btn alert-btn-danger" 
                    @click="confirmationConfirm"
                  >
                    <i class="fas" :class="alert.actionType === 'Delete' ? 'fa-trash' : 'fa-times'"></i>
                    <span>{{ alert.actionType }}</span>
                  </button>
                  <button 
                    v-else 
                    class="alert-btn alert-btn-primary" 
                    @click="confirmationConfirm"
                  >
                    <i class="fas fa-check"></i>
                    <span>Confirm</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>


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
            <div class="col-12 col-lg-8 mb-3 mb-lg-0 text-center text-lg-start">
              <h2 class="mb-0 fw-bold d-flex align-items-center justify-content-center justify-content-lg-start" style="color: #059669;">
                <i class="fas fa-shopping-bag" style="font-size: 2rem; margin-right: 0.75rem;"></i>
                Recent Orders
              </h2>
              <p class="mb-0 mt-2 text-muted">Track your food rescue orders</p>
            </div>
            <div class="col-12 col-lg-4 text-center text-lg-end">
              <button class="btn btn-outline-secondary no-print" style="border-radius: 8px;" @click="toggleTheme">
                <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
                <span class="d-none d-sm-inline">{{ isDarkMode ? 'Light' : 'Dark' }} Mode</span>
                <span class="d-sm-none">Theme</span>
              </button>
            </div>
          </div>
        </div>

        <div class="container-fluid" style="padding-left: 3rem; padding-right: 3rem;">
          <!-- Filter Section -->
          <div class="row mb-3">
            <div class="col-12">
              <div class="filter-card" :class="{ 'dark-mode-card': isDarkMode }">
                <div class="filter-content">
                  <div class="filter-group">
                    <label class="filter-label">Status:</label>
                    <select v-model="filterStatus" class="filter-select" :class="{ 'dark-select': isDarkMode }">
                      <option value="all">All Orders</option>
                      <option value="in-progress">In Progress</option>
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
          <LoadingSpinner 
            v-if="loading" 
            message="Loading your orders..."
            :container-class="isDarkMode ? 'loading-state dark-mode-card' : 'loading-state'"
          />

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
                <!-- Order Items with Images -->
                <div class="order-items mb-3" v-if="order.items && order.items.length > 0">
                  <h6 class="mb-2" style="font-size: 0.9rem; font-weight: 600; color: #059669;">Order Items:</h6>
                  <div class="items-grid">
                    <div v-for="(item, idx) in order.items" :key="idx" class="item-card">
                      <ImageWithLoader
                        v-if="item.imageUrl || item.image" 
                        :src="item.imageUrl || item.image" 
                        :alt="item.itemName || item.name"
                        image-class="item-image"
                        error-icon="fas fa-utensils"
                      />
                      <div v-else class="item-image-placeholder">
                        <i class="fas fa-utensils"></i>
                      </div>
                      <div class="item-info">
                        <div class="item-name">{{ item.itemName || item.name || 'Unknown Item' }}</div>
                        <div class="item-details">
                          <span class="item-quantity">Qty: {{ item.qty || item.quantity || 1 }}</span>
                          <span class="item-price">${{ formatPrice(item.itemPrice || item.price) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="order-details">
                  <div class="detail-row">
                    <span class="detail-label">
                      <i class="fas fa-store me-2"></i>Hawker:
                    </span>
                    <span class="detail-value">{{ order.hawkerName || 'Unknown Hawker' }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">
                      <i class="fas fa-box me-2"></i>Total Items:
                    </span>
                    <span class="detail-value">{{ getTotalQuantity(order.items) }} item(s)</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">
                      <i class="fas fa-clock me-2"></i>Pickup Time:
                    </span>
                    <span class="detail-value">{{ order.pickupTime || order.time || 'To be confirmed' }}</span>
                  </div>
                </div>
                
                <div class="order-summary">
                  <div class="summary-row">
                    <span class="summary-label">Subtotal:</span>
                    <span class="summary-value">${{ formatPrice(calculateSubtotal(order.items)) }}</span>
                  </div>
                  <div class="summary-row" v-if="order.discount && order.discount > 0">
                    <span class="summary-label">Discount:</span>
                    <span class="summary-value text-success">-${{ formatPrice(order.discount) }}</span>
                  </div>
                  <div class="summary-row total-row">
                    <span class="summary-label fw-bold">Total Amount:</span>
                    <span class="summary-value total-amount">${{ formatPrice(calculateTotal(order)) }}</span>
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
                <button class="btn btn-outline-success btn-sm" 
                        style="border-radius: 8px;"
                        @click="contactSupport(order.id)">
                  <i class="fas fa-headset me-2"></i>Contact Us
                </button>
                <button class="btn btn-outline-primary btn-sm" 
                        style="border-radius: 8px;"
                        @click="viewOrderDetails(order.id)">
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
import { useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getOrdersByUser, cancelOrder as cancelOrderService } from '@/services/orderService'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import ImageWithLoader from '@/components/shared/ImageWithLoader.vue'

export default {
  name: 'BuyerRecentOrders',
  components: { LoadingSpinner, ImageWithLoader },
  setup() {
    const router = useRouter()
    const isDarkMode = ref(false)
    const loading = ref(true)
    const orders = ref([])
    const filterStatus = ref('all')
    const sortBy = ref('newest')
    const currentUserId = ref(null)

    const auth = getAuth()


  // Alert or Confirmation boxes
  const alert = ref({
    show: false,
    type: '',
    message: '',
    actionType: '',
    onConfirm: null,
    onCancel: null
  })

  const showAlert = (type, message) => {
    alert.value = {
      show: true,
      type,
      message
    }
  }

  const showConfirmation = (message, actionType, onConfirm, onCancel) => {
    alert.value = {
      show: true,
      type: 'confirmation',
      message,
      actionType,
      onConfirm,
      onCancel
    }
  }

  const closeAlert = () => {
    alert.value.show = false
  }

  const confirmationConfirm = () => {
    if (alert.value.onConfirm) alert.value.onConfirm()
    alert.value.show = false
  }

  const confirmationCancel = () => {
    if (alert.value.onCancel) alert.value.onCancel()
    alert.value.show = false
  }

    // Filter and sort orders
    const filteredOrders = computed(() => {
      let filtered = orders.value

      // Filter by status
      if (filterStatus.value !== 'all') {
        if (filterStatus.value === 'in-progress') {
          // In-progress includes reserved and accepted orders
          filtered = filtered.filter(order => 
            order.status === 'reserved' || order.status === 'accepted'
          )
        } else {
          filtered = filtered.filter(order => order.status === filterStatus.value)
        }
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
        console.log('Fetched orders:', fetchedOrders)
        
        // Log first order to see data structure
        if (fetchedOrders.length > 0) {
          console.log('Sample order:', fetchedOrders[0])
          console.log('Sample order items:', fetchedOrders[0].items)
          console.log('Calculated subtotal:', calculateSubtotal(fetchedOrders[0].items))
          console.log('Discount:', fetchedOrders[0].discount)
          console.log('Calculated total:', calculateTotal(fetchedOrders[0]))
        }
        
        orders.value = fetchedOrders
      } catch (error) {
        console.error('Error fetching orders:', error)
        showAlert('error', 'Failed to load orders. Please try again later.')
      } finally {
        loading.value = false
      }
    }

    // Cancel order
    const cancelOrder = async (orderId) => {
      // if (!confirm('Are you sure you want to cancel this order?')) return
      showConfirmation(
        'Are you sure you want to cancel this order? This action cannot be undone.',
        'Cancel',
        async () => {
          try {
            await cancelOrderService(orderId)
            await fetchOrders() // Refresh the list
            showAlert('success', 'Order cancelled successfully!')
          } catch (error) {
            console.error('Error cancelling order:', error)
            showAlert('error', 'Failed to cancel order. Please try again.')
          }
        },
        () => {
          // User cancelled the confirmation
        }
      )

      // try {
      //   await cancelOrderService(orderId)
      //   await fetchOrders() // Refresh the list
      // } catch (error) {
      //   console.error('Error cancelling order:', error)
      //   showAlert('error', 'Failed to cancel order. Please try again.')
      // }
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

    // Format price
    const formatPrice = (price) => {
      if (price === null || price === undefined) return '0.00'
      const numPrice = typeof price === 'number' ? price : parseFloat(price) || 0
      return numPrice.toFixed(2)
    }

    // Calculate subtotal from items
    const calculateSubtotal = (items) => {
      if (!items || items.length === 0) return 0
      return items.reduce((sum, item) => {
        // Try itemTotal first (pre-calculated), then calculate from price * quantity
        let itemTotal = 0
        if (item.itemTotal !== undefined) {
          itemTotal = parseFloat(item.itemTotal) || 0
        } else if (item.itemPrice !== undefined) {
          itemTotal = (parseFloat(item.itemPrice) || 0) * (parseInt(item.qty) || parseInt(item.quantity) || 1)
        } else {
          itemTotal = (parseFloat(item.price) || 0) * (parseInt(item.qty) || parseInt(item.quantity) || 1)
        }
        return sum + itemTotal
      }, 0)
    }

    // Calculate total with discount
    const calculateTotal = (order) => {
      if (order.totalAmount !== undefined) return order.totalAmount
      if (order.total !== undefined) return order.total
      
      const subtotal = order.subtotal || calculateSubtotal(order.items)
      const discount = parseFloat(order.discount) || 0
      return subtotal - discount
    }

    // Handle image error
    const handleImageError = (event) => {
      event.target.style.display = 'none'
      if (event.target.nextElementSibling) {
        event.target.nextElementSibling.style.display = 'flex'
      }
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

    // View order details - navigate to receipt page
    const viewOrderDetails = (orderId) => {
      router.push({ name: 'OrderReceipt', params: { orderId } })
    }

    // Contact support - navigate to support form with order ID
    const contactSupport = (orderId) => {
      router.push({ 
        name: 'ContactSupport', 
        query: { orderId: orderId }
      })
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
      viewOrderDetails,
      contactSupport,
      formatDate,
      formatPrice,
      calculateSubtotal,
      calculateTotal,
      handleImageError,
      getItemsList,
      getTotalQuantity,
      getStatusClass,
      getStatusIcon,
      alert,
      showAlert,
      showConfirmation,
      closeAlert,
      confirmationConfirm,
      confirmationCancel
    }
  }
}
</script>

<style scoped>
@import '@/assets/css/dashboard-theme.css';
@import '@/assets/css/alertBoxes.css';

/* Wrapper Layout */
.buyer-dashboard-wrapper {
  display: flex;
  min-height: 100vh;
  transition: all 0.3s ease;
  position: relative;
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
  background: transparent;
}

.recent-orders-page {
  min-height: 100vh;
  background: transparent;
  padding-bottom: 2rem;
}

.recent-orders-page.dark-theme {
  background: transparent;
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 1.25rem;
  max-width: 100%;
}

/* Order Card */
.order-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  height: fit-content;
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
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-bottom: 1px solid #bbf7d0;
  gap: 1rem;
  flex-wrap: wrap;
}

.dark-theme .order-header {
  background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
  border-bottom-color: #10b981;
}

.order-info {
  flex: 1;
  min-width: 0;
}

.order-id {
  font-weight: 700;
  color: #059669;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
  word-break: break-word;
  overflow-wrap: break-word;
}

.dark-theme .order-id {
  color: #10b981;
}

.order-date {
  font-size: 0.8rem;
  color: #6b7280;
  word-break: break-word;
  overflow-wrap: break-word;
}

.dark-theme .order-date {
  color: #94a3b8;
}

/* Order Status */
.order-status {
  padding: 0.375rem 0.875rem;
  border-radius: 16px;
  font-weight: 600;
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  flex-shrink: 0;
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
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Order Items Grid */
.order-items {
  padding-bottom: 0.875rem;
  border-bottom: 1px solid #e5e7eb;
}

.dark-mode-card .order-items {
  border-bottom-color: #374151;
}

.order-items h6 {
  font-size: 0.85rem !important;
  margin-bottom: 0.75rem !important;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
}

.item-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  align-items: center;
  text-align: center;
}

.dark-mode-card .item-card {
  background: #374151;
  border-color: #4b5563;
}

.item-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-image,
.item-image-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.item-image-placeholder {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.item-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-name {
  font-weight: 600;
  font-size: 0.8rem;
  color: #111827;
  margin-bottom: 0.125rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: normal;
  line-height: 1.3;
}

.dark-mode-card .item-name {
  color: #f9fafb;
}

.item-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  gap: 0.5rem;
  width: 100%;
}

.item-quantity {
  color: #6b7280;
  font-weight: 500;
}

.dark-mode-card .item-quantity {
  color: #9ca3af;
}

.item-price {
  color: #059669;
  font-weight: 700;
}

.dark-mode-card .item-price {
  color: #10b981;
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.detail-label {
  font-weight: 600;
  color: #6b7280;
  min-width: 110px;
  flex-shrink: 0;
  word-break: keep-all;
  white-space: nowrap;
  font-size: 0.85rem;
}

.dark-theme .detail-label {
  color: #94a3b8;
}

.detail-value {
  color: #374151;
  flex: 1;
  word-break: break-word;
  overflow-wrap: break-word;
  min-width: 0;
  font-size: 0.85rem;
}

.dark-theme .detail-value {
  color: #e2e8f0;
}

/* Order Summary */
.order-summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 10px;
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
  font-size: 0.85rem;
}

.summary-label {
  color: #6b7280;
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
  padding-top: 0.5rem;
  border-top: 2px solid #e5e7eb;
  margin-top: 0.25rem;
}

.dark-theme .total-row {
  border-top-color: #334155;
}

.total-amount {
  font-size: 1.25rem;
  color: #059669;
}

.dark-theme .total-amount {
  color: #10b981;
}

/* Order Footer */
.order-footer {
  padding: 1rem 1.25rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.625rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.order-footer .btn {
  font-size: 0.8rem;
  padding: 0.5rem 0.875rem;
}

.dark-theme .order-footer {
  background: #0f172a;
  border-top-color: #334155;
}

/* Responsive */
@media (max-width: 992px) {
  .buyer-dashboard-wrapper {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    margin: 0;
    border-radius: 0;
    position: static;
    max-height: none;
    padding: 12px 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .sidebar-nav {
    flex-direction: row;
    justify-content: space-between;
    overflow-x: auto;
    gap: 0;
    padding: 0;
  }

  .nav-item {
    flex-direction: column;
    padding: 12px 8px;
    min-width: 0;
    flex: 1;
    text-align: center;
    gap: 6px;
    border-radius: 0;
    margin: 0;
    border: none;
    border-bottom: 3px solid transparent;
  }

  .nav-item span {
    font-size: 0.7rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .nav-item i {
    font-size: 1.25rem;
    margin: 0;
    width: auto;
  }

  .nav-item.active {
    border-bottom: 3px solid #388e3c;
    border-radius: 0;
  }

  .dark-sidebar .nav-item.active {
    border-bottom-color: #10b981;
  }

  h2 {
    font-size: 1.75rem !important;
  }
  
  .container-fluid {
    padding-left: 2rem !important;
    padding-right: 2rem !important;
  }

  .orders-list {
    grid-template-columns: 1fr;
  }

  .filter-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select {
    width: 100%;
  }
  
  .container-fluid {
    padding-left: 1.5rem !important;
    padding-right: 1.5rem !important;
  }
  
  h2 {
    font-size: 1.5rem !important;
  }
  
  .order-footer {
    flex-direction: column;
  }
  
  .order-footer button {
    width: 100%;
  }
  
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .order-status {
    align-self: flex-start;
  }
  
  .detail-label {
    min-width: 100px;
    font-size: 0.85rem;
  }
  
  .detail-value {
    font-size: 0.9rem;
  }
  
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}

@media (max-width: 575px) {
  .sidebar {
    padding: 10px 0;
  }
  
  .nav-item {
    padding: 10px 4px;
    gap: 4px;
  }
  
  .nav-item span {
    font-size: 0.65rem;
  }
  
  .nav-item i {
    font-size: 1rem;
  }
  
  .container-fluid {
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }
  
  .order-card {
    margin-bottom: 1rem;
  }

  .items-grid {
    grid-template-columns: 1fr;
  }
  
  .item-card {
    flex-direction: row;
  }
  
  .order-id {
    font-size: 0.95rem;
  }
  
  .order-date {
    font-size: 0.8rem;
  }
  
  .order-status {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
  }
  
  .detail-label {
    min-width: 90px;
    font-size: 0.8rem;
  }
  
  .detail-value {
    font-size: 0.85rem;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .detail-label {
    min-width: auto;
  }
}

/* Print Styles */
@media print {
  .no-print,
  .sidebar,
  .btn,
  button,
  .filter-card {
    display: none !important;
  }
  
  .buyer-dashboard-wrapper,
  .buyer-dashboard-wrapper.dark-theme {
    display: block !important;
    background: white !important;
  }
  
  .main-content {
    width: 100% !important;
  }
  
  .recent-orders-page,
  .recent-orders-page.dark-theme {
    background: white !important;
    color: black !important;
  }
  
  h2,
  .dark-theme h2 {
    color: #059669 !important;
  }
  
  .order-card,
  .order-card.dark-mode-card {
    background: white !important;
    border: 1px solid #e5e7eb !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
    page-break-inside: avoid;
  }
  
  .order-header,
  .dark-theme .order-header {
    background: #f0fdf4 !important;
    border-bottom: 1px solid #bbf7d0 !important;
  }
  
  .order-body,
  .order-footer {
    background: white !important;
  }
  
  .text-muted,
  .dark-theme .text-muted {
    color: #6b7280 !important;
  }
  
  .container-fluid {
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }
}
</style>
