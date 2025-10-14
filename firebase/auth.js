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
      role
    });
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