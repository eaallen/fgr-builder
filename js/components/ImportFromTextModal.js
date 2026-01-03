/**
 * @typedef {import('firebase/ai').AI} AI
 */

import { button, div, textarea } from "../van";
import Modal from "./Modal.js";
import { run } from "../ai/utils.js";
import { fgrSchema } from "../ai/fgrSchema.js";
import { populateForm } from "../form/formManager.js";
import { generateUUID } from "../utils/uuid.js";

/**
 * Import from Text Modal Component
 * @param {Object} props - Component props
 * @param {AI} props.ai - The Firebase AI instance
 * @returns {HTMLElement} The modal element
 */
export default function ImportFromTextModal({ai}) {
    const textinput = textarea({
        placeholder: "Paste your family notes here. They can be in any format or order..."
    });
    
    let importButtonRef = null;
    
    const handleImport = () => {
        const userInput = textinput.value.trim();
        
        if (!userInput) {
            alert('Please enter some text to import.');
            return;
        }
        
        // Disable button during processing
        if (importButtonRef) {
            importButtonRef.disabled = true;
            importButtonRef.textContent = 'Importing...';
        }
        
        run(ai, userInput, fgrSchema)
            .then(fgrData => {
                // overrides to prevent inaccurate data
                fgrData.recordId = generateUUID();
                fgrData.recordDate = new Date().toLocaleDateString();
                
                console.log('Imported FGR data:', fgrData);
                // Populate the form with the imported data
                populateForm(fgrData);
                // Close the modal by removing it from DOM
                modal.remove();
                alert('Family Group Record imported successfully!');
            })
            .catch(error => {
                console.error('Error importing FGR:', error);
                alert('Failed to import Family Group Record. Please check the console for details.');
            })
            .finally(() => {
                if (importButtonRef) {
                    importButtonRef.disabled = false;
                    importButtonRef.textContent = 'Import';
                }
            });
    };
    
    const importButton = button({
        type: "button", 
        class: "btn btn-secondary", 
        onclick: handleImport
    }, "Import");
    
    importButtonRef = importButton;
    
    const modal = Modal({
        title: "Import from text",
        onClose: () => {
            console.log('Modal closed');
        },
        footer: [
            importButton
        ]
    }, div(
        textinput
    ));
    
    return modal;
}