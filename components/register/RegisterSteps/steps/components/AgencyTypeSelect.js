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
import { VALIDATE_HELPER_TEXT_PROFILE } from '../../../constants'
import WebCmsGlobal from 'components/webcms-global'

const useStyles = makeStyles((theme) => ({
    endAdornment: {
        marginRight: 15,
    },
}))

const AgencyTypeSelect = (props) => {
    const { state, setToState } = props
    const cls = useStyles()
    const [open, setOpen] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)
    const loading = !isInitialized && open && state.agencyTypeList.length === 0
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const preRegister = router.query.preRegister === '1'
    const { showError } = useNotifications()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    useEffect(() => {
        let active = true
        if (active) {
            axios({
                url: GENERAL_SETTINGS.BASE_URL + '',
                method: 'post',
            }).then((hotelTypeResponse) => {
                if (active) {
                    const hotelTypeData = hotelTypeResponse.data[0]
                    if (hotelTypeData.success) {
                        setToState('registerStepper', ['agencyTypeList'], hotelTypeData.data)
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
                    url: GENERAL_SETTINGS.BASE_URL + '',
                    method: 'post',
                }).then((hotelTypeResponse) => {
                    if (active) {
                        const hotelTypeData = hotelTypeResponse.data[0]
                        if (hotelTypeData.success) {
                            setToState('registerStepper', ['agencyTypeList'], hotelTypeData.data)
                        } else {
                            setToState('registerStepper', ['agencyTypeList'], [])
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
            if (preRegister) {
                setToState('registerStepper', ['basics', 'agency', 'agencytype'], String(option.description))
                setToState('registerStepper', ['basics', 'agency', 'agencytypeid'], String(option.id))
            } else {
                setToState('registerStepper', ['basics', 'agency', 'agencytypeid'], String(option.id))
            }
        }
    }

    return (
        <Autocomplete
            id="asynchronous-agency-type-select"
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
            getOptionLabel={(option) => option.description || ''}
            options={state.agencyTypeList}
            value={
                (state.agencyTypeList.length > 0 &&
                    state.agencyTypeList[
                        state.agencyTypeList.findIndex((data) => data.id === Number(state.basics.agency.agencytypeid))
                    ]) ||
                ''
            }
            loading={loading}
            disableClearable={true}
            renderInput={(params) => (
                <TextField
                    {...params}
                    helperText={
                        (state.basics.agency &&
                            state.basics.agency.validateProfile &&
                            state.basics.agency.validateProfile.helperText) ||
                        ''
                    }
                    error={
                        (state.basics.agency &&
                            state.basics.agency.validateProfile &&
                            state.basics.agency.validateProfile.error) ||
                        false
                    }
                    variant={preRegister ? 'outlined' : 'standard'}
                    required
                    label={preRegister ? 'Profile' : 'Company Type'}
                    fullWidth
                    onBlur={() => {
                        if (preRegister) {
                            if (state.basics.agency.agencytype === '') {
                                setToState('registerStepper', ['basics', 'agency', 'validateProfile', 'error'], true)
                                setToState(
                                    'registerStepper',
                                    ['basics', 'agency', 'validateProfile', 'helperText'],
                                    VALIDATE_HELPER_TEXT_PROFILE
                                )
                            } else {
                                setToState('registerStepper', ['basics', 'agency', 'validateProfile', 'error'], false)
                                setToState('registerStepper', ['basics', 'agency', 'validateProfile', 'helperText'], '')
                            }
                        }
                    }}
                    InputLabelProps={{
                        style: { backgroundColor: 'white', paddingLeft: 5, paddingRight: 5 },
                    }}
                    InputProps={{
                        ...params.InputProps,
                        style: { borderRadius: 50 },
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

export default connect(mapStateToProps, mapDispatchToProps)(AgencyTypeSelect)
