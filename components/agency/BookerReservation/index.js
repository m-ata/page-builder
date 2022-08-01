import axios from 'axios'
import React, { useEffect, useState, useContext, memo } from 'react'
import { withStyles, makeStyles } from '@material-ui/core/styles'
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Box,
    Grid,
    TextField,
    Stepper,
    Step,
    StepLabel,
    Typography,
    Paper,
    OutlinedInput,
    InputAdornment,
    FormControl,
    Card,
    CardContent,
    Tooltip,
    MenuItem
} from '@material-ui/core'
import {
    Autocomplete,
    Alert,
    AlertTitle
} from '@material-ui/lab'
import {
    Close,
    Refresh,
    Loop,
    FileCopy,
    CheckCircleOutline
} from '@material-ui/icons'
import {
    DatePicker,
    LocalizationProvider
} from '@material-ui/pickers'
import moment from 'moment'
import MomentAdapter from '@date-io/moment'
import { Insert, Update, ViewList, UseOrest, List, Patch } from '@webcms/orest'
import {
    emailValidation,
    formatMoney,
    OREST_ENDPOINT, PAYMENTTYPES,
    REQUEST_METHOD_CONST,
    useOrestQuery,
} from 'model/orest/constants'
import WebCmsGlobal from 'components/webcms-global'
import getSymbolFromCurrency from 'model/currency-symbol'
import SpinEdit from '@webcms-ui/core/spin-edit'
import PaymentForm from 'components/payment/credit-card/form'
import LoadingSpinner from 'components/LoadingSpinner'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { useSelector } from 'react-redux'
import { useSnackbar } from 'notistack'
import { useOrestAction } from 'model/orest'
import { required } from 'state/utils/form'
import ThreeDPayDialog from 'components/payment/ThreeDPayDialog'
import ReservationDatePickerWithNight from './ReservationDatePickerWithNight'
import TrackedChangesDialog from 'components/TrackedChangesDialog'

function range(start, end, step) {
    let range = []
        , typeofStart = typeof start
        , typeofEnd = typeof end

    if (step === 0) {
        throw TypeError('Step cannot be zero.')
    }

    if (typeofStart === 'undefined' || typeofEnd === 'undefined') {
        throw TypeError('Must pass start and end arguments.')
    } else if (typeofStart !== typeofEnd) {
        throw TypeError('Start and end arguments must be of same type.')
    }

    typeof step == 'undefined' && (step = 1)
    if (end < start) {
        step = -step
    }

    if (typeofStart === 'number') {
        while (step > 0 ? end >= start : end <= start) {
            range.push(start)
            start += step
        }
    } else if (typeofStart === 'string') {
        if (start.length !== 1 || end.length !== 1) {
            throw TypeError('Only strings with one character are supported.')
        }
        start = start.charCodeAt(0)
        end = end.charCodeAt(0)
        while (step > 0 ? end >= start : end <= start) {
            range.push(String.fromCharCode(start))
            start += step
        }
    } else {
        throw TypeError('Only string and number types are supported')
    }

    return range
}

const NON_ALPHANUM = /[^a-zA-Z0-9]/g,
    EVERY_FOUR_CHARS =/(.{4})(?!$)/g;

const electronicFormat = (iban) => {
    return iban.replace(NON_ALPHANUM, '').toUpperCase();
}

const ibanPrintFormat = (iban, separator) => {
    if (typeof separator == 'undefined') {
        separator = ' '
    }
    return electronicFormat(iban).replace(EVERY_FOUR_CHARS, '$1' + separator)
}

const roomTypeListFilter = (roomTypeList) => {
    if (roomTypeList && roomTypeList.length > 0) {
        return roomTypeList.filter(roomType => roomType.totalroom > 0)
    } else {
        return []
    }
}

const MuiDialogTitle = withStyles((theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(2),
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
}))((props) => {
    const { children, classes, onClose, disabled, ...other } = props
    return (
        <DialogTitle disableTypography className={classes.root} {...other}>
            <Typography variant='h6'>{children}</Typography>
            {onClose ? (
                <IconButton disabled={disabled} aria-label='close' className={classes.closeButton} onClick={onClose}>
                    <Close />
                </IconButton>
            ) : null}
        </DialogTitle>
    )
})

const MuiDialogContent = withStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
}))(DialogContent)

const MuiDialogActions = withStyles((theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(1),
    },
}))(DialogActions)

const makePaymentTypes = (paymentTypes) => {
    let useTransferPay = false
    const getPaymentTypes = paymentTypes.map((paymentType) => {
        if (paymentType.isccpay && paymentType.iscredit) {
            return {
                id: paymentType.id,
                description: 'str_payByCreditDebitCard',
                index: 1,
                isdef: paymentType.isdef,
                isccpay: true,
                iscash: false,
            }
        } else if (paymentType.iscash) {
            return {
                id: paymentType.id,
                description: 'str_payAtTheHotel',
                index: 2,
                isdef: paymentType.isdef,
                isccpay: false,
                iscash: true,
            }
        }else if(paymentType.istransfer){
            useTransferPay = true
            return {
                id: paymentType.id,
                description: 'str_payByWireTransfer',
                index: 3,
                isdef: paymentType.isdef,
                isccpay: false,
                iscash: false,
                istransfer: true,
                ismailorder: false
            }
        } else {
            return null
        }
    }).filter(payType => payType !== null)

    return {
        useTransferPay: useTransferPay,
        paymentTypes: getPaymentTypes
    }
}

