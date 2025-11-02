<template>
  <div class="buyer-dashboard-wrapper" :class="{ 'dark-theme': isDarkMode }">
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
      <div class="buyer-dashboard" :class="{ 'dark-theme': isDarkMode }">
        <!-- Header with Theme Toggle -->
        <div class="container-fluid" style="padding-left: 3rem; padding-right: 3rem; padding-top: 2rem; padding-bottom: 1rem;">
          <div class="row mb-4 align-items-center">
            <div class="col-auto">
              <h2 class="mb-0 fw-bold d-flex align-items-center" style="color: #059669;">
                <span style="font-size: 2rem; margin-right: 0.5rem;">👋</span>
                Welcome back, {{ username }}!
              </h2>
              <p class="mb-0 mt-2" style="color: #10b981; font-size: 1.1rem;">You've rescued <strong>{{ rescuedMealsCount }} meals</strong> this month 💚</p>
            </div>
            <div class="col text-end">
              <button class="btn btn-outline-secondary" style="border-radius: 8px;" @click="toggleTheme">
                <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
                {{ isDarkMode ? 'Light' : 'Dark' }} Mode
              </button>
            </div>
          </div>
        </div>

        <div class="container-fluid" style="padding-left: 3rem; padding-right: 3rem;">
      <!-- Main Stats Cards -->
      <div class="row mb-4 g-3">
        <div class="col-lg-4">
          <div class="stat-card stat-card-success h-100">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <h3 class="stat-value">{{ stats.moneySaved }}</h3>
              <p class="stat-label">$ Saved This Month</p>
              <p class="stat-detail">(avg. {{ stats.avgDiscount }}% off)</p>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="stat-card stat-card-info h-100">
            <div class="stat-icon">🌱</div>
            <div class="stat-content">
              <h3 class="stat-value">{{ stats.foodRescued }}</h3>
              <p class="stat-label">Food Rescued</p>
              <p class="stat-detail">({{ stats.mealsCount }} meals)</p>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="stat-card stat-card-warning h-100">
            <div class="stat-icon">🔥</div>
            <div class="stat-content">
              <h3 class="stat-value">{{ stats.pointsEarned }}</h3>
              <p class="stat-label">Points Earned</p>
              <p class="stat-detail">🎯 {{ stats.achievement }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Achievement Banner -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="achievement-banner">
            <div class="achievement-content">
              <span class="achievement-icon">🎯</span>
              <div>
                <h5 class="mb-1 fw-bold">Achievement: "{{ stats.achievement }}"</h5>
                <p class="mb-0 text-muted">🥳 Keep saving meals to reach Lv. 3!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Dish & Stall Highlight -->
      <div class="row mb-4 g-3">
        <div class="col-lg-6">
          <div class="highlight-card" :class="{ 'dark-mode-card': isDarkMode }">
            <div class="highlight-header">
              <h5 class="mb-0 fw-semibold" style="color: #059669;"><i class="fas fa-trophy me-2"></i>Your Top Dish</h5>
            </div>
            <div class="highlight-body">
              <div class="d-flex align-items-center mb-3">
                <span style="font-size: 3rem; margin-right: 1rem;">🍛</span>
                <div>
                  <h4 class="mb-1 fw-bold">{{ topDish.name }}</h4>
                  <p class="mb-0 text-muted">from {{ topDish.stall }}</p>
                </div>
              </div>
              <p class="mb-0" style="color: #10b981; font-weight: 500;">"You've ordered this {{ topDish.orderCount }} times!"</p>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="highlight-card" :class="{ 'dark-mode-card': isDarkMode }">
            <div class="highlight-header">
              <h5 class="mb-0 fw-semibold" style="color: #059669;"><i class="fas fa-store me-2"></i>Stall Highlight</h5>
            </div>
            <div class="highlight-body">
              <div class="d-flex align-items-center mb-3">
                <span style="font-size: 3rem; margin-right: 1rem;">🧑‍🍳</span>
                <div>
                  <h4 class="mb-1 fw-bold">{{ stallHighlight.name }}</h4>
                  <p class="mb-0 text-muted">{{ stallHighlight.orders }} orders</p>
                </div>
              </div>
              <p class="mb-0" style="color: #10b981; font-weight: 500;">"{{ stallHighlight.description }}"</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="row mb-4">
        <div class="col-12">
          <h4 class="mb-3 fw-bold" style="color: #374151;"><i class="fas fa-chart-line me-2" style="color: #10b981;"></i>📊 Insights</h4>
        </div>
      </div>

      <!-- Food Rescued Over Time Chart -->
      <div class="row mb-4">
        <div class="col-12">
          <ChartCard 
            title="🌱 Food Rescued Over Time" 
            type="line" 
            :data="foodRescuedChartData" 
            :dark-mode="isDarkMode"
            :filter-options="timeFilters"
            @filter-change="updateFoodRescuedFilter"
          />
        </div>
      </div>

      <!-- You Saved vs Full Price Chart -->
      <div class="row mb-4">
        <div class="col-12">
          <ChartCard 
            title="💰 You Saved vs Full Price" 
            type="bar" 
            :data="savingsComparisonChartData" 
            :dark-mode="isDarkMode"
            :filter-options="orderFilters"
            @filter-change="updateSavingsFilter"
          />
        </div>
      </div>

      <!-- Smart Insight -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="smart-insight" :class="{ 'dark-mode-card': isDarkMode }">
            <div class="d-flex align-items-start">
              <span style="font-size: 2.5rem; margin-right: 1rem;">💬</span>
              <div class="flex-grow-1">
                <h5 class="mb-2 fw-bold" style="color: #374151;">Smart Insight</h5>
                <p class="mb-3" style="font-size: 1.05rem;">{{ smartInsight }}</p>
                <button class="btn btn-success" style="border-radius: 8px; padding: 0.5rem 1.5rem;">
                  <i class="fas fa-eye me-2"></i>View Suggested Deals
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Play & Earn Section -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="pet-section" :class="{ 'dark-mode-card': isDarkMode }">
            <div class="pet-header">
              <h4 class="mb-0 fw-bold" style="color: #059669;">🎮 Play & Earn</h4>
              <p class="mb-0 text-muted">Feed your buddy by rescuing meals!</p>
            </div>
            <div class="pet-content">
              <PetPlayground 
                :pet="petData"
                :animation="petAnimation"
                :message="petMessage"
                :message-type="petMessageType"
                @click="petClick"
                @customize="showCustomization = !showCustomization"
                @feed="feedPet"
                @play="playWithPet"
                @dragover="handleDragOver"
                @drop="handleDrop"
              />
              <div class="pet-progress mt-3">
                <p class="mb-2 fw-semibold">🐶 "2Shiok Buddy" — Your food rescue pet!</p>
                <p class="mb-2 text-muted">"Feed your buddy by rescuing meals! {{ petData.mealsToLevelUp }} more to level up!"</p>
                <div class="progress" style="height: 30px; border-radius: 15px;">
                  <div class="progress-bar bg-success" 
                       :style="{ width: petData.progress + '%' }"
                       style="border-radius: 15px; font-weight: 600; font-size: 0.9rem;">
                    {{ petData.progress }}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Customization Panel (Hidden by default) -->
      <div class="row mb-4" v-if="showCustomization">
        <div class="col-12">
          <Card title="Customize Your Pet">
            <template #body>
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label fw-semibold mb-2" style="font-size: 0.875rem; color: #374151;">Pet Name</label>
                  <input type="text" class="form-control" style="border-radius: 8px; padding: 0.625rem 0.875rem;" v-model="petData.name">
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold mb-2" style="font-size: 0.875rem; color: #374151;">Body Type</label>
                  <select class="form-select" style="border-radius: 8px; padding: 0.625rem 0.875rem;" v-model="petData.avatar.body">
                    <option value="cat">Cat 🐱</option>
                    <option value="dog">Dog 🐶</option>
                    <option value="bunny">Bunny 🐰</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold mb-2" style="font-size: 0.875rem; color: #374151;">Color</label>
                  <input type="color" class="form-control form-control-color" style="border-radius: 8px; width: 100%; height: 46px;" v-model="petData.avatar.color">
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import Card from '@/components/shared/Card.vue'
import ChartCard from '@/components/dashboard/ChartCard.vue'
import PetPlayground from '@/components/dashboard/buyer/PetPlayground.vue'

export default {
  name: 'BuyerDashboard',
  components: { Card, ChartCard, PetPlayground },
  setup() {
    const isDarkMode = ref(false)
    const showCustomization = ref(false)
    const petAnimation = ref('')
    const petMessage = ref('')
    const petMessageType = ref('info')
    
    // User Info
    const username = ref('Guest')
    const rescuedMealsCount = ref(5)
    const auth = getAuth()
    
    // Fetch user data from Firestore
    const fetchUserData = async (uid) => {
      try {
        const userRef = doc(db, 'users', uid)
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
          const userData = userSnap.data()
          username.value = userData.displayName || 'Guest'
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }
    
    // Listen to auth state changes
    onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user.uid)
      } else {
        username.value = 'Guest'
      }
    })
    
    // Main Stats
    const stats = ref({
      moneySaved: '$18.40',
      avgDiscount: 27,
      foodRescued: '3.8 kg',
      mealsCount: 5,
      pointsEarned: '1,240 pts',
      achievement: 'Waste Warrior Lv. 2'
    })
    
    // Top Dish
    const topDish = ref({
      name: 'Laksa',
      stall: "Ah Heng's Delights",
      orderCount: 4,
      emoji: '🍛'
    })
    
    // Stall Highlight
    const stallHighlight = ref({
      name: "Ah Heng's Stall",
      orders: 128,
      description: 'Popular near your location'
    })
    
    // Smart Insight
    const smartInsight = ref('You love noodles on Fridays 🍜 — check out similar deals?')
    
    // Pet Data
    const petData = ref({
      name: 'Buddy',
      happiness: 85,
      energy: 70,
      level: 2,
      experience: 250,
      treats: 12,
      mood: 'happy',
      progress: 60,
      mealsToLevelUp: 3,
      avatar: {
        body: 'dog',
        color: '#FFD700',
        face: 'M 50 50 Q 60 55 70 50'
      }
    })
    
    // Chart Filters
    const timeFilters = ref([
      { label: 'Week 1', value: 'week1' },
      { label: 'Week 2', value: 'week2' },
      { label: 'Week 3', value: 'week3' },
      { label: 'Week 4', value: 'week4' }
    ])
    
    const orderFilters = ref([
      { label: 'Last 5 Orders', value: 'last5' },
      { label: 'Last 10 Orders', value: 'last10' },
      { label: 'This Month', value: 'month' }
    ])
    
    // Dummy Data for Charts
    const foodRescuedDummyData = ref({
      week1: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [0.5, 0.8, 0.3, 1.2, 0.9, 1.5, 0.6]
      },
      week2: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [0.7, 0.4, 1.1, 0.8, 1.3, 0.9, 1.0]
      },
      week3: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [0.9, 1.2, 0.6, 0.7, 1.4, 1.1, 0.8]
      },
      week4: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [1.0, 0.9, 1.3, 0.8, 1.5, 1.2, 0.7]
      }
    })
    
    const savingsComparisonDummyData = ref({
      last5: {
        labels: ['Order 1', 'Order 2', 'Order 3', 'Order 4', 'Order 5'],
        fullPrice: [8.00, 12.50, 6.00, 15.00, 10.50],
        youPaid: [5.60, 9.00, 4.20, 10.50, 7.35]
      },
      last10: {
        labels: ['Ord 1', 'Ord 2', 'Ord 3', 'Ord 4', 'Ord 5', 'Ord 6', 'Ord 7', 'Ord 8', 'Ord 9', 'Ord 10'],
        fullPrice: [8.00, 12.50, 6.00, 15.00, 10.50, 9.00, 11.00, 7.50, 13.00, 8.50],
        youPaid: [5.60, 9.00, 4.20, 10.50, 7.35, 6.30, 7.70, 5.25, 9.10, 5.95]
      },
      month: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        fullPrice: [52.00, 48.00, 63.00, 55.00],
        youPaid: [36.40, 33.60, 44.10, 38.50]
      }
    })
    
    const selectedFoodRescuedFilter = ref('week2')
    const selectedSavingsFilter = ref('last5')
    
    // Computed Chart Data
    const foodRescuedChartData = computed(() => {
      const data = foodRescuedDummyData.value[selectedFoodRescuedFilter.value]
      return {
        labels: data.labels,
        datasets: [{
          label: 'Food Rescued (kg)',
          data: data.data,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      }
    })
    
    const savingsComparisonChartData = computed(() => {
      const data = savingsComparisonDummyData.value[selectedSavingsFilter.value]
      return {
        labels: data.labels,
        datasets: [
          {
            label: 'Full Price',
            data: data.fullPrice,
            backgroundColor: '#ef4444',
            borderRadius: 6,
            borderSkipped: false
          },
          {
            label: 'You Paid',
            data: data.youPaid,
            backgroundColor: '#10b981',
            borderRadius: 6,
            borderSkipped: false
          }
        ]
      }
    })
    
    // Filter Update Functions
    const updateFoodRescuedFilter = (filter) => {
      selectedFoodRescuedFilter.value = filter
    }
    
    const updateSavingsFilter = (filter) => {
      selectedSavingsFilter.value = filter
    }
    
    // Theme Toggle
    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value
      document.body.classList.toggle('dark-mode', isDarkMode.value)
      document.documentElement.setAttribute('data-bs-theme', isDarkMode.value ? 'dark' : 'light')
      localStorage.setItem('buyer-theme', isDarkMode.value ? 'dark' : 'light')
    }
    
    // Pet Functions
    const feedPet = () => {
      if (petData.value.treats > 0) {
        petData.value.treats--
        petData.value.happiness = Math.min(100, petData.value.happiness + 10)
        petData.value.energy = Math.min(100, petData.value.energy + 15)
        petData.value.experience += 5
        petData.value.progress = Math.min(100, petData.value.progress + 10)
        petAnimation.value = 'happy'
        showMessage('Yummy! +10 happiness', 'success')
        setTimeout(() => { petAnimation.value = '' }, 600)
        checkLevelUp()
      } else {
        showMessage('No treats left! Order food to earn more.', 'warning')
      }
    }

    const playWithPet = () => {
      if (petData.value.energy >= 10) {
        petData.value.energy -= 10
        petData.value.happiness = Math.min(100, petData.value.happiness + 15)
        petData.value.experience += 8
        petData.value.progress = Math.min(100, petData.value.progress + 5)
        petAnimation.value = 'excited'
        showMessage('Wheee! +15 happiness', 'success')
        setTimeout(() => { petAnimation.value = '' }, 500)
        checkLevelUp()
      } else {
        showMessage('Pet is too tired. Feed to restore energy!', 'info')
      }
    }

    const petClick = () => {
      petData.value.happiness = Math.min(100, petData.value.happiness + 2)
      petData.value.experience += 1
      petAnimation.value = 'happy'
      setTimeout(() => { petAnimation.value = '' }, 300)
    }

    const checkLevelUp = () => {
      if (petData.value.progress >= 100) {
        petData.value.level++
        petData.value.progress = 0
        showMessage(`Level Up! Now Level ${petData.value.level}! 🎉`, 'success')
      }
      petData.value.mealsToLevelUp = Math.ceil((100 - petData.value.progress) / 10)
    }

    const showMessage = (msg, type) => {
      petMessage.value = msg
      petMessageType.value = type
      setTimeout(() => { petMessage.value = '' }, 3000)
    }

    const handleDragOver = (e) => {}
    const handleDrop = (e) => {}

    onMounted(() => {
      const savedTheme = localStorage.getItem('buyer-theme')
      if (savedTheme === 'dark') {
        isDarkMode.value = true
        document.body.classList.add('dark-mode')
        document.documentElement.setAttribute('data-bs-theme', 'dark')
      }
    })

    return {
      isDarkMode, showCustomization, petAnimation, petMessage, petMessageType,
      username, rescuedMealsCount, stats, topDish, stallHighlight, smartInsight,
      petData, timeFilters, orderFilters,
      foodRescuedChartData, savingsComparisonChartData,
      updateFoodRescuedFilter, updateSavingsFilter,
      toggleTheme, feedPet, playWithPet, petClick, handleDragOver, handleDrop
    }
  }
}
</script>

