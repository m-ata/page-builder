import React, { useContext, useEffect, useState } from 'react'
import { connect, useSelector } from 'react-redux'
import { setToState } from 'state/actions'
import {
    Box,
    Button,
    Container,
    Grid,
    Paper,
    Divider,
    Typography,
    Tooltip
} from '@material-ui/core'
import moment from 'moment'
import { makeStyles } from '@material-ui/core/styles'
import { useSnackbar } from 'notistack'
import BookingStepper from 'components/booking/components/BookingStepper'
import BookingLayout from 'components/layout/containers/booking-layout'
import useTranslation from 'lib/translations/hooks/useTranslation'
import WebCmsGlobal from 'components/webcms-global'
import { useRouter } from 'next/router'
import axios from 'axios'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import RoomSummary from 'components/booking/components/RoomSummary'
import getSymbolFromCurrency from 'model/currency-symbol'
import * as global from '@webcms-globals'
import ThreeDPayDialog from 'components/payment/ThreeDPayDialog'
import PaymentForm from 'components/payment/credit-card/form'
import FrameCheckbox from '@webcms-ui/core/frame-checkbox'
import ProgressButton from 'components/booking/components/ProgressButton'
import TagManager from '@webcms-globals/tag-manager'
import { defaultLocale } from 'lib/translations/config'
import { Alert, AlertTitle } from '@material-ui/lab'
import CircularProgress from '@material-ui/core/CircularProgress'
import RefreshIcon from '@material-ui/icons/Refresh'
import { bookingSteps, bookingStepCodes } from 'components/booking/commons'
import InstallmentRates from '../../components/payment/InstallmentRates'
import { LocaleContext } from 'lib/translations/context/LocaleContext'

const useStyles = makeStyles((theme) => ({
    '@global': {
        'button:focus': {
            outline: 'none',
        },
    },
    containerBooking: {
        '& > *': {
            opacity: 0.9
        }
    },
    root: {
        marginTop: 16,
        padding: 10,
        width: '100%',
        backgroundColor: '#fff',
        border: '1px solid #dadadd',
        borderRadius: 6,
    },
    stepperRoot: {
        backgroundColor: '#fff',
        border: '1px solid #dadadd',
        borderRadius: 6,
        "@media print": {
            display: 'none'
        }
    },
    bottom: {
        marginBottom: 10
    },
    ccBottomBanner: {
        textAlign: 'center'
    },
    ccBottomBannerImg: {
        width: '50%',
        marginTop: 30
    },
    buttonDisable: {
        color: '#242424'
    },
    listTitle: {
        fontWeight: 'bold'
    },
    topSpaceBox: {
        width: '100%',
        display: 'block',
        marginTop: 60,
    },
    bottomSpaceBox: {
        width: '100%',
        display: 'block',
        marginBottom: '35vh',
        '@media print': {
            display: 'none',
        },
    },
}))

const TRANSACTION_STATUS = {
    USE_PAY_FORM:0,
    SUCCESSFUL:1,
    ERROR:2
}

const SAVE_ERROR_TYPE = {
    SESSION_TIMEOUT: 'payment_transaction_completed_but_not_posted',
    PAYMENT_FAIL: 'payment_fail'
}

const SummaryBox = (props) => {
    const { title, children } = props
    const classes = useStyles()
    return (
        <React.Fragment>
            <Typography variant="h6" gutterBottom>{title}</Typography>
            <Grid container spacing={1} className={classes.bottom}>
                <Grid item xs={12}>
                    <Paper square variant="outlined">
                        <Box p={2}>
                            {children}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </React.Fragment>
    )
}

const settings = {
    containerMaxWidth: 'lg',
    containerSpacing: 3,
    leftColumn: {
        xs: 12,
        sm: 12,
        md: 12,
        lg: 12,
        xl: 12,
    },
    rightColumn: {
        xs: 12,
        sm: 12,
        md: 12,
        lg: 4,
        xl: 4,
    },
}

