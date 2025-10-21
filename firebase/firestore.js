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
  onSnapshot, 
  setDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { ref, onUnmounted } from 'vue';

const listingsCollection = collection(db, 'itemListings');

// db crud functions
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
    listings.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  });
  onUnmounted(unsubscribe);
  return listings;
}

export const useLoadHawkers = () => {
  const hawkers = ref([]);
  const hawkersCollection = collection(db, 'hawkerListings');
  const unsubscribe = onSnapshot(hawkersCollection, snapshot => {
    hawkers.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  });
  onUnmounted(unsubscribe);
  return hawkers;
}