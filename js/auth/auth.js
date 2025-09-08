// ==================== FIREBASE AUTHENTICATION ====================

import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, provider } from '../../main.js';

let currentUser = null;

// Initialize Firebase authentication
export function initializeAuth() {
    // Listen for authentication state changes
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        updateAuthUI(user);
        
        if (user) {
            console.log('User signed in:', user.displayName);
            // Import and call loadUserData dynamically to avoid circular imports
            import('../firestore/firestore.js').then(module => {
                module.loadUserData();
            });
        } else {
            console.log('User signed out');
            // Import and call clearForm dynamically
            // import('../form/formManager.js').then(module => {
            //     module.clearForm();
            // });
        }
    });
    
    // Set up login/logout button event listeners
    document.getElementById('loginBtn').addEventListener('click', signInWithGoogle);
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
    const loginSection = document.getElementById('loginSection');
    const userName = document.getElementById('userName');
    const form = document.getElementById('familyGroupForm');
    
    if (user) {
        // User is signed in
        userInfo.style.display = 'flex';
        loginSection.style.display = 'none';
        userName.textContent = user.displayName || user.email;
        // Remove blur from form
        if (form) {
            form.classList.remove('blurred');
        }
    } else {
        // User is signed out
        userInfo.style.display = 'none';
        loginSection.style.display = 'block';
        // Add blur to form
        if (form) {
            form.classList.add('blurred');
        }
    }
}

// Get current user
export function getCurrentUser() {
    return currentUser;
}
