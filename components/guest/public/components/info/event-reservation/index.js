import React, { useContext, useEffect, useState, useCallback } from 'react'
import clsx from 'clsx'
import axios from 'axios'
import { connect, useSelector } from 'react-redux'
import {List, UseOrest, Update, ViewList, Delete} from '@webcms/orest'
import { setToState, updateState } from 'state/actions'
import {Box, Container, Paper, Typography} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import useTranslation from 'lib/translations/hooks/useTranslation'
import WebCmsGlobal from 'components/webcms-global'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepConnector from '@material-ui/core/StepConnector'
import Button from '@material-ui/core/Button'
import StepLabel from '@material-ui/core/StepLabel'
import PersonIcon from '@material-ui/icons/Person'
import TodayIcon from '@material-ui/icons/Today'
import RestaurantMenuIcon from '@material-ui/icons/RestaurantMenu'
import DoneIcon from '@material-ui/icons/Done'
import ListAltIcon from '@material-ui/icons/ListAlt'
import SpaIcon from '@material-ui/icons/Spa'
import VisibilityIcon from '@material-ui/icons/Visibility'
import Grid from '@material-ui/core/Grid'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import SpinEdit from '@webcms-ui/core/spin-edit'
import {
    TRANSTYPES,
    OREST_ENDPOINT,
    REQUEST_METHOD_CONST,
    checkResponse,
    isObjectEmpty,
    isZero,
    notZero,
    responseData, jsonGroupBy,
} from 'model/orest/constants'
import EventMenuList from './event-menu-list'
import Confirmation from './confirmation'
import * as global from '@webcms-globals'
import { FALSE } from 'model/globals'
import LoadingSpinner from 'components/LoadingSpinner'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Slider from 'react-slick'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import CardImage from '@webcms-ui/core/card-image'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import { sendGuestChangeNotifyMail } from 'components/guest/account/Base/helper'
import ReservationInfo from "./reservation-info"
import RestaurantReservationSummary from "./restaurant-reservation-summary"
import ConfirmInfo from "./confirm-info"
import EventPayment from "./event-payment"
import moment from 'moment'
import HorizontalList from "components/HorizontalList"
import utfTransliteration from '@webcms-globals/utf-transliteration'
import { LocaleContext } from '../../../../../../lib/translations/context/LocaleContext'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        width: '100%',
    },
    eventLocCard: {
        maxWidth: '95%',
        marginBottom: 5,
        border: '3px solid transparent'
    },
    eventLocActive: {
        position: 'relative',
        border: '3px solid #8BC34A',
        '&:after': {
            fontFamily: "'Material Icons'",
            content: "'done'",
            fontSize: 25,
            position: 'absolute',
            right: 5,
            bottom: 0,
            color: '#8BC34A'
        },
    },
    eventLocTitle: {
        fontSize: 13,
        [theme.breakpoints.only('md')]: {
            fontSize: 12,
        },
        [theme.breakpoints.only('sm')]: {
            fontSize: 11,
        },
        [theme.breakpoints.only('xs')]: {
            fontSize: 10,
        },
    },
    button: {
        marginRight: theme.spacing(1),
    },
    completed: {
        display: 'inline-block',
    },
    instructions: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    appBar: {
        position: 'relative',
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
    formControl: {
        margin: theme.spacing(1),
        marginLeft: 0,
        maxWidth: '300px',
        minWidth: '300px',
        width: '100%',
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
    stepRoot: {
        "&.MuiStep-horizontal": {
            paddingLeft: "0",
            paddingRight: "0",
        }
    },
    stepLabel: {
        "& .MuiStepLabel-iconContainer": {
            paddingRight: "0"
        }
    },
    muiListRoot: {
        display: 'inline-flex'
    }
}))

const useColorlibStepIconStyles = makeStyles({
    root: {
        backgroundColor: '#ccc',
        zIndex: 1,
        padding: 10,
        color: '#fff',
        display: 'flex',
        borderRadius: '50%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    active: (props) => ({
        border: `1px solid ${props.isPortal ? '#44B3E4' : '#f1b80f'}`,
        backgroundColor: '#fff',
    }),
    completed: {
        backgroundColor: '#fff',
    },
})


const connectorStyle = makeStyles({
    active: {
        height: "2px",
        backgroundColor: '#44B3E4',
    },
    completed: {
        height: "2px",
        backgroundColor: '#44B3E4',
    },
})

const useColorIconStyles = makeStyles({
    root: {
        color: '#fff',
    },
    active: {
        backgroundColor: '#fff',
        color: '#2196F3',
    },
    completed: (props) => ({
        backgroundColor: '#fff',
        color: props.isPortal ? '#064989' : '#2196F3',
    }),
})

