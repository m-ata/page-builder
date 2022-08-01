import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import { useRouter } from 'next/router'
import { deleteFromState, pushToState, setToState, updateState } from 'state/actions'
import { connect } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import useNotifications from 'model/notification/useNotifications'
import LoadingSpinner from 'components/LoadingSpinner'
import { isErrorMsg, OREST_ENDPOINT } from 'model/orest/constants'
import { Delete, ViewList } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import HcmItemFact from './components/facilities/HcmItemFact'
import useTranslation from 'lib/translations/hooks/useTranslation'
import NewHcmFactCategory from './components/facilities/NewHcmFactCategory'
import NewHcmFact from './components/facilities/NewHcmFact'
import EditHcmFactCategory from './components/facilities/EditHcmFactCategory'

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

const Facilities = (props) => {
    const cls = useStyles()
    const { state, setToState, updateState, deleteFromState } = props
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const { showSuccess, showError } = useNotifications()
    const [facilitiesInitialized, setFacilitiesInitialized] = useState(false)
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { t } = useTranslation()

    const _getFacilitiesCommonData = (catID, hcmFactIndex) => {
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMFACT,
            token: token,
            params: {
                query: `catid:${catID}`,
                sort: 'id',
                allhotels: true,
            },
        }).then((r1) => {
            if (r1.status === 200) {
                setToState(
                    'registerStepper',
                    ['hcmFacilities', String(hcmFactIndex), 'hcmFactCategoryItems'],
                    r1.data.data
                )
                r1.data.data.map((hcmFactCategoryItem, hcmFactCategoryItemIndex) => {
                    ViewList({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.HCMITEMFACT,
                        token: token,
                        params: {
                            query: `factid:${hcmFactCategoryItem.id}`,
                            hotelrefno: Number(companyId),
                        },
                    }).then((r2) => {
                        if (r2.status === 200) {
                            setToState(
                                'registerStepper',
                                [
                                    'hcmFacilities',
                                    String(hcmFactIndex),
                                    'hcmFactCategoryItems',
                                    String(hcmFactCategoryItemIndex),
                                    'hcmFactCategoryItem',
                                ],
                                r2.data.data[0]
                            )
                        } else {
                            const retErr = isErrorMsg(r2)
                            showError(retErr.errorMsg)
                        }
                    })
                })
                setFacilitiesInitialized(true)
            } else {
                const retErr = isErrorMsg(r1)
                showError(retErr.errorMsg)
                setFacilitiesInitialized(true)
            }
        })
    }

    useEffect(() => {
        let active = true
        if (active) {
            if (!state.hcmFacilities.length > 0) {
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.HCMITEM,
                    token: token,
                    params: {
                        limit: 1,
                        hotelrefno: Number(companyId),
                    },
                }).then((r1) => {
                    if (active) {
                        if (r1.status === 200) {
                            setToState('registerStepper', ['hcmItemID'], r1.data.data[0].id)
                            ViewList({
                                apiUrl: GENERAL_SETTINGS.OREST_URL,
                                endpoint: OREST_ENDPOINT.HCMCAT,
                                token: token,
                                params: {
                                    query: 'isfact:true',
                                    sort: 'id',
                                    allhotels: true,
                                },
                            }).then((r2) => {
                                if (active) {
                                    if (r2.status === 200 && r2.data.data.length > 0) {
                                        setToState('registerStepper', ['hcmFacilities'], r2.data.data)
                                        _getFacilitiesCommonData(r2.data.data[0].id, 0)
                                    } else {
                                        showError(t('str_stdFacilityNotFoundError'))
                                    }
                                }
                            })
                        } else {
                            setToState('registerStepper', ['hcmItemID'], 0)
                            const retErr = isErrorMsg(r1)
                            showError(retErr.errorMsg)
                        }
                    }
                })
            } else {
                setFacilitiesInitialized(true)
            }
        }
        return () => {
            active = false
        }
    }, [])

    useEffect(() => {
        if (state.hcmFacilities[state.facilitiesTabIndex]) {
            if (!state.hcmFacilities[state.facilitiesTabIndex].hcmFactCategoryItems) {
                _getFacilitiesCommonData(state.hcmFacilities[state.facilitiesTabIndex].id, state.facilitiesTabIndex)
            }
        }
    }, [state.facilitiesTabIndex])

    const handleTabChange = (event, newValue) => {
        updateState('registerStepper', 'facilitiesTabIndex', newValue)
        _getFacilitiesCommonData(event.currentTarget.dataset.id, newValue)
    }

    if (!facilitiesInitialized) {
        return <LoadingSpinner />
    }

    const handleGroupDelete = (data, ind) => {
        setToState('registerStepper', ['hcmFacilities', ind, 'isDeleting'], true)
        Delete({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMCAT,
            token: token,
            gid: data.gid,
            params: {
                hotelrefno: Number(companyId),
            },
        }).then((res) => {
            if (res.status === 200) {
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.HCMFACT,
                    token: token,
                    params: {
                        query: `catid::${state.hcmFacilities[state.facilitiesTabIndex].id}`,
                        sort: 'seccode',
                        hotelrefno: Number(companyId),
                    },
                }).then((r) => {
                    if (r.status === 200) {
                        deleteFromState('registerStepper', ['hcmFacilities'], [ind, 1])
                        if (state.hcmFacilities[state.facilitiesTabIndex + 1]) {
                            _getFacilitiesCommonData(
                                state.hcmFacilities[state.facilitiesTabIndex + 1].id,
                                state.facilitiesTabIndex
                            )
                        } else {
                            if (state.hcmFacilities[state.facilitiesTabIndex - 1]) {
                                _getFacilitiesCommonData(
                                    state.hcmFacilities[state.facilitiesTabIndex - 1].id,
                                    state.facilitiesTabIndex - 1
                                )
                            }
                        }
                        showSuccess('Chosen group deleted!')
                    } else {
                        const retErr = isErrorMsg(r)
                        showError(retErr.errorMsg)
                        setToState('registerStepper', ['hcmFacilities', ind, 'isDeleting'], false)
                    }
                })
            } else {
                const retErr = isErrorMsg(res)
                showError(retErr.errorMsg)
                setToState('registerStepper', ['hcmFacilities', ind, 'isDeleting'], false)
            }
        })
    }

    return (
        <React.Fragment>
            <Grid container>
                <Grid item xs={12} className={cls.newItemButtonGrid}>
                    <NewHcmFactCategory hcmItemID={state.hcmItemID} />
                </Grid>
                <Grid item xs={12}>
                    <div className={cls.tabRoot}>
                        <Tabs
                            orientation="vertical"
                            variant="scrollable"
                            value={
                                state.facilitiesTabIndex < state.hcmFacilities.length
                                    ? state.facilitiesTabIndex
                                    : state.hcmFacilities.length - 1
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
                            {state.hcmFacilities &&
                                state.hcmFacilities.map((data, ind) => {
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
                        {state.hcmFacilities &&
                            state.hcmFacilities.map((data, ind) => {
                                return (
                                    <TabPanel
                                        key={ind}
                                        value={
                                            state.facilitiesTabIndex < state.hcmFacilities.length
                                                ? state.facilitiesTabIndex
                                                : state.hcmFacilities.length - 1
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
                                                    <EditHcmFactCategory
                                                        disabled={
                                                            data.hotelrefno !== Number(companyId) ||
                                                            state.hcmFacilities[ind].isDeleting ||
                                                            false
                                                        }
                                                        groupIndex={ind}
                                                    />
                                                    <Tooltip
                                                        style={{ verticalAlign: 'super', marginRight: 4 }}
                                                        title={
                                                            data.hotelrefno !== Number(companyId)
                                                                ? 'Std definition cannot be deleted'
                                                                : 'Delete Item'
                                                        }
                                                    >
                                                        <span>
                                                            <IconButton
                                                                disabled={
                                                                    data.hotelrefno !== Number(companyId) ||
                                                                    state.hcmFacilities[ind].isDeleting ||
                                                                    false
                                                                }
                                                                onClick={() => handleGroupDelete(data, ind)}
                                                                size={'small'}
                                                            >
                                                                <DeleteIcon fontSize={'default'} />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <NewHcmFact categoryID={data.id} groupIndex={ind} />
                                                </Grid>
                                            </Grid>
                                        </Typography>
                                        <Grid
                                            container
                                            style={{ maxHeight: 340, height: 'auto', overflowY: 'auto' }}
                                            spacing={3}
                                        >
                                            {data.hcmFactCategoryItems && data.hcmFactCategoryItems.length > 0 ? (
                                                data.hcmFactCategoryItems.map((itemData, itemInd) => (
                                                    <HcmItemFact
                                                        key={itemData.id}
                                                        hcmItemID={state.hcmItemID}
                                                        catid={itemData.catid}
                                                        hotelFactItem={itemData.hcmFactCategoryItem}
                                                        sectionDescription={itemData.secdesc}
                                                        itemID={itemData.id}
                                                        itemGid={itemData.gid}
                                                        factDescription={itemData.description}
                                                        groupIndex={ind}
                                                        itemIndex={itemInd}
                                                        hotelRefNo={itemData.hotelrefno}
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

export default connect(mapStateToProps, mapDispatchToProps)(Facilities)
