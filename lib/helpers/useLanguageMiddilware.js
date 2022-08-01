const languageMiddleware = (availableLanguages, defaultLanguage) => {
    return function(req, res, next) {
        const acceptLanguage = req.headers['accept-language'] && req.headers['accept-language'].substring(0, 2) || defaultLanguage;
        req['currentLanguage'] = availableLanguages.includes(acceptLanguage) ? acceptLanguage : defaultLanguage;
        next();
    }
}

module.exports = {
    languageMiddleware
}