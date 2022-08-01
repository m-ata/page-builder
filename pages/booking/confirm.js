import React, { useContext, useEffect, useState } from 'react'
import { connect, useSelector } from 'react-redux'
import { setToState } from 'state/actions'
import {
    Box,
    Button,
    Container,
    Paper,
    Divider,
    Grid,
    Typography
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import BookingStepper from 'components/booking/components/BookingStepper'
import BookingLayout from 'components/layout/containers/booking-layout'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { useRouter } from 'next/router'
import RoomSummary from 'components/booking/components/RoomSummary'
import getSymbolFromCurrency from 'model/currency-symbol'
import * as global from '@webcms-globals'
import SaveIcon from '@material-ui/icons/Save'
import Alert from '@material-ui/lab/Alert'
import moment from 'moment'
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline'
import WebCmsGlobal from 'components/webcms-global'
import TagManager from '@webcms-globals/tag-manager'
import { bookingSteps, bookingStepCodes, getBookingSteps } from 'components/booking/commons'
import { LOCAL_STORAGE_PERSIST_BOOK_INFO } from 'model/orest/constants'
import { LocaleContext } from '../../lib/translations/context/LocaleContext'
import { useOrestAction } from '../../model/orest'

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
        padding: '20px 10px 20px 10px',
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
    buttonRoot: {
        marginTop: 16,
        background: '#F5F5F5'
    },
    thankYouIcon: {
        display: 'block',
        color: '#4CAF50',
        fontSize: 60,
        margin: '0 auto'
    },
    shareButtons: {
        marginTop: 14,
        "@media print": {
            display: 'none'
        }
    },
    noPrint: {
        display: 'inline',
        "@media print": {
            display: 'none'
        }
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
        marginBottom: '20vh',
        '@media print': {
            display: 'none',
        },
    },
}))

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

const ConfirmPage = (props) => {
    const classes = useStyles()
        , { GENERAL_SETTINGS, WEBCMS_DATA } = useContext(WebCmsGlobal)
        ,  { locale } = useContext(LocaleContext)
        , isLogin = !!useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth)
        , { setOrestState } = useOrestAction()
        , clientBase = useSelector((state) => state?.orest?.state?.client || false)
        , { t } = useTranslation()
        , { state, hideLayout } = props
        , [, setUseScrollUp] = useState(false)
        , [isRouting, setIsRouting] = useState(false)
        , router = useRouter()
        , showAddons = Boolean(GENERAL_SETTINGS.hotelSettings.product) || Boolean(GENERAL_SETTINGS.hotelSettings.remark) || Boolean(GENERAL_SETTINGS.hotelSettings.transport)
        , [pageSizes, setPageSizes] = useState({
            width: '100%',
            height: '100%',
            imgHeight: '100%',
        })

    useEffect(() => {
        let isEffect = true

        if(!isLogin && clientBase){
            setOrestState(['client'], null)
        }

        if (!(state.selectedRooms.length > 0)) {
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
                pageStep: 'Confirmation',
            })

            TagManager.booking.setPurchaseRoom({
                eventLabel: 'Purchase',
                hotelName: WEBCMS_DATA?.assets?.meta?.title,
                hotelId: GENERAL_SETTINGS.HOTELREFNO,
                masterReservNo: state.bookingConfirmReservno,
                revenue: global.helper.formatPrice(reservationInfo().totalPrice),
                coupon: state.bookingState.refcode,
                isLogin: isLogin,
                langCode: locale,
                currencyCode: reservationInfo().currencyCode,
                purchaseData: state.selectedRooms,
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

        localStorage.removeItem(LOCAL_STORAGE_PERSIST_BOOK_INFO)

        return () => {
            window.removeEventListener('scroll', handleScroll)
            isEffect = false
        }
    }, [])

    const handleScroll = () => {
        let windowSize = window?.innerWidth || document?.documentElement?.clientWidth || document?.body?.clientWidth || 0;
        if(windowSize <= 959 && window?.pageYOffset > 100){
            setUseScrollUp(true)
        }else{
            setUseScrollUp(false)
        }
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

    const printButton = () => {
        const oldValue = document.title
        document.title = `#${state.bookingConfirmReservno} - ${oldValue}`
        window.print()
        document.title = oldValue
    }

    const showIbanNo = state.selectedPaymentIbanId ? state.hotelPaymentType.bankiban.filter(item => String(item.id) === String(state.selectedPaymentIbanId)) : null

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
                                <BookingStepper classes={{ root: classes.stepperRoot }} activeStep={bookingStepCodes.confirm} steps={getBookingSteps(bookingSteps, showAddons)}/>
                                    <Paper variant="outlined" square className={classes.root}>
                                        <CheckCircleOutlineIcon className={classes.thankYouIcon}/>
                                        <Typography variant="h6" align="center" gutterBottom>
                                            {t('str_thankForRes')}
                                        </Typography>
                                        <Typography variant="body2" align="center" gutterBottom>
                                            {state.bookingConfirmIsGroup ? t('str_groupResNo') : t('str_yourReservationNo')} #{state.bookingConfirmReservno}. <div className={classes.noPrint}> {t('str_mailPrintMsg')}</div>
                                        </Typography>
                                    </Paper>
                                    <Grid container spacing={3} direction="row" justify="flex-end" alignItems="center" className={classes.shareButtons}>
                                        <Grid item>
                                            <Typography variant="body2" align="center" gutterBottom style={{color: '#ffffff', textShadow: '#000 0px 0px 1px, #000 0px 0px 1px, #000 0px 0px 1px, #000 0px 0px 1px, #000 0px 0px 1px, #000 0px 0px 1px'}}>
                                                {t('str_toSaveOrPrintTheDetailsAsPdf')},{` `}
                                                <Button
                                                    size="small"
                                                    onClick={()=> printButton()}
                                                    disableElevation
                                                    variant="contained"
                                                    color="primary"
                                                    className={classes.button}
                                                    startIcon={<SaveIcon />}
                                                >
                                                    {t('str_clickHere')}
                                                </Button>
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    <Paper variant="outlined" square className={classes.root}>
                                        <Box p={2}>
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
                                                        {t(state?.selectedPaymentType?.description || '')}
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
                                                    </SummaryBox>
                                                    {state.hotelBankIbanWarnMsg ?
                                                        <Alert severity="info" variant="outlined" style={{ marginTop: 10, padding: 5, paddingRight: 15, background: '#ffffff', textAlign: 'justify' }}>
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
                                                                            <span style={{position: 'absolute', top: 0, right: 20}}>
                                                                                {getSymbolFromCurrency(state.flyTransferInfo.priceInfo.pricecurr)} {global.helper.formatPrice(state.flyTransferInfo.priceInfo.res)}
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
                                                                                <span style={{position: 'absolute', top: 0, right: 20}}>
                                                                                    {getSymbolFromCurrency(state.flyTransferReturnInfo.priceInfo.pricecurr)} {global.helper.formatPrice(state.flyTransferReturnInfo.priceInfo.res)}
                                                                                </span>
                                                                            </Grid>
                                                                        </React.Fragment>
                                                                    ): null}
                                                                </Grid>
                                                            </SummaryBox>
                                                        </Grid>
                                                    </React.Fragment>
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

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmPage)