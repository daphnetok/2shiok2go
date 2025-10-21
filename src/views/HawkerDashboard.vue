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
    
  <div class="container mt-4">
    <h2>Hawker Dashboard</h2>
    <p>Monitor orders, view analytics, and track unsold inventory.</p>

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
  <div class="container mt-4">
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

    <div class="row non-active mb-5">
      <h2 class="text-secondary">Non-Active Listings</h2>
      <p v-if="inactiveListings.length === 0" class="text-secondary">No inactive listings</p>
      
      <div v-else class="w-100">
        <div class="card mb-3" v-for="listing in inactiveListings" :key="listing.id">
          <div class="row g-0" style="align-items: center;">
            <div class="col-4 col-md-2 list-img-container">
              <img :src="listing.imageUrl" class="object-fit-cover rounded">
            </div>
            <div class="col-8 col-md-4">
              <div class="card-body">
                <h5 class="card-title">{{ listing.itemName }}</h5>
                <h5 class="card-text">${{ listing.discountedPrice }}</h5>
                <h5 class="card-text"><s>${{ listing.itemPrice }}</s></h5>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="card-body">
                <div class="row g-2 align-items-center">
                  <div class="col-6 col-md-3">
                    <h6 class="card-title">Stock: {{ listing.itemQty }}</h6>
                  </div>
                  <div class="col-6 col-md-9 text-end">
                    <button class="btn p-2 position-relative" @click="editListing(listing.id)">
                      <p class="hide">Edit</p>
                      <font-awesome-icon icon="edit" class="fa-lg icon-green"/>
                    </button>
                    <button class="btn p-2 position-relative" @click="duplicateListing(listing)">
                      <p class="hide">Duplicate</p>
                      <font-awesome-icon icon="copy" class="fa-lg icon-green"/>
                    </button>
                    <br class="d-md-none">
                    <button class="btn p-2 position-relative" @click="activateListing(listing.id)">
                      <p class="hide">Activate</p>
                      <font-awesome-icon icon="circle-plus" class="fa-lg icon-green"/>
                    </button>
                    <button class="btn p-2 position-relative" @click="deleteListingWithImage(listing.id, listing.imagePath)">
                      <p class="hide">Delete</p>
                      <font-awesome-icon icon="trash" class="fa-lg icon-red"/>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  </div>
  
</template>

<script>
  import { onMounted } from 'vue';
  import {
    alert,
    activeListings,
    inactiveListings,
    showAlert,
    closeAlert,
    showConfirmation,
    confirmationConfirm,
    confirmationCancel,
    deactivateListing,
    activateListing,
    deleteListingWithImage,
    editListing,
    duplicateListing,
  } from '@/components/hawker/useSharedListings';

  export default {
    name: "HawkerDashboard",
    setup() {
      onMounted(() => {
        console.log("HawkerDashboard mounted");
      });

      return {
        alert,
        activeListings,
        inactiveListings,
        showAlert,
        closeAlert,
        showConfirmation,
        confirmationConfirm,
        confirmationCancel,
        deactivateListing,
        activateListing,
        deleteListingWithImage,
        editListing,
        duplicateListing,
      };
    }
  };
</script>

<!-- <style src="../assets/css/HawkerDashboard.css"></style> -->
