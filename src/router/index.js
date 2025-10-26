import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import BuyerListing from '../views/BuyerListing.vue'
import CreateListing from '../views/CreateListing.vue'
import BuyerDashboard from '../views/BuyerDashboard.vue'
import HawkerDashboard from '../views/HawkerDashboard.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import BuyerViewStall from '../views/BuyerViewStall.vue'
import Checkout from '../views/Checkout.vue'
import OrderReceipt from '../views/OrderReceipt.vue' 
import ShoppingCart from '../components/buyer/ShoppingCart/ShoppingCart.vue'
import HawkerAnalytics from '../views/HawkerAnalytics.vue' 
import Favourites from '@/components/buyer/Favourites/Favourites.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/buyer-listings', component: BuyerListing },
  { path: '/create-listing', component: CreateListing },
  { path: '/buyer-dashboard', component: BuyerDashboard },
  { path: '/hawker-dashboard', component: HawkerDashboard },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { 
    path: '/buyer-view-stall/:userId', 
    name: 'BuyerViewStall',
    component: BuyerViewStall,
    props: true 
  },
  { path: '/cart', component: ShoppingCart },
  { path: '/order-receipt', component: OrderReceipt }, 
  { path: '/hawker-analytics', component: HawkerAnalytics }, 
  { path: '/favourites', component: Favourites},
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router