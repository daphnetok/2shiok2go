<!-- filepath: /Applications/MAMP/htdocs/wad2/gproj/figmamake/2shiok2go/src/views/HawkerAnalytics.vue -->
<template>
  <main>
    <!-- Dashboard Header -->
    <div class="row mb-4">
      <div class="col">
        <h2>Hawker Dashboard</h2>
      </div>
      <div class="col text-end">
        <button class="btn btn-primary" @click="generatePDF">Generate PDF</button>
      </div>
    </div>

    <!-- Info Boxes -->
    <div class="row mb-4">
      <div class="col-md-3 mb-3" v-for="(card, idx) in infoCards" :key="idx">
        <div :class="['ha-card', card.class, 'h-100']">
          <div class="ha-card-body">
            <h5>{{ card.title }}</h5>
            <p class="ha-display-6">{{ card.value }}</p>
            <button class="btn btn-outline-light btn-sm mt-2 w-100" @click="showMoreInfo(card.title)">
              More Info
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="row mb-4">
      <div class="col-lg-6 mb-4">
        <div class="ha-card h-100">
          <div class="ha-card-header d-flex justify-content-between align-items-center">
            <span>Sales by Month</span>
            <select v-model="salesFilter" class="form-select w-auto" @change="updateSalesChart">
              <option value="day">Day</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
          <div class="ha-card-body">
            <canvas ref="salesLineChart"></canvas>
          </div>
        </div>
      </div>
      <div class="col-lg-6 mb-4">
        <div class="ha-card h-100">
          <div class="ha-card-header d-flex justify-content-between align-items-center">
            <span>Sales Distribution</span>
            <select v-model="donutFilter" class="form-select w-auto" @change="updateDonutChart">
              <option value="month">Month</option>
              <option value="day">Day</option>
              <option value="year">Year</option>
            </select>
          </div>
          <div class="ha-card-body">
            <canvas ref="salesDonutChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Menu Items Sold & Discount Graphs -->
    <div class="row mb-4">
      <div class="col-lg-6 mb-4">
        <div class="ha-card h-100">
          <div class="ha-card-header">Menu Items Sold</div>
          <div class="ha-card-body">
            <canvas ref="menuItemsBarChart"></canvas>
          </div>
        </div>
      </div>
      <div class="col-lg-6 mb-4">
        <div class="ha-card h-100">
          <div class="ha-card-header">Discounts by Sold</div>
          <div class="ha-card-body">
            <canvas ref="discountBarChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar & To-Do List -->
    <div class="row mb-4">
      <div class="col-lg-6 mb-4">
        <div class="ha-card h-100">
          <div class="ha-card-header">Calendar</div>
          <div class="ha-card-body">
            <div id="calendar">[Calendar Placeholder]</div>
          </div>
        </div>
      </div>
      <div class="col-lg-6 mb-4">
        <div class="ha-card h-100">
          <div class="ha-card-header">To-Do List</div>
          <div class="ha-card-body">
            <ul class="list-group">
              <li v-for="(item, idx) in todoList" :key="idx" class="list-group-item d-flex justify-content-between align-items-center">
                <span :class="{ 'text-decoration-line-through': item.done }">{{ item.text }}</span>
                <button class="btn btn-sm btn-success" @click="toggleTodo(idx)">
                  {{ item.done ? 'Undo' : 'Done' }}
                </button>
              </li>
            </ul>
            <div class="input-group mt-3">
              <input v-model="newTodo" type="text" class="form-control" placeholder="Add new task">
              <button class="btn btn-primary" @click="addTodo">Add</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  name: 'HawkerAnalytics',
  data() {
    return {
      stats: {
        newOrders: 12,
        totalSales: 1200,
        inventoryPercent: 85,
        ordersThisWeek: 34,
      },
      infoCards: [
        { title: 'New Orders', value: 12, class: 'ha-card-info' },
        { title: 'Total Sales', value: '$1200', class: 'ha-card-success' },
        { title: 'Inventory %', value: '85%', class: 'ha-card-warning' },
        { title: 'Orders This Week', value: 34, class: 'ha-card-primary' },
      ],
      salesFilter: 'month',
      donutFilter: 'month',
      todoList: [
        { text: 'Restock ingredients', done: false },
        { text: 'Update menu', done: false },
      ],
      newTodo: '',
      charts: {
        salesLine: null,
        salesDonut: null,
        menuItemsBar: null,
        discountBar: null,
      },
      salesData: {
        day: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          data: [120, 150, 100, 170, 90, 200, 130],
        },
        month: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          data: [800, 950, 700, 1100, 900, 1200, 1000],
        },
        year: {
          labels: ['2021', '2022', '2023', '2024'],
          data: [9000, 10500, 9800, 12000],
        },
      },
      donutData: {
        day: {
          labels: ['Breakfast', 'Lunch', 'Dinner'],
          data: [30, 50, 20],
        },
        month: {
          labels: ['Breakfast', 'Lunch', 'Dinner'],
          data: [300, 500, 200],
        },
        year: {
          labels: ['Breakfast', 'Lunch', 'Dinner'],
          data: [3500, 5200, 2300],
        },
      },
      menuItemsData: {
        labels: ['Nasi Lemak', 'Chicken Rice', 'Laksa', 'Satay', 'Mee Goreng'],
        data: [120, 90, 60, 80, 100],
      },
      discountData: {
        labels: ['10%', '20%', '30%', '40%', '50%'],
        data: [50, 40, 30, 20, 10],
      },
    }
  },
  methods: {
    generatePDF() {
      alert('PDF generated!');
    },
    showMoreInfo(title) {
      alert(`More info about ${title}`);
    },
    addTodo() {
      if (this.newTodo.trim()) {
        this.todoList.push({ text: this.newTodo, done: false });
        this.newTodo = '';
      }
    },
    toggleTodo(idx) {
      this.todoList[idx].done = !this.todoList[idx].done;
    },
    renderSalesChart() {
      const ctx = this.$refs.salesLineChart.getContext('2d');
      if (this.charts.salesLine) this.charts.salesLine.destroy();
      this.charts.salesLine = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.salesData[this.salesFilter].labels,
          datasets: [{
            label: 'Sales',
            data: this.salesData[this.salesFilter].data,
            borderColor: '#007bff',
            backgroundColor: 'rgba(0,123,255,0.2)',
            fill: true,
            tension: 0.4,
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } }
        }
      });
    },
    updateSalesChart() {
      this.renderSalesChart();
    },
    renderDonutChart() {
      const ctx = this.$refs.salesDonutChart.getContext('2d');
      if (this.charts.salesDonut) this.charts.salesDonut.destroy();
      this.charts.salesDonut = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: this.donutData[this.donutFilter].labels,
          datasets: [{
            label: 'Sales Distribution',
            data: this.donutData[this.donutFilter].data,
            backgroundColor: ['#17a2b8', '#ffc107', '#28a745'],
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    },
    updateDonutChart() {
      this.renderDonutChart();
    },
    renderMenuItemsBarChart() {
      const ctx = this.$refs.menuItemsBarChart.getContext('2d');
      if (this.charts.menuItemsBar) this.charts.menuItemsBar.destroy();
      this.charts.menuItemsBar = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.menuItemsData.labels,
          datasets: [{
            label: 'Items Sold',
            data: this.menuItemsData.data,
            backgroundColor: '#17a2b8',
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } }
        }
      });
    },
    renderDiscountBarChart() {
      const ctx = this.$refs.discountBarChart.getContext('2d');
      if (this.charts.discountBar) this.charts.discountBar.destroy();
      this.charts.discountBar = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.discountData.labels,
          datasets: [{
            label: 'Discounts by Sold',
            data: this.discountData.data,
            backgroundColor: '#ffc107',
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } }
        }
      });
    }
  },
  mounted() {
    this.renderSalesChart();
    this.renderDonutChart();
    this.renderMenuItemsBarChart();
    this.renderDiscountBarChart();
  }
}
</script>

<style scoped>
.ha-card {
  border-radius: 0.5rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  margin-bottom: 1rem;
  background: #fff;
}
.ha-card-info {
  background: #17a2b8;
  color: #fff;
}
.ha-card-success {
  background: #28a745;
  color: #fff;
}
.ha-card-warning {
  background: #ffc107;
  color: #fff;
}
.ha-card-primary {
  background: #007bff;
  color: #fff;
}
.ha-card-body {
  padding: 1rem;
}
.ha-card-header {
  padding: 0.75rem 1rem;
  font-weight: 600;
  background: rgba(0,0,0,0.03);
  border-bottom: 1px solid #eee;
}
.ha-display-6 {
  font-size: 2rem;
  font-weight: bold;
}
</style>