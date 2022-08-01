import React, { memo, useEffect, useState } from 'react'

const WebsiteParagraph = (props) => {

    const {
        paragraph,
        font,
    } = props

    const [data, setData] = useState('')

    useEffect(() => {
        if (paragraph?.gid) {
            const model = paragraph.gid?.text
            const parser = new DOMParser()
            let doc = parser.parseFromString(model, 'text/html')
            let allElements = doc.body.childNodes

            for (let i = 0; i < allElements.length; i++) {
                const currElement = allElements[i]
                const childElements = currElement.childNodes
                if (currElement && currElement.hasAttribute && currElement?.hasAttribute('style')) {
                    currElement.style.backgroundColor = ''
                    // currElement.style.fontSize = font?.size;
                    // currElement.style.fontFamily = font?.name;
                }
                for (let j = 0; j < childElements.length; j++) {
                    const childElement = childElements[j]
                    if (childElement && childElement.hasAttribute && childElement?.hasAttribute('style')) {
                        childElement.style.backgroundColor = ''
                        // childElement.style.fontSize = font?.size;
                        // childElement.style.fontFamily = font?.name;
                    }
                    const grandChildElements = childElement.childNodes
                    for (let k = 0; k < grandChildElements.length; k++) {
                        const grandChildElement = grandChildElements[k]
                        if (grandChildElement && grandChildElement.hasAttribute && grandChildElement?.hasAttribute('style')) {
                            grandChildElement.style.backgroundColor = ''
                            // grandChildElement.style.fontSize = font?.size;
                            // grandChildElement.style.fontFamily = font?.name;
                        }
                    }
                }
            }
            setData(doc.body.innerHTML)
        } else {
            setData(paragraph.text)
        }
    }, [paragraph])

    return (
        <React.Fragment>
            {
                data && <div dangerouslySetInnerHTML={{ __html: data }} />
            }
        </React.Fragment>
    )
}

const memorizedWebsiteParagraph = memo(WebsiteParagraph)

export default memorizedWebsiteParagraph