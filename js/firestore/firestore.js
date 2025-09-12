// ==================== FIRESTORE INTEGRATION ====================

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../main.js';
import { getCurrentUser } from '../auth/auth.js';
import { collectFormData, populateForm } from '../form/formManager.js';
import { isInGuestMode } from '../components/LoginWithGoogleOrContinueAsGuest.js';

let isAutoSaving = false;

// Save data to Firestore
export async function saveToFirestore(data) {
    const currentUser = getCurrentUser();

    if (!currentUser || isInGuestMode()) {
        console.log('No user signed in or in guest mode, saving to localStorage instead');
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

    if (!currentUser || isInGuestMode()) {
        console.log('No user signed in or in guest mode, loading from localStorage instead');
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
        const recordWithTimestamp = {
            ...data,
            created: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(recordId, JSON.stringify(recordWithTimestamp));
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
            if (key.startsWith('fgr_') && key !== 'fgr_auth_choice' && key !== 'fgr_guest_mode') {
                try {
                    const record = JSON.parse(localStorage.getItem(key));
                    const recordTime = new Date(record.created || 0).getTime();
                    if (recordTime > latestTime) {
                        latestTime = recordTime;
                        latestRecord = record;
                    }
                } catch (error) {
                    // Skip items that aren't valid JSON (like our auth choice keys)
                    console.log('Skipping non-JSON localStorage item:', key);
                }
            }
        }

        if (latestRecord) {
            console.log('Data loaded from localStorage:', latestRecord);

            populateForm(latestRecord);
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
    if (!currentUser && !isInGuestMode()) return;

    try {
        await loadFromFirestore();
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// ==================== AUTO-SAVE FUNCTIONALITY ====================


// Debounced auto-save
export function debounceAutoSave() {
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
    }

    autoSaveTimeout = setTimeout(autoSave, 1000);
}

// Auto-save function
export async function autoSave() {
    const currentUser = getCurrentUser();
    if (!currentUser && !isInGuestMode()) { return }
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
