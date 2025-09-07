// ==================== DATE UTILITY FUNCTIONS ====================

/**
 * Converts a date string like "September 17, 2025" to "YYYY-MM-DD" format
 * @param {string} dateString - Date string in format "Month DD, YYYY"
 * @returns {string} Date in "YYYY-MM-DD" format
 */
export function convertToISODate(dateString) {
    if (!dateString || typeof dateString !== 'string') {
        throw new Error('Invalid date string provided');
    }
    
    // Parse the date string
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date format. Expected format: "Month DD, YYYY"');
    }
    
    // Convert to YYYY-MM-DD format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

/**
 * Converts a date string like "September 17, 2025" to "YYYY-MM-DD" format
 * Alternative function name for backward compatibility
 * @param {string} dateString - Date string in format "Month DD, YYYY"
 * @returns {string} Date in "YYYY-MM-DD" format
 */
export function formatDateToISO(dateString) {
    return convertToISODate(dateString);
}
