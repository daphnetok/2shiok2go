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
            placeholder="Type food name here" v-model="itemName" name="itemName">

        <!-- Price & Discount fields-->
        <div class="row mb-3">
          
          <div class="price-input-container col">
            <label class="form-label">Original Price</label>
            <input type="number" class="form-control mb-3 price-input" required 
                placeholder="0.00" v-model="itemPrice" name="itemPrice">
          </div>
          <div class="col">
            <label class="form-label">Discount (%)</label>
            <input type="number" class="form-control mb-3" required 
                placeholder="" v-model="discount" name="discount">
          </div>

          <p>Price after discount: $
            <span v-if="itemPrice">{{ discountedPrice }}</span>
          </p>

        </div>


        <!-- Quantity field -->
        <label class="form-label">Quantity</label>
        <input type="number" class="form-control mb-3 w-50" required 
            placeholder="0" v-model="itemQty" name="itemQty">


        <!-- Allergen types checkboxes-->
        <label class="form-label">Allergens (select all that apply)</label>
        <div class="mb-3">
          <input type="checkbox" value="Eggs" v-model="allergens">
            <label>Eggs</label>
          <br>
          <input type="checkbox" value="Diary" v-model="allergens">
            <label>Diary</label>
          <br>
          <input type="checkbox" value="Fish" v-model="allergens" >
            <label>Fish</label>
          <br>
          <input type="checkbox" value="Soy" v-model="allergens">
            <label>Soy</label>
          <br>
          <input type="checkbox" value="Peanuts" v-model="allergens">
            <label>Peanuts</label>
          <br>
          <input type="checkbox" value="Sesame" v-model="allergens" >
            <label>Sesame</label>
          <br>
        </div>

        <!-- Tags -->
        <label class="form-label">Tags</label>
        <div class="mb-5">
          <input type="checkbox" value="Halal" v-model="tags" >
            <label>Halal</label>
          <br>
          <input type="checkbox" value="Vegetarian" v-model="tags">
            <label>Vegetarian</label>
          <br>
          <input type="checkbox" value="Seafood" v-model="tags" >
            <label>Seafood</label>
          <br>
          <input type="checkbox" value="Diary-free" v-model="tags">
            <label>Diary-free</label>
          <br>
        </div>

        <!-- Make Active Toggle Switch -->
        <div class="form-check form-switch mb-3">
          <input v-model="makeActive" class="form-check-input" 
            type="checkbox" value="toList" role="switch">

          <!-- Description -->
          <div v-if="makeActive">
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
        <button class="form-control btn btn-success mb-3" type="submit">Confirm</button>
         <p id="errorMsg" class="fw-bold text-danger"></p>
        
    </div>
  </div>
  </form>


  <!-- To work on: filtering listings based on active & non-active -->
  <h2>Home</h2>
  <div class="container mt-4">
    <div class="row active mb-5">
      <h2>Active Listings</h2>
      <table class="align-middle">
        <tbody>
          <tr v-for="listingObj of this.allCreatedListings" :key="listingObj" class="border-bottom">
            <div class="list-img-container container">
              <td scope="row"><img :src="getImg(listingObj.get('image').name)" class="object-fit-cover rounded col-1"></td>
            </div>
            <td scope="row" class="col-5">{{ listingObj.get('itemName') }}</td>
            <td scope="row"><s>${{ listingObj.get('itemPrice') }}</s></td>
            <td scope="row">${{ listingObj.get('discountedPrice') }}</td>
            <td scope="row">Stock: {{ listingObj.get('itemQty') }}</td>
            <td scope="row">Orders: 0</td>
            <td><button class="btn p-0"><font-awesome-icon icon="edit" class="fa-lg"/></button></td>
            <td><button class="btn p-0"><font-awesome-icon icon="copy" class="fa-lg"/></button></td>
            <td><button class="btn p-0"><font-awesome-icon icon="circle-minus" class="fa-lg"/></button></td>
          </tr>
        </tbody>
      </table>
      
    </div>

    <div class="row non-active mb-5">
      <h2 class="text-secondary">Non-Active Listings</h2>

    </div>
  </div>


  </div>
</template>

<script>
// import axios from "axios"; 

export default { 
  name: "CreateListing",
  data(){
    return {
      itemName : "",
      itemPrice : "",
      discount: "",
      itemQty : "",
      allergens : [],
      tags: [],
      selectedFile: null,
      previewSelectedFileSRC: "",
      makeActive: false,
      allCreatedListings: [],

    }      
  }, 
  methods:{
    onFileSelected(event) {
      this.selectedFile = event.target.files[0];

      //create object url for image
      // console.log(this.previewSelectedFileSRC)
      this.previewSelectedFileSRC = URL.createObjectURL(this.selectedFile);
    },
    //removes file preview
    removeFile(event){
      this.previewSelectedFileSRC = "";
      this.selectedFile= "";
    },

    onSubmit(event){
      if (!this.selectedFile){
        var err= document.getElementById("errorMsg");
        err.textContent= "* You must upload a photo"
      }
      else{
        var err= document.getElementById("errorMsg");
        err.textContent= "";

        //send form details
        const form = document.getElementById('form');
        const formData= new FormData(form);
        formData.append("discountedPrice", this.discountedPrice);
        formData.append("allergens", this.allergens); //this.allergens is an object.
        formData.append("tags", this.tags); //this.tags is an object. example: {0: 'Halal', 1: 'Seafood'}
        formData.append("image", this.selectedFile, this.selectedFile.name);
        formData.append("makeActive", this.makeActive);
        
        

        // TO WORK ON: send form data to firebase storage
        // axios.post("", formData) //url of firebase end point http function
        // .then(res => {
        //   console.log(res) //should show status 200 if sent to firebase successfully
        // })

        
        // TEMP
        this.allCreatedListings.push(formData);

        //check formData 
        // for (const item of formData){
        //   console.log(item[0], item[1])
        // }
        // or
        // for (var listingObj of this.allCreatedListings){
        //   for (const [key, value] of listingObj.entries()){
        //     console.log(key, value)
        //   }
        // }

      }
    },
    //TEMP, use an img avail in /src/assets/img/
    getImg(img_name){
      return "/src/assets/img/" + img_name;
    },

  },
  computed:{
    discountedPrice(){
      const price = Number(this.itemPrice);
      const discount = Number(this.discount);

      if (isNaN(price)|| isNaN(discount)) return '';
      var finalPrice = price- (price * discount)/100;

      if (discount>100) finalPrice= 0;

      return finalPrice.toFixed(2);
    }
  }
  };
</script>

<style src="/src/assets/css/CreateListing.css"></style>
