import axios from "axios";
import {
    OREST_CMSSLIDERITEM_PARAM,
    OREST_RAFILE_PARAM,
    OREST_UPLOAD,
    OREST_PATCH,
    OREST_DELETE,
    OREST_INSERT
} from "../../constants";

export function CmsSliderItemDelete(orestUrl, token, hotelRefNo, gid) {
    const url = orestUrl + OREST_CMSSLIDERITEM_PARAM + OREST_DELETE;

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

export function CmsSliderItemIns(orestUrl, token, sliderID, hotelRefNo) {

    const url = orestUrl + OREST_CMSSLIDERITEM_PARAM + OREST_INSERT;

    let data = {
        "sliderid": sliderID,
        "hotelrefno": hotelRefNo
    };

    const options = {
        url: url,
        method: 'post',
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

export function CmsSliderItemUpdate(orestUrl, token, hotelRefNo, gid, imageUrl) {

    const url = orestUrl + OREST_CMSSLIDERITEM_PARAM + OREST_PATCH + '/' + gid;

    const params = {
        hotelrefno: Number(hotelRefNo),
    };

    let data = {};
    data.imageurl = imageUrl;

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

export function CmsSliderItemOrderNoUpdate(orestUrl, token, hotelRefNo, gid, orderNo) {

    const url = orestUrl + OREST_CMSSLIDERITEM_PARAM + OREST_PATCH + '/' + gid;

    const params = {
        hotelrefno: Number(hotelRefNo),
    };

    let data = {};
    data.orderno = orderNo;

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

export function FileImageUpload(orestUrl, token, masterid, element) {
    const url = orestUrl + OREST_RAFILE_PARAM + OREST_UPLOAD;

    const params = {
        masterid: masterid,
    };

    let binaryData = [];
    binaryData.push(element);
    let formData = new FormData();
    formData.append('file', new Blob(binaryData, {type: element.type}), element.name);

    const options = {
        url: url,
        method: 'post',
        headers: {
            "Authorization": `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        },
        params: params,
        data: formData
    };

    return axios(options).then(response => {
        return response
    }).catch(error => {
        return error.response || {status: 0};
    })

}

export function CmsSliderItemFullIns(orestUrl, token, sliderID, imageUrl, hotelRefNo) {
    return CmsSliderItemIns(orestUrl, token, sliderID, hotelRefNo).then(r => {
        if (r.status === 200) {
            const masterID = r.data.data.mid;
            const gid = r.data.data.gid;
            return FileImageUpload(orestUrl, token, masterID, imageUrl).then(t => {
                if (t.status === 200) {
                    const fileUrl = t.data.data.checkedUrl;
                    const baseFileUrl = fileUrl.replace("/var/otello", "");
                    return CmsSliderItemUpdate(orestUrl, token, hotelRefNo, gid, baseFileUrl);
                }
            })
        }
    });

}

export function CmsSliderItemOrderSave(orestUrl,token, companyId, imageNewOrder) {
    if (imageNewOrder) {
        let i = 0;
        imageNewOrder.forEach(function (img, index) {
            CmsSliderItemOrderNoUpdate(orestUrl, token, companyId, img.imageGid, img.orderNo).then(res => {
                i++;
                if (i === imageNewOrder.length) {
                    return true;
                }
            });
        });
    } else {
        return true;
    }
}
