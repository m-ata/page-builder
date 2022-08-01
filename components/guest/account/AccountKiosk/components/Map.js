import React, {useState, useContext, useEffect} from 'react'
import { Container, Grid, Icon, List, ListSubheader, ListItem, ListItemText, Box, Typography, Button  } from '@material-ui/core'
import GoogleMapReact from 'google-map-react'
import WebCmsGlobal from '../../../../webcms-global'
import axios from 'axios'
import { makeStyles } from '@material-ui/core/styles'
import { defaultLocale } from '../../../../../lib/translations/config'
import { jsonGroupBy } from '../../../../../model/orest/constants'
import { connect, useSelector } from 'react-redux'
import { setToState, updateState } from '../../../../../state/actions'
import clsx from 'clsx'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import LoadingSpinner from '../../../../LoadingSpinner'
import BusinessIcon from '@material-ui/icons/Business'
import useTranslation from '../../../../../lib/translations/hooks/useTranslation'

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        backgroundColor: theme.palette.background.paper,
        position: 'relative',
        overflow: 'auto',
        maxHeight: 'calc(100vh - 250px)',
    },
    listSection: {
        backgroundColor: 'inherit',
    },
    ul: {
        backgroundColor: 'inherit',
        padding: 0,
    },
    subHeader: {
        background: '#f7f7f7'
    },
    locItem:{
        cursor: 'pointer',
        boxShadow: 'inset 0 -1px 0px 0px #d6d6d6'
    },
    locItemOnSelect: {
        backgroundColor: '#dee8f1',
        boxShadow: 'inset 0 -2px 0px 0px #2196f3'
    },
    listLocIcon: {
        color: '#5EC0E8'
    },
    markerMyLocIcon: {
        color: '#E91E62'
    },
    markerLocIcon: {
        marginTop: -25,
        marginLeft: -15,
        color: '#5EC0E8'
    },
    markerLocIconOnSelect: {
        color: '#1A5588',
        animation: '$bounce 0.6s ease-out',
        animationIterationCount: 'infinite',
        animationDelay: '0.6s'
    },
    "@keyframes bounce": {
        "0%": { transform: "translateY(-2px)" },
        "25%, 75%": { transform: "translateY(-5px)" },
        "50%": { transform: "translateY(-10px)" },
        "90%": { transform: "translateY(-2px)" },
        "100%": { transform: "translateY(0)" }
    },
    myLocButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        margin: 10,
        backgroundColor: '#2196f3',
        padding: '10px 15px 10px 15px',
        color: '#ffffff',
        "&:hover ": {
            color: '#ffffff',
            backgroundColor: '#137bcd'
        }
    }
}))

const geoFormat = (number) => {
    const str = String(number)
    const $1 = str.substr(0, 2)
    const $2 = str.substr(2, str.length)
    const res = `${$1}.${$2}`

    return parseFloat(res)
}

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const $lat1 = lat1 * Math.PI/180; // φ, λ in radians
    const $lat2 = lat2 * Math.PI/180;
    const $lat = (lat2-lat1) * Math.PI/180;
    const $lon = (lon2-lon1) * Math.PI/180;

    const a = Math.sin($lat/2) * Math.sin($lat/2) + Math.cos($lat1) * Math.cos($lat2) * Math.sin($lon/2) * Math.sin($lon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres
    return d
}

const intlFormat = (num) =>{
    return new Intl.NumberFormat().format(num);
}

const metricFormat = (num) =>{
    if(Math.round(num) >= 1000){
        return intlFormat(num/1000).slice(0,4)+'km';
    }else{
        return parseFloat(intlFormat(num))+'m';
    }
    return intlFormat(num);
}

const hashSelect = (select, lat, lng) => {
    const $s1 = String(select[0]).replace('.','')
    const $s2 = String(select[1]).replace('.','')
    const $r1 = `${$s1}-${$s2}`

    const $lat = String(lat).replace('.','')
    const $lng = String(lng).replace('.','')
    const $r2 = `${$lat}-${$lng}`

    return $r1 === $r2
}

const Marker = props => {
    const { isMyLoc, isSelect, name } = props
    const classes = useStyles()

    if(isMyLoc){
        return (<Icon title={name} className={clsx(classes.markerMyLocIcon, { [classes.markerLocIconOnSelect]: isSelect})} fontSize='large'>person_pin</Icon>)
    }

    return (<Icon title={name} className={clsx(classes.markerLocIcon, { [classes.markerLocIconOnSelect]: isSelect})} fontSize='large'>location_on</Icon>)
}

