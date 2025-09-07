// ==================== EXPORT UTILITY FUNCTIONS ====================

import { collectFormData } from '../form/formManager.js';

// Export record as text file
export function exportRecord() {
    if (!validateForm()) {
        alert('Please fill in all required fields before exporting.');
        return;
    }
    
    const formData = collectFormData();
    
    // Create a formatted text version
    const textContent = formatRecordAsText(formData);
    
    // Create and download file
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FamilyGroupRecord_${formData.father.name}_${formData.mother.name}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Format record as text
function formatRecordAsText(data) {
    let content = `FAMILY GROUP RECORD\n`;
    content += `Record Date: ${data.recordDate}\n`;
    content += `Family of ${data.father.name} and ${data.mother.name}\n\n`;
    
    // Father section
    content += `FATHER: ${data.father.name}\n`;
    if (data.father.father) content += `  Father: ${data.father.father}\n`;
    if (data.father.mother) content += `  Mother: ${data.father.mother}\n`;
    if (data.father.events.length > 0) {
        content += `  Events:\n`;
        data.father.events.forEach(event => {
            content += `    ${event.type.toUpperCase()}: ${event.date}`;
            if (event.place) content += ` | ${event.place}`;
            if (event.description) content += ` | ${event.description}`;
            if (event.sources) content += ` | Sources: ${event.sources}`;
            content += `\n`;
        });
    }
    content += `\n`;
    
    // Mother section
    content += `MOTHER: ${data.mother.name}\n`;
    if (data.mother.father) content += `  Father: ${data.mother.father}\n`;
    if (data.mother.mother) content += `  Mother: ${data.mother.mother}\n`;
    if (data.mother.events.length > 0) {
        content += `  Events:\n`;
        data.mother.events.forEach(event => {
            content += `    ${event.type.toUpperCase()}: ${event.date}`;
            if (event.place) content += ` | ${event.place}`;
            if (event.description) content += ` | ${event.description}`;
            if (event.sources) content += ` | Sources: ${event.sources}`;
            content += `\n`;
        });
    }
    content += `\n`;
    
    // Children section
    if (data.children.length > 0) {
        content += `CHILDREN:\n`;
        data.children.forEach((child, index) => {
            content += `  ${index + 1}. ${child.name}`;
            if (child.spouses.length > 0) {
                content += ` (Spouses: ${child.spouses.join(', ')})`;
            }
            content += `\n`;
        });
        content += `\n`;
    }
    
    // Preparer section
    content += `PREPARER:\n`;
    content += `  Name: ${data.preparer.name}\n`;
    if (data.preparer.address) content += `  Address: ${data.preparer.address}\n`;
    if (data.preparer.email) content += `  Email: ${data.preparer.email}\n`;
    content += `\n`;
    
    // Comments section
    if (data.comments) {
        content += `COMMENTS:\n${data.comments}\n`;
    }
    
    content += `\nGenerated on: ${new Date().toLocaleString()}`;
    
    return content;
}

// Import validateForm function
function validateForm() {
    const requiredFields = [
        'fatherFullName',
        'motherFullName',
        'preparerName',
        'preparerEmail'
    ];
    
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Export function that needs to be available globally
window.exportRecord = exportRecord;
