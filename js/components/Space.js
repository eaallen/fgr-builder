import { div } from "../van";

/**
 * Space Component - Similar to SwiftUI's Spacer
 * Takes up available space in a flex container
 * 
 * @param {Object} props - Component props
 * @param {number|string} props.minHeight - Minimum height (default: 0)
 * @param {string} props.class - Additional CSS classes
 * @param {string} props.style - Additional inline styles
 * @returns {HTMLElement} The Space element
 */
export default function Space({
    minHeight = 0,
    class: className = '',
    style: inlineStyle = '',
} = {}) {
    // Build style string
    const style = `
        flex: 1 1 auto;
        min-height: ${typeof minHeight === 'number' ? `${minHeight}px` : minHeight};
        ${inlineStyle}
    `.trim();

    return div({
        class: className,
        style,
    });
}
