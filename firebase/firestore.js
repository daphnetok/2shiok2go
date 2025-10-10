// init db
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
import { ref, onUnmounted } from 'vue';

const listingsCollection = collection(db, 'listings');

// db crud functions
export const createListing = listing => {
  return addDoc(listingsCollection, listing);
}

export const getListing = async id => {
  const docRef = doc(db, 'listings', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}

export const updateListing = (id, listing) => {
  const docRef = doc(db, 'listings', id);
  return updateDoc(docRef, listing);
}

export const deleteListing = id => {
  const docRef = doc(db, 'listings', id);
  return deleteDoc(docRef);
}

export const useLoadListings = () => {
  const listings = ref([]);
  const unsubscribe = onSnapshot(listingsCollection, snapshot => {
    listings.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  });
  onUnmounted(unsubscribe);
  return listings;
}