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
        <h3>Location Settings</h3>
        <button class="close-btn" @click="onXClick">✕</button>
      </div>

      <div class="current-location-section">
        <div class="location-icon">📍</div>
        <div class="location-details">
          <p class="location-label">Current Location</p>
          <p class="location-address">{{ formattedAddress || 'Loading...' }}</p>
        </div>
      </div>

      <div class="coming-soon">
        <p>✨ More location options coming soon!</p>
        <ul>
          <li>Save custom addresses</li>
          <li>Select from saved locations</li>
          <li>Manual location picker</li>
        </ul>
      </div>
    </div>
    <div class="modal-extension"></div>
  </div>
</template>

<script src="./BottomSheet.js"></script>
<style src="./BottomSheet.css"></style>