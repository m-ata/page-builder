import axios from 'axios'

const sendGuestChangeNotifyMail = (refTemp, refTyp, refId, refGid, reservGid, reservNo, refData, hotelRefNo) => {
    return axios({
        url: 'api/hotel/guest/change/notify',
        method: 'post',
        timeout: 1000 * 15, // Wait for 30 sec.
        params: {
            reftyp: refTyp,
            reftemp: refTemp,
            clientid: refId,
            refgid: refGid,
            reservgid: reservGid,
            reservno: reservNo,
            hotelrefno: hotelRefNo,
        },
        data: refData,
    }).catch(() => {
        return false
    })
}

const sendCheckInNotificationForHotelAndClient = (reservatGid, reservatNo, clientFullName, clientEmail, langCode, hotelRefNo) => {
    return axios({
        url: 'api/hotel/checkin/notification',
        method: 'post',
        timeout: 1000 * 15, // Wait for 30 sec.
        params: {
            refcode: 'reservat',
            refgid: reservatGid,
            reservno: reservatNo,
            clientfullname: clientFullName,
            clientemail: clientEmail,
            langcode: langCode,
            hotelrefno: hotelRefNo
        }
    }).catch(()=> {
        return false
    })
}

module.exports = {
    sendGuestChangeNotifyMail,
    sendCheckInNotificationForHotelAndClient
}