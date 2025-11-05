import { ref } from 'vue';

const userLocation = ref(null);
const locationError = ref(null);
const isLoadingLocation = ref(false);

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return parseFloat(distance.toFixed(1)); // Round to 1 decimal place
};

export const reverseGeocode = async (latitude, longitude) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if(!apiKey){
    console.error('Google Maps API key not found');
    return 'Location detected';
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    );
    const data = await response.json();
    console.log(data);
    if(data.status === 'OK' && data.results.length > 0) {
      // find first result that isn't a plus code
      const addressResult = data.results.find(
        result => !result.formatted_address.includes('+') &&
        result.types.includes('street_address') ||
        result.types.includes('route') || 
        result.types.includes('premise')
      );

      // fallback to second result if first is a plus code, use first if there is no better match
      return addressResult?.formatted_address ||
        data.results[1]?.formatted_address ||
        data.results[0]?.formatted_address;
    }
    return 'Unknown location'
  } catch (error) {
    console.error('Error reverse geocoding: ', error);
    return 'Location detected';
  }
}

const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      const error = new Error('Geolocation is not supported by your browser');
      locationError.value = error.message;
      reject(error);
    } else {
      isLoadingLocation.value = true;
      locationError.value = null;
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          userLocation.value = coords;
          isLoadingLocation.value = false;
          resolve(coords);
        },
        (error) => {
          let errorMessage = 'Unable to retrieve your location';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
                errorMessage = 'Location request timed out';
              break;
          }
          
          locationError.value = errorMessage;
          isLoadingLocation.value = false;
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0 // fresh location only
        }
      );
    }
  });
};

export const useGeolocation = () => {
  const fetchUserLocation = async () => {
    try {
      await getUserLocation();
    } catch (error) {
      console.error('Error fetching user location:', error);
    }
  };

  return {
    userLocation,
    locationError,
    isLoadingLocation,
    getUserLocation: fetchUserLocation,
    calculateDistance,
    reverseGeocode
  };
};