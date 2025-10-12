<!-- logic for reserving, handling stock -->
 
<template>
  
  <div class="container-fluid mt-2">
    <div class="row">&nbsp;</div>
    <h2>Near Me</h2>
      <div class="row">
        <div class="col-lg-4 col-md-6 col-12" v-for="listing in listings" :key="listing.stallName">
        <!-- Make card clickable by wrapping it in a router-link -->
        <router-link to="/buyer-view-stall">
            <!-- BS card: Start --> 
            <div class="card mb-3">
                <!-- why cannot work when i try to add dynamically -->
               <img :src=listing.image class="card-img-top" alt="an image">
               <div class="card-body">
                 <p class="card-title stallName">{{ listing.stallName }}</p>
                 <p class="card-text m-0"> <img class="clock" :src=icons.clock alt=""> until {{ listing.open }}</p>
                 <p class="card-text m-0"> <img class="pin" :src=icons.pin alt=""> {{ listing.distance }}km away</p>
               </div>
             </div> 
            <!-- BS card: End --> 
        </router-link>
            
      </div>

    </div>
  </div>
</template>

<script>
export default { 
  name: "Listings",
  data(){
    return{
      listings: [
        {stallName: "Ah Meng Chicken Rice", open:"8pm", distance:"0.6", image:"/img/chicken_rice.jpg"},
        {stallName: "Roti Boy", open:"8pm", distance:"1.0", image:"/img/chicken_rice.jpg"},
        {stallName: "Prawn Noodles", open:"8pm", distance:"2.5", image:"/img/chicken_rice.jpg"},
        {stallName: "Prawn Noodles", open:"8pm", distance:"2.5", image:"/img/chicken_rice.jpg"},
        {stallName: "Prawn Noodles", open:"8pm", distance:"2.5", image:"/img/chicken_rice.jpg"},
        {stallName: "Prawn Noodles", open:"8pm", distance:"2.5", image:"/img/chicken_rice.jpg"},
        {stallName: "Prawn Noodles", open:"8pm", distance:"2.5", image:"/img/chicken_rice.jpg"},
        {stallName: "Prawn Noodles", open:"8pm", distance:"2.5", image:"/img/chicken_rice.jpg"},
        {stallName: "Prawn Noodles", open:"8pm", distance:"2.5", image:"/img/chicken_rice.jpg"}
      ],

      icons: {
        clock: "src/assets/img/clock.jpg",
        pin: "src/assets/img/map_pin.jpg"
      },
    }
  }
  };
</script>

<style>
  @import './ListingCard.css';
  
</style>