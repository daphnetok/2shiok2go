// initialise auth
import { auth } from './config';
// import functions
import { db } from './config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';

const provider = new GoogleAuthProvider();

// Helper function to initialize user data collections
const initializeUserData = async (userId, role) => {
  try {
    console.log('🎨 Initializing user data for:', userId, 'Role:', role);
    
    // Initialize buyer-specific data
    if (role === 'buyer') {
      // Create pet data
      const petRef = doc(db, 'users', userId, 'petData', 'current');
      await setDoc(petRef, {
        name: 'Buddy',
        happiness: 85,
        energy: 70,
        level: 1,
        experience: 0,
        treats: 0,
        mood: 'happy',
        progress: 0,
        mealsToLevelUp: 10,
        avatar: {
          body: 'dog',
          color: '#FFD700',
          background: 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 100%)',
          accessory: 'none',
          accessoryColor: '#FF69B4',
          face: 'M 50 50 Q 60 55 70 50'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Create user preferences
      const preferencesRef = doc(db, 'users', userId, 'preferences', 'settings');
      await setDoc(preferencesRef, {
        theme: 'light',
        notifications: true,
        emailNotifications: false,
        createdAt: new Date()
      });
      
      // Initialize empty cart
      const cartRef = doc(db, 'cart', userId);
      await setDoc(cartRef, {
        items: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Buyer data initialized successfully');
    }
    
    // Initialize hawker-specific data
    if (role === 'hawker') {
      // Hawker data will be created when they create their first listing
      // But we can initialize preferences
      const preferencesRef = doc(db, 'users', userId, 'preferences', 'settings');
      await setDoc(preferencesRef, {
        theme: 'light',
        notifications: true,
        emailNotifications: true,
        createdAt: new Date()
      });
      
      console.log('✅ Hawker data initialized successfully');
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error initializing user data:', error);
    return { success: false, error: error.message };
  }
};

// sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // check if user exists in database
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if(!userSnap.exists()){
      return { success: true, newUser: true, user }
    }
    return { success: true, user };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message };
  }
};

// sign up with email and password
export const registerWithEmail = async (email, password, displayName, role) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // update profile
    await updateProfile(user, { displayName }); 
    await auth.currentUser.reload();

    // create firestore document
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email,
      displayName,
      role,
      createdAt: new Date(),
      lastLogin: new Date()
    });
    
    // Initialize user data collections (pet, preferences, etc.)
    await initializeUserData(user.uid, role);
    
    return { success: true, user: user };
  } catch (error) {
    console.error('Sign up error: ', error);
    return { success: false, error: error.message };
  }
}

// sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Sign in error: ', error);
    return { success: false, error: error.message };
  }
}

// sign out
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
};


// Re-export for convenience
export { onAuthStateChanged, auth };