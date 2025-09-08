// ==================== FORM MANAGEMENT ====================

import { generateChildId } from '../utils/uuid.js';
import { validateField, clearFieldError } from '../utils/validation.js';
import { saveToFirestore } from '../firestore/firestore.js';
import van from 'vanjs-core';
import EventList from '../components/EventList.js';
import { debounceAutoSave } from '../firestore/firestore.js';

const fatherEvents = van.state([])
const motherEvents = van.state([])

van.derive(() =>{ 
    console.log("debouncing auto save via van state")
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
    });

    // add events list
    van.add(document.getElementById('fatherEvents'), EventList(fatherEvents))
    van.add(document.getElementById('motherEvents'), EventList(motherEvents))
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
        mother: data.fatherMother || '',
        events: fatherEvents.val
    };
    
    data.mother = {
        name: data.motherFullName || '',
        father: data.motherFather || '',
        mother: data.motherMother || '',
        events: motherEvents.val
    };
    
    data.children = collectChildren();
    
    data.preparer = {
        name: data.preparerName || '',
        address: data.preparerAddress || '',
        email: data.preparerEmail || ''
    };
    
    // Add metadata
    data.created = new Date().toISOString();
    
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
export function clearForm() {
    if (confirm('Are you sure you want to clear all form data? This action cannot be undone.')) {
        // Clear all input fields
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.type !== 'date' || input.id === 'recordDate') {
                input.value = '';
            }
        });
        
        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('recordDate').value = today;
        
        // Clear all events
        const eventContainers = ['fatherEvents', 'motherEvents'];
        eventContainers.forEach(containerId => {
            document.getElementById(containerId).innerHTML = '';
        });
        
        // Clear all children
        document.getElementById('childrenList').innerHTML = '';
        
        // Clear any error messages
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(error => error.remove());
        
        // Remove error styling
        const errorFields = document.querySelectorAll('.error');
        errorFields.forEach(field => field.classList.remove('error'));
    }
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
    if (!data) return;

    if(data.fatherName) document.getElementById('fatherName').value = data.fatherName
    if(data.motherName) document.getElementById('motherName').value = data.motherName
    
    // Populate basic fields
    if (data.recordDate) document.getElementById('recordDate').value = data.recordDate;
    if (data.father) {
        if (data.father.name) document.getElementById('fatherFullName').value = data.father.name;
        if (data.father.father) document.getElementById('fatherFather').value = data.father.father;
        if (data.father.mother) document.getElementById('fatherMother').value = data.father.mother;
        if (data.father.events) {
            fatherEvents.val = data.father.events
        }
    }
    if (data.mother) {
        if (data.mother.name) document.getElementById('motherFullName').value = data.mother.name;
        if (data.mother.father) document.getElementById('motherFather').value = data.mother.father;
        if (data.mother.mother) document.getElementById('motherMother').value = data.mother.mother;
        if (data.mother.events) motherEvents.val = data.mother.events
    }
    if (data.children) populateChildren(data.children);
    if (data.preparer) {
        if (data.preparer.name) document.getElementById('preparerName').value = data.preparer.name;
        if (data.preparer.address) document.getElementById('preparerAddress').value = data.preparer.address;
        if (data.preparer.email) document.getElementById('preparerEmail').value = data.preparer.email;
    }
    if (data.comments) document.getElementById('comments').value = data.comments;
}

// Collect events from a container
function collectEvents(containerId) {
    const events = [];
    const eventsList = document.getElementById(containerId);
    
    Array.from(eventsList.children).forEach(eventItem => {
        const event = {
            type: eventItem.querySelector('.event-type').textContent.toLowerCase(),
            date: eventItem.querySelector('.event-date').textContent,
            place: eventItem.querySelector('.event-place')?.textContent || '',
            description: eventItem.querySelector('.event-description')?.textContent || '',
            sources: eventItem.querySelector('.event-sources')?.textContent || ''
        };
        events.push(event);
    });

    console.log("events", events);
    
    return events;
}

// Collect children data
function collectChildren() {
    const children = [];
    const childrenList = document.getElementById('childrenList');
    
    Array.from(childrenList.children).forEach(childItem => {
        const childName = childItem.querySelector('.child-name-input').value;
        const spouses = [];
        
        const spousesList = childItem.querySelector('.spouses-list');
        Array.from(spousesList.children).forEach(spouseItem => {
            const spouseName = spouseItem.querySelector('.spouse-input').value;
            if (spouseName.trim()) {
                spouses.push(spouseName);
            }
        });
        
        if (childName.trim()) {
            children.push({
                name: childName,
                spouses: spouses
            });
        }
    });
    
    return children;
}

// Populate children
function populateChildren(children) {
    const childrenList = document.getElementById('childrenList');
    childrenList.innerHTML = '';
    
    children.forEach(childData => {
        const childId = generateChildId();
        const childDiv = document.createElement('div');
        childDiv.id = `child${childId}`;
        childDiv.className = 'child-item';
        childDiv.innerHTML = `
            <div class="child-header">
                <input type="text" class="child-name-input" placeholder="Child's Name" value="${childData.name || ''}" id="childName${childId}" name="childName${childId}">
                <div class="child-actions">
                    <button type="button" class="btn-small btn-delete" onclick="deleteChild(this)">Delete</button>
                </div>
            </div>
            <div class="spouses-section">
                <h5>Spouses</h5>
                <div class="spouses-list" id="spousesList${childId}">
                    ${childData.spouses ? childData.spouses.map((spouse, index) => `
                        <div class="spouse-item">
                            <input type="text" class="spouse-input" placeholder="Spouse's Name" value="${spouse}" name="spouse_${childId}_${index}">
                            <button class="btn-small btn-delete" onclick="deleteSpouse(this)">Delete</button>
                        </div>
                    `).join('') : ''}
                </div>
                <button type="button" class="add-spouse-btn" onclick="addSpouse('${childId}')">+ Add Spouse</button>
            </div>
        `;
        childrenList.appendChild(childDiv);
    });
}
