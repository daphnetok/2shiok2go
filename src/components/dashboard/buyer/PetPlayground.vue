<template>
  <div class="card border-0 shadow-sm" style="border-radius: 12px; overflow: hidden;">
    <div class="card-header bg-white border-0 d-flex justify-content-between align-items-center flex-wrap gap-2" style="padding: 1.25rem 1.5rem;">
      <h5 class="mb-0 fw-semibold" style="color: #059669; font-size: 1.1rem;">
        <i class="fas fa-paw me-2"></i>Your Rescue Pet - {{ pet.name }}
      </h5>
      <div class="pet-controls d-flex gap-2 flex-wrap">
        <button class="btn btn-sm btn-outline-primary" style="border-radius: 8px;" @click="$emit('customize')">
          <i class="fas fa-palette"></i> Customize
        </button>
        <button class="btn btn-sm btn-success" style="border-radius: 8px;" @click="$emit('feed')">
          <i class="fas fa-cookie-bite"></i> Feed ({{ pet.treats }})
        </button>
        <button class="btn btn-sm btn-primary" style="border-radius: 8px;" @click="$emit('play')">
          <i class="fas fa-heart"></i> Show Love
        </button>
      </div>
    </div>
    <div class="card-body" style="padding: 1.5rem;">
      <div class="pet-container" @click="$emit('click')" :style="{ background: pet.avatar.background }">
        <div class="pet-scene">
          <div class="pet-background">
            <!-- Clouds (lighter for night theme) -->
            <div class="cloud cloud1" :class="{ 'night-cloud': isNightTheme }">☁️</div>
            <div class="cloud cloud2" :class="{ 'night-cloud': isNightTheme }">☁️</div>
            <div class="cloud cloud3" :class="{ 'night-cloud': isNightTheme }">☁️</div>
            
            <!-- Sun or Moon based on theme -->
            <div class="sun-container" v-if="!isNightTheme">
              <div class="sun">☀️</div>
              <div class="sun-rays"></div>
            </div>
            <div class="moon-container" v-else>
              <div class="moon">🌙</div>
              <div class="stars">
                <div class="star-icon" style="top: 15%; left: 20%;">⭐</div>
                <div class="star-icon" style="top: 25%; right: 25%;">✨</div>
                <div class="star-icon" style="top: 35%; left: 70%;">⭐</div>
                <div class="star-icon" style="top: 45%; left: 15%;">✨</div>
                <div class="star-icon" style="top: 20%; right: 15%;">⭐</div>
              </div>
            </div>
            
            <div class="floating-particles">
              <div class="particle sparkle">✨</div>
              <div class="particle sparkle">✨</div>
              <div class="particle sparkle">✨</div>
              <div class="particle heart">💖</div>
              <div class="particle star">⭐</div>
            </div>
            <div class="ground" :class="{ 'night-ground': isNightTheme }">
              <div class="grass">🌱🌿🌱🌿🌱🌿🌱🌿</div>
            </div>
          </div>
          <div class="pet-character" 
               :class="[pet.mood, animation]" 
               @click="$emit('click')"
               @dragover.prevent="$emit('dragover', $event)"
               @drop="$emit('drop', $event)">
            <div class="avatar-container">
              <svg width="120" height="120" viewBox="0 0 120 120" class="pet-avatar">
                <!-- Shadow -->
                <ellipse cx="60" cy="100" rx="40" ry="8" fill="rgba(0,0,0,0.15)"/>
                
                <!-- Body -->
                <ellipse cx="60" cy="80" rx="35" ry="25" :fill="pet.avatar.color" class="avatar-body"/>
                
                <!-- Head -->
                <circle cx="60" cy="45" r="30" :fill="pet.avatar.color" class="avatar-head"/>
                
                <!-- Ears based on animal type -->
                <g v-if="pet.avatar.body === 'cat'">
                  <polygon points="40,25 35,10 50,20" :fill="pet.avatar.color"/>
                  <polygon points="80,25 85,10 70,20" :fill="pet.avatar.color"/>
                  <polygon points="40,25 38,15 48,22" fill="#FFB6C1" opacity="0.6"/>
                  <polygon points="80,25 82,15 72,22" fill="#FFB6C1" opacity="0.6"/>
                </g>
                <g v-else-if="pet.avatar.body === 'dog'">
                  <ellipse cx="35" cy="25" rx="8" ry="15" :fill="pet.avatar.color"/>
                  <ellipse cx="85" cy="25" rx="8" ry="15" :fill="pet.avatar.color"/>
                </g>
                <g v-else-if="pet.avatar.body === 'bunny'">
                  <ellipse cx="45" cy="15" rx="6" ry="20" :fill="pet.avatar.color"/>
                  <ellipse cx="75" cy="15" rx="6" ry="20" :fill="pet.avatar.color"/>
                  <ellipse cx="45" cy="18" rx="3" ry="12" fill="#FFB6C1" opacity="0.6"/>
                  <ellipse cx="75" cy="18" rx="3" ry="12" fill="#FFB6C1" opacity="0.6"/>
                </g>
                <g v-else-if="pet.avatar.body === 'fox'">
                  <polygon points="38,20 30,5 48,18" :fill="pet.avatar.color"/>
                  <polygon points="82,20 90,5 72,18" :fill="pet.avatar.color"/>
                  <polygon points="38,20 34,10 45,19" fill="#FFF" opacity="0.8"/>
                  <polygon points="82,20 86,10 75,19" fill="#FFF" opacity="0.8"/>
                </g>
                <g v-else-if="pet.avatar.body === 'bear'">
                  <circle cx="38" cy="22" r="10" :fill="pet.avatar.color"/>
                  <circle cx="82" cy="22" r="10" :fill="pet.avatar.color"/>
                  <circle cx="38" cy="22" r="6" fill="#D2691E" opacity="0.6"/>
                  <circle cx="82" cy="22" r="6" fill="#D2691E" opacity="0.6"/>
                </g>
                <g v-else-if="pet.avatar.body === 'panda'">
                  <circle cx="38" cy="22" r="10" fill="#000"/>
                  <circle cx="82" cy="22" r="10" fill="#000"/>
                  <!-- Panda eyes (black patches) -->
                  <ellipse cx="50" cy="40" rx="8" ry="10" fill="#000"/>
                  <ellipse cx="70" cy="40" rx="8" ry="10" fill="#000"/>
                  <circle cx="50" cy="40" r="4" fill="#FFF"/>
                  <circle cx="70" cy="40" r="4" fill="#FFF"/>
                  <circle cx="52" cy="38" r="2" fill="#000"/>
                  <circle cx="72" cy="38" r="2" fill="#000"/>
                </g>
                
                <!-- Eyes (for non-panda) -->
                <g v-if="pet.avatar.body !== 'panda'">
                  <circle cx="50" cy="40" r="5" fill="#000" class="avatar-eye"/>
                  <circle cx="70" cy="40" r="5" fill="#000" class="avatar-eye"/>
                  <circle cx="52" cy="38" r="2" fill="#FFF" opacity="0.9"/>
                  <circle cx="72" cy="38" r="2" fill="#FFF" opacity="0.9"/>
                </g>
                
                <!-- Nose -->
                <ellipse cx="60" cy="52" rx="4" ry="3" fill="#FF69B4"/>
                
                <!-- Mouth -->
                <path d="M 50 55 Q 60 60 70 55" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"/>
                
                <!-- Accessory -->
                <g v-if="pet.avatar.accessory === 'bow'">
                  <path d="M 45 20 Q 40 25 45 30 L 50 25 Z" :fill="pet.avatar.accessoryColor"/>
                  <path d="M 75 20 Q 80 25 75 30 L 70 25 Z" :fill="pet.avatar.accessoryColor"/>
                  <circle cx="60" cy="25" r="4" :fill="pet.avatar.accessoryColor"/>
                </g>
                <g v-else-if="pet.avatar.accessory === 'hat'">
                  <rect x="40" y="8" width="40" height="6" :fill="pet.avatar.accessoryColor" rx="2"/>
                  <path d="M 35 8 L 85 8 L 80 0 L 40 0 Z" :fill="pet.avatar.accessoryColor"/>
                </g>
                <g v-else-if="pet.avatar.accessory === 'glasses'">
                  <circle cx="50" cy="40" r="8" fill="none" stroke="#000" stroke-width="2"/>
                  <circle cx="70" cy="40" r="8" fill="none" stroke="#000" stroke-width="2"/>
                  <line x1="58" y1="40" x2="62" y2="40" stroke="#000" stroke-width="2"/>
                </g>
                <g v-else-if="pet.avatar.accessory === 'scarf'">
                  <path d="M 40 65 Q 60 70 80 65 L 80 72 Q 60 77 40 72 Z" :fill="pet.avatar.accessoryColor"/>
                  <rect x="78" y="65" width="8" height="20" :fill="pet.avatar.accessoryColor" rx="2"/>
                </g>
                <g v-else-if="pet.avatar.accessory === 'crown'">
                  <path d="M 35 15 L 40 5 L 45 12 L 50 2 L 55 12 L 60 0 L 65 12 L 70 2 L 75 12 L 80 5 L 85 15 Z" fill="#FFD700"/>
                  <circle cx="50" cy="8" r="2" fill="#FF1493"/>
                  <circle cx="60" cy="6" r="2" fill="#FF1493"/>
                  <circle cx="70" cy="8" r="2" fill="#FF1493"/>
                </g>
                <g v-else-if="pet.avatar.accessory === 'flower'">
                  <circle cx="30" cy="20" r="5" fill="#FF69B4"/>
                  <circle cx="25" cy="23" r="4" fill="#FFB6C1"/>
                  <circle cx="35" cy="23" r="4" fill="#FFB6C1"/>
                  <circle cx="28" cy="27" r="4" fill="#FFB6C1"/>
                  <circle cx="32" cy="27" r="4" fill="#FFB6C1"/>
                  <circle cx="30" cy="24" r="3" fill="#FFD700"/>
                </g>
              </svg>
            </div>
            <div class="mood-indicator">{{ pet.mood }}</div>
          </div>
        </div>
      </div>
      <div class="pet-stats row g-3 mt-4">
        <div class="col-4">
          <div class="stat-item">
            <span class="stat-label d-block mb-2 text-uppercase" style="font-size: 0.7rem; font-weight: 600; letter-spacing: 0.5px; color: #059669;">Happiness</span>
            <div class="progress" style="height: 28px; border-radius: 8px; background: rgba(16, 185, 129, 0.1);">
              <div class="progress-bar bg-success fw-semibold" style="border-radius: 8px;" :style="{ width: pet.happiness + '%' }">{{ pet.happiness }}%</div>
            </div>
          </div>
        </div>
        <div class="col-4">
          <div class="stat-item">
            <span class="stat-label d-block mb-2 text-uppercase" style="font-size: 0.7rem; font-weight: 600; letter-spacing: 0.5px; color: #d97706;">Energy</span>
            <div class="progress" style="height: 28px; border-radius: 8px; background: rgba(245, 158, 11, 0.1);">
              <div class="progress-bar bg-warning fw-semibold" style="border-radius: 8px;" :style="{ width: pet.energy + '%' }">{{ pet.energy }}%</div>
            </div>
          </div>
        </div>
        <div class="col-4">
          <div class="stat-item">
            <span class="stat-label d-block mb-2 text-uppercase" style="font-size: 0.7rem; font-weight: 600; letter-spacing: 0.5px; color: #1e40af;">Level {{ pet.level }}</span>
            <div class="progress" style="height: 28px; border-radius: 8px; background: rgba(59, 130, 246, 0.1);">
              <div class="progress-bar bg-info fw-semibold" style="border-radius: 8px;" :style="{ width: (pet.experience % 100) + '%' }">{{ pet.experience % 100 }}/100</div>
            </div>
          </div>
        </div>
      </div>
      <div class="pet-message mt-3" v-if="message">
        <div class="alert mb-0" style="border-radius: 8px;" :class="'alert-' + messageType">{{ message }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PetPlayground',
  props: {
    pet: { type: Object, required: true },
    animation: { type: String, default: '' },
    message: { type: String, default: '' },
    messageType: { type: String, default: 'info' }
  },
  emits: ['click', 'customize', 'feed', 'play', 'dragover', 'drop'],
  computed: {
    isNightTheme() {
      if (!this.pet.avatar || !this.pet.avatar.background) return false;
      const bg = this.pet.avatar.background.toLowerCase();
      return bg.includes('#1a1a2e') || bg.includes('#16213e') || bg.includes('1a1a2e') || bg.includes('16213e');
    }
  }
}
</script>

