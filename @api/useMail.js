const axios = require('axios')
const helpers = require('./core/helpers')
const orestEndpoint = require('./constants/orest-endpoints.json')
const { defaultLocale } = require('../lib/translations/config')

const useMail = {
    send: (req, res, { code, langcode = defaultLocale, sendername = "Hotech", senderemail = process.env.MAIL_SENDER_MAIL, subject, receivername, receiveremail }, dataset) => {
        return new Promise( (resolve) => {
            if (helpers.isEmpty(code)) {
                resolve({
                    success: false,
                    msg: 'Code field cannot be empty.',
                })
            }

            if (helpers.isEmpty(sendername)) {
                resolve({
                    success: false,
                    msg: 'SenderName field cannot be empty.',
                })
            }

            if (helpers.isEmpty(senderemail)) {
                resolve({
                    success: false,
                    msg: 'SenderEmail field cannot be empty.',
                })
            }

            if (helpers.isEmpty(subject)) {
                resolve({
                    success: false,
                    msg: 'Subject field cannot be empty.',
                })
            }

            if (helpers.isEmpty(receivername)) {
                resolve({
                    success: false,
                    msg: 'ReceiverName field cannot be empty.',
                })
            }

            if (helpers.isEmpty(receiveremail)) {
                resolve({
                    success: false,
                    msg: 'ReceiverEmail field cannot be empty.',
                })
            }

            if (helpers.isEmpty(dataset)) {
                resolve({
                    success: false,
                    msg: 'DataSet field cannot be empty.',
                })
            }

            let data = JSON.stringify({
                'dataset': dataset,
            })

            let params = new URLSearchParams()
            params.append('file.query', `code::${code},langcode:${langcode}`)
            params.append('sendername', sendername)
            params.append('senderemail', senderemail.replace(/\s/g, ''))
            params.append('subject', subject)
            params.append('receivername', receivername)

            if (receiveremail.includes(',')) {
                receiveremail.split(/\s*,\s*/).forEach((recEmail) => {
                    params.append('receiveremail', recEmail.replace(/\s/g, ''))
                })
            } else {
                params.append('receiveremail', receiveremail.replace(/\s/g, ''))
            }

            params.append('sort', 'hotelrefno-')
            params.append('file.chkhotelsuper', orestEndpoint.global.true)
            params.append('file.chkhotel', orestEndpoint.global.true)

            axios({
                url: helpers.getUrl(res, orestEndpoint.api.toolsTemplateRafileProcessDataEmail),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: params,
                data: data,
            }).then((response) => response.status === 200 ? resolve({
                success: true
            }) : resolve({
                success: false,
                msg: response.data.message,
            })).catch((err) => {
                console.log(err)
                resolve({
                    success: false,
                    msg: 'Request error.',
                })
              }
            )
        })
    }
}

module.exports = useMail