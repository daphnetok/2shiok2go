<template>
  <div class="container mt-4">
    <div class="row">
      <!-- Payment & Collection (Left) -->
      <div class="col-lg-6 mb-4">
        <div class="card p-4 shadow-sm payment-form">
          <h4 class="mb-3">Payment Details</h4>
          <form @submit.prevent="placeOrder">
            <div class="mb-3">
              <label for="name" class="form-label">Name on Card</label>
              <input type="text" class="form-control" id="name" v-model="payment.name" required>
            </div>
            <div class="mb-3">
              <label for="card" class="form-label">Card Number</label>
              <input type="text" class="form-control" id="card" v-model="payment.card" maxlength="19" placeholder="1234 5678 9012 3456" required>
            </div>
            <div class="row">
              <div class="col-6 mb-3">
                <label for="expiry" class="form-label">Expiry</label>
                <input type="text" class="form-control" id="expiry" v-model="payment.expiry" maxlength="5" placeholder="MM/YY" required>
              </div>
              <div class="col-6 mb-3">
                <label for="cvc" class="form-label">CVC</label>
                <input type="text" class="form-control" id="cvc" v-model="payment.cvc" maxlength="4" required>
              </div>
            </div>
            <div class="mb-3">
              <label for="collectionTime" class="form-label">Collection Time</label>
              <select class="form-select" id="collectionTime" v-model="collectionTime" required>
                <option value="" disabled>Select a time</option>
                <option v-for="time in collectionTimeOptions" :key="time" :value="time">
                  {{ time }}
                </option>
              </select>
            </div>
            <button class="btn btn-success w-100 mt-2" type="submit">Place Order</button>
          </form>
        </div>
        <div class="mt-3 text-end">
          <router-link to="/buyer-view-stall">
            <button class="btn btn-success">Back to Stall</button>
          </router-link>
        </div>
      </div>
      <!-- Order Summary (Right, Sticky) -->
      <div class="col-lg-6">
        <div class="sticky-order">
          <div class="order-summary card shadow-sm p-3">
            <h4 class="mb-3 text-center">Order Summary</h4>
            <div class="mb-3">
              <div class="card mb-2 shadow-sm position-relative">
                <button
                  class="btn btn-success btn-sm position-absolute top-0 end-0 m-2"
                  @click="removeItem(0)"
                  title="Remove item"
                >
                  <i class="fas fa-trash"></i>
                </button>
                <div class="row g-0 align-items-center">
                  <div class="col-4">
                    <img
                      :src="selectedItem.imageUrl"
                      class="img-fluid rounded-start"
                      :alt="selectedItem.itemName"
                    />
                  </div>
                  <div class="col-8">
                    <div class="card-body py-2 px-3">
                      <h6 class="card-title mb-1">{{ selectedItem.itemName }}</h6>
                      <div class="d-flex align-items-center mb-2">
                        <strong class="me-2">Qty:</strong>
                        <button
                          class="btn btn-success btn-sm me-2"
                          @click="decreaseQty"
                          :disabled="selectedItem.quantity <= 1"
                        >
                          <i class="fas fa-minus"></i>
                        </button>
                        <span class="mx-1">{{ selectedItem.quantity }}</span>
                        <button
                          class="btn btn-success btn-sm ms-2"
                          @click="increaseQty"
                        >
                          <i class="fas fa-plus"></i>
                        </button>
                      </div>
                      <p class="card-text mb-1">
                        <strong>Price:</strong>
                        <span class="text-decoration-line-through text-muted">${{ selectedItem.originalPrice.toFixed(2) }}</span>
                        <span class="ms-2 text-success fw-bold">${{ selectedItem.discountedPrice.toFixed(2) }}</span>
                      </p>
                      <p class="card-text mb-0"><strong>Stall:</strong> {{ selectedItem.hawkerName }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="selectedItem.quantity === 0" class="text-center text-muted">
              <p>No items in your order.</p>
            </div>
            <div v-if="selectedItem.quantity > 0" class="text-end mt-3">
              <h5>
                Total: ${{ (selectedItem.discountedPrice * selectedItem.quantity).toFixed(2) }}
              </h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const selectedItem = reactive({
  id: 1,
  hawkerName: "Maxwell Hainanese Chicken Rice",
  itemName: "Chicken Rice",
  quantity: 1,
  originalPrice: 3.00,
  discountedPrice: 2.40,
  imageUrl: "https://firebasestorage.googleapis.com/v0/b/test-25bd6.firebasestorage.app/o/hawkerListings%2Froasted_chicken_rice.jpg?alt=media&token=56df9d96-dc9f-43d7-8151-0d31fd30ee30"
})

const payment = reactive({
  name: '',
  card: '',
  expiry: '',
  cvc: ''
})

const collectionTime = ref('')

// Generate 15-min blocks from 7:00pm to 10:00pm
const collectionTimeOptions = []
for (let h = 19; h <= 21; h++) {
  for (let m = 0; m < 60; m += 15) {
    const hour = h > 12 ? h - 12 : h
    const ampm = h >= 12 ? 'pm' : 'am'
    const min = m.toString().padStart(2, '0')
    collectionTimeOptions.push(`${hour}:${min} ${ampm}`)
  }
}
collectionTimeOptions.push('10:00 pm')

function increaseQty() {
  selectedItem.quantity++
}
function decreaseQty() {
  if (selectedItem.quantity > 1) {
    selectedItem.quantity--
  }
}
function removeItem() {
  selectedItem.quantity = 0
}
function placeOrder() {
  alert(`Order placed for collection at ${collectionTime.value || 'N/A'}! (Demo only)`)
  // Here you would handle order submission to Firestore or your backend
}
</script>

<style scoped>
.payment-form {
  background: #f8f9fa;
  border-radius: 12px;
}
.payment-form input {
  font-size: 1rem;
}
.sticky-order {
  position: sticky;
  top: 32px;
}
.order-summary {
  border-radius: 12px;
  background: #fff;
}
.card img {
  object-fit: cover;
  height: 80px;
  width: 100%;
}
.btn {
  min-width: 40px;
}
.btn-success {
  background-color: #198754 !important;
  border-color: #198754 !important;
  color: #fff !important;
}
.btn-success:active, .btn-success:focus, .btn-success:hover {
  background-color: #157347 !important;
  border-color: #157347 !important;
  color: #fff !important;
}
.position-absolute {
  z-index: 2;
}
.text-decoration-line-through {
  text-decoration: line-through;
}
@media (max-width: 991px) {
  .sticky-order {
    position: static;
    top: auto;
  }
}
</style>