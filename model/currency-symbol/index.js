import { currencySymbols } from './map'

function getSymbolFromCurrency(currencyCode) {
    if (typeof currencyCode !== 'string') {
        return undefined
    }

    let code = currencyCode.toUpperCase()

    if (!currencySymbols.hasOwnProperty(code)) {
        return undefined
    }

    return currencySymbols[code]
}

export default getSymbolFromCurrency
