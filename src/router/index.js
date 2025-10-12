import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import BuyerListing from '../views/BuyerListing.vue'
import CreateListing from '../views/CreateListing.vue'
import BuyerDashboard from '../views/BuyerDashboard.vue'
import HawkerDashboard from '../views/HawkerDashboard.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import BuyerViewStall from '../views/BuyerViewStall.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/buyer-listings', component: BuyerListing },
  { path: '/create-listing', component: CreateListing },
  { path: '/buyer-dashboard', component: BuyerDashboard },
  { path: '/hawker-dashboard', component: HawkerDashboard },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/buyer-view-stall', component: BuyerViewStall},
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
