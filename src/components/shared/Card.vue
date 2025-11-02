<template>
  <div :class="['card', 'shadow-sm', 'border-0', 'h-100', cardClass]" style="border-radius: 12px; overflow: hidden;">
    <div v-if="title || $slots.header || $slots.actions" class="card-header bg-white border-0 d-flex justify-content-between align-items-center" style="padding: 1.25rem 1.5rem;">
      <h5 class="mb-0 fw-semibold" style="color: #059669; font-size: 1.1rem;">
        <span v-if="title">{{ title }}</span>
        <slot name="header"></slot>
      </h5>
      <div class="card-actions">
        <slot name="actions"></slot>
      </div>
    </div>
    <div class="card-body" style="padding: 1.5rem;">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Card',
  props: {
    title: String,
    cardClass: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15) !important;
}
</style>
