import {EMPTY, SLASH} from 'model/globals'

export const OREST_BASE_URL = process.env.OREST_URL
export const BASE_URL = process.env.BASE_URL
export const STATIC_URL = process.env.STATIC_URL

export const DEFAULT_OREST_TOKEN = 'hotel gid token here'
export const DEMO_HOTEL_REF_NO = 999984
export const DEMO_HOTEL_COUNTRYCODE = 'tr'
export const DEFINED_HOTEL_REF_NO = -1
export const LOCAL_STORAGE_OREST_TOKEN_TEXT = 'orest-auth'
export const LOCAL_STORAGE_OREST_HOTELREFNO_TEXT = 'hotelrefno'
export const LOCAL_STORAGE_OREST_HOTELNAME_TEXT = 'hotelname'
export const LOCAL_STORAGE_EMAIL = 'email'
export const LOCAL_STORAGE_REMEMBER_ME = 'rememberMe'
export const LOCAL_STORAGE_PHONE_NUMBER = 'phoneNumber'
export const LOCAL_STORAGE_PERSIST_BOOK_INFO = 'PERSIST_BOOK_INFO'
export const LOCAL_STORAGE_WEBCMS_COLUMNS_SETTINGS = 'WEBCMS.COLUMNS.SETTINGS'
export const LOCAL_STORAGE_REDIRECT_TO_MOBILE_APP = 'redirectToMobileApp'
export const CONST_SITE_TEMPLATE = 'SITETEMPLATE'
export const OREST_VIEW_LIST = '/view/list'
export const OREST_LIST = '/list'
export const OREST_INSERT = '/ins'
export const OREST_PATCH = '/patch'
export const OREST_UPDATE = '/upt'
export const OREST_DELETE = '/del'
export const OREST_FULL = '/full'
export const OREST_UPLOAD = '/upload'
export const OREST_COUNT = '/count'
export const OREST_COUNT_SEARCH = '/count/search'

export const OREST_LOGIN_PARAM = '/auth/login'
export const OREST_LOGINFO_PARAM = '/loginfo'

export const OREST_AGENCY_PARAM = '/agency'
export const OREST_AGENCYTYPE_PARAM = '/agencytype'
export const OREST_CONTACT_PARAM = '/contact'
export const OREST_ROOMTYPE_PARAM = '/roomtype'
export const OREST_ROOM_PARAM = '/room'
export const OREST_ROOM_PROP_PARAM = '/roomprop'
export const OREST_ROOM_ATTR_PARAM = '/roomattr'
export const OREST_ROOM_BED_TYPES_PARAM = '/roombt'
export const OREST_ROOM_CHK_PARAM = '/roomchk'
export const OREST_REMARKGR_PARAM = '/remarkgr'
export const OREST_REMARK_PARAM = '/remark'
export const OREST_CMSCONTENTCAT_PARAM = '/cmscontentcat'
export const OREST_CMSSLIDER_PARAM = '/cmsslider'
export const OREST_CMSSLIDERITEM_PARAM = '/cmsslideritem'
export const OREST_RATAG_PARAM = '/ratag'
export const OREST_RAFILE_PARAM = '/rafile'
export const OREST_COUNTRY_PARAM = '/country'
export const OREST_CITY_PARAM = '/city'
export const OREST_TOWN_PARAM = '/town'
export const OREST_GEOLOC_PARAM = '/geoloc'
export const OREST_TOOLS_PARAM = '/tools'
export const OREST_CHANGEHOTEL_PARAM = '/changehotel'
export const OREST_TOOLS_USER_HASRIGHT = 'tools/user/hasright'

export const OREST_HCMCAT_PARAM = '/hcmcat'
export const OREST_HCMITEM_PARAM = '/hcmitem'
export const OREST_HCMITEMTXT_PARAM = '/hcmitemtxt'
export const OREST_HCMITEMTXTPAR_PARAM = '/hcmitemtxtpar'
export const OREST_HCMTXTSEC_PARAM = '/hcmtxtsec'

export const CHCK_EMAIL = /\S+@\S+\.\S+/

export const isObjectEmpty = (obj) => {
    return !Object.keys(obj).length > 0
}

export const isObjectEqual = (obj1, obj2) => {
    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)

    if (keys1.length !== keys2.length) {
        return false
    }

    for (let key of keys1) {
        if (obj1[key] !== obj2[key]) {
            return false
        }
    }

    return true
}

export const useOrestPath = (array) => {
    let res = SLASH
    array.forEach((e) => {
        res += e + SLASH
    })
    res = res.slice(0, -1)
    return res
}

