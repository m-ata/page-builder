import React, { useContext, useEffect, useState } from 'react'
import { connect, useSelector } from 'react-redux'
import { setToState } from 'state/actions'
import {
    Box,
    Button,
    Checkbox,
    Divider,
    FormControlLabel,
    FormGroup,
    Grid,
    TextField,
    Typography,
    Container,
    IconButton,
    OutlinedInput,
    InputLabel,
    InputAdornment,
    FormHelperText,
    FormControl
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'
import { useSnackbar } from 'notistack'
import ReservationCart from 'components/booking/components/ReservationCart'
import BookingStepper from 'components/booking/components/BookingStepper'
import BookingLayout from 'components/layout/containers/booking-layout'
import WebCmsGlobal from 'components/webcms-global'
import { useRouter } from 'next/router'
import axios from 'axios'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import TrackedChangesDialog from 'components/TrackedChangesDialog'
import LoginDialog from 'components/LoginComponent/LoginDialog'
import PhoneInput from '@webcms-ui/core/phone-input'
import OtherGuestInfo from 'components/booking/OtherGuestInfo'
import PaymentInformation from 'components/booking/components/PaymentInformation'
import ProgressButton from 'components/booking/components/ProgressButton'
import { useOrestAction } from 'model/orest'
import TagManager from '@webcms-globals/tag-manager'
import { REQUEST_METHOD_CONST } from 'model/orest/constants'
import { required, validateEmail } from 'state/utils/form'
import moment from 'moment'
import MomentAdapter from '@date-io/moment'
import { DatePicker, LocalizationProvider } from '@material-ui/pickers'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import { UseOrest } from '@webcms/orest'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { getBookingSteps, bookingSteps, bookingStepCodes } from 'components/booking/commons'

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
        background: theme.palette.background.paper,
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
    infoTextField: {
        background: '#FFFFFF',
        '& fieldset': {
            borderRadius: 0,
        },
    },
    createAccountHelperText: {
        textAlign: 'right',
    },
    textRed: {
        color: 'red'
    },
    topSpaceBox: {
        width: '100%',
        display: 'block',
        marginTop: 60,
    },
    bottomSpaceBox: {
        width: '100%',
        display: 'block',
        marginBottom: '30vh',
        '@media print': {
            display: 'none',
        },
    },
}))

