import { div } from "../van";

/**
 * VStack Component - Similar to SwiftUI's VStack
 * Arranges children vertically using CSS flexbox
 * 
 * @param {Object} props - Component props
 * @param {number|string} props.spacing - Spacing between children (default: 0)
 * @param {string} props.alignment - Horizontal alignment: 'leading', 'center', 'trailing' (default: 'center')
 * @param {string} props.verticalAlignment - Vertical alignment: 'top', 'center', 'bottom' (default: 'center')
 * @param {string} props.class - Additional CSS classes
 * @param {string} props.style - Additional inline styles
 * @param {...HTMLElement} children - Child elements
 * @returns {HTMLElement} The VStack element
 */
export default function VStack({
    spacing = 10,
    alignment = 'center',
    verticalAlignment = 'center',
    class: className = '',
    style: inlineStyle = '',
} = {}, ...children) {
    
    // Map SwiftUI alignment to CSS align-items
    const alignmentMap = {
        'leading': 'flex-start',
        'center': 'center',
        'trailing': 'flex-end',
    };

    const alignItems = alignmentMap[alignment] || 'center';

    // Map vertical alignment to CSS justify-content (main axis for column)
    const verticalAlignmentMap = {
        'top': 'flex-start',
        'center': 'center',
        'bottom': 'flex-end',
    };

    const justifyContent = verticalAlignmentMap[verticalAlignment] || 'center';

    // Build style string
    const style = `
        display: flex;
        flex-direction: column;
        gap: ${typeof spacing === 'number' ? `${spacing}px` : spacing};
        align-items: ${alignItems};
        justify-content: ${justifyContent};
        ${inlineStyle}
    `.trim();

    return div({
        class: className,
        style,
    }, ...children);
}
