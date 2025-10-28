 <template>
  <div class="address-autocomplete">
    <label class="form-label">{{ label }}</label>
    <input
      ref="autocompleteInput"
      type="text"
      class="form-control"
      :placeholder="placeholder"
      v-model="displayAddress"
      @focus="onFocus"
    />
    <!-- <small v-if="coordinates.lat && coordinates.lng" class="text-muted"> -->
      <!-- 📍 Location verified ({{ coordinates.lat.toFixed(4) }}, {{ coordinates.lng.toFixed(4) }}) -->
    <!-- </small> -->
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default {
  name: 'AddressAutocomplete',
  props: {
    label: {
      type: String,
      default: 'Address'
    },
    placeholder: {
      type: String,
      default: 'Enter your stall address'
    },
    modelValue: {
      type: Object,
      default: () => ({})
    },
    // Restrict to Singapore
    country: {
      type: String,
      default: 'sg'
    }
  },
  emits: ['update:modelValue', 'placeSelected'],
  setup(props, { emit }) {
    const autocompleteInput = ref(null);
    const displayAddress = ref('');
    const coordinates = ref({ lat: null, lng: null });
    let autocomplete = null;

    const loadGoogleMapsScript = () => {
      return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.google && window.google.maps && window.google.maps.places) {
          resolve();
          return;
        }

        // Create script element
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          resolve();
        };

        script.onerror = () => {
          reject(new Error('Failed to load Google Maps script'));
        };

        document.head.appendChild(script);
      });
    };

    const initAutocomplete = async () => {
      try {
        // Wait for input element to be available
        if (!autocompleteInput.value) {
          console.error('Autocomplete input element not found');
          return;
        }

        // Load Google Maps script
        await loadGoogleMapsScript();

        // Wait a tick to ensure Google Maps is fully loaded
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if google.maps.places is available
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          console.error('Google Maps Places library not loaded');
          return;
        }

        // Use the traditional API (works with script tag loading)
        autocomplete = new window.google.maps.places.Autocomplete(
          autocompleteInput.value,
          {
            componentRestrictions: { country: props.country },
            fields: ['address_components', 'formatted_address', 'geometry', 'name'],
            types: ['establishment', 'geocode']
          }
        );

        autocomplete.addListener('place_changed', onPlaceChanged);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    const onPlaceChanged = () => {
      const place = autocomplete.getPlace();

      if (!place.geometry) {
        console.log('No details available for input:', place.name);
        return;
      }

      // Extract address components
      const addressData = {
        formattedAddress: place.formatted_address,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        name: place.name || '',
        postalCode: '',
        street: '',
        city: '',
        country: ''
      };

      // Parse address components
      place.address_components.forEach(component => {
        const types = component.types;
        if (types.includes('postal_code')) {
          addressData.postalCode = component.long_name;
        }
        if (types.includes('route')) {
          addressData.street = component.long_name;
        }
        if (types.includes('locality')) {
          addressData.city = component.long_name;
        }
        if (types.includes('country')) {
          addressData.country = component.long_name;
        }
      });

      displayAddress.value = place.formatted_address;
      coordinates.value = {
        lat: addressData.latitude,
        lng: addressData.longitude
      };

      emit('update:modelValue', addressData);
      emit('placeSelected', addressData);
    };

    const onFocus = () => {
      // Clear selection on focus if needed
    };

    onMounted(() => {
      initAutocomplete();
    });

    // Watch for external updates
    watch(() => props.modelValue, (newVal) => {
      if (newVal?.formattedAddress) {
        displayAddress.value = newVal.formattedAddress;
        coordinates.value = {
          lat: newVal.latitude,
          lng: newVal.longitude
        };
      }
    });

    return {
      autocompleteInput,
      displayAddress,
      coordinates,
      onFocus
    };
  }
};
</script>

<style scoped>
.address-autocomplete {
  margin-bottom: 1rem;
}

.form-control:focus {
  border-color: #28a745;
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}

.text-muted {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
}
</style>