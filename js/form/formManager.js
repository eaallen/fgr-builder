// ==================== FORM MANAGEMENT ====================

import { generateChildId } from '../utils/uuid.js';
import { validateField, clearFieldError } from '../utils/validation.js';
import { saveToFirestore } from '../firestore/firestore.js';
import van from 'vanjs-core';
import * as vanX from 'vanjs-ext';
import EventList from '../components/EventList.js';
import { debounceAutoSave } from '../firestore/firestore.js';
import ChildList from '../components/ChildList.js';

const formHasBeenPopulated = van.state(false)
const globalState = vanX.reactive({ kids: [], fatherEvents: [], motherEvents: [] })
const { fatherEvents, motherEvents } = vanX.stateFields(globalState)

van.derive(() => {


    if (!formHasBeenPopulated.val) {
        return // do not start auto saving until the form has been populated
    }

    if (fatherEvents.oldVal === fatherEvents.val && motherEvents.oldVal === motherEvents.val && globalState.kids.length === 0) {
        return // not going to auto save if out states are all empty
    }

    const formData = collectFormData()
    console.log("formData", formData)
    debounceAutoSave()
})

// Initialize form functionality
export function initializeForm() {
    // Add event listeners for form validation
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
        input.addEventListener('input', debounceAutoSave);
    });

    // add events list
    van.add(document.getElementById('fatherEvents'), EventList(fatherEvents))
    van.add(document.getElementById('motherEvents'), EventList(motherEvents))
    van.add(document.getElementById('childrenList'), ChildList({ state: globalState }))
}

// Collect form data using FormData
export function collectFormData() {
    const form = document.getElementById('familyGroupForm');
    const formData = new FormData(form);

    // Convert FormData to a plain object
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    // Add dynamic data that's not in the form
    data.father = {
        name: data.fatherFullName || '',
        father: data.fatherFather || '',
        fatherSource: { content: data.fatherFatherSource || '', sourceNumber: 0 }, // source number will be mutated later
        mother: data.fatherMother || '',
        motherSource: { content: data.fatherMotherSource || '', sourceNumber: 0 }, // source number will be mutated later
        events: fatherEvents.val
    };

    data.mother = {
        name: data.motherFullName || '',
        father: data.motherFather || '',
        fatherSource: { content: data.motherFatherSource || '', sourceNumber: 0 }, // source number will be mutated later
        mother: data.motherMother || '',
        motherSource: { content: data.motherMotherSource || '', sourceNumber: 0 }, // source number will be mutated later
        events: motherEvents.val
    };

    data.children = globalState.kids;

    data.preparer = {
        name: data.preparerName || '',
        address: data.preparerAddress || '',
        email: data.preparerEmail || ''
    };

    // Add metadata
    data.created = new Date().toISOString();

    data.recordId = document.getElementById('recordId').innerText;

    // add source numbers to events
    let sourceNumber = 1
    data.father.events.forEach(event => {
        event.sourceNumber = sourceNumber
        sourceNumber++
    })

    data.father.fatherSource.sourceNumber = sourceNumber
    sourceNumber++
    data.father.motherSource.sourceNumber = sourceNumber
    sourceNumber++

    data.mother.events.forEach(event => {
        event.sourceNumber = sourceNumber
        sourceNumber++
    })

    data.mother.fatherSource.sourceNumber = sourceNumber
    sourceNumber++
    data.mother.motherSource.sourceNumber = sourceNumber
    sourceNumber++

    data.children.forEach(child => {
        child.events.forEach(event => {
            event.sourceNumber = sourceNumber
            sourceNumber++
        })
    })

    // Clean up the data object (remove individual field names)
    delete data.fatherFullName;
    delete data.fatherFather;
    delete data.fatherMother;
    delete data.motherFullName;
    delete data.motherFather;
    delete data.motherMother;
    delete data.preparerName;
    delete data.preparerAddress;
    delete data.preparerEmail;
    delete data.fatherFatherSource;
    delete data.fatherMotherSource;
    delete data.motherFatherSource;
    delete data.motherMotherSource;

    return data;
}

// Validate form
export function validateForm() {
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
            showFieldError(field, 'This field is required');
            isValid = false;
        }
    });

    return isValid;
}

// Show field error
function showFieldError(field, message) {
    field.classList.add('error');

    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#ef4444';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '4px';

    field.parentNode.appendChild(errorDiv);
}

// Clear form
export function clearForm(showConfirmation = true) {
    if (showConfirmation) {
        if (!confirm('Are you sure you want to clear all form data? This action cannot be undone.')) {
            return
        }
    }


    // Clear all input fields
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        if (input.id !== 'recordDate') {
            input.value = '';
        }
    });

    // Set today's date as default in genealogy format
    const today = new Date();
    const day = today.getDate();
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                       "July", "August", "September", "October", "November", "December"];
    const monthName = monthNames[today.getMonth()];
    const year = today.getFullYear();
    const formattedDate = `${day} ${monthName} ${year}`;
    document.getElementById('recordDate').value = formattedDate;

    globalState.kids = []
    globalState.fatherEvents = []
    globalState.motherEvents = []

    // Clear any error messages
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => error.remove());

    // Remove error styling
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(field => field.classList.remove('error'));
}

// Save record
export async function saveRecord() {
    // Validate form
    if (!validateForm()) {
        alert('Please fill in all required fields before saving.');
        return;
    }

    // Collect form data
    const formData = collectFormData();

    // Save to Firestore
    const success = await saveToFirestore(formData);

    if (success) {
        alert('Record saved successfully!');
    } else {
        alert('Failed to save record. Please try again.');
    }
}

// Populate form with data
export function populateForm(data) {
    formHasBeenPopulated.val = true
    if (!data) return;

    clearForm(false)

    document.getElementById('recordId').innerHTML = data.recordId;

    if (data.fatherName) document.getElementById('fatherName').value = data.fatherName
    if (data.motherName) document.getElementById('motherName').value = data.motherName

    // Populate basic fields
    if (data.recordDate) document.getElementById('recordDate').value = data.recordDate;
    if (data.father) {
        if (data.father.name) document.getElementById('fatherFullName').value = data.father.name;
        if (data.father.father) document.getElementById('fatherFather').value = data.father.father;
        if (data.father.mother) document.getElementById('fatherMother').value = data.father.mother;
        if (data.father.fatherSource) document.getElementById('fatherFatherSource').value = data.father.fatherSource.content;
        if (data.father.motherSource) document.getElementById('fatherMotherSource').value = data.father.motherSource.content;
        if (data.father.events) {
            fatherEvents.val = data.father.events
        }
    }
    if (data.mother) {
        if (data.mother.name) document.getElementById('motherFullName').value = data.mother.name;
        if (data.mother.father) document.getElementById('motherFather').value = data.mother.father;
        if (data.mother.mother) document.getElementById('motherMother').value = data.mother.mother;
        if (data.mother.fatherSource) document.getElementById('motherFatherSource').value = data.mother.fatherSource.content;
        if (data.mother.motherSource) document.getElementById('motherMotherSource').value = data.mother.motherSource.content;
        if (data.mother.events) motherEvents.val = data.mother.events
    }
    if (data.children) globalState.kids = data.children;
    if (data.preparer) {
        if (data.preparer.name) document.getElementById('preparerName').value = data.preparer.name;
        if (data.preparer.address) document.getElementById('preparerAddress').value = data.preparer.address;
        if (data.preparer.email) document.getElementById('preparerEmail').value = data.preparer.email;
    }
    if (data.comments) document.getElementById('comments').value = data.comments;
}


