// ==================== UUID UTILITY FUNCTIONS ====================

// Generate a UUID v4 (random UUID)
export function generateUUID() {
    // Check if crypto.randomUUID is available (modern browsers)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Generate a shorter UUID (8 characters)
export function generateShortUUID() {
    return Math.random().toString(36).substr(2, 8);
}

// Generate a numeric ID
export function generateNumericID() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 5);
}

// Generate a custom ID with prefix
export function generateCustomID(prefix = 'id') {
    return `${prefix}_${generateUUID()}`;
}

// Generate child ID
export function generateChildId() {
    return `__child${generateNumericID()}`;
}

// Generate spouse ID
export function generateSpouseId(childId) {
    return `__spouse${generateNumericID()}_${childId}`;
}
