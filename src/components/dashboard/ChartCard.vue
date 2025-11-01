<template>
  <div class="card border-0 shadow-sm h-100" :class="{ 'dark-mode-card': darkMode }" style="border-radius: 12px; overflow: hidden;">
    <div class="card-header border-0 d-flex justify-content-between align-items-center" :class="darkMode ? 'bg-dark-header' : 'bg-white'" style="padding: 1.25rem 1.5rem;">
      <h5 class="mb-0 fw-semibold" :style="{ color: darkMode ? '#10b981' : '#059669', fontSize: '1.1rem' }">{{ title }}</h5>
      <select v-if="filterOptions" v-model="selectedFilter" 
              class="form-select form-select-sm" 
              :class="{ 'dark-select': darkMode }"
              style="width: auto; min-width: 100px; border-radius: 8px;"
              :style="{ borderColor: darkMode ? '#334155' : '#d1d5db' }"
              @change="$emit('filter-change', selectedFilter)">
        <option v-for="option in filterOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>
    <div class="card-body" :class="{ 'dark-body': darkMode }" style="padding: 1.5rem;">
      <div :style="{ height: type === 'doughnut' ? '300px' : 'auto' }">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'

export default {
  name: 'ChartCard',
  props: {
    title: { type: String, required: true },
    type: { type: String, required: true },
    data: { type: Object, required: true },
    options: { type: Object, default: () => ({}) },
    filterOptions: { type: Array, default: null },
    darkMode: { type: Boolean, default: false }
  },
  data() {
    return {
      chart: null,
      selectedFilter: this.filterOptions?.[1]?.value || this.filterOptions?.[0]?.value || null
    }
  },
  watch: {
    data: {
      handler() {
        this.renderChart()
      },
      deep: true
    },
    darkMode() {
      this.renderChart()
    }
  },
  mounted() {
    this.renderChart()
  },
  beforeUnmount() {
    if (this.chart) this.chart.destroy()
  },
  methods: {
    renderChart() {
      if (this.chart) this.chart.destroy()
      
      // Add a small delay to ensure the canvas is properly rendered
      this.$nextTick(() => {
        const canvas = this.$refs.chartCanvas
        if (!canvas) {
          console.error('Canvas element not found')
          return
        }
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          console.error('Cannot get 2D context')
          return
        }
        
        // Validate data
        if (!this.data || !this.data.labels || !this.data.datasets) {
          console.error('Invalid chart data:', this.data)
          return
        }
        
        // Set canvas background color
        const bgColor = this.darkMode ? '#1e293b' : '#ffffff'
        
        // Build scales configuration only for non-doughnut charts
        const scalesConfig = (this.type !== 'doughnut' && this.type !== 'pie') ? {
          x: {
            ticks: { color: this.darkMode ? '#94a3b8' : '#6b7280' },
            grid: { 
              color: this.darkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              drawBorder: false
            }
          },
          y: {
            ticks: { color: this.darkMode ? '#94a3b8' : '#6b7280' },
            grid: { 
              color: this.darkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              drawBorder: false
            },
            beginAtZero: true
          }
        } : {}
        
        try {
          this.chart = new Chart(ctx, {
            type: this.type,
            data: this.data,
            options: {
              responsive: true,
              maintainAspectRatio: this.type === 'doughnut' || this.type === 'pie' ? false : true,
              plugins: {
                legend: {
                  labels: {
                    font: { family: "'Inter', sans-serif", size: 11 },
                    padding: 12,
                    usePointStyle: true,
                    color: this.darkMode ? '#e2e8f0' : '#374151'
                  }
                }
              },
              scales: scalesConfig,
              ...this.options
            },
            plugins: [{
              id: 'customCanvasBackgroundColor',
              beforeDraw: (chart) => {
                const ctx = chart.canvas.getContext('2d')
                ctx.save()
                ctx.globalCompositeOperation = 'destination-over'
                ctx.fillStyle = bgColor
                ctx.fillRect(0, 0, chart.width, chart.height)
                ctx.restore()
              }
            }]
          })
        } catch (error) {
          console.error('Error creating chart:', error)
        }
      })
    }
  }
}
</script>

<style scoped>
.card {
  transition: all 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15) !important;
}

/* Dark Mode Styles */
.dark-mode-card {
  background: #1e293b !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
}

.dark-mode-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5) !important;
}

.bg-dark-header {
  background: #0f172a !important;
  border-bottom: 1px solid #334155 !important;
}

.dark-body {
  background: #1e293b !important;
}

.dark-select {
  background: #0f172a !important;
  color: #e2e8f0 !important;
  border-color: #334155 !important;
}

.dark-select option {
  background: #0f172a !important;
  color: #e2e8f0 !important;
}

.dark-select:focus {
  background: #0f172a !important;
  color: #e2e8f0 !important;
  border-color: #10b981 !important;
  box-shadow: 0 0 0 0.2rem rgba(16, 185, 129, 0.25) !important;
}
</style>
