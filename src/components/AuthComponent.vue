<template>
<div class="auth-component">
    <!-- When signed out -->
    <section v-if="!user">
      <button @click="handleSignIn" class="btn btn-primary">
        Sign in with Google
      </button>
    </section>

    <!-- When signed in -->
    <section v-else>
      <div class="user-info">
        <!-- <img :src="user.photoURL" :alt="user.displayName" class="profile-pic"> -->
        <h3>Welcome, {{ user.displayName }}!</h3>
        <p>{{ user.email }}</p>
      </div>
      <button @click="handleSignOut" class="btn btn-danger">
        Sign Out
      </button>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { auth } from '@/firebase/config'
import { signInWithGoogle, logout } from '@/firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'

const user = ref(null)

onMounted(() => {
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser
  })
})

const handleSignIn = async () => {
  try {
    await signInWithGoogle()
  } catch (error) {
    alert('Sign in failed: ' + error.message)
  }
}

const handleSignOut = async () => {
  try {
    await logout()
  } catch (error) {
    alert('Sign out failed: ' + error.message)
  }
}
</script>

<style scoped>
.auth-component {
  padding: 20px;
}

.profile-pic {
  width: 80px;
  border-radius: 50%;
  margin: 10px 0;
}

.user-info {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

button {
  margin: 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-primary {
  background: #4285f4;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}
</style>