<script setup lang="ts">
import { ref, watch } from "vue";
import VueSlider from "vue-3-slider-component";

const props = defineProps({
  modelValue: {
    type: Number,
    default: 50
  },
  maxValue: {
    type: Number,
    default: 50
  }
});

const emit = defineEmits(['update:modelValue']);

const value = ref(props.modelValue);

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  value.value = newValue;
});

// Emit changes to parent
watch(value, (newValue) => {
  emit('update:modelValue', newValue);
});
</script>

<template>
  <div>
    <VueSlider v-model="value" class="slider" :style="{ width: '80%' }" :max="props.maxValue"/>
    <p>Between <span class="value">$0</span> to <span class="value">${{ value }}</span></p>
  </div>
</template>

<style>
 @import './Slider.css'; 
</style>