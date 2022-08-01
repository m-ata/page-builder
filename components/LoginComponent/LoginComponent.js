import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { connect, useSelector } from 'react-redux'
import { resetState, setToState, updateState } from 'state/actions'
import styles from './style/LoginComponent.style'
import { makeStyles } from '@material-ui/core/styles'
import WebCmsGlobal from 'components/webcms-global'
import { useOrestAction } from 'model/orest'
import { AuthLogin, UseOrest } from '@webcms/orest'
import moment from 'moment'
import { DatePicker, LocalizationProvider, MobileDatePicker } from '@material-ui/pickers'
import MomentAdapter from '@date-io/moment'
import {
    Button,
    Checkbox,
    CircularProgress,
    FormControlLabel,
    Grid,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@material-ui/core'
import { Email, Person, Phone, Room, RoomService } from '@material-ui/icons'
import {
    CONTENTYPE,
    FILETYPE,
    LOCAL_STORAGE_EMAIL,
    LOCAL_STORAGE_OREST_HOTELNAME_TEXT,
    LOCAL_STORAGE_OREST_HOTELREFNO_TEXT,
    LOCAL_STORAGE_OREST_TOKEN_TEXT,
    LOCAL_STORAGE_PHONE_NUMBER,
    LOCAL_STORAGE_REMEMBER_ME,
    LOCAL_STORAGE_WEBCMS_COLUMNS_SETTINGS,
    mobileTelNoFormat,
} from 'model/orest/constants'
import useTranslation from 'lib/translations/hooks/useTranslation'
import Router, { useRouter } from 'next/router'
import PhoneInput from '../../@webcms-ui/core/phone-input'
import Update from 'components/guest/account/Client/Update'
import GuestSelection from 'components/guest/account/Details/GuestSelection'
import { useHotelInfoAction } from 'model/orest/components/ChangeHotel/redux_store'
import { useSnackbar } from 'notistack'
import clsx from 'clsx'
import Alert from '@material-ui/lab/Alert'
import { defaultLocale } from 'lib/translations/config'
import { objectTransliterate } from '@webcms-globals/helpers'
import utfTransliteration from '../../@webcms-globals/utf-transliteration'

const useStyles = makeStyles(styles)

function TabPanel(props) {
    const { children, value, index, ...other } = props
    const classes = useStyles()

    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`scrollable-auto-tabpanel-${index}`}
            aria-labelledby={`scrollable-auto-tab-${index}`}
            className={classes.tabPanel}
            {...other}
        >
            {value === index && <React.Fragment>{children}</React.Fragment>}
        </Typography>
    )
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
}

function a11yProps(index) {
    return {
        id: `scrollable-auto-tab-${index}`,
        'aria-controls': `scrollable-auto-tabpanel-${index}`,
    }
}

const urlFixer = (baseUrl, retUrl, lang) => {
    let isLang = !!lang
    if (isLang) {
        let useUrl = new URL(baseUrl + retUrl.replace('/', ''))
        useUrl.searchParams.delete('lang')
        useUrl = useUrl.toString()
        useUrl = '/' + useUrl.replace(baseUrl, '')
        return useUrl + `${useUrl.includes('?') ? '&' : '?'}lang=${lang}`
    } else {
        return retUrl
    }
}

