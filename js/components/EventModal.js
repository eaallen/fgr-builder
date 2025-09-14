import van from "vanjs-core"
import RichTextEditor from './RichTextEditor.js'
import { debounceAutoSave } from "../firestore/firestore.js"

const { div, label, input, select, option, small, button, h3, span, textarea, form } = van.tags

let modalIsShowing = false


export default function EventModal({ title = "Event Modal", onClose = ()=>{}, onSave, data = {} }) {
    if (modalIsShowing) {
        return null
    }
    modalIsShowing = true

    const modalForm = form({ class: "modal" })

    const remove = () => {
        modalForm.remove()
        onClose()
        modalIsShowing = false
    }


    modalForm.addEventListener("submit", (e) => {
        e.preventDefault()
        const formData = new FormData(modalForm)

        const data = {}
        for (const [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
            data[key] = value
        }

        // Handle custom event type: if "other" is selected and custom input has value, use custom value
        if (data.eventType === "other" && data.customEventType && data.customEventType.trim()) {
            data.eventType = data.customEventType.trim()
        }
        // Remove the customEventType from the final data as it's not needed
        delete data.customEventType

        onSave(data)
        debounceAutoSave()
        remove()
    })

    // Add event listener for showing/hiding custom event type input
    modalForm.addEventListener("change", (e) => {
        if (e.target.id === "eventType") {
            const customInput = modalForm.querySelector("#customEventType")
            if (customInput) {
                if (e.target.value === "other") {
                    customInput.style.display = "block"
                    customInput.focus()
                } else {
                    customInput.style.display = "none"
                    customInput.value = "" // Clear the custom input when switching away from "other"
                }
            }
        }
    })

    // remove this
    modalForm.style.display = 'block'

    modalForm.replaceChildren(
        div({ class: "modal-content" },
            div({ class: "modal-header" },
                h3(title),
                span({ class: "close", onclick: () => remove() },
                    "×",
                ),
            ),
            div({ class: "modal-body" },
                div({ class: "form-group" },
                    label({ for: "eventType" },
                        "Event Type:",
                    ),
                    select({ id: "eventType", name: "eventType", class: "form-input", value: data.eventType || "birth" },
                        option({ value: "birth" },
                            "Birth",
                        ),
                        option({ value: "baptism" },
                            "Baptism",
                        ),
                        option({ value: "christening" },
                            "Christening",
                        ),
                        option({ value: "marriage" },
                            "Marriage",
                        ),
                        option({ value: "divorce" },
                            "Divorce",
                        ),
                        option({ value: "death" },
                            "Death",
                        ),
                        option({ value: "burial" },
                            "Burial",
                        ),
                        option({ value: "census" },
                            "Census",
                        ),
                        option({ value: "residence" },
                            "Residence",
                        ),
                        option({ value: "occupation" },
                            "Occupation",
                        ),
                        option({ value: "military" },
                            "Military",
                        ),
                        option({ value: "other" },
                            "Other",
                        ),
                    ),
                    // Custom event type input that appears when "Other" is selected
                    input({ 
                        type: "text", 
                        id: "customEventType", 
                        name: "customEventType", 
                        placeholder: "Enter custom event type...", 
                        class: "form-input custom-event-type-input",
                        style: "display: none; margin-top: 8px;"
                    }),
                ),
                div({ class: "form-group" },
                    label({ for: "eventDate" },
                        "Date:",
                    ),
                    input({ type: "text", id: "eventDate", name: "eventDate", class: "form-input", placeholder: "12 January, 2025", required: true }),
                    small({ class: "form-help" }, "Enter date in format: 12 January 2025, January 2025, or 2025"),
                ),
                div({ class: "form-group" },
                    label({ for: "eventDescription" },
                        "Description:",
                    ),
                    input({ type: "text", id: "eventDescription", name: "eventDescription", placeholder: "Additional details", class: "form-input" }),
                ),
                div({ class: "form-group" },
                    label({ for: "eventSources" },
                        "Source:",
                    ),
                    RichTextEditor({
                        id: "eventSources",
                        name: "eventSources",
                        placeholder: "Source citations or references. Use the toolbar to format text and add links.",
                        class: "form-input",
                        value: data.eventSources || "",
                        onchange: (content) => {
                            // Store the content for form submission
                            const hiddenInput = document.getElementById('eventSourcesHidden')
                            if (hiddenInput) {
                                hiddenInput.value = content
                            }
                        }
                    }),
                    // Hidden input to store the rich text content for form submission
                    input({ 
                        type: "hidden", 
                        id: "eventSourcesHidden", 
                        name: "eventSources",
                        value: data.eventSources || ""
                    }),
                ),
            ),
            div({ class: "modal-footer" },
                button({ type: "button", class: "btn btn-secondary", onclick: () => remove() },
                    "Cancel",
                ),
                button({ type: "submit", class: "btn btn-primary", },
                    "Save",
                ),
            ),
        )
    )

    for (const [key, value] of Object.entries(data)) {
        const element = modalForm.querySelector(`*[name="${key}"]`)
        if (element) {
            if (key === 'eventSources') {
                // Handle rich text editor content
                const hiddenInput = modalForm.querySelector('#eventSourcesHidden')
                if (hiddenInput) {
                    hiddenInput.value = value
                }
                // The rich text editor will be initialized with the value from the props
            } else if (key === 'eventType') {
                // Handle event type and custom event type
                element.value = value
                
                // If the event type is not one of the predefined options, treat it as custom
                const predefinedOptions = ['birth', 'baptism', 'christening', 'marriage', 'divorce', 'death', 'burial', 'census', 'residence', 'occupation', 'military', 'other']
                if (!predefinedOptions.includes(value)) {
                    // Set select to "other" and show custom input with the custom value
                    element.value = 'other'
                    const customInput = modalForm.querySelector('#customEventType')
                    if (customInput) {
                        customInput.value = value
                        customInput.style.display = 'block'
                    }
                }
            } else {
                element.value = value
            }
        }
    }

    return modalForm
}
