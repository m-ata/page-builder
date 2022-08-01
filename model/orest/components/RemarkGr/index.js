import axios from "axios";
import {
    OREST_REMARKGR_PARAM,
    OREST_DELETE,
    OREST_PATCH
} from "../../constants";

export function RemarkGrPatch(orestUrl,token, hotelRefNo, body) {

    const url = orestUrl + OREST_REMARKGR_PARAM + OREST_PATCH + '/' + body.gid;

    let data = {
        "code": body.code,
        "description": body.description,
        "isactive": body.active,
        "multiselect": body.multi,
        "hotelrefno": Number(hotelRefNo)
    };

    const options = {
        url: url,
        method: 'patch',
        headers: {
            "Authorization": `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: data,
    };

    return axios(options).then(response => {
        return response
    }).catch(error => {
        return error.response || {status: 0};
    })

}

export function RemarkGrDelete(orestUrl,token, hotelRefNo, gid) {
    const url = orestUrl + OREST_REMARKGR_PARAM + OREST_DELETE;

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
