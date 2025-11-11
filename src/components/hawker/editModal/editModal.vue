<template>
  <!-- Modal Overlay -->
  <transition name="modal-fade">
    <div v-if="isVisible" class="edit-modal-overlay" @click.self="closeModal">
      <div class="edit-modal-container">
        <!-- Modal Header -->
        <div class="edit-modal-header">
          <h2 class="modal-title">Edit Listing</h2>
          <button class="modal-close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="edit-modal-body text-dark">
          <form @submit.prevent="handleSubmit">
            <div class="form-content">
              
              <!-- Image Upload Section -->
              <div class="form-section">
                <div class="row mb-3">
                  <div>
                    <div class="uploader-card">
                      <div class="uploader-drop" @click="$refs.fileInput.click()">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p class="m-0">
                          <b>{{ imageFile ? 'Change Photo' : 'Upload Photo' }}</b>
                        </p>
                        <small>Click to browse or drag files here.</small>
                        <input 
                          type="file" 
                          accept="image/jpeg, image/png, image/jpg" 
                          @change="onFileSelected" 
                          ref="fileInput" 
                          style="display:none;"
                        />
                      </div>
                      <small v-if="imageError" class="text-danger d-block mt-2">{{ imageError }}</small>

                      <div v-if="imagePreviewUrl" class="mt-3 text-center d-flex flex-column">
                        <img :src="imagePreviewUrl" class="img-fluid rounded shadow" style="max-height:200px; object-fit:cover;" />
                        <button type="button" class="btn btn-sm btn-danger mx-auto" @click="removeImage">
                            Remove ×
                          </button>
                      </div>
                    </div>
                    </div>

                  <!-- Item Name & Description -->
                  <div class="col-12 p-0">
                    <!-- Item Name -->
                    <div class="mb-3">
                      <label for="itemName" class="form-label">Item Name</label>
                      <input
                        type="text"
                        id="itemName"
                        class="form-control"
                        required
                        v-model="editForm.itemName"
                        placeholder="Enter food name"
                      />
                    </div>

                    <!-- AI Description Component -->
                    <AIFoodDescription
                      v-model:description="editForm.description"
                      :selectedFile="imageFile"
                      :foodName="editForm.itemName"
                      :imageUrl="existingImageUrl"
                    />
                  </div>
                </div>
              </div>

              <!-- Price & Discount Section -->
              <div class="form-section">
                <div class="row mb-3">
                  <div class="col-md-6 price-input-container p-2">
                    <label class="form-label">Original Price</label>
                    <input
                      type="number"
                      class="form-control"
                      style="padding-left: 30px"
                      required
                      step="0.01"
                      v-model.number="editForm.itemPrice"
                    />
                  </div>
                  <div class="col-md-6 p-2">
                    <label class="form-label">Discount (%)</label>
                    <input
                      type="number"
                      class="form-control"
                      required
                      step="0.01"
                      v-model.number="editForm.discount"
                    />
                  </div>
                </div>
                <p class="fw-bold px-2 text-success">
                  Price after discount: $
                  <span class="fw-bold" v-if="editForm.itemPrice && editForm.discount">
                    {{ calculatedDiscountedPrice }}
                  </span>
                </p>
              </div>

              <!-- Discount Time Section -->
              <div class="form-section">
                <div class="row mb-3">
                  <div class="col-md-6 p-2">
                    <label class="form-label">Set Discount Start Time</label>
                    <input
                      type="time"
                      class="form-control"
                      required
                      v-model="editForm.discountTime"
                    />
                  </div>

                  <!-- Apply to Other Listings -->
                  <div class="col-md-6 p-2" v-if="userListings">
                 <label class="form-label">Apply Discount Start Time To</label>
 
                 <div class="border rounded p-3 bg-white text-dark">
                     <!-- Select All checkbox -->
                     <p class="pt-1">Select All</p>
                     <div class="form-check border-bottom pb-1">
                       <input
                         type="checkbox"
                         id="selectAll"
                         class="form-check-input"
                         v-model="selectAll"
                         @change="toggleSelectAll"
                       />
                       <label for="selectAll" class="form-check-label">
                         All My Listings
                       </label>
                     </div>
 
                     <!-- Active Listings -->
                     <p class="pt-3">Active Listings</p>
                     <div class="form-check">
                       <input
                         type="checkbox"
                         id="selectAllActive"
                         class="form-check-input"
                         v-model="selectAllActive"
                         @change="toggleSelectAllActive"
                       />
                       <label for="selectAllActive" class="form-check-label">
                         Select All Active Listings
                       </label>
                     </div>
 
                     <div v-for="listing in activeListings" :key="listing.id" class="form-check">
                       <input
                         type="checkbox"
                         class="form-check-input individualCheckbox mx-3"
                         :id="listing.id"
                         :value="listing.id"
                         v-model="selectedListings"
                       />
                       <label class="form-check-label" :for="listing.id">{{ listing.itemName }}</label>
                     </div>
 
                     <div class="border-bottom pb-1"></div>
 
                     <!-- Inactive Listings -->
                     <p class="pt-3">Inactive Listings</p>
                     <div class="form-check">
                       <input
                         type="checkbox"
                         id="selectAllInactive"
                         class="form-check-input"
                         v-model="selectAllInactive"
                         @change="toggleSelectAllInactive"
                       />
                       <label for="selectAllInactive" class="form-check-label">
                         Select All Inactive Listings
                       </label>
                     </div>
 
                     <div v-for="listing in inactiveListings" :key="listing.id" class="form-check">
                       <input
                         type="checkbox"
                         class="form-check-input individualCheckbox mx-3"
                         :id="listing.id"
                         :value="listing.id"
                         v-model="selectedListings"
                       />
                       <label class="form-check-label" :for="listing.id">{{ listing.itemName }}</label>
                     </div>
                      <div class="d-flex justify-content-end mt-3">
                        <button
                          type="button"
                          class="modal-btn modal-btn-primary"
                          @click="applyDiscountTime"
                        >
                          Apply to Selected Listings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quantity Section -->
              <div class="form-section">
                <div class="row mb-3">
                  <div class="col-md-6 p-2">
                    <label class="form-label">Quantity</label>
                    <input
                      type="number"
                      class="form-control"
                      required
                      v-model.number="editForm.itemQty"
                    />
                  </div>
                </div>
              </div>

              <!-- Allergens Section -->
              <div class="form-section mb-3">
                <label class="form-label">Allergens</label>
                <div class="border rounded p-3 bg-white text-dark checkbox-grid">
                  <div 
                    v-for="allergen in allergenOptions" 
                    :key="allergen" 
                    class="form-check"
                  >
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :id="'allergen-' + allergen"
                      :value="allergen"
                      v-model="editForm.allergens"
                    />
                    <label class="form-check-label" :for="'allergen-' + allergen">
                      {{ allergen }}
                    </label>
                  </div>
                </div>
              </div>

              <!-- Tags Section -->
              <div class="form-section mb-3">
                <label class="form-label">Tags</label>
                <div class="border rounded p-3 bg-white text-dark checkbox-grid">
                  <div 
                    v-for="tag in tagOptions" 
                    :key="tag" 
                    class="form-check"
                  >
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :id="'tag-' + tag"
                      :value="tag"
                      v-model="editForm.tags"
                    />
                    <label class="form-check-label" :for="'tag-' + tag">
                      {{ tag }}
                    </label>
                  </div>
                </div>
              </div>

              <!-- Make Active Toggle -->
              <div class="form-section m-4">
                <div class="form-check form-switch">
                  <input
                    v-model="editForm.makeActive"
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="makeActiveSwitch"
                  />
                  <div>
                    <label class="fw-bold text-dark" for="makeActiveSwitch">
                      {{ editForm.makeActive ? 'Post Listing' : 'Keep Listing as Unlisted' }}
                    </label>
                    <p class="text-secondary mb-0">
                      {{ editForm.makeActive ? 'Listing will be live to customers' : 'Listing will be inactive' }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Error Message -->
              <p v-if="errorMessage" class="text-danger fw-bold text-center">
                {{ errorMessage }}
              </p>

              <!-- Action Buttons -->
              <div class="modal-actions">
                <button
                  type="button"
                  class="modal-btn modal-btn-cancel"
                  @click="closeModal"
                  :disabled="isSubmitting"
                >
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  class="modal-btn modal-btn-primary"
                  :disabled="isSubmitting"
                >
                  <i class="fas" :class="isSubmitting ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                  <span>{{ isSubmitting ? 'Saving...' : 'Save Changes' }}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </transition>
</template>

<script src="./editModal.js"></script>

<style scoped src="./editModal.css">
@import '/src/assets/css/CreateListing.css';
@import '/src/components/hawker/CreateListing/CreateListing.css';
@import '/src/components/hawker/HawkerForm/HawkerForm.css';
</style>