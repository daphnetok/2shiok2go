<template>
  <nav class="tabs-nav">
    <ul class="tabs-list">
      <li class="tab-item" style="padding:0">
        <router-link
          to="/hawker-dashboard"
          class="tab-link"
          :class="{ 'active': isActive('/hawker-dashboard') }"
        >
          <i class="fas fa-home"></i>
          <span>My Listings</span>
        </router-link>
      </li>

      <li class="tab-item" style="padding:0">
        <router-link
          to="/orders-table"
          class="tab-link"
          :class="{ 'active': isActive('/orders-table') }"
        >
          <i class="fas fa-list"></i>
          <span>Orders Management</span>
        </router-link>
      </li>

      <li class="tab-item" style="padding:0">
        <router-link
          to="/hawker-analytics"
          class="tab-link"
          :class="{ 'active': isActive('/hawker-analytics') }"
        >
          <i class="fas fa-chart-simple"></i>
          <span>Analytics</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
import { useRoute } from 'vue-router'

export default {
  setup() {
    const route = useRoute()

    // check if route path matches
    const isActive = (path) => route.path === path

    return { isActive }
  },
}
</script>

<style>
</style>