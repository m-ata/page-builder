const fs = require('fs')

const isJson = (str) => {
    try {
        JSON.parse(str)
    } catch (e) {
        return false
    }
    return true
}

const opts = {
    errorEventName:'error',
    logDirectory:`public/${process?.env?.LOG_FILE_PATH || 'logs'}`,
    fileNamePattern:'webcms-request-<DATE>.log',
    dateFormat:'DD.MM.YYYY'
}

const str = {
    requestName: 'REQUEST-NAME: ',
    requestStatus: 'REQUEST-STATUS: ',
    value: 'VALUE: '
}

const _info = (requestName, requestStatus, value = ' - ') => {
    if (process?.env?.LOG_ENABLED === 'true' || process?.env?.LOG_ENABLED === true) {
        if (process?.env?.USE_LOG_FILE === 'true' || process?.env?.USE_LOG_FILE === true) {
            try {
                fs.accessSync(opts.logDirectory, fs.constants.R_OK | fs.constants.W_OK)
                return require('simple-node-logger').createRollingFileLogger(opts).info(str.requestName, requestName, ', ', str.requestStatus, requestStatus, ', ', str.value, value, ' ')
            } catch (err) {
                return console.log('\x1b[36m', `USE_LOG_FILE`, '\x1b[0m', 'is active but no write permission for file path', '\x1b[36m', `'${opts.logDirectory}'`, '\x1b[0m', ', please check.')
            }
        } else {
            const dateNow = new Date();
            const getTime = `${dateNow.getHours()}:${dateNow.getMinutes()}:${dateNow.getSeconds()}:${dateNow.getMilliseconds()}`
            return console.log('\x1b[36m', getTime, '\x1b[36m', str.requestName, '\x1b[0m', requestName, '\x1b[36m', str.requestStatus, '\x1b[0m', requestStatus, '\x1b[36m', str.value, '\x1b[0m', isJson(value) && JSON.stringify(value) || value)
        }
    }
    return
}

const _statusType = {
    sending: 'Sending',
    success: 'Success',
    empty: 'Empty',
    fail: 'Fail'
}

module.exports = {
    info: _info,
    statusType: _statusType
}