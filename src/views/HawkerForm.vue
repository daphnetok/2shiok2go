<template>
    <main class="text-center">
        <h2>Hawker Form</h2>
        <p>Create your own hawker listing!</p>
        <HawkerStallForm/>
    </main>
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