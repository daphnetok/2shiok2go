<template>
  <div class="card border-0 shadow-sm h-100" :class="{ 'dark-mode-card': darkMode }" style="border-radius: 16px; overflow: hidden; transition: all 0.3s ease;">
    <div class="card-header border-0 d-flex justify-content-between align-items-center" 
         :class="darkMode ? 'bg-dark-header' : 'bg-light-header'" 
         style="padding: 1.5rem 1.75rem; background: linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%);"
         :style="{ background: darkMode ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' : 'linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%)' }">
      <div class="d-flex align-items-center gap-2">
        <div class="chart-icon" 
             :style="{ 
               width: '36px', 
               height: '36px', 
               borderRadius: '10px',
               background: darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(5, 150, 105, 0.15)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center'
             }">
          <i :class="getChartIcon()" :style="{ color: darkMode ? '#10b981' : '#059669', fontSize: '1rem' }"></i>
        </div>
        <h5 class="mb-0 fw-bold" :style="{ color: darkMode ? '#10b981' : '#059669', fontSize: '1.15rem', letterSpacing: '-0.02em' }">{{ title }}</h5>
      </div>
      <select v-if="filterOptions" v-model="selectedFilter" 
              class="form-select form-select-sm" 
              :class="{ 'dark-select': darkMode }"
              style="width: auto; min-width: 100px; border-radius: 8px; font-weight: 500;"
              :style="{ borderColor: darkMode ? '#334155' : '#d1d5db' }"
              @change="$emit('filter-change', selectedFilter)">
        <option v-for="option in filterOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>
    <div class="card-body" :class="{ 'dark-body': darkMode }" style="padding: 1.25rem 1.5rem;">
      <div :style="{ height: type === 'doughnut' ? '280px' : '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }">
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
    
    // Re-render charts before print to ensure they appear in PDF
    window.addEventListener('beforeprint', this.handleBeforePrint)
    window.addEventListener('afterprint', this.handleAfterPrint)
  },
  beforeUnmount() {
    if (this.chart) this.chart.destroy()
    window.removeEventListener('beforeprint', this.handleBeforePrint)
    window.removeEventListener('afterprint', this.handleAfterPrint)
  },
  methods: {
    handleBeforePrint() {
      // Force chart to re-render before printing
      if (this.chart) {
        this.chart.resize()
        this.chart.update('none') // Update without animation
      }
    },
    handleAfterPrint() {
      // Restore chart after printing
      if (this.chart) {
        this.chart.resize()
      }
    },
    getChartIcon() {
      const iconMap = {
        'bar': 'fas fa-chart-bar',
        'line': 'fas fa-chart-line',
        'doughnut': 'fas fa-chart-pie',
        'pie': 'fas fa-chart-pie'
      }
      return iconMap[this.type] || 'fas fa-chart-bar'
    },
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
        
        // Set canvas background color to match card body
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
              maintainAspectRatio: false,
              animation: {
                duration: 0 // Disable animations for better print performance
              },
              layout: {
                padding: this.type === 'doughnut' || this.type === 'pie' ? 10 : 5
              },
              plugins: {
                legend: {
                  position: this.type === 'doughnut' || this.type === 'pie' ? 'bottom' : 'top',
                  align: 'center',
                  labels: {
                    font: { family: "'Inter', sans-serif", size: 11 },
                    padding: 12,
                    usePointStyle: true,
                    color: this.darkMode ? '#e2e8f0' : '#1f2937'
                  }
                }
              },
              scales: scalesConfig,
              ...this.options
            },
            plugins: [{
              id: 'customCanvasBackgroundColor',
              beforeDraw: (chart) => {
                if (!chart.canvas) return
                const ctx = chart.canvas.getContext('2d')
                if (!ctx) return
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
  transition: all 0.3s ease;
  border: 1px solid rgba(5, 150, 105, 0.08) !important;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(16, 185, 129, 0.2) !important;
}

.chart-icon {
  transition: all 0.3s ease;
}

.card:hover .chart-icon {
  transform: scale(1.1) rotate(5deg);
}

/* Dark Mode Styles */
.dark-mode-card {
  background: #1e293b !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4) !important;
  border: 1px solid #334155 !important;
}

.dark-mode-card:hover {
  box-shadow: 0 12px 36px rgba(16, 185, 129, 0.3) !important;
  border-color: #10b981 !important;
}

.bg-dark-header {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
  border-bottom: 1px solid #334155 !important;
}

.bg-light-header {
  background: linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%) !important;
  border-bottom: 1px solid #bbf7d0 !important;
}

.dark-body {
  background: #1e293b !important;
  color: #e2e8f0 !important;
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

/* Print styles for charts - landscape optimized */
@media print {
  .card {
    page-break-inside: avoid;
    box-shadow: none !important;
    border: 1px solid #e5e7eb !important;
    margin-bottom: 0.6rem !important;
  }
  
  .card-header {
    background: #f9fafb !important;
    border-bottom: 1px solid #e5e7eb !important;
    padding: 0.6rem 0.85rem !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  .card-header h5 {
    font-size: 0.95rem !important;
  }
  
  .card-body {
    min-height: 200px !important;
    max-height: 220px !important;
    padding: 0.75rem !important;
    overflow: visible !important;
  }
  
  canvas {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    height: 190px !important;
    max-height: 190px !important;
    margin: 0 auto !important;
  }
  
  /* Ensure chart container has proper height */
  .card-body > div {
    height: 200px !important;
    max-height: 200px !important;
    width: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    overflow: visible !important;
  }
}
</style>
