import React, { useContext, useEffect, useState, useRef, useCallback } from 'react'
import { connect, useSelector } from 'react-redux'
import { setToState } from 'state/actions'
import axios from 'axios'
import {
    Badge,
    Box,
    Button,
    Container,
    Divider,
    Grid,
    Icon,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    Menu,
    MenuItem,
    Popover,
    TextField,
    Typography,
    FormControl,
    Select,
    Dialog,
    DialogActions,
    DialogContent
} from '@material-ui/core'
import { Alert, AlertTitle } from '@material-ui/lab'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'
import { useSnackbar } from 'notistack'
import RoomCard from 'components/booking/components/RoomCard'
import ReservationCart from 'components/booking/components/ReservationCart'
import BookingStepper from 'components/booking/components/BookingStepper'
import ProgressButton from 'components/booking/components/ProgressButton'
import RoomCardLoading from 'components/booking/components/RoomCardLoading'
import BookingLayout from 'components/layout/containers/booking-layout'
import BookInfoMessage from 'components/booking/components/BookInfoMessage'
import SpinEdit from '@webcms-ui/core/spin-edit'
import moment from 'moment'
import MomentAdapter from '@date-io/moment'
import { DateRangePicker, LocalizationProvider } from '@material-ui/pickers'
import PopupState, { bindPopover, bindTrigger, bindMenu } from 'material-ui-popup-state'
import useTranslation from 'lib/translations/hooks/useTranslation'
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount'
import SortIcon from '@material-ui/icons/Sort'
import getSymbolFromCurrency from 'model/currency-symbol'
import WebCmsGlobal from 'components/webcms-global'
import TagManager from '@webcms-globals/tag-manager'
import { useRouter } from 'next/router'
import { defaultLocale } from 'lib/translations/config'
import { OREST_ENDPOINT, LOCAL_STORAGE_PERSIST_BOOK_INFO } from 'model/orest/constants'
import { getBookingSteps, bookingSteps, bookingStepCodes } from 'components/booking/commons'
import { LocaleContext } from 'lib/translations/context/LocaleContext'
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
    topSpaceBox: {
        width: '100%',
        display: 'block',
        marginTop: 60
    },
    bottomSpaceBox: {
        width: '100%',
        display: 'block',
        marginBottom: '35vh',
        "@media print": {
            display: 'none'
        }
    },
    stepperRoot: {
        backgroundColor: '#fff',
        border: '1px solid #dadadd',
        borderRadius: 6,
        "@media print": {
            display: 'none'
        }
    },
    searchBar: {
        backgroundColor: '#fff',
        border: '1px solid #dadadd',
        borderRadius: 6,
        marginBottom: 8,
    },
    searchBarContainer: {
        display: 'flex',
        alignItems: 'flex-start',
        [theme.breakpoints.between('xs', 'sm')]: {
            display: 'block',
        },
        '& > $searchBarGrid': {
            textAlign: 'start',
            padding: '16px 20px 16px 20px',
            borderLeft: '1px solid #d2d2d26b',
            [theme.breakpoints.between('xs', 'sm')]: {
                borderLeft: 'none',
                borderTop: '1px solid #d2d2d26b',
            },
            '&:first-child': {
                borderLeft: 'none',
                [theme.breakpoints.between('xs', 'sm')]: {
                    borderTop: 'none',
                },
            },
        },
    },
    searchBarGrid: {
        flexGrow: 4,
        '&:hover': {
            backgroundColor: '#fafafa',
            '-webkit-transition': 'background-color 0.4s',
            '-ms-transition': 'background-color 0.4s',
            transition: 'background-color 0.4s',
        },
    },
    searchBarButton: {
        padding: '23px 20px 22px 20px!important',
        textAlign: 'center!important',
        '&:hover': {
            backgroundColor: '#ffffff00',
        },
    },
    searchPlugins:{
        marginBottom: 8,
        textAlign: 'start'
    },
    sortPlugins:{
        marginBottom: 8,
        textAlign: 'end'
    },
    childAgesContainter: {
        width: '100%',
        display: 'grid',
        gridGap: 10,
        gridTemplateColumns: 'auto auto',
        padding: 10
    },
    childAgesItem: {
        padding: 5
    },
    scrollUp: {
        bottom: 140,
        color: '#ffffff',
        width: 60,
        cursor: 'pointer',
        height: 45,
        display: 'none',
        zIndex: 3,
        position: 'fixed',
        background: '#0f55a6b3',
        textAlign: 'center',
        lineHeight: 4,
        boxShadow: '0px 0px 5px #6787d2ba',
        borderRadius: '0 4px 4px 0',
    },
    scrollUpOn: {
        display: 'block!important'
    },
    maxRoomError: {
        marginTop: 15,
        backgroundColor: '#ffffff'
    },
    noRoomAlert: {
        backgroundColor: '#ffffff'
    },
    pluginContainer: {
        marginTop: 10,
        marginBottom: 10
    },
    roomSorter: {
        minWidth: 140,
        justifyContent: 'space-between',
        textTransform: 'capitalize',
    },
    refCodeButton: {
        fontSize: '0.86rem',
        textTransform: 'capitalize',
        padding: '2px 8px 2.9px 10p',
    },
    ibeDateRangePicker: {
        "& .MuiPickersSlideTransition-root": {
            overflowY: 'hidden'
        }
    }
}))

const getCacheKey  = (baseUrl) => {
    return axios({
        url: baseUrl + 'api/create/cache/key',
        method: 'post'
    }).then((response) => {
        if (response.status === 200 && response.data.success) {
            return response.data.value
        } else {
            return false
        }
    }).catch(()=>{
        return false
    })
}

const getHotelBookInfo = (baseUrl, uiToken) => {
    return axios({
        url: baseUrl + 'api/hotel/book/info/check',
        method: 'post',
        params: {
            startdate: moment(moment()).locale(defaultLocale).format(OREST_ENDPOINT.DATEFORMAT),
            uitoken: uiToken
        },
    }).then((response) => {
        if (response.status === 200 && response.data.success) {
            return response.data.data
        } else {
            return false
        }
    }).catch(() => {
        return false
    })
}

