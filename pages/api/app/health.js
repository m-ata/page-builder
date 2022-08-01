const axios = require('axios')
    , serverConst = require('../../../lib/serverConst')

function getOrestHealthCheck(OREST_URL, OREST_TOKEN, CURRENT_VER) {
    return axios({
        url: OREST_URL + '/info/hotel',
        method: 'get',
        timeout: 1000 * 15, // Wait for 30 sec.
        headers: {
            Authorization: `Bearer ${OREST_TOKEN && OREST_TOKEN}`,
            [serverConst.REQ_TYPE]: serverConst.REQ_TYPE_COMPANY,
            'Content-Type': 'application/json',
            'User-Agent': `WebCMS/${CURRENT_VER || ''} (WebCMS MS)`,
        },
    }).then((response) => {
        if (response.data.success) {
            return {
                success: true,
            }
        } else {
            return {
                success: false,
                error: response,
            }
        }
    }).catch((error) => {
        return {
            success: false,
            error: error,
        }
    })
}

export default async function handler(req, res) {
    const orestHealthCheck = await getOrestHealthCheck(res.GENERAL_SETTINGS.OREST_URL, res.OREST_CACHE_TOKEN, req.currentVersion)
    if(orestHealthCheck.success){
        res.status(200).json({ 'status': 'UP', 'orest_connection': 'UP' })
    }else{
        res.status(200).json({ 'status': 'UP', 'orest_connection': 'DOWN', 'error': String(orestHealthCheck.error)})
    }
}