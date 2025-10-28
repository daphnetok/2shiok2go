<!-- filepath: /Applications/MAMP/htdocs/wad2/gproj/figmamake/2shiok2go/src/views/HawkerAnalytics.vue -->
<template>
  <main>
    <!-- Dashboard Header -->
    <div class="row mb-4">
      <div class="col">
        <h2>Hawker Dashboard</h2>
      </div>
      <div class="col text-end">
        <button class="btn btn-outline-secondary me-2" @click="toggleTheme">
          <i :class="isDarkTheme ? 'fas fa-sun' : 'fas fa-moon'"></i>
          {{ isDarkTheme ? 'Light' : 'Dark' }} Mode
        </button>
        <button class="btn btn-primary" @click="generatePDF">Generate PDF</button>
      </div>
    </div>

    <!-- Info Boxes -->
    <div class="row mb-4 align-items-start">
      <div class="col-md-3 mb-3" v-for="(card, idx) in infoCards" :key="idx">
        <div :class="['ha-card', card.class, 'h-100']">
          <div class="ha-card-body">
            <h5>{{ card.title }}</h5>
            <p class="ha-display-6">{{ card.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="row mb-4 align-items-start">
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
          <div class="ha-card-body donut-chart-container">
            <canvas ref="salesDonutChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Menu Items Sold & Discount Graphs -->
    <div class="row mb-4 align-items-start">
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
    <div class="row mb-4 align-items-start">
      <div class="col-lg-6 mb-4">
        <div class="ha-card h-100">
          <div class="ha-card-header d-flex justify-content-between align-items-center">
            <span>Calendar - {{ currentMonthYear }}</span>
            <div class="calendar-actions">
              <button class="btn btn-sm btn-success me-1" @click="showAddEventModal">
                <i class="fas fa-plus"></i> Add Event
              </button>
              <button class="btn btn-sm btn-warning" @click="clearAllEvents">
                <i class="fas fa-trash"></i> Clear Events
              </button>
            </div>
          </div>
          <div class="ha-card-body">
            <div class="calendar-container">
              <div class="calendar-nav d-flex justify-content-between align-items-center mb-3">
                <button class="btn btn-sm btn-outline-primary" @click="previousMonth">&lt;</button>
                <span class="fw-bold">{{ currentMonthYear }}</span>
                <button class="btn btn-sm btn-outline-primary" @click="nextMonth">&gt;</button>
              </div>
              <div class="calendar-grid-clean">
                <div class="calendar-header-clean">
                  <div class="calendar-day-header-clean" v-for="day in dayHeaders" :key="day">{{ day }}</div>
                </div>
                <div class="calendar-body-clean">
                  <div 
                    v-for="(day, index) in calendarDays" 
                    :key="index" 
                    :class="['calendar-day-clean', { 
                      'other-month': !day.isCurrentMonth, 
                      'today': day.isToday,
                      'has-holiday': day.hasEvent,
                      'has-custom-event': day.customEvents.length > 0
                    }]"
                    @click="selectDate(day)"
                  >
                    <div class="date-number-clean">{{ day.date }}</div>
                    <div class="event-dots" v-if="day.customEvents.length > 0">
                      <span 
                        v-for="(event, idx) in day.customEvents.slice(0, 3)" 
                        :key="idx"
                        class="event-dot"
                        :title="event.title"
                      ></span>
                      <span v-if="day.customEvents.length > 3" class="event-more">+{{ day.customEvents.length - 3 }}</span>
                    </div>
                    <div class="holiday-indicator-clean" v-if="day.hasEvent">🎉</div>
                  </div>
                </div>
              </div>
              
              <!-- Event List -->
              <div class="selected-date-events mt-3" v-if="selectedDate">
                <h6>Events for {{ formatSelectedDate }}</h6>
                <div v-if="getEventsForSelectedDate().length === 0" class="text-muted small">
                  No events scheduled
                </div>
                <div v-else>
                  <div 
                    v-for="(event, idx) in getEventsForSelectedDate()" 
                    :key="idx"
                    class="event-item d-flex justify-content-between align-items-center"
                  >
                    <span>{{ event.title }}</span>
                    <button class="btn btn-sm btn-outline-danger" @click="removeEvent(event.id)">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Add Event Modal -->
        <div class="modal fade" id="addEventModal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Add New Event</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label">Event Title</label>
                  <input type="text" class="form-control" v-model="newEvent.title" placeholder="Enter event title">
                </div>
                <div class="mb-3">
                  <label class="form-label">Date</label>
                  <input type="date" class="form-control" v-model="newEvent.date">
                </div>
                <div class="mb-3">
                  <label class="form-label">Category</label>
                  <select class="form-select" v-model="newEvent.category">
                    <option value="business">Business</option>
                    <option value="delivery">Delivery</option>
                    <option value="promotion">Promotion</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" @click="addEvent">Add Event</button>
              </div>
            </div>
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
      // Calendar data
      currentDate: new Date(),
      selectedDate: null,
      dayHeaders: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      customEvents: [], // Store custom events
      newEvent: {
        title: '',
        date: '',
        category: 'business',
        id: null
      },
      // Theme toggle
      isDarkTheme: false,
    };
  },
  computed: {
    currentMonthYear() {
      return this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    },
    formatSelectedDate() {
      return this.selectedDate ? this.selectedDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) : '';
    },
    calendarDays() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const today = new Date();
      
      // First day of the month
      const firstDay = new Date(year, month, 1);
      // Last day of the month
      const lastDay = new Date(year, month + 1, 0);
      
      // Start from the first Sunday before or on the first day
      const startDate = new Date(firstDay);
      startDate.setDate(firstDay.getDate() - firstDay.getDay());
      
      const days = [];
      const currentDate = new Date(startDate);
      
      // Generate 42 days (6 weeks) for a complete calendar grid
      for (let i = 0; i < 42; i++) {
        const isCurrentMonth = currentDate.getMonth() === month;
        const isToday = currentDate.toDateString() === today.toDateString();
        const holiday = this.hasEventOnDate(currentDate);
        const customEvents = this.getCustomEventsForDate(currentDate);
        
        days.push({
          date: currentDate.getDate(),
          fullDate: new Date(currentDate),
          isCurrentMonth,
          isToday,
          hasEvent: !!holiday,
          holiday: holiday,
          customEvents: customEvents
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return days;
    }
  },
  methods: {
    generatePDF() {
      window.print();
    },
    // Calendar methods
    previousMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    },
    selectDate(day) {
      this.selectedDate = day.fullDate;
    },
    getCustomEventsForDate(date) {
      return this.customEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === date.toDateString();
      });
    },
    getEventsForSelectedDate() {
      if (!this.selectedDate) return [];
      return this.getCustomEventsForDate(this.selectedDate);
    },
    showAddEventModal() {
      this.newEvent = {
        title: '',
        date: this.selectedDate ? this.selectedDate.toISOString().split('T')[0] : '',
        category: 'business',
        id: null
      };
      const modal = new bootstrap.Modal(document.getElementById('addEventModal'));
      modal.show();
    },
    addEvent() {
      if (this.newEvent.title && this.newEvent.date) {
        const event = {
          ...this.newEvent,
          id: Date.now() // Simple ID generation
        };
        this.customEvents.push(event);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addEventModal'));
        modal.hide();
        
        // Reset form
        this.newEvent = { title: '', date: '', category: 'business', id: null };
        
        // Save to localStorage
        this.saveEventsToStorage();
      }
    },
    removeEvent(eventId) {
      this.customEvents = this.customEvents.filter(event => event.id !== eventId);
      this.saveEventsToStorage();
    },
    clearAllEvents() {
      if (confirm('Are you sure you want to clear all custom events?')) {
        this.customEvents = [];
        this.saveEventsToStorage();
      }
    },
    saveEventsToStorage() {
      localStorage.setItem('hawker-calendar-events', JSON.stringify(this.customEvents));
    },
    loadEventsFromStorage() {
      const saved = localStorage.getItem('hawker-calendar-events');
      if (saved) {
        this.customEvents = JSON.parse(saved);
      }
    },
    getTooltipText(day) {
      let tooltip = [];
      
      if (day.holiday) {
        tooltip.push(`🎉 ${day.holiday.name}`);
      }
      
      day.hawkerEvents.forEach(event => {
        const icons = {
          peak: '📈',
          payday: '💰', 
          delivery: '🚚',
          prep: '🍽️'
        };
        tooltip.push(`${icons[event.type]} ${event.text}`);
      });
      
      return tooltip.length > 0 ? tooltip.join('\n') : '';
    },
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme;
      
      // Toggle AdminLTE dark mode class on body
      if (this.isDarkTheme) {
        document.body.classList.add('dark-mode');
        document.documentElement.setAttribute('data-bs-theme', 'dark');
      } else {
        document.body.classList.remove('dark-mode');
        document.documentElement.setAttribute('data-bs-theme', 'light');
      }
      
      // Store preference in localStorage
      localStorage.setItem('hawker-theme', this.isDarkTheme ? 'dark' : 'light');
    },
    hasEventOnDate(date) {
      // Singapore Public Holidays 2025 with names
      const holidays = [
        { month: 1, day: 1, name: "New Year's Day" },
        { month: 1, day: 29, name: "Chinese New Year" },
        { month: 1, day: 30, name: "Chinese New Year (Day 2)" },
        { month: 3, day: 29, name: "Good Friday" },
        { month: 4, day: 13, name: "Hari Raya Puasa" },
        { month: 5, day: 1, name: "Labour Day" },
        { month: 5, day: 12, name: "Vesak Day" },
        { month: 6, day: 19, name: "Hari Raya Haji" },
        { month: 8, day: 9, name: "National Day" },
        { month: 10, day: 31, name: "Deepavali" },
        { month: 12, day: 25, name: "Christmas Day" }
      ];
      
      const currentMonth = date.getMonth() + 1;
      const currentDay = date.getDate();
      
      return holidays.find(holiday => 
        holiday.month === currentMonth && holiday.day === currentDay
      );
    },
    getHolidayName(date) {
      const holiday = this.hasEventOnDate(date);
      return holiday ? holiday.name : null;
    },
    getHawkerEvents(date) {
      // Hawker-specific events based on day patterns
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      const dateNum = date.getDate();
      
      const events = [];
      
      // Weekend peak hours
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        events.push({ type: 'peak', text: 'Weekend Peak' });
      }
      
      // Payday rush (15th and last day of month)
      if (dateNum === 15) {
        events.push({ type: 'payday', text: 'Mid-Month Payday Rush' });
      }
      
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      if (dateNum === lastDay) {
        events.push({ type: 'payday', text: 'Month-End Payday Rush' });
      }
      
      // Market delivery days (Mondays, Wednesdays, Fridays)
      if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
        events.push({ type: 'delivery', text: 'Market Delivery Day' });
      }
      
      // Festival preparation days (day before holidays)
      const tomorrow = new Date(date);
      tomorrow.setDate(date.getDate() + 1);
      if (this.hasEventOnDate(tomorrow)) {
        events.push({ type: 'prep', text: 'Festival Prep Day' });
      }
      
      return events;
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
          maintainAspectRatio: false,
          plugins: { 
            legend: { 
              position: 'bottom',
              align: 'center',
              labels: {
                usePointStyle: true,
                padding: 15,
                boxWidth: 12,
                boxHeight: 12,
                generateLabels: function(chart) {
                  const data = chart.data;
                  if (data.labels.length && data.datasets.length) {
                    return data.labels.map((label, i) => {
                      const meta = chart.getDatasetMeta(0);
                      const style = meta.controller.getStyle(i);
                      return {
                        text: label,
                        fillStyle: style.backgroundColor,
                        strokeStyle: style.borderColor,
                        lineWidth: style.borderWidth,
                        pointStyle: 'rect',
                        hidden: isNaN(data.datasets[0].data[i]) || meta.data[i].hidden,
                        index: i
                      };
                    });
                  }
                  return [];
                }
              }
            }
          }
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
    // Initialize charts
    this.renderSalesChart();
    this.renderDonutChart();
    this.renderMenuItemsBarChart();
    this.renderDiscountBarChart();
    
    // Load saved events
    this.loadEventsFromStorage();
    
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('hawker-theme');
    if (savedTheme === 'dark') {
      this.isDarkTheme = true;
      document.body.classList.add('dark-mode');
      document.documentElement.setAttribute('data-bs-theme', 'dark');
    }
    
    // Initialize Bootstrap tooltips
    this.$nextTick(() => {
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });
    });
  }
}
</script>

