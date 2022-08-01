import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import CircularProgress from '@material-ui/core/CircularProgress'
import { useRouter } from 'next/router'
import { setToState, updateState } from 'state/actions'
import { connect } from 'react-redux'
import useNotifications from 'model/notification/useNotifications'
import WebCmsGlobal from 'components/webcms-global'

const CitySelect = (props) => {
    const { state, setToState, children } = props
    const [open, setOpen] = useState(false)
    const loading = open && state.cityList.length === 0
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const { showError } = useNotifications()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    useEffect(() => {
        let active = true
        if (active) {
            if (state.address.agency.country) {
                axios({
                    url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/content/info/city',
                    method: 'post',
                    data: {
                        country: state.address.agency.country,
                    },
                }).then((cityResponse) => {
                    if (active) {
                        const cityData = cityResponse.data
                        if (cityData.success) {
                            setToState('registerStepper', ['cityList'], cityData.data)
                        }
                    }
                })
            }
        }

        return () => {
            active = false
        }
    }, [state.address.agency.country])

    useEffect(() => {
        let active = true
        if (active) {
            if (!loading) {
                return undefined
            }

            ;(async () => {
                if (state.address.agency.country) {
                    await axios({
                        url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/content/info/city',
                        method: 'post',
                        data: {
                            country: state.address.agency.country,
                        },
                    }).then((cityResponse) => {
                        if (active) {
                            const cityData = cityResponse.data
                            if (cityData.success) {
                                setToState('registerStepper', ['cityList'], cityData.data)
                            } else {
                                setToState(
                                    'registerStepper',
                                    ['cityList'],
                                    [
                                        {
                                            description: 'No Selectable City',
                                            id: '',
                                        },
                                    ]
                                )
                            }
                        }
                    })
                }
            })()
        }

        return () => {
            active = false
        }
    }, [loading])

    const handleOnChange = (e, option) => {
        if (option) {
            setToState('registerStepper', ['address', 'agency', 'city'], String(option.description))
            if (state.address.agencyBase.city !== String(option.description)) {
                setToState('registerStepper', ['address', 'agency', 'town'], '')
            } else {
                setToState('registerStepper', ['address', 'agency', 'town'], String(state.address.agencyBase.town))
            }
        }
    }

    if (state.cityList.length === 0 || state.countryList.length === 0) {
        return children
    }

    return (
        <Autocomplete
            id="asynchronous-city-search"
            autoComplete={false}
            disabled={state.address.agency && !state.address.agency.country}
            open={open}
            onOpen={() => {
                setOpen(true)
            }}
            onClose={() => {
                setOpen(false)
            }}
            onChange={(e, option) => handleOnChange(e, option)}
            getOptionSelected={(option, value) => option && value && option.id === value.id}
            getOptionLabel={(option) => option.description || ''}
            options={state.cityList}
            value={
                (state.cityList &&
                    state.address.agency &&
                    state.address.agency.city &&
                    state.cityList[
                        state.cityList.findIndex((data) => data.description === state.address.agency.city)
                    ]) ||
                ''
            }
            loading={loading}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    required
                    label="City"
                    fullWidth
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
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

export default connect(mapStateToProps, mapDispatchToProps)(CitySelect)
