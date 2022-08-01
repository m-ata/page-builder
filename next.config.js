const axios = require("axios")
const serverConst = require('./lib/serverConst')
const filePath = require("path")
const moment = require("moment")

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const cloudHosts = [
    'cloud.hotech.systems',
    'tr.hotech.systems',
    'en.hotech.systems',
    'de.hotech.systems',
    'us.hotech.systems',
    'mx.hotech.systems',
    'vima.hotech.systems',
    'themarmara.hotech.systems',
    'beta.hotech.systems',
    'dev.hotech.dev'
]

if(process.env.STATIC_URL){
    const host = process.env.STATIC_URL
        .replace('https://', '')
        .replace('http://', '')

    if(!cloudHosts.includes(host)){
        cloudHosts.push(host)
    }
}

let imgDeviceSize = 1200, imgCacheQuality = 100
if(process.env.IMG_DEVICE_SIZE){
    imgDeviceSize = Number(process.env.IMG_DEVICE_SIZE)
}

if(process.env.IMG_CACHE_QUALITY){
    imgCacheQuality = Number(process.env.IMG_CACHE_QUALITY)
}

function createRaver(buildId, date) {
    return axios({
        url: `${serverConst.CLOUD_OREST_URL}/raver/ins`,
        headers: {
            Authorization: `Bearer ${serverConst.CLOUD_HOTELGIDSTR.toLowerCase()}`,
            ReqType: 'Company',
            'Content-Type': 'application/json',
        },
        method: 'post',
        data: {
            code: 'WEBCMS.' + buildId,
            description: 'WEBCMS.' + buildId,
            devproject: serverConst.WEBCMS_TRANSTYPE,
            reldate: date,
        },
    }).then(function() {
        return true
    }).catch(function() {
        return true
    })
}

module.exports ={
    distDir: '_next',
    images: {
        domains: cloudHosts,
        deviceSizes: [imgDeviceSize],
        imageSizes: [48]
    },
    generateBuildId: async () => {
        const buildId = await moment().format('YY.MM.DD.hh.mm.ss')
            , newDate = moment(buildId, 'YY.MM.DD.hh.mm.ss').format('YYYY-MM-DD')
        if (process.env.NODE_ENV === 'production') {
            await createRaver(buildId, newDate)
        }
        return buildId
    },
    webpack(config, { isServer }) {
        if(config){
            config?.resolve?.modules?.push(filePath.resolve("./")),
                config?.module?.rules?.push({
                    test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                    use: {
                        loader: 'url-loader',
                        options: {
                            limit: 100000000000
                        }
                    }
                })
            if (!isServer) {
                config.node = {
                    fs: 'empty'
                }
            }
        }
        return config
    },
    env: {
        'CLOUD_OREST_URL': process.env.CLOUD_OREST_URL,
        'SSL_ENABLED': process.env.SSL_ENABLED,
        'LOG_ENABLED': process.env.LOG_ENABLED,
        'USE_LOG_FILE': process.env.USE_LOG_FILE,
        'LOG_FILE_PATH': process.env.LOG_FILE_PATH,
        'PROJECT_ENV': process.env.PROJECT_ENV,
        'ONLY_GUESTWEB': process.env.ONLY_GUESTWEB,
        'PROJECT_PATH': process.env.PROJECT_PATH,
        'STATIC_URL': process.env.STATIC_URL,
        'OREST_URL': process.env.OREST_URL,
        'OREST_PATH': process.env.OREST_PATH,
        'OREST_USER_EMAIL': process.env.OREST_USER_EMAIL,
        'OREST_USER_PASS': process.env.OREST_USER_PASS,
        'CHAT_URL': process.env.CHAT_URL,
        'REDIS_URL': process.env.REDIS_URL,
        'REDIS_PORT': process.env.REDIS_PORT,
        'IMG_CACHE_QUALITY': imgCacheQuality,
        'IMG_DEVICE_SIZE': imgDeviceSize,
        'RECAPTCHA_SITE_KEY': process.env.RECAPTCHA_SITE_KEY,
        'RECAPTCHA_SECRET_KEY': process.env.RECAPTCHA_SECRET_KEY,
        'GOOGLE_MAP_API_KEY': process.env.GOOGLE_MAP_API_KEY,
        'USE_IP_ADDRESS': process.env.USE_IP_ADDRESS,
        'NODE_TLS_REJECT_UNAUTHORIZED': process.env.NODE_TLS_REJECT_UNAUTHORIZED
    }
}