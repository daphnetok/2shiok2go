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

export const getHawkerByName = async (hawkerName) => {
  try {
    // Reference to the 'hawkerListings' collection
    const hawkersRef = collection(db, 'hawkerListings');

    // Create a query to find hawkers with the specific hawkerName
    const q = query(hawkersRef, where('hawkerName', '==', hawkerName));

    // Fetch the documents matching the query
    const querySnapshot = await getDocs(q);
    
    // If no matching hawkers are found
    if (querySnapshot.empty) {
      console.log('No hawker found with name:', hawkerName);
      return null;
    }

    // Get the first document from the querySnapshot
    const doc = querySnapshot.docs[0];

    // Return the hawker data along with the document ID
    return {
      id: doc.id,
      ...doc.data()  // Spread the data from the document
    };
  } catch (error) {
    // Log the error if the query fails
    console.error('Error fetching hawker by name:', error);
    throw error;
  }
};