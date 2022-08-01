import axios from 'axios'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Grid, IconButton } from '@material-ui/core'
import Collapse from '@material-ui/core/Collapse'
import Alert from '@material-ui/lab/Alert'
import GoogleMap from 'google-map-react'

import Geocode from 'react-geocode'
import SearchIcon from '@material-ui/icons/Search'
import CloseIcon from '@material-ui/icons/Close';
import MyLocationIcon from '@material-ui/icons/MyLocation'

import { TcAutocomplete, TcTextField } from './components/fields'
import useTranslation from 'lib/translations/hooks/useTranslation'

Geocode.setApiKey(process.env.GOOGLE_MAP_API_KEY)

const eventNames = ['click', 'dblclick', 'dragend', 'mousedown', 'mouseout', 'mouseover', 'mouseup', 'recenter']
const AddressMap = ({ setMapApiLoaded, setMapApi, setMapInstance, setMarker, setInfoWindow, zoom, center, setCenter, location, setLocation, setMapApiAddress }) => {
    const createMapOptions = (maps) => {
        return {
            panControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            styles: [
                {
                    stylers: [{ saturation: -100 }, { gamma: 0.8 }, { lightness: 4 }, { visibility: 'on' }],
                },
            ],
        }
    }

    const handleEvent = (evt, map, marker, infoWindow) => {
        return (e) => {
            if (e.latLng) {
                const lat = e.latLng.lat()
                const lng = e.latLng.lng()
                if (evt === 'dragend') {
                    map.setCenter({ lat, lng })
                    setLocation({lat: lat , lng: lng})
                    Geocode.fromLatLng(lat, lng).then(
                        (response) => {
                            infoWindow.setContent(response.results[0].formatted_address)
                            infoWindow.open(map, marker)
                            setMapApiAddress(response.results[0])
                        },
                        (error) => {
                            console.error(error)
                        }
                    )
                } else if (evt === 'click') {
                    Geocode.fromLatLng(lat, lng).then(
                        (response) => {
                            infoWindow.setContent(response.results[0].formatted_address)
                            infoWindow.open(map, marker)
                            setMapApiAddress(response.results[0])
                        },
                        (error) => {
                            console.error(error)
                        }
                    )
                } else if (evt === 'mousedown') {
                    infoWindow.close()
                }
            }
        }
    }

    const apiHasLoaded = (map, maps) => {
        setMapApiLoaded(true)
        setMapInstance(map)
        setMapApi(maps)

        const marker = new maps.Marker({
            map,
            position: center,
            draggable: true,
        })

        const infoWindow = new maps.InfoWindow({})
        eventNames.forEach((e) => {
            marker.addListener(e, handleEvent(e, map, marker, infoWindow))
        })

        setMarker(marker)
        setInfoWindow(infoWindow)
    }

    return (
        <div style={{ height: 240, borderRadius: 15, overflow: 'hidden' }}>
            <GoogleMap
                bootstrapURLKeys={{
                    key: process.env.GOOGLE_MAP_API_KEY,
                    libraries: ['places', 'geometry'],
                }}
                options={createMapOptions}
                center={location}
                zoom={zoom}
                shouldUnregisterMapOnUnmount={true}
                yesIWantToUseGoogleMapApiInternals={true}
                onGoogleApiLoaded={({ map, maps }) => apiHasLoaded(map, maps)}
            />
        </div>
    )
}

const savePropertyAddress = (gid, data) => {
    return axios({
        url: 'api/property/address/save',
        method: 'post',
        params: {
            gid: gid
        },
        data: data
    }).then((response)=> {
        return response.data
    })
}

