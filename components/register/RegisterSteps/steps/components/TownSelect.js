import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import CircularProgress from '@material-ui/core/CircularProgress'
import { useRouter } from 'next/router'
import { setToState, updateState } from 'state/actions'
import { connect } from 'react-redux'
import useNotifications from 'model/notification/useNotifications'
import { makeStyles } from '@material-ui/core'
import WebCmsGlobal from 'components/webcms-global'

const useStyles = makeStyles({
    root: {},
})

const TownSelect = (props) => {
    const cls = useStyles()
    const { state, setToState, children } = props
    const [open, setOpen] = useState(false)
    const loading = open && state.townList.length === 0
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const { showError } = useNotifications()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    useEffect(() => {
        let active = true
        if (active) {
            if (state.address.agency.city && state.cityList.length === 0) {
                axios({
                    url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/content/info/town',
                    method: 'post',
                    data: {
                        city: state.address.agency.city,
                    },
                }).then((townResponse) => {
                    if (active) {
                        const townData = townResponse.data
                        if (townData.success) {
                            setToState('registerStepper', ['townList'], townData.data)
                        }
                    }
                })
            }
        }

        return () => {
            active = false
        }
    }, [state.address.agency.city])

    useEffect(() => {
        let active = true

        if (!loading) {
            return undefined
        }

        ;(async () => {
            if (state.address.agency.city) {
                await axios({
                    url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/content/info/town',
                    method: 'post',
                    data: {
                        city: state.address.agency.city,
                    },
                }).then((townResponse) => {
                    if (active) {
                        const townData = townResponse.data
                        if (townData.success) {
                            setToState('registerStepper', ['townList'], townData.data)
                        } else {
                            setToState('registerStepper', ['townList'], [{ description: 'No Selectable Town', id: '' }])
                        }
                    }
                })
            }
        })()

        return () => {
            active = false
        }
    }, [loading])

    const handleOnChange = (e, option) => {
        if (option) {
            setToState('registerStepper', ['address', 'agency', 'town'], String(option.description))
        }
    }

    if (state.townList.length === 0 || state.cityList.length === 0) {
        return children
    }

    return (
        <Autocomplete
            id="asynchronous-town-search"
            autoComplete={false}
            classes={cls}
            disabled={(state.address.agency && !state.address.agency.country) || !state.address.agency.city}
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
            options={state.townList}
            value={
                (state.townList &&
                    state.address.agency &&
                    state.address.agency.town &&
                    state.townList[
                        state.townList.findIndex((data) => data.description === state.address.agency.town)
                    ]) ||
                ''
            }
            loading={loading}
            disableClearable={false}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    required
                    label="Town"
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

export default connect(mapStateToProps, mapDispatchToProps)(TownSelect)
