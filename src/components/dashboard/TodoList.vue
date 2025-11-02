<template>
  <div class="card border-0 shadow-sm h-100" :class="{ 'dark-mode-card': darkMode }" style="border-radius: 12px; overflow: hidden;">
    <div class="card-header border-0" :class="darkMode ? 'bg-dark-header' : 'bg-white'" style="padding: 1.25rem 1.5rem;">
      <h5 class="mb-0 fw-semibold" :style="{ color: darkMode ? '#10b981' : '#059669', fontSize: '1.1rem' }">
        <i class="fas fa-list-check me-2"></i>To-Do List
      </h5>
    </div>
    <div class="card-body" :class="{ 'dark-body': darkMode }" style="padding: 1.5rem;">
      <div class="todo-list mb-3">
        <div v-for="(item, idx) in items" :key="idx" 
             class="todo-item d-flex justify-content-between align-items-center mb-2 p-3"
             :class="{ 'dark-todo-item': darkMode }"
             :style="{ background: darkMode ? '#0f172a' : '#f9fafb', borderRadius: '8px', border: darkMode ? '1px solid #334155' : '1px solid #e5e7eb', transition: 'all 0.2s' }">
          <div class="d-flex align-items-center gap-2 flex-grow-1">
            <input type="checkbox" :checked="item.done" @change="$emit('toggle', idx)"
                   class="form-check-input" :class="{ 'dark-checkbox': darkMode }" style="width: 20px; height: 20px; cursor: pointer; border-radius: 4px;">
            <span :class="{ 'text-decoration-line-through': item.done }" 
                  :style="{ 
                    fontWeight: item.done ? '400' : '500', 
                    fontSize: '0.9rem',
                    color: item.done ? (darkMode ? '#64748b' : '#9ca3af') : (darkMode ? '#e2e8f0' : '#374151')
                  }">
              {{ item.text }}
            </span>
          </div>
        </div>
      </div>
      <div class="input-group">
        <input v-model="newTodo" type="text" class="form-control" 
               :class="{ 'dark-input': darkMode }"
               :style="{ 
                 borderRadius: '8px 0 0 8px', 
                 borderColor: darkMode ? '#334155' : '#d1d5db', 
                 padding: '0.625rem 0.875rem',
                 background: darkMode ? '#0f172a' : 'white',
                 color: darkMode ? '#e2e8f0' : '#374151'
               }"
               placeholder="Add new task..." @keyup.enter="addTodo">
        <button class="btn btn-success" style="border-radius: 0 8px 8px 0; padding: 0.625rem 1.25rem;" @click="addTodo">
          <i class="fas fa-plus me-1"></i>Add
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TodoList',
  props: {
    items: { type: Array, required: true },
    darkMode: { type: Boolean, default: false }
  },
  data() {
    return {
      newTodo: ''
    }
  },
  methods: {
    addTodo() {
      if (this.newTodo.trim()) {
        this.$emit('add', this.newTodo)
        this.newTodo = ''
      }
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
.todo-item {
  transition: all 0.2s ease;
}
.todo-item:hover {
  background: #f0fdf4 !important;
  border-color: #86efac !important;
  transform: translateX(4px);
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

.dark-todo-item:hover {
  background: #1e293b !important;
  border-color: #10b981 !important;
}

.dark-checkbox {
  background: #0f172a !important;
  border-color: #334155 !important;
}

.dark-checkbox:checked {
  background: #10b981 !important;
  border-color: #10b981 !important;
}

.dark-input:focus {
  background: #0f172a !important;
  border-color: #10b981 !important;
  color: #e2e8f0 !important;
  box-shadow: 0 0 0 0.2rem rgba(16, 185, 129, 0.25) !important;
}

.dark-input::placeholder {
  color: #64748b !important;
}

.form-check-input:checked {
  background-color: #10b981;
  border-color: #10b981;
}
.todo-list {
  max-height: 400px;
  overflow-y: auto;
}
</style>
