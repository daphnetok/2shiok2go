<template>
  
  <div class="container">
        <div class="row">
            <StallListing :search-query="searchQuery" @search="handleSearch"/>
        </div>
  </div>

<!-- Floating Cart Button -->
<FloatingCartButton v-if="showCartButton" />

</template>

<script>
import StallListing from '../components/buyer/StallListing/StallListing.vue';
import FloatingCartButton from '../components/shared/FloatingCartButton.vue';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '/firebase/config';
import { syncThemeFromStorage, BUYER_THEME_KEY, HAWKER_THEME_KEY } from '@/utils/theme';

export default { 
  name: "BuyerListings",
  components: {
    StallListing,
    FloatingCartButton
  },
  data() {
    return {
      searchQuery: '',
      currentUser: null,
      userRole: '',
      roleCheckComplete: false,
      unsubscribeAuth: null
    };
  },
  computed: {
    showCartButton() {
      return this.roleCheckComplete && this.userRole !== 'hawker';
    }
  },
  methods: {
    handleSearch(query) {
      this.searchQuery = query;
    },
    applyThemeForRole() {
      if (this.userRole === 'hawker') {
        syncThemeFromStorage(HAWKER_THEME_KEY);
      } else {
        syncThemeFromStorage(BUYER_THEME_KEY);
      }
    }
  },
  created() {
    this.unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;

      try {
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          this.userRole = userDoc.exists() ? userDoc.data().role || '' : '';
        } else {
          this.userRole = '';
        }
      } catch (error) {
        console.error('Error determining user role for buyer view:', error);
        this.userRole = '';
      } finally {
        this.applyThemeForRole();
        this.roleCheckComplete = true;
      }
    });
  },
  beforeUnmount() {
    if (typeof this.unsubscribeAuth === 'function') {
      this.unsubscribeAuth();
    }
  },
  mounted() {
    syncThemeFromStorage(BUYER_THEME_KEY, { respectExisting: true });
  }
};
</script>

<style scoped>
.checkout-fab {
  position: fixed;
  left: 100px;
  bottom: 30px;
  z-index: 1000;
  text-decoration: none;
}
.checkout-fab .btn {
  border-radius: 50px;
  padding: 16px 28px;
  font-size: 1.1rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.13);
}


</style>
