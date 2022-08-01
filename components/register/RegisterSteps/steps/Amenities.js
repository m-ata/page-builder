import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import { useRouter } from 'next/router'
import { RemarkGrDelete } from '../../../../model/orest/components/RemarkGr'
import { deleteFromState, pushToState, setToState, updateState } from '../../../../state/actions'
import { connect } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import RemarkItem from '../steps/components/RemarkItem'
import NewRemarkGr from '../steps/components/NewRemarkGr'
import NewRemark from '../steps/components/NewRemark'
import DeleteIcon from '@material-ui/icons/Delete'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import EditRemarkGr from '../steps/components/EditRemarkGr'
import useNotifications from '../../../../model/notification/useNotifications'
import LoadingSpinner from '../../../LoadingSpinner'
import { isErrorMsg, OREST_ENDPOINT } from '../../../../model/orest/constants'
import { ViewList } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import useTranslation from 'lib/translations/hooks/useTranslation'

function TabPanel(props) {
    const { children, value, index, ...other } = props

    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && <Box p={'5px 10px 5px 25px'}>{children}</Box>}
        </Typography>
    )
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
}

function a11yProps(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    }
}

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        height: '100%',
        maxHeight: '365px',
    },
    card: {
        maxWidth: 345,
    },
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
    margin: {
        margin: theme.spacing(1),
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
    tabRoot: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        height: 425,
    },
    tabs: {
        borderRight: `1px solid ${theme.palette.divider}`,
        width: 280,
        marginTop: 50,
    },
    tabItem: {
        borderStyle: 'solid',
        borderColor: '#dadde9',
        borderWidth: '0 0 1px 0',
    },
    newItemButtonGrid: {
        position: 'absolute',
        width: 229,
        [theme.breakpoints.down('md')]: {
            width: 188,
        },
    },
}))

