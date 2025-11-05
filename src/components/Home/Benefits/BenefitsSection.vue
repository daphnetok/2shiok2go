<template>
  <section class="benefits" ref="benefitsSection" data-scroll-section>
    <!-- Floating Background Elements -->
    <div class="floating-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>

    <!-- Header with Badge -->
    <div class="header-wrapper">
      <div class="badge">
        <span class="sparkle-icon">✨</span>
        <span>Trusted by Thousands</span>
      </div>
      <h2>Why Choose <span>2Shiok2Go</span>?</h2>
      <p class="subtitle">Join the movement to save money while saving the planet</p>
    </div>

    <!-- Benefits Grid -->
    <div class="benefits-grid">
      <div class="benefit" 
           v-for="(benefit, index) in benefits" 
           :key="index" 
           :data-scroll-item="index" 
           :style="{ '--index': index }">
        <div class="benefit-icon" :style="{ background: benefit.gradient }">
          <span v-html="benefit.icon"></span>
        </div>
        <h3>{{ benefit.title }}</h3>
        <p>{{ benefit.text }}</p>
        <div class="benefit-glow"></div>
      </div>
    </div>

    <!-- Trust Indicators -->
    <div class="trust-section">
      <div class="trust-item">
        <span class="trust-icon">🛡️</span>
        <span>Verified Partners</span>
      </div>
      <div class="trust-item">
        <span class="trust-icon">⏱️</span>
        <span>Real-time Updates</span>
      </div>
      <div class="trust-item">
        <span class="trust-icon">🏆</span>
        <span>Award Winning</span>
      </div>
      <div class="trust-item">
        <span class="trust-icon">💚</span>
        <span>Eco-Certified</span>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'BenefitsSection',
  data() {
    return {
      isVisible: false,
      benefits: [
        {
          icon: '🌱',
          title: "Eco-Friendly Choices",
          text: "Reduce food waste and carbon footprint with every meal you save from disposal",
          gradient: 'linear-gradient(135deg, #52b788, #40916c)'
        },
        {
          icon: '🏆',
          title: "Premium Quality",
          text: "Partner restaurants maintain high standards - food is fresh, just nearing end of service",
          gradient: 'linear-gradient(135deg, #40916c, #2d6a4f)'
        },
        {
          icon: '💰',
          title: "Amazing Savings",
          text: "Save up to 70% on meals from your favorite restaurants and food spots",
          gradient: 'linear-gradient(135deg, #2d6a4f, #1b4332)'
        },
        {
          icon: '🤝',
          title: "Support Local",
          text: "Help local businesses reduce waste while building a sustainable community",
          gradient: 'linear-gradient(135deg, #1b4332, #081c15)'
        },
        {
          icon: '💚',
          title: "Feel Good Impact",
          text: "Every purchase contributes to reducing environmental waste and supporting sustainability",
          gradient: 'linear-gradient(135deg, #52b788, #74c69d)'
        },
        {
          icon: '🛡️',
          title: "Quality Guaranteed",
          text: "All partner restaurants are vetted and food safety standards are strictly maintained",
          gradient: 'linear-gradient(135deg, #40916c, #52b788)'
        }
      ]
    };
  },
  mounted() {
    this.observeSection();
  },
  methods: {
    observeSection() {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !this.isVisible) {
              this.isVisible = true;
              this.animateScrollItems();
            }
          });
        },
        { threshold: 0.2 }
      );

      if (this.$refs.benefitsSection) {
        observer.observe(this.$refs.benefitsSection);
      }
    },
    animateScrollItems() {
      const items = this.$el.querySelectorAll('[data-scroll-item]');
      items.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('animate-in');
        }, index * 100);
      });
    }
  }
};
</script>

<style scoped>
@import './BenefitsSection.css';
</style>
