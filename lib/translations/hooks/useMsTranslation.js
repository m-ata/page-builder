import strings from 'lib/translations/strings'
import { defaultLocale } from 'lib/translations/config'

export default function useTranslation() {
    const t = (locale, key) => {
        if (strings && !strings[locale][key]) {
            console.warn(`Translation '${key}' for locale '${locale}' not found.`)
        }
        return strings[locale][key] || strings[defaultLocale][key] || ''
    }
    return {
        t,
    }
}
