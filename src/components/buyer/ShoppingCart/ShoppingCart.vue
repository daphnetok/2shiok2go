<template>
  <div class="cart-page">
    <div class="container">
      <div class="cart-header">
        <button @click="goBack" class="back-btn">
          <i class="fa-solid fa-arrow-left"></i>
        </button>
        <h1>Shopping Cart</h1>
        <div class="cart-count">{{ cartCount }} {{ cartCount === 1 ? 'item' : 'items' }}</div>
      </div>

      <!-- <div v-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-cart-icon">
          <i class="fa-solid fa-basket-shopping"></i>
        </div>
        <h2>Your cart is empty</h2>
        <p>Add some delicious food to get started!</p>
        <button @click="goBack" class="continue-shopping-btn">
          Continue Shopping
        </button>
      </div> -->

      <div  class="cart-content">
        <div class="cart-items">
          <transition-group name="list" tag="div">
            <div v-for="item in cartItems" :key="`${item.hawkerName}-${item.itemName}`" class="cart-item">
              <div class="item-image">
                <img :src="item.image || require('../../assets/img/stall.jpg')" :alt="item.itemName"/>
              </div>
              
              <div class="item-details">
                <h3 class="item-name">{{ item.itemName }}</h3>
                <p class="item-hawker">{{ item.hawkerName }}</p>
                <div class="item-pricing">
                  <span class="original-price">${{ item.price }}</span>
                  <span class="discounted-price">${{ (parseFloat(item.price) * 0.8).toFixed(2) }}</span>
                </div>
              </div>

              <div class="item-controls">
                <div class="quantity-control">
                  <button @click="decrementItem(item)" class="qty-btn minus">
                    <i class="fa-solid fa-minus"></i>
                  </button>
                  <span class="quantity">{{ item.count }}</span>
                  <button @click="incrementItem(item)" class="qty-btn plus" :disabled="item.count >= item.quantity">
                    <i class="fa-solid fa-plus"></i>
                  </button>
                </div>
                <div class="item-total">${{ (parseFloat(item.price) * 0.8 * item.count).toFixed(2) }}</div>
                <button @click="removeItem(item)" class="remove-btn">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          </transition-group>
        </div>

        <div class="cart-summary">
          <div class="summary-card">
            <h3 class="summary">Order Summary</h3>
            <button @click="clearAllItems" class="clear-cart-btn">
              <i class="fa-solid fa-trash-can"></i>
              Clear Cart
            </button>
            
            <!-- <div class="summary-row">
              <span>Subtotal : </span>
              <span>${{ subtotal.toFixed(2) }}</span>
            </div>
            
            <div class="summary-row">
              <span>Discount (20%) </span>
              <span class="discount">-${{ discount.toFixed(2) }}</span>
            </div> -->
            
            <div class="summary-divider"></div>
            
            <div class="summary-row total">
              <span>Total</span>
              <span>${{ cartTotal.toFixed(2) }}</span>
            </div>

            <button @click="checkout" class="checkout-btn">
              <span>Proceed to Checkout </span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>

            
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCart } from '@/composables/useCart';

export default {
  name: 'ShoppingCart',
  setup() {
    const router = useRouter();
    const { cartItems, cartCount, cartTotal, updateItemCount, removeFromCart, clearCart } = useCart();
    
    const subtotal = computed(() => {
      return cartItems.value.reduce((total, item) => {
        return total + (parseFloat(item.price) * item.count);
      }, 0);
    });
    
    const discount = computed(() => subtotal.value * 0.2);
    
    const serviceFee = computed(() => cartItems.value.length > 0 ? 1.5 : 0);
    
    const goBack = () => {
      router.go(-1);
    };
    
    const incrementItem = (item) => {
      if (item.count < item.quantity) {
        updateItemCount({
          itemName: item.itemName,
          hawkerName: item.hawkerName,
          count: item.count + 1
        });
      }
    };
    
    const decrementItem = (item) => {
      updateItemCount({
        itemName: item.itemName,
        hawkerName: item.hawkerName,
        count: item.count - 1
      });
    };
    
    const removeItem = (item) => {
      removeFromCart({
        itemName: item.itemName,
        hawkerName: item.hawkerName
      });
    };
    
    const clearAllItems = () => {
      if (confirm('Are you sure you want to clear your cart?')) {
        clearCart();
      }
    };
    
    const checkout = () => {
      alert('Proceeding to checkout...');
    };
    
    return {
      cartItems,
      cartCount,
      cartTotal,
      subtotal,
      discount,
      serviceFee,
      goBack,
      incrementItem,
      decrementItem,
      removeItem,
      clearAllItems,
      checkout
    };
  }
};
</script>

<style>
@import './ShoppingCart.css';
</style>