import van from "vanjs-core"

const { div, label, input, select, option, small, button, h3, span, textarea, form } = van.tags

let modalIsShowing = false


export default function EventModal({ title, onClose, onSave, data }) {
    if (modalIsShowing) {
        return null
    }
    modalIsShowing = true

    const startingData = data || {}

    console.log("startingData", startingData)

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
                    select({ id: "eventType", name: "eventType", class: "form-input", value: startingData.eventType || "birth" },
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
                    input({ type: "date", id: "eventDate", name: "eventDate", class: "form-input" }),
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
                    textarea({ id: "eventSources", name: "eventSources", placeholder: "Source citations or references. Include URLs for web sources - they will automatically become clickable links.", class: "form-input" }),
                    small({ class: "form-help" },
                        "Tip: Paste URLs directly into this field. They will automatically become\n                        clickable links when saved.",
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

    for (const [key, value] of Object.entries(startingData)) {
        modalForm.querySelector(`*[name="${key}"]`).value = value
    }

    return modalForm
}
