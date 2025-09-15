import van from 'vanjs-core';
import Modal from './Modal';
import { button, div, h3, p, i } from '../van';
import { loadFGRsFromFirestore } from '../firestore/firestore';
import { populateForm } from '../form/formManager';
import { generateUUID } from '../utils/uuid';

export default function FGRManager({ onClose = () => { } }) {
    const fgrs = van.state([])

    const modalBody = div()

    const handleEdit = (e, item) => {
        e.stopPropagation();
        console.log("Edit clicked", item);
        populateForm(item);
        remove();
    };

    const handleDelete = (e, item) => {
        e.stopPropagation();
        console.log("Delete clicked", item);
        // TODO: Implement delete functionality
        if (confirm(`Are you sure you want to delete the record for "${item.fatherName} and ${item.motherName}"?`)) {
            // Delete logic will be implemented here
            console.log("Record deleted:", item);
        }
    };

    van.derive(() => {
        modalBody.replaceChildren()
        for(const item of fgrs.val) {
            van.add(modalBody, div({ class: "fgr-item" ,onclick: () => { 
                console.log("clicked", item);
                populateForm(item)
                remove()
            } },
                div({ class: "fgr-item-header" },
                    h3({ class: "fgr-item-title" }, `Family of ${item.fatherName} and ${item.motherName}`),
                    div({ class: "fgr-item-actions" },
                        button({ 
                            type: "button", 
                            class: "btn btn-edit", 
                            onclick: (e) => handleEdit(e, item) 
                        }, 
                            i({ class: "fas fa-edit" }),
                            "Edit"
                        ),
                        button({ 
                            type: "button", 
                            class: "btn btn-delete", 
                            onclick: (e) => handleDelete(e, item) 
                        }, 
                            i({ class: "fas fa-trash" }),
                            "Delete"
                        )
                    )
                ),
                div({ class: "fgr-item-meta" },
                    div({ class: "fgr-record-date" },
                        i({ class: "fas fa-calendar-alt" }),
                        p(`Record Date: ${item.recordDate}`)
                    )
                )
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
                    populateFormWithNewFGR()
                    remove()
                }
            },
                "Add new FGR",
            ),
        ],
    },
    modalBody
    )
    
    // Add FGR manager specific class to modal
    modal.classList.add('fgr-manager-modal')
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


export function populateFormWithNewFGR() {
    populateForm({
        recordId: generateUUID(),
        recordDate: new Date().toLocaleDateString(),
    })
}

