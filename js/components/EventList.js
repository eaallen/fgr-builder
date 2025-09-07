import van from "vanjs-core"
import EventModal from './EventModal.js'
import { formatDateToISO } from '../utils/date.js'

const { div, button, h3, span, p } = van.tags

// State management
const events = van.state([])

// Event List Component
export default function EventList({ containerId = "events-container" }) {
    // Generate unique ID for this event list instance
    const listId = containerId + "-" + Date.now()
    
    // Add event function
    const addEvent = () => {
        const modal = EventModal({
            title: "Add Event",
            onClose: () => {
                modal.remove()
            },
            onSave: (data) => {
                const newEvent = {
                    id: Date.now().toString(),
                    type: data.eventType,
                    date: data.eventDate,
                    description: data.eventDescription || '',
                    place: data.eventPlace || '',
                    sources: data.eventSources || ''
                }
                events.val = [...events.val, newEvent]
                modal.remove()
            }
        })
        document.body.appendChild(modal)
    }

    // Edit event function
    const editEvent = (eventId) => {
        const event = events.val.find(e => e.id === eventId)
        if (!event) return

        const modal = EventModal({
            title: "Edit Event",
            data: {
                eventType: event.type,
                eventDate: formatDateToISO(event.date),
                eventDescription: event.description,
                eventPlace: event.place,
                eventSources: event.sources
            },
            onClose: () => {
                modal.remove()
            },
            onSave: (data) => {
                events.val = events.val.map(e => 
                    e.id === eventId 
                        ? {
                            ...e,
                            type: data.eventType,
                            date: data.eventDate,
                            description: data.eventDescription || '',
                            place: data.eventPlace || '',
                            sources: data.eventSources || ''
                        }
                        : e
                )
                modal.remove()
            }
        })
        document.body.appendChild(modal)
    }

    // Delete event function
    const deleteEvent = (eventId) => {
        if (confirm('Are you sure you want to delete this event?')) {
            events.val = events.val.filter(e => e.id !== eventId)
        }
    }

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC'
        })
    }

    // Format sources with clickable links
    const formatSourcesWithLinks = (sources) => {
        if (!sources) return ''
        const urlRegex = /(https?:\/\/[^\s]+)/g
        return sources.replace(urlRegex, (url) => {
            const cleanUrl = url.replace(/[.,;:!?]+$/, '')
            const displayUrl = cleanUrl.length > 50 ? cleanUrl.substring(0, 50) + '...' : cleanUrl
            return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="source-link">${displayUrl}</a>`
        })
    }

    // Toggle sources expansion
    const toggleSources = (sourcesId) => {
        const sourcesElement = document.getElementById(sourcesId)
        const toggleButton = sourcesElement?.nextElementSibling
        
        if (sourcesElement && toggleButton) {
            if (sourcesElement.classList.contains('collapsed')) {
                sourcesElement.classList.remove('collapsed')
                sourcesElement.classList.add('expanded')
                toggleButton.textContent = 'Show less'
            } else {
                sourcesElement.classList.remove('expanded')
                sourcesElement.classList.add('collapsed')
                toggleButton.textContent = 'Show more'
            }
        }
    }

    // Create event item element
    const createEventItem = (event) => {
        const eventType = event.type.charAt(0).toUpperCase() + event.type.slice(1)
        const formattedDate = formatDate(event.date)
        const formattedSources = formatSourcesWithLinks(event.sources || '')
        const hasSources = event.sources && event.sources.trim()
        const sourcesId = `sources-${event.id}`

        return div({ class: "event-item" },
            div({ class: "event-header" },
                div({ class: "event-type" }, eventType),
                div({ class: "event-actions" },
                    button({ 
                        type: "button", 
                        class: "btn-small btn-edit", 
                        onclick: () => editEvent(event.id) 
                    }, "Edit"),
                    button({ 
                        type: "button", 
                        class: "btn-small btn-delete", 
                        onclick: () => deleteEvent(event.id) 
                    }, "Delete")
                )
            ),
            div({ class: "event-content" },
                div({ class: "event-date" }, formattedDate),
                event.description ? div({ class: "event-description" }, event.description) : null,
                event.place ? div({ class: "event-place" }, event.place) : null,
                hasSources ? div({ class: "sources-container" },
                    div({ 
                        class: "event-sources collapsed", 
                        id: sourcesId,
                        innerHTML: formattedSources
                    }),
                    button({ 
                        type: "button", 
                        class: "sources-toggle", 
                        onclick: () => toggleSources(sourcesId) 
                    }, "Show more")
                ) : null
            )
        )
    }

    // Main component structure
    return div({ id: listId, class: "event-list-container" },
        div({ class: "event-list-header" },
            h3({}, "Events"),
            button({ 
                type: "button", 
                class: "btn btn-primary", 
                onclick: addEvent 
            }, "Add Event")
        ),
        div({ class: "event-list" },
            van.tags(() => 
                events.val.length === 0 
                    ? p({ class: "no-events" }, "No events added yet. Click 'Add Event' to get started.")
                    : events.val.map(event => createEventItem(event))
            )
        )
    )
}

// Export the events state for external access if needed
export { events }
