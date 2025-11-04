<template>
  <div class="homepage">
    <!-- Hero Section -->
    <div class="hero">
      <div class="hero-content">
        <div class="action">
          <i class="fa-solid fa-leaf"></i> Join the Green Movement
        </div>
        <h1 class="headline">Save More, Waste Less.</h1>
        <h1 class="headline2">Discover Discounted Hawker Meals Near You!</h1>
        <p class="subheading">Join the Movement to Reduce Food Waste While Enjoying Affordable Local Food</p>
        
        <div class="buttons">
          <router-link class="router" to="/login">
            <button class="btn-primary">Start Saving Today <span class="arrow">➜</span></button>
          </router-link>
          <router-link class="router" to="/buyer-listings">
            <button class="btn-secondary">Browse Deals</button>
          </router-link>
        </div>
        
        <div class="stats">
          <div class="stat" v-for="(stat, index) in stats" :key="index">
            <h2>{{ stat.value }}</h2>
            <p>{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Key Benefits Section -->
    <section class="benefits">
      <h2>Why Choose <span>2Shiok2Go</span>?</h2>
      <div class="benefits-grid">
        <div class="benefit" v-for="(benefit, index) in benefits" :key="index">
          <div class="benefit-icon">
            <i :class="benefit.icon"></i>
          </div>
          <h3>{{ benefit.title }}</h3>
          <p>{{ benefit.text }}</p>
        </div>
      </div>
    </section>

    <!-- About Us Section -->
    <section class="about">
      <div class="about-content">
        <div class="about-icon">
          <i class="fa-solid fa-leaf"></i>
        </div>
        <h2>Our Mission: Reducing Food Waste, <span>One Meal at a Time</span></h2>
        <p>At 2Shiok2Go, we're passionate about reducing food wastage in Singapore's vibrant hawker culture. Our platform connects you to unsold, still-fresh hawker meals at discounted prices. By buying from hawkers near you, you're helping reduce food waste and support the community at the same time.</p>
      </div>
    </section>

    <!-- Reviews Section -->
    <section class="testimonials">
      <h2>What Our <span class="user">Users</span> Are Saying</h2>
      <div class="testimonial-container">
        <div class="testimonial-track">
          <div class="testimonial" v-for="(testimonial, index) in testimonials" :key="'first-' + index">
            <div class="stars">
              <i v-for="star in 5" :key="star" class="fa-solid fa-star"></i>
            </div>
            <p class="review">{{ testimonial.review }}</p>
            <p class="name">{{ testimonial.user }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="cta">
      <div class="cta-content">
        <h2>Start Saving Today!</h2>
        <p>Browse through the latest deals near you and start supporting your favorite hawkers while cutting down on food waste!</p>
        <button @click="startSaving" class="cta-button">
          Join the Movement – Sign Up Now!
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-tagline">Eat Good. Do Good.</h3>
          <p class="footer-description">Join us in reducing food waste while enjoying delicious local meals at great prices.</p>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-title">Contact Us</h4>
          <div class="footer-email">
            <i class="fa-solid fa-envelope"></i>
            <a href="mailto:2shiok2go@gmail.com" class="router">2shiok2go@gmail.com</a>
          </div>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-title">Follow Us</h4>
          <div class="social-links">
            <a href="https://facebook.com/2shiok2go/" class="social-link facebook" aria-label="Facebook">
              <i class="fa-brands fa-facebook-f"></i>
            </a>
            <a href="https://www.instagram.com/2shiok2go/" class="social-link instagram" aria-label="Instagram">
              <i class="fa-brands fa-instagram"></i>
            </a>
            <a href="https://x.com/2shiok2go/" class="social-link twitter" aria-label="X (Twitter)">
              <i class="fa-brands fa-twitter"></i>
            </a>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2025 2Shiok2Go. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      stats: [
        { value: '5000+', label: 'Meals Saved' },
        { value: '200+', label: 'Hawkers Participating' },
        { value: '30%', label: 'Average Savings' }
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
  methods: {
    startSaving() {
      this.$router.push('/login');
    }
  }
};
</script>

<style>
@import '../assets/css/Home.css';
</style>