const LoginComponent = (props) => {

    const { GENERAL_SETTINGS, locale } = useContext(WebCmsGlobal)
        , { t } = useTranslation()
        , { transliteration } = utfTransliteration()
        , router = useRouter()
        , { state, locationName, redirectUrl, isOnlyEmail, isUserPortalLogin, isEmpPortal, updateState, isCloudWikiLogin, setWikiLoginDialog, isLoginWrapper, noQuery, setToState, getEmail } = props
        , clientBase = useSelector((state) => state?.orest?.state?.client || false)
        , emailParam = !noQuery && router.query.email || clientBase?.email || ''
        , passParam = !noQuery && router.query.pass || ''
        , refUrlParam = router.query.refurl
        , isKiosk = router.query.kiosk === 'true'
        , { enqueueSnackbar } = useSnackbar()

    //redux
    const { setOrestState, setOrestUserInfo, deleteOrestCurrentUserInfo } = useOrestAction()
        , { setHotelRefNo, setHotelName, setHotelRefNoIsInitializing, updateLicenceMenuStatus  } = useHotelInfoAction()

    //state
    const [username, setUsername] = useState(emailParam || '')
        , [password, setPassword] = useState(passParam || '')
        , [birthDate, setBirthDate] = useState(null)
        , [isLoggingIn, setIsLoggingIn] = useState(false)
        , [tabValue, setTabValue] = useState(0)
        , [isPrevControl, setIsPrevControl] = useState(false)
        , [getAuthInfo, setAuthInfo] = useState({})
        , [getLoginInfo, setLoginInfo] = useState({})
        , [isEmail, setIsEmail] = useState(true)
        , [isPhoneNumber, setIsPhoneNumber] = useState(false)
        , [rememberMe, setRememberMe] = useState(false)
        , [useGuestSelection, setUseGuestSelection] = useState({
        isVisible: false,
        isLoading: false,
        data: false
    })

    //settings
    const allowedRoles = ['6500315', '6500300', '6500310']
        , colorObject = {
        backgroundColor: isUserPortalLogin ? '#063E8D' : isEmpPortal ? '#064E42' : 'inherit',
        hoverColor: isUserPortalLogin ? 'rgb(6, 62, 141, 0.8)' : isEmpPortal ? '#4E8179' : 'inherit',
        borderColor: isUserPortalLogin ? '#063E8D' : isEmpPortal ? '#064E42' : 'inherit',
        labelColor: isUserPortalLogin ? '#063E8D' : isEmpPortal ? '#064E42' : 'inherit',
        checkboxColor: isUserPortalLogin ? '#4666B0' : isEmpPortal ? '#4E8179' : 'inherit',
    }
    , classes = useStyles(colorObject)

    useEffect(() => {
        if (emailParam && passParam) {
            handleClickLogin()
        }
        const localRememberMe = localStorage.getItem(LOCAL_STORAGE_REMEMBER_ME) ?
            localStorage.getItem(LOCAL_STORAGE_REMEMBER_ME) !== 'false' : false
        const localUsername = localStorage.getItem(LOCAL_STORAGE_EMAIL) ?
            localStorage.getItem(LOCAL_STORAGE_EMAIL) : ""
        const localPhoneNumber = localStorage.getItem(LOCAL_STORAGE_PHONE_NUMBER) ?
            localStorage.getItem(LOCAL_STORAGE_PHONE_NUMBER) : ""
        if(localRememberMe && localRememberMe !== false) {
            if(isEmail) {
                setUsername(localUsername)
                setRememberMe(localRememberMe)
            } else if(isPhoneNumber) {
                setUsername(localPhoneNumber)
                setRememberMe(localRememberMe)
            }
        }

        deleteOrestCurrentUserInfo()
    }, [isEmail])

    useEffect(() => {
        typeof getEmail === 'function' && getEmail(username)
    }, [username])
    
    const handleOnChangeCheckBox = (event) => {
        setRememberMe(event.target.checked);
    }

    const handleCheckPrv = (client) =>{
        if(locationName === "guest"){
            return client && client.hasdatapolicy === true && client.haspref === true
        }else if(locationName === "survey"){
            return client && client.hasdatapolicy === true
        }else {
            return true
        }
    }

    const handleUsernameChange = (e, type) => {
        let value
        if(type === 'phone') {
            value = e
        }else{
            value = transliteration(e.target.value)
        }

        setUsername(value)
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value)
    }

    const handleBirthChange = (e) => {
        setBirthDate(e)
        setPassword(moment(e).locale(defaultLocale).format('DDMMYYYY'))
    }

    const checkLicenceMenuStatus = (infoAuth, infoLogin) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'info/hotel',
            token: infoAuth.access_token,
            params: {
                keyval: infoLogin.hotelrefno,
            },
        }).then((infoHotelResponse) => {
            if (!infoHotelResponse.data.data.ischain) {
                updateLicenceMenuStatus(true)
                localStorage.setItem('licenceMenuStatus', 'true')
                return true
            } else {
                updateLicenceMenuStatus(false)
                localStorage.setItem('licenceMenuStatus', 'false')
                return true
            }
        }).catch(() => {
            return false
        })
    }

    const loginOptions = {
        hasemail: GENERAL_SETTINGS.hotelSettings?.hasemail || false,
        hasreserv: GENERAL_SETTINGS.hotelSettings?.hasreserv || false,
        hastel: GENERAL_SETTINGS.hotelSettings?.hastel || false,
        hasroom: GENERAL_SETTINGS.hotelSettings?.hasroom || false,
        haslastname: GENERAL_SETTINGS.hotelSettings?.haslastname || false
    }

    const loginTypeCodeList = {
        room: 'ROOM',
        reservation: 'RESERVATION',
        email: 'EMAIL',
        tel: 'TEL',
        lastname: 'LASTNAME',
    }

    const loginTypeOrderList = {
        room: 1,
        reservation: GENERAL_SETTINGS.hotelSettings?.loginwithci ? -1 : 2,
        email: emailParam && -99 || 3,
        tel: 4,
        lastname: 5,
    }

    const loginComponentTypeList = [
        {
            label: t('str_room') + '#',
            icon: <Room />,
            order: loginTypeOrderList.room,
            isHide: ((!loginOptions.hasroom) || isUserPortalLogin || isEmpPortal) || false,
            loginType: 'roomno',
            loginTypeCode: loginTypeCodeList.room
        },
        {
            label: t('str_reservation') + '#',
            icon: <RoomService />,
            order: loginTypeOrderList.reservation,
            isHide: ((!loginOptions.hasreserv) || isUserPortalLogin || isEmpPortal) || false,
            loginType: 'refcode',
            loginTypeCode: loginTypeCodeList.reservation
        },
        {
            label: t('str_email'),
            icon: <Email />,
            order: loginTypeOrderList.email,
            isHide: (!loginOptions.hasemail) || false,
            loginType: 'email',
            loginTypeCode: loginTypeCodeList.email
        },
        {
            label: t('str_phone'),
            icon: <Phone />,
            order: loginTypeOrderList.tel,
            isHide: (!loginOptions.hastel) || isUserPortalLogin || isEmpPortal || false,
            loginType: 'mobile',
            loginTypeCode: loginTypeCodeList.tel
        },
        {
            label: t('str_lastName'),
            icon: <Person />,
            order: loginTypeOrderList.lastname,
            isHide: ((!loginOptions.haslastname) || isUserPortalLogin || isEmpPortal) || false,
            loginType: 'refcode',
            loginTypeCode: loginTypeCodeList.lastname
        }
    ]

    const [loginTypeSelect, setLoginTypeSelect] = useState(emailParam && 'email' || loginComponentTypeList.sort((a, b) => a.order - b.order).filter(item => !item.isHide)[0]?.loginType || false)

    if(!loginTypeSelect){
        return (
            <Alert variant="outlined" severity="warning">
                {t('str_validLoginTypeDoesNotExist')}
            </Alert>
        )
    }

    const doAuthLogin = (authData) => {
        return AuthLogin({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            data: authData,
        }).then((authLoginResponse) => {
            if (authLoginResponse?.data) {
                return authLoginResponse
            } else {
                return authLoginResponse
            }
        }).catch((error) => {
            return error
        })
    }

    const authStatusAllowed = (statusCode) => {
        return statusCode === 200
    }

    const showAuthRelatedErrorMessage = (infoAuth) => {
        if (infoAuth.status === 400) {
            setIsLoggingIn(false)
            enqueueSnackbar('Username or Password Wrong!', { variant: 'error' })
        } else if (infoAuth.status === 403) {
            setIsLoggingIn(false)
            enqueueSnackbar('You blocked! Try again in ' + infoAuth.data.blockdurationmin + ' minute(s)', { variant: 'error' })
        } else if (infoAuth.status === 500) {
            setIsLoggingIn(false)
            enqueueSnackbar(t('str_checkCredentials'), { variant: 'error' })
        } else if (infoAuth.status === 0) {
            setIsLoggingIn(false)
            enqueueSnackbar('No internet connection!', { variant: 'error' })
        } else {
            setIsLoggingIn(false)
            enqueueSnackbar('Login Error!', { variant: 'error' })
        }
    }

    const useLoginInfo = (infoAuth, hotelRefNo) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'info/login',
            token: infoAuth.data.access_token,
            params: {
                hotelrefno: hotelRefNo,
            }
        }).then((infoLoginResponse) => {
            if (infoLoginResponse?.data?.data) {
                return infoLoginResponse.data.data
            } else {
                return false
            }
        }).catch(() => {
            return false
        })
    }

    const useClientLoginId = ({ infoAuth, refCode, birthDate, hotelRefNo }) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'client/loginid',
            method: 'PUT',
            token: infoAuth.data.access_token,
            params: {
                refcode: refCode,
                birthdate: birthDate,
                hotelrefno: hotelRefNo,
            },
        }).then((clientLoginIdResponse) => {
            return clientLoginIdResponse.status === 200 && clientLoginIdResponse?.data?.data
        }).catch(() => {
            return false
        })
    }

    const useReservatClientList = ({ infoAuth, reservNo }) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'reservat/client/list',
            token: infoAuth.data.access_token,
            params: {
                field: 'reservno',
                text: reservNo,
                sort: 'paxno',
                allhotels: true
            }
        }).then((reservatClientListResponse) => {
            return reservatClientListResponse.status === 200 && reservatClientListResponse?.data?.data.length > 1 && reservatClientListResponse?.data?.data
        }).catch(() => {
            return false
        })
    }

    const getLoginTypeInfo = () => {
        return loginComponentTypeList.sort((a, b) => a.order - b.order).filter(item => !item.isHide)[tabValue]
    }

    const useAuthData = () => {
        let authData = {
            grant_type: 'password',
            client_id: 'orestClient',
            client_secret: 'top_secret',
            username: username,
            password: password,
            hotelrefno: GENERAL_SETTINGS.useHotelRefno,
        }

        if (state.changeHotelRefno) {
            authData.hotelrefno = state.changeHotelRefno
        }

        if (loginTypeSelect !== 'email') {
            authData.logintype = loginTypeSelect
        }

        if (loginTypeSelect === 'mobile') {
            authData.username = mobileTelNoFormat(authData.username)
        }

        if (isOnlyEmail) {
            delete authData.logintype
        }

        return authData
    }

    const handleClickLogin = async () => {
        setIsLoggingIn(true)
        setHotelRefNoIsInitializing(true)

        const authData = useAuthData()
        const infoAuth = await doAuthLogin(authData)
        setAuthInfo(infoAuth.data)

        if (!authStatusAllowed(infoAuth.status)) {
            showAuthRelatedErrorMessage(infoAuth.status)
            return false
        }

        const infoLogin = await useLoginInfo(infoAuth, authData.hotelrefno)
        setLoginInfo(infoLogin)

        if (getLoginTypeInfo().loginTypeCode === loginTypeCodeList.lastname) {
            const infoClientLoginId = await useClientLoginId({
                infoAuth: infoAuth,
                refCode: authData.username,
                birthDate: moment(birthDate).locale(defaultLocale).format('YYYY-MM-DD'),
                hotelRefNo: authData.hotelrefno,
            })

            if (infoClientLoginId.ismulti && infoClientLoginId.reservno) {
                const infoReservatClientList = await useReservatClientList({
                    infoAuth: infoAuth,
                    reservNo: infoClientLoginId.reservno,
                })

                if (infoReservatClientList) {
                    setUseGuestSelection({ isVisible: true, data: infoReservatClientList })
                    return true
                }
            }
        }

        setOrestState(['isLoginWithOtherGuest'], false)
        setIsLoggingIn(false)
        if (locationName === 'guest' && !allowedRoles.includes(infoLogin.roletype)) {
            enqueueSnackbar(t('str_yourLoggedInUserRoleIsInvalid'), { variant: 'warning' })
            return true
        }

        if (!state.profile.loadGuest) {
            setToState('guest', ['profile', 'loadGuest'], true)
        }

        if (rememberMe) {
            localStorage.setItem(LOCAL_STORAGE_REMEMBER_ME, rememberMe.toString())
            localStorage.setItem(LOCAL_STORAGE_EMAIL, username)
        } else {
            localStorage.setItem(LOCAL_STORAGE_REMEMBER_ME, rememberMe.toString())
            localStorage.removeItem(LOCAL_STORAGE_EMAIL)
        }

        if (!isKiosk && !handleCheckPrv(infoLogin) && infoLogin.authorities.find(item => item.authority === 'CLIENT')) {
            setIsPrevControl(true)
        } else {
            await getClientInfoLoader(infoAuth.data, infoLogin)
            await checkLicenceMenuStatus(infoAuth.data, infoLogin)
        }

        if (isCloudWikiLogin) {
            setWikiLoginDialog(false)
        }
    }

    const getClientInfoLoader = async (authInfo, loginInfo, otherGuestResname) => {
        const auth = authInfo || getAuthInfo
        const loginfo = loginInfo || getLoginInfo
        const allLogInfo = { auth, loginfo, otherGuestResname }

        localStorage.setItem(LOCAL_STORAGE_OREST_HOTELREFNO_TEXT, loginfo.hotelrefno)
        localStorage.setItem(LOCAL_STORAGE_OREST_HOTELNAME_TEXT, loginfo.hotelname)
        localStorage.setItem(LOCAL_STORAGE_OREST_TOKEN_TEXT, auth && loginfo && `{"auth": ${JSON.stringify(auth)},"loginfo": ${JSON.stringify(loginfo)} ${otherGuestResname ? `,"otherGuestResname": ${JSON.stringify(otherGuestResname)}}` : '}'}` || null)

        await UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'tools/file/find',
            token: auth.access_token,
            params: {
                code: LOCAL_STORAGE_WEBCMS_COLUMNS_SETTINGS,
                masterid: loginfo.mid,
                contentype: CONTENTYPE.JSON,
            },
        }).then((toolsFileFindResponse) => {
            let useFileData = toolsFileFindResponse?.data?.data?.filedata || false
            if (toolsFileFindResponse.status === 200 && useFileData) {
                useFileData = JSON.parse(Buffer.from(useFileData, 'base64').toString('utf-8'))
                localStorage.setItem(LOCAL_STORAGE_WEBCMS_COLUMNS_SETTINGS, JSON.stringify(useFileData))
            }
        })

        setHotelRefNoIsInitializing(false)
        setHotelName(loginfo.hotelname)
        setHotelRefNo(loginfo.hotelrefno)

        if (loginfo.roletype === '6500310' && loginfo?.accgid) {
            await UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: 'client/view/get',
                token: auth.access_token,
                params: {
                    gid: loginfo.accgid,
                    chkselfish: false,
                    allhotels: true,
                },
            }).then((clientGetResponse) => {
                if (clientGetResponse.status === 200 && clientGetResponse?.data?.data) {
                    const clientGetResponseData = clientGetResponse.data.data
                    setOrestState(['client'], objectTransliterate(clientGetResponseData, ['firstname', 'lastname', 'address1', 'note']))
                }
            })

            await UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: 'client/reservno',
                token: auth.access_token,
                params: {
                    clientid: loginfo.accid,
                    isgapp: true,
                },
            }).then((clientReservnoResponse) => {
                if (clientReservnoResponse?.data?.data) {
                    if (!GENERAL_SETTINGS.ISPORTAL) {
                        updateState('guest', 'changeHotelRefno', clientReservnoResponse.data.data.hotelrefno)
                        updateState('guest', 'changeHotelName', clientReservnoResponse.data.data.hotelname)
                    }
                    updateState('guest', 'clientReservation', clientReservnoResponse.data.data)
                    updateState('guest', 'totalPax', clientReservnoResponse.data.data.totalpax || 1)
                    updateState('guest', 'totalChd', clientReservnoResponse.data.data.totalchd || 0)
                } else {
                    updateState('guest', 'clientReservation', null)
                }
            }).catch(() => {
                updateState('guest', 'clientReservation', null)
            })
        }

        setOrestUserInfo(allLogInfo)
        enqueueSnackbar(t('str_loggedIn'), { variant: 'success' })

        if (redirectUrl) {
            if (redirectUrl.includes('/hup')) {
                window.location.href = urlFixer(GENERAL_SETTINGS.BASE_URL, redirectUrl, loginfo.langshort)
            } else {
                if (refUrlParam) {
                    let refUrlDec = decodeURIComponent(refUrlParam)
                    if (refUrlParam.includes('eventlocid')) {
                        Router.push(urlFixer(GENERAL_SETTINGS.BASE_URL, refUrlDec, loginfo.langshort))
                    } else {
                        if (!refUrlDec.includes('?lang')) {
                            if (refUrlDec.includes('&')) {
                                Router.push(urlFixer(GENERAL_SETTINGS.BASE_URL, refUrlDec, loginfo.langshort))
                            } else {
                                Router.push(urlFixer(GENERAL_SETTINGS.BASE_URL, refUrlDec, loginfo.langshort))
                            }
                        } else {
                            Router.push(refUrlDec)
                        }
                    }
                } else {
                    Router.push(urlFixer(GENERAL_SETTINGS.BASE_URL, redirectUrl, loginfo.langshort))
                }
            }
        }
    }

    const handleKeyLogin = async (event) => {
        if (event.keyCode === 13) {
            await handleClickLogin()
            event.preventDefault()
        }
    }

    if (isOnlyEmail) {
        return (
            <Grid container className={classes.gridContainer} spacing={2}>
                <Grid item xs={12} className={classes.gridItem}>
                    <TextField
                        disabled={isLoggingIn}
                        variant='filled'
                        required
                        fullWidth
                        id='username'
                        name='username'
                        label={t('str_email')}
                        value={username}
                        onChange={handleUsernameChange}
                    />
                </Grid>
                <Grid item xs={12} className={classes.gridItem}>
                    <TextField
                        disabled={isLoggingIn}
                        onKeyDown={(e) => handleKeyLogin(e)}
                        variant='filled'
                        required
                        fullWidth
                        id='userpassword'
                        name='userpassword'
                        type='password'
                        label={t('str_password')}
                        value={password}
                        onChange={handlePasswordChange}
                    />
                </Grid>
                <Grid item xs={12} className={classes.gridItem}>
                    <div className={classes.wrapper}>
                        <Button
                            onClick={handleClickLogin}
                            disabled={isLoggingIn}
                            fullWidth
                            variant='contained'
                            color='primary'
                            size='large'
                            disableElevation
                        >
                            {t('str_login')}
                            {isLoggingIn && <CircularProgress size={24} className={classes.buttonProgress} />}
                        </Button>
                    </div>
                </Grid>
            </Grid>
        )
    }

    const getTabIndex = (newValue) => {
        let getIndex = loginComponentTypeList.filter(item => !item.isHide)
        return getIndex[newValue]?.order || loginComponentTypeList[0].order
    }

    const handleChangeTab = (event, newValue) => {
        const getIndex = getTabIndex(newValue)
        if (getIndex === loginTypeOrderList.email) {
            setIsEmail(true)
            setIsPhoneNumber(false)
        } else if (getIndex === loginTypeOrderList.tel) {
            setIsEmail(false)
            setIsPhoneNumber(true)
        } else {
            setIsEmail(false)
            setIsPhoneNumber(false)
        }

        const getLoginType = loginComponentTypeList.filter(item => item.order === getIndex)[0]?.loginType || false
        setLoginTypeSelect(getLoginType)
        setTabValue(newValue)
    }

    const renderLoginComponent = (loginTypeCode) => {
        switch (loginTypeCode) {
            case loginTypeCodeList.room:
                return (
                    <TextField
                        disabled={isLoggingIn}
                        className={clsx('', {
                            [classes.textFieldUserPortal]: isUserPortalLogin || isEmpPortal,
                            [classes.textFieldDestinationPortal]: isLoginWrapper,
                        })}
                        variant={!isUserPortalLogin && !isLoginWrapper && !isEmpPortal ? 'filled' : 'outlined'}
                        required
                        fullWidth
                        id='username'
                        name='username'
                        label={t('str_roomNo')}
                        value={username}
                        onKeyUp={handleUsernameChange}
                        onKeyDown={handleUsernameChange}
                        onChange={handleUsernameChange}
                    />
                )
            case loginTypeCodeList.reservation:
                return (
                    <TextField
                        disabled={isLoggingIn}
                        className={clsx('', {
                            [classes.textFieldUserPortal]: isUserPortalLogin || isEmpPortal,
                            [classes.textFieldDestinationPortal]: isLoginWrapper,
                        })}
                        color={'primary'}
                        variant={!isUserPortalLogin && !isLoginWrapper && !isEmpPortal ? 'filled' : 'outlined'}
                        required
                        fullWidth
                        id='username'
                        name='username'
                        label={t('str_resNo')}
                        value={username}
                        onKeyUp={handleUsernameChange}
                        onKeyDown={handleUsernameChange}
                        onChange={handleUsernameChange}
                    />
                )
            case loginTypeCodeList.email:
                return (
                    <TextField
                        disabled={isLoggingIn}
                        className={clsx('', {
                            [classes.textFieldUserPortal]: isUserPortalLogin || isEmpPortal,
                            [classes.textFieldDestinationPortal]: isLoginWrapper,
                        })}
                        color={'primary'}
                        variant={!isUserPortalLogin && !isLoginWrapper && !isEmpPortal ? 'filled' : 'outlined'}
                        required
                        fullWidth
                        id='username'
                        name='username'
                        label={t('str_email')}
                        value={username}
                        onKeyUp={handleUsernameChange}
                        onKeyDown={handleUsernameChange}
                        onChange={handleUsernameChange}
                    />
                )
            case loginTypeCodeList.tel:
                return (
                    <PhoneInput
                        disabled={isLoggingIn}
                        className={clsx('', {
                            [classes.textFieldUserPortal]: isUserPortalLogin,
                            [classes.textFieldDestinationPortal]: isLoginWrapper,
                        })}
                        defaultCountry={locale === 'en' ? 'us' : locale}
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
                        variant={!isUserPortalLogin && !isLoginWrapper && !isEmpPortal ? 'filled' : 'outlined'}
                        id='username'
                        name='username'
                        label={t('str_phone')}
                        fullWidth
                        value={username}
                        onChange={e => handleUsernameChange(e, 'phone')}
                    />
                )
            case loginTypeCodeList.lastname:
                return (
                    <TextField
                        disabled={isLoggingIn}
                        className={clsx('', {
                            [classes.textFieldUserPortal]: isUserPortalLogin || isEmpPortal,
                            [classes.textFieldDestinationPortal]: isLoginWrapper,
                        })}
                        color={'primary'}
                        variant={!isUserPortalLogin && !isLoginWrapper && !isEmpPortal ? 'filled' : 'outlined'}
                        required
                        fullWidth
                        id='lastname'
                        name='lastname'
                        label={t('str_lastName')}
                        value={username}
                        onKeyUp={handleUsernameChange}
                        onKeyDown={handleUsernameChange}
                        onChange={handleUsernameChange}
                    />
                )
        }

    }

    return (
        <Grid container className={classes.gridContainer} spacing={2}>
            <Grid item xs={12} className={classes.gridItem}>
                {(isPrevControl && getAuthInfo && locationName) ? (
                    <Update
                        open={isPrevControl}
                        auth={getAuthInfo}
                        logInfo={getLoginInfo}
                        locationName={locationName}
                        onCallback={(auth, loginInfo) => getClientInfoLoader(auth, loginInfo, false)}
                    />
                ) : null}
                {useGuestSelection.isVisible ? (
                    <GuestSelection
                        open={useGuestSelection.isVisible}
                        isLoading={useGuestSelection.isLoading}
                        data={useGuestSelection.data || []}
                        auth={getAuthInfo}
                        logInfo={getLoginInfo}
                        onLoginCallback={(auth, loginInfo, otherGuestResname) => getClientInfoLoader(auth, loginInfo, otherGuestResname)}
                    />
                ): null}
                <Tabs
                    classes={{
                        root: isUserPortalLogin || isEmpPortal  ? classes.tabsRootUserPortal : "",
                        indicator: isUserPortalLogin || isEmpPortal ?  classes.tabsIndicatorUserPortal: classes.tabsIndicator
                    }}
                    variant={isUserPortalLogin || isEmpPortal ? "standard" : "fullWidth"}
                    value={tabValue}
                    onChange={handleChangeTab}
                    indicatorColor="primary"
                    textColor="primary"
                >
                    {loginComponentTypeList.sort((a, b) => a.order - b.order).filter(item => !item.isHide).map((loginCompenent, index)=> {
                        return (
                            <Tab key={index} className={classes.loginTab} label={loginCompenent.label} icon={loginCompenent.icon} {...a11yProps(index)}/>
                        )
                    })}
                </Tabs>
                {loginComponentTypeList.sort((a, b) => a.order - b.order).filter(item => !item.isHide).map((loginCompenent, index)=> {
                    return  (
                        <TabPanel value={tabValue} index={index} key={index}>
                            {isUserPortalLogin || isLoginWrapper || isEmpPortal ? <div style={{ paddingTop: '16px' }} /> : null}
                            {renderLoginComponent(loginCompenent.loginTypeCode)}
                        </TabPanel>
                    )
                })}
            </Grid>
            <Grid item xs={12} className={classes.gridItem}>
                {(getTabIndex(tabValue) === loginTypeOrderList.email) && (
                    <TextField
                        disabled={isLoggingIn}
                        className={clsx("", {
                            [classes.textFieldUserPortal]: isUserPortalLogin || isEmpPortal,
                            [classes.textFieldDestinationPortal]: isLoginWrapper,
                        })}
                        variant={!isUserPortalLogin && !isLoginWrapper && !isEmpPortal ? "filled" : "outlined"}
                        required
                        fullWidth
                        id="password"
                        name="password"
                        type="password"
                        label={t('str_password')}
                        value={password}
                        inputProps={{
                            autoComplete: 'new-password',
                        }}
                        onKeyDown={(e) => handleKeyLogin(e)}
                        onChange={handlePasswordChange}
                    />
                )}
                {(getTabIndex(tabValue) === loginTypeOrderList.room || getTabIndex(tabValue) === loginTypeOrderList.reservation || getTabIndex(tabValue) === loginTypeOrderList.tel || getTabIndex(tabValue) === loginTypeOrderList.lastname) && (
                    <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                        {isKiosk ? (
                            <MobileDatePicker
                                allowKeyboardControl
                                disabled={isLoggingIn}
                                autoOk
                                id="birthdate"
                                name="birthdate"
                                label={((getTabIndex(tabValue) === loginTypeOrderList.reservation || getTabIndex(tabValue) === loginTypeOrderList.lastname) && GENERAL_SETTINGS.hotelSettings?.loginwithci) ? t('str_checkinDate') : t('str_birthDate')}
                                inputFormat="DD/MM/YYYY"
                                disableFuture={(!((getTabIndex(tabValue) === loginTypeOrderList.reservation || getTabIndex(tabValue) === loginTypeOrderList.room || getTabIndex(tabValue) === loginTypeOrderList.lastname) && GENERAL_SETTINGS.hotelSettings?.loginwithci))}
                                openTo={(((getTabIndex(tabValue) === loginTypeOrderList.reservation || getTabIndex(tabValue) === loginTypeOrderList.room || getTabIndex(tabValue) === loginTypeOrderList.lastname) && GENERAL_SETTINGS.hotelSettings?.loginwithci)) || birthDate ? 'date' : 'year'}
                                views={(((getTabIndex(tabValue) === loginTypeOrderList.reservation || getTabIndex(tabValue) === loginTypeOrderList.room || getTabIndex(tabValue) === loginTypeOrderList.lastname) && GENERAL_SETTINGS.hotelSettings?.loginwithci)) ? ['date'] : ['year', 'month', 'date']}
                                value={birthDate}
                                onChange={(date) => handleBirthChange(date)}
                                renderInput={(props) => {
                                    return (
                                        <TextField
                                            {...props}
                                            className={clsx("", {
                                                [classes.textFieldUserPortal]: isUserPortalLogin || isEmpPortal,
                                                [classes.textFieldDestinationPortal]: isLoginWrapper,
                                            })}
                                            required
                                            fullWidth
                                            variant={!isUserPortalLogin && !isLoginWrapper && !isEmpPortal ? "filled" : "outlined"}
                                            helperText={'dd.mm.yyyy'}
                                        />
                                    )
                                }}
                            />
                        ): (
                            <DatePicker
                                allowKeyboardControl
                                disabled={isLoggingIn}
                                autoOk
                                id="birthdate"
                                name="birthdate"
                                label={(((getTabIndex(tabValue) === loginTypeOrderList.reservation || getTabIndex(tabValue) === loginTypeOrderList.room || getTabIndex(tabValue) === loginTypeOrderList.lastname) && GENERAL_SETTINGS.hotelSettings?.loginwithci)) ? t('str_checkinDate') : t('str_birthDate')}
                                inputFormat="DD/MM/YYYY"
                                disableFuture={((!((getTabIndex(tabValue) === loginTypeOrderList.reservation || getTabIndex(tabValue) === loginTypeOrderList.room || getTabIndex(tabValue) === loginTypeOrderList.lastname) && GENERAL_SETTINGS.hotelSettings?.loginwithci)))}
                                openTo={(((getTabIndex(tabValue) === loginTypeOrderList.reservation || getTabIndex(tabValue) === loginTypeOrderList.room || getTabIndex(tabValue) === loginTypeOrderList.lastname) && GENERAL_SETTINGS.hotelSettings?.loginwithci)) || birthDate ? 'date' : 'year'}
                                views={(((getTabIndex(tabValue) === loginTypeOrderList.reservation || getTabIndex(tabValue) === loginTypeOrderList.room || getTabIndex(tabValue) === loginTypeOrderList.lastname) && GENERAL_SETTINGS.hotelSettings?.loginwithci)) ? ['date'] : ['year', 'month', 'date']}
                                value={birthDate}
                                onChange={(date) => handleBirthChange(date)}
                                renderInput={(props) => {
                                    return (
                                        <TextField
                                            {...props}
                                            required
                                            className={clsx("", {
                                                [classes.textFieldUserPortal]: isUserPortalLogin || isEmpPortal,
                                                [classes.textFieldDestinationPortal]: isLoginWrapper,
                                            })}
                                            fullWidth
                                            variant={!isUserPortalLogin && !isLoginWrapper && !isEmpPortal? "filled" : "outlined"}
                                            helperText={'dd.mm.yyyy'}
                                        />
                                    )
                                }}
                            />
                        )}
                    </LocalizationProvider>
                )}
            </Grid>
            {isUserPortalLogin || isLoginWrapper || isEmpPortal ? (
                    <Grid item xs={12}>
                        <div style={{textAlign:"left"}}>
                            <FormControlLabel
                                className={classes.formControlLabel}
                                checked={rememberMe}
                                onChange={(e) => handleOnChangeCheckBox(e)}
                                control={
                                    <Checkbox
                                        className={clsx("", {
                                            [classes.checkboxUserPortal]: isUserPortalLogin || isEmpPortal,
                                            [classes.checkboxDestinationPortal]: isLoginWrapper
                                        })}
                                        color={"primary"}
                                    />
                                }
                                label={
                                    <Typography
                                        className={clsx("", {
                                            [classes.checkboxLabel]: isUserPortalLogin || isEmpPortal,
                                            [classes.checkboxLabelDestinationPortal]: isLoginWrapper}
                                        )}
                                        color={"primary"}
                                    >
                                        {t("str_rememberMe")}
                                    </Typography>
                                }
                            />
                        </div>
                    </Grid>
                ) : null
            }
            <Grid item xs={12} className={classes.gridItem}>
                <div className={classes.wrapper}>
                    <Button
                        className={clsx(classes.loginButton, {
                            [classes.loginButtonUserPortal]: isUserPortalLogin || isEmpPortal,
                        })}
                        onClick={handleClickLogin}
                        disabled={isLoggingIn}
                        fullWidth
                        variant="contained"
                        color="primary"
                        size={isUserPortalLogin ? "medium" : "large"}
                        disableElevation
                    >
                        {t('str_login')}
                    </Button>
                    {isLoggingIn && <CircularProgress size={24} className={classes.buttonProgress} />}
                </div>
            </Grid>
        </Grid>
    )
}

LoginComponent.propTypes = {
    redirectUrl: PropTypes.string,
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    resetState: () => dispatch(resetState()),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(LoginComponent)