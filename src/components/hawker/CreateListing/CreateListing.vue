<template>
  <div class="container mt-4">
    <!-- <h2>Create Listing</h2>
    <p>Form for hawkers to upload surplus meals.</p> -->

    <form id="form" @submit.prevent="onSubmit">
    <div class="row">
      
      <!-- Image upload-->
       <div class="col-md-4">

        <div id="img-container" class="container mb-3" v-show="selectedFile"> 
          <!-- <p class="text-center text-secondary" v-if="!previewSelectedFileSRC"><i>Image Preview</i></p> -->
          <img id="image" :src="previewSelectedFileSRC"> 
          <span class="remove-btn" v-if="previewSelectedFileSRC" @click="removeFile">
            <font-awesome-icon icon="remove" class="fa-lg" />
          </span>
        </div>
       
        <div id="uploadImg" @click="$refs.fileInput.click()" class="mb-4">
          <label for="input-file"><font-awesome-icon icon="upload" class="fa-lg" />
            <b>Upload Photo</b> <br> by browsing or <br> drag and drop here </label>
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
                step="0.01" min="0" v-model.number="form.itemPrice" name="itemPrice">
          </div>
          <div class="col">
            <label class="form-label">Discount (%)</label>
            <input type="number" class="form-control mb-3" required 
                step="0.01" max="99" v-model.number="form.discount" name="discount">
          </div>

          <p>Price after discount: $
            <span v-if="form.itemPrice">{{ discountedPrice }}</span>
          </p>

        </div>


        <!-- Quantity field -->
        <label class="form-label">Quantity</label>
        <input type="number" class="form-control mb-3 w-50" required 
            min="0" v-model.number="form.itemQty" name="itemQty">


        <!-- Allergen types checkboxes-->
        <label class="form-label">Allergens (select all that apply)</label>
        <div class="mb-3">
          <input type="checkbox" value="Eggs" v-model="form.allergens">
            <label>Eggs</label>
          <br>
          <input type="checkbox" value="Diary" v-model="form.allergens">
            <label>Diary</label>
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
          <input type="checkbox" value="Diary-free" v-model="form.tags">
            <label>Diary-free</label>
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
            <label class="fw-bold">Unlist</label>
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


  <!-- active listings -->
  <h2>Home</h2>
  <div class="container mt-4">
    <div class="row active mb-5">
      <h2>Active Listings</h2>
      <p v-if="activeListings.length === 0" class="text-secondary">No active listings yet</p>
      <table class="align-middle" v-else>
        <tbody>
          <tr v-for="listing of activeListings" :key="listing.id" class="border-bottom">
            <div class="list-img-container container">
              <td scope="row">
                <img :src="listing.imageUrl" class="object-fit-cover rounded col-1" alt="Listing image">
              </td>
            </div>
            <td scope="row" class="col-5">{{ listing.itemName }}</td>
            <td scope="row"><s>${{ listing.itemPrice }}</s></td>
            <td scope="row">${{ listing.discountedPrice }}</td>
            <td scope="row">Stock: {{ listing.itemQty }}</td>
            <td scope="row">Orders: {{ listing.orders || 0 }}</td>
            <td><button class="btn p-0" @click="editListing(listing.id)">
              <font-awesome-icon icon="edit" class="fa-lg"/>
            </button></td>
            <td><button class="btn p-0" @click="duplicateListing(listing)">
              <font-awesome-icon icon="copy" class="fa-lg"/>
            </button></td>
            <td><button class="btn p-0" @click="deactivateListing(listing.id)">
              <font-awesome-icon icon="circle-minus" class="fa-lg"/>
            </button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- inactive listings -->
    <div class="row non-active mb-5">
      <h2 class="text-secondary">Non-Active Listings</h2>
      <p v-if="inactiveListings.length === 0" class="text-secondary">No inactive listings</p>
      <table class="align-middle" v-else>
        <tr v-for="listing in inactiveListings" :key="listing.id" class="border-bottom">
          <div class="list-img-container container">
            <td scope="row">
              <img :src="listing.imageUrl" class="object-fit-cover rounded col-1" alt="Listing image"></img>
            </td>
          </div>
          <td scope="row" class="col-5">{{ listing.itemName }}</td>
          <td scope="row"><s>${{ listing.itemPrice }}</s></td>
          <td scope="row">${{ listing.discountedPrice }}</td>
          <td scope="row">Stock: {{ listing.itemQty }}</td>
          <td><button class="btn p-0 btn-success" @click="activateListing(listing.id)">
            <font-awesome-icon icon="circle-plus" class="fa-lg"/>
          </button></td>
          <td><button class="btn p-0 btn-danger" @click="deleteListingWithImage(listing.id, listing.imagePath)">
            <font-awesome-icon icon="trash" class="fa-lg"/>
          </button></td>
        </tr>
      </table>

    </div>
  </div>


  </div>
</template>

<script src="./CreateListing.js">
export default {
  name: "CreateAListing"
}
</script>

<style src="/src/assets/css/CreateListing.css"></style>