export const useOrestQuery = (query) => {
    let res = EMPTY
    Object.entries(query).map(([key, value]) => {
        res += `${key}:${value},`
    })
    res = res.slice(0, -1)
    return res
}

export const getHyperlinkParser = (link) => {
    if (link && link.match(/<a [^>]+>([^<]+)<\/a>/) && link.match(/<a [^>]+>([^<]+)<\/a>/)[1] && link.match(/href="(.*?)"/) && link.match(/href="(.*?)"/)[1]) {
        return {
            text: link.match(/<a [^>]+>([^<]+)<\/a>/)[1],
            href: link.match(/href="(.*?)"/)[1],
        }
    } else {
        return false
    }
}

export const dataURLtoFile = (dataurl, filename) => {

    let arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n)

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }

    return new File([u8arr], filename, {type: mime})
}

export const getBrowserName = (window) => {
    return (function () {
        let test = function (regexp) {
            return regexp.test(window.navigator.userAgent)
        }
        switch (true) {
            case test(/edg/i):
                return 'Microsoft Edge'
            case test(/trident/i):
                return 'Microsoft Internet Explorer'
            case test(/firefox|fxios/i):
                return 'Mozilla Firefox'
            case test(/opr\//i):
                return 'Opera'
            case test(/ucbrowser/i):
                return 'UC Browser'
            case test(/samsungbrowser/i):
                return 'Samsung Browser'
            case test(/chrome|chromium|crios/i):
                return 'Google Chrome'
            case test(/safari/i):
                return 'Apple Safari'
            default:
                return 'Other'
        }
    })()
}


export const getOperationSystemName = () => {
    let unknown = 'Unknown'

    // screen
    let screenSize = ''
        , width
        , height
    if (screen.width) {
        width = (screen.width) ? screen.width : ''
        height = (screen.height) ? screen.height : ''
        screenSize += '' + width + ' x ' + height
    }

    //browser
    let nVer = navigator.appVersion
        , nAgt = navigator.userAgent
        , browser = navigator.appName
        , version = '' + parseFloat(navigator.appVersion)
        , majorVersion = parseInt(navigator.appVersion, 10)
        , nameOffset, verOffset, ix

    // Opera
    if ((verOffset = nAgt.indexOf('Opera')) !== -1) {
        browser = 'Opera'
        version = nAgt.substring(verOffset + 6)
        if ((verOffset = nAgt.indexOf('Version')) !== -1) {
            version = nAgt.substring(verOffset + 8)
        }
    }
    // MSIE
    else if ((verOffset = nAgt.indexOf('MSIE')) !== -1) {
        browser = 'Microsoft Internet Explorer'
        version = nAgt.substring(verOffset + 5)
    }

        //IE 11 no longer identifies itself as MS IE, so trap it
    //http://stackoverflow.com/questions/17907445/how-to-detect-ie11
    else if ((browser === 'Netscape') && (nAgt.indexOf('Trident/') !== -1)) {

        browser = 'Microsoft Internet Explorer'
        version = nAgt.substring(verOffset + 5)
        if ((verOffset = nAgt.indexOf('rv:')) !== -1) {
            version = nAgt.substring(verOffset + 3)
        }

    }

    // Chrome
    else if ((verOffset = nAgt.indexOf('Chrome')) !== -1) {
        browser = 'Chrome'
        version = nAgt.substring(verOffset + 7)
    }
    // Safari
    else if ((verOffset = nAgt.indexOf('Safari')) !== -1) {
        browser = 'Safari'
        version = nAgt.substring(verOffset + 7)
        if ((verOffset = nAgt.indexOf('Version')) !== -1) {
            version = nAgt.substring(verOffset + 8)
        }

        // Chrome on iPad identifies itself as Safari. Actual results do not match what Google claims
        //  at: https://developers.google.com/chrome/mobile/docs/user-agent?hl=ja
        //  No mention of chrome in the user agent string. However it does mention CriOS, which presumably
        //  can be keyed on to detect it.
        if (nAgt.indexOf('CriOS') !== -1) {
            //Chrome on iPad spoofing Safari...correct it.
            browser = 'Chrome'
            //Don't believe there is a way to grab the accurate version number, so leaving that for now.
        }
    }
    // Firefox
    else if ((verOffset = nAgt.indexOf('Firefox')) !== -1) {
        browser = 'Firefox'
        version = nAgt.substring(verOffset + 8)
    }
    // Other browsers
    else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
        browser = nAgt.substring(nameOffset, verOffset)
        version = nAgt.substring(verOffset + 1)
        if (browser.toLowerCase() === browser.toUpperCase()) {
            browser = navigator.appName
        }
    }
    // trim the version string
    if ((ix = version.indexOf(';')) !== -1) version = version.substring(0, ix)
    if ((ix = version.indexOf(' ')) !== -1) version = version.substring(0, ix)
    if ((ix = version.indexOf(')')) !== -1) version = version.substring(0, ix)

    majorVersion = parseInt('' + version, 10)
    if (isNaN(majorVersion)) {
        version = '' + parseFloat(navigator.appVersion)
        majorVersion = parseInt(navigator.appVersion, 10)
    }

    // mobile version
    let mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer)

    // cookie
    let cookieEnabled = (navigator.cookieEnabled)

    if (typeof navigator.cookieEnabled == 'undefined' && !cookieEnabled) {
        document.cookie = 'testcookie'
        cookieEnabled = (document.cookie.indexOf('testcookie') !== -1)
    }

    // system
    let os = unknown
    let clientStrings = [
        {s: 'Windows 3.11', r: /Win16/},
        {s: 'Windows 95', r: /(Windows 95|Win95|Windows_95)/},
        {s: 'Windows ME', r: /(Win 9x 4.90|Windows ME)/},
        {s: 'Windows 98', r: /(Windows 98|Win98)/},
        {s: 'Windows CE', r: /Windows CE/},
        {s: 'Windows 2000', r: /(Windows NT 5.0|Windows 2000)/},
        {s: 'Windows XP', r: /(Windows NT 5.1|Windows XP)/},
        {s: 'Windows Server 2003', r: /Windows NT 5.2/},
        {s: 'Windows Vista', r: /Windows NT 6.0/},
        {s: 'Windows 7', r: /(Windows 7|Windows NT 6.1)/},
        {s: 'Windows 8.1', r: /(Windows 8.1|Windows NT 6.3)/},
        {s: 'Windows 8', r: /(Windows 8|Windows NT 6.2)/},
        {s: 'Windows NT 4.0', r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
        {s: 'Windows ME', r: /Windows ME/},
        {s: 'Android', r: /Android/},
        {s: 'Open BSD', r: /OpenBSD/},
        {s: 'Sun OS', r: /SunOS/},
        {s: 'Linux', r: /(Linux|X11)/},
        {s: 'iOS', r: /(iPhone|iPad|iPod)/},
        {s: 'MacOS', r: /Mac OS X/},
        {s: 'MacOS', r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
        {s: 'QNX', r: /QNX/},
        {s: 'UNIX', r: /UNIX/},
        {s: 'BeOS', r: /BeOS/},
        {s: 'OS/2', r: /OS\/2/},
        {s: 'Search Bot', r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/},
    ]

    for (let id in clientStrings) {
        let cs = clientStrings[id]
        if (cs.r.test(nAgt)) {
            os = cs.s
            break
        }
    }

    let osVersion = unknown

    if (/Windows/.test(os)) {
        osVersion = /Windows (.*)/.exec(os)[1]
        os = 'Windows'
    }

    switch (os) {
        case 'MacOS':
            osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1]
            break

        case 'Android':
            osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1]
            break

        case 'iOS':
            osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer)
            osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0)
            break
    }

    return {
        screen: screenSize,
        browser: browser,
        browserVersion: version,
        mobile: mobile,
        os: os,
        osVersion: osVersion,
        cookies: cookieEnabled,
    }
}

