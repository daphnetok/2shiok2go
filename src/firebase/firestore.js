// Import the necessary Firebase functions at the top
import { db } from './config';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { ref, onUnmounted } from 'vue';

// Listings collection reference
const listingsCollection = collection(db, 'listings');

// Create a new listing
export const createListing = async (listing) => {
  try {
    return await addDoc(listingsCollection, listing);
  } catch (error) {
    console.error('Create listing error: ', error);
    throw error;
  }
};

// Get a single listing by ID
export const getListing = async (id) => {
  try {
    const listingDoc = await getDoc(doc(db, 'listings', id));
    return listingDoc.exists() ? listingDoc.data() : null;
  } catch (error) {
    console.error('Get listing error: ', error);
    throw error;
  }
};

// Update a listing by ID
export const updateListing = async (id, listing) => {
  try {
    return await updateDoc(doc(db, 'listings', id), listing);
  } catch (error) {
    console.error('Update listing error: ', error);
    throw error;
  }
};

// Delete a listing by ID
export const deleteListing = async (id) => {
  try {
    return await deleteDoc(doc(db, 'listings', id));
  } catch (error) {
    console.error('Delete listing error: ', error);
    throw error;
  }
};

// Reactive listings loader (for Vue)
export const useLoadListings = () => {
  const listings = ref([]);
  const unsubscribe = onSnapshot(listingsCollection, (snapshot) => {
    listings.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });
  onUnmounted(unsubscribe);
  return listings;
};

// Fetch hawker by name
export async function getHawkerByName(hawkerName) {
  const hawkerQuery = query(collection(db, 'hawkers'), where('hawkerName', '==', hawkerName));
  const querySnapshot = await getDocs(hawkerQuery);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data();
  }
  return null;
}
