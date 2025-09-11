// ==================== DATE UTILITY FUNCTIONS ====================

/**
 * Converts a date string like "September 17, 2025" to "YYYY-MM-DD" format
 * @param {string} dateString - Date string in format "Month DD, YYYY"
 * @returns {string} Date in "YYYY-MM-DD" format
 */
export function convertToISODate(dateString) {
    console.log("dateString---------->", dateString)
    if (!dateString || typeof dateString !== 'string') {
        throw new Error('Invalid date string provided');
    }
    
    // Regex to capture month, day, and year from "Month DD, YYYY" format
    const dateRegex = /^(\w+)\s+(\d{1,2}),\s+(\d{4})$/;
    const match = dateString.match(dateRegex);
    
    if (!match) {
        throw new Error('Invalid date format. Expected format: "Month DD, YYYY"');
    }
    
    const [, monthName, day, year] = match;
    
    // Convert month name to number
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                       "July", "August", "September", "October", "November", "December"];
    const monthIndex = monthNames.findIndex(name => 
        name.toLowerCase() === monthName.toLowerCase()
    );
    
    if (monthIndex === -1) {
        throw new Error(`Invalid month name: ${monthName}`);
    }
    
    const month = String(monthIndex + 1).padStart(2, '0');
    const paddedDay = day.padStart(2, '0');
    
    return `${year}-${month}-${paddedDay}`;
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


export function formatDateForDisplay(dateString) {
        if (!dateString) return ''
        return formatDateString(dateString)
}


function formatDateString(dateString) {
    const [year, month, day] = dateString.split('-')
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const monthName = monthNames[month - 1]
    return `${monthName} ${day}, ${year}`
}
