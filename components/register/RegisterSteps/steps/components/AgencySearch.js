import React, { useContext, useEffect, useState } from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import CircularProgress from '@material-ui/core/CircularProgress'
import { useRouter } from 'next/router'
import { setToState, updateState } from '../../../../../state/actions'
import { connect } from 'react-redux'
import { makeStyles } from '@material-ui/core'
import NewAgencyChain from './NewAgencyChain'
import { ViewList } from '@webcms/orest'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { OREST_ENDPOINT } from '../../../../../model/orest/constants'
import WebCmsGlobal from 'components/webcms-global'

const useStyles = makeStyles({
    root: {
        marginTop: 23,
    },
    inputRoot: {
        paddingRight: '0!important',
    },
    clearIndicator: {
        //display: 'none'
    },
    endAdornment: {
        position: 'relative',
        marginRight: 15,
    },
})

const AgencySearch = (props) => {
    const { state, setToState } = props
    const cls = useStyles()
    const [open, setOpen] = useState(false)
    const { t } = useTranslation()
    const [isInitialized, setIsInitialized] = useState(false)
    const [isAgencyChainHover, setIsAgencyChainHover] = useState(false)
    const loading = !isInitialized && open && state.agencyChainList.length === 0
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    useEffect(() => {
        let active = true
        if (active) {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.AGENCY,
                token: token,
                params: {
                    query: 'ischain:true',
                    limit: 1000,
                },
            }).then((r) => {
                if (active) {
                    if (r.status === 200 && r.data.count > 0) {
                        setToState('registerStepper', ['agencyChainList'], r.data.data)
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
                const datas = await ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.AGENCY,
                    token: token,
                    params: {
                        query: 'ischain:true',
                        limit: 1000,
                    },
                }).then((r) => {
                    if (active) {
                        if (r.status === 200 && r.data.count > 0) {
                            setIsInitialized(true)
                            return r.data.data
                        } else {
                            setIsInitialized(true)
                            return []
                        }
                    }
                })

                if (active) {
                    setToState('registerStepper', ['agencyChainList'], datas)
                }
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
            setToState('registerStepper', ['basics', 'agency', 'chainid'], option.id)
            setToState('registerStepper', ['basics', 'agency', 'chaincode'], option.code)
        }
    }

    const handleOnInputChange = (e) => {
        if (e) {
            setToState('registerStepper', ['basics', 'agency', 'chaincode'], e.target.value)
        }
    }

    return (
        <Autocomplete
            id="asynchronous-agency-search"
            classes={cls}
            open={open}
            onOpen={() => {
                setOpen(true)
            }}
            onClose={() => {
                setOpen(false)
            }}
            onMouseEnter={() => {
                setIsAgencyChainHover(true)
            }}
            onMouseLeave={() => {
                setIsAgencyChainHover(false)
            }}
            onChange={(e, option) => handleOnChange(e, option)}
            onInputChange={handleOnInputChange}
            getOptionSelected={(option, value) => option.code === value.code}
            getOptionLabel={(option) => option.code || ''}
            options={state.agencyChainList}
            value={
                (state.agencyChainList.length > 0 &&
                    state.agencyChainList[
                        state.agencyChainList.findIndex(
                            (data) => data.codestr === String(state.basics.agency.chaincode)
                        )
                    ]) ||
                ''
            }
            loading={loading}
            renderInput={(params) => (
                <TextField
                    {...params}
                    required
                    label={t('str_chainPropertyName')}
                    fullWidth
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                <NewAgencyChain isVisible={isAgencyChainHover} />
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

export default connect(mapStateToProps, mapDispatchToProps)(AgencySearch)
