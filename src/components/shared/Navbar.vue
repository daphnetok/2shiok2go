<template>
  <nav class="navbar navbar-dark bg-dark shadow-sm sticky-top border-bottom border-success">
    <div class="container-fluid">
      <!-- Mobile hamburger button (only visible on small screens) -->
      <button
        class="btn btn-outline-success me-2 d-md-none"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#sidebarNav"
        aria-controls="sidebarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <!-- Brand (always visible) -->
      <router-link class="navbar-brand fw-bold text-success" to="/">
        2Shiok2Go
      </router-link>
      
      <!-- Desktop Navigation Links (hidden on mobile) -->
      <div class="navbar-nav-desktop d-none d-md-flex ms-auto" :class="{ 'has-logout': currentUser }">
        <router-link class="nav-link-desktop" to="/">Home</router-link>
        
        <!-- Show Listing link to all users (customers can browse) -->
        <router-link class="nav-link-desktop" to="/buyer-listings">Listing</router-link>
        
        <!-- Buyers see these links -->
        <template v-if="currentUser && userRole === 'buyer'">
          <router-link class="nav-link-desktop" to="/buyer-dashboard">Profile</router-link>
          <router-link class="nav-link-desktop" to="/checkout">Checkout</router-link>
        </template>
        
        <!-- Hawkers see these links -->
        <template v-if="currentUser && userRole === 'hawker'">
          <router-link class="nav-link-desktop" to="/create-listing">Create Listing</router-link>
          <router-link class="nav-link-desktop" to="/hawker-dashboard">Hawker Dashboard</router-link>
        </template>
        
        <!-- Show login when not authenticated -->
        <router-link v-if="!currentUser" class="nav-link-desktop login-link-desktop" to="/login">
          <i class="fa-solid fa-right-to-bracket me-2"></i>Login
        </router-link>
      </div>
      
      <!-- Desktop Logout Button (center right) -->
      <div v-if="currentUser" class="navbar-logout-desktop d-none d-md-flex">
        <a href="#" @click.prevent="handleLogout" class="logout-button-desktop" aria-label="Logout" title="Logout">
          <i class="fa-solid fa-right-from-bracket me-2"></i>Logout
        </a>
      </div>
    </div>
  </nav>

  <!-- Mobile Side Navigation (only visible on small screens) -->
  <div
    class="offcanvas offcanvas-start d-md-none"
    tabindex="-1"
    id="sidebarNav"
    aria-labelledby="sidebarNavLabel"
  >
    <div class="offcanvas-header">
      <h5 class="offcanvas-title text-success" id="sidebarNavLabel">2Shiok2Go Menu</h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
      <ul class="nav flex-column">
        <li class="nav-item"><router-link class="nav-link" to="/">Home</router-link></li>
        <li class="nav-item"><router-link class="nav-link" to="/buyer-listings">Listing</router-link></li>
        
        <!-- Buyers see these links -->
        <template v-if="currentUser && userRole === 'buyer'">
          <li class="nav-item"><router-link class="nav-link" to="/buyer-dashboard">Profile</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/checkout">Checkout</router-link></li>
        
        </template>
        
        <!-- Hawkers see these links -->
        <template v-if="currentUser && userRole === 'hawker'">
          <li class="nav-item"><router-link class="nav-link" to="/create-listing">Create Listing</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/hawker-dashboard">Hawker Dashboard</router-link></li>
        </template>
        
        <!-- Show login when not authenticated -->
        <li v-if="!currentUser" class="nav-item"><router-link class="nav-link" to="/login">Login</router-link></li>
      </ul>
      
      <!-- Mobile Logout Icon (bottom of nav) -->
      <div v-if="currentUser" class="navbar-logout-mobile">
        <a href="#" @click.prevent="handleLogout" class="logout-icon-mobile" aria-label="Logout" title="Logout">
          <i class="fa-solid fa-right-from-bracket"></i>
          <span>Logout</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { onAuthStateChanged, auth } from '/firebase/auth';
