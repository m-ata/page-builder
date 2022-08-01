const useBase = require('../helpers/useBase')

function getInitialGeneralSettings(domainInfo, hotelInfo, hotelSettings, isChainList, useFilterLangs, useLangLongCodes, useClientParentCom) {
    return {
        BASE_URL: domainInfo.baseurl || false,
        OREST_URL: domainInfo.oresturl || false,
        STATIC_URL: domainInfo.staticurl || false,
        PORTAL_URL: domainInfo.portalurl || false,
        HOTELREFNO: domainInfo.hotelrefno || false,
        HOTELMID: domainInfo.hotelmid || false,
        HOTELPID: domainInfo.hotelpid || false,
        ISCHAIN: !!(domainInfo.ischain && isChainList.public && isChainList.public.length > 0),
        ISPORTAL: domainInfo.isportal || false,
        HOTEL_CHAIN_LIST: isChainList && isChainList.public || false,
        WEBKEY: domainInfo.webkey || false,
        ASTOREURL: hotelInfo.astoreurl,
        ISTOREURL: hotelInfo.istoreurl,
        useHotelRefno: useBase.getUseHotelRefNo(useClientParentCom, domainInfo),
        useFilterLangs: useFilterLangs,
        useLangLongCodes: useLangLongCodes,
        hotelCountryIso: hotelInfo && hotelInfo.countryiso || false,
        hotelLocalLang: hotelInfo && hotelInfo.hotelangcode || 'en',
        hotelLocalLangGCode: hotelInfo && hotelInfo.hotelanggcode || 'en',
        hotelLocation: {
            lat: hotelInfo && hotelInfo.hotelat || false,
            lng: hotelInfo && hotelInfo.hotelng || false
        },
        hotelSettings: hotelSettings || false,
        RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY || null,
        isHotech: domainInfo.isHotech
    }
}


function getInitialHcmAssest() {
    return {
        images: {
            logo: '/files/EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/AGENCY/135363/logo.png',
            altLogo: '/files/EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/AGENCY/135363/logo-footer.png',
            logoBanner: '/files/EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/AGENCY/135363/logo.png',
            favicon: '/files/EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/AGENCY/135363/favicon.png',
            background: ''
        },
        meta: {
            title: 'DEFAULT HOTEL',
            lang: 'en',
            dir: 'ltr',
        },
        font: {
            name: 'default',
            size: 20,
            bold: false,
            italic: false,
        },
        colors: {
            primary: {
                main: 'rgba(74, 144, 226, 1)',
                light: 'rgba(74, 144, 226, 0.83)',
                dark: 'rgba(74, 144, 226, 1)',
                contrastText: '#fff',
            },
            secondary: {
                main: 'rgba(49, 113, 188, 1)',
                light: 'rgba(49, 113, 188, 0.78)',
                dark: 'rgba(32, 95, 169, 1)',
                contrastText: '#fff',
            },
            message: {
                main: 'rgba(74, 144, 226, 1)',
                light: 'rgba(74, 144, 226, 0.83)',
                dark: 'rgba(74, 144, 226, 1)',
                contrastText: '#fff',
            },
            button: {
                main: 'rgba(74, 144, 226, 1)',
                light: 'rgba(74, 144, 226, 0.83)',
                dark: 'rgba(74, 144, 226, 1)',
                contrastText: '#fff',
            },
        },
    }
}

function getTmpStdJson() {
    return {
        assets: getInitialHcmAssest(),
        default: {
            header: {},
            footer: {},
            pages: [],
        },
        langsFile: {
            header: {},
            footer: {},
            pages: [],
        },
        languages: [],
        ccTel: '',
        defaultLanguage: ''
    }
}

function getSelectedLang(HCM_ITEM_LANG, RALANGS) {
    let selectedLangs = []
    for (let itemLang of HCM_ITEM_LANG) {
        selectedLangs.push(RALANGS.find(lang => lang.id === itemLang.langid))
    }
    return selectedLangs
}

async function preLoadPages(domainInfo, hotelGidstr, HOTELREFNO, pages, CURRENT_VER = "") {
    let useData = []
    for (let page of pages) {
        const updatedPage = await useBase.getRafileGetByGID(domainInfo.oresturl, hotelGidstr, page.gid, HOTELREFNO, CURRENT_VER = "")
        let updatePageFileData
        if (updatedPage?.data) {
            updatePageFileData = JSON.parse(Buffer.from(JSON.stringify(updatedPage.data.filedata), 'base64').toString('utf-8'))
            updatePageFileData.currentCode = updatedPage.data.code
            updatePageFileData.id = page.gid
            page?.code ? updatePageFileData.code = page.code : updatePageFileData.code = [updatedPage.data.code]
        }
        useData.push(updatePageFileData)
    }
    return useData
}

