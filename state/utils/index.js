export function loadLocalStorageItem(lsKey) {
    try {
        const lsValue = localStorage.getItem(lsKey)
        if (lsValue === null) {
            return undefined
        }
        return JSON.parse(lsValue)
    } catch (err) {
        return undefined
    }
}

export function loadLocalStorageSingleItem(lsKey) {
    try {
        const lsValue = localStorage.getItem(lsKey)
        if (lsValue === null) {
            return undefined
        }
        return lsValue
    } catch (err) {
        return undefined
    }
}

