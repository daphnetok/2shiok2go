<template>
  <div class="buyer-dashboard">
    <!-- Header Section -->
    <div class="container mt-4">
      <div class="row mb-4">
        <div class="col">
          <h2>2Shiok2Go - Buyer Dashboard</h2>
        </div>
        <div class="col text-end">
          <button class="btn btn-outline-secondary me-2" @click="toggleTheme">
            <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
            {{ isDarkMode ? 'Light' : 'Dark' }} Mode
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mt-4">
      <!-- Virtual Pet & Mini Game Section -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="ha-card pet-playground-card">
            <div class="ha-card-header d-flex justify-content-between align-items-center">
              <span><i class="fas fa-heart"></i> 🐾 Your Rescue Pet - {{ petData.name }}</span>
              <div class="pet-controls">
                <button class="btn btn-sm btn-info me-2" @click="showCustomization = !showCustomization">
                  <i class="fas fa-palette"></i> Customize
                </button>
                <button class="btn btn-sm btn-success me-2" @click="feedPet">
                  <i class="fas fa-cookie-bite"></i> Feed ({{ petData.treats }} treats)
                </button>
                <button class="btn btn-sm btn-primary" @click="playWithPet">
                  <i class="fas fa-heart"></i> Show Love
                </button>
              </div>
            </div>
            <div class="ha-card-body">
              <!-- Pet Display Area -->
              <div class="pet-container" @click="petClick">
                <div class="pet-scene">
                  <!-- Enhanced Aesthetic Background -->
                  <div class="pet-background">
                    <!-- Sky with gradient -->
                    <div class="sky-gradient"></div>
                    
                    <!-- Floating clouds -->
                    <div class="cloud cloud1">☁️</div>
                    <div class="cloud cloud2">☁️</div>
                    <div class="cloud cloud3">☁️</div>
                    
                    <!-- Sun with rays -->
                    <div class="sun-container">
                      <div class="sun">☀️</div>
                      <div class="sun-rays"></div>
                    </div>
                    
                    <!-- Floating particles -->
                    <div class="floating-particles">
                      <div class="particle sparkle">✨</div>
                      <div class="particle sparkle">✨</div>
                      <div class="particle sparkle">✨</div>
                      <div class="particle heart">💖</div>
                      <div class="particle star">⭐</div>
                    </div>
                    
                    <!-- Ground with grass -->
                    <div class="ground">
                      <div class="grass">🌱🌿🌱🌿🌱🌿🌱🌿</div>
                    </div>
                  </div>
                  
                  <!-- Avatar Pet Character -->
                  <div class="pet-character" 
                       :class="[petData.mood, petAnimation]" 
                       @click="petClick"
                       @dragover.prevent="handleDragOver"
                       @drop="handleDrop"
                       :style="{ transform: dropZoneActive ? 'scale(1.1)' : 'scale(1)' }">
                    
                    <!-- Avatar SVG -->
                    <div class="avatar-container">
                      <svg width="120" height="120" viewBox="0 0 120 120" class="pet-avatar">
                        <!-- Body -->
                        <ellipse cx="60" cy="80" rx="35" ry="25" :fill="petData.avatar.color" class="avatar-body"/>
                        
                        <!-- Head -->
                        <circle cx="60" cy="45" r="30" :fill="petData.avatar.color" class="avatar-head"/>
                        
                        <!-- Ears (Cat/Dog/Bunny specific) -->
                        <g v-if="petData.avatar.body === 'cat'">
                          <polygon points="40,25 35,10 50,20" :fill="petData.avatar.color"/>
                          <polygon points="80,25 85,10 70,20" :fill="petData.avatar.color"/>
                        </g>
                        <g v-if="petData.avatar.body === 'dog'">
                          <ellipse cx="35" cy="25" rx="8" ry="15" :fill="petData.avatar.color"/>
                          <ellipse cx="85" cy="25" rx="8" ry="15" :fill="petData.avatar.color"/>
                        </g>
                        <g v-if="petData.avatar.body === 'bunny'">
                          <ellipse cx="45" cy="15" rx="6" ry="20" :fill="petData.avatar.color"/>
                          <ellipse cx="75" cy="15" rx="6" ry="20" :fill="petData.avatar.color"/>
                        </g>
                        
                        <!-- Eyes -->
                        <g v-if="petData.avatar.eyes === 'happy'">
                          <circle cx="50" cy="40" r="4" fill="#333"/>
                          <circle cx="70" cy="40" r="4" fill="#333"/>
                          <path d="M 46 36 Q 50 32 54 36" stroke="#333" stroke-width="2" fill="none"/>
                          <path d="M 66 36 Q 70 32 74 36" stroke="#333" stroke-width="2" fill="none"/>
                        </g>
                        <g v-if="petData.avatar.eyes === 'sleepy'">
                          <path d="M 46 40 Q 50 36 54 40" stroke="#333" stroke-width="2" fill="none"/>
                          <path d="M 66 40 Q 70 36 74 40" stroke="#333" stroke-width="2" fill="none"/>
                        </g>
                        <g v-if="petData.avatar.eyes === 'excited'">
                          <circle cx="50" cy="40" r="5" fill="#333"/>
                          <circle cx="70" cy="40" r="5" fill="#333"/>
                          <circle cx="50" cy="38" r="2" fill="#fff"/>
                          <circle cx="70" cy="38" r="2" fill="#fff"/>
                        </g>
                        <g v-if="petData.avatar.eyes === 'wink'">
                          <path d="M 46 40 Q 50 36 54 40" stroke="#333" stroke-width="2" fill="none"/>
                          <circle cx="70" cy="40" r="4" fill="#333"/>
                        </g>
                        
                        <!-- Mouth -->
                        <g v-if="petData.avatar.mouth === 'smile'">
                          <path d="M 50 55 Q 60 65 70 55" stroke="#333" stroke-width="2" fill="none"/>
                        </g>
                        <g v-if="petData.avatar.mouth === 'laugh'">
                          <ellipse cx="60" cy="58" rx="8" ry="4" fill="#333"/>
                        </g>
                        <g v-if="petData.avatar.mouth === 'tongue'">
                          <path d="M 50 55 Q 60 65 70 55" stroke="#333" stroke-width="2" fill="none"/>
                          <ellipse cx="60" cy="62" rx="3" ry="5" fill="#ff6b9d"/>
                        </g>
                        <g v-if="petData.avatar.mouth === 'neutral'">
                          <line x1="55" y1="55" x2="65" y2="55" stroke="#333" stroke-width="2"/>
                        </g>
                        
                        <!-- Nose -->
                        <ellipse cx="60" cy="48" rx="2" ry="1.5" fill="#333"/>
                        
                        <!-- Accessories -->
                        <g v-if="petData.avatar.accessory === 'bow'">
                          <polygon points="40,60 50,55 50,65" fill="#ff6b9d"/>
                          <polygon points="80,60 70,55 70,65" fill="#ff6b9d"/>
                          <circle cx="60" cy="60" r="4" fill="#ff1744"/>
                        </g>
                        <g v-if="petData.avatar.accessory === 'hat'">
                          <ellipse cx="60" cy="20" rx="20" ry="8" fill="#fff"/>
                          <rect x="50" y="15" width="20" height="15" fill="#fff"/>
                        </g>
                        <g v-if="petData.avatar.accessory === 'glasses'">
                          <circle cx="50" cy="40" r="8" fill="none" stroke="#333" stroke-width="2"/>
                          <circle cx="70" cy="40" r="8" fill="none" stroke="#333" stroke-width="2"/>
                          <line x1="58" y1="40" x2="62" y2="40" stroke="#333" stroke-width="2"/>
                        </g>
                        <g v-if="petData.avatar.accessory === 'crown'">
                          <polygon points="40,25 45,10 50,20 55,8 60,20 65,8 70,20 75,10 80,25" fill="#ffd700"/>
                          <circle cx="50" cy="15" r="2" fill="#ff6b9d"/>
                          <circle cx="60" cy="12" r="2" fill="#ff6b9d"/>
                          <circle cx="70" cy="15" r="2" fill="#ff6b9d"/>
                        </g>
                      </svg>
                      
                      <!-- Floating hearts when happy -->
                      <div class="floating-hearts" v-if="petData.mood === 'ecstatic'">
                        <div class="heart" v-for="n in 3" :key="n">♥</div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Speech Bubble -->
                  <div class="speech-bubble" :class="{ active: showSpeech }" v-if="petData.message">
                    {{ petData.message }}
                  </div>
                  
                  <!-- Food particles when feeding -->
                  <div class="food-particles" v-if="showFoodParticles">
                    <span v-for="n in 5" :key="n" class="particle">✨</span>
                  </div>
                </div>
                
                <!-- Draggable Items Section -->
                <div class="interaction-items">
                  <h6 class="items-title">Drag items to interact with {{ petData.name }}!</h6>
                  <div class="draggable-items">
                    <div v-for="item in draggableItems" 
                         :key="item.id"
                         class="draggable-item"
                         :draggable="true"
                         @dragstart="handleDragStart(item, $event)"
                         @dragend="handleDragEnd">
                      <div class="item-icon">{{ item.icon }}</div>
                      <div class="item-name">{{ item.name }}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Avatar Customization Panel -->
              <div class="customization-panel" v-if="showCustomization">
                <h6>Customize Your Pet</h6>
                <div class="customization-options">
                  <!-- Body Type -->
                  <div class="option-group">
                    <label>Body Type:</label>
                    <div class="option-buttons">
                      <button v-for="body in avatarOptions.bodies" 
                              :key="body.id"
                              class="option-btn"
                              :class="{ active: petData.avatar.body === body.id }"
                              @click="updateAvatar('body', body.id)">
                        {{ body.name }}
                      </button>
                    </div>
                  </div>
                  
                  <!-- Color -->
                  <div class="option-group">
                    <label>Color:</label>
                    <div class="color-palette">
                      <div v-for="color in avatarOptions.colors" 
                           :key="color"
                           class="color-option"
                           :style="{ backgroundColor: color }"
                           :class="{ active: petData.avatar.color === color }"
                           @click="updateAvatar('color', color)">
                      </div>
                    </div>
                  </div>
                  
                  <!-- Accessories -->
                  <div class="option-group">
                    <label>Accessory:</label>
                    <div class="option-buttons">
                      <button v-for="accessory in avatarOptions.accessories" 
                              :key="accessory.id"
                              class="option-btn"
                              :class="{ active: petData.avatar.accessory === accessory.id }"
                              @click="updateAvatar('accessory', accessory.id)">
                        {{ accessory.name }}
                      </button>
                    </div>
                  </div>
                  
                  <!-- Eyes -->
                  <div class="option-group">
                    <label>Eyes:</label>
                    <div class="option-buttons">
                      <button v-for="eye in avatarOptions.eyes" 
                              :key="eye.id"
                              class="option-btn"
                              :class="{ active: petData.avatar.eyes === eye.id }"
                              @click="updateAvatar('eyes', eye.id)">
                        {{ eye.name }}
                      </button>
                    </div>
                  </div>
                  
                  <!-- Mouth -->
                  <div class="option-group">
                    <label>Mouth:</label>
                    <div class="option-buttons">
                      <button v-for="mouth in avatarOptions.mouths" 
                              :key="mouth.id"
                              class="option-btn"
                              :class="{ active: petData.avatar.mouth === mouth.id }"
                              @click="updateAvatar('mouth', mouth.id)">
                        {{ mouth.name }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Compact Progress Section -->
              <div class="pet-progress-compact">
                <div class="progress-header">
                  <span class="progress-label">🏆 Level {{ petData.level }} - {{ getCurrentLevelName() }} ({{ progressPercentage }}%)</span>
                </div>
                <div class="progress-bar-enhanced">
                  <div class="progress-fill-enhanced" :style="{ width: progressPercentage + '%' }">
                    <div class="progress-pet-icon">
                      <!-- Mini avatar for progress bar -->
                      <svg width="16" height="16" viewBox="0 0 120 120" class="mini-avatar">
                        <circle cx="60" cy="60" r="40" :fill="petData.avatar.color"/>
                        <circle cx="50" cy="50" r="3" fill="#333"/>
                        <circle cx="70" cy="50" r="3" fill="#333"/>
                        <path d="M 50 70 Q 60 80 70 70" stroke="#333" stroke-width="3" fill="none"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div class="progress-levels-mini">
                  <span v-for="(level, index) in progressLevels" :key="index" 
                        :class="['level-mini', { active: index <= getCurrentLevel() }]"
                        :title="level.name">
                    {{ level.icon }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- KPI Cards Row -->
      <div class="row mb-4 align-items-start">
        <div class="col-md-3 mb-3" v-for="(card, index) in kpiCards" :key="index">
          <div class="ha-card" :class="[card.class, card.trend ? 'trending-up' : '']">
            <div class="ha-card-body">
              <div class="kpi-header">
                <div class="kpi-icon">
                  <i :class="card.icon"></i>
                </div>
                <span v-if="card.trend" class="kpi-trend">
                  <i class="fas fa-arrow-up"></i> {{ card.trend }}%
                </span>
              </div>
              <h3 class="kpi-value">{{ card.value }}</h3>
              <p class="kpi-label">{{ card.label }}</p>
              <span v-if="card.progress" class="kpi-progress">{{ card.progress }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Orders & Trending Deals -->
      <div class="row mb-4 align-items-start">
        <div class="col-lg-8 mb-4">
          <div class="ha-card h-100">
            <div class="ha-card-header d-flex justify-content-between align-items-center">
              <span><i class="fas fa-history"></i> Recent Orders</span>
              <span class="section-subtitle">📋 Your Food Journey</span>
            </div>
            <div class="ha-card-body">
              <div class="orders-table">
                <div class="table-header">
                  <div class="col-thumb">📸</div>
                  <div class="col-item">🍽️ Item</div>
                  <div class="col-date">📅 Date</div>
                  <div class="col-price">💰 Price</div>
                  <div class="col-saved">💚 % Saved</div>
                  <div class="col-reorder">🔄 Reorder</div>
                  <div class="col-rate">⭐ Rate</div>
                </div>
                <div class="table-row" v-for="order in recentOrders" :key="order.id">
                  <div class="col-thumb">
                    <img :src="order.thumbnail" :alt="order.item" class="order-thumbnail">
                  </div>
                  <div class="col-item">{{ order.item }}</div>
                  <div class="col-date">{{ formatDate(order.date) }}</div>
                  <div class="col-price">${{ order.price }}</div>
                  <div class="col-saved">{{ order.saved }}%</div>
                  <div class="col-reorder">
                    <button class="btn btn-sm btn-outline-primary" @click="reorder(order)">
                      <i class="fas fa-redo"></i>
                    </button>
                  </div>
                  <div class="col-rate">
                    <div class="rating">
                      <i v-for="n in 5" :key="n" 
                         :class="n <= order.rating ? 'fas fa-star' : 'far fa-star'"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-4 mb-4">
          <div class="ha-card h-100">
            <div class="ha-card-header">
              <span><i class="fas fa-fire"></i> 🔥 Trending Deals</span>
            </div>
            <div class="ha-card-body">
              <div class="deals-carousel">
                <div class="deal-item" v-for="deal in trendingDeals" :key="deal.id">
                  <img :src="deal.image" :alt="deal.title" class="deal-image">
                  <div class="deal-content">
                    <h5>{{ deal.title }}</h5>
                    <p class="deal-discount">💚 {{ deal.discount }}% Saved</p>
                    <button class="btn btn-primary btn-sm">🛒 View Deal</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Daily Challenge & Top Savers -->
      <div class="row mb-4 align-items-start">
        <div class="col-lg-6 mb-4">
          <div class="ha-card challenge-card h-100">
            <div class="ha-card-header d-flex justify-content-between align-items-center">
              <span><i class="fas fa-trophy"></i> 🎯 Daily Challenge</span>
              <span class="engagement-badge">🎮 Engagement</span>
            </div>
            <div class="ha-card-body">
              <div class="challenge-content">
                <div class="challenge-task">
                  <p>"🍽️ Save 2 meals today and earn <strong>✨ +20pts</strong>"</p>
                  <button class="btn btn-success">🚀 Join Challenge</button>
                </div>
                <div class="challenge-progress">
                  <div class="progress-circle" :class="{ active: challengeProgress > 0 }">
                    <span>{{ challengeProgress }}/2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-6 mb-4">
          <div class="ha-card leaderboard-card h-100">
            <div class="ha-card-header d-flex justify-content-between align-items-center">
              <span><i class="fas fa-medal"></i> 🏆 Top Savers This Week</span>
              <span class="section-subtitle">🎖️ Leaderboard</span>
            </div>
            <div class="ha-card-body">
              <div class="leaderboard-content">
                <p class="user-rank">"🎯 You are #12 this week – keep saving for a rank boost!"</p>
                <div class="top-savers">
                  <div class="saver-item" v-for="(saver, index) in topSavers" :key="index">
                    <span class="rank">
                      <i v-if="index === 0" class="fas fa-crown" style="color: #ffd700;"></i>
                      <i v-else-if="index === 1" class="fas fa-medal" style="color: #c0c0c0;"></i>
                      <i v-else-if="index === 2" class="fas fa-medal" style="color: #cd7f32;"></i>
                      <span v-else>#{{ index + 1 }}</span>
                    </span>
                    <span class="name">{{ saver.name }}</span>
                    <span class="meals">🍽️ {{ saver.meals }} meals</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: "BuyerDashboard",
  setup() {
    const isDarkMode = ref(false)
    
    // Pet Data
    const petData = ref({
      name: 'Bento Buddy',
      avatar: {
        body: 'cat',
        color: '#ff9f43',
        accessory: 'bow',
        eyes: 'happy',
        mouth: 'smile'
      },
      mood: 'happy',
      level: 3,
      treats: 12,
      message: 'Hello! You rescued 30 meals so far!',
      lastFed: Date.now() - 3600000, // 1 hour ago
      happiness: 85,
      energy: 70
    })
    
    // Avatar customization options
    const avatarOptions = ref({
      bodies: [
        { id: 'cat', name: 'Cat', color: '#ff9f43' },
        { id: 'dog', name: 'Dog', color: '#feca57' },
        { id: 'bunny', name: 'Bunny', color: '#ff6b6b' },
        { id: 'bear', name: 'Bear', color: '#a55eea' }
      ],
      colors: [
        '#ff9f43', '#feca57', '#ff6b6b', '#a55eea', 
        '#26de81', '#45aaf2', '#fd79a8', '#fdcb6e'
      ],
      accessories: [
        { id: 'none', name: 'None' },
        { id: 'bow', name: 'Bow Tie' },
        { id: 'hat', name: 'Chef Hat' },
        { id: 'glasses', name: 'Glasses' },
        { id: 'crown', name: 'Crown' }
      ],
      eyes: [
        { id: 'happy', name: 'Happy' },
        { id: 'sleepy', name: 'Sleepy' },
        { id: 'excited', name: 'Excited' },
        { id: 'wink', name: 'Wink' }
      ],
      mouths: [
        { id: 'smile', name: 'Smile' },
        { id: 'laugh', name: 'Laugh' },
        { id: 'tongue', name: 'Tongue Out' },
        { id: 'neutral', name: 'Neutral' }
      ]
    })
    
    // Draggable items
    const draggableItems = ref([
      { id: 1, type: 'food', name: 'Apple', icon: '🍎', x: 50, y: 100, effect: 'feed' },
      { id: 2, type: 'toy', name: 'Ball', icon: '⚽', x: 150, y: 100, effect: 'play' },
      { id: 3, type: 'treat', name: 'Cookie', icon: '🍪', x: 250, y: 100, effect: 'treat' },
      { id: 4, type: 'accessory', name: 'Hat', icon: '🎩', x: 350, y: 100, effect: 'dress' }
    ])
    
    // Drag and drop states
    const draggedItem = ref(null)
    const dropZoneActive = ref(false)
    const showCustomization = ref(false)
    
    // Pet animations and states
    const petAnimation = ref('')
    const showSpeech = ref(true)
    const showFoodParticles = ref(false)
    
    // Progress levels for pet
    const progressLevels = ref([
      { icon: '🌱', name: 'Eco', threshold: 0 },
      { icon: '🥣', name: 'Bowl', threshold: 25 },
      { icon: '🍱', name: 'Bento', threshold: 50 },
      { icon: '🍽️', name: 'Buffet', threshold: 75 },
      { icon: '👑', name: 'Master', threshold: 100 }
    ])
    
    // KPI Data with cute icons and gamification
    const kpiCards = ref([
      {
        icon: 'fas fa-leaf',
        value: '42kg',
        label: '🌱 Carbon Saved',
        trend: 15,
        class: 'ha-card-success'
      },
      {
        icon: 'fas fa-piggy-bank',
        value: '$127',
        label: '💰 Money Saved',
        trend: 8,
        class: 'ha-card-info'
      },
      {
        icon: 'fas fa-heart',
        value: '30',
        label: '🍽️ Meals Rescued',
        class: 'ha-card-warning'
      },
      {
        icon: 'fas fa-star',
        value: '1,248',
        label: '✨ Reward Points',
        progress: '+48 today',
        class: 'ha-card-primary'
      }
    ])

    // Progress data
    const progressPercentage = ref(60)
    const challengeProgress = ref(1)

    // Enhanced recent orders mock data with more realistic entries
    const recentOrders = ref([
      {
        id: 1,
        thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=40&h=40&fit=crop&crop=center',
        item: 'Hainanese Chicken Rice',
        date: new Date('2024-10-25'),
        price: 4.50,
        saved: 25,
        rating: 5
      },
      {
        id: 2,
        thumbnail: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=40&h=40&fit=crop&crop=center',
        item: 'Laksa',
        date: new Date('2024-10-24'),
        price: 6.00,
        saved: 30,
        rating: 4
      },
      {
        id: 3,
        thumbnail: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=40&h=40&fit=crop&crop=center',
        item: 'Satay (10 sticks)',
        date: new Date('2024-10-23'),
        price: 8.00,
        saved: 20,
        rating: 5
      },
      {
        id: 4,
        thumbnail: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=40&h=40&fit=crop&crop=center',
        item: 'Char Kway Teow',
        date: new Date('2024-10-22'),
        price: 5.50,
        saved: 35,
        rating: 4
      },
      {
        id: 5,
        thumbnail: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=40&h=40&fit=crop&crop=center',
        item: 'Wonton Noodles',
        date: new Date('2024-10-21'),
        price: 4.80,
        saved: 28,
        rating: 5
      }
    ])

    // Enhanced trending deals mock data
    const trendingDeals = ref([
      {
        id: 1,
        title: 'Mixed Economy Rice Special',
        discount: 40,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&h=100&fit=crop&crop=center'
      },
      {
        id: 2,
        title: 'Noodle Combo Deal',
        discount: 35,
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=150&h=100&fit=crop&crop=center'
      },
      {
        id: 3,
        title: 'Hawker Breakfast Set',
        discount: 45,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=150&h=100&fit=crop&crop=center'
      }
    ])

    // Enhanced top savers mock data
    const topSavers = ref([
      { name: 'Alice Wong', meals: 45 },
      { name: 'Bob Tan', meals: 38 },
      { name: 'Charlie Lim', meals: 35 },
      { name: 'Diana Chen', meals: 32 },
      { name: 'Eddie Goh', meals: 28 }
    ])

    // Methods
    // Pet Methods
    const getCurrentLevel = () => {
      const currentProgress = progressPercentage.value
      for (let i = progressLevels.value.length - 1; i >= 0; i--) {
        if (currentProgress >= progressLevels.value[i].threshold) {
          return i
        }
      }
      return 0
    }
    
    const getCurrentLevelName = () => {
      return progressLevels.value[getCurrentLevel()].name
    }
    
    const petClick = () => {
      petAnimation.value = 'bounce'
      showSpeech.value = true
      
      const messages = [
        "Thanks for clicking me!",
        "Keep saving those meals!",
        "You're doing great!",
        "I'm getting stronger!",
        "More rescued food = happier me!"
      ]
      
      petData.value.message = messages[Math.floor(Math.random() * messages.length)]
      
      setTimeout(() => {
        petAnimation.value = ''
        showSpeech.value = false
      }, 3000)
    }
    
    // Avatar customization methods
    const updateAvatar = (property, value) => {
      petData.value.avatar[property] = value
      
      // Trigger happy animation when customizing
      petAnimation.value = 'bounce'
      showSpeech.value = true
      petData.value.message = "I love my new look!"
      
      setTimeout(() => {
        petAnimation.value = ''
        showSpeech.value = false
      }, 2000)
    }
    
    // Drag and drop methods
    const handleDragStart = (item, event) => {
      draggedItem.value = item
      event.dataTransfer.effectAllowed = 'move'
    }
    
    const handleDragEnd = () => {
      draggedItem.value = null
      dropZoneActive.value = false
    }
    
    const handleDragOver = (event) => {
      event.preventDefault()
      dropZoneActive.value = true
    }
    
    const handleDrop = (event) => {
      event.preventDefault()
      dropZoneActive.value = false
      
      if (draggedItem.value) {
        const item = draggedItem.value
        
        // Handle different item effects
        switch (item.effect) {
          case 'feed':
            feedPetWithItem(item)
            break
          case 'play':
            playWithItem(item)
            break
          case 'treat':
            giveTreat(item)
            break
          case 'dress':
            dressUp(item)
            break
        }
        
        draggedItem.value = null
      }
    }
    
    const feedPetWithItem = (item) => {
      petAnimation.value = 'eating'
      showFoodParticles.value = true
      petData.value.happiness = Math.min(100, petData.value.happiness + 15)
      petData.value.energy = Math.min(100, petData.value.energy + 10)
      
      petData.value.message = `Yum! Thanks for the ${item.name}!`
      showSpeech.value = true
      
      // Update mood based on happiness
      if (petData.value.happiness > 80) {
        petData.value.mood = 'ecstatic'
        petData.value.avatar.eyes = 'excited'
        petData.value.avatar.mouth = 'laugh'
      }
      
      setTimeout(() => {
        petAnimation.value = ''
        showFoodParticles.value = false
        showSpeech.value = false
      }, 3000)
    }
    
    const playWithItem = (item) => {
      petAnimation.value = 'playing'
      petData.value.happiness = Math.min(100, petData.value.happiness + 10)
      petData.value.energy = Math.max(0, petData.value.energy - 5)
      
      petData.value.message = `Playing with the ${item.name} is so fun!`
      showSpeech.value = true
      
      // Update avatar to show excitement
      petData.value.avatar.eyes = 'excited'
      petData.value.avatar.mouth = 'laugh'
      
      setTimeout(() => {
        petAnimation.value = ''
        showSpeech.value = false
        petData.value.avatar.eyes = 'happy'
        petData.value.avatar.mouth = 'smile'
      }, 3000)
    }
    
    const giveTreat = (item) => {
      if (petData.value.treats > 0) {
        petData.value.treats--
        petAnimation.value = 'eating'
        showFoodParticles.value = true
        petData.value.happiness = Math.min(100, petData.value.happiness + 20)
        
        petData.value.message = `Special ${item.name} treat! Delicious!`
        showSpeech.value = true
        
        petData.value.mood = 'ecstatic'
        
        setTimeout(() => {
          petAnimation.value = ''
          showFoodParticles.value = false
          showSpeech.value = false
        }, 3000)
      } else {
        petData.value.message = "I need to earn more treats first!"
        showSpeech.value = true
        setTimeout(() => showSpeech.value = false, 2000)
      }
    }
    
    const dressUp = (item) => {
      // Cycle through accessories
      const accessories = ['none', 'bow', 'hat', 'glasses', 'crown']
      const currentIndex = accessories.indexOf(petData.value.avatar.accessory)
      const nextIndex = (currentIndex + 1) % accessories.length
      
      petData.value.avatar.accessory = accessories[nextIndex]
      petAnimation.value = 'bounce'
      
      petData.value.message = "Looking fabulous!"
      showSpeech.value = true
      
      setTimeout(() => {
        petAnimation.value = ''
        showSpeech.value = false
      }, 2000)
    }
    
    const feedPet = () => {
      if (petData.value.treats > 0) {
        petData.value.treats--
        petData.value.happiness = Math.min(100, petData.value.happiness + 10)
        petAnimation.value = 'eating'
        showFoodParticles.value = true
        
        petData.value.message = "Nom nom! Thanks for the treat!"
        showSpeech.value = true
        
        // Update pet mood based on happiness
        if (petData.value.happiness > 80) {
          petData.value.mood = 'ecstatic'
          petData.value.avatar.eyes = 'excited'
          petData.value.avatar.mouth = 'laugh'
        } else if (petData.value.happiness > 60) {
          petData.value.mood = 'happy'
          petData.value.avatar.eyes = 'happy'
          petData.value.avatar.mouth = 'smile'
        }
        
        setTimeout(() => {
          petAnimation.value = ''
          showFoodParticles.value = false
          showSpeech.value = false
        }, 2000)
      } else {
        petData.value.message = "I'm full right now! Save more meals to earn treats!"
        showSpeech.value = true
        setTimeout(() => showSpeech.value = false, 3000)
      }
    }
    
    const playWithPet = () => {
      petAnimation.value = 'playing'
      petData.value.message = "I love you too! 💖"
      showSpeech.value = true
      
      petData.value.happiness = Math.min(100, petData.value.happiness + 10)
      
      // Update pet mood based on happiness
      if (petData.value.happiness > 90) {
        petData.value.mood = 'ecstatic'
        petData.value.expression = '😍'
      } else if (petData.value.happiness > 70) {
        petData.value.mood = 'happy'
        petData.value.expression = '😊'
      }
      
      setTimeout(() => {
        petAnimation.value = ''
        showSpeech.value = false
      }, 3000)
    }

    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value
      
      // Toggle AdminLTE dark mode class on body like HawkerAnalytics
      if (isDarkMode.value) {
        document.body.classList.add('dark-mode');
        document.documentElement.setAttribute('data-bs-theme', 'dark');
      } else {
        document.body.classList.remove('dark-mode');
        document.documentElement.setAttribute('data-bs-theme', 'light');
      }
      
      // Store preference in localStorage
      localStorage.setItem('buyer-theme', isDarkMode.value ? 'dark' : 'light');
    }

    const formatDate = (date) => {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(date)
    }

    const reorder = (order) => {
      console.log('Reordering:', order)
      // Simulate reorder action with user feedback
      alert(`Reordering ${order.item} for $${order.price}!`)
    }

    onMounted(() => {
      // Simulate loading data and any initialization
      console.log('Buyer Dashboard loaded with dummy data')
      
      // Initialize theme from localStorage like HawkerAnalytics
      const savedTheme = localStorage.getItem('buyer-theme');
      if (savedTheme === 'dark') {
        isDarkMode.value = true;
        document.body.classList.add('dark-mode');
        document.documentElement.setAttribute('data-bs-theme', 'dark');
      }
    })

    return {
      isDarkMode,
      kpiCards,
      progressPercentage,
      challengeProgress,
      recentOrders,
      trendingDeals,
      topSavers,
      // Pet data
      petData,
      petAnimation,
      showSpeech,
      showFoodParticles,
      progressLevels,
      // Avatar customization
      avatarOptions,
      showCustomization,
      // Drag and drop
      draggableItems,
      draggedItem,
      dropZoneActive,
      // Methods
      toggleTheme,
      formatDate,
      reorder,
      // Pet methods
      getCurrentLevel,
      getCurrentLevelName,
      petClick,
      feedPet,
      playWithPet,
      updateAvatar,
      // Drag and drop methods
      handleDragStart,
      handleDragEnd,
      handleDragOver,
      handleDrop,
      feedPetWithItem,
      playWithItem,
      giveTreat,
      dressUp
    }
  }
}
</script>

<style scoped>
/* Enhanced Green Theme Styles */
.buyer-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9f4 0%, #e8f5e8 30%, #dcfce7 60%, #f0fdf4 100%);
  transition: all 0.3s ease;
  position: relative;
}

