// ==================== EXPORT UTILITY FUNCTIONS ====================

import { collectFormData } from '../form/formManager.js';
import van from 'vanjs-core';
import { a, br, div, h1, h2, h3, li, p, span, sup, ul } from '../van/index.js';
import { eventsByDate } from '../utils/date.js';

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
export function formatRecordAsText(data) {
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


function buildHtml(data) {
    return div({ class: "pdf", id: "to-print" },
        h1({ class: "family-header-for-pdf", id: "pdf-header" }, "Family of " + data.fatherName + " and " + data.motherName),
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
            p("Spouses: ", child.spouses && child.spouses.length > 1
                ? child.spouses.map(spouse => span({ id: sourceNumberId(spouse.source.sourceNumber) },
                    spouse.name,
                    SourceSuperText({ sourceNumber: spouse.source.sourceNumber, pointsTo: 'description' }),
                    ', '))
                : child.spouses[0]
                    ? span({ id: sourceNumberId(child.spouses[0].source.sourceNumber) },
                        child.spouses[0].name,
                        SourceSuperText({ sourceNumber: child.spouses[0].source.sourceNumber, pointsTo: 'description' }),
                    )
                    : ''
            ),
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
    th({ width: "20%" }, "Date"),
    th({ width: "20%" }, "Event"),
    th({ width: "20%" }, "Place"),
    th({ width: "40%" }, "Notes"),
)

const TableOfEvents = ({ events }) => {
    const sortedEvents = [...events].sort(eventsByDate)
    return table({ class: "exported-table" },
    tbody(
        TableHeader(),
        sortedEvents.map(event => tr(
            td(event.date),
            td(event.type.toUpperCase()),
            td(event.place),
            td({ id: sourceNumberId(event.sourceNumber) },
                event.description,
                sup({ class: "source-number" },
                    a({ href: sourceDescriptionHref(event.sourceNumber) },
                        event.sourceNumber)),
            ),
        ))
    )
)}

const sourceNumberId = (sourceNumber) => `source-number-${sourceNumber}`
const sourceNumberHref = (sourceNumber) => `#${sourceNumberId(sourceNumber)}`
const sourceDescriptionId = (sourceNumber) => `source-description-${sourceNumber}`
const sourceDescriptionHref = (sourceNumber) => `#${sourceDescriptionId(sourceNumber)}`

const SourceSuperText = ({ sourceNumber, pointsTo = 'description' /* description or number */ }) => sourceNumber === 0 ? null : sup({ class: "source-number" },
    a({ href: pointsTo === 'description' ? sourceDescriptionHref(sourceNumber) : sourceNumberHref(sourceNumber) }, sourceNumber)
)

const ParentInfo = ({ parent }) => div(
    div({ class: "" },
        TableOfEvents({ events: parent.events }),
        ul(
            li({ id: sourceNumberId(parent.fatherSource.sourceNumber) }, `Father: ${parent.father}`, SourceSuperText({ sourceNumber: parent.fatherSource.sourceNumber, pointsTo: 'description' })),
            li({ id: sourceNumberId(parent.motherSource.sourceNumber) }, `Mother: ${parent.mother}`, SourceSuperText({ sourceNumber: parent.motherSource.sourceNumber, pointsTo: 'description' })),
        ),
    ),
)

const Br = ({ count = 1 }) => Array.from({ length: count }, () => br())

const PageBreakForPrinting = () => div({ class: "page-break-here" })

const SourceDescription = ({ data }) => {
    const sources = []
    const pushSource = (event) => { sources.push({ content: event.sources, sourceNumber: event.sourceNumber }) }
    data.father.events.forEach(pushSource)

    // have to use sources.push since the data is formatted differently than the events
    sources.push(data.father.fatherSource)
    sources.push(data.father.motherSource)
    data.mother.events.forEach(pushSource)
    sources.push(data.mother.fatherSource)
    sources.push(data.mother.motherSource)
    data.children.forEach(child => {
        child.events.forEach(pushSource)
        child.spouses.forEach(spouse => {
            sources.push({ content: spouse.source.content, sourceNumber: spouse.source.sourceNumber })
        })
    })



    return div({ class: "source-description-container" },
        h2("Sources"),
        sources.filter(source => source.sourceNumber).sort((a, b) => a.sourceNumber - b.sourceNumber).map(source => {
            const para = p({ id: sourceDescriptionId(source.sourceNumber) },
                a({ href: sourceNumberHref(source.sourceNumber) }, sup(source.sourceNumber)),
            )
            const content = span({ class: "source-content" })
            content.innerHTML = source.content
            para.appendChild(content)
            return para
        })


    )
}




// Convert HTML to PDF and download
export async function printFGR() {
    if(!isChromeOnDesktop()) {
        alert("PDF download is only supported on Chrome for desktop. Other browsers may not support the generated links within the PDF.");
    }
    const formData = collectFormData();
    const htmlTable = buildHtml(formData);
    document.body.appendChild(htmlTable);
    print()
    document.body.removeChild(htmlTable);
}

function isChromeOnDesktop() {
    const isChrome = navigator.userAgent.indexOf("Chrome") > -1 &&
                     navigator.userAgent.indexOf("Chromium") === -1 &&
                     navigator.userAgent.indexOf("Edg") === -1 &&
                     navigator.userAgent.indexOf("OPR") === -1;

    const isDesktop = !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) &&
                      navigator.maxTouchPoints === 0;

    return isChrome && isDesktop;
  }


// Export functions that need to be available globally
window.exportRecord = exportRecord;
window.printFGR = printFGR;
