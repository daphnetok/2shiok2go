<template>
  <div class="container py-5 d-flex flex-column align-items-center min-vh-100 bg-light">
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
          <p class="mb-1 fw-medium text-success">Location Map</p>
          <div class="rounded-3 overflow-hidden border border-success border-opacity-25">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.822200923736!2d103.84219207543734!3d1.280341461794361!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da190d4d2ce4b1%3A0xce7f195d585390aa!2sMaxwell%20Food%20Centre!5e0!3m2!1sen!2ssg!4v1761379585008!5m2!1sen!2ssg" 
              width="100%" 
              height="200" 
              style="border:10px;" 
              allowfullscreen="" 
              loading="lazy" 
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
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