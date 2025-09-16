import van from "vanjs-core"
import * as vanX from 'vanjs-ext'
import { generateChildId, generateSpouseId } from '../utils/uuid.js'
import EventList from "./EventList.js"
import { br, i } from "../van/index.js"
import { withAutoSave } from "../firestore/firestore.js"

const { div, button, h3, h5, input } = van.tags


export default function ChildListV2({ state }) {
    van.derive(() => {
        console.log("children", state.kids)
    })


    const addSpouse = withAutoSave((childId) => {
        state.kids = state.kids.map(kid =>
            kid.id === childId
                ? { ...kid, spouses: [...kid.spouses, { name: "", id: generateSpouseId(childId), source: { content: "", sourceNumber: 0 } }] }
                : kid
        )
    })

    const updateSpouseName = withAutoSave((childId, spouseId, newName) => {
        const found = state.kids.find(kid => kid.id === childId).spouses.find(spouse => spouse.id === spouseId)
        found.name = newName
    })

    const updateSpouseSource = withAutoSave((childId, spouseId, newSource) => {
        const found = state.kids.find(kid => kid.id === childId).spouses.find(spouse => spouse.id === spouseId)
        found.source.content = newSource
    })

    const deleteSpouse = withAutoSave((childId, spouseId) => {
        const spousesState = state.kids.find(kid => kid.id === childId).spouses
        const indexToRemove = spousesState.findIndex(spouse => spouse.id === spouseId)
        state.kids.find(kid => kid.id === childId).spouses = [
            ...spousesState.slice(0, indexToRemove),
            ...spousesState.slice(indexToRemove + 1)
        ]
    })

    const CreateSpouseItem = (childId, spouse) => {
        console.log("render spouse", spouse.source);
        return div({ class: "spouse-item" },
            div(
                input({
                    type: "text",
                    class: "spouse-input",
                    placeholder: "Spouse's Name",
                    value: () => spouse.name,
                    oninput: (e) => updateSpouseName(childId, spouse.id, e.target.value)
                }),
                br(),
                input({
                    type: "text",
                    class: "spouse-input",
                    placeholder: "Source",
                    value: () => spouse.source.content || "",
                    oninput: (e) => updateSpouseSource(childId, spouse.id, e.target.value)
                })
            ),
            button({
                class: "btn-small btn-delete",
                type: "button",
                onclick: () => deleteSpouse(childId, spouse.id),
            }, i({ class: "fas fa-trash" })),
        )
    }


    return div({ class: "child-list-container" },
        div({ class: "child-list-header" },
            h3({}, "Children 👧"),
            button({
                type: "button",
                class: "add-child-btn",
                onclick: withAutoSave(() => {
                    console.log('adding child');
                    state.kids = [...state.kids, {
                        name: "",
                        spouses: [],
                        events: [],
                        id: generateChildId()
                    }]
                })

            }, "+ Add Child")
        ),

        () => vanX.list(div, state.kids, kid => {
            const eventsState = vanX.stateFields(kid.val).events

            return div({ class: "child-item" },
                div({ class: "child-info-section" },
                    div(
                        input({
                            type: "text",
                            class: "child-name-input",
                            placeholder: "Child's Name",
                            value: () => kid.val.name,
                            oninput: withAutoSave((e) => {
                                kid.val.name = e.target.value
                            })
                        }),
                        button({
                            type: "button",
                            class: "btn-small btn-delete child-delete-btn",
                            onclick: withAutoSave(() => {
                                if (confirm('Are you sure you want to delete this child and all their information?')) {
                                    state.kids = state.kids.filter(child => child.id !== kid.val.id)
                                }
                            })
                        }, i({ class: "fas fa-trash" })),
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
                        )
                    )
                ),
                div({ class: "events-section" },
                    EventList(eventsState)
                )
            )
        })
    )
}



