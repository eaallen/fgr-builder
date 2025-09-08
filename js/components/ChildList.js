import van from "vanjs-core"
import { generateChildId, generateSpouseId } from '../utils/uuid.js'

const { div, button, h3, h5, p, input, span } = van.tags

// Child List Component
export default function ChildList(childrenState) {
    const children = childrenState

    // Add child function
    const addChild = () => {
        const childId = generateChildId()
        const newChild = {
            id: childId,
            name: '',
            spouses: []
        }
        children.val = [...children.val, newChild]
    }

    // Add spouse function
    const addSpouse = (childId) => {
        const spouseId = generateSpouseId(childId)
        const newSpouse = {
            id: spouseId,
            name: ''
        }
        
        children.val = children.val.map(child => 
            child.id === childId 
                ? { ...child, spouses: [...child.spouses, newSpouse] }
                : child
        )
    }

    // Delete child function
    const deleteChild = (childId) => {
        if (confirm('Are you sure you want to delete this child and all their information?')) {
            children.val = children.val.filter(child => child.id !== childId)
        }
    }

    // Delete spouse function
    const deleteSpouse = (childId, spouseId) => {
        if (confirm('Are you sure you want to delete this spouse?')) {
            children.val = children.val.map(child => 
                child.id === childId 
                    ? { ...child, spouses: child.spouses.filter(spouse => spouse.id !== spouseId) }
                    : child
            )
        }
    }

    // Update child name
    const updateChildName = (childId, newName) => {
        children.val = children.val.map(child => 
            child.id === childId 
                ? { ...child, name: newName }
                : child
        )
    }

    // Update spouse name
    const updateSpouseName = (childId, spouseId, newName) => {
        children.val = children.val.map(child => 
            child.id === childId 
                ? { 
                    ...child, 
                    spouses: child.spouses.map(spouse => 
                        spouse.id === spouseId 
                            ? { ...spouse, name: newName }
                            : spouse
                    )
                }
                : child
        )
    }

    // Create spouse item element
    const createSpouseItem = (childId, spouse) => {
        return div({ class: "spouse-item" },
            input({ 
                type: "text", 
                class: "spouse-input", 
                placeholder: "Spouse's Name",
                value: spouse.name,
                oninput: (e) => updateSpouseName(childId, spouse.id, e.target.value)
            }),
            button({ 
                class: "btn-small btn-delete", 
                onclick: () => deleteSpouse(childId, spouse.id) 
            }, "Delete")
        )
    }

    // Create child item element
    const createChildItem = (child) => {
        return div({ class: "child-item" },
            div({ class: "child-header" },
                input({ 
                    type: "text", 
                    class: "child-name-input", 
                    placeholder: "Child's Name",
                    value: child.name,
                    oninput: (e) => updateChildName(child.id, e.target.value)
                }),
                div({ class: "child-actions" },
                    button({ 
                        class: "btn-small btn-delete", 
                        onclick: () => deleteChild(child.id) 
                    }, "Delete")
                )
            ),
            div({ class: "spouses-section" },
                h5({}, "Spouses"),
                div({ class: "spouses-list" },
                    ...child.spouses.map(spouse => createSpouseItem(child.id, spouse))
                ),
                button({ 
                    type: "button", 
                    class: "add-spouse-btn", 
                    onclick: () => addSpouse(child.id) 
                }, "+ Add Spouse")
            )
        )
    }

    // Main component structure
    const childrenList = van.derive(() => div({ class: "children-list" },
        ...children.val.map(child => createChildItem(child)),
        children.val.length === 0
            ? p({ class: "no-children" }, "No children added yet. Click 'Add Child' to get started.")
            : null
    ))

    return div({ class: "child-list-container" },
        div({ class: "child-list-header" },
            h3({}, "Children"),
            button({
                type: "button",
                class: "add-child-btn",
                onclick: addChild
            }, "+ Add Child")
        ),
        () => childrenList.val
    )
}
