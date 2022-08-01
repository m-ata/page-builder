import axios from 'axios'
import moment from 'moment'
import PhoneInput from '@webcms-ui/core/phone-input'
import React, { useContext, useState, useEffect } from 'react'
import { ViewList } from '@webcms/orest'
import { connect, useSelector } from 'react-redux'
import { setToState, updateState } from 'state/actions'
import { makeStyles } from '@material-ui/core/styles'
import {
    AppBar,
    Button,
    CircularProgress,
    Container,
    Dialog,
    DialogContent,
    Grid,
    IconButton,
    Paper,
    Slide,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    TextField,
    Toolbar,
    Typography,
} from '@material-ui/core'
import { CheckCircleOutline, Close, Print } from '@material-ui/icons'
import MomentAdapter from '@date-io/moment'
import { DatePicker, LocalizationProvider } from '@material-ui/pickers'
import ReservationSummary from 'components/ibe/ReservationSummary'
import ReservationPayment from 'components/ibe/ReservationPayment'
import OtherGuestInfos from 'components/ibe/OtherGuestsInfos'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { CHCK_EMAIL, DEFAULT_OREST_TOKEN, OREST_ENDPOINT } from 'model/orest/constants'
import WebCmsGlobal from 'components/webcms-global'
import useNotifications from 'model/notification/useNotifications'
import FrameCheckbox from '@webcms-ui/core/frame-checkbox'
import * as global from '@webcms-globals'
import { useOrestAction } from 'model/orest'

const useStyles = makeStyles((theme) => ({
    appBar: {
        position: 'relative',
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
    paper: {
        padding: theme.spacing(2),
    },
    listItem: {
        padding: theme.spacing(1, 0),
    },
    total: {
        fontWeight: 700,
    },
    thankYouReservation: {
        textAlign: 'center',
        padding: 25,
    },
    thankYouReservationTitle: {
        marginLeft: 10,
    },
    thankYouReservationDescription: {
        paddingTop: 10,
        paddingBottom: 15,
    },
    confirmButtonWrapper: {
        position: 'relative',
    },
    confirmButtonProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
}))

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />
})