<style scoped>
@import '@/assets/css/dashboard-theme.css';

/* Wrapper Layout */
.buyer-dashboard-wrapper {
  display: flex;
  min-height: 100vh;
}

.buyer-dashboard-wrapper.dark-theme {
  background: #0f172a;
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
}

/* Dark Theme */
.dark-theme {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  min-height: 100vh;
  color: #e2e8f0;
}

/* Stat Cards */
.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.75rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.stat-card-success {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  border-color: #86efac;
}

.stat-card-info {
  background: linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%);
  border-color: #67e8f9;
}

.stat-card-warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #fcd34d;
}

.dark-theme .stat-card {
  background: #1e293b;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.dark-theme .stat-card-success {
  background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
  border-color: #10b981;
}

.dark-theme .stat-card-info {
  background: linear-gradient(135deg, #164e63 0%, #0e7490 100%);
  border-color: #06b6d4;
}

.dark-theme .stat-card-warning {
  background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
  border-color: #f59e0b;
}

.stat-icon {
  font-size: 3rem;
  line-height: 1;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: #059669;
}

.dark-theme .stat-value {
  color: #10b981;
}

.stat-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.dark-theme .stat-label {
  color: #e2e8f0;
}

.stat-detail {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0;
}

.dark-theme .stat-detail {
  color: #94a3b8;
}

/* Achievement Banner */
.achievement-banner {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  border: 2px solid #fcd34d;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.dark-theme .achievement-banner {
  background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
  border-color: #f59e0b;
}

.achievement-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.achievement-icon {
  font-size: 3rem;
}

.achievement-banner h5 {
  color: #92400e;
  font-size: 1.25rem;
}

.dark-theme .achievement-banner h5 {
  color: #fbbf24;
}

.achievement-banner .text-muted {
  color: #78350f !important;
  font-size: 1rem;
}

.dark-theme .achievement-banner .text-muted {
  color: #fcd34d !important;
}

/* Highlight Cards */
.highlight-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
  height: 100%;
}

