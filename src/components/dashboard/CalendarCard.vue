<template>
  <div class="card border-0 shadow-sm h-100" :class="{ 'dark-mode-card': darkMode }" style="border-radius: 12px; overflow: hidden;">
    <div class="card-header border-0 d-flex justify-content-between align-items-center flex-wrap gap-2" :class="darkMode ? 'bg-dark-header' : 'bg-white'" style="padding: 1.25rem 1.5rem;">
      <h5 class="mb-0 fw-semibold" :style="{ color: darkMode ? '#10b981' : '#059669', fontSize: '1.1rem' }">
        <i class="fas fa-calendar-alt me-2"></i>Calendar
      </h5>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-success" style="border-radius: 8px; padding: 0.375rem 0.75rem;" @click="$emit('add-event')">
          <i class="fas fa-plus"></i> Add Event
        </button>
        <button class="btn btn-sm btn-outline-danger" style="border-radius: 8px; padding: 0.375rem 0.75rem;" @click="$emit('clear-events')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    
    <div class="card-body" :class="{ 'dark-body': darkMode }" style="padding: 1.5rem;">
      <div class="calendar-nav d-flex justify-content-between align-items-center mb-3 p-2" :style="{ background: darkMode ? '#0f172a' : '#f9fafb', borderRadius: '8px' }">
        <button class="btn btn-sm btn-outline-success" style="border-radius: 6px; width: 36px; height: 36px;" @click="previousMonth">
          <i class="fas fa-chevron-left"></i>
        </button>
        <span class="fw-semibold" :style="{ color: darkMode ? '#10b981' : '#059669' }">{{ currentMonthYear }}</span>
        <button class="btn btn-sm btn-outline-success" style="border-radius: 6px; width: 36px; height: 36px;" @click="nextMonth">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <div class="calendar-grid" :class="{ 'dark-calendar': darkMode }">
        <div class="calendar-header">
          <div v-for="day in dayHeaders" :key="day" class="calendar-day-header">{{ day }}</div>
        </div>
        <div class="calendar-body">
          <div v-for="(day, index) in calendarDays" :key="index" 
               :class="getDayClasses(day)" @click="selectDate(day)">
            <div class="date-number">{{ day.date }}</div>
            <div v-if="day.customEvents.length > 0" class="event-indicators">
              <div class="event-dots">
                <span v-for="(event, idx) in day.customEvents.slice(0, 2)" :key="idx" 
                      class="event-dot" :title="event.title"></span>
              </div>
            </div>
            <div v-if="day.hasEvent" class="holiday-badge">
              <i class="fas fa-gift" style="font-size: 0.6rem;"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="selectedDate" class="selected-date-events mt-4 p-3" :class="{ 'dark-events': darkMode }" :style="{ background: darkMode ? '#0f172a' : '#f0fdf4', borderRadius: '8px', border: darkMode ? '1px solid #334155' : '1px solid #bbf7d0' }">
        <h6 class="mb-3 fw-semibold" :style="{ color: darkMode ? '#10b981' : '#059669', fontSize: '0.9rem' }">
          <i class="fas fa-calendar-day me-2"></i>{{ formatSelectedDate }}
        </h6>
        <div v-if="getEventsForSelectedDate().length === 0" class="text-muted small">
          No events scheduled
        </div>
        <div v-else class="event-list">
          <div v-for="(event, idx) in getEventsForSelectedDate()" :key="idx" 
               class="event-item d-flex justify-content-between align-items-center mb-2 p-2" 
               style="background: white; border-radius: 6px; border: 1px solid #d1fae5;">
            <span class="fw-medium" style="font-size: 0.875rem;">{{ event.title }}</span>
            <button class="btn btn-sm btn-outline-danger" style="border-radius: 6px; padding: 0.125rem 0.5rem;" @click="$emit('remove-event', event.id)">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CalendarCard',
  props: {
    events: { type: Array, required: true },
    darkMode: { type: Boolean, default: false }
  },
  data() {
    return {
      currentDate: new Date(),
      selectedDate: null,
      dayHeaders: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    }
  },
  computed: {
    currentMonthYear() {
      return this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    },
    formatSelectedDate() {
      return this.selectedDate?.toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      }) || ''
    },
    calendarDays() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      const today = new Date()
      const firstDay = new Date(year, month, 1)
      const startDate = new Date(firstDay)
      startDate.setDate(firstDay.getDate() - firstDay.getDay())
      
      const days = []
      const currentDate = new Date(startDate)
      
      for (let i = 0; i < 42; i++) {
        days.push({
          date: currentDate.getDate(),
          fullDate: new Date(currentDate),
          isCurrentMonth: currentDate.getMonth() === month,
          isToday: currentDate.toDateString() === today.toDateString(),
          hasEvent: !!this.hasHoliday(currentDate),
          customEvents: this.getCustomEventsForDate(currentDate)
        })
        currentDate.setDate(currentDate.getDate() + 1)
      }
      return days
    }
  },
  methods: {
    previousMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1)
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1)
    },
    selectDate(day) {
      this.selectedDate = day.fullDate
    },
    getDayClasses(day) {
      return [
        'calendar-day',
        { 'other-month': !day.isCurrentMonth },
        { 'today': day.isToday },
        { 'has-holiday': day.hasEvent },
        { 'has-event': day.customEvents.length > 0 }
      ]
    },
    getCustomEventsForDate(date) {
      return this.events.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate.toDateString() === date.toDateString()
      })
    },
    getEventsForSelectedDate() {
      return this.selectedDate ? this.getCustomEventsForDate(this.selectedDate) : []
    },
    hasHoliday(date) {
      const holidays = [
        { month: 1, day: 1 }, { month: 1, day: 29 }, { month: 1, day: 30 },
        { month: 3, day: 29 }, { month: 4, day: 13 }, { month: 5, day: 1 },
        { month: 5, day: 12 }, { month: 6, day: 19 }, { month: 8, day: 9 },
        { month: 10, day: 31 }, { month: 12, day: 25 }
      ]
      const month = date.getMonth() + 1
      const day = date.getDate()
      return holidays.find(h => h.month === month && h.day === day)
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
.calendar-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0;
  margin-bottom: 0.5rem;
}
.calendar-day-header {
  text-align: center;
  font-weight: 600;
  font-size: 0.75rem;
  color: #6b7280;
  padding: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}