.buyer-dashboard::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(132, 204, 22, 0.05) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

/* Container and Typography */
.container {
  background: transparent;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

h2, h5, p, span {
  transition: all 0.3s ease;
}

h2 {
  background: linear-gradient(135deg, #059669, #047857, #065f46);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  font-size: 2.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Enhanced HawkerAnalytics Card System */
.ha-card {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(34, 197, 94, 0.08);
  margin-bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(34, 197, 94, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
}

.ha-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #10b981, #059669, #047857);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.ha-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 60px rgba(34, 197, 94, 0.15);
}

.ha-card:hover::before {
  opacity: 1;
}

.ha-card-info {
  background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
  color: #fff;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
}

.ha-card-success {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%);
  color: #fff;
  box-shadow: 0 8px 32px rgba(34, 197, 94, 0.3);
}

.ha-card-warning {
  background: linear-gradient(135deg, #84cc16 0%, #65a30d 50%, #4d7c0f 100%);
  color: #fff;
  box-shadow: 0 8px 32px rgba(132, 204, 22, 0.3);
}

.ha-card-primary {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%);
  color: #fff;
  box-shadow: 0 8px 32px rgba(6, 182, 212, 0.3);
}

.ha-card-body {
  padding: 1.5rem;
  position: relative;
}

.ha-card-header {
  padding: 1rem 1.5rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  min-height: 60px;
  backdrop-filter: blur(10px);
}

.ha-card-header.d-flex {
  justify-content: space-between;
}

/* Enhanced Pet Playground Styles */
.pet-playground-card {
  background: linear-gradient(135deg, #10b981 0%, #059669 30%, #047857 70%, #065f46 100%);
  color: white;
  border: none;
  box-shadow: 0 12px 40px rgba(16, 185, 129, 0.3);
}

.pet-playground-card .ha-card-header {
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(15px);
}

.pet-container {
  background: linear-gradient(135deg, #10b981 0%, #059669 30%, #22c55e 60%, #34d399 100%);
  border-radius: 24px;
  padding: 2rem;
  position: relative;
  min-height: 320px;
  overflow: visible;
  cursor: pointer;
  margin-bottom: 1rem;
  box-shadow: 
    0 12px 40px rgba(16, 185, 129, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.pet-container:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 20px 60px rgba(16, 185, 129, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.pet-scene {
  position: relative;
  width: 100%;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.pet-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* Enhanced Sky Background */
.sky-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 70%;
  background: linear-gradient(180deg, #bfdbfe 0%, #dbeafe 30%, #f0f9ff 60%, #f8fafc 100%);
  border-radius: 20px 20px 0 0;
  box-shadow: inset 0 -20px 40px rgba(34, 197, 94, 0.1);
}

/* Enhanced Clouds */
.cloud {
  position: absolute;
  font-size: 1.8rem;
  animation: cloudFloat 8s ease-in-out infinite;
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.1));
}

.cloud1 {
  top: 15px;
  left: 10%;
  animation-delay: 0s;
}

.cloud2 {
  top: 25px;
  right: 15%;
  animation-delay: 4s;
}

.cloud3 {
  top: 35px;
  left: 60%;
  animation-delay: 2s;
  font-size: 1.4rem;
}

/* Enhanced Sun */
.sun-container {
  position: absolute;
  top: 10px;
  right: 20px;
}

.sun {
  font-size: 2.2rem;
  animation: sunRotate 15s linear infinite;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
}

.sun-rays {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%);
  border-radius: 50%;
  animation: sunPulse 3s ease-in-out infinite;
}

/* Floating Particles */
.floating-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  animation: particleFloat 6s ease-in-out infinite;
}

.particle.sparkle {
  font-size: 1.2rem;
}

.particle.heart {
  font-size: 1.5rem;
  animation: heartFloat 8s ease-in-out infinite;
}

.particle.star {
  font-size: 1.3rem;
  animation: starTwinkle 4s ease-in-out infinite;
}

.particle:nth-child(1) { top: 20%; left: 15%; animation-delay: 0s; }
.particle:nth-child(2) { top: 40%; right: 20%; animation-delay: 2s; }
.particle:nth-child(3) { top: 60%; left: 70%; animation-delay: 4s; }
.particle:nth-child(4) { top: 30%; left: 80%; animation-delay: 1s; }
.particle:nth-child(5) { top: 50%; right: 10%; animation-delay: 3s; }

/* Ground */
.ground {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30%;
  background: linear-gradient(180deg, #90EE90 0%, #32CD32 100%);
  border-radius: 0 0 15px 15px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10px;
}

.grass {
  font-size: 1.2rem;
  animation: grassSway 4s ease-in-out infinite;
  opacity: 0.8;
}

.pet-character {
  position: relative;
  z-index: 3;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.pet-character:hover {
  transform: scale(1.05);
}

.pet-character.bounce {
  animation: petBounce 0.6s ease;
}

.pet-character.eating {
  animation: petEating 1s ease;
}

.pet-character.playing {
  animation: petPlaying 2s ease;
}

.pet-character.happy .avatar-container {
  animation: happyDance 2s ease infinite;
}

.pet-character.ecstatic .avatar-container {
  animation: ecstaticDance 1s ease infinite;
}

/* Avatar Styles */
.avatar-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pet-avatar {
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
  transition: all 0.3s ease;
}

.avatar-body, .avatar-head {
  transition: all 0.3s ease;
}

.floating-hearts {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.heart {
  position: absolute;
  color: #ff6b9d;
  font-size: 1.2rem;
  animation: floatHeart 3s ease-in-out infinite;
}

.heart:nth-child(1) { animation-delay: 0s; left: -20px; }
.heart:nth-child(2) { animation-delay: 1s; left: 0px; }
.heart:nth-child(3) { animation-delay: 2s; left: 20px; }

.speech-bubble {
  position: absolute;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  color: #333;
  padding: 0.75rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 4;
  max-width: 250px;
  text-align: center;
}

.speech-bubble::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid white;
}

.speech-bubble.active {
  opacity: 1;
  transform: translateX(-50%) translateY(-10px);
}

.food-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.particle {
  position: absolute;
  font-size: 1.5rem;
  animation: particleFloat 2s ease-out;
  color: #ffd700;
}

.particle:nth-child(1) { animation-delay: 0s; left: -30px; }
.particle:nth-child(2) { animation-delay: 0.2s; left: -15px; }
.particle:nth-child(3) { animation-delay: 0.4s; left: 0px; }
.particle:nth-child(4) { animation-delay: 0.6s; left: 15px; }
.particle:nth-child(5) { animation-delay: 0.8s; left: 30px; }

/* Draggable Items */
.interaction-items {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  color: #333;
}

.items-title {
  text-align: center;
  margin-bottom: 1rem;
  color: #2c3e50;
  font-weight: 600;
}

.draggable-items {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
  flex-wrap: wrap;
}

.draggable-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: grab;
  transition: all 0.3s ease;
  min-width: 70px;
  border: 2px solid transparent;
}

.draggable-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.1);
  background: #e9ecef;
}

.draggable-item:active {
  cursor: grabbing;
  transform: scale(0.95);
}

.item-icon {
  font-size: 2rem;
  margin-bottom: 0.25rem;
}

.item-name {
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
}

/* Avatar Customization Panel */
.customization-panel {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  color: #333;
  border: 2px solid #667eea;
}

.customization-panel h6 {
  text-align: center;
  margin-bottom: 1rem;
  color: #2c3e50;
  font-weight: 600;
}

.customization-options {
  display: grid;
  gap: 1rem;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.option-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.option-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
  color: #2c3e50;
}

.option-btn:hover {
  border-color: #667eea;
  background: #e9ecef;
}

.option-btn.active {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.color-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.color-option {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s ease;
}

.color-option:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.color-option.active {
  border-color: #2c3e50;
  transform: scale(1.15);
}

/* Compact Progress Section */
.pet-progress-compact {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 0.75rem;
  color: #333;
}

.progress-header {
  margin-bottom: 0.5rem;
  text-align: center;
}

.progress-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #2c3e50;
}

.progress-bar-enhanced {
  height: 16px;
  background: #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  margin-bottom: 0.75rem;
}

.progress-fill-enhanced {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997, #17a2b8);
  transition: width 1s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 3px;
}

.progress-pet-icon {
  font-size: 0.8rem;
  animation: petWalk 1s ease infinite;
}

.progress-levels-mini {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.level-mini {
  font-size: 1.2rem;
  opacity: 0.4;
  transition: all 0.3s ease;
  transform: scale(0.8);
  cursor: pointer;
}

.level-mini.active {
  opacity: 1;
  transform: scale(1);
  filter: drop-shadow(0 0 6px rgba(255, 215, 0, 0.6));
}

.level-mini:hover {
  transform: scale(1.1);
}

.pet-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Pet Animations */
@keyframes petBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes petEating {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.1) rotate(-5deg); }
  75% { transform: scale(1.1) rotate(5deg); }
}

@keyframes petPlaying {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg) scale(1.1); }
  75% { transform: rotate(10deg) scale(1.1); }
}

