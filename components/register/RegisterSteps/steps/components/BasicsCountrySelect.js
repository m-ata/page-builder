import React, { useContext, useEffect, useState } from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import CircularProgress from '@material-ui/core/CircularProgress'
import { useRouter } from 'next/router'
import { setToState, updateState } from '../../../../../state/actions'
import { connect } from 'react-redux'
import useNotifications from '../../../../../model/notification/useNotifications'
import { makeStyles } from '@material-ui/core'
import axios from 'axios'
import WebCmsGlobal from 'components/webcms-global'

const useStyles = makeStyles((theme) => ({
    root: {},
    endAdornment: {
        marginRight: 15,
    },
}))

// ISO 3166-1 alpha-2
// ⚠️ No support for IE 11
function countryToFlag(isoCode) {
    return typeof String.fromCodePoint !== 'undefined'
        ? isoCode && isoCode.toUpperCase().replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
        : isoCode
}

const BasicsCountrySelect = (props) => {
    const { state, setToState } = props
    const cls = useStyles()
    const [open, setOpen] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)
    const loading = !isInitialized && open && state.countryList.length === 0
    const router = useRouter()
    const preRegister = router.query.preRegister === '1'
    const token = router.query.authToken
    const companyId = router.query.companyID
    const { showError } = useNotifications()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    useEffect(() => {
        let active = true
        if (active) {
            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/content/info/country',
                method: 'post',
            }).then((countryResponse) => {
                if (active) {
                    const countryData = countryResponse.data
                    if (countryData.success) {
                        setToState('registerStepper', ['countryList'], countryData.data)
                    }
                }
            })
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
                await axios({
                    url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/content/info/country',
                    method: 'post',
                }).then((countryResponse) => {
                    if (active) {
                        const countryData = countryResponse.data
                        if (countryData.success) {
                            setToState('registerStepper', ['countryList'], countryData.data)
                        } else {
                            setToState('registerStepper', ['countryList'], [])
                        }
                    }
                })
            })()
        }

        return () => {
            active = false
        }
    }, [loading])

    useEffect(() => {
        if (state.agencyChainList.length === 0) {
            setIsInitialized(false)
        }
    }, [open])

    const handleOnChange = (e, option) => {
        if (option) {
            setToState('registerStepper', ['basics', 'agency', 'countryid'], String(option.id))
            setToState('registerStepper', ['basics', 'agency', 'country'], String(option.description))
        }
    }

    if (!state.basics.agency) {
        return null
    }

    return (
        <Autocomplete
            id="asynchronous-country-search"
            classes={cls}
            open={open}
            onOpen={() => {
                setOpen(true)
            }}
            onClose={() => {
                setOpen(false)
            }}
            onChange={(e, option) => handleOnChange(e, option)}
            getOptionSelected={(option, value) => option.id === value.id}
            getOptionLabel={(option) => option && option.description}
            renderOption={(option) => (
                <React.Fragment>
                    {/*<span>{countryToFlag(option.iso2)}</span>*/}
                    {option.description}
                </React.Fragment>
            )}
            options={state.countryList}
            value={
                state.basics.agency.country &&
                state.countryList[
                    state.countryList.findIndex((data) => data.description === state.basics.agency.country)
                ]
            }
            loading={loading}
            disableClearable={true}
            renderInput={(params) => (
                <TextField
                    {...params}
                    size="small"
                    variant={'outlined'}
                    label="Country"
                    fullWidth
                    InputLabelProps={{
                        style: { backgroundColor: 'white', paddingLeft: 5, paddingRight: 5 },
                    }}
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

export default connect(mapStateToProps, mapDispatchToProps)(BasicsCountrySelect)
