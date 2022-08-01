const axios = require('axios')
const helpers = require('./helpers')
const orestEndpoint = require('../constants/orest-endpoints.json')

const getHotelAppLang = async (req, res, langCode) => {
    if (!langCode) {
        return []
    }

    const hotelLanguageList = await axios({
        url: helpers.getUrl(res, orestEndpoint.api.rafileViewList),
        method: orestEndpoint.methods.get,
        headers: helpers.getHeaders(req, res),
        params: {
            query: `langcode:${langCode},filetype:HCMLANG.TARGET`,
            chkselfish: false,
        },
    }).then((response) => {
        if (response.status === 200 && response?.data?.data) {
            return response.data.data
        } else {
            return false
        }
    }).catch(() => {
        return false
    })

    let targetMergeData = []
    if (hotelLanguageList) {
        hotelLanguageList.map(trgFile => {
            const mergeData = trgFile?.filedata && JSON.parse(Buffer.from(trgFile.filedata, 'base64').toString('utf-8')) || []
            targetMergeData = targetMergeData.concat(...mergeData)
        })
    }

    if (res?.GENERAL_SETTINGS?.useLangLongCodes) {
        const langLongCode = res?.GENERAL_SETTINGS?.useLangLongCodes.find(item => item.srtcode === langCode)?.lngcode || false
        if (langLongCode) {
            const hotelRaDictLanguageList = await axios({
                url: helpers.getUrl(res, orestEndpoint.api.radictViewList),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    query: `trglangcode:${langLongCode},hotelrefno!-1`,
                    limit: 0,
                    allhotels: true,
                    chkselfish: false,
                },
            }).then((response) => {
                if (response.status === 200 && response?.data?.data) {
                    return response.data.data.map(item => ({
                        src: item.srcword,
                        trg: item.trgword,
                        lng: langCode,
                    }))
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })

            if (hotelRaDictLanguageList && hotelRaDictLanguageList.length > 0) {
                targetMergeData = targetMergeData.concat(...hotelRaDictLanguageList)
            }
        }
    }

    return targetMergeData
}

module.exports = getHotelAppLang