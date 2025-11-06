<template>
  <div class="nav-container">
    <div>
      <div class="container-fluid px-3 px-md-4">
        <!-- Navigation Tabs -->
        <nav class="tabs-nav">
          <ul class="tabs-list">
            <li class="tab-item" style="padding:0">
              <router-link to="/hawker-dashboard" class="tab-link">
                <i class="fas fa-home"></i>
                <span> My Listings</span>
              </router-link>
            </li>
            <li class="tab-item" style="padding:0">
              <router-link to="/orders-table" class="tab-link">
                <i class="fas fa-clipboard-list"></i>
                <span>Orders Management</span>
              </router-link>
            </li>
            <li class="tab-item"style="padding:0">
              <router-link to="/hawker-analytics" class="tab-link">
                <i class="fas fa-chart-simple"></i>
                <span>Analytics</span>
              </router-link>
            </li>
            <li class="tab-item active" style="padding:0">
              <a href="#" class="tab-link">
                <i class="fas fa-file-edit"></i>
                <span>Edit Stall Info</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div class="container-fluid px-3 px-md-4 py-2 py-md-3">
        <!-- Header Section -->
        <div class="dashboard-header">
          <div class="header-content">
            <h1 class="page-title">Edit Stall Info</h1>
          </div>
        </div>
      
        <!-- Content Section -->
        <div class="content-section">
          <!-- Loading state -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-success" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Loading stall information...</p>
          </div>

          <!-- Error state -->
          <div v-else-if="errorMsg" class="alert alert-danger">
            {{ errorMsg }}
          </div>

          <!-- Form with prepopulated data -->
          <div v-else-if="hawkerData">
            <p class="text-muted mb-4">Edit your hawker stall information here.</p>
            <HawkerStallForm
              mode="edit"
              :hawkerData="hawkerData"
              @stallUpdated="handleStallUpdated"
            />
          </div>

          <!-- No data state -->
          <div v-else class="alert alert-warning">
            No stall information found. Please create a stall first.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { auth } from '/firebase/config';
import { getHawkersByUserId } from '/firebase/firestore';
import HawkerStallForm from '@/components/hawker/HawkerForm/HawkerForm.vue';
import { onAuthStateChanged } from 'firebase/auth';

const hawkerData = ref(null);
const loading = ref(true);
const errorMsg = ref('');

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      errorMsg.value = 'Please log in to edit your stall';
      loading.value = false;
      return;
    }

    try {
      const hawkers = await getHawkersByUserId(user.uid);
      
      if (hawkers.length > 0) {
        hawkerData.value = hawkers[0];
      } else {
        errorMsg.value = 'No stall found. Please create one first.';
      }
    } catch (error) {
      console.error('Error loading hawker data:', error);
      errorMsg.value = 'Failed to load stall information';
    } finally {
      loading.value = false;
    }
  });
});

const handleStallUpdated = () => {
  console.log('Stall updated successfully');
  // You can add router navigation or show a toast notification here
};
</script>

<style scoped>
@import '@/assets/css/HawkerDashboard.css';

.edit-form-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 35%, #a7f3d0 65%, #6ee7b7 100%);
  margin: -1.5rem;
  padding: 3rem 3rem 0;
}

.dashboard-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 10px;
  box-shadow: 0 4px 16px rgba(12, 133, 12, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.page-title {
  color: white;
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.content-section {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  max-width: 1000px; /* improve readability on wide screens */
  margin: 0 auto; /* center the card */
}

.text-muted {
  color: #666;
  font-size: 1rem;
}
</style>
