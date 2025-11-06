<template>
  <main class="receipt-page py-3 py-sm-4 py-md-5 px-2 px-sm-3 d-flex flex-column align-items-center min-vh-100 bg-light">
    <!-- Confirmation Header -->
    <div class="text-center mb-3 mb-md-4 px-2">
      <div class="success-icon mx-auto mb-3 d-flex align-items-center justify-content-center bg-success bg-opacity-25 rounded-circle shadow">
        <!-- Use Bootstrap Icon SVG directly for best compatibility -->
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-check2 text-success" viewBox="0 0 16 16">
          <path d="M13.854 4.146a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
        </svg>
      </div>
      <h1 class="h4 fw-bold text-success mb-2">Order Confirmed!</h1>
      <p class="text-muted small mb-0">Thank you for your order.<br>We'll send you a confirmation email shortly.</p>
    </div>

    <!-- Receipt Card -->
    <div class="receipt-card card shadow rounded-4 w-100" style="border-top: 5px solid #198754;">
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

      <!-- Order Status -->
      <div class="mb-3 mb-md-4">
        <h6 class="fw-semibold mb-2 text-success">Order Status</h6>
        <div
          v-if="order"
          class="order-status-box d-flex align-items-center justify-content-between bg-light rounded-3 p-3 border border-success border-opacity-25 position-relative"
        >
          <div class="d-flex align-items-center gap-3 flex-grow-1">
            <!-- Dynamic icon -->
            <i
              v-if="order.status === 'preparing'"
              class="bi bi-clock text-warning fs-5"
            ></i>
            <i
              v-else-if="order.status === 'ready'"
              class="bi bi-check-circle-fill text-success fs-5"
            ></i>
            <i
              v-else-if="order.status === 'collected'"
              class="bi bi-bag-check-fill text-secondary fs-5"
            ></i>
            <i
              v-else
              class="bi bi-hourglass-split text-muted fs-5"
            ></i>

            <!-- Status text -->
            <div>
              <p class="mb-0 fw-bold text-success">
                <span v-if="order.status === 'preparing'" class="text-dark fw-bold">Preparing</span>
                <span v-else-if="order.status === 'ready'" class="text-dark">Ready for Collection</span>
                <span v-else-if="order.status === 'collected'" class="text-dark">Collected</span>
                <span v-else class="text-muted">Pending Confirmation</span>
              </p>
              <p class="mb-0 small text-muted" v-if="order.status === 'ready'">
                Your order is ready for pickup at the stall.
              </p>
              <p class="mb-0 small text-muted" v-else-if="order.status === 'collected'">
                You have collected your order.
              </p>
              <p class="mb-0 small text-muted" v-else>
                Your food is being prepared by the hawker...
              </p>
            </div>
          </div>

          <div class="order-action-container position-relative">
            <!-- Status Display or Action Button -->
            <div
              v-if="order && order.status === 'preparing'"
              class="order-status-text preparing d-flex align-items-center text-white fw-semibold"
            >
              <i class="bi bi-clock me-2"></i>
              Preparing...
            </div>

            <button
              v-else-if="order && order.status === 'ready'"
              @click="markOrderCollected"
              class="btn btn-success order-action-btn d-flex align-items-center justify-content-center"
              :disabled="isUpdating"
            >
              <span class="text-white fw-semibold">
                {{ isUpdating ? 'Updating...' : 'Mark Order as Collected' }}
              </span>
              
            </button>

            <div
              v-else-if="order && order.status === 'collected'"
              class="order-status-text collected d-flex align-items-center text-success fw-semibold"
            >
              Collected
            </div>

          </div>
        </div>

        <div v-else class="text-center text-muted small py-2">
          Loading order status...
        </div>
      </div>


      <!-- Collection Details -->
      <div class="mb-3 mb-md-4">
        <h6 class="fw-semibold mb-2 text-success">Collection Details</h6>
        <div class="collection-details bg-light rounded-3 p-2 p-sm-3 small border border-success border-opacity-25">
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
          <br>
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
      <div class="mb-3 mb-md-4">
        <h6 class="fw-semibold mb-2 mb-md-3 text-success">Order Items</h6>
        <div v-if="order && order.items && order.items.length > 0">
          <div 
            v-for="(item, index) in order.items" 
            :key="index"
            class="order-item d-flex justify-content-between align-items-start align-items-sm-center py-2 border-bottom flex-column flex-sm-row gap-2 gap-sm-3"
          >
            <div class="d-flex align-items-start align-items-sm-center gap-2 gap-sm-3 w-100 w-sm-auto">
              <img 
                v-if="item.imageUrl"
                :src="item.imageUrl"
                :alt="item.itemName" 
                class="item-image rounded-3 border border-success border-opacity-25 flex-shrink-0" 
                @error="handleImageError"
              />
              <div 
                v-else
                class="item-image-placeholder rounded-3 border border-success border-opacity-25 d-flex align-items-center justify-content-center bg-light flex-shrink-0"
              >
                <i class="fa-solid fa-image text-muted"></i>
              </div>
              <div class="flex-grow-1">
                <div class="fw-bold text-success item-name">{{ item.itemName }}</div>
                <div class="text-muted small item-pricing">
                  Original: <span class="text-decoration-line-through">${{ formatPrice(item.itemPrice) }}</span>
                  <span class="text-success fw-bold ms-1">Now: ${{ formatPrice(item.discountedPrice) }}</span>
                </div>
              </div>
            </div>
            <div class="text-end small item-total ms-auto ms-sm-0">
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
      <div class="mb-3 mb-md-4 small order-summary" v-if="order">
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
      <div class="mb-3 mb-md-4" v-if="order">
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
      <div class="receipt-actions d-flex flex-column flex-sm-row justify-content-end gap-2 align-items-stretch align-items-sm-center">
        <button class="btn btn-outline-success d-flex align-items-center justify-content-center" @click="generatePDF">
          <i class="bi bi-download me-2"></i>
          <span>Download Receipt</span>
        </button>
        
      </div>
    </div>

    <!-- Ready Notification Popup -->
    <div v-if="showReadyNotification" class="ready-notification" @click="closeNotification">
      <div class="notification-content" @click.stop>
        <div class="notification-icon">
          <i class="bi bi-check-circle-fill"></i>
        </div>
        <div class="notification-text">
          <h5>Your order is ready!</h5>
          <p>Your food is ready for collection. Please proceed to collect your order.</p>
        </div>
        <button class="notification-close" @click="closeNotification">
          <i class="bi bi-x"></i>
        </button>
        <button class="notification-acknowledge" @click="closeNotification">
          Got it
        </button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { db } from '/firebase/config';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import jsPDF from 'jspdf';

