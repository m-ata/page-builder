const redis = require('redis')
const { promisify } = require("util")
require('redis-delete-wildcard')(redis)

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const redisUrl = process.env.REDIS_URL
const redisPort = process.env.REDIS_PORT

const redisClient = redis.createClient(redisPort, redisUrl)

redisClient.on('connect', function () {
    console.log('\x1b[36m', `webcms-redis:` ,'\x1b[0m', 'ready')
})

redisClient.on('error', function (err) {
    console.log('\x1b[36m', `webcms-redis:` ,'\x1b[0m', 'not connected')
    console.log('Redis Url:' + process.env.REDIS_URL)
    console.log('Redis Port:' + process.env.REDIS_PORT)
    console.log(`Something went wrong  ${err}`)
})

const setAsync = promisify(redisClient.set).bind(redisClient)
const expireAsync = promisify(redisClient.expire).bind(redisClient)
const getAsync = promisify(redisClient.get).bind(redisClient)
const delAsync = promisify(redisClient.del).bind(redisClient)
const delWildAsync = promisify(redisClient.delwild).bind(redisClient)

const _getAllCacheById = async (keys) => {
    let promises = keys.map((key) => {
        return new Promise((resolve) => {
            redisClient.get(key, (err, reply) => {
                resolve({
                    data: reply,
                    cachekey: key,
                })
            })
        })
    })
    return await Promise.all(promises).then((response) => response)
}

module.exports = {
    set: setAsync,
    expire: expireAsync,
    del: delAsync,
    delwild: delWildAsync,
    getCacheById: getAsync,
    getAllCacheById: _getAllCacheById,
}
