import axios from "axios";
import {
    OREST_RATAG_PARAM,
    OREST_DELETE, OREST_INSERT, REQUEST_METHOD_CONST, OREST_PATCH
} from "../../constants";
import {SLASH} from "../../../globals";


export function RaTagItemDelete(orestUrl,token, hotelRefNo, gid) {
    const url = orestUrl + OREST_RATAG_PARAM + OREST_DELETE;

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

export function InsertRaTag(orestUrl, token, mid, tagList, hotelRefNo) {

    const stringValue = handleArrayToString(tagList);

    const url = orestUrl + OREST_RATAG_PARAM + OREST_INSERT

    const params = {
        hotelrefno: Number(hotelRefNo),
    };

    const data = {
        hotelrefno: hotelRefNo,
        masterid: mid,
        tagstr: stringValue,
    }

    const options = {
        url: url,
        method: REQUEST_METHOD_CONST.POST,
        headers: {
            "Authorization": `Bearer ${token}`
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

export function PatchRaTag(orestUrl, token, gid, tagList, hotelRefNo) {

   const stringValue = handleArrayToString(tagList);

    const url = orestUrl + OREST_RATAG_PARAM + OREST_PATCH + SLASH + gid

    const params = {
        hotelrefno: Number(hotelRefNo),
    };

    const data = {
        tagstr: stringValue,
    }

    const options = {
        url: url,
        method: REQUEST_METHOD_CONST.PATCH,
        headers: {
            "Authorization": `Bearer ${token}`
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

const handleArrayToString = (array) => {
    let stringValue = '';
    if(array && array.length > 0) {
        array.map((item, ind) => {
            if(ind < array.length - 1) {
                stringValue += `${item.tagstr},`
            } else {
                stringValue += item.tagstr
            }
        })
    }

    return stringValue;
}