function mandatoryFieldMarker(contactInfo, mandatoryField) {
    const useMandatoryField = mandatoryField && mandatoryField.split(',') || false
    if(!Array.isArray(useMandatoryField)){
        return contactInfo
    }

    let newContactInfo = {...contactInfo}
    Object.keys(contactInfo).map((key) => {
        if(mandatoryField.includes(contactInfo[key].key)){
            newContactInfo[key].isrequired = true
        }
    })
    return newContactInfo
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

const DetailsPage = (props) => {
    const classes = useStyles()
        , { GENERAL_SETTINGS, WEBCMS_DATA, locale } = useContext(WebCmsGlobal)
        , { t } = useTranslation()
        , { state, setToState, hideLayout } = props
        , showAddons = Boolean(GENERAL_SETTINGS.hotelSettings.product) || Boolean(GENERAL_SETTINGS.hotelSettings.remark) || Boolean(GENERAL_SETTINGS.hotelSettings.transport)
        , { enqueueSnackbar } = useSnackbar()
        , [, setUseScrollUp] = useState(false)
        , router = useRouter()
        , [isLoginDialog, setIsLoginDialog] = useState(false)
        , [isOpenLoginDialog, setIsOpenLoginDialog] = useState(false)
        , [emailIsAlreadyExistsDialog, setEmailIsAlreadyExistsDialog] = useState(false)
        , [isRouting, setIsRouting] = useState(false)
        , loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
        , token = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false)
        , clientBase = useSelector((state) => state?.orest?.state?.client || false)
        , iframe = router.query.iframe === 'true'
        , isLogoutButton = (token && iframe)
        , { deleteOrestCurrentUserInfo, resetOrestState } = useOrestAction()
        , [pageSizes, setPageSizes] = useState({
            width: '100%',
            height: '100%',
            imgHeight: '100%',
         })
        , [isButtonRouting, setIsButtonRouting] = useState(false)

    useEffect(() => {
        let isEffect = true

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
                pageStep: 'Guest Details',
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

    useEffect(()=> {
        window.handleContinueByGuestDetailPage = () => {
            return handleContinue()
        }
    }, [state.selectedPaymentTypeId])

    useEffect(() => {
        if (loginfo) {
            setIsLoginDialog(true)
            UseOrest({
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
                    if (clientBase && clientBase?.id) {
                        setClientInfo(clientBase)
                    } else if ((router.query.clientid || loginfo.accid) && token) {
                        UseOrest({
                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                            endpoint: 'client/getbyid',
                            token,
                            params: {
                                key: router.query.clientid || loginfo.accid,
                                allhotels: true,
                            },
                        }).then((client) => {
                            if (client.status === 200 && client.data.count > 0) {
                                setClientInfo(client.data.data)
                            }
                        })
                    }
                }else{
                    enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'info' })
                    deleteOrestCurrentUserInfo()
                }
            }).catch(() => {
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'info' })
                deleteOrestCurrentUserInfo()
            })
        } else if(clientBase) {
            setClientInfo(clientBase)
        } else {
            setIsLoginDialog(false)
        }
    }, [clientBase, loginfo])

    const handleScroll = () => {
        let windowSize = window?.innerWidth || document?.documentElement?.clientWidth || document?.body?.clientWidth || 0;
        if(windowSize <= 959 && window?.pageYOffset > 100){
            setUseScrollUp(true)
        }else{
            setUseScrollUp(false)
        }
    }

    const setClientInfo = (clientInfoData) => {
        let newContactInfo = state.contactInfo

        newContactInfo.firstName.value = clientInfoData.firstname
        newContactInfo.firstName.iserror = false
        selectedRooms[0].guestList[0].firstName.value = clientInfoData.firstname

        newContactInfo.lastName.value = clientInfoData.lastname
        newContactInfo.lastName.iserror = false
        selectedRooms[0].guestList[0].lastName.value = clientInfoData.lastname

        newContactInfo.mail.value = clientInfoData.email
        newContactInfo.mail.iserror = false
        selectedRooms[0].guestList[0].mail.value = clientInfoData.email

        newContactInfo.birthDate.value = clientInfoData.birthdate
        newContactInfo.birthDate.iserror = false
        selectedRooms[0].guestList[0].birthDate.value = clientInfoData.birthdate

        newContactInfo.healthcode.value = clientInfoData.healthcode
        newContactInfo.healthcode.iserror = false
        selectedRooms[0].guestList[0].healthcode.value = clientInfoData.healthcode

        newContactInfo.phone.value = clientInfoData.mobiletel
        newContactInfo.phone.iserror = false
        selectedRooms[0].guestList[0].phone.value = clientInfoData.mobiletel

        setToState('ibe', ['selectedRooms'], selectedRooms)
        setToState('ibe', ['contactInfo'], newContactInfo)
    }

    const [createAccount, setCreateAccount] = useState({
        isActive: false,
        password: '',
        showPassword: false,
        isError: false
    })

    const contactInfoSettings = {
        spacing: 2,
        margin: 'none',
        variant: 'outlined',
    }

    const hasPayType = async (id, filter) => {
        const payType = state.hotelPaymentType && state.hotelPaymentType.paymentypes.length > 0 && state.hotelPaymentType.paymentypes.filter((item) => item[filter])[0]
        return Boolean(payType && Number(id) === Number(payType.id))
    }

    let selectedRooms = state.selectedRooms
    let contactInfo = mandatoryFieldMarker(state.contactInfo, GENERAL_SETTINGS.hotelSettings.cireqflds)

    const changeFirstName = (e) => {
        contactInfo.firstName.value = e.currentTarget.value
        contactInfo.firstName.iserror = false
        selectedRooms[0].guestList[0].firstName.value = e.currentTarget.value
        setToState('ibe', ['selectedRooms'], selectedRooms)
        setToState('ibe', ['contactInfo'], contactInfo)
    }

    const changeLastName = (e) => {
        contactInfo.lastName.value = e.currentTarget.value
        contactInfo.lastName.iserror = false
        selectedRooms[0].guestList[0].lastName.value = e.currentTarget.value
        setToState('ibe', ['selectedRooms'], selectedRooms)
        setToState('ibe', ['contactInfo'], contactInfo)
    }

    const changeMail = (e) => {
        setToState('ibe', ['continueWithoutClientRecord'], false)
        contactInfo.mail.value = e.currentTarget.value
        contactInfo.mail.iserror = false
        selectedRooms[0].guestList[0].mail.value = e.currentTarget.value
        setToState('ibe', ['selectedRooms'], selectedRooms)
        setToState('ibe', ['contactInfo'], contactInfo)
    }

    const changeHealtCode = (e) => {
        contactInfo.healthcode.value = e.currentTarget.value
        contactInfo.healthcode.iserror = false
        selectedRooms[0].guestList[0].healthcode.value = e.currentTarget.value
        setToState('ibe', ['selectedRooms'], selectedRooms)
        setToState('ibe', ['contactInfo'], contactInfo)
    }

    const changePhoneNumber = (e) => {
        contactInfo.phone.value = e
        contactInfo.phone.iserror = false
        selectedRooms[0].guestList[0].phone.value = e
        setToState('ibe', ['selectedRooms'], selectedRooms)
        setToState('ibe', ['contactInfo'], contactInfo)
    }

    const changeDateOfBirth = (date) => {
        if (date) {
            if (date._isValid) {
                contactInfo.birthDate.value = date._d
                selectedRooms[0].guestList[0].birthDate.value = date._d
            } else {
                contactInfo.birthDate.value = date._d
                selectedRooms[0].guestList[0].birthDate.value = date._d
            }
            contactInfo.birthDate.iserror = false
            setToState('ibe', ['selectedRooms'], selectedRooms)
            setToState('ibe', ['contactInfo'], contactInfo)
        }
    }

    const changeNote = (e) => {
        contactInfo.note.value = e.currentTarget.value
        selectedRooms[0].guestList[0].note.value = e.currentTarget.value
        setToState('ibe', ['selectedRooms'], selectedRooms)
        setToState('ibe', ['contactInfo'], contactInfo)
    }

    const emailValidation = (email) => {
        return axios({
            url: `${GENERAL_SETTINGS.BASE_URL}api/ors/guest/email/valid`,
            method: 'post',
            data: {
                email: email
            }
        }).then((response)=> {
            return response.data
        })
    }

    const handleContinue = async (continueWithoutClientRecord) => {
        setToState('ibe', ['isHandleContinue'], true)
        let isRequiredError = false, isEmailError = false

        Object.keys(contactInfo).forEach(function(key) {
            if (contactInfo[key].isrequired) {
                if (required(contactInfo[key].value)) {
                    contactInfo[key].iserror = true
                    isRequiredError = true
                }
            }
        })

        if(createAccount.isActive && (createAccount.password === '' || createAccount.password.length < 6)){
            setCreateAccount({ ...createAccount, isError: true })
            enqueueSnackbar(t('str_pleaseCheckYourPassword'), { variant: 'error' })
            isRequiredError = true
        }else{
            setCreateAccount({ ...createAccount, isError: false })
        }

        const contactEmail = await emailValidation(contactInfo.mail.value)
        if(!continueWithoutClientRecord && contactEmail.exits && !loginfo && !clientBase){
            isEmailError = true
            contactInfo['mail'].iserror = true
            setEmailIsAlreadyExistsDialog(true)
            setToState('ibe', ['isHandleContinue'], false)
        }

        if(!contactEmail.validation){
            isEmailError = true
            contactInfo['mail'].iserror = true
        }

        if(!Number(state.selectedPaymentTypeId) > 0){
            enqueueSnackbar(t('str_pleaseSelectAPaymentMethodToContinue'), { variant: 'warning' })
            setToState('ibe', ['isHandleContinue'], false)
            return;
        }

        const checkPayTypeIsMailOrder = await hasPayType(state.selectedPaymentTypeId, 'ismailorder')
        if(checkPayTypeIsMailOrder && (!state.mailOrderInfo.cardIsValid)){
            enqueueSnackbar(t('str_pleaseCheckYourCardInformation'), { variant: 'warning' })
            setToState('ibe', ['isHandleContinue'], false)
            return;
        }

        setToState('ibe', ['contactInfo'], contactInfo)
        selectedRooms.map((room, roomIndex) => {
            if (roomIndex !== 0 || (roomIndex === 0 && room.totalpax > 1)) {
                Array.from({ length: room.totalpax }).map((pax, paxIndex) => {
                    if (roomIndex > 0 || (roomIndex === 0 && paxIndex > 0)) {
                        let guestList = selectedRooms[roomIndex].guestList[paxIndex]
                        Object.keys(guestList).forEach(function(key) {
                            if (guestList[key].isrequired) {
                                if (required(guestList[key].value)) {
                                    guestList[key].iserror = true
                                    isRequiredError = true
                                }
                            }

                            if (guestList['mail'].value) {
                                if (validateEmail(guestList['mail'].value)) {
                                    guestList['mail'].iserror = true
                                    isEmailError = true
                                }
                            }
                        })

                        setToState('ibe', ['selectedRooms', roomIndex, 'guestList', paxIndex], guestList)
                    }
                })
            }
        })

        if(isRequiredError || isEmailError){
            setToState('ibe', ['isHandleContinue'], false)
            if(!createAccount.isError && !contactEmail.exits){
                enqueueSnackbar(t('str_pleaseCheckMandatoryFields'), { variant: 'error' })
            }
        }else{
            setToState('ibe', ['isHandleContinue'], false)
            if(createAccount.isActive){
                setToState('ibe', ['clientPassword'], createAccount.password)
            }
            router.push ({
                pathname: '/booking/preview',
                query: router.query
            })
        }
    }

    const handleBack = () => {
        if(showAddons){
            router.push ({
                pathname: '/booking/addons',
                query: router.query
            })
        }else{
            router.push ({
                pathname: '/booking/rooms',
                query: router.query
            })
        }
        handleScrollTop()
    }

    const handleScrollTop = () => {
        return window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    }

    const handleLogout = () => {
        deleteOrestCurrentUserInfo()
        resetOrestState()
    }

    if (isRouting) {
        return (
            <BookingLayout hideLayout={hideLayout}>
                <div className={classes.topSpaceBox} />
                <Container maxWidth={settings.containerMaxWidth} className={classes.containerBooking}>
                    <Grid container spacing={settings.containerSpacing}>
                        <Grid item xs={12}>
                            <div style={{ width: '100%', height: '80vh', textAlign: 'center', paddingTop: '25%' }}>
                                <span style={{
                                    background: '#d5d5d5',
                                    padding: 40,
                                    width: '100%',
                                    display: 'block',
                                    fontSize: 15,
                                }}>
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
                                <BookingStepper classes={{ root: classes.stepperRoot }} activeStep={bookingStepCodes.details} steps={getBookingSteps(bookingSteps, showAddons)}/>
                                <Grid container spacing={0} style={{paddingTop: 10}}>
                                    <React.Fragment>
                                        <TrackedChangesDialog
                                            isContainedNo={false}
                                            dialogTitle={t('str_info')}
                                            dialogDesc={t('str_thisEmailAddressHasBeenUsedBeforeYouCanContinueTheReservationByLoggingIn')}
                                            labelYes={t('str_logInHere')}
                                            labelNo={t('str_continueWithoutLogin')}
                                            open={emailIsAlreadyExistsDialog}
                                            onPressNo={() => {
                                                contactInfo['mail'].iserror = false
                                                setToState('ibe', ['contactInfo'], contactInfo)
                                                setToState('ibe', ['continueWithoutClientRecord'], true)
                                                setEmailIsAlreadyExistsDialog(false)
                                                handleContinue(true)
                                            }}
                                            onPressYes={() => {
                                                setEmailIsAlreadyExistsDialog(false)
                                                setIsOpenLoginDialog(true)
                                            }}
                                        />
                                        {(!isLoginDialog) ? (
                                            <React.Fragment>
                                                <LoginDialog open={isOpenLoginDialog} onClose={(status) => setIsOpenLoginDialog(status)} locationName='booking' isLoginWrapper disableRegister/>
                                                <Box p={3} className={classes.root}>
                                                    <Grid container spacing={contactInfoSettings.spacing}>
                                                        <Grid item xs={12}>
                                                            <Typography variant='h6' gutterBottom>
                                                                {t('str_signInForAFasterBooking')}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <Button onClick={() => setIsOpenLoginDialog(true)} variant='contained' color='primary' size='large' disabled={isButtonRouting} disableElevation>
                                                                {t('str_login')}
                                                            </Button>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            </React.Fragment>
                                        ): null}
                                        {(!!isLoginDialog && isLogoutButton) ? (
                                            <React.Fragment>
                                                <Box p={3} className={classes.root}>
                                                    <Grid container spacing={contactInfoSettings.spacing}>
                                                        <Grid item xs={12}>
                                                            <Button onClick={() => handleLogout()} variant='contained' color='primary' size='large' disabled={isButtonRouting} disableElevation>
                                                                {t('str_logout')}
                                                            </Button>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            </React.Fragment>
                                        ) : null}
                                        <Box p={3} className={classes.root}>
                                            <Grid container spacing={contactInfoSettings.spacing}>
                                                <Grid item xs={12}>
                                                    <Typography variant="h6" gutterBottom>
                                                        {t('str_contactInfo')}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        disabled={isButtonRouting || Boolean(loginfo) || Boolean(clientBase)}
                                                        className={classes.infoTextField}
                                                        margin={contactInfoSettings.margin}
                                                        variant={contactInfoSettings.variant}
                                                        required={state.contactInfo.firstName.isrequired}
                                                        id="firstName"
                                                        name="firstName"
                                                        label={t('str_firstName')}
                                                        fullWidth
                                                        onChange={(e)=> changeFirstName(e)}
                                                        value={state.contactInfo.firstName.value || ''}
                                                        error={state.contactInfo.firstName.iserror}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        disabled={isButtonRouting || Boolean(loginfo) || Boolean(clientBase)}
                                                        className={classes.infoTextField}
                                                        margin={contactInfoSettings.margin}
                                                        variant={contactInfoSettings.variant}
                                                        required={state.contactInfo.lastName.isrequired}
                                                        id="lastName"
                                                        name="lastName"
                                                        label={t('str_lastName')}
                                                        fullWidth
                                                        onChange={(e)=> changeLastName(e)}
                                                        value={state.contactInfo.lastName.value || ''}
                                                        error={state.contactInfo.lastName.iserror}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        disabled={isButtonRouting || Boolean(loginfo) || Boolean(clientBase)}
                                                        className={classes.infoTextField}
                                                        margin={contactInfoSettings.margin}
                                                        variant={contactInfoSettings.variant}
                                                        required={state.contactInfo.mail.isrequired}
                                                        id="mail"
                                                        name="mail"
                                                        label={t('str_email')}
                                                        fullWidth
                                                        onChange={(e)=> changeMail(e)}
                                                        value={state.contactInfo.mail.value || ''}
                                                        error={state.contactInfo.mail.iserror}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <PhoneInput
                                                        disabled={isButtonRouting || Boolean(loginfo) || Boolean(clientBase)}
                                                        className={classes.infoTextField}
                                                        defaultCountry={locale === 'en' ? 'us': locale}
                                                        preferredCountries={['it', 'ie', 'de', 'fr', 'es', 'gb']}
                                                        regions={['america', 'europe', 'asia', 'oceania', 'africa']}
                                                        id="phone"
                                                        name="phone"
                                                        label={t('str_phone')}
                                                        fullWidth
                                                        margin={contactInfoSettings.margin}
                                                        variant={contactInfoSettings.variant}
                                                        onChange={(e)=> changePhoneNumber(e)}
                                                        required={state.contactInfo.phone.isrequired}
                                                        value={state.contactInfo.phone.value || ''}
                                                        error={state.contactInfo.phone.iserror}
                                                    />
                                                </Grid>
                                                {GENERAL_SETTINGS?.hotelSettings?.regbirthdate && (
                                                    <Grid item xs={12} sm={6}>
                                                        <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                                                            <DatePicker
                                                                disabled={isButtonRouting || Boolean(loginfo) || Boolean(clientBase)}
                                                                autoOk
                                                                id="birthdate"
                                                                name="birthdate"
                                                                fullWidth
                                                                disableFuture
                                                                openTo={'date'}
                                                                views={['year', 'month', 'date']}
                                                                inputFormat="DD/MM/YYYY"
                                                                label={t('str_birthDate')}
                                                                onChange={(e) => changeDateOfBirth(e)}
                                                                value={state.contactInfo.birthDate.value ? moment(state.contactInfo.birthDate.value) : moment().subtract(state.maxChildAge > 0 ? state.maxChildAge : 12, 'years')}
                                                                renderInput={(props) =>
                                                                    <TextField
                                                                        {...props}
                                                                        className={classes.infoTextField}
                                                                        margin={contactInfoSettings.margin}
                                                                        variant={contactInfoSettings.variant}
                                                                        fullWidth
                                                                        helperText=""
                                                                        required={state.contactInfo.birthDate.isrequired}
                                                                        error={state.contactInfo.birthDate.iserror}
                                                                    />
                                                                }
                                                            />
                                                        </LocalizationProvider>
                                                    </Grid>
                                                )}
                                                {GENERAL_SETTINGS?.hotelSettings?.reghealthcode && (
                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            disabled={isButtonRouting || Boolean(loginfo) || Boolean(clientBase)}
                                                            className={classes.infoTextField}
                                                            margin={contactInfoSettings.margin}
                                                            variant={contactInfoSettings.variant}
                                                            required={state.contactInfo.healthcode.isrequired}
                                                            id="healtcode"
                                                            name="healtcode"
                                                            label={t('str_healthCode')}
                                                            fullWidth
                                                            onChange={(e)=> changeHealtCode(e)}
                                                            value={state.contactInfo.healthcode.value || ''}
                                                            error={state.contactInfo.healthcode.iserror}
                                                        />
                                                    </Grid>
                                                )}
                                                <Grid item xs={12}>
                                                    <TextField
                                                        disabled={isButtonRouting || Boolean(loginfo) || Boolean(clientBase)}
                                                        className={classes.infoTextField}
                                                        margin="dense"
                                                        variant="outlined"
                                                        id="note"
                                                        name="note"
                                                        label={t('str_note')}
                                                        fullWidth
                                                        multiline
                                                        rows={4}
                                                        onChange={(e)=> changeNote(e)}
                                                        required={state.contactInfo.note.isrequired}
                                                        value={state.contactInfo.note.value || ''}
                                                        error={state.contactInfo.note.iserror}
                                                    />
                                                </Grid>
                                                {(!state.continueWithoutClientRecord && !isLoginDialog) ? (
                                                    <Grid item xs={12}>
                                                        <Divider variant="fullWidth" />
                                                        <FormGroup row>
                                                            <FormControlLabel
                                                                control={<Checkbox name="create-account" color="primary" value={createAccount} onClick={()=> setCreateAccount({ ...createAccount, isActive: !createAccount.isActive })}/>}
                                                                label={t('str_iWouldLikeToCreateAnAccount')}
                                                            />
                                                        </FormGroup>
                                                        {createAccount.isActive && (
                                                            <Box component="span" display={createAccount.isActive ? 'block' : 'none'}>
                                                                <FormControl variant="outlined">
                                                                    <InputLabel htmlFor="create-account-password">{t('str_password')}</InputLabel>
                                                                    <OutlinedInput
                                                                        disabled={isButtonRouting}
                                                                        className={classes.infoTextField}
                                                                        id="create-account-password"
                                                                        type={createAccount.showPassword ? 'text' : 'password'}
                                                                        value={createAccount.password}
                                                                        onChange={(e) => setCreateAccount({ ...createAccount, password: e.target.value, })}
                                                                        aria-describedby="create-account-password-helper-text"
                                                                        labelWidth={70}
                                                                        endAdornment={
                                                                            <InputAdornment position="end">
                                                                                <IconButton
                                                                                    aria-label="toggle password visibility"
                                                                                    onClick={() => setCreateAccount({ ...createAccount, showPassword: !createAccount.showPassword, })}
                                                                                    onMouseDown={(e) => e.preventDefault()}
                                                                                >
                                                                                    {createAccount.showPassword ? <Visibility/> : <VisibilityOff/>}
                                                                                </IconButton>
                                                                            </InputAdornment>
                                                                        }
                                                                    />
                                                                    <FormHelperText id="create-account-password-helper-text" className={clsx(classes.createAccountHelperText, { [classes.textRed]: createAccount.isError } )}>{createAccount.isError ? t('str_yourPasswordMustBeAMinOf6Characters') : t('str_bookFasterOptional')}</FormHelperText>
                                                                </FormControl>
                                                            </Box>
                                                        )}
                                                    </Grid>
                                                ): null}
                                            </Grid>
                                        </Box>
                                        {state.selectedRooms.length > 1 || (state.selectedRooms.length >= 1 && state.selectedRooms[0].guestList.length > 1) ? (
                                            <Box p={3} className={classes.root}>
                                                <Grid container spacing={contactInfoSettings.spacing}>
                                                    <Grid item xs={12}>
                                                        <Typography variant="h6" gutterBottom>
                                                            {t('str_otherGuests')}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        {state.selectedRooms && state.selectedRooms.map((room, roomIndex) => {
                                                                let roomNo = roomIndex + 1
                                                                const numberOfGuests = Number(room.totalpax) + Number(room.totalchd)
                                                                if (roomIndex !== 0 || (roomIndex === 0 && numberOfGuests > 1)) {
                                                                    return (
                                                                        <div key={roomIndex} style={{ marginBottom: 10 }}>
                                                                            <Typography variant='subtitle1' style={{ marginBottom: 10 }}>
                                                                                {roomNo}.{' '}{t('str_room')} ({state.roomAvailabilityList && state.roomAvailabilityList.length > 0 && t(state.roomAvailabilityList.find((item) => item.id === room.roomtypeid).shorttext) })
                                                                            </Typography>
                                                                            {Array.from({ length: numberOfGuests }).map((pax, paxIndex) => {
                                                                                if (roomIndex > 0 || (roomIndex === 0 && paxIndex > 0)) {
                                                                                    let paxNo = paxIndex + 1
                                                                                    return (
                                                                                        <div key={paxIndex} style={{ marginBottom: 10 }}>
                                                                                            <Typography variant='caption' display='block' style={{ marginBottom: 10 }}>
                                                                                                {paxNo}.{' '}{t('str_guest')}
                                                                                            </Typography>
                                                                                            <OtherGuestInfo roomIndex={roomIndex} paxIndex={paxIndex} isDisabled={isButtonRouting}/>
                                                                                        </div>
                                                                                    )
                                                                                }
                                                                            })}
                                                                        </div>
                                                                    )
                                                                }
                                                            },
                                                        )}
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        ) : null}
                                        <Box p={3} className={classes.root}>
                                            <Grid container spacing={contactInfoSettings.spacing}>
                                                <Grid item xs={12}>
                                                    <Typography variant="h6" gutterBottom>
                                                        {t('str_paymentInformation')}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <PaymentInformation
                                                        isDisabled={isButtonRouting || state.isHandleContinue}
                                                        textFieldsClass={classes.infoTextField}
                                                        onChange={(e)=> setToState('ibe', ['creditCardInfo'], e)}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Box>
                                        <Box p={3} className={classes.root}>
                                            <Grid container direction="row" justify="space-between" alignItems="center" spacing={3}>
                                                <Grid item>
                                                    <Button
                                                        disabled={isButtonRouting || state.isHandleContinue}
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
                                                <Grid item>
                                                    <ProgressButton isLoading={state.isHandleContinue}>
                                                        <Button
                                                            disabled={isButtonRouting || state.isHandleContinue}
                                                            onClick={()=> handleContinue()}
                                                            variant="contained"
                                                            color="primary"
                                                            size="large"
                                                            disableElevation
                                                        >
                                                            {t('str_continueReservation')}
                                                        </Button>
                                                    </ProgressButton>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </React.Fragment>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={settings.rightColumn.xs} sm={settings.rightColumn.sm} md={settings.rightColumn.md} lg={settings.rightColumn.lg} xl={settings.rightColumn.xl}>
                        <ReservationCart bookingActiveStep={bookingStepCodes.details} handleNextStep={() => handleContinue()} handleBackStep={() => handleBack()} isDisabled={isButtonRouting}/>
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

export default connect(mapStateToProps, mapDispatchToProps)(DetailsPage)