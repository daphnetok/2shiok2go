import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '/firebase/config';
import { doc, getDoc, updateDoc, deleteDoc, query, where, getDocs, collection, addDoc, orderBy, limit, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { updateStockAfterOrder } from '/firebase/firestore';
import { runTransaction } from 'firebase/firestore';
import ItemModal from '@/components/buyer/StallListing/ItemModal.vue';
import CartHeader from './CartHeader/CartHeader.vue';
import EmptyCart from './EmptyCart/EmptyCart.vue';
import { syncThemeFromStorage, BUYER_THEME_KEY } from '@/utils/theme';

export default {
  name: 'ShoppingCart',
  components: {
    ItemModal,
    CartHeader,
    EmptyCart
  },
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
    const showValidationModal = ref(false);
    const validationMessage = ref('');
    const showSavedCardsModal = ref(false);
    // Delete confirmation modal state
    const showDeleteModal = ref(false);
    const deleteMode = ref(null); // 'single' | 'selected' | 'clear'
    const deleteTargetItem = ref(null);

    // Item modal state
    const showItemModal = ref(false);
    const selectedCartItem = ref(null);

    
    // Card information state
    const savedCards = ref([]);
    const cardSelection = ref('new');
    const selectedCardIndex = ref(0);
    const saveCardForFuture = ref(false);
    // editing removed
    const newCard = ref({
      cardholderName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: ''
    });
    
    // Card validation state
    const cardNumberError = ref(null);
    const fieldErrors = ref({
      cardholderName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: ''
    });
    const touchedFields = ref({
      cardholderName: false,
      cardNumber: false,
      expiryDate: false,
      cvv: false
    });
    const cardBrand = computed(() => {
      const digits = newCard.value.cardNumber.replace(/\s/g, '');
      if (!digits) return null;
      if (digits.startsWith('4')) return 'visa';
      if (digits.startsWith('5')) return 'mastercard';
      return null;
    });
        
    
    // Helper function to parse price from various formats
    const parsePrice = (price) => {
      if (typeof price === 'number') {
        return isNaN(price) || !isFinite(price) ? 0 : price;
      }
      if (typeof price === 'string') {
        // Remove '$' and any whitespace, then parse
        const cleaned = price.replace(/[$\s]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
      }
      return 0;
    };
    
    // Helper function to safely parse number (for quantity, discount, etc.)
    const safeParseNumber = (value, defaultValue = 0) => {
      if (typeof value === 'number') {
        return isNaN(value) || !isFinite(value) ? defaultValue : value;
      }
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) || !isFinite(parsed) ? defaultValue : parsed;
      }
      return defaultValue;
    };
    
    // Helper function to format price for display
    const formatPrice = (price) => {
      if (typeof price === 'string' && price.startsWith('$')) {
        return price;
      }
      const numPrice = parsePrice(price);
      const safePrice = isNaN(numPrice) || !isFinite(numPrice) ? 0 : numPrice;
      return `$${safePrice.toFixed(2)}`;
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
    
    // Format card number with spaces and validate first digit (Visa/MasterCard)
    const formatCardNumber = (event) => {
      let value = event.target.value.replace(/\D/g, '');
      const formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
      newCard.value.cardNumber = formattedValue;
       
      // Live validation of starting digit
      if (value.length === 0) {
        cardNumberError.value = null;
      } else if (!(value.startsWith('4') || value.startsWith('5'))) {
        cardNumberError.value = 'Invalid Card Number: Use Visa or MasterCard';
      } else {
        cardNumberError.value = null;
      }
      
      // Clear error when user starts typing
      if (value.length > 0) {
        fieldErrors.value.cardNumber = '';
      }
    };

    // Format expiry date
    const formatExpiryDate = (event) => {
      let value = event.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
      newCard.value.expiryDate = value;
      
      // Clear error when user starts typing
      if (value.length > 0) {
        fieldErrors.value.expiryDate = '';
      }
    };

    // Format CVV (numbers only)
    const formatCVV = (event) => {
      newCard.value.cvv = event.target.value.replace(/\D/g, '');
      
      // Clear error when user starts typing
      if (newCard.value.cvv.length > 0) {
        fieldErrors.value.cvv = '';
      }
    };

    // Validate individual fields on blur
    const validateCardholderName = () => {
      touchedFields.value.cardholderName = true;
      if (!newCard.value.cardholderName.trim()) {
        fieldErrors.value.cardholderName = 'Please enter cardholder name';
      } else {
        fieldErrors.value.cardholderName = '';
      }
    };

    const validateCardNumber = () => {
      touchedFields.value.cardNumber = true;
      const cardNumber = newCard.value.cardNumber.replace(/\s/g, '');
      
      if (cardNumber.length === 0) {
        fieldErrors.value.cardNumber = 'Please enter a card number';
      } else if (cardNumber.length < 13 || cardNumber.length > 19) {
        fieldErrors.value.cardNumber = 'Please enter a valid card number (13-19 digits)';
      } else if (!(cardNumber.startsWith('4') || cardNumber.startsWith('5'))) {
        fieldErrors.value.cardNumber = 'Invalid card: Use Visa or MasterCard';
      } else {
        fieldErrors.value.cardNumber = '';
      }
    };

    const validateExpiryDate = () => {
      touchedFields.value.expiryDate = true;
      const expiryDate = newCard.value.expiryDate;
      const expiryParts = expiryDate.split('/');
      
      if (expiryDate.length === 0) {
        fieldErrors.value.expiryDate = 'Please enter an expiry date';
      } else if (expiryParts.length !== 2 || expiryParts[0].length !== 2 || expiryParts[1].length !== 2) {
        fieldErrors.value.expiryDate = 'Please enter a valid expiry date (MM/YY)';
      } else {
        const month = parseInt(expiryParts[0], 10);
        const year = 2000 + parseInt(expiryParts[1], 10);
        if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
          fieldErrors.value.expiryDate = 'Please enter a valid expiry month (01-12)';
        } else {
          const now = new Date();
          const currentYear = now.getFullYear();
          const currentMonth = now.getMonth() + 1;
          if (year < currentYear || (year === currentYear && month <= currentMonth)) {
            fieldErrors.value.expiryDate = 'Card has expired. Use a future expiry date.';
          } else {
            fieldErrors.value.expiryDate = '';
          }
        }
      }
    };

    const validateCVV = () => {
      touchedFields.value.cvv = true;
      if (newCard.value.cvv.length === 0) {
        fieldErrors.value.cvv = 'Please enter a CVV';
      } else if (newCard.value.cvv.length !== 3) {
        fieldErrors.value.cvv = 'Please enter a valid CVV (3 digits)';
      } else {
        fieldErrors.value.cvv = '';
      }
    };

    // Fetch saved cards from Firebase
    const fetchSavedCards = async () => {
      if (!userId.value) return;
      
      try {
        const userRef = doc(db, 'users', userId.value);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          savedCards.value = userData.cardInfo || [];
          
          // Set default selection
          if (savedCards.value.length > 0) {
            cardSelection.value = 'saved';
            selectedCardIndex.value = 0;
          }
        }
      } catch (error) {
        console.error('Error fetching saved cards:', error);
      }
    };

    // Save card to Firebase
    const saveCardToFirebase = async () => {
      if (!userId.value || !saveCardForFuture.value) return;
      
      try {
        const userRef = doc(db, 'users', userId.value);
        const cardData = {
          cardholderName: newCard.value.cardholderName,
          lastFour: newCard.value.cardNumber.replace(/\s/g, '').slice(-4),
          expiryDate: newCard.value.expiryDate,
          brand: cardBrand.value,
          addedAt: new Date()
        };
        
        // Get current cards or initialize empty array
        const userSnap = await getDoc(userRef);
        let currentCards = [];
        
        if (userSnap.exists()) {
          currentCards = userSnap.data().cardInfo || [];
        }
        
        // Add new card
        currentCards.push(cardData);
        
        // Update or create user document
        await updateDoc(userRef, {
          cardInfo: currentCards
        }).catch(async () => {
          // If document doesn't exist, create it
          await setDoc(userRef, {
            cardInfo: currentCards
          }, { merge: true });
        });
        
        console.log('Card saved successfully');
        savedCards.value = currentCards;
      } catch (error) {
        console.error('Error saving card:', error);
      }
    };

    const deleteSavedCard = async (index) => {
      if (!userId.value) return;
      try {
        const userRef = doc(db, 'users', userId.value);
        const userSnap = await getDoc(userRef);
        let currentCards = [];
        if (userSnap.exists()) {
          currentCards = userSnap.data().cardInfo || [];
        }
        currentCards.splice(index, 1);
        await updateDoc(userRef, { cardInfo: currentCards }).catch(async () => {
          await setDoc(userRef, { cardInfo: currentCards }, { merge: true });
        });
        savedCards.value = currentCards;
        if (selectedCardIndex.value >= currentCards.length) {
          selectedCardIndex.value = 0;
        }
      } catch (err) {
        console.error('Error deleting saved card:', err);
        validationMessage.value = 'Failed to delete saved card. Please try again.';
        showValidationModal.value = true;
      }
    };

    // edit card flow removed

    const openSavedCardsModal = () => {
      showSavedCardsModal.value = true;
    };

    const closeSavedCardsModal = () => {
      showSavedCardsModal.value = false;
    };

    const applySavedCardSelection = () => {
      // Keep selectedCardIndex as chosen in the modal
      cardSelection.value = 'saved';
      showSavedCardsModal.value = false;
    };

    // Validate card information
    const validateCardInfo = () => {
      if (cardSelection.value === 'saved') {
        // Using saved card: basic presence check
        if (savedCards.value.length === 0) {
          validationMessage.value = 'Please select a saved card or add a new card.';
          showValidationModal.value = true;
          return false;
        }
        return true;
      }
      
      // Mark all fields as touched to show errors
      touchedFields.value.cardholderName = true;
      touchedFields.value.cardNumber = true;
      touchedFields.value.expiryDate = true;
      touchedFields.value.cvv = true;
      
      // Validate all fields
      validateCardholderName();
      validateCardNumber();
      validateExpiryDate();
      validateCVV();
      
      // Check if there are any errors
      const hasErrors = Object.values(fieldErrors.value).some(error => error !== '');
      
      if (hasErrors) {
        // Scroll to first error field
        const firstErrorField = document.querySelector('.field-error');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return false;
      }
      
      return true;
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
                
                // Update item with current stock level, sold-out and closed status
                const currentQty = parseInt(itemData.itemQty || 0);
                const isSoldOut = currentQty <= 0;
                return {
                  ...item,
                  // Update price information from database
                  itemPrice: itemData.itemPrice || item.itemPrice,
                  discount: itemData.discount || item.discount || 0,
                  discountedPrice: itemData.discountedPrice || item.discountedPrice,
                  discountTime: itemData.discountTime || item.discountTime,
                  // Update stock and availability
                  itemQty: currentQty,
                  qty: isSoldOut ? 0 : Math.min(parseInt(item.qty || 0), currentQty),
                  isClosed: isClosed,
                  isSoldOut: isSoldOut,
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
          
          // If any quantities were adjusted (including sold-out -> 0), update the cart
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
      return cartItems.value.reduce((total, item) => {
        const qty = safeParseNumber(item.qty, 0);
        return total + qty;
      }, 0);
    });
    
    const cartTotal = computed(() => {
      return cartItems.value.reduce((total, item) => {
        const itemPrice = parsePrice(item.itemPrice);
        const discount = safeParseNumber(item.discount, 0);
        const qty = safeParseNumber(item.qty, 0);
        
        // Check if discount should be applied based on discount time
        const shouldApplyDiscount = isDiscountApplied(item) && discount > 0;
        
        let price;
        if (shouldApplyDiscount) {
          price = itemPrice * ((100 - discount) / 100);
        } else {
          price = itemPrice;
        }
        
        const itemTotal = price * qty;
        const finalTotal = isNaN(itemTotal) || !isFinite(itemTotal) ? 0 : itemTotal;
        return total + finalTotal;
      }, 0);
    });

    const hasClosedStalls = computed(() => {
      return cartItems.value.some(item => item.isClosed);
    });

    const closedStallItems = computed(() => {
      return cartItems.value.filter(item => item.isClosed);
    });

    const hasSoldOutItems = computed(() => {
      return cartItems.value.some(item => item.isSoldOut);
    });

    const soldOutItems = computed(() => {
      return cartItems.value.filter(item => item.isSoldOut);
    });

    const closedStallsTotal = computed(() => {
      return closedStallItems.value.reduce((total, item) => {
        const itemPrice = parsePrice(item.itemPrice);
        const discount = safeParseNumber(item.discount, 0);
        const qty = safeParseNumber(item.qty, 0);
        
        // Check if discount should be applied based on discount time
        const shouldApplyDiscount = isDiscountApplied(item) && discount > 0;
        
        let price;
        if (shouldApplyDiscount) {
          price = itemPrice * ((100 - discount) / 100);
        } else {
          price = itemPrice;
        }
        
        const itemTotal = price * qty;
        const finalTotal = isNaN(itemTotal) || !isFinite(itemTotal) ? 0 : itemTotal;
        return total + finalTotal;
      }, 0);
    });

    // Unavailable = closed or sold-out
    const hasUnavailableItems = computed(() => {
      return cartItems.value.some(item => item.isClosed || item.isSoldOut);
    });

    const unavailableItems = computed(() => {
      return cartItems.value.filter(item => item.isClosed || item.isSoldOut);
    });

    const unavailableTotal = computed(() => {
      return unavailableItems.value.reduce((total, item) => {
        const itemPrice = parsePrice(item.itemPrice);
        const discount = safeParseNumber(item.discount, 0);
        const qty = safeParseNumber(item.qty, 0);
        
        // Check if discount should be applied based on discount time
        const shouldApplyDiscount = isDiscountApplied(item) && discount > 0;
        
        let price;
        if (shouldApplyDiscount) {
          price = itemPrice * ((100 - discount) / 100);
        } else {
          price = itemPrice;
        }
        
        const itemTotal = price * qty;
        const finalTotal = isNaN(itemTotal) || !isFinite(itemTotal) ? 0 : itemTotal;
        return total + finalTotal;
      }, 0);
    });

    const availableTotal = computed(() => {
      const cart = isNaN(cartTotal.value) || !isFinite(cartTotal.value) ? 0 : cartTotal.value;
      const unavailable = isNaN(unavailableTotal.value) || !isFinite(unavailableTotal.value) ? 0 : unavailableTotal.value;
      const result = cart - unavailable;
      return isNaN(result) || !isFinite(result) ? 0 : result;
    });

    // Calculate discounted price for a single item (checking discount time)
    const calculateDiscountedPrice = (item) => {
      const itemPrice = parsePrice(item.itemPrice);
      const discount = safeParseNumber(item.discount, 0);
      
      // Check if discount should be applied based on discount time
      const shouldApplyDiscount = isDiscountApplied(item) && discount > 0;
      
      if (shouldApplyDiscount) {
        const discountedPrice = itemPrice * ((100 - discount) / 100);
        return isNaN(discountedPrice) || !isFinite(discountedPrice) ? itemPrice : discountedPrice;
      }
      
      return itemPrice;
    };

    // Calculate individual item total
    const calculateItemTotal = (item) => {
      const itemPrice = parsePrice(item.itemPrice);
      const discount = safeParseNumber(item.discount, 0);
      const qty = safeParseNumber(item.qty, 0);
      
      // Check if discount should be applied based on discount time
      const shouldApplyDiscount = isDiscountApplied(item) && discount > 0;
      
      let price;
      if (shouldApplyDiscount) {
        price = itemPrice * ((100 - discount) / 100);
      } else {
        price = itemPrice;
      }
      
      const itemTotal = price * qty;
      const finalTotal = isNaN(itemTotal) || !isFinite(itemTotal) ? 0 : itemTotal;
      return finalTotal.toFixed(2);
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
      let qty = safeParseNumber(item.qty, 1);
      const maxQty = safeParseNumber(item.itemQty, 0);
      
      if (qty < 1) {
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
          return { ...cartItem, qty: safeParseNumber(item.qty, 1) };
        }
        return cartItem;
      });
      await updateCartInFirebase(updatedItems);
    };

    // Increment item quantity
    const incrementItem = async (item) => {
      const maxQty = safeParseNumber(item.itemQty, 99);
      const currentQty = safeParseNumber(item.qty, 0);
      if (currentQty >= maxQty) return;
      
      const updatedItems = cartItems.value.map(cartItem => {
        if (cartItem.itemId === item.itemId) {
          const newQty = safeParseNumber(cartItem.qty, 0) + 1;
          return { ...cartItem, qty: Math.min(newQty, maxQty) };
        }
        return cartItem;
      });
      await updateCartInFirebase(updatedItems);
    };
    
    // Decrement item quantity
    const decrementItem = async (item) => {
      const currentQty = safeParseNumber(item.qty, 0);
      if (currentQty <= 1) return;
      
      const updatedItems = cartItems.value.map(cartItem => {
        if (cartItem.itemId === item.itemId) {
          const newQty = safeParseNumber(cartItem.qty, 0) - 1;
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
    
    const deleteSelected = () => {
      if (selectedItems.value.length === 0) return;
      deleteMode.value = 'selected';
      deleteTargetItem.value = null;
      showDeleteModal.value = true;
    };
    
    // Remove item from cart
    const removeItem = (item) => {
      deleteMode.value = 'single';
      deleteTargetItem.value = item;
      showDeleteModal.value = true;
    };
    
    // Clear all items
    const clearAllItems = () => {
      deleteMode.value = 'clear';
      deleteTargetItem.value = null;
      showDeleteModal.value = true;
    };

    // Perform delete after confirmation
    const confirmDelete = async () => {
      try {
        if (deleteMode.value === 'single' && deleteTargetItem.value) {
          const updatedItems = cartItems.value.filter(cartItem => cartItem.itemId !== deleteTargetItem.value.itemId);
          await updateCartInFirebase(updatedItems);
        } else if (deleteMode.value === 'selected') {
          const updatedItems = cartItems.value.filter(
            item => !selectedItems.value.includes(item.itemId)
          );
          await updateCartInFirebase(updatedItems);
          editMode.value = false;
          selectedItems.value = [];
        } else if (deleteMode.value === 'clear') {
          if (!userId.value) return;
          updating.value = true;
          try {
            const cartRef = doc(db, 'cart', userId.value);
            await deleteDoc(cartRef);
            cartItems.value = [];
          } finally {
            updating.value = false;
          }
        }
      } catch (err) {
        console.error('Error performing delete:', err);
        errorMsg.value = 'Failed to delete items. Please try again.';
      } finally {
        showDeleteModal.value = false;
        deleteMode.value = null;
        deleteTargetItem.value = null;
      }
    };

    const cancelDelete = () => {
      showDeleteModal.value = false;
      deleteMode.value = null;
      deleteTargetItem.value = null;
    };
    
    // Navigation
    const goBack = () => {
      router.go(-1);
    };
    
    // Modal functions
    const closeModal = () => {
      showClosedStallsModal.value = false;
    };

    // Item modal functions
    const openItemModal = (item) => {
      if (editMode.value) return; // Don't open modal in edit mode
      
      // Convert cart item to format expected by ItemModal
      const modalItem = {
        id: item.itemId,
        itemName: item.itemName,
        itemPrice: item.itemPrice,
        itemQty: item.itemQty || 0,
        discount: item.discount || 0,
        discountTime: item.discountTime || null,
        imageUrl: item.imageUrl || '',
        description: item.description || '',
        count: item.qty || 0,
        notes: item.notes || '',
        isClosed: item.isClosed || false,
        isSoldOut: item.isSoldOut || false
      };
      
      selectedCartItem.value = modalItem;
      showItemModal.value = true;
    };

    const closeItemModal = () => {
      showItemModal.value = false;
      selectedCartItem.value = null;
    };

    const handleCartItemUpdate = async (data) => {
      if (!data || !data.item || data.quantity === 0) {
        // If quantity is 0, remove from cart
        const updatedItems = cartItems.value.filter(cartItem => cartItem.itemId !== data.item.id);
        await updateCartInFirebase(updatedItems);
        closeItemModal();
        return;
      }

      // Update cart item with new quantity and notes
      const updatedItems = cartItems.value.map(cartItem => {
        if (cartItem.itemId === data.item.id) {
          return {
            ...cartItem,
            qty: data.quantity,
            notes: data.notes || ''
          };
        }
        return cartItem;
      });

      await updateCartInFirebase(updatedItems);
      closeItemModal();
    };

    // Check if discount is applied for an item (used by ItemModal)
    const isDiscountApplied = (item) => {
      if (!item || !item.discountTime) return false;
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [hours, minutes] = item.discountTime.split(':');
      const discountStart = parseInt(hours) * 60 + parseInt(minutes);
      return currentTime >= discountStart;
    };

    const proceedWithAvailable = async () => {
      showClosedStallsModal.value = false;
      // Remove unavailable items from cart
      const availableItems = cartItems.value.filter(item => !item.isClosed && !item.isSoldOut);
      await updateCartInFirebase(availableItems);
      
      // Update cartItems to reflect available items only
      cartItems.value = availableItems;
      
      // Proceed to checkout with available items
      await checkout();
    };
    
    // Get next order ID
    // const getNextOrderID = async () => {
    //   const counterRef = doc(db, 'meta', 'orderCounter');
    //   return await runTransaction(db, async (transaction) => {
    //     const counterSnap = await transaction.get(counterRef);
    //     let newOrderID = 1;
    //     if (counterSnap.exists()) {
    //       newOrderID = (counterSnap.data().lastOrderID || 0) + 1;
    //       transaction.update(counterRef, { lastOrderID: newOrderID });
    //     } else {
    //       transaction.set(counterRef, { lastOrderID: 1 });
    //     }
    //     return newOrderID;
    //   });
    // };


    const getNextOrderID = () => {
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${month}${day}${year.slice(-2)}`;

    // Use HHmmss (6 digits)
    const timePart = String(now.getHours()).padStart(2, '0') +
                    String(now.getMinutes()).padStart(2, '0') +
                    String(now.getSeconds()).padStart(2, '0');

    // Add 2 random digits 
    const randomPart = Math.floor(Math.random() * 90 + 10); // 10–99

    // Combine
    return `${today}-${timePart}${randomPart}`;
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

    const revalidateStockLevels = async (itemsToCheck) => {
      if (!itemsToCheck || itemsToCheck.length === 0) {
        return { success: true };
      }

      const updatedItems = cartItems.value.map(item => ({ ...item }));
      const outOfStockItems = [];
      const adjustedItems = [];

      await Promise.all(itemsToCheck.map(async (item) => {
        try {
          const itemRef = doc(db, 'itemListings', item.itemId);
          const itemSnap = await getDoc(itemRef);
          const cartIndex = updatedItems.findIndex(cartItem => cartItem.itemId === item.itemId);

          if (cartIndex === -1) {
            return;
          }

          if (!itemSnap.exists()) {
            outOfStockItems.push(item.itemName);
            updatedItems[cartIndex] = {
              ...updatedItems[cartIndex],
              itemQty: 0,
              qty: 0,
              isSoldOut: true
            };
            return;
          }

          const itemData = itemSnap.data();
          const currentQty = parseInt(itemData.itemQty ?? 0, 10);
          const safeCurrentQty = isNaN(currentQty) ? 0 : currentQty;

          updatedItems[cartIndex] = {
            ...updatedItems[cartIndex],
            itemQty: safeCurrentQty,
            itemPrice: itemData.itemPrice ?? updatedItems[cartIndex].itemPrice,
            discount: itemData.discount ?? updatedItems[cartIndex].discount,
            discountedPrice: itemData.discountedPrice ?? updatedItems[cartIndex].discountedPrice
          };

          if (safeCurrentQty <= 0) {
            outOfStockItems.push(item.itemName);
            updatedItems[cartIndex] = {
              ...updatedItems[cartIndex],
              qty: 0,
              isSoldOut: true
            };
            return;
          }

          updatedItems[cartIndex] = {
            ...updatedItems[cartIndex],
            isSoldOut: false
          };

          const currentQtyInCart = safeParseNumber(updatedItems[cartIndex].qty, 0);
          if (currentQtyInCart > safeCurrentQty) {
            adjustedItems.push({
              name: item.itemName,
              available: safeCurrentQty
            });
            updatedItems[cartIndex] = {
              ...updatedItems[cartIndex],
              qty: safeCurrentQty
            };
          }
        } catch (err) {
          console.error(`Error revalidating stock for item ${item.itemId}:`, err);
        }
      }));

      const hasChanges = outOfStockItems.length > 0 || adjustedItems.length > 0;
      if (hasChanges) {
        await updateCartInFirebase(updatedItems);
        cartItems.value = updatedItems;
      }

      if (outOfStockItems.length > 0) {
        const message = outOfStockItems.length === 1
          ? `Sorry, ${outOfStockItems[0]} is now out of stock. We've updated your cart.`
          : `Sorry, the following items are now out of stock: ${outOfStockItems.join(', ')}. We've updated your cart.`;
        return { success: false, message };
      }

      if (adjustedItems.length > 0) {
        const message = adjustedItems.length === 1
          ? `${adjustedItems[0].name} only has ${adjustedItems[0].available} left. We've updated your cart.`
          : `Some item quantities have been updated based on current stock. Please review your cart before checking out.`;
        return { success: false, message };
      }

      return { success: true };
    };

    // Checkout
    const checkout = async () => {
      if (cartItems.value.length === 0) {
        validationMessage.value = 'Your cart is empty!';
        showValidationModal.value = true;
        return;
      }
      
      // Validate card information FIRST (before checking unavailable items)
      if (!validateCardInfo()) {
        return;
      }
      
      // Check if there are unavailable (closed or sold-out) items AFTER card validation
      if (hasUnavailableItems.value) {
        showClosedStallsModal.value = true;
        return;
      }
      
      // Filter out unavailable items
      let availableItems = cartItems.value.filter(item => !item.isClosed && !item.isSoldOut);
      
      if (availableItems.length === 0) {
        validationMessage.value = 'No available items to order. Please check back when stalls are open.';
        showValidationModal.value = true;
        return;
      }

      const stockCheck = await revalidateStockLevels(availableItems);
      if (!stockCheck.success) {
        validationMessage.value = stockCheck.message || 'Stock levels have changed. Please review your cart before placing the order.';
        showValidationModal.value = true;
        return;
      }

      // Refresh available items in case quantities changed
      availableItems = cartItems.value.filter(item => !item.isClosed && !item.isSoldOut && safeParseNumber(item.qty, 0) > 0);

      if (availableItems.length === 0) {
        validationMessage.value = 'All selected items are now unavailable. Please review your cart.';
        showValidationModal.value = true;
        return;
      }
      
      // Get payment method
      const paymentMethodSelect = document.getElementById('payment-method');
      const paymentMethod = paymentMethodSelect ? paymentMethodSelect.value : 'card';
      
      updating.value = true;
      errorMsg.value = null;
      
      try {
        // Save card if user opted to
        if (cardSelection.value === 'new' && saveCardForFuture.value) {
          await saveCardToFirebase();
        }
        
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
        
        // Get current date/time once
        const { day, date, time } = formatDateTime();
        const timestamp = new Date();
        
        // Get starting order ID
        // let currentOrderID = await getNextOrderID();
        // Generate timestamp-based order ID
        let currentOrderID = getNextOrderID();
        
        // Generate a checkout group ID to link all orders from this checkout
        const checkoutGroupId = `checkout_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        // Create all orders
        const orderPromises = [];
        const createdOrderIds = []; // Track created order document IDs
        
        for (const hawkerId in itemsByHawker) {
          // Generate a unique order ID for each hawker group
          currentOrderID = getNextOrderID();

          const hawkerGroup = itemsByHawker[hawkerId];
          const hawkerItems = hawkerGroup.items;
          
          // Get hawker address
          const hawkerAddress = await getHawkerAddress(hawkerId);
          const formattedAddress = hawkerAddress?.formattedAddress || 'Address not available';
          
          // Calculate totals
          let subtotalBeforeDiscount = 0;
          let totalDiscount = 0;
          
          const orderItems = hawkerItems.map(item => {
            const itemPrice = parsePrice(item.itemPrice);
            const discount = safeParseNumber(item.discount, 0);
            const qty = safeParseNumber(item.qty, 1);
            
            // Check if discount should be applied based on discount time
            const shouldApplyDiscount = isDiscountApplied(item) && discount > 0;
            
            let discountedPrice;
            if (shouldApplyDiscount) {
              discountedPrice = itemPrice * ((100 - discount) / 100);
            } else {
              discountedPrice = itemPrice;
            }
            
            const itemTotal = discountedPrice * qty;
            
            const safeItemPrice = isNaN(itemPrice) || !isFinite(itemPrice) ? 0 : itemPrice;
            const safeQty = isNaN(qty) || !isFinite(qty) ? 1 : qty;
            const safeDiscountedPrice = isNaN(discountedPrice) || !isFinite(discountedPrice) ? safeItemPrice : discountedPrice;
            const safeItemTotal = isNaN(itemTotal) || !isFinite(itemTotal) ? safeItemPrice * safeQty : itemTotal;
            
            subtotalBeforeDiscount += safeItemPrice * safeQty;
            totalDiscount += (safeItemPrice * safeQty) - safeItemTotal;
            
            return {
              itemName: item.itemName,
              itemPrice: safeItemPrice,
              discountedPrice: safeDiscountedPrice,
              qty: safeQty,
              imageUrl: item.imageUrl || '',
              itemTotal: safeItemTotal,
              requirements: item.notes || ''
            };
          });
          
          const safeSubtotal = isNaN(subtotalBeforeDiscount) || !isFinite(subtotalBeforeDiscount) ? 0 : subtotalBeforeDiscount;
          const safeDiscount = isNaN(totalDiscount) || !isFinite(totalDiscount) ? 0 : totalDiscount;
          const orderTotal = safeSubtotal - safeDiscount;
          
          // Create order document
          const orderData = {
            orderID: currentOrderID, // Use current ID
            day: day,
            date: date,
            time: time,
            timestamp: timestamp, // Use same timestamp for all orders
            createdAt: timestamp, // Add createdAt field
            paymentMethod: paymentMethod,
            status: 'preparing', 
            userId: userId.value,
            hawkerId: hawkerId,
            hawkerName: hawkerGroup.hawkerName,
            hawkerAddress: formattedAddress,
            items: orderItems,
            subtotalBeforeDiscount: safeSubtotal,
            discount: safeDiscount,
            orderTotal: isNaN(orderTotal) || !isFinite(orderTotal) ? 0 : orderTotal,
            checkoutGroupId: checkoutGroupId, // Link orders from same checkout
            // notes: item.notes || '',
          };
          
          // Add to order creation promises
          const ordersRef = collection(db, 'orders');
          const orderDocRef = await addDoc(ordersRef, orderData);
          createdOrderIds.push(orderDocRef.id); // Store the document ID
          
          // Update stock for each item
          hawkerItems.forEach(item => {
            orderPromises.push(updateStockAfterOrder(item.itemId, item.qty));
          });
          
          console.log('Order created with ID:', orderDocRef.id, 'OrderID:', orderData.orderID);
          
          // Increment for next hawker's order
          // currentOrderID++;
          currentOrderID = getNextOrderID();

        }
        
        // Wait for all stock updates to complete
        await Promise.all(orderPromises);
        console.log('All orders created and stock updated successfully');
        
        // Clear cart after successful checkout
        const cartRef = doc(db, 'cart', userId.value);
        await deleteDoc(cartRef);
        cartItems.value = [];
        
        // Redirect to order receipt page with all order IDs
        if (createdOrderIds.length > 0) {
          // Pass all order IDs as query parameter
          const orderIdsParam = createdOrderIds.join(',');
          router.push({
            path: `/order-receipt/${createdOrderIds[0]}`,
            query: { 
              orderIds: orderIdsParam,
              checkoutGroupId: checkoutGroupId
            }
          });
        } else {
          // Fallback to just order-receipt if no orders created (shouldn't happen)
          router.push('/order-receipt');
        }
        
      } catch (error) {
        console.error('Error creating order:', error);
        errorMsg.value = 'Failed to create order. Please try again.';
        validationMessage.value = `Failed to create order: ${error.message}`;
        showValidationModal.value = true;
      } finally {
        updating.value = false;
      }
    };

    // Watch for modal visibility to lock/unlock body scroll
    watch([showItemModal, showClosedStallsModal, showValidationModal, showSavedCardsModal, showDeleteModal], 
      ([itemModal, closedModal, validationModal, savedCardsModal, deleteModal]) => {
        const anyModalOpen = itemModal || closedModal || validationModal || savedCardsModal || deleteModal;
        if (anyModalOpen) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = 'auto';
        }
      }
    );

    // Initialize on mount
    onMounted(() => {
      console.log('ShoppingCart component mounted');
      syncThemeFromStorage(BUYER_THEME_KEY);
      
      const currentUser = auth.currentUser;
      if (currentUser) {
        console.log('User already authenticated:', currentUser.uid);
        userId.value = currentUser.uid;
        fetchCartItems();
        fetchSavedCards();
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
            await fetchSavedCards();
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
      // Restore body scroll in case modal was still open
      document.body.style.overflow = 'auto';
      
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
      showValidationModal,
      validationMessage,
      
      // Card state
      savedCards,
      cardSelection,
      selectedCardIndex,
      saveCardForFuture,
      newCard,
      
      // Computed properties
      cartCount,
      cartTotal,
      hasClosedStalls,
      closedStallItems,
      closedStallsTotal,
      availableTotal,
      hasSoldOutItems,
      soldOutItems,
      hasUnavailableItems,
      unavailableItems,
      unavailableTotal,
      
      // Methods
      goBack,
      incrementItem,
      decrementItem,
      removeItem,
      clearAllItems,
      checkout,
      calculateItemTotal,
      calculateDiscountedPrice,
      formatPrice,
      parsePrice,
      validateQuantity,
      updateItemQuantity,
      safeParseNumber,
      // Helper function for template calculations
      safeCalculateOriginalPrice: () => {
        return cartItems.value.reduce((total, item) => {
          const itemPrice = parsePrice(item.itemPrice);
          const qty = safeParseNumber(item.qty, 0);
          const itemTotal = itemPrice * qty;
          const finalTotal = isNaN(itemTotal) || !isFinite(itemTotal) ? 0 : itemTotal;
          return total + finalTotal;
        }, 0);
      },
      safeCalculateDiscount: () => {
        const original = cartItems.value.reduce((total, item) => {
          const itemPrice = parsePrice(item.itemPrice);
          const qty = safeParseNumber(item.qty, 0);
          const itemTotal = itemPrice * qty;
          const finalTotal = isNaN(itemTotal) || !isFinite(itemTotal) ? 0 : itemTotal;
          return total + finalTotal;
        }, 0);
        const cart = isNaN(cartTotal.value) || !isFinite(cartTotal.value) ? 0 : cartTotal.value;
        const discount = original - cart;
        return isNaN(discount) || !isFinite(discount) ? 0 : discount;
      },
      // Safe toFixed wrapper
      safeToFixed: (value, decimals = 2) => {
        const num = typeof value === 'number' ? value : parsePrice(value);
        const safeNum = isNaN(num) || !isFinite(num) ? 0 : num;
        return safeNum.toFixed(decimals);
      },
      enterEditMode,
      cancelEditMode,
      selectAll,
      deleteSelected,
      closeModal,
      proceedWithAvailable,
      // Delete confirmation modal
      showDeleteModal,
      deleteMode,
      deleteTargetItem,
      confirmDelete,
      cancelDelete,
      formatCardNumber,
      formatExpiryDate,
      formatCVV,
      validateCardholderName,
      validateCardNumber,
      validateExpiryDate,
      validateCVV,
      fieldErrors,
      touchedFields,
      cardBrand,
      cardNumberError,
      // Saved card CRUD
      deleteSavedCard,
      // Saved card modal
      showSavedCardsModal,
      openSavedCardsModal,
      closeSavedCardsModal,
      applySavedCardSelection,
      // Validation modal
      showValidationModal,
      validationMessage,
      // Delete confirmation modal
      showDeleteModal,
      deleteMode,
      deleteTargetItem,
      confirmDelete,
      cancelDelete,
      // Item modal
      showItemModal,
      selectedCartItem,
      openItemModal,
      closeItemModal,
      handleCartItemUpdate,
      isDiscountApplied
    };
  }
};