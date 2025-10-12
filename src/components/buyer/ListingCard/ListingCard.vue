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

  <div class="card mb-3">
    <img :src="hawker.imageUrl" class="card-img-top" :alt="hawker.hawkerName">
    <div class="card-body">
      <p class="card-title stallName">{{ hawker.hawkerName }}</p>
      <p class="card-text m-0">
        <img class="clock" :src="icons.clock" alt="clock"> 
        until {{ hawker.openingTime }}
      </p>
      <p class="card-text m-0">
        <img class="pin" :src="icons.pin" alt="pin"> 
        {{ hawker.distance }} away
      </p>
    </div>
  </div>
</template>

<script>
import clockIcon from '@/assets/img/clock.jpg';
import pinIcon from '@/assets/img/map_pin.jpg';
export default {
  name: 'ListingCard',
  props: {
    hawker: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      icons: {
        clock: clockIcon,
        pin: pinIcon
      }
    }
  }
}
</script>

<style>
  @import './ListingCard.css';  
</style>