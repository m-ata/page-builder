import React, { useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import { UseOrest } from '@webcms/orest'
import { DEFAULT_OREST_TOKEN, isErrorMsg, OREST_ENDPOINT } from 'model/orest/constants'
import WebCmsGlobal from 'components/webcms-global'
import useNotifications from 'model/notification/useNotifications'
import useTranslation from 'lib/translations/hooks/useTranslation'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import LoadingSpinner from 'components/LoadingSpinner'
import Button from '@material-ui/core/Button'
import ReceivedGiftCard from './ReceivedGiftCard'
import { connect } from 'react-redux'
import { LocaleContext } from 'lib/translations/context/LocaleContext'

const ReceivedGifts = (props) => {
    const { state } = props
        , { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
        , { t } = useTranslation()
        , { locale } = useContext(LocaleContext)

    //redux
    const { showError } = useNotifications()
        , token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
        , clientBase = useSelector((state) => state?.orest?.state?.client || false)
        , hotelRefNo = useSelector((state) => state?.orest?.state?.formReducer?.guest?.changeHotelRefno || state?.orest?.state?.formReducer?.guest?.clientReservation?.hotelrefno || GENERAL_SETTINGS.HOTELREFNO)

    //state
    const [receivedGifts, setReceivedGifts] = useState([])
        , [isLoading, setIsLoading] = useState(false)
        , [isInitialized, setIsInitialized] = useState(false)
        , [limit, setLimit] = useState(4)

    const getGiftList = (active, useHotelRefNo = false) => {
        setIsLoading(true)
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.BONUSTRANS + '/gift/sent',
            token,
            params: {
                langcode: locale,
                accid: clientBase.id,
                hotelrefno: useHotelRefNo || hotelRefNo
            }
        }).then((r) => {
            if (active) {
                if (r.status === 200) {
                    setReceivedGifts(r.data.data)
                    setIsLoading(false)
                    setIsInitialized(true)
                } else {
                    const retErr = isErrorMsg(r)
                    showError(retErr.errorMsg)
                    setIsLoading(false)
                    setIsInitialized(true)
                }
            }
        })
    }

    useEffect(() => {
        let active = true
        if (active) {
            if (isLoading) {
                return undefined
            }

            if (clientBase?.id) {
                setIsInitialized(false)
                setReceivedGifts([])
                getGiftList(active, state.changeHotelRefno)
            } else {
                setIsLoading(false)
                setIsInitialized(true)
            }
        }

        return () => {
            active = false
        }
    }, [state.changeHotelRefno])

    return (
        <React.Fragment>
            <Grid container spacing={3}>
                {isInitialized ? (
                    receivedGifts.length > 0 ? (
                        Object(receivedGifts.slice(0, limit)).map((item, i) => (
                            <Grid item xs={12} sm={6} key={i}>
                                <ReceivedGiftCard
                                    isClosed={item.isclosed}
                                    title={item.localtitle || item.title}
                                    bonusUsed={item.pricebonus}
                                    receivedDate={item.transdate}
                                    giftThumbnail={item.url ? GENERAL_SETTINGS.STATIC_URL + item.url : '/imgs/not-found.png'}
                                />
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Box p={3}>
                                <Typography component="h3" align="center">
                                    {t('str_nothingYet')}
                                </Typography>
                            </Box>
                        </Grid>
                    )
                ) : (
                    <Grid item xs={12}>
                        <LoadingSpinner />
                    </Grid>
                )}
                {receivedGifts && receivedGifts.length > 0 &&  receivedGifts.length > limit && (
                    <Grid item xs={12}>
                        <Box p={3} style={{
                            textAlign: 'center'
                        }}>
                            <Button variant="contained" color="primary" disableElevation onClick={()=> setLimit(limit + 3)}>
                                {t('str_showMore')}
                            </Button>
                        </Box>
                    </Grid>
                )}
            </Grid>
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

export default connect(mapStateToProps, null)(ReceivedGifts)