const getHotelTempGuestInfo = (baseUrl, clientGid) => {
    return axios({
        url: baseUrl + 'api/hotel/temp/guest/info',
        method: 'post',
        params: {
            clientGid: clientGid
        },
    }).then((response) => {
        if (response.status === 200 && response.data.success) {
            return response.data.data
        } else {
            return false
        }
    }).catch(() => {
        return false
    })
}

const getAvailabilityRoomList = (baseUrl, uitoken, query) => {
    let useParams = {
        uitoken: uitoken,
        ci: moment(query.checkinDate).locale(defaultLocale).format(OREST_ENDPOINT.DATEFORMAT),
        co: moment(query.checkoutDate).locale(defaultLocale).format(OREST_ENDPOINT.DATEFORMAT),
        resdate: moment(moment()).locale(defaultLocale).format(OREST_ENDPOINT.DATEFORMAT),
        adult: query.adult,
        child: query.child,
        totalroom: query.totalroom,
    }

    if (query.clientid) {
        useParams.clientid = query.clientid
    }

    if (query.pricecurr) {
        useParams.pricecurr = query.pricecurr
    }

    if (query.refcode) {
        useParams.refcode = query.refcode
    }

    if (query.langcode) {
        useParams.langcode = query.langcode
    }

    return axios({
        url: baseUrl + 'api/roomtype/book/list',
        method: 'post',
        params: useParams,
    }).then((roomAvailabilityResponse) => {
        const roomAvailabilityData = roomAvailabilityResponse.data
        if (roomAvailabilityData.success === true && roomAvailabilityData.data.length > 0) {
            return {
                searchid: roomAvailabilityData.searchid,
                data: roomAvailabilityData.data,
            }
        } else {
            return false
        }
    })
}

const getHotelPayType = (baseUrl, uiToken) => {
    return axios({
        url: baseUrl + 'api/hotel/payment/type',
        method: 'post',
        params: {
            uitoken: uiToken,
        },
    }).then((response) => {
        if (response.status === 200) {
            return response.data
        } else {
            return false
        }
    }).catch(() => {
        return false
    })
}

const SearchBarButton = (props) => {
    const { title, value } = props
    return (
        <div {...props} style={{ cursor: 'pointer' }}>
            <Typography variant="button" display="block" color="textPrimary">
                {title}
            </Typography>
            <Typography variant="caption" display="block" color="textSecondary">
                {value}
            </Typography>
        </div>
    )
}

const CurrencySelection = (props) => {
    const { list, selectValue, onChange, disabled } = props
    return (
        <FormControl variant="outlined" fullWidth size="small" disabled={disabled} style={{width: 120}}>
            <Select
                disabled={disabled}
                labelId="currency-select-label"
                id="currency-select"
                value={selectValue}
                onChange={onChange}
            >
                {list && list.sort((a, b) => a.id - b.id).map((item, i)=>
                    <MenuItem key={i} value={item.code}>{getSymbolFromCurrency(item.code)} {item.code}</MenuItem>
                )}
            </Select>
        </FormControl>
    )
}

