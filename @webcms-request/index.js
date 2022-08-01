import axios from 'axios'
import pathList from './pathList.json'
import paramterList from './parameterList.json'
import methodList from './methodList.json'
import reqTypeList from './reqTypeList.json'
import operatorList from './operatorList.json'

let coreRequest = (url, options, data = false) => {
    return new Promise( (resolve, reject) => {
       let request = {
            url: url,
            method: options.method,
            headers: options.headers
        }
        data ? request.data = data : null
        axios(request).then((response) => [createLog(response), resolve(response)]).catch((error) => reject(error))
    })
}

let orestRequest = ({ restUrl, path, method, reqType, token, params, data }) => {
    let orestHeaders = {}

    if (reqType === reqTypeList.company) {
        orestHeaders.ReqType = "Company"
    }

    orestHeaders.Authorization = `Bearer ${token}`

    let requestOptions = {
        method: method,
        headers: orestHeaders,
    }

    let getParams = ""
    if(params && Object.keys(params).length > 0){
        getParams = '?' + Object.keys(params).map(function(k) {
            return k + '=' + params[k]
        }).join('&')
    }

    let requestUrl = restUrl + path + getParams
    return coreRequest(requestUrl, requestOptions, data)
}

let createLog = (reposeData) =>{
    let logData = {
        request: {
            status: reposeData.status || null,
            url: reposeData.config.url || null,
            headers: reposeData.config.headers || null,
            method: reposeData.config.method || null,
            data: reposeData.config.data || null,
        },
        reponse: {
            status: reposeData.request.status || null,
            url: reposeData.request.responseURL || null,
            reposntext: reposeData.request.responseText || null,
            reposnexml: reposeData.request.responseXML || null,
            reposnetype: reposeData.request.responseType || null,
            statustext: reposeData.request.statusText || null,
        },
    }
}

let orestQuery = (queryData) => {
    let query = ""
    Object.entries(queryData).map(([key, value]) => {
        if (value[1][1] === -1) {
            query += `${key}${value[1][0]}${value[0]},`
        } else if (value[1][1] === 0) {
            query += `${key}:${value[0]}${value[1][0]},`
        } else {
            query += `${key}:${value[1][0]}${value[0]}${value[1][0]},`
        }
    })
    return query.slice(0, -1)
}

const getData = (response) =>{
    if (response && response.data && Object(response.data.data).length > 0){
        return response.data.data
    }else if (response && response.data && Object(response.data.data).length === 0){
        return null
    }else{
        return false
    }
}

/*
Request.useOrest({
    restUrl: GENERAL_SETTINGS.OREST_URL,
    path: Request.path.rafileViewList,
    method: Request.method.get,
    reqType: Request.reqType.client,
    token: '81cc649a-4655-416a-b126-d90d425adfc222',
    params: {
        [Request.params.query]: Request.useQuery({
            [Request.params.code]: ['HCMASSET', Request.operator.match],
        }),
    },
}).then((response) =>
    Request.getData(response)
)*/

module.exports = {
    'useOrest': orestRequest,
    'useQuery': orestQuery,
    'getData': getData,
    'operator': operatorList,
    'path': pathList,
    'reqType': reqTypeList,
    'params': paramterList,
    'method': methodList,
}