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

          <div>
            <div class="row">
              <!-- Left column: Image -->
              <div class="col-md-4">
                <!-- Image upload -->
                <div id="img-container" class="container mb-3" v-if="previewImageUrl">
                  <img :src="previewImageUrl" alt="Preview" class="img-fluid rounded shadow-sm">
                  <span class="remove-btn" @click="removeNewImage">
                    <i class="fas fa-times"></i>
                  </span>
                </div>
  
                <div id="uploadImg" @click="$refs.fileInput.click()" class="mb-4 text-center border p-3 rounded bg-light">
                  <label>
                    <i class="fas fa-upload mb-2"></i><br>
                    <b>{{ newImageFile ? 'Change Photo' : (previewImageUrl ? 'Change Photo' : 'Upload Photo') }}</b>
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg, image/png, image/jpg"
                    @change="onFileSelected"
                    ref="fileInput"
                    style="display: none;"
                  />
                </div>
              </div>
  
              <!-- Right column: Input fields -->
              <div class="col-md-8">
                <!-- Item Name -->
                <label class="form-label">Item Name</label>
                <input
                  type="text"
                  class="form-control mb-3"
                  required
                  v-model="editForm.itemName"
                  placeholder="Type food name here"
                />
  
                <!-- AI Description -->
                <AIFoodDescription
                  v-model:description="editForm.description"
                  :selectedFile="newImageFile"
                  :foodName="editForm.itemName"
                  :imageUrl="previewImageUrl"
                />
            </div>
          </div>
          
          <div class="row mx-4">
            <!-- Price & Discount -->
            <div class="row mb-3">
              <div class="col">
                <label class="form-label">Original Price</label>
                <input
                  type="number"
                  class="form-control"
                  required
                  step="0.01"
                  v-model.number="editForm.itemPrice"
                />
              </div>
              <div class="col">
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

            <div class="mb-3">
              <p>Price after discount: $
                <span v-if="editForm.itemPrice && editForm.discount">
                  {{ calculatedDiscountedPrice }}
                </span>
              </p>
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <!-- Discount Start Time -->
                <label class="form-label">Set Discount Start Time</label>
                <input
                  type="time"
                  class="form-control mb-3"
                  required
                  v-model="editForm.discountTime"
                />
              </div>
                <!-- Apply Discount to Other Listings -->
                <div class="col-md-6 mb-4" v-if="userListings">
                  <label class="form-label">Apply Discount Start Time To</label>
                  <div class="border rounded p-2 bg-white text-dark">
                    <!-- Select All -->
                    <div class="form-check">
                      <input
                        type="checkbox"
                        id="selectAll"
                        class="form-check-input"
                        v-model="selectAll"
                        @change="toggleSelectAll"
                      />
                      <label for="selectAll" class="form-check-label">All My Listings</label>
                    </div>
  
                    <!-- Individual Listings -->
                    <div
                      v-for="listing in userListings"
                      :key="listing.id"
                      class="form-check"
                    >
                      <input
                        type="checkbox"
                        class="form-check-input individualCheckbox"
                        :id="listing.id"
                        :value="listing.id"
                        v-model="selectedListings"
                      />
                      <label class="form-check-label" :for="listing.id">
                        {{ listing.itemName }}
                      </label>
                    </div>
                  </div>
                </div>
            </div>
            
            <div class="mb-3">
              <!-- Quantity -->
              <label class="form-label">Quantity</label>
              <input
                type="number"
                class="form-control mb-3 w-50"
                required
                v-model.number="editForm.itemQty"
              />
            </div>

            <!-- Allergens -->
             <div class="mb-3">
               <label class="form-label">Allergens</label>
               <div class="mb-3">
                 <div v-for="allergen in allergenOptions" :key="allergen">
                   <input type="checkbox" :value="allergen" v-model="editForm.allergens" />
                   <label class="text-dark">{{ allergen }}</label>
                 </div>
               </div>
             </div>

            <!-- Tags -->
             <div class="mb-3">
               <label class="form-label">Tags</label>
               <div class="mb-3">
                 <div v-for="tag in tagOptions" :key="tag">
                   <input type="checkbox" :value="tag" v-model="editForm.tags" />
                   <label class="text-dark">{{ tag }}</label>
                 </div>
               </div>
             </div>

            <!-- Make Active Toggle -->
            <div class="form-check form-switch mb-3 mx-2">
              <input
                v-model="editForm.makeActive"
                class="form-check-input"
                type="checkbox"
                role="switch"
              />
              <label class="fw-bold text-dark">
                {{ editForm.makeActive ? 'Post Listing' : 'Keep Listing as Unlisted' }}
              </label>
              <p class="text-secondary">
                {{ editForm.makeActive ? 'Listing will be live to customers' : 'Listing will be inactive' }}
              </p>
            </div>

            <!-- Buttons -->
            <div class="button-group m-0 w-100">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeModal"
                :disabled="isSubmitting"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-success"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>

            <p v-if="errorMessage" class="text-danger mt-2">{{ errorMessage }}</p>
          </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script src="./editModal.js"></script>

<style src="./editModal.css"></style>