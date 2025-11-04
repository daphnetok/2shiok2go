<template>
  <div class="edit-form-container">
    <div class="container mt-4">
      <!-- Navigation Tabs -->
      <nav class="tabs-nav">
        <ul class="tabs-list">
          <li class="tab-item">
            <router-link to="/hawker-dashboard" class="tab-link">
              <i class="fas fa-home"></i>
              <span> My Listings</span>
            </router-link>
          </li>
          <li class="tab-item">
            <router-link to="/orders-table" class="tab-link">
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
          <li class="tab-item active" style="padding:0">
            <a href="#" class="tab-link">
              <i class="fas fa-file-edit"></i>
              <span>Edit My Form</span>
            </a>
          </li>
        </ul>
      </nav>

      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="page-title">Edit My Form</h1>
        </div>
      </div>

      <!-- Content Section -->
      <div class="content-section">
        <p class="text-muted">Edit your hawker stall information here.</p>
        <!-- HawkerForm component can be added here later -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditForm'
}
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
}

.text-muted {
  color: #666;
  font-size: 1rem;
}
</style>
