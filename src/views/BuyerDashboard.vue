<template>
  <div class="buyer-dashboard-wrapper" :class="{ 'dark-theme': isDarkMode }">
    <!-- Sidebar Navigation -->
    <div class="sidebar" :class="{ 'dark-sidebar': isDarkMode }">
      <nav class="sidebar-nav">
        <router-link to="/buyer-dashboard" class="nav-item" :class="{ active: $route.path === '/buyer-dashboard' }">
          <i class="fas fa-chart-line"></i>
          <span>Analytics</span>
        </router-link>
        <router-link to="/buyer-recent-orders" class="nav-item"
          :class="{ active: $route.path === '/buyer-recent-orders' }">
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
        <div class="container-fluid"
          style="padding-left: 3rem; padding-right: 3rem; padding-top: 2rem; padding-bottom: 1rem;">
          <div class="row mb-4 align-items-center">
            <div class="col-12 col-lg-8 mb-3 mb-lg-0 text-center text-lg-start">
              <h2 class="mb-0 fw-bold d-flex align-items-center justify-content-center justify-content-lg-start"
                style="color: #059669;">
                <span style="font-size: 2rem; margin-right: 0.5rem;">👋</span>
                Welcome back, {{ username }}!
              </h2>
              <p class="mb-0 mt-2" style="color: #10b981; font-size: 1.1rem;">You've rescued <strong>{{
                  rescuedMealsCount }} meals</strong> this month 💚</p>
            </div>
            <div class="col-12 col-lg-4 text-center text-lg-end">
              <button class="btn btn-outline-secondary no-print" style="border-radius: 8px;" @click="toggleTheme">
                <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
                <span class="d-none d-sm-inline">{{ isDarkMode ? 'Light' : 'Dark' }} Mode</span>
                <span class="d-sm-none">Theme</span>
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
                </div>
              </div>
            </div>
            <div class="col-lg-4">
              <div class="stat-card stat-card-info h-100">
                <div class="stat-icon">🌱</div>
                <div class="stat-content">
                  <h3 class="stat-value">{{ stats.foodRescued }}</h3>
                  <p class="stat-label">Food Rescued</p>
                </div>
              </div>
            </div>
            <div class="col-lg-4">
              <div class="stat-card stat-card-warning h-100">
                <div class="stat-icon">🔥</div>
                <div class="stat-content">
                  <h3 class="stat-value">{{ stats.orderStreak }} {{ stats.orderStreak === 1 ? 'day' : 'days' }}</h3>
                  <p class="stat-label">Order Streak</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Top Dish -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="highlight-card" :class="{ 'dark-mode-card': isDarkMode }">
                <div class="highlight-header">
                  <h5 class="mb-0 fw-semibold" style="color: #059669;"><i class="fas fa-trophy me-2"></i>Your Top Dish
                  </h5>
                </div>
                <div class="highlight-body">
                  <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div class="d-flex align-items-center">
                      <span style="font-size: 3rem; margin-right: 1rem;">🍛</span>
                      <div>
                        <h4 class="mb-1 fw-bold">{{ topDish.name }}</h4>
                        <p class="mb-0 text-muted">from {{ topDish.stall }}</p>
                        <p class="mt-2 mb-0" style="color: #10b981; font-weight: 500;">"You've ordered this {{
                          topDish.orderCount }} times!"</p>
                      </div>
                    </div>
                    <button @click="orderTopDish" class="btn btn-success"
                      style="border-radius: 8px; padding: 0.75rem 1.5rem;">
                      <i class="fas fa-shopping-cart me-2"></i>Order Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Play & Earn Section with Customization -->
          <div class="row mb-4">
            <div :class="showCustomization ? 'col-lg-7 mb-4 mb-lg-0' : 'col-12'" class="transition-all">
              <!-- Pet Playground Card -->
              <div class="highlight-card" :class="{ 'dark-mode-card': isDarkMode }">
                <div class="highlight-header">
                  <h5 class="mb-0 fw-semibold" style="color: #059669;"><i class="fas fa-gamepad me-2"></i>Play & Earn
                  </h5>
                  <p class="mb-0 text-muted" style="font-size: 0.9rem; margin-top: 0.25rem;">Feed your buddy by rescuing
                    meals!</p>
                </div>
                <div class="highlight-body">
                  <PetPlayground :pet="petData" :animation="petAnimation" :message="petMessage"
                    :message-type="petMessageType" @click="petClick" @customize="showCustomization = !showCustomization"
                    @play="playWithPet" @dragover="handleDragOver" @drop="handleDrop"
                    @update-treats="onUpdateTreats" />
                  <div class="pet-progress mt-4">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <p class="mb-1 fw-bold" style="color: #059669; font-size: 1rem;">
                          <i class="fas fa-paw me-2"></i>{{ petData.name || '2Shiok Buddy' }}
                        </p>
                        <p class="mb-0 text-muted" style="font-size: 0.875rem;">
                          <span class="fw-bold" style="color: #10b981;">{{ currentLevelName.name }}</span> • {{ petData.mealsToLevelUp }} meals to next level
                        </p>
                      </div>
                      <div class="level-badge">
                        <span class="level-number">{{ petData.level }}</span>
                      </div>
                    </div>
                    <div class="progress-container">
                      <div class="progress-track">
                        <div class="progress-fill" :style="{ width: petData.progress + '%' }">
                          <div class="progress-shine"></div>
                        </div>
                        <span class="progress-text">{{ Math.round(petData.progress) }}%</span>
                      </div>
                      <div class="progress-milestones">
                        <div class="milestone" :class="{ 'reached': petData.progress >= 25 }" style="left: 25%;">
                          <i class="fas fa-star"></i>
                        </div>
                        <div class="milestone" :class="{ 'reached': petData.progress >= 50 }" style="left: 50%;">
                          <i class="fas fa-star"></i>
                        </div>
                        <div class="milestone" :class="{ 'reached': petData.progress >= 75 }" style="left: 75%;">
                          <i class="fas fa-star"></i>
                        </div>
                        <div class="milestone crown" :class="{ 'reached': petData.progress >= 100 }" style="left: 100%;">
                          <i class="fas fa-crown"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Customization Panel (Toggleable) -->
            <transition name="slide-fade">
              <div v-if="showCustomization" class="col-lg-5">
                <div class="customization-card" :class="{ 'dark-mode-card': isDarkMode }">
                  <div class="customization-header">
                    <div>
                      <h5 class="mb-0 fw-semibold" style="color: #059669;">
                        <i class="fas fa-palette me-2"></i>Customize Buddy
                      </h5>
                      <p class="mb-0 text-muted" style="font-size: 0.85rem; margin-top: 0.25rem;">
                        Changes save automatically
                      </p>
                    </div>
                    <button class="btn-close-panel" @click="showCustomization = false" :class="{ 'dark-mode': isDarkMode }">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <div class="customization-body">
                  <!-- Basic Info -->
                  <div class="customization-group-compact">
                    <label class="custom-label-compact">
                      <i class="fas fa-signature"></i> Pet Name
                    </label>
                    <input type="text" class="custom-input-compact" v-model="petData.name" maxlength="12"
                      placeholder="Enter name..." @input="autoSavePet">
                  </div>

                  <!-- Animal Type -->
                  <div class="customization-group-compact">
                    <label class="custom-label-compact">
                      <i class="fas fa-paw"></i> Animal Type
                    </label>
                    <div class="option-grid-compact">
                      <div v-for="animal in animalTypes.slice(0, 6)" :key="animal.value" 
                        class="option-card-compact" :class="{
                          'selected': petData.avatar.body === animal.value,
                          'locked': animal.locked && !isUnlocked(animal.unlockLevel)
                        }" @click="selectAnimalAuto(animal)">
                        <div class="option-emoji-compact">{{ animal.emoji }}</div>
                        <div class="option-name-compact">{{ animal.name }}</div>
                        <div v-if="animal.locked && !isUnlocked(animal.unlockLevel)" class="unlock-badge-compact">
                          <i class="fas fa-lock"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Color Palette -->
                  <div class="customization-group-compact">
                    <label class="custom-label-compact">
                      <i class="fas fa-palette"></i> Color
                    </label>
                    <div class="color-grid-compact">
                      <div v-for="color in colorPalette.slice(0, 8)" :key="color.value" 
                        class="color-option-compact" :class="{
                          'selected': petData.avatar.color === color.value,
                          'locked': color.locked && !isUnlocked(color.unlockLevel)
                        }" :style="{ background: color.value }" @click="selectColorAuto(color)">
                        <i v-if="petData.avatar.color === color.value" class="fas fa-check"></i>
                        <div v-if="color.locked && !isUnlocked(color.unlockLevel)" class="color-lock-compact">
                          <i class="fas fa-lock"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Background -->
                  <div class="customization-group-compact">
                    <label class="custom-label-compact">
                      <i class="fas fa-image"></i> Background
                    </label>
                    <div class="background-grid-compact">
                      <div v-for="bg in backgrounds.slice(0, 4)" :key="bg.value" 
                        class="background-option-compact" :class="{
                          'selected': petData.avatar.background === bg.value,
                          'locked': bg.locked && !isUnlocked(bg.unlockLevel)
                        }" :style="{ background: bg.value }" @click="selectBackgroundAuto(bg)">
                        <span class="bg-label-compact">{{ bg.name }}</span>
                        <i v-if="petData.avatar.background === bg.value" class="fas fa-check check-icon-compact"></i>
                        <div v-if="bg.locked && !isUnlocked(bg.unlockLevel)" class="unlock-badge-compact">
                          <i class="fas fa-lock"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Accessories -->
                  <div class="customization-group-compact">
                    <label class="custom-label-compact">
                      <i class="fas fa-hat-wizard"></i> Accessory
                    </label>
                    <div class="option-grid-compact">
                      <div v-for="acc in accessories.slice(0, 6)" :key="acc.value" 
                        class="option-card-compact" :class="{
                          'selected': petData.avatar.accessory === acc.value,
                          'locked': acc.locked && !isUnlocked(acc.unlockLevel)
                        }" @click="selectAccessoryAuto(acc)">
                        <div class="option-emoji-compact">{{ acc.emoji }}</div>
                        <div class="option-name-compact">{{ acc.name }}</div>
                        <div v-if="acc.locked && !isUnlocked(acc.unlockLevel)" class="unlock-badge-compact">
                          <i class="fas fa-lock"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Auto-save indicator -->
                  <div v-if="autoSaving" class="auto-save-indicator">
                    <i class="fas fa-sync fa-spin"></i> Saving...
                  </div>
                  <div v-else-if="lastSaved" class="auto-save-indicator saved">
                    <i class="fas fa-check-circle"></i> Saved
                  </div>
                </div>
              </div>
            </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, collection, query, where, getDocs, updateDoc, setDoc, orderBy, limit, runTransaction } from 'firebase/firestore'
