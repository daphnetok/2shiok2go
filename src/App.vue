<script setup>
import { RouterView, useRoute } from 'vue-router'
import Navbar from './components/shared/Navbar.vue'
import '@fortawesome/fontawesome-free/css/all.css';

const route = useRoute()

</script>

<template>
  <div id="app">
    <Navbar v-if="route.path !== '/'" />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style>
/* Add this to your App.vue */
html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  width: 100%;
  max-width: 100vw;
}

#app {
  font-family: 'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif;
  background-color: #fff; 
  color: #222;            
  min-height: 100vh;
  width: 100%;
  max-width: 100vw;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 100vw;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  overflow-x: hidden;
}

.offcanvas {
  background: #fff;
  color: #222;
}
</style>
