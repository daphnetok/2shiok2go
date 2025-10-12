<!-- logic for reserving, handling stock -->

<template>
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