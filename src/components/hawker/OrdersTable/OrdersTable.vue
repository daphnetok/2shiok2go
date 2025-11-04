<template>
  <div class="orders-container container">
    <!-- navbar -->
    <!-- Navigation Tabs -->
    <nav class="tabs-nav">
      <ul class="tabs-list">
        <li class="tab-item">
          <router-link to="/hawker-dashboard" class="tab-link">
            <i class="fas fa-home"></i>
            <span> My Listings</span>
          </router-link>
        </li>
        <li class="tab-item active" style="padding:0">
          <router-link to="/orders-table" class="tab-link">
            <i class="fas fa-list"></i>
            <span>Orders Management</span>
          </router-link>
        </li>
        <li class="tab-item">
          <router-link to="/hawker-analytics" class="tab-link">
            <i class="fas fa-chart-simple"></i>
            <span>Analytics</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Header Section -->
    <div class="orders-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-clipboard-list"></i>
          Orders Management
        </h1>
        <div class="header-stats">
          <div class="stat-card">
            <span class="stat-label">Pending</span>
            <span class="stat-value pending">{{ pendingCount }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Completed</span>
            <span class="stat-value completed">{{ completedCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Today's Orders Tab -->
    <div v-if="activeTab === 'today'" class="tab-content">
      <div>
        <!-- Tabs Navigation -->
        <div class="tabs-container">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'today' }"
            @click="activeTab = 'today'"
          >
            <i class="fas fa-calendar-day"></i>
            <span>Today's Orders</span>
            <span v-if="todayOrdersCount > 0" class="tab-badge">{{ todayOrdersCount }}</span>
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'history' }"
            @click="activeTab = 'history'"
          >
            <i class="fas fa-history"></i>
            <span>Order History</span>
          </button>
        </div>

        <!-- Filters and Actions Bar -->
        <div class="actions-bar">
          <!-- Bulk Select -->
          <div class="bulk-select">
            <label class="checkbox-container">
              <input 
                type="checkbox" 
                v-model="selectAll" 
                @change="toggleSelectAll"
              />
              <span class="checkmark"></span>
              <span class="select-text">
                Select All ({{ selectedOrders.length }})
              </span>
            </label>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons d-flex align-items-center gap-2">
            <!-- Accept Selected -->
            <button 
              v-if="selectedPendingCount > 0"
              class="btn-bulk-action"
              @click="acceptSelectedOrders"
            >
              <i class="fas fa-check"></i>
              Accept Selected ({{ selectedPendingCount }})
            </button>

            <!-- Mark Ready -->
            <button 
              v-if="selectedPreparingCount > 0"
              class="btn-bulk-action-blue"
              @click="markSelectedReady"
            >
              <i class="fas fa-check-double"></i>
              Mark Ready ({{ selectedPreparingCount }})
            </button>

            <!-- Status Filter Dropdown -->
            <div class="filter-dropdown ms-3">
              <button 
                class="filter-btn" 
                @click="toggleStatusFilter"
                :class="{ active: isStatusFilterOpen }"
              >
                <i class="fas fa-filter"></i>
                <span>Status</span>
                <span v-if="activeStatusFilters.length > 0" class="filter-badge">
                  {{ activeStatusFilters.length }}
                </span>
                <i class="fas" :class="isStatusFilterOpen ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </button>
              
              <transition name="dropdown-fade">
                <div v-if="isStatusFilterOpen" class="filter-dropdown-content">
                  <label class="filter-option">
                    <input type="checkbox" value="pending" v-model="activeStatusFilters" />
                    <span class="checkbox-custom"></span>
                    <span class="status-dot pending"></span>
                    <span>Pending</span>
                  </label>
                  <label class="filter-option">
                    <input type="checkbox" value="preparing" v-model="activeStatusFilters" />
                    <span class="checkbox-custom"></span>
                    <span class="status-dot preparing"></span>
                    <span>Preparing</span>
                  </label>
                  <label class="filter-option">
                    <input type="checkbox" value="ready" v-model="activeStatusFilters" />
                    <span class="checkbox-custom"></span>
                    <span class="status-dot ready"></span>
                    <span>Ready</span>
                  </label>
                </div>
              </transition>
            </div>
          </div>
        </div>

      </div>

      <!-- Orders List -->
      <LoadingSpinner v-if="loading" message="Loading orders..." />

      <div v-else-if="filteredTodayOrders.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-inbox"></i>
        </div>
        <h3>No Orders Yet</h3>
        <p>New orders will appear here automatically</p>
      </div>

      <div v-else class="orders-grid">
        <div 
          v-for="order in filteredTodayOrders" 
          :key="order.id"
          class="order-card"
          :class="[order.status, { 'selected': selectedOrders.includes(order.id) }]"
        >

          <!-- Order Header -->
          <div class="order-header">
            <div class="order-id-section">

            <!-- Selection Checkbox for Preapring -->
            <div class="order-select" v-if="order.status === 'preparing'">
              <label class="checkbox-container-small">
                <input 
                  type="checkbox" 
                  :value="order.id" 
                  v-model="selectedOrders"
                />
                <span class="checkmark-small"></span>
              </label>
            </div>
            <!-- Selection Checkbox for Pending -->
            <div class="order-select" v-if="order.status === 'pending'">
              <label class="checkbox-container-small">
                <input 
                  type="checkbox" 
                  :value="order.id" 
                  v-model="selectedOrders"
                />
                <span class="checkmark-small-green"></span>
              </label>
            </div>
            
              <span class="order-id">#{{ order.orderID }}</span>
              <span class="order-time">
                <i class="fas fa-clock"></i>
                {{ formatTime(order.timestamp) }}
              </span>
            </div>
            <span class="status-badge" :class="order.status">
              <span class="status-dot"></span>
              {{ getStatusText(order.status) }}
            </span>
          </div>

          <!-- Order Items -->
          <div class="order-items">
            <div 
              v-for="(item, index) in order.items" 
              :key="index"
              class="order-item"
            >
              <img 
                v-if="item.imageUrl" 
                :src="item.imageUrl" 
                :alt="item.itemName"
                class="item-image"
              />
              <div class="item-details">
                <span class="item-name">{{ item.itemName }}</span>
                <span class="item-qty">×{{ item.qty }}</span>
              </div>
              <span class="item-price">${{ item.itemTotal?.toFixed(2) || '0.00' }}</span>
            </div>
          </div>

          <!-- Order Total -->
          <div class="order-total">
            <span class="total-label">Total</span>
            <span class="total-label">${{ order.orderTotal?.toFixed(2) || '0.00' }}</span>
          </div>

          <!-- Customer Info -->
          <!-- <div class="customer-info">
            <i class="fas fa-user"></i>
            <span>Order ID: {{ order.orderID }}</span>
          </div> -->

          <!-- Action Buttons -->
          <div class="order-actions">
            <button 
              v-if="order.status === 'pending'"
              class="btn-action accept"
              @click="acceptOrder(order)"
            >
              <i class="fas fa-check"></i>
              Accept Order
            </button>
            
            <button 
              v-if="order.status === 'preparing'"
              class="btn-action ready"
              @click="markOrderReady(order)"
            >
              <i class="fas fa-bell"></i>
              Mark Ready
            </button>

            <button 
              v-if="order.status === 'ready'"
              class="btn-action complete"
              @click="markOrderCollected(order)"
            >
              <i class="fas fa-check-circle"></i>
              Collected
            </button>

            <button 
              v-if="order.status === 'completed'"
              class="btn-action view"
              @click="viewOrderDetails(order)"
            >
              <i class="fas fa-eye"></i>
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Order History Tab -->
    <div v-else class="tab-content">
      <!-- Tabs Navigation -->
      <div class="tabs-container">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'today' }"
          @click="activeTab = 'today'"
        >
          <i class="fas fa-calendar-day"></i>
          <span>Today's Orders</span>
          <span v-if="todayOrdersCount > 0" class="tab-badge">{{ todayOrdersCount }}</span>
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'history' }"
          @click="activeTab = 'history'"
        >
          <i class="fas fa-history"></i>
          <span>Order History</span>
        </button>
      </div>

      <!-- Filters and Actions Bar -->
      <div class="actions-bar">
        <div class="bulk-select">
          <label class="checkbox-container">
            <input 
              type="checkbox" 
              v-model="selectAll" 
              @change="toggleSelectAllHistory"
            />
            <span class="checkmark"></span>
            <span class="select-text">Select All ({{ selectedOrders.length }})</span>
          </label>
        </div>
        
        <div class="action-buttons">
          <button 
            v-if="selectedOrders.length > 0"
            class="btn-bulk-action delete"
            @click="deleteSelectedOrders"
          >
            <i class="fas fa-trash"></i>
            Delete Selected ({{ selectedOrders.length }})
          </button>

          <button class="sort-btn" @click="toggleSortOrder">
            <i class="fas" :class="sortOrder === 'desc' ? 'fa-arrow-down' : 'fa-arrow-up'"></i>
            <span>{{ sortOrder === 'desc' ? 'Newest First' : 'Oldest First' }}</span>
          </button>
        </div>
      </div>

      <LoadingSpinner v-if="loadingHistory" message="Loading history..." />

      <div v-else-if="sortedHistory.length === 0" class="emptyState">
        <div class="empty-icon">
          <i class="fas fa-archive"></i>
        </div>
        <h3>No Order History</h3>
        <p>Completed orders will appear here</p>
      </div>

      <div v-else class="history-table">
        <div class="history-row header">
          <span class="col-select"></span>
          <span class="col-id">Order ID</span>
          <span class="col-date">Date</span>
          <span class="col-time">Time</span>
          <span class="col-items">Items</span>
          <span class="col-total">Total</span>
        </div>

        <div 
          v-for="order in sortedHistory" 
          :key="order.id"
          class="history-row"
          :class="{ 'selected': selectedOrders.includes(order.id) }"
        >
          <!-- Select Checkbox -->
          <span class="col-select">
            <label class="checkbox-container-small">
              <input 
                type="checkbox" 
                :value="order.id" 
                v-model="selectedOrders"
              />
              <span class="checkmark-small"></span>
            </label>
          </span>

          <span class="col-id">#{{ order.orderID }}</span>
          <span class="col-date">{{ formatDate(order.timestamp) }}</span>
          <span class="col-time">{{ formatTime(order.timestamp) }}</span>

          <td>
            <p v-for="i in order.items" :key="i.itemName" class="col-items">
              {{ i.itemName }}
            </p>
          </td>

          <span class="col-total">${{ order.orderTotal?.toFixed(2) }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script src="./OrdersTable.js"></script>
<style scoped src="./OrdersTable.css"></style>