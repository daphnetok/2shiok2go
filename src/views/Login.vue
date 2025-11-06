<template>
  <div class="container mt-4 text-center">
    <h2>{{ isLoginMode ? 'Login' : 'Sign Up' }}</h2>
    <p>{{ isLoginMode ? 'Access your hawker or buyer account to start saving food.' : 'Create your account to start saving food.' }}</p>
    <AuthComponent @mode-change="isLoginMode = $event" />
  </div>
</template>

<script>
import AuthComponent from '@/components/shared/AuthComponent/AuthComponent.vue';

export default { 
  name: "Login",
  components: {
    AuthComponent
  },
  data() {
    return {
      isLoginMode: true
    };
  }
};
</script>

<!-- <style src="../assets/css/Login.css"></style> -->
