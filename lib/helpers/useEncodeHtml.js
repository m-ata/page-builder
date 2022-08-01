const he = require('he');

export const getEncodeHtml = (html) => {
    return he.encode(html, {
        'allowUnsafeSymbols': true
    })
}