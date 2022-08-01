import axios from "axios";
import {
    OREST_REMARK_PARAM,
    OREST_DELETE,
    OREST_PATCH,
} from "../../constants";

export function RemarkPatch(orestUrl, token, hotelRefNo, body) {

    const url = orestUrl + OREST_REMARK_PARAM + OREST_PATCH + '/' + body.gid;

    const params = {
        hotelrefno: Number(hotelRefNo),
    };

    let data = {
        "code": body.code,
        "description": body.description,
        "note": body.note,
        "isorsactive": body.active,
        "hasdate": body.hasDate
    };

    const options = {
        url: url,
        method: 'patch',
        headers: {
            "Authorization": `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: data,
        params
    };

    return axios(options).then(response => {
        return response
    }).catch(error => {
        return error.response || {status: 0};
    })

}

export function RemarkItemStatusUpdate(orestUrl, token, hotelRefNo, gid, status) {

    const url = orestUrl + OREST_REMARK_PARAM + OREST_PATCH + '/' + gid;

    const params = {
        hotelrefno: Number(hotelRefNo),
    };

    let data = {};
    data.isorsactive = status;

    const options = {
        url: url,
        method: 'patch',
        headers: {
            "Authorization": `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: data,
        params
    };

    return axios(options).then(response => {
        return response
    }).catch(error => {
        return error.response || {status: 0};
    })

}


export function RemarkItemDelete(orestUrl, token, hotelRefNo, gid) {
    const url = orestUrl + OREST_REMARK_PARAM + OREST_DELETE;

    const params = {
        gid: gid,
        hotelrefno: Number(hotelRefNo),
    };

    const options = {
        url: url,
        method: 'delete',
        headers: {
            "Authorization": `Bearer ${token}`
        },
        params
    };

    return axios(options).then(response => {
        return response
    }).catch(error => {
        return error.response || {status: 0};
    })
}

