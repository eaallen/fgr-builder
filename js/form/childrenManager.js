// ==================== CHILDREN MANAGEMENT ====================

import { generateChildId, generateSpouseId } from '../utils/uuid.js';
import { groupBy } from '../utils/array.js';

// Children management functions
export function addChild() {
    const childrenList = document.getElementById('childrenList');
    
    const childId = generateChildId();
    const childDiv = document.createElement('div');
    childDiv.className = 'child-item';
    childDiv.innerHTML = `
        <div class="child-header">
            <input type="text" class="child-name-input" placeholder="Child's Name" id="childName${childId}" name="childName${childId}">
            <div class="child-actions">
                <button class="btn-small btn-delete" onclick="deleteChild(this)">Delete</button>
            </div>
        </div>
        <div class="spouses-section">
            <h5>Spouses</h5>
            <div class="spouses-list" id="spousesList${childId}">
                <!-- Spouses will be added here -->
            </div>
            <button type="button" class="add-spouse-btn" onclick="addSpouse('${childId}')">+ Add Spouse</button>
        </div>
    `;
    
    childrenList.appendChild(childDiv);
}

export function addSpouse(childId) {
    const spousesList = document.getElementById(`spousesList${childId}`);
    
    const spouseDiv = document.createElement('div');
    spouseDiv.className = 'spouse-item';
    spouseDiv.innerHTML = `
        <input type="text" class="spouse-input" placeholder="Spouse's Name" name="spouse_${childId}_${Date.now()}">
        <button class="btn-small btn-delete" onclick="deleteSpouse(this)">Delete</button>
    `;
    
    spousesList.appendChild(spouseDiv);
}

export function deleteSpouse(button) {
    if (confirm('Are you sure you want to delete this spouse?')) {
        const spouseItem = button.closest('.spouse-item');
        spouseItem.remove();
    }
}

export function deleteChild(button) {
    if (confirm('Are you sure you want to delete this child and all their information?')) {
        const childItem = button.closest('.child-item');
        childItem.remove();
    }
}

// Collect children data from form
export function collectChildren() {
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

// Populate children from data
export function populateChildren(children) {
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
                    <button class="btn-small btn-delete" onclick="deleteChild(this)">Delete</button>
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
