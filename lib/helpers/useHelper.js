const base64json = require('base64json')

const _base64ToJson = (BASE64_DATA) => {
    return BASE64_DATA ? base64json.parse(BASE64_DATA) : null
}

const _jsonToBase64 = (JSON_DATA) => {
    return base64json.stringify(JSON_DATA, null, 2)
}

module.exports = {
    base64ToJson: _base64ToJson,
    jsonToBase64: _jsonToBase64,
}