import { db } from '../../firebase/config'
import Card from '@/components/shared/Card.vue'
import ChartCard from '@/components/dashboard/ChartCard.vue'
import PetPlayground from '@/components/dashboard/buyer/PetPlayground.vue'

export default {
  name: 'BuyerDashboard',
  components: { Card, ChartCard, PetPlayground },
  setup() {
    const router = useRouter()
    const isDarkMode = ref(false)
    const showCustomization = ref(false)
    const petAnimation = ref('')
    const petMessage = ref('')
    const petMessageType = ref('info')
    const isSaving = ref(false)
    const saveSuccess = ref(false)

    // User Info
    const username = ref('Guest')
    const rescuedMealsCount = ref(0)
    const currentUserId = ref(null)
    const auth = getAuth()

    // Fetch user data from Firestore
    const fetchUserData = async (uid) => {
      try {
        const userRef = doc(db, 'users', uid)
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
          const userData = userSnap.data()
          username.value = userData.displayName || userData.name || 'Guest'
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    // Calculate order streak (consecutive days with orders)
    const calculateOrderStreak = (orders) => {
      console.log('🔥 calculateOrderStreak called with', orders?.length, 'orders')
      
      if (!orders || orders.length === 0) {
        console.log('❌ No orders found, returning 0')
        return 0
      }

      // Helper function to get local date string (YYYY-MM-DD) without timezone issues
      const getLocalDateStr = (date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      // Get unique order dates (YYYY-MM-DD format using LOCAL time)
      const orderDates = new Set()
      orders.forEach(order => {
        const orderDate = order.timestamp?.toDate ? order.timestamp.toDate() : new Date(order.timestamp || order.createdAt)
        const dateStr = getLocalDateStr(orderDate)
        orderDates.add(dateStr)
        console.log('  📅 Order date:', dateStr, '| Raw timestamp:', order.timestamp)
      })

      // Sort dates in descending order (most recent first)
      const sortedDates = Array.from(orderDates).sort((a, b) => new Date(b) - new Date(a))
      
      console.log('📊 Unique order dates (sorted):', sortedDates)
      
      if (sortedDates.length === 0) {
        console.log('❌ No valid dates, returning 0')
        return 0
      }

      // Check if the most recent order is today or yesterday (using LOCAL time)
      const today = new Date()
      const todayStr = getLocalDateStr(today)
      
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = getLocalDateStr(yesterday)
      
      const mostRecentDate = sortedDates[0]
      
      console.log('📆 Today:', todayStr, '| Yesterday:', yesterdayStr, '| Most recent order:', mostRecentDate)
      
      // If the most recent order is not today or yesterday, streak is broken
      if (mostRecentDate !== todayStr && mostRecentDate !== yesterdayStr) {
        console.log('❌ Streak broken - most recent order is not today or yesterday')
        return 0
      }

      // Count consecutive days
      let streak = 1
      let currentDate = new Date(mostRecentDate + 'T00:00:00')
      
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(currentDate)
        prevDate.setDate(prevDate.getDate() - 1)
        const expectedPrevDateStr = getLocalDateStr(prevDate)
        
        if (sortedDates[i] === expectedPrevDateStr) {
          streak++
          currentDate = new Date(sortedDates[i] + 'T00:00:00')
          console.log('  ✅ Consecutive day found:', sortedDates[i], '| Streak:', streak)
        } else {
          console.log('  ❌ Gap found - Expected:', expectedPrevDateStr, 'Got:', sortedDates[i])
          break // Streak broken
        }
      }
      
      console.log('🔥 Final order streak:', streak, 'days')
      return streak
    }

    // Fetch orders from Firestore and calculate stats
    const fetchOrdersData = async (uid, shouldSave = false) => {
      try {
        console.log('📦 Fetching orders for user:', uid)
        const ordersRef = collection(db, 'orders')
        
        // Try with orderBy first (requires index)
        let ordersSnapshot
        try {
          const q = query(ordersRef, where('userId', '==', uid), orderBy('timestamp', 'desc'))
          ordersSnapshot = await getDocs(q)
        } catch (indexError) {
          if (indexError.code === 'failed-precondition' || indexError.code === 9) {
            console.warn('⚠️ Index not found, using simple query without orderBy')
            const indexUrl = indexError.message.match(/https:\/\/[^\s]+/)?.[0]
            if (indexUrl) {
              console.warn('🔗 Create index at:', indexUrl)
            }
            // Fallback: query without orderBy
            const simpleQuery = query(ordersRef, where('userId', '==', uid))
            ordersSnapshot = await getDocs(simpleQuery)
          } else {
            throw indexError
          }
        }
        
        console.log('📊 Found orders:', ordersSnapshot.size)
        
        if (!ordersSnapshot.empty) {
          let orders = ordersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          
          // Sort manually by timestamp if we didn't use orderBy
          orders.sort((a, b) => {
            const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || 0)
            const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || 0)
            return dateB - dateA
          })
          
          // Calculate current month stats
          const now = new Date()
          const currentMonthOrders = orders.filter(order => {
            const orderDate = order.timestamp?.toDate ? order.timestamp.toDate() : new Date(order.timestamp)
            return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
          })
          
          rescuedMealsCount.value = currentMonthOrders.length
          
          // 1. Calculate total money saved (sum of discounts: normalPrice - discountedPrice)
          let totalSaved = 0
          let totalOriginalPrice = 0
          let totalMeals = 0
          
          console.log('📊 Calculating stats from', currentMonthOrders.length, 'orders')
          
          currentMonthOrders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
              order.items.forEach(item => {
                // Try to get the prices - check multiple field names
                let normalPrice = item.originalPrice || item.normalPrice || 0
                let discountedPrice = item.discountedPrice || item.salePrice || item.price || 0
                const quantity = item.quantity || item.qty || 1
                
                // If we only have 'price' field, that's likely the discounted price
                // We need to calculate original price from discount percentage if available
                if (normalPrice === 0 && discountedPrice > 0) {
                  // Check if there's a discount percentage or amount
                  if (item.discount) {
                    if (item.discount < 1) {
                      // It's a percentage (e.g., 0.3 = 30% off)
                      normalPrice = discountedPrice / (1 - item.discount)
                    } else if (item.discount < 100) {
                      // It's a percentage as whole number (e.g., 30 = 30% off)
                      normalPrice = discountedPrice / (1 - (item.discount / 100))
                    } else {
                      // It's a fixed discount amount
                      normalPrice = discountedPrice + item.discount
                    }
                  } else if (item.discountPercentage) {
                    // Discount percentage field
                    normalPrice = discountedPrice / (1 - (item.discountPercentage / 100))
                  } else {
                    // No original price info, assume 20% discount as average
                    normalPrice = discountedPrice / 0.8
                  }
                }
                
                console.log('Item:', item.name || 'Unknown', '| Normal:', normalPrice.toFixed(2), '| Discounted:', discountedPrice.toFixed(2), '| Qty:', quantity)
                
                // Calculate savings if we have both prices and there's a discount
                if (normalPrice > discountedPrice && discountedPrice > 0) {
                  const savings = (normalPrice - discountedPrice) * quantity
                  totalSaved += savings
                  console.log('  → Savings:', savings.toFixed(2))
                } else {
                  console.log('  → No discount calculated')
                }
                
                totalOriginalPrice += normalPrice * quantity
                totalMeals += quantity  // Each item counts as a meal
              })
            }
          })
          
          console.log('💰 Total Saved:', totalSaved.toFixed(2), '| Total Original:', totalOriginalPrice.toFixed(2), '| Total Meals:', totalMeals)
          
          // 2. Calculate kg saved: meals * appropriate weight per meal (0.4kg average for hawker food)
          const avgWeightPerMeal = 0.4  // 400g is typical for a hawker meal portion
          const totalWeight = totalMeals * avgWeightPerMeal
          
          // 3. Calculate carbon saved
          // Research shows: 1kg of food waste = approximately 2.5kg CO₂ equivalent
          // This includes production, transportation, and decomposition emissions
          const carbonPerKgFood = 2.5  // kg CO₂ per kg of food
          const totalCarbonSaved = totalWeight * carbonPerKgFood
          
          const avgDiscount = totalOriginalPrice > 0 ? Math.round((totalSaved / totalOriginalPrice) * 100) : 0
          
          // Ensure displayed savings is non-negative
          stats.value.moneySaved = `$${Math.max(0, totalSaved).toFixed(2)}`
          stats.value.avgDiscount = Math.max(0, avgDiscount)
          stats.value.foodRescued = `${totalWeight.toFixed(1)} kg`
          stats.value.mealsCount = totalMeals
          
          // Carbon saved with proper unit display
          stats.value.carbonSaved = totalCarbonSaved >= 1 
            ? `${totalCarbonSaved.toFixed(1)} kg CO₂` 
            : `${(totalCarbonSaved * 1000).toFixed(0)} g CO₂`
          
          // Update achievement level with cute names based on meals rescued
          const getAchievementLevel = (meals) => {
            if (meals >= 50) return '🌟 Eco Champion'
            if (meals >= 30) return '💚 Green Guardian'
            if (meals >= 20) return '🌿 Planet Protector'
            if (meals >= 10) return '🌱 Earth Friend'
            if (meals >= 5) return '🌾 Meal Saver'
            return '🌏 Eco Starter'
          }
          
          stats.value.achievement = getAchievementLevel(totalMeals)
          
          // Calculate order streak
          stats.value.orderStreak = calculateOrderStreak(orders)
          
          // Update the display count (this is shown in the welcome message)
          // Use number of orders in the current month (not total item quantities)
          rescuedMealsCount.value = currentMonthOrders.length
          
          // Don't update pet here - let the caller handle it
          // This prevents overwriting saved data during initialization
          
          // Find top dish (most ordered item)
          const itemCounts = {}
          orders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
              order.items.forEach(item => {
                const itemName = item.name || item.itemName || 'Unknown'
                const quantity = item.quantity || item.qty || 1
                itemCounts[itemName] = (itemCounts[itemName] || 0) + quantity
              })
            }
          })
          
          if (Object.keys(itemCounts).length > 0) {
            const topItemName = Object.keys(itemCounts).reduce((a, b) => 
              itemCounts[a] > itemCounts[b] ? a : b
            )
            const firstOrder = orders.find(o => 
              o.items?.some(i => (i.name || i.itemName) === topItemName)
            )
            
            topDish.value.name = topItemName
            topDish.value.orderCount = itemCounts[topItemName]
            topDish.value.stall = firstOrder?.hawkerName || "Hawker's Stall"
            topDish.value.stallId = firstOrder?.hawkerId || ''
          }
          
          console.log('✅ Stats calculated:', stats.value)
        } else {
          console.log('⚠️ No orders found for this user')
        }
      } catch (error) {
        console.error('❌ Error fetching orders:', error)
        console.error('Error details:', error.message)
        console.error('Error code:', error.code)
      }
    }

    // Update pet level, treats, and progress based on meals count
    const updatePetFromMeals = async (totalMeals, shouldSave = false) => {
      console.log('🐾 Updating pet from meals count:', totalMeals)
      
      // Calculate level from meals (every 10 meals = 1 level)
      const calculatedLevel = Math.floor(totalMeals / 10) + 1
      
      // Calculate progress within current level (0-100)
      const mealsInCurrentLevel = totalMeals % 10
      const calculatedProgress = (mealsInCurrentLevel / 10) * 100
      
      // Store calculated values for reference, but DON'T overwrite pet data yet
      // We'll use these as defaults only if no saved data exists
      return {
        calculatedLevel,
        calculatedProgress,
        calculatedTreats: totalMeals, // Base treats from orders
        mealsInCurrentLevel,
        totalMeals
      }
    }

    // Fetch pet customization from Firestore
    const fetchPetData = async (uid, calculatedStats = null) => {
      try {
        console.log('🐾 Fetching pet data from Firebase...')
        const petRef = doc(db, 'users', uid, 'pet', 'customization')
        const petSnap = await getDoc(petRef)
        
        if (petSnap.exists()) {
          const savedPet = petSnap.data()
          console.log('✅ Pet data loaded from Firebase:', savedPet)
          
          // Update pet data with saved values - these take FULL PRECEDENCE
          petData.value.name = savedPet.name || petData.value.name
          petData.value.happiness = savedPet.happiness ?? petData.value.happiness
          petData.value.energy = savedPet.energy ?? petData.value.energy
          petData.value.mood = savedPet.mood || petData.value.mood
          petData.value.experience = savedPet.experience ?? petData.value.experience
          
          // Use saved stats (level, progress, treats) - user's actions persist
          petData.value.level = savedPet.level ?? (calculatedStats?.calculatedLevel || petData.value.level)
          petData.value.progress = savedPet.progress ?? (calculatedStats?.calculatedProgress || petData.value.progress)
          petData.value.treats = savedPet.treats ?? (calculatedStats?.calculatedTreats || petData.value.treats)
          petData.value.mealsToLevelUp = savedPet.mealsToLevelUp ?? (10 - (calculatedStats?.mealsInCurrentLevel || 0))
          
          // Load avatar customizations
          if (savedPet.avatar) {
            petData.value.avatar = { ...petData.value.avatar, ...savedPet.avatar }
          }
          
          console.log('✅ Pet data fully loaded (saved data used):', {
            name: petData.value.name,
            level: petData.value.level,
            treats: petData.value.treats,
            happiness: petData.value.happiness,
            energy: petData.value.energy
          })
        } else {
          console.log('📝 No saved pet data found, using calculated defaults')
          
          // If no saved data, use calculated stats
          if (calculatedStats) {
            petData.value.level = calculatedStats.calculatedLevel
            petData.value.progress = calculatedStats.calculatedProgress
            petData.value.treats = calculatedStats.calculatedTreats
            petData.value.mealsToLevelUp = 10 - calculatedStats.mealsInCurrentLevel
          }
          
          // Save initial defaults to Firebase
          await savePetData()
        }
      } catch (error) {
        console.error('❌ Error fetching pet data:', error)
        console.error('Error details:', error.message)
        
        // If error and we have calculated stats, use them
        if (calculatedStats) {
          petData.value.level = calculatedStats.calculatedLevel
          petData.value.progress = calculatedStats.calculatedProgress
          petData.value.treats = calculatedStats.calculatedTreats
          petData.value.mealsToLevelUp = 10 - calculatedStats.mealsInCurrentLevel
        }
      }
    }

    // Save pet customization to Firestore
    const savePetData = async () => {
      if (!currentUserId.value) {
        console.warn('⚠️ No user ID, cannot save pet data')
        return false
      }
      
      try {
        const dataToSave = {
          name: petData.value.name,
          happiness: petData.value.happiness,
          energy: petData.value.energy,
          level: petData.value.level,
          progress: petData.value.progress,
          experience: petData.value.experience,
          treats: petData.value.treats,
          mood: petData.value.mood,
          mealsToLevelUp: petData.value.mealsToLevelUp,
          avatar: petData.value.avatar,
          lastUpdated: new Date()
        }
        
        console.log('💾 Saving pet data to Firebase...', dataToSave)
        
        const petRef = doc(db, 'users', currentUserId.value, 'pet', 'customization')
        await setDoc(petRef, dataToSave, { merge: true })
        
        console.log('✅ Pet data saved successfully to Firebase')
        return true
      } catch (error) {
        console.error('❌ Error saving pet data:', error)
        console.error('Error details:', error.message)
        
        // Show error message to user
        petMessage.value = '❌ Failed to save. Please try again.'
        petMessageType.value = 'error'
        setTimeout(() => { petMessage.value = '' }, 3000)
        return false
      }
    }

    // Helper: fetch order IDs for the given user (tries userId then buyerId)
    const fetchOrderIdsForUser = async (uid) => {
      try {
        const ordersRef = collection(db, 'orders')
        let snapshot = null
        try {
          const q = query(ordersRef, where('userId', '==', uid))
          snapshot = await getDocs(q)
        } catch (e) {
          // fallback to buyerId if userId yields none or index error
          const fallbackQ = query(ordersRef, where('buyerId', '==', uid))
          snapshot = await getDocs(fallbackQ)
        }

        if (!snapshot) return []
        return snapshot.docs.map(d => d.id)
      } catch (err) {
        console.error('❌ Error fetching order IDs for user:', err)
        return []
      }
    }

    // Helper: award treats for specific order IDs transactionally to avoid race conditions/duplicates
    // This writes a small processedOrders map inside the pet doc so multiple clients won't award the same order twice.
    const awardTreats = async (orderIds = []) => {
      if (!currentUserId.value) return false
      if (!orderIds || orderIds.length === 0) return false

      try {
        const petRef = doc(db, 'users', currentUserId.value, 'pet', 'customization')
        let awardedCount = 0

        await runTransaction(db, async (tx) => {
          const petSnap = await tx.get(petRef)
          const serverData = petSnap.exists() ? petSnap.data() : {}
          const serverTreats = serverData.treats || 0
          const processed = serverData.processedOrders || {}

          // Determine which orderIds are new (not processed yet)
          const newOrderIds = orderIds.filter(id => !processed || !processed[id])
          if (newOrderIds.length === 0) {
            awardedCount = 0
            return
          }

          // Mark them as processed and increment treats
          newOrderIds.forEach(id => { processed[id] = true })
          const newTreats = serverTreats + newOrderIds.length

          tx.set(petRef, { treats: newTreats, processedOrders: processed, lastUpdated: new Date() }, { merge: true })
          awardedCount = newOrderIds.length
        })

        // Update local state after successful transaction
        if (awardedCount > 0) {
          petData.value.treats = (Number(petData.value.treats) || 0) + awardedCount
          console.log(`🍪 Awarded ${awardedCount} treat(s) for orders:`, orderIds)
        } else {
          console.log('🍪 No unprocessed orders found to award')
        }

        return awardedCount > 0
      } catch (err) {
        console.error('❌ Error awarding treats transactionally:', err)
        return false
      }
    }

  // Listen to auth state changes and fetch all data
  let ordersPollHandle = null // Store polling interval handle
  const POLL_INTERVAL_MS = 15000 // 15s polling for new orders
  const lastKnownOrderIds = ref(new Set())
    
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUserId.value = user.uid
        
        // Fetch user data
        await fetchUserData(user.uid)
        
        // Fetch orders and calculate stats (but don't apply them yet)
        await fetchOrdersData(user.uid)
        
        // Get calculated stats for reference
        const totalMeals = rescuedMealsCount.value
        const calculatedStats = await updatePetFromMeals(totalMeals)
        
        // Load pet data from Firebase (saved data takes precedence)
        await fetchPetData(user.uid, calculatedStats)
        
        console.log('✅ All data loaded successfully')
        
        // Set up real-time listener for orders
        console.log('👂 Setting up periodic orders check (no snapshot)')

        // Initialize baseline of known orders so we only award treats for NEW orders
        const initializeOrdersBaseline = async () => {
          try {
            const ids = await fetchOrderIdsForUser(user.uid)
            lastKnownOrderIds.value = new Set(ids)
            console.log('🔁 Orders baseline initialized with', ids.length, 'orders')
          } catch (err) {
            console.error('❌ Error initializing orders baseline:', err)
          }
        }

        // Check for new orders by fetching current order ids and comparing to baseline
        const checkForNewOrders = async () => {
          try {
            const currentIds = await fetchOrderIdsForUser(user.uid)
            const newIds = currentIds.filter(id => !lastKnownOrderIds.value.has(id))
            if (newIds.length > 0) {
              console.log('🔔 Detected new orders:', newIds)
              // Award treats for these specific order IDs using a transaction to avoid races/duplicates
              const awarded = await awardTreats(newIds)
              // Update baseline to include the new IDs (regardless of whether transaction awarded)
              newIds.forEach(id => lastKnownOrderIds.value.add(id))
              // Recompute stats for UI
              await fetchOrdersData(user.uid)
              showMessage(`+${newIds.length} treat${newIds.length > 1 ? 's' : ''} earned!`, 'success')
            }
          } catch (err) {
            console.error('❌ Error checking for new orders:', err)
          }
        }

        // Start baseline and polling
        await initializeOrdersBaseline()
        // Immediate check to pick up any orders between initial load and baseline
        await checkForNewOrders()
        // Start periodic polling
        if (ordersPollHandle) {
          clearInterval(ordersPollHandle)
          ordersPollHandle = null
        }
        ordersPollHandle = setInterval(checkForNewOrders, POLL_INTERVAL_MS)
      } else {
        username.value = 'Guest'
        currentUserId.value = null
        
        // Clean up polling if user logs out
        if (ordersPollHandle) {
          clearInterval(ordersPollHandle)
          ordersPollHandle = null
        }
      }
    })
    
    // Clean up polling on component unmount
    onUnmounted(() => {
      if (ordersPollHandle) {
        console.log('🧹 Cleaning up orders polling...')
        clearInterval(ordersPollHandle)
        ordersPollHandle = null
      }
    })

    // Main Stats
    const stats = ref({
      moneySaved: '$0.00',
      avgDiscount: 0,
      foodRescued: '0 kg',
      mealsCount: 0,
      orderStreak: 0,
      achievement: '🌏 Eco Starter'
    })

    // Top Dish
    const topDish = ref({
      name: 'Laksa',
      stall: "Ah Heng's Delights",
      stallId: 'ahhengs-delights', // Add stallId for navigation
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
        background: 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 100%)',
        accessory: 'none',
        accessoryColor: '#FF69B4',
        face: 'M 50 50 Q 60 55 70 50'
      }
    })

    // Customization Options with Tiered Unlocks
    const animalTypes = ref([
      { value: 'dog', name: 'Dog', emoji: '🐶', locked: false, unlockLevel: 1 },
      { value: 'cat', name: 'Cat', emoji: '🐱', locked: false, unlockLevel: 1 },
      { value: 'bunny', name: 'Bunny', emoji: '🐰', locked: false, unlockLevel: 1 },
      { value: 'fox', name: 'Fox', emoji: '🦊', locked: true, unlockLevel: 3 },
      { value: 'bear', name: 'Bear', emoji: '🐻', locked: true, unlockLevel: 5 },
      { value: 'panda', name: 'Panda', emoji: '🐼', locked: true, unlockLevel: 7 },
    ])

    const colorPalette = ref([
      { value: '#FFD700', name: 'Golden', locked: false, unlockLevel: 1 },
      { value: '#FFA07A', name: 'Salmon', locked: false, unlockLevel: 1 },
      { value: '#98D8C8', name: 'Mint', locked: false, unlockLevel: 1 },
      { value: '#F7B7D0', name: 'Pink', locked: false, unlockLevel: 1 },
      { value: '#B19CD9', name: 'Lavender', locked: true, unlockLevel: 2 },
      { value: '#FFB6C1', name: 'Rose', locked: true, unlockLevel: 2 },
      { value: '#87CEEB', name: 'Sky', locked: true, unlockLevel: 3 },
      { value: '#DDA0DD', name: 'Plum', locked: true, unlockLevel: 3 },
      { value: '#FFE4B5', name: 'Cream', locked: true, unlockLevel: 4 },
      { value: '#FFDAB9', name: 'Peach', locked: true, unlockLevel: 4 },
      { value: '#E0BBE4', name: 'Lilac', locked: true, unlockLevel: 5 },
      { value: '#957DAD', name: 'Purple', locked: true, unlockLevel: 6 },
    ])

    const backgrounds = ref([
      { value: 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 100%)', name: 'Sky Blue', locked: false, unlockLevel: 1 },
      { value: 'linear-gradient(180deg, #FFE5B4 0%, #FFF8DC 100%)', name: 'Sunset', locked: false, unlockLevel: 1 },
      { value: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)', name: 'Night Sky', locked: false, unlockLevel: 1 },
      { value: 'linear-gradient(180deg, #98D8C8 0%, #B5EAD7 100%)', name: 'Mint Fresh', locked: true, unlockLevel: 2 },
      { value: 'linear-gradient(180deg, #FFB7B2 0%, #FFDAC1 100%)', name: 'Peachy', locked: true, unlockLevel: 3 },
      { value: 'linear-gradient(180deg, #E0BBE4 0%, #FFDFD3 100%)', name: 'Dreamy', locked: true, unlockLevel: 4 },
      { value: 'linear-gradient(180deg, #C7CEEA 0%, #FFC8DD 100%)', name: 'Cotton Candy', locked: true, unlockLevel: 5 },
      { value: 'linear-gradient(180deg, #FDE2E4 0%, #FAD2E1 100%)', name: 'Blush', locked: true, unlockLevel: 6 },
      { value: 'linear-gradient(180deg, #FFE66D 0%, #FFF4A3 100%)', name: 'Sunshine', locked: true, unlockLevel: 7 },
    ])

    const accessories = ref([
      { value: 'none', name: 'None', emoji: '✖️', locked: false, unlockLevel: 1 },
      { value: 'bow', name: 'Bow', emoji: '🎀', locked: false, unlockLevel: 1 },
      { value: 'hat', name: 'Hat', emoji: '🎩', locked: true, unlockLevel: 2 },
      { value: 'glasses', name: 'Glasses', emoji: '👓', locked: true, unlockLevel: 3 },
      { value: 'scarf', name: 'Scarf', emoji: '🧣', locked: true, unlockLevel: 4 },
      { value: 'flower', name: 'Flower', emoji: '🌸', locked: true, unlockLevel: 5 },
      { value: 'crown', name: 'Crown', emoji: '👑', locked: true, unlockLevel: 7 },
    ])

    const accessoryColors = ref([
      { value: '#FF69B4', name: 'Hot Pink' },
      { value: '#FFD700', name: 'Gold' },
      { value: '#87CEEB', name: 'Sky Blue' },
      { value: '#98D8C8', name: 'Mint' },
      { value: '#DDA0DD', name: 'Plum' },
      { value: '#FF6347', name: 'Tomato' },
      { value: '#BA55D3', name: 'Orchid' },
      { value: '#20B2AA', name: 'Sea Green' },
    ])

    // Check if item is unlocked
    const isUnlocked = (requiredLevel) => {
      return petData.value.level >= requiredLevel
    }

    // Selection handlers with unlock checks
    const selectAnimal = async (animal) => {
      if (!animal) return
      
      if (animal.locked && !isUnlocked(animal.unlockLevel)) {
        petMessage.value = `🔒 Unlock ${animal.name} at Level ${animal.unlockLevel}! Keep rescuing meals!`
        petMessageType.value = 'warning'
        setTimeout(() => { petMessage.value = '' }, 3000)
        return
      }
      
      petData.value.avatar.body = animal.value
      petMessage.value = `✨ Selected ${animal.name}! Click "Save All Changes" to save.`
      petMessageType.value = 'info'
      setTimeout(() => { petMessage.value = '' }, 2000)
    }

    const selectColor = async (color) => {
      if (!color) return
      
      if (color.locked && !isUnlocked(color.unlockLevel)) {
        petMessage.value = `🔒 Unlock ${color.name} color at Level ${color.unlockLevel}!`
        petMessageType.value = 'warning'
        setTimeout(() => { petMessage.value = '' }, 3000)
        return
      }
      
      petData.value.avatar.color = color.value
      petMessage.value = `🎨 Color selected! Click "Save All Changes" to save.`
      petMessageType.value = 'info'
      setTimeout(() => { petMessage.value = '' }, 2000)
    }

    const selectBackground = async (bg) => {
      if (!bg) return
      
      if (bg.locked && !isUnlocked(bg.unlockLevel)) {
        petMessage.value = `🔒 Unlock ${bg.name} background at Level ${bg.unlockLevel}!`
        petMessageType.value = 'warning'
        setTimeout(() => { petMessage.value = '' }, 3000)
        return
      }
      
      petData.value.avatar.background = bg.value
      petMessage.value = `🖼️ Background selected! Click "Save All Changes" to save.`
      petMessageType.value = 'info'
      setTimeout(() => { petMessage.value = '' }, 2000)
    }

    const selectAccessory = async (acc) => {
      if (!acc) return
      
      if (acc.locked && !isUnlocked(acc.unlockLevel)) {
        petMessage.value = `🔒 Unlock ${acc.name} at Level ${acc.unlockLevel}!`
        petMessageType.value = 'warning'
        setTimeout(() => { petMessage.value = '' }, 3000)
        return
      }
      
      petData.value.avatar.accessory = acc.value
      petMessage.value = acc.value === 'none' ? '👌 Accessory removed!' : `${acc.emoji} ${acc.name} selected!`
      petMessageType.value = 'info'
      setTimeout(() => { petMessage.value = '' }, 2000)
    }

    // Auto-save functions with debouncing
    let autoSaveTimeout = null
    const autoSaving = ref(false)
    const lastSaved = ref(false)

    const performAutoSave = async () => {
      if (!currentUserId.value) return
      
      try {
        autoSaving.value = true
        lastSaved.value = false
        
        // Validate before saving
        if (!petData.value.name || petData.value.name.trim() === '') {
          petData.value.name = '2Shiok Buddy' // Default name
        }
        
        petData.value.name = petData.value.name.trim()
        petData.value.lastUpdated = new Date().toISOString()
        
        const petRef = doc(db, 'users', currentUserId.value, 'pet', 'customization')
        await setDoc(petRef, petData.value, { merge: true })
        
        console.log('✅ Auto-saved pet customization')
        
        autoSaving.value = false
        lastSaved.value = true
        
        // Hide "Saved" indicator after 2 seconds
        setTimeout(() => {
          lastSaved.value = false
        }, 2000)
      } catch (error) {
        console.error('Error auto-saving pet:', error)
        autoSaving.value = false
      }
    }

    const autoSavePet = () => {
      // Clear existing timeout
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout)
      }
      
      // Debounce: save 300ms after user stops typing
      autoSaveTimeout = setTimeout(() => {
        performAutoSave()
      }, 300)
    }

    const selectAnimalAuto = async (animal) => {
      if (!animal) return
      
      if (animal.locked && !isUnlocked(animal.unlockLevel)) {
        petMessage.value = `🔒 Unlock ${animal.name} at Level ${animal.unlockLevel}! Keep rescuing meals!`
        petMessageType.value = 'warning'
        setTimeout(() => { petMessage.value = '' }, 3000)
        return
      }
      
      petData.value.avatar.body = animal.value
      performAutoSave()
    }

    const selectColorAuto = async (color) => {
      if (!color) return
      
      if (color.locked && !isUnlocked(color.unlockLevel)) {
        petMessage.value = `🔒 Unlock ${color.name} color at Level ${color.unlockLevel}!`
        petMessageType.value = 'warning'
        setTimeout(() => { petMessage.value = '' }, 3000)
        return
      }
      
      petData.value.avatar.color = color.value
      performAutoSave()
    }

    const selectBackgroundAuto = async (bg) => {
      if (!bg) return
      
      if (bg.locked && !isUnlocked(bg.unlockLevel)) {
        petMessage.value = `🔒 Unlock ${bg.name} background at Level ${bg.unlockLevel}!`
        petMessageType.value = 'warning'
        setTimeout(() => { petMessage.value = '' }, 3000)
        return
      }
      
      petData.value.avatar.background = bg.value
      performAutoSave()
    }

    const selectAccessoryAuto = async (acc) => {
      if (!acc) return
      
      if (acc.locked && !isUnlocked(acc.unlockLevel)) {
        petMessage.value = `🔒 Unlock ${acc.name} at Level ${acc.unlockLevel}!`
        petMessageType.value = 'warning'
        setTimeout(() => { petMessage.value = '' }, 3000)
        return
      }
      
      petData.value.avatar.accessory = acc.value
      performAutoSave()
    }

    // Handle Save All button click with validation
    const handleSaveAll = async () => {
      if (isSaving.value) return
      
      // Validation
      const errors = []
      
      // Validate pet name
      if (!petData.value.name || petData.value.name.trim() === '') {
        errors.push('Pet name cannot be empty')
      } else if (petData.value.name.trim().length < 2) {
        errors.push('Pet name must be at least 2 characters')
      } else if (petData.value.name.trim().length > 12) {
        errors.push('Pet name must be 12 characters or less')
      }
      
      // Validate pet name doesn't contain special characters
      const nameRegex = /^[a-zA-Z0-9\s\-_]+$/
      if (petData.value.name && !nameRegex.test(petData.value.name.trim())) {
        errors.push('Pet name can only contain letters, numbers, spaces, hyphens, and underscores')
      }
      
      // Validate customization selections
      if (!petData.value.avatar.body) {
        errors.push('Please select an animal type')
      }
      
      if (!petData.value.avatar.color) {
        errors.push('Please select a color')
      }
      
      if (!petData.value.avatar.background) {
        errors.push('Please select a background')
      }
      
      // Show validation errors if any
      if (errors.length > 0) {
        petMessage.value = '⚠️ ' + errors.join('. ')
        petMessageType.value = 'error'
        setTimeout(() => { petMessage.value = '' }, 5000)
        return
      }
      
      // Trim pet name
      petData.value.name = petData.value.name.trim()
      
      isSaving.value = true
      petMessage.value = '💾 Saving changes...'
      petMessageType.value = 'info'
      
      try {
        const success = await savePetData()
        
        if (success) {
          // Show success state
          saveSuccess.value = true
          petMessage.value = ''
          petMessageType.value = 'success'
          
          // Add confetti animation effect
          petAnimation.value = 'excited'
          setTimeout(() => { petAnimation.value = '' }, 600)
          
          // Reset success state after 2 seconds
          setTimeout(() => {
            saveSuccess.value = false
          }, 2000)
        } else {
          petMessage.value = '❌ Failed to save changes. Please try again.'
          petMessageType.value = 'error'
          setTimeout(() => { petMessage.value = '' }, 4000)
        }
      } catch (error) {
        console.error('❌ Error in handleSaveAll:', error)
        petMessage.value = '❌ An error occurred. Please try again.'
        petMessageType.value = 'error'
        setTimeout(() => { petMessage.value = '' }, 4000)
      } finally {
        isSaving.value = false
      }
    }

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

    // Level Names - 10 Cute Food Wastage Themed Levels
    const levelNames = [
      { level: 1, name: '🌱 Leftover Learner', description: 'Just starting your food rescue journey!' },
      { level: 2, name: '🍃 Waste Watcher', description: 'You\'re keeping an eye on food waste!' },
      { level: 3, name: '🌿 Rescue Rookie', description: 'Getting the hang of saving meals!' },
      { level: 4, name: '🌾 Sustainability Star', description: 'Shining bright with eco-friendly choices!' },
      { level: 5, name: '🌳 Green Guardian', description: 'A true protector of our planet!' },
      { level: 6, name: '🏆 Waste Warrior', description: 'Fighting food waste like a hero!' },
      { level: 7, name: '💚 Eco Champion', description: 'Leading the charge against waste!' },
      { level: 8, name: '🌟 Planet Protector', description: 'Making a real difference every day!' },
      { level: 9, name: '👑 Sustainability Sovereign', description: 'Royalty in the world of eco-warriors!' },
      { level: 10, name: '🌍 Earth\'s Hero', description: 'The ultimate food rescue legend!' }
    ]

    // Computed property to get level name
    const currentLevelName = computed(() => {
      const level = petData.value.level
      const levelIndex = Math.min(Math.max(level - 1, 0), levelNames.length - 1)
      return levelNames[levelIndex]
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
    const feedPet = async () => {
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
        
        // Save to Firebase
        await savePetData()
      } else {
        showMessage('No treats left! Order food to earn more.', 'warning')
      }
    }

    // Handler when child component emits updated treats count
    const onUpdateTreats = async (newCount) => {
      try {
        const parsed = Number(newCount)
        if (!isNaN(parsed)) {
          petData.value.treats = parsed
          console.log('🍪 onUpdateTreats received, persisting new treats:', parsed)
          await savePetData()
        } else {
          console.warn('onUpdateTreats received non-numeric value:', newCount)
        }
      } catch (err) {
        console.error('Error in onUpdateTreats:', err)
      }
    }

    const playWithPet = async () => {
      if (petData.value.energy >= 10) {
        petData.value.energy -= 10
        petData.value.happiness = Math.min(100, petData.value.happiness + 15)
        petData.value.experience += 8
        petData.value.progress = Math.min(100, petData.value.progress + 5)
        petAnimation.value = 'excited'
        showMessage('Wheee! +15 happiness', 'success')
        setTimeout(() => { petAnimation.value = '' }, 500)
        checkLevelUp()
        
        // Save to Firebase
        await savePetData()
      } else {
        showMessage('Pet is too tired. Feed to restore energy!', 'info')
      }
    }

    const petClick = async () => {
      petData.value.happiness = Math.min(100, petData.value.happiness + 2)
      petData.value.experience += 1
      petAnimation.value = 'happy'
      setTimeout(() => { petAnimation.value = '' }, 300)
      
      // Save to Firebase (debounced to avoid too many writes)
      await savePetData()
    }

    const checkLevelUp = async () => {
      if (petData.value.progress >= 100) {
        petData.value.level++
        petData.value.progress = 0
        showMessage(`Level Up! Now Level ${petData.value.level}! 🎉`, 'success')
        
        // Save level up to Firebase
        await savePetData()
      }
      petData.value.mealsToLevelUp = Math.ceil((100 - petData.value.progress) / 10)
    }

    const showMessage = (msg, type) => {
      petMessage.value = msg
      petMessageType.value = type
      setTimeout(() => { petMessage.value = '' }, 3000)
    }

    const handleDragOver = (e) => { }
    const handleDrop = (e) => { }

    // Navigate to stall page with the top dish
    const orderTopDish = () => {
      if (!topDish.value.stallId) {
        console.error('Stall ID not available for top dish');
        return;
      }
      
      // Navigate to the buyer view stall page for the hawker that sells the top dish
      router.push({
        name: 'BuyerViewStall',
        params: { 
          userId: topDish.value.stallId
        }
      })
    }

    onMounted(() => {
      const savedTheme = localStorage.getItem('buyer-theme')
      if (savedTheme === 'dark') {
        isDarkMode.value = true
        document.body.classList.add('dark-mode')
        document.documentElement.setAttribute('data-bs-theme', 'dark')
      }
    })

    return {
      isDarkMode, showCustomization, petAnimation, petMessage, petMessageType, isSaving, saveSuccess,
      autoSaving, lastSaved,
      username, rescuedMealsCount, stats, topDish, stallHighlight, smartInsight,
      petData, timeFilters, orderFilters,
      foodRescuedChartData, savingsComparisonChartData,
      updateFoodRescuedFilter, updateSavingsFilter,
  toggleTheme, feedPet, playWithPet, petClick, handleDragOver, handleDrop, onUpdateTreats,
      orderTopDish,
      animalTypes, colorPalette, backgrounds, accessories, accessoryColors,
      isUnlocked, selectAnimal, selectColor, selectBackground, selectAccessory,
      selectAnimalAuto, selectColorAuto, selectBackgroundAuto, selectAccessoryAuto,
      autoSavePet,
      handleSaveAll,
      currentLevelName
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
  transition: all 0.3s ease;
  position: relative;
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
  background: transparent;
}

.buyer-dashboard {
  min-height: 100vh;
  background: transparent;
}

/* Dark Theme */
.buyer-dashboard.dark-theme {
  background: transparent;
  min-height: 100vh;
  color: #e2e8f0;
}

.dark-theme h2,
.dark-theme h4,
.dark-theme h5 {
  color: #e2e8f0 !important;
}

.dark-theme .highlight-header h5,
.dark-theme .pet-header h4 {
  color: #10b981 !important;
}

.dark-theme .text-muted {
  color: #94a3b8 !important;
}

.dark-theme .highlight-body h4 {
  color: #e2e8f0 !important;
}

/* Stat Cards */
.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.75rem;
  display: flex;
  /* Use column layout so icon sits above the main value and labels are centered
     This ensures consistent vertical alignment across different card sizes */
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
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
  display: block;
  margin-bottom: 0.25rem;
}

