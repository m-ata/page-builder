import { locales } from './config'

export function isLocale(tested) {
    return locales.some((locale) => locale === tested)
}

export function isLocaleViaList(list, tested) {
    return list.some((locale) => locale === tested)
}
