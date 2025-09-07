// ==================== FIRESTORE INTEGRATION ====================

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../main.js';
import { getCurrentUser } from '../auth/auth.js';
import { collectFormData, populateForm } from '../form/formManager.js';

let autoSaveTimeout = null;
let isAutoSaving = false;

// Save data to Firestore
export async function saveToFirestore(data) {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        console.log('No user signed in, saving to localStorage instead');
        return saveToLocalStorage(data);
    }
    
    try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        const userData = {
            ...data,
            lastUpdated: new Date().toISOString(),
            userId: currentUser.uid
        };
        
        await setDoc(userDocRef, userData, { merge: true });
        console.log('Data saved to Firestore successfully');
        return true;
    } catch (error) {
        console.error('Error saving to Firestore:', error);
        // Fallback to localStorage
        return saveToLocalStorage(data);
    }
}

// Load data from Firestore
export async function loadFromFirestore() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        console.log('No user signed in, loading from localStorage instead');
        return loadFromLocalStorage();
    }
    
    try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('Data loaded from Firestore:', data);
            
            // Import and call populateForm dynamically
            populateForm(data);
            return data;
        } else {
            console.log('No data found in Firestore');
            return null;
        }
    } catch (error) {
        console.error('Error loading from Firestore:', error);
        // Fallback to localStorage
        return loadFromLocalStorage();
    }
}

// Save to localStorage (fallback)
export function saveToLocalStorage(data) {
    try {
        const recordId = 'fgr_' + Date.now();
        localStorage.setItem(recordId, JSON.stringify(data));
        console.log('Data saved to localStorage');
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

// Load from localStorage (fallback)
export function loadFromLocalStorage() {
    try {
        // Find the most recent record
        let latestRecord = null;
        let latestTime = 0;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('fgr_')) {
                const record = JSON.parse(localStorage.getItem(key));
                const recordTime = new Date(record.created || 0).getTime();
                if (recordTime > latestTime) {
                    latestTime = recordTime;
                    latestRecord = record;
                }
            }
        }
        
        if (latestRecord) {
            console.log('Data loaded from localStorage:', latestRecord);
            
            // Import and call populateForm dynamically
            import('../form/formManager.js').then(module => {
                module.populateForm(latestRecord);
            });
            return latestRecord;
        }
        
        return null;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
}

// Load user data
export async function loadUserData() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    try {
        await loadFromFirestore();
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// ==================== AUTO-SAVE FUNCTIONALITY ====================

// Set up auto-save
export function setupAutoSave() {
    const form = document.getElementById('familyGroupForm');
    form.addEventListener('input', debounceAutoSave);
    form.addEventListener('change', debounceAutoSave);
}

// Debounced auto-save
function debounceAutoSave() {
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
    }
    
    autoSaveTimeout = setTimeout(autoSave, 2000); // Auto-save after 2 seconds of inactivity
}

// Auto-save function
export async function autoSave() {
    const currentUser = getCurrentUser();
    if (!currentUser) { return }
    if (isAutoSaving) return;
    
    isAutoSaving = true;
    
    try {
        const formData = collectFormData();
        const success = await saveToFirestore(formData);
        
        if (success) {
            showAutoSaveIndicator('Saved automatically');
        }
    } catch (error) {
        console.error('Auto-save error:', error);
    } finally {
        isAutoSaving = false;
    }
}

// Show auto-save indicator
function showAutoSaveIndicator(message) {
    // Create or update auto-save indicator
    let indicator = document.getElementById('autoSaveIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'autoSaveIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 0.9rem;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(indicator);
    }
    
    indicator.textContent = message;
    indicator.style.opacity = '1';
    
    setTimeout(() => {
        indicator.style.opacity = '0';
    }, 1500);
}
