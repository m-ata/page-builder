import React, { useEffect } from 'react'
import GoogleMap from 'google-map-react'
import { setToState } from '../../../../../../state/actions'
import { connect } from 'react-redux'
import Geocode from 'react-geocode'

let evtNames = ['click', 'dblclick', 'dragend', 'mousedown', 'mouseout', 'mouseover', 'mouseup', 'recenter']

const AddressMap = (props) => {
    const {
        state,
        setToState,
        mapApiLoaded,
        setMapApiLoaded,
        mapApi,
        setMapApi,
        mapInstance,
        setMapInstance,
        marker,
        setMarker,
        infoWindow,
        setInfoWindow,
        isOpenInfoWindow,
        setIsOpenInfoWindow,
        zoom,
        setZoom,
        center,
        setCenter,
    } = props

    useEffect(() => {
        if (state.address.agency.lat && state.address.agency.lng) {
            setZoom(17)
            setCenter({
                lat: Number(state.address.agency.lat),
                lng: Number(state.address.agency.lng),
            })
        }
    }, [])

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
                    setToState('registerStepper', ['address', 'agency', 'lat'], lat)
                    setToState('registerStepper', ['address', 'agency', 'lng'], lng)
                    Geocode.fromLatLng(lat, lng).then(
                        (response) => {
                            infoWindow.setContent(response.results[0].formatted_address)
                            infoWindow.open(map, marker)
                            setToState('registerStepper', ['mapAddress'], response.results[0])
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
                            setToState('registerStepper', ['mapAddress'], response.results[0])
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

        evtNames.forEach((e) => {
            marker.addListener(e, handleEvent(e, map, marker, infoWindow))
        })

        setMarker(marker)
        setInfoWindow(infoWindow)
    }

    return (
        <>
            <div style={{ height: 280, borderRadius: 15, overflow: 'hidden' }}>
                <GoogleMap
                    bootstrapURLKeys={{
                        key: process.env.GOOGLE_MAP_API_KEY,
                        libraries: ['places', 'geometry'],
                    }}
                    options={createMapOptions}
                    center={center}
                    zoom={zoom}
                    shouldUnregisterMapOnUnmount={true}
                    yesIWantToUseGoogleMapApiInternals={true}
                    onGoogleApiLoaded={({ map, maps }) => apiHasLoaded(map, maps)}
                />
            </div>
        </>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.registerStepper,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(AddressMap)
