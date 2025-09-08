import van from "vanjs-core"
import * as vanX from 'vanjs-ext'
import { generateChildId, generateSpouseId } from '../utils/uuid.js'

const { div, button, h3, h5, input} = van.tags


export default function ChildListV2({state}) {
    van.derive(() => {
        console.log("children", state.kids)
    })


    const addSpouse = (childId) => {
        state.kids = state.kids.map(kid =>
            kid.id === childId
                ? { ...kid, spouses: [...kid.spouses, { name: "", id: generateSpouseId(childId) }] }
                : kid
        )
    }

    const updateSpouseName = (childId, spouseId, newName) => {
        const found = state.kids.find(kid => kid.id === childId).spouses.find(spouse => spouse.id === spouseId)
        found.name = newName

    }

    const deleteSpouse = (childId, spouseId) => {
        const spousesState = state.kids.find(kid => kid.id === childId).spouses
        const indexToRemove = spousesState.findIndex(spouse => spouse.id === spouseId)
        state.kids.find(kid => kid.id === childId).spouses = [
            ...spousesState.slice(0, indexToRemove),
            ...spousesState.slice(indexToRemove + 1)
        ]
    }

    const CreateSpouseItem = (childId, spouse) => {
        console.log("render spouse");
        return div({ class: "spouse-item" },
            input({
                type: "text",
                class: "spouse-input",
                placeholder: "Spouse's Name",
                value: () => spouse.name,
                oninput: (e) => updateSpouseName(childId, spouse.id, e.target.value)
            }),
            button({
                class: "btn-small btn-delete",
                type: "button",
                onclick: () => deleteSpouse(childId, spouse.id),
            }, "Delete")
        )
    }


    return div({ class: "child-list-container" },
        div({ class: "child-list-header" },
            h3({}, "Children 👧"),
            button({
                type: "button",
                class: "add-child-btn",
                onclick: () => {
                    console.log('adding child');
                    state.kids = [...state.kids, {
                        name: "",
                        spouses: [],
                        id: generateChildId()
                    }]
                }

            }, "+ Add Child")
        ),

        () => vanX.list(div, state.kids, kid => {
            console.log("render child");

            return div({ class: "child-item" },
                input({
                    type: "text",
                    class: "child-name-input",
                    placeholder: "Child's Name",
                    value: () => kid.val.name,
                    oninput: (e) => {
                        kid.val.name = e.target.value
                    }
                }),
                div({ class: "spouses-section" },
                    h5({}, "Spouses"),
                    () => vanX.list(
                        div({ class: "spouses-list" }),
                        kid.val.spouses,
                        spouse => CreateSpouseItem(kid.val.id, spouse.val)),
                    button({
                        type: "button",
                        class: "add-spouse-btn",
                        onclick: () => addSpouse(kid.val.id)
                    }, "+ Add Spouse")

                ))
        })
    )
}



