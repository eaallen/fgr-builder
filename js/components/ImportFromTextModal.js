/**
 * @typedef {import('firebase/ai').AI} AI
 */

import van from "vanjs-core";
import { button, div, small, p, a, i } from "../van";
import Modal from "./Modal.js";
import { run } from "../ai/utils.js";
import { fgrSchema } from "../ai/fgrSchema.js";
import { collectFormData, populateForm } from "../form/formManager.js";
import TextEditor from "./TextEditor.js";
import VStack from "./VStack.js";
import Space from "./Space.js";
import keepScreenAlive from "../utils/keepscreenalive.js";
import Progress from "./Progress.js";
import HStack from "./HStack.js";

/**
 * Import from Text Modal Component
 * @param {Object} props - Component props
 * @param {AI} props.ai - The Firebase AI instance
 * @returns {HTMLElement} The modal element
 */
export default function ImportFromTextModal({ ai }) {
    let userInputValue = "";

    // State for showing privacy policy
    const showPrivacyPolicy = van.state(false);
    const progressValue = van.state(0);




    const textinput = TextEditor({
        placeholder: "Paste your family notes here. They can be in any format or order...",
        onchange: (content) => { userInputValue = content },
    })

    let messageInterval = null;
    let progressInterval = null;

    const intervalMs = 3500

    const importIcon = i({ class: "fas fa-file-import" });
    const importButton = button({
        type: "button",
        class: "btn btn-primary",
        onclick: () => handleImport()
    }, importIcon);


    const messageDisplay = small("");

    const cleverMessages = [
        "Using AI to save you time...",
        "Connecting the dots between generations...",
        "Preserving memories, one record at a time...",
        "Crunching the data, building your FGR...",
        "This sure is taking a while..."
    ];


    const handleImport = async () => {
        const userInput = userInputValue.trim();

        console.log("userInput---------->", userInput.length);

        await keepScreenAlive();

        if (!userInput) {
            alert('Please enter some text to import.');
            return;
        }

        console.time(handleImport.name)

        // Disable button during processing
        importButton.disabled = true;
        importButton.replaceChildren(importIcon);

        // Show and start rotating messages
        messageDisplay.style.display = 'block';
        let messageIndex = 0;
        messageDisplay.textContent = cleverMessages[messageIndex];

        messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % cleverMessages.length;
            messageDisplay.textContent = cleverMessages[messageIndex];
        }, intervalMs);

        const expectedWaitTime = (userInput.length * 14) + 2000;

        progressInterval = setInterval(() => {
            progressValue.val = (progressValue.val + 0.1) % 100;
        }, expectedWaitTime * 0.001);


        run(ai, userInput, fgrSchema)
            .then(fgrData => {
                const oldFGRData = collectFormData()
                // overrides to prevent inaccurate data
                fgrData.recordId = oldFGRData.recordId;
                fgrData.recordDate = oldFGRData.recordDate || new Date().toLocaleDateString();

                // Populate the form with the imported data
                populateForm(fgrData);
            })
            .catch(error => {
                console.error('Error importing FGR:', error);
                alert('Failed to import Family Group Record. Please check the console for details.');
            })
            .finally(() => {
                // Clear the message interval
                if (messageInterval) {
                    clearInterval(messageInterval);
                    messageInterval = null;
                }

                if (progressInterval) {
                    clearInterval(progressInterval);
                    progressInterval = null;
                }

                // clean up messaging
                messageDisplay.style.display = 'none';
                importButton.disabled = false;
                importButton.replaceChildren(importIcon);

                // Close the modal by removing it from DOM
                modal.remove();
                console.timeEnd(handleImport.name)

            });
    };

    // Privacy policy container that will be updated reactively
    const privacyContainer = div();

    // Privacy policy link
    const privacyLink = a({
        href: "#",
        onclick: (e) => { e.preventDefault(); showPrivacyPolicy.val = true; },
        style: "font-size: 0.8125rem; color: #007bff; text-decoration: underline; cursor: pointer;"
    }, "view privacy policy");

    // Privacy policy text
    const privacyText = p({ style: "margin: 0; font-size: 0.8125rem; color: #6c757d;" },
        "This feature uses Google's Gemini AI model, which is free to use. To keep this service free, your input is shared with Google to help improve their AI models."
    );

    // Reactively update privacy container based on state
    van.derive(() => {
        privacyContainer.replaceChildren();
        if (showPrivacyPolicy.val) {
            van.add(privacyContainer, privacyText);
        } else {
            van.add(privacyContainer, privacyLink);
        }
    });

    const modal = Modal({
        title: "Create Record From Notes (Using AI)",
        onClose: () => {
            if (messageInterval) {
                clearInterval(messageInterval);
                messageInterval = null;
            }
        },
        footer: [
            VStack(
                { spacing: 10, alignment: "center", style: "flex-grow: 1;" },
                () =>
                    progressValue.val > 0
                        ? Progress({ value: progressValue, max: 100, style: "width: 100%;" })
                        : []
            ),
            importButton,
        ]
    },
        div({ class: "modal-instructions", style: "margin-bottom: 1rem; padding: 0.75rem; background-color: #f8f9fa; border-radius: 4px; font-size: 0.875rem; line-height: 1.5;" },
            p({ style: "margin: 0 0 0.5rem 0; font-weight: 500;" },
                "How to use:"
            ),
            p({ style: "margin: 0 0 0.75rem 0;" },
                "Paste your family group record notes in the text area below. The AI will automatically extract names, dates, relationships, and events to populate your Family Group Record. Your notes can be in any format or order."
            ),
            privacyContainer
        ),
        textinput
    );

    return modal;
}