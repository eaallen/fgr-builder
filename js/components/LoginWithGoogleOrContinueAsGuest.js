// ==================== LOGIN WITH GOOGLE OR CONTINUE AS GUEST ====================

import { signInWithGoogle } from '../auth/auth.js';
import { clearForm } from '../form/formManager.js';
import { div, button, svg, path, p, i } from '../van/index.js';

let isGuestMode = false;
const AUTH_CHOICE_KEY = 'fgr_auth_choice';
const GUEST_MODE_KEY = 'fgr_guest_mode';

const loginSection = initializeLoginComponent();
document.querySelector('#form-container').prepend(loginSection);

// Initialize the login component
export function initializeLoginComponent() {

    // Check if user has a saved auth choice
    // const savedAuthChoice = localStorage.getItem(AUTH_CHOICE_KEY);
    // const savedGuestMode = localStorage.getItem(GUEST_MODE_KEY) === 'true';

    // if (savedAuthChoice === 'guest' && savedGuestMode) {
    //     // User previously chose guest mode, restore it
    //     isGuestMode = true;
    //     updateGuestUI();
    //     loadGuestData();
    //     return;
    // }

    const loginSection = 
        div({ class: "login-options" },
            div({ class: "login-option" },
                button({ type: "button", id: "googleLoginBtn", class: "btn btn-google", onclick: handleGoogleLogin },
                    svg({ class: "google-icon", viewBox: "0 0 24 24", width: "18", height: "18" },
                        path({ fill: "#4285F4", "d": "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }),
                        path({ fill: "#34A853", "d": "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }),
                        path({ fill: "#FBBC05", "d": "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }),
                        path({ fill: "#EA4335", "d": "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" }),
                    ),
                    "Sign in with Google",
                ),
                p({ class: "login-description" },
                    "Save your data to the cloud and access it from any device",
                ),
            ),
            div({ class: "login-divider"}, p({style: "visibility: hidden;"}, "or")),
            div({ class: "login-option" },
                button({ type: "button", id: "guestLoginBtn", class: "btn btn-guest", onclick: handleGuestLogin },
                    i({ class: "fas fa-user-secret" }),
                    "Continue as Guest",
                ),
                p({ class: "login-description" },
                    "Save your data locally on this device only",
                ),
            ),
        )

    

    return loginSection;
}

// Handle Google login
async function handleGoogleLogin() {
    try {
        // Save the user's choice
        localStorage.setItem(AUTH_CHOICE_KEY, 'google');
        localStorage.removeItem(GUEST_MODE_KEY);

        await signInWithGoogle();
        // The auth state change will be handled by the existing auth system
    } catch (error) {
        console.error('Google login failed:', error);
        alert('Google sign-in failed. Please try again.');
    }
}

// Handle guest login
function handleGuestLogin() {
    isGuestMode = true;

    // Save the user's choice
    localStorage.setItem(AUTH_CHOICE_KEY, 'guest');
    localStorage.setItem(GUEST_MODE_KEY, 'true');

    // Update the UI to show guest mode
    updateGuestUI();

    // Load any existing local data
    loadGuestData();

    console.log('Continuing as guest - data will be saved locally');
}

// Update UI for guest mode
export function updateGuestUI() {
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    const form = document.getElementById('familyGroupForm');

    // Hide login section and show user info with guest status
    userInfo.style.display = 'flex';
    userName.textContent = 'Guest User';

    // Remove blur from form
    if (form) {
        form.classList.remove('blurred');
        if(isInGuestMode()) {
            loginSection.style.display = 'none';
        }
    }

    // Update logout button to show "Switch to Google" instead
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            // Clear guest mode from localStorage and reset
            localStorage.removeItem(GUEST_MODE_KEY);
            localStorage.removeItem(AUTH_CHOICE_KEY);
            isGuestMode = false;
            clearForm(false)
            window.location.reload();
        };
    }
}

// Load guest data from localStorage
export function loadGuestData() {
    // Import and call loadFromLocalStorage dynamically
    import('../firestore/firestore.js').then(module => {
        module.loadFromLocalStorage();
    });
}

// Check if currently in guest mode
export function isInGuestMode() {
    return isGuestMode || localStorage.getItem(GUEST_MODE_KEY) === 'true';
}

// Set guest mode (for external use)
export function setGuestMode(guest) {
    isGuestMode = guest;
}

export default loginSection;