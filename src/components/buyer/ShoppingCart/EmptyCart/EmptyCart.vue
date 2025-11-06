<template>
  <div class="empty-cart">
    <div class="empty-cart-icon">
      <i class="fa-solid fa-basket-shopping"></i>
    </div>
    <h2>Your cart is empty</h2>
    <p>Add some delicious food to get started!</p>
    <router-link to="/buyer-listings" class="router">
      <button class="continue-shopping-btn">
        Continue Shopping
      </button>
    </router-link>
  </div>
</template>

<script src="./EmptyCart.js"></script>

<style>
@import './EmptyCart.css';
</style>

