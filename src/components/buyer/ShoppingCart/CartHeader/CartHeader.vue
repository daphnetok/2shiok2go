<template>
  <div class="cart-header">
    <button @click="$emit('go-back')" class="back-btn">
      <i class="fa-solid fa-arrow-left"></i>
    </button>
    <h1>Checkout</h1>
    <div class="cart-count">{{ cartCount }} {{ cartCount === 1 ? 'item' : 'items' }}</div>
  </div>
</template>

<script src="./CartHeader.js"></script>

<style>
@import './CartHeader.css';
</style>

