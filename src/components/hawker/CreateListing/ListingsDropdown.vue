<template>
    <!-- This dropdown will appear only if hawker has listings -->
    <div class="col-md-6" v-if="listings.value?.length > 0">
        <label class="form-label">Apply Discount Start Time To</label>

        <div class="dropdown-container border rounded p-3 bg-light">
            <!-- Select All checkbox -->
            <div class="form-check mb-2">
                <input
                type="checkbox"
                id="selectAll"
                class="form-check-input"
                v-model="selectAll"
                @change="toggleSelectAll"
                />
                <label for="selectAll" class="form-check-label fw-bold">
                Select All
                </label>
            </div>

            <!-- Individual listings checkboxes -->
            <div v-for="listing in listings.value"
                :key="listing.id"
                class="form-check mb-1 ps-3"
            >
                <input
                type="checkbox"
                class="form-check-input"
                :id="listing.id"
                :value="listing.id"
                v-model="selectedListings"
                @change="emitSelection"
                />
                <label class="form-check-label" :for="listing.id">
                {{ listing.itemName }}
                </label>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useLoadUserListings } from '../../../../firebase/firestore'
import { getAuth } from 'firebase/auth'

defineProps({
  userId: {
    type: String,
    required: true,
  },
})
const emit = defineEmits(['update:selected'])

const listings = useLoadUserListings(userId)
const selectedListings = ref([])
const selectAll = ref(false)

// Watch for listings change (in case Firestore updates)
watch(listings, () => {
  if (selectAll.value) {
    selectedListings.value = listings.value.map((l) => l.id)
    emitSelection()
  }
})

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedListings.value = listings.value.map((l) => l.id)
  } else {
    selectedListings.value = []
  }
  emitSelection()
}

const emitSelection = () => {
  emit('update:selected', selectedListings.value)
}

</script>

<style>

</style>