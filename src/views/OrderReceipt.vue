<template>
  <main class="py-5 d-flex flex-column align-items-center min-vh-100 bg-light">
    <!-- Confirmation Header -->
    <div class="text-center mb-4">
      <div class="mx-auto mb-3 d-flex align-items-center justify-content-center bg-success bg-opacity-25 rounded-circle shadow" style="width: 64px; height: 64px;">
        <!-- Use Bootstrap Icon SVG directly for best compatibility -->
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-check2 text-success" viewBox="0 0 16 16">
          <path d="M13.854 4.146a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
        </svg>
      </div>
      <h1 class="h4 fw-bold text-success">Order Confirmed!</h1>
      <p class="text-muted small">Thank you for your order.<br>We'll send you a confirmation email shortly.</p>
    </div>

    <!-- Receipt Card -->
    <div class="card shadow rounded-4 p-4 w-100" style="max-width: 600px; border-top: 5px solid #198754;">
      <!-- Header -->
      <div class="text-center mb-3">
        <h2 class="h5 fw-bold mb-1 text-success">Order Receipt</h2>
        <p class="text-muted mb-0 small" v-if="loading">Loading...</p>
        <p class="text-muted mb-0 small" v-else-if="order">Order #{{ order.orderID }}</p>
        <p class="text-muted mb-0 small" v-else>Order #N/A</p>
        <p class="text-secondary small mb-0" v-if="order">
          {{ order.day }}, {{ order.date }} at {{ order.time }}
        </p>
        <p class="text-secondary small mb-0 text-danger" v-else-if="errorMsg">
          {{ errorMsg }}
        </p>
        <p class="text-secondary small mb-0" v-else-if="loading">
          Loading order details...
        </p>
      </div>
      <hr />

      <!-- Collection Details -->
      <div class="mb-4">
        <h6 class="fw-semibold mb-2 text-success">Collection Details</h6>
        <div class="bg-light rounded-3 p-3 small border border-success border-opacity-25">
          <p class="mb-1 fw-medium text-success" v-if="hawker">{{ hawker.hawkerName }}</p>
          <p class="mb-1 fw-medium text-success" v-else-if="order">{{ order.hawkerName || 'Loading...' }}</p>
          <p class="mb-1 fw-medium text-success" v-else>Loading...</p>
          <p class="mb-1" v-if="hawker?.address?.formattedAddress">{{ hawker.address.formattedAddress }}</p>
          <p class="mb-1" v-else-if="order?.hawkerAddress">{{ order.hawkerAddress }}</p>
          <p class="mb-1" v-else>Loading address...</p>
          <p class="mb-1 fw-medium text-success">Location Map</p>
          <div class="rounded-3 overflow-hidden border border-success border-opacity-25">
            <iframe 
              v-if="hawker?.address?.latitude && hawker?.address?.longitude"
              :src="`https://www.google.com/maps?q=${hawker.address.latitude},${hawker.address.longitude}&hl=en&z=14&output=embed`"
              width="100%" 
              height="200" 
              style="border:0;" 
              allowfullscreen="" 
              loading="lazy" 
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
            <div v-else class="d-flex align-items-center justify-content-center" style="height: 200px; background: #f0f0f0;">
              <p class="text-muted mb-0">Loading map...</p>
            </div>
          </div>
          <br></br>
          <p class="text-muted mb-0">Collection time: <span class="fw-semibold text-success">7:00 pm</span></p>
        </div>
        
        <!-- Map -->
        <!-- <div class="mt-3">
          <h6 class="fw-semibold mb-2 text-success">Location Map</h6>
          <div class="rounded-3 overflow-hidden border border-success border-opacity-25">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.822200923736!2d103.84219207543734!3d1.280341461794361!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da190d4d2ce4b1%3A0xce7f195d585390aa!2sMaxwell%20Food%20Centre!5e0!3m2!1sen!2ssg!4v1761379585008!5m2!1sen!2ssg" 
              width="100%" 
              height="200" 
              style="border:0;" 
              allowfullscreen="" 
              loading="lazy" 
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        </div> -->
      </div>

      <!-- Order Items -->
      <div class="mb-4">
        <h6 class="fw-semibold mb-3 text-success">Order Items</h6>
        <div v-if="order && order.items && order.items.length > 0">
          <div 
            v-for="(item, index) in order.items" 
            :key="index"
            class="d-flex justify-content-between align-items-center py-2 border-bottom"
          >
            <div class="d-flex align-items-center gap-3">
              <img 
                v-if="item.imageUrl"
                :src="item.imageUrl"
                :alt="item.itemName" 
                class="rounded-3 border border-success border-opacity-25" 
                style="width:56px; height:56px; object-fit:cover;"
                @error="handleImageError"
              />
              <div 
                v-else
                class="rounded-3 border border-success border-opacity-25 d-flex align-items-center justify-content-center bg-light"
                style="width:56px; height:56px;"
              >
                <i class="fa-solid fa-image text-muted"></i>
              </div>
              <div>
                <div class="fw-bold text-success">{{ item.itemName }}</div>
                <div class="text-muted small">
                  Original: <span class="text-decoration-line-through">${{ formatPrice(item.itemPrice) }}</span>
                  <span class="text-success fw-bold ms-1">Now: ${{ formatPrice(item.discountedPrice) }}</span>
                </div>
              </div>
            </div>
            <div class="text-end small">
              <div class="text-muted">x{{ item.qty }}</div>
              <div class="fw-bold text-success">${{ formatPrice(item.itemTotal) }}</div>
            </div>
          </div>
        </div>
        <div v-else-if="loading" class="text-center text-muted py-3">
          <p class="mb-0">Loading items...</p>
        </div>
        <div v-else class="text-center text-muted py-3">
          <p class="mb-0">No items found</p>
        </div>
      </div>

      <!-- Summary -->
      <div class="mb-4 small" v-if="order">
        <div class="d-flex justify-content-between">
          <span>Subtotal (Before Discount)</span>
          <span>${{ formatPrice(order.subtotalBeforeDiscount || 0) }}</span>
        </div>
        <div class="d-flex justify-content-between">
          <span>Discount</span>
          <span class="text-success">-${{ formatPrice(order.discount || 0) }}</span>
        </div>
        <div class="d-flex justify-content-between"><span>Tax (0%)</span><span>$0.00</span></div>
        <hr class="my-2" />
        <div class="d-flex justify-content-between fw-bold fs-5 text-success">
          <span>Total Paid</span>
          <span>${{ formatPrice(order.orderTotal || 0) }}</span>
        </div>
      </div>
      <div v-else-if="loading" class="mb-4 small text-center text-muted py-3">
        <p class="mb-0">Loading summary...</p>
      </div>

      <!-- Payment -->
      <div class="mb-4" v-if="order">
        <h6 class="fw-semibold mb-1 text-success">Payment Method</h6>
        <p class="small text-muted mb-0">
          <span v-if="order.paymentMethod === 'card'">Credit/Debit Card</span>
          <span v-else-if="order.paymentMethod === 'paynow'">PayNow</span>
          <span v-else-if="order.paymentMethod === 'cash'">Cash on Delivery</span>
          <span v-else>{{ order.paymentMethod || 'Not specified' }}</span>
        </p>
      </div>

      <hr />

      <!-- Buttons -->
      <div class="d-flex justify-content-end gap-2">
        <button class="btn btn-outline-success d-flex align-items-center">
          <i class="bi bi-download me-2"></i>
          Download Receipt
        </button>
        <button 
          @click="goToReviews" 
          class="btn btn-success d-flex align-items-center"
          :disabled="!order"
        >
          <i class="bi bi-house-door me-2"></i>
          Order Collected
        </button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '/firebase/config';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const router = useRouter();

