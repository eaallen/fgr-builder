import van from 'vanjs-core';
import Modal from './Modal';
import { button, div, h3, p } from '../van';
import { loadFGRsFromFirestore } from '../firestore/firestore';

export default function FGRManager({ onSave = () => { }, onClose = () => { } }) {
    const fgrs = van.state([])

    const modalBody = div()

    van.derive(() => {
        console.log("fgrs", fgrs.val)
        modalBody.replaceChildren()
        for(const item of fgrs.val) {
            van.add(modalBody, div({ class: "fgr-item" ,onclick: () => { console.log("clicked", item);
            } },
                h3(item.recordId),
                button({ type: "button", class: "btn btn-secondary", onclick: () => { } }, "Delete"),
                p(item.recordDate),
            ))
        }
    })

    loadFGRsFromFirestore().then(data => {
        fgrs.val = data
    })


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
                "Add new FGR",
            ),
        ],
    },
    modalBody
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

