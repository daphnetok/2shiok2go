<template>
  <div class="homepage">
    <HeroSection />
    <StatsSection :stats="stats" />
    <BenefitsSection :benefits="benefits" />
    <AboutSection />
    <TestimonialsSection :testimonials="testimonials" />
    <CTASection />
    <FooterSection />
  </div>
</template>

<script>
import HeroSection from '@/components/Home/Hero/HeroSection.vue';
import StatsSection from '@/components/Home/Stats/StatsSection.vue';
import BenefitsSection from '@/components/Home/Benefits/BenefitsSection.vue';
import AboutSection from '@/components/Home/About/AboutSection.vue';
import TestimonialsSection from '@/components/Home/Testimonials/TestimonialsSection.vue';
import CTASection from '@/components/Home/CTA/CTASection.vue';
import FooterSection from '@/components/Home/Footer/FooterSection.vue';

export default {
  name: 'HomePage',
  components: {
    HeroSection,
    StatsSection,
    BenefitsSection,
    AboutSection,
    TestimonialsSection,
    CTASection,
    FooterSection
  },
  data() {
    return {
      stats: [
        { value: '5000', label: 'Meals Saved', suffix: '+', emoji: '🍽️' },
        { value: '200', label: 'Hawkers Participating', suffix: '+', emoji: '🏪' },
        { value: '30', label: 'Average Savings', suffix: '%', emoji: '💰' }
      ],
      benefits: [
        {
          icon: 'fa-solid fa-wallet',
          title: 'Save Money',
          text: 'Get delicious hawker meals at discounted prices while supporting local businesses.'
        },
        {
          icon: 'fa-solid fa-leaf',
          title: 'Reduce Waste',
          text: 'Help minimize food wastage by purchasing quality meals before they go unsold.'
        },
        {
          icon: 'fa-solid fa-location-dot',
          title: 'Support Local',
          text: 'Discover and support your favorite hawker stalls in your neighborhood.'
        },
        {
          icon: 'fa-solid fa-clock',
          title: 'Quick & Easy',
          text: 'Browse, order, and pick up meals seamlessly through our user-friendly platform.'
        }
      ],
      testimonials: [
        {
          review: "Love this platform! Not only am I saving money, but I feel great knowing I'm helping reduce food waste. Plus, the food is always so tasty!",
          user: "Daphne"
        },
        {
          review: "I've been using this platform for a while now, and I absolutely love it. The variety of meals is amazing, and I feel great supporting local businesses.",
          user: "Nicholas"
        },
        {
          review: "Fantastic service! It's so convenient, and I love knowing I'm contributing to a more sustainable world while enjoying great meals.",
          user: "Jeslyn"
        },
        {
          review: "This platform has helped me save money and reduce my food waste. The food is always top-notch!",
          user: "Yuelin"
        },
        {
          review: "I love the concept behind this platform. It's not just about saving money but also about supporting the environment.",
          user: "Zichian"
        },
        {
          review: "This service is a game-changer! Not only do I get to enjoy amazing food, but I also feel good about contributing to the community.",
          user: "Monkey D. Luffy"
        },
        {
          review: "This platform has saved me so much money while helping me reduce waste. I can't recommend it enough!",
          user: "Tony Tony Chopper"
        }
      ]
    };
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
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      // Observe all scroll-triggered elements
      document.querySelectorAll('[data-scroll-item]').forEach(el => {
        observer.observe(el);
      });

      document.querySelectorAll('[data-scroll-section]').forEach(el => {
        observer.observe(el);
      });
    }
  }
};
</script>

<style>
@import '../assets/css/Home.css';
</style>
