<template>
  <div class="cart-page">

      <div class="cart-header">
        <button @click="goBack" class="back-btn">
          <i class="fa-solid fa-arrow-left"></i>
        </button>
        <h1>Shopping Cart</h1>
        <div class="cart-count">{{ cartCount }} {{ cartCount === 1 ? 'item' : 'items' }}</div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="loading-state">
        <p>Loading your cart...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="errorMsg" class="error-state">
        <p>{{ errorMsg }}</p>
        <button @click="goBack" class="continue-shopping-btn">
          Go Back
        </button>
      </div>

      <!-- Empty cart -->
      <div v-else-if="cartItems.length === 0" class="empty-cart">
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

      <!-- Cart content -->
      <div v-else class="cart-content">
        <div class="cart-items">
          <transition-group name="list" tag="div">
            <div v-for="item in cartItems" :key="item.itemId" class="cart-item">
              <div class="item-image">
                <img :src="item.imageUrl || require('../../assets/img/stall.jpg')" :alt="item.itemName"/>
              </div>
              
              <div class="item-details">
                <h3 class="item-name">{{ item.itemName }}</h3>
                <p class="item-hawker">{{ item.hawkerName }}</p>
                <div class="item-pricing">
                  <span class="original-price">${{ item.itemPrice }}</span>
                  <span class="discounted-price">{{ formatPrice(item.discountedPrice) }}</span>
                </div>
              </div>

              <div class="item-controls">
                <div class="quantity-control">
                  <button @click="decrementItem(item)" class="qty-btn minus" :disabled="updating">
                    <i class="fa-solid fa-minus"></i>
                  </button>
                  <span class="quantity">{{ item.qty }}</span>
                  <button @click="incrementItem(item)" class="qty-btn plus" :disabled="updating">
                    <i class="fa-solid fa-plus"></i>
                  </button>
                </div>
                <div class="item-total">${{ calculateItemTotal(item) }}</div>
                <button @click="removeItem(item)" class="remove-btn" :disabled="updating">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          </transition-group>
        </div>

        <div class="cart-summary">
          <div class="summary-card">
            <h3 class="summary">Order Summary</h3>
            <button @click="clearAllItems" class="clear-cart-btn" :disabled="updating">
              <i class="fa-solid fa-trash-can"></i>
              Clear Cart
            </button>
            
            
            <div class="summary-row total">
              <span>Total</span>
              <span>${{ cartTotal.toFixed(2) }}</span>
            </div>

            <button @click="checkout" class="checkout-btn" :disabled="updating">
              <span>Proceed to Checkout </span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

</template>

<script src="./ShoppingCart.js"> </script>

<style>
@import './ShoppingCart.css';
</style>