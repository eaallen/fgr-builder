// ==================== FIREBASE AUTHENTICATION ====================

import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, provider } from '../../main.js';
import loginSection, { isInGuestMode, setGuestMode, updateGuestUI, loadGuestData } from '../components/LoginWithGoogleOrContinueAsGuest.js';
import { loadUserData } from '../firestore/firestore.js';

let currentUser = null;

// Initialize Firebase authentication
export function initializeAuth() {
    // Listen for authentication state changes
    onAuthStateChanged(auth, (user) => {
        currentUser = user;

        console.log('state changed', user);

        // If user signs in, exit guest mode
        if (user) {
            setGuestMode(false);
        }

        updateAuthUI(user);

        if (user) {
            console.log('User signed in:', user.displayName);
            // Import and call loadUserData dynamically to avoid circular imports
            loadUserData();
            
        } else {
            console.log('User signed out');
            // Check if user was in guest mode before signing out
            const wasInGuestMode = localStorage.getItem('fgr_guest_mode') === 'true';
            if (wasInGuestMode) {
                // Restore guest mode
                setGuestMode(true);
                updateGuestUI();
                // loadGuestData();
                loadUserData()
            }
        }
    });

    // Set up logout button event listener (for when user is signed in)
    document.getElementById('logoutBtn').addEventListener('click', signOutUser);
}

// Sign in with Google
export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, provider);
        console.log('Sign-in successful:', result.user);
    } catch (error) {
        console.error('Sign-in error:', error);
        alert('Sign-in failed. Please try again.');
    }
}

// Sign out user
export async function signOutUser() {
    try {
        await signOut(auth);
        console.log('Sign-out successful');
    } catch (error) {
        console.error('Sign-out error:', error);
        alert('Sign-out failed. Please try again.');
    }
}


// Update authentication UI
export function updateAuthUI(user) {
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    const form = document.getElementById('familyGroupForm');

    if (user) {
        // User is signed in
        console.log("we have a user");
        
        userInfo.style.display = 'flex';
        loginSection.style.display = 'none';
        userName.textContent = user.displayName || user.email;
        // Remove blur from form
        if (form) {
            form.classList.remove('blurred');
        }
    } else if (isInGuestMode()) {
        console.log("we are in guest mode");
        // User is in guest mode - UI is handled by the guest component
        return;
    } else {
        console.log("we are signed out");
        // User is signed out and not in guest mode
        userInfo.style.display = 'none';
        // Add blur to form
        if (form) {
            form.classList.add('blurred');
            loginSection.style.display = 'block';
        }
    }
}

// Get current user
export function getCurrentUser() {
    return currentUser;
}
