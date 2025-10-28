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
                <label class="form-label">Stall Image</label>
                <div id="img-container" class="mb-3" v-show="selectedFile">
                    <img id="image" :src="previewSelectedFileSRC">
                    <span class="remove-btn" v-if="previewSelectedFileSRC" @click="removeFile">
                        <font-awesome-icon icon="remove" class="fa-lg icon-green" />
                    </span>
                </div>
                <div id="uploadImg" @click="$refs.fileInput.click()">
                    <label>
                        <font-awesome-icon icon="upload" class="fa-lg green" />
                        <span v-if="!previewSelectedFileSRC" class="green"><b>Upload Photo</b></span>
                        <span v-else class="green"><b>Change Photo</b></span>
                        <br> by clicking here to browse or <br> drag and drop here
                    </label>
                    <input
                        type="file"
                        accept="image/jpeg, image.png, image/jpg"
                        @change="onFileSelected"
                        ref="fileInput"
                    >
                </div>
            </div>
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