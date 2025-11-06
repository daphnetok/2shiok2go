<template>
  <section class="cta" data-scroll-section>
    <div class="cta-background-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>
    
    <div class="cta-container">
      <div class="cta-content" data-scroll-item>
        <div class="cta-badge">
          <i class="fa-solid fa-bolt"></i>
          <span>Limited Time Offer</span>
        </div>
        
        <h2 class="cta-title">
          Ready to Make a Difference?
          <span class="highlight-text">Start Saving Today!</span>
        </h2>
        
        <p class="cta-description">
          Browse through the latest deals near you and start supporting your favorite hawkers while cutting down on food waste. Join thousands of users already making an impact!
        </p>
        
        <div class="cta-features">
          <div class="feature-item">
            <i class="fa-solid fa-circle-check"></i>
            <span>Save up to 50%</span>
          </div>
          <div class="feature-item">
            <i class="fa-solid fa-circle-check"></i>
            <span>Fresh quality meals</span>
          </div>
          <div class="feature-item">
            <i class="fa-solid fa-circle-check"></i>
            <span>Support local hawkers</span>
          </div>
        </div>
        
        <div class="cta-buttons">
          <button @click="startSaving" class="cta-button primary">
            <span class="button-text">Join the Movement</span>
            <i class="fa-solid fa-arrow-right"></i>
          </button>
          <button @click="learnMore" class="cta-button secondary">
            <span class="button-text">Learn More</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CTASection',
  methods: {
    startSaving() {
      this.$router.push('/login');
    },
    learnMore() {
      // Scroll to about section or navigate to learn more page
      const aboutSection = document.querySelector('.about');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
};
</script>

<style>
@import './CTASection.css';
</style>