<!-- need to change pic and ensure it stays in same place even when screen size changes -->
<template>
    <div class="search-container">
      <div class="search-box">
        <i class="fa-solid fa-search search-icon"></i>
        <input type="text" placeholder="Search for Food or Location..." class="search-input" />
      </div>
      
      <router-link to="/cart">
        <a href=""><i class="fa-solid fa-basket-shopping shopping"></i></a>
      </router-link>
      <div class="me-3"></div>
      <div class="user-icon-container position-relative">
        <a href="" class="user-icon user">
          <i class="fa-solid fa-user"></i>
        </a>
        <div class="user-dropdown">
          <ul>
            <router-link to="/favourites" class="router">
            <li><a href="#"><i class="fa-solid fa-heart icon"></i>Favourite</a></li>
            </router-link>
            <li><a href="#"><i class="fa-solid fa-clock icon"></i>Recent Orders</a></li>
            <li><a href="#"><i class="fa-solid fa-gear icon"></i>Settings</a></li>
          </ul>
        </div>
      </div>
      
  </div>
</template>

<script>
export default {
  name: "SearchBar"}
</script>

<style>
@import './SearchBar.css'

</style>