// Format price to 2 decimal places
const formatPrice = (price) => {
  const numPrice = typeof price === 'number' ? price : parseFloat(price) || 0;
  return numPrice.toFixed(2);
};

// Handle image loading errors - fallback to default image
const handleImageError = (event) => {
  // Try to use a default placeholder or hide the image
  event.target.style.display = 'none';
};

const auth = getAuth();
const order = ref(null);
const hawker = ref(null);
const loading = ref(true);
const errorMsg = ref(null);

const fetchLatestOrder = async (userId) => {
  try {
    loading.value = true;
    errorMsg.value = null;

    let querySnapshot;
    
    // Try query with orderBy on orderID (descending) first
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        orderBy('orderID', 'desc'),
        limit(1)
      );
      querySnapshot = await getDocs(ordersQuery);
    } catch (indexError) {
      // If orderBy fails (likely missing index), try without orderBy and sort in JavaScript
      console.log('Index error, trying alternative query:', indexError);
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        limit(50) // Get more and sort manually
      );
      querySnapshot = await getDocs(ordersQuery);
    }

    if (!querySnapshot.empty) {
      let orders = [];
      querySnapshot.docs.forEach(doc => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      
      // If we got multiple orders, sort by orderID descending
      if (orders.length > 1) {
        orders.sort((a, b) => (b.orderID || 0) - (a.orderID || 0));
      }
      
      const orderData = orders[0];
      console.log('Order fetched:', orderData);
      
      order.value = {
        orderID: orderData.orderID,
        day: orderData.day,
        date: orderData.date,
        time: orderData.time,
        ...orderData
      };
      
      // Fetch hawker details if hawkerId exists
      if (orderData.hawkerId) {
        await fetchHawkerDetails(orderData.hawkerId);
      }
    } else {
      console.log('No orders found for user:', userId);
      errorMsg.value = 'No orders found';
    }
  } catch (error) {
    console.error('Error fetching order:', error);
    errorMsg.value = `Failed to load order: ${error.message}`;
  } finally {
    loading.value = false;
  }
};

