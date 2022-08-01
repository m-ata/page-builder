import axios from "axios";
import {
    OREST_COUNT_SEARCH,
    OREST_DELETE,
    OREST_FULL,
    OREST_PATCH,
    OREST_ROOM_ATTR_PARAM,
    OREST_ROOM_PARAM
} from "../../constants";

export function RoomFullRoomAttr(orestUrl, token, hotelRefNo, gid) {
    const url = orestUrl + OREST_ROOM_PARAM + OREST_FULL + OREST_ROOM_ATTR_PARAM;

    const params = {
        gid: gid,
        hotelrefno: Number(hotelRefNo),
    };

    const options = {
        url: url,
        method: 'get',
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

export function RoomPatch(orestUrl, token, hotelRefNo, gid, body) {
    const url = orestUrl + OREST_ROOM_PARAM + OREST_PATCH + '/' + gid;

    const params = {
        hotelrefno: Number(hotelRefNo),
    };

    let data = {};

    if (body.bedTypeId) {
        data.bedtypeid = Number(body.bedTypeId)
    }
    if (body.extraBed) {
        data.extrabed = Number(body.extraBed)
    }
    if (body.bedPax) {
        data.bedpax = Number(body.bedPax)
    }
    if (body.code) {
        data.code = String(body.code)
    }
    if (body.description) {
        data.description = String(body.description)
    }
    if (body.code) {
        data.roomno = String(body.code)
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

export function RoomDelete(orestUrl, token, hotelRefNo, gid) {
    const url = orestUrl + OREST_ROOM_PARAM + OREST_DELETE;

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

export function RoomCountSearch(orestUrl, token, hotelRefNo, query) {
    const url = orestUrl + OREST_ROOM_PARAM + OREST_COUNT_SEARCH;

    const params = {
        query,
        hotelrefno: Number(hotelRefNo),
    };

    const options = {
        url: url,
        method: 'get',
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