const DifferentCurrencyAlert = (props) => {
    const { open, description, closeLabel, onClose } = props
    return (
        <Dialog
            fullWidth
            maxWidth="sm"
            open={open}
            onClose={onClose}
            aria-describedby="different-currency-alert-description"
        >
            <DialogContent dividers>
                <Alert variant="outlined" severity="info">
                    {description}
                </Alert>
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={()=> onClose()}>
                    {closeLabel}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

const assignValue = val => {
    if(!Boolean(val)) return Infinity
    return val
}

const roomSortKeys = {
    populerSelection: 10,
    lowPrice: 20,
    highPrice: 30
}

const roomSortValues = [
    {
        key: roomSortKeys.populerSelection,
        label: 'str_popularChoices',
    },
    {
        key: roomSortKeys.lowPrice,
        label: 'str_lowestPrice',
    },
    {
        key: roomSortKeys.highPrice,
        label: 'str_highestPrice',
    }
]

const RoomSorter = (props) => {
    const classes = useStyles()
    const {value, onChange,disabled} = props
    const { t } = useTranslation()

    const handleOnClick = (e, popupState) => {
        onChange(e)
        popupState.close()
    }

    return (
        <PopupState variant="popover" popupId="roomsorter-menu">
            {(popupState) => (
                <React.Fragment>
                    <Button className={classes.roomSorter} variant="contained" size="small" color="primary" startIcon={<SortIcon />}  disableElevation disabled={disabled} {...bindTrigger(popupState)}>
                        {t(roomSortValues[roomSortValues.findIndex(roomSort => roomSort.key === value)].label)}
                    </Button>
                    <Menu {...bindMenu(popupState)}>
                        {roomSortValues.map((roomSort, key) =>
                            <MenuItem key={key} value={roomSort.key} onClick={(e) => handleOnClick(e, popupState)}>{t(roomSort.label)}</MenuItem>,
                        )}
                    </Menu>
                </React.Fragment>
            )}
        </PopupState>
    )
}

function roomSorting(roomList, sortKey) {
    switch (sortKey) {
        case roomSortKeys.lowPrice:
            return roomList && roomList.length > 0 && roomList.sort((a, b) => assignValue(b.totalroom) - assignValue(a.totalroom)).sort((a, b) => assignValue(a.minsngrate) - assignValue(b.minsngrate)) || []
        case roomSortKeys.highPrice:
            return roomList && roomList.length > 0 && roomList.sort((a, b) => assignValue(b.totalroom) - assignValue(a.totalroom)).sort((a, b) => assignValue(b.minsngrate) - assignValue(a.minsngrate)) || []
        default:
            return roomList && roomList.length > 0 && roomList.sort((a, b) => assignValue(b.totalroom) - assignValue(a.totalroom)).sort((a, b) => assignValue(a.orderno) - assignValue(b.orderno)) || []
    }
}

const RoomsPage = (props) => {
    const classes = useStyles()
        , { GENERAL_SETTINGS, WEBCMS_DATA } = useContext(WebCmsGlobal)
        , { locale } = useContext(LocaleContext)
        , { t } = useTranslation()
        , { setOrestState } = useOrestAction()
        , { state, setToState } = props
        , { enqueueSnackbar } = useSnackbar()
        , [open, setOpen] = useState(false)
        , [useScrollUp, setUseScrollUp] = useState(false)
        , [isOpenCoDateSelect, setIsOpenCoDateSelect] = useState(false)
        , showAddons = Boolean(GENERAL_SETTINGS.hotelSettings.product) || Boolean(GENERAL_SETTINGS.hotelSettings.remark) || Boolean(GENERAL_SETTINGS.hotelSettings.transport)
        , isLogin = !!useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth)
        , infoLogin = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo || false)
        , clientBase = useSelector((state) => state?.orest?.state?.client || false)
        , [initialState, setInitialState] = useState({ hotelUiToken: false, hotelPaymentType: false })
        , [pageSizes, setPageSizes] = useState({
            width: '100%',
            height: '100%',
            imgHeight: '100%',
        })
        , [isButtonRouting, setIsButtonRouting] = useState(false)
        , router = useRouter()
        , [params, setParams] = useState({
            ci: router.query.ci || false,
            co: router.query.co || false,
            adult: router.query.adult || false,
            child: router.query.child || false,
            chdage: router.query['chdage[]'] || false,
            pricecurr: router.query.pricecurr || false,
            refcode: router.query.refcode || false,
        })
        , [useBookInfoPersist, setUseBookInfoPersist] = useState(false)
        , [isCheckingAvailableRooms, setIsCheckingAvailableRooms] = useState(false)
        , useRoomList = roomSorting(state.roomAvailabilityList, state.roomSortVal || roomSortKeys.populerSelection)

    useEffect(() => {
        if (WEBCMS_DATA?.assets?.meta?.googleTag) {
            TagManager.page.setChange({
                hotelName: WEBCMS_DATA?.assets?.meta?.title,
                hotelId: GENERAL_SETTINGS.HOTELREFNO,
                pageTitle: window.document.title,
                pagePath: location.href,
                pageStep: 'Room List',
                isGuest: isLogin,
            })
        }

        setPageSizes({
            width: window.innerWidth,
            height: window.innerHeight,
            imgHeight: window.innerHeight + 104.1
        })

        if(state.roomAvailabilityList && state.roomAvailabilityList.length === 0){
            setToState('ibe', ['bookingIsLoading'], true)
            loadHotelBookInfoSett().then(()=> {
                return true
            })
        }

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

    useEffect(() => {
        if (state.roomAvailabilityList && state.roomAvailabilityList.length === 0 && state.bookingState.stayDates[0] !== null && state.bookingState.stayDates[1] !== null) {
            let PERSIST_BOOK_INFO_DATA = localStorage.getItem(LOCAL_STORAGE_PERSIST_BOOK_INFO)
            PERSIST_BOOK_INFO_DATA = PERSIST_BOOK_INFO_DATA && JSON.parse(PERSIST_BOOK_INFO_DATA) || false

            const ciDate = moment(state.bookingState.stayDates[0]).format(OREST_ENDPOINT.DATEFORMAT_PARAMS)
                , coDate = moment(state.bookingState.stayDates[1]).format(OREST_ENDPOINT.DATEFORMAT_PARAMS)
                , perCiDate = PERSIST_BOOK_INFO_DATA?.checkinDate && moment(PERSIST_BOOK_INFO_DATA.checkinDate).format(OREST_ENDPOINT.DATEFORMAT_PARAMS) || false
                , perCoDate = PERSIST_BOOK_INFO_DATA?.checkoutDate && moment(PERSIST_BOOK_INFO_DATA.checkoutDate).format(OREST_ENDPOINT.DATEFORMAT_PARAMS) || false
                , usePersist = perCiDate && perCoDate && moment(ciDate, OREST_ENDPOINT.DATEFORMAT_PARAMS).diff(moment(perCiDate, OREST_ENDPOINT.DATEFORMAT_PARAMS), 'days') < 0 || false

            if (PERSIST_BOOK_INFO_DATA && usePersist && ciDate && coDate && perCiDate && perCoDate && ciDate !== perCiDate && coDate !== perCoDate && (!params.ci && !params.co)) {
                setUseBookInfoPersist(PERSIST_BOOK_INFO_DATA)
            } else {
                if(!isCheckingAvailableRooms){
                    setToState('ibe', ['bookingIsLoading'], true)
                    handleGetRoomList()
                }
            }
        }
    }, [state.bookingState.stayDates[0], state.bookingState.stayDates[1]])

    const handleSetPersistBookInfo = (PERSIST_BOOK_INFO_DATA) => {
        setToState('ibe', ['bookingState', 'stayDates'], [PERSIST_BOOK_INFO_DATA.checkinDate, PERSIST_BOOK_INFO_DATA.checkoutDate])
        setToState('ibe', ['bookingState', 'night'], PERSIST_BOOK_INFO_DATA.night)
        setToState('ibe', ['bookingState', 'adult'], PERSIST_BOOK_INFO_DATA.adult)
        setToState('ibe', ['bookingState', 'child'], PERSIST_BOOK_INFO_DATA.child)
        setToState('ibe', ['childAges'], PERSIST_BOOK_INFO_DATA.childAges || [])
    }

    const loadHotelBookInfoSett = async () => {
        let hotelUiToken = initialState.hotelUiToken,
            hotelPaymentType = initialState.hotelPaymentType

        if (!hotelUiToken) {
            hotelUiToken = await getCacheKey(GENERAL_SETTINGS.BASE_URL)
            setInitialState({ ...initialState, hotelUiToken: hotelUiToken })
        }

        if (!hotelPaymentType) {
            hotelPaymentType = await getHotelPayType(GENERAL_SETTINGS.BASE_URL, hotelUiToken)
            setInitialState({ ...initialState, hotelPaymentType: hotelPaymentType })
        }

        let hotelBookingInfo = false
        if (!state.hotelBookingInfo) {
            hotelBookingInfo = await getHotelBookInfo(GENERAL_SETTINGS.BASE_URL, hotelUiToken)
            setToState('ibe', ['hotelUiToken'], hotelUiToken)
            setToState('ibe', ['hotelBookingInfo'], hotelBookingInfo)
        }

        if (!clientBase && router.query.clientGid) {
            const tempGuestInformation = await getHotelTempGuestInfo(GENERAL_SETTINGS.BASE_URL, router.query.clientGid)
            setOrestState(['client'], tempGuestInformation)
        }

        if (!state.hotelPaymentType && hotelPaymentType?.paymentypes.length > 0) {
            setToState('ibe', ['hotelPaymentType'], hotelPaymentType)
            const defaultPayType = hotelPaymentType && hotelPaymentType.paymentypes && hotelPaymentType.paymentypes.sort((a, b) => a.index - b.index).sort((a, b) => b.isdef - a.isdef)[0]
            setToState('ibe', ['selectedPaymentType'], defaultPayType)
            setToState('ibe', ['selectedPaymentTypeId'], Number(defaultPayType.id || false))
            setToState('ibe', ['selectedPaymentTypeMid'], Number(defaultPayType.mid || false))
        }

        if (params.refcode) {
            setToState('ibe', ['bookingState', 'refcode'], params.refcode)
        }

        if (state.bookingState.stayDates[0] === null && state.bookingState.stayDates[1] === null) {
            let CHECKIN_DATE = params?.ci && moment(params.ci, OREST_ENDPOINT.DATEFORMAT_PARAMS) || hotelBookingInfo?.startdate && moment(hotelBookingInfo.startdate, OREST_ENDPOINT.DATEFORMAT).isAfter(moment()) && moment(hotelBookingInfo.startdate, OREST_ENDPOINT.DATEFORMAT) || moment()
                , CHECKOUT_DATE = params?.co && moment(params.co, OREST_ENDPOINT.DATEFORMAT_PARAMS) || moment(CHECKIN_DATE).add(1, 'days')

            if (params.adult || params.child) {
                if (hotelBookingInfo.maxpax >= params.adult) {
                    setToState('ibe', ['bookingState', 'adult'], params.adult && Number(params.adult) || 1)
                } else {
                    const maxPax = hotelBookingInfo?.maxpax || 0
                        , defPax = GENERAL_SETTINGS?.hotelSettings?.defpax || 0
                        , usePax = (maxPax >= defPax) ? defPax : maxPax
                    setToState('ibe', ['bookingState', 'adult'], usePax || maxPax)
                }

                let childState = 0
                    , childAgesState = []
                Array.from({ length: Number(params.child) }).map((chd, i) => {
                    if (hotelBookingInfo.maxchd >= i) {
                        childState = i + 1

                        let queryChdAge = params?.chdage[i] && Number(params.chdage[i]) || 1
                        if (queryChdAge > hotelBookingInfo.maxchdage) {
                            queryChdAge = hotelBookingInfo.maxchdage
                        }

                        const newValue = { ageno: childState, age: queryChdAge, indexno: childState }
                        childAgesState = [...childAgesState, newValue]
                    }
                })

                setToState('ibe', ['bookingState', 'child'], childState)
                setToState('ibe', ['childAges'], childAgesState)
            } else {
                const maxPax = hotelBookingInfo?.maxpax || 0
                    , defPax = GENERAL_SETTINGS?.hotelSettings?.defpax || 0
                    , usePax = (maxPax >= defPax) ? defPax : maxPax
                setToState('ibe', ['bookingState', 'adult'], usePax || 1)
            }

            if (params.pricecurr && hotelBookingInfo.currencycode !== params.pricecurr && hotelBookingInfo?.currencyList) {
                const useCurrency = hotelBookingInfo.currencyList.filter(currency => currency.code === params.pricecurr)
                if (useCurrency?.length > 0) {
                    setToState('ibe', ['diffCurrency', 'use'], useCurrency[0].code)
                    setToState('ibe', ['diffCurrency', 'value'], useCurrency[0].code)
                }
            }

            let diffDate = CHECKOUT_DATE.diff(CHECKIN_DATE, 'days')
            setToState('ibe', ['bookingState', 'stayDates'], [CHECKIN_DATE, CHECKOUT_DATE])
            setToState('ibe', ['bookingState', 'night'], diffDate)
        }

        return true
    }

    const handleGetRoomList = async () => {
        setIsCheckingAvailableRooms(true)
        localStorage.removeItem(LOCAL_STORAGE_PERSIST_BOOK_INFO)

        if ((state.selectedRooms && state.selectedRooms.length > 0) && (state.diffCurrency.value !== state.diffCurrency.use)) {
            setToState('ibe', ['diffCurrency', 'isAlert'], true)
            return
        }

        setToState('ibe', ['roomAvailabilityList'], [])

        let useParams = {
            checkinDate: useBookInfoPersist?.ciDate || state.bookingState.stayDates[0],
            checkoutDate: useBookInfoPersist?.coDate || state.bookingState.stayDates[1],
            adult: useBookInfoPersist?.adult || state.bookingState.adult,
            child: useBookInfoPersist?.child || state.bookingState.child,
            totalroom: 1,
            night: state.bookingState.night,
            childAges: state.childAges
        }

        if (clientBase || infoLogin && infoLogin?.refid) {
            useParams.clientid = clientBase?.id || infoLogin.refid
        }

        if (state.bookingState.refcode) {
            useParams.refcode = state.bookingState.refcode
        }

        if (state.diffCurrency.value) {
            useParams.pricecurr = state.diffCurrency.value
        }

        useParams.langcode = locale

        const getRoomList = await getAvailabilityRoomList(GENERAL_SETTINGS.BASE_URL, state.hotelUiToken, useBookInfoPersist ? useBookInfoPersist : useParams)

        if(getRoomList?.data &&  getRoomList.data.length > 0){
            localStorage.setItem(LOCAL_STORAGE_PERSIST_BOOK_INFO, JSON.stringify(useParams))
        }

        if (WEBCMS_DATA?.assets?.meta?.googleTag) {
            TagManager.booking.setRoomList({
                eventLabel: 'Room List',
                hotelName: WEBCMS_DATA?.assets?.meta?.title,
                hotelId: GENERAL_SETTINGS.HOTELREFNO,
                ciDate: moment(useParams.checkinDate).format(OREST_ENDPOINT.DATEFORMAT),
                coDate: moment(useParams.checkoutDate).format(OREST_ENDPOINT.DATEFORMAT),
                adult: useParams.adult,
                child: useParams.child,
                childAges: state.childAges,
                currencyCode: state?.diffCurrency?.value || state.hotelBookingInfo.currencycode,
                langCode: locale,
                promoCode: state.bookingState.refcode || 'generic',
                isLogin: isLogin,
                impressionsData: getRoomList.data,
            })
        }

        if (state.diffCurrency.value && state.diffCurrency.value === getRoomList?.data[0]?.pricecurr) {
            setToState('ibe', ['diffCurrency', 'use'], getRoomList?.data[0]?.pricecurr)
        } else {
            setToState('ibe', ['diffCurrency', 'use'], false)
        }

        if (window?.innerWidth <= 959 && window?.pageYOffset <= 500) {
            window.scrollTo({
                top: 542,
                behavior: 'smooth',
            })
        }

        setToState('ibe', ['roomAvailabilityList'], getRoomList.data)
        setToState('ibe', ['searchid'], getRoomList.searchid)
        setToState('ibe', ['bookingIsChange'], false)
        setToState('ibe', ['bookingIsLoading'], false)
        setIsCheckingAvailableRooms(false)
    }

    const handleScroll = () => {
        let windowSize = window?.innerWidth || document?.documentElement?.clientWidth || document?.body?.clientWidth || 0
        if (windowSize <= 959 && window?.pageYOffset > 100) {
            setUseScrollUp(true)
        } else {
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
                if(showAddons){
                    router.push ({
                        pathname: '/booking/addons',
                        query: router.query
                    })
                }else {
                    router.push ({
                        pathname: '/booking/details',
                        query: router.query
                    })
                }
            }

        } else {
            enqueueSnackbar(t('str_pleaseSelectRoom'), { variant: 'warning', autoHideDuration: 3000 })
        }
        handleScrollTop()
    }

    const handleSelectDate = (date) => {
        if (date && date[0] && date[0]._d && date[1] && date[1]._d) {
            const checkinDate = date[0]
                , checkoutDate = date[1]
                , diffDate = checkoutDate.diff(checkinDate, 'days')

            if (state.hotelBookingInfo.minStay > diffDate) {
                enqueueSnackbar(t('str_youHaveToChooseAMinOfDays', { day: state.hotelBookingInfo.minStay }), {
                    variant: 'warning',
                    autoHideDuration: 3000,
                })
            } else {
                setToState('ibe', ['bookingState', 'stayDates'], [checkinDate, checkoutDate])
                setToState('ibe', ['bookingState', 'night'], diffDate)
                setToState('ibe', ['bookingIsChange'], true)
            }
        }
    }

    const handleChild = (value, type) => {
        if (type === 'inc' && value > state.bookingState.child) {
            if (state.hotelBookingInfo.maxchd > state.bookingState.child) {
                const childAges = state.childAges
                setToState('ibe', ['bookingState', 'child'], value)
                const newValue = { ageno: state.bookingState.child + 1, age: 1, indexno: state.bookingState.child + 1 }
                setToState('ibe', ['childAges'], [...childAges, newValue])
                if (Number(state.bookingState.child) !== Number(value)) {
                    setToState('ibe', ['bookingIsChange'], true)
                }
            }
        } else {
            if (type === 'dec' && state.bookingState.child > 0) {
                setToState('ibe', ['bookingState', 'child'], value)
                const childAges = state.childAges
                childAges.pop()
                setToState('ibe', ['childAges'], childAges)
                if (Number(state.bookingState.child) !== Number(value)) {
                    setToState('ibe', ['bookingIsChange'], true)
                }
            }
        }
    }

    const handleSelectChildAge = (e) => {
        e.stopPropagation()
        let childAges = state.childAges
        const ageNo = e.currentTarget.dataset.ageno
        const age = e.currentTarget.dataset.value
        if (childAges.length > 0) {
            const ageIndex = childAges.findIndex((item) => item.ageno === Number(ageNo))
            childAges[ageIndex].age = age
            setToState('ibe', ['childAges'], childAges)
        }
    }

    const handleChangeRefCode = (e) => {
        setToState('ibe', ['bookingState', 'refcode'], e.target.value)
    }

    const handleRefCodeReset = () => {
        setToState('ibe', ['bookingState', 'refcode'], '')
    }

    const handleScrollTop = () => {
        return window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    const maxRoomErrorMsg = () => {
        const clickTo = `mailto:${GENERAL_SETTINGS?.hotelSettings?.notifemail_upd || ''}`
        return (
            <React.Fragment>
                <strong><a href={clickTo}>{GENERAL_SETTINGS?.hotelSettings?.notifemail_upd || ''}</a> (</strong>{location?.href || ''}<strong>)</strong>
            </React.Fragment>
        )
    }

    const handleRoomSort = (e) => {
        setToState('ibe', ['bookingIsLoading'], true)
        setToState('ibe', ['roomSortVal'], e.target.value)
        setToState('ibe', ['bookingIsLoading'], false)
    }

    return (
        <BookingLayout>
            {WEBCMS_DATA?.assets?.images?.background ? (
                <div style={{ width: pageSizes.width, height: pageSizes.height, top:0, left: 0, overflow: 'hidden', position: 'fixed', zIndex: -3 }}>
                    <ul style={{padding: 0}}>
                        <li style={{display: 'list-item'}}>
                            <img src={GENERAL_SETTINGS.STATIC_URL + WEBCMS_DATA.assets.images.background} style={{width: pageSizes.width, height: pageSizes.imgHeight,}}  alt=""/>
                        </li>
                    </ul>
                </div>
            ): null}
            <div className={clsx(classes.scrollUp, {[classes.scrollUpOn]: useScrollUp})} onClick={()=> handleScrollTop()}>
                <Icon>expand_less</Icon>
            </div>
            <div className={classes.topSpaceBox} />
            <Container maxWidth={settings.containerMaxWidth} className={classes.containerBooking}>
                <Grid container spacing={settings.containerSpacing}>
                    <Grid item xs={settings.leftColumn.xs} sm={settings.leftColumn.sm} md={settings.leftColumn.md} lg={settings.leftColumn.lg} xl={settings.leftColumn.xl}>
                        <Grid container spacing={0}>
                            <React.Fragment>
                                <Grid item xs={12}>
                                    <Box className={classes.searchBar}>
                                        <div className={classes.searchBarContainer}>
                                            <div className={classes.searchBarGrid}>
                                                <PopupState variant='popover' popupId='guest-info'>
                                                    {(popupState) => (
                                                        <div>
                                                            <SearchBarButton
                                                                title={t('str_guests')}
                                                                value={`${state.bookingState && state.bookingState.adult} ${t('str_adult')}, ${state.bookingState && state.bookingState.child} ${t('str_child')}`}
                                                                {...bindTrigger(popupState)}
                                                            />
                                                            <Popover
                                                                {...bindPopover(popupState)}
                                                                anchorOrigin={{
                                                                    vertical: 'bottom',
                                                                    horizontal: 'center',
                                                                }}
                                                                transformOrigin={{
                                                                    vertical: 'top',
                                                                    horizontal: 'center',
                                                                }}
                                                            >
                                                                <div>
                                                                    <List>
                                                                        <ListItem alignItems='flex-start'>
                                                                            <SpinEdit
                                                                                disabled={isButtonRouting}
                                                                                max={state.hotelBookingInfo.maxpax}
                                                                                min={1}
                                                                                defaultValue={state.bookingState && state.bookingState.adult}
                                                                                padding={2}
                                                                                size='small'
                                                                                label={t('str_adult')}
                                                                                onChange={(value) => {
                                                                                    setToState('ibe', ['bookingState', 'adult'], value)
                                                                                    if (Number(state.bookingState.adult) !== Number(value)) {
                                                                                        setToState('ibe', ['bookingIsChange'], true)
                                                                                    }
                                                                                }}
                                                                            />
                                                                        </ListItem>
                                                                        {(state.hotelBookingInfo.maxchd > 0 && state.hotelBookingInfo.maxchdage > 0) && (
                                                                            <React.Fragment>
                                                                                <Divider variant='middle' component='li' />
                                                                                <ListItem alignItems='flex-start'>
                                                                                    <SpinEdit
                                                                                        max={state.hotelBookingInfo.maxchd}
                                                                                        defaultValue={state.bookingState && state.bookingState.child}
                                                                                        padding={2}
                                                                                        size='small'
                                                                                        label={t('str_child')}
                                                                                        onChange={(value, type) => handleChild(value, type)}
                                                                                    />
                                                                                </ListItem>
                                                                            </React.Fragment>
                                                                        )}
                                                                        <ListItem>
                                                                            {state.hotelBookingInfo.maxchd > 0 && state.hotelBookingInfo.maxchdage > 0 && state.bookingState.child > 0 && (
                                                                                <div
                                                                                    className={classes.childAgesContainter}>
                                                                                    {Array.from({ length: state.bookingState.child }).map((chd, i) => {
                                                                                        let ageNo = i + 1,
                                                                                            ageValue = 1,
                                                                                            realIndex = i
                                                                                        if (state.childAges && state.childAges.findIndex((item) => item.ageno === Number(ageNo)) >= 0) {
                                                                                            ageValue = state.childAges.find((item) => item.ageno === Number(ageNo)).age
                                                                                        }
                                                                                        return (
                                                                                            <div
                                                                                                className={classes.childAgesItem}
                                                                                                key={ageNo}>
                                                                                                <TextField
                                                                                                    disabled={isButtonRouting}
                                                                                                    required
                                                                                                    fullWidth
                                                                                                    id={`select-age-${ageNo}`}
                                                                                                    size='small'
                                                                                                    variant='outlined'
                                                                                                    label={`${ageNo}. ${t('str_childAge')}`}
                                                                                                    onChange={(e) => handleSelectChildAge(e)}
                                                                                                    value={ageValue}
                                                                                                    select
                                                                                                >
                                                                                                    {Array.from({ length: state.hotelBookingInfo.maxchdage }).map((chd, i) => {
                                                                                                        let age = i + 1
                                                                                                        return (
                                                                                                            <MenuItem
                                                                                                                key={age}
                                                                                                                data-indexno={realIndex}
                                                                                                                data-ageno={ageNo}
                                                                                                                value={age}>
                                                                                                                {age}
                                                                                                            </MenuItem>
                                                                                                        )
                                                                                                    })}
                                                                                                </TextField>
                                                                                            </div>
                                                                                        )
                                                                                    })}
                                                                                </div>
                                                                            )}
                                                                        </ListItem>
                                                                        <ListItem style={{
                                                                            justifyContent: 'end',
                                                                            paddingRight: 32,
                                                                        }}>
                                                                            <Button size='small' variant='outlined' color='primary' onClick={() => popupState.close()}>{t('str_close')}</Button>
                                                                        </ListItem>
                                                                    </List>
                                                                </div>
                                                            </Popover>
                                                        </div>
                                                    )}
                                                </PopupState>
                                            </div>
                                            <div className={classes.searchBarGrid}>
                                                <SearchBarButton
                                                    title={t('str_checkIn')}
                                                    value={state.bookingState.stayDates[0] && moment(state.bookingState.stayDates[0]).format('dd, MMM DD, YYYY') || t('str_chooseDate')}
                                                    onClick={() => {
                                                        setIsOpenCoDateSelect(false)
                                                        setOpen(true)
                                                    }}
                                                />
                                            </div>
                                            <div className={classes.searchBarGrid}>
                                                <SearchBarButton
                                                    title={t('str_night')}
                                                    value={state.bookingState.night}
                                                />
                                            </div>
                                            <div className={classes.searchBarGrid}>
                                                <SearchBarButton
                                                    title={t('str_checkOut')}
                                                    value={state.bookingState.stayDates[1] && moment(state.bookingState.stayDates[1]).format('dd, MMM DD, YYYY') || t('str_chooseDate')}
                                                    onClick={() => {
                                                        setIsOpenCoDateSelect(true)
                                                        setOpen(true)
                                                    }}
                                                />
                                            </div>
                                            <div className={classes.searchBarGrid}>
                                                <PopupState variant='popover' popupId='currency-info'>
                                                    {(popupState) => (
                                                        <div>
                                                            <SearchBarButton
                                                                title={t('str_currency')}
                                                                value={`${(state?.diffCurrency?.value || state?.hotelBookingInfo?.currencycode) && getSymbolFromCurrency(state?.diffCurrency?.value || state?.hotelBookingInfo?.currencycode || '') || '-'} ${state?.diffCurrency?.value || state?.hotelBookingInfo?.currencycode || ''}`}
                                                                {...bindTrigger(popupState)}
                                                            />
                                                            <Popover
                                                                {...bindPopover(popupState)}
                                                                anchorOrigin={{
                                                                    vertical: 'bottom',
                                                                    horizontal: 'center',
                                                                }}
                                                                transformOrigin={{
                                                                    vertical: 'top',
                                                                    horizontal: 'center',
                                                                }}
                                                            >
                                                                <div>
                                                                    <List>
                                                                        <ListItem alignItems='flex-start'>
                                                                            <CurrencySelection
                                                                                disabled={isButtonRouting}
                                                                                label={t('str_currency')}
                                                                                list={state.hotelBookingInfo.currencyList}
                                                                                selectValue={state?.diffCurrency?.value || state?.hotelBookingInfo?.currencycode || ''}
                                                                                onChange={(e) => {
                                                                                    setToState('ibe', ['diffCurrency', 'value'], e.target.value)
                                                                                }}
                                                                            />
                                                                        </ListItem>
                                                                    </List>
                                                                </div>
                                                            </Popover>
                                                        </div>)}
                                                </PopupState>
                                            </div>
                                            <div className={classes.searchBarGrid + ' ' + classes.searchBarButton}>
                                                <ProgressButton
                                                    isLoading={!useBookInfoPersist && (state.bookingIsLoading)}>
                                                    <Button
                                                        disabled={!useBookInfoPersist && (isButtonRouting || state.bookingIsLoading)}
                                                        onClick={async () => {
                                                            setUseBookInfoPersist(false)
                                                            setToState('ibe', ['bookingIsLoading'], true)
                                                            await handleGetRoomList()
                                                        }}
                                                        variant='contained'
                                                        size='small'
                                                        color='primary'
                                                        disableElevation
                                                    >
                                                        {t('str_search')}
                                                    </Button>
                                                </ProgressButton>
                                            </div>
                                        </div>
                                        <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                                            <DateRangePicker
                                                className={classes.ibeDateRangePicker}
                                                minDate={isOpenCoDateSelect ? state.bookingState.stayDates[0] : moment()}
                                                inputFormat='__/__/____'
                                                open={open}
                                                onOpen={() => setOpen(true)}
                                                onClose={() => setOpen(false)}
                                                value={state.bookingState.stayDates}
                                                onChange={(newValue) => handleSelectDate(newValue)}
                                                renderInput={(startProps, endProps) => (
                                                    <div style={{ display: 'none' }}>
                                                        <input ref={startProps.inputRef} {...startProps.inputProps} />
                                                        <input ref={endProps.inputRef} {...endProps.inputProps} />
                                                    </div>
                                                )}
                                            />
                                        </LocalizationProvider>
                                    </Box>
                                </Grid>
                            </React.Fragment>
                            <Grid item xs={12}>
                                <BookingStepper classes={{ root: classes.stepperRoot }} activeStep={bookingStepCodes.rooms} steps={getBookingSteps(bookingSteps, showAddons)}/>
                                <Grid
                                    className={classes.pluginContainer}
                                    container
                                    direction="row"
                                    justify="space-between"
                                    alignItems="center"
                                >
                                    <Grid item xs={5} sm={8} className={classes.searchPlugins}>
                                        <PopupState variant='popover' popupId='referance-code'>
                                            {(popupState) => (
                                                <React.Fragment>
                                                    <Badge color='secondary' variant='dot' invisible={!state.bookingState.refcode}>
                                                        <Button startIcon={<SupervisorAccountIcon />} className={classes.refCodeButton} size='small' variant='contained' color='primary' disableElevation disabled={isButtonRouting} {...bindTrigger(popupState)}>
                                                            {t('str_rateCode')}
                                                        </Button>
                                                    </Badge>
                                                    <Popover
                                                        {...bindPopover(popupState)}
                                                        anchorOrigin={{
                                                            vertical: 'bottom',
                                                            horizontal: 'left',
                                                        }}
                                                        transformOrigin={{
                                                            vertical: 'top',
                                                            horizontal: 'left',
                                                        }}
                                                    >
                                                        <Box p={2} style={{ maxWidth: 260 }}>
                                                            <Grid container spacing={1} direction='row' justify='space-between' alignItems='flex-end'>
                                                                <Grid item xs={12}>
                                                                    <TextField
                                                                        fullWidth
                                                                        id='referance-code'
                                                                        variant='outlined'
                                                                        size='small'
                                                                        label={t('str_code')}
                                                                        value={state.bookingState.refcode || ''}
                                                                        onChange={(newValue) => handleChangeRefCode(newValue)}
                                                                        InputProps={{
                                                                            endAdornment: (
                                                                                <InputAdornment position='end'>
                                                                                    <IconButton
                                                                                        color='secondary'
                                                                                        size='small'
                                                                                        disabled={!state.bookingState.refcode || state.bookingIsLoading}
                                                                                        onClick={() => handleRefCodeReset()}
                                                                                    >
                                                                                        <Icon>close</Icon>
                                                                                    </IconButton>
                                                                                </InputAdornment>
                                                                            ),
                                                                        }}
                                                                    />
                                                                </Grid>
                                                                <Grid item>
                                                                    <Button variant='outlined' color='primary' size='small' disableElevation disabled={state.bookingIsLoading} onClick={() => popupState.close()}>
                                                                        {t('str_close')}
                                                                    </Button>
                                                                </Grid>
                                                                <Grid item>
                                                                    <Button
                                                                        variant='contained'
                                                                        color='primary'
                                                                        size='small'
                                                                        disableElevation
                                                                        disabled={state.bookingIsLoading}
                                                                        onClick={async () => {
                                                                            setToState('ibe', ['bookingIsLoading'], true)
                                                                            await handleGetRoomList()
                                                                        }}>
                                                                        {t('str_apply')}
                                                                    </Button>
                                                                </Grid>
                                                            </Grid>
                                                        </Box>
                                                    </Popover>
                                                </React.Fragment>
                                            )}
                                        </PopupState>
                                    </Grid>
                                    <Grid item xs={7} sm={4} className={classes.sortPlugins}>
                                        <RoomSorter disabled={isButtonRouting} value={state.roomSortVal || roomSortKeys.populerSelection} onChange={(e)=> handleRoomSort(e)} />
                                    </Grid>
                                </Grid>
                                {state.isMaxRoomError ?
                                    <Alert severity="info" classes={{ root: classes.maxRoomError }} onClose={() =>  setToState('ibe', ['isMaxRoomError'], false)}>
                                        <AlertTitle>{t('str_info')}</AlertTitle>
                                        {t('str_pleaseContactInfoEmailAndIbeAddressForAdditionalRoomRequest', { infoEmailAndIbeAddress: maxRoomErrorMsg() })}
                                    </Alert>: null
                                }
                                <Grid container spacing={0} style={{paddingTop: 10}}>
                                    {(!useBookInfoPersist && (!state.hotelBookingInfo || state.bookingIsLoading)) ?
                                        <Grid item xs={12}>
                                            <RoomCardLoading length={3} />
                                        </Grid>
                                        : useBookInfoPersist ? (
                                            <BookInfoMessage
                                                useData={useBookInfoPersist || null}
                                                handleUse={async () => {
                                                    setUseBookInfoPersist(false)
                                                    handleSetPersistBookInfo(useBookInfoPersist)
                                                    setToState('ibe', ['bookingIsLoading'], true)
                                                    await handleGetRoomList()
                                                }}
                                                handleClose={async () => {
                                                    setUseBookInfoPersist(false)
                                                    setToState('ibe', ['bookingIsLoading'], true)
                                                    await handleGetRoomList()
                                                }}
                                            />
                                        ) : state.bookingIsChange ?
                                            <Grid item xs={12}>
                                                <Box style={{ height: '20vh', paddingTop: 30 }}>
                                                    <Alert variant='outlined' severity='info' className={classes.noRoomAlert}>
                                                        {t('str_youWillNeedToCheckAvailabilityAgainForYourChangesToTakeEffect')}
                                                    </Alert>
                                                </Box>
                                            </Grid>
                                            : state?.roomAvailabilityList && state?.roomAvailabilityList.length > 0 ?
                                                    useRoomList.map((room, index) => {
                                                    let totalroom = room.totalroom, searchidSelectRoom = 0
                                                    if (state.selectedRooms) {
                                                        state.selectedRooms.map((roomListItem) => {
                                                            if (roomListItem.roomsearchid === state.searchid && roomListItem.roomtypeid === room.id) {
                                                                searchidSelectRoom++
                                                            }
                                                        })
                                                    }

                                                    totalroom = totalroom - searchidSelectRoom
                                                    if (totalroom > 0) {
                                                        return (
                                                            <Grid item xs={12} key={index}>
                                                                <RoomCard key={index} info={room} totalRoomSelected={totalroom} isDisabled={isButtonRouting} />
                                                            </Grid>
                                                        )
                                                    }else {
                                                        return (
                                                            <Grid item xs={12} key={index}>
                                                                <RoomCard key={index} info={room} totalRoomSelected={totalroom} isDisabled={true} roomUnAvailable={true} />
                                                            </Grid>
                                                        )
                                                    }
                                                }): (
                                                    <Grid item xs={12}>
                                                        <Box style={{ height: '20vh', paddingTop: 30 }}>
                                                            <Alert variant='outlined' severity='info' className={classes.noRoomAlert}>
                                                                {t('str_noSuitableRoomTypeWasFoundForTheseOptionsYouCanChangeItAndTryAgainIfYouWish')}
                                                            </Alert>
                                                        </Box>
                                                    </Grid>
                                                )
                                    }
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={settings.rightColumn.xs} sm={settings.rightColumn.sm} md={settings.rightColumn.md} lg={settings.rightColumn.lg} xl={settings.rightColumn.xl}>
                        <ReservationCart bookingActiveStep={bookingStepCodes.rooms} handleNextStep={() => handleNext()} isDisabled={isButtonRouting}/>
                    </Grid>
                </Grid>
            </Container>
            <DifferentCurrencyAlert
                open={state.diffCurrency.isAlert}
                description={t('str_inOrderForTheCurrencyChangeToBeAppliedYouMustRemoveTheRoomsYouHaveSelectedInOtherCurrencyTypes')}
                closeLabel={t('str_close')}
                onClose={() => setToState('ibe', ['diffCurrency', 'isAlert'], false)}
            />
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

export default connect(mapStateToProps, mapDispatchToProps)(RoomsPage)