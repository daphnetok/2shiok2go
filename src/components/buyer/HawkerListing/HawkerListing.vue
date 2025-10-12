<template>
  <div class="container">
    <div class="row">
      <div class="col-4">
        <img src="../../../assets/img/stall.jpg" alt="" class="stallImg"/>
      </div>
      <div class="col-8">
        <div style="display: flex; align-items: center; gap: 10px;">
          <h2 style="margin: 0;">Maxwell Hainanese Chicken Rice</h2>
          <button @click="toggleSave" style="background:none; border:none; cursor:pointer;">
            <i :class="[saved ? 'fa-solid fa-heart savedIcon' : 'fa-regular fa-heart saveIcon']"></i>
          </button>
        </div>
        <p><i class="fa-solid fa-map-pin pinIcon"></i> Lau Pa Sat, 18 Raffles Quay, #01-10, Singapore 048582</p>
        <button>Open in Maps <i class="fa-solid fa-map-location-dot"></i></button>
        <p>0.6km away</p>
        <p><i class="fa-solid fa-star starIcon"></i>4.4 stars</p>
      </div>
    </div>
    
    <div class="row" style="margin-top: 30px;">
      <h4>Available Listings</h4>
      <div class="row">
        <div v-for="item in foodItems" :key="item.itemName" class="col-4" style="border: 1px solid #eee; border-radius: 10px; padding: 15px; min-width: 180px; background: #fafafa;">
          <div>
            <img :src="item.image" alt="food" style="object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
            <div><strong>{{ item.itemName }}</strong></div>
            <div>Price: {{ item.price }}</div>
            <div>Quantity left: <span :style="{color: item.stock == '0' ? 'red' : 'inherit'}">{{ item.stock }}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  name: "Listings",
  data() {
    return {
      saved: true,
      foodItems: [
        {itemName: "Chicken Rice", price:"$3.00", stock:"5", image:"../img/chicken_rice.jpg"},
        {itemName: "Roti Prata", price:"$1.00", stock:"10", image:"../img/chicken_rice.jpg"},
        {itemName: "Prawn Noodles", price:"$4.00", stock:"2", image:"../img/chicken_rice.jpg"},
        {itemName: "Laksa", price:"$3.50", stock:"0", image:"../img/chicken_rice.jpg"},
        {itemName: "Nasi Lemak", price:"$3.00", stock:"7", image:"../img/chicken_rice.jpg"},
        {itemName: "Mee Rebus", price:"$3.00", stock:"4", image:"../img/chicken_rice.jpg"},
        {itemName: "Hainanese Chicken Chop", price:"$5.00", stock:"3", image:"../img/chicken_rice.jpg"},
        {itemName: "Fried Kway Teow", price:"$3.00", stock:"6", image:"../img/chicken_rice.jpg"},
        {itemName: "Char Siew Rice", price:"$3.50", stock:"8", image:"../img/chicken_rice.jpg"}
      ],
    }
  },
  methods: {
    
    toggleSave() {
      this.saved = !this.saved;
      console.log("Saved:", this.saved);
    }
  }
};
</script>

<style>
  @import './StallListing.css';
  
</style>