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
  <router-link class="navbar-brand fw-bold text-success" to="/" style="margin-left: 1.5rem;">
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
            <router-link class="nav-link-desktop" to="/cart">
              <i class="fa-solid fa-cart-shopping"></i>
            </router-link>
  </template>
  
  <!-- Hawkers see these links -->
  <template v-if="currentUser && userRole === 'hawker'">
  <router-link class="nav-link-desktop" to="/hawker-dashboard">Hawker Dashboard</router-link>
  </template>
  
  <!-- Show login when not authenticated -->
          <router-link v-if="!currentUser" class="nav-link-desktop login-link-desktop" to="/login">
            <i class="fa-solid fa-right-to-bracket me-2"></i>Login
          </router-link>
  
  <!-- Desktop Logout Button (integrated into flex container) -->
  <a v-if="currentUser" href="#" @click.prevent="handleLogout" class="logout-button-desktop" aria-label="Logout" title="Logout">
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
            <li class="nav-item">
              <router-link class="nav-link" to="/cart">
                <i class="fa-solid fa-cart-shopping me-2"></i>Cart
              </router-link>
            </li>
          
  </template>
  
  <!-- Hawkers see these links -->
  <template v-if="currentUser && userRole === 'hawker'">
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
  /* Navbar Base Styles */
  .navbar {
    position: relative;
    padding: 0.75rem 0;
    backdrop-filter: blur(10px);
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%) !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  }
  
  .container-fluid {
    padding: 0 1.5rem;
  }
  
  .navbar-brand {
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transition: all 0.3s ease;
    margin-left: 0 !important;
  }
  
  .navbar-brand:hover {
    transform: scale(1.05);
  }
  
  /* Hamburger Button - Enhanced */
  .btn-outline-success {
    border: 2px solid #10b981;
    color: #10b981;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    transition: all 0.3s ease;
    background: transparent;
  }
  
  .btn-outline-success:hover {
    background: #10b981;
    border-color: #10b981;
    color: white;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
  
  .btn-outline-success:focus {
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
  }
  
  /* Desktop Navigation Styles */
  .navbar-nav-desktop {
    gap: 0.5rem;
    align-items: center;
    margin-right: 0;
  }
  
  .navbar-nav-desktop.has-logout {
    /* Logout button integrated - no additional styling needed */
    gap: 0.5rem;
  }
  
  .nav-link-desktop {
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    font-weight: 500;
    padding: 0.625rem 1rem;
    border-radius: 8px;
    transition: all 0.3s ease;
    white-space: nowrap;
    font-size: 0.95rem;
    position: relative;
  }
  
  .nav-link-desktop::after {
    content: '';
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
    transition: width 0.3s ease;
  }
  
  .nav-link-desktop:hover {
    color: #10b981;
    background-color: rgba(16, 185, 129, 0.1);
    transform: translateY(-1px);
  }
  
  .nav-link-desktop:hover::after {
    width: 70%;
  }
  
  .nav-link-desktop.router-link-active {
    color: #10b981;
    background-color: rgba(16, 185, 129, 0.15);
  }
  
  .nav-link-desktop.router-link-active::after {
    width: 70%;
  }
  
  /* Cart Icon Styling */
  .nav-link-desktop i.fa-cart-shopping {
    font-size: 1.2rem;
  }
  
  /* Login link styling - white color on desktop */
  .login-link-desktop {
    color: rgba(255, 255, 255, 0.9) !important;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .login-link-desktop:hover {
    color: #ffffff !important;
    background: rgba(16, 185, 129, 0.15) !important;
    border-color: #10b981 !important;
    transform: translateY(-1px);
  }
  
  .login-link-desktop:hover::after {
    width: 0;
  }
  
  .login-link-desktop i {
    color: rgba(255, 255, 255, 0.9);
  }
  
  .login-link-desktop:hover i {
    color: #10b981;
  }
  
  /* Desktop Logout Button (integrated into navbar-nav-desktop) */
  .logout-button-desktop {
    color: #ef4444;
    text-decoration: none;
    font-weight: 500;
    padding: 0.625rem 1rem;
    border-radius: 8px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
  }
  
  .logout-button-desktop:hover {
    color: #dc2626;
    background-color: rgba(239, 68, 68, 0.2);
    border-color: #ef4444;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
  }
  
  .logout-button-desktop i {
    color: #ef4444;
    font-size: 1.1rem;
  }
  
  .logout-button-desktop:hover i {
    color: #dc2626;
  }
  
  /* Mobile Offcanvas Styles */
  .offcanvas {
    background: linear-gradient(180deg, #f8fdf9 0%, #ffffff 100%);
    box-shadow: -4px 0 32px rgba(16, 185, 129, 0.1);
    border-left: 3px solid #10b981;
    border-radius: 0 20px 20px 0;
  }
  
  .offcanvas-header {
    padding: 2rem 1.5rem 1.5rem 1.5rem;
    border-bottom: 2px solid #d1fae5;
    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
    border-radius: 0 20px 0 0;
    position: relative;
  }
  
  .offcanvas-header::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 40%;
    height: 2px;
    background: linear-gradient(90deg, #10b981 0%, transparent 100%);
  }
  
  .offcanvas-title {
    font-size: 1.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 0.5px;
  }
  
  .btn-close {
    filter: none;
    opacity: 0.7;
    transition: all 0.2s ease;
  }
  
  .btn-close:hover {
    opacity: 1;
    transform: scale(1.1);
  }
  
  /* Mobile Navigation Styles */
  .offcanvas-body {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1.5rem;
    background: linear-gradient(180deg, transparent 0%, rgba(209, 250, 229, 0.1) 100%);
  }
  
  .nav {
    gap: 0.75rem;
  }
  
  .nav-item {
    width: 100%;
  }
  
  .nav-link {
    margin-bottom: 0;
    color: #1f2937;
    font-weight: 600;
    padding: 1.125rem 1.5rem;
    border-radius: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid transparent;
    background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    display: flex;
    align-items: center;
    position: relative;
    overflow: hidden;
  }
  
  .nav-link::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 4px;
    background: linear-gradient(180deg, #10b981 0%, #059669 100%);
    transform: scaleY(0);
    transition: transform 0.3s ease;
  }
  
  .nav-link:hover {
    color: #059669;
    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
    border-color: #a7f3d0;
    transform: translateX(8px);
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.15);
  }
  
  .nav-link:hover::before {
    transform: scaleY(1);
  }
  
  .nav-link.router-link-active {
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    color: #065f46;
    border-color: #6ee7b7;
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.25);
    font-weight: 700;
    transform: translateX(4px);
  }
  
  .nav-link.router-link-active::before {
    transform: scaleY(1);
  }
  
  .nav-link i {
    color: #10b981;
    font-size: 1.2rem;
    min-width: 24px;
  }
  
  /* Mobile Logout Icon (bottom of nav) */
  .navbar-logout-mobile {
    margin-top: auto;
    padding-top: 2rem;
    border-top: 2px solid #d1fae5;
    position: relative;
  }
  
  .navbar-logout-mobile::before {
    content: '';
    position: absolute;
    top: -2px;
    left: 0;
    width: 40%;
    height: 2px;
    background: linear-gradient(90deg, #ef4444 0%, transparent 100%);
  }
  
  .logout-icon-mobile {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #dc2626;
    text-decoration: none;
    font-weight: 700;
    padding: 1.125rem 1.5rem;
    border-radius: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    width: 100%;
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    border: 2px solid #fca5a5;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);
    position: relative;
    overflow: hidden;
  }
  
  .logout-icon-mobile::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 4px;
    background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
    transform: scaleY(0);
    transition: transform 0.3s ease;
  }
  
  .logout-icon-mobile:hover {
    background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
    color: #991b1b;
    border-color: #f87171;
    transform: translateX(8px);
    box-shadow: 0 4px 16px rgba(239, 68, 68, 0.25);
  }
  
  .logout-icon-mobile:hover::before {
    transform: scaleY(1);
  }
  
  .logout-icon-mobile i {
    font-size: 1.3rem;
    min-width: 24px;
  }
  
  .logout-icon-mobile span {
    font-size: 1.05rem;
  }
  
  /* Responsive adjustments */
  @media (max-width: 767.98px) {
    .navbar-nav-desktop {
      display: none !important;
    }
    
    .offcanvas-body {
      min-height: calc(100vh - 120px);
    }
    
    .navbar-brand {
      font-size: 1.35rem;
    }
    
    .container-fluid {
      padding: 0 1rem;
    }
  }
  
  @media (min-width: 768px) and (max-width: 991.98px) {
    .navbar-nav-desktop {
      gap: 0.35rem;
    }
    
    .nav-link-desktop {
      padding: 0.5rem 0.75rem;
      font-size: 0.9rem;
    }
    
    .logout-button-desktop {
      padding: 0.5rem 0.75rem;
      font-size: 0.9rem;
    }
    
    .login-link-desktop {
      padding: 0.5rem 0.75rem;
      font-size: 0.9rem;
    }
    
    .container-fluid {
      padding: 0 1rem;
    }
  }
  
  @media (min-width: 768px) {
    .offcanvas,
    .navbar-logout-mobile {
      display: none !important;
    }
  }
  
  @media (min-width: 992px) {
    .navbar-nav-desktop {
      gap: 0.75rem;
    }
  }
  </style>