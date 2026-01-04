import van from "vanjs-core"
import RichTextEditor from './RichTextEditor.js'

const { input, div } = van.tags

/**
 * TextEditor Component
 * Combines RichTextEditor with a hidden input for form submission
 * 
 * @param {Object} props - Component props
 * @param {string} [props.id] - ID for the rich text editor (hidden input will be {id}Hidden)
 * @param {string} [props.name] - Name attribute for the hidden input (used in form submission)
 * @param {string} [props.placeholder] - Placeholder text for the editor
 * @param {string} [props.class] - CSS class for the editor
 * @param {string} [props.value] - Initial value/content
 * @param {Function} [props.onchange] - Optional callback when content changes
 * @returns {HTMLElement} Container div with editor and hidden input
 */
export default function TextEditor({
    id,
    name,
    placeholder = "",
    class: className = "",
    value = "",
    onchange = () => {}
}) {

    const hiddenInput = input({
        type: "hidden",
        name: name,
        value: value || ""
    })
    
    const handleChange = (content) => {
        hiddenInput.value = content
        onchange(content)
    }
    
    return div(
        RichTextEditor({
            id: id,
            name: name,
            placeholder: placeholder,
            class: className,
            value: value,
            onchange: handleChange
        }),
        // Hidden input to store the rich text content for form submission
        hiddenInput
    )
}
