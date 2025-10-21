<template>
    <div class="hawker-form">
        <div v-if="errorMsg" class="alert alert-danger">
            {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="alert alert-success">
            {{ successMsg }}
        </div>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label class="form-label">Stall Name</label>
                <input 
                    type="text"
                    v-model="form.stallName"
                    name="stallName"
                    placeholder="Enter the name of your stall"
                    required
                />
            </div>
            <div class="form-group">
                <AddressAutocomplete
                    label="Stall Address"
                    placeholder="Enter the address of your stall"
                    v-model="form.address"
                    @placeSelected="onAddressSelected"
                />
            </div>
            <div class="form-group">
                <label class="form-label">Closing Time</label>
                <input
                    type="time"
                    v-model="form.closingTime"
                    name="closingTime"
                    placeholder="Enter your closing time"
                    required
                />
            </div>
            <div class="button-group">
                <button class="btn btn-success" type="submit" :disabled="loading">
                    Confirm
                </button>
            </div>
        </form>
    </div>
</template>

<script src="./HawkerForm.js">
export default {
    name: 'HawkerStallForm'
}
</script>
<style src="./HawkerForm.css"></style>