const ReservationConfirm = (props) => {
    const classes = useStyles()
    const { t } = useTranslation()
    const { deleteOrestCurrentUserInfo } = useOrestAction()
    const { showSuccess, showError } = useNotifications()
    const { state, setToState, updateState } = props
    const { GENERAL_SETTINGS, locale } = useContext(WebCmsGlobal)
    const isLogin = useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth) ? true : false
    const objLogInfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
    const token = useSelector((state) =>
        state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN
    )

    useEffect(() => {
        let active = true
        if (active) {
            if (isLogin && objLogInfo.refid) {
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.CLIENT,
                    token,
                    params: {
                        query: 'id:' + objLogInfo.refid,
                    },
                }).then((r) => {
                    if (active) {
                        if (r.status === 200 && r.data.count > 0) {
                            const responseData = r.data.data[0]

                            const setClientInfo = {
                                clientid: objLogInfo.refid,
                                firstName: responseData.firstname,
                                firstNameError: false,
                                lastName: responseData.lastname,
                                lastNameError: false,
                                mail: responseData.email,
                                mailError: false,
                                phone: responseData.mobiletel,
                                birthDate: responseData.birthdate,
                                birthDateError: false,
                                note: '',
                            }

                            updateState('ibe', 'clientsInfo', setClientInfo)
                        } else if (r.status === 401) {
                            deleteOrestCurrentUserInfo()
                        }
                    }
                })
            }
        }

        return () => {
            active = false
        }
    }, [])

    const [isCCPayment, setIsCCPayment] = useState(false)
    const [ccInfo, setCcInfo] = useState(false)
    const [ccInfoData, setCcInfoData] = useState(false)
    const [ccValid, setCcValid] = useState(false)
    const [resNotContinue, setResNotContinue] = useState(false)

    useEffect(() => {

        if (isCCPayment) {
            if (ccValid.isError === false && ccValid.isValid === true) {
                let postData = {}
                postData.cardOwner = ccInfo.cardOwner
                postData.cardNumber = ccInfo.cardNumber
                postData.cardExpiry = ccInfo.cardExpiry
                postData.cardCvc = ccInfo.cardCvc
                setCcInfoData(postData)
                setResNotContinue(false)
            } else {
                setResNotContinue(true)
            }
        } else {
            setResNotContinue(false)
        }

    }, [isCCPayment, ccInfo])

    const getSteps = () => {
        return [t('str_information'), 'Pay and Confirm']
    }

    const [activeStep, setActiveStep] = useState(0)
    const [confirmReservno, setConfirmReservno] = useState(0)
    const [confirmReservationtInitialized, setConfirmReservationtInitialized] = useState(false)
    const [isGroupReservation, setIsGroupReservation] = useState(false)
    const [isRepay, setIsRepay] = useState(false)
    const [repayData, setRepayData] = useState(false)
    const [printEmailTemplate, setPrintEmailTemplate] = useState('')
    const steps = getSteps()

    const handleClickOpen = () => {
        updateState('ibe', 'reservationConfirmDialog', true)
    }

    const handleClose = () => {
        setActiveStep(0)
        updateState('ibe', 'reservationConfirmDialog', false)
    }

    const handleClear = () => {
        setPrintEmailTemplate('')
        setConfirmReservationtInitialized(false)
        setConfirmReservno(0)
        setActiveStep(0)
        setIsGroupReservation(false)
        setToState('ibe', ['listOfSelectedRooms', 'roomList'], [])
        updateState('ibe', 'reservationConfirmDialog', false)
        updateState('ibe', 'acceptReservation', false)
    }

    const handleNext = () => {
        if (activeStep === 0) {
            let continueStep = true
            //client info checks
            let clientsInfo = state.clientsInfo
            if (!clientsInfo.firstName) {
                clientsInfo.firstNameError = true
                continueStep = false
            }

            if (!clientsInfo.lastName) {
                clientsInfo.lastNameError = true
                continueStep = false
            }

            if (!clientsInfo.mail || !CHCK_EMAIL.test(clientsInfo.mail)) {
                clientsInfo.mailError = true
                continueStep = false
            }

            if (clientsInfo.birthDate && clientsInfo.birthDateError === true) {
                clientsInfo.birthDateError = true
                continueStep = false
            }

            updateState('ibe', 'clientsInfo', clientsInfo)

            //other guest2 info checks
            let listOfSelectedRooms = state.listOfSelectedRooms
            state.listOfSelectedRooms.roomList.map((room, roomIndex) => {
                if (roomIndex !== 0 || (roomIndex === 0 && room.totalpax > 1)) {
                    Array.from({ length: room.totalpax }).map((pax, paxIndex) => {
                        if (roomIndex > 0 || (roomIndex === 0 && paxIndex > 0)) {
                            if (!listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].firstName) {
                                listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].firstNameError = true
                                continueStep = false
                            }

                            if (!listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].lastName) {
                                listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].lastNameError = true
                                continueStep = false
                            }

                            if (
                                listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].mail &&
                                !CHCK_EMAIL.test(listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].mail)
                            ) {
                                listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].mailError = true
                                continueStep = false
                            }

                            if (
                                listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].birthDate &&
                                listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].birthDateError === true
                            ) {
                                listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].birthDateError = true
                                continueStep = false
                            }
                        }
                    })
                }
            })
            updateState('ibe', 'listOfSelectedRooms', listOfSelectedRooms)

            if (continueStep) {
                setActiveStep((prevActiveStep) => prevActiveStep + 1)
            } else {
                showError(t('str_guestInfoMissingMsg'))
            }
        } else {
            setActiveStep((prevActiveStep) => prevActiveStep + 1)
        }
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }

    const handleClientInfoChange = (e, stateName) => {
        if (e) {
            let clientsInfo = state.clientsInfo
            const clientsInfoState = e.currentTarget && e.currentTarget.id ? e.currentTarget.id : stateName
            let value = ''
            if (e.currentTarget && e.currentTarget.value) {
                value = e.currentTarget.value
            } else if (stateName === 'birthDate') {
                value = e._d
            } else if (stateName === 'phone') {
                value = e
            }
            clientsInfo[clientsInfoState] = value
            clientsInfo[clientsInfoState + 'Error'] = false
            updateState('ibe', 'clientsInfo', clientsInfo)
        }
    }

    const handleClientInfoBirthDateChange = (e, stateName) => {
        let clientsInfo = state.clientsInfo
        if (e) {
            const clientsInfoState = e.currentTarget && e.currentTarget.id ? e.currentTarget.id : stateName
            let value = ''
            if (stateName === 'birthDate') {
                value = e._d
            }

            if (e._isValid) {
                clientsInfo[clientsInfoState] = value
                clientsInfo[clientsInfoState + 'Error'] = false
            } else {
                clientsInfo[stateName] = value
                clientsInfo[stateName + 'Error'] = true
            }
            updateState('ibe', 'clientsInfo', clientsInfo)
        }
    }

    const handleConfirmReservation = () => {

        if (isCCPayment && resNotContinue) {
            showSuccess('Check your credit card information!')
        } else {
            setConfirmReservationtInitialized(true)
            let confirmData;

            if (!isRepay) {
                confirmData = {
                    clientsInfo: state.clientsInfo,
                    listOfSelectedRooms: state.listOfSelectedRooms,
                    ci: moment(state.selectedDate[0]).format(OREST_ENDPOINT.DATEFORMAT),
                    co: moment(state.selectedDate[1]).format(OREST_ENDPOINT.DATEFORMAT),
                    langid: state.langid,
                    locale: locale,
                    currencyid: state.currencyid,
                    paytypeid: state.paytypeid,
                    agencyid: state.agencyid,
                }
            } else {
                repayData.email = state.clientsInfo.mail
                repayData.paytypeid = state.paytypeid
                confirmData = repayData
            }

            if(isCCPayment){
                confirmData.ccinfo = ccInfoData
            }

            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/ors/room/confirm',
                method: 'post',
                data: confirmData,
            }).then((confirmReservation) => {
                const confirmReservationData = confirmReservation.data
                if (confirmReservationData.success) {
                    setConfirmReservationtInitialized(false)
                    showSuccess(t('str_reservationSuccess'))
                    setConfirmReservno(confirmReservationData.reservno)
                    setIsGroupReservation(confirmReservationData.isgroupres)
                    setPrintEmailTemplate(confirmReservationData.printemailtemplate)
                    setActiveStep((prevActiveStep) => prevActiveStep + 1)
                    setToState('ibe', ['listOfSelectedRooms', 'roomList'], [])
                    updateState('ibe', 'roomAvailabilityList', [])
                    const defClientInfo = {
                        clientid: false,
                        firstName: '',
                        firstNameError: false,
                        lastName: '',
                        lastNameError: false,
                        mail: '',
                        mailError: false,
                        phone: '',
                        birthDate: '',
                        birthDateError: false,
                        note: '',
                    }
                    updateState('ibe', 'clientsInfo', defClientInfo)
                } else {
                    if(confirmReservationData.repay){
                        setIsRepay(confirmReservationData.repay)
                        setRepayData({
                            isgroupres: confirmReservationData.isgroupres,
                            reservno: confirmReservationData.reservno,
                            isrepay: true
                        })
                    }

                    setConfirmReservationtInitialized(false)
                    showError(confirmReservationData.msgcode)
                }
            })
        }
    }

    const handleAcceptReservation = (e) => {
        updateState('ibe', 'acceptReservation', e)
    }

    const printReservationDetails = (e) => {
        e.stopPropagation()
        let orderHtml = printEmailTemplate
        let w = window.open()
        w.document.write(orderHtml)
        w.print()
        w.close()
    }

    return (
        <div>
            {state.listOfSelectedRooms && state.listOfSelectedRooms.roomList.length > 0 && (
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth={true}
                    style={{ marginTop: '10px' }}
                    onClick={handleClickOpen}
                >
                    {t('str_confirmReservation')}
                </Button>
            )}
            <Dialog
                fullScreen
                open={state.reservationConfirmDialog}
                onClose={handleClose}
                TransitionComponent={Transition}
            >
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <Typography variant="h6" className={classes.title}>
                            {t('str_confirmReservation')}
                        </Typography>
                        {activeStep !== steps.length ? (
                            <Button color="inherit" onClick={handleClose} size="medium" className={classes.margin}>
                                {t('str_continueReservation')}
                            </Button>
                        ) : (
                            <IconButton edge="start" color="inherit" onClick={handleClear} aria-label="close">
                                <Close />
                            </IconButton>
                        )}
                    </Toolbar>
                </AppBar>
                <DialogContent style={{ backgroundColor: 'whitesmoke' }}>
                    <Container maxWidth="lg" style={{ marginTop: 50 }}>
                        <Grid container spacing={3}>
                            {activeStep === steps.length && (
                                <Grid item xs={12}>
                                    <Paper square elevation={1} className={classes.thankYouReservation}>
                                        <CheckCircleOutline fontSize="large" style={{ color: '#4CAF50' }} />
                                        <Typography variant="h6" className={classes.thankYouReservationTitle}>
                                            {t('str_thankForRes')}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            align="center"
                                            className={classes.thankYouReservationDescription}
                                            gutterBottom
                                        >
                                            {isGroupReservation ? t('str_groupResNo') : t('str_yourReservationNo')} #
                                            {confirmReservno}. {t('str_mailPrintMsg')}
                                        </Typography>
                                        {/*<Button
                                            size="medium"
                                            variant="outlined"
                                            color="primary"
                                            onClick={printReservationDetails}
                                            startIcon={<Print />}
                                        >
                                            {t('str_printDetails')}
                                        </Button>*/}
                                    </Paper>
                                </Grid>
                            )}
                            {activeStep !== steps.length && (
                                <React.Fragment>
                                    <Grid item xs={12} sm={8}>
                                        <Paper className={classes.paper}>
                                            <Stepper activeStep={activeStep} orientation="vertical">
                                                {steps.map((label, index) => (
                                                    <Step key={label}>
                                                        <StepLabel>
                                                            <Typography variant="h6">{label}</Typography>
                                                        </StepLabel>
                                                        <StepContent>
                                                            {index === 0 && (
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs={12} sm={6}>
                                                                        <TextField
                                                                            margin="dense"
                                                                            variant="outlined"
                                                                            required
                                                                            disabled={isLogin}
                                                                            id="firstName"
                                                                            name="firstName"
                                                                            label={t('str_firstName')}
                                                                            fullWidth
                                                                            autoComplete="fname"
                                                                            value={state.clientsInfo.firstName}
                                                                            onChange={(e) => handleClientInfoChange(e)}
                                                                            error={state.clientsInfo.firstNameError}
                                                                        />
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={6}>
                                                                        <TextField
                                                                            margin="dense"
                                                                            variant="outlined"
                                                                            required
                                                                            id="lastName"
                                                                            name="lastName"
                                                                            disabled={isLogin}
                                                                            label={t('str_lastName')}
                                                                            fullWidth
                                                                            autoComplete="lname"
                                                                            value={state.clientsInfo.lastName}
                                                                            onChange={(e) => handleClientInfoChange(e)}
                                                                            error={state.clientsInfo.lastNameError}
                                                                        />
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={6}>
                                                                        <TextField
                                                                            margin="dense"
                                                                            variant="outlined"
                                                                            required
                                                                            id="mail"
                                                                            name="mail"
                                                                            disabled={isLogin}
                                                                            label={t('str_email')}
                                                                            fullWidth
                                                                            value={state.clientsInfo.mail}
                                                                            onChange={(e) => handleClientInfoChange(e)}
                                                                            error={state.clientsInfo.mailError}
                                                                        />
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={6}>
                                                                        <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                                                                            <DatePicker
                                                                                autoOk
                                                                                label={t('str_birthDate')}
                                                                                id="birthdate"
                                                                                name="birthdate"
                                                                                fullWidth
                                                                                disableFuture
                                                                                openTo={'date'}
                                                                                views={['year', 'month', 'date']}
                                                                                margin="dense"
                                                                                value={state.clientsInfo.birthDate ? moment(state.clientsInfo.birthDate) : moment().subtract(state.maxChildAge > 0 ? state.maxChildAge : 12, 'years')}
                                                                                onChange={(e) => handleClientInfoBirthDateChange(e,'birthDate')}
                                                                                inputFormat="DD/MM/YYYY"
                                                                                renderInput={(props) => <TextField {...props} margin="dense" variant="outlined" fullWidth error={state.clientsInfo.birthDateError} helperText=""/>}
                                                                            />
                                                                        </LocalizationProvider>
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={6}>
                                                                        <PhoneInput
                                                                            defaultCountry=={locale === 'en' ? 'us': locale}
                                                                            preferredCountries={[
                                                                                'it',
                                                                                'ie',
                                                                                'de',
                                                                                'fr',
                                                                                'es',
                                                                                'gb',
                                                                            ]}
                                                                            regions={[
                                                                                'america',
                                                                                'europe',
                                                                                'asia',
                                                                                'oceania',
                                                                                'africa',
                                                                            ]}
                                                                            variant="outlined"
                                                                            id="phone"
                                                                            name="phone"
                                                                            disabled={isLogin}
                                                                            label={t('str_phone')}
                                                                            fullWidth
                                                                            margin="dense"
                                                                            value={state.clientsInfo.phone}
                                                                            onChange={(e) =>
                                                                                handleClientInfoChange(e, 'phone')
                                                                            }
                                                                        />
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={6}>
                                                                        <TextField
                                                                            margin="dense"
                                                                            variant="outlined"
                                                                            id="healthcode"
                                                                            name="healthcode"
                                                                            label={t('str_healthCode')}
                                                                            fullWidth
                                                                            value={state.clientsInfo.healthcode}
                                                                            onChange={(e) => handleClientInfoChange(e)}
                                                                        />
                                                                    </Grid>
                                                                    <Grid item xs={12}>
                                                                        <TextField
                                                                            margin="dense"
                                                                            variant="outlined"
                                                                            id="note"
                                                                            name="note"
                                                                            label={t('str_note')}
                                                                            fullWidth
                                                                            multiline
                                                                            rows={4}
                                                                            value={state.clientsInfo.note}
                                                                            onChange={(e) => handleClientInfoChange(e)}
                                                                        />
                                                                    </Grid>
                                                                    <Grid item xs={12}>
                                                                        {state.listOfSelectedRooms.roomList.length >
                                                                            1 ||
                                                                        (state.listOfSelectedRooms.roomList.length >=
                                                                            1 &&
                                                                            state.listOfSelectedRooms.roomList[0]
                                                                                .guestList.length > 1) ? (
                                                                            <Typography variant="h6" gutterBottom>
                                                                                {t('str_informationFromGuests')}
                                                                            </Typography>
                                                                        ) : (
                                                                            ''
                                                                        )}
                                                                        {state.listOfSelectedRooms.roomList.map(
                                                                            (room, roomIndex) => {
                                                                                let roomNo = roomIndex + 1
                                                                                if (
                                                                                    roomIndex !== 0 ||
                                                                                    (roomIndex === 0 &&
                                                                                        room.totalpax > 1)
                                                                                ) {
                                                                                    return (
                                                                                        <div
                                                                                            key={roomIndex}
                                                                                            style={{ marginBottom: 10 }}
                                                                                        >
                                                                                            <Typography variant="subtitle1">
                                                                                                {roomNo}.{' '}
                                                                                                {t('str_room')} (
                                                                                                {state.roomAvailabilityList && state.roomAvailabilityList.length > 0 &&
                                                                                                    state.roomAvailabilityList.find(
                                                                                                        (item) =>
                                                                                                            item.id ===
                                                                                                            room.roomtypeid
                                                                                                    ).description}
                                                                                                )
                                                                                            </Typography>
                                                                                            {Array.from({
                                                                                                length: room.totalpax,
                                                                                            }).map((pax, paxIndex) => {
                                                                                                if (
                                                                                                    roomIndex > 0 ||
                                                                                                    (roomIndex === 0 &&
                                                                                                        paxIndex > 0)
                                                                                                ) {
                                                                                                    let paxNo =
                                                                                                        paxIndex + 1
                                                                                                    return (
                                                                                                        <div
                                                                                                            key={
                                                                                                                paxIndex
                                                                                                            }
                                                                                                            style={{
                                                                                                                marginBottom: 5,
                                                                                                            }}
                                                                                                        >
                                                                                                            <Typography
                                                                                                                variant="caption"
                                                                                                                display="block"
                                                                                                            >
                                                                                                                {paxNo}.{' '}
                                                                                                                {t(
                                                                                                                    'str_guest'
                                                                                                                )}
                                                                                                            </Typography>
                                                                                                            <OtherGuestInfos
                                                                                                                roomIndex={
                                                                                                                    roomIndex
                                                                                                                }
                                                                                                                paxIndex={
                                                                                                                    paxIndex
                                                                                                                }
                                                                                                            />
                                                                                                        </div>
                                                                                                    )
                                                                                                }
                                                                                            })}
                                                                                        </div>
                                                                                    )
                                                                                }
                                                                            }
                                                                        )}
                                                                    </Grid>
                                                                </Grid>
                                                            )}
                                                            {index === 1 && (
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs={12} sm={12}>
                                                                        <Grid container>
                                                                            <Grid item xs={12}>
                                                                                <ReservationPayment
                                                                                    isCcPay={e => setIsCCPayment(e)}
                                                                                    ccInfo={e=> setCcInfo(e)}
                                                                                    ccValid={e=> setCcValid(e)}
                                                                                />
                                                                            </Grid>
                                                                            {state.paytypeid && (
                                                                                <Grid item xs={12}>
                                                                                    <FrameCheckbox
                                                                                        value={state.acceptReservation}
                                                                                        title="str_termsAndConditions"
                                                                                        linkText="str_iAcceptLinkAndDesc"
                                                                                        linkTextADesc="str_termsAndConditions"
                                                                                        ifamePageUrl={
                                                                                            GENERAL_SETTINGS.BASE_URL +
                                                                                            `info/${locale}/${
                                                                                                global.onlineReservation
                                                                                                    .strOrsResTerms
                                                                                            }?iframe=true`
                                                                                        }
                                                                                        isCheck={(e) =>
                                                                                            handleAcceptReservation(e)
                                                                                        }
                                                                                    />
                                                                                </Grid>
                                                                            )}
                                                                        </Grid>
                                                                    </Grid>
                                                                </Grid>
                                                            )}
                                                            <Grid
                                                                container
                                                                direction="row"
                                                                justify="flex-end"
                                                                alignItems="center"
                                                                spacing={3}
                                                            >
                                                                <Grid item>
                                                                    <Button
                                                                        disabled={activeStep === 0}
                                                                        onClick={handleBack}
                                                                        className={classes.button}
                                                                    >
                                                                        {t('str_back')}
                                                                    </Button>
                                                                </Grid>
                                                                <Grid item>
                                                                    {activeStep === steps.length - 1 ? (
                                                                        <div className={classes.confirmButtonWrapper}>
                                                                            <Button
                                                                                disabled={
                                                                                      state.acceptReservation === false || confirmReservationtInitialized
                                                                                }
                                                                                variant="contained"
                                                                                color="primary"
                                                                                onClick={handleConfirmReservation}
                                                                                className={classes.button}
                                                                            >
                                                                                {t('str_confirm')}
                                                                            </Button>
                                                                            {confirmReservationtInitialized && (
                                                                                <CircularProgress
                                                                                    size={24}
                                                                                    className={
                                                                                        classes.confirmButtonProgress
                                                                                    }
                                                                                    color="inherit"
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <Button
                                                                            disabled={
                                                                                activeStep === 1 &&
                                                                                state.paytypeid === null
                                                                            }
                                                                            variant="contained"
                                                                            color="primary"
                                                                            onClick={handleNext}
                                                                            className={classes.button}
                                                                        >
                                                                            {t('str_next')}
                                                                        </Button>
                                                                    )}
                                                                </Grid>
                                                            </Grid>
                                                        </StepContent>
                                                    </Step>
                                                ))}
                                            </Stepper>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Paper className={classes.paper}>
                                            <Typography variant="h6" gutterBottom>
                                                {t('str_reservationSummary')}
                                            </Typography>
                                            <ReservationSummary />
                                        </Paper>
                                    </Grid>
                                </React.Fragment>
                            )}
                        </Grid>
                    </Container>
                </DialogContent>
            </Dialog>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.ibe,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ReservationConfirm)
