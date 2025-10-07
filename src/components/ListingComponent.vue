<template>
    <div class="card card-body mt-4">
        <form @submit.prevent='onSubmit'>
            <div class="form-group">
                <label>Item Name</label>
                <input 
                    v-model="form.name" 
                    class="form-control" 
                    required 
                />
            </div>
            <div class="form-group">
                <label>Include a short description</label>
                <input 
                    v-model="form.description" 
                    class="form-control" 
                    maxlength="50"
                />
                <small>{{ form.description.length }}/50 characters</small>
            </div>
            <!-- include form input for other stuff here! -->

            <button type="submit" class="btn btn-success mt-3">
                Create Listing
            </button>
        </form>
    </div>
</template>

<script>
import { createListing } from '../firebase/firestore';
import { reactive } from 'vue';

export default {
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