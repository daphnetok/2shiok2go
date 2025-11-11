<template>
    <div class="hawker-form">
        <div v-if="errorMsg" class="alert alert-danger">
            {{ errorMsg }}
        </div>
        
        <!-- Toast Notification -->
         <div v-if="showToast" class="toast-notification ">
            <div class="toast-content">
                <p class="toast-message">{{ successMsg }}</p>
                <router-link to="/hawker-dashboard">
                    <button class="btn btn-ok">OK</button>
                </router-link>
            </div>
        </div>

        <form @submit.prevent="handleSubmit">
            <!-- Multiple Image Upload -->
            <div class="form-group">
                <label class="form-label">Stall Images</label>
                <div class="uploader-card">
                    <div 
                        class="uploader-drop" 
                        @click="$refs.multiFileInput.click()"
                        @dragover.prevent="onDragOver"
                        @drop.prevent="onFileDrop"
                    >
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Click to upload or drag and drop</p>
                        <small>Upload up to 5 photos (JPEG, PNG, JPG)</small>
                        <input
                            type="file"
                            accept="image/jpeg, image/png, image/jpg"
                            multiple
                            @change="onMultiFileSelected"
                            ref="multiFileInput"
                        >
                    </div>
                    <small v-if="imageError" class="text-danger d-block mt-2">{{ imageError }}</small>
                </div>

                <!-- Image Gallery -->
                <div v-if="images.length > 0" class="photos-region">
                    <div class="photos-region-header">
                        <span class="photos-title">Uploaded Photos ({{ images.length }}/5)</span>
                        <span class="photos-hint">Drag to reorder | Click star to set as main</span>
                    </div>
                    <div class="thumbs-grid">
                        <div
                            v-for="(img, index) in images"
                            :key="index"
                            class="thumb-item"
                            :class="{ 'is-main': img.main }"
                            :draggable="true"
                            @dragstart="onDragStart(index)"
                            @dragover="onDragOver"
                            @drop="onDrop($event, index)"
                        >
                            <img :src="img.existing ? img.existingData.url : img.previewUrl" :alt="`Image ${index + 1}`">
                            <div class="thumb-overlay">
                                <button
                                    type="button"
                                    class="thumb-star"
                                    :class="{ 'active': img.main }"
                                    @click.stop="setMainImage(index)"
                                    :title="img.main ? 'Main image' : 'Set as main image'"
                                >
                                    <i class="fas fa-star"></i>
                                </button>
                                <button
                                    type="button"
                                    class="thumb-remove"
                                    @click.stop="removeImageAt(index)"
                                >
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>
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
                <div class="custom-dropdown" :class="{ 'is-open': isDropdownOpen, 'has-error': priceRangeError }" ref="dropdownRef">
                    <div class="dropdown-selected" @click="toggleDropdown">
                        <span class="dropdown-text">
                            {{ selectedPriceText || 'Select a price range' }}
                        </span>
                        <span class="dropdown-arrow" :class="{ 'is-open': isDropdownOpen }">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M6 9L1 4H11L6 9Z" fill="#217441"/>
                            </svg>
                        </span>
                    </div>
                    <div class="dropdown-options" v-show="isDropdownOpen">
                        <div 
                            class="dropdown-option" 
                            v-for="option in priceOptions" 
                            :key="option.value"
                            :class="{ 'is-selected': form.priceRange === option.value }"
                            @click="selectOption(option.value)"
                        >
                            <span class="option-text">{{ option.text }}</span>
                            <span class="option-check" v-if="form.priceRange === option.value">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="#217441" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </span>
                        </div>
                    </div>
                    <input type="hidden" name="priceRange" :value="form.priceRange" required>
                </div>
                <small v-if="priceRangeError" class="text-danger d-block mt-2">Please select a price range.</small>
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
