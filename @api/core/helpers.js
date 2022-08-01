const helpers = {
    microName: (mircoName) => {
        return '/api/' + mircoName
    },
    getUrl: (res, endPoint, gid) => {
        if (gid) {
            return res.GENERAL_SETTINGS.OREST_URL + endPoint + '/' + gid
        }

        return res.GENERAL_SETTINGS.OREST_URL + endPoint
    },
    getHeaders: (req, res, token = false, isClientToken = false) => {
        if (token) {
            if (isClientToken) {
                return {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'User-Agent': `WebCMS/${req.currentVersion || ''} (WebCMS MS)`,
                }
            } else {
                return {
                    Authorization: `Bearer ${token || res.OREST_CACHE_TOKEN}`,
                    ReqType: 'Company',
                    'Content-Type': 'application/json',
                    'User-Agent': `WebCMS/${req.currentVersion || ''} (WebCMS MS)`,
                }
            }
        } else {
            return {
                Authorization: `Bearer ${req.query.hoteltoken && req.query.hoteltoken || token || res.OREST_CACHE_TOKEN}`,
                ReqType: 'Company',
                'Content-Type': 'application/json',
                'User-Agent': `WebCMS/${req.currentVersion || ''} (WebCMS MS)`,
            }
        }
    },
    getSettings: (req, res, key) => {
        return req.query.hotelrefno || res.GENERAL_SETTINGS[key.toUpperCase()]
    },
    isHotech: (res) => {
        return res && res.GENERAL_SETTINGS && res.GENERAL_SETTINGS.isHotech || false
    },
    isEmpty: (val) => {
        return val === '' || val === null
    },
    strIsJson: (str) => {
        try {
            JSON.parse(str)
        } catch (e) {
            return false
        }
        return true
    },
    creditCardMask: (num) => {
        return `${'*'.repeat(num.length - 4)}${num.substr(num.length - 4)}`
    },
    generatePassword: () => {
        let length = 8,
            charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
            retVal = ''
        for (let i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n))
        }
        return retVal.toLowerCase()
    },
    formatMoney: (amount, decimalCount = 2, decimal = '.', thousands = ',') => {
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
    },
    mobileTelNoFormat: (telno) => {
        String.prototype.replaceAll = function(search, replacement) {
            var target = this
            return target.split(search).join(replacement)
        }

        return telno?.replaceAll(' ', '').replaceAll('-', '').replaceAll('(', '').replaceAll(')', '').replaceAll('+', '00') || ''
    },
    bin2hex: (s) => {
        let i = 0, l = s.length, chr, hex = ''
        for (i; i < l; ++i) {
            chr = s.charCodeAt(i).toString(16)
            hex += chr.length < 2 ? '0' + chr : chr
        }
        return hex
    },
    encode_utf8: (s) => {
        return unescape(encodeURIComponent(s))
    },
    urlencode: (str) => {
        let newStr = ''
        const len = str.length

        for (let i = 0; i < len; i++) {
            let c = str.charAt(i)
            let code = str.charCodeAt(i)

            // Spaces
            if (c === ' ') {
                newStr += '+'
            }
            // Non-alphanumeric characters except "-", "_", and "."
            else if ((code < 48 && code !== 45 && code !== 46) ||
                (code < 65 && code > 57) ||
                (code > 90 && code < 97 && code !== 95) ||
                (code > 122)) {
                newStr += '%' + code.toString(16).toUpperCase()
            }
            // Alphanumeric characters
            else {
                newStr += c
            }
        }

        return newStr
    },
    encodeDataToURL: (data) => {
        return Object
            .keys(data)
            .map(value => `${value}=${typeof data[value] === 'string' ? helpers.urlencode(helpers.encode_utf8(data[value])) : data[value]}`)
            .join('&')
    },
}

module.exports = helpers