.stat-content {
  /* keep content full-width and centered inside the card */
  flex: none;
  width: 100%;
  text-align: center;
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

.stat-label,
.stat-detail {
  text-align: center;
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

/* Pet Progress Bar - Professional Design */
.pet-progress {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border-radius: 16px;
  border: 2px solid #bbf7d0;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
}

.dark-theme .pet-progress {
  background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
  border-color: #10b981;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
}

.level-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 24px;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  margin-bottom: 1rem;
}

.dark-theme .level-badge {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.4);
}

.progress-container {
  position: relative;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0;
}

.progress-track {
  position: relative;
  height: 32px;
  background: linear-gradient(180deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 16px;
  overflow: visible;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.05);
  border: 2px solid #e5e7eb;
}

.dark-theme .progress-track {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 1px 2px rgba(0, 0, 0, 0.2);
  border-color: #334155;
}

.progress-fill {
  position: relative;
  height: 100%;
  background: linear-gradient(135deg, 
    #10b981 0%, 
    #059669 25%,
    #047857 50%,
    #059669 75%,
    #10b981 100%);
  background-size: 200% 100%;
  border-radius: 14px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  box-shadow: 
    0 2px 8px rgba(16, 185, 129, 0.4),
    inset 0 1px 2px rgba(255, 255, 255, 0.3);
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.dark-theme .progress-fill {
  background: linear-gradient(135deg, 
    #059669 0%, 
    #047857 25%,
    #065f46 50%,
    #047857 75%,
    #059669 100%);
  background-size: 200% 100%;
  box-shadow: 
    0 2px 8px rgba(5, 150, 105, 0.5),
    inset 0 1px 2px rgba(255, 255, 255, 0.1);
}

.progress-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: shine 2.5s ease-in-out infinite;
}

@keyframes shine {
  0% {
    left: -100%;
  }
  50%,
  100% {
    left: 100%;
  }
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: 700;
  font-size: 0.9rem;
  color: white;
  text-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 10;
  pointer-events: none;
  letter-spacing: 0.5px;
}

.progress-milestones {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

.milestone {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 28px;
  height: 28px;
  background: white;
  border: 3px solid #d1d5db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 2px 6px rgba(0, 0, 0, 0.15),
    0 0 0 0 rgba(16, 185, 129, 0);
  color: #9ca3af;
}

.dark-theme .milestone {
  background: #0f172a;
  border-color: #475569;
  box-shadow: 
    0 2px 6px rgba(0, 0, 0, 0.3),
    0 0 0 0 rgba(16, 185, 129, 0);
}

.milestone.reached {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-color: #f59e0b;
  color: white;
  transform: translate(-50%, -50%) scale(1.2);
  box-shadow: 
    0 4px 12px rgba(245, 158, 11, 0.5),
    0 0 0 4px rgba(251, 191, 36, 0.2);
  animation: starPop 0.5s ease-out;
}

@keyframes starPop {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.3);
  }
  100% {
    transform: translate(-50%, -50%) scale(1.2);
  }
}

.dark-theme .milestone.reached {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-color: #d97706;
  box-shadow: 
    0 4px 12px rgba(217, 119, 6, 0.6),
    0 0 0 4px rgba(245, 158, 11, 0.3);
}

.milestone.crown {
  width: 32px;
  height: 32px;
  font-size: 14px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-color: #f59e0b;
  color: white;
  border-width: 4px;
}

.milestone.crown.reached {
  transform: translate(-50%, -50%) scale(1.35);
  box-shadow: 
    0 6px 16px rgba(251, 191, 36, 0.7),
    0 0 0 6px rgba(251, 191, 36, 0.3);
  animation: crownPulse 1.5s ease-in-out infinite;
}

@keyframes crownPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1.35);
    box-shadow: 
      0 6px 16px rgba(251, 191, 36, 0.7),
      0 0 0 6px rgba(251, 191, 36, 0.3);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.45) rotate(5deg);
    box-shadow: 
      0 8px 20px rgba(251, 191, 36, 0.9),
      0 0 0 8px rgba(251, 191, 36, 0.4);
  }
}