export const isErrorMsg = (obj) => {
    let errMsg = []
    switch (obj.status) {
        case 400:
            errMsg.push({status: obj.status, errorMsg: obj.data.message})
            break
        case 401:
            errMsg.push({
                status: obj.status,
                errorMsg: 'str_sessionTimeoutLoginAgain',
                errorMsgDesc: obj.data.error_description,
            })
            break
        case 403:
            errMsg.push({status: obj.status, errorMsg: obj.data.error, errorMsgDesc: obj.data.error_description})
            break
        case 405:
            errMsg.push({
                status: obj.status,
                errorMsg: 'Method not allowed',
                errorMsgDesc: obj.data.error_description,
            })
            break
        case 500:
            errMsg.push({status: obj.status, errorMsg: obj.data.message})
            break
        default:
            errMsg.push({status: 0, errorMsg: 'A problem has occurred.'})
    }

    return errMsg[0]
}

export const mobileTelNoFormat = (telno) => {
    if (telno && String(telno).length > 0) {
        return telno?.replaceAll(' ', '').replaceAll('-', '').replaceAll('(', '').replaceAll(')', '').replaceAll('+', '00') || ''
    } else {
        return telno
    }
}

export const emailValidation = (email) => {
    const syntaxRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return syntaxRegex.test(String(email).toLowerCase())
}

/**
 * formatMoney
 * formatMoney(amount)
 */
