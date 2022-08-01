import React, {useContext, useEffect, useState, useRef} from 'react'
import {NextSeo} from 'next-seo'
import {makeStyles} from '@material-ui/core/styles'
import {connect, useSelector} from 'react-redux'
import {useRouter} from 'next/router';
import axios from 'axios';
import LocationOnIcon from '@material-ui/icons/LocationOn'
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import Rating from '@material-ui/lab/Rating';
import CheckIcon from '@material-ui/icons/Check';
import {useSnackbar} from 'notistack'
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Collapse,
    Container,
    Dialog,
    Divider,
    Grid,
    LinearProgress,
    List,
    ListItem,
    Menu,
    MenuItem,
    Paper,
    TextField,
    Typography,
    InputAdornment
} from '@material-ui/core'
import Pagination from '@material-ui/lab/Pagination';
import NumberFormat from 'react-number-format'
import Slider from 'react-slick'
import clsx from 'clsx'
import GoogleMap from 'google-map-react'
import PopupState, {bindMenu, bindTrigger,} from 'material-ui-popup-state';
import {
    DateRangeDelimiter,
    DesktopDatePicker,
    DesktopDateRangePicker,
    LocalizationProvider,
    TimePicker
} from '@material-ui/pickers'
import moment from 'moment'
import MomentAdapter from '@date-io/moment'
import {deleteFromState, pushToState, setToState, updateState} from "../../../../state/actions";
import WebCmsGlobal from "../../../../components/webcms-global";
import useTranslation from "../../../../lib/translations/hooks/useTranslation";
import DestinationPortalWrapper from "../../../../components/destination-portal/components/DestinationPortalWrapper";
import {
    convertUrlStandard,
    DEFAULT_OREST_TOKEN, formatMoney,
    getOperationSystemName,
    isErrorMsg, OREST_ENDPOINT,
    REQUEST_METHOD_CONST, TRANSTYPES
} from "../../../../model/orest/constants";
import {HomeSliderPlaceHolder} from "../../../../assets/svg/destination-portal/HomeSliderPlaceHolder";
import SpinEdit from "../../../../@webcms-ui/core/spin-edit";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import PropTypes from 'prop-types';
import Faq from "../../../../components/guest/public/components/faq";
import FaqCommon from "../../../../components/guest/public/components/FaqCommon";
import {FALSE, MAX_MINUTE_VALUE, SLASH} from "../../../../model/globals";
import MenuDialog from "../../../../components/guest/public/components/info/event-reservation/menu-dialog";
import RestaurantReservation from "../../../../components/guest/public/components/info/event-reservation";
import Surveys from "../../../../components/guest/account/MyProfile/Surveys";
import {CustomToolTip} from "../../../../components/user-portal/components/CustomToolTip/CustomToolTip";
import NumberOfGuest from "../../../../components/destination-portal/components/NumberOfGuest";
import { ViewList, Insert, Patch, UseOrest } from '@webcms/orest'
import getSymbolFromCurrency from "../../../../model/currency-symbol";
import RestaurantReservationSummary
    from "../../../../components/guest/public/components/info/event-reservation/restaurant-reservation-summary";
import ConfirmInfo from "../../../../components/guest/public/components/info/event-reservation/confirm-info";
import QrCodeIcon from "../../../../assets/svg/destination-portal/QrCodeIcon";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import AlignToCenter from "../../../../components/AlignToCenter";
import TrackedChangesDialog from "../../../../components/TrackedChangesDialog";
import GuestReviews from "../../../../components/destination-portal/components/GuestReviews/GuestReviews";
import ScoreBox from "../../../../components/destination-portal/components/ScoreBox/ScoreBox";
import {initialState} from "../../../../state/constants";
import ReviewDialog from "../../../../components/ReviewDialog";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    mainContainter: {
        marginTop: "30px",
        paddingLeft: "64px",
        paddingRight: "64px",
        [theme.breakpoints.down('sm')]: {
            paddingLeft: "24px",
            paddingRight: "24px",
        },
    },
    topImage: {
        width: "100%",
        position: "relative",
        height: "480px",
        backgroundSize:"cover",
        backgroundPosition:"center",
        backgroundRepeat:"no-repeat",
        [theme.breakpoints.down("sm")]: {
            height: "350px",
        },
    },
    detailCardBackButton: {
        fontSize: "18px",
        fontWeight: "bold",
        [theme.breakpoints.down('sm')]: {
            fontSize: "16px",
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: "14px",
        },
    },
    sliderDescRoot: {
        textAlign: "center"
    },
    sliderDescTitle: {
        fontSize: "40px",
        fontWeight:"bold",
        [theme.breakpoints.down('sm')]: {
            fontSize: "24px",
        },
    },
    sliderDescText: {
        paddingBottom: "8px",
        fontSize: "25px",
        [theme.breakpoints.down('sm')]: {
            fontSize: "16px",
        },
    },
    guestPortalButton: {
        padding: "12px 16px",
        color: "#FFFFFF",
        backgroundColor: "#44B3E4",
        textTransform: "none",
        "&:hover": {
            backgroundColor: "#44B3E4",
        },
        [theme.breakpoints.down('xs')]: {
            width: "100%"
        },
    },
    dialogTitle: {
        paddingBottom: "16px",
        fontWeight: "bold",

    },
    dialogText: {
        paddingBottom: "16px"
    },
    dialogYesButton: {
        marginLeft: "8px",
        color: "#FFFFFF",
        backgroundColor: "#44B3E4",
        "&:hover": {
            backgroundColor: "#44B3E4",
        },
    },
    mainTitle: {
        fontSize: "40px",
        fontWeight: "600",
        color: "#122D31",
        textTransform: "capitalize",
        [theme.breakpoints.down('xs')]: {
            fontSize: "24px",
        },
    },
    addressTextDiv: {
        display: "flex",
        flexGrow: "1",
        [theme.breakpoints.down('xs')]: {
            fontSize: "16px",
            display: "unset",
        },
    },
    addressText: {
        paddingLeft: "8px",
        fontSize: "18px",
        color: "#122D31",
        textTransform: "capitalize"
    },
    infoIconDiv: {
        [theme.breakpoints.down('xs')]: {
            textAlign: "center"
        },
    },
    infoIcon: {
        width: "3.5em",
        height: "3.5em",
    },
    infoTitle: {
        fontSize: "32px",
        fontWeight: "bold",
        [theme.breakpoints.down('xs')]: {
            textAlign: "center"
        },
    },
    infoDesc: {
        fontSize: "20px",
    },
    showOnMapButton: {
        fontSize: "20px",
        fontWeight: "600",
        textTransform: "capitalize",
        [theme.breakpoints.down('xs')]: {
            fontSize: "16px",
        },
    },
    bottomTitle: {
        fontSize: "26px",
        fontWeight: "bold",
        color: "#004988",
    },
    bookCard: {
        width: "100%",
        marginBottom: "24px",
        [theme.breakpoints.down('xs')]: {
            position: "unset",
            paddingTop: "24px",
        },
    },
    textFieldStyle: {
        borderRadius: "5px",
        textTransform: "capitalize",
        "& .MuiInputLabel-root": {
            fontSize: "14px",
            fontWeight: "600",
        },
        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                border: "none",
            },
            "&.Mui-focused fieldset": {
                border: "1px solid #C2D8DA",
                backgroundColor:"transparent"
            },
        },
        "& .MuiInputLabel-outlined": {
            color: "#122D31",
        },
        "& input": {
            fontSize: "14px",
        },
        "& .MuiFormHelperText-root": {
            display: "none"
        }
    },
    facilitiesCard:{
        borderRadius: 10,
        opacity:1,
        padding:10,
    },
    facilitiesCardTab:{
        fontSize:'1rem',
        fontWeight:'600',
        textAlign:'left',
        color:'#000000',
        textTransform:'capitalize',
    },
    facilitiesIcon:{
        width: "2em",
        height: "2em",
    },
    facilitiesTitle:{
        color:'#004988',
        fontSize:26,
        fontWeight:'bold',
        paddingBottom:16,
    },
    menuButton: {
        backgroundImage: 'url(/imgs/destination-portal/menu-background.jpg)',
        backgroundSize:"cover",
        backgroundPosition:"center",
        backgroundRepeat:"no-repeat",
        backgroundColor: "#6DB3F2",
        height: "80px",
        padding: "12px 16px",
        fontSize: "20px",
        fontWeight: "600",
        textTransform: "capitalize",
        [theme.breakpoints.down('xs')]: {
            width: "100%"
        },
        "&:before": {
            content: "''",
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "rgb(0, 0, 0, 0.5)",
        },
        "& .MuiButton-label": {
            zIndex: 1
        }
    },
    noRoomDatePicker: {
        "& .MuiPickersBasePicker-pickerView > .MuiPickersDay-root": {
            fontWeight: "500",
            fontSize: "16px",
        },
        "& .MuiPickersBasePicker-pickerView .MuiButtonBase-root": {
            fontWeight: "500",
            fontSize: "16px",
        },
        "& .MuiPickersBasePicker-pickerView > .MuiButton-root.Mui-disabled": {
            fontWeight: "400",
            fontSize: "0.875rem"
        }
    },
    noRoomTextField: {
        "& .MuiFormHelperText-root": {
            display: "none"
        }
    },
    discRatioText: {
        fontSize: '12px',
        color: '#122D31'
    },
    discAmountText: {
        fontSize: '18px',
        color: '#122D31'
    },
    cardContent: {
        padding: "4px 24px"
    },
    reviewsContainer: {
        minHeight: '364px',
        [theme.breakpoints.down('xs')]: {
            height: "auto"
        },

    }
}))

