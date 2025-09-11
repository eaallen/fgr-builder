// ==================== EXPORT UTILITY FUNCTIONS ====================

import { collectFormData } from '../form/formManager.js';
import jsPDF from 'jspdf';
import van from 'vanjs-core';
import { a, br, div, h1, h2, h3, li, p, span, sup, ul } from '../van/index.js';

const { caption, table, tbody, td, tfoot, th, thead, tr } = van.tags

// Export record as text file
export function exportRecord() {
    if (!validateForm()) {
        alert('Please fill in all required fields before exporting.');
        return;
    }

    const formData = collectFormData();

    // Create a formatted text version
    const textContent = formatRecordAsText(formData);

    // Create and download file
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FamilyGroupRecord_${formData.father.name}_${formData.mother.name}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Format record as text
function formatRecordAsText(data) {
    let content = `FAMILY GROUP RECORD\n`;
    content += `Record Date: ${data.recordDate}\n`;
    content += `Family of ${data.father.name} and ${data.mother.name}\n\n`;

    // Father section
    content += `FATHER: ${data.father.name}\n`;
    if (data.father.father) content += `  Father: ${data.father.father}\n`;
    if (data.father.mother) content += `  Mother: ${data.father.mother}\n`;
    if (data.father.events.length > 0) {
        content += `  Events:\n`;
        data.father.events.forEach(event => {
            content += `    ${event.type.toUpperCase()}: ${event.date}`;
            if (event.description) content += ` | ${event.description}`;
            if (event.sources) content += ` | Sources: ${event.sources}`;
            content += `\n`;
        });
    }
    content += `\n`;

    // Mother section
    content += `MOTHER: ${data.mother.name}\n`;
    if (data.mother.father) content += `  Father: ${data.mother.father}\n`;
    if (data.mother.mother) content += `  Mother: ${data.mother.mother}\n`;
    if (data.mother.events.length > 0) {
        content += `  Events:\n`;
        data.mother.events.forEach(event => {
            content += `    ${event.type.toUpperCase()}: ${event.date}`;
            if (event.description) content += ` | ${event.description}`;
            if (event.sources) content += ` | Sources: ${event.sources}`;
            content += `\n`;
        });
    }
    content += `\n`;

    // Children section
    if (data.children.length > 0) {
        content += `CHILDREN:\n`;
        data.children.forEach((child, index) => {
            content += `  ${index + 1}. ${child.name}`;
            if (child.spouses.length > 0) {
                content += ` (Spouses: ${child.spouses.join(', ')})`;
            }
            content += `\n`;
        });
        content += `\n`;
    }

    // Preparer section
    content += `PREPARER:\n`;
    content += `  Name: ${data.preparer.name}\n`;
    if (data.preparer.address) content += `  Address: ${data.preparer.address}\n`;
    if (data.preparer.email) content += `  Email: ${data.preparer.email}\n`;
    content += `\n`;

    // Comments section
    if (data.comments) {
        content += `COMMENTS:\n${data.comments}\n`;
    }

    content += `\nGenerated on: ${new Date().toLocaleString()}`;

    return content;
}

// Import validateForm function
function validateForm() {
    const requiredFields = [
        'fatherFullName',
        'motherFullName',
        'preparerName',
        'preparerEmail'
    ];

    let isValid = true;

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            isValid = false;
        }
    });

    return isValid;
}

// Export record as PDF
export async function exportRecordAsPDF() {
    if (!validateForm()) {
        alert('Please fill in all required fields before exporting.');
        return;
    }

    const formData = collectFormData();

    // Create HTML table

    // Convert to PDF and download
    await convertHTMLToPDF(formData);
}

function buildHtml(data) {
    return div({ class: "pdf", id: "to-print" },
        h1({ class: "family-header-for-pdf", id: "pdf-header" }, "Family of " + data.father.name + " and " + data.mother.name),
        p({ class: "subtitle" }, "Family Group Record"),
        p({ class: "" }, "Record Date: " + data.recordDate),
        p({ class: "" }, "Prepared by: " + data.preparer.name),
        br(),
        h2(`Father: ${data.father.name}`),
        ParentInfo({ parent: data.father }),
        h2(`Mother: ${data.mother.name}`),
        ParentInfo({ parent: data.mother }),
        h2("CHILDREN"),
        data.children.map(child => div(
            h3(child.name),
            TableOfEvents({ events: child.events }),
            p("Spouses: ", child.spouses && child.spouses.length > 0 ? child.spouses.map(spouse => spouse.name).join(', ') : ''),
        )),
        h2("Comments"),
        p(data.comments),
        PageBreakForPrinting(),
        // Brs({ count: 100 }),
        SourceDescription({ data }),
        a({ href: "#pdf-header" }, "Back to top"),
    )
}

const TableHeader = () => tr(
    th({ width: "20%" }, "Event"),
    th({ width: "40%" }, "Date"),
    th({ width: "40%" }, "Notes"),
)

const TableOfEvents = ({ events }) => table({ class: "exported-table" },
    tbody(
        TableHeader(),
        events.map(event => tr(
            td(event.type.toUpperCase()),
            td(event.date),
            td({ id: sourceNumberId(event.sourceNumber) },

                event.description,
                event.description &&
                sup({ class: "source-number" },
                    a({ href: sourceDescriptionHref(event.sourceNumber) },
                        event.sourceNumber)),
            ),
        ))
    )
)

const sourceNumberId = (sourceNumber) => `source-number-${sourceNumber}`
const sourceNumberHref = (sourceNumber) => `#${sourceNumberId(sourceNumber)}`
const sourceDescriptionId = (sourceNumber) => `source-description-${sourceNumber}`
const sourceDescriptionHref = (sourceNumber) => `#${sourceDescriptionId(sourceNumber)}`

const ParentInfo = ({ parent }) => div(
    div({ class: "" },
        TableOfEvents({ events: parent.events }),
        ul(
            li(`Father: ${parent.father}`),
            li(`Mother: ${parent.mother}`),
        ),
    ),
)

const Br = ({ count = 1 }) => Array.from({ length: count }, () => br())

const PageBreakForPrinting = () => div({ class: "page-break-here" })

const SourceDescription = ({ data }) => {
    const sources = []
    const pushSource = (event) => { sources.push({ content: event.sources, sourceNumber: event.sourceNumber }) }
    data.father.events.forEach(pushSource)
    data.mother.events.forEach(pushSource)
    data.children.forEach(child => { child.events.forEach(pushSource) })

    return div({ class: "source-description-container" },
        h2("Sources"),
        sources.map(source => {
            const para = p({ id: sourceDescriptionId(source.sourceNumber) },
                a({ href: sourceNumberHref(source.sourceNumber) }, sup(source.sourceNumber)),
            )
            const content = span({class: "source-content"})
            content.innerHTML = source.content
            para.appendChild(content)
            return para
        })


    )
}




// Convert HTML to PDF and download
export async function printFGR() {
    const formData = collectFormData();
    const htmlTable = buildHtml(formData);
    document.body.appendChild(htmlTable);
    print()
    // document.body.removeChild(htmlTable);
}


// Export functions that need to be available globally
window.exportRecord = exportRecord;
window.exportRecordAsPDF = exportRecordAsPDF;
window.printFGR = printFGR;
