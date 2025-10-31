import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '/firebase/config';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default {
  name: 'ShoppingCart',
  setup() {
    const router = useRouter();
    const auth = getAuth();
    
    const cartItems = ref([]);
    const loading = ref(true);
    const updating = ref(false);
    const errorMsg = ref(null);
    const userId = ref(null);
    const authUnsubscribe = ref(null);
    
    // Helper function to parse price from various formats
    const parsePrice = (price) => {
      if (typeof price === 'number') {
        return price;
      }
      if (typeof price === 'string') {
        // Remove '$' and any whitespace, then parse
        return parseFloat(price.replace(/[$\s]/g, '')) || 0;
      }
      return 0;
    };
    
    // Helper function to format price for display
    const formatPrice = (price) => {
      if (typeof price === 'string' && price.startsWith('$')) {
        return price;
      }
      const numPrice = parsePrice(price);
      return `$${numPrice.toFixed(2)}`;
    };
    
    // Fetch cart items and current stock levels from Firebase
    const fetchCartItems = async () => {
      if (!userId.value) {
        loading.value = false;
        errorMsg.value = 'Please log in to view your cart';
        return;
      }
      
      loading.value = true;
      errorMsg.value = null;
      
      try {
        console.log('Fetching cart for user:', userId.value);
        const cartRef = doc(db, 'cart', userId.value);
        const cartSnap = await getDoc(cartRef);
        
        if (cartSnap.exists()) {
          const cartData = cartSnap.data();
          let items = cartData.items || [];
          
          // Fetch current stock levels for each item
          const updatedItems = await Promise.all(items.map(async (item) => {
            try {
              const itemRef = doc(db, 'itemListings', item.itemId);
              const itemSnap = await getDoc(itemRef);
              if (itemSnap.exists()) {
                const itemData = itemSnap.data();
                // Update item with current stock level
                return {
                  ...item,
                  itemQty: itemData.itemQty,
                  // Adjust quantity if it exceeds current stock
                  qty: Math.min(item.qty, itemData.itemQty)
                };
              }
              return item;
            } catch (err) {
              console.error(`Error fetching stock for item ${item.itemId}:`, err);
              return item;
            }
          }));
          
          cartItems.value = updatedItems;
          console.log('Cart items loaded with current stock levels:', cartItems.value);
          
          // If any quantities were adjusted, update the cart
          if (updatedItems.some((item, i) => item.qty !== items[i].qty)) {
            await updateCartInFirebase(updatedItems);
          }
        } else {
          cartItems.value = [];
          console.log('No cart found for user');
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        errorMsg.value = 'Failed to load cart. Please try again.';
      } finally {
        loading.value = false;
      }
    };
    
    // Computed properties
    const cartCount = computed(() => {
      return cartItems.value.reduce((total, item) => total + item.qty, 0);
    });
    
    const cartTotal = computed(() => {
      return cartItems.value.reduce((total, item) => {
        // Calculate price after discount
        const itemPrice = parsePrice(item.itemPrice);
        const price = itemPrice * ((100 - item.discount) / 100);

        return total + (price * item.qty);
      }, 0);
    });

    // Calculate individual item total
    const calculateItemTotal = (item) => {
      const itemPrice = parsePrice(item.itemPrice);
      const price = itemPrice * ((100 - item.discount) / 100);

      return (price * item.qty).toFixed(2);
    };

    
    // Update cart in Firebase
    const updateCartInFirebase = async (updatedItems) => {
      if (!userId.value) return;
      
      updating.value = true;
      
      try {
        const cartRef = doc(db, 'cart', userId.value);
        
        if (updatedItems.length === 0) {
          // If no items left, delete the cart document
          await deleteDoc(cartRef);
          console.log('Cart document deleted (no items remaining)');
        } else {
          await updateDoc(cartRef, {
            items: updatedItems,
            updatedAt: new Date()
          });
          console.log('Cart updated successfully');
        }
        
        cartItems.value = updatedItems;
      } catch (error) {
        console.error('Error updating cart:', error);
        errorMsg.value = 'Failed to update cart. Please try again.';
        // Refresh cart on error to ensure sync
        await fetchCartItems();
      } finally {
        updating.value = false;
      }
    };
    
    // Validate and update quantity
    const validateQuantity = (item) => {
      let qty = parseInt(item.qty);
      const maxQty = item.itemQty || 0; // Use actual stock level or 0 if not set
      
      // Ensure quantity is a valid number between 1 and stock level
      if (isNaN(qty) || qty < 1) {
        item.qty = 1;
      } else if (maxQty > 0 && qty > maxQty) {
        item.qty = maxQty;
      } else {
        item.qty = qty;
      }
    };

    // Update quantity from input
    const updateItemQuantity = async (item) => {
      validateQuantity(item);
      const updatedItems = cartItems.value.map(cartItem => {
        if (cartItem.itemId === item.itemId) {
          return { ...cartItem, qty: parseInt(item.qty) };
        }
        return cartItem;
      });
      await updateCartInFirebase(updatedItems);
    };

    // Increment item quantity
    const incrementItem = async (item) => {
      const maxQty = item.itemQty || 99; // Default to 99 if itemQty not set
      if (item.qty >= maxQty) return;
      
      const updatedItems = cartItems.value.map(cartItem => {
        if (cartItem.itemId === item.itemId) {
          const newQty = parseInt(cartItem.qty || 0) + 1;
          return { ...cartItem, qty: Math.min(newQty, maxQty) };
        }
        return cartItem;
      });
      await updateCartInFirebase(updatedItems);
    };
    
    // Decrement item quantity
    const decrementItem = async (item) => {
      const currentQty = parseInt(item.qty || 0);
      if (currentQty <= 1) return;
      
      const updatedItems = cartItems.value.map(cartItem => {
        if (cartItem.itemId === item.itemId) {
          const newQty = parseInt(cartItem.qty || 0) - 1;
          return { ...cartItem, qty: Math.max(newQty, 1) };
        }
        return cartItem;
      });
      await updateCartInFirebase(updatedItems);
    };
    
    // Remove item from cart
    const removeItem = async (item) => {
      if (!confirm(`Remove ${item.itemName} from cart?`)) {
        return;
      }
      
      const updatedItems = cartItems.value.filter(cartItem => cartItem.itemId !== item.itemId);
      await updateCartInFirebase(updatedItems);
    };
    
    // Clear all items
    const clearAllItems = async () => {
      if (!confirm('Are you sure you want to clear your cart?')) {
        return;
      }
      
      if (!userId.value) return;
      
      updating.value = true;
      
      try {
        const cartRef = doc(db, 'cart', userId.value);
        await deleteDoc(cartRef);
        cartItems.value = [];
        console.log('Cart cleared');
      } catch (error) {
        console.error('Error clearing cart:', error);
        errorMsg.value = 'Failed to clear cart. Please try again.';
      } finally {
        updating.value = false;
      }
    };
    
    // Navigation
    const goBack = () => {
      router.go(-1);
    };
    
    // Checkout
    const checkout = () => {
      if (cartItems.value.length === 0) {
        alert('Your cart is empty!');
        return;
      }
      
      console.log('Proceeding to checkout with items:', cartItems.value);

      // You can navigate to checkout page here
      // router.push('/checkout');
    };
    
    // Initialize on mount
    onMounted(() => {
      console.log('ShoppingCart component mounted');
      
      // Check current auth state immediately
      const currentUser = auth.currentUser;
      if (currentUser) {
        console.log('User already authenticated:', currentUser.uid);
        userId.value = currentUser.uid;
        fetchCartItems();
      } else {
        console.log('No user authenticated on mount');
        loading.value = false;
        errorMsg.value = 'Please log in to view your cart';
      }
      
      // Also listen for auth state changes
      authUnsubscribe.value = onAuthStateChanged(auth, async (user) => {
        console.log('Auth state changed:', user ? user.uid : 'null');
        
        if (user) {
          // Only fetch if userId changed
          if (userId.value !== user.uid) {
            userId.value = user.uid;
            await fetchCartItems();
          }
        } else {
          userId.value = null;
          loading.value = false;
          errorMsg.value = 'Please log in to view your cart';
          cartItems.value = [];
        }
      });
    });
    
    // Cleanup on unmount
    onUnmounted(() => {
      if (authUnsubscribe.value) {
        authUnsubscribe.value();
      }
    });
    
    return {
      cartItems,
      cartCount,
      cartTotal,
      loading,
      updating,
      errorMsg,
      goBack,
      incrementItem,
      decrementItem,
      removeItem,
      clearAllItems,
      checkout,
      calculateItemTotal,
      formatPrice,
      validateQuantity,
      updateItemQuantity
    };
  }
};