<template>
  <!-- Navigation Tabs -->
    <nav class="tabs-nav">
      <ul class="tabs-list">
        <li class="tab-item" style="padding:0">
          <router-link 
            to="/hawker-dashboard" 
            class="tab-link" 
            :class="{ active: isActive('/hawker-dashboard') }"
          >
            <i class="fas fa-list"></i>
            <span>My Listings</span>
          </router-link>
        </li>

        <li class="tab-item" style="padding:0">
          <router-link 
            to="/orders-table" 
            class="tab-link" 
            :class="{ active: isActive('/orders-table') }"
          >
            <i class="fas fa-clipboard-list"></i>
            <span>Orders Management</span>
          </router-link>
        </li>

        <li class="tab-item" style="padding:0">
          <router-link 
            to="/hawker-analytics" 
            class="tab-link" 
            :class="{ active: isActive('/hawker-analytics') }"
          >
            <i class="fas fa-chart-simple"></i>
            <span>Analytics</span>
          </router-link>
        </li>

        <li class="tab-item" style="padding:0">
          <router-link 
            to="/edit-form" 
            class="tab-link" 
            :class="{ active: isActive('/edit-form') }"
          >
            <i class="fas fa-file-edit"></i>
            <span>Edit Stall Info</span>
          </router-link>
        </li>
      </ul>
    </nav>
</template>

<script>
import { useRoute } from 'vue-router';

export default {
  name: 'HawkerNavTabs',
  setup() {
    const route = useRoute();

    const isActive = (path) => route.path === path;

    return { isActive };
  }
};
</script>

<style scoped>
/* Navigation Tabs */
.tabs-nav {
  background: white;
  border-radius: 16px;
  padding: 8px;
  margin-bottom: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tabs-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 8px;
  justify-content: center;
}

.tab-item {
  flex: 1;
}

.tab-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  text-decoration: none;
  color: #666;
  font-weight: 600;
  transition: all 0.3s ease;
}

.tab-item.active .tab-link {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.tab-link.active {
  color: white;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.tab-link:hover {
  background: #f0f0f0;
  color: #059669;
}

.tab-item.active .tab-link:hover {
  color: white;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

/* Responsive adjustments for tabs */
@media (max-width: 768px) {
  .tab-link span {
    display: none;
  }
  
  .tab-link {
    padding: 12px 10px;
    justify-content: center;
  }
  
  .tab-item {
    min-width: auto;
    flex: 0 0 auto;
  }
}

/* Animations */
@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@media (max-width: 576px) {
  .nav-container {
    padding-left: 1rem !important;
    padding-right: 1rem !important;
    margin: 0 -0.75rem !important;
  }
  .tabs-nav {
    padding: 6px;
  }
  
  .tabs-list {
    gap: 6px;
    justify-content: center;
  }
  
}
</style>