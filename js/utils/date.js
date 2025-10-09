// ==================== DATE UTILITY FUNCTIONS ====================

/**
 * Converts a date string like "12 January 2025" to "YYYY-MM-DD" format
 * @param {string} dateString - Date string in format "DD Month YYYY"
 * @returns {string} Date in "YYYY-MM-DD" format
 */
export function convertToISODate(dateString) {
    console.log("dateString---------->", dateString)
    if (!dateString || typeof dateString !== 'string') {
        throw new Error('Invalid date string provided');
    }
    
    // Regex to capture day, month, and year from "DD Month YYYY" format
    const dateRegex = /^(\d{1,2})\s+(\w+)\s+(\d{4})$/;
    const match = dateString.match(dateRegex);
    
    if (!match) {
        throw new Error('Invalid date format. Expected format: "DD Month YYYY" (e.g., "12 January 2025")');
    }
    
    const [, day, monthName, year] = match;
    
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
 * Converts a date string like "12 January 2025" to "YYYY-MM-DD" format
 * Alternative function name for backward compatibility
 * @param {string} dateString - Date string in format "DD Month YYYY"
 * @returns {string} Date in "YYYY-MM-DD" format
 */
export function formatDateToISO(dateString) {
    return convertToISODate(dateString);
}

/**
 * Validates if a date string is in a valid genealogy format
 * Accepts: "12 January 2025", "January 2025", "2025", or partial dates
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidGenealogyDate(dateString) {
    if (!dateString || typeof dateString !== 'string') {
        return false;
    }
    
    const trimmed = dateString.trim();
    
    // Check for full date format: DD Month YYYY
    const fullDateRegex = /^(\d{1,2})\s+(\w+)\s+(\d{4})$/;
    const fullMatch = trimmed.match(fullDateRegex);
    
    if (fullMatch) {
        const [, day, monthName, year] = fullMatch;
        
        // Validate month name
        const monthNames = ["January", "February", "March", "April", "May", "June", 
                           "July", "August", "September", "October", "November", "December"];
        const monthIndex = monthNames.findIndex(name => 
            name.toLowerCase() === monthName.toLowerCase()
        );
        
        if (monthIndex === -1) {
            return false;
        }
        
        // Validate day (basic check)
        const dayNum = parseInt(day, 10);
        if (dayNum < 1 || dayNum > 31) {
            return false;
        }
        
        // Validate year (reasonable range for genealogy)
        const yearNum = parseInt(year, 10);
        if (yearNum < 1000 || yearNum > 2100) {
            return false;
        }
        
        return true;
    }
    
    // Check for month and year format: Month YYYY
    const monthYearRegex = /^(\w+)\s+(\d{4})$/;
    const monthYearMatch = trimmed.match(monthYearRegex);
    
    if (monthYearMatch) {
        const [, monthName, year] = monthYearMatch;
        
        // Validate month name
        const monthNames = ["January", "February", "March", "April", "May", "June", 
                           "July", "August", "September", "October", "November", "December"];
        const monthIndex = monthNames.findIndex(name => 
            name.toLowerCase() === monthName.toLowerCase()
        );
        
        if (monthIndex === -1) {
            return false;
        }
        
        // Validate year (reasonable range for genealogy)
        const yearNum = parseInt(year, 10);
        if (yearNum < 1000 || yearNum > 2100) {
            return false;
        }
        
        return true;
    }
    
    // Check for year only format: YYYY
    const yearRegex = /^(\d{4})$/;
    const yearMatch = trimmed.match(yearRegex);
    
    if (yearMatch) {
        const [, year] = yearMatch;
        const yearNum = parseInt(year, 10);
        return yearNum >= 1000 && yearNum <= 2100;
    }
    
    return false;
}


export function formatDateForDisplay(dateString) {
    if (!dateString) return ''
    
    // If it's already in genealogy format (DD Month YYYY), return as is
    if (/^\d{1,2}\s+\w+\s+\d{4}$/.test(dateString.trim())) {
        return dateString.trim()
    }
    
    // If it's in ISO format (YYYY-MM-DD), convert to genealogy format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString.trim())) {
        return formatDateString(dateString)
    }
    
    // For any other format, try to parse it as a date and convert
    try {
        const date = new Date(dateString)
        if (!isNaN(date.getTime())) {
            const day = date.getDate()
            const monthNames = ["January", "February", "March", "April", "May", "June", 
                               "July", "August", "September", "October", "November", "December"]
            const monthName = monthNames[date.getMonth()]
            const year = date.getFullYear()
            return `${day} ${monthName} ${year}`
        }
    } catch (e) {
        // If parsing fails, return the original string
    }
    
    return dateString
}


function formatDateString(dateString) {
    const [year, month, day] = dateString.split('-')
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const monthName = monthNames[month - 1]
    return `${day} ${monthName} ${year}`
}

export function dateSorter(dateA, dateB) {
    return new Date(dateA || '1900-01-01') - new Date(dateB || '1900-01-01')
}
