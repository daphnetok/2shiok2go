<template>
  <div class="hawker-analytics" :class="{ 'dark-theme': isDarkTheme }" style="padding-left: 3rem; padding-right: 3rem; min-height: 100vh; transition: all 0.3s ease;">
    <div class="container-fluid px-4 py-4">
      <div class="row mb-4 align-items-center">
        <div class="col-md-4">
          <h1 class="mb-0 fw-bold dashboard-title" style="font-size: 2rem; letter-spacing: -0.5px;">
            <i class="fas fa-chart-line me-2" style="color: #10b981;"></i>
            Hawker Analytics
          </h1>
          <p class="subtitle mt-2 mb-0" style="font-size: 0.95rem; opacity: 0.8;">Monitor your sales performance and manage your schedule</p>
        </div>
        <div class="col-md-8 text-end d-flex justify-content-end align-items-center gap-3">
          <div class="btn-group shadow-sm" role="group" style="border-radius: 10px; overflow: hidden;">
            <button 
              type="button" 
              class="btn px-4 py-2 fw-semibold" 
              :class="globalFilter === 'day' ? 'btn-success' : 'btn-outline-success'"
              @click="setGlobalFilter('day')"
              style="border-radius: 0; transition: all 0.3s ease;">
              <i class="fas fa-calendar-day me-1"></i>Day
            </button>
            <button 
              type="button" 
              class="btn px-4 py-2 fw-semibold" 
              :class="globalFilter === 'week' ? 'btn-success' : 'btn-outline-success'"
              @click="setGlobalFilter('week')"
              style="transition: all 0.3s ease;">
              <i class="fas fa-calendar-week me-1"></i>Week
            </button>
            <button 
              type="button" 
              class="btn px-4 py-2 fw-semibold" 
              :class="globalFilter === 'month' ? 'btn-success' : 'btn-outline-success'"
              @click="setGlobalFilter('month')"
              style="border-radius: 0; transition: all 0.3s ease;">
              <i class="fas fa-calendar-alt me-1"></i>Month
            </button>
          </div>
          <button class="btn btn-theme shadow-sm px-4 py-2 fw-semibold" style="border-radius: 10px; transition: all 0.3s ease;" @click="toggleTheme">
            <i :class="isDarkTheme ? 'fas fa-sun' : 'fas fa-moon'" class="me-2"></i>
            {{ isDarkTheme ? 'Light' : 'Dark' }}
          </button>
          <button class="btn btn-success shadow-sm px-4 py-2 fw-semibold" style="border-radius: 10px; transition: all 0.3s ease;" @click="generatePDF">
            <i class="fas fa-file-pdf me-2"></i>Export PDF
          </button>
        </div>
      </div>
    </div>

    <div class="container-fluid px-4">
      <!-- Stats Cards -->
      <div class="row mb-5 g-4">
        <div class="col-md-6 col-lg-3">
          <div class="stat-card stat-card-success" style="border-radius: 16px; border: none; min-height: 160px; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15); transition: all 0.3s ease; cursor: pointer;">
            <div style="padding: 1.75rem; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="flex-grow-1">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <p class="text-white mb-0" style="font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9;">Total Sales</p>
                    <span class="badge" :class="currentStats.salesChange >= 0 ? 'bg-light bg-opacity-25' : 'bg-danger bg-opacity-25'" style="font-size: 0.7rem; padding: 0.25rem 0.5rem; border-radius: 6px;">
                      <i :class="currentStats.salesChange >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'" style="font-size: 0.65rem;"></i>
                      {{ Math.abs(currentStats.salesChange) }}%
                    </span>
                  </div>
                  <h3 class="text-white mb-0 fw-bold" style="font-size: 2rem; letter-spacing: -1px;">{{ currentStats.totalSales }}</h3>
                </div>
                <div class="stat-icon" style="width: 56px; height: 56px; background: rgba(255,255,255,0.25); border-radius: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                  <i class="fas fa-dollar-sign text-white" style="font-size: 1.75rem;"></i>
                </div>
              </div>
              <div class="d-flex align-items-center">
                <i class="fas fa-chart-line me-2 text-white" style="opacity: 0.8;"></i>
                <p class="text-white mb-0" style="font-size: 0.813rem; opacity: 0.9;">
                  Revenue for {{ globalFilter === 'day' ? 'today' : globalFilter === 'week' ? 'this week' : 'this month' }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-3">
          <div class="stat-card stat-card-info" style="border-radius: 16px; border: none; min-height: 160px; box-shadow: 0 4px 20px rgba(6, 182, 212, 0.15); transition: all 0.3s ease; cursor: pointer;">
            <div style="padding: 1.75rem; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="flex-grow-1">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <p class="text-white mb-0" style="font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9;">Total Orders</p>
                    <span class="badge" :class="currentStats.ordersChange >= 0 ? 'bg-light bg-opacity-25' : 'bg-danger bg-opacity-25'" style="font-size: 0.7rem; padding: 0.25rem 0.5rem; border-radius: 6px;">
                      <i :class="currentStats.ordersChange >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'" style="font-size: 0.65rem;"></i>
                      {{ Math.abs(currentStats.ordersChange) }}%
                    </span>
                  </div>
                  <h3 class="text-white mb-0 fw-bold" style="font-size: 2rem; letter-spacing: -1px;">{{ currentStats.totalOrders }}</h3>
                </div>
                <div class="stat-icon" style="width: 56px; height: 56px; background: rgba(255,255,255,0.25); border-radius: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                  <i class="fas fa-shopping-bag text-white" style="font-size: 1.75rem;"></i>
                </div>
              </div>
              <div class="d-flex align-items-center">
                <i class="fas fa-receipt me-2 text-white" style="opacity: 0.8;"></i>
                <p class="text-white mb-0" style="font-size: 0.813rem; opacity: 0.9;">
                  Orders received {{ globalFilter === 'day' ? 'today' : globalFilter === 'week' ? 'this week' : 'this month' }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-3">
          <div class="stat-card stat-card-warning" style="border-radius: 16px; border: none; min-height: 160px; box-shadow: 0 4px 20px rgba(245, 158, 11, 0.15); transition: all 0.3s ease; cursor: pointer;">
            <div style="padding: 1.75rem; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="flex-grow-1">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <p class="text-white mb-0" style="font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9;">Peak Hour</p>
                    <span class="badge bg-light bg-opacity-25" style="font-size: 0.7rem; padding: 0.25rem 0.5rem; border-radius: 6px;">
                      <i class="fas fa-info-circle" style="font-size: 0.65rem;"></i>
                      {{ globalFilter === 'day' ? 'Today' : globalFilter === 'week' ? 'This Week' : 'This Month' }}
                    </span>
                  </div>
                  <h3 class="text-white mb-0 fw-bold" style="font-size: 2rem; letter-spacing: -1px;">{{ currentStats.peakHour }}</h3>
                </div>
                <div class="stat-icon" style="width: 56px; height: 56px; background: rgba(255,255,255,0.25); border-radius: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                  <i class="fas fa-clock text-white" style="font-size: 1.75rem;"></i>
                </div>
              </div>
              <div class="d-flex align-items-center">
                <i class="fas fa-fire me-2 text-white" style="opacity: 0.8;"></i>
                <p class="text-white mb-0" style="font-size: 0.813rem; opacity: 0.9;">
                  Busiest time slot for orders
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-3">
          <div class="stat-card stat-card-primary" style="border-radius: 16px; border: none; min-height: 160px; box-shadow: 0 4px 20px rgba(139, 92, 246, 0.15); transition: all 0.3s ease; cursor: pointer;">
            <div style="padding: 1.75rem; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="flex-grow-1">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <p class="text-white mb-0" style="font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9;">Best Seller</p>
                    <span class="badge" :class="currentStats.bestSellerChange >= 0 ? 'bg-light bg-opacity-25' : 'bg-danger bg-opacity-25'" style="font-size: 0.7rem; padding: 0.25rem 0.5rem; border-radius: 6px;">
                      <i :class="currentStats.bestSellerChange >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'" style="font-size: 0.65rem;"></i>
                      {{ Math.abs(currentStats.bestSellerChange) }}%
                    </span>
                  </div>
                  <h3 class="text-white mb-0 fw-bold" style="font-size: 1.6rem; letter-spacing: -0.5px;">{{ currentStats.bestSeller }}</h3>
                </div>
                <div class="stat-icon" style="width: 56px; height: 56px; background: rgba(255,255,255,0.25); border-radius: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                  <i class="fas fa-trophy text-white" style="font-size: 1.75rem;"></i>
                </div>
              </div>
              <div class="d-flex align-items-center">
                <i class="fas fa-star me-2 text-white" style="opacity: 0.8;"></i>
                <p class="text-white mb-0" style="font-size: 0.813rem; opacity: 0.9;">
                  Most popular menu item
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top 5 Menu Items & Sales by Period -->
      <div class="row mb-5 g-4">
        <div class="col-lg-6">
          <ChartCard 
            title="Top 5 Menu Items"
            type="bar"
            :data="topMenuItemsData"
            :dark-mode="isDarkTheme"
          />
        </div>
        <div class="col-lg-6">
          <ChartCard 
            title="Sales by Period"
            type="doughnut"
            :data="salesByPeriodData"
            :options="donutOptions"
            :dark-mode="isDarkTheme"
          />
        </div>
      </div>

      <!-- Peak Hours & Customer Type Analysis -->
      <div class="row mb-5 g-4">
        <div class="col-lg-6">
          <ChartCard 
            title="Peak Hours - Orders by Hour"
            type="line"
            :data="peakHoursData"
            :dark-mode="isDarkTheme"
          />
        </div>
        <div class="col-lg-6">
          <ChartCard 
            title="Customer Type Analysis"
            type="bar"
            :data="customerTypeData"
            :dark-mode="isDarkTheme"
          />
        </div>
      </div>

      <!-- Calendar & To-do List -->
      <div class="row mb-4 g-4">
        <div class="col-lg-6">
          <CalendarCard 
            :events="customEvents"
            :dark-mode="isDarkTheme"
            @add-event="showAddEventModal"
            @clear-events="clearAllEvents"
            @remove-event="removeEvent"
          />
        </div>
        <div class="col-lg-6">
          <TodoList 
            :items="todoList"
            :dark-mode="isDarkTheme"
            @add="addTodo"
            @toggle="toggleTodo"
          />
        </div>
      </div>
    </div>

    <div class="modal fade" id="addEventModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="border-radius: 12px; border: none;">
          <div class="modal-header border-0" style="padding: 1.5rem;">
            <h5 class="modal-title fw-semibold" style="color: #059669;">Add New Event</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" style="padding: 0 1.5rem 1.5rem;">
            <div class="mb-3">
              <label class="form-label fw-semibold mb-2" style="font-size: 0.875rem;">Event Title</label>
              <input type="text" class="form-control" style="border-radius: 8px; padding: 0.625rem 0.875rem;" v-model="newEvent.title" placeholder="Enter event title">
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold mb-2" style="font-size: 0.875rem;">Date</label>
              <input type="date" class="form-control" style="border-radius: 8px; padding: 0.625rem 0.875rem;" v-model="newEvent.date">
            </div>
          </div>
          <div class="modal-footer border-0" style="padding: 1rem 1.5rem 1.5rem;">
            <button type="button" class="btn btn-secondary" style="border-radius: 8px;" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-success" style="border-radius: 8px;" @click="addEvent">
              <i class="fas fa-plus me-1"></i>Add Event
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChartCard from '@/components/dashboard/ChartCard.vue'
import CalendarCard from '@/components/dashboard/CalendarCard.vue'
import TodoList from '@/components/dashboard/TodoList.vue'

export default {
  name: 'HawkerAnalytics',
  components: { ChartCard, CalendarCard, TodoList },
  data() {
    return {
      isDarkTheme: false,
      globalFilter: 'day',
      
      // Dummy data for different time periods
      statsData: {
        day: {
          totalSales: '$450',
          totalOrders: 28,
          peakHour: '12-1PM',
          bestSeller: 'Chicken Rice',
          salesChange: 15,
          ordersChange: 8,
          bestSellerChange: 12
        },
        week: {
          totalSales: '$3,150',
          totalOrders: 196,
          peakHour: '12-1PM',
          bestSeller: 'Chicken Rice',
          salesChange: 22,
          ordersChange: 18,
          bestSellerChange: 5
        },
        month: {
          totalSales: '$13,500',
          totalOrders: 850,
          peakHour: '12-1PM',
          bestSeller: 'Nasi Lemak',
          salesChange: -3,
          ordersChange: 12,
          bestSellerChange: 25
        }
      },

      // Sales trend data
      salesTrendDummyData: {
        day: {
          labels: ['12AM', '3AM', '6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
          data: [0, 0, 5, 45, 180, 120, 80, 20]
        },
        week: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          data: [380, 420, 390, 480, 520, 650, 310]
        },
        month: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          data: [2800, 3200, 3800, 3700]
        }
      },

      // Top menu items data
      topMenuItemsDummyData: {
        day: {
          labels: ['Chicken Rice', 'Nasi Lemak', 'Laksa', 'Char Kway Teow', 'Mee Goreng'],
          data: [12, 10, 8, 6, 5]
        },
        week: {
          labels: ['Chicken Rice', 'Nasi Lemak', 'Laksa', 'Char Kway Teow', 'Mee Goreng'],
          data: [84, 70, 56, 42, 35]
        },
        month: {
          labels: ['Nasi Lemak', 'Chicken Rice', 'Laksa', 'Char Kway Teow', 'Satay'],
          data: [360, 340, 240, 180, 150]
        }
      },

      // Sales by period (breakfast, lunch, dinner)
      salesByPeriodDummyData: {
        day: {
          labels: ['Breakfast', 'Lunch', 'Dinner'],
          data: [80, 280, 90]
        },
        week: {
          labels: ['Breakfast', 'Lunch', 'Dinner'],
          data: [560, 1960, 630]
        },
        month: {
          labels: ['Breakfast', 'Lunch', 'Dinner'],
          data: [2400, 8400, 2700]
        }
      },

      // Peak hours - orders by hour
      peakHoursDummyData: {
        day: {
          labels: ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM'],
          data: [2, 3, 1, 4, 8, 6, 3, 2, 1, 2, 4, 2]
        },
        week: {
          labels: ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM'],
          data: [14, 21, 7, 28, 56, 42, 21, 14, 7, 14, 28, 14]
        },
        month: {
          labels: ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM'],
          data: [60, 90, 30, 120, 240, 180, 90, 60, 30, 60, 120, 60]
        }
      },

      // Customer type analysis
      customerTypeDummyData: {
        day: {
          labels: ['First-time Buyers', 'Repeat Customers'],
          data: [8, 20]
        },
        week: {
          labels: ['First-time Buyers', 'Repeat Customers'],
          data: [56, 140]
        },
        month: {
          labels: ['First-time Buyers', 'Repeat Customers'],
          data: [240, 610]
        }
      },

      todoList: [
        { text: 'Restock ingredients', done: false },
        { text: 'Update menu prices', done: false },
        { text: 'Check equipment maintenance', done: true }
      ],
      customEvents: [],
      newEvent: { title: '', date: '', id: null }
    }
  },
  computed: {
    currentStats() {
      return this.statsData[this.globalFilter]
    },
    salesTrendData() {
      const data = this.salesTrendDummyData[this.globalFilter]
      return {
        labels: data.labels,
        datasets: [{
          label: 'Sales ($)',
          data: data.data,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      }
    },
    topMenuItemsData() {
      const data = this.topMenuItemsDummyData[this.globalFilter]
      return {
        labels: data.labels,
        datasets: [{
          label: 'Orders Sold',
          data: data.data,
          backgroundColor: ['#10b981', '#059669', '#22c55e', '#84cc16', '#65a30d'],
          borderRadius: 8
        }]
      }
    },
    salesByPeriodData() {
      const data = this.salesByPeriodDummyData[this.globalFilter]
      return {
        labels: data.labels,
        datasets: [{
          data: data.data,
          backgroundColor: ['#fbbf24', '#10b981', '#3b82f6'],
          borderWidth: 0
        }]
      }
    },
    peakHoursData() {
      const data = this.peakHoursDummyData[this.globalFilter]
      return {
        labels: data.labels,
        datasets: [{
          label: 'Orders',
          data: data.data,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      }
    },
    customerTypeData() {
      const data = this.customerTypeDummyData[this.globalFilter]
      return {
        labels: data.labels,
        datasets: [{
          label: 'Customers',
          data: data.data,
          backgroundColor: ['#3b82f6', '#8b5cf6'],
          borderRadius: 8
        }]
      }
    },
    donutOptions() {
      return {
        plugins: { 
          legend: { 
            position: 'bottom',
            labels: { usePointStyle: true, padding: 15, boxWidth: 12 }
          }
        }
      }
    }
  },
  methods: {
    setGlobalFilter(filter) {
      this.globalFilter = filter
    },
    generatePDF() {
      window.print()
    },
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme
      document.body.classList.toggle('dark-mode', this.isDarkTheme)
      document.documentElement.setAttribute('data-bs-theme', this.isDarkTheme ? 'dark' : 'light')
      localStorage.setItem('hawker-theme', this.isDarkTheme ? 'dark' : 'light')
    },
    addTodo(text) {
      this.todoList.push({ text, done: false })
    },
    toggleTodo(idx) {
      this.todoList[idx].done = !this.todoList[idx].done
    },
    showAddEventModal() {
      this.newEvent = { title: '', date: '', id: null }
      new bootstrap.Modal(document.getElementById('addEventModal')).show()
    },
    addEvent() {
      if (this.newEvent.title && this.newEvent.date) {
        this.customEvents.push({ ...this.newEvent, id: Date.now() })
        bootstrap.Modal.getInstance(document.getElementById('addEventModal')).hide()
        this.saveEvents()
      }
    },
    removeEvent(id) {
      this.customEvents = this.customEvents.filter(e => e.id !== id)
      this.saveEvents()
    },
    clearAllEvents() {
      if (confirm('Clear all events?')) {
        this.customEvents = []
        this.saveEvents()
      }
    },
    saveEvents() {
      localStorage.setItem('hawker-calendar-events', JSON.stringify(this.customEvents))
    },
    loadEvents() {
      const saved = localStorage.getItem('hawker-calendar-events')
      if (saved) this.customEvents = JSON.parse(saved)
    }
  },
  mounted() {
    this.loadEvents()
    const savedTheme = localStorage.getItem('hawker-theme')
    if (savedTheme === 'dark') {
      this.isDarkTheme = true
      document.body.classList.add('dark-mode')
      document.documentElement.setAttribute('data-bs-theme', 'dark')
    }
  }
}
</script>

<style scoped>
@import '@/assets/css/dashboard-theme.css';
@import '@/assets/css/calendar.css';

/* Light Theme (Default) */
.hawker-analytics {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #d1fae5 100%);
  transition: all 0.3s ease;
}

.dashboard-title {
  color: #047857;
  text-shadow: 0 2px 4px rgba(4, 120, 87, 0.1);
}

.subtitle {
  color: #065f46;
}

/* Dark Theme */
.hawker-analytics.dark-theme {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
}

.dark-theme .dashboard-title {
  color: #10b981;
  text-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.dark-theme .subtitle {
  color: #94a3b8;
}

/* Stat Cards - Light */
.stat-card-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-card-info {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
}

.stat-card-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-card-primary {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

/* Remove card borders in dark mode */
.dark-theme .stat-card-success,
.dark-theme .stat-card-info,
.dark-theme .stat-card-warning,
.dark-theme .stat-card-primary {
  border: none !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
}

/* Stat Card Hover Effects */
.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2) !important;
}

.dark-theme .stat-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5) !important;
}

/* Button Styles */
.btn-theme {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  border: none;
  color: white;
}

.btn-theme:hover {
  background: linear-gradient(135deg, #475569 0%, #334155 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dark-theme .btn-theme {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #1e293b;
}

.dark-theme .btn-theme:hover {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  color: #0f172a;
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
}

.btn-success:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-outline-success {
  border: 2px solid #10b981;
  color: #10b981;
  background: transparent;
}

.btn-outline-success:hover {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

/* Dark theme button adjustments */
.dark-theme .btn-outline-success {
  border-color: #10b981;
  color: #10b981;
}

.dark-theme .btn-outline-success:hover {
  background: #10b981;
  color: white;
}

/* Modal dark theme */
.dark-theme .modal-content {
  background: #1e293b !important;
  color: #e2e8f0 !important;
}

.dark-theme .modal-header,
.dark-theme .modal-footer {
  border-color: #334155 !important;
}

.dark-theme .modal-title {
  color: #10b981 !important;
}

.dark-theme .form-label {
  color: #e2e8f0 !important;
}

.dark-theme .form-control {
  background: #0f172a !important;
  border-color: #334155 !important;
  color: #e2e8f0 !important;
}

.dark-theme .form-control:focus {
  background: #0f172a !important;
  border-color: #10b981 !important;
  color: #e2e8f0 !important;
}

.dark-theme .btn-secondary {
  background: #475569 !important;
  border-color: #475569 !important;
}
</style>
