import React, { useContext } from 'react'
import WebCmsGlobal from 'components/webcms-global'
import { transliterate } from 'transliteration'

const utfTransliteration = () => {
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const transliteration = (value) => {
        if (!GENERAL_SETTINGS?.hotelSettings?.utfenable) {
            return transliterate(value)
        }
        return value
    }
    return { transliteration }
}

export default utfTransliteration