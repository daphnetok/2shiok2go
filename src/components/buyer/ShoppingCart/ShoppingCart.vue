<template>
  <div class="cart-page">

      <div class="cart-header">
        <button @click="goBack" class="back-btn">
          <i class="fa-solid fa-arrow-left"></i>
        </button>
        <h1>Checkout</h1>
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
        <div class="cart-summary">
          <div class="summary-card">
            <!-- Order Summary Header Row -->
            <div class="summary-header-row">
              <h3 class="summary">Order Summary</h3>
              <button @click="clearAllItems" class="clear-cart-btn" :disabled="updating">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
            <!-- Cart Items in Order Summary -->

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
                      <span class="discounted-price">${{ (item.itemPrice * ((100-item.discount)/100)).toFixed(2)}}</span>
                    </div>
                  </div>
                  <div class="item-controls">
                    <div class="quantity-control">
                      <button @click="decrementItem(item)" 
                              class="qty-btn minus" 
                              :disabled="updating || parseInt(item.qty) <= 1">
                        <i class="fa-solid fa-minus" :class="{ 'disabled': parseInt(item.qty) <= 1 }"></i>
                      </button>
                      <input type="number" 
                             v-model="item.qty" 
                             class="quantity" 
                             :min="1" 
                             :max="item.itemQty || 99"
                             @change="updateItemQuantity(item)"
                             @input="validateQuantity(item)">
                      <button @click="incrementItem(item)" 
                              class="qty-btn plus" 
                              :disabled="updating || parseInt(item.qty) >= (item.itemQty || 99)">
                        <i class="fa-solid fa-plus" :class="{ 'disabled': parseInt(item.qty) >= (item.itemQty || 99) }"></i>
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
          <!-- Payment Details Section -->
          <div class="payment-details-card">
            <h3>Payment Details</h3>
            <div class="payment-row">
              <span class="normal">Subtotal (Before Discount)</span>
              <span>${{ cartItems.reduce((total, item) => total + (parseFloat(item.itemPrice) * item.qty), 0).toFixed(2) }}</span>
            </div>
            <div class="payment-row">
              <span class="normal">Discount</span>
              <span>-
                ${{ (cartItems.reduce((total, item) => total + (parseFloat(item.itemPrice) * item.qty), 0) - cartTotal).toFixed(2) }}
              </span>
            </div>
            <br>
            <div class="payment-row">
              <span><b>Total Payable</b></span>
              <span class="total-payable">${{ cartTotal.toFixed(2) }}</span>
            </div>
            <div class="payment-row saved-message">
              <span class="normal">
                🎉 Congratulations! You saved 
                <span class="highlight">${{ (cartItems.reduce((total, item) => total + (parseFloat(item.itemPrice) * item.qty), 0) - cartTotal).toFixed(2) }}</span>
                on this order!
              </span>
            </div>
            <div class="payment-method-section">
              <span><b>Payment Method:</b></span>
              <select id="payment-method">
                <option value="card">Credit/Debit Card</option>
                <option value="paynow">PayNow</option>
                <option value="cash">Cash on Delivery</option>
              </select>
            </div>
            <button @click="checkout" class="checkout-btn" :disabled="updating">
              <span>Place Order</span>
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