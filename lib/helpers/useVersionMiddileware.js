const versionMiddileware = (buildId) => {
    return function(req, res, next) {
        req['currentVersion'] = buildId || "";
        next();
    }
}

module.exports = {
    versionMiddileware
}