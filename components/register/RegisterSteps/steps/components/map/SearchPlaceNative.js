import React, { Component } from 'react'
import styled from 'styled-components'
import { setToState } from '../../../../../../state/actions'
import { connect } from 'react-redux'

const Wrapper = styled.div`
    position: relative;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding-top: 5px;
`

class SearchPlace extends Component {
    constructor(props) {
        super(props)
        this.clearSearchBox = this.clearSearchBox.bind(this)
    }

    componentDidMount({ map, mapApi } = this.props) {
        const options = {
            // restrict your search to a specific type of result
            // types: ['geocode', 'address', 'establishment', '(regions)', '(cities)'],
            // restrict your search to a specific country, or an array of countries
            // componentRestrictions: { country: ['gb', 'us'] },
        }
        this.autoComplete = new mapApi.places.Autocomplete(this.searchInput, options)
        this.autoComplete.addListener('place_changed', this.onPlaceChanged)
        this.autoComplete.bindTo('bounds', map)
    }

    componentWillUnmount({ mapApi } = this.props) {
        mapApi.event.clearInstanceListeners(this.searchInput)
    }

    onPlaceChanged = ({ map, marker, infoWindow } = this.props) => {
        const place = this.autoComplete.getPlace()
        if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat()
            const lng = place.geometry.location.lng()
            this.props.setToState('registerStepper', ['address', 'agency', 'lat'], lat)
            this.props.setToState('registerStepper', ['address', 'agency', 'lng'], lng)
        }
        this.props.setToState('registerStepper', ['mapAddress'], {
            address_components: place.address_components,
            formatted_address: place.formatted_address,
        })
        if (!place.geometry) return
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport)
            marker.setPosition(place.geometry.location)
            infoWindow.setContent(place.adr_address)
            infoWindow.open(map, marker)
        } else {
            map.setCenter(place.geometry.location)
            marker.setPosition(place.geometry.location)
            map.setZoom(17)
            infoWindow.setContent(place.adr_address)
            infoWindow.open(map, marker)
        }

        this.clearSearchBox()

        this.searchInput.blur()
    }

    clearSearchBox() {
        if (this.searchInput) {
            this.searchInput.value = ''
        }
    }

    render() {
        return (
            <Wrapper>
                <input
                    ref={(ref) => {
                        this.searchInput = ref
                    }}
                    onFocus={this.clearSearchBox}
                    type="text"
                    autoFocus
                    placeholder="‍Search Place"
                    style={{
                        background: 'none',
                        color: '#000000de',
                        fontSize: '1rem',
                        padding: '10px 10px 5px 1px',
                        display: 'block',
                        width: '100%',
                        border: 'none',
                        borderRadius: '0',
                        borderStyle: 'solid',
                        borderColor: '#0000006b',
                        borderWidth: '0 0 1px 0',
                        outline: 'none',
                    }}
                />
            </Wrapper>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.registerStepper,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(SearchPlace)