import { logout } from '/firebase/auth';
import { db } from '/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export default {
  name: "Navbar",
  setup() {
    const router = useRouter();
    const currentUser = ref(null);
    const userRole = ref('');
    const isLoading = ref(true);

    // Fetch user role from Firestore
    const fetchUserRole = async (uid) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          return userDoc.data().role;
        }
        return null;
      } catch (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
    };

    // Handle logout
    const handleLogout = async () => {
      try {
        await logout();
        // Close the offcanvas menu by triggering the close button
        const closeButton = document.querySelector('[data-bs-dismiss="offcanvas"]');
        if (closeButton) {
          closeButton.click();
        }
        // Navigate to home page after logout
        router.push('/');
      } catch (error) {
        console.error('Logout error:', error);
      }
    };

    // Listen to auth state changes
    onMounted(() => {
      onAuthStateChanged(auth, async (user) => {
        currentUser.value = user;
        if (user) {
          const role = await fetchUserRole(user.uid);
          userRole.value = role || '';
        } else {
          userRole.value = '';
        }
        isLoading.value = false;
      });
    });

    return {
      currentUser,
      userRole,
      isLoading,
      handleLogout
    };
  }
};
</script>

<style scoped>
.navbar-brand {
  font-size: 1.4rem;
}

/* Desktop Navigation Styles */
.navbar-nav-desktop {
  gap: 1.5rem;
  align-items: center;
}

.navbar-nav-desktop.has-logout {
  margin-right: 7.5rem; /* Space for logout button with text (2rem right + logout text width + padding) */
}

.nav-link-desktop {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.nav-link-desktop:hover {
  color: #198754;
  background-color: rgba(25, 135, 84, 0.1);
}

.nav-link-desktop.router-link-active {
  color: #198754;
  background-color: rgba(25, 135, 84, 0.2);
}

/* Login link styling - white color on desktop */
.login-link-desktop {
  color: rgba(255, 255, 255, 0.85) !important;
}

.login-link-desktop:hover {
  color: #ffffff !important;
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.login-link-desktop i {
  color: rgba(255, 255, 255, 0.85);
}

.login-link-desktop:hover i {
  color: #ffffff;
}

/* Desktop Logout Button */
.navbar-logout-desktop {
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

.logout-button-desktop {
  color: #dc3545;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.logout-button-desktop:hover {
  color: #c82333;
  background-color: rgba(220, 53, 69, 0.1);
}

.logout-button-desktop i {
  color: #dc3545;
  font-size: 1.1rem;
}

.logout-button-desktop:hover i {
  color: #c82333;
}

/* Mobile Navigation Styles */
.offcanvas-body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.nav-link {
  margin-bottom: 1rem;
  color: #198754;
  font-weight: 500;
}

.nav-link.router-link-active {
  background: #e9fbe5;
  color: #145c2a;
  border-radius: 5px;
}

.offcanvas-title {
  font-size: 1.2rem;
}

/* Mobile Logout Icon (bottom of nav) */
.navbar-logout-mobile {
  margin-top: auto;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
}

.logout-icon-mobile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #dc3545;
  text-decoration: none;
  font-weight: 500;
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  width: 100%;
}

.logout-icon-mobile:hover {
  background-color: #fee;
  color: #c82333;
}

.logout-icon-mobile i {
  font-size: 1.2rem;
}

.logout-icon-mobile span {
  font-size: 1rem;
}

/* Navbar container positioning for desktop logout */
.navbar {
  position: relative;
}

/* Responsive adjustments */
@media (max-width: 767.98px) {
  .navbar-nav-desktop,
  .navbar-logout-desktop {
    display: none !important;
  }
  
  .offcanvas-body {
    min-height: calc(100vh - 120px);
  }
}

@media (min-width: 768px) {
  .offcanvas,
  .navbar-logout-mobile {
    display: none !important;
  }
}
</style>
