// Import necessary functions from Firebase SDK
import { db } from './config';  
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  setDoc,
  query,
  where,
  getDocs,  // Importing getDocs for querying documents
} from 'firebase/firestore';
import { ref, onUnmounted } from 'vue';

const listingsCollection = collection(db, 'itemListings');
const hawkerCollection = collection(db, 'hawkerListings');

// db CRUD functions
export const createListing = listing => {
  return addDoc(listingsCollection, listing);
}

export const getListing = async id => {
  const docRef = doc(db, 'itemListings', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}

export const updateListing = (id, listing) => {
  const docRef = doc(db, 'itemListings', id);
  return updateDoc(docRef, listing);
}

export const deleteListing = id => {
  const docRef = doc(db, 'itemListings', id);
  return deleteDoc(docRef);
}

export const useLoadListings = () => {
  const listings = ref([]);
  const unsubscribe = onSnapshot(listingsCollection, snapshot => {
    listings.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });
  onUnmounted(unsubscribe);
  return listings;
}

export const useLoadHawkers = () => {
  const hawkers = ref([]);
  const hawkersCollection = collection(db, 'hawkerListings');
  const unsubscribe = onSnapshot(hawkersCollection, snapshot => {
    hawkers.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });
  onUnmounted(unsubscribe);
  return hawkers;
};

export const createHawker = hawkerData => {
  return addDoc(hawkerCollection, hawkerData);
}

// Get favourites function to get all hawkers favorited by the user (uid)
export const getFavourites = async (uid) => {
  try {
    // Reference to the hawker collection
    const hawkersCollection = collection(db, 'hawkerListings');

    // Query to find hawkers where favouritedUser array contains the provided uid
    const q = query(hawkersCollection, where('favouritedUser', 'array-contains', uid));

    // Get the query snapshot
    const querySnapshot = await getDocs(q);
    
    // Initialize the list to store hawkers where the user has added them to favourites
    const favourited = [];

    // Loop through the query results
    querySnapshot.forEach(doc => {
      const hawkerData = doc.data();
      favourited.push({ id: doc.id, ...hawkerData });
    });

    console.log('Favourited hawkers:', favourited);
    return favourited;

  } catch (error) {
    console.error('Error fetching favourite hawkers:', error);
    return [];
  }
};

// Assign a role to the user in Firestore
export const assignRoleToGoogleUser = async (user, role) => {
  try {
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role,
    });
    return {success: true};
  } catch (error) {
    console.error('Error assigning role: ', error);
    return { success: false, error: error.message };
  }
}
