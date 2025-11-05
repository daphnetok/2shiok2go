<template>
  <div class="hero">
    <div class="hero-video-container">
      <video 
        class="hero-video"
        src="/videos/cooking.mp4"
        autoplay
        muted
        loop
        playsinline
      ></video>
      <div class="hero-overlay"></div>
    </div>
    <div class="hero-content">
      <div class="action" data-hero-item="badge">
        <i class="fa-solid fa-leaf"></i> Join the Green Movement
      </div>
      <h1 class="headline" data-hero-item="heading1">Save More, Waste Less.</h1>
      <h1 class="headline2" data-hero-item="heading2">Discover Discounted Hawker Meals Near You!</h1>
      <p class="subheading" data-hero-item="subheading">Join the Movement to Reduce Food Waste While Enjoying Affordable Local Food</p>
      
      <div class="buttons" data-hero-item="buttons">
        <router-link class="router" to="/login">
          <button class="btn-primary">Start Saving Today <span class="arrow">➜</span></button>
        </router-link>
        <router-link class="router" to="/buyer-listings">
          <button class="btn-secondary">Browse Deals</button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HeroSection',
  mounted() {
    this.animateHeroSection();
  },
  methods: {
    animateHeroSection() {
      const items = document.querySelectorAll('[data-hero-item]');
      items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        setTimeout(() => {
          item.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, index * 200);
      });
    }
  }
};
</script>

<style scoped>
@import './HeroSection.css';
</style>

