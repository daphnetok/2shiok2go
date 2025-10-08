<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/shared/Navbar.vue'
import AuthComponent from './components/shared/AuthComponent.vue'
import '@fortawesome/fontawesome-free/css/all.css';

</script>

<template>
  <div id="app">
    <Navbar />
    <main class="main-content">
      <RouterView />
      <AuthComponent />
    </main>
  </div>
</template>

<style>
body, #app, .main-content, .offcanvas, .offcanvas-body, .offcanvas-header {
  background: #fff;
  color: #222;
  
}

#app {
  font-family: 'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif;
  background-color: #fff; /* white background */
  color: #222;            /* dark text for contrast */
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}

.main-content {
  flex: 1;
  width: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.offcanvas {
  background: #fff !important;
  color: #222;
}
</style>
