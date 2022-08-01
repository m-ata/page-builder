import axios from "axios";
import {
    OREST_DELETE,
    OREST_PATCH,
    OREST_ROOM_CHK_PARAM,
    OREST_ROOMTYPE_PARAM
} from "../../constants";

export function RoomTypePatch(orestUrl, token, hotelRefNo, gid, body) {
    const url = orestUrl + OREST_ROOMTYPE_PARAM + OREST_PATCH + '/' + gid;

    const params = {
        hotelrefno: Number(hotelRefNo),
    };

    let data = {};

    if (body.code) {
        data.code = String(body.code)
    }
    if (body.description) {
        data.description = String(body.description)
    }

    if (body.longDescription) {
        data.shorttext = String(body.longDescription)
    }

    if (body.totalRoom) {
        data.totalroom = Number(body.totalRoom)
    }
    if (body.isGotBed !== undefined) {
        data.isroom = Boolean(body.isGotBed)
    }

    const options = {
        url: url,
        method: 'patch',
        headers: {
            "Authorization": `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        params,
        data
    };

    return axios(options).then(response => {
        return response
    }).catch(error => {
        return error.response || {status: 0};
    })
}

export function RoomTypeDelete(orestUrl, token, hotelRefNo, gid) {
    const url = orestUrl + OREST_ROOMTYPE_PARAM + OREST_DELETE;

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

export function RoomTypeRoomChk(orestUrl, token, params) {
    const url = orestUrl + OREST_ROOMTYPE_PARAM + OREST_ROOM_CHK_PARAM;

    const options = {
        url: url,
        method: 'post',
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
