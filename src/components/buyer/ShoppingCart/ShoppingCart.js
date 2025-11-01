import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '/firebase/config';
import { doc, getDoc, updateDoc, deleteDoc, query, where, getDocs, collection, addDoc, orderBy, limit } from 'firebase/firestore';
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
    const editMode = ref(false);
    const selectedItems = ref([]);
    const showClosedStallsModal = ref(false);
    
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
    
    // Helper function to check if stall is closed
    const isStallClosed = (openingTime, closingTime) => {
      if (!openingTime || !closingTime) return false;
      
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      
      // Parse time string (formats like "09:00", "9:00", "5:00", "0900", with or without spaces)
      const parseTime = (timeStr) => {
        if (typeof timeStr === 'number') {
          // If it's already a number like 930, convert to hours and minutes
          const hours = Math.floor(timeStr / 100);
          const minutes = timeStr % 100;
          return { hours, minutes };
        }
        
        // Trim whitespace and remove colon
        let cleaned = String(timeStr).trim().replace(':', '');
        
        // Handle formats like "5:00" or "500" (should be 05:00)
        if (cleaned.length === 3) {
          cleaned = '0' + cleaned; // "500" becomes "0500"
        } else if (cleaned.length === 2) {
          cleaned = cleaned + '00'; // "05" becomes "0500"
        } else if (cleaned.length === 1) {
          cleaned = '0' + cleaned + '00'; // "5" becomes "0500"
        }
        
        // Pad with zeros if needed (e.g., "900" becomes "0900")
        cleaned = cleaned.padStart(4, '0');
        
        const hours = parseInt(cleaned.substring(0, 2));
        const minutes = parseInt(cleaned.substring(2, 4));
        return { hours, minutes };
      };
      
      const opening = parseTime(openingTime);
      const closing = parseTime(closingTime);
      
      // Convert everything to minutes since midnight for easier comparison
      const currentMinutesSinceMidnight = currentHours * 60 + currentMinutes;
      const openingMinutes = opening.hours * 60 + opening.minutes;
      const closingMinutes = closing.hours * 60 + closing.minutes;
      
      console.log('Time check:', {
        current: `${currentHours}:${String(currentMinutes).padStart(2, '0')}`,
        opening: `${opening.hours}:${String(opening.minutes).padStart(2, '0')}`,
        closing: `${closing.hours}:${String(closing.minutes).padStart(2, '0')}`,
        currentMinutes: currentMinutesSinceMidnight,
        openingMinutes,
        closingMinutes
      });
      
      // Handle cases where closing time is past midnight (e.g., opens at 18:00, closes at 02:00)
      if (closingMinutes < openingMinutes) {
        // Stall is open from opening time through midnight to closing time
        // Closed if current time is after closing AND before opening
        const isClosed = currentMinutesSinceMidnight >= closingMinutes && currentMinutesSinceMidnight < openingMinutes;
        console.log('Overnight stall, isClosed:', isClosed);
        return isClosed;
      } else {
        // Normal case: stall is closed if current time is before opening OR at/after closing
        const isClosed = currentMinutesSinceMidnight < openingMinutes || currentMinutesSinceMidnight >= closingMinutes;
        console.log('Normal hours stall, isClosed:', isClosed);
        return isClosed;
      }
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
          
          // Fetch current stock levels and hawker info for each item
          const updatedItems = await Promise.all(items.map(async (item) => {
            try {
              const itemRef = doc(db, 'itemListings', item.itemId);
              const itemSnap = await getDoc(itemRef);
              
              console.log('Fetching item:', item.itemId);
              
              if (itemSnap.exists()) {
                const itemData = itemSnap.data();
                console.log('Item data:', itemData);
                
                // Fetch hawker information from hawkerListings collection
                let hawkerData = null;
                let isClosed = false;
                let openingTime = null;
                let closingTime = null;
                
                // Check for uid field (this is the hawker ID)
                const hawkerId = itemData.uid || item.uid || itemData.hawkerId || item.hawkerId;
                console.log('Looking for hawker with ID:', hawkerId);
                
                if (hawkerId) {
                  try {
                    // Try to get hawker data from hawkerListings collection
                    // We need to query by userId field
                    const { collection, query, where, getDocs } = await import('firebase/firestore');
                    const hawkerListingsRef = collection(db, 'hawkerListings');
                    const hawkerQuery = query(hawkerListingsRef, where('userId', '==', hawkerId));
                    const hawkerQuerySnap = await getDocs(hawkerQuery);
                    
                    if (!hawkerQuerySnap.empty) {
                      // Get the first matching hawker listing
                      hawkerData = hawkerQuerySnap.docs[0].data();
                      console.log('Hawker data found from hawkerListings:', hawkerData);
                      openingTime = hawkerData.openingTime;
                      closingTime = hawkerData.closingTime;
                      isClosed = isStallClosed(openingTime, closingTime);
                      console.log('Stall closed status:', isClosed);
                    } else {
                      console.log('No hawker listing found for userId:', hawkerId);
                    }
                  } catch (hawkerErr) {
                    console.error(`Error fetching hawker info for item ${item.itemId}:`, hawkerErr);
                  }
                } else {
                  console.log('No hawker uid found in item data');
                }
                
                // Update item with current stock level and closed status
                return {
                  ...item,
                  itemQty: itemData.itemQty,
                  qty: Math.min(item.qty, itemData.itemQty),
                  isClosed: isClosed,
                  openingTime: openingTime,
                  closingTime: closingTime
                };
              }
              return item;
            } catch (err) {
              console.error(`Error fetching stock for item ${item.itemId}:`, err);
              return item;
            }
          }));
          
          cartItems.value = updatedItems;
          console.log('Cart items loaded with current stock levels and stall status:', cartItems.value);
          
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
        const itemPrice = parsePrice(item.itemPrice);
        const price = itemPrice * ((100 - item.discount) / 100);
        return total + (price * item.qty);
      }, 0);
    });

    const hasClosedStalls = computed(() => {
      return cartItems.value.some(item => item.isClosed);
    });

    const closedStallItems = computed(() => {
      return cartItems.value.filter(item => item.isClosed);
    });

    const closedStallsTotal = computed(() => {
      return closedStallItems.value.reduce((total, item) => {
        const itemPrice = parsePrice(item.itemPrice);
        const price = itemPrice * ((100 - item.discount) / 100);
        return total + (price * item.qty);
      }, 0);
    });

    const availableTotal = computed(() => {
      return cartTotal.value - closedStallsTotal.value;
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
      const maxQty = item.itemQty || 0;
      
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
      const maxQty = item.itemQty || 99;
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
    
    // Edit mode functions
    const enterEditMode = () => {
      editMode.value = true;
      selectedItems.value = [];
    };
    
    const cancelEditMode = () => {
      editMode.value = false;
      selectedItems.value = [];
    };
    
    const selectAll = () => {
      if (selectedItems.value.length === cartItems.value.length) {
        // Deselect all
        selectedItems.value = [];
      } else {
        // Select all
        selectedItems.value = cartItems.value.map(item => item.itemId);
      }
    };
    
    const deleteSelected = async () => {
      if (selectedItems.value.length === 0) return;
      
      const itemCount = selectedItems.value.length;
      const confirmMessage = itemCount === 1 
        ? 'Are you sure you want to delete this item?' 
        : `Are you sure you want to delete ${itemCount} items?`;
      
      if (!confirm(confirmMessage)) {
        return;
      }
      
      const updatedItems = cartItems.value.filter(
        item => !selectedItems.value.includes(item.itemId)
      );
      
      await updateCartInFirebase(updatedItems);
      
      // Exit edit mode and clear selections
      editMode.value = false;
      selectedItems.value = [];
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
    
    // Modal functions
    const closeModal = () => {
      showClosedStallsModal.value = false;
    };

    const proceedWithAvailable = async () => {
      showClosedStallsModal.value = false;
      // Remove closed stall items from cart
      const availableItems = cartItems.value.filter(item => !item.isClosed);
      await updateCartInFirebase(availableItems);
      
      // Update cartItems to reflect available items only
      cartItems.value = availableItems;
      
      // Proceed to checkout with available items
      await checkout();
    };
    
    // Get next order ID
    const getNextOrderID = async () => {
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, orderBy('orderID', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          return 1;
        }
        
        const lastOrder = querySnapshot.docs[0].data();
        return (lastOrder.orderID || 0) + 1;
      } catch (error) {
        console.error('Error getting next order ID:', error);
        // Fallback: try without orderBy if index doesn't exist
        try {
          const ordersRef = collection(db, 'orders');
          const querySnapshot = await getDocs(ordersRef);
          if (querySnapshot.empty) {
            return 1;
          }
          const orders = querySnapshot.docs.map(doc => doc.data());
          const maxOrderID = Math.max(...orders.map(o => o.orderID || 0), 0);
          return maxOrderID + 1;
        } catch (fallbackError) {
          console.error('Error in fallback order ID query:', fallbackError);
          return 1;
        }
      }
    };

    // Get hawker address from hawkerListings
    const getHawkerAddress = async (hawkerId) => {
      try {
        const hawkersRef = collection(db, 'hawkerListings');
        const q = query(hawkersRef, where('userId', '==', hawkerId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const hawkerData = querySnapshot.docs[0].data();
          return hawkerData.address || null;
        }
        return null;
      } catch (error) {
        console.error('Error fetching hawker address:', error);
        return null;
      }
    };

    // Format current date and time
    const formatDateTime = () => {
      const now = new Date();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const day = days[now.getDay()];
      const date = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return { day, date, time };
    };

    // Checkout
    const checkout = async () => {
      if (cartItems.value.length === 0) {
        alert('Your cart is empty!');
        return;
      }
      
      // Check if there are closed stalls
      if (hasClosedStalls.value) {
        showClosedStallsModal.value = true;
        return;
      }

      // Filter out closed stall items
      const availableItems = cartItems.value.filter(item => !item.isClosed);
      
      if (availableItems.length === 0) {
        alert('No available items to order. Please check back when stalls are open.');
        return;
      }

      // Get payment method
      const paymentMethodSelect = document.getElementById('payment-method');
      const paymentMethod = paymentMethodSelect ? paymentMethodSelect.value : 'card';

      updating.value = true;
      errorMsg.value = null;

      try {
        // Group items by hawker
        const itemsByHawker = {};
        for (const item of availableItems) {
          const hawkerId = item.hawkerId;
          if (!itemsByHawker[hawkerId]) {
            itemsByHawker[hawkerId] = {
              hawkerId: hawkerId,
              hawkerName: item.hawkerName,
              items: []
            };
          }
          itemsByHawker[hawkerId].items.push(item);
        }

        // Create orders for each hawker
        const { day, date, time } = formatDateTime();
        let currentOrderID = await getNextOrderID();

        for (const hawkerId in itemsByHawker) {
          const hawkerGroup = itemsByHawker[hawkerId];
          const hawkerItems = hawkerGroup.items;

          // Get hawker address
          const hawkerAddress = await getHawkerAddress(hawkerId);
          const formattedAddress = hawkerAddress?.formattedAddress || 'Address not available';

          // Calculate totals
          let subtotalBeforeDiscount = 0;
          let totalDiscount = 0;
          
          const orderItems = hawkerItems.map(item => {
            const itemPrice = parseFloat(item.itemPrice);
            const discount = item.discount || 0;
            const qty = parseInt(item.qty) || 1;
            const discountedPrice = itemPrice * ((100 - discount) / 100);
            const itemTotal = discountedPrice * qty;

            subtotalBeforeDiscount += itemPrice * qty;
            totalDiscount += (itemPrice * qty) - itemTotal;

            return {
              itemName: item.itemName,
              itemPrice: itemPrice,
              discountedPrice: discountedPrice,
              qty: qty,
              imageUrl: item.imageUrl || '',
              itemTotal: itemTotal
            };
          });

          const orderTotal = subtotalBeforeDiscount - totalDiscount;

          // Create order document
          const orderData = {
            orderID: currentOrderID++,
            day: day,
            date: date,
            time: time,
            timestamp: new Date(),
            paymentMethod: paymentMethod,
            status: 'preparing',
            userId: userId.value,
            buyerId: userId.value, // Also include buyerId for compatibility
            hawkerId: hawkerId,
            hawkerName: hawkerGroup.hawkerName,
            hawkerAddress: formattedAddress,
            items: orderItems,
            subtotalBeforeDiscount: subtotalBeforeDiscount,
            discount: totalDiscount,
            orderTotal: orderTotal
          };

          const ordersRef = collection(db, 'orders');
          await addDoc(ordersRef, orderData);
          console.log('Order created successfully:', orderData.orderID);
        }

        // Redirect to order receipt page after successful order creation
        router.push('/order-receipt');
      } catch (error) {
        console.error('Error creating order:', error);
        errorMsg.value = 'Failed to create order. Please try again.';
        alert(`Failed to create order: ${error.message}`);
      } finally {
        updating.value = false;
      }
    };
    
    // Initialize on mount
    onMounted(() => {
      console.log('ShoppingCart component mounted');
      
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
      
      authUnsubscribe.value = onAuthStateChanged(auth, async (user) => {
        console.log('Auth state changed:', user ? user.uid : 'null');
        
        if (user) {
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
      // Reactive state
      cartItems,
      loading,
      updating,
      errorMsg,
      editMode,
      selectedItems,
      showClosedStallsModal,
      
      // Computed properties
      cartCount,
      cartTotal,
      hasClosedStalls,
      closedStallItems,
      closedStallsTotal,
      availableTotal,
      
      // Methods
      goBack,
      incrementItem,
      decrementItem,
      removeItem,
      clearAllItems,
      checkout,
      calculateItemTotal,
      formatPrice,
      validateQuantity,
      updateItemQuantity,
      enterEditMode,
      cancelEditMode,
      selectAll,
      deleteSelected,
      closeModal,
      proceedWithAvailable
    };
  }
};