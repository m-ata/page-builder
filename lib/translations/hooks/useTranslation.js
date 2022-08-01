import React, { useContext } from 'react'
import { LocaleContext } from 'lib/translations/context/LocaleContext'
import localLangFiles from 'lib/translations/strings'
import { defaultLocale } from 'lib/translations/config'

const flatMap = (array, fn) => {
    let result = []
    for (let i = 0; i < array.length; i++) {
        let mapping = fn(array[i])
        result = result.concat(mapping)
    }
    return result
}

const keyLowercase = (str) => {
   const regex = /{(.*?)}/gm;
   return str.replace(regex, function(match) {
        return match.toLowerCase()
   })
}

const getFileDataLang = (langFilesData, key, locale) => {
    const useValue = langFilesData && langFilesData.length > 0 && langFilesData?.find(item => item.src === key && item.lng === locale)?.trg || false
    if(useValue) {
        return useValue.replace('<p>', '').replace('</p>', '')
    }else{
        return useValue
    }
}

export default function useTranslation() {
    const { locale, hotelLanguageFile, langFilesData, showLangCode } = useContext(LocaleContext)
    const t = (key, replace = false, useLocale = false) => {
        let ret;
        if(!useLocale){
            ret = getFileDataLang(langFilesData, key, locale) || localLangFiles && localLangFiles[locale] && localLangFiles[locale][key] || localLangFiles && localLangFiles[defaultLocale] && localLangFiles[defaultLocale][key] || key
        }else{
            ret = getFileDataLang(hotelLanguageFile, key, useLocale) || localLangFiles && localLangFiles[useLocale] && localLangFiles[useLocale][key] || localLangFiles && localLangFiles[defaultLocale] && localLangFiles[defaultLocale][key] || key
        }

        if (replace) {
            let replaceRet = keyLowercase(ret)
            Object.entries(replace)
                .filter(([key, value]) => `${key.toLowerCase()}`[value] !== 'undefined')
                .map(([key, value]) => {
                    let replaceKey = '{' + key.toLowerCase() + '}'
                    replaceRet = flatMap(replaceRet.split(replaceKey.toLowerCase()), function (part) {
                        if (value && value.type) {
                            value = { ...value, key: Math.random() }
                        }
                        return [part, value]
                    })
                    replaceRet.pop()
                    if(typeof value !== 'object'){
                        replaceRet = replaceRet.join('')
                    }
                })
            return showLangCode ? replaceRet + ` (${key}) ` : replaceRet
        }
        return showLangCode ? ret + ` (${key}) ` : ret
    }
    return { t, locale }
}
