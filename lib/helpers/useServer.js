const options = {
    spdy: {
        plain: true,
        ssl: true
    }
}

const isJsonStrValid = (str) => {
    try {
        JSON.stringify(str)
    } catch (e) {
        return false
    }
    return true
}

function msToTime(duration) {
    var milliseconds = parseInt((duration%1000))
        , seconds = parseInt((duration/1000)%60)
        , minutes = parseInt((duration/(1000*60))%60)
        , hours = parseInt((duration/(1000*60*60))%24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

const shouldCompress = (req, res, compression) => {
    // don't compress responses asking explicitly not
    if (req.headers['x-no-compression']) {
        return false
    }

    // use compression filter function
    return compression.filter(req, res)
}

// If the relevant screen does not need any data and it needs to be handled directly, you can add the path here.
const directProcessingPaths = ['/_next/image*', '/imgs/*', '/static/css*', '/static/styles*'];

const protocols = {
    https: 'https://',
    http: 'http://',
}

module.exports = {
    options,
    shouldCompress,
    directProcessingPaths,
    protocols,
    isJsonStrValid,
    msToTime,
}