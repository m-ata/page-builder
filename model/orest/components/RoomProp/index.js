import axios from "axios";
import {OREST_DELETE, OREST_ROOM_PROP_PARAM} from "../../constants";

export function RoomPropDelete(orestUrl, token, hotelRefNo, gid) {
    const url = orestUrl + OREST_ROOM_PROP_PARAM + OREST_DELETE;

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
