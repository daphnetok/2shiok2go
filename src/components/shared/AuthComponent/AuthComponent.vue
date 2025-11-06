<template>
  <div class="auth-component">
    <div v-if="showRoleModal" class="modal">
      <div class="modal-content">
        <h3>Select your role</h3>
        <button @click="handleRoleSelect('buyer')" :disabled="loading">Buyer</button>
        <button @click="handleRoleSelect('hawker')" :disabled="loading">Hawker</button>
      </div>
    </div>
    <!-- When signed out -->
    <section v-if="!user || successView">
      <!-- Error message -->
       <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
       </div>
      <!-- Success message -->
        <div v-if="successMessage && successView" class="success-message">
          {{ successMessage }}
        </div>
      <!-- Sign up form -->
      <form v-if="!successView" @submit.prevent="handleEmailAuth" class='email-form'>
        <div v-if="!isLogin" class="form-group">
          <label for="displayName">Name</label>
          <input 
            id="displayName"
            v-model="displayName"
            type="text"
            placeholder="Enter your name"
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email"
            required
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-input-wrapper">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              required
              :disabled="loading"
              minlength="6"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
              :disabled="loading"
              tabindex="-1"
            >
              <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
            </button>
          </div>
        </div>
        <div v-if='!isLogin' class="form-group">
          <label for="role">Role</label>
          <select id="role" v-model="role" :disabled="loading" required>
            <option disabled value="">Select your role</option>
            <option value="buyer">Buyer</option>
            <option value="hawker">Hawker</option>
          </select>
        </div>
        <div class="button-group">
          <button type="submit" class="btn btn-login" :disabled="loading">
            {{ loading ? 'Processing...' : (isLogin ? 'Log in' : 'Sign up') }}
          </button>
          <button type="button" @click="googleSignIn" class="btn btn-google" :disabled="loading">
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            {{ isLogin ? 'Log in with Google' : 'Sign up with Google' }}
          </button>
        </div>
      </form>
      <div class="toggle-auth">
        <!-- automatically toggles if user is on sign up/log in page -->
        <p v-if="!successView">
          {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
          <a href="#" @click.prevent="toggleMode">
            {{ isLogin ? 'Sign up here' : 'Log in here' }}
          </a>
        </p>
        <!-- directs user to log in page after signing up -->
        <div v-if="successView && !loading" class="manual-toggle">
          <button class="btn btn-secondary" @click="handleProceedToLogin">
            Proceed to Log in
          </button>    
        </div>
      </div>
    </section>

    <!-- When signed in -->
    <section v-else-if="user && !successView">
      <div class="user-info">
        <h3>Welcome, {{ user.displayName }}!</h3>
        <h2>Role: {{ userRole || 'Loading...' }}</h2>
        <p>{{ user.email }}</p>
      </div>
      <div class="signed-in-actions">
        <button @click="handleSignOut" class="btn btn-danger">
          Sign Out
        </button>
        <button @click="handleRedirect" class="btn btn-primary" :disabled="!userRole">
          {{ userRole === 'buyer' ? 'Start browsing now!' : 'Go to Dashboard' }}
        </button>
      </div>
    </section>
  </div>
</template>

<script src="./AuthComponent.js">
export default {
  name: 'AuthComponent',
};
</script>

<style>
@import './AuthComponent.css';
</style>