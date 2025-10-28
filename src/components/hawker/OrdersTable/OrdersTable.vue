<template>
  <div class="container mt-4">
    <h2 class="mb-3 text-center">Orders Management</h2>

    <!-- Tabs -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <button
          class=""
          :class="{ active: activeTab === 'today' }"
          @click="activeTab = 'today'"
        >
          Today's Orders
        </button>
      </li>
      <li class="nav-item">
        <button
          class=""
          :class="{ active: activeTab === 'history' }"
          @click="activeTab = 'history'"
        >
          Order History
        </button>
      </li>
    </ul>

    <!-- Today's Orders -->
    <div v-if="activeTab === 'today'">
      <div class="mb-3">
        <strong>Total Orders:</strong> {{ totalOrders }} |
        <strong>Completed:</strong> {{ completedOrders }} |
        <strong>Not Completed:</strong> {{ notCompletedOrders }}
      </div>

      <!-- Bulk Actions -->
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div>
          <input
            type="checkbox"
            v-model="selectAll"
            @change="toggleSelectAll()"
          />
          <label class="ms-2">Select All</label>
        </div>
        <button
           v-if="selectedOrders!= ''"
          class="btn btn-success btn-sm"
          :disabled="!selectedOrders.length"
          @click="markSelectedCompleted"
        >
          Mark as Completed
        </button>
      </div>

      <!-- Uncompleted Orders -->
      <h5>Ongoing Orders</h5>
      <table class="table table-striped table-bordered">
        <thead class="table-light">
          <tr>
            <th></th>
            <th>Order ID</th>
            <th>Time Ordered</th>
            <th>Item</th>
            <th>Qty</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Comments</th>
            <th>Completion</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="order in ongoingOrders"
            :key="order.id"
          >
            <td><input type="checkbox" v-model="selectedOrders" :value="order.id" /></td>
            <td>{{ order.id }}</td>
            <td>{{ order.time }}</td>
            <td>{{ order.item }}</td>
            <td>{{ order.qty }}</td>
            <td>{{ order.customer }}</td>
            <td>{{ order.status }}</td>
            <td>{{ order.comments }}</td>
            <td>
              <button
                class="btn btn-outline-success btn-sm"
                @click="markCompleted(order)"
              >
                Mark Completed
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Completed Orders -->
      <h5 class="mt-4">Completed Orders</h5>
      <table class="table table-striped table-bordered">
        <thead class="table-light">
          <tr>
            <th>Order ID</th>
            <th>Time Ordered</th>
            <th>Item</th>
            <th>Qty</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in completedToday" :key="order.id">
            <td>{{ order.id }}</td>
            <td>{{ order.time }}</td>
            <td>{{ order.item }}</td>
            <td>{{ order.qty }}</td>
            <td>{{ order.customer }}</td>
            <td>{{ order.status }}</td>
            <td>{{ order.comments }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Order History -->
    <div v-else>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5>Order History</h5>
        <button
          class="btn btn-outline-primary btn-sm"
          @click="toggleSortOrder"
        >
          Sort by Date: {{ sortOrder === 'asc' ? 'Oldest → Newest' : 'Newest → Oldest' }}
        </button>
      </div>

      <table class="table table-striped table-bordered">
        <thead class="table-light">
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Time</th>
            <th>Item</th>
            <th>Qty</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in sortedHistory" :key="order.id">
            <td>{{ order.id }}</td>
            <td>{{ order.date }}</td>
            <td>{{ order.time }}</td>
            <td>{{ order.item }}</td>
            <td>{{ order.qty }}</td>
            <td>{{ order.customer }}</td>
            <td>{{ order.status }}</td>
            <td>{{ order.comments }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ordersData } from './OrdersTable';

export default {
  name: 'OrdersPage',
  data() {
    return {
      activeTab: 'today',
      todayOrders: ordersData.today,
      historyOrders: ordersData.history,
      selectedOrders: [],
      selectAll: false,
      sortOrder: 'desc',
    };
  },
  computed: {
    ongoingOrders() {
      return this.todayOrders
        .filter(o => !o.completed)
        .sort((a, b) => a.time.localeCompare(b.time));
    },
    completedToday() {
      return this.todayOrders
        .filter(o => o.completed)
        .sort((a, b) => a.time.localeCompare(b.time));
    },
    totalOrders() {
      return this.todayOrders.length;
    },
    completedOrders() {
      return this.todayOrders.filter(o => o.completed).length;
    },
    notCompletedOrders() {
      return this.todayOrders.filter(o => !o.completed).length;
    },
    sortedHistory() {
      return [...this.historyOrders].sort((a, b) => {
        if (this.sortOrder === 'asc') return a.date.localeCompare(b.date);
        else return b.date.localeCompare(a.date);
      });
    },
  },
  methods: {
    markCompleted(order) {
      order.completed = true;
      order.status = 'Ready for Collection';
      this.selectedOrders = this.selectedOrders.filter(id => id !== order.id);
    },
    toggleSelectAll() {

      if (this.selectAll) {
        this.selectedOrders = this.ongoingOrders.map(o => o.id);
      } else {
        this.selectedOrders = [];
      }
    },
    markSelectedCompleted() {
      this.todayOrders.forEach(order => {
        if (this.selectedOrders.includes(order.id)) {
          order.completed = true;
          order.status = 'Ready for Collection';
        }
      });
      this.selectedOrders = [];
      this.selectAll = false;
    },
    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    },
  },
};
</script>

<style scoped>
.nav-link.active {
  background-color: #0d6efd;
  color: white !important;
}
table {
  font-size: 0.95rem;
}
.hidden{
    display: none;
}
</style>
