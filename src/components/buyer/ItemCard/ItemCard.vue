<template>
  <div 
    class="item-card" 
    @click="isStallOpen && item.itemQty > 0 ? handleCardClick() : null" 
    :class="{ 'disabled': !isStallOpen || item.itemQty === 0 }"
  >
    <div class="img-container">
      <ImageWithLoader 
        :src="item.imageUrl" 
        :alt="item.itemName"
        image-class="foodImg"
        error-icon="fas fa-utensils"
      />
      <!-- Sold Out Tag - now positioned in top right corner -->
      <span v-if="item.itemQty === 0" class="sold-out-text">SOLD OUT</span>
      <!-- Dimmed overlay for sold out items -->
      <div v-if="item.itemQty === 0" class="sold-out-overlay"></div>
      
      <div 
        v-else 
        class="counter-btn"
        :class="{ 'square': localHover, 'has-quantity': item.count > 0, 'disabled': !isStallOpen }"
        @mouseenter="localHover = true"
        @mouseleave="localHover = false"
        @click.stop="isStallOpen ? handleIncrement() : null"
      >
        <template v-if="item.count === 0">
          <span v-if="!localHover">+</span>
          <div v-else class="hover-controls">
            <button @click.stop="handleDecrement()" disabled>-</button>
            <span>0</span>
            <button @click.stop="handleIncrement()" :disabled="item.count >= item.itemQty">+</button>
          </div>
        </template>
        <template v-else>
          <div v-if="localHover" class="hover-controls">
            <button @click.stop="handleDecrement()">-</button>
            {{ item.count }}
            <button @click.stop="handleIncrement()" :disabled="item.count >= item.itemQty">+</button>
          </div>
          <span v-else>{{ item.count }}</span>
        </template>
      </div>
    </div>

    <div class="card-content">
      <div class="d-flex flex-column w-100">
        <div class="d-flex justify-content-between align-items-center">
          <span class="item-name">{{ item.itemName }}</span>
          <!-- show original price if discount applied -->
          <span class="original-price" v-if="isDiscountApplied">${{ item.itemPrice }}</span>
        </div>
        
        <!-- Tags and Allergens -->
        <div class="tags-container mt-2">
          <span v-for="tag in item.tags" :key="tag" class="tag dietary-tag">
            {{ tag }}
          </span>
          <span v-for="allergen in item.allergens" :key="allergen" class="tag allergen-tag">
            <i class="fa-solid fa-triangle-exclamation"></i> {{ allergen }}
          </span>
        </div>
        
        <div class="d-flex justify-content-between align-items-center mt-2">
          <span class="item-stock">Quantity left: <span :class="{ 'low-stock': item.itemQty <= 5 }">{{ item.itemQty }}</span></span>
          <span class="discounted-price">${{ isDiscountApplied 
                                                ? (item.discountedPrice).toFixed(2)
                                                : item.itemPrice.toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./ItemCard.js"></script>

<style>
@import './ItemCard.css';
</style>