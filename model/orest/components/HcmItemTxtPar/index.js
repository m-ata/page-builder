import axios from "axios";
import {
    OREST_HCMITEMTXTPAR_PARAM,
    OREST_PATCH
} from "../../constants";

import {isObjectEmpty} from "../../../../model/orest/constants";

export async function HcmItemTxtParDescUpdate(orestUrl,token, hotelRefNo, gid, desc) {

    const url = orestUrl + OREST_HCMITEMTXTPAR_PARAM + OREST_PATCH + '/' + gid;

    const params = {
        hotelrefno: Number(hotelRefNo),
    };

    let data = {};
    data.itemtext = desc;

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

    return await axios(options).then(response => {
        return response
    }).catch(error => {
        return error.response || {status: 0};
    })

}

export async function HcmItemTxtParDescMultiUpdate(orestUrl,token, companyId, descriptionList) {

    let datas = await descriptionList;
    let isError = [];
    for (let item of datas){
        await HcmItemTxtParDescUpdate(orestUrl,token, companyId, item.descGid, item.textValue).then(r => {
            if(r.status !== 200){
                isError.push({"status": false, "descTitle": item.descTitle, "errMsg": r.data.message.substring(0, 90) + '...' || r.data.error});
            }
        })
    }

   if(!isObjectEmpty(isError)){
        return isError[0];
    }else {
        return {"status": true}
    }
}











