<template>
    <div class="hawker-form">
        <div v-if="errorMsg" class="alert alert-danger">
            {{ errorMsg }}
        </div>
        
        <!-- Toast Notification -->
         <div v-if="showToast" class="toast-notification ">
            <div class="toast-content">
                <p class="toast-message">{{ successMsg }}</p>
                <button class="btn btn-ok" @click="closeToast">OK</button>
            </div>
        </div>

        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label class="form-label">Stall Image</label>
                <div id="img-container" class="mb-3" v-show="previewSelectedFileSRC">
                    <img id="image" :src="previewSelectedFileSRC">
                    <span class="remove-btn" v-if="previewSelectedFileSRC" @click="removeFile">
                        <font-awesome-icon icon="times" class="fa-lg" />
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

            <div class="form-group time-group">
                <div class="time-field">
                    <label class="form-label">Opening Time</label>
                    <input
                    type="time"
                    v-model="form.openingTime"
                    name="openingTime"
                    required
                    />
                </div>
                <div class="time-field">
                    <label class="form-label">Closing Time</label>
                    <input
                    type="time"
                    v-model="form.closingTime"
                    name="closingTime"
                    required
                />
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Price Range</label>
                <div class="price-range-options">
                    <label class="radio-option">
                        <input
                            type="radio"
                            name="priceRange"
                            :value="1"
                            v-model="form.priceRange"
                            required
                        />
                        <span>
                            <span class="price-text">$2 - $5</span>
                            <span class="dollar">($)</span>
                        </span>
                    </label>
                    <label class="radio-option">
                        <input
                            type="radio"
                            name="priceRange"
                            :value="2"
                            v-model="form.priceRange"
                            required
                        />
                        <span>
                            <span class="price-text">$5 - $10</span>
                            <span class="dollar">($$)</span>
                        </span>
                    </label>
                    <label class="radio-option">
                        <input
                            type="radio"
                            name="priceRange"
                            :value="3"
                            v-model="form.priceRange"
                            required
                        />
                        <span>
                            <span class="price-text">$10 - $20</span>
                            <span class="dollar">($$$)</span>
                        </span>
                    </label>
                    <label class="radio-option">
                        <input
                            type="radio"
                            name="priceRange"
                            :value="4"
                            v-model="form.priceRange"
                            required
                        />
                        <span>
                            <span class="price-text">$20+</span>
                            <span class="dollar">($$$$)</span>
                        </span>
                    </label>
                </div>
            </div>
            <div class="button-group">
                <button class="btn btn-success" type="submit" :disabled="loading">
                    Confirm
                </button>
            </div>
        </form>
    </div>
</template>

<script src="./HawkerForm.js"></script>
<style src="./HawkerForm.css"></style>
