<template>
  <main>
    <h2>Create Listing</h2>
    <p>Hawkers can upload surplus food items here.</p>
    <CreateAListing/>
  </main>
</template>

<script>
import CreateAListing from '../components/hawker/CreateListing/CreateListing.vue';

export default { 
  name: "CreateListing" ,
  components:{
    CreateAListing
  }
};
</script>
<!-- <style src="../assets/css/CreateListing.css"></style> -->