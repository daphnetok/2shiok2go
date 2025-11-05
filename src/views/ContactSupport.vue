<template>
  <div class="contact-support-page">
    <!-- Success Acknowledgement -->
    <div v-if="submitted" class="acknowledgement-container">
      <div class="acknowledgement-card">
        <div class="success-icon">
          <i class="fas fa-check"></i>
        </div>
        <h2 class="mb-3">Thank You!</h2>
        <p class="text-muted mb-4">
          Your support request has been submitted successfully. We'll get back to you as soon as possible.
        </p>
        <div class="ticket-info">
          <p class="mb-2"><strong>Ticket ID:</strong> {{ ticketId }}</p>
          <p class="mb-4"><strong>Order ID:</strong> {{ formData.orderId || 'N/A' }}</p>
        </div>
        <div class="action-buttons">
          <router-link to="/buyer-recent-orders" class="btn btn-success">
            <i class="fas fa-arrow-left me-2"></i>Back to Orders
          </router-link>
          <button @click="resetForm" class="btn btn-outline-success">
            <i class="fas fa-plus me-2"></i>Submit Another Request
          </button>
        </div>
      </div>
    </div>

    <!-- Contact Form -->
    <div v-else class="form-container">
      <div class="form-card">
        <!-- Header -->
        <div class="form-header">
          <div class="header-content">
            <div class="header-icon">
              <i class="fas fa-headset"></i>
            </div>
            <div class="header-text">
              <h2 class="mb-1">Contact Support</h2>
              <p class="mb-0">We're here to help! Fill out the form below and we'll get back to you shortly.</p>
            </div>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="support-form">
          <!-- Error Message -->
          <div v-if="errorMessage" class="alert alert-danger" role="alert">
            <i class="fas fa-exclamation-circle"></i>
            <span>{{ errorMessage }}</span>
          </div>

          <div class="row g-4">
            <!-- Row 1: Order ID and Category -->
            <div class="col-lg-6 col-md-6 col-sm-12">
              <label for="orderId" class="form-label">
                <i class="bi bi-receipt"></i> Order ID
              </label>
              <input
                type="text"
                id="orderId"
                v-model="formData.orderId"
                class="form-control"
                placeholder="Optional"
                :disabled="orderIdFromRoute"
              />
              <small class="form-text text-muted" v-if="orderIdFromRoute">
                This order ID was auto-filled from your recent orders
              </small>
            </div>

            <div class="col-lg-6 col-md-6 col-sm-12">
              <label for="category" class="form-label">
                <i class="bi bi-tag"></i> Category <span class="text-danger">*</span>
              </label>
              <select
                id="category"
                v-model="formData.category"
                class="form-select"
                required
              >
                <option value="" disabled>Select category</option>
                <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                  {{ cat.label }}
                </option>
              </select>
            </div>

            <!-- Row 2: Affected Items and Subject -->
            <div class="col-lg-6 col-md-6 col-sm-12" v-if="orderItems.length > 0">
              <label class="form-label">
                <i class="bi bi-box-seam"></i> Affected Items
              </label>
              <div class="items-dropdown">
                <button
                  type="button"
                  class="form-control items-dropdown-toggle text-start d-flex align-items-center justify-content-between"
                  @click="toggleItemsDropdown"
                >
                  <span>{{ getSelectedItemsText() }}</span>
                  <i class="bi" :class="showItemsDropdown ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                </button>
                <div class="items-dropdown-menu" v-show="showItemsDropdown">
                  <div class="dropdown-item">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :checked="selectAllItems"
                        @change="toggleSelectAll"
                        id="selectAll"
                      />
                      <label class="form-check-label fw-bold text-success" for="selectAll">
                        Select All Items
                      </label>
                    </div>
                  </div>
                  <hr class="dropdown-divider my-2">
                  <div
                    v-for="(item, index) in orderItems"
                    :key="index"
                    class="dropdown-item"
                  >
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :checked="formData.affectedItems.includes(index)"
                        @change="toggleItem(index)"
                        :id="'item-' + index"
                      />
                      <label class="form-check-label" :for="'item-' + index">
                        {{ item.itemName || item.name }} 
                        <span class="badge bg-secondary ms-2">x{{ item.quantity || item.qty || 1 }}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div :class="orderItems.length > 0 ? 'col-lg-6 col-md-6 col-sm-12' : 'col-12'">
              <label for="subject" class="form-label">
                <i class="bi bi-chat-left-text"></i> Subject <span class="text-danger">*</span>
              </label>
              <input
                type="text"
                id="subject"
                v-model="formData.subject"
                class="form-control"
                placeholder="Brief description of your issue"
                required
              />
            </div>

            <!-- Row 3: Name and Email -->
            <div class="col-lg-6 col-md-6 col-sm-12">
              <label for="name" class="form-label">
                <i class="bi bi-person"></i> Name <span class="text-danger">*</span>
              </label>
              <input
                type="text"
                id="name"
                v-model="formData.name"
                class="form-control"
                placeholder="Your full name"
                required
              />
            </div>

            <div class="col-lg-6 col-md-6 col-sm-12">
              <label for="email" class="form-label">
                <i class="bi bi-envelope"></i> Email <span class="text-danger">*</span>
              </label>
              <input
                type="email"
                id="email"
                v-model="formData.email"
                class="form-control"
                placeholder="your@email.com"
                required
              />
            </div>

            <!-- Row 4: Message (Full Width) -->
            <div class="col-12">
              <label for="message" class="form-label">
                Message <span class="text-danger">*</span>
              </label>
              <textarea 
                id="message" 
                v-model="formData.message"
                class="form-control"
                placeholder="Describe your issue or inquiry in detail..."
                required
                maxlength="1000"
                rows="4"
              ></textarea>
              <div class="form-text text-end">
                {{ formData.message.length }}/1000 characters
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="form-actions mt-4 d-flex justify-content-end gap-3">
            <router-link to="/buyer-recent-orders" class="btn btn-outline-secondary">
              <i class="fas fa-times me-2"></i>Cancel
            </router-link>
            <button type="submit" class="btn btn-success" :disabled="submitting">
              <span v-if="submitting">
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Submitting...
              </span>
              <span v-else>
                <i class="fas fa-paper-plane me-2"></i>Submit Request
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { db } from '/firebase/config'
import { collection, addDoc, doc, getDoc, Timestamp } from 'firebase/firestore'

