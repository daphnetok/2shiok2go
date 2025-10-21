<template>
    <div class="container mt-4 text-center">
        <h2>Hawker Form</h2>
        <p>Create your own hawker listing!</p>
        <HawkerStallForm/>
    </div>
</template>

<script>
import HawkerStallForm from '../components/hawker/HawkerForm/HawkerForm.vue';
export default {
    name: 'HawkerForm',
    components: {
        HawkerStallForm
    }
}
</script>