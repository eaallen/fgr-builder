// ==================== EVENT MANAGEMENT ====================

import EventModal from '../components/EventModal.js';
import { autoSave } from '../firestore/firestore.js';
import { formatDateForDisplay, formatDateToISO } from '../utils/date.js';

// Event management functions









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