const Amenities = (props) => {
    const cls = useStyles()
    const { state, setToState, updateState, deleteFromState } = props
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const { showSuccess, showError } = useNotifications()
    const { t } = useTranslation()
    const [amenitiesInitialized, setAmenitiesInitialized] = useState(false)
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    useEffect(() => {
        let active = true
        if (active) {
            if (!state.remarkGr.length > 0) {
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.REMARKGR,
                    token: token,
                    params: {
                        hotelrefno: Number(companyId),
                    },
                }).then((r) => {
                    if (active) {
                        if (r.status === 200) {
                            setToState('registerStepper', ['remarkGr'], r.data.data)
                            setAmenitiesInitialized(true)
                            if (r.data.count > 0) {
                                ViewList({
                                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                                    endpoint: OREST_ENDPOINT.REMARK,
                                    token: token,
                                    params: {
                                        query: `remarkgrid:${r.data.data[0].id}`,
                                        hotelrefno: companyId,
                                    },
                                }).then((res) => {
                                    if (res.status === 200) {
                                        setToState('registerStepper', ['remarkGr', '0', 'remarks'], res.data.data)
                                    } else {
                                        const retErr = isErrorMsg(res)
                                        showError(retErr.errorMsg)
                                    }
                                })
                            }
                        } else {
                            const retErr = isErrorMsg(r)
                            showError(retErr.errorMsg)
                        }
                    }
                })
            } else {
                setAmenitiesInitialized(true)
            }
        }
        return () => {
            active = false
        }
    }, [])

    useEffect(() => {
        let active = true
        if (active) {
            if (state.remarkGr[state.remarkTabIndex]) {
                if (!state.remarkGr[state.remarkTabIndex].remarks) {
                    ViewList({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.REMARK,
                        token: token,
                        params: {
                            query: `remarkgrid:${state.remarkGr[state.remarkTabIndex].id}`,
                            hotelrefno: companyId,
                        },
                    }).then((r) => {
                        if (active) {
                            if (r.status === 200) {
                                setToState(
                                    'registerStepper',
                                    ['remarkGr', state.remarkTabIndex, 'remarks'],
                                    r.data.data
                                )
                            } else {
                                const retErr = isErrorMsg(r)
                                showError(retErr.errorMsg)
                            }
                        }
                    })
                }
            }
        }
        return () => {
            active = false
        }
    }, [state.remarkTabIndex])

    const handleTabChange = (event, newValue) => {
        updateState('registerStepper', 'remarkTabIndex', newValue)
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.REMARK,
            token: token,
            params: {
                query: `remarkgrid:${event.currentTarget.dataset.id}`,
                hotelrefno: companyId,
            },
        }).then((res) => {
            if (res.status === 200) {
                setToState('registerStepper', ['remarkGr', String(newValue), 'remarks'], res.data.data)
            } else {
                const retErr = isErrorMsg(res)
                showError(retErr.errorMsg)
            }
        })
    }

    const handleRemarkGrDelete = (data, ind) => {
        setToState('registerStepper', ['remarkGr', ind, 'isDeleting'], true)
        return RemarkGrDelete(GENERAL_SETTINGS.OREST_URL, token, companyId, data.gid).then((res1) => {
            if (res1.status === 200) {
                deleteFromState('registerStepper', ['remarkGr'], [ind, 1])
                if (state.remarkGr[state.remarkTabIndex + 1]) {
                    ViewList({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.REMARK,
                        token: token,
                        params: {
                            query: `remarkgrid:${state.remarkGr[state.remarkTabIndex + 1].id}`,
                            hotelrefno: companyId,
                        },
                    }).then((res2) => {
                        if (res2.status === 200 && res2.data.count > 0) {
                            setToState('registerStepper', ['remarkGr', state.remarkTabIndex, 'remarks'], res2.data.data)
                        } else {
                            const retErr = isErrorMsg(res2)
                            showError(retErr.errorMsg)
                        }
                    })
                } else {
                    if (state.remarkGr[state.remarkTabIndex - 1]) {
                        ViewList({
                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                            endpoint: OREST_ENDPOINT.REMARK,
                            token: token,
                            params: {
                                query: `remarkgrid:${state.remarkGr[state.remarkTabIndex - 1].id}`,
                                hotelrefno: companyId,
                            },
                        }).then((res2) => {
                            if (res2.status === 200 && res2.data.count > 0) {
                                setToState(
                                    'registerStepper',
                                    ['remarkGr', state.remarkTabIndex - 1, 'remarks'],
                                    res2.data.data
                                )
                            }
                        })
                    }
                }
                showSuccess('Chosen group deleted!')
            } else {
                setToState('registerStepper', ['remarkGr', ind, 'isDeleting'], false)
                const retErr = isErrorMsg(res1)
                showError(retErr.errorMsg)
            }
        })
    }

    if (!amenitiesInitialized) {
        return <LoadingSpinner />
    }

    return (
        <React.Fragment>
            <Grid container>
                <Grid item xs={12} className={cls.newItemButtonGrid}>
                    <NewRemarkGr />
                </Grid>
                <Grid item xs={12}>
                    <div className={cls.tabRoot}>
                        <Tabs
                            orientation="vertical"
                            variant="scrollable"
                            value={
                                state.remarkTabIndex < state.remarkGr.length
                                    ? state.remarkTabIndex
                                    : state.remarkGr.length - 1
                            }
                            onChange={handleTabChange}
                            aria-label="Vertical tabs example"
                            className={cls.tabs}
                            TabIndicatorProps={{
                                style: {
                                    width: 6,
                                },
                            }}
                        >
                            {state.remarkGr &&
                                state.remarkGr.map((data, ind) => {
                                    return (
                                        <Tab
                                            data-id={data.id}
                                            key={ind}
                                            label={data.description}
                                            className={cls.tabItem}
                                            {...a11yProps(ind)}
                                        />
                                    )
                                })}
                        </Tabs>
                        {state.remarkGr &&
                            state.remarkGr.map((data, ind) => {
                                return (
                                    <TabPanel
                                        key={ind}
                                        value={
                                            state.remarkTabIndex < state.remarkGr.length
                                                ? state.remarkTabIndex
                                                : state.remarkGr.length - 1
                                        }
                                        index={ind}
                                        style={{ width: '100%' }}
                                    >
                                        <Typography component="div" style={{ marginBottom: 10, flexGrow: 1 }}>
                                            <Grid container>
                                                <Grid item>
                                                    <Typography variant="h5">{data.description}</Typography>
                                                </Grid>
                                                <Grid item style={{ marginLeft: 10 }}>
                                                    <EditRemarkGr grIndex={ind} grID={data.id} />
                                                    <Tooltip style={{ marginBottom: 10 }} title="Delete Group">
                                                        <IconButton
                                                            size={'small'}
                                                            disabled={state.remarkGr[ind].isDeleting || false}
                                                            onClick={() => handleRemarkGrDelete(data, ind)}
                                                        >
                                                            <DeleteIcon fontSize={'small'} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <NewRemark grIndex={ind} grID={data.id} />
                                                </Grid>
                                            </Grid>
                                        </Typography>
                                        <Grid container style={{ maxHeight: 340, height: 'auto', overflowY: 'auto' }}>
                                            {data.remarks && data.remarks.length > 0 ? (
                                                data.remarks.map((remarkData, remarkInd) => (
                                                    <RemarkItem
                                                        key={remarkInd.toString()}
                                                        itemIndex={Number(remarkInd)}
                                                        grpIndex={ind}
                                                        itemDescription={remarkData.description || ''}
                                                        itemStatus={remarkData.isorsactive}
                                                        itemID={remarkData.gid}
                                                        remarkGrp={remarkData.remarkgrid}
                                                    />
                                                ))
                                            ) : (
                                                <Typography component="h3" style={{ marginTop: 15 }}>
                                                    {t('str_pleaseAddItemGroup ')}
                                                </Typography>
                                            )}
                                        </Grid>
                                    </TabPanel>
                                )
                            })}
                    </div>
                </Grid>
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
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    pushToState: (stateType, stateName, value) => dispatch(pushToState(stateType, stateName, value)),
    deleteFromState: (stateType, stateName, value) => dispatch(deleteFromState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Amenities)
