import React, { useEffect, useState, useContext } from 'react'
import { connect, useSelector } from 'react-redux'
import { setToState } from 'state/actions'
import axios from 'axios'
import {
    Box,
    Button,
    Container,
    Grid,
    Paper
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useSnackbar } from 'notistack'
import ReservationCart from 'components/booking/components/ReservationCart'
import BookingStepper from 'components/booking/components/BookingStepper'
import BookingLayout from 'components/layout/containers/booking-layout'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { useRouter } from 'next/router'
import TransferReservation from 'components/transfer-reservation'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import WebCmsGlobal from 'components/webcms-global'
import { getBookingSteps, bookingSteps, bookingStepCodes } from 'components/booking/commons'
import TagManager from '../../@webcms-globals/tag-manager'

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
        padding: 15,
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
    infoMsg: {
        background: '#FFFFFF',
    }, topSpaceBox: {
        width: '100%',
        display: 'block',
        marginTop: 60,
    },
    bottomSpaceBox: {
        width: '100%',
        display: 'block',
        marginBottom: '50vh',
        '@media print': {
            display: 'none',
        },
    },
}))

const AddonsPage = (props) => {
    const classes = useStyles()
        , { t } = useTranslation()
        , { state, setToState, hideLayout } = props
        , { GENERAL_SETTINGS, WEBCMS_DATA } = useContext(WebCmsGlobal)
        , showAddons = Boolean(GENERAL_SETTINGS.hotelSettings.product) || Boolean(GENERAL_SETTINGS.hotelSettings.remark) || Boolean(GENERAL_SETTINGS.hotelSettings.transport)
        , isLogin = !!useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth)
        , { enqueueSnackbar } = useSnackbar()
        , [, setUseScrollUp] = useState(false)
        , [isRouting, setIsRouting] = useState(false)
        , [pageSizes, setPageSizes] = useState({
            width: '100%',
            height: '100%',
            imgHeight: '100%',
        })
        , [isButtonRouting, setIsButtonRouting] = useState(false)
        , router = useRouter()

    useEffect(() => {
        if (!(state.selectedRooms.length > 0) || !showAddons) {
            setIsRouting(true)
            router.push ({
                pathname: '/booking/rooms',
                query: router.query
            })
        }

        if (WEBCMS_DATA?.assets?.meta?.googleTag) {
            TagManager.page.setChange({
                hotelName: WEBCMS_DATA?.assets?.meta?.title,
                hotelId: GENERAL_SETTINGS.HOTELREFNO,
                pageTitle: window.document.title,
                pagePath: location.href,
                pageStep: 'Add-ons',
                isGuest: isLogin,
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

    const settings = {
        containerMaxWidth: 'lg',
        containerSpacing: 3,
        leftColumn: {
            xs: 12,
            sm: 12,
            md: 12,
            lg: 8,
            xl: 8,
        },
        rightColumn: {
            xs: 12,
            sm: 12,
            md: 12,
            lg: 4,
            xl: 4,
        },
    }

    const handleNext = () => {
        if (state.selectedRooms && state.selectedRooms.length > 0) {
            let stepContinue = true
            state.selectedRooms.map((item) => {
                if (!(item.totalprice > 0)) {
                    stepContinue = false
                    enqueueSnackbar(t('str_unableToContinueTotalPriceOrRoomPriceShouldNotBeZero'), { variant: 'warning' })
                    return false
                }
            })

            if (stepContinue) {
                router.push ({
                    pathname: '/booking/details',
                    query: router.query
                })
            }

        } else {
            enqueueSnackbar(t('str_pleaseSelectRoom'), { variant: 'warning', autoHideDuration: 3000 })
        }
        handleScrollTop()
    }

    const handleBack = () => {
        router.push ({
            pathname: '/booking/rooms',
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

    const handleTransferReservationSave = async (transferData, isReturn = false) => {
        setToState('ibe', ['bookingIsLoading'], true)
        const airportid = transferData.airportid.list.find(airportid => airportid.id === transferData.airportid.value)
        await axios({
            url: 'api/hotel/flytransfer/pricecalc',
            method: 'post',
            data: {
                airportid: airportid.airportid,
                flydate: transferData.flydate.value,
                vehicleid: transferData.vehicleid.value,
                isreturn: isReturn,
            },
        }).then((hotelFlytransferPriceCalcResponse) => {
            if (hotelFlytransferPriceCalcResponse?.data?.success) {
                if (isReturn) {
                    setToState('ibe', ['flyTransferReturn'], transferData)
                    setToState('ibe', ['flyTransferReturnInfo'], {
                        reservno: null,
                        airportid: airportid.airportid,
                        flydate: transferData.flydate.value,
                        flytime: transferData.flytime.value,
                        airline: transferData.airline.value,
                        flightno: transferData.flightno.value,
                        vehicleid: transferData.vehicleid.value,
                        note: transferData.note.value,
                        isreturn: isReturn,
                        priceInfo: hotelFlytransferPriceCalcResponse.data.data,
                    })
                    setToState('ibe', ['bookingIsLoading'], false)
                } else {
                    setToState('ibe', ['flyTransfer'], transferData)
                    setToState('ibe', ['flyTransferInfo'], {
                        reservno: null,
                        airportid: airportid.airportid,
                        flydate: transferData.flydate.value,
                        flytime: transferData.flytime.value,
                        airline: transferData.airline.value,
                        flightno: transferData.flightno.value,
                        vehicleid: transferData.vehicleid.value,
                        note: transferData.note.value,
                        isreturn: isReturn,
                        priceInfo: hotelFlytransferPriceCalcResponse.data.data,
                    })
                    setToState('ibe', ['bookingIsLoading'], false)
                }
            } else {
                enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'warning' })
                setToState('ibe', ['bookingIsLoading'], false)
            }
        }).catch(() => {
            enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'warning' })
            setToState('ibe', ['bookingIsLoading'], false)
        })
    }

    const handleTransferReservationReset = (isReturn = false) => {
        if(isReturn){
            setToState("ibe", ["flyTransferReturn"], false)
            setToState("ibe", ["flyTransferReturnInfo"], false)
        }else{
            setToState("ibe", ["flyTransfer"], false)
            setToState("ibe", ["flyTransferInfo"], false)
        }
    }

    if (isRouting || !showAddons) {
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
                                <BookingStepper classes={{ root: classes.stepperRoot }} activeStep={bookingStepCodes.addons} steps={getBookingSteps(bookingSteps, showAddons)}/>
                                <Grid container spacing={0} style={{paddingTop: 10}}>
                                    <React.Fragment>
                                        <Paper variant="outlined" square className={classes.root}>
                                            <TransferReservation
                                                disabled={isButtonRouting || state.bookingIsLoading}
                                                flyTransfer={state.flyTransfer}
                                                onCallbackArrivalTransfer={(transferData) => {
                                                    handleTransferReservationSave(transferData)
                                                }}
                                                flyTransferReturn={state.flyTransferReturn}
                                                onCallbackReturnTransfer={(transferData) => {
                                                    handleTransferReservationSave(transferData, true)
                                                }}
                                                onCallbackTransferReservationReset={(isReturn) => handleTransferReservationReset(isReturn)}
                                            />
                                        </Paper>
                                        <Box p={3} className={classes.root}>
                                            <Grid container direction="row" justify="flex-start" alignItems="center" spacing={3}>
                                                <Grid item>
                                                    <Button
                                                        disabled={isButtonRouting || state.isHandleContinue}
                                                        variant='outlined'
                                                        color='secondary'
                                                        size='large'
                                                        disableElevation
                                                        startIcon={<ArrowBackIcon />}
                                                        onClick={() =>  handleBack()}
                                                    >
                                                        {t('str_back')}
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </React.Fragment>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={settings.rightColumn.xs} sm={settings.rightColumn.sm} md={settings.rightColumn.md} lg={settings.rightColumn.lg} xl={settings.rightColumn.xl}>
                        <ReservationCart bookingActiveStep={bookingStepCodes.addons} handleNextStep={() => handleNext()} handleBackStep={() => handleBack()} isDisabled={isButtonRouting}/>
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

export default connect(mapStateToProps, mapDispatchToProps)(AddonsPage)