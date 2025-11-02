// logic for accept/cancel orders

// Dummy data for demonstration
export const ordersData = {
  today: [
    {
      id: 'ORD001',
      time: '09:15 AM',
      item: 'Chicken Rice',
      qty: 1,
      customer: 'Alice',
      status: 'Preparing',
      comments: 'Less chilli',
      completed: false,
    },
    {
      id: 'ORD002',
      time: '09:45 AM',
      item: 'Laksa',
      qty: 2,
      customer: 'Bob',
      status: 'Preparing',
      comments: '',
      completed: false,
    },
    {
      id: 'ORD003',
      time: '10:05 AM',
      item: 'Fried Noodles',
      qty: 1,
      customer: 'Eve',
      status: 'Ready for Collection',
      comments: 'No bean sprouts',
      completed: true,
    },
  ],
  history: [
    {
      id: 'ORD900',
      date: '2025-10-25',
      time: '11:20 AM',
      item: 'Mee Rebus',
      qty: 1,
      customer: 'Tom',
      status: 'Collected',
      comments: '',
    },
    {
      id: 'ORD901',
      date: '2025-10-26',
      time: '10:15 AM',
      item: 'Nasi Lemak',
      qty: 2,
      customer: 'Jerry',
      status: 'Collected',
      comments: 'Extra egg',
    },
  ],
};
import { ref, computed, onMounted } from 'vue';
import { db } from '/firebase/config';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default {
  name: 'OrdersManagement',
  setup() {
    const auth = getAuth();
    const activeTab = ref('today');
    const selectedOrders = ref([]);
    const selectAll = ref(false);
    const todayOrders = ref([]);
    const historyOrders = ref([]);
    const loading = ref(true);
    const loadingHistory = ref(true);
    const sortOrder = ref('desc');
    const isStatusFilterOpen = ref(false);
    const activeStatusFilters = ref([]);

    // Get current hawker ID
    const hawkerId = computed(() => auth.currentUser?.uid);

    // Computed properties
    const todayOrdersCount = computed(() => todayOrders.value.length);
    
    const pendingCount = computed(() => 
      todayOrders.value.filter(o => o.status === 'pending' || o.status === 'preparing').length
    );
    
    const completedCount = computed(() => 
      todayOrders.value.filter(o => o.status === 'completed').length
    );

    const filteredTodayOrders = computed(() => {
      let orders = todayOrders.value;
      
      if (activeStatusFilters.value.length > 0) {
        orders = orders.filter(o => activeStatusFilters.value.includes(o.status));
      }
      
      return orders.sort((a, b) => {
        // Sort by status priority first (pending > preparing > ready > completed)
        const statusOrder = { pending: 0, preparing: 1, ready: 2, completed: 3 };
        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) return statusDiff;
        
        // Then by time (newest first)
        return b.timestamp?.toMillis() - a.timestamp?.toMillis();
      });
    });

    const sortedHistory = computed(() => {
      return [...historyOrders.value].sort((a, b) => {
        const timeA = a.timestamp?.toMillis() || 0;
        const timeB = b.timestamp?.toMillis() || 0;
        return sortOrder.value === 'desc' ? timeB - timeA : timeA - timeB;
      });
    });

    // Fetch today's orders
    const fetchTodayOrders = () => {
      if (!hawkerId.value) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = Timestamp.fromDate(today);

      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('hawkerId', '==', hawkerId.value),
        where('timestamp', '>=', todayTimestamp)
      );

      onSnapshot(q, (snapshot) => {
        todayOrders.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        loading.value = false;
      }, (error) => {
        console.error('Error fetching today\'s orders:', error);
        loading.value = false;
      });
    };

    // Fetch order history
    const fetchOrderHistory = () => {
      if (!hawkerId.value) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = Timestamp.fromDate(today);

      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('hawkerId', '==', hawkerId.value),
        where('timestamp', '<', todayTimestamp)
      );

      onSnapshot(q, (snapshot) => {
        historyOrders.value = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(order => order.status === 'completed');
        loadingHistory.value = false;
      }, (error) => {
        console.error('Error fetching order history:', error);
        loadingHistory.value = false;
      });
    };

    // Order actions
    const acceptOrder = async (order) => {
      try {
        const orderRef = doc(db, 'orders', order.id);
        await updateDoc(orderRef, {
          status: 'preparing'
        });
      } catch (error) {
        console.error('Error accepting order:', error);
        alert('Failed to accept order');
      }
    };

    const markOrderReady = async (order) => {
      try {
        const orderRef = doc(db, 'orders', order.id);
        await updateDoc(orderRef, {
          status: 'ready'
        });
      } catch (error) {
        console.error('Error marking order ready:', error);
        alert('Failed to mark order as ready');
      }
    };

    const markOrderCollected = async (order) => {
      try {
        const orderRef = doc(db, 'orders', order.id);
        await updateDoc(orderRef, {
          status: 'completed',
          completedAt: Timestamp.now()
        });
      } catch (error) {
        console.error('Error marking order collected:', error);
        alert('Failed to mark order as collected');
      }
    };

    const markSelectedReady = async () => {
      if (!confirm(`Mark ${selectedOrders.value.length} order(s) as ready?`)) return;

      try {
        const promises = selectedOrders.value.map(orderId => {
          const orderRef = doc(db, 'orders', orderId);
          return updateDoc(orderRef, { status: 'ready' });
        });
        
        await Promise.all(promises);
        selectedOrders.value = [];
        selectAll.value = false;
      } catch (error) {
        console.error('Error marking selected orders:', error);
        alert('Failed to update orders');
      }
    };

    // Utility functions
    const toggleSelectAll = () => {
      if (selectAll.value) {
        selectedOrders.value = filteredTodayOrders.value
          .filter(o => o.status === 'preparing')
          .map(o => o.id);
      } else {
        selectedOrders.value = [];
      }
    };

    const toggleStatusFilter = () => {
      isStatusFilterOpen.value = !isStatusFilterOpen.value;
    };

    const toggleSortOrder = () => {
      sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc';
    };

    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (timestamp) => {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusText = (status) => {
      const statusMap = {
        pending: 'New Order',
        preparing: 'Preparing',
        ready: 'Ready',
        completed: 'Completed'
      };
      return statusMap[status] || status;
    };

    const getItemsSummary = (items) => {
      if (!items || items.length === 0) return '';
      if (items.length === 1) return items[0].itemName;
      return `${items[0].itemName} +${items.length - 1} more`;
    };

    const viewOrderDetails = (order) => {
      // Implement order details modal/page
      console.log('View order:', order);
    };

    onMounted(() => {
      fetchTodayOrders();
      fetchOrderHistory();
    });

    return {
      activeTab,
      selectedOrders,
      selectAll,
      todayOrders,
      filteredTodayOrders,
      sortedHistory,
      loading,
      loadingHistory,
      sortOrder,
      isStatusFilterOpen,
      activeStatusFilters,
      todayOrdersCount,
      pendingCount,
      completedCount,
      acceptOrder,
      markOrderReady,
      markOrderCollected,
      markSelectedReady,
      toggleSelectAll,
      toggleStatusFilter,
      toggleSortOrder,
      formatDate,
      formatTime,
      getStatusText,
      getItemsSummary,
      viewOrderDetails
    };
  }
};