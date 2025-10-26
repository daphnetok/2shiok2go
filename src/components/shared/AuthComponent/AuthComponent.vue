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
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
            required
            :disabled="loading"
            minlength="6"
          />
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
          <button type="submit" class="btn btn-primary" :disabled="loading">
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
        <div v-if="successView" class="manual-toggle">
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
      <button @click="handleSignOut" class="btn btn-danger">
        Sign Out
      </button>
      <button @click="goToDashboard" class="btn btn-primary" :disabled="!userRole">
        Go to Dashboard
      </button>
    </section>
  </div>
</template>

<script src="./AuthComponent.js">
export default {
  name: 'AuthComponent',
};
</script>

<style scoped>
.auth-component {
  padding: 20px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  text-align: center;
}

.modal-content h3 {
  margin-bottom: 20px;
}

.modal-content button {
  margin: 10px;
  padding: 12px 24px;
  font-size: 16px;
}

.user-info {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.email-form {
  margin-bottom: 0;
}

.form-group{
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-weight: 500;
  font-size: 14px;
}

.form-group input, .form-group select {
  width: 75%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: #4285f4;
}

button {
  margin: 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-google {
  background: white;
  color: #444;
  border: 1px solid #ddd;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 8px;
}

.btn-primary {
  background: #4285f4;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.error-message {
  color: #dc3545;
  margin-bottom: 10px;
  padding: 10px;
  background: #f8d7da;
  border-radius: 4px;
}

.success-message {
  color: #28a745;
  font-weight: 500;
  margin-bottom: 10px;
  padding: 10px;
  background: #d4edda;
  border-radius: 4px;
}

.manual-toggle {
  margin-top: 10px;
}
</style>