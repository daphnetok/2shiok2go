<template>
  <div class="dashboard-container">
    <h1>Dashboard Page</h1>
    <div class="chart-container">
      <canvas ref="canvas"></canvas>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { Chart, Title, Tooltip, Legend, BarElement, BarController, CategoryScale, LinearScale } from 'chart.js'

Chart.register(Title, Tooltip, Legend, BarElement, BarController, CategoryScale, LinearScale)

export default defineComponent({
  name: 'Dashboard',
  setup() {
    const canvas = ref(null)
    let chartInstance = null

    const chartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr'],
      datasets: [
        {
          label: 'Sales',
          data: [50, 75, 60, 90],
          backgroundColor: 'rgba(54, 162, 235, 0.7)'
        }
      ]
    }

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Monthly Sales' }
      }
    }

    onMounted(() => {
      chartInstance = new Chart(canvas.value, {
        type: 'bar',
        data: chartData,
        options: chartOptions
      })
    })

    return { canvas }
  }
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.chart-container {
  width: 100%;
  max-width: 700px;
  height: 400px; /* important: Chart.js needs container height */
  margin: 20px auto;
}
</style>
