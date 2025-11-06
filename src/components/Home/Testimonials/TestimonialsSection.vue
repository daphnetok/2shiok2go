<template>
  <section class="testimonials" data-scroll-section>
    <div class="testimonials-header">
      <h2 data-scroll-item>What Our <span class="user">Users</span> Are Saying</h2>
      <div class="trust-badges" data-scroll-item>
        <div class="trust-badge">
          <i class="fa-solid fa-shield-check"></i>
          <span>Verified Reviews</span>
        </div>
        <div class="trust-badge">
          <i class="fa-solid fa-users"></i>
          <span>Community Trusted</span>
        </div>
      </div>
    </div>
    <div class="testimonial-container">
      <div class="testimonial-track">
        <div class="testimonial" v-for="(testimonial, index) in testimonials" :key="'first-' + index">
          <div class="testimonial-header">
            <div class="stars">
              <i v-for="star in 5" :key="star" class="fa-solid fa-star"></i>
            </div>
            <div class="verified-badge">
              <i class="fa-solid fa-check-circle"></i>
              <span>Verified</span>
            </div>
          </div>
          <p class="review">{{ testimonial.review }}</p>
          <div class="testimonial-footer">
            <div class="user-avatar">
              <i class="fa-solid fa-user"></i>
            </div>
            <p class="name">{{ testimonial.user }}</p>
          </div>
        </div>
        <!-- Duplicate testimonials for seamless loop -->
        <div class="testimonial" v-for="(testimonial, index) in testimonials" :key="'second-' + index">
          <div class="testimonial-header">
            <div class="stars">
              <i v-for="star in 5" :key="star" class="fa-solid fa-star"></i>
            </div>
            <div class="verified-badge">
              <i class="fa-solid fa-check-circle"></i>
              <span>Verified</span>
            </div>
          </div>
          <p class="review">{{ testimonial.review }}</p>
          <div class="testimonial-footer">
            <div class="user-avatar">
              <i class="fa-solid fa-user"></i>
            </div>
            <p class="name">{{ testimonial.user }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'TestimonialsSection',
  props: {
    testimonials: {
      type: Array,
      required: true
    }
  }
};
</script>

<style scoped>
@import './TestimonialsSection.css';
</style>

