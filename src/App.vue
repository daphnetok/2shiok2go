<template>
  <div id="app">
    <h1>Test v1.1</h1>
    <img src="/funny-cat.jpg" width="200px" height="200px"></img>
    <AuthComponent />
    <ListingComponent />
  </div>
</template>

<script setup>
import AuthComponent from './components/AuthComponent.vue';
import ListingComponent from './components/ListingComponent.vue';
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>