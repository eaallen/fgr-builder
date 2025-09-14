// ==================== MAIN APPLICATION ====================

import { initializeAuth } from './auth/auth.js';
// import { setupAutoSave } from './firestore/firestore.js';
import { initializeForm } from './form/formManager.js';
import { saveRecord } from './form/formManager.js';
import { exportRecord } from './utils/export.js';

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
});

// Set up keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // Escape key to close modal
        if (event.key === 'Escape') {
            const modal = document.getElementById('eventModal');
            if (modal && modal.style.display === 'block') {
                import('./form/eventManager.js').then(module => {
                    module.closeEventModal();
                });
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
            import('./form/eventManager.js').then(module => {
                module.closeEventModal();
            });
        }
    };
}
