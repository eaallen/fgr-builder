// ==================== EVENT MANAGEMENT ====================

import EventModal from '../components/EventModal.js';
import { autoSave } from '../firestore/firestore.js';
import { formatDateToISO } from '../utils/date.js';

let currentEventContainer = null;

// Event management functions
export function addEvent(containerId) {
    document.body.appendChild(EventModal({
        title: "Add Event",
        onSave: (data) => {
            const eventsContainer = document.getElementById(containerId)
            eventsContainer.appendChild(createEventElement(
                 {
                    type: data.eventType,
                    date: formatDate(data.eventDate),
                    description: data.eventDescription,
                    place: data.eventPlace,
                    sources: data.eventSources
                }
            ))
            autoSave()
        }
    }))
}

export function editEvent(editButton) {
    console.log("editEvent", editButton)
    const eventItem = editButton.closest('.event-item');

    const eventTypeNode = eventItem.querySelector('.event-type')
    const eventDateNode = eventItem.querySelector('.event-date')
    const eventPlaceNode = eventItem.querySelector('.event-place')
    const eventDescriptionNode = eventItem.querySelector('.event-description')  
    const eventSourcesNode = eventItem.querySelector('.event-sources')
    // Extract event data from the DOM
    const eventType = eventTypeNode.textContent.toLowerCase();
    const eventDate = eventDateNode.textContent;
    const eventPlace = eventPlaceNode.textContent || '';
    const eventDescription = eventDescriptionNode.textContent || '';

    // Get raw sources (without HTML links) for editing
    const eventSourcesElement = eventSourcesNode
    const eventSources = eventSourcesElement ? extractRawSources(eventSourcesElement.innerHTML).trim() : '';

    document.body.appendChild(EventModal({
        title: "Edit Event",
        data: {
            eventType: eventType,
            eventDate: formatDateToISO(eventDate),
            eventDescription: eventDescription,
            eventPlace: eventPlace,
            eventSources: eventSources
        },
        onClose: () => {
            console.log("EventModal closed");
        },
        onSave: (data) => {
            const formattedDate = formatDate(data.eventDate)
            eventDateNode.textContent = formattedDate
            eventTypeNode.textContent = data.eventType
            eventPlaceNode.textContent = data.eventPlace
            eventDescriptionNode.textContent = data.eventDescription
            eventSourcesNode.textContent = data.eventSources

            autoSave()
        }
    }))
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
        day: 'numeric',
        timeZone: 'UTC'
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



