<template>
  <div class="login-container">
    <!-- YouTube Video Background -->
    <div class="video-background">
      <iframe
        :src="videoUrl"
        frameborder="0"
        allow="autoplay; encrypted-media; accelerometer; gyroscope; picture-in-picture"
        allowfullscreen
        class="video-iframe"
      ></iframe>
      <div class="video-overlay"></div>
    </div>
    
    <!-- Content Container -->
    <div class="content-wrapper">
    <div class="login-content">
      <div class="login-grid">
        <section class="login-hero">
          <h1>Welcome to 2Shiok2Go</h1>
          <p class="subtitle">Save meals and money — sign in to get started.</p>
          <ul class="login-highlights">
            <li><span class="emoji">🌿</span> Reduce food waste</li>
            <li><span class="emoji">🍜</span> Support hawkers</li>
            <li><span class="emoji">🏦</span> Great deals daily</li>
          </ul>
        </section>
        <section class="login-form">
          <AuthComponent />
        </section>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import AuthComponent from '@/components/shared/AuthComponent/AuthComponent.vue';

export default { 
  name: "Login",
  components: {
    AuthComponent
  },
  computed: {
    videoUrl() {
      const videoId = 'zhDwjnYZiCo';
      // Using youtube-nocookie.com for better embed compatibility
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&mute=1&controls=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1&start=0`;
    }
  },
  mounted() {
    // Log for debugging
    console.log('Video URL:', this.videoUrl);
    // Some browsers require user interaction for autoplay
    // Try to play video after a short delay
    setTimeout(() => {
      const iframe = this.$el?.querySelector('.video-iframe');
      if (iframe) {
        console.log('Video iframe found');
      }
    }, 1000);
  }
};
</script>

<style>
@import '../assets/css/Login.css';
</style>
