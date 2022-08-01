const { protocols } = require('./useServer')

const redirectNonWx3 = (dev) => {
    return function(req, res, next) {
        let protocol = protocols.https, host = req.headers.host
        if (dev || process.env.SSL_ENABLED === '\'false\'') {
            protocol = protocols.http
        }

        if (host.includes('www.')) {
            res.setHeader('location', `${protocol}${host.replace('www.', '')}`)
            res.statusCode = 301
            return res.end()
        } else {
            return next()
        }
    }
}

module.exports = {
    redirectNonWx3
}