
<template>
  <div class="hero">
    <div class="hero-video-container">
      <video 
        ref="heroVideo"
        class="hero-video"
        src="https://firebasestorage.googleapis.com/v0/b/test-25bd6.firebasestorage.app/o/webpageBackground%2FHeroBackground.mp4?alt=media&token=29610b60-aee6-43e1-ace4-b96db475822a"
        autoplay
        muted
        loop
        playsinline
        preload="auto"
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
    this.initVideo();
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
    },
    initVideo() {
      const video = this.$refs.heroVideo;
      if (video) {
        // Ensure video plays
        video.muted = true;
        video.play().catch(error => {
          console.log('Video autoplay failed:', error);
          // Try again after user interaction
          document.addEventListener('click', () => {
            video.play().catch(err => console.log('Video play error:', err));
          }, { once: true });
        });
        
        // Handle video loading errors
        video.addEventListener('error', (e) => {
          console.error('Video loading error:', e);
        });
        
        // Ensure video loops
        video.addEventListener('ended', () => {
          video.currentTime = 0;
          video.play();
        });
      }
    }
  }
};
</script>

<style scoped>
@import './HeroSection.css';
</style>

