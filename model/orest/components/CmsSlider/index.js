import axios from "axios";
import {
    OREST_CMSSLIDER_PARAM,
    OREST_DELETE
} from "../../constants";

export function CmsSliderDelete(orestUrl,token, hotelRefNo, gid) {
    const url = orestUrl + OREST_CMSSLIDER_PARAM + OREST_DELETE;

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
