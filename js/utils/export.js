// ==================== EXPORT UTILITY FUNCTIONS ====================

import { collectFormData } from '../form/formManager.js';
import jsPDF from 'jspdf';
import van from 'vanjs-core';
import { a, br, div, h1, h2, h3, li, p, ul } from '../van/index.js';

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
            if (event.place) content += ` | ${event.place}`;
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
            if (event.place) content += ` | ${event.place}`;
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
export function exportRecordAsPDF() {
    if (!validateForm()) {
        alert('Please fill in all required fields before exporting.');
        return;
    }

    const formData = collectFormData();

    // Create HTML table
    const htmlTable = createHTMLTable(formData);

    document.body.appendChild(htmlTable);

    // Convert to PDF and download
    convertHTMLToPDF(htmlTable, formData);
}

// Create HTML table from form data
function createHTMLTable(data) {
    console.log("::--------><---------::", buildHtml(data));
    return buildHtml(data)
}

function buildHtml(data) {
    return div({class: "pdf"},
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
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
        br(),
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
            td(event.sources),
        ))
    )
)

const ParentInfo = ({ parent }) => div(
    div({ class: "" },
        TableOfEvents({ events: parent.events }),
        ul(
            li(`Father: ${parent.father}`),
            li(`Mother: ${parent.mother}`),
        ),
    ),
)



// Convert HTML to PDF and download
function convertHTMLToPDF(htmlContent, formData) {
    // Create a temporary div to hold the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    document.body.appendChild(tempDiv);

    try {
        // Create new PDF document
        const pdf = new jsPDF();

        
        pdf.html(htmlContent, {
            callback: function (doc) {

                doc.save();
            },
            margin: [10, 10, 10, 10],
            autoPaging: 'text',
            x: 0,
            y: 0,
            width: 190, //target width in the PDF document
            windowWidth: 675 //window width in CSS pixels
        });
        // // Get the content element
        // const contentElement = tempDiv.firstElementChild;

        // // Convert HTML to PDF using html2canvas (we'll need to add this dependency)
        // // For now, let's use a simpler approach with text content
        // const textContent = extractTextFromHTML(htmlContent);

        // // Split text into lines that fit the page
        // const pageHeight = pdf.internal.pageSize.height;
        // const lineHeight = 6;
        // const margin = 20;
        // const maxWidth = pdf.internal.pageSize.width - (margin * 2);

        // let yPosition = margin;
        // const lines = textContent.split('\n');

        // pdf.setFontSize(16);
        // pdf.setFont('helvetica', 'bold');
        // pdf.text('FAMILY GROUP RECORD', maxWidth / 2, yPosition, { align: 'center' });
        // yPosition += 15;

        // pdf.setFontSize(10);
        // pdf.setFont('helvetica', 'normal');

        // lines.forEach(line => {
        //     if (yPosition > pageHeight - margin) {
        //         pdf.addPage();
        //         yPosition = margin;
        //     }

        //     if (line.trim()) {
        //         // Split long lines
        //         const splitLines = pdf.splitTextToSize(line, maxWidth);
        //         splitLines.forEach(splitLine => {
        //             if (yPosition > pageHeight - margin) {
        //                 pdf.addPage();
        //                 yPosition = margin;
        //             }
        //             pdf.text(splitLine, margin, yPosition);
        //             yPosition += lineHeight;
        //         });
        //     } else {
        //         yPosition += lineHeight;
        //     }
        // });

        // // Generate filename
        // const filename = `FamilyGroupRecord_${formData.father.name}_${formData.mother.name}_${new Date().toISOString().split('T')[0]}.pdf`;

        // // Download the PDF
        // pdf.save(filename);

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    } finally {
        // Clean up temporary element
        document.body.removeChild(tempDiv);
    }
}

// Extract text content from HTML for PDF generation
function extractTextFromHTML(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Remove script and style elements
    const scripts = tempDiv.querySelectorAll('script, style');
    scripts.forEach(script => script.remove());

    // Get text content and clean it up
    let text = tempDiv.textContent || tempDiv.innerText || '';

    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();

    // Add some formatting
    text = text.replace(/(FAMILY GROUP RECORD)/g, '\n\n$1\n');
    text = text.replace(/(FATHER:|MOTHER:|CHILDREN|PREPARER|COMMENTS)/g, '\n\n$1');
    text = text.replace(/(Record Date:|Family of:|Parents:|Events:|Name:|Address:|Email:)/g, '\n$1');

    return text;
}

// Export functions that need to be available globally
window.exportRecord = exportRecord;
window.exportRecordAsPDF = exportRecordAsPDF;