@keyframes happyDance {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes ecstaticDance {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-5px) rotate(-5deg); }
  75% { transform: translateY(-5px) rotate(5deg); }
}

@keyframes petWalk {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes particleFloat {
  0% { 
    opacity: 0; 
    transform: translateY(0px) scale(0.5); 
  }
  20% { 
    opacity: 1; 
    transform: translateY(-20px) scale(1); 
  }
  80% { 
    opacity: 1; 
    transform: translateY(-60px) scale(0.8); 
  }
  100% { 
    opacity: 0; 
    transform: translateY(-100px) scale(0.3); 
  }
}

@keyframes floatHeart {
  0% { 
    opacity: 0; 
    transform: translateY(0px) scale(0.5); 
  }
  20% { 
    opacity: 1; 
    transform: translateY(-10px) scale(1); 
  }
  80% { 
    opacity: 1; 
    transform: translateY(-50px) scale(0.8); 
  }
  100% { 
    opacity: 0; 
    transform: translateY(-80px) scale(0.3); 
  }
}

@keyframes slideLeft {
  from { transform: translateX(0); }
  to { transform: translateX(-100vw); }
}

@keyframes playerJump {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-100px); }
}

/* Enhanced Aesthetic Animations */
@keyframes cloudFloat {
  0%, 100% { transform: translateX(0) translateY(0); }
  33% { transform: translateX(10px) translateY(-5px); }
  66% { transform: translateX(-5px) translateY(3px); }
}

