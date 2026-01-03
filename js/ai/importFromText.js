// import { ai } from '../../main.js';
// import { getGenerativeModel } from "firebase/ai";
import Modal, { addModal } from '../components/Modal.js';
import { button } from '../van/index.js';

// const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });

export async function run() {
    // Provide a prompt that contains text
    const prompt = "Write a story about a magic backpack."

    // To generate text output, call generateContent with the text input
    const result = await model.generateContent(prompt);

    const response = result.response;
    const text = response.text();
    console.log(text);
}

export function showDisplay() {
    addModal(Modal({
        title: "Import from text",
        onClose: () => {
            console.log('Modal closed');
        },
        footer: [
            button({
                type: "button", class: "btn btn-secondary", onclick: () => {
                    console.log('click');
                }
            }, "Import"),
        ]
    }, "Import from text"))
}