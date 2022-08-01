import React, { useContext, useEffect, useState } from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import CircularProgress from '@material-ui/core/CircularProgress'
import { useRouter } from 'next/router'
import { setToState, updateState } from '../../../../../state/actions'
import { connect } from 'react-redux'
import { isErrorMsg, isObjectEmpty, OREST_ENDPOINT } from '../../../../../model/orest/constants'
import useNotifications from '../../../../../model/notification/useNotifications'
import WebCmsGlobal from 'components/webcms-global'
import { ViewList } from '@webcms/orest'

const CountrySelect = (props) => {
    const { state, setToState, children } = props
    const [open, setOpen] = useState(false)
    const loading = open && state.countryList.length === 0
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const { showError } = useNotifications()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    useEffect(() => {
        let active = true
        if (active) {
            if (isObjectEmpty(state.countryList)) {
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.COUNTRY,
                    token: token,
                    params: {
                        limit: 1000,
                        hotelrefno: companyId,
                    },
                }).then((r) => {
                    if (active) {
                        if (r.status === 200) {
                            setToState('registerStepper', ['countryList'], r.data.data)
                        } else {
                            const retErr = isErrorMsg(r)
                            showError(retErr.errorMsg)
                        }
                    }
                })
            }
        }

        return () => {
            active = false
        }
    }, [])

    useEffect(() => {
        let active = true
        if (active) {
            if (!loading) {
                return undefined
            }

            ;(async () => {
                if (isObjectEmpty(state.countryList)) {
                    await ViewList({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.COUNTRY,
                        token: token,
                        params: {
                            limit: 1000,
                            hotelrefno: companyId,
                        },
                    }).then((r) => {
                        if (active) {
                            if (r.status === 200) {
                                setToState('registerStepper', ['countryList'], r.data.data)
                            } else {
                                const retErr = isErrorMsg(r)
                                showError(retErr.errorMsg)
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
            setToState('registerStepper', ['address', 'agency', 'country'], String(option.description))
            //setToState('registerStepper', ['address', 'agency', 'rescountryid'], String(option.id));
            if (state.address.agencyBase.country !== String(option.description)) {
                setToState('registerStepper', ['address', 'agency', 'city'], '')
                setToState('registerStepper', ['address', 'agency', 'town'], '')
            } else {
                setToState('registerStepper', ['address', 'agency', 'city'], String(state.address.agencyBase.city))
                setToState('registerStepper', ['address', 'agency', 'town'], String(state.address.agencyBase.town))
            }
        }
    }

    if (state.countryList.length === 0) {
        return children
    }

    return (
        <Autocomplete
            id="asynchronous-country-search"
            autoComplete={false}
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
            options={state.countryList}
            value={
                (state.countryList &&
                    state.address.agency &&
                    state.address.agency.country &&
                    state.countryList[
                        state.countryList.findIndex((data) => data.description === state.address.agency.country)
                    ]) ||
                ''
            }
            loading={loading}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    required
                    label="Country"
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

export default connect(mapStateToProps, mapDispatchToProps)(CountrySelect)
