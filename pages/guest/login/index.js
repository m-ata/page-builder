import React from 'react'
import GuestLogin from 'components/guest/login/GuestLogin'
import { ViewList } from '@webcms/orest'
import * as global from '@webcms-globals'
import { OREST_ENDPOINT, useOrestQuery } from 'model/orest/constants'

const Index = (props) => {
    const { fileData } = props
    return <GuestLogin redirectUrl="/guest?menu=home" logoBanner={fileData} />
}

export const getServerSideProps = async (ctx) => {

    const { req, res, query } = ctx
    if(res && res.GENERAL_SETTINGS){
        let newQuery = {}
        newQuery.code = global.guestWeb.strLogoBanner
        newQuery.langcode = query?.lang || req?.currentLanguage || global.common.strDefShortLangCode
        newQuery.isactive = global.base.isTrue
        newQuery.isorsactive = global.base.isTrue

        return await ViewList({
            apiUrl: res.GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            headers: {
                ReqType: 'Company',
                'Content-Type': 'application/json',
            },
            token: res.OREST_CACHE_TOKEN,
            params: {
                query: useOrestQuery(newQuery),
                sort: 'hotelrefno-',
                limit: global.base.intOne,
                allhotels: global.base.isTrue
            },
        }).then((res) => {
            if (res.status === 200 && res.data.count > 0) {
                const data = res.data.data[0]
                return {
                    props: { fileData: data.filedata }
                }
            } else {
                return {
                    props: { fileData: null }
                }
            }
        })
    }else{
        return {
            props: { fileData: null }
        }
    }
}

export default Index
