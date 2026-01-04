import van from "vanjs-core"

const { div, button, span } = van.tags

export default function RichTextEditor({ 
    id, 
    name, 
    placeholder = "", 
    class: className = "", 
    value = "",
    onchange = () => {}
}) {
    let editorElement = null
    let isInitialized = false

    // Initialize the editor with content
    const initializeEditor = (element) => {
        if (isInitialized) return
        editorElement = element
        isInitialized = true
        
        if (value) {
            element.innerHTML = value
        }
        
        // Add paste event handler to preserve links
        element.addEventListener('paste', handlePaste)
        
        // Also add a more robust paste handler for better browser compatibility
        // element.addEventListener('paste', (e) => {
        //     // Let the main handler run first, then do additional processing if needed
        //     setTimeout(() => {
        //         // Check if any URLs in the content need to be converted to links
        //         const currentContent = element.innerHTML
        //         const processedContent = convertUrlsToLinks(currentContent)
        //         if (processedContent !== currentContent) {
        //             element.innerHTML = processedContent
        //             onchange(element.innerHTML)
        //         }
        //     }, 10)
        // })
        
        // Add input event handler
        element.addEventListener('input', () => {
            onchange(element.innerHTML)
        })
    }

    // Handle paste events to preserve embedded links
    const handlePaste = (event) => {
        event.preventDefault()
        
        const clipboardData = event.clipboardData || window.clipboardData
        const htmlData = clipboardData.getData('text/html')
        const textData = clipboardData.getData('text/plain')
        
        const selection = window.getSelection()
        if (!selection.rangeCount) return
        
        const range = selection.getRangeAt(0)
        range.deleteContents()
        
        let contentToInsert = null
        
        if (htmlData) {
            // Extract and clean HTML content while preserving links
            const cleanedHTML = cleanPastedHTML(htmlData)
            
            // Create a temporary container to hold the cleaned HTML
            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = cleanedHTML
            
            // Insert each child node
            while (tempDiv.lastChild) {
                range.insertNode(tempDiv.lastChild)
            }
        } else {
            // Fall back to plain text, but try to detect and convert URLs
            const processedText = convertUrlsToLinks(textData)
            if (processedText !== textData) {
                // Contains URLs, insert as HTML
                const tempDiv = document.createElement('div')
                tempDiv.innerHTML = processedText
                while (tempDiv.firstChild) {
                    range.insertNode(tempDiv.firstChild)
                }
            } else {
                // Plain text, insert as text node
                contentToInsert = document.createTextNode(textData)
                range.insertNode(contentToInsert)
            }
        }
        
        // Move cursor after inserted content
        range.collapse(false)
        selection.removeAllRanges()
        selection.addRange(range)
        
        // Trigger change event
        onchange(editorElement.innerHTML)
    }

    // Clean pasted HTML to preserve links but remove unwanted formatting
    const cleanPastedHTML = (html) => {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = removeComments(html)
        
        // Remove unwanted elements but preserve links
        const unwantedTags = ['script', 'style', 'meta', 'link', 'title', 'head', 'body']
        unwantedTags.forEach(tag => {
            const elements = tempDiv.querySelectorAll(tag)
            elements.forEach(el => el.remove())
        })
        
    
        removeStylesFromAllNodes(tempDiv)
        removeNodesWithoutText(tempDiv)

        console.log('Cleaned result:', tempDiv)
        
        return tempDiv.innerHTML
    }

    // Convert plain text URLs to HTML links
    const convertUrlsToLinks = (text) => {
        const urlRegex = /(https?:\/\/[^\s<>]+)/g
        return text.replace(urlRegex, (url) => {
            const cleanUrl = url.replace(/[.,;:!?]+$/, '')
            return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${cleanUrl}</a>`
        })
    }

    // Formatting functions
    const execCommand = (command, value = null) => {
        document.execCommand(command, false, value)
        editorElement.focus()
        onchange(editorElement.innerHTML)
    }

    const insertLink = () => {
        const url = prompt('Enter URL:')
        if (url) {
            execCommand('createLink', url)
        }
    }

    const removeLink = () => {
        execCommand('unlink')
    }

    // Toolbar component
    const toolbar = div({ class: "rich-text-toolbar" },
        button({
            type: "button",
            class: "toolbar-btn",
            onclick: () => execCommand('bold'),
            title: "Bold"
        }, "B"),
        button({
            type: "button", 
            class: "toolbar-btn",
            onclick: () => execCommand('italic'),
            title: "Italic"
        }, "I"),
        button({
            type: "button",
            class: "toolbar-btn",
            onclick: () => execCommand('underline'),
            title: "Underline"
        }, "U"),
        span({ class: "toolbar-separator" }),
        button({
            type: "button",
            class: "toolbar-btn",
            onclick: insertLink,
            title: "Insert Link"
        }, "🔗"),
        button({
            type: "button",
            class: "toolbar-btn",
            onclick: removeLink,
            title: "Remove Link"
        }, "🔗❌"),
        span({ class: "toolbar-separator" }),
        button({
            type: "button",
            class: "toolbar-btn",
            onclick: () => execCommand('removeFormat'),
            title: "Clear Formatting"
        }, "Clear")
    )

    // Editor component
    const editor = div({
        class: `rich-text-editor ${className}`,
        contenteditable: true,
        "data-placeholder": placeholder,  
    })
    id && (editor.id = id)
    name && (editor.name = name)

    initializeEditor(editor)

    return div({ class: "rich-text-container" },
        // toolbar,
        editor
    )
}


// removeStylesFromAllNodes
const removeStylesFromAllNodes = (node) => {
    node.style = ""
    for(const child of node.childNodes) {
        removeStylesFromAllNodes(child)
    }
}

/** 
 * Remove all nodes that do not have a text node as a child 
 * @param {Node} node - The node to remove
 * */
const removeNodesWithoutText = (node) => {
    // console.log("node------>", node.nodeType)
    // if (node.childNodes.length === 0) {
    //     node.remove()
    // }
    // for(const child of node.childNodes) {
    //     removeNodesWithoutText(child)
    // }
    for(const child of node.childNodes) {
        if(child.textContent === "") {
            child.remove()
        } else {
            removeNodesWithoutText(child)
        }
    }
}

function removeComments(htmlString){
    return htmlString.replace(/(?=<!--)([\s\S]*?)-->/g, '')
}

function keepOnlyTextNodesOrAnchorNodes(node){
    // If it's a text node, keep it
    if(node.nodeType === 3) {
        return
    }
    
    // If it's an anchor element, keep it
    if(node.nodeType === 1 && node.tagName === 'A'){
        return
    }
    
    // If it's an element node that's not an anchor, remove it
    if(node.nodeType === 1) {
        // First, process all children before removing the node
        const children = Array.from(node.childNodes)
        for(const child of children){
            keepOnlyTextNodesOrAnchorNodes(child)
        }
        // Replace the element with its children
        const parent = node.parentNode
        if(parent) {
            while(node.firstChild) {
                parent.insertBefore(node.firstChild, node)
            }
            parent.removeChild(node)
        }
    }
}