const AddressMapSearch = ({ maps, onPlacesChanged, placeholder, closeAction }) => {
    const input = useRef(null)
    const searchBox = useRef(null)

    const handleOnPlacesChanged = useCallback(() => {
        if (onPlacesChanged) {
            let position = {
                coords: {
                    latitude: 0,
                    longitude: 0
                }
            }
            const getLocation = searchBox.current.getPlaces()[0] || false
            if (getLocation.geometry && getLocation.geometry.location) {
                position.coords.latitude = getLocation.geometry.location.lat()
                position.coords.longitude = getLocation.geometry.location.lng()
                onPlacesChanged(position)
            }
        }
    }, [onPlacesChanged, searchBox])

    useEffect(() => {
        if (!searchBox.current && maps) {
            searchBox.current = new maps.places.SearchBox(input.current)
            searchBox.current.addListener('places_changed', handleOnPlacesChanged)
        }

        return () => {
            if (maps) {
                searchBox.current = null
                maps.event.clearInstanceListeners(searchBox)
            }
        };
    }, [maps, handleOnPlacesChanged])

    return (
        <Grid container spacing={1} alignItems="flex-end" style={{ position: 'absolute', zIndex: 3, margin: 10 }}>
            <Grid item>
                <input ref={input} placeholder={placeholder} type="text" style={{ padding: 5, width: 225, opacity: '0.8', outline: 0, border: '1px solid #66bb69' }} />
            </Grid>
            <Grid item>
                <IconButton color="primary" component="span" style={{ background: '#ebe7e7ad', padding: 6 }} onClick={()=> closeAction()}>
                    <CloseIcon fontSize="small"/>
                </IconButton>
            </Grid>
        </Grid>
    )
}

