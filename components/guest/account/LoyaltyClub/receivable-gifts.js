import React, { useContext, useEffect, useState } from 'react'
import { connect, useSelector } from 'react-redux'
import { setToState } from 'state/actions'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import { Insert, UseOrest } from '@webcms/orest'
import { DEFAULT_OREST_TOKEN, isErrorMsg, notZero, OREST_ENDPOINT } from 'model/orest/constants'
import WebCmsGlobal from 'components/webcms-global'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import LoadingSpinner from 'components/LoadingSpinner'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { useSnackbar } from 'notistack'
import ReceivableGiftCard from './ReceivableGiftCard'
import GiftCardDialog from './GiftCardDialog'
import { sendGuestChangeNotifyMail } from '../Base/helper'
import TrackedChangesDialog from '../../../TrackedChangesDialog'
import { LocaleContext } from 'lib/translations/context/LocaleContext'
import utfTransliteration from '@webcms-globals/utf-transliteration'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
    },
    content: {
        flex: '1 0 auto',
    },
    cover: {
        maxWidth: 140,
        width: '100%',
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
}))

const ReceivableGifts = (props) => {
    const classes = useStyles()
        , { state, setToState } = props
        , { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
        , { locale } = useContext(LocaleContext)
        , { t } = useTranslation()
        , { transliteration } = utfTransliteration()
        , { enqueueSnackbar } = useSnackbar()

    //redux
    const token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
        , clientBase = useSelector((state) => state?.orest?.state?.client || false)
        , reservBase = state.clientReservation || false
        , hotelRefNo = state?.changeHotelRefno || state?.clientReservation?.hotelrefno || GENERAL_SETTINGS.HOTELREFNO

    //state
    const [receivableGifts, setReceivableGifts] = useState([])
        , [isLoading, setIsLoading] = useState(false)
        , [isInitialized, setIsInitialized] = useState(false)
        , [sliderID, setSliderID] = useState(false)
        , [limit, setLimit] = useState(4)
        , [openTrackedDialog, setOpenTrackedDialog] = useState(false)

    const getGiftList = (active, useHotelRefNo = false) => {
        setIsLoading(true)
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.BONUSTRANS + '/gift/list',
            token,
            params: {
                langcode: locale,
                hotelrefno: useHotelRefNo || hotelRefNo
            }
        }).then((r) => {
            if (active) {
                if (r.status === 200) {
                    setReceivableGifts(r.data.data)
                    setIsLoading(false)
                    setIsInitialized(true)
                } else {
                    const retErr = isErrorMsg(r)
                    enqueueSnackbar(retErr.errorMsg, { variant: 'warning' })
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
                setReceivableGifts([])
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

    const handleUseGift = (prcode, bonusamount, description, hotelrefno) => {
        const notifyValues = {
            "roomno":reservBase?.roomno || "",
            "clientname": transliteration(clientBase.clientname) || "",
            "giftname": description || ""
        }

        if(Number(clientBase.reshotelrefno) === Number(hotelrefno)){
            if(reservBase?.status !== "I"){
                enqueueSnackbar(t('str_youMustBeInhouseInToTheHotelToChooseAGift'), { variant: 'warning' })
                return
            }

            if (notZero(state.bonusTransPoints.bonusleft) && state.bonusTransPoints.bonusleft >= Number(bonusamount)) {
                setToState('guest', ['isSelectGift'], true)
                Insert({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.BONUSTRANS + '/gift',
                    token: token,
                    params: {
                        accid: clientBase?.id,
                        prcode: prcode,
                        amount: 1,
                        hotelrefno: clientBase.reshotelrefno
                    },
                }).then(async (bonusTransGiftResponse) => {
                    if (bonusTransGiftResponse.status === 200) {
                        await sendGuestChangeNotifyMail('posmain','upd', clientBase.id, clientBase.gid, reservBase.gid, reservBase.reservno, notifyValues, reservBase?.hotelrefno || GENERAL_SETTINGS.HOTELREFNO)
                        enqueueSnackbar(t('str_giftSelectionIsDone'), { variant: 'success' })
                        setToState('guest', ['isSelectGift'], false)
                        setOpenTrackedDialog(false)
                    } else {
                        setOpenTrackedDialog(false)
                        enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error' })
                        setToState('guest', ['isSelectGift'], false)
                    }
                })
            } else {
                setOpenTrackedDialog(false)
                enqueueSnackbar(t('str_sorryYourBalanceIsNotEnoughForTheSelectedGift'), { variant: 'warning' })
            }
        }else{
            setOpenTrackedDialog(false)
            enqueueSnackbar(t('str_youCanOnlyChooseAGiftAtTheHotelYouAreStayingAt'), { variant: 'warning' })
        }
    }

    return (
        <React.Fragment>
            <TrackedChangesDialog
                disabled={state.isSelectGift}
                dialogTitle={t('str_giftChoiceApproval')}
                dialogDesc={t('str_doYouApproveYourChoiceForTheGift', { giftname: openTrackedDialog?.title ? t(openTrackedDialog.title?.removeHtmlTag()) : ''})}
                open={openTrackedDialog}
                onPressNo={(e) => setOpenTrackedDialog(e)}
                onPressYes={() => {
                    const data = openTrackedDialog
                    handleUseGift(data.code, data.amount, data.desc, data.hotelrefno)
                }}
            />
            <Grid container spacing={3}>
                <GiftCardDialog sliderID={sliderID} open={Boolean(sliderID)} onClose={()=> setSliderID(false)} />
                {isInitialized ? (
                    receivableGifts.length > 0 ? (
                        Object(receivableGifts.slice(0, limit)).map((item, i) => (
                            <Grid item xs={12} sm={6} key={i}>
                                <ReceivableGiftCard
                                    code={item.code}
                                    title={item.localtitle || item.title}
                                    requiredBonus={item.bonusamount}
                                    sliderID={item.sliderid}
                                    giftThumbnail={item.url ? GENERAL_SETTINGS.STATIC_URL + item.url : '/imgs/not-found.png'}
                                    onSelect={(code, amount)=> {
                                        if(Number(clientBase.reshotelrefno) === Number(item.hotelrefno)) {
                                            if (reservBase?.status !== "I") {
                                                enqueueSnackbar(t('str_youMustBeInhouseInToTheHotelToChooseAGift'), { variant: 'warning' })
                                                return
                                            }
                                            setOpenTrackedDialog({code: code, amount: amount, desc: item.description, title: (item.localtitle || item.title), hotelrefno: item.hotelrefno})
                                        }else{
                                            enqueueSnackbar(t('str_youCanOnlyChooseAGiftAtTheHotelYouAreStayingAt'), { variant: 'warning' })
                                        }
                                    }}
                                    onDetail={(id) => setSliderID(id)}
                                    disabled={state.isSelectGift}
                                />
                            </Grid>
                        ) )
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
                {receivableGifts && receivableGifts.length > 0 &&  receivableGifts.length > limit && (
                    <Grid item xs={12}>
                        <Box p={3} style={{ textAlign: 'center' }}>
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

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ReceivableGifts)