export const formatMoney = (amount, decimalCount = 2, decimal = '.', thousands = ',') => {
    try {
        decimalCount = Math.abs(decimalCount)
        decimalCount = isNaN(decimalCount) ? 2 : decimalCount

        const negativeSign = amount < 0 ? '-' : ''

        let i = parseInt((amount = Math.abs(Number(amount) || 0).toFixed(decimalCount))).toString()
        let j = i.length > 3 ? i.length % 3 : 0

        return (
            negativeSign +
            (j ? i.substr(0, j) + thousands : '') +
            i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousands) +
            (decimalCount
                ? decimal +
                Math.abs(amount - i)
                    .toFixed(decimalCount)
                    .slice(2)
                : '')
        )
    } catch (e) {
        console.log(e)
    }
}

export const browserDateFormat = () => {
    return 'DD-MM-YYYY'
}

export const stdTimeFormat = (time) => {
    if (!time) return
    return time.replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, '$1$3')
}

export const checkResponse = (r) => {
    return r.status === 200 && Object.keys(r.data.data).length > 0
}

export const responseData = (r, first = false) => {
    return first ? r.data.data[0] : r.data.data
}

export const notZero = (r) => {
    return r !== 0
}

export const isZero = (r) => {
    return r === 0 || r === '0'
}

export const notNull = (r) => {
    return typeof r !== null
}

export const isMap = (r) => {
    return r && Object.keys(r).length > 0
}

export const jsonGroupBy = (xs, key, igkey) => {
    return xs.reduce(function (rv, x) {
        if (igkey) {
            if (x[igkey] !== true) {
                (rv[x[key]] = rv[x[key]] || []).push(x)
            }
        } else {
            (rv[x[key]] = rv[x[key]] || []).push(x)
        }
        return rv
    }, {})
}

export const convertUrlStandard = (text, options) => {
    let convertedText = text
    let opt = Object(options)

    const defaults = {
        delimiter: '-',
        limit: undefined,
        lowercase: true,
        replacements: {},
        transliterate: (typeof (XRegExp) === 'undefined'),
    }

    for (const k in defaults) {
        if (!opt.hasOwnProperty(k)) {
            opt[k] = defaults[k]
        }
    }

    const char_map = {
        'Ş': 'S', 'İ': 'I', 'Ç': 'C', 'Ü': 'U', 'Ö': 'O', 'Ğ': 'G',
        'ş': 's', 'ı': 'i', 'ç': 'c', 'ü': 'u', 'ö': 'o', 'ğ': 'g',
    }


    for (const k in opt.replacements) {
        convertedText = convertedText.replace(RegExp(k, 'g'), opt.replacements[k])
    }

    if (opt.transliterate) {
        for (const k in char_map) {
            convertedText = convertedText.replace(RegExp(k, 'g'), char_map[k])
        }
    }

    const alnum = (typeof (XRegExp) === 'undefined') ? RegExp('[^a-z0-9]+', 'ig') : XRegExp('[^\\p{L}\\p{N}]+', 'ig')
    convertedText = convertedText.replace(alnum, opt.delimiter)

    convertedText = convertedText.replace(RegExp('[' + opt.delimiter + ']{2,}', 'g'), opt.delimiter)

    convertedText = convertedText.substring(0, opt.limit)

    convertedText = convertedText.replace(RegExp('(^' + opt.delimiter + '|' + opt.delimiter + '$)', 'g'), '')

    return opt.lowercase ? convertedText.toLowerCase() : convertedText
}

export const findStatusColor = (status) => {
    const statusColors = {
        future: '#4C72B0',
        checkOut: '#C6C6C6',
        cancel: '#D85353',
        inHouse: '#4CB054',
        waiting: '#36b0a6'
    }
    switch (status) {
        case RESERVATION_STATUS.FUTURE:
            return statusColors.future
        case RESERVATION_STATUS.INHOUSE:
            return statusColors.inHouse
        case RESERVATION_STATUS.CHECKOUT:
            return statusColors.checkOut
        case RESERVATION_STATUS.CANCEL:
            return statusColors.cancel
        default:
            return statusColors.default
    }
}

export const renderReservStatus = (status) => {
    switch (status) {
        case RESERVATION_STATUS.FUTURE:
            return 'str_future'
        case RESERVATION_STATUS.INHOUSE:
            return 'str_resInhouse'
        case RESERVATION_STATUS.CHECKOUT:
            return 'str_resCheckedOut'
        case RESERVATION_STATUS.CANCEL:
            return 'str_resCancelled'
        default:
            return 'str_unclear'
    }
}

/**
 * Request Method constants
 * @const {Object}
 */