const PreviewPage = (props) => {
    const classes = useStyles()
        , { GENERAL_SETTINGS, WEBCMS_DATA } = useContext(WebCmsGlobal)
        , {locale} = useContext(LocaleContext)
        , { t } = useTranslation()
        , { state, setToState, hideLayout } = props
        , { enqueueSnackbar } = useSnackbar()
        , [, setUseScrollUp] = useState(false)
        , router = useRouter()
        , [reservationTermsAndConditions, setReservationTermsAndConditions] = useState(false)
        , [hygieneAndTravelPolicies, setHygieneAndTravelPolicies] = useState(false)
        , [privacyAndPersonalDataProtectionPolicies, setPrivacyAndPersonalDataProtectionPolicies] = useState(false)
        , [creditCardInfo, setCreditCardInfo] = useState(false)
        , [creditCardIsValid, setCreditCardIsValid] = useState(false)
        , [errorMsg, setErrorMsg] = useState(false)
        , [isSaveError, setIsSaveError] = useState(false)
        , [isPayFrameLoad, setIsPayFrameLoad] = useState(false)
        , [redirectUrl, setRedirectUrl] = useState(false)
        , [isLoading, setIsLoading] = useState(false)
        , [isReservationConfirm, setIsReservationConfirm] = useState(false)
        , [isPaySaved, setIsPaySaved] = useState(false)
        , [transactionId, setTransactionId] = useState(false)
        , [transactionStatus, setTransactionStatus] = useState(0)
        , [paymentResult, setPaymentResult] = useState({ gid: false, isgroup: false, reservno: false })
        , [isRouting, setIsRouting] = useState(false)
        , loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
        , token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
        , clientBase = useSelector((state) => state?.orest?.state?.client || false)
        , showIbanNo = state.selectedPaymentIbanId ? state.hotelPaymentType.bankiban.filter(item => String(item.id) === String(state.selectedPaymentIbanId)) : null
        , [pageSizes, setPageSizes] = useState({
            width: '100%',
            height: '100%',
            imgHeight: '100%',
        })
        , [isButtonRouting, setIsButtonRouting] = useState(false)
        , [ccNumberFocus, setCcNumberFocus] = useState(false)
        , [selectCcInstId, setSelectCcInstId] = useState(false)
        , [isInstLoading, setIsInstLoading] = useState(false)
        , [isHandleContinue, setiIsHandleContinue] = useState(false)

    useEffect(() => {
        let isEffect = true

        if (!(state.selectedRooms.length > 0) || state.selectedPaymentType === null) {
            setIsRouting(true)
            router.push ({
                pathname: '/booking/rooms',
                query: router.query
            })
        }

        if (isEffect && WEBCMS_DATA?.assets?.meta?.googleTag) {
            TagManager.page.setChange({
                hotelName: WEBCMS_DATA?.assets?.meta?.title,
                hotelId: GENERAL_SETTINGS.HOTELREFNO,
                pageTitle: window.document.title,
                pagePath: location.href,
                pageStep: 'Preview',
                isGuest: clientBase
            })
        }

        if(showIbanNo){
            const getBankIban = state.hotelPaymentType.bankiban.find(item => String(item.id) === String(state.selectedPaymentIbanId))
            if(getBankIban){
                axios({
                    url: 'api/hotel/notif/warnmsg',
                    method: 'post',
                    params: {
                        mid: getBankIban.mid,
                        langcode: locale,
                        clear: true
                    },
                }).then((hotelWarnMsgResponse) => {
                    if (hotelWarnMsgResponse?.data?.success) {
                        setToState('ibe', ['hotelBankIbanWarnMsg'], hotelWarnMsgResponse.data.data.warning)
                    }else {
                        setToState('ibe', ['hotelBankIbanWarnMsg'], false)
                    }
                }).catch(() => {
                    setToState('ibe', ['hotelBankIbanWarnMsg'], false)
                })
            }
        }

        if(state?.selectedPaymentTypeMid){
            axios({
                url: 'api/hotel/notif/warnmsg',
                method: 'post',
                params: {
                    mid: state.selectedPaymentTypeMid,
                    langcode: locale,
                    clear: true
                },
            }).then((hotelWarnMsgResponse) => {
                if (hotelWarnMsgResponse?.data?.success) {
                    setToState('ibe', ['hotelPaymentTypeAlert'], hotelWarnMsgResponse.data.data.warning)
                }else {
                    setToState('ibe', ['hotelPaymentTypeAlert'], false)
                }
            }).catch(() => {
                setToState('ibe', ['hotelPaymentTypeAlert'], false)
            })
        }

        async function saveAllReservation(){
            setIsLoading(true)
            const reservationInfo = await saveReservation()
            setPaymentResult({ gid: reservationInfo.payGid, isgroup: reservationInfo.isGroupReservation, reservno: reservationInfo.reservno })
            setIsLoading(false)
            return true
        }

        if(state?.selectedPaymentType?.isccpay) {
            saveAllReservation().then(() => {
                return true
            })
        }

        setPageSizes({
            width: window.innerWidth,
            height: window.innerHeight,
            imgHeight: window.innerHeight + 104.1
        })

        window.addEventListener('scroll', handleScroll, { passive: true })
        window.addEventListener('resize', () => {
            setPageSizes({
                width: window.innerWidth,
                height: window.innerHeight,
                imgHeight: window.innerHeight + 104.1
            })
        })

        router.events.on('routeChangeStart', () => setIsButtonRouting(true))
        router.events.on('routeChangeComplete', () => setIsButtonRouting(false))

        return () => {
            window.removeEventListener('scroll', handleScroll)
            isEffect = false
        }
    }, [])

    useEffect(() => {
        if (redirectUrl) {
            window.addEventListener('message', paymentSaveListener, true)
        }
    }, [redirectUrl])

    const paymentSaveListener = (event) => {
        window.removeEventListener('message', paymentSaveListener, true)
        const response = event.data.response || false
        if (!isPaySaved) {
            setIsPaySaved(true)
            return axios({
                url: 'api/ors/payment/save',
                method: 'post',
                params: {
                    isfail: !response.success,
                    transactionid: transactionId,
                    orderid: response.orderid,
                    reftype: paymentResult.isgroup ? 'RESMASTER':'RESERVAT',
                    isgroup: paymentResult.isgroup,
                    refno: paymentResult.reservno,
                    reservationGid: paymentResult.gid,
                    reservationUpdate: true,
                    langcode: locale,
                    clientPassword: state.clientPassword
                },
            }).then((responsePaymentSave) => {
                if (responsePaymentSave.data.success) {
                    if(responsePaymentSave.data.processMsg === SAVE_ERROR_TYPE.PAYMENT_FAIL){
                        setTransactionStatus(TRANSACTION_STATUS.ERROR)
                        setErrorMsg(response.errormsg)
                        setIsReservationConfirm(false)
                        setIsLoading(false)
                        setIsPaySaved(false)
                    }else{
                        setIsPaySaved(false)
                        setIsReservationConfirm(false)
                        setTransactionStatus(TRANSACTION_STATUS.SUCCESSFUL)
                        setToState('ibe', ['bookingConfirmReservno'], paymentResult.reservno)
                        setToState('ibe', ['bookingConfirmIsGroup'], paymentResult.isgroup)
                        setToState('ibe', ['bookingConfirmTransId'], response.orderid)
                        handleNext()
                    }
                }else{
                    setTransactionStatus(TRANSACTION_STATUS.ERROR)
                    setIsPaySaved(false)
                    if(responsePaymentSave.data.processMsg === SAVE_ERROR_TYPE.SESSION_TIMEOUT){
                        setIsSaveError(true)
                        setIsReservationConfirm(false)
                        setErrorMsg(t('str_paymentTransactionSuccessButSessionTimeout', {transid: response.orderid || ''}))
                    }else{
                        setErrorMsg(response.errormsg)
                        setIsReservationConfirm(false)
                    }
                }
                setIsLoading(false)
            }).catch(() => {
                setTransactionStatus(TRANSACTION_STATUS.ERROR)
                setErrorMsg(response.errormsg)
                setIsReservationConfirm(false)
                setIsLoading(false)
                setIsPaySaved(false)
            })
        } else {
            setTransactionStatus(TRANSACTION_STATUS.ERROR)
            setErrorMsg(response.errormsg)
            setIsLoading(false)
            setIsPaySaved(false)
            setIsReservationConfirm(false)
        }
    }

    const handleScroll = () => {
        let windowSize = window?.innerWidth || document?.documentElement?.clientWidth || document?.body?.clientWidth || 0;
        if(windowSize <= 959 && window?.pageYOffset > 100){
            setUseScrollUp(true)
        }else{
            setUseScrollUp(false)
        }
    }

    const handleNext = () => {
        router.push ({
            pathname: '/booking/confirm',
            query: router.query
        })
    }

    const handleBack = () => {
        router.push ({
            pathname: '/booking/details',
            query: router.query
        })
        handleScrollTop()
    }

    const handleScrollTop = () => {
        return window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    }

    const reservationInfo = () => {
        let totalPrice = 0, currencySymbol = null, currencyCode = null

        state.selectedRooms.map((item) => {
            if (!Boolean(currencySymbol) || !Boolean(currencyCode)) {
                currencySymbol = getSymbolFromCurrency(item.pricecurr)
                currencyCode = item.pricecurr
            }
            totalPrice = totalPrice + item.totalprice
        })

        if(state.flyTransferInfo){
            totalPrice = totalPrice + state.flyTransferInfo.priceInfo.res
        }

        if(state.flyTransferReturnInfo){
            totalPrice = totalPrice + state.flyTransferReturnInfo.priceInfo.res
        }

        return {
            totalPrice: totalPrice,
            currencyCode: currencyCode,
            currencySymbol: currencySymbol,
        }
    }


    const getPaymentType = (selectedPaymentType) => {
        let paymentType = false
        if(selectedPaymentType.isccpay){
            paymentType = 'isccpay'
        }else if(selectedPaymentType.iscash){
            paymentType = 'iscash'
        }else if(selectedPaymentType.istransfer){
            paymentType = 'istransfer'
        }else if(selectedPaymentType.ismailorder){
            paymentType = 'ismailorder'
        }

        return paymentType
    }

    const saveReservation = () => {
        let ccInfo = false
        if(state.selectedPaymentType.ismailorder){
            const cCardInfo = state.mailOrderInfo
            ccInfo = {
                cardOwner: cCardInfo.cardOwner,
                cardNumber: cCardInfo.cardNumber.replace(/\\s/g, '').replace(/ /g, ''),
                cardExpiry: cCardInfo.cardExpiry,
                cardCvc: cCardInfo.cardCvc
            }

        }

        if(WEBCMS_DATA?.assets?.meta?.googleTag){
            TagManager.booking.setCheckoutRoom({
                eventLabel: 'Preview',
                hotelName: WEBCMS_DATA?.assets?.meta?.title,
                hotelId: GENERAL_SETTINGS.HOTELREFNO,
                payOption: t(state.selectedPaymentType.description, false, defaultLocale),
                checkoutData: state.selectedRooms,
            })
        }

        let flyTransferInfo = false, flyTransferReturnInfo = false
        if(state.flyTransferInfo){
            flyTransferInfo = state.flyTransferInfo
        }

        if(state.flyTransferReturn){
            flyTransferReturnInfo = state.flyTransferReturnInfo
        }

        return axios({
            url: `api/hotel/book/info/confirm`,
            method: 'post',
            data: {
                clienttoken: token,
                uitoken: state.hotelUiToken,
                langcode: locale,
                contactInfo: state.contactInfo,
                selectedRooms: state.selectedRooms,
                selectedProducts: state.selectedProducts,
                creditCardInfo: state.creditCardInfo,
                clientPassword: state.clientPassword,
                clientID: router.query.clientid || clientBase && clientBase.id || loginfo && loginfo.refid || false,
                paymentType: getPaymentType(state.selectedPaymentType),
                isCcPay: getPaymentType(state.selectedPaymentType) === 'isccpay',
                isMailOrder: getPaymentType(state.selectedPaymentType) === 'ismailorder',
                ccInfo: ccInfo,
                continueWithoutClientRecord: state.continueWithoutClientRecord,
                flyTransfer: flyTransferInfo,
                flyTransferReturn: flyTransferReturnInfo
            },
        }).then((response) => {
            if (response.data.success) {
                if(!state.selectedPaymentType.isccpay){
                    setIsReservationConfirm(false)
                    setiIsHandleContinue(false)
                    setToState('ibe', ['bookingConfirmReservno'], response.data.reservno)
                    setToState('ibe', ['bookingConfirmIsGroup'], response.data.isGroupReservation)
                    handleNext()
                }
                return response.data
            } else {
                setiIsHandleContinue(false)
                return false
            }
        }).catch(() => {
            setiIsHandleContinue(false)
            return false
        })
    }

    const handleSaveReservation = async () => {
        setiIsHandleContinue(true)
        if(!reservationTermsAndConditions){
            enqueueSnackbar(t('str_pleaseCheckMandatoryFields'), { variant: 'warning' })
            setiIsHandleContinue(false)
        }else if(!hygieneAndTravelPolicies){
            enqueueSnackbar(t('str_pleaseCheckMandatoryFields'), { variant: 'warning' })
            setiIsHandleContinue(false)
        }else if(!privacyAndPersonalDataProtectionPolicies){
            enqueueSnackbar(t('str_pleaseCheckMandatoryFields'), { variant: 'warning' })
            setiIsHandleContinue(false)
        }else {
            if (state.selectedPaymentType.isccpay) {
                if (creditCardIsValid.isError || !creditCardIsValid.isValid) {
                    enqueueSnackbar(t('str_pleaseCheckYourCardInformation'), { variant: 'warning' })
                } else {
                    let payGid
                    if(!paymentResult.gid) {
                        payGid = reservationInfo.payGid
                    }else{
                        payGid = paymentResult.gid
                    }

                    setIsLoading(true)
                    let postData = {}
                    postData.cardOwner = creditCardInfo.cardOwner
                    postData.cardNumber = creditCardInfo.cardNumber.replace(/\\s/g, '').replace(/ /g, '')
                    postData.cardExpiry = creditCardInfo.cardExpiry
                    postData.cardCvc = creditCardInfo.cardCvc
                    postData.ccInstId = selectCcInstId

                    return axios({
                        url: 'api/ors/payment/do',
                        method: 'post',
                        params: {
                            gid: payGid,
                        },
                        data: postData,
                    }).then((response) => {
                        if (response.data.success) {
                            setIsLoading(false)
                            setTransactionId(response.data.transactionid)
                            setRedirectUrl(response.data.redirecturl)
                            return true
                        } else {
                            setTransactionStatus(TRANSACTION_STATUS.ERROR)
                            setErrorMsg(t('str_checkCCorPayInfoError'))
                            setIsLoading(false)
                            setIsReservationConfirm(false)
                            setiIsHandleContinue(false)
                            return false
                        }
                    }).catch(() => {
                        setTransactionStatus(TRANSACTION_STATUS.ERROR)
                        setErrorMsg(t('str_checkCCorPayInfoError'))
                        setIsLoading(false)
                        setIsReservationConfirm(false)
                        setiIsHandleContinue(false)
                        return false
                    })
                }
            } else {
                return saveReservation()
            }
        }
    }

    const handlePayTryAgain = () => {
        setIsLoading(true)
        setTimeout(()=> {
            setIsLoading(false)
            setErrorMsg(false)
            setRedirectUrl(false)
            setIsPayFrameLoad(false)
            setCreditCardInfo(false)
            setCreditCardIsValid(false)
            setCcNumberFocus(false)
            setSelectCcInstId(false)
            setTransactionStatus(0)
        }, 1500)
    }

    if (isRouting) {
        return (
            <BookingLayout hideLayout={hideLayout}>
                <div className={classes.topSpaceBox} />
                <Container maxWidth={settings.containerMaxWidth} className={classes.containerBooking}>
                    <Grid container spacing={settings.containerSpacing}>
                        <Grid item xs={12}>
                            <div style={{width: '100%', height: '80vh', textAlign: 'center', paddingTop: '25%'}}>
                                <span style={{background: '#d5d5d5', padding: 40, width: '100%', display: 'block', fontSize: 15}}>
                                    {t('str_pleaseWait')}
                                </span>
                            </div>
                        </Grid>
                    </Grid>
                </Container>
            </BookingLayout>
        )
    }

    return (
        <BookingLayout hideLayout={hideLayout}>
            {WEBCMS_DATA?.assets?.images?.background ? (
                <div style={{ width: pageSizes.width, height: pageSizes.height, top:0, left: 0, overflow: 'hidden', position: 'fixed', zIndex: -3 }}>
                    <ul style={{padding: 0}}>
                        <li style={{display: 'list-item'}}>
                            <img src={GENERAL_SETTINGS.STATIC_URL + WEBCMS_DATA.assets.images.background} style={{width: pageSizes.width, height: pageSizes.imgHeight,}} />
                        </li>
                    </ul>
                </div>
            ): null}
            <div className={classes.topSpaceBox} />
            <Container maxWidth={settings.containerMaxWidth} className={classes.containerBooking}>
                <Grid container spacing={settings.containerSpacing}>
                    <Grid item xs={settings.leftColumn.xs} sm={settings.leftColumn.sm} md={settings.leftColumn.md} lg={settings.leftColumn.lg} xl={settings.leftColumn.xl}>
                        <Grid container spacing={0}>
                            <Grid item xs={12}>
                                <BookingStepper classes={{ root: classes.stepperRoot }} activeStep={bookingStepCodes.preview} steps={bookingSteps}/>
                                <Grid container spacing={0} style={{paddingTop: 10}}>
                                    <React.Fragment>
                                        <Paper variant="outlined" square className={classes.root}>
                                            <Box p={3}>
                                                <Grid container spacing={3}>
                                                    <Grid item sm={12} md={8}>
                                                        <Typography variant="h6" gutterBottom>
                                                            {t('str_roomDetails')}
                                                        </Typography>
                                                        <Grid container spacing={1}>
                                                            {state.selectedRooms && state.selectedRooms.length > 0 && state.selectedRooms.map((item, i) => (
                                                                <Grid item xs={12} key={i}>
                                                                    <RoomSummary
                                                                        roomName={item.roomtypename}
                                                                        checkin={item.checkin}
                                                                        checkout={item.checkout}
                                                                        pax={item.totalpax}
                                                                        child={item.totalchd}
                                                                        night={item.totalnight}
                                                                        price={item.totalprice}
                                                                        pricecurr={item.pricecurr}
                                                                        gid={item.gid}
                                                                        thumbnail={item.thumbnail}
                                                                        guestList={item.guestList}
                                                                    />
                                                                </Grid>
                                                            ))}
                                                        </Grid>
                                                    </Grid>
                                                    <Grid item xs={12} md={4}>
                                                        <SummaryBox title={t('str_paymentMethod')}>
                                                            {state?.selectedPaymentType?.description && t(state.selectedPaymentType.description) || ''}
                                                            {showIbanNo ? (
                                                                <Grid container spacing={1} style={{marginTop: 10}}>
                                                                    <Grid item xs={4}>
                                                                        <Typography variant='subtitle2' gutterBottom className={classes.listTitle}>
                                                                            {t('str_bankName')}
                                                                        </Typography>
                                                                        <Typography variant='body2' gutterBottom>
                                                                            {showIbanNo && showIbanNo[0].bankname}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <Typography variant='subtitle2' gutterBottom className={classes.listTitle}>
                                                                            {t('str_bankBranch')}
                                                                        </Typography>
                                                                        <Typography variant='body2' gutterBottom>
                                                                            {showIbanNo && showIbanNo[0].bankbranch}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <Typography variant='subtitle2' gutterBottom className={classes.listTitle}>
                                                                            {t('str_bankCurrency')}
                                                                        </Typography>
                                                                        <Typography variant='body2' gutterBottom>
                                                                            {showIbanNo && showIbanNo[0].currencycode}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item xs={12}>
                                                                        <Typography variant='subtitle2' gutterBottom className={classes.listTitle}>
                                                                            {t('str_bankIban')}
                                                                        </Typography>
                                                                        <Typography variant='body2' gutterBottom>
                                                                            {showIbanNo && showIbanNo[0].iban}
                                                                        </Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            ): null}
                                                            {state?.hotelPaymentTypeAlert ? (
                                                                <React.Fragment>
                                                                    <Divider style={{ marginTop: 20, marginBottom: 20 }} />
                                                                    <div dangerouslySetInnerHTML={{ __html: state.hotelPaymentTypeAlert }} />
                                                                </React.Fragment>
                                                            ) : null}
                                                        </SummaryBox>
                                                        {state.hotelBankIbanWarnMsg ?
                                                            <Alert severity="info" variant="outlined" style={{ padding: 5, paddingRight: 15, background: '#ffffff', textAlign: 'justify' }}>
                                                                {state.hotelBankIbanWarnMsg}
                                                            </Alert> : null
                                                        }
                                                    </Grid>
                                                    {(state.flyTransferInfo || state.flyTransferReturnInfo) ? (
                                                        <React.Fragment>
                                                            <Grid item sm={12} md={8}>
                                                                <SummaryBox title={t('str_transfer')}>
                                                                    <Grid container spacing={1} style={{marginTop: 10, paddingBottom: 10}} justify="space-between">
                                                                        {state.flyTransferInfo ? (
                                                                            <Grid item xs={12} sm={5} style={{position: 'relative'}}>
                                                                                <Typography variant='subtitle2' gutterBottom className={classes.listTitle}>
                                                                                    {t('str_arrivalTransfer')}
                                                                                </Typography>
                                                                                <Typography variant='body2' gutterBottom>
                                                                                    {moment(state.flyTransferInfo.flydate, 'YYYY-MM-DD').format('dd, MMM DD, YYYY')} - {moment(state.flyTransferInfo.flytime, "HH:mm:ss").format("HH:mm")}
                                                                                </Typography>
                                                                                <span style={{position: 'absolute', top: 0, right: 10}}>
                                                                                    {state?.flyTransferInfo?.priceInfo?.pricecurr && getSymbolFromCurrency(state.flyTransferInfo.priceInfo.pricecurr)} {state?.flyTransferInfo?.priceInfo?.res && global.helper.formatPrice(state.flyTransferInfo.priceInfo.res)}
                                                                                </span>
                                                                            </Grid>
                                                                        ): null}
                                                                        {state.flyTransferReturnInfo ? (
                                                                            <React.Fragment>
                                                                                <Divider orientation="vertical" flexItem />
                                                                                <Grid item xs={12} sm={5} style={{position: 'relative'}}>
                                                                                    <Typography variant='subtitle2' gutterBottom className={classes.listTitle}>
                                                                                        {t('str_departureTransfer')}
                                                                                    </Typography>
                                                                                    <Typography variant='body2' gutterBottom>
                                                                                        {moment(state.flyTransferReturnInfo.flydate, 'YYYY-MM-DD').format('dd, MMM DD, YYYY')} - {moment(state.flyTransferReturnInfo.flytime, "HH:mm:ss").format("HH:mm")}
                                                                                    </Typography>
                                                                                    <span style={{position: 'absolute', top: 0, right: 10}}>
                                                                                        {state?.flyTransferReturnInfo?.priceInfo?.pricecurr && getSymbolFromCurrency(state.flyTransferReturnInfo.priceInfo.pricecurr)} {state?.flyTransferReturnInfo?.priceInfo?.res && global.helper.formatPrice(state.flyTransferReturnInfo.priceInfo.res)}
                                                                                    </span>
                                                                                </Grid>
                                                                            </React.Fragment>
                                                                        ): null}
                                                                    </Grid>
                                                                </SummaryBox>
                                                            </Grid>
                                                        </React.Fragment>
                                                    ): null}
                                                    {state?.selectedPaymentType?.isccpay ? (
                                                        <Grid item sm={12} md={8}>
                                                            <Typography variant="h6" gutterBottom>
                                                                {t('str_creditCardPayment')}
                                                            </Typography>
                                                            <Paper variant="outlined" square>
                                                                <Box p={3}>
                                                                    { transactionStatus === TRANSACTION_STATUS.USE_PAY_FORM && redirectUrl ? (
                                                                        <React.Fragment>
                                                                            <ThreeDPayDialog open={transactionStatus === TRANSACTION_STATUS.USE_PAY_FORM && redirectUrl} iframeUrl={redirectUrl} isPayFrameLoad={isPayFrameLoad} setIsPayFrameLoad={(e)=> setIsPayFrameLoad(e)} isPaySave={isPaySaved} />
                                                                        </React.Fragment>
                                                                    ) : transactionStatus === TRANSACTION_STATUS.ERROR  ? (
                                                                        <React.Fragment>
                                                                            {isSaveError ? (
                                                                                <React.Fragment>
                                                                                    <Alert severity="error" style={{marginBottom: 20}}>
                                                                                        <AlertTitle>{t('str_error')}</AlertTitle>
                                                                                        {errorMsg}
                                                                                    </Alert>
                                                                                </React.Fragment>
                                                                            ):(
                                                                                <React.Fragment>
                                                                                    <Alert severity="error" style={{marginBottom: 20}}>
                                                                                        <AlertTitle>{t('str_error')}</AlertTitle>
                                                                                        {t('str_paymentTransactionError')}<br/>
                                                                                        <strong>{t('str_detail')}:</strong> {errorMsg || ''}
                                                                                    </Alert>
                                                                                    <Button variant="outlined" color="primary" startIcon={<RefreshIcon />} onClick={()=> handlePayTryAgain()}>{t('str_tryAgain')}</Button>
                                                                                </React.Fragment>
                                                                            )}
                                                                        </React.Fragment>
                                                                    ) : null }
                                                                    {transactionStatus !== TRANSACTION_STATUS.ERROR ? (
                                                                        <React.Fragment>
                                                                            <PaymentForm
                                                                                showCard={true}
                                                                                onChange={(e) => setCreditCardInfo(e)}
                                                                                isValid={(e) => setCreditCardIsValid(e)}
                                                                                isDisabled={isButtonRouting || isLoading || isReservationConfirm}
                                                                                setCcNumberFocus={(e)=> setCcNumberFocus(e)}
                                                                            />
                                                                            <div className={classes.ccBottomBanner}>
                                                                                <img className={classes.ccBottomBannerImg} src={'imgs/epay-std-banner.png'}/>
                                                                            </div>
                                                                            <InstallmentRates
                                                                                ccNumber={creditCardIsValid?.number || ''}
                                                                                payGid={paymentResult.gid}
                                                                                setIsLoading={(val)=> setIsInstLoading(val)}
                                                                                isLoading={isInstLoading}
                                                                                selectCcInstId={selectCcInstId}
                                                                                setSelectCcInstId={setSelectCcInstId}
                                                                                ccNumberFocus={ccNumberFocus}
                                                                            />
                                                                        </React.Fragment>
                                                                    ): null}
                                                                </Box>
                                                            </Paper>
                                                        </Grid>
                                                    ): null}
                                                    <Grid item xs={12}>
                                                        <Divider variant="middle" />
                                                        <Box p={2}>
                                                            <Typography variant="h6" align="right" gutterBottom>
                                                                {t('str_total')}: {global.helper.formatPrice(reservationInfo().totalPrice)} {reservationInfo().currencySymbol}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </Paper>
                                        <Paper variant="outlined" square className={classes.root}>
                                            <Box p={3}>
                                                <Grid container>
                                                    <Grid item xs={12}>
                                                        <FrameCheckbox
                                                            disabled={isButtonRouting || isLoading}
                                                            fontSize="14px"
                                                            value={reservationTermsAndConditions}
                                                            required={true}
                                                            title="str_reservationTermsAndConditions"
                                                            linkText="str_iAcceptReservationTermsAndConditions"
                                                            linkTextADesc="str_reservationTermsAndConditions"
                                                            ifamePageUrl={GENERAL_SETTINGS.BASE_URL + `info/${locale || global.common.strDefShortLangCode}/${global.guestWeb.strBookingPolicy}?iframe=true`}
                                                            isCheck={(e) => setReservationTermsAndConditions(e)}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <FrameCheckbox
                                                            disabled={isButtonRouting || isLoading}
                                                            fontSize="14px"
                                                            value={privacyAndPersonalDataProtectionPolicies}
                                                            required={true}
                                                            title="str_privacyAndPersonalDataProtectionPolicies"
                                                            linkText="str_iAcceptDataPolicy"
                                                            linkTextADesc="str_privacyAndPersonalDataProtectionPolicies"
                                                            ifamePageUrl={GENERAL_SETTINGS.BASE_URL + `info/${locale || global.common.strDefShortLangCode}/${global.guestWeb.strDataPolicy}?iframe=true`}
                                                            isCheck={(e) => setPrivacyAndPersonalDataProtectionPolicies(e)}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <FrameCheckbox
                                                            disabled={isButtonRouting || isLoading}
                                                            fontSize="14px"
                                                            value={hygieneAndTravelPolicies}
                                                            required={true}
                                                            title="str_hygieneAndTravelPolicies"
                                                            linkText="str_iAcceptTravelPolicy"
                                                            linkTextADesc="str_hygieneAndTravelPolicies"
                                                            ifamePageUrl={GENERAL_SETTINGS.BASE_URL + `info/${locale || global.common.strDefShortLangCode}/${global.guestWeb.strTravelPolicy}?iframe=true`}
                                                            isCheck={(e) => setHygieneAndTravelPolicies(e)}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </Paper>
                                        <Paper variant="outlined" square className={classes.root}>
                                            <Box p={3}>
                                                <Grid container direction="row" justify="space-between" alignItems="center" spacing={3}>
                                                    <Grid item>
                                                        <Button
                                                            disabled={isHandleContinue || isInstLoading || isButtonRouting || isLoading || isReservationConfirm || (transactionStatus === TRANSACTION_STATUS.ERROR)}
                                                            variant='outlined'
                                                            color='secondary'
                                                            size='large'
                                                            disableElevation
                                                            startIcon={<ArrowBackIcon />}
                                                            onClick={() => handleBack()}
                                                        >
                                                            {t('str_back')}
                                                        </Button>
                                                    </Grid>
                                                    {state?.selectedPaymentType?.isccpay ? (
                                                        (isReservationConfirm && (transactionStatus !== TRANSACTION_STATUS.ERROR) ?
                                                                <Grid item>
                                                                    <Button
                                                                        classes={{ disabled: classes.buttonDisable }}
                                                                        disabled={true}
                                                                        variant='contained'
                                                                        color='primary'
                                                                        size='large'
                                                                        disableElevation
                                                                        startIcon={<CircularProgress size={24} />}
                                                                    >
                                                                        {t('str_bankVerificationIsExpected')}
                                                                    </Button>
                                                                </Grid> :
                                                                <Grid item>
                                                                    <Tooltip title={transactionStatus === TRANSACTION_STATUS.ERROR ? t('str_checkErrorMessageAndTryAgain') : ""} arrow>
                                                                    <span>
                                                                        <Button
                                                                            disabled={isHandleContinue || isInstLoading || isButtonRouting || isLoading || isReservationConfirm || (transactionStatus === TRANSACTION_STATUS.ERROR)}
                                                                            variant='contained'
                                                                            color='primary'
                                                                            size='large'
                                                                            disableElevation
                                                                            onClick={() => handleSaveReservation()}
                                                                        >
                                                                            {t('str_payAndCompleteReservation')}
                                                                        </Button>
                                                                    </span>
                                                                    </Tooltip>
                                                                </Grid>
                                                        )) : (
                                                        <Grid item>
                                                            <ProgressButton isLoading={isHandleContinue || isReservationConfirm}>
                                                                <Button
                                                                    disabled={isHandleContinue || isButtonRouting || isReservationConfirm}
                                                                    variant='contained'
                                                                    color='primary'
                                                                    size='large'
                                                                    disableElevation
                                                                    onClick={() => handleSaveReservation()}
                                                                >
                                                                    {t('str_completeBooking')}
                                                                </Button>
                                                            </ProgressButton>
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            </Box>
                                        </Paper>
                                    </React.Fragment>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Container>
            <div className={classes.bottomSpaceBox} />
        </BookingLayout>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.ibe,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(PreviewPage)