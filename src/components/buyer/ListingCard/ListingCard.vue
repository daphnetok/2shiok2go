<!-- logic for reserving, handling stock -->

<template>
  <router-link 
    :to="{
      name: 'BuyerViewStall',
      params: { hawkerName: hawker.hawkerName },
      state: { hawker: hawker }
    }"
    class="nav-link" 
    style="text-decoration: none; color: inherit;"
  >
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
  </router-link>
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
  ,
  // computed: {
  //   listingUrl() {
  //     // Example: /listing/<hawkerName> (replace with your actual route)
  //     return `/listing/${encodeURIComponent(this.hawker.hawkerName)}`;
  //   }
  // }
}
</script>

<style>
  @import './ListingCard.css';  
</style>
