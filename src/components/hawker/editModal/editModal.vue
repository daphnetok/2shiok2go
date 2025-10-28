<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h3>Edit Listing</h3>
        <button class="close-btn" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="row">
            <!-- Image Upload Section -->
            <div class="col-md-4">
              <div id="img-container" class="container mb-3" v-if="previewImageUrl">
                <img :src="previewImageUrl" alt="Preview">
                <span class="remove-btn" @click="removeNewImage">
                  <i class="fas fa-times"></i>
                </span>
              </div>

              <div id="uploadImg" @click="$refs.fileInput.click()" class="mb-4">
                <label>
                  <i class="fas fa-upload"></i>
                  <span v-if="!newImageFile">
                    <b>{{ previewImageUrl ? 'Change Photo' : 'Upload Photo' }}</b>
                  </span>
                  <span v-else><b>Change Photo</b></span>
                  <br> Click to browse or drag and drop
                </label>
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/jpg" 
                  @change="onFileSelected" 
                  ref="fileInput"
                  style="display: none;">
              </div>
            </div>

            <!-- Form Fields Section -->
            <div class="col-md-8">
              <!-- Item Name -->
              <label class="form-label">Item Name</label>
              <input 
                type="text" 
                class="form-control mb-3" 
                required 
                v-model="editForm.itemName"
                placeholder="Type food name here">

              <!-- Price & Discount -->
              <div class="row mb-3">
                <div class="col">
                  <label class="form-label">Original Price</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    required 
                    step="0.01" 
                    v-model.number="editForm.itemPrice">
                </div>
                <div class="col">
                  <label class="form-label">Discount (%)</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    required 
                    step="0.01" 
                    v-model.number="editForm.discount">
                </div>
              </div>

              <div class="mb-3">
                <p>Price after discount: $
                  <span v-if="editForm.itemPrice && editForm.discount">
                    {{ calculatedDiscountedPrice }}
                  </span>
                </p>
              </div>

              <!-- Quantity -->
              <label class="form-label">Quantity</label>
              <input 
                type="number" 
                class="form-control mb-3 w-50" 
                required 
                v-model.number="editForm.itemQty">

              <!-- Allergens -->
              <label class="form-label">Allergens (select all that apply)</label>
              <div class="mb-3">
                <div v-for="allergen in allergenOptions" :key="allergen">
                  <input 
                    type="checkbox" 
                    :value="allergen" 
                    v-model="editForm.allergens">
                  <label>{{ allergen }}</label>
                </div>
              </div>

              <!-- Tags -->
              <label class="form-label">Tags</label>
              <div class="mb-3">
                <div v-for="tag in tagOptions" :key="tag">
                  <input 
                    type="checkbox" 
                    :value="tag" 
                    v-model="editForm.tags">
                  <label>{{ tag }}</label>
                </div>
              </div>

              <!-- Make Active Toggle -->
              <div class="form-check form-switch mb-3">
                <input 
                  v-model="editForm.makeActive" 
                  class="form-check-input" 
                  type="checkbox" 
                  role="switch">
                <div v-if="editForm.makeActive">
                  <label class="fw-bold">Post Listing</label>
                  <p class="text-secondary">Listing will be live to customers</p>
                </div>
                <div v-else>
                  <label class="fw-bold">Keep Listing as Unlisted</label>
                  <p class="text-secondary">Listing will be inactive</p>
                </div>
              </div>

              <!-- Buttons -->
              <div class="button-group">
                <button 
                  type="button" 
                  class="btn btn-secondary" 
                  @click="closeModal"
                  :disabled="isSubmitting">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="btn btn-success" 
                  :disabled="isSubmitting">
                  {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>

              <p v-if="errorMessage" class="text-danger mt-2">
                {{ errorMessage }}
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script src="./editModal.js"></script>

<style src="./editModal.css"></style>