export default {
  name: 'ContactSupport',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const auth = getAuth()

    const formData = ref({
      orderId: '',
      category: '',
      subject: '',
      affectedItems: [],
      name: '',
      email: '',
      message: ''
    })

    const submitted = ref(false)
    const submitting = ref(false)
    const errorMessage = ref('')
    const ticketId = ref('')
    const orderIdFromRoute = ref(false)
    const orderItems = ref([])
    const showItemsDropdown = ref(false)
    const selectAllItems = ref(false)

    const categories = [
      { value: 'missing-item', label: 'Missing Item' },
      { value: 'wrong-order', label: 'Wrong Order' },
      { value: 'damaged-item', label: 'Damaged Item' },
      { value: 'late-preparation', label: 'Late Preparation' },
      { value: 'refund-request', label: 'Refund Request' },
      { value: 'quality-issue', label: 'Quality Issue' },
      { value: 'other', label: 'Other' }
    ]
    const currentUserId = ref(null)

    // Initialize form with route params and user data
    onMounted(async () => {
      // Check for orderId from route
      if (route.query.orderId) {
        formData.value.orderId = route.query.orderId
        orderIdFromRoute.value = true
      }

      // Get user info
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          currentUserId.value = user.uid
          formData.value.email = user.email || ''
          formData.value.name = user.displayName || ''
          
          // Fetch order items if orderId is provided
          if (route.query.orderId) {
            await fetchOrderItems(route.query.orderId, user.uid)
          }
        } else {
          // Redirect to login if not authenticated
          router.push('/login')
        }
      })
    })

    const fetchOrderItems = async (orderId, userId) => {
      try {
        const orderRef = doc(db, 'orders', orderId)
        const orderSnap = await getDoc(orderRef)
        
        if (orderSnap.exists()) {
          const orderData = orderSnap.data()
          // Verify this order belongs to the user
          if (orderData.buyerId === userId) {
            orderItems.value = orderData.items || []
          }
        }
      } catch (error) {
        console.error('Error fetching order items:', error)
      }
    }

    const toggleItemsDropdown = () => {
      showItemsDropdown.value = !showItemsDropdown.value
    }

    const toggleSelectAll = () => {
      selectAllItems.value = !selectAllItems.value
      if (selectAllItems.value) {
        formData.value.affectedItems = orderItems.value.map((_, index) => index)
      } else {
        formData.value.affectedItems = []
      }
    }

    const toggleItem = (index) => {
      const itemIndex = formData.value.affectedItems.indexOf(index)
      if (itemIndex > -1) {
        formData.value.affectedItems.splice(itemIndex, 1)
      } else {
        formData.value.affectedItems.push(index)
      }
      
      // Update selectAll state
      selectAllItems.value = formData.value.affectedItems.length === orderItems.value.length
    }

    const getSelectedItemsText = () => {
      if (formData.value.affectedItems.length === 0) {
        return 'Select affected items'
      } else if (formData.value.affectedItems.length === orderItems.value.length) {
        return 'All items selected'
      } else {
        return `${formData.value.affectedItems.length} item${formData.value.affectedItems.length > 1 ? 's' : ''} selected`
      }
    }

    const handleSubmit = async () => {
      // Validate
      if (!formData.value.category || !formData.value.subject || !formData.value.name || !formData.value.email || !formData.value.message) {
        errorMessage.value = 'Please fill in all required fields'
        return
      }

      if (formData.value.message.length > 1000) {
        errorMessage.value = 'Message must be less than 1000 characters'
        return
      }

      if (!currentUserId.value) {
        errorMessage.value = 'You must be logged in to submit a support request'
        return
      }

      try {
        submitting.value = true
        errorMessage.value = ''

        // Get affected items details
        const affectedItemsDetails = formData.value.affectedItems.map(index => {
          const item = orderItems.value[index]
          return {
            name: item.itemName || item.name,
            quantity: item.quantity || item.qty || 1,
            price: item.price || item.itemPrice || 0
          }
        })
        
        const ticketData = {
          orderId: formData.value.orderId || null,
          category: formData.value.category,
          subject: formData.value.subject,
          affectedItems: affectedItemsDetails,
          name: formData.value.name,
          email: formData.value.email,
          message: formData.value.message,
          status: 'open',
          createdAt: Timestamp.now(),
          userId: currentUserId.value
        }

        // Create support ticket in main 'supportRequests' collection
        const supportRequestsRef = collection(db, 'supportRequests')
        const docRef = await addDoc(supportRequestsRef, ticketData)
        
        // Also store in user's subcollection for easy access
        const userSupportTicketsRef = collection(db, 'users', currentUserId.value, 'supportTickets')
        await addDoc(userSupportTicketsRef, {
          ...ticketData,
          supportRequestId: docRef.id
        })
        
        ticketId.value = docRef.id.substring(0, 8).toUpperCase()
        submitted.value = true

        console.log('Support ticket created:', docRef.id)

      } catch (error) {
        console.error('Error submitting support request:', error)
        errorMessage.value = 'Failed to submit request. Please try again.'
      } finally {
        submitting.value = false
      }
    }

    const resetForm = () => {
      formData.value = {
        orderId: '',
        category: '',
        subject: '',
        affectedItems: [],
        name: formData.value.name, // Keep name
        email: formData.value.email, // Keep email
        message: ''
      }
      submitted.value = false
      errorMessage.value = ''
      ticketId.value = ''
      orderIdFromRoute.value = false
      orderItems.value = []
      selectAllItems.value = false
    }

    return {
      formData,
      submitted,
      submitting,
      errorMessage,
      ticketId,
      orderIdFromRoute,
      orderItems,
      showItemsDropdown,
      selectAllItems,
      categories,
      handleSubmit,
      resetForm,
      toggleItemsDropdown,
      toggleSelectAll,
      toggleItem,
      getSelectedItemsText
    }
  }
}
</script>

