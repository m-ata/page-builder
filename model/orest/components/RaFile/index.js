import axios from "axios";
import {
    OREST_RAFILE_PARAM,
    OREST_DELETE,
    OREST_UPLOAD, REQUEST_METHOD_CONST, isErrorMsg
} from "../../constants";

export function RaFileDelete(orestUrl, token, hotelRefNo, gid) {
    const url = orestUrl + OREST_RAFILE_PARAM + OREST_DELETE;

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

export function RaFileImageUpload(orestUrl, token, masterid, element) {
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

export const PreviewFile = (GENERAL_SETTINGS, token, gid, fileUrl, hotelrefno) => {
    if(fileUrl && (fileUrl.includes('http://') || fileUrl.includes('https://'))) {
        return axios({
            url: GENERAL_SETTINGS.BASE_URL + 'api/get/public/file',
            method: REQUEST_METHOD_CONST.POST,
            params: {
                url: fileUrl,
                responseType: 'blob',
            }
        }).then((r) => {
            if(r.status === 200 && r.data.data) {
                const blob = new Blob([new Uint8Array(r.data.data.data)], {type: r.data.type})
                let url = URL.createObjectURL(blob)
                let fileType = r?.data?.type?.split('/')
                fileType = fileType && fileType[0] || null
                return {success: true, url, fileType}
            }
        })
    } else if(gid) {
        return axios({
            url: `${GENERAL_SETTINGS.OREST_URL}/tools/file/download`,
            headers: {
                "Authorization": `Bearer ${token}`
            },
            method: REQUEST_METHOD_CONST.GET,
            responseType: 'blob',
            params: {
                gid: gid,
                hotelrefno: hotelrefno || GENERAL_SETTINGS.HOTELREFNO
            },
        }).then((r) => {
            const status = r.status
            if (status === 200) {
                let url = URL.createObjectURL(r.data)
                let fileType = r?.data?.type?.split('/')
                fileType = fileType && fileType[0]
                return {success: true, url, fileType}
            } else if(status === 204) {
                return {success: false, errorText: 'str_fileDoesNotExistOrCorrupted', variant: 'error'}
            } else{
                const error = isErrorMsg(r);
                return {success: false, errorText: error.errMsg, variant: 'error'}
            }
        })
    } else {
        return {success: false, errorText: '', variant: 'error'}
    }


}
