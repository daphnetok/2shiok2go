<template>
  <div class="create-listing">
    <div class="card card-body mt-4">
      <form @submit.prevent="onSubmit">
        <div class="form-group">
          <label>Item name</label>
          <input
            v-model="form.name"
            class="form-control"
            required
          />
        </div>
        <div class="form-group">
          <label>Include a short description!</label>
          <input
            v-model="form.description"
            class="form-control"
            maxlength="50"
          />
          <br>
          <small>{{ form.description.length }}/50 characters</small>
        </div>
        <!-- other inputs -->
        <button type="submit" class="btn btn-success mt-3">
            Create Listing!
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { createListing } from "/firebase/firestore";
import { reactive } from "vue";

export default {
  name: "ListingForm",
  setup() { 
    const form = reactive({ name: '', description: '' })
    const onSubmit = async () => {
      try {
        console.log('Submitting:', form); // Debug log
        await createListing(form);
        console.log('Listing created!'); // Debug log
        // Clear form after success
        form.name = '';
        form.description = '';
      } catch (error) {
        console.error('Error creating listing:', error);
      }
    }
    return { form, onSubmit }
  }
}
</script>

<!-- <style src="../assets/css/CreateListing.css"></style> -->
 <style scoped>

.create-listing {
  padding: 20px;
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

.form-group input {
  width: 75%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus {
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

</style>
