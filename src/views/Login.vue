<template>
  <main class="text-center">
    <h2>Login</h2>
    <p>Access your hawker or buyer account to start saving food.</p>
    <AuthComponent />
  </main>
</template>

<script>
import AuthComponent from '@/components/shared/AuthComponent/AuthComponent.vue';

export default { 
  name: "Login",
  components: {
    AuthComponent
  } 
};
</script>

<!-- <style src="../assets/css/Login.css"></style> -->
