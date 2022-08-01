import React, { createContext, useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import { isLocale } from 'lib/translations/types'

const getLanguageFile = async (langcode) => {
    return await axios({
        url: 'api/hotel/app/language',
        method: 'post',
        params: {
            langcode: langcode
        }
    }).then((hotelAppLanguageResponse) => {
        const hotelAppLanguageResponseData = hotelAppLanguageResponse.data
        if (hotelAppLanguageResponseData.success) {
            return hotelAppLanguageResponseData.data
        }else {
            return false
        }
    })
}

export const LocaleContext = createContext({
    locale: 'en',
    setLocale: () => null,
    langFilesData: false,
    hotelLanguageFile: false,
    showLangCode: false
})

export const LocaleProvider = ({ lang, defaultHotelLanguageFile, defaultLanguageFile, children }) => {
    const [locale, setLocale] = useState(lang)
    const [langFilesDataLoading, setLangFilesDataLoading] = useState(false)
    const [langFilesData, setLangFileData] = useState(defaultLanguageFile || false)
    const [hotelLanguageFile, setHotelLanguageFile] = useState(defaultHotelLanguageFile || false)
    const [showLangCode, setShowLangCode] = useState(false)
    const { query } = useRouter()

    useEffect(() => {
        if (locale !== localStorage.getItem('locale') && !langFilesDataLoading) {
            localStorage.setItem('locale', locale)
        }
    }, [locale])

    // sync locale value on client-side route changes
    useEffect(() => {
        if (typeof query.lang === 'string' && isLocale(query.lang) && locale !== query.lang && !langFilesDataLoading) {
            setLangFilesDataLoading(true)
            getLanguageFile(query.lang)
                .then((fileData) => {
                    setLangFileData(fileData)
                    setLocale(query.lang)
                    setLangFilesDataLoading(false)
            })
        }

        if (typeof query.lang === 'string' && query.lang === 'show') {
            setShowLangCode(true)
        }else{
            setShowLangCode(false)
        }

    }, [query.lang, locale])

    return <LocaleContext.Provider value={{ langFilesData, hotelLanguageFile, locale, setLocale, showLangCode }}>{children}</LocaleContext.Provider>
}