const REQUEST_METHOD_CONST = {}
REQUEST_METHOD_CONST.GET = 'GET'
REQUEST_METHOD_CONST.POST = 'POST'
REQUEST_METHOD_CONST.PUT = 'PUT'
REQUEST_METHOD_CONST.PATCH = 'PATCH'
REQUEST_METHOD_CONST.DELETE = 'DELETE'

/**
 * Orest endpoints
 * @const {Object}
 */
const OREST_ENDPOINT = {}
OREST_ENDPOINT.SLASH = '/'
OREST_ENDPOINT.HOTEL = 'hotel'
OREST_ENDPOINT.BOOK_INFO = 'book/info'
OREST_ENDPOINT.BOARDTYPE = 'boardtype'
OREST_ENDPOINT.ACC = 'acc'
OREST_ENDPOINT.ACCTRANS = 'acctrans'
OREST_ENDPOINT.ASSIGN = 'assign'
OREST_ENDPOINT.BANK = 'bank'
OREST_ENDPOINT.PAYTYPE = 'paytype'
OREST_ENDPOINT.AGENCY = 'agency'
OREST_ENDPOINT.CANCX = 'cancx'
OREST_ENDPOINT.COMPANY = 'company'
OREST_ENDPOINT.CLNTJOB = 'clntjob'
OREST_ENDPOINT.CLEAR = 'clear'
OREST_ENDPOINT.GID = 'gid'
OREST_ENDPOINT.UPD = 'upd'
OREST_ENDPOINT.AGENCYREGISTER = 'agency/register'
OREST_ENDPOINT.REGISTER = 'register'
OREST_ENDPOINT.AGENCYTYPE = 'agencytype'
OREST_ENDPOINT.BONUSTRANS = 'bonustrans'
OREST_ENDPOINT.CITY = 'city'
OREST_ENDPOINT.CLIENT = 'client'
OREST_ENDPOINT.CLIENT_LOGINID = 'client/loginid'
OREST_ENDPOINT.LOCRES = 'locres'
OREST_ENDPOINT.CLIENTREM = 'clientrem'
OREST_ENDPOINT.CLNTCOMM = 'clntcomm'
OREST_ENDPOINT.CMSSLIDER = 'cmsslider'
OREST_ENDPOINT.CMSSLIDERITEM = 'cmsslideritem'
OREST_ENDPOINT.COMM = 'comm'
OREST_ENDPOINT.DEL = 'del'
OREST_ENDPOINT.DEP = 'dep'
OREST_ENDPOINT.DOCI = 'doci'
OREST_ENDPOINT.CONTACT = 'contact'
OREST_ENDPOINT.COUNT = 'count'
OREST_ENDPOINT.COUNTRY = 'country'
OREST_ENDPOINT.DOWNLOAD = 'download'
OREST_ENDPOINT.DISCRATE = 'discrate'
OREST_ENDPOINT.EVENTLOC = 'eventloc'
OREST_ENDPOINT.EVENTYPE = 'eventype'
OREST_ENDPOINT.EVENTMENU = 'eventmenu'
OREST_ENDPOINT.RESEVENT = 'resevent'
OREST_ENDPOINT.EMPABILITY = 'empability'
OREST_ENDPOINT.EMPCVAPR = 'empcvapr'
OREST_ENDPOINT.EMPDEPART = 'empdepart'
OREST_ENDPOINT.EMPEDU = 'empedu'
OREST_ENDPOINT.EMPLANG = 'emplang'
OREST_ENDPOINT.EMPPOS = 'emppos'
OREST_ENDPOINT.EMPREF = 'empref'
OREST_ENDPOINT.EMPWORK = 'empwork'
OREST_ENDPOINT.EMPLOYEE = 'employee'
OREST_ENDPOINT.EDUTYPE = 'edutype'
OREST_ENDPOINT.FILE = 'file'
OREST_ENDPOINT.GAPP = 'gapp'
OREST_ENDPOINT.GENDER = 'gender'
OREST_ENDPOINT.GEOLOC = 'geoloc'
OREST_ENDPOINT.GET = 'get'
OREST_ENDPOINT.HCMCAT = 'hcmcat'
OREST_ENDPOINT.HASRIGHT = 'hasright'
OREST_ENDPOINT.HCMITEMSLD = 'hcmitemsld'
OREST_ENDPOINT.HCMITEM = 'hcmitem'
OREST_ENDPOINT.HCMITEMTXT = 'hcmitemtxt'
OREST_ENDPOINT.HCMITEMTXTPAR = 'hcmitemtxtpar'
OREST_ENDPOINT.HCMTXTSEC = 'hcmtxtsec'
OREST_ENDPOINT.HCMFACT = 'hcmfact'
OREST_ENDPOINT.HCMITEMFACT = 'hcmitemfact'
OREST_ENDPOINT.HCMITEMATTR = 'hcmitemattr'
OREST_ENDPOINT.HCMFACTATTR = 'hcmfactattr'
OREST_ENDPOINT.HCMITEMIMG = 'hcmitemimg'
OREST_ENDPOINT.HCMITEMLANG = 'hcmitemlang'
OREST_ENDPOINT.HCMITEMVID = 'hcmitemvid'
OREST_ENDPOINT.HCMSEC = 'hcmsec'
OREST_ENDPOINT.HOURS = 'hours'
OREST_ENDPOINT.LOGINID = 'loginid'
OREST_ENDPOINT.IDTYPE = 'idtype'
OREST_ENDPOINT.LASTUPD = 'lastupd'
OREST_ENDPOINT.LIST = 'list'
OREST_ENDPOINT.INS = 'ins'
OREST_ENDPOINT.INVOICE = 'invoice'
OREST_ENDPOINT.MODULE = 'module'
OREST_ENDPOINT.MEMCARD = 'memcard'
OREST_ENDPOINT.NATION = 'nation'
OREST_ENDPOINT.NEXTCARD = 'nextcard'
OREST_ENDPOINT.NONSTD = 'nonstd'
OREST_ENDPOINT.NOTE = 'note'
OREST_ENDPOINT.OPTIONS = 'options'
OREST_ENDPOINT.PATCH = 'patch'
OREST_ENDPOINT.PASS = 'pass'
OREST_ENDPOINT.PASSWD = 'passwd'
OREST_ENDPOINT.PASSWORD = 'password'
OREST_ENDPOINT.PHONE = 'phone'
OREST_ENDPOINT.POS = 'pos'
OREST_ENDPOINT.POSPRODUCT = 'posproduct'
OREST_ENDPOINT.PRODUCTLIST = 'productlist'
OREST_ENDPOINT.PRODUCT = 'product'
OREST_ENDPOINT.PRICE = 'price'
OREST_ENDPOINT.PROFILE = 'profile'
OREST_ENDPOINT.RAFILE = 'rafile'
OREST_ENDPOINT.RATAG = 'ratag'
OREST_ENDPOINT.REMARK = 'remark'
OREST_ENDPOINT.RESET = 'reset'
OREST_ENDPOINT.REMARKGR = 'remarkgr'
OREST_ENDPOINT.RESERVNO = 'reservno'
OREST_ENDPOINT.RESERVAT = 'reservat'
OREST_ENDPOINT.RESERVAT_DOX = 'reservat/dox'
OREST_ENDPOINT.RESERVAT_PRICE_CAL = 'reservat/price/calc'
OREST_ENDPOINT.RESERVAT_PRICE_TOTALS = 'reservat/price/totals'
OREST_ENDPOINT.RESMASTER = 'resmaster'
OREST_ENDPOINT.RESPAYTRANS = 'respaytrans'
OREST_ENDPOINT.RESNAME = 'resname'
OREST_ENDPOINT.RESCHD = 'reschd'
OREST_ENDPOINT.RES = 'res'
OREST_ENDPOINT.ROOM = 'room'
OREST_ENDPOINT.ROOMATTR = 'roomattr'
OREST_ENDPOINT.ROOMBT = 'roombt'
OREST_ENDPOINT.ROOMPROP = 'roomprop'
OREST_ENDPOINT.ROOMTYPE = 'roomtype'
OREST_ENDPOINT.ROOMTYPEBOOK = 'roomtype/book'
OREST_ENDPOINT.RESXREASON = 'resxreason'
OREST_ENDPOINT.RESXREASONLIST = 'resxreasonlist'
OREST_ENDPOINT.SPGROUP = 'spgroup'
OREST_ENDPOINT.SPRODUCT = 'sproduct'
OREST_ENDPOINT.SPTRANS = 'sptrans'
OREST_ENDPOINT.SPTLINE = 'sptline'
OREST_ENDPOINT.STD = 'std'
OREST_ENDPOINT.SETT = 'sett'
OREST_ENDPOINT.SEARCH = 'search'
OREST_ENDPOINT.STAT = 'stat'
OREST_ENDPOINT.STHELPER = 'sthelper'
OREST_ENDPOINT.STHLPLINE = 'sthlpline'
OREST_ENDPOINT.SURVEY = 'survey'
OREST_ENDPOINT.SURVEYANSWER = 'surveyanswer'
OREST_ENDPOINT.SURVEYTRANS = 'surveytrans'
OREST_ENDPOINT.SURVEYTREE = 'surveytree'
OREST_ENDPOINT.SALEDISC = 'saledisc'
OREST_ENDPOINT.SPSALEDISC = 'spsaledisc'
OREST_ENDPOINT.TAXOFFICE = 'taxoffice'
OREST_ENDPOINT.TASKBUG = 'taskbug'
OREST_ENDPOINT.TASKSUB = 'tasksub'
OREST_ENDPOINT.TOWN = 'town'
OREST_ENDPOINT.TOOLS = 'tools'
OREST_ENDPOINT.TSTRANS = 'tstrans'
OREST_ENDPOINT.TSLOCATION = 'tslocation'
OREST_ENDPOINT.TSSTATUS = 'tsstatus'
OREST_ENDPOINT.TSTYPE = 'tstype'
OREST_ENDPOINT.TSTRANSTYPE = 'tstranstype'
OREST_ENDPOINT.TSDESC = 'tsdesc'
OREST_ENDPOINT.TSDESCSOL = 'tsdescsol'
OREST_ENDPOINT.TRANSTYPE = 'transtype'
OREST_ENDPOINT.TSLINE = 'tsline'
OREST_ENDPOINT.USER = 'user'
OREST_ENDPOINT.USERINBOX = 'userinbox'
OREST_ENDPOINT.RALANG = 'ralang'
OREST_ENDPOINT.VIEW = 'view'
OREST_ENDPOINT.DATE = 'date'
OREST_ENDPOINT.SLOT = 'slot'
OREST_ENDPOINT.CURRENCY = 'currency'
OREST_ENDPOINT.RANOTE = 'ranote'
OREST_ENDPOINT.RATAG = 'ratag'
OREST_ENDPOINT.RAVER = 'raver'
OREST_ENDPOINT.INFO = 'info'
OREST_ENDPOINT.LOGIN = 'login'
OREST_ENDPOINT.WORKDATE = 'workdate'
OREST_ENDPOINT.WORKLIST = 'worklist'
OREST_ENDPOINT.ACCTYPE = 'acctype'
OREST_ENDPOINT.PBOOK = 'pbook'
OREST_ENDPOINT.SALECALL = 'salecall'
OREST_ENDPOINT.NEXT = 'next'

