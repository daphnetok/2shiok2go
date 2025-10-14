<template>
  <div class="container py-5 d-flex flex-column align-items-center min-vh-100 bg-light">
    <!-- Confirmation Header -->
    <div class="text-center mb-4">
      <div class="mx-auto mb-3 d-flex align-items-center justify-content-center bg-success bg-opacity-25 rounded-circle shadow" style="width: 64px; height: 64px;">
        <i class="bi bi-check2 text-success" style="font-size: 2.5rem;"></i>
      </div>
      <h1 class="h4 fw-bold text-success">Order Confirmed!</h1>
      <p class="text-muted small">Thank you for your order.<br>We'll send you a confirmation email shortly.</p>
    </div>

    <!-- Receipt Card -->
    <div class="card shadow rounded-4 p-4 w-100" style="max-width: 600px; border-top: 5px solid #198754;">
      <!-- Header -->
      <div class="text-center mb-3">
        <h2 class="h5 fw-bold mb-1 text-success">Order Receipt</h2>
        <p class="text-muted mb-0 small">Order #123456</p>
        <p class="text-secondary small mb-0">Tuesday, October 14, 2025 at 07:00 PM</p>
      </div>
      <hr />

      <!-- Collection Details -->
      <div class="mb-4">
        <h6 class="fw-semibold mb-2 text-success">Collection Details</h6>
        <div class="bg-light rounded-3 p-3 small border border-success border-opacity-25">
          <p class="mb-1 fw-medium text-success">Maxwell Hainanese Chicken Rice</p>
          <p class="mb-1">1 Kadayanallur St, #01-10/11 Maxwell Food Centre, Singapore 069184</p>
          <p class="text-muted mb-0">Collection time: <span class="fw-semibold text-success">7:00 pm</span></p>
        </div>
      </div>

      <!-- Order Items -->
      <div class="mb-4">
        <h6 class="fw-semibold mb-3 text-success">Order Items</h6>
        <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
          <div class="d-flex align-items-center gap-3">
            <img src="https://firebasestorage.googleapis.com/v0/b/test-25bd6.firebasestorage.app/o/hawkerListings%2Froasted_chicken_rice.jpg?alt=media&token=56df9d96-dc9f-43d7-8151-0d31fd30ee30"
              alt="Chicken Rice" class="rounded-3 border border-success border-opacity-25" style="width:56px; height:56px; object-fit:cover;">
            <div>
              <div class="fw-bold text-success">Chicken Rice</div>
              <div class="text-muted small">
                Original: <span class="text-decoration-line-through">$3.00</span>
                <span class="text-success fw-bold ms-1">Now: $2.40</span>
              </div>
            </div>
          </div>
          <div class="text-end small">
            <div class="text-muted">x1</div>
            <div class="fw-bold text-success">$2.40</div>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="mb-4 small">
        <div class="d-flex justify-content-between"><span>Subtotal</span><span>$2.40</span></div>
        <div class="d-flex justify-content-between"><span>Discount</span><span class="text-success">-$0.60</span></div>
        <div class="d-flex justify-content-between"><span>Tax (0%)</span><span>$0.00</span></div>
        <hr class="my-2" />
        <div class="d-flex justify-content-between fw-bold fs-5 text-success">
          <span>Total Paid</span><span>$2.40</span>
        </div>
      </div>

      <!-- Payment -->
      <div class="mb-4">
        <h6 class="fw-semibold mb-1 text-success">Payment Method</h6>
        <p class="small text-muted mb-0">Credit Card ending in 3456</p>
      </div>

      <hr />

      <!-- Buttons -->
      <div class="d-flex justify-content-end gap-2">
        <button class="btn btn-outline-success d-flex align-items-center">
          <i class="bi bi-download me-2"></i>
          Download Receipt
        </button>
        <router-link to="/">
          <button class="btn btn-success d-flex align-items-center">
            <i class="bi bi-house-door me-2"></i>
            Back to Home
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// No logic needed for hardcoded receipt
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