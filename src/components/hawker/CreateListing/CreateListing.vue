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


    <div class="top-header d-flex mx-4 mb-3">
      <button @click="goBack" class="create-listing back-btn mx-4">
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <h2 class="m-0 text-start">Create A New Listing</h2>
      
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

        <!-- Image upload-->
         <div class="p-2">
          <div class="row mb-3 px-md-5">
            <div class="col-md-4 p-0 p-md-4">

              <div id="img-container" class="mb-3 w-100" v-show="selectedFile"> 
                <!-- <p class="text-center text-secondary" v-if="!previewSelectedFileSRC"><i>Image Preview</i></p> -->
                <img id="image" :src="previewSelectedFileSRC"> 
                <span class="remove-btn" v-if="previewSelectedFileSRC" @click="removeFile">
                  <font-awesome-icon icon="remove" class="fa-lg" />
                </span>
              </div>
            
              <div id="uploadImg" @click="$refs.fileInput.click()" class="mb-4 p-2 w-100" style="overflow:hidden;">
                <label for="input-file"><font-awesome-icon icon="upload" class="fa-lg" />
                  <span v-if="!previewSelectedFileSRC"><b>Upload Photo</b></span>
                  <span v-else><b>Change Photo</b></span>
                    <br> by clicking here to browse or drag and drop here </label>
                <input type="file" accept="image/jpeg, image/png, image/jpg" 
                  @change="onFileSelected" ref="fileInput">
              </div>

            </div>
              
            <div class="col-md-8 p-0">
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
                v-model:description="form.description"
              />
            </div>
          </div>
       

        <!-- Price & Discount fields-->
         <div class="p-0">
           <div class="row mb-3 px-md-5">
             <div class="price-input-container col-md-6 p-2">
               <label class="form-label">Original Price</label>
               <input type="number" class="form-control mb-3" style="padding-left:30px" required 
                   step="0.01" v-model.number="form.itemPrice" name="itemPrice">
             </div>
             <div class="col-md-6 p-2">
               <label class="form-label">Discount (%)</label>
               <input type="number" class="form-control mb-3" required 
                   step="0.01" v-model.number="form.discount" name="discount">
             </div>
             <p class="fw-bold">Price after discount: $
               <span v-if="form.itemPrice" class="fw-bold">{{ discountedPrice }}</span>
             </p>
           </div>
         </div>
          
         <div class="p-0">
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
             <!-- This dropdown will appear only if hawker has listings -->
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
                 </div>
             </div>
           </div>
         </div>

        <!-- Quantity field -->
         <div class="p-0">
           <div class="row mb-3 px-md-5">
             <label class="form-label">Quantity</label>
             <div class="col-md-6 p-0 p-md-2">
               <input type="number" class="form-control" required 
                 v-model.number="form.itemQty" name="itemQty">
            </div>
           </div>
         </div>

        <!-- Allergen types checkboxes-->
         <div class="row mb-3 px-md-5 p-0 p-md-2 text-dark">
           <label class="form-label">Allergens</label>
           <div class="border rounded p-3 bg-white col-md-6" style="margin-left:10px">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="Eggs" v-model="form.allergens">
                <label class="form-check-label">Eggs</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="Dairy" v-model="form.allergens">
                <label class="form-check-label">Dairy</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="Fish" v-model="form.allergens">
                <label class="form-check-label">Fish</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="Soy" v-model="form.allergens">
                <label class="form-check-label">Soy</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="Peanuts" v-model="form.allergens">
                <label class="form-check-label">Peanuts</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="Sesame" v-model="form.allergens">
                <label class="form-check-label">Sesame</label>
            </div>
           </div>
         </div>

        <!-- Tags -->
         <div class="row mb-3 px-md-5 p-0 p-md-2 text-dark">
           <label class="form-label">Tags</label>
           <div class="mb-5 border rounded p-3 bg-white col-md-6" style="margin-left:10px">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="Halal" v-model="form.tags">
                <label class="form-check-label">Halal</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="Vegetarian" v-model="form.tags">
                <label class="form-check-label">Vegetarian</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="Seafood" v-model="form.tags">
                <label class="form-check-label">Seafood</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="Dairy-free" v-model="form.tags">
                <label class="form-check-label">Dairy-free</label>
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