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

            <!-- Warning banner for unavailable items (closed or sold out) -->
            <div v-if="hasUnavailableItems" class="closed-stalls-warning">
              <i class="fa-solid fa-triangle-exclamation"></i>
              <span>Some items are unavailable (stall closed or sold out). You can proceed with available items.</span>
            </div>

            <!-- Cart Items in Order Summary -->
              <transition-group name="list" tag="div">
                <div v-for="item in cartItems" :key="item.itemId" 
                     class="cart-item" 
                     :class="{ 'edit-mode': editMode, 'stall-closed': (item.isClosed || item.isSoldOut) }">
                  
                  <!-- Unavailable overlay badge (reuse closed style for sold out) -->
                  <div v-if="item.isClosed || item.isSoldOut" class="closed-badge">
                    <i class="fa-solid fa-lock"></i>
                    <span>{{ item.isClosed ? 'Stall Closed' : 'Sold Out' }}</span>
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
                      <span v-if="item.isClosed || item.isSoldOut" class="closed-indicator">
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
                      <span class="original-price">${{ safeToFixed(parsePrice(item.itemPrice)) }}</span>
                      <span class="discounted-price">${{ calculateItemTotal(item) }}</span>
                    </div>
                  </div>
                  <div class="item-controls">
                    <div class="quantity-control">
                      <button @click="decrementItem(item)" 
                              class="qty-btn minus" 
                              :disabled="updating || parseInt(item.qty) <= 1 || editMode || item.isClosed || item.isSoldOut">
                        <i class="fa-solid fa-minus" :class="{ 'disabled': parseInt(item.qty) <= 1 }"></i>
                      </button>
                      <input type="number" 
                             v-model="item.qty" 
                             class="quantity" 
                             :min="1" 
                             :max="item.itemQty || 99"
                             @change="updateItemQuantity(item)"
                             @input="validateQuantity(item)"
                             :disabled="editMode || item.isClosed || item.isSoldOut">
                      <button @click="incrementItem(item)" 
                              class="qty-btn plus" 
                              :disabled="updating || parseInt(item.qty) >= (item.itemQty || 99) || editMode || item.isClosed || item.isSoldOut">
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
              <span>${{ safeToFixed(safeCalculateOriginalPrice()) }}</span>
            </div>
            <div class="payment-row">
              <span class="normal">Discount Applied</span>
              <span>-
                ${{ safeToFixed(safeCalculateDiscount()) }}
              </span>
            </div>
            <br>
            <div class="payment-row">
              <span><b>Amount Due</b></span>
              <span class="total-payable">${{ safeToFixed(cartTotal) }}</span>
            </div>
            <div v-if="unavailableTotal > 0" class="payment-row unavailable-items">
              <span class="normal">
                <i class="fa-solid fa-info-circle"></i> Unavailable items
              </span>
              <span class="unavailable-amount">-${{ safeToFixed(unavailableTotal) }}</span>
            </div>
            <div v-if="availableTotal !== cartTotal" class="payment-row available-total">
              <span><b>Total Available for Purchase</b></span>
              <span class="available-payable">${{ safeToFixed(availableTotal) }}</span>
            </div>
            <div class="payment-row saved-message">
              <span class="normal">
                🎉 Congratulations! You saved 
                <span class="highlight">${{ safeToFixed(safeCalculateDiscount()) }}</span>
                on this order!
              </span>
            </div>
            <!-- Card Information Section -->
          <div class="card-info-section">
            <h3>Card Information</h3>
            <div v-if="savedCards.length > 0" class="saved-cards">
              <label class="saved-title">
                <input type="radio" name="card-selection" value="saved" v-model="cardSelection">
                Use Saved Card
              </label>
              <button v-if="cardSelection === 'saved'" type="button" class="saved-current-btn" @click="openSavedCardsModal">
                <span class="brand" :class="(savedCards[selectedCardIndex]?.brand || '')">
                  <template v-if="savedCards[selectedCardIndex]?.brand === 'visa'">VISA</template>
                  <template v-else-if="savedCards[selectedCardIndex]?.brand === 'mastercard'">MasterCard</template>
                  <template v-else>Card</template>
                </span>
                <span class="saved-card-mask">•••• •••• •••• {{ savedCards[selectedCardIndex]?.lastFour }}</span>
                <span class="saved-card-name">{{ savedCards[selectedCardIndex]?.cardholderName }}</span>
                <i class="fa-solid fa-chevron-down caret"></i>
              </button>
            </div>
            
            <div class="new-card-option">
              <label>
                <input type="radio" name="card-selection" value="new" v-model="cardSelection">
                {{ savedCards.length > 0 ? 'Use New Card' : 'Add Card Information' }}
              </label>
            </div>

            <div v-if="cardSelection === 'new'" class="card-form">
              <div class="form-group">
                <label for="cardholder-name">Cardholder Name</label>
                <input 
                  type="text" 
                  id="cardholder-name" 
                  v-model="newCard.cardholderName"
                  placeholder="John Doe"
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label for="card-number">Card Number</label>
                <input 
                  type="text" 
                  id="card-number" 
                  v-model="newCard.cardNumber"
                  @input="formatCardNumber"
                  placeholder="1234 5678 9012 3456"
                  maxlength="19"
                  class="form-input"
                />
                <div v-if="cardBrand || cardNumberError" class="card-brand-row">
                  <span v-if="cardBrand === 'visa'" class="brand visa">VISA</span>
                  <span v-else-if="cardBrand === 'mastercard'" class="brand mastercard">MasterCard</span>
                  <span v-if="cardNumberError" class="input-error">{{ cardNumberError }}</span>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="expiry-date">Expiry Date</label>
                  <input 
                    type="text" 
                    id="expiry-date" 
                    v-model="newCard.expiryDate"
                    @input="formatExpiryDate"
                    placeholder="MM/YY"
                    maxlength="5"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label for="cvv">CVV</label>
                  <input 
                    type="text" 
                    id="cvv" 
                    v-model="newCard.cvv"
                    @input="formatCVV"
                    placeholder="123"
                    maxlength="3"
                    class="form-input"
                  />
                </div>
              </div>
              
              <div class="save-card-checkbox">
                <label>
                  <input type="checkbox" v-model="saveCardForFuture">
                  Save this card for future purchases
                </label>
              </div>
            </div>
          </div>
            <button @click="checkout" class="checkout-btn" :disabled="updating">
              <span>Place Order</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Unavailable Items Modal (closed or sold out) -->
    <div v-if="showClosedStallsModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-header-content">
            <i class="fa-solid fa-triangle-exclamation modal-icon"></i>
            <h2 class="modal-h2">Some Items Cannot Be Ordered</h2>
          </div>
        </div>
        <div class="modal-body">
          <p>The following items are unavailable (stall closed or sold out):</p>
          <ul class="closed-items-list">
            <li v-for="item in unavailableItems" :key="item.itemId">
              <strong>{{ item.itemName }}</strong> from {{ item.hawkerName }}
              <span v-if="item.isClosed" class="opens-at">(Opens at {{ item.openingTime }})</span>
              <span v-else class="opens-at">(Sold out)</span>
            </li>
          </ul>
          <p class="modal-question">Would you like to proceed with only the available items?</p>
          <div class="modal-amounts">
            <div class="amount-row">
              <span>Total cart value:</span>
              <span>${{ safeToFixed(cartTotal) }}</span>
            </div>
            <div class="amount-row unavailable">
              <span>Unavailable items:</span>
              <span>-${{ safeToFixed(unavailableTotal) }}</span>
            </div>
            <div class="amount-row available">
              <span><strong>Proceeding with:</strong></span>
              <span><strong>${{ safeToFixed(availableTotal) }}</strong></span>
            </div>
          </div>
        </div>
        <div class="modal-footer inline">
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

    <!-- Validation / Error Modal -->
    <div v-if="showValidationModal" class="modal-overlay" @click="showValidationModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-header-content">
            <i class="fa-solid fa-circle-exclamation modal-icon"></i>
            <h2 class="modal-h2">Payment Error</h2>
          </div>
        </div>
        <div class="modal-body">
          <p>{{ validationMessage }}</p>
        </div>
        <div class="modal-footer">
          <button class="modal-btn proceed-btn" @click="showValidationModal = false">
            OK
          </button>
        </div>
      </div>
    </div>

    <!-- Saved Cards Picker Modal -->
    <div v-if="showSavedCardsModal" class="modal-overlay" @click="closeSavedCardsModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-header-content">
            <i class="fa-solid fa-credit-card modal-icon"></i>
            <h2 class="modal-h2">Choose a saved card</h2>
          </div>
        </div>
        <div class="modal-body">
          <div class="saved-card-list">
            <div v-for="(card, index) in savedCards" :key="index" class="saved-card-row" :class="{ selected: selectedCardIndex === index }">
              <div class="saved-card-left">
                <input type="radio" :id="`modal-saved-${index}`" name="modal-saved-card" :value="index" v-model="selectedCardIndex" class="saved-radio">
                <label :for="`modal-saved-${index}`" class="saved-card-label">
                  <span class="brand visa" v-if="card.brand === 'visa'">VISA</span>
                  <span class="brand mastercard" v-else-if="card.brand === 'mastercard'">MasterCard</span>
                  <span class="saved-card-mask">•••• •••• •••• {{ card.lastFour }}</span>
                  <span class="saved-card-name">{{ card.cardholderName }}</span>
                  <span class="saved-card-exp">Exp {{ card.expiryDate }}</span>
                </label>
              </div>
              <div class="saved-card-actions">
                <button type="button" class="card-action delete" @click="deleteSavedCard(index)">Delete</button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer inline">
          <button class="modal-btn proceed-btn" @click="applySavedCardSelection">Use This Card</button>
          <button class="modal-btn cancel-btn" @click="closeSavedCardsModal">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-header-content">
            <i class="fa-solid fa-triangle-exclamation modal-icon"></i>
            <h2 class="modal-h2">Confirm Deletion</h2>
          </div>
        </div>
        <div class="modal-body">
          <p v-if="deleteMode === 'single' && deleteTargetItem">
            Remove <strong>{{ deleteTargetItem.itemName }}</strong> from your cart?
          </p>
          <p v-else-if="deleteMode === 'selected'">
            Delete <strong>{{ selectedItems.length }}</strong> selected item(s)?
          </p>
          <p v-else-if="deleteMode === 'clear'">
            Are you sure you want to clear your entire cart?
          </p>
        </div>
        <div class="modal-footer inline">
          <button @click="confirmDelete" class="modal-btn proceed-btn">
            <i class="fa-solid fa-check"></i>
            Confirm
          </button>
          <button @click="cancelDelete" class="modal-btn cancel-btn">
            <i class="fa-solid fa-xmark"></i>
            Cancel
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