<template>
  <div v-if="visible" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content payment-error-modal" @click.stop>
      <div class="modal-header">
        <div class="modal-header-content">
          <i class="fa-solid fa-circle-exclamation modal-icon"></i>
          <h2 class="modal-h2">Payment Error</h2>
        </div>
      </div>
      <div class="modal-body">
        <p class="error-message" style="white-space: pre-line;">{{ message }}</p>
      </div>
      <div class="modal-footer">
        <button class="modal-btn proceed-btn" @click="$emit('close')">
          OK
        </button>
      </div>
    </div>
  </div>
</template>

<script src="./ValidationModal.js"></script>

<style>
@import './ValidationModal.css';
</style>

