import { div, h3, span } from "../van";

export default function Modal({
    onClose = () => { },
    title = "",
    footer = div(),
}, ...children) {
    const modal = div({ class: "modal" },
        div({ class: "modal-content" },
            div({ class: "modal-header" },
                h3(title),
                span({ class: "close", onclick: () => remove() },
                    "×",
                ),
            ),
            div({ class: "modal-body" },
                ...children,
            ),
            div({ class: "modal-footer" },
                footer,
            )
        )
    )

    const remove = () => {
        modal.remove()
        onClose()
    }



    return modal
}