<style scoped>
/* Enhanced Green Theme */
body {
  background: linear-gradient(135deg, #f0f9f4 0%, #e8f5e8 50%, #f0fdf4 100%) !important;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.ha-card {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(34, 197, 94, 0.08);
  margin-bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(34, 197, 94, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
}

.ha-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #10b981, #059669, #047857);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.ha-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 60px rgba(34, 197, 94, 0.15);
}

.ha-card:hover::before {
  opacity: 1;
}

.ha-card-info {
  background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
  color: #fff;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
}

.ha-card-success {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%);
  color: #fff;
  box-shadow: 0 8px 32px rgba(34, 197, 94, 0.3);
}

.ha-card-warning {
  background: linear-gradient(135deg, #84cc16 0%, #65a30d 50%, #4d7c0f 100%);
  color: #fff;
  box-shadow: 0 8px 32px rgba(132, 204, 22, 0.3);
}

.ha-card-primary {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%);
  color: #fff;
  box-shadow: 0 8px 32px rgba(6, 182, 212, 0.3);
}
.ha-card-body {
  padding: 1.5rem;
  position: relative;
}

.ha-card-header {
  padding: 1rem 1.5rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  min-height: 60px;
  backdrop-filter: blur(10px);
}

.ha-card-header.d-flex {
  justify-content: space-between;
}

