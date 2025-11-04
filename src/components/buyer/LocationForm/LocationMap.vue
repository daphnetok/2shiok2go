<template>
  <div class="location-form-page">
    <!-- Google Map -->
    <div ref="mapContainer" class="map-container"></div>
    
    <!-- Single overlay for expanded modal state only -->
    <div 
      v-if="!isModalCollapsed" 
      class="modal-overlay"
      @click="collapseModal"
    ></div>

    <!-- Exit Button -->
    <button class="exit-btn" @click="onExit">✕</button>

    <!-- Reset Location Button - Fixed below exit button -->
    <button class="reset-location-btn" @click="onResetLocation">
        <i class="fa-solid fa-location-crosshairs"></i>
    </button>

    <!-- Fixed Center Pin -->
    <div class="center-pin">📍</div>
    
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