<template>
  <div class="hawker-analytics" :class="{ 'dark-theme': isDarkTheme }" style="min-height: 100vh; transition: all 0.3s ease;">
    <!-- Navigation Tabs -->
    <div class="container-fluid px-3 px-md-4">
      <HawkerNavTabs/>
    </div>

    <div class="container-fluid px-3 px-md-4 py-2 py-md-3">
      <div class="row mb-2 mb-md-3 align-items-stretch g-2 g-md-3">
        <!-- Hawker Profile Card -->
        <div class="col-12 col-md-5 col-lg-6">
          <div class="hawker-profile-card" 
               :class="{ 'dark-profile-card': isDarkTheme }"
               style="border-radius: 16px; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15); overflow: hidden; position: relative;">
            <!-- Background Pattern (transparent overlay so CSS gradient shows through) -->
            <div class="profile-pattern" :style="{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              background: 'transparent',
              opacity: 0
            }"></div>
            
            <!-- Content -->
            <div style="position: relative; z-index: 1; padding: 1.25rem;">
              <!-- Greeting Section -->
              <div class="mb-2">
                <div class="d-flex align-items-center gap-2 mb-1">
                  <div class="profile-icon" :style="{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '12px',
                    background: isDarkTheme ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }">
                    {{ greeting.emoji }}
                  </div>
                  <div class="flex-grow-1">
                    <p class="mb-0" :style="{ 
                      fontSize: '0.75rem', 
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: isDarkTheme ? '#10b981' : '#059669',
                      opacity: 0.9
                    }">
                      {{ greeting.text }}
                    </p>
                    <h2 class="mb-0 fw-bold" :style="{ 
                      fontSize: '1.4rem',
                      letterSpacing: '-0.5px',
                      color: isDarkTheme ? '#f1f5f9' : '#1f2937'
                    }">
                      {{ hawkerName }}
                    </h2>
                  </div>
                </div>
              </div>
              
              <!-- Info Cards -->
              <div class="d-flex flex-column gap-1">
                <div class="info-chip" :style="{ 
                  background: isDarkTheme ? 'rgba(15, 23, 42, 0.6)' : 'white',
                  borderRadius: '10px',
                  padding: '0.6rem 0.85rem',
                  border: isDarkTheme ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(5, 150, 105, 0.15)',
                  backdropFilter: 'blur(10px)'
                }">
                  <div class="d-flex align-items-center">
                    <div :style="{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '8px',
                      background: isDarkTheme ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '0.75rem'
                    }">
                      <i class="fas fa-clock" :style="{ color: '#10b981', fontSize: '0.875rem' }"></i>
                    </div>
                    <span :style="{ 
                      fontSize: '0.875rem', 
                      fontWeight: '500',
                      color: isDarkTheme ? '#e2e8f0' : '#374151'
                    }">{{ hawkerOpeningHours }}</span>
                  </div>
                </div>
                
                <div class="info-chip" :style="{ 
                  background: isDarkTheme ? 'rgba(15, 23, 42, 0.6)' : 'white',
                  borderRadius: '10px',
                  padding: '0.6rem 0.85rem',
                  border: isDarkTheme ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(251, 191, 36, 0.15)',
                  backdropFilter: 'blur(10px)'
                }">
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                      <div :style="{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '8px',
                        background: isDarkTheme ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '0.75rem'
                      }">
                        <i class="fas fa-star" :style="{ color: '#fbbf24', fontSize: '0.875rem' }"></i>
                      </div>
                      <div>
                        <span :style="{ 
                          fontSize: '1.125rem', 
                          fontWeight: '700',
                          color: isDarkTheme ? '#fbbf24' : '#f59e0b',
                          marginRight: '0.5rem'
                        }">{{ hawkerRating.toFixed(1) }}</span>
                        <span :style="{ 
                          fontSize: '0.813rem',
                          color: isDarkTheme ? '#94a3b8' : '#6b7280'
                        }">
                          ({{ hawkerReviewCount }} reviews)
                        </span>
                        <!-- See reviews link navigates to the buyer stall page and anchors to reviews -->
                        <router-link
                          :to="{ path: `/buyer-view-stall/${hawkerOwnerId || currentHawkerId}`, hash: '#reviews' }"
                          class="see-reviews-link"
                          style="margin-left:0.5rem; font-size:0.813rem; color: #059669; font-weight:600; text-decoration:none;"
                        >
                          See reviews
                        </router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Filter Buttons -->
        <div class="col-12 col-md-7 col-lg-6">
          <div class="d-flex flex-wrap justify-content-start justify-content-md-end align-items-center gap-2">
            <div class="btn-group shadow-sm" role="group" style="border-radius: 10px; overflow: hidden;">
              <button 
                type="button" 
                class="btn px-2 px-sm-3 px-md-4 py-2 fw-semibold filter-btn" 
                :class="globalFilter === 'day' ? 'btn-success' : 'btn-outline-success'"
                @click="setGlobalFilter('day')"
                style="border-radius: 0; transition: all 0.3s ease; font-size: 0.875rem;">
                <i class="fas fa-calendar-day me-1 d-none d-md-inline"></i>Day
              </button>
              <button 
                type="button" 
                class="btn px-2 px-sm-3 px-md-4 py-2 fw-semibold filter-btn" 
                :class="globalFilter === 'week' ? 'btn-success' : 'btn-outline-success'"
                @click="setGlobalFilter('week')"
                style="transition: all 0.3s ease; font-size: 0.875rem;">
                <i class="fas fa-calendar-week me-1 d-none d-md-inline"></i>Week
              </button>
              <button 
                type="button" 
                class="btn px-2 px-sm-3 px-md-4 py-2 fw-semibold filter-btn" 
                :class="globalFilter === 'month' ? 'btn-success' : 'btn-outline-success'"
                @click="setGlobalFilter('month')"
                style="border-radius: 0; transition: all 0.3s ease; font-size: 0.875rem;">
                <i class="fas fa-calendar-alt me-1 d-none d-md-inline"></i>Month
              </button>
            </div>
            <button class="btn btn-theme shadow-sm px-2 px-sm-3 py-2 fw-semibold no-print" style="border-radius: 10px; transition: all 0.3s ease; font-size: 0.875rem; white-space: nowrap;" @click="toggleTheme">
              <i :class="isDarkTheme ? 'fas fa-sun' : 'fas fa-moon'" class="me-1"></i>
              <span class="d-none d-md-inline">{{ isDarkTheme ? 'Light' : 'Dark' }}</span>
            </button>
            <button class="btn btn-success shadow-sm px-2 px-sm-3 py-2 fw-semibold no-print" style="border-radius: 10px; transition: all 0.3s ease; font-size: 0.875rem; white-space: nowrap;" @click="generatePDF">
              <i class="fas fa-file-pdf me-1"></i>
              <span class="d-none d-md-inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row mb-2 mb-md-3 g-2 g-md-3">
        <div class="col-6 col-sm-6 col-md-3 col-lg-3">
          <div class="stat-card stat-card-success" style="border-radius: 12px; border: none; min-height: 120px; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15); transition: all 0.3s ease; cursor: pointer; margin-right:8px;">
            <div style="padding: 0.875rem 1rem; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
              <div class="d-flex justify-content-between align-items-start mb-1 mb-md-2">
                <div class="flex-grow-1" style="min-width: 0;">
                  <div class="d-flex align-items-center gap-1 mb-1">
                    <p class="text-white mb-0" style="font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; opacity: 0.9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Total Sales</p>
                    <span class="badge d-none d-lg-inline" :class="currentStats.salesChange >= 0 ? 'bg-light bg-opacity-25' : 'bg-danger bg-opacity-25'" style="font-size: 0.6rem; padding: 0.15rem 0.35rem; border-radius: 6px; flex-shrink: 0;">
                      <i :class="currentStats.salesChange >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'" style="font-size: 0.5rem;"></i>
                      {{ Math.abs(currentStats.salesChange) }}%
                    </span>
                  </div>
                  <h3 class="text-white mb-0 fw-bold" style="font-size: 1.35rem; letter-spacing: -0.5px;">{{ currentStats.totalSales }}</h3>
                </div>
                <div class="stat-icon d-none d-lg-flex" style="width: 40px; height: 40px; background: rgba(255,255,255,0.25); border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); flex-shrink: 0;">
                  <i class="fas fa-dollar-sign text-white" style="font-size: 1.25rem;"></i>
                </div>
              </div>
              <div class="d-flex align-items-center">
                <i class="fas fa-chart-line me-1 me-md-2 text-white d-none d-lg-inline" style="opacity: 0.8; font-size: 0.75rem;"></i>
                <p class="text-white mb-0" style="font-size: 0.65rem; opacity: 0.9; line-height: 1.2;">
                  Revenue for {{ globalFilter === 'day' ? 'today' : globalFilter === 'week' ? 'this week' : 'this month' }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-6 col-sm-6 col-md-3 col-lg-3">
          <div class="stat-card stat-card-info" style="border-radius: 12px; border: none; min-height: 120px; box-shadow: 0 4px 20px rgba(6, 182, 212, 0.15); transition: all 0.3s ease; cursor: pointer; margin-right:8px;">
            <div style="padding: 0.875rem 1rem; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
              <div class="d-flex justify-content-between align-items-start mb-1 mb-md-2">
                <div class="flex-grow-1" style="min-width: 0;">
                  <div class="d-flex align-items-center gap-1 mb-1">
                    <p class="text-white mb-0" style="font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; opacity: 0.9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Total Orders</p>
                    <span class="badge d-none d-lg-inline" :class="currentStats.ordersChange >= 0 ? 'bg-light bg-opacity-25' : 'bg-danger bg-opacity-25'" style="font-size: 0.6rem; padding: 0.15rem 0.35rem; border-radius: 6px; flex-shrink: 0;">
                      <i :class="currentStats.ordersChange >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'" style="font-size: 0.5rem;"></i>
                      {{ Math.abs(currentStats.ordersChange) }}%
                    </span>
                  </div>
                  <h3 class="text-white mb-0 fw-bold" style="font-size: 1.35rem; letter-spacing: -0.5px;">{{ currentStats.totalOrders }}</h3>
                </div>
                <div class="stat-icon d-none d-lg-flex" style="width: 40px; height: 40px; background: rgba(255,255,255,0.25); border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); flex-shrink: 0;">
                  <i class="fas fa-shopping-bag text-white" style="font-size: 1.25rem;"></i>
                </div>
              </div>
              <div class="d-flex align-items-center">
                <i class="fas fa-receipt me-1 me-md-2 text-white d-none d-lg-inline" style="opacity: 0.8; font-size: 0.75rem;"></i>
                <p class="text-white mb-0" style="font-size: 0.65rem; opacity: 0.9; line-height: 1.2;">
                  Orders received {{ globalFilter === 'day' ? 'today' : globalFilter === 'week' ? 'this week' : 'this month' }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-6 col-sm-6 col-md-3 col-lg-3">
          <div class="stat-card stat-card-warning" style="border-radius: 12px; border: none; min-height: 120px; box-shadow: 0 4px 20px rgba(245, 158, 11, 0.15); transition: all 0.3s ease; cursor: pointer; margin-right:8px;">
            <div style="padding: 0.875rem 1rem; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
              <div class="d-flex justify-content-between align-items-start mb-1 mb-md-2">
                <div class="flex-grow-1" style="min-width: 0;">
                  <div class="d-flex align-items-center gap-1 mb-1">
                    <p class="text-white mb-0" style="font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; opacity: 0.9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Peak Hour</p>
                    <span class="badge bg-light bg-opacity-25 d-none d-lg-inline" style="font-size: 0.6rem; padding: 0.15rem 0.35rem; border-radius: 6px; flex-shrink: 0;">
                      <i class="fas fa-info-circle" style="font-size: 0.5rem;"></i>
                      {{ globalFilter === 'day' ? 'Today' : globalFilter === 'week' ? 'Week' : 'Month' }}
                    </span>
                  </div>
                  <h3 class="text-white mb-0 fw-bold" style="font-size: 1.35rem; letter-spacing: -0.5px;">{{ currentStats.peakHour }}</h3>
                </div>
                <div class="stat-icon d-none d-lg-flex" style="width: 40px; height: 40px; background: rgba(255,255,255,0.25); border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); flex-shrink: 0;">
                  <i class="fas fa-clock text-white" style="font-size: 1.25rem;"></i>
                </div>
              </div>
              <div class="d-flex align-items-center">
                <i class="fas fa-fire me-1 me-md-2 text-white d-none d-lg-inline" style="opacity: 0.8; font-size: 0.75rem;"></i>
                <p class="text-white mb-0" style="font-size: 0.65rem; opacity: 0.9; line-height: 1.2;">
                  Busiest time slot
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-6 col-sm-6 col-md-3 col-lg-3">
          <div class="stat-card stat-card-primary" style="border-radius: 12px; border: none; min-height: 120px; box-shadow: 0 4px 20px rgba(139, 92, 246, 0.15); transition: all 0.3s ease; cursor: pointer; margin-right:8px;">
            <div style="padding: 0.875rem 1rem; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
              <div class="d-flex justify-content-between align-items-start mb-1 mb-md-2">
                <div class="flex-grow-1" style="min-width: 0;">
                  <div class="d-flex align-items-center gap-1 mb-1">
                    <p class="text-white mb-0" style="font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; opacity: 0.9; white-space: nowrap;">Best Seller</p>
                  </div>
                  <h3 class="text-white mb-0 fw-bold" style="font-size: 1.2rem; letter-spacing: -0.3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ currentStats.bestSeller }}</h3>
                </div>
                <div class="stat-icon d-none d-lg-flex" style="width: 40px; height: 40px; background: rgba(255,255,255,0.25); border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); flex-shrink: 0;">
                  <i class="fas fa-trophy text-white" style="font-size: 1.25rem;"></i>
                </div>
              </div>
              <div class="d-flex align-items-center">
                <i class="fas fa-star me-1 me-md-2 text-white d-none d-lg-inline" style="opacity: 0.8; font-size: 0.75rem;"></i>
                <p class="text-white mb-0" style="font-size: 0.65rem; opacity: 0.9; line-height: 1.2;">
                  Most popular item
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top 5 Menu Items & Sales by Period -->
      <div class="row mb-2 mb-md-3 g-2 g-md-3">
        <div class="col-12 col-md-6 col-lg-6">
          <ChartCard 
            v-if="!loading && allOrders.length > 0"
            title="Top 5 Menu Items"
            type="bar"
            :data="topMenuItemsData"
            :dark-mode="isDarkTheme"
          />
          <div v-else class="card" style="min-height: 250px; display: flex; align-items: center; justify-content: center;">
            <LoadingSpinner message="Loading chart data..." message-class="mt-3 text-muted" />
          </div>
        </div>
        <div class="col-12 col-md-6 col-lg-6">
          <ChartCard 
            v-if="!loading && allOrders.length > 0"
            title="Sales by Period"
            type="doughnut"
            :data="salesByPeriodData"
            :options="donutOptions"
            :dark-mode="isDarkTheme"
          />
          <div v-else class="card" style="min-height: 250px; display: flex; align-items: center; justify-content: center;">
            <LoadingSpinner message="Loading chart data..." message-class="mt-3 text-muted" />
          </div>
        </div>
      </div>

      <!-- Peak Hours & Customer Type Analysis -->
      <div class="row mb-2 mb-md-3 g-2 g-md-3">
        <div class="col-12 col-md-6 col-lg-6">
          <ChartCard 
            v-if="!loading && allOrders.length > 0"
            title="Peak Hours - Orders by Hour"
            type="line"
            :data="peakHoursData"
            :dark-mode="isDarkTheme"
          />
          <div v-else class="card" style="min-height: 250px; display: flex; align-items: center; justify-content: center;">
            <LoadingSpinner message="Loading chart data..." message-class="mt-3 text-muted" />
          </div>
        </div>
        <div class="col-12 col-md-6 col-lg-6">
          <ChartCard 
            v-if="!loading && allOrders.length > 0"
            title="Customer Type Analysis"
            type="bar"
            :data="customerTypeData"
            :dark-mode="isDarkTheme"
          />
          <div v-else class="card" style="min-height: 250px; display: flex; align-items: center; justify-content: center;">
            <LoadingSpinner message="Loading chart data..." message-class="mt-3 text-muted" />
          </div>
        </div>
      </div>

      <!-- Calendar & To-do List -->
      <div class="row mb-3 g-2 g-md-3 no-print">
        <div class="col-12 col-md-6 col-lg-6">
          <CalendarCard 
            :events="customEvents"
            :dark-mode="isDarkTheme"
            @add-event="showAddEventModal"
            @clear-events="clearAllEvents"
            @remove-event="removeEvent"
          />
        </div>
        <div class="col-12 col-md-6 col-lg-6">
          <TodoList 
            :items="todoList"
            :dark-mode="isDarkTheme"
            @add="addTodo"
            @toggle="toggleTodo"
            @delete="deleteTodo"
            @clear-all="clearAllTodos"
          />
        </div>
      </div>
    </div>

    <!-- Add Event Modal -->
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

    <!-- Clear All Todos Confirmation Modal -->
    <div class="modal fade" id="clearTodosModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="border-radius: 12px; border: none; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);">
          <div class="modal-header border-0" style="padding: 2rem 2rem 1rem; background: linear-gradient(135deg, #fef3c7 0%, #fde047 100%); border-radius: 12px 12px 0 0;">
            <div class="d-flex align-items-center gap-3">
              <div style="width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-exclamation-triangle" style="color: #f59e0b; font-size: 1.5rem;"></i>
              </div>
              <h5 class="modal-title fw-bold mb-0" style="color: #92400e;">Clear All Todos?</h5>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" style="padding: 1.5rem 2rem;">
            <p class="mb-0" style="color: #374151; font-size: 0.95rem; line-height: 1.6;">
              This will permanently delete all your todo items. This action cannot be undone.
            </p>
          </div>
          <div class="modal-footer border-0" style="padding: 1rem 2rem 2rem; gap: 0.75rem;">
            <button type="button" class="btn btn-outline-secondary" style="border-radius: 8px; padding: 0.625rem 1.5rem;" data-bs-dismiss="modal">
              <i class="fas fa-times me-1"></i>Cancel
            </button>
            <button type="button" class="btn btn-danger" style="border-radius: 8px; padding: 0.625rem 1.5rem;" @click="confirmClearTodos">
              <i class="fas fa-trash-alt me-1"></i>Clear All
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Clear All Events Confirmation Modal -->
    <div class="modal fade" id="clearEventsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="border-radius: 12px; border: none; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);">
          <div class="modal-header border-0" style="padding: 2rem 2rem 1rem; background: linear-gradient(135deg, #fef3c7 0%, #fde047 100%); border-radius: 12px 12px 0 0;">
            <div class="d-flex align-items-center gap-3">
              <div style="width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-exclamation-triangle" style="color: #f59e0b; font-size: 1.5rem;"></i>
              </div>
              <h5 class="modal-title fw-bold mb-0" style="color: #92400e;">Clear All Events?</h5>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" style="padding: 1.5rem 2rem;">
            <p class="mb-0" style="color: #374151; font-size: 0.95rem; line-height: 1.6;">
              This will permanently delete all your calendar events. This action cannot be undone.
            </p>
          </div>
          <div class="modal-footer border-0" style="padding: 1rem 2rem 2rem; gap: 0.75rem;">
            <button type="button" class="btn btn-outline-secondary" style="border-radius: 8px; padding: 0.625rem 1.5rem;" data-bs-dismiss="modal">
              <i class="fas fa-times me-1"></i>Cancel
            </button>
            <button type="button" class="btn btn-danger" style="border-radius: 8px; padding: 0.625rem 1.5rem;" @click="confirmClearEvents">
              <i class="fas fa-trash-alt me-1"></i>Clear All
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
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, getDocs, orderBy, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import HawkerNavTabs from '@/components/shared/HawkerNavTabs.vue'