// Fetch hawker details from hawkerListings
const fetchHawkerDetails = async (hawkerId) => {
  try {
    const hawkerQuery = query(
      collection(db, 'hawkerListings'),
      where('userId', '==', hawkerId)
    );
    
    const hawkerSnapshot = await getDocs(hawkerQuery);
    
    if (!hawkerSnapshot.empty) {
      const hawkerData = hawkerSnapshot.docs[0].data();
      hawker.value = {
        hawkerName: hawkerData.hawkerName,
        address: hawkerData.address || {}
      };
      console.log('Hawker fetched:', hawker.value);
    } else {
      console.log('Hawker not found:', hawkerId);
      // Fallback to order data if hawker not found
      if (order.value) {
        hawker.value = {
          hawkerName: order.value.hawkerName,
          address: {
            formattedAddress: order.value.hawkerAddress || 'Address not available'
          }
        };
      }
    }
  } catch (error) {
    console.error('Error fetching hawker details:', error);
    // Fallback to order data on error
    if (order.value) {
      hawker.value = {
        hawkerName: order.value.hawkerName,
        address: {
          formattedAddress: order.value.hawkerAddress || 'Address not available'
        }
      };
    }
  }
};

let authUnsubscribe = null;

onMounted(() => {
  // Wait for auth state to be ready
  authUnsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchLatestOrder(user.uid);
    } else {
      loading.value = false;
      errorMsg.value = 'Please log in to view your order receipt';
    }
  });
});

// Navigate to reviews page with order data
const goToReviews = () => {
  if (order.value && order.value.orderID) {
    router.push({
      path: '/reviews',
      query: {
        orderId: order.value.orderID,
        hawkerId: order.value.hawkerId
      }
    });
  }
};

onUnmounted(() => {
  if (authUnsubscribe) {
    authUnsubscribe();
  }
});
</script>

<style scoped>
.card {
  border-radius: 1.5rem;
}
.bg-success.bg-opacity-25 {
  background-color: rgba(25, 135, 84, 0.15) !important;
}
.border-success {
  border-color: #198754 !important;
}
.btn-success, .btn-outline-success {
  font-weight: 500;
  letter-spacing: 0.5px;
}
</style>

<!--
  Requires Bootstrap 5 and Bootstrap Icons (for bi- classes).
  If you don't have Bootstrap Icons, replace <i class="bi ..."></i> with SVGs or remove icons.
-->