const axios = require('axios')
const helpers = require('./helpers')
const global = require('../constants/globals.json')
const orestEndpoint = require('../constants/orest-endpoints.json')

const getHotelDateTime = (req, res) => {
   return axios({
        url: helpers.getUrl(res, orestEndpoint.api.infoPortal),
        method: orestEndpoint.methods.get,
        headers: helpers.getHeaders(req, res),
        params: {
            [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
        },
    }).then((response) => {
       if (response?.data?.data) {
           return response.data.data
       }else {
           return null
       }
    }).catch(() => {
        return false
    })
}

module.exports = getHotelDateTime