import axios from 'axios'

const getWebsiteTemplates = async (OREST_URL, OREST_TOKEN, REQUEST_PARAMS) => {
    const REQUEST_ADDRESS = OREST_URL + '/rafile/view/list'

    // const REQUEST_PARAMS = {
    //     query: 'filename:' + FILE_NAME + ',filetype:JSON',
    //     hotelrefno: HOTELREFNO,
    //     limit: 1,
    //     allhotels: true
    // };

    const REQUEST_OPTIONS = {
        url: REQUEST_ADDRESS,
        method: 'get',
        headers: {
            Authorization: `Bearer ${OREST_TOKEN}`,
            'Content-Type': 'application/json',
        },
        params: REQUEST_PARAMS,
    }

    return new Promise(async (resv, rej) => {
        return await axios(REQUEST_OPTIONS)
            .then((response) => {
                if (response.status === 200 && response.data.data) {
                    const templateData = response
                    resv(templateData)
                }
            })
            .catch((error) => {
                resv(error.response || { status: 0 })
            })
    })
}

export default getWebsiteTemplates
