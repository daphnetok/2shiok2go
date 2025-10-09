<template>
  <div class="container mt-4">
    <!-- <h2>Create Listing</h2>
    <p>Form for hawkers to upload surplus meals.</p> -->

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
            @change="onFileSelected" ref="fileInput" required>
        </div>

       </div>
    

    
    <div class="col-md-8 px-md-5">
      <form class="form">

        <!-- Item Name field -->
        <label class="form-label">Item Name</label>
        <input type="text" class="form-control mb-3" required 
            placeholder="Type food name here" v-model="itemName">

        <!-- Price & Discount fields-->
        <div class="row mb-3">
          
          <div class="price-input-container col">
            <label class="form-label">Original Price</label>
            <input type="number" class="form-control mb-3 price-input" required 
                placeholder="0.00" v-model="itemPrice">
          </div>
          <div class="col">
            <label class="form-label">Discount (%)</label>
            <input type="number" class="form-control mb-3" required 
                placeholder="" v-model="discount">
          </div>

          <p>Price after discount: $
            <span v-if="itemPrice">
              {{ discountedPrice }}</span>
          </p>

        </div>


        <!-- Quantity field -->
        <label class="form-label">Quantity</label>
        <input type="number" class="form-control mb-3 w-50" required 
            placeholder="0" v-model="itemQty">


        <!-- Allergen types checkboxes-->
        <label class="form-label">Allergens (select all that apply)</label>
        <div class="mb-3">
          <input type="checkbox" value="Eggs" v-model="allergens">
            <label>Eggs</label>
          <br>
          <input type="checkbox" value="Diary" v-model="allergens">
            <label>Diary</label>
          <br>
          <input type="checkbox" value="Fish" v-model="allergens">
            <label>Fish</label>
          <br>
          <input type="checkbox" value="Soy" v-model="allergens">
            <label>Soy</label>
          <br>
          <input type="checkbox" value="Peanuts" v-model="allergens">
            <label>Peanuts</label>
          <br>
          <input type="checkbox" value="Sesame" v-model="allergens">
            <label>Sesame</label>
          <br>
        </div>

        <!-- Tags -->
        <label class="form-label">Tags</label>
        <div class="mb-3">
          <input type="checkbox" value="Halal" v-model="tags">
            <label>Halal</label>
          <br>
          <input type="checkbox" value="Vegetarian" v-model="tags">
            <label>Vegetarian</label>
          <br>
          <input type="checkbox" value="Vegan" v-model="tags">
            <label>Vegan</label>
          <br>
          <input type="checkbox" value="No Pork" v-model="tags">
            <label>No pork</label>
          <br>
        </div>

        <br>
        <br>
        <input class="form-control btn btn-success" type="submit" value="Confirm"
          @click="onUpload">
        
      </form>

      
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
      discountedPrice: 0,
      itemQty : "",
      allergens : [],
      tags: [],
      selectedFile: null,
      previewSelectedFileSRC: "",
      
    }      
  }, 
  methods:{
    onFileSelected(event) {
      console.log("File selected" + event)
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

    
    onUpload(){
      const fd= new FormData();

      //send other form details
      

      //send image to firebase
      fd.append("image", this.selectedFile, this.selectedFile.name);

      axios.post("", fd) //url of firebase end point http function
      .then(res => {
        console.log(res) //should show status 200 if sent to firebase successfully
      })

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
