import { button, div, textarea } from "../van";
import Modal from "./Modal.js";

/**
 * 
 * @param {{model: GenerativeModel}} props 
 * @returns 
 */
export default function ImportFromTextModal({model}) {
    return Modal({
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
    }, div(
        textarea()
    ))
}