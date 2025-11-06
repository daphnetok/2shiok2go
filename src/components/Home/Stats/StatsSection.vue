<template>
  <section 
    class="stats-section" 
    :class="themeClass"
    data-scroll-section
  >
    <div 
      class="stats-container"
      :class="layoutClass"
    >
      <div 
        class="stat" 
        v-for="(stat, index) in stats" 
        :key="index" 
        :style="{ '--stat-index': index }" 
        data-scroll-item
      >
        <div 
          class="stat-icon-wrapper"
          :class="stat.iconColor || 'icon-primary'"
        >
          <span class="stat-emoji">{{ stat.icon || stat.emoji }}</span>
        </div>
        <h2 
          class="stat-value"
          :class="stat.valueColor || 'value-primary'"
          :data-target="stat.value" 
          :data-suffix="stat.suffix || ''"
        >
          {{ stat.value }}{{ stat.suffix || '' }}
        </h2>
        <p>{{ stat.label }}</p>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'StatsSection',
  props: {
    stats: {
      type: Array,
      required: true,
      // Example structure:
      // [{
      //   emoji: '🍽️', // or use 'icon' for FontAwesome compatibility
      //   value: '500',
      //   suffix: '+',
      //   label: 'Meals Saved',
      //   iconColor: 'icon-success', // optional: icon-primary, icon-success, icon-eco, icon-neutral
      //   valueColor: 'value-primary' // optional: value-primary, value-success, value-neutral
      // }]
    },
    theme: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'light', 'neutral', 'dark-green'].includes(value)
      // 'default' - Green gradient
      // 'light' - Light green/yellow
      // 'neutral' - Gray gradient
      // 'dark-green' - Dark green
    },
    layout: {
      type: String,
      default: 'auto',
      validator: (value) => ['auto', '2-col', '3-col', '4-col'].includes(value)
      // 'auto' - Responsive auto-fit
      // '2-col' - Fixed 2 columns
      // '3-col' - Fixed 3 columns
      // '4-col' - Fixed 4 columns
    }
  },
  computed: {
    themeClass() {
      return this.theme !== 'default' ? `theme-${this.theme}` : '';
    },
    layoutClass() {
      return this.layout !== 'auto' ? `layout-${this.layout}` : '';
    }
  },
  mounted() {
    this.setupScrollAnimations();
  },
  methods: {
    setupScrollAnimations() {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            
            if (entry.target.classList.contains('stat')) {
              this.animateStats();
            }
            
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      document.querySelectorAll('[data-scroll-item]').forEach(el => {
        observer.observe(el);
      });
    },
    animateStats() {
      const stats = document.querySelectorAll('.stat-value');
      stats.forEach(statEl => {
        if (statEl.dataset.animated === 'true') return;
        statEl.dataset.animated = 'true';
        
        const target = statEl.getAttribute('data-target');
        const suffix = statEl.getAttribute('data-suffix') || '';
        
        // Handle decimal numbers
        const numericValue = parseFloat(target);
        const isDecimal = target.includes('.');
        const decimalPlaces = isDecimal ? target.split('.')[1]?.length || 1 : 0;
        
        const duration = 2000;
        const steps = 60;
        const increment = numericValue / steps;
        let current = 0;
        
        const timer = setInterval(() => {
          current += increment;
          if (current >= numericValue) {
            current = numericValue;
            clearInterval(timer);
          }
          
          const displayValue = isDecimal 
            ? current.toFixed(decimalPlaces)
            : Math.floor(current);
          
          statEl.textContent = displayValue + suffix;
        }, duration / steps);
      });
    }
  }
};
</script>

<style>
@import './StatsSection.css';
</style>