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
      <div class="pet-container" @click="$emit('click')">
        <div class="pet-scene">
          <div class="pet-background">
            <div class="sky-gradient"></div>
            <div class="cloud cloud1">☁️</div>
            <div class="cloud cloud2">☁️</div>
            <div class="cloud cloud3">☁️</div>
            <div class="sun-container">
              <div class="sun">☀️</div>
              <div class="sun-rays"></div>
            </div>
            <div class="floating-particles">
              <div class="particle sparkle">✨</div>
              <div class="particle sparkle">✨</div>
              <div class="particle sparkle">✨</div>
              <div class="particle heart">💖</div>
              <div class="particle star">⭐</div>
            </div>
            <div class="ground">
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
                <ellipse cx="60" cy="80" rx="35" ry="25" :fill="pet.avatar.color" class="avatar-body"/>
                <circle cx="60" cy="45" r="30" :fill="pet.avatar.color" class="avatar-head"/>
                <g v-if="pet.avatar.body === 'cat'">
                  <polygon points="40,25 35,10 50,20" :fill="pet.avatar.color"/>
                  <polygon points="80,25 85,10 70,20" :fill="pet.avatar.color"/>
                </g>
                <g v-if="pet.avatar.body === 'dog'">
                  <ellipse cx="35" cy="25" rx="8" ry="15" :fill="pet.avatar.color"/>
                  <ellipse cx="85" cy="25" rx="8" ry="15" :fill="pet.avatar.color"/>
                </g>
                <g v-if="pet.avatar.body === 'bunny'">
                  <ellipse cx="45" cy="15" rx="6" ry="20" :fill="pet.avatar.color"/>
                  <ellipse cx="75" cy="15" rx="6" ry="20" :fill="pet.avatar.color"/>
                </g>
                <circle cx="50" cy="40" r="4" fill="#000" class="avatar-eye"/>
                <circle cx="70" cy="40" r="4" fill="#000" class="avatar-eye"/>
                <path :d="pet.avatar.face" fill="none" stroke="#000" stroke-width="2" class="avatar-mouth"/>
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
  emits: ['click', 'customize', 'feed', 'play', 'dragover', 'drop']
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
}
.pet-scene { position: relative; width: 100%; height: 100%; }
.pet-background { position: absolute; inset: 0; }
.sky-gradient { position: absolute; inset: 0; background: linear-gradient(180deg, #87CEEB 0%, #E0F6FF 100%); }
.cloud { position: absolute; font-size: 2rem; animation: float 20s ease-in-out infinite; }
.cloud1 { top: 10%; left: 10%; animation-delay: 0s; }
.cloud2 { top: 20%; right: 15%; animation-delay: 7s; }
.cloud3 { top: 15%; left: 60%; animation-delay: 14s; }
.sun-container { position: absolute; top: 20px; right: 30px; }
.sun { font-size: 3rem; animation: rotate 20s linear infinite; }
.sun-rays { position: absolute; inset: -10px; background: radial-gradient(circle, rgba(255,255,0,0.3) 0%, transparent 70%); animation: pulse 3s ease-in-out infinite; }
.floating-particles { position: absolute; inset: 0; pointer-events: none; }
.particle { position: absolute; animation: sparkle 3s ease-in-out infinite; }
.sparkle:nth-child(1) { top: 20%; left: 30%; animation-delay: 0s; }
.sparkle:nth-child(2) { top: 60%; right: 20%; animation-delay: 1s; }
.sparkle:nth-child(3) { bottom: 30%; left: 50%; animation-delay: 2s; }
.heart { top: 40%; right: 30%; animation-delay: 1.5s; }
.star { bottom: 40%; left: 20%; animation-delay: 2.5s; }
.ground { position: absolute; bottom: 0; width: 100%; height: 80px; background: linear-gradient(180deg, #90EE90 0%, #228B22 100%); }
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
@keyframes sway { 0%, 100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
@keyframes bounce { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -60%) scale(1.1); } }
@keyframes wiggle { 0%, 100% { transform: translate(-50%, -50%) rotate(0deg); } 25% { transform: translate(-50%, -50%) rotate(-10deg); } 75% { transform: translate(-50%, -50%) rotate(10deg); } }
</style>
