<template>
  <button v-if="showButton" class="backtotop" @click="scrollToTop">
    ↑
  </button>
</template>

<script>
export default {
  name: "BackToTop",
  data() {
    return {
      showButton: false // Initially set to false, meaning the button is hidden
    };
  },
  methods: {
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to top
    },
    handleScroll() {
      // If the scroll position is greater than 100px, show the button
      this.showButton = window.scrollY > 100;
    }
  },
  mounted() {
    // Add scroll event listener when the component is mounted
    window.addEventListener('scroll', this.handleScroll);
  },
  destroyed() {
    // Remove the scroll event listener when the component is destroyed
    window.removeEventListener('scroll', this.handleScroll);
  }
};
</script>

<style scoped>
.backtotop {
  color: white;
  background-color: rgb(116, 195, 116);
  border-radius: 50%; 
  position: fixed; 
  bottom: 30px; 
  right: 30px; 
  width: 60px; 
  height: 60px; 
  font-size: 24px; 
  display: flex;
  align-items: center;
  justify-content: center; 
  border: none;
  cursor: pointer; 
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); 
  transition: background-color 0.3s ease, transform 0.3s ease;
  z-index: 100000000;
}

.backtotop:hover {
  background-color: rgb(98, 171, 98); 
  transform: scale(1.1); 
}
</style>
