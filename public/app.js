// initialise auth and database
const auth = firebase.auth();
const db = firebase.firestore();

// grab all the elements from index.html
const whenSignedIn = document.getElementById("whenSignedIn");
const whenSignedOut = document.getElementById("whenSignedOut");
const signInBtn = document.getElementById("signInBtn");
const signOutBtn = document.getElementById("signOutBtn");
const userDetails = document.getElementById("userDetails");
const provider = new firebase.auth.GoogleAuthProvider();

// functions for buttons
signInBtn.onclick = () => auth.signInWithPopup(provider);
signOutBtn.onclick = () => auth.signOut();

// function for when user status changes
auth.onAuthStateChanged(user => {
    if (user) {
        // signed in
        whenSignedIn.hidden = false;
        whenSignedOut.hidden = true;
        const userDetails = document.getElementById("userDetails");
        const h3 = document.createElement("h3");
        h3.textContent = `Welcome, ${user.displayName}!`;
        userDetails.appendChild(h3);
    } else {
        // not signed in
        whenSignedIn.hidden = true;
        whenSignedOut.hidden = false;
        const userDetails = document.getElementById("userDetails");
        userDetails.textContent = "";
    }
})