const useStyles2 = makeStyles((theme) => ({
    linearProgressRoot: props =>  ({
        "& .MuiLinearProgress-barColorPrimary": {
            backgroundColor: props.backgroundColor
        },
        padding: "5px 0",
        borderRadius: "5px"
    })
}))

function LinearProgressWithLabel(props) {
    const classes = useStyles2({backgroundColor: props.progressBarColor});
    return (
        <Grid container>
            <Grid item xs={10} sm={11} style={{alignSelf: "center"}}>
                <LinearProgress className={classes.linearProgressRoot} variant="determinate" value={props.value} color={"primary"} style={{backgroundColor:"#F2F2F2"}}/>
            </Grid>
            <Grid item xs={2} sm={1}>
                <Typography variant="body2" color="textSecondary">{`${Math.round(
                    props.count,
                )}`}</Typography>
            </Grid>
        </Grid>
    );
}


function Review(props) {
    const classes = useStyles()
    const { title, count, totalCount, progressBarColor } = props

    let point;
    point = totalCount / count ;
    point = (100 / point);

    return(
        <Grid container>
            <Grid item xs={4} sm={2}>
                <Typography>
                    {title}
                </Typography>
            </Grid>
            <Grid item xs={8} sm={10}>
                <LinearProgressWithLabel value={point} count={count} progressBarColor={progressBarColor} />
            </Grid>
        </Grid>
    )
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`scrollable-force-tabpanel-${index}`}
            aria-labelledby={`scrollable-force-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

function a11yProps(index) {
    return {
        id: `scrollable-force-tab-${index}`,
        'aria-controls': `scrollable-force-tabpanel-${index}`,
    };
}


function DestinationPortalDetail(props) {
    const classes = useStyles()

    const { GENERAL_SETTINGS, locale, WEBCMS_DATA} = useContext(WebCmsGlobal);
    const primaryColor = WEBCMS_DATA.assets?.colors?.primary?.main || '#44B3E4'

    const isLogin = !!useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth)
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
    const token = useSelector((state) =>
        state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN
    )
    const changeHotelRefNo = useSelector((state) => state?.formReducer?.guest?.changeHotelRefno || false)
    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar()
    const { setToState, updateState, state } = props;

    const [sliderData, setSliderData] = useState([]);
    const [slider, setSlider] = useState({ nav1: null, nav2: null })
    const router = useRouter();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isSliderLoaded, setIsSliderLoaded] = useState(false);
    const [openMap, setOpenMap] = useState(false);
    const [faqDialog, setFaqDialog] = useState(false)
    const [openReservation, setOpenReservation] = useState(false);
    const [surveyDialog, setSurveyDialog] = useState(false);

    const commentInitialValue = 4;
    const [commentPage, setCommentPage] = useState(1);
    const indexOfLastComment = commentPage * commentInitialValue;
    const indexOfFirstComment = indexOfLastComment - commentInitialValue;
    const [hotelList, setHotelList] = useState([]);
    const [tabValue, setTabValue] = useState(0);

    const [openQrDialog, setOpenQrDialog] = useState(false);
    const [openToolTip, setOpenToolTip] = useState(false);
    const [resEventInfo, setResEventInfo] = useState(false);
    const [subTotal, setSubTotal] = useState(0);
    const [imageUrl, setImageUrl] = useState('');
    const [isPatchCompleted, setIsPatchCompleted] = useState(false);
    const [currency, setCurrency] = useState(null);
    const [guestDiscRate, setGuestDiscRate] = useState(false);
    const [isLoadingResEvent, setIsLoadingResEvent] = useState(false);
    const [convertedScore, setConvertedScore] = useState(0);
    const [openTrackedDialog, setOpenTrackedDialog] = useState(false);

    const [commentScore, setCommentScore] = useState(0)
    const [commentNote, setCommentNote] = useState({
        value: '',
        isError: false
    });
    const [isCommentSaving, setIsCommentSaving] = useState(false);
    const [isCommentLoading, setIsCommentLoading] = useState(false);
    const [reservationInfo, setReservationInfo] = useState(null);
    const [isCanAddReview, setIsCanAddReview] = useState({
        value: false,
        errorDesc: ''
    });


    const [adultCount, setAdultCount] = useState(2);
    const [childCount, setChildCount] = useState([]);
    const [selectedDate, setSelectedDate] = useState([null, null]);
    const [noRoomDate, setNoRoomDate] = useState(moment(new Date()));
    const [noRoomTime, setNoRoomTime] = useState(moment(new Date()))
    const [isInvalidTime, setIsInvalidTime] = useState(false);
    const [isInvalidDate, setIsInvalidDate] = useState(false);
    const [availableDateList, setAvailableDateList] = useState([]);
    const [availableHourList, setAvailableHourList] = useState([]);
    const [availableMinuteList, setAvailableMinuteList] = useState([]);
    const [minStay, setMinStay] = useState(1);
    const [night, setNight] = useState(null);
    const [totalNight, setTotalNight] = useState(0);
    const [maxChild, setMaxChild] = useState(3);
    const [maxAdult, setMaxAdult] = useState(1);
    const [maxChildAge, setMaxChildAge] = useState(8);
    const [openRestaurantMenu, setOpenRestaurantMenu] = useState(false);
    const [eventLocData, setEventLocData] = useState(null);
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [openTimePicker, setOpenTimePicker] = useState(false);

    let slider1, slider2;
    const [zoom, setZoom] = useState(1);
    const [center, setCenter] = useState({
        lat: 47.8679381,
        lng: 21.1141038
    })


    const guestAppAndroid = "https://play.google.com/store/apps/details?id=systems.hotech.guestapp";
    const guestAppIos = "https://apps.apple.com/us/app/otello-guestapp/id1512565386"


    const CHECKIN_DATE = moment(new Date(), 'DD-MM-YYYY')
    const CHECKOUT_DATE = moment(new Date(), 'DD-MM-YYYY').add(minStay, 'days')

    if (selectedDate[0] === null && selectedDate[1] === null) {
        const value = [...selectedDate];
        value[0] = CHECKIN_DATE;
        value[1] = CHECKOUT_DATE;
        setSelectedDate(value);
    }

    if (night === null) {
        setNight(minStay)
    }

    const handleSelectDate = (date) => {
        if (date && date[0] && date[0]._d && date[1] && date[1]._d) {
            const checkInDateTime = date[0]._d.getTime()
            const checkOutDateTime = date[1]._d.getTime()

            const dateDiff = Math.abs(checkInDateTime - checkOutDateTime)
            const totalNight = Math.ceil(dateDiff / (1000 * 3600 * 24))


            if (minStay > totalNight) {
                enqueueSnackbar(`${t('str_chooseMinError')} ${minStay} ${t('str_daysDot')}`, { variant: 'error' })
                const value = [...selectedDate];
                value[0] = moment(selectedDate[0]);
                value[1] = moment(selectedDate[1]);
                setSelectedDate(value);
            } else {
                setSelectedDate(date);
                setTotalNight(totalNight);
            }
        }
    }

    const handleNoRoomSelectDate = (date) => {
        const momentDate = moment(date).format("YYYY-MM-DD")
        setNoRoomDate(date);
        setToState('guest', ['eventLocTransDate'], momentDate)
        if(isLogin && !isInvalidDate) {
            if(moment(momentDate).isValid()) {
                getAvailableTime(momentDate)
            }

        }

    }

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)
    }

    const getSliderSetting = () => {
        return {
            lazyLoad: true,
            slidesToShow: 1,
            arrows: true,
            dots: true,
            accessibility: true,
            centerMode: true,

        }
    }

    const descSetting = {
        centerMode: true,
        slidesToShow: 1,
        arrows: false,
        dots: false,
        fade: true,
    }

    const handleBack = () => {
        if(router.query.catid) {
            router.push({
                    pathname: '/guest',
                    query: {lang: router.query.lang || locale, catid: router.query.catid}
                },
                undefined,
                {scroll: false});
        } else {
            router.push({
                    pathname: '/guest',
                    query: {lang: router.query.lang || locale}
                },
                undefined,
                {scroll: false});
        }
        setToState("destinationPortal", ["lastScrollIndex"], state.scrollIndex);
        setToState("destinationPortal", ["scrollIndex"], 0);
        setToState("destinationPortal", ["hotelCommentList"], []);
    }

    const handleClickBookButton = () => {
        let stringChildAges = "";
        if(childCount.length > 0) {
            childCount.map((item,index) => {
                if(index < childCount.length - 1) {
                    stringChildAges = stringChildAges + item.childAge.toString() + ",";
                } else {
                    stringChildAges = stringChildAges + item.childAge.toString();
                }
            })
        }

        if(state.selectedHotel && state.selectedHotel.webkey) {
            let useHotelUrl
            if (!state.selectedHotel.webkey.includes('.')) {
                useHotelUrl = `${state.selectedHotel.webkey}.vimahotels.com`
            } else {
                useHotelUrl = state.selectedHotel.webkey
            }

            const win = window.open(`https://${useHotelUrl}/booking/rooms?ci=${moment(selectedDate[0]).format("DD-MM-YYYY")}&co=${moment(selectedDate[1]).format("DD-MM-YYYY")}&adult=${adultCount}&child=${childCount.length}${childCount.length > 0 ? `&childAges=${stringChildAges}` : ""}`, '_blank');
            if (win != null) {
                win.focus()
            }
        }

    }

    const handleOpenGuestApp = () => {
        if (state.webKey !== '') {
            const operationSystem = getOperationSystemName()
            if (operationSystem?.os === 'Android' || operationSystem?.os === 'iOS') {
                setDialogOpen(true)
            } else {
                let useHotelUrl
                if (!state.webKey.includes('.')) {
                    useHotelUrl = `${state.webKey}.vimahotels.com`
                } else {
                    useHotelUrl = state.webKey
                }

                const win = window.open(`https://${useHotelUrl}/guest`, '_blank');
                if (win != null) {
                    win.focus()
                }
            }
        }
    }

    const handleGo = () => {
        if(state.webKey !== "") {
            const operationSystem = getOperationSystemName()
            if(operationSystem?.os === "Android") {
                router.push(guestAppAndroid)
            } else if(operationSystem.os === "iOS") {
                router.push(guestAppIos)
            } else {
                let useHotelUrl
                if (!state.webKey.includes('.')) {
                    useHotelUrl = `${state.webKey}.vimahotels.com`
                } else {
                    useHotelUrl = state.webKey
                }

                const win = window.open(`https://${useHotelUrl}/guest`, '_blank');
                if (win != null) {
                    win.focus()
                }
            }
        }
    }

    const handleClickYes = () => {
        setDialogOpen(false);
        handleGo();
    }

    const handleClickNo = () => {
        setDialogOpen(false);
        handleGo();
    }

    const handleOpenMenuDialog = () => {
        setOpenRestaurantMenu(true);
    }

    const handleOpenReservationDialog = () => {
        if(!isLogin) {
            setTimeout(() => {
                setToState("guest", ["openLoginDialog"], true);
            }, 200)
        } else {
            if(isInvalidDate || !moment(noRoomDate).isValid()) {
                enqueueSnackbar('Please select an available date', {variant: "error"})
            } else {
                if(isInvalidTime) {
                    enqueueSnackbar('Please select an available time', {variant: "error"})
                } else {
                    setOpenReservation(true);
                }
            }
            if(adultCount > 1) {
                setToState('guest', ['totalPax'], adultCount)
            }
            if(childCount > 0) {
                setToState('guest', ['totalChd'], childCount.length)
            }
            if(noRoomDate) {
                setToState('guest', ['eventLocTransDate'], moment(noRoomDate).format("YYYY-MM-DD"))
            }
            if(noRoomTime) {
                setToState('guest', ['eventLocTransTime'], moment(noRoomTime).format("HH:mm:ss"))
            }
        }

    }

    const findResEvent = () => {
        if(isLogin) {
            setOpenQrDialog(true)
            if(eventLocData) {
                if(!resEventInfo) {
                    setIsLoadingResEvent(true);
                    let resEventData = {}
                    resEventData.startdate = moment().format("YYYY-MM-DD")
                    resEventData.starttime = moment().format("HH:mm")
                    resEventData.enddate = moment().format("YYYY-MM-DD")
                    resEventData.endtime = moment().format("HH:mm")
                    resEventData.locid = eventLocData.locid
                    resEventData.eventrestype = TRANSTYPES.GUEST_ALACARTE
                    resEventData.clientid = loginfo.refid
                    resEventData.description = state.selectedHotel.title
                    resEventData.totalpax = adultCount
                    resEventData.expchd = childCount?.length || 0
                    resEventData.hotelrefno = changeHotelRefNo
                    Insert({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.RESEVENT,
                        token,
                        data: resEventData

                    }).then(r1 => {
                        if(r1.status === 200) {
                            setResEventInfo(r1.data.data)
                            setIsLoadingResEvent(false);
                        } else {
                            setIsLoadingResEvent(false);
                        }
                    })
                }
            }
        } else {
            setToState('guest', ["openLoginDialog"], true);
        }

    }

    const handleCreateQRCode = (data) => {
        if(data) {
            axios({
                url: `${GENERAL_SETTINGS.OREST_URL}/tools/qrcode`,
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                method: 'get',
                responseType: 'arraybuffer',
                params: {
                    link: GENERAL_SETTINGS.BASE_URL + `guest/resevent/${data.gid}?reservno=${data.reservno}`
                },
            }).then(res => {
                if(res.status === 200) {
                    let blob = new Blob([res.data], {type: 'png'})
                    let url = URL.createObjectURL(blob);
                    setImageUrl(url);
                }
            })
        }
    }

    const handlePatchResEvent = () => {
        if(resEventInfo) {
            let discAmount;
            let totalPrice;
            if(guestDiscRate && guestDiscRate > 0) {
                discAmount = subTotal * (guestDiscRate / 100) + resEventInfo.freeamount
                totalPrice = (subTotal-discAmount)
            } else {
                totalPrice = subTotal
            }

            Patch({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RESEVENT,
                token,
                gid: resEventInfo.gid,
                params: {
                    hotelrefno: resEventInfo.hotelrefno || changeHotelRefNo
                },
                data: {
                    subtotal: Number(subTotal),
                    totalprice: Number(totalPrice)
                }
            }).then(res => {
                if(res.status === 200) {
                    setIsPatchCompleted(true);
                    enqueueSnackbar(t('str_success'), {variant: 'success'})
                    ViewList({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.RESEVENT,
                        token,
                        params: {
                            query: `gid:${resEventInfo.gid}`,
                            hotelrefno: changeHotelRefNo
                        }
                    }).then(res => {
                        if(res.status === 200) {
                            if(res.data.count > 0) {
                                setResEventInfo(res.data.data[0])
                            }
                        }
                    })
                    handleCreateQRCode(resEventInfo);
                }
            })
        }
    }

    const handleCommentPage = (event, value) => {
        setCommentPage(value);
    }

    useEffect(() => {
        if(isLogin && state.selectedHotel) {
            if(state.selectedHotel.noroom && availableDateList.length <= 0) {
                axios({
                    url: GENERAL_SETTINGS.OREST_URL + "/eventloc/date/list",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        locid: state.selectedHotel.locid,
                        hotelrefno: state.selectedHotel.id,
                        allhotels: true
                    }
                }).then(res => {
                    if(res.status === 200) {
                        if(res.data.success && res.data.data.length > 0) {
                            setAvailableDateList(res.data.data);
                            const today = res.data.data.find(e => e.transdate === moment(noRoomDate).format("YYYY-MM-DD"))
                            if(today) {
                                getAvailableTime(today.transdate)
                            }

                        }
                    }
                })
            }
            axios({
                url: GENERAL_SETTINGS.OREST_URL + '/sett/curr/official',
                method: REQUEST_METHOD_CONST.GET,
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    hotelrefno: state.selectedHotel.id,
                }
            }).then(res => {
                if(res.status === 200) {
                    setCurrency(res.data.data)
                } else {

                }
            })
            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.CLIENT + SLASH + OREST_ENDPOINT.DISCRATE,
                method: REQUEST_METHOD_CONST.GET,
                token,
                params: {
                    clientid: loginfo?.refid
                }
            }).then(res => {
                if(res.status === 200) {
                    setGuestDiscRate(res.data.data.res)
                }
            })
            setIsLoadingResEvent(true);
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RESEVENT,
                token,
                params: {
                    query: `clientid:${loginfo?.refid},status:A,resdate:${moment().format("YYYY-MM-DD")}`,
                    hotelrefno: changeHotelRefNo || state.selectedHotel.id
                }
            }).then(res => {
                if(res.status === 200) {
                    if(res.data.count > 0) {
                        setIsLoadingResEvent(false)
                        setResEventInfo(res.data.data[0])
                        if(res.data.data[0] && res.data.data[0].totalprice) {
                            handleCreateQRCode(res.data.data[0]);
                        }
                    } else {
                        setIsLoadingResEvent(false);
                    }
                } else {
                    setIsLoadingResEvent(false)
                }
            })
            if(hotelList.length <= 0) {
                axios({
                    url: GENERAL_SETTINGS.OREST_URL + '/tools/user/hotel/list',
                    method: REQUEST_METHOD_CONST.GET,
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        empid: loginfo.id,
                        clientid: loginfo.refid
                    }
                }).then(res => {
                    if(res.status === 200) {
                        const array = res.data.data;
                        const checkHotel = array.find(e => e.hotelrefno === state.selectedHotel.id)
                        if(checkHotel) {
                            UseOrest({
                                apiUrl: GENERAL_SETTINGS.OREST_URL,
                                endpoint: OREST_ENDPOINT.CLIENT + SLASH + OREST_ENDPOINT.RESERVNO,
                                token,
                                params: {
                                    clientid: loginfo.refid,
                                    hotelrefno: state.selectedHotel.id,
                                }
                            }).then(res => {
                                if(res.status === 200) {
                                    if(res?.data?.data?.reservno) {
                                        const reservNoData = res.data.data
                                        setReservationInfo(reservNoData);
                                        handleGetClientReview(reservNoData.reservno)
                                    } else {
                                        setIsCanAddReview({
                                            value: false,
                                            errorDesc: t('You do not have a reservation')
                                        })
                                    }
                                }
                            })
                        } else {
                            setIsCanAddReview({
                                value: false,
                                errorDesc: t('str_youCannotAddReview')
                            })
                        }
                        setHotelList(res.data.data);
                    } else {
                        const retErr = isErrorMsg(res)
                        enqueueSnackbar(retErr.errorMsg, { variant: 'error' })
                    }
                })
            }

        }
    }, [state.selectedHotel, isLogin])

    useEffect(() => {
        setSlider({ ...slider, nav1: slider1, nav2: slider2 })
    }, [])

    useEffect(() => {
        if(!state.selectedHotel) {
            if(router.query.gid) {
                axios({
                    url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/app/portal/list',
                    method: REQUEST_METHOD_CONST.POST,
                    params: {
                        gid: router.query.gid
                    }
                }).then(r1 => {
                    if(r1.status === 200 && r1.data.success) {
                        setToState('destinationPortal', ['selectedHotel'], r1.data.data[0])
                    } else {
                        setToState('destinationPortal', ['selectedHotel'], null)
                    }
                })
            } else {
                setToState('destinationPortal', ['selectedHotel'], null)
            }
        } else {
            const data = {
                id: state.selectedHotel.locid,
                locid: state.selectedHotel.locid,
                locdepartid: state.selectedHotel.locdepartid,
                lochasres: state.selectedHotel.lochasres,
                locismulti: state.selectedHotel.locismulti,
                lochasmenu: state.selectedHotel.lochasmenu,
                locmid: state.selectedHotel.locmid,
                gapptypeid: state.selectedHotel.gapptypeid,
                localtitle: state.selectedHotel.localtitle,
                locdesc: state.selectedHotel.localtitle,
                hotelrefno: state.selectedHotel.id
            }
            setToState("destinationPortal", ["locId"], state.selectedHotel.locid)
            setEventLocData(data);
            const date = new Date();
            const startDate = new Date(date.getFullYear() - 1, 0, 1);
            const endDate = new Date(date.getFullYear(), 11, 31);
            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/stats/gen/satis',
                method: 'post',
                params: {
                    ischain: GENERAL_SETTINGS.ISCHAIN,
                    chainid: state.selectedHotel.id,
                    startdate: moment(startDate).format("YYYY-MM-DD"),
                    enddate: moment(endDate).format("YYYY-MM-DD")
                }
            }).then(res => {
                if(res.status === 200) {
                    if(res.data.success) {
                        if(res.data.data.length > 0) {
                            setToState("destinationPortal", ["hotelStats"], res.data.data[0]);
                            let score = res.data.data[0].avgscoreper;
                            score = (score * 5) / 100;
                            setConvertedScore(score);
                        }
                    }
                }
            })
            handleGetCommentList();
            const clientParams = {
                companyid: state.selectedHotel.id,
                ischain: GENERAL_SETTINGS.ISCHAIN,
                chainid: state.selectedHotel.id,
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO
            }

            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/facilities',
                method: 'post',
                params: clientParams
            }).then(res => {
                if(res.status === 200) {
                    if(res.data.success) {
                        setToState("destinationPortal", ["facilityList"], res.data.data)
                    }
                }
            })
            setToState("guest", ["changeHotelRefno"], state.selectedHotel.id)
            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/content/slider',
                method: 'post',
                params: {
                    isportal: GENERAL_SETTINGS.ISPORTAL,
                    chainid: state.selectedHotel.id,
                    sliderid: state.selectedHotel.sliderid
                }
            }).then(res => {
                if(res.status === 200 && res.data.success) {
                    let array = [];
                    res.data.data.map((item) => {
                        if(item.fileurl) {
                            array.push(item);
                        }
                    })
                    setIsSliderLoaded(true);
                    setSliderData(array);
                } else {
                    setIsSliderLoaded(true);
                }
            })
            if(state.selectedHotel.lat && state.selectedHotel.lng) {
                setZoom(17)
                const coordinate = {
                    lat: state.selectedHotel.lat,
                    lng: state.selectedHotel.lng,
                }
                setCenter(coordinate)
            }
            let params = {};
            params.hotelrefno = state.selectedHotel.id;
            const langCode = GENERAL_SETTINGS.hotelLocalLangGCode || "TR" || locale;
            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/ors/hotel/book/info',
                method: REQUEST_METHOD_CONST.POST,
                params: Object.assign(params,{
                    langcode: langCode,
                })
            }).then(r1 => {
                if(r1.status === 200) {
                    if(r1.data.success) {
                        if(r1.data.data.maxchd) {
                            setMaxChild(r1.data.data.maxchd);
                        }
                        if(r1.data.data.maxchdage) {
                            setMaxChildAge(r1.data.data.maxchdage);
                        }

                    }
                }
            })
            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/payment/type',
                method: 'post',
                params: {
                    uitoken: state.selectedHotel?.gid.toUpperCase(),
                    isportal: GENERAL_SETTINGS.ISPORTAL,
                    chainid: state.selectedHotel?.id
                },
            }).then((res) => {
                if (res.status === 200) {
                    setToState('ibe', ['hotelPaymentType'], res.data)
                    const defaultPayType =  res.data.paymentypes && res.data.paymentypes.sort((a, b) => a.index - b.index).sort((a, b) => b.isdef - a.isdef)[0]
                    setToState('ibe', ['selectedPaymentType'], defaultPayType)
                    updateState('ibe', 'selectedPaymentTypeId', Number(defaultPayType.id))
                    updateState('ibe', 'selectedPaymentTypeMid', Number(defaultPayType.mid))
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }
    }, [state.selectedHotel])

    const handleGetClientReview = (reservno) => {
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'surevportrans/view/list',
            token,
            params: {
                query: `reservno:${reservno},clientid:${loginfo?.refid}`,
                chkselfish: false,
                hotelrefno: state.selectedHotel.id
            }
        }).then(res => {
            if(res.status === 200) {
                if(res.data.data.length > 0) {
                    setIsCanAddReview({
                        value: false,
                        errorDesc: t('str_youAreAlreadyHaveAReview')
                    });
                } else {
                    setIsCanAddReview({
                        value: true,
                        errorDesc: ''
                    });
                }
            }
        })
    }

    const getAvailableTime = (searchDate) => {
        axios({
            url: GENERAL_SETTINGS.OREST_URL + "/eventloc/slot/list",
            method: REQUEST_METHOD_CONST.GET,
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                date: searchDate,
                locid: state.selectedHotel.locid,
                hotelrefno: state.selectedHotel.id,
            }
        }).then(r1 => {
            if(r1.status === 200) {
                if(r1.data.data.length > 0) {
                    const firstAvailableTime = r1.data.data[0].transdate + " " + r1.data.data[0].transtime
                    const firstAvailableTimeDateObj = new Date(firstAvailableTime);
                    if(firstAvailableTimeDateObj) {
                        setNoRoomDate(moment(firstAvailableTimeDateObj))
                        setNoRoomTime(moment(firstAvailableTimeDateObj))
                    }
                    let tempArray1 = []
                    let tempArray2 = []
                    r1.data.data.map((item) => {
                        let time = item.transtime.split(":");
                        tempArray1.push(time[0])
                        tempArray2.push(time[1])
                    })
                    setAvailableHourList(tempArray1)
                    setAvailableMinuteList(tempArray2);
                }
            }
        })
    }

    const handleDisableDate = (newDate) => {
        const checkDate = moment(newDate).format("YYYY-MM-DD");
        if(availableDateList.find(e => e.transdate === checkDate)) {
            return false
        }

        if(!isLogin || isLogin && availableDateList.length <= 0) {
            return false
        } else {
            return true;
        }
    }

    const handleOnErrorDate = (error) => {
        if(error) {
            setIsInvalidDate(true)
        } else {
            setIsInvalidDate(false)
        }
    }

    const handleTimeSelect = (newTime) => {
        setNoRoomTime(newTime)
        setToState('guest', ['eventLocTransTime'], moment(newTime).format("HH:mm:ss"))
    }

    const handleDisableTime = (timeValue, clockType) => {
        if (clockType === "hours" && availableHourList.find(e => parseInt(e) === timeValue)) {
            return false;
        }
        if(clockType === "minutes" && availableMinuteList.find(e => parseInt(e) === timeValue)) {
            return false
        }
        if(clockType === "seconds") {
            return false
        }
        if(!isLogin || isLogin && availableDateList.length <= 0) {
            return false
        } else {
            return true;
        }

    }

    const handleGetCommentList = () => {
        setIsCommentLoading(true);
        axios({
            url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/comment/list',
            method: REQUEST_METHOD_CONST.POST,
            params: {
                isportal: GENERAL_SETTINGS.ISPORTAL,
                chainid: state.selectedHotel.id,
            }
        }).then(res => {
            setIsCommentLoading(false);
            if(res.status === 200 && res.data.success) {
                setToState("destinationPortal", ["hotelCommentList"], res.data.data)
            }
        })
    }

    const handleOpenSurveys = () => {
        if(isLogin) {
            setSurveyDialog(true);
        } else {
            setToState("guest", ["openLoginDialog"], true);
        }
    }




    if(state.selectedHotel) {
        return (
            <DestinationPortalWrapper>
                <ReviewDialog
                    open={surveyDialog}
                    onClose={() => setSurveyDialog(false)}
                    params={{
                        clientid: loginfo?.refid,
                        hotelrefno: state.selectedHotel.id,
                        reservno: reservationInfo?.reservno
                    }}
                    handleAfterInsert={() => {
                        handleGetCommentList();
                        handleGetClientReview(reservationInfo?.reservno)
                    }}
                />
                <NextSeo title={`${state.selectedHotel.title?.removeHtmlTag()} - Portal`} />
                {
                    eventLocData ?
                        <MenuDialog
                            hotelrefno={state.selectedHotel.id}
                            isOpen={openRestaurantMenu}
                            onClose={(e) => {
                                setOpenRestaurantMenu(e)
                                //closeMenu()
                                updateState('guest', 'menuGroupAndProductList', FALSE)
                            }}
                            eventLocData={eventLocData}
                        /> : null
                }
                {
                    openReservation && eventLocData ? (
                        <RestaurantReservation
                            isOpen={openReservation}
                            onClose={(e) => {
                                setOpenReservation(e)
                                updateState('guest', 'menuGroupAndProductList', FALSE)
                            }}
                            eventLocData={eventLocData}
                            isPortal
                            isFromDetailPage
                            sliderTitle={state.selectedHotel.localtitle ||state.selectedHotel.title}
                            sliderDesc={state.selectedHotel.description}
                            sliderImg={state.selectedHotel.url}
                        />
                    ) : null
                }
                <Dialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                >
                    <div style={{padding:"16px"}}>
                        <Typography className={classes.dialogTitle}>{t("str_info")}</Typography>
                        <Typography className={classes.dialogText}>Do you want to continue with the GuestApp ?</Typography>
                        <div style={{textAlign: "right"}}>
                            <Button className={classes} onClick={handleClickNo}>{t("str_no")}</Button>
                            <Button className={classes.dialogYesButton} onClick={handleClickYes}>{t("str_yes")}</Button>
                        </div>
                    </div>
                </Dialog>
                <Container maxWidth="xl" className={classes.mainContainter}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Grid container>
                                <Grid item xs={10}>
                                    <Typography className={classes.mainTitle}>{state.selectedHotel?.title?.removeHtmlTag().toLowerCase()}</Typography>
                                    <div style={{display:"flex"}}>
                                        <div className={classes.addressTextDiv}>
                                            <Rating name="read-only" value={state.selectedHotel.locrate} precision={0.1} readOnly />
                                            <Typography className={classes.addressText}>
                                                {state.selectedHotel.town !== null && state.selectedHotel.town !== "" ? (state.selectedHotel?.town?.toLowerCase() +  ", ") : ""} {state.selectedHotel.city !== null && state.selectedHotel.city !== "" ? (state.selectedHotel?.city?.toLowerCase() + ", ") : ""} {state.selectedHotel.country !== null ? state.selectedHotel?.country?.toLowerCase() : ""}
                                            </Typography>
                                        </div>
                                    </div>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            {
                                isSliderLoaded ? (
                                        <Grid container spacing={3}>
                                            {
                                                sliderData && sliderData.length > 1 ? (
                                                    <React.Fragment>
                                                        <Grid item xs={12}>
                                                            <Slider asNavFor={slider.nav2} ref={(slider) => (slider1 = slider)} {...getSliderSetting()}>
                                                                {
                                                                    sliderData.map((item,index) => (
                                                                        <div key={index} >
                                                                            <div style={{marginLeft: "10px", marginRight: "10px"}}>
                                                                                <div className={classes.topImage} style={{backgroundImage: `url(${GENERAL_SETTINGS.STATIC_URL}${item.fileurl})`}}/>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                }
                                                            </Slider>
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <Slider asNavFor={slider.nav1} ref={(slider) => (slider2 = slider)} {...descSetting}>
                                                                {
                                                                    sliderData.map((item,index) => (
                                                                        <div key={index}>
                                                                            <div className={classes.sliderDescRoot}>
                                                                                {/*<Typography className={classes.sliderDescTitle}>{item.slidertitle?.remove}</Typography>*/}
                                                                                <Typography className={classes.sliderDescText}>{item.sliderdesc?.removeHtmlTag()}</Typography>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                }
                                                            </Slider>
                                                        </Grid>
                                                    </React.Fragment>
                                                ) : state.selectedHotel.url ?
                                                    <Grid item xs={12}>
                                                        <div className={classes.topImage} style={{backgroundImage: `url(${GENERAL_SETTINGS.STATIC_URL}${state.selectedHotel.url})`}}/>
                                                    </Grid>
                                                    :
                                                    <Grid item xs={12}>
                                                        <img className={classes.topImage} src={"/imgs/no-image available-placeholder.png"} />
                                                    </Grid>
                                            }
                                        </Grid>
                                    ) :
                                    <HomeSliderPlaceHolder />
                            }
                        </Grid>
                        <Grid item xs={12}>
                        </Grid>
                        <Grid item xs={12} sm={7} md={8}>
                            {
                                /*
                                <Card style={{backgroundColor: "rgb(255, 215, 64, 0.6 )"}}>
                                <CardContent>
                                    <Grid container>
                                        <Grid item xs={12} sm={4} md={2}>
                                           <div className={classes.infoIconDiv}>
                                               <AccessAlarmIcon className={classes.infoIcon} />
                                           </div>
                                        </Grid>
                                        <Grid item xs={12} sm={8} md={10}>
                                            <Typography className={classes.infoTitle}>
                                                Occasion
                                            </Typography>
                                            <Typography className={classes.infoDesc}>
                                                78% cheaper than all properties in Siem Reap in the last 24 hours
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                                 */
                            }
                        </Grid>
                        <Grid item xs={12} sm={5} md={4} style={{alignSelf: "flex-end"}}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    {
                                        state.selectedHotel.noroom && eventLocData && eventLocData.lochasmenu ?
                                            <Button
                                                fullWidth
                                                variant={"contained"}
                                                color={"primary"}
                                                className={classes.menuButton}
                                                onClick={handleOpenMenuDialog}
                                            >
                                                {t("str_menu")}
                                            </Button>
                                            : null
                                    }
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        style={{textTransform: "none", fontSize: "20px", fontWeight: "600"}}
                                        color={'primary'}
                                        fullWidth
                                        variant={"contained"}
                                        disabled={!state.selectedHotel.hasgapp}
                                        endIcon={<img style={!state.selectedHotel.hasgapp ? { filter: 'grayscale(100%)'} : null} src="imgs/portal/guestapp.png" width={'30px'}/>}
                                        onClick={handleOpenGuestApp}

                                    >
                                        {t("str_visitGuestPortal")}
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        color={'primary'}
                                        style={{textTransform: "none", fontSize: "20px", fontWeight: "600"}}
                                        disabled={!state.selectedHotel.web || state.selectedHotel.web === ""}
                                        fullWidth
                                        variant={"contained"}
                                        href={state.selectedHotel.web}
                                        target={"_blank"}
                                    >
                                        {t('str_website')}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={12} md={8}>
                                    <Paper elevation={3}>
                                        <Box p={3}>
                                            <Grid container >
                                                <Grid item xs={6} sm={9}>
                                                    <CustomToolTip title={t('str_portalReviews')}>
                                                        <Typography className={classes.facilitiesTitle} style={{paddingBottom: 0, maxWidth: 150}}>
                                                            {t('str_reviews')}
                                                        </Typography>
                                                    </CustomToolTip>
                                                </Grid>
                                                <Grid item xs={3} sm={2} style={{textAlign: 'end'}}>
                                                    <ScoreBox score={convertedScore} />
                                                </Grid>
                                                <Grid item xs={3} sm={1} style={{textAlign: 'end'}}>
                                                    {
                                                        isLogin ? (
                                                            isCanAddReview.value ?
                                                                <Button onClick={handleOpenSurveys}><AddIcon /></Button>
                                                                :
                                                                <CustomToolTip title={isCanAddReview?.errorDesc} placement={"top"}>
                                                                    <div>
                                                                        <Button disabled><AddIcon /></Button>
                                                                    </div>
                                                                </CustomToolTip>
                                                        ) : (
                                                            <CustomToolTip title={'You must be logged in to fill out the survey.'} placement={"top"}>
                                                                <div>
                                                                    <Button disabled><AddIcon /></Button>
                                                                </div>
                                                            </CustomToolTip>
                                                        )
                                                    }

                                                </Grid>
                                            </Grid>
                                            <Divider style={{marginTop: 10, marginBottom: 15}}/>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <div style={{position: 'relative'}}>
                                                        {
                                                            isCommentLoading ? (
                                                                <LoadingSpinner />
                                                            ) : (
                                                                <div className={classes.reviewsContainer} >
                                                                    <Grid container spacing={3}>
                                                                        {
                                                                            state.hotelCommentList.length > 0 ? (
                                                                                state.hotelCommentList.slice(indexOfFirstComment, indexOfLastComment).map((item, index) => (
                                                                                        <Grid key={index} item xs={12}>
                                                                                            <GuestReviews index={index} review={item} page={commentPage}/>
                                                                                        </Grid>
                                                                                    )
                                                                                )
                                                                            ): (
                                                                                <Grid item xs={12}>
                                                                                    <Typography style={{textAlign: "center"}}>{t("str_noDataToDisplay")}</Typography>
                                                                                </Grid>
                                                                            )
                                                                        }
                                                                    </Grid>
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                </Grid>
                                                {
                                                    state.hotelCommentList.length > 0 ? (
                                                        <Grid item xs={12}>
                                                            <div style={{textAlign:"right", float: "right"}}>
                                                                <Pagination
                                                                    count={Math.ceil(state.hotelCommentList.length / commentInitialValue)}
                                                                    page={commentPage}
                                                                    onChange={handleCommentPage}
                                                                    shape={"rounded"}
                                                                    variant="outlined"
                                                                    showFirstButton
                                                                    showLastButton
                                                                />
                                                            </div>
                                                        </Grid>
                                                    ) : null
                                                }
                                            </Grid>
                                        </Box>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    {
                                        state.selectedHotel.noroom ?
                                            eventLocData && eventLocData.lochasres ? (
                                                <div style={{position: "relative"}}>
                                                    <div className={classes.bookCard}>
                                                        {
                                                            isLoadingResEvent ? (
                                                                <AlignToCenter backgroundColor={'rgb(0, 0, 0, 0.3)'}>
                                                                    <LoadingSpinner />
                                                                </AlignToCenter>
                                                            ) : null
                                                        }
                                                        <Paper elevation={3} style={{padding: "24px 32px"}}>
                                                            <div style={{ borderRadius: "8px", border: "1px solid #C2D8DA", padding: "16px"}}>
                                                                {
                                                                    isLogin && resEventInfo ? (
                                                                        <Grid container spacing={3}>
                                                                            <Grid item xs={12}>
                                                                                <RestaurantReservationSummary
                                                                                    companyTitle={state.selectedHotel.localtitle || state.selectedHotel.title}
                                                                                    date={resEventInfo.startdate}
                                                                                    time={resEventInfo.starttime}
                                                                                    adult={resEventInfo.totalpax}
                                                                                    child={resEventInfo.expchd}
                                                                                    elevation={0}
                                                                                    isHideTitle
                                                                                    removeLastChildPadding
                                                                                />
                                                                            </Grid>
                                                                            <Grid item xs={12} >
                                                                                <Button
                                                                                    style={{textTransform: "none",fontSize: "20px", fontWeight: "600"}}
                                                                                    startIcon={ <QrCodeIcon color={primaryColor}/>}
                                                                                    color={"primary"}
                                                                                    variant={"outlined"}
                                                                                    onClick={() => findResEvent()}
                                                                                    fullWidth
                                                                                >
                                                                                    {t('str_payWithQrCode')}
                                                                                </Button>
                                                                            </Grid>
                                                                        </Grid>
                                                                    ) : (
                                                                        <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                                                                            <Grid container spacing={3}>
                                                                                <Grid item xs={12} sm={6}>
                                                                                    <DesktopDatePicker
                                                                                        open={openDatePicker}
                                                                                        onClose={() => setOpenDatePicker(false) }
                                                                                        className={classes.noRoomDatePicker}
                                                                                        minDate={moment()}
                                                                                        onError={handleOnErrorDate}
                                                                                        value={noRoomDate}
                                                                                        label={t("str_date")}
                                                                                        onChange={(newDate) => handleNoRoomSelectDate(newDate)}
                                                                                        shouldDisableDate={(dateValue) => handleDisableDate(dateValue)}
                                                                                        inputFormat={"DD-MM-YYYY"}
                                                                                        mask={"__-__-____"}
                                                                                        renderInput={(props) => (
                                                                                            <TextField
                                                                                                onClick={() => setOpenDatePicker(true)}
                                                                                                className={classes.noRoomTextField}
                                                                                                fullWidth
                                                                                                variant={"outlined"}
                                                                                                {...props}
                                                                                            />
                                                                                        )}
                                                                                    />
                                                                                </Grid>
                                                                                <Grid item xs={12} sm={6}>
                                                                                    <TimePicker
                                                                                        open={openTimePicker}
                                                                                        onClose={() => setOpenTimePicker(false)}
                                                                                        ampm={false}
                                                                                        inputFormat="HH:mm"
                                                                                        mask="__:__"
                                                                                        label={t("str_hour")}
                                                                                        value={noRoomTime}
                                                                                        onError={(e) => {
                                                                                            if(e) {
                                                                                                setIsInvalidTime(true)
                                                                                            } else {
                                                                                                setIsInvalidTime(false)
                                                                                            }
                                                                                        }}
                                                                                        onChange={(newValue) => handleTimeSelect(newValue)}
                                                                                        shouldDisableTime={(timeValue, clockType) => handleDisableTime(timeValue, clockType)}
                                                                                        renderInput={(props) => (
                                                                                            <TextField
                                                                                                onClick={() => setOpenTimePicker(true)}
                                                                                                className={classes.noRoomTextField}
                                                                                                fullWidth
                                                                                                variant={"outlined"}
                                                                                                {...props}
                                                                                            />
                                                                                        )}
                                                                                    />
                                                                                </Grid>
                                                                                <Grid item xs={12}>
                                                                                    <NumberOfGuest
                                                                                        adult={adultCount}
                                                                                        setAdult={setAdultCount}
                                                                                        maxAduldt={maxAdult}
                                                                                        child={childCount}
                                                                                        setChild={setChildCount}
                                                                                        maxChild={maxChild}
                                                                                        maxChildAge={maxChildAge}
                                                                                        isRestaurantRes
                                                                                    />
                                                                                </Grid>
                                                                                <Grid item xs={12} >
                                                                                    <Button
                                                                                        style={{textTransform: "none", fontSize: "20px", fontWeight: "600"}}
                                                                                        color={"primary"}
                                                                                        variant={"contained"}
                                                                                        fullWidth
                                                                                        onClick={() => handleOpenReservationDialog()}
                                                                                    >
                                                                                        {t("str_book")}
                                                                                    </Button>
                                                                                </Grid>
                                                                                <Grid item xs={12} >
                                                                                    <Button
                                                                                        style={{textTransform: "none",fontSize: "20px", fontWeight: "600"}}
                                                                                        startIcon={ <QrCodeIcon color={primaryColor}/>}
                                                                                        color={"primary"}
                                                                                        variant={"outlined"}
                                                                                        onClick={() => findResEvent()}
                                                                                        fullWidth
                                                                                    >
                                                                                        {t('str_payWithQrCode')}
                                                                                    </Button>
                                                                                </Grid>
                                                                            </Grid>
                                                                        </LocalizationProvider>
                                                                    )
                                                                }
                                                            </div>
                                                        </Paper>
                                                    </div>
                                                </div>
                                            ) : null
                                            : (
                                                state.selectedHotel.webkey && state.selectedHotel.webkey !== "" ? (
                                                    <div style={{position: "relative"}}>
                                                        <div className={classes.bookCard}>
                                                            <Paper elevation={3} style={{padding: "24px 32px"}}>
                                                                <div style={{ borderRadius: "8px", border: "1px solid #C2D8DA"}}>
                                                                    <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                                                                        <DesktopDateRangePicker
                                                                            minDate={moment()}
                                                                            startText={t('str_checkinDate')}
                                                                            endText={t('str_checkoutDate')}
                                                                            value={selectedDate}
                                                                            onChange={handleSelectDate}
                                                                            inputFormat="DD-MM-YYYY"
                                                                            mask={"__-__-____"}
                                                                            renderInput={(startProps, endProps) => (
                                                                                <React.Fragment>
                                                                                    <TextField fullWidth helperText={" "} className={classes.textFieldStyle} {...startProps} />
                                                                                    <DateRangeDelimiter><div style={{backgroundColor:"#C2D8DA", width:"1px", height:"15px"}}/></DateRangeDelimiter>
                                                                                    <TextField fullWidth helperText={" "} className={classes.textFieldStyle} {...endProps} />
                                                                                </React.Fragment>
                                                                            )}
                                                                        />
                                                                    </LocalizationProvider>
                                                                    <Divider />
                                                                    <NumberOfGuest
                                                                        textFieldStyle={classes.textFieldStyle}
                                                                        adult={adultCount}
                                                                        setAdult={setAdultCount}
                                                                        maxAduldt={maxAdult}
                                                                        child={childCount}
                                                                        setChild={setChildCount}
                                                                        maxChild={maxChild}
                                                                        maxChildAge={maxChildAge}
                                                                    />
                                                                </div>
                                                                <div style={{paddingTop: "16px"}}/>
                                                                {
                                                                    state.selectedHotel.webkey && state.selectedHotel.webkey !== "" ?
                                                                        <Button
                                                                            style={{textTransform: "none", fontSize: "20px", fontWeight: "600"}}
                                                                            color={'primary'}
                                                                            variant={'contained'}
                                                                            fullWidth
                                                                            onClick={() => handleClickBookButton()}
                                                                        >
                                                                            {t("str_book")}
                                                                        </Button>
                                                                        : null
                                                                }
                                                            </Paper>
                                                        </div>
                                                    </div>
                                                ) : null
                                            )
                                    }
                                    <div style={{position: "relative"}}>
                                        <div style={{ width: "100%", height: 145, borderRadius: 8, overflow: 'hidden' }}>
                                            <GoogleMap
                                                bootstrapURLKeys={{
                                                    key: process.env.GOOGLE_MAP_API_KEY,
                                                    libraries: ['places', 'geometry'],
                                                }}
                                                center={center}
                                                zoom={12}
                                                options={{
                                                    scrollwheel: false,
                                                    gestureHandling: "none",
                                                    fullscreenControl:false,
                                                    zoomControl: false,
                                                    draggingCursor: "default",
                                                    draggableCursor: "default"
                                                }}
                                                shouldUnregisterMapOnUnmount={true}
                                                yesIWantToUseGoogleMapApiInternals={true}
                                            >

                                            </GoogleMap>
                                        </div>
                                        <div style={{width: "100%", top: "0", height: "100%", position: "absolute", backgroundColor: "rgb(0, 0, 0, 0.2 )"}}>
                                            <div style={{position: "absolute", margin: "0", top:"50%", left: "50%", transform: "translate(-50%, -50%)"}}>
                                                <Button color={"primary"} onClick={() => setOpenMap(!openMap)} className={classes.showOnMapButton} variant={"contained"}>{!openMap ? t("str_showOnMap") : t("str_close")}</Button>
                                            </div>
                                        </div>
                                    </div>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Collapse in={openMap}>
                                <div style={{ height: 350, borderRadius: 8, overflow: 'hidden' }}>
                                    <GoogleMap
                                        bootstrapURLKeys={{
                                            key: process.env.GOOGLE_MAP_API_KEY,
                                            libraries: ['places', 'geometry'],
                                        }}
                                        center={center}
                                        zoom={zoom}
                                        shouldUnregisterMapOnUnmount={true}
                                        yesIWantToUseGoogleMapApiInternals={true}
                                    >
                                        {
                                            state.selectedHotel.lat && state.selectedHotel.lng ?
                                                <LocationOnIcon lat={state.selectedHotel.lat} lng={state.selectedHotel.lng} style={{color:"red"}}/>
                                                :
                                                null
                                        }
                                    </GoogleMap>
                                </div>
                            </Collapse>
                        </Grid>
                        <Grid item xs={12}>
                            <Card className={classes.facilitiesCard} elevation={3}>
                                <CardContent>
                                    <Grid container>
                                        <Grid item xs={12}>
                                            <Typography className={classes.facilitiesTitle}>
                                                {t("str_facilities")}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            {
                                                state.facilityList.length > 0 ?
                                                    <Tabs
                                                        value={tabValue}
                                                        onChange={handleTabChange}
                                                        variant="scrollable"
                                                        scrollButtons="on"
                                                        aria-label="scrollable force tabs example"
                                                    >
                                                        {
                                                            state.facilityList.map((item, i) => (
                                                                <Tab key={`tab-${i}`} label={item.factcode} className={classes.facilitiesCardTab}  {...a11yProps(i)} />
                                                            ))
                                                        }
                                                    </Tabs> : <Typography style={{textAlign: "center"}}>{t("str_noDataToDisplay")}</Typography>
                                            }
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12}></Grid>
                        <Grid item xs={12} sm={12}>
                            <Typography onClick={() => setFaqDialog(true)} className={classes.bottomTitle}>{t("str_faq")}</Typography>
                            <div style={{paddingBottom: "16px"}}/>
                            <Faq isPortal chainId={state.selectedHotel.id} >
                                <FaqCommon />
                            </Faq>
                        </Grid>
                        <Grid item xs={12}>
                            <div style={{textAlign: "right"}}>
                                <Button color={"primary"} className={classes.detailCardBackButton} onClick={handleBack}>
                                    {t("str_back")}
                                </Button>
                            </div>
                        </Grid>
                    </Grid>
                </Container>
                <Dialog
                    open={openQrDialog}
                    onClose={() => setOpenQrDialog(false)}
                    fullWidth
                    maxWidth={isPatchCompleted || resEventInfo && resEventInfo.totalprice ? 'lg' : 'sm'}
                >
                    <div style={{padding: '24px'}}>
                        <Grid container>
                            {
                                isPatchCompleted || resEventInfo && resEventInfo.totalprice ? (
                                    <React.Fragment>
                                        <Grid item xs={12}>
                                            <ConfirmInfo
                                                date={resEventInfo.startdate}
                                                time={resEventInfo.starttime}
                                                adult={resEventInfo.totalpax}
                                                child={resEventInfo.totalchd}
                                                reservationNo={resEventInfo.reservno}
                                                sliderTitle={state.selectedHotel.localtitle || state.selectedHotel.title}
                                                sliderImg={state.selectedHotel.url}
                                                isHide={false}
                                                subTotal={resEventInfo?.subtotal}
                                                totalPrice={resEventInfo?.totalprice}
                                                currencyCode={resEventInfo?.pricecurrcode}
                                                guestDisc={guestDiscRate}
                                                qrImage={imageUrl}
                                                isFromQrPayment
                                            />
                                        </Grid>
                                    </React.Fragment>
                                ) : (
                                    <Grid container spacing={2}>
                                        {
                                            isLoadingResEvent ? (
                                                <Grid item xs={12}>
                                                    <div style={{textAlign: 'center'}}>
                                                        <LoadingSpinner />
                                                    </div>
                                                </Grid>
                                            ) : (
                                                <React.Fragment>
                                                    <Grid item xs={12}>
                                                        <Typography style={{paddingLeft: '24px', fontSize: "20px", fontWeight: "600"}}>
                                                            {t("str_detail")}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <RestaurantReservationSummary
                                                            companyTitle={state.selectedHotel.localtitle || state.selectedHotel.title}
                                                            date={resEventInfo ? resEventInfo.startdate : moment().format("YYYY-MM-DD")}
                                                            time={resEventInfo ? resEventInfo.starttime : moment().format("HH:mm")}
                                                            adult={resEventInfo ? resEventInfo.totalpax : adultCount}
                                                            child={resEventInfo ? resEventInfo.expchd : childCount.length}
                                                            elevation={0}
                                                            isHideTitle
                                                            removeLastChildPadding
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Divider />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Card elevation={0}>
                                                            <CardContent className={classes.cardContent}>
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs={12}>
                                                                        <NumberFormat
                                                                            required
                                                                            size={'small'}
                                                                            displayType={'input'}
                                                                            decimalScale={2}
                                                                            inputMode={'decimal'}
                                                                            isNumericString
                                                                            thousandSeparator
                                                                            customInput={TextField}
                                                                            onValueChange={(values) => setSubTotal(values.floatValue)}
                                                                            variant={'outlined'}
                                                                            label={t("str_pleaseEnterAmount")}
                                                                            inputProps={{ style: { textAlign: 'right', paddingRight: '8px' } }}
                                                                            InputProps={{
                                                                                endAdornment: (
                                                                                    <InputAdornment position="start">
                                                                                        {getSymbolFromCurrency(currency?.res)}
                                                                                    </InputAdornment>
                                                                                ),
                                                                            }}
                                                                        />
                                                                        <div style={{paddingTop: '4px'}}>
                                                                            <Typography className={classes.discRatioText}>{`${t('str_discountRatio')}: ${guestDiscRate && guestDiscRate > 0 ? guestDiscRate + '%' : t('str_noDiscount')}`}</Typography>
                                                                        </div>
                                                                    </Grid>
                                                                    {
                                                                        guestDiscRate && guestDiscRate > 0 ? (
                                                                            <Grid item xs={12}>
                                                                                <Typography className={classes.discAmountText}>{`${t('str_discAmount')}: ${formatMoney(subTotal * (guestDiscRate / 100) + resEventInfo.freeamount)}${getSymbolFromCurrency(currency?.res)}`}</Typography>
                                                                            </Grid>
                                                                        ) : null
                                                                    }
                                                                </Grid>
                                                            </CardContent>
                                                        </Card>
                                                    </Grid>
                                                </React.Fragment>
                                            )
                                        }
                                    </Grid>
                                )
                            }
                            <Grid item xs={12}>
                                <div style={{textAlign: "right", paddingTop:"16px"}}>
                                    <Button
                                        onClick={() => {
                                            if(isPatchCompleted) {
                                                setSubTotal(0);
                                                setOpenQrDialog(false)
                                            } else {
                                                if(subTotal && subTotal > 0) {
                                                    setOpenTrackedDialog(true);
                                                } else {
                                                    setOpenQrDialog(false)
                                                }
                                            }

                                        }}
                                    >
                                        {isPatchCompleted || resEventInfo && resEventInfo.totalprice > 0 ? t('str_close') : t('str_cancel')}
                                    </Button>
                                    {
                                        !isPatchCompleted && resEventInfo?.totalprice <= 0 ? (
                                            subTotal <= 0 || !subTotal ? (
                                                <CustomToolTip
                                                    title={
                                                        <div>
                                                            <Typography style={{fontWeight: '600', fontSize: 'inherit'}}>
                                                                {t('str_invalidFields')}
                                                            </Typography>
                                                            {
                                                                subTotal <= 0 || !subTotal ? (
                                                                    <Typography style={{fontSize: 'inherit'}}>{t('str_amount')}</Typography>
                                                                ) : null
                                                            }
                                                        </div>
                                                    }
                                                >
                                                    <span>
                                                         <Button
                                                             disabled
                                                             variant={"contained"}
                                                             color={"primary"}
                                                         >
                                                             {t('str_save')}
                                                    </Button>
                                                    </span>
                                                </CustomToolTip>
                                                ) : (
                                                <Button
                                                    disabled={subTotal <= 0 || !subTotal}
                                                    variant={"contained"}
                                                    color={"primary"}
                                                    onClick={handlePatchResEvent}
                                                >
                                                    {t('str_save')}
                                                </Button>
                                            )
                                        ) : null
                                    }
                                </div>
                            </Grid>
                        </Grid>
                    </div>
                </Dialog>
                <TrackedChangesDialog
                    open={openTrackedDialog}
                    onPressNo={(e) => setOpenTrackedDialog(e)}
                    onPressYes={(e) => {
                        if(surveyDialog) {
                            setSurveyDialog(false)
                            setCommentScore(0)
                            setCommentNote({
                                value: '',
                                isError: false
                            })
                        } else if(openQrDialog) {
                            setSubTotal(0);
                            setOpenQrDialog(false);
                        }
                        setOpenTrackedDialog(e);

                    }}
                />
            </DestinationPortalWrapper>
        )
    } else {
        return null
    }


}


const mapStateToProps = (state) => {
    return {
        state: state.formReducer.destinationPortal,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    pushToState: (stateType, stateName, value) => dispatch(pushToState(stateType, stateName, value)),
    deleteFromState: (stateType, stateName, value) => dispatch(deleteFromState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(DestinationPortalDetail)