<template>
  <main>
    <h2>Buyer Dashboard</h2>
    <p>Track your past orders, points, and rewards here.</p>
  </main>
</template>

<script>
export default { name: "BuyerDashboard" };
</script>


<!-- <script>
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  name: 'DashboardChart',
  components: { Bar },
  props: {
    chartData: { type: Object, required: true },
    chartOptions: { type: Object, required: false }
  }
}
</script>

<template>
  <Bar :data="chartData" :options="chartOptions" />
</template> -->