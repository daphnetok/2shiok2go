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
              <button v-if="!editMode" @click="enterEditMode" class="edit-cart-btn" :disabled="updating">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <div v-else class="edit-mode-actions">
                <button @click="selectAll" class="select-all-btn">
                  <i class="fa-solid fa-check-double"></i> Select All
                </button>
                <button @click="deleteSelected" class="delete-selected-btn" :disabled="selectedItems.length === 0">
                  <i class="fa-solid fa-trash-can"></i> Delete ({{ selectedItems.length }})
                </button>
                <button @click="cancelEditMode" class="cancel-edit-btn">
                  <i class="fa-solid fa-xmark"></i> Cancel
                </button>
              </div>
            </div>

            <!-- Warning banner for closed stalls -->
            <div v-if="hasClosedStalls" class="closed-stalls-warning">
              <i class="fa-solid fa-triangle-exclamation"></i>
              <span>Some items are from stalls that are currently closed. These items cannot be ordered right now.</span>
            </div>

            <!-- Cart Items in Order Summary -->
              <transition-group name="list" tag="div">
                <div v-for="item in cartItems" :key="item.itemId" 
                     class="cart-item" 
                     :class="{ 'edit-mode': editMode, 'stall-closed': item.isClosed }">
                  
                  <!-- Closed stall overlay badge -->
                  <div v-if="item.isClosed" class="closed-badge">
                    <i class="fa-solid fa-lock"></i>
                    <span>Stall Closed</span>
                  </div>

                  <div v-if="editMode" class="item-checkbox">
                    <input 
                      type="checkbox" 
                      :id="`checkbox-${item.itemId}`"
                      :value="item.itemId"
                      v-model="selectedItems"
                      class="checkbox-input"
                    />
                    <label :for="`checkbox-${item.itemId}`" class="checkbox-label"></label>
                  </div>
                  <div class="item-image">
                    <img :src="item.imageUrl || require('../../assets/img/stall.jpg')" :alt="item.itemName"/>
                  </div>
                  <div class="item-details">
                    <h3 class="item-name">
                      {{ item.itemName }}
                      <span v-if="item.isClosed" class="closed-indicator">
                        <i class="fa-solid fa-circle-xmark"></i>
                      </span>
                    </h3>
                    <p class="item-hawker">
                      {{ item.hawkerName }}
                      <span v-if="item.isClosed" class="closed-time-info">
                        (Opens at {{ item.openingTime }})
                      </span>
                    </p>
                    <div class="item-pricing">
                      <span class="original-price">${{ item.itemPrice }}</span>
                      <span class="discounted-price">${{ (item.itemPrice * ((100-item.discount)/100)).toFixed(2)}}</span>
                    </div>
                  </div>
                  <div class="item-controls">
                    <div class="quantity-control">
                      <button @click="decrementItem(item)" 
                              class="qty-btn minus" 
                              :disabled="updating || parseInt(item.qty) <= 1 || editMode || item.isClosed">
                        <i class="fa-solid fa-minus" :class="{ 'disabled': parseInt(item.qty) <= 1 }"></i>
                      </button>
                      <input type="number" 
                             v-model="item.qty" 
                             class="quantity" 
                             :min="1" 
                             :max="item.itemQty || 99"
                             @change="updateItemQuantity(item)"
                             @input="validateQuantity(item)"
                             :disabled="editMode || item.isClosed">
                      <button @click="incrementItem(item)" 
                              class="qty-btn plus" 
                              :disabled="updating || parseInt(item.qty) >= (item.itemQty || 99) || editMode || item.isClosed">
                        <i class="fa-solid fa-plus" :class="{ 'disabled': parseInt(item.qty) >= (item.itemQty || 99) }"></i>
                      </button>
                    </div>
                    <div class="item-total">${{ calculateItemTotal(item) }}</div>
                  </div>
                </div>
              </transition-group>

          </div>
          <!-- Payment Details Section -->
          <div class="payment-details-card">
            <h3>Payment Details</h3>
            <div class="payment-row">
              <span class="normal">Original Price</span>
              <span>${{ cartItems.reduce((total, item) => total + (parseFloat(item.itemPrice) * item.qty), 0).toFixed(2) }}</span>
            </div>
            <div class="payment-row">
              <span class="normal">Discount Applied</span>
              <span>-
                ${{ (cartItems.reduce((total, item) => total + (parseFloat(item.itemPrice) * item.qty), 0) - cartTotal).toFixed(2) }}
              </span>
            </div>
            <br>
            <div class="payment-row">
              <span><b>Amount Due</b></span>
              <span class="total-payable">${{ cartTotal.toFixed(2) }}</span>
            </div>
            <div v-if="closedStallsTotal > 0" class="payment-row unavailable-items">
              <span class="normal">
                <i class="fa-solid fa-info-circle"></i> Items from closed stalls
              </span>
              <span class="unavailable-amount">-${{ closedStallsTotal.toFixed(2) }}</span>
            </div>
            <div v-if="availableTotal !== cartTotal" class="payment-row available-total">
              <span><b>Total Available for Purchase</b></span>
              <span class="available-payable">${{ availableTotal.toFixed(2) }}</span>
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
            <router-link :to="'/order-receipt'" class="router">
              <button @click="checkout" class="checkout-btn" :disabled="editMode">
                <span>Place Order</span>
                <i class="fa-solid fa-arrow-right"></i>
              </button>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Closed Stalls Modal -->
    <div v-if="showClosedStallsModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-header-content">
            <i class="fa-solid fa-triangle-exclamation modal-icon"></i>
            <h2 class="modal-h2">Some Items Cannot Be Ordered</h2>
          </div>
        </div>
        <div class="modal-body">
          <p>The following items are from stalls that are currently closed:</p>
          <ul class="closed-items-list">
            <li v-for="item in closedStallItems" :key="item.itemId">
              <strong>{{ item.itemName }}</strong> from {{ item.hawkerName }}
              <span class="opens-at">(Opens at {{ item.openingTime }})</span>
            </li>
          </ul>
          <p class="modal-question">Would you like to proceed with only the available items?</p>
          <div class="modal-amounts">
            <div class="amount-row">
              <span>Total cart value:</span>
              <span>${{ cartTotal.toFixed(2) }}</span>
            </div>
            <div class="amount-row unavailable">
              <span>Unavailable items:</span>
              <span>-${{ closedStallsTotal.toFixed(2) }}</span>
            </div>
            <div class="amount-row available">
              <span><strong>Proceeding with:</strong></span>
              <span><strong>${{ availableTotal.toFixed(2) }}</strong></span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="proceedWithAvailable" class="modal-btn proceed-btn">
            <i class="fa-solid fa-check"></i>
            Proceed with Available Items
          </button>
          <button @click="closeModal" class="modal-btn cancel-btn">
            <i class="fa-solid fa-xmark"></i>
            Go Back to Cart
          </button>
        </div>
      </div>
    </div>

</template>
zz
<script src="./ShoppingCart.js"> </script>

<style>
@import './ShoppingCart.css';
</style>