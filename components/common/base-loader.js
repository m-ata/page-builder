import React, { useContext, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { UseOrest } from '@webcms/orest'
import { REQUEST_METHOD_CONST } from 'model/orest/constants'
import { useOrestAction } from 'model/orest'
import { useSnackbar } from 'notistack'
import WebCmsGlobal from 'components/webcms-global'
import useTranslation from 'lib/translations/hooks/useTranslation'

export default function BaseLoader(props) {
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
    const { t } = useTranslation()
    const { setOrestState, deleteOrestCurrentUserInfo } = useOrestAction()
    const { enqueueSnackbar } = useSnackbar()

    const checkClientToken = async () => {
        return await UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'auth/checktoken',
            token: token,
            method: REQUEST_METHOD_CONST.POST,
            params: {
                token: token,
                hotelrefno: '',
            },
        }).then((checkTokenResponse) => {
            if (checkTokenResponse?.data?.active) {
                return true
            }else{
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'info' })
                deleteOrestCurrentUserInfo()
                return false
            }
        }).catch(() => {
            enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'info' })
            deleteOrestCurrentUserInfo()
            return false
        })
    }

    const getHotelWorkDateTime = async (hotelrefno) => {
        return await UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'info/portal',
            token: token,
            params: {
                hotelrefno: hotelrefno,
            },
        }).then((infoPortalResponse) => {
            if (infoPortalResponse?.data?.data) {
                setOrestState(['hotelWorkDateTime'], infoPortalResponse.data.data)
                return true
            }else{
                setOrestState(['hotelWorkDateTime'], false)
                return false
            }
        }).catch(() => {
            setOrestState(['hotelWorkDateTime'], false)
            return false
        })
    }

    useEffect(() => {
        let active = true

        if(active && token) {
            const isTokenValid = checkClientToken()
            if(isTokenValid){
                getHotelWorkDateTime()
            }
        }

        return () => {
            active = false
        }

    }, [])

    return (
        <React.Fragment>
            {props.children}
        </React.Fragment>
    )
}
