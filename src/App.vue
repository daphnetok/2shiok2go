<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/shared/Navbar.vue'
import AuthComponent from './components/shared/AuthComponent.vue'
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
#app {
  font-family: 'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif;
  background-color: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 80px;
}
</style>
