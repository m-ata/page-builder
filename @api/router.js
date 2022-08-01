const controllers = require('./controller')
    , global = require('./constants/globals.json')
    , useRedis = require('../lib/helpers/useRedis')
    , serverConst = require('../lib/serverConst')
    , getUuid = require('uuid-by-string')
    , moment = require('moment')
    , { parse } = require('url')
    , { defaultLocale } = require('../lib/translations/config')
    , dev = process.env.NODE_ENV !== 'production'

const printConsoleMessage = (actionName = '', pathName = '', isCache = false, time = moment(new Date()).locale(defaultLocale).format('HH:mm:ss.SSS')) => {
    const setActionName = (key, isCache) => {
        if(key === 'request') return '\x1b[33m' + `${key}:`
        return '\x1b[34m' + `${key}${isCache && '\x1b[36m'+'(with cache)' || ''}`+'\x1b[34m' + ':'
    }

    const setTime = (time) => {
        return '\x1b[35m' + `${time}`
    }

    const setValue = (path) => {
        return '\x1b[0m' + `${path}`
    }

    return console.log(setActionName(actionName, isCache), setValue(pathName), setTime('time:'), setValue(time))
}

module.exports = async (request, response) => {
    let serverCacheKey = request.headers.host.toUpperCase() + serverConst.HOST_CACHE_SUFFIX
        , serverCacheData = await useRedis.getCacheById(serverCacheKey)
    serverCacheData = serverCacheData && JSON.parse(serverCacheData) || false

    if(!serverCacheData?.GENERAL_SETTINGS?.HOTELREFNO){
        return response.json({
            success: false,
            msg: 'cache_not_read'
        })
    }

    let settings = {
        global: serverCacheData.GENERAL_SETTINGS,
        hotelToken: serverCacheData.OREST_CACHE_TOKEN,
        webSiteData: serverCacheData.REDIS_WEBCMS_DATA,
        privateChainList: serverCacheData.PRIVATE_CHAIN_LIST,
        serverCacheKey: serverCacheKey
    }

    response.GENERAL_SETTINGS = serverCacheData.GENERAL_SETTINGS
    response.OREST_CACHE_TOKEN = serverCacheData.OREST_CACHE_TOKEN
    response.REDIS_WEBCMS_DATA = serverCacheData.REDIS_WEBCMS_DATA
    response.PRIVATE_CHAIN_LIST = serverCacheData.PRIVATE_CHAIN_LIST

    let pathName = parse(request.url).pathname,
        isClearCache = request.query.clear === 'true',
        dataOutput = {}

    let msCacheKey = serverConst.MS_CACHE_DATA_SUFFIX + serverCacheKey + '.' + getUuid(JSON.stringify(request.headers.host + pathName + JSON.stringify(request.query) + JSON.stringify(request.body)))
    let msCacheData = await useRedis.getCacheById(msCacheKey)
    let redisCacheTime = process.env.REDIS_CACHE_TIME || serverConst.ONE_DAY_SECOND //default one day
    if(dev) printConsoleMessage('request',  pathName)

    let purePath = pathName.replace('/api/', '')
    const useController = Object.keys(global.microEndpoint).find(key => String(global.microEndpoint[key].pathName) === String(purePath))

    if(msCacheData && global.microEndpoint[useController].cache && !isClearCache) {
        try {
            dataOutput = JSON.parse(msCacheData)
            dataOutput.cache = true
            if(dev) printConsoleMessage('response', pathName, true)
        }catch (e) {
            try {
                dataOutput = await controllers[useController](request, response, settings)
                if(global.microEndpoint[useController].cache && dataOutput !== undefined) {
                    await useRedis.set(msCacheKey, JSON.stringify(dataOutput))
                    await useRedis.expire(msCacheKey, redisCacheTime)
                }
                if(dev) printConsoleMessage('response', pathName, false)
            }catch (e) {
                dataOutput = {
                    success: false,
                    msg: 'invalid_cache'
                }
            }
        }
        return response.json(dataOutput)
    }else{
        if(useController && global.microEndpoint[useController]){
            try {
                dataOutput = await controllers[useController](request, response, settings)
                if(global.microEndpoint[useController].cache && dataOutput !== undefined) {
                    await useRedis.set(msCacheKey, JSON.stringify(dataOutput))
                    await useRedis.expire(msCacheKey, redisCacheTime)
                }
            }catch (e) {
                dataOutput = {
                    success: false,
                    msg: 'bad_request'
                }
            }
        }else{
            dataOutput = {
                success: false,
                msg: 'invalid_service_request'
            }
        }
        if(dev) printConsoleMessage('response', pathName)
        return response.json(dataOutput)
    }
};