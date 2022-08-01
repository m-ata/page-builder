const axios = require('axios')
const serverConst = require('../serverConst')
const useLog = require('./useLog')

const removeProtocol = (url) => {
    if(!url) return '';
    return url.replace(/(^\w+:|^)\/\//, '').replace('/orest','')
}

const removePrefix3w = (url) => {
    return url.replace('www.', '')
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this
    return target.split(search).join(replacement)
}

const getDomainInfo = (protocol, req, isDev) => {
    let webkey,
        oresturl,
        staticurl,
        domainUrl,
        isHotech = false,
        hostUrl = req.headers.host

    hostUrl = removePrefix3w(hostUrl)

    if (isDev || hostUrl.includes(serverConst.CLOUD_PRODUCT_NAME)) {
        webkey = hostUrl.split('.')
        webkey = webkey[0]
    } else if (hostUrl.includes(serverConst.CLOUD_MASTER_NAME)) {
        isHotech = true
        webkey = hostUrl
    } else {
        webkey = hostUrl
    }

    const orestCloudUrl = process.env.CLOUD_OREST_URL || serverConst.CLOUD_OREST_URL
    return new Promise(async (resv) => {
        const requestValue = {
            url: orestCloudUrl + serverConst.INFO_DOMAIN,
            method: 'get',
            params: { webkey: webkey },
        }

        useLog.info('getDomainInfo', useLog.statusType.sending, requestValue)
        axios(requestValue).then((response) => {
            let newResponse = response.data.data
            domainUrl = removeProtocol(newResponse.domainurl || serverConst.BETA_OREST_URL)

            if (domainUrl) {
                oresturl = protocol + domainUrl + process.env.OREST_PATH
                staticurl = protocol + domainUrl
            }

            if (isHotech) {
                oresturl = orestCloudUrl
                staticurl = serverConst.CLOUD_STATIC_URL
                newResponse.ischain = false
                newResponse.hotelmid = serverConst.CLOUD_HOTELMID
                newResponse.hotelrefno = serverConst.CLOUD_HOTELREFNO
                newResponse.hotelgidstr = serverConst.CLOUD_HOTELGIDSTR
                newResponse.isHotech = true
            }else {
                newResponse.isHotech = false
            }

            if (isDev) {
                oresturl = serverConst.DEV_OREST_URL
                staticurl = serverConst.DEV_STATIC_URL
            }

            newResponse.oresturl = oresturl
            newResponse.staticurl = staticurl
            newResponse.webkey = webkey
            newResponse.baseurl = protocol + hostUrl + '/'
            newResponse.portalurl = hostUrl.replace(/^[^.]+\./g, "")

            useLog.info('getDomainInfo', useLog.statusType.success, newResponse)
            resv(newResponse)
        }).catch((error) => {
            useLog.info('getDomainInfo', useLog.statusType.fail, error.response || { status: 0 })
            resv(error.response || { status: 0 })
        })
    })
}

const getHcmLangList = (OREST_URL, OREST_TOKEN, HOTELREFNO, CURRENT_VER) => {
    const requestValue = {
        url: OREST_URL + '/hcmitemlang/view/list',
        method: 'get',
        headers: {
            Authorization: `Bearer ${OREST_TOKEN && OREST_TOKEN}`,
            [serverConst.REQ_TYPE]: serverConst.REQ_TYPE_COMPANY,
            'Content-Type': 'application/json',
            'User-Agent': `WebCMS/${CURRENT_VER || ""} (WebCMS MS)`
        },
        params: {
            sort: 'langid',
            chkselfish: false,
            hotelrefno: HOTELREFNO
        }
    }

    useLog.info('getHcmLangList', useLog.statusType.sending, requestValue)
    return axios(requestValue).then((response) => {
        useLog.info('getHcmLangList', useLog.statusType.success, response.data && response.data.data || false)
        return response.data && response.data.data || false
    }).catch((error) => {
        useLog.info('getHcmLangList', useLog.statusType.fail, error.response || { status: 0 })
        return false
    })
}

const getHotelInfo = (OREST_URL, OREST_TOKEN, HOTELREFNO, CURRENT_VER = "")=> {
    const requestValue = {
        url: OREST_URL + '/info/hotel',
        method: 'get',
        headers: {
            Authorization: `Bearer ${OREST_TOKEN && OREST_TOKEN}`,
            [serverConst.REQ_TYPE]: serverConst.REQ_TYPE_COMPANY,
            'Content-Type': 'application/json',
            'User-Agent': `WebCMS/${CURRENT_VER || ""} (WebCMS MS)`
        },
        params: {
            hotelrefno: HOTELREFNO
        },
    }

    useLog.info('getHotelInfo', useLog.statusType.sending, requestValue)
    return axios(requestValue).then((response) => {
        useLog.info('getHotelInfo', useLog.statusType.success, response.data && response.data.data || null)
        return response.data && response.data.data || null
    }).catch((error) => {
        useLog.info('getHotelInfo', useLog.statusType.fail, error.response || { status: 0 })
        return error.response || { status: 0 }
    })
}

const getLangCode = async (OREST_URL, OREST_TOKEN, HOTELREFNO, CURRENT_VER = "")=> {
    const requestValue = {
        url: OREST_URL + '/sett/lang/local',
        method: 'get',
        headers: {
            Authorization: `Bearer ${OREST_TOKEN}`,
            [serverConst.REQ_TYPE]: serverConst.REQ_TYPE_COMPANY,
            'Content-Type': 'application/json',
            'User-Agent': `WebCMS/${CURRENT_VER || ""} (WebCMS MS)`
        },
        params: {
            hotelrefno: HOTELREFNO
        },
    }

    useLog.info('getLangCode', useLog.statusType.sending, requestValue)
    return axios(requestValue).then((response) => {
        useLog.info('getLangCode', useLog.statusType.success, response.data && response.data.data.code || null)
        return response.data && response.data.data.code || null
    }).catch((error) => {
        useLog.info('getLangCode', useLog.statusType.fail, error.response || { status: 0 })
        return error.response || { status: 0 }
    })
}

const getAssets = async (OREST_URL, OREST_TOKEN, HOTELREFNO, CURRENT_VER = "") => {
    const requestValue = {
        url: OREST_URL + '/rafile/list',
        method: 'get',
        headers: {
            Authorization: `Bearer ${OREST_TOKEN}`,
            [serverConst.REQ_TYPE]: serverConst.REQ_TYPE_COMPANY,
            'Content-Type': 'application/json',
            'User-Agent': `WebCMS/${CURRENT_VER || ""} (WebCMS MS)`
        },
        params: {
            query: 'code::HCMASSET',
            limit: 1,
            hotelrefno: HOTELREFNO
        },
    }

    useLog.info('getAssets', useLog.statusType.sending, requestValue)
    return axios(requestValue).then((response) => {
        useLog.info('getAssets', useLog.statusType.success,  response.data)
        if(response && response?.data?.data.length > 0){
            return JSON.parse(Buffer.from(response.data.data[0].filedata, 'base64').toString('utf-8'))
        }else{
            return false
        }
    }).catch((error) => {
        useLog.info('getAssets', useLog.statusType.fail, error.response || { status: 0 })
        return error.response || { status: 0 }
    })
}

const getRafileListByQuery = (OREST_URL, OREST_TOKEN, CODE, FILETYPE, HOTELREFNO, CURRENT_VER = "") => {
    const requestValue = {
        url: OREST_URL + '/rafile/list',
        method: 'get',
        headers: {
            Authorization: `Bearer ${OREST_TOKEN}`,
            [serverConst.REQ_TYPE]: serverConst.REQ_TYPE_COMPANY,
            'Content-Type': 'application/json',
            'User-Agent': `WebCMS/${CURRENT_VER || ""} (WebCMS MS)`
        },
        params: {
            query: `code::${CODE}${FILETYPE ? ',filetype::' + FILETYPE : ''}`,
            limit: 1,
            hotelrefno: HOTELREFNO
        },
    }

    useLog.info('getRafileListByQuery', useLog.statusType.sending, requestValue)
    return axios(requestValue).then((response) => {
        useLog.info('getRafileListByQuery', useLog.statusType.success, response.data)
        if(response?.data?.data){
            return response.data.data[0]
        }else {
            return null
        }
    }).catch((error) => {
        useLog.info('getRafileListByQuery', useLog.statusType.fail, error.response || { status: 0 })
        return error.response || { status: 0 }
    })
}

const getHcmItemByCode = (OREST_URL, OREST_TOKEN, CODE, HOTELREFNO, CURRENT_VER = "") => {
    const requestValue = {
        url: OREST_URL + '/hcmitem/getbycode',
        method: 'get',
        headers: {
            Authorization: `Bearer ${OREST_TOKEN}`,
            [serverConst.REQ_TYPE]: serverConst.REQ_TYPE_COMPANY,
            'Content-Type': 'application/json',
            'User-Agent': `WebCMS/${CURRENT_VER || ""} (WebCMS MS)`
        },
        params: {
            code: CODE,
            hotelrefno: HOTELREFNO,
        },
    }

    useLog.info('getHcmItemByCode', useLog.statusType.sending, requestValue)
    return axios(requestValue).then((response) => {
        if (response?.data?.data) {
            useLog.info('getHcmItemByCode', useLog.statusType.success, response.data.data)
            return response.data.data
        }else{
            useLog.info('getHcmItemByCode', useLog.statusType.empty, null)
            return false
        }
    }).catch((error) => {
        useLog.info('getHcmItemByCode', useLog.statusType.fail, error.response || { status: 0 })
        return error.response || { status: 0 }
    })
}

const getHcmItemLang = async (OREST_URL, OREST_TOKEN, ITEM_ID, HOTELREFNO, CURRENT_VER = "") => {
    const requestValue = {
        url: OREST_URL + '/hcmitemlang/view/list',
        method: 'get',
        headers: {
            Authorization: `Bearer ${OREST_TOKEN}`,
            [serverConst.REQ_TYPE]: serverConst.REQ_TYPE_COMPANY,
            'Content-Type': 'application/json',
            'User-Agent': `WebCMS/${CURRENT_VER || ""} (WebCMS MS)`
        },
        params: {
            query: `itemid::${ITEM_ID}`,
            chkselfish: false,
            hotelrefno: HOTELREFNO
        },
    }

    useLog.info('getHcmItemLang', useLog.statusType.sending, requestValue)
    return axios(requestValue).then((response) => {
        if (response && response.data && response.data.data) {
            useLog.info('getHcmItemLang', useLog.statusType.success, response.data.data)
            return response.data.data
        }
    }).catch((error) => {
        useLog.info('getHcmItemLang', useLog.statusType.fail, error.response || { status: 0 })
        return error.response || { status: 0 }
    })
}

const getRaLangs = (OREST_URL, OREST_TOKEN, HOTELREFNO, CURRENT_VER = "") => {
    const requestValue = {
        url: OREST_URL + '/ralang/view/list',
        method: 'get',
        headers: {
            Authorization: `Bearer ${OREST_TOKEN}`,
            [serverConst.REQ_TYPE]: serverConst.REQ_TYPE_COMPANY,
            'Content-Type': 'application/json',
            'User-Agent': `WebCMS/${CURRENT_VER || ""} (WebCMS MS)`
        },
        params: {
            chkselfish: false,
            hotelrefno: HOTELREFNO
        },
    }

    useLog.info('getRaLangs', useLog.statusType.sending, requestValue)
    return axios(requestValue).then((response) => {
        if (response && response.data && response.data.data && response.data.data.length > 0) {
            useLog.info('getRaLangs', useLog.statusType.success, response.data.data)
            return response.data.data
        }
    }).catch((error) => {
        useLog.info('getRaLangs', useLog.statusType.fail, error.response || { status: 0 })
        return error.response || { status: 0 }
    })
}

const getRafileGetByGID = async (OREST_URL, OREST_TOKEN, GID, HOTELREFNO, CURRENT_VER = "") => {
    const requestValue = {
        url: OREST_URL + '/rafile/get',
        method: 'get',
        headers: {
            Authorization: `Bearer ${OREST_TOKEN}`,
            [serverConst.REQ_TYPE]: serverConst.REQ_TYPE_COMPANY,
            'Content-Type': 'application/json',
            'User-Agent': `WebCMS/${CURRENT_VER || ""} (WebCMS MS)`
        },
        params: {
            gid: GID,
            hotelrefno: HOTELREFNO,
        },
    }

    useLog.info('getRafileGetByGID', useLog.statusType.sending, requestValue)
    return axios(requestValue).then((response) => {
        useLog.info('getRafileGetByGID', useLog.statusType.success, response.data)
        return response.data
    }).catch((error) => {
        useLog.info('getRafileGetByGID', useLog.statusType.fail, error.response || { status: 0 })
        return error.response || { status: 0 }
    })
}

const getHcmItemSldByGID = (OREST_URL, OREST_TOKEN, GID, HOTELREFNO, CURRENT_VER = "") => {
    const requestValue = {
        url: OREST_URL + '/hcmitemsld/get',
        method: 'get',
        headers: {
            Authorization: `Bearer ${OREST_TOKEN}`,
            [serverConst.REQ_TYPE]: serverConst.REQ_TYPE_COMPANY,
            'Content-Type': 'application/json',
            'User-Agent': `WebCMS/${CURRENT_VER || ""} (WebCMS MS)`
        },
        params: {
            gid: GID,
            hotelrefno: HOTELREFNO,
        },
    }

    useLog.info('getHcmItemSldByGID', useLog.statusType.sending, requestValue)
    return axios(requestValue).then((response) => {
        if (response?.data?.data) {
            useLog.info('getHcmItemSldByGID', useLog.statusType.success,  response.data.data[0])
            return response.data.data
        } else {
            useLog.info('getHcmItemSldByGID', useLog.statusType.empty, null)
            return null
        }
    }).catch((error) => {
        useLog.info('getHcmItemSldByGID', useLog.statusType.fail, error.response || { status: 0 })
        return error.response || { status: 0 }
    })
}

const getHcmItemSldListGetMID = (OREST_URL, OREST_TOKEN, MID, HOTELREFNO, CURRENT_VER = "") => {
    const requestValue = {
        url: OREST_URL + '/hcmitemsld/view/list',
        method: 'get',
        headers: {
            Authorization: `Bearer ${OREST_TOKEN}`,
            [serverConst.REQ_TYPE]: serverConst.REQ_TYPE_COMPANY,
            'Content-Type': 'application/json',
            'User-Agent': `WebCMS/${CURRENT_VER || ""} (WebCMS MS)`
        },
        params: {
            hotelrefno: HOTELREFNO,
            query: `masterid::${MID}`,
            chkselfish: false
        },
        // data: JSON.stringify([MID])
    }

    useLog.info('getHcmItemSldListGetMID', useLog.statusType.sending, requestValue)
    return axios(requestValue).then((response) => {
        if (response?.data?.data) {
            useLog.info('getHcmItemSldListGetMID', useLog.statusType.success,  response.data.data[0])
            return response.data.data
        } else {
            useLog.info('getHcmItemSldListGetMID', useLog.statusType.empty, null)
            return null
        }
    }).catch((error) => {
        useLog.info('getHcmItemSldListGetMID', useLog.statusType.fail, error.response || { status: 0 })
        return error.response || { status: 0 }
    })
}

const getIbeCcTel = (OREST_URL, OREST_TOKEN, HOTELREFNO, CURRENT_VER = "") => {
    const requestValue = {
        url: OREST_URL + '/sett/ibe/cctel',
        method: 'get',
        headers: {
            Authorization: `Bearer ${OREST_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': `WebCMS/${CURRENT_VER || ""} (WebCMS MS)`
        },
        params: {
            hotelrefno: HOTELREFNO,
        },
    }

    useLog.info('getIbeCcTel', useLog.statusType.sending, requestValue)
    return axios(requestValue).then((response) => {
        if (response && response.data && response.data.data) {
            useLog.info('getIbeCcTel', useLog.statusType.success,  response.data.data[0])
            return response.data.data.res;
        } else {
            useLog.info('getIbeCcTel', useLog.statusType.empty, null)
            return null
        }
    }).catch((error) => {
        useLog.info('getIbeCcTel', useLog.statusType.fail, error.response || { status: 0 })
        return error.response || { status: 0 }
    })
}

const getDefaultLanguage = (OREST_URL, OREST_TOKEN, HOTELREFNO, CURRENT_VER = "")=> {
    const requestValue = {
        url: OREST_URL + '/sett/lang/local',
        method: 'get',
        headers: {
            Authorization: `Bearer ${OREST_TOKEN}`,
            [serverConst.REQ_TYPE]: serverConst.REQ_TYPE_COMPANY,
            'Content-Type': 'application/json',
            'User-Agent': `WebCMS/${CURRENT_VER || ""} (WebCMS MS)`
        },
        params: {
            hotelrefno: HOTELREFNO
        },
    }

    useLog.info('getDefaultLanguage', useLog.statusType.sending, requestValue)
    return axios(requestValue).then((response) => {
        if (response && response.data && response.data.data) {
            useLog.info('getDefaultLanguage', useLog.statusType.success,  response.data.data[0])
            return response.data.data;
        } else {
            useLog.info('getDefaultLanguage', useLog.statusType.empty, null)
            return null
        }
    }).catch((error) => {
        useLog.info('getDefaultLanguage', useLog.statusType.fail, error.response || { status: 0 })
        return error.response || { status: 0 }
    })
}

const getSliderImages = (OREST_URL, OREST_TOKEN, SLIDER_ID, HOTELREFNO, CURRENT_VER = "") => {
    const requestValue = {
        url: OREST_URL + '/hcmitemimg/view/list',
        method: 'get',
        headers: {
            Authorization: `Bearer ${OREST_TOKEN}`,
            [serverConst.REQ_TYPE]: serverConst.REQ_TYPE_COMPANY,
            'Content-Type': 'application/json',
            'User-Agent': `WebCMS/${CURRENT_VER || ""} (WebCMS MS)`
        },
        params: {
            query: 'sliderid::' + SLIDER_ID,
            sort: 'orderno',
            chkselfish: false,
            hotelrefno: HOTELREFNO
        },
    }

    useLog.info('getSliderImages', useLog.statusType.sending, requestValue)
    return axios(requestValue).then((response) => {
        if (response && response.data && response.data.data && response.data.data.length > 0) {
            useLog.info('getSliderImages', useLog.statusType.success,  response.data.data)
            return response.data.data
        } else {
            useLog.info('getSliderImages', useLog.statusType.empty, null)
            return null
        }
    }).catch((error) => {
        useLog.info('getSliderImages', useLog.statusType.fail, error.response || { status: 0 })
        return error.response || { status: 0 }
    })
}

const getHcmItemImgBySliderID = (OREST_URL, OREST_TOKEN, SLIDER_ID, HOTELREFNO, CURRENT_VER = "") => {
    const requestValue = {
        url: OREST_URL + '/hcmitemimg/view/list/get/sliderid',
        method: 'get',
        headers: {
            Authorization: `Bearer ${OREST_TOKEN}`,
            [serverConst.REQ_TYPE]: serverConst.REQ_TYPE_COMPANY,
            'Content-Type': 'application/json',
            'User-Agent': `WebCMS/${CURRENT_VER || ""} (WebCMS MS)`
        },
        params: {
            sort: 'orderno',
            chkselfish: false,
            hotelrefno: HOTELREFNO
        },
        data: JSON.stringify([SLIDER_ID])
    }

    useLog.info('getHcmItemImgBySliderID', useLog.statusType.sending, requestValue)
    return axios(requestValue).then((response) => {
        if (response?.data?.data) {
            useLog.info('getHcmItemImgBySliderID', useLog.statusType.success,  response.data.data)
            return response.data.data
        } else {
            useLog.info('getHcmItemImgBySliderID', useLog.statusType.empty, null)
            return null
        }
    }).catch((error) => {
        useLog.info('getHcmItemImgBySliderID', useLog.statusType.fail, error.response || { status: 0 })
        return error.response || { status: 0 }
    })
}

const getHcmItemImgGetByGID = (OREST_URL, OREST_TOKEN, GID, HOTELREFNO, CURRENT_VER = "") => {
    const requestValue = {
        url: OREST_URL + '/hcmitemimg/view/get',
        method: 'get',
        headers: {
            Authorization: `Bearer ${OREST_TOKEN}`,
            [serverConst.REQ_TYPE]: serverConst.REQ_TYPE_COMPANY,
            'Content-Type': 'application/json',
            'User-Agent': `WebCMS/${CURRENT_VER || ""} (WebCMS MS)`
        },
        params: {
            gid: GID,
            chkselfish: false,
            hotelrefno: HOTELREFNO
        },
    }

    useLog.info('getHcmItemImgGetByGID', useLog.statusType.sending, requestValue)
    return axios(requestValue).then((response) => {
        if (response?.data?.data) {
            useLog.info('getImageDataByGID', useLog.statusType.success,  response.data.data[0])
            return response.data.data
        } else {
            useLog.info('getImageDataByGID', useLog.statusType.empty, null)
            return null
        }
    }).catch((error) => {
        useLog.info('getImageDataByGID', useLog.statusType.fail, error.response || { status: 0 })
        return error.response || { status: 0 }
    })
}

const getHcmItemTxtParByGID = (OREST_URL, OREST_TOKEN, GID, HOTELREFNO, CURRENT_VER = "") => {
    const requestValue = {
        url: OREST_URL + '/hcmitemtxtpar/view/list',
        method: 'get',
        headers: {
            Authorization: `Bearer ${OREST_TOKEN}`,
            [serverConst.REQ_TYPE]: serverConst.REQ_TYPE_COMPANY,
            'Content-Type': 'application/json',
            'User-Agent': `WebCMS/${CURRENT_VER || ""} (WebCMS MS)`
        },
        params: {
            query: `gid::${GID}`,
            chkselfish: false,
            hotelrefno: HOTELREFNO
        },
    }

    useLog.info('getHcmItemTxtParByGID', useLog.statusType.sending, requestValue)
    return axios(requestValue).then((response) => {
        if (response?.data?.data) {
            useLog.info('getHcmItemTxtParByGID', useLog.statusType.success,  response.data.data[0])
            return response.data.data[0]
        } else {
            useLog.info('getHcmItemTxtParByGID', useLog.statusType.empty, null)
            return null
        }
    }).catch((error) => {
        useLog.info('getHcmItemTxtParByGID', useLog.statusType.fail, error.response || { status: 0 })
        return error.response || { status: 0 }
    })
}

const getHotelChainList = (OREST_URL, OREST_TOKEN, HOTELREFNO, CURRENT_VER = "") => {
    const requestValue = {
        url: OREST_URL + '/company/chain/list',
        method: 'get',
        headers: {
            Authorization: `Bearer ${OREST_TOKEN}`,
            [serverConst.REQ_TYPE]: serverConst.REQ_TYPE_COMPANY,
            'Content-Type': 'application/json',
            'User-Agent': `WebCMS/${CURRENT_VER || ""} (WebCMS MS)`
        },
        params: {
            accid: HOTELREFNO,
            isactive: true,
            incparent: false,
            sort: 'accid',
            incmembers: true,
            hotelrefno: HOTELREFNO
        },
    }

    useLog.info('getHotelChainList', useLog.statusType.sending, requestValue)
    return axios(requestValue).then(async (response) => {
        let newData = []
        for (let i in response.data.data) {
             newData.push({
                id: response.data.data[i].accid,
                code: response.data.data[i].code,
                country: response.data.data[i].country,
                city: response.data.data[i].city,
                webkey: response.data.data[i].webkey,
                countryAndCity: `${response.data.data[i].country}, ${response.data.data[i].city}`,
                thumbnail: response.data.data[i].thumbnail && response.data.data[i].thumbnail.replace('/var/otello', '').replace('/public', ''),
            })
        }

        useLog.info('getHotelChainList', useLog.statusType.success,  { public: newData, private: response.data.data })
        return { public: newData, private: response.data.data }
    }).catch((error) => {
        useLog.info('getHotelChainList', useLog.statusType.fail, error.response || { status: 0 })
        return false
    })
}

const getIbeSettings = (OREST_URL, OREST_TOKEN, HOTELREFNO, CURRENT_VER = "")=> {
    const requestValue = {
        url: OREST_URL + '/sett/ibe/list',
        method: 'get',
        headers: {
            Authorization: `Bearer ${OREST_TOKEN}`,
            [serverConst.REQ_TYPE]: serverConst.REQ_TYPE_COMPANY,
            'Content-Type': 'application/json',
            'User-Agent': `WebCMS/${CURRENT_VER || ""} (WebCMS MS)`
        },
        params: {
            hotelrefno: HOTELREFNO
        },
    }

    useLog.info('getIbeSettings', useLog.statusType.sending, requestValue)
    return axios(requestValue).then((response) => {
        if (response.status === 200) {
            useLog.info('getIbeSettings', useLog.statusType.success,  response.data && response.data.data || null)
            return response.data && response.data.data || null
        } else {
            useLog.info('getIbeSettings', useLog.statusType.empty, null)
            return false
        }
    }).catch((error) => {
        useLog.info('getIbeSettings', useLog.statusType.fail, error.response || { status: 0 })
        return error.response || { status: 0 }
    })
}

const getGappSettings = (OREST_URL, OREST_TOKEN, HOTELREFNO, CURRENT_VER = "")=> {
    const requestValue = {
        url: OREST_URL + '/sett/gapp/list',
        method: 'get',
        headers: {
            Authorization: `Bearer ${OREST_TOKEN}`,
            [serverConst.REQ_TYPE]: serverConst.REQ_TYPE_COMPANY,
            'Content-Type': 'application/json',
            'User-Agent': `WebCMS/${CURRENT_VER || ""} (WebCMS MS)`
        },
        params: {
            hotelrefno: HOTELREFNO
        },
    }

    useLog.info('getGappSettings', useLog.statusType.sending, requestValue)
    return axios(requestValue).then((response) => {
        if (response.status === 200) {
            useLog.info('getGappSettings', useLog.statusType.success,  response.data && response.data.data || null)
            let useData = response.data && response.data.data || null
            if(useData){
                useData = JSON.stringify(useData).replaceAll('_', '')
                useData = JSON.parse(useData)
            }

            return useData
        } else {
            useLog.info('getGappSettings', useLog.statusType.empty, null)
            return false
        }
    }).catch((error) => {
        useLog.info('getGappSettings', useLog.statusType.fail, error.response || { status: 0 })
        return error.response || { status: 0 }
    })
}

const getClientHistoryTabs = (OREST_URL, OREST_TOKEN, HOTELREFNO, CURRENT_VER = "")=> {
    const requestValue = {
        url: OREST_URL + '/sett/client/history/tabs',
        method: 'get',
        headers: {
            Authorization: `Bearer ${OREST_TOKEN}`,
            [serverConst.REQ_TYPE]: serverConst.REQ_TYPE_COMPANY,
            'Content-Type': 'application/json',
            'User-Agent': `WebCMS/${CURRENT_VER || ""} (WebCMS MS)`
        },
        params: {
            hotelrefno: HOTELREFNO
        },
    }

    useLog.info('getClientHistoryTabs', useLog.statusType.sending, requestValue)
    return axios(requestValue).then((response) => {
        if (response.status === 200) {
            useLog.info('getClientHistoryTabs', useLog.statusType.success,  response.data && response.data.data || null)
            return response.data && response.data.data && { agencyTabs: response.data.data } || null
        } else {
            useLog.info('getClientHistoryTabs', useLog.statusType.empty, null)
            return false
        }
    }).catch((error) => {
        useLog.info('getClientHistoryTabs', useLog.statusType.fail, error.response || { status: 0 })
        return error.response || { status: 0 }
    })
}

const getCrmClientParentCom = (OREST_URL, OREST_TOKEN, HOTELREFNO, CURRENT_VER = "")=> {
    const requestValue = {
        url: OREST_URL + '/sett/crm/client/parent/com',
        method: 'get',
        headers: {
            Authorization: `Bearer ${OREST_TOKEN}`,
            [serverConst.REQ_TYPE]: serverConst.REQ_TYPE_COMPANY,
      'Content-Type': 'application/json',
            'User-Agent': `WebCMS/${CURRENT_VER || ""} (WebCMS MS)`
        },
        params: {
            hotelrefno: HOTELREFNO
        },
    }

    useLog.info('getCrmClientParentCom', useLog.statusType.sending, requestValue)
    return axios(requestValue).then((response) => {
        if (response.status === 200) {
            useLog.info('getCrmClientParentCom', useLog.statusType.success,  response.data && response.data.data || null)
            return response.data && response.data.data.res
        } else {
            useLog.info('getCrmClientParentCom', useLog.statusType.empty, null)
            return false
        }
    }).catch((error) => {
        useLog.info('getCrmClientParentCom', useLog.statusType.fail, error.response || { status: 0 })
        return error.response || { status: 0 }
    })
}

const groupBy = (xs, key) => {
    let data = []
    xs.reduce(function(rv, x) {
        if(!data.includes(x[key]))
             data.push(x[key])
    }, {})
    return data
}

const hotelRefNoTypes = {
    HOTEL: 0,
    BRAND: 1,
    CHAIN: 2,
    SYSTEM: 9,
}

const getUseHotelRefNo = (clientParentCom, domainInfo) => {
    switch (clientParentCom) {
        case hotelRefNoTypes.HOTEL:
            return domainInfo.hotelrefno
        case hotelRefNoTypes.BRAND:
            return domainInfo.hotelpid
        case hotelRefNoTypes.CHAIN:
            return domainInfo.hoteltopid
        case hotelRefNoTypes.SYSTEM:
            return -1
        default:
            return domainInfo.hotelrefno
    }
}

module.exports = {
    getHcmLangList,
    getDomainInfo,
    getHotelInfo,
    getLangCode,
    getHotelChainList,
    getAssets,
    getRafileGetByGID,
    getRafileListByQuery,
    getHcmItemSldByGID,
    getHcmItemImgBySliderID,
    getHcmItemSldListGetMID,
    getHcmItemImgGetByGID,
    getHcmItemTxtParByGID,
    getSliderImages,
    getIbeSettings,
    getGappSettings,
    getClientHistoryTabs,
    getHcmItemByCode,
    getHcmItemLang,
    getRaLangs,
    groupBy,
    getIbeCcTel,
    getDefaultLanguage,
    getCrmClientParentCom,
    getUseHotelRefNo
}