/* Pet Section */
.pet-section {
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.08);
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

.pet-section:hover {
  box-shadow: 0 12px 32px rgba(16, 185, 129, 0.12);
  transform: translateY(-2px);
}

.dark-theme .pet-section.dark-mode-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-color: #334155;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

/* Success Animation */
@keyframes saveSuccess {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.save-success {
  animation: saveSuccess 0.6s ease-out;
}

/* Pet Message Styling */
.pet-message {
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin: 1rem 0;
  font-weight: 600;
  text-align: center;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pet-message.success {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border: 2px solid #10b981;
}

.pet-message.error {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border: 2px solid #ef4444;
}

/* Card Component Dark Mode */
.dark-theme .dark-mode-card.card {
  background: #1e293b !important;
  border-color: #334155 !important;
}

.dark-theme .dark-mode-card .card-header {
  background: #0f172a !important;
  border-bottom: 1px solid #334155 !important;
}

.dark-theme .dark-mode-card .card-header h5 {
  color: #10b981 !important;
}

.dark-theme .dark-mode-card .card-body {
  background: #1e293b !important;
  color: #e2e8f0;
}

.pet-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 3px solid transparent;
  background: linear-gradient(to right, #e5e7eb, #e5e7eb) bottom / 100% 3px no-repeat;
  position: relative;
}

.pet-header::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 30%;
  height: 3px;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.pet-header:hover::after {
  width: 50%;
}

.dark-theme .pet-header {
  background: linear-gradient(to right, #334155, #334155) bottom / 100% 3px no-repeat;
}

.dark-theme .pet-header::after {
  background: linear-gradient(90deg, #059669 0%, #047857 100%);
}

.pet-header h4 {
  font-weight: 700;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 1.5rem;
  margin: 0;
}

.dark-theme .pet-header h4 {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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

/* Customization Panel */
.customization-wrapper {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2rem;
  padding: 1rem 0;
  align-items: start;
}

.preview-section {
  position: sticky;
  top: 2rem;
  height: fit-content;
  order: 2; /* Preview on the right */
  max-height: calc(100vh - 4rem);
  overflow: visible;
}

.options-section {
  order: 1; /* Options on the left */
}

.preview-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.12);
  border: 2px solid #e5e7eb;
  transition: transform 0.2s ease;
}

.preview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(16, 185, 129, 0.18);
}

.dark-theme .preview-card {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.preview-label {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.875rem 1rem;
  font-weight: 600;
  font-size: 0.875rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.pet-preview {
  padding: 2.5rem 1.5rem;
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: linear-gradient(180deg, rgba(16, 185, 129, 0.03) 0%, transparent 100%);
}

.avatar-preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.preview-avatar {
  filter: drop-shadow(0 8px 16px rgba(16, 185, 129, 0.2)) 
          drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  animation: float 3s ease-in-out infinite;
  transition: filter 0.3s ease;
}

.preview-avatar:hover {
  filter: drop-shadow(0 12px 24px rgba(16, 185, 129, 0.3)) 
          drop-shadow(0 6px 12px rgba(0, 0, 0, 0.15));
}

.pet-name-display {
  font-size: 1.25rem;
  font-weight: 700;
  color: #059669;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 1.5rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dark-theme .pet-name-display {
  color: #10b981;
  background: #0f172a;
}

.options-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
  padding-right: 0.5rem;
  /* Custom scrollbar */
  scrollbar-width: thin;
  scrollbar-color: #10b981 #e5e7eb;
}

.options-section::-webkit-scrollbar {
  width: 8px;
}

.options-section::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.options-section::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 10px;
  transition: background 0.2s;
}

.options-section::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.dark-theme .options-section::-webkit-scrollbar-track {
  background: #1e293b;
}

.customization-group {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.2s ease;
}

.customization-group:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.dark-theme .customization-group {
  background: #1e293b;
  border-color: #334155;
}

.custom-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: #059669;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dark-theme .custom-label {
  color: #10b981;
}

.custom-input {
  width: 100%;
  padding: 0.875rem 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  background: white;
}

.custom-input:hover {
  border-color: #d1d5db;
}

.custom-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
  transform: translateY(-1px);
}

