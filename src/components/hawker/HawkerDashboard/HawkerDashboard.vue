<template>
  <!-- Alert Box -->
  <div class="custom-alert-container" v-if="alert.show" :class="alert.type">
    <div class="custom-alert-content">
      <button v-if="alert.type === 'success' || alert.type === 'error'" class="alert-close-btn" @click="closeAlert">
        <i class="fas fa-times"></i>
      </button>
      <h5>{{ alert.actionType }}</h5>
      <span class="alert-icon" v-if="alert.type !== 'confirmation'">
        <i v-if="alert.type === 'success'" class="fas fa-check-circle"></i>
        <i v-else-if="alert.type === 'error'" class="fas fa-exclamation-circle"></i>
      </span>
      <p class="alert-message" v-if="alert.type !== 'confirmation'">{{ alert.message }}</p>
      
      <p v-else class="alert-message">{{ alert.message }}</p>
      <div v-if="alert.type === 'confirmation'" class="confirmation-buttons">
        <button class="btn-cancel" @click="confirmationCancel">Cancel</button>
        <button v-if="alert.actionType === 'Delete'" class="btn-delete" @click="confirmationConfirm">Delete</button>
        <button v-else class="btn-confirm" @click="confirmationConfirm">Confirm</button>
      </div>
    </div>
  </div>

  <!-- Edit Listing Modal -->
  <EditModal
    :isVisible="editModalVisible"
    :listing="listingToEdit"
    @close="closeEditModal"
    @saved="onListingSaved"
  />
  
  <div class="dashboard-container">
    <!-- Header Section -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="page-title">My Listings</h1>
        <router-link to="/create-listing" class="btn-create">
          <i class="fas fa-plus"></i>
          <span>Create New Listing</span>
        </router-link>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <nav class="tabs-nav">
      <ul class="tabs-list">
        <li class="tab-item active">
          <a href="#" class="tab-link">
            <i class="fas fa-home"></i>
            <span>Listings</span>
          </a>
        </li>
        <li class="tab-item">
          <router-link to="/orders-table" class="tab-link">
            <i class="fas fa-list"></i>
            <span>Orders</span>
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

    <!-- Active Listings Section -->
    <section class="listings-section">
      <div class="section-header">
        <h2 class="section-title">
          Active Listings
          <span class="count-badge">{{ activeListings.length }}</span>
        </h2>
      </div>

      <div v-if="activeListings.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-box-open"></i>
        </div>
        <h3>No Active Listings</h3>
        <p>Create your first listing to start selling!</p>
        <router-link to="/create-listing" class="btn-create-inline">
          Create Listing
        </router-link>
      </div>

      <div v-else class="listings-grid">
        <div class="listing-card" v-for="listing of activeListings" :key="listing.id">
          <!-- Image Section -->
          <div class="listing-image-container">
            <img :src="listing.imageUrl" :alt="listing.itemName" class="listing-image">
            <div class="listing-overlay">
              <div class="quick-actions">
                <button class="action-btn edit" @click="editListing(listing.id)" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn deactivate" @click="deactivateListing(listing.id)" title="Deactivate">
                  <i class="fas fa-circle-minus"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Content Section -->
          <div class="listing-content">
            <h3 class="listing-name">{{ listing.itemName }}</h3>
            
            <div class="price-section">
              <span class="current-price">${{ listing.discountedPrice }}</span>
              <span class="original-price">${{ listing.itemPrice }}</span>
              <span class="discount-badge" v-if="listing.discount">
                -{{ listing.discount }}%
              </span>
            </div>

            <div class="stats-section">
              <div class="stat-item">
                <div class="stat-icon stock-icon">
                  <i class="fas fa-box"></i>
                </div>
                <div class="stat-info">
                  <span class="stat-label">Stock</span>
                  <span class="stat-value" :class="getStockClass(listing.itemQty)">
                    {{ listing.itemQty }}
                  </span>
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-icon orders-icon">
                  <i class="fas fa-shopping-bag"></i>
                </div>
                <div class="stat-info">
                  <span class="stat-label">Orders</span>
                  <span class="stat-value">{{ listing.orders || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Inactive Listings Section -->
    <section class="listings-section inactive-section">
      <div class="section-header">
        <h2 class="section-title inactive">
          Inactive Listings
          <span class="count-badge inactive">{{ inactiveListings.length }}</span>
        </h2>
      </div>

      <div v-if="inactiveListings.length === 0" class="emptyState">
        <div class="empty-icon">
          <i class="fas fa-archive"></i>
        </div>
        <h3>No Inactive Listings</h3>
        <p>Your deactivated listings will appear here</p>
      </div>

      <div v-else class="listings-grid">
        <div class="listing-card inactive" v-for="listing in inactiveListings" :key="listing.id">
          <!-- Image Section -->
          <div class="listing-image-container">
            <img :src="listing.imageUrl" :alt="listing.itemName" class="listing-image">
            <div class="inactive-overlay">
              <span class="inactive-badge">Inactive</span>
            </div>
            <div class="listing-overlay">
              <div class="quick-actions-inactive">
                <button class="action-btn edit" @click="editListing(listing.id)" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn duplicate" @click="duplicateListing(listing)" title="Duplicate">
                  <i class="fas fa-copy"></i>
                </button>
                <button class="action-btn activate" @click="activateListing(listing.id)" title="Activate">
                  <i class="fas fa-circle-plus"></i>
                </button>
                <button class="action-btn delete" @click="deleteListingWithImage(listing.id, listing.imagePath)" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Content Section -->
          <div class="listing-content">
            <h3 class="listing-name">{{ listing.itemName }}</h3>
            
            <div class="price-section">
              <span class="current-price">${{ listing.discountedPrice }}</span>
              <span class="original-price">${{ listing.itemPrice }}</span>
            </div>

            <div class="stats-section">
              <div class="stat-item">
                <div class="stat-icon stock-icon">
                  <i class="fas fa-box"></i>
                </div>
                <div class="stat-info">
                  <span class="stat-label">Stock</span>
                  <span class="stat-value">{{ listing.itemQty }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { onMounted } from 'vue';
import {
  alert,
  activeListings,
  inactiveListings,
  showAlert,
  closeAlert,
  showConfirmation,
  confirmationConfirm,
  confirmationCancel,
  deactivateListing,
  activateListing,
  deleteListingWithImage,
  editListing,
  duplicateListing,
  editModalVisible,
  listingToEdit,
  closeEditModal,
  onListingSaved
} from '@/components/hawker/useSharedListings';

import EditModal from '@/components/hawker/editModal/editModal.vue';

export default {
  name: "HawkerListings",
  components: {
    EditModal
  },
  setup() {
    onMounted(() => {
      console.log("HawkerDashboard mounted");
    });

    const getStockClass = (stock) => {
      if (stock <= 5) return 'critical';
      if (stock <= 10) return 'low';
      return 'normal';
    };

    return {
      alert,
      activeListings,
      inactiveListings,
      showAlert,
      closeAlert,
      showConfirmation,
      confirmationConfirm,
      confirmationCancel,
      deactivateListing,
      activateListing,
      deleteListingWithImage,
      editListing,
      duplicateListing,
      editModalVisible,
      listingToEdit,
      closeEditModal,
      onListingSaved,
      getStockClass
    };
  }
};
</script>

<style src="../HawkerDashboard/HawkerDashboard.css"></style>