const router = useRouter();
const route = useRoute();

// Accept orderId as a prop
const props = defineProps({
  orderId: {
    type: String,
    default: null
  }
});

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
const isUpdating = ref(false);
const showReadyNotification = ref(false);
let orderUnsubscribe = null;

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
        id: orderData.id,
        orderID: orderData.orderID,
        day: orderData.day,
        date: orderData.date,
        time: orderData.time,
        status: orderData.status || 'pending',
        ...orderData
      };
      
      // Set up real-time listener for order status updates
      if (order.value.id) {
        setupOrderListener(order.value.id);
      }
      
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

// Fetch a specific order by ID
const fetchSpecificOrder = async (orderId, userId) => {
  try {
    loading.value = true;
    errorMsg.value = null;

    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (orderDoc.exists()) {
      const orderData = orderDoc.data();
      
      // Verify this order belongs to the current user
      if (orderData.userId !== userId) {
        errorMsg.value = 'You do not have permission to view this order';
        return;
      }
      
      console.log('Specific order fetched:', orderData);
      
      order.value = {
        id: orderDoc.id,
        orderID: orderData.orderID,
        day: orderData.day,
        date: orderData.date,
        time: orderData.time,
        status: orderData.status || 'pending',
        ...orderData
      };
      
      // Set up real-time listener for order status updates
      setupOrderListener(orderId);
      
      // Fetch hawker details if hawkerId exists
      if (orderData.hawkerId) {
        await fetchHawkerDetails(orderData.hawkerId);
      }
    } else {
      console.log('Order not found:', orderId);
      errorMsg.value = 'Order not found';
    }
  } catch (error) {
    console.error('Error fetching specific order:', error);
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
      // If orderId is provided via props or route params, fetch that specific order
      const orderIdToFetch = props.orderId || route.params.orderId;
      if (orderIdToFetch) {
        fetchSpecificOrder(orderIdToFetch, user.uid);
      } else {
        // Otherwise fetch the latest order
        fetchLatestOrder(user.uid);
      }
    } else {
      loading.value = false;
      errorMsg.value = 'Please log in to view your order receipt';
    }
  });
});

