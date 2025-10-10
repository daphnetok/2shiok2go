<template>
  <div class="container mt-4">
    <h2>Create Listing</h2>
    <p>Hawkers can upload surplus food items here.</p>
    <ListingForm />
  </div>
</template>

<script>
import ListingForm from '@/components/hawker/CreateListing/CreateListing.vue';
export default { 
  name: "CreateListing",
  components: {
    ListingForm
  }
};
</script>
<!-- <style src="../assets/css/CreateListing.css"></style> -->