@keyframes sunRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes sunPulse {
  0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
}

@keyframes heartFloat {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.8; }
  50% { transform: translateY(-15px) scale(1.1); opacity: 1; }
}

@keyframes starTwinkle {
  0%, 100% { opacity: 0.5; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes grassSway {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(2deg); }
  75% { transform: rotate(-2deg); }
}

/* KPI Cards Specific Styling */
.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.kpi-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-icon i {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
}

.kpi-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: inherit;
}

.kpi-label {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.9;
}

.kpi-trend {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}

.kpi-progress {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
  font-weight: 600;
}

.trending-up {
  position: relative;
  overflow: hidden;
}

.trending-up::after {
  content: '📈';
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1rem;
  animation: pulse 2s infinite;
}

/* Progress Section */
.progress-badge {
  background: linear-gradient(135deg, #17a2b8, #007bff);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.progress-text {
  font-size: 1.1rem;
  color: #495057;
  margin-bottom: 1.5rem;
  font-style: italic;
}

.progress-levels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.level {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  background: #e9ecef;
  color: #6c757d;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.level.active {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

.progress-bar-container {
  margin-top: 1rem;
}

.progress-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  transition: width 1s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

/* Orders Table */
.orders-table {
  width: 100%;
}

.table-header {
  display: grid;
  grid-template-columns: 60px 2fr 1fr 1fr 1fr 80px 80px;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 2px solid #e9ecef;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.table-row {
  display: grid;
  grid-template-columns: 60px 2fr 1fr 1fr 1fr 80px 80px;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f8f9fa;
  align-items: center;
  transition: all 0.3s ease;
}

.table-row:hover {
  background: #f8f9fa;
  transform: translateX(3px);
}

.order-thumbnail {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
}

.rating {
  display: flex;
  gap: 2px;
}

.rating i {
  color: #ffc107;
  font-size: 0.8rem;
}

/* Deals Carousel */
.deals-carousel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.deal-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.deal-item:hover {
  background: #e9ecef;
  transform: scale(1.02);
}

.deal-image {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.deal-content h5 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.deal-discount {
  color: #28a745;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

/* Challenge Card */
.challenge-card {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.challenge-card .ha-card-header {
  background: rgba(255, 255, 255, 0.1);
  border-bottom-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.engagement-badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.challenge-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.challenge-task p {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.challenge-task strong {
  color: #ffd700;
}

.progress-circle {
  width: 80px;
  height: 80px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
  transition: all 0.3s ease;
}

.progress-circle.active {
  border-color: #ffd700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

/* Leaderboard */
.user-rank {
  font-style: italic;
  margin-bottom: 1rem;
  color: #495057;
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.top-savers {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.saver-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.saver-item:hover {
  background: #e9ecef;
  transform: translateX(3px);
}

.rank {
  font-weight: 700;
  color: #007bff;
  width: 40px;
  display: flex;
  align-items: center;
}

.name {
  flex: 1;
  margin-left: 1rem;
  font-weight: 500;
}

.meals {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 600;
}

.section-subtitle {
  color: #6c757d;
  font-size: 0.8rem;
  font-style: italic;
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Dark Mode - HawkerAnalytics Style */
.dark-mode .buyer-dashboard {
  background-color: #212529;
}

.dark-mode .container {
  background-color: #212529;
}

.dark-mode body {
  background-color: #1a1d21;
}

.dark-mode h2, .dark-mode h5, .dark-mode p, .dark-mode span {
  color: #fff !important;
}

.dark-mode .ha-card {
  background-color: #343a40;
  color: #fff;
  border: 1px solid #495057;
}

.dark-mode .ha-card-header {
  background-color: #495057;
  border-bottom: 1px solid #6c757d;
  color: #fff;
}

.dark-mode .table-row:hover {
  background: #495057;
}

.dark-mode .deal-item,
.dark-mode .saver-item {
  background: #495057;
  color: #fff;
}

.dark-mode .deal-item:hover,
.dark-mode .saver-item:hover {
  background: #5a6c7d;
}

.dark-mode .progress-text {
  color: #e9ecef;
}

.dark-mode .user-rank {
  background: #495057;
  color: #e9ecef;
  border-left-color: #17a2b8;
}

.dark-mode .deal-content h5 {
  color: #fff;
}

.dark-mode .btn-outline-secondary {
  border-color: #6c757d;
  color: #fff;
}

.dark-mode .btn-outline-secondary:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

/* Dark Mode Pet Styles */
.dark-mode .pet-playground-card {
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
}

.dark-mode .pet-container {
  background: linear-gradient(135deg, #2a4365 0%, #3c4142 100%);
}

.dark-mode .pet-progress-compact {
  background: rgba(45, 55, 72, 0.9);
  color: #e2e8f0;
}

.dark-mode .progress-label {
  color: #e2e8f0;
}

.dark-mode .speech-bubble {
  background: #4a5568;
  color: #e2e8f0;
}

.dark-mode .speech-bubble::after {
  border-top-color: #4a5568;
}

.dark-mode .mini-game-container {
  background: #1a202c;
}

.dark-mode .game-area {
  background: linear-gradient(135deg, #2c5282, #1a365d);
}

/* Responsive Design */
@media (max-width: 768px) {
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    text-align: center;
  }
  
  .challenge-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .kpi-header {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .progress-levels {
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }
}

/* Additional Gamification Styles */
.btn {
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-success {
  background: linear-gradient(135deg, #28a745, #20c997);
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #007bff, #17a2b8);
  border: none;
}

/* Cute hover effects for cards */
.ha-card-info:hover {
  background: linear-gradient(135deg, #17a2b8, #007bff);
}

.ha-card-success:hover {
  background: linear-gradient(135deg, #28a745, #20c997);
}

.ha-card-warning:hover {
  background: linear-gradient(135deg, #ffc107, #fd7e14);
}

.ha-card-primary:hover {
  background: linear-gradient(135deg, #007bff, #6610f2);
}
</style>