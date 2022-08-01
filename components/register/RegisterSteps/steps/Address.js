import React, { useContext, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import { setToState, updateState } from '../../../../state/actions'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import {isObjectEmpty, OREST_ENDPOINT, REQUEST_METHOD_CONST} from '../../../../model/orest/constants'
import { useRouter } from 'next/router'
import useNotifications from '../../../../model/notification/useNotifications'
import LoadingSpinner from '../../../LoadingSpinner'
import CountrySelect from './components/CountrySelect'
import CitySelect from './components/CitySelect'
import TownSelect from './components/TownSelect'
import AddressMap from './components/map/AddressMap'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import MyLocationIcon from '@material-ui/icons/MyLocation'
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow'
import SearchIcon from '@material-ui/icons/Search'
import SearchPlaceNative from './components/map/SearchPlaceNative'
import Geocode from 'react-geocode'
import WebCmsGlobal from 'components/webcms-global'
import useTranslation from 'lib/translations/hooks/useTranslation'

Geocode.setApiKey(process.env.GOOGLE_MAP_API_KEY)
//Geocode.enableDebug();

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        '& > *': {
            margin: theme.spacing(1),
            width: theme.spacing(16),
            height: theme.spacing(16),
        },
    },
    welcomeWrapper: {
        maxWidth: 1259,
        width: '100%',
        height: 685,
        padding: 20,
    },
    welcomeToH3: {
        color: '#0F4571',
        fontSize: '6.5rem',
        fontWeight: 600,
        textAlign: 'right',
    },
    vimaH3: {
        color: '#269DD4',
        fontSize: '10.5rem',
        fontWeight: 600,
    },
    fieldset: {
        width: '100%',
        marginTop: theme.spacing(2),
    },
    legends: {
        paddingTop: theme.spacing(2),
        fontSize: '1.1rem',
    },
    txtfiled: {
        marginTop: theme.spacing(1.5),
        maxWidth: 350,
        width: '100%',
    },
    option: {
        fontSize: 15,
        '& > span': {
            marginRight: 10,
            fontSize: 18,
        },
    },
    midButtonBox1: {
        display: 'grid',
        borderStyle: 'solid',
        borderColor: 'rgba(0, 0, 0, 0.54)',
        borderWidth: '2px 2px',
        borderRadius: 50,
        padding: '5px!important',
        margin: '85px 5px 15px 10px',
    },
    midButtonBox2: {
        display: 'grid',
        borderStyle: 'dashed',
        borderColor: 'rgba(0, 0, 0, 0.54)',
        borderWidth: '0 2px',
        borderRadius: 0,
        padding: '5px!important',
        margin: '35px auto 0 auto',
    },
}))

