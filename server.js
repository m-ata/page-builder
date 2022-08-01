const express = require('express')
    , spdy = require('spdy')
    , bodyParser = require('body-parser')
    , compression = require('compression')
    , { parse } = require('url')
    , { locales, defaultLocale } = require('./lib/translations/config')
    , { languageMiddleware } = require('./lib/helpers/useLanguageMiddilware')
    , { versionMiddileware } = require('./lib/helpers/useVersionMiddileware')
    , { redirectNonWx3 } = require('./lib/helpers/useRedirectNonWx3')
    , {
    getInitialGeneralSettings,
    getInitialHcmAssest,
    getTmpStdJson,
    getSelectedLang,
    preLoadPages,
    preLoadWebsite,
} = require('./lib/initialState/default')
    , {
    shouldCompress,
    directProcessingPaths,
    protocols,
    isJsonStrValid,
    msToTime,
} = require('./lib/helpers/useServer')
    , next = require('next')
    , serverConst = require('./lib/serverConst')
    , useRedis = require('./lib/helpers/useRedis')
    , useBase = require('./lib/helpers/useBase')
    , useLog = require('./lib/helpers/useLog')
    , { performance } = require('perf_hooks')
    , dev = process.env.NODE_ENV !== 'production'
    , app = next({ dev })
    , handle = app.getRequestHandler()
    , port = parseInt(process.env.PORT, 10) || 3000
    ,path = require('path')
    , fs = require('fs')

const options = {
    key: fs.readFileSync(path.resolve('privateKey.key')),
    cert: fs.readFileSync(path.resolve('certificate.cert')),
    spdy: {
        protocols: ['h2','spdy/3.1', 'spdy/3', 'spdy/2','http/1.1', 'http/1.0'],
        plain: true,
        'x-forwarded-for': true,
        connection: {
            autoSpdy31: false,
        },
    },
}

