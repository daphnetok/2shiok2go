<template>

  <!-- Alert Box -->
    <div class="custom-alert-container" v-if="alert.show" :class="alert.type">
      <div class="custom-alert-content">
        <!-- Close Button for Success/Error -->
        <button v-if="alert.type === 'success' || alert.type === 'error'" class="alert-close-btn" @click="closeAlert">
          <i class="fas fa-times"></i>
        </button>
        <h5>{{ alert.actionType }}</h5>
        <span class="alert-icon" v-if="alert.type !== 'confirmation'">
          <i v-if="alert.type === 'success'" class="fas fa-check-circle"></i>
          <i v-else-if="alert.type === 'error'" class="fas fa-exclamation-circle"></i>
        </span>
        <p class="alert-message" v-if="alert.type !== 'confirmation'">{{ alert.message }}</p>
        
        <!-- Confirmation Buttons -->
         <p v-else class="alert-message">{{ alert.message }}</p>
        <div v-if="alert.type === 'confirmation'" class="confirmation-buttons">
          <button class="btn-cancel" @click="confirmationCancel">Cancel</button>
          <button v-if="alert.actionType === 'Delete'" class="btn-delete" @click="confirmationConfirm">Delete</button>
          <button v-else class="btn-confirm" @click="confirmationConfirm">Confirm</button>
        </div>
        
      </div>
    </div>
    
  <main>
    <h2>Hawker Dashboard</h2>

    <nav class="navbar navbar-expand bg-body-tertiary">
      <div class="container-fluid">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="nav-link active-link" aria-current="page" href="#">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#"><font-awesome-icon icon="list" class="fa-lg px-1"/>Orders</a>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/hawker-analytics">
              <font-awesome-icon icon="chart-simple" class="fa-lg px-1"/>Dashboard
            </router-link>
          </li>
        </ul>
      </div>
    </nav>

  <!-- active listings -->
  <div>
    <div class="d-flex justify-content-end">
      <router-link to="/create-listing" class="btn btn-success mb-3 ">+ Create a New Listing</router-link></div>
    <div class="row active mb-5">
      <h2>Active Listings</h2>
      <p v-if="activeListings.length === 0" class="text-secondary">No active listings yet</p>
      
      <div v-else class="w-100">
        <div class="card mb-3" v-for="listing of activeListings" :key="listing.id">
          <div class="row g-0" style="align-items: center;">
            <div class="col-4 col-md-2 list-img-container">
              <img :src="listing.imageUrl" class="object-fit-cover rounded">
            </div>
            <div class="col-8 col-md-5">
              <div class="card-body">
                <h5 class="card-title">{{ listing.itemName }}</h5>
                <h5 class="card-text">${{ listing.discountedPrice }}</h5>
                <h5 class="card-text"><s>${{ listing.itemPrice }}</s></h5>
              </div>
            </div>
            <div class="col-12 col-md-5">
              <div class="card-body">
                <div class="row g-2 align-items-center">
                  <div class="col-6 col-md-4">
                    <h6 class="card-title mb-1">Stock: {{ listing.itemQty }}</h6>
                    <h6 class="card-title">Orders: {{ listing.orders || 0 }}</h6>
                  </div>
                  <div class="col-6 col-md-8 text-end">
                    <button class="btn p-2 position-relative" @click="editListing(listing.id)">
                      <p class="hide">Edit</p>
                      <font-awesome-icon icon="edit" class="fa-lg icon-green"/>
                    </button>
                    <button class="btn p-2 position-relative" @click="deactivateListing(listing.id)">
                      <p class="hide">Unlist</p>
                      <font-awesome-icon icon="circle-minus" class="fa-lg icon-green"/>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- show form if hawker hasn't registered -->
    <div v-if="!hasRegisteredStall">
      <p>Welcome! Please register your stall to get started!</p>
      <HawkerStallForm @stallCreated="onStallCreated"/>
    </div>

    <div v-else>
      <!-- <p>Monitor orders, view analytics, and track unsold inventory.</p> -->
      <HawkerListings/>
    </div>
  </div>

  </main>
  
</template>

<script>
import HawkerListings from '@/components/hawker/HawkerDashboard/HawkerDashboard.vue';
import HawkerStallForm from '@/components/hawker/HawkerForm/HawkerForm.vue';
import { ref, onMounted } from 'vue';
import { db, auth } from '/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default { 
  name: "HawkerDashboard" ,
  components:{
    HawkerListings,
    HawkerStallForm
  },
  setup() {
    const loading = ref(true);
    const hasRegisteredStall = ref(false);

    // check if current user has a registered stall
    const checkStallRegistration = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser){
          console.error('No authenticated user found');
          loading.value = false;
          return;
        }

        // query collection for userId
        const hawkersRef = collection(db, 'hawkerListings');
        const q = query(hawkersRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);

        hasRegisteredStall.value = !querySnapshot.empty;
        console.log('Has registered stall: ', hasRegisteredStall.value)
      } finally {
        loading.value = false
      }
    };

    // handle when stall is created successfully
    const onStallCreated = () => {
      hasRegisteredStall.value = true
    };

    onMounted(() => {
      checkStallRegistration();
    });

    return {
      loading,
      hasRegisteredStall,
      onStallCreated
    }; 
  }
};
</script>
<!-- <style src="../assets/css/CreateListing.css"></style> -->