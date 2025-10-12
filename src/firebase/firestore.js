// initialise db
import { onUnmounted } from 'vue';
import { db } from './config';
// import functions
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

const listingsCollection = collection(db, 'listings');

// listing db functions
export const createListing = async (listing) => {
  try {
    return await addDoc(listingsCollection, listing);
  } catch (error) {
    console.error('Create listing error: ', error);
    throw error;
  }
};

export const getListing = async (id) => {
  try {
    const listingDoc = await getDoc(doc(db, 'listings', id));
    return listingDoc.exists() ? listingDoc.data() : null;
  } catch (error) {
    console.error('Get listing error: ', error);
    throw error;
  } 
}

export const updateListing = async (id, listing) => {
  try {
    return await updateDoc(doc(db, 'listings', id), listing);
  } catch (error) {
    console.error('Update listing error: ', error);
    throw error;
  }
}

export const deleteListing = async (id) => {
  try {
    return await deleteDoc(doc(db, 'listings', id));
  } catch (error) {
    console.error('Delete user error: ', error);
    throw error;
  }
}

export const useLoadListings = () => {
  const listings = ref([]);
  const unsubscribe = onSnapshot(listingsCollection, (snapshot) => {
    listings.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });
  onUnmounted(unsubscribe);
  return listings;
}