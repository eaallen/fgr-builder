import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } from "docx";
import { saveAs } from "file-saver";
import { collectFormData } from '../form/formManager.js';
import { eventsByDate } from '../utils/date.js';

export async function exportToDocx() {
    // Validate form
    const requiredFields = ['fatherFullName', 'motherFullName', 'preparerName', 'preparerEmail'];
    let isValid = true;
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            isValid = false;
        }
    });

    if (!isValid) {
        alert('Please fill in all required fields before exporting.');
        return;
    }

    const formData = collectFormData();
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: buildDocxContent(formData),
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    const fatherName = formData.fatherName || formData.father?.name || 'Unknown';
    const motherName = formData.motherName || formData.mother?.name || 'Unknown';
    const fileName = `FamilyGroupRecord_${fatherName}_${motherName}_${new Date().toISOString().split('T')[0]}.docx`;
    saveAs(blob, fileName);
}

function buildDocxContent(data) {
    const children = [];

    // Title
    children.push(
        new Paragraph({
            text: "FAMILY GROUP RECORD",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
        })
    );

    // Record Date
    if (data.recordDate) {
        children.push(
            new Paragraph({
                text: `Record Date: ${data.recordDate}`,
                spacing: { after: 100 },
            })
        );
    }

    // Family header
    const fatherName = data.fatherName || data.father?.name || '';
    const motherName = data.motherName || data.mother?.name || '';
    children.push(
        new Paragraph({
            text: `Family of ${fatherName} and ${motherName}`,
            spacing: { after: 200 },
        })
    );

    // Father section
    children.push(
        new Paragraph({
            text: `FATHER: ${data.father.name || ''}`,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
        })
    );

    if (data.father.father) {
        const fatherText = `Father: ${data.father.father}`;
        const runs = [new TextRun(fatherText)];
        if (data.father.fatherSource?.sourceNumber) {
            runs.push(new TextRun({ text: ` ${data.father.fatherSource.sourceNumber}`, superScript: true }));
        }
        children.push(new Paragraph({ children: runs, spacing: { after: 50 } }));
    }

    if (data.father.mother) {
        const motherText = `Mother: ${data.father.mother}`;
        const runs = [new TextRun(motherText)];
        if (data.father.motherSource?.sourceNumber) {
            runs.push(new TextRun({ text: ` ${data.father.motherSource.sourceNumber}`, superScript: true }));
        }
        children.push(new Paragraph({ children: runs, spacing: { after: 100 } }));
    }

    if (data.father.events && data.father.events.length > 0) {
        children.push(...buildEventsTable(data.father.events));
    }

    // Mother section
    children.push(
        new Paragraph({
            text: `MOTHER: ${data.mother.name || ''}`,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
        })
    );

    if (data.mother.father) {
        const fatherText = `Father: ${data.mother.father}`;
        const runs = [new TextRun(fatherText)];
        if (data.mother.fatherSource?.sourceNumber) {
            runs.push(new TextRun({ text: ` ${data.mother.fatherSource.sourceNumber}`, superScript: true }));
        }
        children.push(new Paragraph({ children: runs, spacing: { after: 50 } }));
    }

    if (data.mother.mother) {
        const motherText = `Mother: ${data.mother.mother}`;
        const runs = [new TextRun(motherText)];
        if (data.mother.motherSource?.sourceNumber) {
            runs.push(new TextRun({ text: ` ${data.mother.motherSource.sourceNumber}`, superScript: true }));
        }
        children.push(new Paragraph({ children: runs, spacing: { after: 100 } }));
    }

    if (data.mother.events && data.mother.events.length > 0) {
        children.push(...buildEventsTable(data.mother.events));
    }

    // Children section
    if (data.children && data.children.length > 0) {
        children.push(
            new Paragraph({
                text: "CHILDREN",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
            })
        );

        data.children.forEach((child, index) => {
            const childName = `${index + 1}. ${child.name || ''}`;
            const runs = [new TextRun(childName)];
            
            if (child.spouses && child.spouses.length > 0) {
                const spouseNames = child.spouses.map(spouse => {
                    const name = spouse.name || '';
                    if (spouse.source?.sourceNumber) {
                        return `${name}${spouse.source.sourceNumber}`;
                    }
                    return name;
                }).join(', ');
                runs.push(new TextRun({ text: ` (Spouses: ${spouseNames})` }));
            }

            children.push(
                new Paragraph({
                    children: runs,
                    spacing: { after: 50 },
                })
            );

            if (child.events && child.events.length > 0) {
                children.push(...buildEventsTable(child.events));
            }
        });
    }

    // Preparer section
    children.push(
        new Paragraph({
            text: "PREPARER",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
        })
    );

    if (data.preparer) {
        if (data.preparer.name) {
            children.push(new Paragraph({ text: `Name: ${data.preparer.name}`, spacing: { after: 50 } }));
        }
        if (data.preparer.address) {
            children.push(new Paragraph({ text: `Address: ${data.preparer.address}`, spacing: { after: 50 } }));
        }
        if (data.preparer.email) {
            children.push(new Paragraph({ text: `Email: ${data.preparer.email}`, spacing: { after: 100 } }));
        }
    }

    // Comments section
    if (data.comments) {
        children.push(
            new Paragraph({
                text: "COMMENTS",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
            })
        );
        children.push(new Paragraph({ text: data.comments, spacing: { after: 100 } }));
    }

    // Sources section
    const sources = collectSources(data);
    if (sources.length > 0) {
        children.push(
            new Paragraph({
                text: "Sources",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
            })
        );

        sources.sort((a, b) => a.sourceNumber - b.sourceNumber).forEach(source => {
            const runs = [
                new TextRun({ text: `${source.sourceNumber}. `, superScript: true }),
                new TextRun(source.content || ''),
            ];
            children.push(new Paragraph({ children: runs, spacing: { after: 100 } }));
        });
    }

    // Generated date
    children.push(
        new Paragraph({
            text: `Generated on: ${new Date().toLocaleString()}`,
            spacing: { before: 200 },
        })
    );

    return children;
}