app.prepare().then(() => {
    const server = express()
        , serverStartTime = performance.now()

    server.get(directProcessingPaths, (req, res) => {
        const parsedUrl = parse(req.url, true)
        //Static data do not need to loop, so the requests with the above path are handled directly.
        return handle(req, res, parsedUrl)
    })

    server.use(redirectNonWx3(dev))
    server.use(languageMiddleware(locales, defaultLocale))
    server.use(versionMiddileware(app.buildId || ''))
    server.use(compression({ filter: (req, res) => shouldCompress(req, res, compression) }))
    server.use(bodyParser.urlencoded({ extended: false }))
    server.use(bodyParser.json())
    server.post('/api/*', require('./@api/router'))

    server.all('*', async (req, res) => {
        const parsedUrl = parse(req.url, true), { query } = parsedUrl

        let protocol
            , hotelInfo
            , domainInfo
            , hotelGidstr
            , isChainList
            , ibeSettings
            , gappSettings
            , clientHistoryTabs
            , hotelSettings
            , useFilterLangs
            , useLangLongCodes
            , useClientParentCom
            , serverCacheData
            , tmpStdJson
            , WEBSITE_STDJSON
            , REDIS_WEBCMS_DATA
            , DEFAULT_HCMASSET
            , serverHostKey = req.headers.host.toUpperCase()
            , serverCacheKey = serverHostKey + serverConst.HOST_CACHE_SUFFIX

        if (query.clear === 'true') {
            await useRedis.delwild(`${serverConst.MS_CACHE_DATA_SUFFIX}*`).catch(() => false)
        }

        if (query.clearall === 'true') {
            await useRedis.delwild(`${serverCacheKey}*`).catch(() => false)
            await useRedis.delwild(`${serverConst.MS_CACHE_DATA_SUFFIX}*`).catch(() => false)
        }

        serverCacheData = await useRedis.getCacheById(serverCacheKey).catch(() => false)
        if (serverCacheData) {
            serverCacheData = JSON.parse(serverCacheData)
            res.GENERAL_SETTINGS = serverCacheData.GENERAL_SETTINGS
            res.OREST_CACHE_TOKEN = serverCacheData.OREST_CACHE_TOKEN
            res.RECAPTCHA_SECRET_KEY = serverCacheData.RECAPTCHA_SECRET_KEY
            res.PRIVATE_CHAIN_LIST = serverCacheData.PRIVATE_CHAIN_LIST
            res.REDIS_WEBCMS_DATA = serverCacheData.REDIS_WEBCMS_DATA
            return handle(req, res, parsedUrl)
        }

        if (!serverCacheData) {
            serverCacheData = {}
        }

        protocol = protocols.https
        if (dev || process.env.SSL_ENABLED === '\'false\'') {
            protocol = protocols.http
        }

        //getting data with webkey value
        domainInfo = await useBase.getDomainInfo(protocol, req, dev)

        domainInfo = {
            baseurl: 'http://sefakentharlek.localhost:3000/',
            hotelgidstr: '7b75eca3-efd3-4bb3-b53a-02b3bcc5d535',
            hotelmid: 123891468,
            domaincode: 'VIMA',
            domaindesc: 'Vima Hotels Domain',
            domainid: 27,
            domainurl: 'vima.hotech.systems',
            ischain: false,
            hotelrefno: 102966635,
            hotelpid: null,
            oresturl: 'https://vima.hotech.systems/orest',
            staticurl: 'https://vima.hotech.systems',
            webkey: 'sefakentharlek',
            isHotech: false,
        }

        // domainInfo = {
        //     baseurl: 'http://thermalium.localhost:3000/',
        //     hotelgidstr: 'ce9b7f50-02ba-4f97-91ba-564ef8819fe7',
        //     hotelmid: 3046,
        //     domaincode: 'VIMA',
        //     domaindesc: 'Vima Hotels Domain',
        //     domainid: 27,
        //     domainurl: 'vima.hotech.systems',
        //     ischain: false,
        //     hotelrefno: 1041,
        //     oresturl: 'https://vima.hotech.systems/orest',
        //     staticurl: 'https://vima.hotech.systems',
        //     webkey: 'thermalium'
        // }

        if (!domainInfo.hotelrefno) {
            await useRedis.delwild(`${serverCacheKey}*`).catch(() => {
                return false
            })
            return res.status(500).json(
                {
                    status: 'DOWN',
                    webkey: domainInfo.webkey,
                    orestUrl: domainInfo.oresturl,
                    errorMsg: `webcms-warning: No record was found for this webkey( ${domainInfo.webkey} ), please check if the settings are valid.`,
                },
            )
        }

        hotelGidstr = domainInfo.hotelgidstr
        hotelInfo = await useBase.getHotelInfo(domainInfo.oresturl, hotelGidstr, domainInfo.hotelrefno, req.currentVersion)

        if (domainInfo.ischain) isChainList = await useBase.getHotelChainList(domainInfo.oresturl, hotelGidstr, domainInfo.hotelrefno, req.currentVersion)

        ibeSettings = await useBase.getIbeSettings(domainInfo.oresturl, hotelGidstr, domainInfo.hotelrefno, req.currentVersion)
        gappSettings = await useBase.getGappSettings(domainInfo.oresturl, hotelGidstr, domainInfo.hotelrefno, req.currentVersion)
        clientHistoryTabs = await useBase.getClientHistoryTabs(domainInfo.oresturl, hotelGidstr, domainInfo.hotelrefno, req.currentVersion)
        hotelSettings = Object.assign({}, ibeSettings || {}, gappSettings || {}, clientHistoryTabs || {})
        useFilterLangs = await useBase.getHcmLangList(domainInfo.oresturl, hotelGidstr, domainInfo.hotelrefno, req.currentVersion)
        useLangLongCodes = useFilterLangs?.length > 0 ? useFilterLangs.map(item => ({ lngcode: item.langcode, srtcode: item.langshortcode })) : false
        useFilterLangs = useFilterLangs?.length > 0 ? useBase.groupBy(useFilterLangs, 'gcode') : false

        useClientParentCom = await useBase.getCrmClientParentCom(domainInfo.oresturl, hotelGidstr, domainInfo.hotelrefno, req.currentVersion)

        //configure general settings
        const GENERAL_SETTINGS_DATA = getInitialGeneralSettings(domainInfo, hotelInfo, hotelSettings, isChainList, useFilterLangs, useLangLongCodes, useClientParentCom)

        //for website
        const WEBSITE_CACHEKEY = serverConst.WEBCMS_DATA + GENERAL_SETTINGS_DATA.HOTELMID

        if (query.clearall === 'true') await useRedis.del(WEBSITE_CACHEKEY).catch(() => false)

        WEBSITE_STDJSON = await useRedis.getCacheById(WEBSITE_CACHEKEY).catch(() => false)

        let GUESTAPP_FOOTER = await useBase.getRafileListByQuery(domainInfo.oresturl, hotelGidstr, 'GUESTAPP.FOOTER', false, GENERAL_SETTINGS_DATA.useHotelRefno, req.currentVersion)
        if (GUESTAPP_FOOTER) {
            GUESTAPP_FOOTER = GUESTAPP_FOOTER?.filedata && JSON.parse(Buffer.from(GUESTAPP_FOOTER.filedata, 'base64').toString('utf-8')) || false
            GUESTAPP_FOOTER = GUESTAPP_FOOTER.footer
        } else {
            GUESTAPP_FOOTER = false
        }

        let WEBCMS_PATH_REDIRECT = await useBase.getRafileListByQuery(domainInfo.oresturl, hotelGidstr, 'WEBCMS.PATH.REDIRECT', false, GENERAL_SETTINGS_DATA.useHotelRefno, req.currentVersion)
        if (WEBCMS_PATH_REDIRECT) {
            WEBCMS_PATH_REDIRECT = WEBCMS_PATH_REDIRECT?.filedata && JSON.parse(Buffer.from(WEBCMS_PATH_REDIRECT.filedata, 'base64').toString('utf-8')) || false
        } else {
            WEBCMS_PATH_REDIRECT = false
        }

        DEFAULT_HCMASSET = getInitialHcmAssest()
        if (!WEBSITE_STDJSON) {
            tmpStdJson = getTmpStdJson()
            let
                HCMASSET,
                WEBSITE,
                LANGSFILE,
                HCM_ITEM,
                HOTELREFNO = GENERAL_SETTINGS_DATA.useHotelRefno,
                HCM_ITEM_LANG,
                RALANGS,
                defaultLang,
                filtered

            HCMASSET = await useBase.getAssets(domainInfo.oresturl, hotelGidstr, HOTELREFNO, req.currentVersion)
            WEBSITE = await useBase.getRafileListByQuery(domainInfo.oresturl, hotelGidstr, 'WEBINDEX', 'WEBSITE', HOTELREFNO, req.currentVersion)
            HCM_ITEM = await useBase.getHcmItemByCode(domainInfo.oresturl, hotelGidstr, 'WEBSITE-BUILDER-ITEM', HOTELREFNO, req.currentVersion)
            defaultLang = await useBase.getDefaultLanguage(domainInfo.oresturl, hotelGidstr, HOTELREFNO, req.currentVersion)

            if (HCM_ITEM && HCM_ITEM.id) {
                HCM_ITEM_LANG = await useBase.getHcmItemLang(domainInfo.oresturl, hotelGidstr, HCM_ITEM.id, HOTELREFNO, req.currentVersion)
                RALANGS = await useBase.getRaLangs(domainInfo.oresturl, hotelGidstr, HOTELREFNO, req.currentVersion)
                if (HCM_ITEM_LANG.length > 0 && RALANGS.length > 0) {
                    tmpStdJson.languages = getSelectedLang(HCM_ITEM_LANG, RALANGS)
                }
            }

            if (WEBSITE) {
                LANGSFILE = await useBase.getRafileListByQuery(domainInfo.oresturl, hotelGidstr, WEBSITE.code, 'LANG.WEBSITE', HOTELREFNO, req.currentVersion)
            }

            //temporary fix
            if (HCMASSET) {
                //setting asset images to url
                for (const img in HCMASSET.images) {
                    const imageData = await useBase.getRafileGetByGID(domainInfo.oresturl, hotelGidstr, HCMASSET.images[img], HOTELREFNO, req.currentVersion)
                    if (imageData.data) {
                        HCMASSET.images[img] = imageData.data.url && imageData.data.url.replace('/var/otello', '').replace('/public', '') || ''
                    }
                }
                for (const icon in HCMASSET.icons) {
                    const iconData = await useBase.getRafileGetByGID(domainInfo.oresturl, hotelGidstr, HCMASSET.icons[icon], HOTELREFNO, req.currentVersion)
                    if (iconData.data) {
                        HCMASSET.icons[icon] = iconData.data.url && iconData.data.url.replace('/var/otello', '').replace('/public', '') || ''
                    }
                }
                tmpStdJson.assets = HCMASSET
            }

            if (WEBSITE) {
                const WEBSITE_DATA = WEBSITE?.filedata && JSON.parse(Buffer.from(WEBSITE.filedata, 'base64').toString('utf-8')) || false
                tmpStdJson.default.header = WEBSITE_DATA.header
                tmpStdJson.default.footer = WEBSITE_DATA.footer
                let pages = WEBSITE_DATA.pages, updatedData = null
                if (pages) {
                    const updatedPages = await preLoadPages(domainInfo, hotelGidstr, HOTELREFNO, pages, req.currentVersion)
                    filtered = updatedPages.filter((el) => el != null)
                    updatedData = await preLoadWebsite(domainInfo, hotelGidstr, HOTELREFNO, filtered, req.currentVersion)
                }
                tmpStdJson.default.pages = updatedData
            }

            if (LANGSFILE && LANGSFILE?.filedata) {
                const LANGS_FILE = JSON.parse(Buffer.from(LANGSFILE.filedata, 'base64').toString('utf-8'))
                if (LANGS_FILE) {
                    if (LANGS_FILE.header) {
                        tmpStdJson.langsFile.header = LANGS_FILE.header
                    }
                    if (LANGS_FILE.footer) {
                        tmpStdJson.langsFile.footer = LANGS_FILE.footer
                    }
                    if (LANGS_FILE.footer) {
                        tmpStdJson.langsFile.pages = LANGS_FILE.pages
                    }
                }

                let langPages = []
                if (tmpStdJson.default.pages) {
                    for (let page of tmpStdJson.default.pages) {
                        const updatedPage = await useBase.getRafileGetByGID(domainInfo.oresturl, hotelGidstr, page.id, HOTELREFNO, req.currentVersion)
                        let updateLangPageFileData
                        const updatedLangPages = await useBase.getRafileListByQuery(domainInfo.oresturl, hotelGidstr, updatedPage.data.code, 'LANG.WEBPAGE', HOTELREFNO, req.currentVersion)
                        if (updatedLangPages) {
                            updateLangPageFileData = JSON.parse(Buffer.from(JSON.stringify(updatedLangPages.filedata), 'base64').toString('utf-8'))
                            updateLangPageFileData.id = updatedLangPages.gid
                            updateLangPageFileData.defaultId = page.id
                        }
                        langPages.push(updateLangPageFileData)
                    }
                }

                tmpStdJson.langsFile.pages = langPages
            }

            tmpStdJson.ccTel = hotelSettings.cctel
            tmpStdJson.defaultLanguage = defaultLang
            WEBSITE_STDJSON = tmpStdJson

            try {
                await useRedis.set(WEBSITE_CACHEKEY, JSON.stringify(WEBSITE_STDJSON)).catch(() => {
                    return false
                })
            } catch (e) {
                useLog.info('useRedis.set', useLog.statusType.fail, serverCacheData)
                return res.status(500).json({
                    status: 'DOWN',
                    webkey: GENERAL_SETTINGS_DATA.WEBKEY,
                    orestUrl: GENERAL_SETTINGS_DATA.OREST_URL,
                    errorMsg: 'Unable to access services, there may be an authorization or access problem.',
                })
            }
        }

        if (WEBSITE_STDJSON === null || WEBSITE_STDJSON.assets === '') {
            WEBSITE_STDJSON.assets = DEFAULT_HCMASSET
            REDIS_WEBCMS_DATA = WEBSITE_STDJSON
        } else {
            if (typeof WEBSITE_STDJSON === 'string') {
                REDIS_WEBCMS_DATA = JSON.parse(WEBSITE_STDJSON)
            } else {
                REDIS_WEBCMS_DATA = WEBSITE_STDJSON
            }
        }

        GENERAL_SETTINGS_DATA.GUESTAPP_FOOTER = GUESTAPP_FOOTER
        GENERAL_SETTINGS_DATA.HCMLANG_FILE = false
        GENERAL_SETTINGS_DATA.WEBCMS_PATH_REDIRECT = WEBCMS_PATH_REDIRECT

        serverCacheData.GENERAL_SETTINGS = GENERAL_SETTINGS_DATA
        serverCacheData.OREST_CACHE_TOKEN = hotelGidstr
        serverCacheData.RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY
        serverCacheData.PRIVATE_CHAIN_LIST = isChainList && isChainList.private
        serverCacheData.REDIS_WEBCMS_DATA = REDIS_WEBCMS_DATA

        if (isJsonStrValid(serverCacheData)) {
            await useRedis.set(serverCacheKey, JSON.stringify(serverCacheData)).catch(() => {
                return false
            })
        } else {
            useLog.info('useRedis.set', useLog.statusType.fail, serverCacheData)
            return res.status(500).json({
                status: 'DOWN',
                webkey: GENERAL_SETTINGS_DATA.WEBKEY,
                orestUrl: GENERAL_SETTINGS_DATA.OREST_URL,
                errorMsg: 'Unable to access services, there may be an authorization or access problem.',
            })
        }

        res.GENERAL_SETTINGS = GENERAL_SETTINGS_DATA
        res.OREST_CACHE_TOKEN = hotelGidstr
        res.RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY
        res.PRIVATE_CHAIN_LIST = isChainList && isChainList.private
        res.REDIS_WEBCMS_DATA = REDIS_WEBCMS_DATA
        res.serverCacheKey = serverCacheKey

        const serverEndTime = performance.now()
        if (dev) {
            console.log('\x1b[36m', `webcms-preload:`, '\x1b[0m', 'It took', '\x1b[42m', msToTime(serverEndTime - serverStartTime), '\x1b[0m', 'to fully load.')
        }

        return await handle(req, res, parsedUrl)
    })

    spdy.createServer(options, server).listen(port, (error) => {
        if (error) {
            console.log('\x1b[36m', `webcms-server:`, '\x1b[0m', error)
            return process.exit(1)
        } else {
            console.log('\x1b[36m', `webcms-server:`, '\x1b[0m', 'ready')
        }
    })

}).catch((err) => {
    console.log('\x1b[36m', `webcms-server:`, '\x1b[0m', 'An error occurred, unable to start the server')
    console.log(err)
})

