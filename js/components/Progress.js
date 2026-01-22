import { progress } from "../van";

/**
 * Progress Component
 * A simple progress bar using the HTML progress element
 * 
 * @param {Object} props - Component props
 * @param {number} props.value - Current progress value (default: 0)
 * @param {number} props.max - Maximum value (default: 100)
 * @param {string} props.id - Element ID
 * @param {string} props.class - Additional CSS classes
 * @param {string} props.style - Additional inline styles
 * @returns {HTMLElement} The Progress element
 */
export default function Progress({
    value = 0,
    max = 100,
    id = '',
    class: className = '',
    style: inlineStyle = '',
} = {}) {
    // Calculate percentage for the text content
    const percentage = Math.round((value / max) * 100);
    
    return progress({
        id: id || undefined,
        max: max,
        value: value,
        class: className,
        style: inlineStyle,
    }, `${percentage}%`);
}
