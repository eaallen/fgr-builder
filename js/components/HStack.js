import { div } from "../van";

/**
 * HStack Component - Similar to SwiftUI's HStack
 * Arranges children horizontally using CSS flexbox
 * 
 * @param {Object} props - Component props
 * @param {number|string} props.spacing - Spacing between children (default: 0)
 * @param {string} props.alignment - Vertical alignment: 'top', 'center', 'bottom' (default: 'center')
 * @param {string} props.class - Additional CSS classes
 * @param {string} props.style - Additional inline styles
 * @param {...HTMLElement} children - Child elements
 * @returns {HTMLElement} The HStack element
 */
export default function HStack({
    spacing = 0,
    alignment = 'center',
    class: className = '',
    style: inlineStyle = '',
} = {}, ...children) {
    // Map SwiftUI alignment to CSS align-items
    const alignmentMap = {
        'top': 'flex-start',
        'center': 'center',
        'bottom': 'flex-end',
    };

    const alignItems = alignmentMap[alignment] || 'center';

    // Build style string
    const style = `
        display: flex;
        flex-direction: row;
        gap: ${typeof spacing === 'number' ? `${spacing}px` : spacing};
        align-items: ${alignItems};
        ${inlineStyle}
    `.trim();

    return div({
        class: className,
        style,
    }, ...children);
}
