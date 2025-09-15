import van from 'vanjs-core';
import Modal from './Modal';
import { button } from '../van';

export default function FGRManager({ onSave = () => { }, onClose = () => { } }) {
    const remove = () => {
        modal.remove()
        onClose()
    }
    const modal = Modal({
        title: "FGR Manager",
        onClose: remove,
        footer: [
            button({ type: "button", class: "btn btn-secondary", onclick: remove },
                "Cancel",
            ),
            button({
                type: "button",
                class: "btn btn-primary",
                onclick: () => {
                    onSave()
                    remove()
                }
            },
                "Save",
            ),
        ],
    },
        "hello world"
    )
    return modal
}


let isSingletonShowing = false
export function showFGRManager() {
    if (isSingletonShowing) {
        return
    }
    isSingletonShowing = true
    const modal = FGRManager({
        onSave: () => {
            console.log("FGR Manager saved")
        },
        onClose: () => isSingletonShowing = false
    })
    document.body.appendChild(modal)
}