const useStyles = makeStyles(() => ({
    quickResDialogPaper: {
      minWidth: 670
    },
    textFieldRoot: {
        '& > div.MuiAutocomplete-inputRoot[class*=\'MuiOutlinedInput-root\']': {
            padding: '5px!important',
            paddingRight: '9px!important',
            '& button': {
                order: '3!important',
            },
            '& > div.MuiAutocomplete-endAdornment': {
                position: 'relative!important',
                order: '2!important',
            },
            '& .Mui-disabled': {
                padding: '3px!important',
            }
        },
    },
    fieldsetLabel: {
        marginTop: -34,
        zIndex: 9,
        position: 'absolute',
        fontSize: 12,
        background: '#ffffff',
        paddingLeft: 4,
        paddingRight: 4,
    },
    fieldsetContent: {
        paddingTop: 24
    },
    thankYouRoot: {
        marginTop: 16,
        padding: '20px 10px 20px 10px',
        background: '#ffffff',
    },
    thankYouIcon: {
        display: 'block',
        color: '#4CAF50',
        fontSize: 60,
        margin: '0 auto',
        marginBottom: 20
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

function getSteps(agencyInfo, reservationInfo, isUpdate) {
    const { t } = useTranslation()
    if (Number(reservationInfo?.totalPax) > 1 || Number(reservationInfo?.totalChd) > 0 || Number(reservationInfo?.totalBaby) > 0) {
        if (agencyInfo?.paytype === PAYMENTTYPES.PREPAYMENT) {
            if(isUpdate){
                return [t('str_reservationInfo'), t('str_reservationNames'), t('str_changeReason'), t('str_paymentOptions'), t('str_confirm')]
            }else{
                return [t('str_reservationInfo'), t('str_reservationNames'), t('str_paymentOptions'), t('str_confirm')]
            }
        } else {
            if(isUpdate){
                return [t('str_reservationInfo'), t('str_reservationNames'), t('str_changeReason'), t('str_confirm')]
            }else{
                return [t('str_reservationInfo'), t('str_reservationNames'), t('str_confirm')]
            }
        }
    }

    if (agencyInfo?.paytype === PAYMENTTYPES.PREPAYMENT) {
        if(isUpdate){
            return [t('str_reservationInfo'), t('str_changeReason'), t('str_paymentOptions'), t('str_confirm')]
        }else{
            return [t('str_reservationInfo'), t('str_paymentOptions'), t('str_confirm')]
        }
    } else {
        if(isUpdate){
            return [t('str_reservationInfo'), t('str_changeReason'), t('str_confirm')]
        }else{
            return [t('str_reservationInfo'), t('str_confirm')]
        }
    }
}

function getStepsIndex(agencyInfo, reservationInfo, isUpdate) {
    if (Number(reservationInfo?.totalPax) > 1 || Number(reservationInfo?.totalChd) > 0 || Number(reservationInfo?.totalBaby) > 0) {
        if (agencyInfo?.paytype === PAYMENTTYPES.PREPAYMENT) {
            if (isUpdate) {
                return {
                    reservationInfo: 0,
                    reservationNames: 1,
                    changeReason: 2,
                    paymentOptions: 3,
                    confirm: 4,
                }
            } else {
                return {
                    reservationInfo: 0,
                    reservationNames: 1,
                    changeReason: -2,
                    paymentOptions: 2,
                    confirm: 3,
                }
            }
        } else {
            if (isUpdate) {
                return {
                    reservationInfo: 0,
                    reservationNames: 1,
                    changeReason: 2,
                    paymentOptions: -3,
                    confirm: 3,
                }
            } else {
                return {
                    reservationInfo: 0,
                    reservationNames: 1,
                    changeReason: -2,
                    paymentOptions: -3,
                    confirm: 2,
                }
            }
        }
    }

    if (agencyInfo?.paytype === PAYMENTTYPES.PREPAYMENT) {
        if (isUpdate) {
            return {
                reservationInfo: 0,
                reservationNames: -1,
                changeReason: 1,
                paymentOptions: 2,
                confirm: 3,
            }
        } else {
            return {
                reservationInfo: 0,
                reservationNames: -1,
                changeReason: -2,
                paymentOptions: 1,
                confirm: 2,
            }
        }
    } else {
        if (isUpdate) {
            return {
                reservationInfo: 0,
                reservationNames: -1,
                changeReason: 1,
                paymentOptions: -2,
                confirm: 2,
            }
        } else {
            return {
                reservationInfo: 0,
                reservationNames: -1,
                changeReason: -2,
                paymentOptions: -3,
                confirm: 1,
            }
        }
    }
}

function BookerReservation(props) {
    const { open, isUpdate, reservationGid, onClose } = props
        , classes = useStyles()
        , { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
        , { t } = useTranslation()
        , { deleteOrestCurrentUserInfo } = useOrestAction()
        , { enqueueSnackbar } = useSnackbar()
        , useToken = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false)
        , infoLogin = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
        , [activeStep, setActiveStep] = useState(0)
        , clientBase = useSelector((state) => state?.orest?.state?.client || false)
        , defReservationInfo = {
        firstname: clientBase?.firstname || '',
        lastname: clientBase?.lastname || '',
        dates: [moment(), moment().add(1, 'days')],
        night: 1,
        totalPax: 1,
        totalChd: 0,
        totalBaby: 0,
        roomType: 0,
        country: '',
        note: '',
    }
        , [reservationInfo, setReservationInfo] = useState(defReservationInfo)
        , [otherGuestList, setOtherGuestList] = useState([])
        , [reservationMemoized, setReservationMemoized] = useState({})
        , [resChdListMemoized, setResChdListMemoized] = useState({})
        , [resNameListMemoized, setResNameListMemoized] = useState({})
        , [reservationDef, setReservationDef] = useState({})
        , [resxReasonList, setResxReasonList] = useState(false)
        , defReasonData = {
        id: null,
        note: '',
        error: false,
        exist: false,
    }
        , [reasonData, setReasonData] = useState(defReasonData)
        , [agencyInfo, setAgencyInfo] = useState({})
        , [roomTypeIsLoading, setRoomTypeIsLoading] = useState(false)
        , [priceCalcIsLoading, setPriceCalcIsLoading] = useState(false)
        , [roomTypeList, setRoomTypeList] = useState([])
        , [countryList, setCountryList] = useState([])
        , [paymentTypeList, setPaymentTypeList] = useState([])
        , [usePrice, setUsePrice] = useState({})
        , [childAges, setChildAges] = useState([])
        , [selectPayTypeId, setSelectPayTypeId] = useState(0)
        , [creditCardInfo, setCreditCardInfo] = useState(false)
        , [creditCardIsValid, setCreditCardIsValid] = useState(false)
        , [errorMsg, setErrorMsg] = useState(false)
        , [isSaveError, setIsSaveError] = useState(false)
        , [optionExpired, setOptionExpired] = useState(false)
        , [dialogIsLoading, setDialogIsLoading] = useState(false)
        , [isLoading, setIsLoading] = useState(false)
        , [isPayLoading, setIsPayLoading] = useState(false)
        , [isPayFrameLoad, setIsPayFrameLoad] = useState(false)
        , [redirectUrl, setRedirectUrl] = useState(false)
        , [transactionStatus, setTransactionStatus] = useState(0)
        , [transactionId, setTransactionId] = useState(false)
        , defIsError = {
        firstname: false,
        lastname: false,
        country: false,
        roomtype: false,
        totalprice: false,
    }
        , [isError, setIsError] = useState(defIsError)
        , [bankIbanList, setBankIbanList] = useState(false)
        , [isRefreshRequired, setIsRefreshRequired] = useState(true)
        , [openTrackedDialog, setOpenTrackedDialog] = useState(false)
        , steps = getSteps(agencyInfo, reservationInfo, isUpdate)
        , stepIndex = getStepsIndex(agencyInfo, reservationInfo, isUpdate)

    useEffect(() => {
        if (open) {
            async function loaderQuickReservation() {
                setDialogIsLoading(true)
                setIsLoading(true)

                const agencyInfo = await getAgencyInfo()
                if (agencyInfo) {
                    setAgencyInfo(agencyInfo)
                }

                let useReservationDef = {}
                if(!(Object.keys(reservationDef).length > 0)){
                    useReservationDef = isUpdate ? await getReservat(reservationGid) : await getReservatDef()
                    const otherGuestTotal = (Number(useReservationDef?.totalpax - 1) + Number(useReservationDef?.totalchd1) + Number(useReservationDef?.totalbaby))
                    if (otherGuestTotal > 0) {
                        const resNameList = await getResNameList(useReservationDef.reservno)
                            , resNameData = resNameList.map((resNameInfo, otherGuestIndex) => {
                            return {
                                index: otherGuestIndex,
                                firstname: {
                                    value: resNameInfo.firstname,
                                    iserror: false,
                                },
                                lastname: {
                                    value: resNameInfo.lastname,
                                    iserror: false,
                                },
                                birthdate: {
                                    value: resNameInfo.birthdate,
                                    iserror: false,
                                },
                                email: {
                                    value: resNameInfo.email,
                                    iserror: false,
                                },
                            }
                        })

                        setResNameListMemoized(resNameList)
                        setOtherGuestList(resNameData)
                    }
                    if(isUpdate && useReservationDef && (useReservationDef.totalchd1 + useReservationDef.totalbaby) > 0){
                        const resChdList = await getResChdList(useReservationDef.reservno)
                            , childData = resChdList.map((chdInfo) => {
                            return {
                                chdNo: Number(chdInfo.chdno),
                                chdAge: Number(chdInfo.chdage),
                                chdType: Number(useReservationDef.totalbaby) > 0 ? Number(agencyInfo.babyage) < Number(chdInfo.chdage) ? 'chd': 'baby' : 'chd',
                            }
                        })

                        setResChdListMemoized(resChdList)
                        setChildAges(childData)
                    }
                    setUsePrice({ totalprice: useReservationDef.totalprice })
                    setReservationDef(useReservationDef)
                }

                if(isUpdate && useReservationDef?.optiondate){
                    const today = moment()
                        , optionDate = moment(useReservationDef.optiondate, 'YYYY-MM-DD')
                        , expDays = optionDate.diff(today,'days')

                    if(!(expDays >= 0)){
                        setOptionExpired(true)
                    }
                }

                if(isUpdate){
                    setReservationMemoized(useReservationDef)
                    const resXReason = await getResXReason()
                    setResxReasonList(resXReason)
                }

                let useDefCountry = null
                    , countryList = await getCountry()

                if(countryList){
                    setCountryList(countryList)
                }

                if(!isUpdate && useDefCountry){
                    useDefCountry = countryList.find(countryView => countryView.isdef) || false
                    setReservationInfo({ ...reservationInfo, 'country': useDefCountry || {}})
                }

                const paymentTypeList = await getPaymentType()
                if(paymentTypeList){
                    const usePaymentType = makePaymentTypes(paymentTypeList)
                    if(usePaymentType.useTransferPay){
                        const bankIbanList = await getBankIbanList()
                        setBankIbanList(bankIbanList)
                    }
                    const useDefPaymentType = usePaymentType.paymentTypes.find(payType => payType.isdef) || false
                    setPaymentTypeList(usePaymentType.paymentTypes)
                    if(useDefPaymentType){
                        setSelectPayTypeId(useDefPaymentType.id)
                    }else{
                        if(usePaymentType?.paymentTypes[0]?.id){
                            setSelectPayTypeId(usePaymentType.paymentTypes[0].id)
                        }
                    }
                }

                if(isUpdate){
                    const checkin = moment(useReservationDef.checkin, 'YYYY-MM-DD')
                        , checkout = moment(useReservationDef.checkout, 'YYYY-MM-DD')
                        , night = checkout.diff(checkin, 'days')

                    let roomType = null,
                        country = null
                    if(useReservationDef?.roomtypeid){
                        roomType = await getRoomTypeView(useReservationDef?.roomtypeid)
                    }

                    if(useReservationDef?.rescountryid){
                        country = await getCountryView(useReservationDef?.rescountryid)
                    }

                    setReservationInfo({
                        firstname: useReservationDef?.firstname || '',
                        lastname: useReservationDef?.lastname || '',
                        dates: [checkin, checkout],
                        night: night,
                        totalPax: useReservationDef.totalpax,
                        totalChd: useReservationDef.totalchd1,
                        totalBaby: useReservationDef.totalbaby,
                        roomType: roomType,
                        country: country,
                        note: useReservationDef.note
                    })
                }
            }

            loaderQuickReservation().then(() => {
                setIsLoading(false)
                setDialogIsLoading(false)
            })
        }
    }, [open])

    useEffect(() => {
        window.addEventListener('message', (event) =>
                getRedirectUrlCheckStatus(event, reservationDef.reservno, reservationDef.gid, 'en')
            , false)
    }, [redirectUrl])

    useEffect(() => {
        const otherGuestTotal = (Number(reservationInfo?.totalPax - 1) + Number(reservationInfo?.totalChd) + Number(reservationInfo?.totalBaby))
        if (otherGuestTotal > 0) {
            if(otherGuestTotal > otherGuestList.length){
                const newOtherGuest = otherGuestTotal - otherGuestList.length
                let newOtherGuestIndex = otherGuestList.length
                const genOtherGuestList =
                    Array.from({ length: newOtherGuest }).map(() => {
                        return {
                            index: newOtherGuestIndex++,
                            firstname: {
                                value: '',
                                iserror: false,
                            },
                            lastname: {
                                value: '',
                                iserror: false,
                            },
                            birthdate: {
                                value: '',
                                iserror: false,
                            },
                            email: {
                                value: '',
                                iserror: false,
                            },
                        }
                    })

                setOtherGuestList([...otherGuestList, ...genOtherGuestList])
            }else {
                const newOtherGuest = otherGuestTotal - otherGuestList.length
                setOtherGuestList(otherGuestList.splice(-(newOtherGuest)))
            }
        } else {
            setOtherGuestList([])
        }
    }, [reservationInfo?.totalPax, reservationInfo?.totalChd, reservationInfo?.totalBaby])

    const getReservatDef = () => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'reservat/def',
            token: useToken,
            params: {
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO
            },
        }).then(reservatDefResponse => {
            if (reservatDefResponse.status === 200) {
                if (reservatDefResponse?.data?.data) {
                    return reservatDefResponse.data.data
                } else {
                    return false
                }
            } else if (reservatDefResponse.status === 401) {
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                deleteOrestCurrentUserInfo()
                return false
            }
        })
    }
    , getReservat = (gid) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'reservat/get',
            token: useToken,
            params: {
                gid: gid,
                allhotels: true
            },
        }).then(reservatGetResponse => {
            if (reservatGetResponse.status === 200) {
                if (reservatGetResponse?.data?.data) {
                    return reservatGetResponse.data.data
                } else {
                    return false
                }
            } else if (reservatGetResponse.status === 401) {
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                deleteOrestCurrentUserInfo()
                return false
            }
        })
    }
    , getResNameList = (reservno) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'resname/list',
            token: useToken,
            params: {
                field: 'reservno',
                text: reservno,
            },
        }).then(resNameListResponse => {
            if (resNameListResponse.status === 200) {
                if (resNameListResponse?.data?.data) {
                    return resNameListResponse.data.data
                } else {
                    return false
                }
            } else if (resNameListResponse.status === 401) {
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                deleteOrestCurrentUserInfo()
                return false
            }
        })
    }
    , getResChdList = (reservno) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'reschd/list',
            token: useToken,
            params: {
                field: 'reservno',
                text: reservno,
            },
        }).then(resChdListResponse => {
            if (resChdListResponse.status === 200) {
                if (resChdListResponse?.data?.data) {
                    return resChdListResponse.data.data
                } else {
                    return false
                }
            } else if (resChdListResponse.status === 401) {
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                deleteOrestCurrentUserInfo()
                return false
            }
        })
    }
    , getRoomTypeView = (id) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'roomtype/view/getbyid',
            token: useToken,
            params: {
                key: id
            },
        }).then(roomTypeViewResponse => {
            if (roomTypeViewResponse.status === 200) {
                if (roomTypeViewResponse?.data?.data) {
                    return roomTypeViewResponse.data.data
                } else {
                    return false
                }
            } else if (roomTypeViewResponse.status === 401) {
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                deleteOrestCurrentUserInfo()
                return false
            }
        })
    }
    , getCountryView = (id) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'country/view/getbyid',
            token: useToken,
            params: {
                key: id
            },
        }).then(countryViewResponse => {
            if (countryViewResponse.status === 200) {
                if (countryViewResponse?.data?.data) {
                    return countryViewResponse.data.data
                } else {
                    return false
                }
            } else if (countryViewResponse.status === 401) {
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                deleteOrestCurrentUserInfo()
                return false
            }
        })
    }
    , getAgencyInfo = () => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'agency/view/getbyid',
            token: useToken,
            params: {
                key: infoLogin.accid,
            },
        }).then(agencyViewGetByIdResponse => {
            if (agencyViewGetByIdResponse.status === 200) {
                if (agencyViewGetByIdResponse?.data?.data) {
                    return agencyViewGetByIdResponse.data.data
                } else {
                    return false
                }
            } else if (agencyViewGetByIdResponse.status === 401) {
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                deleteOrestCurrentUserInfo()
                return false
            }
        })
    }
    , getCountry = () => {
        return ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.COUNTRY,
            token: useToken,
            params: {
                query: useOrestQuery({
                    isactive: true,
                })
            },
        }).then(countryViewListResponse => {
            if (countryViewListResponse.status === 200) {
                if (countryViewListResponse?.data?.data) {
                    return countryViewListResponse.data.data
                } else {
                    return false
                }
            } else if (countryViewListResponse.status === 401) {
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                deleteOrestCurrentUserInfo()
                return false
            }
        })
    }
    , getPaymentType = () =>  {
        return ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.PAYTYPE,
            token: useToken,
            params: {
                query: useOrestQuery({
                    isorsactive: true,
                    isactive: true,
                })
            },
        }).then(paymentViewListResponse => {
            if (paymentViewListResponse.status === 200) {
                if (paymentViewListResponse?.data?.data) {
                    return paymentViewListResponse.data.data
                } else {
                    return false
                }
            } else if (paymentViewListResponse.status === 401) {
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                deleteOrestCurrentUserInfo()
                return false
            }
        })
    }
    , getBankIbanList = () => {
        return ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.BANK,
            token: useToken,
            params: {
                query: useOrestQuery({
                    isactive: true,
                    iban: 'notnull',
                    bankbranchid: 'notnull',
                }),
                limit: 6,
                chkselfish: false,

            },
        }).then(bankViewListResponse => {
            if (bankViewListResponse.status === 200) {
                if (bankViewListResponse?.data?.data) {
                    return bankViewListResponse?.data?.data.map((item) => {
                        return {
                            id: item.id,
                            bankname: item.bankname,
                            bankbranch: item.bankbranch,
                            currencycode: item.currencycode,
                            accountno: item.accountno,
                            iban: item.iban,
                            mid: item.mid,
                        }
                    })
                } else {
                    return false
                }
            } else if (bankViewListResponse.status === 401) {
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                deleteOrestCurrentUserInfo()
                return false
            }
        })
    }
    , getRedirectUrlCheckStatus = (event, reservNo, reservGid) =>{
        const response = event.data.response
        if (response && !isLoading) {
            setIsLoading(true)
            axios({
                url: '/api/ors/payment/save',
                method: 'post',
                params: {
                    isfail: !response.success,
                    transactionid: transactionId,
                    orderid: response.orderid,
                    reftype: 'RESERVAT',
                    refno: reservNo,
                    reservationGid: reservGid,
                    reservationUpdate: true,
                    isgroup: false,
                    sendNotification: false
                },
            }).then(async (responsePaymentSave) => {
                if (responsePaymentSave.data.success) {
                    if(responsePaymentSave.data.processMsg === SAVE_ERROR_TYPE.PAYMENT_FAIL){
                        setTransactionStatus(TRANSACTION_STATUS.ERROR)
                        setErrorMsg(response.errormsg)
                        setTransactionId(false)
                        setIsLoading(false)
                    }else{
                        await reservatPatch(reservationDef.gid, {
                            advpaynote: 'Pay At Credit Card'
                        })

                        setTransactionStatus(TRANSACTION_STATUS.SUCCESSFUL)
                        setTransactionId(false)
                        setIsLoading(false)
                        setActiveStep((prevActiveStep) => prevActiveStep + 1)
                    }
                }else {
                    setTransactionStatus(TRANSACTION_STATUS.ERROR)
                    if (responsePaymentSave.data.processMsg === SAVE_ERROR_TYPE.SESSION_TIMEOUT) {
                        setIsSaveError(true)
                        setErrorMsg(t('str_paymentTransactionSuccessButSessionTimeout', { transid: response.orderid || '' }))
                        setIsLoading(false)
                        setTransactionId(false)
                    } else {
                        setErrorMsg(responsePaymentSave.errormsg)
                        setIsLoading(false)
                        setTransactionId(false)
                    }
                }
            }).catch(() => {
                setTransactionStatus(TRANSACTION_STATUS.ERROR)
                setErrorMsg(false)
                setIsLoading(false)
                setTransactionId(false)
            })
        } else {
            setTransactionStatus(TRANSACTION_STATUS.ERROR)
            setErrorMsg(false)
            setIsLoading(false)
            setTransactionId(false)
        }
    }
    , getResXReason= () => {
        return ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RESXREASON,
            token: useToken,
            params: {
                query: useOrestQuery({
                    isactive:true,
                    isresa:true,
                    isupd:true,
                    isgapp:false
                })
            },
        }).then(resXReasonResponse => {
            if (resXReasonResponse.status === 200) {
                if (resXReasonResponse?.data?.data) {
                    return resXReasonResponse.data.data
                } else {
                    return false
                }
            } else if (resXReasonResponse.status === 401) {
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                deleteOrestCurrentUserInfo()
                return false
            }
        })
    }
    , checkRoomAvailability = () => {
        let isError = false
        if(!reservationInfo.firstname){
            isError = true
        }

        if(!reservationInfo.lastname){
            isError = true
        }

        if(!(reservationInfo?.night > 0)){
            isError = true
        }

        if(!reservationInfo.country){
            isError = true
        }

        if(isError){
            setIsError({...isError,
                firstname: !reservationInfo.firstname,
                lastname: !reservationInfo.lastname,
                country: !reservationInfo.country,
            })
        }else {
            setRoomTypeIsLoading(true)
            return List({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: 'roomtype/book',
                token: useToken,
                params: {
                    ci: moment(reservationInfo.dates[0]).format('YYYY-MM-DD'),
                    co: moment(reservationInfo.dates[1]).format('YYYY-MM-DD'),
                    resdate: moment().format('YYYY-MM-DD'),
                    pax: reservationInfo.totalPax,
                    chd1: reservationInfo.totalChd,
                    baby: reservationInfo.totalBaby,
                    pricecurrid: agencyInfo.pricecurrid,
                    agencyid: agencyInfo.id,
                    orsactive: true
                },
            }).then(roomTypeBookListResponse => {
                if (roomTypeBookListResponse.status === 200) {
                    if (roomTypeBookListResponse?.data?.data) {
                        setRoomTypeIsLoading(false)
                        setRoomTypeList(roomTypeBookListResponse.data.data)
                        setIsRefreshRequired(false)
                        return true
                    }else {
                        setIsRefreshRequired(false)
                        setRoomTypeIsLoading(false)
                        return false
                    }
                } else if (roomTypeBookListResponse.status === 401) {
                    setIsRefreshRequired(false)
                    setRoomTypeIsLoading(false)
                    enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                    deleteOrestCurrentUserInfo()
                    return false
                }
            }).catch(() => {
                setIsRefreshRequired(false)
                setRoomTypeIsLoading(false)
                return false
            })
        }
    }
    , getResNameData = (reservno, data) => {
        return data.map((otherGuest, otherGuestIndex) => {
            return {
                firstname: otherGuest.firstname.value,
                lastname: otherGuest.lastname.value,
                birthdate: otherGuest?.birthdate?.value ? moment(otherGuest.birthdate.value).format(OREST_ENDPOINT.DATEFORMAT) : "",
                email: otherGuest?.email?.value || "",
                reservno: reservno,
                paxno: otherGuestIndex + 1
            }
        })
    }
    , resNameListIns = (data) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RESNAME + '/' + OREST_ENDPOINT.LISTINS,
            method: REQUEST_METHOD_CONST.POST,
            token: useToken,
            params: {
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
            },
            data: data
        }).then((resNameListInsResponse) => {
            if (resNameListInsResponse.status === 200) {
                return true
            } else if (resNameListInsResponse.status === 401) {
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                deleteOrestCurrentUserInfo()
                return false
            }
        }).catch(() => {
            return false
        })
    }
    , resNameDelQuery = (reservno) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RESNAME + '/' + OREST_ENDPOINT.LISTDEL,
            method: REQUEST_METHOD_CONST.DELETE,
            token: useToken,
            params: {
                query: useOrestQuery({
                    reservno: reservno,
                }),
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
            },
        }).then((resNameListDelResponse) => {
            if (resNameListDelResponse.status === 200) {
                return true
            } else if (resNameListDelResponse.status === 401) {
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                deleteOrestCurrentUserInfo()
                return false
            }
        }).catch(() => {
            return false
        })
    }
    , raNoteInsert = (data) => {
        return Insert({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RANOTE,
            token: useToken,
            params: {
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
            },
            data: data,
        }).then((raNoteResponse) => {
            if (raNoteResponse.status === 200) {
                return raNoteResponse?.data?.data
            } else if (raNoteResponse.status === 401) {
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                deleteOrestCurrentUserInfo()
                return false
            }
        }).catch(() => {
            return false
        })
    }
    , raNoteDelQuery = (mid) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RANOTE + '/' + OREST_ENDPOINT.LISTDEL,
            method: REQUEST_METHOD_CONST.DELETE,
            token: useToken,
            params: {
                query: useOrestQuery({
                    masterid: mid,
                }),
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
            },
        }).then((raNoteListDelResponse) => {
            if (raNoteListDelResponse.status === 200) {
                return raNoteListDelResponse?.data?.data
            } else if (raNoteListDelResponse.status === 401) {
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                deleteOrestCurrentUserInfo()
                return false
            }
        }).catch(() => {
            return false
        })
    }
    , reservatUpdate = (gid, data) => {
        return Update({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RESERVAT,
            token: useToken,
            gid: gid,
            params: {
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
            },
            data: data,
        }).then((reservatUpdResponse) => {
            if (reservatUpdResponse.status === 200) {
                return reservatUpdResponse?.data?.data
            } else if (reservatUpdResponse.status === 401) {
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                deleteOrestCurrentUserInfo()
                return false
            }
        }).catch(() => {
            return false
        })
    }
    , reservatPatch = (gid, data) => {
        return Patch({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RESERVAT,
            token: useToken,
            gid: gid,
            params: {
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
            },
            data: data,
        }).then((reservatPatchResponse) => {
            if (reservatPatchResponse.status === 200) {
                return reservatPatchResponse?.data?.data
            } else if (reservatPatchResponse.status === 401) {
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                deleteOrestCurrentUserInfo()
                return false
            }
        }).catch(() => {
            return false
        })
    }
    , reservatPriceCalc = (params) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'reservat/price/calc',
            method: REQUEST_METHOD_CONST.PUT,
            token: useToken,
            params: params
        }).then((reservatPriceCalcResponse) => {
            if (reservatPriceCalcResponse.status === 200) {
                return true
            } else if (reservatPriceCalcResponse.status === 401) {
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                deleteOrestCurrentUserInfo()
                return false
            }
        }).catch(() => {
            return false
        })
    }
    , reservatPriceTotals = (params) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'reservat/price/totals',
            method: REQUEST_METHOD_CONST.PUT,
            token: useToken,
            params: params
        }).then((reservatPriceTotalsResponse) => {
            if (reservatPriceTotalsResponse.status === 200) {
                return reservatPriceTotalsResponse?.data?.data
            } else if (reservatPriceTotalsResponse.status === 401) {
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                deleteOrestCurrentUserInfo()
                return false
            }
        }).catch(() => {
            return false
        })
    }
    , resXReasonList = (reservno, resxreasonid) => {
        return List({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RESXREASONLIST,
            token: useToken,
            params: {
                query: useOrestQuery({
                    reservno: reservno,
                    resxreasonid: resxreasonid,
                }),
            },
        }).then(resXReasonListResponse => {
            if (resXReasonListResponse.status === 200 && resXReasonListResponse?.data?.data.length > 0) {
                return true
            } else if (resXReasonListResponse.status === 401) {
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                deleteOrestCurrentUserInfo()
                return false
            }else {
                return false
            }
        }).catch(() => {
            return false
        })
    }
    , resXReasonIns = (data) => {
        return Insert({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RESXREASONLIST,
            token: useToken,
            data: data,
        }).then((resXReasonInsResponse) => {
            if (resXReasonInsResponse.status === 200) {
                return true
            } else if (resXReasonInsResponse.status === 401) {
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                deleteOrestCurrentUserInfo()
                return false
            }
        }).catch(() => {
            return false
        })
    }
    , generateResChdList = (chdAges, resevno, hotelrefno) => {
       return chdAges.map((chd, i) => {
            return {
                chdno: i + 1,
                chdage: chd?.chdage || chd?.chdAge || 0,
                reservno: resevno,
                hotelrefno: hotelrefno
            }
        })
    }
    , resChdListIns = (data) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'reschd/list/ins',
            method: REQUEST_METHOD_CONST.POST,
            token: useToken,
            data: data
        }).then((resChdListInsResponse) => {
            if (resChdListInsResponse.status === 200) {
                return true
            } else if (resChdListInsResponse.status === 401) {
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                deleteOrestCurrentUserInfo()
                return false
            }
        }).catch(() => {
            return false
        })
    }
    , resChdListDel = (reservno) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'reschd/list/del',
            method: REQUEST_METHOD_CONST.DELETE,
            token: useToken,
            params: {
                query: `reservno:${reservno}`
            }
        }).then((resChdListDelResponse) => {
            if (resChdListDelResponse.status === 200) {
                return true
            } else if (resChdListDelResponse.status === 401) {
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                deleteOrestCurrentUserInfo()
                return false
            }
        }).catch(() => {
            return false
        })
    }
    , payWithCreditCard = () => {
        window.onbeforeunload = function(e) {
            e.preventDefault()
            return e.returnValue = ''
        }

        setIsPayLoading(true)
        const postData = {
            cardOwner: creditCardInfo.cardOwner,
            cardNumber: creditCardInfo.cardNumber.replace(/\\s/g, ''),
            cardExpiry: creditCardInfo.cardExpiry,
            cardCvc: creditCardInfo.cardCvc,
        }

        return axios({
            url: GENERAL_SETTINGS.BASE_URL + 'api/ors/payment/do',
            method: 'post',
            timeout: 1000 * 60, // Wait for 60 sec.
            params: {
                gid: reservationDef.gid,
            },
            data: postData,
        }).then((response) => {
            if (response.data.success) {
                setIsPayLoading(false)
                setTransactionId(response.data.transactionid)
                setRedirectUrl(response.data.redirecturl)
                return true
            } else {
                setTransactionStatus(TRANSACTION_STATUS.ERROR)
                setErrorMsg(t('str_checkCCorPayInfoError'))
                setIsPayLoading(false)
                return false
            }
        }).catch(() => {
            setTransactionStatus(TRANSACTION_STATUS.ERROR)
            setErrorMsg(t('str_checkCCorPayInfoError'))
            setIsPayLoading(false)
            return false
        })
    }
    , hasPayType = (id, filter) => {
        const payType = paymentTypeList && paymentTypeList.length > 0 && paymentTypeList.filter((item) => item[filter])[0]
        return Boolean(payType && Number(id) === Number(payType.id))
    }
    , getChdLabel = (chdNo, chdType) => {
        if(chdType === 'chd'){
            return chdNo + '. ' + t('str_childAge')
        }else if(chdType === 'baby'){
            return chdNo + '. ' + t('str_babyAge')
        }
    }
    , getChildAgeRange = (chdType) => {
        if (chdType === 'baby') {
            return range(1, agencyInfo.babyage, 1)
        } else {
            return range(Number(agencyInfo.babyage) + 1, agencyInfo.chd1age > agencyInfo.chd2age ? agencyInfo.chd1age : agencyInfo.chd2age, 1)
        }
    }
    , handleChange = (name, value, removeRoomType = false) => {
        if(removeRoomType){
            setRoomTypeList([])
            setUsePrice({})
            setIsRefreshRequired(true)
            setReservationInfo({ ...reservationInfo, 'roomType': 0, [name]: value })
        }else{
            setReservationInfo({ ...reservationInfo, [name]: value })
        }
    }
    , handleSelectChange = (name, value, isRoomType = false) => {
        if(isRoomType){
            setReservationInfo({ ...reservationInfo, [name]: value })
        }else {
            setRoomTypeList([])
            setUsePrice({})
            setIsRefreshRequired(true)
            setReservationInfo({ ...reservationInfo, 'roomType': 0, [name]: value })
        }
    }
    , handlePayTryAgain = () => {
        setIsLoading(true)
        setTimeout(()=> {
            setIsLoading(false)
            setErrorMsg(false)
            setIsPayLoading(false)
            setRedirectUrl(false)
            setIsPayFrameLoad(false)
            setTransactionStatus(0)
        }, 1000)
    }
    , handleNext = async () => {
        const nextStep = activeStep + 1
        if(activeStep === stepIndex.reservationInfo){
            let isError = false

            if(!reservationInfo.firstname){
                isError = true
            }

            if(!reservationInfo.lastname){
                isError = true
            }

            if(!(reservationInfo?.night > 0)){
                isError = true
            }

            if(!reservationInfo.country){
                isError = true
            }

            if(!reservationInfo.roomType){
                isError = true
            }

            if(!(usePrice?.totalprice > 0)){
                isError = true
            }

            if(isError){
                setIsError({...isError,
                    firstname: !reservationInfo.firstname,
                    lastname: !reservationInfo.lastname,
                    country: !reservationInfo.country,
                    roomtype: !reservationInfo.roomType,
                    totalprice: !(usePrice?.totalprice > 0)
                })
            }else {
                setIsLoading(true)
                let reservationNote = reservationInfo.note
                await raNoteDelQuery(reservationDef.mid)
                if(reservationInfo?.note && reservationInfo?.note.length > 250){
                    reservationNote = reservationInfo.note.slice(0, 250)
                    await raNoteInsert({
                        masterid: reservationDef.mid,
                        note: reservationInfo.note
                    })
                }

                await reservatPatch(reservationDef.gid, Object.assign({
                    firstname: reservationInfo.firstname,
                    lastname: reservationInfo.lastname,
                    note: reservationNote,
                },nextStep === stepIndex.confirm ? {
                    status: 'A'
                }: {}))

                setIsLoading(false)
                setActiveStep((prevActiveStep) => prevActiveStep + 1)
            }
        }else if(activeStep === stepIndex.reservationNames){
            setIsLoading(true)
            let isError = false
            const dataUpdate = [...otherGuestList]
            dataUpdate.map((otherGuest, index) => {
                if(required(otherGuest.firstname.value)){
                    dataUpdate[index].firstname.iserror = true
                    isError = true
                }

                if(required(otherGuest.lastname.value)){
                    dataUpdate[index].lastname.iserror = true
                    isError = true
                }

                if(otherGuest.email.value && !emailValidation(otherGuest.email.value)){
                    dataUpdate[index].email.iserror = true
                    isError = true
                }
            })

            setOtherGuestList([...dataUpdate])
            if(!isError){
                await resNameDelQuery(reservationDef.reservno)
                const resNameData = getResNameData(reservationDef.reservno, dataUpdate)
                    , resNameIns = await resNameListIns(resNameData)

                if(resNameIns){
                    if(nextStep === stepIndex.confirm){
                        await reservatPatch(reservationDef.gid, {
                            status: 'A'
                        })
                    }

                    setIsLoading(false)
                    setActiveStep((prevActiveStep) => prevActiveStep + 1)
                }
            }

            setIsLoading(false)
        }else if(activeStep === stepIndex.changeReason){
            setIsLoading(true)
            if(reasonData?.id){
                const isExist = await resXReasonList(reservationDef.reservno, reasonData.id)
                if(!isExist){
                    const reasonUpd = await resXReasonIns({
                        resxreasonid: reasonData.id,
                        note: reasonData.note,
                        reservno: reservationDef.reservno,
                        hotelrefno: reservationDef.hotelrefno,
                    })

                    if (reasonUpd) {
                        setIsLoading(false)
                        setActiveStep((prevActiveStep) => prevActiveStep + 1)
                    }
                }else{
                    setReasonData({...reasonData, exist: true})
                    setIsLoading(false)
                }
            }else{
                setReasonData({...reasonData, error: true})
                setIsLoading(false)
            }
        }else if(activeStep === stepIndex.paymentOptions){
            if(hasPayType(selectPayTypeId, 'iscash') || hasPayType(selectPayTypeId, 'istransfer')){
                setIsLoading(true)
                const statusUpd = await reservatPatch(reservationDef.gid, {
                    status: 'A',
                    advpaynote: hasPayType(selectPayTypeId, 'iscash') ? 'Pay at the Hotel' : 'Pay by Wire Transfer'
                })

                if(statusUpd){
                    setIsLoading(false)
                    setActiveStep((prevActiveStep) => prevActiveStep + 1)
                }
            }else if(hasPayType(selectPayTypeId, 'isccpay')){
                if (creditCardIsValid.isError || !creditCardIsValid.isValid) {
                    enqueueSnackbar(t('str_checkCCorPayInfoError'), { variant: 'warning' })
                }else{
                    payWithCreditCard()
                }
            }
        }else {
            setActiveStep((prevActiveStep) => prevActiveStep + 1)
        }
    }
    , handleReset = () => {
        onClose()
        setOpenTrackedDialog(false)
        setReservationInfo(defReservationInfo)
        setReasonData(defReasonData)
        setIsError(defIsError)
        setRoomTypeList([])
        setChildAges([])
        setReservationDef({})
        setUsePrice({})
        setActiveStep(0)
        setTransactionStatus(0)
        setOptionExpired(false)
        setErrorMsg(false)
        setIsPayLoading(false)
        setRedirectUrl(false)
        setIsPayFrameLoad(false)
        setPriceCalcIsLoading(false)
        setIsLoading(false)
        setIsRefreshRequired(true)
    }
    , handleClose = () => {
        if(isUpdate && JSON.stringify(reservationDef) !== JSON.stringify(reservationMemoized) && activeStep !== stepIndex.confirm){
            setOpenTrackedDialog(true)
            return false
        }

        handleReset()
    }
    , handlePrev = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }
    , handleCopyIban = (e, iban) => {
        enqueueSnackbar(t('str_ibanCopied'), { variant: 'success' })
        navigator.clipboard.writeText(iban)
    }
    , handleOtherGuestChange = (e, name, index) => {
        let value
        if (name === 'birthdate') {
            if (e._isValid) {
                value = e._d
            } else {
                value = e._d
            }
        }else {
            value = e.target.value
        }

        const dataUpdate = [...otherGuestList]
        dataUpdate[index][name].value = value
        dataUpdate[index][name].iserror = false
        setOtherGuestList([...dataUpdate])
    }
    , handleRefreshTotal = async (roomTypeId = false) => {
        let isError = false
        if(!reservationInfo.firstname){
            isError = true
        }

        if(!reservationInfo.lastname){
            isError = true
        }

        if(!(reservationInfo?.night > 0)){
            isError = true
        }

        if(!reservationInfo.country){
            isError = true
        }

        if(!roomTypeId){
            isError = true
        }

        if(isError){
            setIsError({...isError,
                firstname: !reservationInfo.firstname,
                lastname: !reservationInfo.lastname,
                country: !reservationInfo.country,
                roomtype: !roomTypeId
            })
            return false
        }else {
            setPriceCalcIsLoading(true)
            let reservationDefUpd = {
                ...reservationDef,
                status: isUpdate ? 'A': 'T',
                clientid: clientBase.id,
                agencyid: agencyInfo.id,
                checkin: moment(reservationInfo.dates[0]).format('YYYY-MM-DD'),
                checkout: moment(reservationInfo.dates[1]).format('YYYY-MM-DD'),
                resdate: moment().format('YYYY-MM-DD'),
                firstname: reservationInfo.firstname || clientBase.firstname,
                lastname: reservationInfo.lastname || clientBase.lastname,
                email: clientBase.email,
                roomtypeid: roomTypeId || reservationInfo.roomType.id,
                rescountryid: reservationInfo.country.id,
                totalpax: reservationInfo.totalPax,
                totalchd1: reservationInfo.totalChd,
                totalbaby: reservationInfo.totalBaby,
                boardtypeid: agencyInfo.boardtypeid,
                pricecurrid: agencyInfo.pricecurrid,
                sourceid: agencyInfo.sourceid,
                ressegmentid: agencyInfo.ressegmentid,
                resdefinitid: agencyInfo.resdefinitid,
                paytype: agencyInfo.paytype,
                nationid: agencyInfo.nationid,
                needinvoice: agencyInfo.needinvoice,
                marketid: agencyInfo.marketid,
                langid: agencyInfo.langid,
                agencysubid: agencyInfo.agencysubid,
            }

            if(infoLogin?.isbooker){
                reservationDefUpd.bookerid = infoLogin.id || 0
            }

            const reservatUpdData = await reservatUpdate(reservationDefUpd.gid, reservationDefUpd)
            setReservationDef(reservatUpdData)

            await resChdListDel(reservatUpdData.reservno)
            if(childAges && childAges.length > 0){
                const getChdList = generateResChdList(childAges, reservatUpdData.reservno, GENERAL_SETTINGS.HOTELREFNO)
                await resChdListIns(getChdList)
            }

            await reservatPriceCalc({
                istemp: !isUpdate,
                agencyid: reservatUpdData.agencyid,
                checkin: reservatUpdData.checkin,
                checkout: reservatUpdData.checkout,
                clientid: reservatUpdData.clientid,
                marketid: reservatUpdData.marketid,
                pricecurrid: reservatUpdData.pricecurrid,
                resdate: reservatUpdData.resdate,
                roomtypeid: reservatUpdData.roomtypeid,
                reservno: reservatUpdData.reservno,
                ispricelocked: false,
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
            })

            const reservatPriceTotalData = await reservatPriceTotals({
                reservno: reservatUpdData.reservno,
                doupdate: true,
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
            })

            setIsError({...isError, roomtype: false, totalprice: false})
            setUsePrice(reservatPriceTotalData)
            setPriceCalcIsLoading(false)
            return true
        }
    }
    , handleChild = (name, value, type) => {
        setRoomTypeList([])
        const chdNo = Number(reservationInfo.totalChd) + Number(reservationInfo.totalBaby)
            , defChd = {
            chdNo: chdNo,
            chdAge: 0,
            chdType: type,
        }
            , filterChild = childAges.filter(chd => chd.chdType === type)

        if (filterChild.length >= Number(value)) {
            const filterLastIndex = childAges.indexOf(childAges.filter(item => item.chdType === type).pop())
                , newChildAges = childAges
            newChildAges.splice(filterLastIndex, 1)
            setChildAges(newChildAges)
        } else {
            setChildAges([...childAges, defChd])
        }

        setUsePrice({})
        setIsRefreshRequired(true)
        setReservationInfo({ ...reservationInfo, 'roomType': 0, [name]: value })
    }
    , handleSelectChdAge = (chdNo, chdType, e) => {
        const dataUpdate = [...childAges]
            , index = childAges.findIndex(chd => chd.chdNo === chdNo && chd.chdType === chdType)
        dataUpdate[index].chdAge = e.target.value
        setChildAges([...dataUpdate])
    }
    , reservationReset = async () => {
        setIsLoading(true)
        await reservatUpdate(reservationMemoized.gid, reservationMemoized)
        await resNameDelQuery(reservationMemoized.reservno)
        await resNameListIns(resNameListMemoized)
        await resChdListDel(reservationMemoized.reservno)
        if(resChdListMemoized && resChdListMemoized.length > 0){
            const getChdList = generateResChdList(resChdListMemoized, reservationMemoized.reservno, GENERAL_SETTINGS.HOTELREFNO)
            await resChdListIns(getChdList)
        }

        handleReset()
        setIsLoading(false)
    }

    return (
        <React.Fragment>
            <TrackedChangesDialog
                disabled={isLoading}
                open={openTrackedDialog}
                onPressNo={(e) => {
                    setOpenTrackedDialog(e)
                }}
                onPressYes={async () => {
                    await reservationReset()
                }}
                dialogDesc={t('str_allYourChangesWillBeUndoneAreYouSure')}
            />
            <Dialog classes={{paper: classes.quickResDialogPaper}} onClose={handleClose} aria-labelledby='quick-res-dialog-title' open={open} disableEnforceFocus disableBackdropClick disableEscapeKeyDown>
                <MuiDialogTitle id='quick-res-dialog-title' onClose={handleClose} disabled={isPayLoading}>
                    {t('str_quickReservation')}
                </MuiDialogTitle>
                <MuiDialogContent dividers>
                    {dialogIsLoading ? (
                            <div className={classes.root}>
                                <LoadingSpinner size={50}/>
                            </div>
                        ) :
                        optionExpired ? (
                            <div className={classes.root}>
                                <Alert severity="warning" style={{marginBottom: 20}}>
                                    You cannot edit this reservation because the option date has passed.
                                </Alert>
                            </div>
                        ) : (
                            <div className={classes.root}>
                                <div className={classes.root}>
                                    <Stepper activeStep={activeStep} style={{ padding: 10 }}>
                                        {steps.map((label, stepIndex) => (
                                            <Step key={label + stepIndex}>
                                                <StepLabel>{label}</StepLabel>
                                            </Step>
                                        ))}
                                    </Stepper>
                                    <Box p={3}>
                                        {activeStep === stepIndex.reservationInfo ? (
                                            <Grid container spacing={3} direction='row' justify='space-between' alignItems='center'>
                                                <Grid item xs={12}>
                                                    <Grid container spacing={1}>
                                                        <Grid item xs={12} sm={6}>
                                                            <TextField
                                                                required
                                                                id='firstname'
                                                                name='firstname'
                                                                label={t('str_firstName')}
                                                                variant='outlined'
                                                                size='small'
                                                                fullWidth
                                                                value={reservationInfo.firstname}
                                                                onChange={(e) => handleChange('firstname', e.target.value)}
                                                                disabled={isLoading || priceCalcIsLoading || roomTypeIsLoading}
                                                                error={isError?.firstname || false}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} sm={6}>
                                                            <TextField
                                                                required
                                                                id='lastname'
                                                                name='lastname'
                                                                label={t('str_lastName')}
                                                                variant='outlined'
                                                                size='small'
                                                                fullWidth
                                                                value={reservationInfo.lastname}
                                                                onChange={(e) => handleChange('lastname', e.target.value)}
                                                                disabled={isLoading || priceCalcIsLoading || roomTypeIsLoading}
                                                                error={isError?.lastname || false}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <ReservationDatePickerWithNight
                                                        required
                                                        dateKey='dates'
                                                        nightKey='night'
                                                        dates={reservationInfo.dates}
                                                        night={reservationInfo.night}
                                                        onChange={(value) => {
                                                            setUsePrice({})
                                                            setRoomTypeList([])
                                                            setIsRefreshRequired(true)
                                                            setReservationInfo({
                                                                ...reservationInfo,
                                                                'roomType': 0,
                                                                [value.dateKey]: value.dates,
                                                                [value.nightKey]: value.night,
                                                            })
                                                        }}
                                                        disabled={isLoading || priceCalcIsLoading || roomTypeIsLoading}
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Grid container spacing={1}>
                                                        <Grid item xs={12} sm={4}>
                                                            <SpinEdit
                                                                required
                                                                min={1}
                                                                id='totalPax'
                                                                name='totalPax'
                                                                defaultValue={reservationInfo.totalPax || 0}
                                                                padding={0}
                                                                label={t('str_tPax')}
                                                                onChange={(value) => {
                                                                    handleChange('totalPax', value, true)
                                                                }}
                                                                disabled={isLoading || priceCalcIsLoading || roomTypeIsLoading}
                                                                size='small'
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} sm={4}>
                                                            <SpinEdit
                                                                id='totalChd'
                                                                name='totalChd'
                                                                defaultValue={reservationInfo.totalChd || 0}
                                                                padding={0}
                                                                label={t('str_child')}
                                                                onChange={(value) => {
                                                                    handleChild('totalChd', value, 'chd')
                                                                }}
                                                                disabled={isLoading || priceCalcIsLoading || roomTypeIsLoading}
                                                                size='small'
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} sm={4}>
                                                            <SpinEdit
                                                                id='totalBaby'
                                                                name='totalBaby'
                                                                defaultValue={reservationInfo.totalBaby || 0}
                                                                padding={0}
                                                                label={t('str_baby')}
                                                                onChange={(value) => {
                                                                    handleChild('totalBaby', value, 'baby')
                                                                }}
                                                                disabled={isLoading || priceCalcIsLoading || roomTypeIsLoading}
                                                                size='small'
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                                {(Number(reservationInfo.totalChd) + Number(reservationInfo.totalBaby)) > 0 ? (
                                                    <Grid item xs={12}>
                                                        <Card variant='outlined'>
                                                            <CardContent className={classes.fieldsetContent}>
                                                                <Typography className={classes.fieldsetLabel} color="textSecondary">
                                                                    {t('str_childAges')}
                                                                </Typography>
                                                                <Grid container spacing={2}>
                                                                    {childAges && childAges.map((item, index) => {
                                                                        const realIndex = index + 1
                                                                        return (
                                                                            <Grid item xs={3} key={item.chdNo}>
                                                                                <TextField
                                                                                    required
                                                                                    disabled={isLoading || priceCalcIsLoading || roomTypeIsLoading}
                                                                                    fullWidth
                                                                                    id={`select-age-${item.chdNo}`}
                                                                                    size='small'
                                                                                    variant='outlined'
                                                                                    label={getChdLabel(realIndex, item.chdType)}
                                                                                    onChange={(e) => handleSelectChdAge(item.chdNo, item.chdType, e)}
                                                                                    value={item.chdAge}
                                                                                    select
                                                                                >
                                                                                    {getChildAgeRange(item.chdType).map((chd, i) => {
                                                                                        return (
                                                                                            <MenuItem key={chd} value={chd}>
                                                                                                {chd}
                                                                                            </MenuItem>
                                                                                        )
                                                                                    })}
                                                                                </TextField>
                                                                            </Grid>
                                                                        )
                                                                    })}
                                                                </Grid>
                                                            </CardContent>
                                                        </Card>
                                                    </Grid>
                                                ): null}
                                                <Grid item xs={12}>
                                                    <Grid container spacing={1}>
                                                        <Grid item xs={12} sm={5}>
                                                            <Autocomplete
                                                                disabled={isLoading || priceCalcIsLoading || roomTypeIsLoading}
                                                                id='country'
                                                                name='country'
                                                                onChange={(event, newValue) => {
                                                                    setIsError({...isError, country: false})
                                                                    handleSelectChange('country', newValue)
                                                                }}
                                                                options={[reservationInfo.country, ...countryList]}
                                                                filterOptions={()=> countryList}
                                                                value={reservationInfo.country}
                                                                getOptionLabel={(option) => option?.description || ""}
                                                                renderInput={(params) =>
                                                                    <TextField
                                                                        {...params}
                                                                        required
                                                                        label={t('str_country')}
                                                                        variant='outlined'
                                                                        size='small'
                                                                        fullWidth
                                                                        error={isError?.country || false}
                                                                    />
                                                                }
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} sm={7}>
                                                            <Autocomplete
                                                                id='roomType'
                                                                name='roomType'
                                                                noOptionsText={`${isRefreshRequired ? t('str_youWillNeedToCheckAvailabilityAgainForYourChangesToTakeEffect'): t('str_noSuitableRoomTypeWasFoundForTheseOptionsYouCanChangeItAndTryAgainIfYouWish')}`}
                                                                disabled={isLoading || priceCalcIsLoading || roomTypeIsLoading}
                                                                onChange={async (event, newValue) => {
                                                                    setIsError({...isError, roomtype: false})
                                                                    handleSelectChange('roomType', newValue, true)
                                                                    if(newValue){
                                                                        await handleRefreshTotal(newValue.id || 0)
                                                                    }
                                                                }}
                                                                options={[reservationInfo.roomType, ...roomTypeListFilter(roomTypeList)]}
                                                                filterOptions={() => roomTypeList}
                                                                value={reservationInfo.roomType}
                                                                getOptionLabel={(option) => option?.description || ""}
                                                                renderInput={(params) =>
                                                                    <TextField
                                                                        {...params}
                                                                        required
                                                                        classes={{ root: classes.textFieldRoot }}
                                                                        label={t('str_roomType')}
                                                                        variant='outlined'
                                                                        size='small'
                                                                        fullWidth
                                                                        error={isError?.roomtype || false}
                                                                        InputProps={{
                                                                            ...params.InputProps,
                                                                            endAdornment: (
                                                                                <React.Fragment>
                                                                                    <Tooltip arrow title={(isLoading || priceCalcIsLoading || roomTypeIsLoading) ? '' : t('str_checkAvailability')}>
                                                                                        <IconButton
                                                                                            color='primary'
                                                                                            size='small'
                                                                                            disabled={isLoading || priceCalcIsLoading || roomTypeIsLoading}
                                                                                            onClick={() => checkRoomAvailability()}
                                                                                        >
                                                                                            {roomTypeIsLoading ? (
                                                                                                <LoadingSpinner
                                                                                                    size={20} />
                                                                                            ) : (
                                                                                                <Loop />
                                                                                            )}
                                                                                        </IconButton>
                                                                                    </Tooltip>
                                                                                    {params.InputProps.endAdornment}
                                                                                </React.Fragment>
                                                                            ),
                                                                        }}
                                                                    />
                                                                }
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        disabled={isLoading || priceCalcIsLoading || roomTypeIsLoading}
                                                        id='note'
                                                        name='note'
                                                        label={t('str_note')}
                                                        variant='outlined'
                                                        size='small'
                                                        fullWidth
                                                        multiline
                                                        rows={3}
                                                        value={reservationInfo?.note || ""}
                                                        onChange={(e) => handleChange('note', e.target.value)}
                                                    />
                                                </Grid>
                                                <Grid item>
                                                    <TextField
                                                        disabled={isLoading || priceCalcIsLoading || roomTypeIsLoading}
                                                        id='totalprice'
                                                        label={t('str_totalAmount')}
                                                        variant='outlined'
                                                        size='small'
                                                        fullWidth
                                                        InputProps={{
                                                            readOnly: true,
                                                            startAdornment: (
                                                                <InputAdornment position='start'>
                                                                    {getSymbolFromCurrency(agencyInfo.pricecurrcode)}
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                        value={formatMoney(usePrice?.totalprice || 0)}
                                                        error={isError?.totalprice || false}
                                                    />
                                                </Grid>
                                            </Grid>
                                        ): null}
                                        {activeStep === stepIndex.paymentOptions ? (
                                            <Grid container spacing={3} direction='row' justify='space-between' alignItems='center'>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        disabled={isLoading || isPayLoading || priceCalcIsLoading || roomTypeIsLoading}
                                                        required
                                                        fullWidth
                                                        id={`select-age`}
                                                        size='small'
                                                        variant='outlined'
                                                        value={selectPayTypeId}
                                                        select
                                                        label={t('str_paymentType')}
                                                        onChange={(e) => {
                                                            handlePayTryAgain()
                                                            setSelectPayTypeId(e.target.value)
                                                        }}
                                                    >
                                                        {paymentTypeList && paymentTypeList.length > 0 && paymentTypeList.map((payType, i) => {
                                                            return (
                                                                <MenuItem key={i} value={payType.id}>
                                                                    {t(payType.description)}
                                                                </MenuItem>
                                                            )
                                                        })}
                                                    </TextField>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    {hasPayType(selectPayTypeId, 'iscash') && (
                                                        <Alert variant="outlined" severity="info">
                                                            {t('str_payAtHotelMsg')}
                                                        </Alert>
                                                    )}
                                                    {hasPayType(selectPayTypeId, 'istransfer') && (
                                                        <TableContainer component={Paper}>
                                                            <Table className={classes.table} size="small">
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell>{t('str_bankName')}</TableCell>
                                                                        <TableCell>{t('str_branch')}</TableCell>
                                                                        <TableCell>{t('str_currency')}</TableCell>
                                                                        <TableCell>{t('str_bankIban')}</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {bankIbanList ? bankIbanList.filter(bankiban => bankiban.iban).map((row, i) => (
                                                                        <TableRow hover key={i} classes={{hover: classes.tableRowHover}}>
                                                                            <TableCell component="th" scope="row">{row.bankname}</TableCell>
                                                                            <TableCell>{row.bankbranch}</TableCell>
                                                                            <TableCell>{row.currencycode}</TableCell>
                                                                            <TableCell>
                                                                                <FormControl variant='outlined' size='small' style={{ width: '100%' }}>
                                                                                    <OutlinedInput
                                                                                        style={{ background: '#ffffff' }}
                                                                                        readOnly={true}
                                                                                        id='copy-iban'
                                                                                        value={row.iban && ibanPrintFormat(row.iban) || ""}
                                                                                        variant='outlined'
                                                                                        size='small'
                                                                                        endAdornment={
                                                                                            <InputAdornment position='end'>
                                                                                                <IconButton
                                                                                                    className={classes.copyButton}
                                                                                                    size='small'
                                                                                                    aria-label='copy-iban-button'
                                                                                                    onClick={(e) => handleCopyIban(e, row.iban)}
                                                                                                    onMouseDown={(e) => e.preventDefault()}
                                                                                                >
                                                                                                    <FileCopy />
                                                                                                </IconButton>
                                                                                            </InputAdornment>
                                                                                        }
                                                                                    />
                                                                                </FormControl>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    )): <Box p={3}> {t('str_noDefaultRecord')} </Box>}
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                    )}
                                                    {hasPayType(selectPayTypeId, 'isccpay') && (
                                                        <React.Fragment>
                                                            {(!isLoading && transactionStatus !== TRANSACTION_STATUS.ERROR) && (
                                                                <PaymentForm
                                                                    isDisabled={isPayLoading}
                                                                    showCard={true}
                                                                    onChange={(e) => setCreditCardInfo(e)}
                                                                    isValid={(e) => setCreditCardIsValid(e)}
                                                                />
                                                            )}
                                                            {isLoading ? (
                                                                <div style={{ height:250, position: 'relative' }}>
                                                                    <LoadingSpinner size={40} style={{ position: 'absolute', top: '40%', left: '50%' }}/>
                                                                </div>
                                                            ): transactionStatus === TRANSACTION_STATUS.USE_PAY_FORM && redirectUrl ? (
                                                                <div>
                                                                    <ThreeDPayDialog open={transactionStatus === TRANSACTION_STATUS.USE_PAY_FORM && redirectUrl} iframeUrl={redirectUrl} isPayFrameLoad={isPayFrameLoad} setIsPayFrameLoad={(e)=> setIsPayFrameLoad(e)} />
                                                                </div>
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
                                                                            <Button variant="outlined" color="primary" startIcon={<Refresh />} onClick={()=> handlePayTryAgain()}>{t('str_tryAgain')}</Button>
                                                                        </React.Fragment>
                                                                    )}
                                                                </React.Fragment>
                                                            ) : null }
                                                        </React.Fragment>
                                                    )}
                                                </Grid>
                                            </Grid>
                                        ): null}
                                        {activeStep === stepIndex.reservationNames ? (
                                            <Grid container spacing={3} direction='row' justify='space-between' alignItems='center'>
                                                <Grid item xs={12}>
                                                    {otherGuestList.map((otherGuest, otherGuestIndex) => {
                                                        let realOtherGuestIndex = otherGuestIndex + 1
                                                        return (
                                                            <Card variant='outlined' style={{ marginBottom: 20 }}>
                                                                <CardContent className={classes.fieldsetContent}>
                                                                    <Typography className={classes.fieldsetLabel} color='textSecondary'>
                                                                        {(realOtherGuestIndex + 1) + '. ' + t('str_client')}
                                                                    </Typography>
                                                                    <Grid container spacing={3}>
                                                                        <Grid item xs={12} sm={6}>
                                                                            <TextField
                                                                                required
                                                                                size='small'
                                                                                variant='outlined'
                                                                                id={realOtherGuestIndex + '-fistname'}
                                                                                name='fistname'
                                                                                label={t('str_firstName')}
                                                                                fullWidth
                                                                                value={otherGuest.firstname.value}
                                                                                disabled={isLoading}
                                                                                error={otherGuest.firstname.iserror}
                                                                                onChange={(e) => handleOtherGuestChange(e, 'firstname', otherGuestIndex)}
                                                                            />
                                                                        </Grid>
                                                                        <Grid item xs={12} sm={6}>
                                                                            <TextField
                                                                                required
                                                                                size='small'
                                                                                variant='outlined'
                                                                                id={realOtherGuestIndex + '-lastname'}
                                                                                name='lastname'
                                                                                label={t('str_lastName')}
                                                                                fullWidth
                                                                                value={otherGuest.lastname.value}
                                                                                disabled={isLoading}
                                                                                error={otherGuest.lastname.iserror}
                                                                                onChange={(e) => handleOtherGuestChange(e, 'lastname', otherGuestIndex)}
                                                                            />
                                                                        </Grid>
                                                                        <Grid item xs={12} sm={6}>
                                                                            <TextField
                                                                                size='small'
                                                                                variant='outlined'
                                                                                id={realOtherGuestIndex + '-email'}
                                                                                name='email'
                                                                                label={t('str_email')}
                                                                                fullWidth
                                                                                value={otherGuest.email.value}
                                                                                disabled={isLoading}
                                                                                error={otherGuest.email.iserror}
                                                                                onChange={(e) => handleOtherGuestChange(e, 'email', otherGuestIndex)}
                                                                            />
                                                                        </Grid>
                                                                        <Grid item xs={12} sm={6}>
                                                                            <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                                                                                <DatePicker
                                                                                    id={realOtherGuestIndex + '-birthdate'}
                                                                                    name='birthdate'
                                                                                    fullWidth
                                                                                    disableFuture
                                                                                    openTo={'date'}
                                                                                    views={['year', 'month', 'date']}
                                                                                    margin='dense'
                                                                                    inputFormat='DD/MM/YYYY'
                                                                                    value={otherGuest.birthdate.value ? moment(otherGuest.birthdate.value): moment(new Date())}
                                                                                    onChange={(e) => handleOtherGuestChange(e, 'birthdate', otherGuestIndex)}
                                                                                    renderInput={(props) =>
                                                                                        <TextField
                                                                                            {...props}
                                                                                            variant='outlined'
                                                                                            size='small'
                                                                                            fullWidth
                                                                                            disabled={isLoading}
                                                                                            error={otherGuest.birthdate.iserror}
                                                                                            helperText=''
                                                                                        />
                                                                                    }
                                                                                />
                                                                            </LocalizationProvider>
                                                                        </Grid>
                                                                    </Grid>
                                                                </CardContent>
                                                            </Card>
                                                        )
                                                    })}
                                                </Grid>
                                            </Grid>
                                        ): null}
                                        {activeStep === stepIndex.changeReason ? (
                                            <Grid container spacing={3} direction='row' justify='space-between' alignItems='center'>
                                                <Grid item xs={6}>
                                                    <TextField
                                                        disabled={isLoading || isPayLoading || priceCalcIsLoading || roomTypeIsLoading}
                                                        required
                                                        fullWidth
                                                        id={`select-reason`}
                                                        size='small'
                                                        variant='outlined'
                                                        value={reasonData?.id || null}
                                                        select
                                                        label={t('str_changeReason')}
                                                        onChange={(e) => setReasonData({...reasonData, exist: false, error: false, id: e.target.value})}
                                                        error={reasonData?.error || false}
                                                    >
                                                        {resxReasonList && resxReasonList.length > 0 && resxReasonList.map((resxReason, i) => {
                                                            return (
                                                                <MenuItem key={i} value={resxReason.id}>
                                                                    {t(resxReason.description)}
                                                                </MenuItem>
                                                            )
                                                        })}
                                                    </TextField>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        disabled={isLoading || priceCalcIsLoading || roomTypeIsLoading}
                                                        id='note'
                                                        name='note'
                                                        label={t('str_note')}
                                                        variant='outlined'
                                                        size='small'
                                                        fullWidth
                                                        multiline
                                                        rows={3}
                                                        value={reasonData?.note || ""}
                                                        onChange={(e) => setReasonData({...reasonData, note: e.target.value})}
                                                    />
                                                </Grid>
                                                {reasonData.exist ? (
                                                    <Grid item xs={12}>
                                                        <Alert variant="outlined" severity="warning">
                                                            {t('str_thereIsAPreviousRecordForTheSameReasonPleaseSelectADifferentReason')}
                                                        </Alert>
                                                    </Grid>
                                                ): null}
                                            </Grid>
                                        ): null}
                                        {activeStep === stepIndex.confirm ? (
                                            <Grid container spacing={3} direction='row' justify='space-between' alignItems='center'>
                                                <Grid item xs={12}>
                                                    <Paper variant="outlined" square className={classes.thankYouRoot}>
                                                        <CheckCircleOutline className={classes.thankYouIcon}/>
                                                        <Typography variant="body2" align="center" gutterBottom>
                                                            {t('str_yourReservationNo')} #{reservationDef.reservno}
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                            </Grid>
                                        ): null}
                                    </Box>
                                </div>
                            </div>
                        )}
                </MuiDialogContent>
                {activeStep !== stepIndex.confirm ? (
                    <MuiDialogActions>
                        <Button onClick={handlePrev} color='primary' disabled={activeStep === stepIndex.reservationInfo || transactionStatus === TRANSACTION_STATUS.ERROR || optionExpired || isLoading || isPayLoading}>
                            {t('str_back')}
                        </Button>
                        <Button
                            disabled={transactionStatus === TRANSACTION_STATUS.ERROR || optionExpired || isLoading || isPayLoading}
                            variant='contained'
                            color='primary'
                            onClick={handleNext}
                            className={classes.button}
                        >
                            {t('str_next')}
                        </Button>
                    </MuiDialogActions>
                ): null}
            </Dialog>
        </React.Fragment>
    )
}

export default memo(BookerReservation)