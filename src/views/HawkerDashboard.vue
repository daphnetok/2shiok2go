<template>
  <div class="container mt-4">
    <!-- <h2>Hawker Dashboard</h2> -->

    <!-- loading state -->
    <LoadingSpinner v-if="loading" message="Loading..." />

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
import { ref, onMounted } from 'vue';
import { db, auth } from '/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import HawkerListings from '@/components/hawker/HawkerDashboard/HawkerDashboard.vue';
import HawkerStallForm from '@/components/hawker/HawkerForm/HawkerForm.vue';
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue';

export default {
  name: "HawkerDashboard",
  components: { HawkerListings, HawkerStallForm, LoadingSpinner },
  setup() {
    const loading = ref(true);
    const hasRegisteredStall = ref(false);

    const checkStallRegistration = async (user) => {
      const hawkersRef = collection(db, 'hawkerListings');
      const q = query(hawkersRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      hasRegisteredStall.value = !querySnapshot.empty;
      console.log('Has registered stall:', hasRegisteredStall.value);
      loading.value = false;
    };

    const onStallCreated = () => {
      hasRegisteredStall.value = true;
    };

    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          checkStallRegistration(user);
        } else {
          loading.value = false;
          console.warn("No user logged in");
        }
      });
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