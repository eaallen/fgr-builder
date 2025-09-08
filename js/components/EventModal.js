import van from "vanjs-core"
import RichTextEditor from './RichTextEditor.js'

const { div, label, input, select, option, small, button, h3, span, textarea, form } = van.tags

let modalIsShowing = false


export default function EventModal({ title = "Event Modal", onClose = ()=>{}, onSave, data = {} }) {
    if (modalIsShowing) {
        return null
    }
    modalIsShowing = true

    console.log("startingData", data)

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


        console.log("data------>", data)
        onSave(data)
        remove()
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
                ),
                div({ class: "form-group" },
                    label({ for: "eventDate" },
                        "Date:",
                    ),
                    input({ type: "date", id: "eventDate", name: "eventDate", class: "form-input", required: true }),
                ),
                div({ class: "form-group" },
                    label({ for: "eventDescription" },
                        "Description:",
                    ),
                    input({ type: "text", id: "eventDescription", name: "eventDescription", placeholder: "Additional details", class: "form-input" }),
                ),
                div({ class: "form-group" },
                    label({ for: "eventPlace" },
                        "Place:",
                    ),
                    input({ type: "text", id: "eventPlace", name: "eventPlace", placeholder: "Location", class: "form-input" }),
                ),
                div({ class: "form-group" },
                    label({ for: "eventSources" },
                        "Sources:",
                    ),
                    RichTextEditor({
                        id: "eventSources",
                        name: "eventSources",
                        placeholder: "Source citations or references. Use the toolbar to format text and add links.",
                        class: "form-input",
                        value: data.eventSources || "",
                        onchange: (content) => {
                            // Store the content for form submission
                            console.log("content------>", content)
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
                    small({ class: "form-help" },
                        "Use the toolbar to format text, add links, and paste content with embedded links.",
                    ),
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
            } else {
                element.value = value
            }
        }
    }

    return modalForm
}