.calendar-day {
  aspect-ratio: 1;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}
.calendar-day:hover {
  background: #f0fdf4;
  border-color: #86efac;
  transform: scale(1.05);
  z-index: 1;
}
.calendar-day.other-month {
  opacity: 0.3;
  background: #fafafa;
}
.calendar-day.today {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 2px solid #10b981;
  font-weight: 700;
}
.calendar-day.has-event {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #fbbf24;
}
.date-number {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}
.calendar-day.today .date-number {
  color: #059669;
}
.event-indicators {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: auto;
}
.event-dots {
  display: flex;
  gap: 3px;
  justify-content: center;
}
.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  display: inline-block;
}
.holiday-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  color: #dc2626;
  font-size: 0.7rem;
}
.event-list {
  max-height: 200px;
  overflow-y: auto;
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

.dark-calendar .calendar-day-header {
  color: #10b981 !important;
}

.dark-calendar .calendar-day {
  background: #0f172a !important;
  border-color: #334155 !important;
}

.dark-calendar .calendar-day:hover {
  background: #1e293b !important;
  border-color: #10b981 !important;
}

.dark-calendar .calendar-day.other-month {
  background: #0a0f1a !important;
  opacity: 0.4;
}

.dark-calendar .calendar-day.today {
  background: linear-gradient(135deg, #065f46 0%, #047857 100%) !important;
  border-color: #10b981 !important;
}

.dark-calendar .calendar-day.today .date-number {
  color: #10b981 !important;
}

.dark-calendar .calendar-day.has-event {
  background: linear-gradient(135deg, #7c2d12 0%, #92400e 100%) !important;
  border-color: #f59e0b !important;
}

.dark-calendar .date-number {
  color: #e2e8f0 !important;
}

.dark-events {
  color: #e2e8f0 !important;
}

@media (max-width: 768px) {
  .calendar-day {
    padding: 0.25rem;
  }
  .date-number {
    font-size: 0.75rem;
  }
  .event-dot {
    width: 4px;
    height: 4px;
  }
}
</style>
