import axios from 'axios'

const emailTemplateGet = async (OREST_URL, OREST_TOKEN, TEMPLATE_NAME, LANGID, HOTELREFNO) => {
    return new Promise(async (resv, rej) => {
        return await axios({
            url: OREST_URL + '/rafile/view/list',
            method: 'get',
            headers: {
                Authorization: `Bearer ${OREST_TOKEN}`,
                ReqType: 'Company',
                'Content-Type': 'application/json',
            },
            params: {
                query: 'code::' + TEMPLATE_NAME + ',langid::' + LANGID,
                sort: 'hotelrefno-',
                limit: 1,
                hotelrefno: HOTELREFNO,
                chkselfish: false,
                allhotels: true,
            },
        })
            .then((response) => {
                const retData = {
                    gidstr: response.data.data[0].gid,
                    description: response.data.data[0].description,
                }
                resv(retData)
            })
            .catch((error) => {
                resv(false)
            })
    })
}

const emailTemplateProcess = async (OREST_URL, OREST_TOKEN, gidstr, templateArray) => {
    return new Promise(async (resv, rej) => {
        return await axios({
            url: OREST_URL + '/msgtemplate/doc/process/json',
            method: 'get',
            headers: {
                Authorization: `Bearer ${OREST_TOKEN}`,
                ReqType: 'Company',
                'Content-Type': 'application/json',
            },
            params: {
                filegid: gidstr,
                allhotels: true,
            },
            data: templateArray,
        })
            .then((response) => {
                //console.log(response.data)
                resv(response.data)
            })
            .catch((error) => {
                //console.log(error)
                resv(false)
            })
    })
}

const emailTemplateSend = async (OREST_URL, OREST_TOKEN, TO_EMAIL, FROM_EMAIL, SUBJECT, HTML_TEMPLATE) => {
    const options = {
        url: OREST_URL + '/msgbox/email/send?to=' + TO_EMAIL + '&from=' + FROM_EMAIL + '&subject=' + SUBJECT,
        method: 'post',
        headers: {
            Authorization: `Bearer ${OREST_TOKEN}`,
            ReqType: 'Company',
            'Content-Type': 'application/json',
        },
        data: HTML_TEMPLATE,
    }

    return new Promise(async (resv, rej) => {
        return await axios(options)
            .then((response) => {
                //console.log(response.data)
                if (response.status === 200 && response.data.success === true) {
                    resv(true)
                } else {
                    resv(false)
                }
            })
            .catch((error) => {
                //console.log(error)
                resv(false)
            })
    })
}

export { emailTemplateGet, emailTemplateProcess, emailTemplateSend }
