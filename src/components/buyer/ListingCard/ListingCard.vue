<!-- logic for reserving, handling stock -->
 
<template>
  <div class="container mt-4">

      <div class="row">
        <div class="col-lg-4 col-md-6 col-12" v-for="listing in listings">
            
            <!-- BS card: Start --> 
            <div class="card mb-3">
               <img src="../../../assets/img/chicken_rice.jpg" class="card-img-top" alt="an image">
               <div class="card-body">
                 <p class="card-title stallName">{{ listing.stallName }}</p>
                 <p class="card-text m-0"> <img class="clock" src="../../../assets/img/clock.jpg" alt=""> until {{ listing.open }}</p>
                 <p class="card-text m-0"> <img class="pin" src="../../../assets/img/map_pin.jpg" alt=""> {{ listing.distance }}km away</p>
               </div>
             </div> 
            <!-- BS card: End --> 
            
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
        {stallName: "Ah Meng Chicken Rice", open:"8pm", distance:"0.6"},
        {stallName: "Roti Boy", open:"8pm", distance:"1.0"},
        {stallName: "Prawn Noodles", open:"8pm", distance:"2.5"},
        {stallName: "Prawn Noodles", open:"8pm", distance:"2.5"},
        {stallName: "Prawn Noodles", open:"8pm", distance:"2.5"},
        {stallName: "Prawn Noodles", open:"8pm", distance:"2.5"},
        {stallName: "Prawn Noodles", open:"8pm", distance:"2.5"},
        {stallName: "Prawn Noodles", open:"8pm", distance:"2.5"},
        {stallName: "Prawn Noodles", open:"8pm", distance:"2.5"}
      ]
    }
  }
  };
</script>

<style>
  @import './ListingCard.css';
  
</style>