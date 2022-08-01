import axios from "axios";


export const getSliderImages = (OREST_URL, token, companyId, sliderId) => {
    const requestValue = {
        url: OREST_URL + '/hcmitemimg/view/list',
        method: 'get',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        params: {
            query: `sliderid:${sliderId}`,
            hotelrefno: Number(companyId),
            sort: 'orderno',
        },
    }
    return axios(requestValue).then((response) => {
        if (response?.data?.data) {
            return response.data.data
        } else {
            return null
        }
    }).catch((error) => {
        return null;
    })
}

export const patchListSliderImages = (OREST_URL, token, companyId, data) => {
    const requestValue = {
        url: OREST_URL + '/hcmitemimg/list/patch',
        method: 'patch',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        data: data
    }
    return axios(requestValue).then((response) => {
        if (response?.data?.data) {
            return response.data.data
        } else {
            return null
        }
    }).catch((error) => {
        return null;
    })
}

export const patchListSliderImage = (OREST_URL, token, companyId, data, params, gid) => {
    const requestValue = {
        url: OREST_URL + '/hcmitemimg/patch/' + gid,
        method: 'patch',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        data: data,
        params: params
    }
    return axios(requestValue).then((response) => {
        if (response?.data?.data) {
            return response.data.data
        } else {
            return null
        }
    }).catch((error) => {
        return null;
    })
}