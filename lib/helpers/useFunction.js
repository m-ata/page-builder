const getRoomRate = (roomRate) => {
    roomRate = Number(roomRate)
    if (roomRate > 0 && roomRate !== null) {
        return roomRate
    } else {
        return null
    }
}

function naiveRound(num, decimalPlaces = 0) {
    let p = Math.pow(10, decimalPlaces);
    return Math.round(num * p) / p;
}

function formatDiscRate(discRate) {
    let newDiscRate;
    if (discRate) {
        let discStr = String(discRate).split('.')
        if (discStr && discStr[0].length > 1) {
            newDiscRate = String(discRate).substr(0, 5)
        } else {
            newDiscRate = String(discRate).substr(0, 4)
        }
    } else {
        newDiscRate = discRate
    }
    return naiveRound(parseFloat(newDiscRate))
}

function showDiscountRate(totalPrice, discTotalPrice) {
    let disc = (totalPrice - discTotalPrice) * 100 / totalPrice
    return disc < 0 ? 0 : disc
}

function applyDiscount(price, discrate) {
    if (discrate) {
        price = Number(price), discrate = Number(discrate) / 100
        return (price - (price * discrate))
    }
    return 0
}

const getPaxPrice = (totalPax, sngrate, dblrate, trprate, quadrate, extrarate, extra2rate) => {
    if (totalPax === 1) {
        return getRoomRate(sngrate)
    } else if (totalPax === 2) {
        return getRoomRate(dblrate)
    } else if (totalPax === 3) {
        return getRoomRate(trprate)
    } else if (totalPax === 4) {
        return getRoomRate(quadrate)
    } else if (totalPax === 5) {
        return getRoomRate(Number(quadrate) + Number(extrarate))
    } else if (totalPax >= 6) {
        const extraPax = Number(totalPax) - 5
            , basePrice = Number(quadrate) + Number(extrarate)
            , extraPaxPrice = basePrice + (Number(extra2rate) * extraPax)
        return getRoomRate(extraPaxPrice)
    } else {
        return null
    }
}

const getChdPrice = (chdAges, agencyChdAges, babyrate, chdrate, chd2rate) => {
    const childTotals = getChildTotals(chdAges, agencyChdAges)
        , totalBaby = Number(childTotals.totalBaby) * Number(babyrate) || 0
        , totalChd1 = Number(childTotals.totalChd1) * Number(chdrate) || 0
        , totalChd2 = Number(childTotals.totalChd2) * Number(chd2rate) || 0

    return (totalChd1 + totalChd2 + totalBaby)
}

const getTotalPrice = (priceList, totalPax, chdAges, agencyChdAges, useResRateVal = false) => {
    let useTotalPrice, paxPrice, chdPrice, discrateVal
    if(useResRateVal){
        const { rsingle, rdouble, rtriple, rquad, extra, extra2, baby, child, child2, discrate } = priceList
        paxPrice = getPaxPrice(totalPax, rsingle, rdouble, rtriple, rquad, extra, extra2)
        chdPrice = getChdPrice(chdAges, agencyChdAges, baby, child, child2)
        discrateVal = discrate
        useTotalPrice = Number(paxPrice) + Number(chdPrice)
    }else {
        const { sngrate, dblrate, trprate, quadrate, extrarate, extra2rate, babyrate, chdrate, chd2rate, discrate } = priceList
        paxPrice = getPaxPrice(totalPax, sngrate, dblrate, trprate, quadrate, extrarate, extra2rate)
        chdPrice = getChdPrice(chdAges, agencyChdAges, babyrate, chdrate, chd2rate)
        discrateVal = discrate
        useTotalPrice = Number(paxPrice) + Number(chdPrice)
    }

    return {
        totalPrice: useTotalPrice || 0,
        discTotalPrice: applyDiscount(useTotalPrice, discrateVal) || 0,
    }
}

const useTotalPrice = (priceList, totalPax, chdAges, agencyChdAges, useResRateVal = false) => {
    if(priceList){
        let totalPrice = 0, discTotalPrice = 0, useDisc = false
        for (let priceItems of priceList) {
            const dailyPaxPrice = getTotalPrice(priceItems, totalPax, chdAges, agencyChdAges, useResRateVal)
            totalPrice += dailyPaxPrice.totalPrice
            if(dailyPaxPrice?.discTotalPrice > 0){
                useDisc = true
                discTotalPrice += dailyPaxPrice.discTotalPrice
            }else {
                discTotalPrice += dailyPaxPrice.totalPrice
            }
        }

        const discrateTotal = useDisc ? showDiscountRate(totalPrice, discTotalPrice) : 0
        return {
            totalPrice,
            discTotalPrice,
            discrateTotal
        }
    }

    return  {
        totalPrice: 0,
        discTotalPrice: 0,
        discrateTotal: 0
    }
}

