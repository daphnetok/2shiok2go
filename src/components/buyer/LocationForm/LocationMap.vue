<template>
  <div class="location-form-page">
    <!-- Google Map -->
    <div ref="mapContainer" class="map-container"></div>
    
    <!-- ✅ CHANGED: Added map click overlay -->
    <div v-if="isModalCollapsed" class="map-click-overlay" @click="onMapClick"></div>

    <!-- Fixed Center Pin -->
    <div class="center-pin">📍</div>
    
    <!-- Exit Button -->
    <button class="exit-btn" @click="onExit">✕</button>
    
    <!-- Bottom Sheet -->
    <FormModal
    ref="formModalRef"
      :address="currentAddress"
      :isLoadingAddress="isLoadingAddress"
      :saveError="saveError"
      @save="onSave"
      @addressSelected="onAddressSelected"
      @stateChange="onModalStateChange"
    />
  </div>
</template>

<script src="./LocationMap.js"></script>
<style src="./LocationMap.css"></style>