.dark-theme .custom-input {
  background: #0f172a;
  border-color: #334155;
  color: #e2e8f0;
}

.dark-theme .custom-input:hover {
  border-color: #475569;
}

.dark-theme .custom-input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
}

.option-card {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.option-card:hover:not(.locked) {
  transform: translateY(-4px);
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.option-card.selected {
  border-color: #10b981;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.option-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f3f4f6;
  pointer-events: auto; /* Keep auto so click handler can show lock message */
}

.option-card.locked:hover {
  transform: none;
  border-color: #e5e7eb;
  box-shadow: none;
}

.dark-theme .option-card {
  background: #0f172a;
  border-color: #334155;
}

.dark-theme .option-card.selected {
  background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
  border-color: #10b981;
}

.dark-theme .option-card.locked {
  background: #1e293b;
}

.option-emoji {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  display: block;
}

.option-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.dark-theme .option-name {
  color: #e2e8f0;
}

.unlock-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #fbbf24;
  color: #78350f;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 1rem;
}

.color-option {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.color-option:hover:not(.locked) {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.color-option.selected {
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
}

.color-option.locked {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: auto; /* Keep auto so click handler can show lock message */
}

.color-option.locked:hover {
  transform: none;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15);
}

.color-lock {
  position: absolute;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  border-radius: 9px;
}

.color-unlock-text {
  position: absolute;
  bottom: -1.5rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  font-weight: 700;
  color: #fbbf24;
  white-space: nowrap;
}

.background-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.background-option {
  height: 80px;
  border-radius: 12px;
  border: 3px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.background-option:hover:not(.locked) {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.background-option.selected {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
}

.background-option.locked {
  opacity: 0.4;
  cursor: not-allowed;
}

.dark-theme .background-option {
  border-color: #334155;
}

.bg-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.6);
  background: rgba(255, 255, 255, 0.8);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.check-icon {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  color: #10b981;
  font-size: 1.25rem;
  background: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

/* Save Button Container */
.save-button-container {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  border: 2px solid #e5e7eb;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
  margin-top: 1rem;
  z-index: 10;
}

.dark-theme .save-button-container {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
}

.btn-save-pet {
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-save-pet:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.btn-save-pet:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-save-pet:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
}

.btn-save-pet.btn-save-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  cursor: default;
  animation: successPulse 0.6s ease;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.5);
}

@keyframes successPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.btn-save-pet i {
  font-size: 1.25rem;
}

.dark-theme .btn-save-pet {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.dark-theme .btn-save-pet:hover:not(:disabled) {
  background: linear-gradient(135deg, #047857 0%, #065f46 100%);
}

/* Pet Message inside Save Container */
.save-button-container .pet-message {
  margin-top: 1rem;
  margin-bottom: 0;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 1rem 1.25rem;
  animation: slideInUp 0.3s ease;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pet-message.info {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  color: #075985;
  border: 2px solid #38bdf8;
}

.pet-message.warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border: 2px solid #fbbf24;
}

.pet-message.success {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #065f46;
  border: 2px solid #10b981;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
}

/* ====== COMPACT CUSTOMIZATION STYLES ====== */

/* Transition animations */
.transition-all {
  transition: all 0.3s ease;
}

.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

.customization-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  height: fit-content;
  max-height: calc(100vh - 8rem);
  overflow-y: auto;
  /* Custom scrollbar */
  scrollbar-width: thin;
  scrollbar-color: #10b981 #e5e7eb;
}

.customization-card::-webkit-scrollbar {
  width: 6px;
}

.customization-card::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.customization-card::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 10px;
}

.dark-theme .customization-card {
  background: #1e293b;
  border-color: #334155;
}

.customization-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.dark-theme .customization-header {
  border-bottom-color: #334155;
}

.btn-close-panel {
  background: #f3f4f6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
  font-size: 1rem;
}

.btn-close-panel:hover {
  background: #e5e7eb;
  color: #059669;
  transform: rotate(90deg);
}

.btn-close-panel.dark-mode {
  background: #334155;
  color: #94a3b8;
}

.btn-close-panel.dark-mode:hover {
  background: #475569;
  color: #10b981;
}

.customization-card h6 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #059669;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dark-theme .customization-card h6 {
  color: #10b981;
}

.customization-group-compact {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.customization-group-compact:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.dark-theme .customization-group-compact {
  border-bottom-color: #334155;
}

.custom-label-compact {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  font-size: 0.85rem;
  color: #059669;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.dark-theme .custom-label-compact {
  color: #10b981;
}

.custom-input-compact {
  width: 100%;
  padding: 0.65rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  background: white;
}

.custom-input-compact:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.dark-theme .custom-input-compact {
  background: #0f172a;
  border-color: #334155;
  color: #e2e8f0;
}

.option-grid-compact {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.option-card-compact {
  background: linear-gradient(135deg, #f8fdf9 0%, #f0fdf4 100%);
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.75rem 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  position: relative;
  text-align: center;
}

.option-card-compact:hover:not(.locked) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
  border-color: #10b981;
}

.option-card-compact.selected {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.option-card-compact.locked {
  opacity: 0.4;
  cursor: not-allowed;
}

.dark-theme .option-card-compact {
  background: #1e293b;
  border-color: #334155;
}

.dark-theme .option-card-compact.selected {
  background: #0f172a;
  border-color: #10b981;
}

.option-emoji-compact {
  font-size: 1.5rem;
  line-height: 1;
}

.option-name-compact {
  font-size: 0.7rem;
  font-weight: 600;
  color: #059669;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.dark-theme .option-name-compact {
  color: #10b981;
}

.unlock-badge-compact {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.15rem 0.3rem;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.color-grid-compact {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.color-option-compact {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 10px;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
  position: relative;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.color-option-compact:hover:not(.locked) {
  transform: scale(1.1);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
}

.color-option-compact.selected {
  border-color: #059669;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
}

.color-option-compact.locked {
  opacity: 0.3;
  cursor: not-allowed;
}

.color-lock-compact {
  position: absolute;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  border-radius: 10px;
}

.background-grid-compact {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.background-option-compact {
  height: 60px;
  border-radius: 10px;
  border: 3px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.background-option-compact:hover:not(.locked) {
  transform: translateY(-2px);
  border-color: #10b981;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.15);
}

.background-option-compact.selected {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
}

.background-option-compact.locked {
  opacity: 0.4;
  cursor: not-allowed;
}

.bg-label-compact {
  font-size: 0.7rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.9);
  color: #059669;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  z-index: 1;
}

.check-icon-compact {
  position: absolute;
  top: 4px;
  right: 4px;
  color: #10b981;
  font-size: 1rem;
  background: white;
  border-radius: 50%;
  padding: 0.15rem;
}

.auto-save-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  color: #075985;
  border: 2px solid #38bdf8;
  animation: fadeIn 0.3s ease;
}

.auto-save-indicator.saved {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #065f46;
  border-color: #10b981;
}

.auto-save-indicator i {
  font-size: 1rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pet-message.error {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border: 2px solid #ef4444;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

/* Responsive Customization */
@media (max-width: 992px) {
  .customization-wrapper {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .preview-section {
    position: relative;
    top: 0;
    max-height: none;
    order: 1; /* Preview on top for mobile */
  }

  .options-section {
    order: 2; /* Options below for mobile */
    max-height: none;
    overflow-y: visible;
    padding-right: 0;
  }

  .option-grid {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  }

  .color-grid {
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  }

  .background-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}

@media (max-width: 575px) {
  .customization-wrapper {
    padding: 0.5rem 0;
    gap: 1rem;
  }

  .customization-group {
    padding: 1rem;
  }

  .preview-card {
    margin-bottom: 1rem;
  }

  .pet-preview {
    padding: 1.5rem 1rem;
    min-height: 250px;
  }

  .option-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .option-emoji {
    font-size: 2rem;
  }

  .color-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
  }

  .background-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Responsive */
@media (max-width: 992px) {
  .buyer-dashboard-wrapper {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    margin: 0;
    border-radius: 0;
    position: static;
    max-height: none;
    padding: 12px 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .sidebar-nav {
    flex-direction: row;
    justify-content: space-between;
    overflow-x: auto;
    gap: 0;
    padding: 0;
  }

  .nav-item {
    flex-direction: column;
    padding: 12px 8px;
    min-width: 0;
    flex: 1;
    text-align: center;
    gap: 6px;
    border-radius: 0;
    margin: 0;
    border: none;
    border-bottom: 3px solid transparent;
  }

  .nav-item span {
    font-size: 0.7rem;
    white-space: nowrap;
  }

  .nav-item i {
    font-size: 1.25rem;
    margin: 0;
    width: auto;
  }

  .nav-item.active {
    border-bottom: 3px solid #388e3c;
    border-radius: 0;
  }

  .dark-sidebar .nav-item.active {
    border-bottom-color: #10b981;
  }

  h2 {
    font-size: 1.75rem !important;
  }

  .container-fluid {
    padding-left: 2rem !important;
    padding-right: 2rem !important;
  }

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

  .container-fluid {
    padding-left: 1.5rem !important;
    padding-right: 1.5rem !important;
  }

  h2 {
    font-size: 1.5rem !important;
  }
}

@media (max-width: 575px) {
  .sidebar {
    padding: 10px 0;
  }

  .nav-item {
    padding: 10px 4px;
    gap: 4px;
  }

  .nav-item span {
    font-size: 0.65rem;
  }

  .nav-item i {
    font-size: 1rem;
  }

  .stat-card {
    min-height: 140px !important;
  }

  .container-fluid {
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }
}

/* Print Styles for PDF Export */
@media print {

  /* Hide elements not needed in PDF */
  .no-print,
  .sidebar,
  .btn,
  button {
    display: none !important;
  }

  /* Reset wrapper to single column */
  .buyer-dashboard-wrapper {
    display: block !important;
    background: white !important;
  }

  .main-content {
    width: 100% !important;
  }

  /* Reset backgrounds for print */
  .buyer-dashboard,
  .buyer-dashboard.dark-theme {
    background: white !important;
    color: black !important;
  }

  /* Adjust title colors for print */
  h2,
  h4,
  h5,
  .dark-theme h2,
  .dark-theme h4,
  .dark-theme h5 {
    color: #059669 !important;
  }

  .dark-theme .highlight-header h5,
  .dark-theme .pet-header h4 {
    color: #059669 !important;
  }

  /* Keep stat card colors vibrant */
  .stat-card-success,
  .dark-theme .stat-card-success {
    background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  }

  .stat-card-info,
  .dark-theme .stat-card-info {
    background: linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  }

  .stat-card-warning,
  .dark-theme .stat-card-warning {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  }

  /* Remove hover effects */
  .stat-card:hover,
  .highlight-card:hover {
    transform: none !important;
  }

  /* Ensure charts are visible */
  .card,
  .dark-mode-card {
    background: white !important;
    border: 1px solid #e5e7eb !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
    page-break-inside: avoid;
  }

  .card-header,
  .bg-dark-header,
  .bg-light-header {
    background: #f0fdf4 !important;
    border-bottom: 1px solid #bbf7d0 !important;
  }

  .card-body,
  .dark-body {
    background: white !important;
    color: black !important;
  }

  /* Fix chart title colors */
  .card-header h5 {
    color: #059669 !important;
  }

  /* Highlight cards */
  .highlight-card,
  .dark-theme .highlight-card.dark-mode-card {
    background: white !important;
    border: 1px solid #e5e7eb !important;
  }

  .highlight-header,
  .dark-theme .highlight-header {
    background: #f0fdf4 !important;
    border-bottom: 1px solid #bbf7d0 !important;
  }

  .highlight-body h4,
  .dark-theme .highlight-body h4 {
    color: #1f2937 !important;
  }

  /* Achievement banner */
  .achievement-banner,
  .dark-theme .achievement-banner {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
    border-color: #fcd34d !important;
  }

  .achievement-banner h5,
  .dark-theme .achievement-banner h5 {
    color: #92400e !important;
  }

  .achievement-banner .text-muted,
  .dark-theme .achievement-banner .text-muted {
    color: #78350f !important;
  }

  /* Smart insight */
  .smart-insight,
  .dark-theme .smart-insight.dark-mode-card {
    background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%) !important;
    border-color: #c4b5fd !important;
  }

  .smart-insight h5,
  .dark-theme .smart-insight h5 {
    color: #5b21b6 !important;
  }

  .smart-insight p,
  .dark-theme .smart-insight p {
    color: #4c1d95 !important;
  }

  /* Pet section */
  .pet-section,
  .dark-theme .pet-section.dark-mode-card {
    background: white !important;
    border: 1px solid #e5e7eb !important;
  }

  .pet-header,
  .dark-theme .pet-header {
    border-color: #e5e7eb !important;
  }

  /* Text colors */
  .text-muted,
  .dark-theme .text-muted {
    color: #6b7280 !important;
  }

  .stat-value,
  .dark-theme .stat-value {
    color: #059669 !important;
  }

  .stat-label,
  .dark-theme .stat-label {
    color: #374151 !important;
  }

  .stat-detail,
  .dark-theme .stat-detail {
    color: #6b7280 !important;
  }

  /* Page breaks for better layout */
  .row.mb-4 {
    page-break-inside: avoid;
  }

  /* Adjust spacing for print */
  .container-fluid {
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }

  /* Fix canvas */
  canvas {
    max-width: 100% !important;
  }
}
</style>
