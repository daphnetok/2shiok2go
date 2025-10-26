import { ref, onMounted } from 'vue'
import { 
  signInWithGoogle, 
  logout,
  registerWithEmail,
  signInWithEmail,
  onAuthStateChanged,
  auth
} from '/firebase/auth'
import { assignRoleToGoogleUser } from '/firebase/firestore';
import { db } from '/firebase/config'
import { doc, getDoc } from 'firebase/firestore';
import router from '@/router';

export default {
  name: 'AuthComponent',
  setup() {
    const user = ref(null);
    const isLogin = ref(false);
    const loading = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');
    const successView = ref(false); 
    const blocker = ref(false);
    const showRoleModal = ref(false);
    const tempUser = ref(null);
    const userRole = ref('');

    // form fields
    const email = ref('');
    const password = ref('');
    const displayName = ref('');
    const role = ref('');
    
    // fetch user role from firestore
    const fetchUserRole = async (uid) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          return userDoc.data().role;
        }
        return null;
      } catch (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
    };

    // toggle between login and sign up
    const toggleMode = () => {
      isLogin.value = !isLogin.value;
      errorMessage.value = '';
      successMessage.value = '';
      successView.value = false;
      password.value = '';
    };

    // toggle to log in page upon successful sign up
    const handleProceedToLogin = async () => {
      loading.value = true;
      successView.value = false;
      await logout();
      toggleMode();
      loading.value = false;
    }

    // handle email & password auth
    const handleEmailAuth = async () => {
      errorMessage.value = '';
      successMessage.value = '';
      loading.value = true;

      let result;
      if(isLogin.value) {
        result = await signInWithEmail(email.value, password.value);
      } else {
        blocker.value = true;
        successView.value = true;
        result = await registerWithEmail(email.value, password.value, displayName.value, role.value);
      }

      if(result.success) {
        email.value = '';
        password.value = '';
        displayName.value = '';
        role.value = '';
        if(!isLogin.value) {
          successMessage.value = 'Account created successfully! Please log in.';
        }
      } else {
        errorMessage.value = result.error;
        successView.value = false;
      }
      blocker.value = false;
      loading.value = false;
    };

    // handle google auth
    const googleSignIn = async () => {
      errorMessage.value = '';
      successMessage.value = '';
      loading.value = true;
      
      const result = await signInWithGoogle();
      
      if (result.error) {
        errorMessage.value = result.error;
        loading.value = false;
        return;
      }
      
      if (result.newUser) {
        // New user - show role modal (don't use blocker)
        console.log('New Google user detected, showing role modal');
        tempUser.value = result.user;
        showRoleModal.value = true;
      } else {
        // Existing user - normal flow
        console.log('Existing Google user, proceeding normally');
      }
      loading.value = false;
    };

    // role selection for first-time google users
    const handleRoleSelect = async (selectedRole) => {
      loading.value = true;
      console.log('Assigning role:', selectedRole, 'to user:', tempUser.value);
      
      const res = await assignRoleToGoogleUser(tempUser.value, selectedRole);
      console.log('Role assignment result:', res);
      
      if(res.success) {
        userRole.value = selectedRole;
        showRoleModal.value = false;
        successMessage.value = 'Welcome! Your account has been created.';
      } else {
        console.error('Role assignment error:', res.error);
        errorMessage.value = res.error || 'Failed to assign role. Please try again.';
      }
      loading.value = false;
    };

    // handle sign out
    const handleSignOut = async () => {
      loading.value = true;
      showRoleModal.value = false;
      tempUser.value = null;
      userRole.value = '';
      errorMessage.value = '';
      successMessage.value = '';
      await logout();
      loading.value = false;
    };

    // handle routing
    const goToDashboard = () => {
      if(userRole.value == 'buyer'){
        router.push('/buyer-dashboard');
      } else if (userRole.value == 'hawker') {
        router.push('/hawker-dashboard')
      }
    };

    // listen to auth state changes
    onMounted(() => {
      onAuthStateChanged(auth, async (authUser) => {
        if (authUser && successView.value){
          return;
        }
        user.value = authUser;
        if (authUser) {
          // Fetch the user's role from Firestore
          const fetchedRole = await fetchUserRole(authUser.uid);
          userRole.value = fetchedRole || '';
          console.log('User role fetched:', fetchedRole);
        } else {
          userRole.value = '';
        }
      });
    });

    return {
      user,
      isLogin,
      loading,
      errorMessage,
      successMessage,
      successView,
      email,
      password,
      displayName,
      role,
      userRole,
      showRoleModal,
      tempUser,
      toggleMode,
      handleEmailAuth,
      googleSignIn,
      handleSignOut,
      handleProceedToLogin,
      handleRoleSelect,
      goToDashboard
    };
  }
};