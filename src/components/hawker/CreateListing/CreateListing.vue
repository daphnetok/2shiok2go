<template>
  <!-- Alert Box -->
  <transition name="alert-scale">
    <div 
      v-if="alert.show" 
      class="custom-alert-overlay"
      @click.self="alert.type !== 'confirmation' && alert.type !== 'redirect' && closeAlert()"
    >
      <div class="custom-alert-container" :class="alert.type">
        <div class="custom-alert-content">
          <!-- Close Button (top right) -->
          <button 
            v-if="alert.type !== 'confirmation'" 
            class="alert-close-btn-top" 
            @click="closeAlert"
          >
            <i class="fas fa-times"></i>
          </button>

          <!-- Icon Section -->
          <div class="alert-icon-section">
            <div class="alert-icon-circle" :class="alert.type">
              <i 
                class="fas" 
                :class="{
                  'fa-check': alert.type === 'success' || alert.type === 'redirect',
                  'fa-exclamation-triangle': alert.type === 'error',
                  'fa-question': alert.type === 'confirmation'
                }"
              ></i>
            </div>
          </div>

          <!-- Message Section -->
          <div class="alert-message-section">
            <h3 v-if="alert.type === 'success'" class="alert-title">Success!</h3>
            <h3 v-else-if="alert.type === 'error'" class="alert-title">Error</h3>
            <h3 v-else-if="alert.type === 'confirmation'" class="alert-title">Confirm Action</h3>
            <h3 v-else-if="alert.type === 'redirect'" class="alert-title">Listing Created!</h3>
            
            <p class="alert-message">{{ alert.message }}</p>
          </div>

          <!-- Action Buttons Section -->
          <div class="alert-actions">
            <!-- Confirmation Buttons -->
            <div v-if="alert.type === 'confirmation'" class="button-group">
              <button class="alert-btn alert-btn-cancel" @click="confirmationCancel">
                <i class="fas fa-times"></i>
                <span>Cancel</span>
              </button>
              <button 
                v-if="alert.actionType === 'Delete'" 
                class="alert-btn alert-btn-danger" 
                @click="confirmationConfirm"
              >
                <i class="fas fa-trash"></i>
                <span>Delete</span>
              </button>
              <button 
                v-else 
                class="alert-btn alert-btn-primary" 
                @click="confirmationConfirm"
              >
                <i class="fas fa-check"></i>
                <span>Confirm</span>
              </button>
            </div>

            <!-- Redirect Buttons -->
            <div v-else-if="alert.type === 'redirect'" class="button-group-vertical row">
              <div class="p-0">
                <router-link to="/hawker-dashboard">
                  <button class="alert-btn alert-btn-primary alert-btn-large" @click="closeAlert">
                    <i class="fas fa-th-large"></i>
                    <span>View All My Listings</span>
                    <i class="fas fa-arrow-right"></i>
                  </button>
              </router-link>
              </div>
              <div class="p-0 mx-auto">
                <button class="alert-btn alert-btn-secondary alert-btn-large" @click="closeAlert">
                  <i class="fas fa-plus"></i>
                  <span>Create Another Listing</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>


    <div class="top-header d-flex mx-4 mt-3">
      <button @click="goBack" class="create-listing back-btn mx-4">
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <h2 class="m-0 text-start mt-3">Create A New Listing</h2>
      
    </div>
    <!-- <p>Form for hawkers to upload surplus meals.</p>  -->

    <!-- Loading State -->
    <LoadingSpinner v-if="isLoading" message="Loading user information..." container-class="alert alert-info" />

    <!-- Not Logged In Message -->
    <div v-else-if="!currentUser" class="alert alert-danger">
      <h3>🔒 Authentication Required</h3>
      <p>You must be logged in to access this page.</p>
      <p>Please <strong>sign in</strong> or <strong>create an account</strong> to continue.</p>
    </div>

    <!-- Access Denied Message for Non-Hawkers -->
    <div v-else-if="currentUser && !isHawker" class="alert alert-warning">
      <h3>⚠️ Access Denied</h3>
      <p>Only hawkers can create listings. Your current role is: <strong>{{ userRole || 'unknown' }}</strong></p>
      <p>If you believe this is an error, please contact support.</p>
    </div>

    <!-- Listing Form - Only for Hawkers -->
    <div v-else-if="isHawker" class="form-bg text-dark">
      <form id="form" @submit.prevent="onSubmit">
        <div class="mx-5 py-3">

        <!-- Images Section -->
         <div class="p-2 section-card">
          <h3 class="section-title">Image</h3>
          <div class="row mb-3 px-md-5">
            <div class="col-md-5 p-0 p-md-4">
              <div class="uploader-card">
                <div class="uploader-drop" 
                  @click="$refs.fileInput.click()" 
                  @dragover.prevent 
                  @drop.prevent="onFileDrop">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <p class="m-0"><b>Upload Photo</b></p>
                  <small>Click to browse or drag file here.</small>
                  <input type="file" accept="image/jpeg, image/png, image/jpg"
                    @change="onFileSelected" ref="fileInput">
                </div>
                <small v-if="imageError" class="text-danger d-block mt-2">{{ imageError }}</small>
              </div>

              <div class="photos-region mt-3" v-if="previewImageUrl">
                <div class="photos-region-header">
                  <span class="photos-title">Your Photo</span>
                </div>
                <div class="thumbs-grid">
                  <div class="thumb-item">
                    <img :src="previewImageUrl" alt="preview">
                    <button type="button" class="thumb-remove" @click="removeFile">
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>
              
            <div class="col-md-7 p-0">
              <!-- Item Name field -->
              <div class="mb-3">
                <label for="itemName" class="form-label">Item Name</label>
                <input
                  type="text"
                  id="itemName"
                  class="form-control"
                  v-model="form.itemName"
                  placeholder="Enter food name"
                />
                <small v-if="itemNameError" class="text-danger">{{ itemNameError }}</small>
              </div>

              <!-- AI Food Description Component -->
              <AIFoodDescription 
                :selectedFile="selectedFile"
                :foodName="form.itemName"
                :imageUrl="previewImageUrl"
                v-model:description="form.description"
              />
            </div>
          </div>
         </div>

        <!-- Pricing & Discount Section -->
         <div class="p-2 section-card">
           <h3 class="section-title">Pricing & Discount</h3>
           <div class="row mb-3 px-md-5">
             <div class="price-input-container col-md-6 p-2">
               <label class="form-label">Original Price</label>
              <div class="input-with-prefix mb-1" :class="{ 'field-error': priceError }">
                <input type="number" class="form-control" required 
                    step="0.01" v-model.number="form.itemPrice" name="itemPrice">
              </div>
               <small v-if="priceError" class="text-danger emphasized">{{ priceError }}</small>
             </div>
             <div class="col-md-6 p-2">
               <label class="form-label">Discount (%)</label>
                <input type="number" class="form-control mb-1" :class="{ 'field-error': discountError }" required 
                   step="0.01" v-model.number="form.discount" name="discount">
                <small v-if="discountError" class="text-danger emphasized">{{ discountError }}</small>
             </div>
             <p v-if="showDiscountedPrice" class="fw-bold m-0">Price after discount: $
               <span class="fw-bold">{{ discountedPrice }}</span>
             </p>
           </div>
         </div>
          
        <!-- Scheduling Section -->
         <div class="p-2 section-card">
           <h3 class="section-title">Scheduling</h3>
           <div class="row mb-3 px-md-5">
             <!-- Time of discount -->
             <div class="col-md-6 p-2">
               <label class="form-label">Set Discount Start Time</label>
               <input
                 type="time"
                 class="form-control"
                 v-model="form.discountTime"
                 required
               >
             </div>
             <!-- Apply to listings -->
             <div class="col-md-6 p-2" v-if="userListings">
                 <label class="form-label">Apply Discount Start Time To</label>
 
                 <div class="border rounded p-3 bg-white text-dark">
                     <!-- Select All checkbox -->
                     <div class="form-check border-bottom pb-2">
                       <input
                         type="checkbox"
                         id="selectAll"
                         class="form-check-input"
                         v-model="selectAll"
                         @change="toggleSelectAll"
                       />
                       <label for="selectAll" class="form-check-label fw-bold">
                         All My Listings
                       </label>
                     </div>
                     <!-- Active Listings -->
                     <div class="pt-3">
                       <p class="m-0 fw-bold text-success">Active Listings</p>
                       <div v-if="activeListings && activeListings.length > 0">
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
                       </div>
                       <p v-else class="text-muted small m-0">No active listings</p>
                     </div>

                     <div class="border-top my-2"></div>

                     <!-- Inactive Listings -->
                     <div class="pt-2">
                       <p class="m-0 fw-bold text-secondary">Inactive Listings</p>
                       <div v-if="inactiveListings && inactiveListings.length > 0">
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
                       </div>
                       <p v-else class="text-muted small m-0">No inactive listings</p>
                     </div>
                 </div>
             </div>
           </div>
         </div>

        <!-- Quantity field -->
         <!-- Inventory & Tags Section -->
         <div class="p-2 section-card">
           <h3 class="section-title heading-strong">Inventory & Tags</h3>
           <div class="row mb-3 px-md-5">
             <label class="form-label">Quantity</label>
            <div class="col-md-6 p-0 p-md-2">
              <input type="number" class="form-control" :class="{ 'field-error': qtyError }" required 
                 v-model.number="form.itemQty" name="itemQty">
             <small v-if="qtyError" class="text-danger emphasized">{{ qtyError }}</small>
            </div>
           </div>
           <!-- Allergens + Tags side by side -->
           <div class="row mb-3 px-md-5 text-dark align-items-start">
             <div class="col-md-6 col-12 pe-md-3 order-md-1">
               <label class="form-label heading-strong fw-bold">Allergens</label>
               <div>
                 <div class="form-check" v-for="opt in ['Eggs','Dairy','Fish','Soy','Peanuts','Sesame']" :key="opt">
                   <input class="form-check-input" type="checkbox" :value="opt" v-model="form.allergens" :id="'allergen-'+opt">
                   <label class="form-check-label" :for="'allergen-'+opt">{{ opt }}</label>
                 </div>
               </div>
             </div>
             <div class="col-md-6 col-12  ps-md-3 mt-3 mt-md-0 order-md-2">
               <label class="form-label heading-strong fw-bold">Tags</label>
                 <div class="form-check" v-for="tag in ['Halal','Vegetarian','Seafood','Dairy-free']" :key="tag">
                   <input class="form-check-input" type="checkbox" :value="tag" v-model="form.tags" :id="'tag-'+tag">
                   <label class="form-check-label" :for="'tag-'+tag">{{ tag }}</label>
                 </div>
             </div>
           </div>
         </div>

        <!-- Make Active Toggle Switch -->
         <div class="row mb-3 px-md-5 p-0 p-md-2" style="margin-left:10px">
           <div class="form-check form-switch mb-3">
             <input v-model="form.makeActive" class="form-check-input" 
               type="checkbox" value="toList" role="switch">
   
             <!-- Description -->
             <div v-if="form.makeActive">
               <label class="fw-bold text-dark">Post Listing</label>
             <p class="text-secondary">Current listing will be live to customers</p>
             </div>
             <div v-else>
               <label class="fw-bold text-dark">Keep Listing as Unlisted</label>
               <p class="text-secondary">Current listing will be inactive</p>
             </div>
           </div>
         </div>

        <br>
        <br>
        <div class="row px-md-5 p-0 p-md-2">
          <button class="btn-primary mb-5" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Uploading...' : 'Confirm' }}
          </button>
        </div>
        <p v-if="errorMsg" class="fw-bold text-danger">
          {{ errorMsg }}
        </p>
        <p v-if="successMsg" class="fw-bold text-success">
          {{ successMsg }}
        </p>
        </div>
      </form>
    </div>
</template>

<script src="./CreateListing.js">
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
export default {
  name: "CreateAListing"
}
</script>

<style scoped>
@import '/src/assets/css/CreateListing.css';
@import './CreateListing.css';
@import '/src/assets/css/alertBoxes.css';
</style>