export default {
  name: 'HawkerAnalytics',
  components: { ChartCard, CalendarCard, TodoList, LoadingSpinner, HawkerNavTabs },
  data() {
    return {
      isDarkTheme: false,
      globalFilter: 'day',
      currentHawkerId: null,
      hawkerListingId: null, // Store the actual hawker listing document ID
      hawkerOwnerId: null, // userId owner of the hawker listing (used for routing to buyer-view-stall)
      allOrders: [],
      loading: true,
      
      // Dummy data for different time periods - REMOVED, will be computed dynamically
      // statsData, salesTrendDummyData, topMenuItemsDummyData, etc.

      // Hawker profile data
      hawkerName: 'Loading...',
      hawkerOpeningHours: 'Loading...',
      hawkerRating: 0,
      hawkerReviewCount: 0,

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
    // Filter orders based on time period
    filteredOrders() {
      const now = new Date()
      now.setHours(0, 0, 0, 0) // Reset to start of day for accurate comparison
      
      const filtered = this.allOrders.filter(order => {
        const orderDate = this.getOrderDate(order)
        
        if (this.globalFilter === 'day') {
          // Compare dates without time component
          const orderDateOnly = new Date(orderDate)
          orderDateOnly.setHours(0, 0, 0, 0)
          const nowDateOnly = new Date()
          nowDateOnly.setHours(0, 0, 0, 0)
          return orderDateOnly.getTime() === nowDateOnly.getTime()
        } else if (this.globalFilter === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return orderDate >= weekAgo && orderDate <= now
        } else if (this.globalFilter === 'month') {
          return orderDate.getMonth() === now.getMonth() && 
                 orderDate.getFullYear() === now.getFullYear()
        }
        return true
      })
      
      console.log(`📊 Filter: ${this.globalFilter}, Total Orders: ${this.allOrders.length}, Filtered: ${filtered.length}`)
      return filtered
    },

    // Dynamic greeting based on time of day
    greeting() {
      const hour = new Date().getHours()
      if (hour >= 5 && hour < 12) {
        return { text: 'Good Morning', emoji: '☀️', gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde047 50%, #facc15 100%)' }
      } else if (hour >= 12 && hour < 18) {
        return { text: 'Good Afternoon', emoji: '🌤️', gradient: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 50%, #ccfbf1 100%)' }
      } else {
        return { text: 'Good Evening', emoji: '🌙', gradient: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)' }
      }
    },

    currentStats() {
      const orders = this.filteredOrders
      
      const totalSales = orders.reduce((sum, order) => {
        if (!order.items || !Array.isArray(order.items)) {
          console.warn('Order has no items array:', order)
          return sum
        }
        const orderTotal = order.items.reduce((itemSum, item) => {
          const price = item.discountedPrice || item.price || 0
          const quantity = item.quantity || item.qty || 1
          return itemSum + (price * quantity)
        }, 0)
        return sum + orderTotal
      }, 0)
      
      const totalOrders = orders.length
      
      console.log(`💰 Total Sales (${this.globalFilter}): $${totalSales.toFixed(2)}, Orders: ${totalOrders}`)
      
      // Calculate peak hour
      const hourCounts = {}
      orders.forEach(order => {
        const orderDate = this.getOrderDate(order)
        const hour = orderDate.getHours()
        hourCounts[hour] = (hourCounts[hour] || 0) + 1
      })
      const peakHourNum = Object.keys(hourCounts).length > 0
        ? Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b, 0)
        : 12
      const peakHour = `${peakHourNum % 12 || 12}${peakHourNum < 12 ? 'AM' : 'PM'}`
      
      // Calculate best seller - prioritize highest quantity, handle ties
      const itemCounts = {}
      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            const itemName = item.name || item.itemName || 'Unknown Item'
            const quantity = item.quantity || item.qty || 1
            itemCounts[itemName] = (itemCounts[itemName] || 0) + quantity
          })
        }
      })
      
      let bestSeller = 'N/A'
      if (Object.keys(itemCounts).length > 0) {
        // Find the maximum count
        const maxCount = Math.max(...Object.values(itemCounts))
        
        // Get all items with the maximum count
        const topItems = Object.keys(itemCounts).filter(item => itemCounts[item] === maxCount)
        
        // If multiple items tied at max, pick the first one alphabetically
        bestSeller = topItems.sort()[0]
      }
      
      // Calculate changes (compare with previous period)
      const previousOrders = this.getPreviousPeriodOrders()
      const prevSales = previousOrders.reduce((sum, order) => {
        if (!order.items || !Array.isArray(order.items)) return sum
        const orderTotal = order.items.reduce((itemSum, item) => {
          const price = item.discountedPrice || item.price || 0
          const quantity = item.quantity || item.qty || 1
          return itemSum + (price * quantity)
        }, 0)
        return sum + orderTotal
      }, 0)
      
      const salesChange = prevSales > 0 ? ((totalSales - prevSales) / prevSales * 100).toFixed(0) : 0
      const ordersChange = previousOrders.length > 0 
        ? ((totalOrders - previousOrders.length) / previousOrders.length * 100).toFixed(0) 
        : 0
      
      return {
        totalSales: `$${totalSales.toFixed(2)}`,
        totalOrders,
        peakHour,
        bestSeller,
        salesChange: parseInt(salesChange),
        ordersChange: parseInt(ordersChange),
        bestSellerChange: 0 // Can be calculated if needed
      }
    },

    topMenuItemsData() {
      const orders = this.filteredOrders
      const itemCounts = {}
      
      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            const itemName = item.name || item.itemName || 'Unknown Item'
            const quantity = item.quantity || item.qty || 1
            itemCounts[itemName] = (itemCounts[itemName] || 0) + quantity
          })
        }
      })
      
      const sortedItems = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
      
      return {
        labels: sortedItems.map(([name]) => name),
        datasets: [{
          label: 'Orders Sold',
          data: sortedItems.map(([, count]) => count),
          backgroundColor: ['#10b981', '#059669', '#22c55e', '#84cc16', '#65a30d'],
          borderRadius: 8
        }]
      }
    },

    salesByPeriodData() {
      const orders = this.filteredOrders
      const periods = { Breakfast: 0, Lunch: 0, Dinner: 0 }
      
      orders.forEach((order, index) => {
        if (!order.items || !Array.isArray(order.items)) {
          console.warn('Order has no items:', order)
          return
        }
        
        // Parse the order date - handle both Firestore Timestamp and string dates
        const orderDate = this.getOrderDate(order)
        const hour = orderDate.getHours()
        
        // Calculate total for this order
        const orderTotal = order.items.reduce((sum, item) => {
          const price = item.discountedPrice || item.price || 0
          const quantity = item.quantity || item.qty || 1
          const itemTotal = price * quantity
          return sum + itemTotal
        }, 0)
        
        // Categorize by time period
        if (hour >= 6 && hour < 11) {
          periods.Breakfast += orderTotal
        } else if (hour >= 11 && hour < 15) {
          periods.Lunch += orderTotal
        } else if (hour >= 17 && hour < 21) {
          periods.Dinner += orderTotal
        }
      })
      
      // Only include periods with data
      const labels = []
      const data = []
      const colors = []
      const colorMap = {
        Breakfast: '#fbbf24',
        Lunch: '#10b981',
        Dinner: '#3b82f6'
      }
      
      Object.entries(periods).forEach(([period, total]) => {
        if (total > 0) {
          labels.push(period)
          data.push(parseFloat(total.toFixed(2)))
          colors.push(colorMap[period])
        }
      })
      
      console.log('Sales by period:', periods)
      
      return {
        labels: labels.length > 0 ? labels : ['No Data'],
        datasets: [{
          data: data.length > 0 ? data : [1],
          backgroundColor: colors.length > 0 ? colors : ['#e5e7eb'],
          borderWidth: 0
        }]
      }
    },

    peakHoursData() {
      const orders = this.filteredOrders
      
      // Initialize hour buckets (8AM to 7PM)
      const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
      const hourCounts = {}
      hours.forEach(h => hourCounts[h] = 0)
      
      // Count orders by hour (rounded to nearest hour)
      orders.forEach(order => {
        const orderDate = this.getOrderDate(order)
        const hour = orderDate.getHours()
        const minutes = orderDate.getMinutes()
        
        // Round to nearest hour (e.g., 11:45 -> 12, 11:20 -> 11)
        const roundedHour = minutes >= 30 ? hour + 1 : hour
        
        // Only count if within our business hours
        if (hourCounts[roundedHour] !== undefined) {
          hourCounts[roundedHour]++
        }
      })
      
      console.log('Peak hours data:', hourCounts)
      
      return {
        labels: hours.map(h => `${h % 12 || 12}${h < 12 ? 'AM' : 'PM'}`),
        datasets: [{
          label: 'Orders',
          data: hours.map(h => hourCounts[h]),
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
      const orders = this.filteredOrders
      const buyerOrders = {}
      
      orders.forEach(order => {
        const buyerId = order.buyerId
        buyerOrders[buyerId] = (buyerOrders[buyerId] || 0) + 1
      })
      
      const firstTime = Object.values(buyerOrders).filter(count => count === 1).length
      const repeat = Object.values(buyerOrders).filter(count => count > 1).length
      
      return {
        labels: ['First-time Buyers', 'Repeat Customers'],
        datasets: [{
          label: 'Customers',
          data: [firstTime, repeat],
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
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || ''
                const value = context.parsed || 0
                return `${label}: $${value.toFixed(2)}`
              }
            }
          }
        }
      }
    }
  },
  methods: {
    // Fetch hawker profile information
    async fetchHawkerProfile() {
      try {
        console.log('📋 Fetching hawker profile for user:', this.currentHawkerId)
        
        if (!this.currentHawkerId) {
          console.error('❌ No current hawker ID')
          return
        }
        
        // First, find the hawker listing that belongs to this user
        const hawkerListingsRef = collection(db, 'hawkerListings')
        const q = query(hawkerListingsRef, where('userId', '==', this.currentHawkerId))
        const querySnapshot = await getDocs(q)
        
        if (querySnapshot.empty) {
          console.warn('⚠️ No hawker listing found for this user')
          this.hawkerName = 'Hawker'
          this.hawkerOpeningHours = 'Hours not available'
          this.hawkerRating = 0
          this.hawkerReviewCount = 0
          return
        }
        
        // Get the first (should be only) hawker listing for this user
        const hawkerDoc = querySnapshot.docs[0]
        const hawkerListingId = hawkerDoc.id
        const hawkerData = hawkerDoc.data()
        
        // Store the hawker listing ID for later use
        this.hawkerListingId = hawkerListingId
  // Store the hawker owner's userId (used when navigating to buyer-view-stall/:userId)
  this.hawkerOwnerId = hawkerData.userId || null
        
        console.log('📦 Hawker listing found:', hawkerListingId)
        console.log('📦 Hawker data:', hawkerData)
        
        // Use hawkerName from hawkerListings collection
        this.hawkerName = hawkerData.hawkerName || hawkerData.name || hawkerData.stallName || 'Hawker'
        
        // Use openingTime and closingTime for operating hours
        const openingTime = hawkerData.openingTime || ''
        const closingTime = hawkerData.closingTime || ''
        
        // Format opening hours as "openingTime - closingTime"
        if (openingTime && closingTime) {
          this.hawkerOpeningHours = `${openingTime} - ${closingTime}`
        } else if (openingTime) {
          this.hawkerOpeningHours = `Opens at ${openingTime}`
        } else {
          this.hawkerOpeningHours = 'Hours not specified'
        }
        
        console.log('✅ Hawker profile loaded:', this.hawkerName, '|', this.hawkerOpeningHours)
        
        // Fetch todos and calendar events from Firebase
        await this.fetchTodos()
        await this.fetchCalendarEvents()
        
        // Fetch reviews from the hawkerListings document (not subcollection)
        console.log('🔍 Fetching reviews from hawker document...')
        try {
          if (hawkerData.reviews) {
            const reviews = hawkerData.reviews
            
            // Check if there's a stallRating field
            if (reviews.stallRating !== undefined && reviews.stallRating !== null) {
              this.hawkerRating = reviews.stallRating
              this.hawkerReviewCount = reviews.userRatings ? reviews.userRatings.length : 0
              console.log(`✅ Reviews loaded: ${this.hawkerReviewCount} reviews, avg rating: ${this.hawkerRating.toFixed(1)}`)
            } else if (reviews.userRatings && reviews.userRatings.length > 0) {
              // Calculate rating from userRatings array
              const totalRating = reviews.userRatings.reduce((sum, review) => {
                return sum + (review.overallrating || review.overallRating || 0)
              }, 0)
              this.hawkerRating = totalRating / reviews.userRatings.length
              this.hawkerReviewCount = reviews.userRatings.length
              console.log(`✅ Reviews calculated: ${this.hawkerReviewCount} reviews, avg rating: ${this.hawkerRating.toFixed(1)}`)
            } else {
              this.hawkerRating = 0
              this.hawkerReviewCount = 0
              console.log('⚠️ No reviews found')
            }
          } else {
            console.log('⚠️ No reviews object in hawker document')
            this.hawkerRating = 0
            this.hawkerReviewCount = 0
          }
        } catch (reviewError) {
          console.error('❌ Error fetching reviews:', reviewError)
          this.hawkerRating = 0
          this.hawkerReviewCount = 0
        }
      } catch (error) {
        console.error('❌ Error fetching hawker profile:', error)
        console.error('Error details:', error.message)
        this.hawkerName = 'Hawker'
        this.hawkerOpeningHours = 'Not available'
      }
    },
    
    // Helper method to get order date with fallbacks
    getOrderDate(order) {
      // Try timestamp first (your actual field), then createdAt, then date
      const timestamp = order.timestamp || order.createdAt || order.date
      if (!timestamp) {
        console.warn('Order has no timestamp:', order)
        return new Date()
      }
      
      // Handle Firestore Timestamp objects and regular dates
      return timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    },
    
    getPreviousPeriodOrders() {
      const now = new Date()
      return this.allOrders.filter(order => {
        const orderDate = this.getOrderDate(order)
        
        if (this.globalFilter === 'day') {
          const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          return orderDate.toDateString() === yesterday.toDateString()
        } else if (this.globalFilter === 'week') {
          const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return orderDate >= twoWeeksAgo && orderDate < oneWeekAgo
        } else if (this.globalFilter === 'month') {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          return orderDate.getMonth() === lastMonth.getMonth() && 
                 orderDate.getFullYear() === lastMonth.getFullYear()
        }
        return false
      })
    },

    async fetchHawkerOrders() {
      try {
        this.loading = true
        console.log('🔍 Starting to fetch orders...')
        console.log('Current Hawker ID:', this.currentHawkerId)
        
        if (!this.currentHawkerId) {
          console.error('❌ No hawker ID available')
          this.loading = false
          return
        }
        
        const ordersRef = collection(db, 'orders')
        console.log('📦 Orders collection reference created')
        
        // Try with orderBy first (requires index)
        let querySnapshot
        try {
          const q = query(
            ordersRef,
            where('hawkerId', '==', this.currentHawkerId),
            orderBy('timestamp', 'desc')
          )
          console.log('🔎 Query created with filters:', {
            hawkerId: this.currentHawkerId,
            orderBy: 'timestamp desc'
          })
          
          querySnapshot = await getDocs(q)
          console.log('📊 Query executed, documents found:', querySnapshot.size)
          
          this.allOrders = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        } catch (indexError) {
          if (indexError.code === 'failed-precondition' || indexError.code === 9) {
            console.warn('⚠️ Index not found, using simple query without orderBy')
            const indexUrl = indexError.message.match(/https:\/\/[^\s]+/)?.[0]
            if (indexUrl) {
              console.warn('🔗 Create index at:', indexUrl)
            }
            console.warn('💡 Or use the firestore.indexes.json file and deploy: firebase deploy --only firestore:indexes')
            
            // Fallback: query without orderBy
            const simpleQuery = query(
              ordersRef,
              where('hawkerId', '==', this.currentHawkerId)
            )
            querySnapshot = await getDocs(simpleQuery)
            console.log('📊 Simple query executed, documents found:', querySnapshot.size)
            
            this.allOrders = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            
            // Sort manually by timestamp (createdAt or date)
            this.allOrders.sort((a, b) => {
              const dateA = this.getOrderDate(a)
              const dateB = this.getOrderDate(b)
              return dateB - dateA
            })
          } else {
            throw indexError
          }
        }
        
        console.log('✅ Loaded orders:', this.allOrders.length)
        if (this.allOrders.length > 0) {
          console.log('📄 Sample order:', this.allOrders[0])
        } else {
          console.log('⚠️ No orders found for this hawker')
        }
      } catch (error) {
        console.error('❌ Error fetching orders:', error)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        this.allOrders = []
      } finally {
        this.loading = false
        console.log('🏁 Fetch complete. Loading state:', this.loading)
      }
    },

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
    
    // Todo List Methods - Connected to Firebase
    async fetchTodos() {
      if (!this.hawkerListingId) return
      
      try {
        console.log('📝 Fetching todos from Firebase...')
        const todosRef = collection(db, 'hawkerListings', this.hawkerListingId, 'toDoList')
        const todosSnapshot = await getDocs(todosRef)
        
        this.todoList = todosSnapshot.docs.map(doc => ({
          id: doc.id,
          text: doc.data().toDoItem || '',
          done: doc.data().completed || false
        }))
        
        console.log('✅ Todos loaded:', this.todoList.length)
      } catch (error) {
        console.error('❌ Error fetching todos:', error)
      }
    },
    
    async addTodo(text) {
      if (!this.hawkerListingId) return
      
      try {
        const todosRef = collection(db, 'hawkerListings', this.hawkerListingId, 'toDoList')
        const docRef = await addDoc(todosRef, {
          toDoItem: text,
          completed: false,
          dateCreated: new Date()
        })
        
        this.todoList.push({ id: docRef.id, text, done: false })
        console.log('✅ Todo added to Firebase')
      } catch (error) {
        console.error('❌ Error adding todo:', error)
      }
    },
    
    async toggleTodo(idx) {
      const todo = this.todoList[idx]
      if (!this.hawkerListingId || !todo.id) return
      
      try {
        const todoRef = doc(db, 'hawkerListings', this.hawkerListingId, 'toDoList', todo.id)
        await updateDoc(todoRef, {
          completed: !todo.done
        })
        
        this.todoList[idx].done = !this.todoList[idx].done
        console.log('✅ Todo updated in Firebase')
      } catch (error) {
        console.error('❌ Error updating todo:', error)
      }
    },
    
    async deleteTodo(idx) {
      const todo = this.todoList[idx]
      if (!this.hawkerListingId || !todo.id) return
      
      try {
        const todoRef = doc(db, 'hawkerListings', this.hawkerListingId, 'toDoList', todo.id)
        await deleteDoc(todoRef)
        
        this.todoList.splice(idx, 1)
        console.log('✅ Todo deleted from Firebase')
      } catch (error) {
        console.error('❌ Error deleting todo:', error)
      }
    },
    
    clearAllTodos() {
      if (!this.hawkerListingId) return
      
      // Show the confirmation modal
      const modal = new bootstrap.Modal(document.getElementById('clearTodosModal'))
      modal.show()
    },
    
    async confirmClearTodos() {
      try {
        const todosRef = collection(db, 'hawkerListings', this.hawkerListingId, 'toDoList')
        const todosSnapshot = await getDocs(todosRef)
        
        const deletePromises = todosSnapshot.docs.map(doc => deleteDoc(doc.ref))
        await Promise.all(deletePromises)
        
        this.todoList = []
        console.log('✅ All todos cleared from Firebase')
        
        // Hide the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('clearTodosModal'))
        modal.hide()
      } catch (error) {
        console.error('❌ Error clearing todos:', error)
        alert('Failed to clear todos. Please try again.')
      }
    },
    
    // Calendar Event Methods - Connected to Firebase
    async fetchCalendarEvents() {
      if (!this.hawkerListingId) return
      
      try {
        console.log('📅 Fetching calendar events from Firebase...')
        const eventsRef = collection(db, 'hawkerListings', this.hawkerListingId, 'calendarEvents')
        const eventsSnapshot = await getDocs(eventsRef)
        
        this.customEvents = eventsSnapshot.docs.map(doc => {
          const data = doc.data()
          console.log('📅 Event doc:', doc.id, 'data:', data)
          return {
            id: doc.id,
            title: data.title || '',
            date: data.date || ''
          }
        })
        
        console.log('✅ Calendar events loaded:', this.customEvents.length, 'events:', this.customEvents)
      } catch (error) {
        console.error('❌ Error fetching calendar events:', error)
      }
    },
    
    showAddEventModal() {
      this.newEvent = { title: '', date: '', id: null }
      new bootstrap.Modal(document.getElementById('addEventModal')).show()
    },
    
    async addEvent() {
      if (!this.hawkerListingId || !this.newEvent.title || !this.newEvent.date) return
      
      try {
        const eventsRef = collection(db, 'hawkerListings', this.hawkerListingId, 'calendarEvents')
        const docRef = await addDoc(eventsRef, {
          title: this.newEvent.title,
          date: this.newEvent.date,
          dateCreated: new Date()
        })
        
        this.customEvents.push({ 
          id: docRef.id, 
          title: this.newEvent.title, 
          date: this.newEvent.date 
        })
        
        bootstrap.Modal.getInstance(document.getElementById('addEventModal')).hide()
        console.log('✅ Event added to Firebase')
      } catch (error) {
        console.error('❌ Error adding event:', error)
      }
    },
    
    async removeEvent(id) {
      if (!this.hawkerListingId) return
      
      try {
        const eventRef = doc(db, 'hawkerListings', this.hawkerListingId, 'calendarEvents', id)
        await deleteDoc(eventRef)
        
        this.customEvents = this.customEvents.filter(e => e.id !== id)
        console.log('✅ Event removed from Firebase')
      } catch (error) {
        console.error('❌ Error removing event:', error)
      }
    },
    
    clearAllEvents() {
      if (!this.hawkerListingId) return
      
      // Show the confirmation modal
      const modal = new bootstrap.Modal(document.getElementById('clearEventsModal'))
      modal.show()
    },
    
    async confirmClearEvents() {
      try {
        const eventsRef = collection(db, 'hawkerListings', this.hawkerListingId, 'calendarEvents')
        const eventsSnapshot = await getDocs(eventsRef)
        
        const deletePromises = eventsSnapshot.docs.map(doc => deleteDoc(doc.ref))
        await Promise.all(deletePromises)
        
        this.customEvents = []
        console.log('✅ All events cleared from Firebase')
        
        // Hide the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('clearEventsModal'))
        modal.hide()
      } catch (error) {
        console.error('❌ Error clearing events:', error)
        alert('Failed to clear events. Please try again.')
      }
    }
  },
  mounted() {
    console.log('🎬 HawkerAnalytics component mounted')
    
    // Load theme preference
    const savedTheme = localStorage.getItem('hawker-theme')
    if (savedTheme === 'dark') {
      this.isDarkTheme = true
      document.body.classList.add('dark-mode')
      document.documentElement.setAttribute('data-bs-theme', 'dark')
    }

    // Get current hawker and fetch orders
    console.log('🔐 Setting up authentication listener...')
    const auth = getAuth()
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('✅ User authenticated:', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        })
        this.currentHawkerId = user.uid
        console.log('👤 Current Hawker ID set to:', this.currentHawkerId)
        this.fetchHawkerProfile()
        this.fetchHawkerOrders()
      } else {
        console.error('❌ No authenticated user')
        this.loading = false
      }
    })
  }
}
</script>

<style scoped>
/* Import base styles */
@import '@/assets/css/dashboard-theme.css';
@import '@/assets/css/calendar.css';

/* Import modular Hawker Analytics styles */
@import '@/assets/css/hawker-analytics.css';
@import '@/assets/css/hawker-analytics-print.css';
@import '@/assets/css/hawker-analytics-responsive.css';
</style>
