<template>
  <!-- Alert Box -->
<transition name="alert-scale">
  <div 
    v-if="alert.show" 
    class="custom-alert-overlay"
    @click.self="alert.type !== 'confirmation' && closeAlert()"
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
          <div v-if="alert.type === 'success'" class="alert-icon-circle" :class="alert.type">
            <i 
              class="fas" 
              :class="{
                'fa-check': alert.type === 'success',
                // 'fa-exclamation-triangle': alert.actionType === 'Delete',
                // 'fa-question': alert.type === 'confirmation'
              }"
            ></i>
          </div>
        </div>

        <!-- Message Section -->
        <div class="alert-message-section">
          <h3 class="alert-title">{{ alert.actionType }}</h3>
          <p class="alert-message">{{ alert.message }}</p>
        </div>

        <!-- Action Buttons Section -->
        <div class="alert-actions" v-if="alert.type === 'confirmation'">
          <div class="button-group">
            <button class="alert-btn alert-btn-cancel" @click="confirmationCancel">
              <i class="fas fa-times"></i>
              <span>Cancel</span>
            </button>
            <button 
              v-if="alert.actionType === 'Delete'" 
              class="alert-btn alert-btn-danger" 
              @click="confirmationConfirm"
            >
              <i class="fas fa-trash"></i>
              <span>Delete</span>
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
</transition>

  <!-- Edit Listing Modal -->
  <EditModal
    :isVisible="editModalVisible"
    :listing="listingToEdit"
    @close="closeEditModal"
    @saved="onListingSaved"
  />
  
  <div class="container-fluid px-3 px-md-4">
    <!-- Navigation Tabs -->
    <nav class="tabs-nav">
      <ul class="tabs-list">
        <li class="tab-item active" style="padding:0">
          <a href="#" class="tab-link">
            <i class="fas fa-home"></i>
            <span> My Listings</span>
          </a>
        </li>
        <li class="tab-item">
          <router-link to="/orders-table" class="tab-link" >
          <i class="fas fa-clipboard-list"></i>
            <span>Orders Management</span>
          </router-link>
        </li>
        <li class="tab-item">
          <router-link to="/hawker-analytics" class="tab-link">
            <i class="fas fa-chart-simple"></i>
            <span>Analytics</span>
          </router-link>
        </li>
        <li class="tab-item">
          <router-link to="/edit-form" class="tab-link">
            <i class="fas fa-file-edit"></i>
            <span>Edit Stall Info</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </div>

  <div class="container-fluid px-3 px-md-4 py-2 py-md-3">
    <!-- Header Section -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="page-title">{{ hawkerName }}'s Listings</h1>
        <router-link to="/create-listing" class="btn-create">
          <i class="fas fa-plus"></i>
          <span>Create New Listing</span>
        </router-link>
      </div>
    </div>


    <!-- Active Listings Section -->
    <section class="listings-section dashboard-container">
      <div class="section-header mb-5">
        <h2 class="listings-section-title">
          Active Listings
          <span class="count-badge">{{ activeListings.length }}</span>
        </h2>
      </div>

      <div v-if="activeListings.length === 0" class="emptyState">
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
            <ImageWithLoader 
              :src="listing.imageUrl" 
              :alt="listing.itemName" 
              image-class="listing-image"
              error-icon="fas fa-utensils"
            />

            <!-- Discount start time -->
            <div v-if="listing.discountTime" class="discount-time-badge">
              Starts: {{ listing.discountTime }}
            </div>
            
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
              <span class="current-price">${{ listing.discountedPrice.toFixed(2) }}</span>
              <span class="original-price">${{ listing.itemPrice.toFixed(2) }}</span>
              <span class="discount-badge" v-if="listing.discount">
                -{{ listing.discount }}%
              </span>
            </div>

            <div class="stats-section">
              <div class="stat-item">
                <div class="stat-info">
                  <span class="stat-label">Stock</span>
                  <span class="stat-value" :class="getStockClass(listing.itemQty)">
                    {{ listing.itemQty }}
                  </span>
                </div>
              </div>

              <!-- <div class="stat-item">
                <div class="stat-info">
                  <span class="stat-label">Orders</span>
                  <span class="stat-value">{{ listing.orders || 0 }}</span>
                </div>
              </div> -->
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Inactive Listings Section -->
    <section class="listings-section inactive-section dashboard-container">
      <div class="section-header mb-5">
        <h2 class="listings-section-title inactive">
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
            <ImageWithLoader 
              :src="listing.imageUrl" 
              :alt="listing.itemName" 
              image-class="listing-image"
              error-icon="fas fa-utensils"
            />

            <!-- Discount start time -->
            <div v-if="listing.discountTime" class="discount-time-badge">
              Starts: {{ listing.discountTime }}
            </div>

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
import { ref, onMounted } from 'vue'
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
} from '@/components/hawker/useSharedListings'

import EditModal from '@/components/hawker/editModal/editModal.vue'
import ImageWithLoader from '@/components/shared/ImageWithLoader.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '/firebase/config'

export default {
  name: "HawkerListings",
  components: {
    EditModal,
    ImageWithLoader
  },
  setup() {
    const hawkerName = ref('') // store name reactively

    // ✅ Function to fetch hawker name
    const getHawkerName = async () => {
      const auth = getAuth()
      return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
          if (!user) {
            console.error('❌ No user logged in')
            hawkerName.value = 'Hawker'
            return resolve(null)
          }

          try {
            const hawkerListingsRef = collection(db, 'hawkerListings')
            const q = query(hawkerListingsRef, where('userId', '==', user.uid))
            const querySnapshot = await getDocs(q)

            if (querySnapshot.empty) {
              console.warn('⚠️ No hawker listing found for this user')
              hawkerName.value = 'Hawker'
              return resolve(null)
            }

            const hawkerData = querySnapshot.docs[0].data()
            hawkerName.value =
              hawkerData.hawkerName ||
              hawkerData.name ||
              hawkerData.stallName ||
              'Hawker'

            console.log('✅ Hawker name fetched:', hawkerName.value)
            resolve(hawkerName.value)
          } catch (error) {
            console.error('❌ Error fetching hawker name:', error)
            hawkerName.value = 'Hawker'
            reject(error)
          }
        })
      })
    }

    // Run when component is mounted
    onMounted(() => {
      console.log("HawkerDashboard mounted")
      getHawkerName()
    })

    const getStockClass = (stock) => {
      if (stock <= 5) return 'critical'
      if (stock <= 10) return 'low'
      return 'normal'
    }

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
      getStockClass,
      hawkerName
    }
  }
}
</script>


<style scoped>
@import '@/assets/css/HawkerDashboard.css';
@import './HawkerDashboard.css';
@import '/src/assets/css/alertBoxes.css';
</style>