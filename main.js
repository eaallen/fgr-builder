// ==================== FIREBASE INITIALIZATION ====================

import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';

// Import application modules
import { initializeAuth } from './js/auth/auth.js';
import { clearForm, initializeForm } from './js/form/formManager.js';
import { saveRecord } from './js/form/formManager.js';
import { exportRecord, printFGR } from './js/utils/export.js';
import { addChild, addSpouse, deleteSpouse, deleteChild } from './js/form/childrenManager.js';
import {  closeEventModal } from './js/form/eventManager.js';
import { showFGRManager } from './js/components/FGRManager.js';


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
window.clearForm = clearForm;
window.showFGRManager = showFGRManager;


// ==================== MAIN APPLICATION INITIALIZATION ====================

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default in genealogy format
    const today = new Date();
    const day = today.getDate();
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                       "July", "August", "September", "October", "November", "December"];
    const monthName = monthNames[today.getMonth()];
    const year = today.getFullYear();
    const formattedDate = `${day} ${monthName} ${year}`;
    document.getElementById('recordDate').value = formattedDate;
    
    // Initialize form
    initializeForm();
    
    // Initialize Firebase authentication
    initializeAuth();
    
    // Set up auto-save
    // setupAutoSave();
    
    // Set up keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Set up modal close on outside click
    setupModalHandlers();
    
    // Set up mutation observer for body tag
    setupMutationObserver();
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
        
        // Ctrl+E to export as text
        if (event.ctrlKey && event.key === 'e') {
            event.preventDefault();
            exportRecord();
        }
        
        // Ctrl+Shift+E to export as PDF
        if (event.ctrlKey && event.shiftKey && event.key === 'E') {
            event.preventDefault();
            printFGR();
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

// Set up mutation observer for body tag
function setupMutationObserver() {
    // Create a new MutationObserver instance
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Handle different types of mutations
            switch(mutation.type) {
                case 'childList':
                    // Handle added nodes
                    if (mutation.addedNodes.length > 0) {
                        console.log('Nodes added to body:', mutation.addedNodes);
                        
                        // Check if any added nodes are modals
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                if (node.classList && node.classList.contains('modal')) {
                                    console.log('Modal added to DOM:', node);
                                    // You can add specific logic here for when modals are added
                                }
                                
                                // Check for event items
                                if (node.classList && node.classList.contains('event-item')) {
                                    console.log('Event item added to DOM:', node);
                                    // You can add specific logic here for when event items are added
                                }
                            }
                        });
                    }
                    
                    // Handle removed nodes
                    if (mutation.removedNodes.length > 0) {
                        console.log('Nodes removed from body:', mutation.removedNodes);
                        
                        // Check if any removed nodes are modals
                        mutation.removedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                if (node.classList && node.classList.contains('modal')) {
                                    console.log('Modal removed from DOM:', node);
                                    // You can add specific logic here for when modals are removed
                                }
                            }
                        });
                    }
                    break;
                    
                case 'attributes':
                    // Handle attribute changes
                    console.log('Attribute changed:', mutation.attributeName, 'on', mutation.target);
                    break;
                    
                case 'characterData':

                    // Handle text content changes
                    console.log('Text content changed:', mutation.target);
                    break;
            }
        });
    });
    
    // Configuration for the observer
    const config = {
        childList: true,        // Observe direct children
        subtree: true,          // Observe all descendants
        attributes: true,       // Observe attribute changes
        attributeOldValue: true, // Include old attribute values
        characterData: true,    // Observe text content changes
        characterDataOldValue: true // Include old text content
    };
    
    // Start observing the body element
    observer.observe(document.getElementById('familyGroupForm'), config);
        
    console.log('Mutation observer set up for body tag');
}