const Address = (props) => {
    const { state, setToState, updateState, isAdvanced } = props
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const masterId = router.query.masterid
    const { showSuccess, showError } = useNotifications()
    const { t } = useTranslation()
    const [showSearchPlace, setShowSearchPlace] = useState(false)
    //map states
    const [mapApiLoaded, setMapApiLoaded] = useState(false)
    const [mapApi, setMapApi] = useState(null)
    const [mapInstance, setMapInstance] = useState(null)
    const [marker, setMarker] = useState(null)
    const [infoWindow, setInfoWindow] = useState(null)
    const [isOpenInfoWindow, setIsOpenInfoWindow] = useState(false)
    const [zoom, setZoom] = useState(1)
    const [center, setCenter] = useState({
        lat: 47.8679381,
        lng: 21.1141038,
    })
    const [showWebSiteTextField, setShowWebSiteTextField] = useState(false);
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    useEffect(() => {
        let active = true
        if (active) {
            if(isAdvanced) {
                axios({
                    url: GENERAL_SETTINGS.OREST_URL +  '/hotel/lic/contact',
                    method: REQUEST_METHOD_CONST.GET,
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        hotelrefno: companyId,
                    },
                }).then((res) => {
                    if (active) {
                        if(res.status === 200) {
                            if(res.data.data.contactweb && res.data.data.contactweb !== "") {
                                setShowWebSiteTextField(true)
                            }
                            setToState('registerStepper', ['address', 'agency'], res.data.data)
                            //setToState('registerStepper', ['address', 'agency', 'mid'], masterId)
                            setToState('registerStepper', ['address', 'agencyBase'], res.data.data)
                        }

                    }
                })
            } else {
                if (isObjectEmpty(state.address)) {
                    axios({
                        url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/self-register/view',
                        method: 'post',
                        params: {
                            token: state.cacheToken,
                        },
                        data: {
                            id: state.cacheHotelID,
                        },
                    }).then((hotelResponse) => {
                        if (active) {
                            const hotelData = hotelResponse.data
                            if (hotelData.success) {
                                setToState('registerStepper', ['address', 'agency'], hotelData.data)
                                setToState('registerStepper', ['address', 'agencyBase'], hotelData.data)
                            }
                        }
                    })
                }
            }

        }
        return () => {
            active = false
        }
    }, [])

    useEffect(() => {
        if (mapApiLoaded) {
            if (state.address.agency && state.address.agencyBase) {
                if (
                    state.address.agency.lat === state.address.agencyBase.lat &&
                    state.address.agency.lng === state.address.agencyBase.lng
                ) {
                    infoWindow.close()
                    if (state.address.agency.lat === null && state.address.agency.lng === null) {
                        mapInstance.setZoom(1)
                        mapInstance.setCenter({
                            lat: 47.8679381,
                            lng: 21.1141038,
                        })
                        marker.setPosition({
                            lat: 47.8679381,
                            lng: 21.1141038,
                        })
                    } else {
                        mapInstance.setZoom(17)
                        mapInstance.setCenter({
                            lat: Number(state.address.agency.lat),
                            lng: Number(state.address.agency.lng),
                        })
                        marker.setPosition({
                            lat: Number(state.address.agency.lat),
                            lng: Number(state.address.agency.lng),
                        })
                    }
                }
            }
        }
    }, [state.address.agency && state.address.agencyBase && state.address.agency.lng])

    useEffect(() => {
        if (state.address.agency && state.address.agency.countryCode) {
            let country =
                state.countryList[state.countryList.findIndex((data) => data.iso2 === state.address.agency.countryCode)]

            setToState('registerStepper', ['address', 'agency', 'country'], country.description)
        }
    }, [state.address.agency && state.address.agency.countryCode])

    const cls = useStyles()

    const InputChange = (e) => {
        updateState('data', e.target.id, e.target.value)
    }

    const displayLocationInfo = (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setToState('registerStepper', ['address', 'agency', 'lat'], lat)
        setToState('registerStepper', ['address', 'agency', 'lng'], lng)

        if (mapApiLoaded) {
            mapInstance.setCenter({
                lat,
                lng,
            })
            mapInstance.setZoom(17)
            marker.setPosition({
                lat,
                lng,
            })

            Geocode.fromLatLng(lat, lng).then(
                (response) => {
                    infoWindow.setContent(response.results[0].formatted_address)
                    infoWindow.open(mapInstance, marker)
                    setToState('registerStepper', ['mapAddress'], response.results[0])
                },
                (error) => {
                    console.error(error)
                }
            )
        }
    }

    const handleClickCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(displayLocationInfo, () => {
                showError('Location permit required!')
            })
        }
    }

    const countryToFlag = (isoCode) => {
        return typeof String.fromCodePoint !== 'undefined'
            ? isoCode.toUpperCase().replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
            : isoCode
    }

    const handleTextFieldChange = (event) => {
        setToState('registerStepper', ['address', 'agency', String(event.target.name)], event.target.value)
    }

    if (!state.address.agency) {
        return <LoadingSpinner />
    }

    const handleClickSearchPlace = () => {
        if (!showSearchPlace) {
            setShowSearchPlace(true)
        } else {
            setShowSearchPlace(false)
        }
    }

    const handleAddressToMap = () => {
        if (mapApiLoaded) {
            const searchText =
                state.address.agency.address1 +
                ' ' +
                state.address.agency.address2 +
                ' ' +
                state.address.agency.town +
                ' ' +
                state.address.agency.town +
                ' ' +
                state.address.agency.city +
                ' ' +
                state.address.agency.country
            Geocode.fromAddress(searchText).then(
                (response) => {
                    const { lat, lng } = response.results[0].geometry.location
                    setToState('registerStepper', ['address', 'agency', 'lat'], lat)
                    setToState('registerStepper', ['address', 'agency', 'lng'], lng)
                    infoWindow.close()
                    mapInstance.setCenter({
                        lat,
                        lng,
                    })
                    mapInstance.setZoom(17)
                    marker.setPosition({
                        lat,
                        lng,
                    })
                },
                (error) => {
                    console.error(error)
                }
            )
        }
    }

    const getCountry = (addressArray) => {
        let data = ''
        for (let i = 0; i < addressArray.length; i++) {
            for (let i = 0; i < addressArray.length; i++) {
                if (addressArray[i].types[0] && 'country' === addressArray[i].types[0]) {
                    data = addressArray[i].long_name
                    if (data) {
                        data = data.toLowerCase()
                        data = data.toUpperCase()
                    }
                    return data
                }
            }
        }
    }

    const getCountryCode = (addressArray) => {
        let data = ''
        for (let i = 0; i < addressArray.length; i++) {
            for (let i = 0; i < addressArray.length; i++) {
                if (addressArray[i].types[0] && 'country' === addressArray[i].types[0]) {
                    data = addressArray[i].short_name
                    if (data) {
                        data = data.toLowerCase()
                        data = data.toUpperCase()
                    }
                    return data
                }
            }
        }
    }

    const getCity = (addressArray) => {
        let data = ''
        for (let i = 0; i < addressArray.length; i++) {
            for (let i = 0; i < addressArray.length; i++) {
                if (addressArray[i].types[0] && 'administrative_area_level_1' === addressArray[i].types[0]) {
                    data = addressArray[i].long_name
                    if (data) {
                        data = data.toLowerCase()
                        data = data.toUpperCase()
                    }
                    return data
                }
            }
        }
    }

    const getTown = (addressArray) => {
        let data = ''
        for (let i = 0; i < addressArray.length; i++) {
            if (addressArray[i].types[0] && 'administrative_area_level_2' === addressArray[i].types[0]) {
                data = addressArray[i].long_name
                if (data) {
                    data = data.toLowerCase()
                    data = data.toUpperCase()
                }
                return data
            }
        }
        if (data === '') {
            for (let i = 0; i < addressArray.length; i++) {
                if (addressArray[i].types[0] && 'administrative_area_level_3' === addressArray[i].types[0]) {
                    data = addressArray[i].long_name
                    if (data) {
                        data = data.toLowerCase()
                        data = data.toUpperCase()
                    }
                    return data
                }
            }
        }
    }

    const getDistrict = (addressArray) => {
        let data = ''
        for (let i = 0; i < addressArray.length; i++) {
            if (addressArray[i].types[0] && 'administrative_area_level_4' === addressArray[i].types[0]) {
                data = addressArray[i].long_name
                return data
            }
        }
    }

    const getZip = (addressArray) => {
        let data = ''
        for (let i = 0; i < addressArray.length; i++) {
            if (addressArray[i].types[0] && 'postal_code' === addressArray[i].types[0]) {
                data = addressArray[i].long_name
                return data
            }
        }
    }

    const handleMapToAddress = () => {
        if (state.mapAddress) {
            setToState(
                'registerStepper',
                ['address', 'agency', 'countryCode'],
                getCountryCode(state.mapAddress.address_components)
            )
            setToState('registerStepper', ['address', 'agency', 'city'], getCity(state.mapAddress.address_components))
            setToState('registerStepper', ['address', 'agency', 'town'], getTown(state.mapAddress.address_components))
            setToState(
                'registerStepper',
                ['address', 'agency', 'district'],
                getDistrict(state.mapAddress.address_components)
            )
            setToState('registerStepper', ['address', 'agency', 'zip'], getZip(state.mapAddress.address_components))

            let formattedAddress = state.mapAddress.formatted_address.split(',')
            let address1 = ''
            let address2 = ''
            if (formattedAddress.length < 4) {
                address1 = formattedAddress[0]
                address2 = formattedAddress.slice(1, formattedAddress.length).join(', ').trim()
            } else {
                address1 = formattedAddress[0] + ', ' + formattedAddress[1]
                address2 = formattedAddress.slice(2, formattedAddress.length).join(', ').trim()
            }

            setToState('registerStepper', ['address', 'agency', 'address1'], address1)
            setToState('registerStepper', ['address', 'agency', 'address2'], address2)
        }
    }

    return (
        <React.Fragment>
            <Grid container style={{ marginTop: 40, padding: 20 }}>
                <Grid item xs={10} md={6}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} style={{ paddingBottom: 0 }}>
                            <Typography
                                style={{ fontSize: '1.4rem', color: 'rgba(0, 0, 0, 0.54)', textAlign: 'center' }}
                            >
                                {t('str_propertyLocation')}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <CountrySelect>
                                <TextField
                                    required
                                    variant="outlined"
                                    id="country"
                                    name="country"
                                    label="Country"
                                    fullWidth
                                    autoComplete="District"
                                    value={state.address.agency ? state.address.agency.country || '' : ''}
                                    onChange={handleTextFieldChange}
                                />
                            </CountrySelect>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <CitySelect>
                                <TextField
                                    required
                                    variant="outlined"
                                    disabled={state.address.agency && !state.address.agency.country}
                                    id="city"
                                    name="city"
                                    label="City"
                                    fullWidth
                                    autoComplete="District"
                                    value={state.address.agency ? state.address.agency.city || '' : ''}
                                    onChange={handleTextFieldChange}
                                />
                            </CitySelect>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TownSelect>
                                <TextField
                                    required
                                    variant="outlined"
                                    disabled={
                                        (state.address.agency && !state.address.agency.country) ||
                                        !state.address.agency.city
                                    }
                                    id="town"
                                    name="town"
                                    label="Town"
                                    fullWidth
                                    autoComplete="District"
                                    value={state.address.agency ? state.address.agency.town || '' : ''}
                                    onChange={handleTextFieldChange}
                                />
                            </TownSelect>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <TextField
                                        variant="outlined"
                                        id="district"
                                        name="district"
                                        label="District"
                                        fullWidth
                                        autoComplete="District"
                                        value={state.address.agency ? state.address.agency.district || '' : ''}
                                        onChange={handleTextFieldChange}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        variant="outlined"
                                        id="zip"
                                        name="zip"
                                        label="Zip/P. Code"
                                        fullWidth
                                        autoComplete="billing postal-code"
                                        value={state.address.agency ? state.address.agency.zip || '' : ''}
                                        onChange={handleTextFieldChange}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                id="address1"
                                name="address1"
                                label="Address line 1"
                                fullWidth
                                autoComplete="billing address-line1"
                                value={state.address.agency ? state.address.agency.address1 || '' : ''}
                                onChange={handleTextFieldChange}
                            />
                            <TextField
                                variant="outlined"
                                style={{ marginTop: 20 }}
                                id="address2"
                                name="address2"
                                label="Address line 2"
                                fullWidth
                                autoComplete="billing address-line2"
                                value={state.address.agency ? state.address.agency.address2 || '' : ''}
                                onChange={handleTextFieldChange}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item className={cls.midButtonBox2}>
                    <Grid container direction="column" alignItems="center" justify="center" spacing={3}>
                        <Grid item>
                            <Tooltip title="Use my location">
                                <IconButton size={'small'} onClick={handleClickCurrentLocation}>
                                    <MyLocationIcon fontSize={'small'} />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                        <Grid item>
                            <Tooltip title="Set address to map">
                                <IconButton size={'small'} onClick={handleAddressToMap}>
                                    <DoubleArrowIcon fontSize={'small'} />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                        <Grid item>
                            <Tooltip title="Set map to address">
                                <IconButton size={'small'} onClick={handleMapToAddress}>
                                    <DoubleArrowIcon fontSize={'small'} style={{ transform: 'rotate(180deg)' }} />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                        <Grid item>
                            <Tooltip title="Search Place">
                                <IconButton size={'small'} onClick={handleClickSearchPlace}>
                                    <SearchIcon fontSize={'small'} />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} md={5}>
                    <Typography
                        style={{
                            fontSize: '1.1rem',
                            color: 'rgba(0, 0, 0, 0.54)',
                            padding: 12,
                            paddingTop: 0,
                            paddingBottom: 6,
                            textAlign: 'center',
                        }}
                    >
                        {t('str_markPropertyMsg')}
                    </Typography>
                    <AddressMap
                        mapApiLoaded={mapApiLoaded}
                        setMapApiLoaded={setMapApiLoaded}
                        mapApi={mapApi}
                        setMapApi={setMapApi}
                        mapInstance={mapInstance}
                        setMapInstance={setMapInstance}
                        marker={marker}
                        setMarker={setMarker}
                        zoom={zoom}
                        setZoom={setZoom}
                        center={center}
                        setCenter={setCenter}
                        infoWindow={infoWindow}
                        setInfoWindow={setInfoWindow}
                        isOpenInfoWindow={isOpenInfoWindow}
                        setIsOpenInfoWindow={setIsOpenInfoWindow}
                    />
                </Grid>
                {showSearchPlace && mapApiLoaded && mapApi && (
                    <Grid item xs={12} md={5} style={{ marginLeft: 'auto' }}>
                        <SearchPlaceNative map={mapInstance} mapApi={mapApi} marker={marker} infoWindow={infoWindow} />
                    </Grid>
                )}
                {
                    isAdvanced && (
                        <Grid item xs={12}>
                            <div style={{paddingTop: "48px"}}/>
                            <Grid container spacing={1}>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                value={showWebSiteTextField}
                                                checked={showWebSiteTextField}
                                                onChange={() => setShowWebSiteTextField(!showWebSiteTextField)}
                                                color="primary"
                                            />
                                        }
                                        label={ <Typography>Do you want to add website address ?</Typography>}
                                    />
                                </Grid>
                                {
                                    showWebSiteTextField && (
                                        <Grid item xs={3}>
                                            <TextField
                                                fullWidth
                                                id={"contactweb"}
                                                name={"contactweb"}
                                                variant={"outlined"}
                                                value={state.address.agency ? state.address.agency.contactweb || '' : ''}
                                                onChange={handleTextFieldChange}
                                            />
                                        </Grid>
                                    )
                                }
                            </Grid>
                        </Grid>
                    )
                }

            </Grid>
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.registerStepper,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Address)