<style scoped>
.contact-support-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
}

.form-container,
.acknowledgement-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.form-card,
.acknowledgement-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(5, 150, 105, 0.15);
  overflow: hidden;
  border: 1px solid rgba(5, 150, 105, 0.1);
}

/* Form Header */
.form-header {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  padding: 3rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 2rem;
  text-align: left;
}

.header-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header-icon i {
  font-size: 3rem;
  color: white;
}

.header-text {
  text-align: left;
  flex: 1;
}

.header-text h2 {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: white;
}

.header-text p {
  color: rgba(255, 255, 255, 0.95);
  font-size: 1rem;
  margin: 0;
  line-height: 1.6;
}

/* Form */
.support-form {
  padding: 3rem;
}

.form-label {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  font-size: 0.95rem;
}

.form-label i {
  color: #059669;
  margin-right: 0.5rem;
  font-size: 1rem;
}

.form-control,
.form-select {
  padding: 0.875rem 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #f9fafb;
  line-height: 1.6;
}

.form-control:focus,
.form-select:focus {
  border-color: #059669;
  box-shadow: 0 0 0 0.25rem rgba(5, 150, 105, 0.1);
  background-color: white;
  outline: none;
}

.form-control::placeholder {
  color: #9ca3af;
}

textarea.form-control {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.form-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

/* Row spacing */
.row.g-4 {
  row-gap: 1.75rem !important;
}

/* Remove old grid styles */
.form-grid,
.form-column,
.form-group,
.message-group {
  display: block;
}

.message-textarea {
  min-height: auto;
}

/* Items Dropdown with Checkboxes */
.items-dropdown {
  position: relative;
}

.items-dropdown-toggle {
  cursor: pointer;
  background-color: white !important;
  padding: 0.75rem 1rem !important;
  height: calc(1.5em + 1.5rem + 4px) !important;
  line-height: 1.5 !important;
  text-align: left;
  border: 2px solid #e5e7eb !important;
  border-radius: 10px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  width: 100%;
  font-size: 0.95rem !important;
}

.items-dropdown-toggle:hover {
  background-color: white !important;
  border-color: #e5e7eb !important;
}

.items-dropdown-toggle:focus {
  background-color: white !important;
  border-color: #059669 !important;
  box-shadow: 0 0 0 0.2rem rgba(5, 150, 105, 0.15) !important;
  outline: none !important;
}

.items-dropdown-toggle span {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #495057;
}

.items-dropdown-toggle i {
  color: #059669;
  font-size: 1rem;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.items-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 250px;
  overflow-y: auto;
  z-index: 1000;
  padding: 0.5rem 0;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f0fdf4;
}

.dropdown-divider {
  margin: 0.5rem 0;
  border-top: 1px solid #e5e7eb;
}

.form-check {
  margin: 0;
}

.form-check-input {
  cursor: pointer;
  border: 2px solid #d1d5db;
}

.form-check-input:checked {
  background-color: #059669;
  border-color: #059669;
}

.form-check-input:focus {
  border-color: #059669;
  box-shadow: 0 0 0 0.2rem rgba(5, 150, 105, 0.15);
}

.form-check-label {
  cursor: pointer;
  font-size: 0.9rem;
  color: #374151;
}

/* Form Actions */
.form-actions {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.btn {
  padding: 0.75rem 1.75rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.btn-success {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  border: none;
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(5, 150, 105, 0.3);
  background: linear-gradient(135deg, #047857 0%, #059669 100%);
}

.btn-success:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-outline-secondary {
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-outline-secondary:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
}

/* Alert */
.alert {
  padding: 1rem 1.25rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
}

.alert-danger {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

body.dark-mode .alert-danger,
:root.dark-mode .alert-danger {
  background: #7f1d1d;
  color: #fecaca;
  border-color: #991b1b;
}

.alert i {
  font-size: 1.1rem;
}

/* Acknowledgement Page */
.acknowledgement-card {
  padding: 4rem 3rem;
  text-align: center;
}

.success-icon {
  width: 180px;
  height: 180px;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2.5rem;
  animation: scaleIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 15px 40px rgba(5, 150, 105, 0.35);
  position: relative;
}

.success-icon::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  animation: pulse 2s ease-in-out infinite;
  z-index: -1;
}

.success-icon i {
  font-size: 7rem;
  color: white;
  animation: checkmark 0.8s ease 0.3s both;
  transform-origin: center;
  font-weight: 900;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@keyframes scaleIn {
  0% {
    transform: scale(0) rotate(-45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes checkmark {
  0% {
    transform: scale(0) rotate(-45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(10deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.15);
    opacity: 0;
  }
}

.acknowledgement-card h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #059669;
  transition: color 0.3s ease;
}

body.dark-mode .acknowledgement-card h2,
:root.dark-mode .acknowledgement-card h2 {
  color: #10b981;
}

.acknowledgement-card p {
  color: #6b7280;
  transition: color 0.3s ease;
}

body.dark-mode .acknowledgement-card p,
:root.dark-mode .acknowledgement-card p {
  color: #94a3b8;
}

.ticket-info {
  background: #f0fdf4;
  border: 2px solid #bbf7d0;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 0 auto 2rem;
  max-width: 400px;
  transition: all 0.3s ease;
}

body.dark-mode .ticket-info,
:root.dark-mode .ticket-info {
  background: #064e3b;
  border-color: #10b981;
}

.ticket-info p {
  margin: 0.5rem 0;
  color: #374151;
}

body.dark-mode .ticket-info p,
:root.dark-mode .ticket-info p {
  color: #e2e8f0;
}

.ticket-info strong {
  color: #059669;
}

body.dark-mode .ticket-info strong,
:root.dark-mode .ticket-info strong {
  color: #10b981;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Responsive */
@media (max-width: 576px) {
  /* Small devices (phones) */
  .contact-support-page {
    padding: 1rem;
  }
  
  .form-header {
    padding: 1.5rem 1rem;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .header-text {
    text-align: center;
  }
  
  .header-text h2 {
    font-size: 1.5rem;
  }
  
  .header-text p {
    font-size: 0.875rem;
  }
  
  .header-icon {
    width: 60px;
    height: 60px;
  }
  
  .header-icon i {
    font-size: 1.75rem;
  }

  .support-form {
    padding: 1.25rem;
  }
  
  .row.g-4 {
    row-gap: 1.25rem !important;
  }

  .form-label {
    font-size: 0.9rem;
  }
  
  .form-control,
  .form-select {
    font-size: 0.9rem;
    padding: 0.65rem 0.875rem;
  }
}

@media (min-width: 577px) and (max-width: 768px) {
  /* Medium devices (tablets) */
  .contact-support-page {
    padding: 1.5rem;
  }
  
  .form-header {
    padding: 2rem 1.5rem;
  }
  
  .support-form {
    padding: 2rem 1.5rem;
  }
  
  .header-text h2 {
    font-size: 1.75rem;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .header-text {
    text-align: center;
  }
  
  .form-header {
    padding: 2rem 1.5rem;
  }
  
  .success-icon {
    width: 140px;
    height: 140px;
  }
  
  .success-icon i {
    font-size: 5.5rem;
  }
  
  .acknowledgement-card {
    padding: 3rem 2rem;
  }
  
  .contact-support-page {
    padding: 2rem 1rem;
  }
}

@media (min-width: 769px) and (max-width: 992px) {
  /* Medium devices (tablets) */
  .support-form {
    padding: 2.5rem 2.5rem;
  }
  
  .form-container,
  .acknowledgement-container {
    max-width: 900px;
  }
  
  .form-header {
    padding: 2.5rem 2.5rem;
  }
  
  .header-icon {
    width: 70px;
    height: 70px;
  }
  
  .header-icon i {
    font-size: 2.5rem;
  }
  
  .header-text h2 {
    font-size: 2rem;
  }
  
  .success-icon {
    width: 160px;
    height: 160px;
  }
  
  .success-icon i {
    font-size: 6rem;
  }
}

@media (min-width: 993px) {
  /* Large devices (desktops) */
  .form-container,
  .acknowledgement-container {
    max-width: 1200px;
  }
  
  .support-form {
    padding: 3rem;
  }
  
  .form-header {
    padding: 3rem;
  }
  
  .success-icon {
    width: 180px;
    height: 180px;
  }
  
  .success-icon i {
    font-size: 7rem;
  }
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    gap: 1rem;
  }

  .action-buttons .btn {
    width: 100%;
  }
  
  .form-actions {
    flex-direction: column-reverse;
    gap: 1rem;
  }
  
  .form-actions .btn {
    width: 100%;
    justify-content: center;
  }
  
  .ticket-info {
    padding: 1.25rem;
  }
}
</style>
