// ==================== FIREBASE INITIALIZATION ====================

import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';

// Import application modules
import { initializeAuth } from './js/auth/auth.js';
import { setupAutoSave } from './js/firestore/firestore.js';
import { initializeForm } from './js/form/formManager.js';
import { saveRecord } from './js/form/formManager.js';
import { exportRecord } from './js/utils/export.js';
import { addChild, addSpouse, deleteSpouse, deleteChild } from './js/form/childrenManager.js';
import { addEvent, editEvent, deleteEvent, closeEventModal, toggleSources } from './js/form/eventManager.js';

// Import VanJS components (example usage)
// import EventList from './js/components/EventList.js';
// import ChildList from './js/components/ChildList.js';
// import van from 'vanjs-core';
// 
// Example usage of EventList component:
// const { div } = van.tags;
// const events = van.state([]);
// const eventListComponent = EventList(events);
// document.getElementById('some-container').appendChild(eventListComponent);
//
// Example usage of ChildList component:
// const children = van.state([]);
// const childListComponent = ChildList(children);
// document.getElementById('children-container').appendChild(childListComponent);

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBI3Ibr2FS240bZePQuDtLzqo8A9f6kmB8",
    authDomain: "family-group-record.firebaseapp.com",
    projectId: "family-group-record",
    storageBucket: "family-group-record.firebasestorage.app",
    messagingSenderId: "877555434515",
    appId: "1:877555434515:web:51e30ccc02e2ae6621ebe6",
    measurementId: "G-1PV5NDM8F5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const analytics = getAnalytics(app);

// Export Firebase instances for use in other modules
export { auth, db, provider };

// Make Firebase available globally for backward compatibility
window.firebase = { 
    auth, 
    db, 
    provider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged, 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    query, 
    where, 
    getDocs, 
    orderBy, 
    onSnapshot 
};

// Make functions available globally for backward compatibility
window.addChild = addChild;
window.addSpouse = addSpouse;
window.deleteSpouse = deleteSpouse;
window.deleteChild = deleteChild;

window.addEvent = addEvent;
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;
window.closeEventModal = closeEventModal;
window.toggleSources = toggleSources;

// ==================== MAIN APPLICATION INITIALIZATION ====================

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('recordDate').value = today;
    
    // Initialize form
    initializeForm();
    
    // Initialize Firebase authentication
    initializeAuth();
    
    // Set up auto-save
    setupAutoSave();
    
    // Set up keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Set up modal close on outside click
    setupModalHandlers();
});

// Set up keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // Escape key to close modal
        if (event.key === 'Escape') {
            const modal = document.getElementById('eventModal');
            if (modal && modal.style.display === 'block') {
                closeEventModal();
            }
        }
        
        // Ctrl+S to save
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            saveRecord();
        }
        
        // Ctrl+E to export
        if (event.ctrlKey && event.key === 'e') {
            event.preventDefault();
            exportRecord();
        }
    });
}

// Set up modal handlers
function setupModalHandlers() {
    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('eventModal');
        if (event.target === modal) {
            closeEventModal();
        }
    };
}
