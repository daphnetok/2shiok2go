<template>
  <div class="hawker-analytics" :class="{ 'dark-theme': isDarkTheme }" style="min-height: 100vh; transition: all 0.3s ease;">
    <!-- Navigation Tabs -->
    <div class="container-fluid px-3 px-md-4">
      <nav class="tabs-nav">
        <ul class="tabs-list">
          <li class="tab-item" style="padding:0">
            <router-link to="/hawker-dashboard" class="tab-link">
              <i class="fas fa-home"></i>
              <span>My Listings</span>
            </router-link>
          </li>
          <li class="tab-item" style="padding:0">
            <router-link to="/orders-table" class="tab-link">
              <i class="fas fa-clipboard-list"></i>
              <span>Orders Management</span>
            </router-link>
          </li>
          <li class="tab-item active" style="padding:0">
            <a href="#" class="tab-link">
              <i class="fas fa-chart-simple"></i>
              <span>Analytics</span>
            </a>
          </li>
          <li class="tab-item" style="padding:0">
            <router-link to="/edit-form" class="tab-link">
              <i class="fas fa-file-edit"></i>
              <span>Edit Stall Info</span>
            </router-link>
          </li>
        </ul>
      </nav>
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
            
            <!-- Custom Date Range Filter -->
            <div class="position-relative">
              <button 
                type="button" 
                class="btn px-2 px-sm-3 py-2 fw-semibold shadow-sm"
                :class="globalFilter === 'custom' ? 'btn-success' : 'btn-outline-success'"
                @click="toggleDatePicker"
                style="border-radius: 10px; transition: all 0.3s ease; font-size: 0.875rem; white-space: nowrap;">
                <i class="fas fa-calendar me-1"></i>
                <span class="d-none d-sm-inline">{{ customDateLabel }}</span>
              </button>
              
              <!-- Date Range Picker Dropdown -->
              <div v-if="showDatePicker" class="date-picker-dropdown shadow-lg" :class="{ 'dark-theme': isDarkTheme }">
                <div class="p-4">
                  <h6 class="mb-3 fw-bold" :style="{ color: isDarkTheme ? '#f1f5f9' : '#1f2937' }">
                    <i class="fas fa-calendar-alt me-2 text-success"></i>Select Date Range
                  </h6>
                  
                  <div class="mb-3">
                    <label class="form-label small fw-semibold mb-2" :style="{ color: isDarkTheme ? '#cbd5e1' : '#64748b' }">
                      <i class="fas fa-calendar-day me-1"></i>From Date
                    </label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text" :class="{ 'dark-input': isDarkTheme }">
                        <i class="fas fa-calendar text-success"></i>
                      </span>
                      <input 
                        type="date" 
                        class="form-control"
                        :class="{ 'dark-input': isDarkTheme }"
                        v-model="customStartDate"
                        :max="customEndDate || today"
                        placeholder="Select start date"
                        style="border-radius: 0 8px 8px 0;">
                    </div>
                  </div>
                  
                  <div class="mb-3">
                    <label class="form-label small fw-semibold mb-2" :style="{ color: isDarkTheme ? '#cbd5e1' : '#64748b' }">
                      <i class="fas fa-calendar-check me-1"></i>To Date
                    </label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text" :class="{ 'dark-input': isDarkTheme }">
                        <i class="fas fa-calendar text-success"></i>
                      </span>
                      <input 
                        type="date" 
                        class="form-control"
                        :class="{ 'dark-input': isDarkTheme }"
                        v-model="customEndDate"
                        :min="customStartDate"
                        :max="today"
                        placeholder="Select end date"
                        style="border-radius: 0 8px 8px 0;">
                    </div>
                  </div>
                  
                  <div class="d-flex gap-2 mt-4">
                    <button 
                      class="btn btn-success flex-grow-1 shadow-sm"
                      @click="applyCustomDateFilter"
                      :disabled="!customStartDate || !customEndDate"
                      style="border-radius: 8px; font-weight: 600;">
                      <i class="fas fa-check me-2"></i>Apply Filter
                    </button>
                    <button 
                      class="btn btn-outline-secondary flex-grow-1"
                      @click="clearCustomDateFilter"
                      style="border-radius: 8px; font-weight: 600;">
                      <i class="fas fa-times me-2"></i>Clear
                    </button>
                  </div>
                </div>
              </div>
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
        <!-- Total Sales Card -->
        <div class="col-6 col-sm-6 col-md-3 col-lg-3">
          <div class="stat-card stat-card-success" style="border-radius: 12px; border: none; min-height: 120px; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15); transition: all 0.3s ease; cursor: pointer;">
            <div style="padding: 1rem; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
              <div class="d-flex align-items-center gap-2">
                <div class="stat-icon d-flex" style="width: clamp(32px, 8vw, 48px); height: clamp(32px, 8vw, 48px); background: rgba(255,255,255,0.25); border-radius: 10px; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); flex-shrink: 0;">
                  <i class="fas fa-dollar-sign text-white" style="font-size: clamp(0.9rem, 2.5vw, 1.25rem);"></i>
                </div>
                <div class="flex-grow-1" style="min-width: 0;">
                  <div class="d-flex align-items-center flex-wrap gap-1 mb-1">
                    <p class="text-white mb-0" style="font-size: 0.625rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; opacity: 0.9;">
                      <span class="d-none d-sm-inline">TOTAL SALES</span>
                      <span class="d-inline d-sm-none">SALES</span>
                    </p>
                    <span class="badge d-none d-md-inline" :class="currentStats.salesChange >= 0 ? 'bg-light bg-opacity-25' : 'bg-danger bg-opacity-25'" style="font-size: 0.55rem; padding: 0.15rem 0.35rem; border-radius: 6px;">
                      <i :class="currentStats.salesChange >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'" style="font-size: 0.5rem;"></i>
                      {{ Math.abs(currentStats.salesChange) }}%
                    </span>
                  </div>
                  <h3 class="text-white mb-0 fw-bold" style="font-size: clamp(1.1rem, 3vw, 1.5rem); letter-spacing: -0.5px; line-height: 1.2;">{{ currentStats.totalSales }}</h3>
                </div>
              </div>
              <div class="d-flex align-items-center mt-2">
                <i class="fas fa-chart-line me-1 text-white d-none d-lg-inline" style="opacity: 0.8; font-size: 0.7rem;"></i>
                <p class="text-white mb-0" style="font-size: clamp(0.6rem, 1.5vw, 0.7rem); opacity: 0.9; line-height: 1.3;">
                  <span class="d-none d-md-inline">Revenue for {{ globalFilter === 'day' ? 'today' : globalFilter === 'week' ? 'this week' : 'this month' }}</span>
                  <span class="d-inline d-md-none">Revenue this {{ globalFilter }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Orders Card -->
        <div class="col-6 col-sm-6 col-md-3 col-lg-3">
          <div class="stat-card stat-card-info" style="border-radius: 12px; border: none; min-height: 120px; box-shadow: 0 4px 20px rgba(6, 182, 212, 0.15); transition: all 0.3s ease; cursor: pointer;">
            <div style="padding: 1rem; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
              <div class="d-flex align-items-center gap-2">
                <div class="stat-icon d-flex" style="width: clamp(32px, 8vw, 48px); height: clamp(32px, 8vw, 48px); background: rgba(255,255,255,0.25); border-radius: 10px; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); flex-shrink: 0;">
                  <i class="fas fa-shopping-bag text-white" style="font-size: clamp(0.9rem, 2.5vw, 1.25rem);"></i>
                </div>
                <div class="flex-grow-1" style="min-width: 0;">
                  <div class="d-flex align-items-center flex-wrap gap-1 mb-1">
                    <p class="text-white mb-0" style="font-size: 0.625rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; opacity: 0.9;">
                      <span class="d-none d-sm-inline">TOTAL ORDERS</span>
                      <span class="d-inline d-sm-none">ORDERS</span>
                    </p>
                    <span class="badge d-none d-md-inline" :class="currentStats.ordersChange >= 0 ? 'bg-light bg-opacity-25' : 'bg-danger bg-opacity-25'" style="font-size: 0.55rem; padding: 0.15rem 0.35rem; border-radius: 6px;">
                      <i :class="currentStats.ordersChange >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'" style="font-size: 0.5rem;"></i>
                      {{ Math.abs(currentStats.ordersChange) }}%
                    </span>
                  </div>
                  <h3 class="text-white mb-0 fw-bold" style="font-size: clamp(1.1rem, 3vw, 1.5rem); letter-spacing: -0.5px; line-height: 1.2;">{{ currentStats.totalOrders }}</h3>
                </div>
              </div>
              <div class="d-flex align-items-center mt-2">
                <i class="fas fa-receipt me-1 text-white d-none d-lg-inline" style="opacity: 0.8; font-size: 0.7rem;"></i>
                <p class="text-white mb-0" style="font-size: clamp(0.6rem, 1.5vw, 0.7rem); opacity: 0.9; line-height: 1.3;">
                  <span class="d-none d-md-inline">Orders received {{ globalFilter === 'day' ? 'today' : globalFilter === 'week' ? 'this week' : 'this month' }}</span>
                  <span class="d-inline d-md-none">Received this {{ globalFilter }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Peak Hour Card -->
        <div class="col-6 col-sm-6 col-md-3 col-lg-3">
          <div class="stat-card stat-card-warning" style="border-radius: 12px; border: none; min-height: 120px; box-shadow: 0 4px 20px rgba(245, 158, 11, 0.15); transition: all 0.3s ease; cursor: pointer;">
            <div style="padding: 1rem; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
              <div class="d-flex align-items-center gap-2">
                <div class="stat-icon d-flex" style="width: clamp(32px, 8vw, 48px); height: clamp(32px, 8vw, 48px); background: rgba(255,255,255,0.25); border-radius: 10px; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); flex-shrink: 0;">
                  <i class="fas fa-clock text-white" style="font-size: clamp(0.9rem, 2.5vw, 1.25rem);"></i>
                </div>
                <div class="flex-grow-1" style="min-width: 0;">
                  <div class="d-flex align-items-center flex-wrap gap-1 mb-1">
                    <p class="text-white mb-0" style="font-size: 0.625rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; opacity: 0.9;">PEAK HOUR</p>
                    <span class="badge bg-light bg-opacity-25 d-none d-md-inline" style="font-size: 0.55rem; padding: 0.15rem 0.35rem; border-radius: 6px;">
                      <i class="fas fa-info-circle" style="font-size: 0.5rem;"></i>
                      {{ globalFilter === 'day' ? 'Today' : globalFilter === 'week' ? 'Week' : 'Month' }}
                    </span>
                  </div>
                  <h3 class="text-white mb-0 fw-bold" style="font-size: clamp(1.1rem, 3vw, 1.5rem); letter-spacing: -0.5px; line-height: 1.2;">{{ currentStats.peakHour }}</h3>
                </div>
              </div>
              <div class="d-flex align-items-center mt-2">
                <i class="fas fa-fire me-1 text-white d-none d-lg-inline" style="opacity: 0.8; font-size: 0.7rem;"></i>
                <p class="text-white mb-0" style="font-size: clamp(0.6rem, 1.5vw, 0.7rem); opacity: 0.9; line-height: 1.3;">Busiest time slot</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Best Seller Card -->
        <div class="col-6 col-sm-6 col-md-3 col-lg-3">
          <div class="stat-card stat-card-primary" style="border-radius: 12px; border: none; min-height: 120px; box-shadow: 0 4px 20px rgba(139, 92, 246, 0.15); transition: all 0.3s ease; cursor: pointer;">
            <div style="padding: 1rem; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
              <div class="d-flex align-items-center gap-2">
                <div class="stat-icon d-flex" style="width: clamp(32px, 8vw, 48px); height: clamp(32px, 8vw, 48px); background: rgba(255,255,255,0.25); border-radius: 10px; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); flex-shrink: 0;">
                  <i class="fas fa-trophy text-white" style="font-size: clamp(0.9rem, 2.5vw, 1.25rem);"></i>
                </div>
                <div class="flex-grow-1" style="min-width: 0;">
                  <div class="d-flex align-items-center mb-1">
                    <p class="text-white mb-0" style="font-size: 0.625rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; opacity: 0.9;">BEST SELLER</p>
                  </div>
                  <h3 class="text-white mb-0 fw-bold" style="font-size: clamp(0.9rem, 2.5vw, 1.25rem); letter-spacing: -0.3px; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; word-break: break-word;">{{ currentStats.bestSeller }}</h3>
                </div>
              </div>
              <div class="d-flex align-items-center mt-2">
                <i class="fas fa-star me-1 text-white d-none d-lg-inline" style="opacity: 0.8; font-size: 0.7rem;"></i>
                <p class="text-white mb-0" style="font-size: clamp(0.6rem, 1.5vw, 0.7rem); opacity: 0.9; line-height: 1.3;">Most popular item</p>
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
            :options="noLegendOptions"
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
            :options="noLegendOptions"
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
            :options="noLegendOptions"
            :dark-mode="isDarkTheme"
          />
          <div v-else class="card" style="min-height: 250px; display: flex; align-items: center; justify-content: center;">
            <LoadingSpinner message="Loading chart data..." message-class="mt-3 text-muted" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChartCard from '@/components/dashboard/ChartCard.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'

export default {
  name: 'HawkerAnalytics',
  components: { ChartCard, LoadingSpinner },
  data() {
    return {
      isDarkTheme: false,
  // Default to month so charts load with data on first visit
  globalFilter: 'month',
      currentHawkerId: null,
      hawkerListingId: null, // Store the actual hawker listing document ID
      hawkerOwnerId: null, // userId owner of the hawker listing (used for routing to buyer-view-stall)
      allOrders: [],
      loading: true,
      
      // Custom date range filter
      showDatePicker: false,
      customStartDate: '',
      customEndDate: '',
      
      // Dummy data for different time periods - REMOVED, will be computed dynamically
      // statsData, salesTrendDummyData, topMenuItemsDummyData, etc.

      // Hawker profile data
      hawkerName: 'Loading...',
      hawkerOpeningHours: 'Loading...',
      hawkerRating: 0,
      hawkerReviewCount: 0,

      // Add flag to track if this is the initial load
      isInitialLoad: true
    }
  },
  computed: {
    // Get today's date in YYYY-MM-DD format for date input max attribute
    today() {
      const date = new Date()
      return date.toISOString().split('T')[0]
    },
    
    // Custom date label for the button
    customDateLabel() {
      if (this.globalFilter === 'custom' && this.customStartDate && this.customEndDate) {
        const start = new Date(this.customStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const end = new Date(this.customEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        return `${start} - ${end}`
      }
      return 'Custom'
    },
    
    // Filter orders based on time period
    filteredOrders() {
      const now = new Date()
      
      const filtered = this.allOrders.filter(order => {
        const orderDate = this.getOrderDate(order)
        
        if (this.globalFilter === 'day') {
          // Compare dates without time component
          const orderDateOnly = new Date(orderDate)
          orderDateOnly.setHours(0, 0, 0, 0)
          const todayDateOnly = new Date(now)
          todayDateOnly.setHours(0, 0, 0, 0)
          return orderDateOnly.getTime() === todayDateOnly.getTime()
        } else if (this.globalFilter === 'week') {
          const weekAgo = new Date(now)
          weekAgo.setDate(now.getDate() - 7)
          weekAgo.setHours(0, 0, 0, 0)
          const todayEnd = new Date(now)
          todayEnd.setHours(23, 59, 59, 999)
          return orderDate >= weekAgo && orderDate <= todayEnd
        } else if (this.globalFilter === 'month') {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
          monthStart.setHours(0, 0, 0, 0)
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          monthEnd.setHours(23, 59, 59, 999)
          return orderDate >= monthStart && orderDate <= monthEnd
        } else if (this.globalFilter === 'custom') {
          // Custom date range filtering
          if (!this.customStartDate || !this.customEndDate) {
            return true
          }
          const startDate = new Date(this.customStartDate)
          startDate.setHours(0, 0, 0, 0)
          const endDate = new Date(this.customEndDate)
          endDate.setHours(23, 59, 59, 999)
          
          const orderDateOnly = new Date(orderDate)
          orderDateOnly.setHours(0, 0, 0, 0)
          
          return orderDateOnly >= startDate && orderDateOnly <= endDate
        }
        return true
      })
      
      // Only fall back to all orders on initial load with month filter (to prevent empty charts on first visit)
      // For day/week filters or after initial load, show actual filtered results even if empty
      if (filtered.length === 0 && this.allOrders.length > 0 && this.isInitialLoad && this.globalFilter === 'month') {
        console.log(`📊 Initial load with month filter, showing all orders (${this.allOrders.length})`)
        return this.allOrders
      }

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
      
      orders.forEach((order) => {
        if (!order.items || !Array.isArray(order.items)) {
          console.warn('Order has no items:', order)
          return
        }
        
        // Parse the order date - handle both Firestore Timestamp and regular dates
        const orderDate = this.getOrderDate(order)
        const hour = orderDate.getHours()
        
        // Calculate total for this order
        const orderTotal = order.items.reduce((sum, item) => {
          const price = item.discountedPrice || item.price || 0
          const quantity = item.quantity || item.qty || 1
          const itemTotal = price * quantity
          return sum + itemTotal
        }, 0)
        
        // Categorize by time period - only 3 categories
        if (hour >= 5 && hour < 11) {
          // 5AM - 11AM: Breakfast
          periods.Breakfast += orderTotal
        } else if (hour >= 11 && hour < 15) {
          // 11AM - 3PM: Lunch
          periods.Lunch += orderTotal
        } else {
          // 3PM onwards until closing (covers dinner and late night orders): Dinner
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
      
      console.log('Sales by period (3 categories only):', {
        periods,
        filteredOrdersCount: orders.length,
        hasData: labels.length > 0
      })
      
      // If no data at all, show a placeholder
      if (labels.length === 0) {
        return {
          labels: ['No Sales Data'],
          datasets: [{
            data: [1],
            backgroundColor: ['#e5e7eb'],
            borderWidth: 0
          }]
        }
      }
      
      return {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 0
        }]
      }
    },

    peakHoursData() {
      const orders = this.filteredOrders
      
      // Initialize hour buckets (6AM to 9PM for full hawker hours)
      const hours = Array.from({ length: 16 }, (_, i) => i + 6) // 6 to 21
      const hourCounts = {}
      hours.forEach(h => hourCounts[h] = 0)
      
      // Count orders by exact hour (no rounding)
      orders.forEach(order => {
        const orderDate = this.getOrderDate(order)
        const hour = orderDate.getHours()
        
        // Only count if within our business hours
        if (hourCounts[hour] !== undefined) {
          hourCounts[hour]++
        }
      })
      
      // Filter to only show hours that have data OR are within reasonable business hours
      const minHour = Math.min(...Object.keys(hourCounts).filter(h => hourCounts[h] > 0).map(Number))
      const maxHour = Math.max(...Object.keys(hourCounts).filter(h => hourCounts[h] > 0).map(Number))
      
      // If we have data, show from min-1 to max+1 (with padding), otherwise show 8AM-7PM
      let displayHours
      if (orders.length > 0 && minHour !== Infinity) {
        const startHour = Math.max(6, minHour - 1)
        const endHour = Math.min(21, maxHour + 1)
        displayHours = Array.from({ length: endHour - startHour + 1 }, (_, i) => i + startHour)
      } else {
        // Default business hours if no orders
        displayHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
      }
      
      console.log('Peak hours data:', { hourCounts, displayHours, totalOrders: orders.length })
      
      return {
        labels: displayHours.map(h => `${h % 12 || 12}${h < 12 ? 'AM' : 'PM'}`),
        datasets: [{
          label: 'Orders',
          data: displayHours.map(h => hourCounts[h] || 0),
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
      const filteredOrders = this.filteredOrders
      const allOrders = this.allOrders
      
      console.log('🔍 Analyzing customer types...')
      console.log('Sample order structure:', filteredOrders.length > 0 ? filteredOrders[0] : 'No orders')
      
      // First, build a map of ALL orders by buyer (to determine if they're truly repeat customers)
      const allBuyerOrderCounts = {}
      allOrders.forEach(order => {
        // Try multiple possible field names for buyer ID
        const buyerId = order.buyerId || order.userId || order.customerId || order.buyer_id
        if (buyerId) {
          allBuyerOrderCounts[buyerId] = (allBuyerOrderCounts[buyerId] || 0) + 1
        } else {
          console.warn('⚠️ Order missing buyerId:', order.id)
        }
      })
      
      console.log('📊 All buyer order counts:', allBuyerOrderCounts)
      
      // Now categorize buyers in the filtered period
      const buyersInPeriod = new Set()
      filteredOrders.forEach(order => {
        // Try multiple possible field names for buyer ID
        const buyerId = order.buyerId || order.userId || order.customerId || order.buyer_id
        if (buyerId) {
          buyersInPeriod.add(buyerId)
        }
      })
      
      console.log('👥 Unique buyers in filtered period:', buyersInPeriod.size)
      
      // Count how many are first-time vs repeat based on their TOTAL order history
      let firstTime = 0
      let repeat = 0
      
      buyersInPeriod.forEach(buyerId => {
        const totalOrdersByBuyer = allBuyerOrderCounts[buyerId] || 0
        if (totalOrdersByBuyer === 1) {
          firstTime++
        } else if (totalOrdersByBuyer > 1) {
          repeat++
        }
      })
      
      console.log('Customer type analysis:', {
        filteredOrdersCount: filteredOrders.length,
        uniqueBuyersInPeriod: buyersInPeriod.size,
        firstTime,
        repeat,
        totalCategorized: firstTime + repeat
      })
      
      // If no buyers could be identified, show a message
      if (firstTime === 0 && repeat === 0) {
        console.warn('⚠️ No buyers identified - check buyerId field in orders')
        return {
          labels: ['No Customer Data'],
          datasets: [{
            label: 'Customers',
            data: [1],
            backgroundColor: ['#e5e7eb'],
            borderRadius: 8
          }]
        }
      }
      
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

    // Common options used for charts where we want to hide the legend
    noLegendOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true }
        }
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
          const yesterday = new Date(now)
          yesterday.setDate(now.getDate() - 1)
          yesterday.setHours(0, 0, 0, 0)
          const yesterdayEnd = new Date(yesterday)
          yesterdayEnd.setHours(23, 59, 59, 999)
          return orderDate >= yesterday && orderDate <= yesterdayEnd
        } else if (this.globalFilter === 'week') {
          const twoWeeksAgo = new Date(now)
          twoWeeksAgo.setDate(now.getDate() - 14)
          twoWeeksAgo.setHours(0, 0, 0, 0)
          const oneWeekAgo = new Date(now)
          oneWeekAgo.setDate(now.getDate() - 7)
          oneWeekAgo.setHours(0, 0, 0, 0)
          return orderDate >= twoWeeksAgo && orderDate < oneWeekAgo
        } else if (this.globalFilter === 'month') {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          lastMonth.setHours(0, 0, 0, 0)
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
          lastMonthEnd.setHours(23, 59, 59, 999)
          return orderDate >= lastMonth && orderDate <= lastMonthEnd
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
      this.showDatePicker = false
      // Mark that we're no longer on initial load after first filter change
      if (this.isInitialLoad) {
        this.isInitialLoad = false
      }
    },
    
    toggleDatePicker() {
      this.showDatePicker = !this.showDatePicker
    },
    
    applyCustomDateFilter() {
      if (this.customStartDate && this.customEndDate) {
        this.globalFilter = 'custom'
        this.showDatePicker = false
        console.log(`📅 Custom date filter applied: ${this.customStartDate} to ${this.customEndDate}`)
      }
    },
    
    clearCustomDateFilter() {
      this.customStartDate = ''
      this.customEndDate = ''
      this.globalFilter = 'month'
      this.showDatePicker = false
      console.log('🗑️ Custom date filter cleared')
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
    
    handleClickOutside(event) {
      const datePickerContainer = event.target.closest('.position-relative')
      if (!datePickerContainer && this.showDatePicker) {
        this.showDatePicker = false
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
    
    // Close date picker when clicking outside
    document.addEventListener('click', this.handleClickOutside)
  },
  
  beforeUnmount() {
    // Clean up event listener
    document.removeEventListener('click', this.handleClickOutside)
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

/* Custom Date Range Picker Styles */
.date-picker-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  min-width: 320px;
  z-index: 1000;
  animation: slideDown 0.2s ease-out;
}

.date-picker-dropdown.dark-theme {
  background: #1e293b;
  border-color: #334155;
}

.date-picker-dropdown .input-group-text {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px 0 0 8px;
  padding: 0.5rem 0.75rem;
}

.date-picker-dropdown .dark-theme .input-group-text,
.date-picker-dropdown.dark-theme .input-group-text {
  background-color: #0f172a;
  border-color: #334155;
}

.date-picker-dropdown .form-control {
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.date-picker-dropdown .form-control:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 0.2rem rgba(16, 185, 129, 0.15);
}

.dark-input {
  background-color: #0f172a !important;
  border-color: #334155 !important;
  color: #f1f5f9 !important;
}

.dark-input:focus {
  background-color: #0f172a !important;
  border-color: #10b981 !important;
  color: #f1f5f9 !important;
  box-shadow: 0 0 0 0.2rem rgba(16, 185, 129, 0.15) !important;
}

.date-picker-dropdown .btn-success {
  background-color: #10b981;
  border-color: #10b981;
}

.date-picker-dropdown .btn-success:hover:not(:disabled) {
  background-color: #059669;
  border-color: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.date-picker-dropdown .btn-success:disabled {
  background-color: #9ca3af;
  border-color: #9ca3af;
  cursor: not-allowed;
}

.date-picker-dropdown label i {
  font-size: 0.875rem;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Close date picker when clicking outside */
.position-relative {
  position: relative;
}
</style>
