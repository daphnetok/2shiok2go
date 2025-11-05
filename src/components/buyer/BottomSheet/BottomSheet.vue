<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="onBackdropClick">
    <div
      ref="sheet"
      class="bottom-sheet"
      @click.stop
      @mousedown="onHandleMouseDown"
      @touchstart="onDragStart"
      @touchmove.prevent="onDragMove"
      @touchend="onDragEnd"
    >
      <div class="sheet-handle-area" @mousedown="onHandleMouseDown">
        <div class="sheet-handle"></div>
      </div>

      <div class="modal-header">
        <h3>Confirm Your Location</h3>
        <button class="close-btn" @click="onXClick">✕</button>
      </div>

      <div class="location-options">
        <!-- Current Location Radio Option -->
        <label class="location-option" :class="{ selected: selectedOption === 'current' }">
          <input 
            type="radio" 
            name="location" 
            value="current" 
            v-model="selectedOption"
            @change="onLocationSelect"
          />
          <div class="option-content">
            <div class="location-icon">📍</div>
            <div class="location-details">
              <p class="location-label">Use Current Location</p>
              <p class="location-address">{{ currentGPSAddress || 'Loading...' }}</p>
            </div>
          </div>
        </label>

        <!-- Saved Locations (limited to 3) -->
        <template v-if="savedLocations.length > 0">
          <label 
            v-for="location in savedLocations.slice(0, 3)" 
            :key="location.id"
            class="location-option"
            :class="{ selected: selectedOption === location.id }"
          >
            <input 
              type="radio" 
              name="location" 
              :value="location.id" 
              v-model="selectedOption"
              @change="onLocationSelect"
            />
            <div class="option-content">
              <div class="location-icon">📌</div>
              <div class="location-details">
                <p class="location-label">{{ location.customName }}</p>
                <p class="location-address">{{ location.formattedAddress }}</p>
              </div>
            </div>
            <!-- DELETE BUTTON -->
            <button 
              class="delete-btn" 
              @click="deleteLocation(location.id, $event)"
              title="Delete location"
            >
              ×
            </button>
          </label>
        </template>

        <!-- Separator -->
        <div class="separator"></div>

        <!-- Add New Location Button (disabled when 3 saved locations) -->
        <button 
          class="add-location-btn" 
          @click="onAddLocationClick"
          :disabled="!canAddMoreLocations()"
          :style="!canAddMoreLocations() ? { opacity: 0.5, cursor: 'not-allowed' } : {}"
        >
          <span class="plus-icon">+</span>
          {{ canAddMoreLocations() ? 'Add new saved location' : 'Maximum 3 saved locations' }}
        </button>
      </div>
    <div class="modal-extension"></div>
    </div>
  </div>
</template>

<script src="./BottomSheet.js"></script>
<style src="./BottomSheet.css"></style>