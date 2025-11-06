import van from "vanjs-core"
import * as vanX from 'vanjs-ext'
import EventModal from './EventModal.js'
import { eventsByDate } from '../utils/date.js'

const { div, button, h3, p } = van.tags

// State management

// Event List Component
export default function EventList(eventState) {
    const events = eventState
    // Generate unique ID for this event list instance

    // Add event function
    const addEvent = () => {
        const modal = EventModal({
            title: "Add Event",
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
            }
        })
        document.body.appendChild(modal)
    }

    // Edit event function
    const editEvent = (eventId) => {
        const event = events.val.find(e => e.id === eventId)
        if (!event) return

        const modal = EventModal({
            title: "✍️ Edit Event",
            data: {
                eventType: event.type,
                eventDate: event.date,
                eventDescription: event.description,
                eventPlace: event.place,
                eventSources: event.sources
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
        const formattedDate =  event.date
        const formattedSources = (event.sources || '')
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


    const eventsList = van.derive(() => {
        const sortedEvents = [...events.val].sort(eventsByDate)

        return div({ class: "events-list" },
            ...sortedEvents.map(event => createEventItem(event)),
            events.val.length === 0
                ? p({ class: "no-events" }, "No events added yet. Click 'Add Event' to get started.")
                : null
        )
    })

    return div({ class: "event-list-container" },
        div({ class: "event-list-header" },
            h3({}, "Events"),
            button({
                type: "button",
                class: "add-event-btn",
                onclick: addEvent
            }, "+ Add Event")
        ),
        () => eventsList.val
    )
}


export function EventListVersion2() {
    const childrenState = vanX.reactive({ kids: [{ events: [] }] })

    // Generate unique ID for this event list instance

    // Add event function
    const addEvent = () => {
        const modal = EventModal({
            title: "Add Event",
            onSave: (data) => {
                const newEvent = {
                    id: Date.now().toString(),
                    type: data.eventType,
                    date: data.eventDate,
                    description: data.eventDescription || '',
                    place: data.eventPlace || '',
                    sources: data.eventSources || ''
                }
                childrenState.kids[0].events = [...childrenState.kids, { events: [...childrenState.kids[0].events, newEvent] }]
            }
        })
        document.body.appendChild(modal)
    }

    // Edit event function
    const editEvent = (eventId) => {
        const event = events.val.find(e => e.id === eventId)
        if (!event) return

        const modal = EventModal({
            title: "✍️ Edit Event",
            data: {
                eventType: event.type,
                eventDate: event.date,
                eventDescription: event.description,
                eventPlace: event.place,
                eventSources: event.sources
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
        const formattedDate = event.date
        const formattedSources = (event.sources || '')
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


    const eventsList = van.derive(() => {
        // Sort events by date (most recent first)
        const sortedEvents = [...events.val].sort((a, b) => {
            const dateA = new Date(a.date || '1900-01-01')
            const dateB = new Date(b.date || '1900-01-01')
            return dateA - dateB
        })

        return div({ class: "event-list" },
            ...sortedEvents.map(event => createEventItem(event)),
            events.val.length === 0
                ? p({ class: "no-events" }, "No events added yet. Click 'Add Event' to get started.")
                : null
        )
    })

    return div({ class: "event-list-container" },
        div({ class: "event-list-header" },
            h3({}, "Events"),
            button({
                type: "button",
                class: "add-event-btn",
                onclick: addEvent
            }, "+ Add Event")
        ),
        () => eventsList.val
    )
}