// Set up real-time listener for order status updates
const setupOrderListener = (orderId) => {
  if (orderUnsubscribe) {
    orderUnsubscribe();
  }
  
  const orderRef = doc(db, 'orders', orderId);
  orderUnsubscribe = onSnapshot(orderRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const orderData = docSnapshot.data();
      const newStatus = orderData.status || 'pending';
      const oldStatus = order.value?.status;
      
      // Update order status in real-time
      if (order.value) {
        order.value.status = newStatus;
      }
      
      // Show notification when status changes from 'preparing' to 'ready'
      if (oldStatus === 'preparing' && newStatus === 'ready') {
        showReadyNotification.value = true;
      }
    }
  }, (error) => {
    console.error('Error listening to order updates:', error);
  });
};

// Close notification
const closeNotification = () => {
  showReadyNotification.value = false;
};

// Mark order as collected
const markOrderCollected = async () => {
  if (!order.value || !order.value.id) {
    console.error('Order ID not available');
    return;
  }

  try {
    isUpdating.value = true;
    const orderRef = doc(db, 'orders', order.value.id);
    
    // Get current timestamp
    const now = new Date();
    const pickupTime = now.toLocaleString('en-SG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    // Save pickup time along with status
    await updateDoc(orderRef, { 
      status: 'collected',
      pickupTime: pickupTime,
      pickupTimestamp: now
    });
    
    // Navigate to reviews page after updating status
    if (order.value && order.value.orderID) {
      router.push({
        path: '/reviews',
        query: {
          orderId: order.value.orderID,
          hawkerId: order.value.hawkerId
        }
      });
    }
  } catch (error) {
    console.error('Error marking order as collected:', error);
    alert('Failed to mark order as collected. Please try again.');
  } finally {
    isUpdating.value = false;
  }
};

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

// Generate PDF receipt
const generatePDF = () => {
  if (!order.value) {
    alert('Order data not loaded yet. Please wait.');
    return;
  }

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper function to add text with word wrap
  const addText = (text, x, y, maxWidth, fontSize = 10) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * fontSize * 0.5);
  };

  // Header - Success Icon and Title
  pdf.setFillColor(25, 135, 84);
  pdf.circle(pageWidth / 2, yPosition + 10, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.text('✓', pageWidth / 2 - 3, yPosition + 13);
  
  yPosition += 25;
  pdf.setTextColor(25, 135, 84);
  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  pdf.text('Order Confirmed!', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 8;
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.text('Thank you for your order.', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  
  // Receipt Header
  pdf.setDrawColor(25, 135, 84);
  pdf.setLineWidth(1);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;
  
  pdf.setTextColor(25, 135, 84);
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('Order Receipt', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 5;
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Order #${order.value.orderID || 'N/A'}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 4;
  pdf.text(`${order.value.day || ''}, ${order.value.date || ''} at ${order.value.time || ''}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;
  
  // Collection Details
  pdf.setTextColor(25, 135, 84);
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('Collection Details', margin, yPosition);
  yPosition += 7;
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'bold');
  const hawkerName = hawker.value?.hawkerName || order.value.hawkerName || 'N/A';
  yPosition = addText(hawkerName, margin, yPosition, pageWidth - 2 * margin, 10);
  yPosition += 2;
  
  pdf.setFont(undefined, 'normal');
  const address = hawker.value?.address?.formattedAddress || order.value.hawkerAddress || 'Address not available';
  yPosition = addText(address, margin, yPosition, pageWidth - 2 * margin, 10);
  yPosition += 2;
  
  yPosition = addText('Collection time: 7:00 pm', margin, yPosition, pageWidth - 2 * margin, 10);
  yPosition += 10;
  
  // Order Items
  pdf.setTextColor(25, 135, 84);
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('Order Items', margin, yPosition);
  yPosition += 7;
  
  if (order.value.items && order.value.items.length > 0) {
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    
    order.value.items.forEach((item, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.setFont(undefined, 'bold');
      pdf.text(item.itemName, margin, yPosition);
      
      pdf.setFont(undefined, 'normal');
      const itemDetails = `Original: $${formatPrice(item.itemPrice)} | Now: $${formatPrice(item.discountedPrice)} | Qty: ${item.qty}`;
      yPosition += 4;
      pdf.text(itemDetails, margin, yPosition);
      
      pdf.setFont(undefined, 'bold');
      pdf.text(`$${formatPrice(item.itemTotal)}`, pageWidth - margin, yPosition, { align: 'right' });
      
      yPosition += 6;
    });
  }
  
  yPosition += 5;
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 7;
  
  // Summary
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  
  pdf.text('Subtotal (Before Discount)', margin, yPosition);
  pdf.text(`$${formatPrice(order.value.subtotalBeforeDiscount || 0)}`, pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 5;
  
  pdf.setTextColor(25, 135, 84);
  pdf.text('Discount', margin, yPosition);
  pdf.text(`-$${formatPrice(order.value.discount || 0)}`, pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 5;
  
  pdf.setTextColor(0, 0, 0);
  pdf.text('Tax (0%)', margin, yPosition);
  pdf.text('$0.00', pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 7;
  
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 7;
  
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.setTextColor(25, 135, 84);
  pdf.text('Total Paid', margin, yPosition);
  pdf.text(`$${formatPrice(order.value.orderTotal || 0)}`, pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 10;
  
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 7;
  
  // Payment Method
  pdf.setTextColor(25, 135, 84);
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'bold');
  pdf.text('Payment Method', margin, yPosition);
  yPosition += 5;
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  let paymentMethod = 'Not specified';
  if (order.value.paymentMethod === 'card') paymentMethod = 'Credit/Debit Card';
  else if (order.value.paymentMethod === 'paynow') paymentMethod = 'PayNow';
  else if (order.value.paymentMethod === 'cash') paymentMethod = 'Cash on Delivery';
  pdf.text(paymentMethod, margin, yPosition);
  
  // Footer
  yPosition = pageHeight - 20;
  pdf.setTextColor(150, 150, 150);
  pdf.setFontSize(8);
  pdf.text('Generated by 2Shiok2Go', pageWidth / 2, yPosition, { align: 'center' });
  pdf.text(new Date().toLocaleString(), pageWidth / 2, yPosition + 4, { align: 'center' });
  
  // Save PDF
  pdf.save(`order-receipt-${order.value.orderID || 'unknown'}.pdf`);
};

onUnmounted(() => {
  if (authUnsubscribe) {
    authUnsubscribe();
  }
  if (orderUnsubscribe) {
    orderUnsubscribe();
  }
});
</script>

<style scoped>
/* ===== Base Styles ===== */
.receipt-page {
  transition: padding 0.3s ease;
}

.success-icon {
  width: 56px;
  height: 56px;
  transition: all 0.3s ease;
}

.receipt-card {
  max-width: 1000px;
  border-radius: 1.5rem;
  padding: 1.25rem;
  transition: all 0.3s ease;
}

.collection-details {
  transition: padding 0.3s ease;
}

.order-item {
  transition: all 0.3s ease;
}

.item-image {
  width: 48px;
  height: 48px;
  object-fit: cover;
  transition: all 0.3s ease;
}

.item-image-placeholder {
  width: 48px;
  height: 48px;
  transition: all 0.3s ease;
}

.item-name {
  font-size: 0.9rem;
  line-height: 1.3;
}

.item-pricing {
  font-size: 0.8rem;
  line-height: 1.4;
}

.item-total {
  min-width: 60px;
}

.order-summary {
  transition: all 0.3s ease;
}

.receipt-actions {
  gap: 0.5rem;
}

.receipt-actions .btn {
  padding: 0.625rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.3px;
  white-space: nowrap;
  transition: all 0.3s ease;
}

/* Order Status */
/* --- Common styling --- */
.order-status-box {
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
.order-status-box:hover {
  background-color: #f9fefb;
  border-color: #198754;
}




/* ===== Responsive Breakpoints ===== */

/* Small devices (≥576px) */
@media (min-width: 576px) {
  .success-icon {
    width: 64px;
    height: 64px;
  }
  
  .receipt-card {
    padding: 1.75rem;
  }
  
  .item-image,
  .item-image-placeholder {
    width: 52px;
    height: 52px;
  }
  
  .item-name {
    font-size: 0.95rem;
  }
  
  .item-pricing {
    font-size: 0.85rem;
  }
  
  .item-total {
    min-width: 70px;
  }
  
  .receipt-actions .btn {
    padding: 0.65rem 1.25rem;
    font-size: 0.95rem;
  }
}

/* Medium devices (≥768px) */
@media (min-width: 768px) {
  .receipt-page {
    padding-top: 2rem !important;
    padding-bottom: 2rem !important;
  }
  
  .success-icon {
    width: 70px;
    height: 70px;
  }
  
  .receipt-card {
    padding: 2.25rem;
  }
  
  .item-image,
  .item-image-placeholder {
    width: 56px;
    height: 56px;
  }
  
  .item-name {
    font-size: 1rem;
  }
  
  .item-pricing {
    font-size: 0.875rem;
  }
  
  .item-total {
    min-width: 80px;
  }
  
  .receipt-actions {
    gap: 0.75rem;
  }
  
  .receipt-actions .btn {
    padding: 0.7rem 1.5rem;
    font-size: 1rem;
  }
}

/* Large devices (≥992px) */
@media (min-width: 992px) {
  .receipt-page {
    padding-top: 2.5rem !important;
    padding-bottom: 2.5rem !important;
  }
  
  .receipt-card {
    padding: 2.5rem 3rem;
  }
  
  .item-image,
  .item-image-placeholder {
    width: 60px;
    height: 60px;
  }
  
  .receipt-actions {
    gap: 1rem;
  }
}

/* Extra large devices (≥1200px) */
@media (min-width: 1200px) {
  .receipt-card {
    padding: 3rem 3.5rem;
  }
}

/* ===== Existing Styles ===== */
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

.order-status-text {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.order-status-text.preparing {
  color: #ffffff;
  background-color: #1570ef;
  border: 1px solid #1570ef;
}

.order-status-text.collected {
  color: #198754;
  background-color: #d1e7dd;
  border: 1px solid #badbcc;
}

/* Ready Notification Popup */
.ready-notification {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
  padding: 1rem;
}

.notification-content {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  position: relative;
  animation: slideUp 0.3s ease;
}

.notification-icon {
  text-align: center;
  margin-bottom: 1rem;
}

.notification-icon i {
  font-size: 2.5rem;
  color: #198754;
}

.notification-text {
  text-align: center;
  margin-bottom: 1.5rem;
}

.notification-text h5 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.notification-text p {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

.notification-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  transition: color 0.2s;
}

.notification-close:hover {
  color: #333;
}

.notification-acknowledge {
  width: 100%;
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #198754;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-acknowledge:hover {
  background-color: #157347;
}

/* Notification responsive */
@media (min-width: 576px) {
  .notification-content {
    padding: 2rem;
  }
  
  .notification-icon i {
    font-size: 3rem;
  }
  
  .notification-text h5 {
    font-size: 1.5rem;
  }
  
  .notification-text p {
    font-size: 1rem;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>

<!--
  Requires Bootstrap 5 and Bootstrap Icons (for bi- classes).
  If you don't have Bootstrap Icons, replace <i class="bi ..."></i> with SVGs or remove icons.
-->