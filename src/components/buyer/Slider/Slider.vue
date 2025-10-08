<script setup lang="ts">
import { ref } from "vue";
import VueSlider from "vue-3-slider-component";

const value = ref(0);
const maxValue = 10;
</script>

<template>
  <div>
    <VueSlider v-model="value" class="slider" :style="{ width: '80%' }" :max="maxValue"/>
    <p>Between <span class="value">$0</span> to <span class="value">${{ value }}</span></p>
  </div>
</template>

<style>
 @import './Slider.css'; 
</style>