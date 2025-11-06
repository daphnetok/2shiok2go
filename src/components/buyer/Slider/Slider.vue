<script setup lang="ts">
import { ref, watch, computed } from "vue";
import VueSlider from "vue-3-slider-component";

const props = defineProps({
  modelValue: {
    type: Number,
    default: 20
  },
  minValue: {
    type: Number,
    default: 1
  },
  maxValue: {
    type: Number,
    default: 20
  },
  interval: {
    type: Number,
    default: 1
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

// Custom formatter for price range slider (1-4 → $, $$, $$$, $$$$)
const formatter = computed(() => {
  return (val) => {
    if (props.minValue === 1 && props.maxValue === 4) {
      // This is the discrete price range slider
      return '$'.repeat(val);
    }
    // Default formatter for other sliders
    return `$${val}`;
  };
});
</script>

<template>
  <div>
    <VueSlider 
      v-model="value" 
      class="slider" 
      :style="{ width: '80%' }" 
      :min="props.minValue" 
      :max="props.maxValue"
      :interval="props.interval"
      :tooltip-formatter="formatter"
    />
  </div>
</template>

<style>
 @import './Slider.css'; 
</style>