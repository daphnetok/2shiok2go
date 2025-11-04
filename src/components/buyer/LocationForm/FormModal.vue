<template>
  <div
    ref="sheet"
    class="location-sheet"
    :class="{ collapsed: isCollapsed }"
  >
    <!-- Handle (visual only) -->
    <div class="sheet-handle-area">
      <div class="sheet-handle"></div>
    </div>

    <!-- Collapsed State (25vh) -->
    <div v-show="isCollapsed" class="collapsed-content" @click="expand">
      <div class="address-preview">
        <p class="address-label">Selected Location</p>
        <p class="address-text">{{ address || 'Loading...' }}</p>
      </div>
      <button 
        class="confirm-btn" 
        :disabled="!locationName.trim() || !address"
        @click.stop="onConfirm"
      >
        Confirm Location
      </button>
    </div>

    <!-- Expanded State (60vh) -->
    <div v-show="!isCollapsed" class="expanded-content" @click.stop>
      <h3 class="form-title">Add New Location</h3>

      <!-- Name Field -->
      <div class="form-field">
        <label class="field-label">Location Name</label>
        <input
          v-model="locationName"
          type="text"
          class="field-input"
          placeholder="e.g., Home, Office, School..."
        />
      </div>

      <!-- Location Field (AddressAutocomplete) -->
      <div class="form-field">
        <AddressAutocomplete
          label="Address"
          placeholder="Search for an address..."
          :modelValue="selectedAddress"
          @update:modelValue="onAddressUpdate"
          @placeSelected="onPlaceSelected"
        />
      </div>

      <!-- Error Message -->
      <p v-if="saveError" class="error-message">{{ saveError }}</p>

      <!-- Confirm Button -->
      <button
        class="confirm-btn"
        :disabled="!locationName.trim() || !address"
        @click="onConfirm"
      >
        Confirm Location
      </button>
    </div>
  </div>
</template>

<script src="./FormModal.js"></script>
<style src="./FormModal.css"></style>