OREST_ENDPOINT.LISTINS = 'list/ins'
OREST_ENDPOINT.LISTDEL = 'list/del'

OREST_ENDPOINT.LIST_GET_CODE = 'list/get/code'

OREST_ENDPOINT.INSLINE = 'insline'
OREST_ENDPOINT.LISTPATCH = 'list/patch'
OREST_ENDPOINT.UPDATE = 'update'
OREST_ENDPOINT.UPDATETOTALS = 'update/totals'

OREST_ENDPOINT.DEF = 'def'
OREST_ENDPOINT.REPLY = 'reply'
OREST_ENDPOINT.REFCODE = 'refcode'

OREST_ENDPOINT.AUTHORIZATION = 'Authorization'
OREST_ENDPOINT.BEARER = 'Bearer '
OREST_ENDPOINT.CONTENT_TYPE = 'Content-Type'
OREST_ENDPOINT.APPLICATION_JSON = 'application/json'
OREST_ENDPOINT.DATEFORMAT_PARAMS = 'DD-MM-YYYY'
OREST_ENDPOINT.DATEFORMATDOTS = 'DD.MM.YYYY'
OREST_ENDPOINT.DATEFORMAT = 'YYYY-MM-DD'
OREST_ENDPOINT.DATEFORMAT_USER = 'DD/MM/YYYY'
OREST_ENDPOINT.DATEFORMAT_LOCALE = 'YYYY-MM-DDTHH:mm:ss'
OREST_ENDPOINT.TIMEFORMAT = 'HH:mm:ss'

