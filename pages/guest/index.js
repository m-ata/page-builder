import React, { useContext, useEffect } from 'react'
import AccountPage from 'components/guest/account/AccountPage'
import WebCmsGlobal from '../../components/webcms-global'
import DestinationPortal from '../portal'
import { useRouter } from 'next/router'

const GuestPage = () => {
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
        , router = useRouter()

   useEffect(() => {
        if(router.query?.locid || router.query?.step){
            const routerQuery = {...router.query}
            delete routerQuery.locid
            delete routerQuery.step
            router.push({
                pathname: 'guest',
                query: routerQuery
            })
        }
    }, [])

    if (GENERAL_SETTINGS?.ISPORTAL) {
        return <DestinationPortal />
    } else {
        return <AccountPage />
    }
}

export default GuestPage