async function preLoadWebsite(domainInfo, hotelGidstr, HOTELREFNO, filtered, CURRENT_VER = "") {
    let useData = []
    for (let data of filtered) {
        let sections = []
        for (let section of data.sections) {
            let items = []
            for (let item of section.items) {
                if (item.type === 'slider') {
                    const sliderData = await useBase.getHcmItemSldByGID(domainInfo.oresturl, hotelGidstr, item.gid, HOTELREFNO, CURRENT_VER = "")
                    if (sliderData && sliderData.id) {
                        const sliderImages = await useBase.getHcmItemImgBySliderID(domainInfo.oresturl, hotelGidstr, sliderData.id, HOTELREFNO, CURRENT_VER = "")
                        items.push({
                            id: item?.id || null,
                            type: item?.type || null,
                            width: item?.width || null,
                            gid: {
                                title: sliderData?.title || null,
                                description: sliderData?.description || null,
                                cta: sliderData?.cta || null,
                                expiryDate: sliderData?.expiredt,
                                images: sliderImages,
                            },
                            textColor: item?.textColor || null,
                            buttonColor: item?.buttonColor || null,
                        })
                    } else {
                        items.push({
                            id: item?.id || null,
                            type: item?.type || null,
                            width: item?.width || null,
                            gid: null,
                        })
                    }
                } else if (item.type === 'slider-gallery') {
                    const sliderData = await useBase.getHcmItemSldByGID(domainInfo.oresturl, hotelGidstr, item.gid, HOTELREFNO, CURRENT_VER = "")
                    if (sliderData && sliderData.id) {
                        const sliderImages = await useBase.getHcmItemImgBySliderID(domainInfo.oresturl, hotelGidstr, sliderData.id, HOTELREFNO, CURRENT_VER = "")
                        items.push({
                            id: item?.id || null,
                            type: item?.type || null,
                            width: item?.width || null,
                            gid: {
                                expiryDate: sliderData?.expiredt,
                                images: sliderImages,
                            },
                            textColor: item?.textColor || null,
                            buttonColor: item?.buttonColor || null,
                        })
                    } else {
                        items.push({
                            id: item?.id || null,
                            type: item?.type || null,
                            width: item?.width || null,
                            gid: null,
                        })
                    }
                } else if (item.type === 'card-slider') {
                    const sliderData = await useBase.getHcmItemSldByGID(domainInfo.oresturl, hotelGidstr, item.gid, HOTELREFNO, CURRENT_VER = "")
                    if (sliderData && sliderData.id) {
                        const sliderImages = await useBase.getHcmItemImgBySliderID(
                            domainInfo.oresturl,
                            hotelGidstr,
                            sliderData.id,
                            HOTELREFNO,
                            CURRENT_VER
                        )
                        items.push({
                            id: item?.id || null,
                            type: item?.type || null,
                            width: item?.width || null,
                            gid: {
                                expiryDate: sliderData?.expiredt,
                                images: sliderImages,
                            },
                            textColor: item?.textColor || null,
                            buttonColor: item?.buttonColor || null,
                        })
                    } else {
                        items.push({
                            id: item?.id || null,
                            type: item?.type || null,
                            width: item?.width || null,
                            gid: null,
                            textColor: item?.textColor || null,
                            buttonColor: item?.buttonColor || null,
                        })
                    }
                } else if (item.type === 'sliderOnly') {
                    const sliderData = await useBase.getHcmItemSldListGetMID(domainInfo.oresturl, hotelGidstr, item.masterid, HOTELREFNO, CURRENT_VER = "")
                    if (sliderData.length > 0 && sliderData[0].id) {
                        const sliderImages = await useBase.getHcmItemImgBySliderID(domainInfo.oresturl, hotelGidstr, sliderData[0].id, HOTELREFNO, CURRENT_VER = "")
                        items.push({
                            id: item?.id || null,
                            type: item?.type || null,
                            width: item?.width || null,
                            gid: {
                                title: sliderData[0]?.title || null,
                                description: sliderData[0]?.description || null,
                                cta: sliderData[0]?.cta || null,
                                images: sliderImages,
                            },
                        })
                    } else {
                        items.push({
                            id: item?.id || null,
                            type: item?.type || null,
                            width: item?.width || null,
                            masterid: null,
                        })
                    }
                } else if (item.type === 'image') {
                    const imageData = await useBase.getHcmItemImgGetByGID(domainInfo.oresturl, hotelGidstr, item.gid, HOTELREFNO, CURRENT_VER = "")
                    if (imageData && imageData.fileurl) {
                        items.push({
                            id: item?.id || null,
                            type: item?.type || null,
                            width: item?.width || null,
                            textColor: item?.textColor,
                            gid: {
                                title: imageData?.title || null,
                                description: imageData?.description || null,
                                fileurl: imageData?.fileurl || null,
                            },
                        })
                    } else {
                        items.push({
                            id: item?.id || null,
                            type: item?.type || null,
                            width: item?.width || null,
                            gid: null,
                        })
                    }
                } else if (item.type === 'paragraph') {
                    const textData = await useBase.getHcmItemTxtParByGID(domainInfo.oresturl, hotelGidstr, item.gid, HOTELREFNO, CURRENT_VER = "")
                    if (textData && textData.itemtext) {
                        items.push({
                            id: item?.id || null,
                            type: item?.type || null,
                            width: item?.width || null,
                            gid: {
                                text: textData?.itemtext || null,
                            },
                        })
                    } else {
                        items.push({
                            id: item?.id || null,
                            type: item?.type || null,
                            width: item?.width || null,
                            gid: null,
                        })
                    }
                } else {
                    items.push(item)
                }
            }
            sections.push({
                id: section?.id || null,
                type: section.type || null,
                title: section.title || null,
                items: items,
            })
        }
        useData.push({
            id: data?.id || null,
            code: data.code || null,
            currentCode: data.currentCode || null,
            sections: sections,
        })
    }

    return useData
}

module.exports = {
    getInitialGeneralSettings,
    getInitialHcmAssest,
    getTmpStdJson,
    getSelectedLang,
    preLoadPages,
    preLoadWebsite
}