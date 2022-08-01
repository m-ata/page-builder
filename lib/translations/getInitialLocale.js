import { defaultLocale } from 'lib/translations/config'
import { isLocale } from 'lib/translations/types'

export const getInitialLocale = () => {
    // preference from the previous session
    const localSetting = localStorage.getItem('locale')
    if (localSetting && isLocale(localSetting)) {
        return localSetting
    }
    // the language setting of the browser
    const [browserSetting] = navigator.language.split('-')
    if (isLocale(browserSetting)) {
        return browserSetting
    }
    return defaultLocale
}
