<template>
  <div class="container mt-4">
    <h2>Hawker Dashboard</h2>

    <!-- loading state -->
    <div v-if="loading" class="text-center">
      <p>Loading...</p>
    </div>

    <!-- show form if hawker hasn't registered -->
    <div v-else-if="!hasRegisteredStall">
      <p>Welcome! Please register your stall to get started!</p>
      <HawkerStallForm @stallCreated="onStallCreated"/>
    </div>

    <div v-else>
      <!-- <p>Monitor orders, view analytics, and track unsold inventory.</p> -->
      <HawkerListings/>
    </div>
  </div>
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