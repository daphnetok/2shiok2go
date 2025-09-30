<template>
  <div id="app">
    <h1>Test v1.1</h1>
    <img src="/funny-cat.jpg" width="200px" height="200px"></img>
    <AuthComponent />
  </div>
</template>

<script setup>
import AuthComponent from './components/AuthComponent.vue'
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>