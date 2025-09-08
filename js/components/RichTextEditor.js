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
        console.log("initializing editor", element)
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
        console.log("adding input event handler", element)
        element.addEventListener('input', () => {
            console.log("element.innerHTML------>", element.innerHTML)
            onchange(element.innerHTML)
        })
    }

    // Handle paste events to preserve embedded links
    const handlePaste = (event) => {
        event.preventDefault()
        
        const clipboardData = event.clipboardData || window.clipboardData
        const htmlData = clipboardData.getData('text/html')
        const textData = clipboardData.getData('text/plain')
        
        console.log('Paste event - HTML data:', htmlData)
        console.log('Paste event - Text data:', textData)
        
        const selection = window.getSelection()
        if (!selection.rangeCount) return
        
        const range = selection.getRangeAt(0)
        range.deleteContents()
        
        let contentToInsert = null
        
        if (htmlData) {
            // Extract and clean HTML content while preserving links
            const cleanedHTML = cleanPastedHTML(htmlData)
            console.log('Cleaned HTML:', cleanedHTML)
            
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
        console.log('Final editor content:', editorElement.innerHTML)
        onchange(editorElement.innerHTML)
    }

    // Clean pasted HTML to preserve links but remove unwanted formatting
    const cleanPastedHTML = (html) => {
        console.log('Original HTML:', html)
        
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = html
        
        // Remove unwanted elements but preserve links
        const unwantedTags = ['script', 'style', 'meta', 'link', 'title', 'head', 'body']
        unwantedTags.forEach(tag => {
            const elements = tempDiv.querySelectorAll(tag)
            elements.forEach(el => el.remove())
        })
        
        // Process all elements to preserve links and clean formatting
        const processElement = (element) => {
            if (element.nodeType === Node.TEXT_NODE) {
                return element.textContent
            }
            
            if (element.nodeType === Node.ELEMENT_NODE) {
                if (element.tagName === 'A') {
                    // Preserve links with proper attributes
                    const href = element.getAttribute('href')
                    const text = element.textContent.trim()
                    if (href && text) {
                        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
                    } else if (href) {
                        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${href}</a>`
                    }
                } else if (['P', 'DIV', 'SPAN', 'BR'].includes(element.tagName)) {
                    // Handle block elements and line breaks
                    if (element.tagName === 'BR') {
                        return '<br>'
                    }
                    
                    const childContent = Array.from(element.childNodes)
                        .map(child => processElement(child))
                        .join('')
                    
                    // Add line breaks for block elements if they have content
                    if (['P', 'DIV'].includes(element.tagName) && childContent.trim()) {
                        return childContent + '<br>'
                    }
                    return childContent
                } else {
                    // For other elements, just extract text content
                    return element.textContent
                }
            }
            
            return ''
        }
        
        // Process all child nodes
        const result = Array.from(tempDiv.childNodes)
            .map(child => processElement(child))
            .join('')
        
        console.log('Cleaned result:', result)
        return result
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
        id,
        name,
        class: `rich-text-editor ${className}`,
        contenteditable: true,
        "data-placeholder": placeholder,
        
    })
    console.log("editor---:)--->", editor)

    initializeEditor(editor)

    return div({ class: "rich-text-container" },
        // toolbar,
        editor
    )
}
