import { ref, computed, onMounted, onUnmounted } from 'vue';
import { db } from '/firebase/config';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  updateDoc,
  doc,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue';

export default {
  name: 'OrdersManagement',
  components: { LoadingSpinner },
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

    let unsubscribeToday = null;
    let unsubscribeHistory = null;

    const hawkerId = ref(null);

    // Computed properties
    const todayOrdersCount = computed(() => todayOrders.value.length);

    const pendingCount = computed(() =>
      todayOrders.value.filter(o => o.status === 'pending' || o.status === 'preparing').length
    );

    const completedCount = computed(() =>
      todayOrders.value.filter(o => o.status === 'completed').length
    );

    const selectedPendingCount = computed(() =>
      todayOrders.value.filter(
        o => selectedOrders.value.includes(o.id) && o.status === 'pending'
      ).length
    );

    const selectedPreparingCount = computed(() =>
      todayOrders.value.filter(
        o => selectedOrders.value.includes(o.id) && o.status === 'preparing'
      ).length
    );

    const filteredTodayOrders = computed(() => {
      let orders = todayOrders.value;

      if (activeStatusFilters.value.length > 0) {
        orders = orders.filter(o => activeStatusFilters.value.includes(o.status));
      }

      return orders.sort((a, b) => {
        const statusOrder = { pending: 0, preparing: 1, ready: 2, completed: 3 };
        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) return statusDiff;
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(today);

    // Fetch today's orders
    const fetchTodayOrders = (uid) => {
      if (!uid) return;

      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('hawkerId', '==', uid),
        where('timestamp', '>=', todayTimestamp)
      );

      unsubscribeToday = onSnapshot(
        q,
        (snapshot) => {
          todayOrders.value = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          loading.value = false;
        },
        (error) => {
          console.error("Error fetching today's orders:", error);
          loading.value = false;
        }
      );
    };

    // Fetch order history
    const fetchOrderHistory = (uid) => {
      if (!uid) return;

      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('hawkerId', '==', uid),
        where('timestamp', '<', todayTimestamp)
      );

      unsubscribeHistory = onSnapshot(
        q,
        (snapshot) => {
          historyOrders.value = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            .filter(order => order.status === 'completed');
          loadingHistory.value = false;
        },
        (error) => {
          console.error('Error fetching order history:', error);
          loadingHistory.value = false;
        }
      );
    };

    // Order actions
    const acceptOrder = async (order) => {
      try {
        const orderRef = doc(db, 'orders', order.id);
        await updateDoc(orderRef, { status: 'preparing' });
      } catch (error) {
        console.error('Error accepting order:', error);
        alert('Failed to accept order');
      }
    };

    const markOrderReady = async (order) => {
      try {
        const orderRef = doc(db, 'orders', order.id);
        await updateDoc(orderRef, { status: 'ready' });
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

    // Bulk actions
    const acceptSelectedOrders = async () => {
      const pendingOrders = todayOrders.value.filter(
        o => selectedOrders.value.includes(o.id) && o.status === 'pending'
      );
      if (pendingOrders.length === 0) return;

      if (!confirm(`Accept ${pendingOrders.length} pending order(s)?`)) return;

      try {
        const promises = pendingOrders.map(order => {
          const orderRef = doc(db, 'orders', order.id);
          return updateDoc(orderRef, { status: 'preparing' });
        });

        await Promise.all(promises);
        alert(`${pendingOrders.length} order(s) accepted.`);
      } catch (error) {
        console.error('Error accepting orders:', error);
        alert('Failed to accept selected orders');
      } finally {
        selectedOrders.value = [];
        selectAll.value = false;
      }
    };

    const markSelectedReady = async () => {
      const preparingOrders = todayOrders.value.filter(
        o => selectedOrders.value.includes(o.id) && o.status === 'preparing'
      );
      if (preparingOrders.length === 0) return;

      if (!confirm(`Mark ${preparingOrders.length} order(s) as ready?`)) return;

      try {
        const promises = preparingOrders.map(order => {
          const orderRef = doc(db, 'orders', order.id);
          return updateDoc(orderRef, { status: 'ready' });
        });

        await Promise.all(promises);
        alert(`${preparingOrders.length} order(s) marked as ready.`);
      } catch (error) {
        console.error('Error marking ready orders:', error);
        alert('Failed to mark selected orders as ready');
      } finally {
        selectedOrders.value = [];
        selectAll.value = false;
      }
    };

    // Utility functions
    const toggleSelectAll = () => {
      if (selectAll.value) {
        selectedOrders.value = filteredTodayOrders.value
          .filter(o => o.status === 'preparing' || o.status === 'pending')
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
      else return items;
    };

    const viewOrderDetails = (order) => {
      console.log('View order:', order);
    };

    const deleteSelectedOrders = async () => {
      if (selectedOrders.value.length === 0) return;
      if (!confirm(`Delete ${selectedOrders.value.length} order(s)? This cannot be undone.`)) return;

      try {
        const promises = selectedOrders.value.map(orderId => {
          const orderRef = doc(db, 'orders', orderId);
          return deleteDoc(orderRef);
        });

        await Promise.all(promises);
        alert(`${selectedOrders.value.length} order(s) deleted successfully.`);
        selectedOrders.value = [];
        selectAll.value = false;
      } catch (error) {
        console.error('Error deleting orders:', error);
        alert('Failed to delete selected orders');
      }
    };

    const toggleSelectAllHistory = () => {
      if (selectAll.value) {
        selectedOrders.value = sortedHistory.value.map(o => o.id);
      } else {
        selectedOrders.value = [];
      }
    };

    //  Wait for Firebase Auth to load
    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          hawkerId.value = user.uid;
          fetchTodayOrders(user.uid);
          fetchOrderHistory(user.uid);
        } else {
          console.warn('No user logged in');
          loading.value = false;
          loadingHistory.value = false;
        }
      });
    });

    // Cleanup listeners when leaving the page
    onUnmounted(() => {
      if (unsubscribeToday) unsubscribeToday();
      if (unsubscribeHistory) unsubscribeHistory();
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
      acceptSelectedOrders,
      toggleSelectAll,
      toggleStatusFilter,
      toggleSortOrder,
      formatDate,
      formatTime,
      getStatusText,
      getItemsSummary,
      viewOrderDetails,
      deleteSelectedOrders,
      toggleSelectAllHistory,
      selectedPendingCount,
      selectedPreparingCount
    };
  }
};
