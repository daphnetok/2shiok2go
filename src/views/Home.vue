<template>
  <div class="homepage">
    <!-- Hero Section with Gradient Background -->
    
    <div class="hero">
      <div class="action"><i class="fa-solid fa-leaf"></i> Join the Green Movement</div>
      <h1 class="headline">Save More, Waste Less.</h1>
      <h1 class="headline2">Discover Discounted Hawker Meals Near You!</h1>
      <p class="subheading">Join the Movement to Reduce Food Waste While Enjoying Affordable Local Food</p>
      <div class="buttons">
        <router-link class="router" to="/login">
        <button class="signup1">Start Saving Today &nbsp; ➜  </button>
        </router-link>
        <button class="browse">Browse Deals</button>
      </div>
      <div class="stats">
        <div class="stat">
          <h2>5000+</h2>
          <p>Meals Saved</p>
        </div>
        <div class="stat">
          <h2>200+</h2>
          <p>Hawkers Participating</p>
        </div>
        <div class="stat">
          <h2>30%</h2>
          <p>Average Savings</p>
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
      <div><i class="fa-solid fa-leaf leafIcon"></i></div>
      <h2>Our Mission: Reducing Food Waste, <br> <span>One Meal at a Time</span></h2>
      <p>At 2Shiok2Go, we're passionate about reducing food wastage in Singapore's vibrant hawker culture. Our platform connects you to unsold, still-fresh hawker meals at discounted prices. By buying from hawkers near you, you're helping reduce food waste and support the community at the same time.</p>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials">
    <h2>What Our <span class="user">Users</span> Are Saying</h2>
    <div class="testimonial-container">
      <!-- First set of testimonials -->
      <div class="testimonial-track">
        <div class="testimonial" v-for="n in 20" :key="'first-' + n">
          <i v-for="star in 5" :key="star" class="fa-solid fa-star starIcon"></i>
          <p>'Love this platform! Not only am I saving money, but I feel great knowing I'm helping reduce food waste. Plus, the food is always so tasty!'</p>
          <p class="name">- User {{ n }}</p>
        </div>
      </div>
      <!-- Duplicate set for seamless loop -->
      <div class="testimonial-track">
        <div class="testimonial" v-for="n in 20" :key="'second-' + n">
          <i v-for="star in 5" :key="star" class="fa-solid fa-star starIcon"></i>
          <p>'Love this platform! Not only am I saving money, but I feel great knowing I'm helping reduce food waste. Plus, the food is always so tasty!'</p>
          <p class="name">- User {{ n }}</p>
        </div>
      </div>
    </div>
  </section>

    <!-- Call to Action -->
    <section class="cta">
      <h2>Start Saving Today!</h2>
      <p>Browse through the latest deals near you and start supporting your favorite hawkers while cutting down on food waste!</p>
      <button @click="startSaving" class="cta-button">Join the Movement – Sign Up Now!</button>
    </section>
  </div>

  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3 class="footer-tagline">Eat Good. Do Good.</h3>
        <p class="footer-description">Join us in reducing food waste while enjoying delicious local meals at great prices.</p>
      </div>
      
      <div class="footer-section">
        <h4 class="footer-title">Contact Us</h4>
        <p class="footer-email">
          <i class="fa-solid fa-envelope"></i>
          <a href="mailto:2shiok2go@gmail.com">2shiok2go@gmail.com</a>
        </p>
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

</template>

<script>
export default {
  data() {
    return {
      benefits: [
        { title: 'Save Money While Supporting Local Hawkers', text: 'Why pay full price when you can enjoy your favorite hawker meals at discounted rates? Join us today and save on every meal, all while supporting your local hawkers.', icon: 'fa-solid fa-wallet' },
        { title: 'Reduce Food Waste – One Meal at a Time', text: 'Food waste is a growing problem, especially in the food industry. By purchasing discounted meals, you\'re helping reduce excess food that would otherwise go to waste. It\'s a win-win!', icon: 'fa-solid fa-recycle' },
        { title: 'Access to Delicious Local Food at Great Prices', text: 'Craving a hot bowl of noodles or a plate of chicken rice? Now you can enjoy delicious local dishes at unbeatable prices, all thanks to our platform.', icon: 'fa-solid fa-utensils' },
        { title: 'Earn More, Waste Less – For Hawkers and You', text: 'For hawkers, this is a chance to sell unsold food at a discounted price, reducing waste and boosting earnings. For you, it’s an opportunity to savor tasty meals without breaking the bank.', icon: 'fa-solid fa-hand-holding-dollar' },
      ]
    };
  },
  methods: {
    startSaving() {
      // Logic for sign-up or saving action
    },
  },
  mounted() {
    this.addCursorEffect();
  },
  methods: {
    addCursorEffect() {
      const cursor = document.createElement('div');
      cursor.classList.add('custom-cursor');
      document.body.appendChild(cursor);

      document.addEventListener('mousemove', (event) => {
        cursor.style.left = `${event.pageX - 16}px`; // Adjust for the cursor's center
        cursor.style.top = `${event.pageY - 16}px`; // Adjust for the cursor's center
      });
    },
  }
};
</script>

<style>
@import '../assets/css/Home.css';
</style>