.ha-card-header .form-select {
  min-width: 120px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(10px);
}

.ha-card-header .form-select:focus {
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.calendar-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.calendar-actions .btn {
  height: 40px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.calendar-actions .btn-success {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border: none;
  color: white;
}

.calendar-actions .btn-warning {
  background: linear-gradient(135deg, #84cc16, #65a30d);
  border: none;
  color: white;
}

.calendar-actions .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.ha-display-6 {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Enhanced Light Theme Container */
.container {
  background: transparent;
  transition: all 0.3s ease;
}

body {
  background: linear-gradient(135deg, #f0f9f4 0%, #e8f5e8 50%, #f0fdf4 100%) !important;
  transition: all 0.3s ease;
  position: relative;
}

body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

/* Enhanced Dashboard Header */
h2 {
  background: linear-gradient(135deg, #059669, #047857, #065f46);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  font-size: 2.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Enhanced Button Styles */
.btn-outline-secondary {
  border: 2px solid #10b981;
  color: #10b981;
  background: rgba(16, 185, 129, 0.05);
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.btn-outline-secondary:hover {
  background: #10b981;
  border-color: #10b981;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
}

.btn-primary {
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

/* Enhanced Calendar Styles */
.calendar-container {
  font-size: 0.95rem;
}

/* Clean Calendar Grid with Green Theme */
.calendar-grid-clean {
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(34, 197, 94, 0.1);
}

.calendar-header-clean {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
}

.calendar-day-header-clean {
  padding: 1rem 0.75rem;
  text-align: center;
  font-weight: 700;
  font-size: 0.9rem;
  border-right: 1px solid rgba(34, 197, 94, 0.15);
  color: #047857;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(5, 150, 105, 0.05));
}

.calendar-day-header-clean:last-child {
  border-right: none;
}

.calendar-body-clean {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-day-clean {
  padding: 0.75rem;
  text-align: center;
  border-right: 1px solid rgba(34, 197, 94, 0.1);
  border-bottom: 1px solid rgba(34, 197, 94, 0.1);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  background: rgba(255, 255, 255, 0.7);
}

.calendar-day-clean:last-child {
  border-right: none;
}

.calendar-day-clean:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(34, 197, 94, 0.2);
}

.calendar-day-clean.other-month {
  color: #9ca3af;
  background: rgba(249, 250, 251, 0.5);
}

.calendar-day-clean.today {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
}

.calendar-day-clean.today:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: scale(1.05);
}

.calendar-day-clean.has-holiday {
  border-left: 4px solid #22c55e;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05));
}

.calendar-day-clean.has-custom-event {
  border-top: 4px solid #84cc16;
  background: linear-gradient(135deg, rgba(132, 204, 22, 0.1), rgba(101, 163, 13, 0.05));
}

.date-number-clean {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.event-dots {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: auto;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #ffc107;
  display: inline-block;
}

.event-more {
  font-size: 0.6rem;
  color: #6c757d;
  margin-left: 2px;
}

.holiday-indicator-clean {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 0.7rem;
}

.selected-date-events {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
}

.event-item {
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
  border-left: 3px solid #ffc107;
}

.calendar-actions {
  display: flex;
  gap: 0.5rem;
}

/* Legacy Calendar Styles (kept for compatibility) */
.calendar-container {
  font-size: 0.9rem;
}

.calendar-grid {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  overflow: hidden;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #f8f9fa;
}

.calendar-day-header {
  padding: 0.5rem;
  text-align: center;
  font-weight: 600;
  border-right: 1px solid #dee2e6;
  border-bottom: 1px solid #dee2e6;
}

.calendar-day-header:last-child {
  border-right: none;
}

.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-day {
  padding: 0.3rem;
  text-align: center;
  border-right: 1px solid #dee2e6;
  border-bottom: 1px solid #dee2e6;
  cursor: pointer;
  transition: background-color 0.2s;
  min-height: 45px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.calendar-day:last-child {
  border-right: none;
}

.calendar-day:hover {
  background-color: #e9ecef;
}

.calendar-day.other-month {
  color: #6c757d;
  background-color: #f8f9fa;
}

.calendar-day.today {
  background-color: #007bff;
  color: white;
  font-weight: bold;
}

.calendar-day.has-event {
  background-color: #28a745;
  color: white;
  font-weight: bold;
}

.calendar-day.has-hawker-events {
  border-left: 3px solid #ffc107;
}

.calendar-day.has-event.today {
  background-color: #17a2b8;
  color: white;
}

.date-number {
  font-size: 0.9rem;
}

.event-indicators {
  display: flex;
  flex-wrap: wrap;
  gap: 1px;
  font-size: 0.6rem;
  line-height: 1;
}

.event-indicators span {
  display: inline-block;
}

.calendar-nav button {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-legend {
  border-top: 1px solid #dee2e6;
  padding-top: 0.5rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 4px;
  display: inline-block;
}

/* Enhanced Dark Theme Styles */
.dark-mode .container {
  background: transparent;
}

.dark-mode body {
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%) !important;
}

.dark-mode body::before {
  background: 
    radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.1) 0%, transparent 50%);
}

.dark-mode h2 {
  background: linear-gradient(135deg, #10b981, #34d399, #6ee7b7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark-mode .ha-card {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(16, 185, 129, 0.2);
  backdrop-filter: blur(20px);
}

.dark-mode .ha-card::before {
  background: linear-gradient(90deg, #10b981, #059669, #047857);
}

.dark-mode .ha-card-header {
  background: rgba(15, 23, 42, 0.6);
  border-bottom: 1px solid rgba(16, 185, 129, 0.2);
  color: #e2e8f0;
}

.dark-mode .ha-card-info {
  background: linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%);
  box-shadow: 0 8px 32px rgba(15, 118, 110, 0.4);
}

.dark-mode .ha-card-success {
  background: linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%);
  box-shadow: 0 8px 32px rgba(6, 95, 70, 0.4);
}

.dark-mode .ha-card-warning {
  background: linear-gradient(135deg, #365314 0%, #4d7c0f 50%, #65a30d 100%);
  box-shadow: 0 8px 32px rgba(54, 83, 20, 0.4);
}

.dark-mode .ha-card-primary {
  background: linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #06b6d4 100%);
  box-shadow: 0 8px 32px rgba(14, 116, 144, 0.4);
}

.dark-mode .btn-outline-secondary {
  border-color: #10b981;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.dark-mode .btn-outline-secondary:hover {
  background: #10b981;
  border-color: #10b981;
  color: #0f172a;
}

.dark-mode .btn-primary {
  background: linear-gradient(135deg, #059669, #047857);
  box-shadow: 0 4px 15px rgba(5, 150, 105, 0.4);
}

.dark-mode .btn-primary:hover {
  background: linear-gradient(135deg, #047857, #065f46);
  box-shadow: 0 8px 25px rgba(5, 150, 105, 0.5);
}

.dark-mode h2, .dark-mode h5, .dark-mode p, .dark-mode span {
  color: #fff !important;
}

.dark-mode .btn-outline-secondary {
  border-color: #6c757d;
  color: #fff;
}

.dark-mode .btn-outline-secondary:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

.dark-mode .form-select {
  background-color: #495057;
  border-color: #6c757d;
  color: #fff;
}

.dark-mode .form-control {
  background-color: #495057;
  border-color: #6c757d;
  color: #fff;
}

.dark-mode .list-group-item {
  background-color: #495057;
  border-color: #6c757d;
  color: #fff;
}

.dark-mode .ha-card {
  background-color: #343a40;
  color: #fff;
  border: 1px solid #495057;
}

.dark-mode .ha-card-header {
  background-color: #495057;
  border-bottom: 1px solid #6c757d;
  color: #fff;
}

.dark-mode .chart-legend {
  color: #fff;
}

.dark-mode .calendar-actions .btn {
  background-color: transparent;
  border-color: #6c757d;
  color: #fff;
}

.dark-mode .calendar-actions .btn:hover {
  background-color: #495057;
}

.dark-mode .donut-chart-container .chartjs-legend {
  color: #fff !important;
}

.dark-mode .donut-chart-container .chartjs-legend li {
  color: #fff !important;
}

.dark-mode .calendar-grid {
  border-color: #495057;
}

.dark-mode .calendar-day-header {
  background-color: #495057;
  border-color: #6c757d;
  color: #fff;
}

.dark-mode .calendar-day {
  border-color: #495057;
  color: #fff;
}

.dark-mode .calendar-day:hover {
  background-color: #495057;
}

.dark-mode .calendar-day.other-month {
  background-color: #2c3136;
  color: #868e96;
}

.dark-mode .calendar-legend {
  border-top-color: #495057;
  color: #fff;
}

/* Dark mode for clean calendar styles */
.dark-mode .calendar-grid-clean {
  background-color: #343a40;
  border-color: #495057;
}

.dark-mode .calendar-header-clean {
  background-color: #495057;
  border-color: #6c757d;
  color: #fff;
}

.dark-mode .calendar-day-clean {
  background-color: #2c3136;
  border-color: #495057;
  color: #fff;
}

.dark-mode .calendar-day-clean:hover {
  background-color: #495057;
}

.dark-mode .calendar-day-clean.other-month {
  background-color: #1a1e21;
  color: #6c757d;
}

.dark-mode .calendar-day-clean.has-events {
  background-color: #495057;
}

.dark-mode .calendar-day-clean .event-indicator {
  background-color: #ffd43b;
}

.dark-mode .calendar-day-clean.holiday {
  background-color: #721c24;
  color: #f5c6cb;
}

/* Donut Chart Specific Styling */
.donut-chart-container {
  height: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.donut-chart-container canvas {
  max-height: 280px !important;
  max-width: 280px !important;
  margin: 0 auto;
}

/* Layout alignment improvements */
.ha-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.ha-card .card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.ha-card .card-title {
  align-self: flex-start;
  margin-bottom: 1rem;
}

.todo-list {
  width: 100%;
}

.todo-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.calendar-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.calendar-grid-clean {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.calendar-body-clean {
  flex: 1;
}

.calendar-day-clean {
  align-items: flex-start;
  justify-content: flex-start;
  padding-top: 0.5rem;
}

.date-number-clean {
  align-self: flex-start;
  width: 100%;
  text-align: left;
  margin-bottom: 0.25rem;
}

.event-dots {
  align-self: flex-start;
  margin-top: 0.25rem;
}

/* Chart containers alignment */
.chart-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* Form elements alignment */
.form-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.form-label {
  align-self: flex-start;
  margin-bottom: 0.5rem;
}

/* Row alignment improvements */
.row.align-items-start {
  align-items: flex-start !important;
}

/* Chart Legend Alignment */
.chart-container {
  position: relative;
  height: 100%;
}

.chart-legend {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  flex-wrap: wrap;
}

.chart-legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

/* Button Group Alignment */
.btn-group, .btn-toolbar {
  align-items: center;
  gap: 0.5rem;
}

.form-select {
  height: 35px !important;
}

/* Chart.js Legend Override */
.donut-chart-container .chartjs-legend {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  padding: 1rem 0 !important;
}

.donut-chart-container .chartjs-legend ul {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  gap: 1rem !important;
  margin: 0 !important;
  padding: 0 !important;
  list-style: none !important;
}

.donut-chart-container .chartjs-legend li {
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
  margin: 0 !important;
}

.donut-chart-container .chartjs-legend li span {
  display: inline-block !important;
  width: 12px !important;
  height: 12px !important;
  border-radius: 2px !important;
}

/* Print Styles */
@media print {
  @page {
    size: A4 potrait;
    margin: 0.3in;
  }
  
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    font-size: 12px;
  }
  
  .container {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  .row {
    margin: 0 !important;
    page-break-inside: avoid;
  }
  
  .col, .col-md-3, .col-lg-6 {
    padding: 0.15rem !important;
  }
  
  .ha-card {
    margin-bottom: 0.3rem !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12) !important;
    border: 1px solid #e0e0e0 !important;
    page-break-inside: avoid;
    border-radius: 0.25rem !important;
  }
  
  .ha-card-body {
    padding: 0.4rem !important;
  }
  
  .ha-card-header {
    padding: 0.4rem !important;
    font-size: 0.85rem !important;
    font-weight: 600;
  }
  
  .ha-display-6 {
    font-size: 1.2rem !important;
    margin: 0.2rem 0 !important;
  }
  
  canvas {
    max-height: none !important;
    width: 100% !important;
    height: auto !important;
  }
  
  /* Donut chart specific print sizing */
  .donut-chart-container {
    max-height: 140px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  
  .donut-chart-container canvas {
    max-height: 120px !important;
    max-width: 120px !important;
    aspect-ratio: 1/1 !important;
  }
  
  .btn {
    display: none !important;
  }
  
  h2 {
    font-size: 1.3rem !important;
    margin-bottom: 0.3rem !important;
    page-break-after: avoid;
  }
  
  /* Maintain chart aspect ratio */
  .chart-container {
    height: auto !important;
    aspect-ratio: 2/1 !important;
    max-height: 180px !important;
  }
  
  /* Hide interactive elements */
  .form-select {
    display: none !important;
  }
  
  /* Compact todo list */
  .todo-item, li {
    font-size: 0.75rem !important;
    padding: 0.15rem !important;
    margin: 0.1rem 0 !important;
  }
  
  /* Force charts row to stay together */
  .row.mb-4:nth-child(3) {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  
  /* Optimize spacing for stats cards */
  .row.mb-4:nth-child(2) .col-md-3 {
    margin-bottom: 0.2rem !important;
  }
  
  /* Ensure header stays with content */
  .row.mb-4:first-child {
    page-break-after: avoid;
  }
  
  /* Compact input groups */
  .input-group {
    display: none !important;
  }
  
  /* Better utilization of space */
  .col-lg-6 {
    flex: 0 0 50% !important;
    max-width: 50% !important;
  }
  
  .col-md-3 {
    flex: 0 0 25% !important;
    max-width: 25% !important;
  }
}
</style>