const isAnyRoomAvailability = (impressionsData) => {
    let isAvailable = false
    for (const impressionKey in impressionsData){
        console.log('impression => ', impressionsData[impressionKey])
        if (impressionsData[impressionKey].totalroom > 0) {
            isAvailable = true
            break;
        }
    }
    return isAvailable
}

const getLowPrices = (impressionsData, adult) => {
    const allPriceList = []
    impressionsData.map((impression) => {
        impression.priceList.map((priceListItem) => {
            const totalPrice = useTotalPrice(priceListItem.prices, adult).discTotalPrice || useTotalPrice(priceListItem.prices, adult).totalPrice || 0
            if(totalPrice > 0)
                allPriceList.push(totalPrice)
        })
    })

    return allPriceList?.sort((a, b) => a - b)[0]
}

const getCurrencyCodeToIso = (currCode) => {
    switch (currCode) {
        case 'TL':
            return 'TRY'
        default:
            return currCode
    }
}

const getChildTotals = (childAges, agencyInfo) => {
    let
        totalChd1 = 0
        , totalChd2 = 0
        , totalBaby = 0

    if (childAges && childAges.length > 0) {
        const
            babyAge = Number(agencyInfo.babyage)
            , chd1Age = Number(agencyInfo.chd1age)
            , chd2Age = Number(agencyInfo.chd2age)

        for (let childAge of childAges) {
            if (childAge) {
                const useChild = typeof childAge === 'string' ? JSON.parse(childAge) : childAge
                    , useAge = Number(useChild.age)
                if (useAge > 0 && babyAge > 0 && useAge <= babyAge) {
                    totalBaby++
                } else if (useAge > 0 && chd1Age > 0 && useAge <= chd1Age) {
                    totalChd1++
                } else if (useAge > 0 && chd2Age > 0 && useAge <= chd2Age) {
                    totalChd2++
                }
            }
        }
    }

    return {
        totalChd1, totalChd2, totalBaby
    }
}

const getDeviceType = () => {
    if (/(up.browser|up.link|mmp|symbian|smartphone|midp|wap|phone|android|iemobile|w3c|acs\-|alav|alca|amoi|audi|avan|benq|bird|blac|blaz|brew|cell|cldc|cmd\-|dang|doco|eric|hipt|inno|ipaq|java|jigs|kddi|keji|leno|lg\-c|lg\-d|lg\-g|lge\-|maui|maxo|midp|mits|mmef|mobi|mot\-|moto|mwbp|nec\-|newt|noki|palm|pana|pant|phil|play|port|prox|qwap|sage|sams|sany|sch\-|sec\-|send|seri|sgh\-|shar|sie\-|siem|smal|smar|sony|sph\-|symb|t\-mo|teli|tim\-|tosh|tsm\-|upg1|upsi|vk\-v|voda|wap\-|wapa|wapi|wapp|wapr|webc|winw|winw|xda|xda\-) /i.test(navigator.userAgent)) {
        if (/(tablet|ipad|playbook)|(android(?!.*(mobi|opera mini)))/i.test(navigator.userAgent)) {
            return 'Tablet'
        } else {
            return 'Mobile'
        }
    } else if (/(tablet|ipad|playbook)|(android(?!.*(mobi|opera mini)))/i.test(navigator.userAgent)) {
        return 'Tablet'
    } else {
        return 'Desktop'
    }
}

const getBrowser = () => {
    let ua = navigator.userAgent, tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || []
        return { name: 'IE', version: (tem[1] || '') }
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\bOPR|Edge\/(\d+)/)
        if (tem != null) {
            return { name: 'Opera', version: tem[1] }
        }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?']
    if ((tem = ua.match(/version\/(\d+)/i)) != null) {
        M.splice(1, 1, tem[1])
    }
    return {
        name: M[0],
        version: M[1],
    }
}

const toSelfName = (fileName) => {
    const fileExt = fileName.split('.').pop(),
        newFileName = fileName.toString()
            .normalize('NFD')
            .replace(`.${fileExt}`, '')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-')
            .toLowerCase()
            .replace(/&/g, '-and-')
            .replace(/[^a-z0-9\-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-*/, '')
            .replace(/-*$/, '')

    return newFileName + `.${fileExt}`
}

module.exports = { getChildTotals, getDeviceType, getBrowser, toSelfName, getRoomRate, showDiscountRate, formatDiscRate, useTotalPrice, getTotalPrice, getPaxPrice, getChdPrice, getCurrencyCodeToIso, getLowPrices, isAnyRoomAvailability }