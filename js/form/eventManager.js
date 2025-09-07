// ==================== EVENT MANAGEMENT ====================

import EventModal from '../components/EventModal.js';
import { autoSave } from '../firestore/firestore.js';
import { generateChildId, generateSpouseId } from '../utils/uuid.js';

let currentEventContainer = null;
let currentEventIndex = null;

// Event management functions
export function addEvent(containerId) {
    currentEventContainer = containerId;
    currentEventIndex = null;
    
    // Clear modal form
    clearEventModal();
    
    // Show modal
    document.getElementById('eventModal').style.display = 'block';
}

export function editEvent(editButton) {
    const eventItem = editButton.closest('.event-item');
    
    // Extract event data from the DOM
    const eventType = eventItem.querySelector('.event-type').textContent.toLowerCase();
    const eventDate = eventItem.querySelector('.event-date').textContent;
    const eventPlace = eventItem.querySelector('.event-place')?.textContent || '';
    const eventDescription = eventItem.querySelector('.event-description')?.textContent || '';
    
    // Get raw sources (without HTML links) for editing
    const eventSourcesElement = eventItem.querySelector('.event-sources');
    const eventSources = eventSourcesElement ? extractRawSources(eventSourcesElement.innerHTML).trim() : '';
    
    // // Populate modal form
    // document.getElementById('eventType').value = eventType;
    // document.getElementById('eventDate').value = eventDate;
    // document.getElementById('eventPlace').value = eventPlace;
    // document.getElementById('eventDescription').value = eventDescription;
    // document.getElementById('eventSources').value = eventSources;
    
    // // Show modal
    // document.getElementById('eventModal').style.display = 'block';

    EventModal({
        title: "Edit Event",
        onClose: () => {
            console.log("EventModal closed");
        },
        onSave: () => {
            saveEvent(saveButton);
            console.log("EventModal saved");
        }
    })
}

export function saveEvent(saveButton) {
    const eventType = document.getElementById('eventType').value;
    const eventDate = document.getElementById('eventDate').value;
    const eventDescription = document.getElementById('eventDescription').value;
    const eventPlace = document.getElementById('eventPlace').value;
    const eventSources = document.getElementById('eventSources').value;


    const eventItem = saveButton.closest('.event-item');
    
    // Validate required fields
    if (!eventType || !eventDate) {
        alert('Please fill in at least the event type and date.');
        return;
    }
    
    const eventData = {
        type: eventType,
        date: eventDate,
        description: eventDescription,
        place: eventPlace,
        sources: eventSources
    };
    
    if (eventItem) {
        console.log("EDIT eventItem", eventItem);
        // Edit existing event
        updateEventInDOM(currentEventContainer, eventItem, eventData);
    } else {
        // Add new event
        console.log("ADD eventItem", eventItem);
        addEventToDOM(currentEventContainer, eventData);
    }

    autoSave()
    
    closeEventModal();
}

function addEventToDOM(containerId, eventData) {
    const eventsList = document.getElementById(containerId);
    const eventItem = createEventElement(eventData);
    eventsList.appendChild(eventItem);
}

function updateEventInDOM(containerId, eventItem, eventData) {
    const eventsList = document.getElementById(containerId);
    eventsList.replaceChild(eventItem, eventItem);
}

function createEventElement(eventData) {
    const eventDiv = document.createElement('div');
    eventDiv.className = 'event-item';
    
    const formattedDate = formatDate(eventData.date);
    const eventType = eventData.type.charAt(0).toUpperCase() + eventData.type.slice(1);
    const formattedSources = formatSourcesWithLinks(eventData.sources || '');
    const hasSources = eventData.sources && eventData.sources.trim();
    const sourcesId = 'sources-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    eventDiv.innerHTML = `
        <div class="event-header">
            <div class="event-type">${eventType}</div>
            <div class="event-actions">
                <button type="button" class="btn-small btn-edit" onclick="editEvent(this)">Edit</button>
                <button type="button" class="btn-small btn-delete" onclick="deleteEvent(this)">Delete</button>
            </div>
        </div>
        <div class="event-content">
            <div class="event-date">${formattedDate}</div>
            ${eventData.description ? `<div class="event-description">${eventData.description}</div>` : ''}
            ${eventData.place ? `<div class="event-place">${eventData.place}</div>` : ''}
            ${hasSources ? `
                <div class="sources-container">
                    <div class="event-sources collapsed" id="${sourcesId}">
                        ${formattedSources}
                    </div>
                    <button type="button" class="sources-toggle" onclick="toggleSources('${sourcesId}')">Show more</button>
                </div>
            ` : ''}
        </div>
    `;
    
    return eventDiv;
}

export function deleteEvent(button) {
    if (confirm('Are you sure you want to delete this event?')) {
        const eventItem = button.closest('.event-item');
        eventItem.remove();
        autoSave()
    }
}

export function closeEventModal() {
    document.getElementById('eventModal').style.display = 'none';
    clearEventModal();
}

function clearEventModal() {
    document.getElementById('eventType').value = 'birth';
    document.getElementById('eventDate').value = '';
    document.getElementById('eventDescription').value = '';
    document.getElementById('eventPlace').value = '';
    document.getElementById('eventSources').value = '';
}

// Toggle sources expansion
export function toggleSources(sourcesId) {
    const sourcesElement = document.getElementById(sourcesId);
    const toggleButton = sourcesElement.nextElementSibling;
    
    if (sourcesElement.classList.contains('collapsed')) {
        sourcesElement.classList.remove('collapsed');
        sourcesElement.classList.add('expanded');
        toggleButton.textContent = 'Show less';
    } else {
        sourcesElement.classList.remove('expanded');
        sourcesElement.classList.add('collapsed');
        toggleButton.textContent = 'Show more';
    }
}

// Date formatting
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format sources with clickable links
function formatSourcesWithLinks(sources) {
    if (!sources) return '';
    
    // URL regex pattern to match various URL formats
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    return sources.replace(urlRegex, (url) => {
        // Clean up the URL (remove trailing punctuation)
        const cleanUrl = url.replace(/[.,;:!?]+$/, '');
        const displayUrl = cleanUrl.length > 50 ? cleanUrl.substring(0, 50) + '...' : cleanUrl;
        
        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="source-link">${displayUrl}</a>`;
    });
}

// Extract raw sources from HTML (for editing)
function extractRawSources(htmlSources) {
    if (!htmlSources) return '';
    
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlSources;
    
    // Replace all links with their href values
    const links = tempDiv.querySelectorAll('a.source-link');
    links.forEach(link => {
        const href = link.getAttribute('href');
        link.replaceWith(href);
    });
    
    return tempDiv.textContent || tempDiv.innerText || '';
}

// Export functions that need to be available globally