const TRANSTYPES = {}
TRANSTYPES.DEV_PROJECT = 'devproject'
TRANSTYPES.BROWSER = 'browser'
TRANSTYPES.OSTYPE = 'ostype'
TRANSTYPES.OFFERS = '7020270'
TRANSTYPES.GUEST_ALACARTE = '4520002'
TRANSTYPES.GUEST_ALACARTE_TYP_ID = 9
TRANSTYPES.MARRIED = '4010205'

const FIELDTYPE = {}
FIELDTYPE.INT = '0000110'
FIELDTYPE.FLOAT = '0000105'
FIELDTYPE.CODE = '0000115'
FIELDTYPE.DESCRIPTION = '0000120'
FIELDTYPE.DATEYEAR = '0000125'
FIELDTYPE.DATEMONTH = '0000130'
FIELDTYPE.DATEDAY = '0000135'
FIELDTYPE.YESNO = '0000140'
FIELDTYPE.IMG = '0000300'
FIELDTYPE.VID = '4030290'
FIELDTYPE.RES_STATUS_ACTIVE = 'A'
FIELDTYPE.RES_STATUS_TEMPORARY = 'T'

const FILETYPE = {}
FILETYPE.TEXT = 'TXT'

const CONTENTYPE = {}
CONTENTYPE.JSON = '0000525'