function buildEventsTable(events) {
    const sortedEvents = [...events].sort(eventsByDate);
    
    if (sortedEvents.length === 0) {
        return [];
    }

    const tableRows = [
        new TableRow({
            children: [
                new TableCell({ children: [new Paragraph("Date")], width: { size: 20, type: WidthType.PERCENTAGE } }),
                new TableCell({ children: [new Paragraph("Event")], width: { size: 20, type: WidthType.PERCENTAGE } }),
                new TableCell({ children: [new Paragraph("Place")], width: { size: 20, type: WidthType.PERCENTAGE } }),
                new TableCell({ children: [new Paragraph("Notes")], width: { size: 40, type: WidthType.PERCENTAGE } }),
            ],
        }),
    ];

    sortedEvents.forEach(event => {
        const notesRuns = [new TextRun(event.description || '')];
        if (event.sourceNumber) {
            notesRuns.push(new TextRun({ text: ` ${event.sourceNumber}`, superScript: true }));
        }

        tableRows.push(
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph(event.date || '')] }),
                    new TableCell({ children: [new Paragraph((event.type || '').toUpperCase())] }),
                    new TableCell({ children: [new Paragraph(event.place || '')] }),
                    new TableCell({ children: [new Paragraph({ children: notesRuns })] }),
                ],
            })
        );
    });

    return [
        new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
        }),
        new Paragraph({ text: "", spacing: { after: 200 } }), // Spacing after table
    ];
}

function collectSources(data) {
    const sources = [];

    const pushSource = (event) => {
        if (event.sources && event.sourceNumber) {
            sources.push({ content: event.sources, sourceNumber: event.sourceNumber });
        }
    };

    if (data.father) {
        data.father.events.forEach(pushSource);
        if (data.father.fatherSource?.content && data.father.fatherSource?.sourceNumber) {
            sources.push(data.father.fatherSource);
        }
        if (data.father.motherSource?.content && data.father.motherSource?.sourceNumber) {
            sources.push(data.father.motherSource);
        }
    }

    if (data.mother) {
        data.mother.events.forEach(pushSource);
        if (data.mother.fatherSource?.content && data.mother.fatherSource?.sourceNumber) {
            sources.push(data.mother.fatherSource);
        }
        if (data.mother.motherSource?.content && data.mother.motherSource?.sourceNumber) {
            sources.push(data.mother.motherSource);
        }
    }

    if (data.children) {
        data.children.forEach(child => {
            child.events.forEach(pushSource);
            child.spouses.forEach(spouse => {
                if (spouse.source?.content && spouse.source?.sourceNumber) {
                    sources.push({ content: spouse.source.content, sourceNumber: spouse.source.sourceNumber });
                }
            });
        });
    }

    return sources;
}