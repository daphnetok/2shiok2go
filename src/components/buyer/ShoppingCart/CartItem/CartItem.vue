<template>
  <div 
    class="cart-item" 
    :class="{ 'edit-mode': editMode, 'stall-closed': (item.isClosed || item.isSoldOut) }"
  >
    <!-- Unavailable overlay badge -->
    <div v-if="item.isClosed || item.isSoldOut" class="closed-badge">
      <i class="fa-solid fa-lock"></i>
      <span>{{ item.isClosed ? 'Stall Closed' : 'Sold Out' }}</span>
    </div>

    <div v-if="editMode" class="item-checkbox">
      <input 
        type="checkbox" 
        :id="`checkbox-${item.itemId}`"
        :value="item.itemId"
        :checked="isSelected"
        @change="$emit('toggle-select', item.itemId)"
        class="checkbox-input"
      />
      <label :for="`checkbox-${item.itemId}`" class="checkbox-label"></label>
    </div>
    <div class="item-image">
      <img :src="item.imageUrl || require('@/assets/img/stall.jpg')" :alt="item.itemName"/>
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
        <span class="original-price">${{ originalPrice }}</span>
        <span class="discounted-price">${{ itemTotal }}</span>
      </div>
    </div>
    <div class="item-controls">
      <div class="quantity-control">
        <button 
          @click="$emit('decrement', item)" 
          class="qty-btn minus" 
          :disabled="updating || parseInt(item.qty) <= 1 || editMode || item.isClosed || item.isSoldOut">
          <i class="fa-solid fa-minus" :class="{ 'disabled': parseInt(item.qty) <= 1 }"></i>
        </button>
        <input 
          type="number" 
          :value="item.qty" 
          class="quantity" 
          :min="1" 
          :max="item.itemQty || 99"
          @change="$emit('update-quantity', item)"
          @input="$emit('validate-quantity', item)"
          :disabled="editMode || item.isClosed || item.isSoldOut">
        <button 
          @click="$emit('increment', item)" 
          class="qty-btn plus" 
          :disabled="updating || parseInt(item.qty) >= (item.itemQty || 99) || editMode || item.isClosed || item.isSoldOut">
          <i class="fa-solid fa-plus" :class="{ 'disabled': parseInt(item.qty) >= (item.itemQty || 99) }"></i>
        </button>
      </div>
      <div class="item-total">${{ itemTotal }}</div>
    </div>
  </div>
</template>

<script src="./CartItem.js"></script>

<style>
@import './CartItem.css';
</style>