const RestaurantReservation = (props) => {
    const { state, isOpen, onClose, updateState, setToState, eventLocData, isPortal, sliderTitle, sliderDesc, sliderImg, isFromDetailPage, } = props
        , classes = useStyles()
        , { t } = useTranslation()
        , { transliteration } = utfTransliteration()
        , { GENERAL_SETTINGS, WEBCMS_DATA } = useContext(WebCmsGlobal)
        , { locale } = useContext(LocaleContext)
        , router = useRouter()
        , objLogInfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
        , MAX_CHILD_AGE = 6
        , [isReservationConfirm, setIsReservationConfirm] = useState(global.base.isFalse)
        , [reservationNo, setReservationNo] = useState(global.base.intZero)
        , isLogin = useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth) ? global.base.isTrue : global.base.isFalse
        , token = useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth.access_token || global.base.isFalse)
        , { enqueueSnackbar } = useSnackbar()
        , [saveResEvent, setSaveResEvent] = useState(global.base.isFalse)
        , [getEventLocData, setEventLocData] = useState(eventLocData)
        , [eventLocList, setEventLocList] = useState(global.base.isFalse)
        , [eventLocID, setEventLocID] = useState(getEventLocData.locid)
        , [eventlocDateListLoading, setEventlocDateListLoading] = useState(global.base.isFalse)
        , [eventlocDateSlotListLoading, setEventlocDateSlotListLoading] = useState(global.base.isFalse)
        , [eventLocCatLoading, setEventLocCatLoading] = useState(global.base.isFalse)
        , [reseventGid, setReseventGid] = useState(global.base.isFalse)
        , [isTimeAvailability, setIsTimeAvailability] = useState(global.base.isFalse)
        , [resPaxFix, setResPaxFix] = useState(global.base.isFalse)
        , [resEventDef, setResEventDef] = useState(global.base.isFalse)
        , [eventRulesIsLoading, setEventRulesIsLoading] = useState(global.base.isFalse)
        , isKiosk = router.query.kiosk === 'true' ? global.base.isTrue : global.base.isFalse
        , reservBase = state.clientReservation || false
        , clientBase = useSelector((state) => state.orest.state && state.orest.state.client)
        , hotelRefNo = state?.changeHotelRefno || state?.clientReservation?.hotelrefno || GENERAL_SETTINGS.HOTELREFNO
        , [confirmData, setConfirmData] = useState(null)
        , [activeStep, setActiveStep] = useState(global.base.intZero)

    const defaultValues = {
        totalPax: 1,
        totalChd: 0
    }

    let STEPPER =
        //TODO edit for payment step
        isPortal ? (
            isFromDetailPage ? (
                getEventLocData.isspares ? {
                    RESERVATION_INFO: 0,
                    SELECT_MENU_LIST: 1,
                    FINISH: 2
                } : getEventLocData.locdepartid && getEventLocData.lochasmenu ? {
                    RESERVATION_INFO: 0,
                    SELECT_MENU_LIST: 1,
                    FINISH: 2
                } : {
                    RESERVATION_INFO: 0,
                    SELECT_MENU_LIST: 1,
                    FINISH: 1
                }
            ) : (
                getEventLocData.isspares ? {
                    SELECT_NUMBER_OF_PEOPLE: 0,
                    SELECT_MENU_LIST: 1,
                    FINISH: 2
                } : getEventLocData.locdepartid && getEventLocData.lochasmenu ? {
                    SELECT_NUMBER_OF_PEOPLE: 0,
                    SELECT_MENU_LIST: 1,
                    FINISH: 2
                } : {
                    SELECT_NUMBER_OF_PEOPLE: 0,
                    SELECT_MENU_LIST: 1,
                    FINISH: 2
                }
            )
        ) : (
            getEventLocData.isspares ? {
                SELECT_NUMBER_OF_PEOPLE: 0,
                SELECT_MENU_LIST: 1,
                FINISH: 3
            } : getEventLocData.locdepartid && getEventLocData.lochasmenu ? {
                SELECT_NUMBER_OF_PEOPLE: 0,
                SELECT_MENU_LIST: 1,
                FINISH: 3
                } : {
                SELECT_NUMBER_OF_PEOPLE: 0,
                SELECT_MENU_LIST: 1,
                FINISH: 2
            }
        )


    const getSteps = () => {
        if(isPortal) {
            if(isFromDetailPage) {
                return ['ReservationInfo', 'SelectMenu', 'Finish']
            } else {
                return ['NumberOfPeople', 'SelectMenu', 'Finish']
            }
        } else {
            return ['NumberOfPeople', 'SelectMenu', 'Finish']
        }

    }

    const steps = getSteps()

    const ColorlibConnector = (props) => {
        const classes = connectorStyle()
        const { active, completed } = props

        return(
            <StepConnector
                className={clsx(classes.root, {
                    [classes.active]: active,
                    [classes.completed]: completed,
                })}
            />
        )
    }

    const ColorlibStepIcon = (props) => {
        const classes = useColorlibStepIconStyles({isPortal: isPortal})
        const iconCls = useColorIconStyles({isPortal: isPortal})
        const { active, completed } = props
        let icons

        if(isPortal) {
            if(isFromDetailPage) {
                icons = {
                    1: (
                        <ListAltIcon
                            className={clsx(iconCls.root, {
                                [iconCls.active]: active,
                                [iconCls.completed]: completed,
                            })}
                        />
                    ),
                    2: (
                        getEventLocData?.lochasmenu && state.menuGroupAndProductList ? (
                            <RestaurantMenuIcon
                                className={clsx(iconCls.root, {
                                    [iconCls.active]: active,
                                    [iconCls.completed]: completed,
                                })}
                            />
                        ) : (
                            <VisibilityIcon
                                className={clsx(iconCls.root, {
                                    [iconCls.active]: active,
                                    [iconCls.completed]: completed,
                                })}
                            />
                        )
                    ),
                    /*
                     3: (
                        <PaymentIcon
                            className={clsx(iconCls.root, {
                                [iconCls.active]: active,
                                [iconCls.completed]: completed,
                            })}
                        />
                    ),
                     */
                    3: (
                        <DoneIcon
                            className={clsx(iconCls.root, {
                                [iconCls.active]: active,
                                [iconCls.completed]: completed,
                            })}
                        />
                    ),

                }
            } else {
                if (getEventLocData.locdepartid && getEventLocData.lochasmenu) {
                    icons = {
                        1: (
                            <PersonIcon
                                className={clsx(iconCls.root, {
                                    [iconCls.active]: active,
                                    [iconCls.completed]: completed,
                                })}
                            />
                        ),
                        2: (
                            getEventLocData?.lochasmenu && state.menuGroupAndProductList ? (
                                <RestaurantMenuIcon
                                    className={clsx(iconCls.root, {
                                        [iconCls.active]: active,
                                        [iconCls.completed]: completed,
                                    })}
                                />
                            ) : (
                                <VisibilityIcon
                                    className={clsx(iconCls.root, {
                                        [iconCls.active]: active,
                                        [iconCls.completed]: completed,
                                    })}
                                />
                            )
                        ),
                      /*  5: (
                            <PaymentIcon
                                className={clsx(iconCls.root, {
                                    [iconCls.active]: active,
                                    [iconCls.completed]: completed,
                                })}
                            />
                        ),*/
                        3: (
                            <DoneIcon
                                className={clsx(iconCls.root, {
                                    [iconCls.active]: active,
                                    [iconCls.completed]: completed,
                                })}
                            />
                        ),
                    }
                } else {
                    icons = {
                        1: (
                            <PersonIcon
                                className={clsx(iconCls.root, {
                                    [iconCls.active]: active,
                                    [iconCls.completed]: completed,
                                })}
                            />
                        ),
                        2: (
                            <TodayIcon
                                className={clsx(iconCls.root, {
                                    [iconCls.active]: active,
                                    [iconCls.completed]: completed,
                                })}
                            />
                        ),
                        3: (
                            <ListAltIcon
                                className={clsx(iconCls.root, {
                                    [iconCls.active]: active,
                                    [iconCls.completed]: completed,
                                })}
                            />
                        ),
                        4: (
                            <DoneIcon
                                className={clsx(iconCls.root, {
                                    [iconCls.active]: active,
                                    [iconCls.completed]: completed,
                                })}
                            />
                        ),
                    }
                }
            }
        } else {
            icons = {
                1: (
                    <PersonIcon
                        className={clsx(iconCls.root, {
                            [iconCls.active]: active,
                            [iconCls.completed]: completed,
                        })}
                    />
                ),
                2: (
                    getEventLocData.isspares ? (
                        getEventLocData?.lochasmenu && state.menuGroupAndProductList ? (
                            <SpaIcon
                                className={clsx(iconCls.root, {
                                    [iconCls.active]: active,
                                    [iconCls.completed]: completed,
                                })}
                            />
                        ) : (
                            <VisibilityIcon
                                className={clsx(iconCls.root, {
                                    [iconCls.active]: active,
                                    [iconCls.completed]: completed,
                                })}
                            />
                        )
                    ) : (
                        getEventLocData?.lochasmenu && state.menuGroupAndProductList ? (
                            <RestaurantMenuIcon
                                className={clsx(iconCls.root, {
                                    [iconCls.active]: active,
                                    [iconCls.completed]: completed,
                                })}
                            />
                        ) : (
                            <VisibilityIcon
                                className={clsx(iconCls.root, {
                                    [iconCls.active]: active,
                                    [iconCls.completed]: completed,
                                })}
                            />
                        )
                    )
                ),
                3: (
                    <DoneIcon
                        className={clsx(iconCls.root, {
                            [iconCls.active]: active,
                            [iconCls.completed]: completed,
                        })}
                    />
                ),
            }
        }

        return (
            <div
                className={clsx(classes.root, {
                    [classes.active]: active,
                    [classes.completed]: completed,
                })}
            >
                {icons[String(props.icon)]}
            </div>
        )
    }

    const handleClose = async () => {

        if(Number(router.query?.step) !== STEPPER.FINISH && !isReservationConfirm && resEventDef){
            await discardResEvent(resEventDef)
        }

        setActiveStep(global.base.intZero)
        setIsReservationConfirm(global.base.isFalse)
        onClose(global.base.isFalse)
        eventReservationReset()
        setConfirmData(null)
        if(Number(router.query?.step) === STEPPER.SELECT_NUMBER_OF_PEOPLE) {
            const routerQuery = {...router.query}
            delete routerQuery.locid
            delete routerQuery.step
            router.push({
                pathname: 'guest',
                query: routerQuery
            })
        } else {
            router.push({
                pathname: 'guest',
                query: {
                    ...router.query,
                    step: STEPPER.SELECT_NUMBER_OF_PEOPLE
                }
            }).then(() => {
                const routerQuery = {...router.query}
                delete routerQuery.locid
                delete routerQuery.step
                router.push({
                    pathname: 'guest',
                    query: routerQuery
                })
            })
        }
        updateState('guest', ['routerQueryState'], false)
    }

    const eventReservationReset = () => {
        updateState('guest', 'totalPax', reservBase?.totalpax || defaultValues.totalPax)
        updateState('guest', 'totalChd', reservBase?.totalchd || defaultValues.totalChd)
        updateState('guest', 'strEventRules', false)
        updateState('guest', 'eventLocTransDateList', [])
        updateState('guest', 'eventLocTransDate', 0)
        updateState('guest', 'eventLocTransTime', 0)
        updateState('guest', 'eventLocTransDateSlotList', false)
        updateState('guest', 'menuGroupAndProductList', false)
        updateState('guest', 'selectGuestProductList', [])
        updateState('guest', 'isRestaurantResTermsConfirm', false)
    }

    const updateResEvent = (data, status = 'T') => {
        data.status = status
        return Update({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RESEVENT,
            token: token,
            gid: data.gid,
            params: {
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
            },
            data: data
        }).then((response) => {
            if (response?.data?.data) {
                return response.data.data
            } else {
                return false
            }
        }).catch(() => {
            return false
        })
    }

    const discardResEvent = (data) => {
        return Delete({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'resevent',
            method: REQUEST_METHOD_CONST.DELETE,
            token: token,
            gid: data.gid,
            params: {
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO
            }
        }).then((response) => {
            if (response?.data?.data) {
                return true
            } else {
                return false
            }
        }).catch(() => {
            return false
        })
    }

    const getResEventCalcPrice = (reservno, doUpdate = false) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'resevent/calc/price',
            method: REQUEST_METHOD_CONST.GET,
            token,
            params: {
                reservno: reservno,
                doupdate: doUpdate
            }
        }).then((response) => {
            if (response?.data?.data) {
                if(Array.isArray(response.data.data)) {
                    return response.data.data[0]
                }else{
                    return response.data.data
                }
            } else {
                return false
            }
        }).catch(() => {
            return false
        })
    }

    const getTimeAvailability = () => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'resevent/locres/client/canci',
            token,
            params: {
                clientid: objLogInfo.refid || objLogInfo?.id,
                locid: getEventLocData.locid,
                transdate: state.eventLocTransDate,
                transtime: state.eventLocTransTime,
                totalpax: state.totalPax,
                hotelrefno: state.changeHotelRefno || GENERAL_SETTINGS.useHotelRefno
            },
        }).then((response) => {
            if (response.status === 200 && response.data.count > 0) {
                return response.data.data[0]
            } else {
                return false
            }
        }).catch(() => {
            return false
        })
    }

    const handleNext = async () => {
        if (activeStep === STEPPER.SELECT_NUMBER_OF_PEOPLE && (isZero(state.eventLocTransDate) || isZero(state.eventLocTransTime))) {
            enqueueSnackbar(t('str_pleaseSelectDateAndTime'), { variant: 'warning' })
            return
        }

        if (activeStep === STEPPER.SELECT_NUMBER_OF_PEOPLE && (state.eventLocTransDate && state.eventLocTransTime) && isTimeAvailability === false) {
            const checkTimeAvailability = await getTimeAvailability()
            if (!checkTimeAvailability.res) {
                enqueueSnackbar(t(checkTimeAvailability.msg), { variant: 'warning', autoHideDuration: 5000 })
                return
            } else {

                let newResEventDef = {
                    ...resEventDef,
                    startdate: state.eventLocTransDate,
                    enddate: state.eventLocTransDate,
                    starttime: state.eventLocTransTime,
                    endtime: state.eventLocTransTime,
                    locid: getEventLocData.locid,
                    description: getEventLocData.locdesc,
                    eventrestype: TRANSTYPES.GUEST_ALACARTE,
                    eventtypeid: getEventLocData.gapptypeid,
                    totalpax: state.totalPax,
                    totalchd: state.totalChd,
                    totalbaby: global.base.intZero,
                    clientid: objLogInfo.refid,
                    hotelrefno: hotelRefNo,
                    isorsactive: true
                }

                const resEventUpdData = await updateResEvent(newResEventDef)
                    , resEventTotals = await getResEventCalcPrice(newResEventDef.reservno, true)
                if(resEventTotals){
                    updateState('guest', 'eventResTotals', resEventTotals)
                }

                setResEventDef(resEventUpdData)
                setIsTimeAvailability(true)
            }
        }

        router.push({
            pathname: 'guest',
            query: {
                ...router.query,
                step: activeStep + 1,
            },
        })

        setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
        router.push({
            pathname: 'guest',
            query: {
                ...router.query,
                step: activeStep - 1
            },
        })
    }

    let clientParams = {}
    clientParams.hotelrefno = objLogInfo && objLogInfo.hotelrefno || GENERAL_SETTINGS.HOTELREFNO

    if (objLogInfo && objLogInfo.hotelgidstr) {
        clientParams.hoteltoken = objLogInfo && objLogInfo.hotelgidstr
    }

    useEffect(() => {
        if(!state.routerQueryState?.locid) {
            handleClose()
        } else {
            setActiveStep(Number(state.routerQueryState?.step))
        }
    }, [state.routerQueryState])

    useEffect(() => {
        async function loadReseventInfo(){
            if (isLogin && getEventLocData && getEventLocData.locismulti && getEventLocData.catid) {
                setEventLocCatLoading(true)
                await UseOrest({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: 'hotel/app/info/list',
                    token: token,
                    params: {
                        catid: getEventLocData.catid,
                        sort: 'id',
                        langcode: locale
                    },
                }).then((response) => {
                    if (response.data.success === global.base.isTrue && response.data.data.length > 0) {
                        setEventLocList(response.data.data)
                        setEventLocCatLoading(false)
                    } else {
                        setEventLocList(null)
                        setEventLocCatLoading(false)
                    }
                })
            } else {
                setEventLocList(null)
            }

            if (isLogin && state.eventLocTransDateList && !Object.keys(state.eventLocTransDateList).length > global.base.intZero) {
                if(!isPortal) {
                    let totalDay = false
                    if(reservBase && reservBase.checkin && reservBase.checkout){
                        let ciDate = moment(new Date()).format('DD.MM.YYYY')
                        ciDate =  moment(ciDate, 'DD.MM.YYYY')

                        let coDate = moment(reservBase.checkout, 'YYYY-MM-DD').format('DD.MM.YYYY')
                        coDate =  moment(coDate, 'DD.MM.YYYY')

                        totalDay = coDate.diff(ciDate, 'days')
                        totalDay = Number(totalDay) + 1
                    }

                    const reqParams = {
                        locid: getEventLocData.locid,
                        hotelrefno: hotelRefNo,
                        allhotels: true,
                    }

                    setEventlocDateListLoading(true)
                    await List({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.EVENTLOC + OREST_ENDPOINT.SLASH + OREST_ENDPOINT.DATE,
                        token: token,
                        params: Object.assign(reqParams, totalDay ? { totalday: totalDay } : {})
                    }).then((resEventLocDate) => {
                        if (checkResponse(resEventLocDate)) {
                            let transDateList = []
                            responseData(resEventLocDate).map((item) => {
                                transDateList.push({ item: item.transdate })
                            })
                            updateState('guest', 'eventLocTransDateList', transDateList)
                            setEventlocDateListLoading(false)
                        } else {
                            updateState('guest', 'eventLocTransDateList', global.base.isNull)
                            setEventlocDateListLoading(false)
                        }
                    })
                }


                if (isLogin && global.helper.isFalse(state.strEventRules)) {
                    setEventRulesIsLoading(true)
                    await UseOrest({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: 'tools/file/find',
                        token: token,
                        params: {
                            code: global.guestWeb.strEventRules,
                            langcode: locale,
                            contentype: '0000505',
                            masterid: getEventLocData.locmid,
                            hotelrefno: clientParams.hotelrefno
                        }
                    }).then(async (toolsFileFindResponse) => {
                        if (toolsFileFindResponse?.data?.data?.filedata) {
                            const resRafileData = toolsFileFindResponse.data.data
                            const strFileData = new Buffer.from(resRafileData.filedata, 'base64').toString('utf-8')
                            updateState('guest', 'strEventRules', strFileData)
                            setEventRulesIsLoading(false)
                        } else {
                           await UseOrest({
                                apiUrl: GENERAL_SETTINGS.OREST_URL,
                                endpoint: 'tools/file/find',
                                token: token,
                                params: {
                                    code: global.guestWeb.strEventRules,
                                    langcode: locale,
                                    contentype: '0000505',
                                    masterid: getEventLocData.locmid,
                                }
                            }).then((toolsFileFindResponse) => {
                                if (toolsFileFindResponse?.data?.data?.filedata) {
                                    const resRafileData = toolsFileFindResponse.data.data
                                    const strFileData = new Buffer.from(resRafileData.filedata, 'base64').toString('utf-8')
                                    updateState('guest', 'strEventRules', strFileData)
                                    setEventRulesIsLoading(false)
                                } else {
                                    updateState('guest', 'strEventRules', global.base.isNull)
                                    setEventRulesIsLoading(false)
                                }
                            })
                        }
                    })
                }

                if(isOpen && isLogin){
                    if(getEventLocData.lochasres){
                        await UseOrest({
                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                            endpoint: 'sett/event/locres/respaxfix',
                            token,
                        }).then((settEventLocResResPaxFixResponse) => {
                            if(settEventLocResResPaxFixResponse?.data?.data?.res){
                                setResPaxFix(global.base.isTrue)
                            }else{
                                setResPaxFix(global.base.isFalse)
                            }
                        }).catch(()=> {
                            setResPaxFix(global.base.isFalse)
                        })

                        await UseOrest({
                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                            endpoint: 'resevent/def',
                            token: token,
                            params: {
                                hotelrefno: GENERAL_SETTINGS.HOTELREFNO
                            },
                        }).then(reseventDefResponse => {
                            if (reseventDefResponse.status === 200) {
                                if (reseventDefResponse?.data?.data) {
                                    setResEventDef(reseventDefResponse.data.data)
                                } else {
                                    setResEventDef(false)
                                }
                            }
                        }).catch(()=> {
                            setResEventDef(false)
                        })
                    }

                    if ((state.menuGroupAndProductList === FALSE)) {
                        if (GENERAL_SETTINGS.ISCHAIN && state.changeHotelRefno !== false) {
                            clientParams.ischain = true
                            clientParams.chainid = state.changeHotelRefno
                            clientParams.hotelrefno = GENERAL_SETTINGS.HOTELREFNO
                        } else {
                            clientParams.ischain = false
                            clientParams.chainid = false
                        }
                        clientParams.departid = getEventLocData.locdepartid
                        clientParams.langcode = locale
                        await axios({
                            url: GENERAL_SETTINGS.BASE_URL + 'api/products/product-list',
                            method: 'post',
                            params: clientParams
                        }).then((productListResponse) => {
                            const productListData = productListResponse.data
                            if (productListData.success && productListData.data.length > 0) {
                                updateState('guest', 'menuGroupAndProductList', jsonGroupBy(productListData.data, 'localspgroupdesc'))
                            } else {
                                updateState('guest', 'menuGroupAndProductList', null)
                            }
                        }).catch(()=> {
                            updateState('guest', 'menuGroupAndProductList', null)
                        })
                    }
                }
            }
        }

        loadReseventInfo().then(() => {
            return true
        })
    }, [isOpen])

    useEffect(() => {
        if (getEventLocData.locid === eventLocID && isPortal) {
            let totalDay = false
            if(reservBase && reservBase.checkin && reservBase.checkout){
                let ciDate = moment(new Date()).format('DD.MM.YYYY')
                ciDate =  moment(ciDate, 'DD.MM.YYYY')

                let coDate = moment(reservBase.checkout, 'YYYY-MM-DD').format('DD.MM.YYYY')
                coDate =  moment(coDate, 'DD.MM.YYYY')

                totalDay = coDate.diff(ciDate, 'days')
                totalDay = Number(totalDay) + 1
            }

            const reqParams = {
                locid: getEventLocData.locid,
                hotelrefno: hotelRefNo,
                allhotels: true,
            }

            setEventlocDateListLoading(true)
            List({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.EVENTLOC + OREST_ENDPOINT.SLASH + OREST_ENDPOINT.DATE,
                token: token,
                params: Object.assign(reqParams, totalDay ? { totalday: totalDay } : {})
            }).then((resEventLocDate) => {
                if (checkResponse(resEventLocDate)) {
                    let transDateList = []
                    responseData(resEventLocDate).map((item) => {
                        transDateList.push({ item: item.transdate })
                    })
                    updateState('guest', 'eventLocTransDateList', transDateList)
                    setEventlocDateListLoading(false)
                } else {
                    updateState('guest', 'eventLocTransDateList', global.base.isNull)
                    setEventlocDateListLoading(false)
                }
            })
        }

    }, [eventLocID])

    useEffect(() => {
        if (isLogin && notZero(state.eventLocTransDate) && notZero(getEventLocData.locid) && getEventLocData.locid === eventLocID && (!isPortal || (isPortal && !isFromDetailPage))) {
            setEventlocDateSlotListLoading(true)
            List({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.EVENTLOC + OREST_ENDPOINT.SLASH + OREST_ENDPOINT.SLOT,
                token: token,
                params: {
                    date: state.eventLocTransDate,
                    locid: getEventLocData.locid,
                    hotelrefno: hotelRefNo
                },
            }).then((resEventLocTimeSlot) => {
                if (checkResponse(resEventLocTimeSlot)) {
                    let transDateSlotList = []
                    responseData(resEventLocTimeSlot).map((item) => {
                        transDateSlotList.push({ item: item.transtime })
                    })
                    updateState('guest', 'eventLocTransTime', global.base.intZero)
                    updateState('guest', 'eventLocTransDateSlotList', transDateSlotList)

                    if(transDateSlotList && transDateSlotList.length === 1){
                        updateState('guest', 'eventLocTransTime', transDateSlotList[0].item)
                    }

                    setEventlocDateSlotListLoading(false)
                } else {
                    updateState('guest', 'eventLocTransDateSlotList', global.base.isNull)
                    setEventlocDateSlotListLoading(false)
                }
            })
        }
    }, [state.eventLocTransDate])

    const getDefAgencyId = () => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'agency/defid',
            token,
            params: {
                hotelgid: objLogInfo.hotelgid,
            },
        }).then((response) => {
            if (response.status === 200 && response.data.count > 0) {
                return response.data.data.res
            } else {
                return false
            }
        }).catch(() => {
            return false
        })
    }

    const getEventData = (resNo) => {
        if(resNo) {
            return ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RESEVENT,
                token,
                params: {
                    query: `clientid:${clientBase?.id},reservno:${resNo}`,
                    hotelrefno: hotelRefNo
                }
            }).then(res => {
                if(res.status === 200) {
                    setConfirmData(res.data?.data?.length > 0 ? res.data.data[0] : null)
                }
            })
        }
    }

    const handleConfirm = async () => {
        if (global.helper.isFalse(state.eventLocTransDate) || global.helper.isFalse(state.eventLocTransTime)) {
            enqueueSnackbar(t('str_selectDateAndTime'), { variant: 'warning' })
        } else {
            if (eventLocID !== FALSE) {
                setSaveResEvent(true)
                const useResEvent = await updateResEvent(resEventDef, 'A')
                if(useResEvent){
                    await getResEventCalcPrice(resEventDef.reservno, true)
                    setReseventGid(useResEvent.gid)
                    const notifyValues = {
                        roomno: reservBase?.roomno || "-",
                        clientname: transliteration(clientBase?.clientname) || "-",
                        details: JSON.stringify({
                            loc: getEventLocData.locdesc,
                            date: state.eventLocTransDate,
                            time: state.eventLocTransTime,
                            totalpax: state.totalPax,
                            totalchd: state.totalChd
                        })
                    }
                    await sendGuestChangeNotifyMail('resevent','upd',clientBase.id, clientBase.gid, reservBase.gid, reservBase.reservno, notifyValues, reservBase?.hotelrefno || GENERAL_SETTINGS.HOTELREFNO)
                    await getEventData(useResEvent.reservno)
                    setIsReservationConfirm(global.base.isTrue)
                    setReservationNo(useResEvent.reservno)
                    setSaveResEvent(false)
                    setActiveStep(STEPPER.FINISH);
                    updateState('guest', ['routerQueryState'], {
                        ...state.routerQueryState,
                        isResCompleted: true
                    })
                    router.push({
                        pathname: 'guest',
                        query: {
                            ...router.query,
                            step: STEPPER.FINISH
                        }
                    })
                }
            } else {
                enqueueSnackbar(t('str_missingFields') + ' eventtypeid', { variant: 'warning' })
            }
        }
    }

    let eventReservation = {
        localtitle: getEventLocData.localtitle,
        description: getEventLocData.locdesc,
        totalpax: state.totalPax,
        totalchd: state.totalChd,
        totalbaby: global.base.intZero,
        startdate: state.eventLocTransDate,
        starttime: state.eventLocTransTime,
    }

    const [slider, setSlider] = useState(false)
    const [swiped, setSwiped] = useState(false)

    const handleSwiped = useCallback(() => {
        setSwiped(true)
    }, [setSwiped])

    const handleSwipedStatus = useCallback((e) => {
        if (swiped) {
            e.stopPropagation()
            e.preventDefault()
            setSwiped(false)
        }
    }, [swiped])

    useEffect(() => {
        if (slider && slider.slickGoTo &&  eventLocList && eventLocList.length > 0) {
            let slideIndex = eventLocList.filter(res => res.lochasres === true).sort((a, b) => a.locid - b.locid).findIndex((item) => Number(item.locid) === Number(getEventLocData.locid))
            slider.slickGoTo(slideIndex)
        }
    }, [slider])

    const settings = {
        dots: true,
        speed: 500,
        lazyLoad: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        centerMode: false,
        swipeToSlide: true,
        infinite: false,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                },
            },
        ],
    }

    const handleSelectEventLoc = (locid) => {
        setEventLocID(locid)
        let newEventLocData = eventLocList.find((item) => Number(item.locid) === Number(locid))
        setEventLocData(newEventLocData)
        updateState('guest', 'eventLocTransDateList', global.base.isFalse)
        updateState('guest', 'eventLocTransDateSlotList', global.base.isFalse)
        updateState('guest', 'eventLocTransDate', 0)
        updateState('guest', 'eventLocTransTime', 0)
        updateState('guest', 'menuGroupAndProductList', false)
        updateState('guest', 'selectGuestProductList', [])
    }

    const [printPdf, setPrintPdf] = useState(false)

    const handlePrintReceipt = () => {
        axios({
            url: `${GENERAL_SETTINGS.OREST_URL}/resevent/print/form`,
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            method: REQUEST_METHOD_CONST.POST,
            responseType: 'arraybuffer',
            params: {
                langcode: 'en',
                hotelrefno: hotelRefNo,
                gid: reseventGid,
            },
            data: [{ 'lineentity': 'eventmenu', 'linefield': 'reservno', 'masterfield': 'reservno' }],
        }).then((r) => {
            if (r.status === 200) {
                let blob = new Blob([r.data], { type: 'application/pdf' })
                let url = URL.createObjectURL(blob)
                setPrintPdf(url)
                 const receiptPdfPrint = document.getElementById("receiptPdfPrint").contentWindow;
                 receiptPdfPrint.print();
            }else{
                enqueueSnackbar(t('str_requestCannotBeProcessed'), { variant: 'warning' })
            }
        }).catch(() => {
            enqueueSnackbar(t('str_requestCannotBeProcessed'), { variant: 'warning' })
        })
    }

    return (
        <React.Fragment>
            {(getEventLocData.lochasres || getEventLocData.isspares) && (
                <Container maxWidth="lg">
                    <Dialog
                        fullScreen
                        open={isOpen}
                        onClose={() => handleClose()}
                        aria-labelledby="event-res-title"
                        fullWidth
                        maxWidth="sm"
                    >
                        <AppBar color="default" className={classes.appBar}>
                            <Toolbar>
                                <Typography variant="h6" className={classes.title}>
                                    {t(getEventLocData.localtitle)}
                                </Typography>
                                <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                                    <CloseIcon/>
                                </IconButton>
                            </Toolbar>
                        </AppBar>
                        <DialogContent dividers style={{ backgroundColor: '#f1f1f1' }}>
                            <Container maxWidth={'lg'}>
                                <div>
                                    <Stepper activeStep={activeStep} style={{ backgroundColor: 'transparent' }} connector={<ColorlibConnector />}>
                                        {steps.map((label) => (
                                            <Step className={isPortal ? classes.stepRoot : ""} key={label}>
                                                <StepLabel className={classes.stepLabel} StepIconComponent={ColorlibStepIcon}>
                                                </StepLabel>
                                            </Step>
                                        ))}
                                    </Stepper>
                                    <div>
                                        {Number(router.query?.step) === STEPPER.RESERVATION_INFO && (
                                                <ReservationInfo
                                                    date={state.eventLocTransDate}
                                                    time={state.eventLocTransTime}
                                                    adult={state.totalPax}
                                                    child={state.totalChd}
                                                    sliderTitle={sliderTitle}
                                                    sliderDesc={sliderDesc}
                                                    sliderImg={sliderImg}
                                                />
                                            )
                                        }
                                        {Number(router.query?.step) === STEPPER.SELECT_NUMBER_OF_PEOPLE && (
                                            <Grid container spacing={3}>
                                                {
                                                    <Grid item xs={12}>
                                                        <Grid container spacing={3}>
                                                            <Grid item xs={12}>
                                                                <Typography variant="subtitle2" style={{
                                                                    fontWeight: 'bolder'
                                                                }}>
                                                                    {t('str_numberOfGuests')}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={12}>
                                                                <Paper className={classes.paper}>
                                                                    {getEventLocData?.isspares ? (
                                                                        <div style={getEventLocData?.isspares ? {display: 'flex', justifyContent: 'center'} : {}}>
                                                                            <SpinEdit
                                                                                disabled={resPaxFix}
                                                                                min={1}
                                                                                defaultValue={state.totalPax}
                                                                                label={t('str_adult')}
                                                                                onChange={(e) =>
                                                                                    updateState('guest', 'totalPax', e)
                                                                                }
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <Grid container spacing={3}>
                                                                            <Grid item xs={12} sm={getEventLocData?.isspares ? 12 : 6}>
                                                                                <SpinEdit
                                                                                    disabled={resPaxFix}
                                                                                    min={1}
                                                                                    defaultValue={state.totalPax}
                                                                                    label={t('str_adult')}
                                                                                    onChange={(e) =>
                                                                                        updateState('guest', 'totalPax', e)
                                                                                    }
                                                                                />
                                                                            </Grid>
                                                                            <Grid item xs={12} sm={6}>
                                                                                <SpinEdit
                                                                                    disabled={resPaxFix}
                                                                                    defaultValue={state.totalChd}
                                                                                    label={t('str_child')}
                                                                                    onChange={(e) =>
                                                                                        updateState('guest', 'totalChd', e)
                                                                                    }
                                                                                    helpText={
                                                                                        <React.Fragment>
                                                                                            {MAX_CHILD_AGE} {t('str_age')} <ArrowDownwardIcon style={{ fontSize: 12 }}/>
                                                                                        </React.Fragment>
                                                                                    }
                                                                                />
                                                                            </Grid>
                                                                        </Grid>
                                                                    )}
                                                                </Paper>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                }
                                                <Grid item xs={12}>
                                                    <Grid container spacing={3}>
                                                        {getEventLocData.locismulti && getEventLocData.catid ?
                                                            eventLocCatLoading ?
                                                                <Box p={1}>
                                                                    <LoadingSpinner size={30}/>
                                                                </Box> :
                                                                <React.Fragment>
                                                                    <Grid item xs={12}>
                                                                        <Typography variant="subtitle2" style={{
                                                                            fontWeight: 'bolder'
                                                                        }}>
                                                                            {t('str_places')}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item xs={12}>
                                                                        <Paper className={classes.paper}>
                                                                            <Box p={5}>
                                                                                <Slider ref={(slider) => slider && setSlider(slider)} onSwipe={handleSwiped} {...settings}>
                                                                                    {eventLocList && eventLocList.filter(res => res.lochasres === true).sort((a, b) => a.locid - b.locid).map((item, i) => {
                                                                                        return (
                                                                                            <Box key={i} onClickCapture={handleSwipedStatus}>
                                                                                                <Card className={clsx(classes.eventLocCard, {
                                                                                                    [classes.eventLocActive]: getEventLocData.locid === item.locid
                                                                                                })} onClick={()=> handleSelectEventLoc(item.locid)}>
                                                                                                    <CardImage
                                                                                                        src={GENERAL_SETTINGS.STATIC_URL + item.imageurl}
                                                                                                        alt={item.localtitle}
                                                                                                        cursor={'pointer'}
                                                                                                    />
                                                                                                    <CardContent>
                                                                                                        <Typography
                                                                                                            noWrap={true}
                                                                                                            className={classes.eventLocTitle}
                                                                                                            variant="h6"
                                                                                                            style={{ cursor: 'pointer' }}
                                                                                                            title={item.localtitle && item.localtitle.length >= 30 ? item.localtitle : ""}
                                                                                                        >
                                                                                                            {item.localtitle}
                                                                                                        </Typography>
                                                                                                    </CardContent>
                                                                                                </Card>
                                                                                            </Box>
                                                                                        )
                                                                                    })}
                                                                                </Slider>
                                                                            </Box>
                                                                        </Paper>
                                                                    </Grid>
                                                                </React.Fragment>
                                                            : ''
                                                        }
                                                        {eventLocList !== false && (
                                                            <React.Fragment>
                                                                <Grid item xs={12}>
                                                                    <Typography variant="subtitle2" style={{
                                                                        fontWeight: 'bolder'
                                                                    }}>
                                                                        {t('str_selectDateAndTime')}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={12}>
                                                                    <Paper className={classes.paper}>
                                                                        <Box style={{ paddingTop: 20, paddingBottom: 10 }}>
                                                                            <Typography variant="subtitle2" align="center" style={{
                                                                                fontWeight: 'bolder',
                                                                                marginBottom: 10
                                                                            }}>
                                                                                {t('str_availableDates')}
                                                                            </Typography>
                                                                            {state.eventLocTransDateList ? (
                                                                                <Container maxWidth={false}>
                                                                                    <HorizontalList
                                                                                        showLeftButton
                                                                                        showRightButton
                                                                                        list={state.eventLocTransDateList}
                                                                                        value={state.eventLocTransDate}
                                                                                        fields={[
                                                                                            {
                                                                                                useMoment: true,
                                                                                                name: 'item',
                                                                                                convertFormat: OREST_ENDPOINT.DATEFORMAT,
                                                                                                renderFormat: 'DD'
                                                                                            },
                                                                                            {
                                                                                                useMoment: true,
                                                                                                name: 'item',
                                                                                                convertFormat: OREST_ENDPOINT.DATEFORMAT,
                                                                                                renderFormat: 'ddd',
                                                                                                uppercase: true
                                                                                            }
                                                                                        ]}
                                                                                        onClick={(e) => {
                                                                                            setIsTimeAvailability(false)
                                                                                            updateState('guest', 'eventLocTransDate', e)
                                                                                            updateState('guest', 'routerQueryState', {
                                                                                                ...state.routerQueryState,
                                                                                                date: e
                                                                                            })
                                                                                            updateState('guest', 'eventLocTransTime', 0)
                                                                                        }}
                                                                                    />
                                                                                </Container>
                                                                            ) : state.eventLocTransDateList === false && eventlocDateListLoading ?
                                                                                (
                                                                                    <Box p={1}>
                                                                                        <LoadingSpinner size={30}/>
                                                                                    </Box>
                                                                                ) : (
                                                                                    <Typography variant="subtitle2" align="center">
                                                                                        {t('str_noAvailableVenue')}
                                                                                    </Typography>
                                                                                )}
                                                                            {state.eventLocTransDate !== 0 ? (
                                                                                <React.Fragment>
                                                                                    <Typography variant="subtitle2" align="center" style={{
                                                                                        fontWeight: 'bolder',
                                                                                        marginTop: 10,
                                                                                        marginBottom: 10,
                                                                                    }}>
                                                                                        {t('str_hour')}
                                                                                    </Typography>
                                                                                    {(state.eventLocTransDate !== 0 && eventlocDateSlotListLoading) ? (
                                                                                        <Box p={1}>
                                                                                            <LoadingSpinner size={30}/>
                                                                                        </Box>
                                                                                    ) : state.eventLocTransDateSlotList ===
                                                                                    global.base.isFalse ? (
                                                                                        <Typography
                                                                                            variant="subtitle2"
                                                                                            align="center"
                                                                                            gutterBottom
                                                                                        >
                                                                                            {t('str_pickADate')}
                                                                                        </Typography>
                                                                                    ) : state.eventLocTransDateSlotList ===
                                                                                    global.base.isNull ? (
                                                                                        <Typography variant="subtitle2"
                                                                                                    align="center">
                                                                                            {t('str_sorryMessage')}
                                                                                        </Typography>
                                                                                    ) : (
                                                                                        <React.Fragment>
                                                                                            <Container maxWidth={false}>
                                                                                                <HorizontalList
                                                                                                    showLeftButton
                                                                                                    showRightButton
                                                                                                    list={state.eventLocTransDateSlotList}
                                                                                                    value={state.eventLocTransTime}
                                                                                                    fields={[
                                                                                                        {
                                                                                                            useMoment: true,
                                                                                                            name: 'item',
                                                                                                            convertFormat: 'HH:mm',
                                                                                                            renderFormat: 'HH:mm'
                                                                                                        }
                                                                                                    ]}
                                                                                                    onClick={(e) => {
                                                                                                        setIsTimeAvailability(false)
                                                                                                        updateState('guest', 'eventLocTransTime', e)
                                                                                                        updateState('guest', 'routerQueryState', {
                                                                                                            ...state.routerQueryState,
                                                                                                            time: e
                                                                                                        })
                                                                                                    }}
                                                                                                />
                                                                                            </Container>
                                                                                        </React.Fragment>
                                                                                    )}
                                                                                </React.Fragment>
                                                                            ): null}
                                                                        </Box>
                                                                    </Paper>
                                                                </Grid>
                                                            </React.Fragment>
                                                        )}
                                                    </Grid>
                                                </Grid>
                                                {eventRulesIsLoading ? (
                                                    <Grid item xs={12}>
                                                        <LoadingSpinner size={20}/>
                                                    </Grid>
                                                ): state.strEventRules ? (
                                                    <Grid item xs={12}>
                                                        <Typography variant="button" display="block" gutterBottom>
                                                            {t('str_termsOfUseAndPrivacyPolicy')}
                                                        </Typography>
                                                        <Typography variant="caption" display="block" gutterBottom>
                                                            <div
                                                                dangerouslySetInnerHTML={{
                                                                    __html: state.strEventRules,
                                                                }}
                                                            />
                                                        </Typography>
                                                    </Grid>
                                                ): null}
                                            </Grid>
                                        )}
                                        {Number(router.query?.step) === STEPPER.SELECT_MENU_LIST && (
                                            <React.Fragment>
                                                <Grid container spacing={3}>
                                                    {
                                                        getEventLocData?.lochasmenu && state.menuGroupAndProductList && (
                                                            <Grid item xs={12} sm={8}>
                                                                <Paper className={classes.paper}>
                                                                    <EventMenuList
                                                                        departId={getEventLocData.locdepartid}
                                                                        isAddActive={global.base.isTrue}
                                                                        isSpaRes={getEventLocData?.isspares}
                                                                        resEventDef={resEventDef}
                                                                    />
                                                                </Paper>
                                                            </Grid>
                                                        )
                                                    }
                                                    <Grid item xs={12} sm={getEventLocData?.lochasmenu && state.menuGroupAndProductList ? 4 : 12}>
                                                        <RestaurantReservationSummary
                                                            isHaveProductList
                                                            companyTitle={sliderTitle || getEventLocData?.localtitle || getEventLocData?.localtitle}
                                                            date={state.eventLocTransDate}
                                                            time={state.eventLocTransTime}
                                                            adult={state.totalPax}
                                                            child={state.totalChd}
                                                            selectedProductList={state.selectGuestProductList}
                                                            setToState={setToState}
                                                            isSpaRes={getEventLocData?.isspares}
                                                            eventResTotals={state.eventResTotals}
                                                            onUpdatePrice={async ()=> {
                                                                const resEventTotals = await getResEventCalcPrice(resEventDef.reservno, true)
                                                                if(resEventTotals){
                                                                    updateState('guest', 'eventResTotals', resEventTotals)
                                                                }
                                                            }}
                                                        />
                                                        <div style={{paddingTop: 16}}>
                                                            <Confirmation
                                                                event={eventReservation}
                                                                eventLocData={getEventLocData}
                                                                objLogInfo={objLogInfo}
                                                            />
                                                        </div>
                                                    </Grid>
                                                </Grid>
                                            </React.Fragment>
                                        )}
                                        {Number(router.query?.step) === STEPPER.CONFIRMATION && (
                                            <Grid container spacing={3}>
                                                <Grid item xs={12}>
                                                    {
                                                        isPortal ? (
                                                            <EventPayment
                                                                showSummary
                                                                isPortal={GENERAL_SETTINGS.ISPORTAL}
                                                                activeTabColor={WEBCMS_DATA.assets.colors.primary.main || null}
                                                                companyTitle={sliderTitle}
                                                                date={state.eventLocTransDate}
                                                                time={state.eventLocTransTime}
                                                                adult={state.totalPax}
                                                                child={state.totalChd}
                                                                isHaveProductList={state.selectGuestProductList.length > 0}
                                                                selectedProductList={state.selectGuestProductList}
                                                                eventLocData={getEventLocData}
                                                            />
                                                        ) : (
                                                            <Paper className={classes.paper}>
                                                                <Confirmation
                                                                    showDetail
                                                                    event={eventReservation}
                                                                    eventLocData={getEventLocData}
                                                                    objLogInfo={objLogInfo}
                                                                />
                                                            </Paper>
                                                        )
                                                    }
                                                </Grid>
                                            </Grid>
                                        )}
                                        {Number(router.query?.step) === STEPPER.FINISH && isReservationConfirm && (
                                            <div style={{paddingTop: "48px"}}>
                                                <ConfirmInfo
                                                    date={confirmData?.startdate}
                                                    time={confirmData?.starttime}
                                                    adult={confirmData?.totalpax}
                                                    child={confirmData?.totalchd}
                                                    reservationNo={reservationNo}
                                                    eventResTotals={state.eventResTotals}
                                                    isSpaRes={getEventLocData?.isspares}
                                                    sliderTitle={sliderTitle || (getEventLocData?.localtitle || getEventLocData?.title)}
                                                    sliderImg={sliderImg || getEventLocData?.imageurl}
                                                    productList={state.selectGuestProductList.length > 0 ? state.selectGuestProductList : false}
                                                />
                                            </div>
                                        )}
                                        {Number(router.query?.step) !== STEPPER.FINISH ? (
                                            <Grid
                                                container
                                                spacing={3}
                                                direction="row"
                                                justify="flex-end"
                                                alignItems="flex-end"

                                                style={{ marginTop: 10 }}
                                            >
                                                <Grid item xs={6} style={{textAlign:'right'}}>
                                                    <Button
                                                        color={'primary'}
                                                        variant={'outlined'}
                                                        disabled={activeStep === 0 || saveResEvent}
                                                        onClick={handleBack}
                                                        className={classes.button}
                                                    >
                                                        {t('str_back')}
                                                    </Button>
                                                    {activeStep === STEPPER.SELECT_MENU_LIST ? (
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            disabled={!state.isRestaurantResTermsConfirm || saveResEvent}
                                                            onClick={handleConfirm}
                                                            className={classes.button}
                                                        >
                                                            {saveResEvent && <LoadingSpinner size={18}/>}
                                                            {t('str_confirm')}
                                                        </Button>
                                                    ) : activeStep === STEPPER.SELECT_MENU_LIST &&
                                                    isObjectEmpty(state.selectGuestProductList) ? (
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={handleNext}
                                                            className={classes.button}
                                                        >
                                                            {t('str_skip')}
                                                        </Button>
                                                    ) : (
                                                        <Button
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
                                        ) : null
                                        }
                                    </div>
                                </div>
                            </Container>
                        </DialogContent>
                    </Dialog>
                </Container>
            )}
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(RestaurantReservation)
