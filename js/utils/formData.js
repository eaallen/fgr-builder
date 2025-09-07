// ==================== FORMDATA UTILITY FUNCTIONS ====================

// Simple function to get all form values as a flat object
export function getFormDataAsObject() {
    const form = document.getElementById('familyGroupForm');
    const formData = new FormData(form);
    
    // Convert FormData to a plain object
    const result = {};
    for (let [key, value] of formData.entries()) {
        result[key] = value;
    }
    
    return result;
}

// Get form data as FormData object (for direct use with fetch/XMLHttpRequest)
export function getFormDataAsFormData() {
    const form = document.getElementById('familyGroupForm');
    return new FormData(form);
}

// Get form data as URLSearchParams (for URL encoding)
export function getFormDataAsURLParams() {
    const form = document.getElementById('familyGroupForm');
    const formData = new FormData(form);
    return new URLSearchParams(formData);
}

// Get form data as JSON string
export function getFormDataAsJSON() {
    const formData = getFormDataAsObject();
    return JSON.stringify(formData, null, 2);
}

// Debug function to log all form values
export function debugFormValues() {
    console.log('=== FORM VALUES DEBUG ===');
    console.log('As Object:', getFormDataAsObject());
    console.log('As JSON:', getFormDataAsJSON());
    console.log('As URL Params:', getFormDataAsURLParams().toString());
    console.log('========================');
}