const PAYMENTTYPES = {}
PAYMENTTYPES.PREPAYMENT = '1510103'

const SUBMODULE = {}
SUBMODULE.RESERVAT = '9943'
SUBMODULE.RESEVENT = '10150'

const ROLETYPES = {}
ROLETYPES.EMPLOYEE = '6500315'
ROLETYPES.GUEST = '6500310'
ROLETYPES.AGENCY = '6500300'

const XCODES = {}
XCODES.HUP = 'HUP'


const API_ENDPOINT = {}
API_ENDPOINT.GUEST = 'guest'
API_ENDPOINT.EVENTS = 'events'
API_ENDPOINT.WEEKLY = 'weekly'
API_ENDPOINT.NEARBY = 'nearby'
API_ENDPOINT.HOTEL = 'hotel'

const API_CONST = {}
API_CONST.WEBSITE_CACHE_INS = 'api/hotel/cache/ins'
API_CONST.WEBSITE_CACHE_GET = 'api/hotel/cache/get'
API_CONST.WEBSITE_CACHE_GETALL = 'api/hotel/cache/get-all'
API_CONST.WEBSITE_CACHE_UPDATE = 'api/hotel/cache/upd'
API_CONST.WEBSITE_CACHE_DEL = 'api/hotel/cache/del'
API_CONST.NO_RESULTS = 'noResults'
API_CONST.INVALID_REQUEST = 'invalid_request'
API_CONST.METHOD_NOT_ALLOWED = '405 Method Not Allowed'
API_CONST.IS_NO_DATA_THIS_KEY = 'There is no data for this key.'
API_CONST.KEY_IS_ALREADY_USED = 'This key is already used.'
API_CONST.KEY_IS_NOT_USED = 'This key is not used.'
API_CONST.KEY_IS_EMPTY = 'Key value is empty'

const GUESTWEB_CODE = {}
GUESTWEB_CODE.HOME_SLIDER = 'HOME_SLIDER'
GUESTWEB_CODE.WEEKLY = 'GUESTAPP.'
GUESTWEB_CODE.NEARBY = 'GUESTAPP.NEARBY'
GUESTWEB_CODE.HOTEL = 'GUESTAPP.HOTEL'

const RAFILE_CODE = {}
RAFILE_CODE.PHOTO = 'PHOTO'

const EMAIL_TEMPLATE = {}
EMAIL_TEMPLATE.OREST_CLD_IBE_RES_CONF_EML_CLI = 'OREST_CLD_IBE_RES_CONF_EML_CLI'
EMAIL_TEMPLATE.OREST_CLD_IBE_RES_CONF_EML_HTL = 'OREST_CLD_IBE_RES_CONF_EML_HTL'
EMAIL_TEMPLATE.CLD_HOTECH_REGISTER_CONTACT_MAIL = 'CLD_HOTECH_REGISTER_CONTACT_MAIL'
EMAIL_TEMPLATE.CLD_HOTECH_REGISTER_HOTEL_MAIL = 'CLD_HOTECH_REGISTER_HOTEL_MAIL'
EMAIL_TEMPLATE.WEB_CMS_SURVEY_CONFIRM = 'WEB_CMS_SURVEY_CONFIRM'

const EMAIL_ADDRESS = {}
EMAIL_ADDRESS.FROM_MAIL = 'info@hotech.com.tr'
EMAIL_ADDRESS.HOTECH_SALES_MAIL = 'sales@hotech.systems'

const RESERVATION_STATUS = {}
RESERVATION_STATUS.FUTURE = 'A'
RESERVATION_STATUS.INHOUSE = 'I'
RESERVATION_STATUS.CHECKOUT = 'O'
RESERVATION_STATUS.CANCEL = 'X'

export {
    SUBMODULE,
    API_CONST,
    API_ENDPOINT,
    REQUEST_METHOD_CONST,
    OREST_ENDPOINT,
    FIELDTYPE,
    FILETYPE,
    CONTENTYPE,
    EMAIL_TEMPLATE,
    EMAIL_ADDRESS,
    TRANSTYPES,
    GUESTWEB_CODE,
    ROLETYPES,
    RAFILE_CODE,
    XCODES,
    RESERVATION_STATUS,
    PAYMENTTYPES
}