.highlight-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.dark-theme .highlight-card.dark-mode-card {
  background: #1e293b;
  border-color: #334155;
}

.highlight-header {
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-bottom: 1px solid #bbf7d0;
}

.dark-theme .highlight-header {
  background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
  border-color: #10b981;
}

.highlight-body {
  padding: 1.5rem;
}

/* Smart Insight */
.smart-insight {
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  border-radius: 16px;
  padding: 2rem;
  border: 2px solid #c4b5fd;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.dark-theme .smart-insight.dark-mode-card {
  background: linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%);
  border-color: #8b5cf6;
}

.smart-insight h5 {
  color: #5b21b6;
}

.dark-theme .smart-insight h5 {
  color: #c4b5fd;
}

.smart-insight p {
  color: #4c1d95;
}

.dark-theme .smart-insight p {
  color: #ddd6fe;
}

/* Pet Section */
.pet-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.dark-theme .pet-section.dark-mode-card {
  background: #1e293b;
  border-color: #334155;
}

.pet-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.dark-theme .pet-header {
  border-color: #334155;
}

.pet-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.pet-progress p {
  font-size: 1rem;
}

.dark-theme .pet-progress .text-muted {
  color: #94a3b8 !important;
}

/* Progress Bar */
.progress {
  background-color: #e5e7eb;
}

.dark-theme .progress {
  background-color: #334155;
}

/* Responsive */
@media (max-width: 768px) {
  .stat-card {
    padding: 1.25rem;
    gap: 1rem;
  }
  
  .stat-icon {
    font-size: 2.5rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .achievement-content {
    gap: 1rem;
  }
  
  .achievement-icon {
    font-size: 2.5rem;
  }
}
</style>