const Address = ({ classes, fieldOptions, steps, nextStep, propertyInfo }) => {
    const { t } = useTranslation()
    const [useGeoMap, setUseGeoMap] = useState(false)
    const [mapApiLoaded, setMapApiLoaded] = useState(false)
    const [mapApi, setMapApi] = useState(null)
    const [mapApiAddress, setMapApiAddress] = useState(null)
    const [mapInstance, setMapInstance] = useState(null)
    const [marker, setMarker] = useState(null)
    const [infoWindow, setInfoWindow] = useState(null)
    const [isOpenInfoWindow, setIsOpenInfoWindow] = useState(false)
    const [zoom, setZoom] = useState(1)
    const [location, setLocation] = useState({ lat: 0, lng: 0, })
    const [center, setCenter] = useState({ lat: 47.8679381, lng: 21.1141038, })
    const [useMapSearch, setUseMapSearch] = useState(false)
    const [isLocationPermitRequired, setIsLocationPermitRequired] = useState(false)

    const [addressData, setAddressData] = useState(
        {
            country: {
                value: "",
                helperText: "",
                isRequired: true,
                noSelect: false
            },
            city: {
                value: "",
                helperText: "",
                isRequired: true,
                noSelect: false
            },
            town: {
                value: "",
                helperText: "",
                isRequired: false,
                noSelect: false
            },
            district: {
                value: "",
                helperText: "",
                isRequired: false
            },
            zip: {
                value: "",
                helperText: "",
                isRequired: false
            },
            address1: {
                value: "",
                helperText: "",
                isRequired: true
            },
            address2: {
                value: "",
                helperText: "",
                isRequired: false
            }
        }
    )

    const handleCountryChange = (value) =>{
        setAddressData({
            ...addressData,
            country: {
                ...addressData.country,
                value: value,
                helperText: "",
                noSelect: false
            },
            city: {
                ...addressData.city,
                value: "",
                helperText: "",
                noSelect: false
            },
            town: {
                ...addressData.town,
                value: "",
                helperText: "",
                noSelect: false
            }
        })
    }

    const handleCityChange = (value) =>{
        setAddressData({
            ...addressData,
            city: {
                ...addressData.city,
                value: value,
                helperText: ""
            },
            town: {
                ...addressData.town,
                value: "",
                helperText: ""
            }
        })
    }

    const handleTownChange = (value) =>{
        setAddressData({
            ...addressData,
            town: {
                ...addressData.town,
                value: value,
                helperText: ""
            }
        })
    }

    const handleDistrictChange = (e) =>{
        setAddressData({
            ...addressData,
            district: {
                ...addressData.district,
                value: e.target.value,
                helperText: ""
            }
        })
    }

    const handleZipChange = (e) =>{
        setAddressData({
            ...addressData,
            zip: {
                ...addressData.zip,
                value: e.target.value,
                helperText: ""
            }
        })
    }

    const handleAddress1Change = (e) =>{
        setAddressData({
            ...addressData,
            address1: {
                ...addressData.address1,
                value: e.target.value,
                helperText: ""
            }
        })
    }

    const handleAddress2Change = (e) =>{
        setAddressData({
            ...addressData,
            address2: {
                ...addressData.address2,
                value: e.target.value,
                helperText: ""
            }
        })
    }

    const handleNextStep = async () => {
        let cloneAddressData = addressData, insertData = {}, isError = false
        const dataKeys = Object.keys(addressData)

        for (let dataKey of dataKeys) {
            if (cloneAddressData[dataKey].isRequired) {
                if (cloneAddressData[dataKey]?.value && (Object.keys(cloneAddressData[dataKey].value).length > 0 || cloneAddressData[dataKey].value == true)) {

                    if(dataKey === "country" && cloneAddressData[dataKey]?.value?.id){
                        insertData = { ...insertData, [dataKey]: cloneAddressData[dataKey].value.code }
                        insertData = { ...insertData, 'countryid': cloneAddressData[dataKey].value.id }
                    }else if(dataKey === "city" && cloneAddressData[dataKey]?.value?.id){
                        insertData = { ...insertData, [dataKey]: cloneAddressData[dataKey].value.description }
                        insertData = { ...insertData, 'cityid': cloneAddressData[dataKey].value.id }
                    }else if(dataKey === "town" && cloneAddressData[dataKey]?.value?.id){
                        insertData = { ...insertData, [dataKey]: cloneAddressData[dataKey].value.description }
                        insertData = { ...insertData, 'townid': cloneAddressData[dataKey].value.id }
                    }else{
                        insertData = { ...insertData, [dataKey]: cloneAddressData[dataKey].value }
                    }

                    isError = false
                    cloneAddressData[dataKey].helperText = ''
                } else {
                    isError = true
                    cloneAddressData[dataKey].helperText = t('str_requiredField')
                }
            } else {
                insertData = { ...insertData, [dataKey]: cloneAddressData[dataKey].value }
            }
        }

        setAddressData({ ...cloneAddressData })
        if (!isError) {
            insertData.masterid = propertyInfo.propertyMid
            insertData.location = location
            const getPropertyAddress = await savePropertyAddress(propertyInfo.propertyGid, insertData)
            if(getPropertyAddress.success){
                nextStep(steps.moduleSelection.index)
            }
        }
    }

    const getCurrentPosition = () => {
        navigator.geolocation.getCurrentPosition((e) => {
            setUseGeoMap(true)
            displayLocationInfo(e)
        }, () => {
            handleLocationPermission()
        })
    }

    const handleLocationPermission = () => {
        navigator.permissions.query({name:'geolocation'}).then(function(result) {
            if (result.state === 'granted') {
                setIsLocationPermitRequired(false)
                getCurrentPosition()
            } else if (result.state === 'prompt') {
                setIsLocationPermitRequired(false)
                getCurrentPosition()
            } else if (result.state === 'denied') {
                setIsLocationPermitRequired(true)
            }
            result.onchange = function() {
                handleLocationPermission()
            }
        })
    }

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((e) => {
                setUseGeoMap(true)
                displayLocationInfo(e)
            }, () => {
                setUseMapSearch(false)
                setUseGeoMap(false)
                handleLocationPermission()
            })
        }
    }

    const displayLocationInfo = (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        if (mapApiLoaded) {
            setLocation({ lat: lat, lng: lng })
            mapInstance.setCenter({ lat, lng })
            mapInstance.setZoom(17)
            marker.setPosition({ lat, lng })

            Geocode.fromLatLng(lat, lng).then((response) => {
                infoWindow.setContent(response.results[0].formatted_address)
                infoWindow.open(mapInstance, marker)
                setMapApiAddress(response.results[0])
            })
        }
    }

    const getCountryCode = (addressArray) => {
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
        if (mapApiAddress) {
            let cloneAddressData = addressData,
                formattedAddress = mapApiAddress.formatted_address.split(','),
                address1 = '',
                address2 = ''

            if (formattedAddress.length < 4) {
                address1 = formattedAddress[0]
                address2 = formattedAddress.slice(1, formattedAddress.length).join(', ').trim()
            } else {
                address1 = formattedAddress[0] + ', ' + formattedAddress[1]
                address2 = formattedAddress.slice(2, formattedAddress.length).join(', ').trim()
            }

            cloneAddressData.country.value = getCountryCode(mapApiAddress.address_components) || ''
            cloneAddressData.country.noSelect = true
            cloneAddressData.city.value = getCity(mapApiAddress.address_components) || ''
            cloneAddressData.city.noSelect = true
            cloneAddressData.town.value = getTown(mapApiAddress.address_components) || ''
            cloneAddressData.town.noSelect = true
            cloneAddressData.district.value = getDistrict(mapApiAddress.address_components) || ''
            cloneAddressData.zip.value = getZip(mapApiAddress.address_components) || ''
            cloneAddressData.address1.value = address1 || ''
            cloneAddressData.address2.value = address2 || ''

            setAddressData({ ...cloneAddressData })
            setUseMapSearch(false)
            setUseGeoMap(false)
        }
    }

    return (
        <React.Fragment>
            <Collapse in={useGeoMap}>
                <Grid container spacing={2} justify='space-between'>
                    <Grid item xs={12}>
                        <Alert severity="info">
                            {t('str_dragTheMarkerToYourCurrentLocation')}
                        </Alert>
                    </Grid>
                    <Grid item xs={12}>
                        {useGeoMap ? (
                            <React.Fragment>
                                {useMapSearch ?
                                    (<AddressMapSearch maps={mapApi} onPlacesChanged={displayLocationInfo} closeAction={()=> setUseMapSearch(false)}/>):
                                    (<IconButton color="primary" component="span" onClick={()=> setUseMapSearch(true)} style={{ position: "absolute", margin: 10, zIndex: 3, padding: 6, background: "#ebe7e7ad"}}><SearchIcon fontSize="small"/></IconButton>)
                                }
                            </React.Fragment>
                        ): null}
                        <AddressMap
                            location={location}
                            setLocation={setLocation}
                            setMapApiAddress={setMapApiAddress}
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
                    <Grid item xs={6} sm={8} style={{ textAlign: 'left' }}>
                        <Button variant='outlined' size='large' color='primary' disableElevation onClick={() => {
                            setUseMapSearch(false)
                            setUseGeoMap(false)
                        }}>
                            {t('str_back')}
                        </Button>
                    </Grid>
                    <Grid item style={{ textAlign: 'right' }}>
                        <Button variant='contained' size='large' color='primary' disableElevation onClick={() => handleMapToAddress()}>
                            {t('str_getAddress')}
                        </Button>
                    </Grid>
                </Grid>
            </Collapse>
            <Collapse in={!useGeoMap}>
                <Grid container spacing={2} justify='space-between'>
                    {isLocationPermitRequired ? (
                        <Grid item xs={12}>
                            <Alert severity='info'>
                                {t('str_pleaseGiveLocationPermissionToAccessLocationInformation')}
                            </Alert>
                        </Grid>
                    ) : null}
                    <Grid item xs={12} sm={6}>
                        <TcAutocomplete
                            noSelect={addressData.country.noSelect}
                            optionKey="id"
                            optionLabel="description"
                            optionApi="api/hotel/content/info/country"
                            onChange={handleCountryChange}
                            value={addressData.country.value}
                            defValueKey="code"
                            defValue={propertyInfo?.propertyCountryCode || false}
                            TextFieldProps={{
                                value: addressData.country.value,
                                label: t('str_country'),
                                required: addressData.country.isRequired,
                                variant: fieldOptions.variant,
                                fullWidth: fieldOptions.fullWidth,
                                size: fieldOptions.size,
                                error: addressData.country.helperText.length > 0,
                                helperText: addressData.country.helperText,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TcAutocomplete
                            noSelect={addressData.city.noSelect}
                            optionKey="id"
                            optionLabel="description"
                            optionApi="api/hotel/content/info/city"
                            onChange={handleCityChange}
                            value={addressData.city.value}
                            queryKey="country"
                            queryValue={addressData?.country?.value?.description || false}
                            TextFieldProps={{
                                value: addressData.city.value,
                                label: t('str_city'),
                                required: addressData.city.isRequired,
                                variant: fieldOptions.variant,
                                fullWidth: fieldOptions.fullWidth,
                                size: fieldOptions.size,
                                error: addressData.city.helperText.length > 0,
                                helperText: addressData.city.helperText,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TcAutocomplete
                            noSelect={addressData.town.noSelect}
                            optionKey="id"
                            optionLabel="description"
                            optionApi="api/hotel/content/info/town"
                            onChange={handleTownChange}
                            value={addressData.town.value}
                            queryKey="city"
                            queryValue={addressData?.city?.value?.description || false}
                            TextFieldProps={{
                                value: addressData.town.value,
                                label: t('str_town'),
                                required: addressData.town.isRequired,
                                variant: fieldOptions.variant,
                                fullWidth: fieldOptions.fullWidth,
                                size: fieldOptions.size,
                                error: addressData.town.helperText.length > 0,
                                helperText: addressData.town.helperText,
                            }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TcTextField
                            required={addressData.district.isRequired}
                            label={t('str_district')}
                            variant={fieldOptions.variant}
                            fullWidth={fieldOptions.fullWidth}
                            size={fieldOptions.size}
                            value={addressData.district.value}
                            onChange={handleDistrictChange}
                            error={addressData.district.helperText.length > 0}
                            helperText={addressData.district.helperText}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TcTextField
                            required={addressData.zip.isRequired}
                            label={t('str_zip')}
                            variant={fieldOptions.variant}
                            fullWidth={fieldOptions.fullWidth}
                            size={fieldOptions.size}
                            value={addressData.zip.value}
                            onChange={handleZipChange}
                            error={addressData.zip.helperText.length > 0}
                            helperText={addressData.zip.helperText}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TcTextField
                            required={addressData.address1.isRequired}
                            label={t('str_address1')}
                            variant={fieldOptions.variant}
                            fullWidth={fieldOptions.fullWidth}
                            size={fieldOptions.size}
                            value={addressData.address1.value}
                            onChange={handleAddress1Change}
                            error={addressData.address1.helperText.length > 0}
                            helperText={addressData.address1.helperText}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TcTextField
                            required={addressData.address2.isRequired}
                            label={t('str_address2')}
                            variant={fieldOptions.variant}
                            fullWidth={fieldOptions.fullWidth}
                            size={fieldOptions.size}
                            value={addressData.address2.value}
                            onChange={handleAddress2Change}
                            error={addressData.address2.helperText.length > 0}
                            helperText={addressData.address2.helperText}
                        />
                    </Grid>
                    <Grid item xs={8} sm={6} style={{ textAlign: 'left' }}>
                        <Button style={{ textTransform: 'capitalize' }} startIcon={<MyLocationIcon />} variant='outlined' size='large' color='primary' disableElevation onClick={() => handleCurrentLocation()}>
                            {t('str_myLocation')}
                        </Button>
                    </Grid>
                    <Grid item xs={4} sm={6} style={{ textAlign: 'right' }}>
                        <Button variant='contained' size='large' color='primary' disableElevation onClick={() => handleNextStep()}>
                            {t('str_next')}
                        </Button>
                    </Grid>
                </Grid>
            </Collapse>
        </React.Fragment>
    )
}

export default Address