<template>
  <div class="container mt-4">
     <!-- Backdrop Overlay -->
  <transition name="backdrop-fade">
    <div 
      v-if="alert.show" 
      class="alert-backdrop"
      @click="handleBackdropClick"
    ></div>
  </transition>

  <!-- Alert Box -->
  <transition name="alert-scale">
    <div 
      v-if="alert.show" 
      class="custom-alert-container" 
      :class="alert.type"
    >
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
                'fa-check': alert.type === 'success',
                'fa-exclamation': alert.type === 'error',
                'fa-question': alert.type === 'confirmation',
                'fa-info': alert.type === 'redirect'
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
            <button class="btn-secondary" @click="confirmationCancel">
              <i class="fas fa-times"></i>
              <span>Cancel</span>
            </button>
            <button 
              v-if="alert.actionType === 'Delete'" 
              class="btn-danger" 
              @click="confirmationConfirm"
            >
              <i class="fas fa-trash"></i>
              <span>Delete</span>
            </button>
            <button 
              v-else 
              class="btn-primary" 
              @click="confirmationConfirm"
            >
              <i class="fas fa-check"></i>
              <span>Confirm</span>
            </button>
          </div>

          <!-- Redirect Buttons -->
          <div v-else-if="alert.type === 'redirect'" class="button-group-vertical">
            <button class="btn-primary-large" @click="goToHome">
              <i class="fas fa-th-large"></i>
              <span>View All My Listings</span>
              <i class="fas fa-arrow-right"></i>
            </button>
            <button class="btn-secondary-outline" @click="createNewListing">
              <i class="fas fa-plus"></i>
              <span>Create Another Listing</span>
            </button>
          </div>

          <!-- Success/Error Close Button -->
          <button 
            v-else 
            class="btn-close-primary" 
            @click="closeAlert"
          >
            <span>Got it</span>
            <i class="fas fa-check"></i>
          </button>
        </div>
      </div>
    </div>
  </transition>


    <div class="top-header mx-3">
      <button @click="goBack" class="back-btn">
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <h2 class="m-0">Create A New Listing</h2>
      
    </div>
    <!-- <p>Form for hawkers to upload surplus meals.</p>  -->

    <!-- Loading State -->
    <div v-if="isLoading" class="alert alert-info">
      <p>Loading user information...</p>
    </div>

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
    <div v-else-if="isHawker">
      <form id="form" @submit.prevent="onSubmit">
        <div class="row mx-3 py-4">

        <!-- Image upload-->
         <div class="row">
            <div class="col-md-4">

              <div id="img-container" class="container mb-3" v-show="selectedFile"> 
                <!-- <p class="text-center text-secondary" v-if="!previewSelectedFileSRC"><i>Image Preview</i></p> -->
                <img id="image" :src="previewSelectedFileSRC"> 
                <span class="remove-btn" v-if="previewSelectedFileSRC" @click="removeFile">
                  <font-awesome-icon icon="remove" class="fa-lg" />
                </span>
              </div>
            
              <div id="uploadImg" @click="$refs.fileInput.click()" class="mb-4 p-2" style="width:90%">
                <label for="input-file"><font-awesome-icon icon="upload" class="fa-lg" />
                  <span v-if="!previewSelectedFileSRC" class="green"><b>Upload Photo</b></span>
                  <span v-else class="green"><b>Change Photo</b></span>
                    <br> by clicking here to browse or drag and drop here </label>
                <input type="file" accept="image/jpeg, image/png, image/jpg" 
                  @change="onFileSelected" ref="fileInput">
              </div>

            </div>
              
            <div class="col-md-8 px-md-5">
              <!-- Item Name field -->
              <label class="form-label">Item Name</label>
              <input type="text" class="form-control mb-4" required 
                  placeholder="Type food name here" v-model="form.itemName" name="itemName">

              <!-- AI Food Description Component -->
              <AIFoodDescription 
                :selectedFile="selectedFile"
                :foodName="form.itemName"
                v-model:description="form.description"
              />
            </div>
       

        <!-- Price & Discount fields-->
        <div class="row mb-3 px-4">
          <div class="price-input-container col">
            <label class="form-label">Original Price</label>
            <input type="number" class="form-control mb-3" style="padding-left:30px" required 
                step="0.01" v-model.number="form.itemPrice" name="itemPrice">
          </div>
          <div class="col">
            <label class="form-label">Discount (%)</label>
            <input type="number" class="form-control mb-3" required 
                step="0.01" v-model.number="form.discount" name="discount">
          </div>
          <p class="fw-bold">Price after discount: $
            <span v-if="form.itemPrice" class="fw-bold">{{ discountedPrice }}</span>
          </p>
        </div>
          

          <div class="row mb-3 px-4">
            <!-- Time of discount -->
            <div class="col-md-6">
              <label class="form-label">Set Discount Start Time</label>
              <input
                type="time"
                class="form-control"
                v-model="form.discountTime"
                required
              >
            </div>
            <!-- This dropdown will appear only if hawker has listings -->
            <div class="col-md-6" v-if="userListings">
                <label class="form-label">Apply Discount Start Time To</label>

                <div class="border rounded p-3 bg-white text-dark">
                    <!-- Select All checkbox -->
                    <div class="form-check">
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

                    <!-- Individual listings checkboxes -->
                    <div v-for="listing in userListings"
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

        <!-- Quantity field -->
         <div class="row mb-5 px-4">
           <div class="col-md-6">
             <label class="form-label">Quantity</label>
             <input type="number" class="form-control" required 
               v-model.number="form.itemQty" name="itemQty">
          </div>
         </div>

        <!-- Allergen types checkboxes-->
         <div class="row mb-3 px-4">
           <label class="form-label">Allergens</label>
           <div class="border rounded p-3 bg-white" style="margin-left:10px; width:451px">
             <input type="checkbox" value="Eggs" v-model="form.allergens">
               <label class="text-dark">Eggs</label>
             <br>
             <input type="checkbox" value="Dairy" v-model="form.allergens">
               <label class="text-dark">Dairy</label>
             <br>
             <input type="checkbox" value="Fish" v-model="form.allergens" >
               <label class="text-dark">Fish</label>
             <br>
             <input type="checkbox" value="Soy" v-model="form.allergens">
               <label class="text-dark">Soy</label>
             <br>
             <input type="checkbox" value="Peanuts" v-model="form.allergens">
               <label class="text-dark">Peanuts</label>
             <br>
             <input type="checkbox" value="Sesame" v-model="form.allergens" >
               <label class="text-dark">Sesame</label>
             <br>
           </div>
         </div>

        <!-- Tags -->
         <div class="row mb-3 px-4">
           <label class="form-label">Tags</label>
           <div class="mb-5 border rounded p-3 bg-white" style="margin-left:10px; width:451px">
             <input type="checkbox" value="Halal" v-model="form.tags" >
               <label class="text-dark">Halal</label>
             <br>
             <input type="checkbox" value="Vegetarian" v-model="form.tags">
               <label class="text-dark">Vegetarian</label>
             <br>
             <input type="checkbox" value="Seafood" v-model="form.tags" >
               <label class="text-dark">Seafood</label>
             <br>
             <input type="checkbox" value="Dairy-free" v-model="form.tags">
               <label class="text-dark">Dairy-free</label>
             <br>
           </div>
         </div>

        <!-- Make Active Toggle Switch -->
         <div class="row mb-3 px-4 " style="margin-left:10px">
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
        <button class="form-control btn btn-success mb-3" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Uploading...' : 'Confirm' }}
        </button>
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
  </div>
</template>

<script src="./CreateListing.js">
import HawkerForm from '../HawkerForm/HawkerForm.js';


export default {
  name: "CreateAListing"
}
</script>

<style src="/src/assets/css/CreateListing.css"></style>