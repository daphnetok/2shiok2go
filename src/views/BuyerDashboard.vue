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
            <div class="col-12 col-lg-8 mb-3 mb-lg-0 text-center text-lg-start">
              <h2 class="mb-0 fw-bold d-flex align-items-center justify-content-center justify-content-lg-start" style="color: #059669;">
                <span style="font-size: 2rem; margin-right: 0.5rem;">👋</span>
                Welcome back, {{ username }}!
              </h2>
              <p class="mb-0 mt-2" style="color: #10b981; font-size: 1.1rem;">You've rescued <strong>{{ rescuedMealsCount }} meals</strong> this month 💚</p>
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

      <!-- Top Dish -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="highlight-card" :class="{ 'dark-mode-card': isDarkMode }">
            <div class="highlight-header">
              <h5 class="mb-0 fw-semibold" style="color: #059669;"><i class="fas fa-trophy me-2"></i>Your Top Dish</h5>
            </div>
            <div class="highlight-body">
              <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div class="d-flex align-items-center">
                  <span style="font-size: 3rem; margin-right: 1rem;">🍛</span>
                  <div>
                    <h4 class="mb-1 fw-bold">{{ topDish.name }}</h4>
                    <p class="mb-0 text-muted">from {{ topDish.stall }}</p>
                    <p class="mt-2 mb-0" style="color: #10b981; font-weight: 500;">"You've ordered this {{ topDish.orderCount }} times!"</p>
                  </div>
                </div>
                <button @click="orderTopDish" class="btn btn-success" style="border-radius: 8px; padding: 0.75rem 1.5rem;">
                  <i class="fas fa-shopping-cart me-2"></i>Order Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Play & Earn Section -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="highlight-card" :class="{ 'dark-mode-card': isDarkMode }">
            <div class="highlight-header">
              <h5 class="mb-0 fw-semibold" style="color: #059669;"><i class="fas fa-gamepad me-2"></i>Play & Earn</h5>
              <p class="mb-0 text-muted" style="font-size: 0.9rem; margin-top: 0.25rem;">Feed your buddy by rescuing meals!</p>
            </div>
            <div class="highlight-body">
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
          <Card title="✨ Customize Your Rescue Buddy" :card-class="isDarkMode ? 'dark-mode-card' : ''">
            <div class="customization-wrapper">
              <!-- Pet Preview -->
              <div class="preview-section">
                <div class="preview-card">
                  <div class="preview-label">Preview</div>
                  <div class="pet-preview" :style="{ background: petData.avatar.background }">
                    <div class="avatar-preview-container">
                        <svg width="150" height="150" viewBox="0 0 120 120" class="preview-avatar">
                          <!-- Shadow -->
                          <ellipse cx="60" cy="100" rx="40" ry="8" fill="rgba(0,0,0,0.15)"/>
                          
                          <!-- Body -->
                          <ellipse cx="60" cy="80" rx="35" ry="25" :fill="petData.avatar.color" class="avatar-body"/>
                          
                          <!-- Head -->
                          <circle cx="60" cy="45" r="30" :fill="petData.avatar.color" class="avatar-head"/>
                          
                          <!-- Ears based on animal type -->
                          <g v-if="petData.avatar.body === 'cat'">
                            <polygon points="40,25 35,10 50,20" :fill="petData.avatar.color"/>
                            <polygon points="80,25 85,10 70,20" :fill="petData.avatar.color"/>
                            <polygon points="40,25 38,15 48,22" fill="#FFB6C1" opacity="0.6"/>
                            <polygon points="80,25 82,15 72,22" fill="#FFB6C1" opacity="0.6"/>
                          </g>
                          <g v-else-if="petData.avatar.body === 'dog'">
                            <ellipse cx="35" cy="25" rx="8" ry="15" :fill="petData.avatar.color"/>
                            <ellipse cx="85" cy="25" rx="8" ry="15" :fill="petData.avatar.color"/>
                          </g>
                          <g v-else-if="petData.avatar.body === 'bunny'">
                            <ellipse cx="45" cy="15" rx="6" ry="20" :fill="petData.avatar.color"/>
                            <ellipse cx="75" cy="15" rx="6" ry="20" :fill="petData.avatar.color"/>
                            <ellipse cx="45" cy="18" rx="3" ry="12" fill="#FFB6C1" opacity="0.6"/>
                            <ellipse cx="75" cy="18" rx="3" ry="12" fill="#FFB6C1" opacity="0.6"/>
                          </g>
                          <g v-else-if="petData.avatar.body === 'fox'">
                            <polygon points="38,20 30,5 48,18" :fill="petData.avatar.color"/>
                            <polygon points="82,20 90,5 72,18" :fill="petData.avatar.color"/>
                            <polygon points="38,20 34,10 45,19" fill="#FFF" opacity="0.8"/>
                            <polygon points="82,20 86,10 75,19" fill="#FFF" opacity="0.8"/>
                          </g>
                          <g v-else-if="petData.avatar.body === 'bear'">
                            <circle cx="38" cy="22" r="10" :fill="petData.avatar.color"/>
                            <circle cx="82" cy="22" r="10" :fill="petData.avatar.color"/>
                            <circle cx="38" cy="22" r="6" fill="#D2691E" opacity="0.6"/>
                            <circle cx="82" cy="22" r="6" fill="#D2691E" opacity="0.6"/>
                          </g>
                          <g v-else-if="petData.avatar.body === 'panda'">
                            <circle cx="38" cy="22" r="10" fill="#000"/>
                            <circle cx="82" cy="22" r="10" fill="#000"/>
                          </g>
                          
                          <!-- Eyes -->
                          <circle cx="50" cy="40" r="5" fill="#000" class="avatar-eye"/>
                          <circle cx="70" cy="40" r="5" fill="#000" class="avatar-eye"/>
                          <circle cx="52" cy="38" r="2" fill="#FFF" opacity="0.9"/>
                          <circle cx="72" cy="38" r="2" fill="#FFF" opacity="0.9"/>
                          
                          <!-- Nose -->
                          <ellipse cx="60" cy="52" rx="4" ry="3" fill="#FF69B4"/>
                          
                          <!-- Mouth -->
                          <path d="M 50 55 Q 60 60 70 55" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"/>
                          
                          <!-- Accessory -->
                          <g v-if="petData.avatar.accessory === 'bow'">
                            <path d="M 45 20 Q 40 25 45 30 L 50 25 Z" :fill="petData.avatar.accessoryColor"/>
                            <path d="M 75 20 Q 80 25 75 30 L 70 25 Z" :fill="petData.avatar.accessoryColor"/>
                            <circle cx="60" cy="25" r="4" :fill="petData.avatar.accessoryColor"/>
                          </g>
                          <g v-else-if="petData.avatar.accessory === 'hat'">
                            <rect x="40" y="8" width="40" height="6" :fill="petData.avatar.accessoryColor" rx="2"/>
                            <path d="M 35 8 L 85 8 L 80 0 L 40 0 Z" :fill="petData.avatar.accessoryColor"/>
                          </g>
                          <g v-else-if="petData.avatar.accessory === 'glasses'">
                            <circle cx="50" cy="40" r="8" fill="none" stroke="#000" stroke-width="2"/>
                            <circle cx="70" cy="40" r="8" fill="none" stroke="#000" stroke-width="2"/>
                            <line x1="58" y1="40" x2="62" y2="40" stroke="#000" stroke-width="2"/>
                          </g>
                          <g v-else-if="petData.avatar.accessory === 'scarf'">
                            <path d="M 40 65 Q 60 70 80 65 L 80 72 Q 60 77 40 72 Z" :fill="petData.avatar.accessoryColor"/>
                            <rect x="78" y="65" width="8" height="20" :fill="petData.avatar.accessoryColor" rx="2"/>
                          </g>
                          <g v-else-if="petData.avatar.accessory === 'crown'">
                            <path d="M 35 15 L 40 5 L 45 12 L 50 2 L 55 12 L 60 0 L 65 12 L 70 2 L 75 12 L 80 5 L 85 15 Z" fill="#FFD700"/>
                            <circle cx="50" cy="8" r="2" fill="#FF1493"/>
                            <circle cx="60" cy="6" r="2" fill="#FF1493"/>
                            <circle cx="70" cy="8" r="2" fill="#FF1493"/>
                          </g>
                          <g v-else-if="petData.avatar.accessory === 'flower'">
                            <circle cx="30" cy="20" r="5" fill="#FF69B4"/>
                            <circle cx="25" cy="23" r="4" fill="#FFB6C1"/>
                            <circle cx="35" cy="23" r="4" fill="#FFB6C1"/>
                            <circle cx="28" cy="27" r="4" fill="#FFB6C1"/>
                            <circle cx="32" cy="27" r="4" fill="#FFB6C1"/>
                            <circle cx="30" cy="24" r="3" fill="#FFD700"/>
                          </g>
                        </svg>
                        <div class="pet-name-display">{{ petData.name }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Customization Options -->
                <div class="options-section">
                  <!-- Basic Info -->
                  <div class="customization-group">
                    <label class="custom-label">
                      <i class="fas fa-signature"></i> Pet Name
                    </label>
                    <input 
                      type="text" 
                      class="custom-input" 
                      v-model="petData.name"
                      maxlength="12"
                      placeholder="Enter a cute name...">
                  </div>

                  <!-- Animal Type -->
                  <div class="customization-group">
                    <label class="custom-label">
                      <i class="fas fa-paw"></i> Animal Type
                    </label>
                    <div class="option-grid">
                      <div 
                        v-for="animal in animalTypes" 
                        :key="animal.value"
                        class="option-card"
                        :class="{ 
                          'selected': petData.avatar.body === animal.value,
                          'locked': animal.locked && !isUnlocked(animal.unlockLevel)
                        }"
                        @click="selectAnimal(animal)">
                        <div class="option-emoji">{{ animal.emoji }}</div>
                        <div class="option-name">{{ animal.name }}</div>
                        <div v-if="animal.locked && !isUnlocked(animal.unlockLevel)" class="unlock-badge">
                          <i class="fas fa-lock"></i> Lv{{ animal.unlockLevel }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Color Palette -->
                  <div class="customization-group">
                    <label class="custom-label">
                      <i class="fas fa-palette"></i> Color
                    </label>
                    <div class="color-grid">
                      <div 
                        v-for="color in colorPalette" 
                        :key="color.value"
                        class="color-option"
                        :class="{ 
                          'selected': petData.avatar.color === color.value,
                          'locked': color.locked && !isUnlocked(color.unlockLevel)
                        }"
                        :style="{ background: color.value }"
                        @click="selectColor(color)">
                        <i v-if="petData.avatar.color === color.value" class="fas fa-check"></i>
                        <div v-if="color.locked && !isUnlocked(color.unlockLevel)" class="color-lock">
                          <i class="fas fa-lock"></i>
                        </div>
                        <div v-if="color.locked && !isUnlocked(color.unlockLevel)" class="color-unlock-text">Lv{{ color.unlockLevel }}</div>
                      </div>
                    </div>
                  </div>

                  <!-- Background -->
                  <div class="customization-group">
                    <label class="custom-label">
                      <i class="fas fa-image"></i> Background
                    </label>
                    <div class="background-grid">
                      <div 
                        v-for="bg in backgrounds" 
                        :key="bg.value"
                        class="background-option"
                        :class="{ 
                          'selected': petData.avatar.background === bg.value,
                          'locked': bg.locked && !isUnlocked(bg.unlockLevel)
                        }"
                        :style="{ background: bg.value }"
                        @click="selectBackground(bg)">
                        <span class="bg-label">{{ bg.name }}</span>
                        <i v-if="petData.avatar.background === bg.value" class="fas fa-check check-icon"></i>
                        <div v-if="bg.locked && !isUnlocked(bg.unlockLevel)" class="unlock-badge">
                          <i class="fas fa-lock"></i> Lv{{ bg.unlockLevel }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Accessories -->
                  <div class="customization-group">
                    <label class="custom-label">
                      <i class="fas fa-hat-wizard"></i> Accessories
                    </label>
                    <div class="option-grid">
                      <div 
                        v-for="acc in accessories" 
                        :key="acc.value"
                        class="option-card"
                        :class="{ 
                          'selected': petData.avatar.accessory === acc.value,
                          'locked': acc.locked && !isUnlocked(acc.unlockLevel)
                        }"
                        @click="selectAccessory(acc)">
                        <div class="option-emoji">{{ acc.emoji }}</div>
                        <div class="option-name">{{ acc.name }}</div>
                        <div v-if="acc.locked && !isUnlocked(acc.unlockLevel)" class="unlock-badge">
                          <i class="fas fa-lock"></i> Lv{{ acc.unlockLevel }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Accessory Color (if accessory selected) -->
                  <div class="customization-group" v-if="petData.avatar.accessory && petData.avatar.accessory !== 'none'">
                    <label class="custom-label">
                      <i class="fas fa-fill-drip"></i> Accessory Color
                    </label>
                    <div class="color-grid">
                      <div 
                        v-for="color in accessoryColors" 
                        :key="color.value"
                        class="color-option"
                        :class="{ 'selected': petData.avatar.accessoryColor === color.value }"
                        :style="{ background: color.value }"
                        @click="petData.avatar.accessoryColor = color.value">
                        <i v-if="petData.avatar.accessoryColor === color.value" class="fas fa-check"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
import { useRouter } from 'vue-router'
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
    const router = useRouter()
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
    const selectAnimal = (animal) => {
      if (animal.locked && !isUnlocked(animal.unlockLevel)) {
        petMessage.value = `🔒 Unlock ${animal.name} at Level ${animal.unlockLevel}! Keep rescuing meals!`
        petMessageType.value = 'warning'
        setTimeout(() => { petMessage.value = '' }, 3000)
        return
      }
      petData.value.avatar.body = animal.value
      petMessage.value = `✨ Changed to ${animal.name}! Looking cute!`
      petMessageType.value = 'success'
      setTimeout(() => { petMessage.value = '' }, 2000)
    }

    const selectColor = (color) => {
      if (color.locked && !isUnlocked(color.unlockLevel)) {
        petMessage.value = `🔒 Unlock ${color.name} color at Level ${color.unlockLevel}!`
        petMessageType.value = 'warning'
        setTimeout(() => { petMessage.value = '' }, 3000)
        return
      }
      petData.value.avatar.color = color.value
      petMessage.value = `🎨 New color applied!`
      petMessageType.value = 'success'
      setTimeout(() => { petMessage.value = '' }, 2000)
    }

    const selectBackground = (bg) => {
      if (bg.locked && !isUnlocked(bg.unlockLevel)) {
        petMessage.value = `🔒 Unlock ${bg.name} background at Level ${bg.unlockLevel}!`
        petMessageType.value = 'warning'
        setTimeout(() => { petMessage.value = '' }, 3000)
        return
      }
      petData.value.avatar.background = bg.value
      petMessage.value = `🖼️ Background changed to ${bg.name}!`
      petMessageType.value = 'success'
      setTimeout(() => { petMessage.value = '' }, 2000)
    }

    const selectAccessory = (acc) => {
      if (acc.locked && !isUnlocked(acc.unlockLevel)) {
        petMessage.value = `🔒 Unlock ${acc.name} at Level ${acc.unlockLevel}!`
        petMessageType.value = 'warning'
        setTimeout(() => { petMessage.value = '' }, 3000)
        return
      }
      petData.value.avatar.accessory = acc.value
      petMessage.value = acc.value === 'none' ? '👌 Accessory removed!' : `${acc.emoji} ${acc.name} equipped!`
      petMessageType.value = 'success'
      setTimeout(() => { petMessage.value = '' }, 2000)
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

    // Navigate to stall page with the top dish
    const orderTopDish = () => {
      // Navigate to buyer listing page and filter by stall
      // The BuyerListing component can read query params to filter or auto-add to cart
      router.push({
        path: '/buyer-listings',
        query: { 
          stallId: topDish.value.stallId,
          stallName: topDish.value.stall,
          dishName: topDish.value.name,
          autoAdd: 'true'
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
      isDarkMode, showCustomization, petAnimation, petMessage, petMessageType,
      username, rescuedMealsCount, stats, topDish, stallHighlight, smartInsight,
      petData, timeFilters, orderFilters,
      foodRescuedChartData, savingsComparisonChartData,
      updateFoodRescuedFilter, updateSavingsFilter,
      toggleTheme, feedPet, playWithPet, petClick, handleDragOver, handleDrop,
      orderTopDish,
      animalTypes, colorPalette, backgrounds, accessories, accessoryColors,
      isUnlocked, selectAnimal, selectColor, selectBackground, selectAccessory
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

.buyer-dashboard-wrapper.dark-theme {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
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

/* Customization Panel */
.customization-wrapper {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  padding: 1rem 0;
}

.preview-section {
  position: sticky;
  top: 1rem;
  height: fit-content;
}

.preview-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid #e5e7eb;
}

.dark-theme .preview-card {
  background: #1e293b;
  border-color: #334155;
}

.preview-label {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.75rem 1rem;
  font-weight: 600;
  font-size: 0.875rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pet-preview {
  padding: 2rem 1rem;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.avatar-preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.preview-avatar {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  animation: float 3s ease-in-out infinite;
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
  gap: 2rem;
}

.customization-group {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
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
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s;
}

.custom-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.dark-theme .custom-input {
  background: #0f172a;
  border-color: #334155;
  color: #e2e8f0;
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

@keyframes float {
  0%, 100% {
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
  }
  
  .preview-section {
    position: relative;
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
  }
  
  .customization-group {
    padding: 1rem;
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
  h2, h4, h5,
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
