<template>
  <div class="container mt-4">
     <!-- Alert Box -->
    <div class="custom-alert-container" v-if="alert.show" :class="alert.type">
      <div class="custom-alert-content">
        <!-- Icon for success/error -->
        <span class="alert-icon" v-if="alert.type === 'success'">
          <i class="fas fa-check-circle"></i>
        </span>
        <span class="alert-icon" v-else-if="alert.type === 'error'">
          <i class="fas fa-exclamation-circle"></i>
        </span>
        <!-- Message -->
        <div class="alert-message-wrapper">
          <h5 class="alert-message" style="white-space: pre-wrap;">{{ alert.message }}</h5>
        </div>
        <br>
        <!-- Confirmation Buttons -->
        <div v-if="alert.type === 'confirmation'" class="confirmation-buttons">
          <button class="btn-cancel" @click="confirmationCancel">Cancel</button>
          <button v-if="alert.actionType === 'delete'" class="btn-delete" @click="confirmationConfirm">Delete</button>
          <button v-else class="btn-confirm" @click="confirmationConfirm">Confirm</button>
        </div>
        <!-- Redirect Buttons -->
        <div v-else-if="alert.type === 'redirect'" class="confirmation-buttons">
          <button class="btn-cancel" @click="createNewListing">+ Create Another Listing</button>
          <router-link to="/hawker-dashboard" class="btn-confirm" @click="goToHome">
            View All Listings →
          </router-link>
        </div>
        <!-- Close Button -->
        <button v-else class="alert-close-btn" @click="closeAlert">
          <i class="fas fa-times"></i>
        </button>
      </div>
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
        <div class="row">

        <!-- Image upload-->
       <div class="col-md-4">

        <div id="img-container" class="container mb-3" v-show="selectedFile"> 
          <!-- <p class="text-center text-secondary" v-if="!previewSelectedFileSRC"><i>Image Preview</i></p> -->
          <img id="image" :src="previewSelectedFileSRC"> 
          <span class="remove-btn" v-if="previewSelectedFileSRC" @click="removeFile">
            <font-awesome-icon icon="remove" class="fa-lg icon-green" />
          </span>
        </div>
       
        <div id="uploadImg" @click="$refs.fileInput.click()" class="mb-4">
          <label for="input-file"><font-awesome-icon icon="upload" class="fa-lg green" />
            <span v-if="!previewSelectedFileSRC" class="green"><b>Upload Photo (1)</b></span>
            <span v-else class="green"><b>Change Photo (1)</b></span>
              <br> by clicking here to browse or <br> drag and drop here </label>
          <input type="file" accept="image/jpeg, image/png, image/jpg" 
            @change="onFileSelected" ref="fileInput">
        </div>

       </div>
        
        <div class="col-md-8 px-md-5">

        <!-- Item Name field -->
        <label class="form-label">Item Name</label>
        <input type="text" class="form-control mb-3" required 
            placeholder="Type food name here" v-model="form.itemName" name="itemName">

        <!-- Price & Discount fields-->
        <div class="row mb-3">
            <div class="price-input-container col">
              <label class="form-label">Original Price</label>
              <input type="number" class="form-control mb-3 price-input" required 
                  step="0.01" v-model.number="form.itemPrice" name="itemPrice">
            </div>
            <div class="col">
              <label class="form-label">Discount (%)</label>
              <input type="number" class="form-control mb-3" required 
                  step="0.01" v-model.number="form.discount" name="discount">
            </div>
          </div>
          

          <div>
              <p>Price after discount: $
                <span v-if="form.itemPrice">{{ discountedPrice }}</span>
              </p>
            <!-- Smart discount suggestion -->
              <span class="green-bg w-50 mb-3"><font-awesome-icon icon="wand-magic-sparkles" class="fa-lg green p-2"/>
                Smart Discount Suggestion: <b>20%</b>
              </span>
          </div>

        <!-- Quantity field -->
        <label class="form-label">Quantity</label>
        <input type="number" class="form-control mb-3 w-50" required 
           v-model.number="form.itemQty" name="itemQty">

        <!-- Allergen types checkboxes-->
        <label class="form-label">Allergens (select all that apply)</label>
        <div class="mb-3">
          <input type="checkbox" value="Eggs" v-model="form.allergens">
            <label>Eggs</label>
          <br>
          <input type="checkbox" value="Dairy" v-model="form.allergens">
            <label>Dairy</label>
          <br>
          <input type="checkbox" value="Fish" v-model="form.allergens" >
            <label>Fish</label>
          <br>
          <input type="checkbox" value="Soy" v-model="form.allergens">
            <label>Soy</label>
          <br>
          <input type="checkbox" value="Peanuts" v-model="form.allergens">
            <label>Peanuts</label>
          <br>
          <input type="checkbox" value="Sesame" v-model="form.allergens" >
            <label>Sesame</label>
          <br>
        </div>

        <!-- Tags -->
        <label class="form-label">Tags</label>
        <div class="mb-5">
          <input type="checkbox" value="Halal" v-model="form.tags" >
            <label>Halal</label>
          <br>
          <input type="checkbox" value="Vegetarian" v-model="form.tags">
            <label>Vegetarian</label>
          <br>
          <input type="checkbox" value="Seafood" v-model="form.tags" >
            <label>Seafood</label>
          <br>
          <input type="checkbox" value="Dairy-free" v-model="form.tags">
            <label>Dairy-free</label>
          <br>
        </div>

        <!-- Make Active Toggle Switch -->
        <div class="form-check form-switch mb-3">
          <input v-model="form.makeActive" class="form-check-input" 
            type="checkbox" value="toList" role="switch">

          <!-- Description -->
          <div v-if="form.makeActive">
            <label class="fw-bold">Post Listing</label>
          <p class="text-secondary">Current listing will be live to customers</p>
          </div>

          <div v-else>
            <label class="fw-bold">Keep Listing as Unlisted</label>
            <p class="text-secondary">Current listing will be inactive</p>
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
export default {
  name: "CreateAListing"
}
</script>

<style src="/src/assets/css/CreateListing.css"></style>