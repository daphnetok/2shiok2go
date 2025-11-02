<template>
  <div :class="['card', 'border-0', 'shadow-sm', 'h-100', 'stat-card', cardClass]" style="border-radius: 12px; overflow: hidden;">
    <div class="card-body d-flex flex-column justify-content-between" style="padding: 1.5rem;">
      <h6 class="text-uppercase mb-3" style="font-size: 0.75rem; font-weight: 600; letter-spacing: 0.5px; opacity: 0.8;">
        {{ title }}
      </h6>
      <div class="d-flex align-items-center justify-content-between">
        <h2 class="mb-0 fw-bold stat-value">{{ value }}</h2>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    title: { type: String, required: true },
    value: { type: [String, Number], required: true },
    cardClass: { type: String, default: '' }
  }
}
</script>

<style scoped>
.stat-card {
  transition: all 0.3s ease;
  position: relative;
}
.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 12px 12px 0 0;
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(16, 185, 129, 0.2) !important;
}
.stat-value {
  font-size: 2rem;
  color: #059669;
  line-height: 1;
}
.ha-card-info { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); }
.ha-card-info .stat-value { color: #1e40af; }
.ha-card-info::before { background: linear-gradient(90deg, #3b82f6, #1e40af); }

.ha-card-success { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); }
.ha-card-success .stat-value { color: #059669; }
.ha-card-success::before { background: linear-gradient(90deg, #10b981, #059669); }

.ha-card-warning { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); }
.ha-card-warning .stat-value { color: #d97706; }
.ha-card-warning::before { background: linear-gradient(90deg, #f59e0b, #d97706); }

.ha-card-primary { background: linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%); }
.ha-card-primary .stat-value { color: #1d4ed8; }
.ha-card-primary::before { background: linear-gradient(90deg, #3b82f6, #1d4ed8); }
</style>