<style scoped>
.card {
  transition: all 0.2s ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15) !important;
}
.pet-container { 
  position: relative; 
  height: 400px; 
  border-radius: 12px; 
  overflow: hidden;
  background: linear-gradient(180deg, #87CEEB 0%, #E0F6FF 100%);
  transition: background 0.5s ease;
}
.pet-scene { position: relative; width: 100%; height: 100%; }
.pet-background { position: absolute; inset: 0; }
.cloud { position: absolute; font-size: 2rem; animation: float 20s ease-in-out infinite; }
.cloud1 { top: 10%; left: 10%; animation-delay: 0s; }
.cloud2 { top: 20%; right: 15%; animation-delay: 7s; }
.cloud3 { top: 15%; left: 60%; animation-delay: 14s; }
.night-cloud { opacity: 0.3; filter: brightness(0.7); }
.sun-container { position: absolute; top: 20px; right: 30px; }
.sun { font-size: 3rem; animation: rotate 20s linear infinite; }
.sun-rays { position: absolute; inset: -10px; background: radial-gradient(circle, rgba(255,255,0,0.3) 0%, transparent 70%); animation: pulse 3s ease-in-out infinite; }
.moon-container { position: absolute; top: 20px; right: 30px; }
.moon { font-size: 3rem; animation: float 6s ease-in-out infinite; }
.stars { position: absolute; inset: 0; pointer-events: none; }
.star-icon { position: absolute; font-size: 1.2rem; animation: twinkle 2s ease-in-out infinite; }
.star-icon:nth-child(2) { animation-delay: 0.4s; }
.star-icon:nth-child(3) { animation-delay: 0.8s; }
.star-icon:nth-child(4) { animation-delay: 1.2s; }
.star-icon:nth-child(5) { animation-delay: 1.6s; }
.floating-particles { position: absolute; inset: 0; pointer-events: none; }
.particle { position: absolute; animation: sparkle 3s ease-in-out infinite; }
.sparkle:nth-child(1) { top: 20%; left: 30%; animation-delay: 0s; }
.sparkle:nth-child(2) { top: 60%; right: 20%; animation-delay: 1s; }
.sparkle:nth-child(3) { bottom: 30%; left: 50%; animation-delay: 2s; }
.heart { top: 40%; right: 30%; animation-delay: 1.5s; }
.star { bottom: 40%; left: 20%; animation-delay: 2.5s; }
.ground { position: absolute; bottom: 0; width: 100%; height: 80px; background: linear-gradient(180deg, #90EE90 0%, #228B22 100%); transition: background 0.5s ease; }
.night-ground { background: linear-gradient(180deg, #2d5016 0%, #1a2f0f 100%); }
.grass { position: absolute; bottom: 10px; width: 100%; text-align: center; font-size: 1.5rem; opacity: 0.7; animation: sway 3s ease-in-out infinite; }
.pet-character { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); cursor: pointer; transition: all 0.3s ease; z-index: 10; }
.pet-character:hover { transform: translate(-50%, -50%) scale(1.05); }
.avatar-container { position: relative; }
.mood-indicator { text-align: center; margin-top: 10px; font-weight: bold; font-size: 1.2rem; color: #10b981; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
.happy { animation: bounce 0.6s ease; }
.excited { animation: wiggle 0.5s ease; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes pulse { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
@keyframes sparkle { 0%, 100% { opacity: 0; transform: scale(0.5) translateY(0); } 50% { opacity: 1; transform: scale(1.2) translateY(-10px); } }
@keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
@keyframes sway { 0%, 100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
@keyframes bounce { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -60%) scale(1.1); } }
@keyframes wiggle { 0%, 100% { transform: translate(-50%, -50%) rotate(0deg); } 25% { transform: translate(-50%, -50%) rotate(-10deg); } 75% { transform: translate(-50%, -50%) rotate(10deg); } }
</style>