const Map = (props) => {
    const { state, setToState } = props
    const { t } = useTranslation()
    const { GENERAL_SETTINGS, locale } = useContext(WebCmsGlobal)
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)

    const classes = useStyles()
    const [myLocation, setMyLocation] = useState(false)
    const [mapCenter, setMapCenter] = useState({ lat: GENERAL_SETTINGS.hotelLocation.lat, lng: GENERAL_SETTINGS.hotelLocation.lng, })
    const [mapZoom, setMapZoom] = useState(18)
    const [locSelect, setLocSelect] = useState(false)
    const [myLocSelect, setMyLocSelect] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    let clientParams = {}
    clientParams.hotelrefno = loginfo && loginfo.hotelrefno || GENERAL_SETTINGS.HOTELREFNO

    useEffect(() => {
        let active = true
        if(active){
            let isChainHotelChange = false
            if (GENERAL_SETTINGS.ISCHAIN && state.changeHotelRefno !== false) {
                clientParams.ischain = true
                clientParams.chainid = state.changeHotelRefno
                clientParams.hotelrefno = GENERAL_SETTINGS.HOTELREFNO

                if(clientParams.chainid !== state.mapInfoList.chainid){
                    isChainHotelChange = true
                }

            } else {
                clientParams.ischain = false
                clientParams.chainid = false
            }

            let isLangChange = false
            if (state.mapInfoList.langcode !== locale) {
                isLangChange = true
                clientParams.langcode = locale
            }

            let isRequest
            if (GENERAL_SETTINGS.ISCHAIN) {
                isRequest = state.mapInfoList.data === false && GENERAL_SETTINGS.ISCHAIN && state.changeHotelRefno !== false
            } else {
                isRequest = state.mapInfoList.data === false && GENERAL_SETTINGS.ISCHAIN === false
            }

            if ((isRequest || isLangChange || isChainHotelChange) && isLoading === false) {
                setIsLoading(true)
                axios({
                    url: GENERAL_SETTINGS.BASE_URL + 'api/guestweb/hotel-info',
                    method: 'post',
                    params: {
                        langcode: clientParams.langcode || defaultLocale,
                        chainid: clientParams.chainid,
                        hotelrefno: clientParams.hotelrefno,
                        ischain: clientParams.ischain,
                    },
                }).then((infoResponse) => {
                    const infoData = infoResponse.data
                    if (infoData.success && infoData.data.length > 0) {
                        setIsLoading(false)
                        const useData = infoData.data.filter(item => item.locid && item.loclat && item.loclng)
                        setToState('guest', ['mapInfoList', 'data'], useData.length > 0 ? jsonGroupBy(useData, 'localcatdesc') : null)
                        setToState('guest', ['mapInfoList', 'langcode'], locale)
                        setToState('guest', ['mapInfoList', 'chainid'], clientParams.chainid)
                    } else {
                        setIsLoading(false)
                        setToState('guest', ['mapInfoList', 'data'], null)
                        setToState('guest', ['mapInfoList', 'langcode'], locale)
                        setToState('guest', ['mapInfoList', 'chainid'], clientParams.chainid)
                    }
                }).catch(()=> {
                    setIsLoading(false)
                    setToState('guest', ['mapInfoList', 'data'], null)
                    setToState('guest', ['mapInfoList', 'langcode'], locale)
                    setToState('guest', ['mapInfoList', 'chainid'], clientParams.chainid)
                })
            }
        }

        return () => {
            active = false
        }
    }, [state.changeHotelRefno, locale])

    useEffect(()=> {
        let active = true
        if (active && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                setMapCenter({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                })

                if(!myLocation){
                    setMyLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                }
            })
        }

    }, [navigator && navigator.geolocation])

    const handleMyLocation = () => {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = Number(String(position.coords.latitude).replace('.',''))
            const lng = Number(String(position.coords.longitude).replace('.',''))
            setLocSelect([lat, lng])
            setMyLocSelect(true)
        })
    }

    if (state.mapInfoList.data === false || isLoading === true) {
        return (
            <Container maxWidth="lg" style={{ padding: 0 }}>
                <Box p={4}>
                    <LoadingSpinner size={40} />
                </Box>
            </Container>
        )
    }

    if (state.mapInfoList.data === null && isLoading === false) {
        return (
            <Box p={4}>
                <Typography variant="h6" align="center" gutterBottom>
                    {t('str_noDataAvailable')}
                </Typography>
                {GENERAL_SETTINGS.ISCHAIN && (
                    <Typography variant="h6" align="center" gutterBottom>
                        {t('str_ifYouWishYouCanChangeTheHotelAndTryAgain')}<br/>
                        <Button startIcon={<BusinessIcon />} onClick={()=> setToState("guest", ["isHotelListOpen"], true)}>
                            {state.changeHotelRefno ? state.changeHotelName : t('str_chooseHotel')}
                        </Button>
                    </Typography>
                )}
            </Box>
        )
    }

    return (
        <Container fixed maxWidth="lg" style={{ padding: 0 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={3}>
                    <List className={classes.root} subheader={<li />}>
                        {state.mapInfoList.data && Object.keys(state.mapInfoList.data).map((sectionId) => (
                            <li key={`section-${sectionId}`} className={classes.listSection}>
                                <ul className={classes.ul}>
                                   <ListSubheader className={classes.subHeader}>{`${sectionId}`}</ListSubheader>
                                   {state.mapInfoList.data[sectionId] && state.mapInfoList.data[sectionId].map((item) => (
                                        <ListItem key={`item-${sectionId}-${item.title}`}
                                           className={clsx(classes.locItem, { [classes.locItemOnSelect]: hashSelect(locSelect, item.loclat, item.loclng)})}
                                           onClick={()=> {
                                               if(hashSelect(locSelect, item.loclat, item.loclng)){
                                                   setLocSelect(false)
                                                   setMyLocSelect(false)
                                               }else{
                                                   setLocSelect([item.loclat, item.loclng])
                                                   setMyLocSelect(false)
                                               }
                                           }}>
                                            <ListItemAvatar>
                                                <Icon className={classes.listLocIcon} fontSize='large' >location_on</Icon>
                                            </ListItemAvatar>
                                            <ListItemText primary={`${item.title}`} secondary={`${metricFormat(getDistanceFromLatLonInKm(myLocation.lat, myLocation.lng, geoFormat(item.loclat), geoFormat(item.loclng)))}`}/>
                                        </ListItem>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </List>
                </Grid>
                <Grid item xs={12} sm={8}>
                    <div style={{ position: 'relative', height: 'calc(100vh - 250px)'}}>
                        <GoogleMapReact
                            bootstrapURLKeys={{
                                key: process.env.GOOGLE_MAP_API_KEY,
                                libraries: ['places', 'geometry']
                            }}
                            options={{
                                scrollwheel: false,
                                gestureHandling: "none",
                                fullscreenControl:false,
                                zoomControl: false,
                                draggingCursor: "default",
                                draggableCursor: "default"
                            }}
                            center={locSelect && locSelect[0] && locSelect[1] && { lat: geoFormat(locSelect[0]), lng: geoFormat(locSelect[1]) } || mapCenter}
                            zoom={mapZoom}
                        >
                            <Marker
                                isSelect={myLocSelect}
                                lat={myLocation.lat}
                                lng={myLocation.lng}
                                isMyLoc={true}
                                name={t('str_myLocation')}
                            />
                            {state.mapInfoList.data && Object.keys(state.mapInfoList.data).map((sectionId) =>
                                state.mapInfoList.data[sectionId] && state.mapInfoList.data[sectionId].map((item, i) => (
                                    <Marker
                                        key={i}
                                        lat={geoFormat(item.loclat)}
                                        lng={geoFormat(item.loclng)}
                                        name={item.title}
                                        isSelect={hashSelect(locSelect, item.loclat, item.loclng)}
                                    />
                                ))
                            )}
                        </GoogleMapReact>
                        <Button
                            onClick={()=> handleMyLocation()}
                            variant="outlined"
                            color="primary"
                            className={classes.myLocButton}
                            startIcon={<Icon>my_location</Icon>}
                        >
                            {t('str_myLocation')}
                        </Button>
                    </div>
                </Grid>
            </Grid>
        </Container>
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

export default connect(mapStateToProps, mapDispatchToProps)(Map)
