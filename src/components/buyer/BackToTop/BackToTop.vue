<!-- back to top button -->
<template>
  <button class="backtotop" @click="scrollToTop">
    ↑
  </button>
</template>

<script>
export default {
  name: "BackToTop",
  methods: {
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to top
    }
  }
};
</script>

<style scoped>
.backtotop {
  color: white;
  background-color: rgb(116, 195, 116); /* Button color */
  border-radius: 50%; /* Make the button circular */
  position: fixed; /* Fix the button at the bottom right */
  bottom: 30px; /* 30px from the bottom */
  right: 30px; /* 30px from the right */
  width: 60px; /* Button width */
  height: 60px; /* Button height */
  font-size: 24px; /* Icon size */
  display: flex;
  align-items: center;
  justify-content: center; /* Center the ^ symbol */
  border: none;
  cursor: pointer; /* Change cursor to pointer */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* Shadow effect */
  transition: background-color 0.3s ease, transform 0.3s ease; /* Smooth transition */
}

.backtotop:hover {
  background-color: rgb(98, 171, 98); /* Darker shade on hover */
  transform: scale(1.1); /* Slightly enlarge on hover */
}

</style>
