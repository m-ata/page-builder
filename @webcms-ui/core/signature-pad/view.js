import React, { useEffect, useState, useContext } from 'react'
import { useSelector } from 'react-redux'
import { ViewList } from '@webcms/orest'
import PropTypes from 'prop-types'
import { OREST_ENDPOINT } from 'model/orest/constants'
import WebCmsGlobal from 'components/webcms-global'
import LoadingSpinner from 'components/LoadingSpinner'
import useTranslation from 'lib/translations/hooks/useTranslation'

const SignatureView = (props) => {

    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { mid } = props
    const token = useSelector((state) =>  state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN)
    const [isLoading, setIsLoading] = useState(false)
    const [trimmedDataURL, setTrimmedDataURL] = useState(null)
    const { t } = useTranslation()

    useEffect(() => {
        setIsLoading(true)
        setTimeout(()=>{
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RAFILE,
                token,
                params: {
                    query: `code::SIGNATURE,masterid::${mid}`,
                    limit: 1,
                    allhotels: true
                },
            }).then((signatureResponse) => {
                if (signatureResponse.status === 200 && signatureResponse.data.count > 0) {
                    setTrimmedDataURL(signatureResponse.data.data[0].url.replace('/var/otello', '').replace('/public', ''))
                } else {
                    setTrimmedDataURL(false)
                }
                setIsLoading(false)
            }).catch(() => {
                setTrimmedDataURL(false)
                setIsLoading(false)
            })

        }, 500);

        return () => {
            setIsLoading(false)
        }
    }, [])

    return (
        <React.Fragment>
            { isLoading ?
                <LoadingSpinner size={30} />
                : mid && trimmedDataURL ?
                    <img style={{width: 70, height: 30}} src={GENERAL_SETTINGS.STATIC_URL + trimmedDataURL} />
                : t('str_noDefaultRecord')
            }
        </React.Fragment>
    )
}

SignatureView.propTypes = {
    mid: PropTypes.number,
}

export default SignatureView
