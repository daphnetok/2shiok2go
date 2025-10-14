// src/composables/useCart.js
import { reactive, computed } from 'vue';

const cartState = reactive({
  items: []
});

export function useCart() {
  const cartItems = computed(() => cartState.items);
  
  const cartCount = computed(() => 
    cartState.items.reduce((total, item) => total + item.count, 0)
  );
  
  const cartTotal = computed(() => 
    cartState.items.reduce((total, item) => {
      const discountedPrice = parseFloat(item.price) * 0.8;
      return total + (discountedPrice * item.count);
    }, 0)
  );

  const addToCart = (item) => {
    const existingItem = cartState.items.find(i => 
      i.itemName === item.itemName && i.hawkerName === item.hawkerName
    );
    
    if (existingItem) {
      existingItem.count = item.count;
    } else {
      cartState.items.push({ ...item });
    }
  };

  const updateItemCount = ({ itemName, hawkerName, count }) => {
    const item = cartState.items.find(i => 
      i.itemName === itemName && i.hawkerName === hawkerName
    );
    
    if (item) {
      if (count <= 0) {
        cartState.items = cartState.items.filter(i => 
          !(i.itemName === itemName && i.hawkerName === hawkerName)
        );
      } else {
        item.count = count;
      }
    }
  };

  const removeFromCart = ({ itemName, hawkerName }) => {
    cartState.items = cartState.items.filter(item => 
      !(item.itemName === itemName && item.hawkerName === hawkerName)
    );
  };

  const clearCart = () => {
    cartState.items = [];
  };

  return {
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    updateItemCount,
    removeFromCart,
    clearCart
  };
}