const axios = require('axios')

const _checkResponse = async (RECAPTCHA_SECRET_KEY, RESPONSE, REMOTE_IP) => {
    const REQUEST_ADDRESS = 'https://www.google.com/recaptcha/api/siteverify'

    const REQUEST_PARAMS = {
        secret: RECAPTCHA_SECRET_KEY,
        response: RESPONSE,
        remoteip: REMOTE_IP,
    }

    const REQUEST_OPTIONS = {
        url: REQUEST_ADDRESS,
        method: 'post',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        params: REQUEST_PARAMS,
    }

    return await axios(REQUEST_OPTIONS)
        .then((response) => {
            return response
        })
        .catch((error) => {
            return error.response || { status: 0 }
        })
}

const _isResponseValid = async (RECAPTCHA_SECRET_KEY, RESPONSE, REMOTE_IP) => {
    return new Promise(async (resv, rej) => {
        await _checkResponse(RECAPTCHA_SECRET_KEY, RESPONSE, REMOTE_IP)
            .then((response) => {
                resv(response)
            })
            .catch((error) => {
                resv(error.response || { status: 0 })
            })
    })
}

module.exports = {
    isResponseValid: _isResponseValid,
}
