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
                        <span class="photos-hint">Drag to reorder • Click to set as main</span>
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
                            @click="setMainImage(index)"
                        >
                            <img :src="img.existing ? img.existingData.url : img.previewUrl" :alt="`Image ${index + 1}`">
                            <div class="thumb-overlay">
                                <span v-if="img.main" class="main-badge">Main</span>
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
                <div class="custom-dropdown" :class="{ 'is-open': isDropdownOpen }" ref="dropdownRef">
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
            </div>
            <div class="button-group">
                <button class="btn btn-success" type="submit" :disabled="loading">
                    Confirm
                </button>
            </div>
        </form>

        <!-- Multilisting Form Section (Create Mode Only) -->
        <div v-if="mode === 'create'" class="multilisting-section">
            <div class="section-divider"></div>
            <h3 class="section-title">Create Multiple Food Listings</h3>
            <p class="section-description">Add multiple food items to your stall at once</p>
            
            <div v-for="(listing, index) in listings" :key="index" class="listing-form-card">
                <div class="listing-header">
                    <h4>Listing {{ index + 1 }}</h4>
                    <button type="button" class="btn-remove-listing" @click="removeListing(index)" v-if="listings.length > 1">
                        <i class="fas fa-times"></i> Remove
                    </button>
                </div>

                <div class="listing-form-grid">
                    <!-- Image Upload -->
                    <div class="listing-image-section">
                        <label class="form-label">Item Image</label>
                        <div class="listing-img-container" v-show="listing.previewUrl">
                            <img :src="listing.previewUrl" alt="preview">
                            <span class="remove-btn-small" @click="removeListingImage(index)">
                                <i class="fas fa-times"></i>
                            </span>
                        </div>
                        <div class="listing-upload-area" @click="() => triggerFileInput(index)">
                            <i class="fas fa-upload"></i>
                            <span v-if="!listing.previewUrl"><b>Upload Photo</b></span>
                            <span v-else><b>Change Photo</b></span>
                            <input
                                type="file"
                                accept="image/jpeg, image/png, image/jpg"
                                :ref="el => { if (el) listingFileInputs[index] = el }"
                                @change="(e) => onListingFileSelected(e, index)"
                                style="display: none;"
                            >
                        </div>
                        <small v-if="listing.imageError" class="text-danger">{{ listing.imageError }}</small>
                    </div>

                    <!-- Form Fields -->
                    <div class="listing-fields">
                        <div class="form-group-small">
                            <label class="form-label">Item Name *</label>
                            <input
                                type="text"
                                v-model="listing.itemName"
                                placeholder="Enter food name"
                                required
                            />
                        </div>

                        <div class="form-row">
                            <div class="form-group-small">
                                <label class="form-label">Price ($) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    v-model.number="listing.itemPrice"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div class="form-group-small">
                                <label class="form-label">Discount (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    v-model.number="listing.discount"
                                    placeholder="0"
                                    min="0"
                                    max="100"
                                />
                            </div>
                            <div class="form-group-small">
                                <label class="form-label">Quantity *</label>
                                <input
                                    type="number"
                                    v-model.number="listing.itemQty"
                                    placeholder="0"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        <div class="form-group-small">
                            <label class="form-label">Description</label>
                            <textarea
                                v-model="listing.description"
                                placeholder="Describe your food item..."
                                rows="3"
                            ></textarea>
                        </div>

                        <div class="form-row">
                            <div class="form-group-small">
                                <label class="form-label">Allergens</label>
                                <div class="checkbox-group">
                                    <label v-for="allergen in allergenOptions" :key="allergen" class="checkbox-label">
                                        <input type="checkbox" :value="allergen" v-model="listing.allergens">
                                        <span>{{ allergen }}</span>
                                    </label>
                                </div>
                            </div>
                            <div class="form-group-small">
                                <label class="form-label">Tags</label>
                                <div class="checkbox-group">
                                    <label v-for="tag in tagOptions" :key="tag" class="checkbox-label">
                                        <input type="checkbox" :value="tag" v-model="listing.tags">
                                        <span>{{ tag }}</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="form-group-small">
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="listing.makeActive">
                                <span>Make this listing active</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="multilisting-actions">
                <button type="button" class="btn btn-add-listing" @click="addListing">
                    <i class="fas fa-plus"></i> Add Another Listing
                </button>
                <button type="button" class="btn btn-success" @click="handleMultilistingSubmit" :disabled="loading || listings.length === 0">
                    {{ loading ? 'Creating...' : `Create ${listings.length} Listing${listings.length !== 1 ? 's' : ''}` }}
                </button>
            </div>
        </div>
    </div>
</template>

<script src="./HawkerForm.js"></script>
<style src="./HawkerForm.css"></style>
