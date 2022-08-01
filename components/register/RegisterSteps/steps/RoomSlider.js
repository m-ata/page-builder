import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import { useRouter } from 'next/router'
import { deleteFromState, pushToState, setToState, updateState } from '../../../../state/actions'
import { connect } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import { isErrorMsg, OREST_ENDPOINT } from '../../../../model/orest/constants'
import LoadingSpinner from '../../../LoadingSpinner'
import useNotifications from '../../../../model/notification/useNotifications'
import { GridContextProvider, GridDropZone, GridItem, swap } from 'react-grid-dnd'
import WebCmsGlobal from 'components/webcms-global'
import { ViewList } from '@webcms/orest'
import NewHcmItemImg from './components/photos/NewHcmItemImg'
import HcmItemImgViewer from './components/photos/HcmItemImgViewer'
import { _newHcmImgOrderUtil } from './components/photos/photosUtils'
import useTranslation from 'lib/translations/hooks/useTranslation'

React.useLayoutEffect = useEffect

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
    dragContainer: {
        touchAction: 'none',
        width: '100%',
        margin: '1rem auto',
        height: 345,
        overflowY: 'auto',
        overflowX: 'hidden',
        marginBottom: 60,
        display: 'flex',
    },
    dragZone: {
        flex: 1,
        height: 400,
    },
    dragGridItem: {
        padding: '10px',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
    },
    dragGridItemContent: {
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    newItemButtonGrid: {
        position: 'absolute',
        width: 229,
        [theme.breakpoints.down('md')]: {
            width: 188,
        },
    },
}))

const RoomSlider = (props) => {
    const cls = useStyles()
    const { state, setToState, updateState } = props

    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const { showSuccess, showError } = useNotifications()
    const [photosInitialized, setPhotosInitialized] = useState(false)
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { t } = useTranslation()

    const _getImagesCommonData = (catID, hcmImgIndex) => {
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMITEMIMG,
            token: token,
            params: {
                query: `catid:${catID}`,
                sort: 'orderno',
                hotelrefno: companyId,
            },
        }).then((res) => {
            if (res.status === 200) {
                setToState(
                    'registerStepper',
                    ['hcmItemSlider', String(hcmImgIndex), 'hcmItemSliderItems'],
                    res.data.data
                )
                res.data.data.map((hcmItemImgItem, hcmItemImgItemIndex) => {
                    ViewList({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.RATAG,
                        token: token,
                        params: {
                            query: 'masterid:' + hcmItemImgItem.mid,
                            hotelrefno: companyId,
                        },
                    }).then((res1) => {
                        if (res1.status === 200 && res1.data.data) {
                            setToState(
                                'registerStepper',
                                [
                                    'hcmItemSlider',
                                    String(hcmImgIndex),
                                    'hcmItemSliderItems',
                                    String(hcmItemImgItemIndex),
                                    'hcmItemImgItemTags',
                                ],
                                res1.data.data
                            )
                        }
                    })
                })
            } else {
                const retErr = isErrorMsg(res)
                showError(retErr.errorMsg)
            }
        })
    }

    const _newHcmImgOrder = async () => {
        await _newHcmImgOrderUtil(GENERAL_SETTINGS.OREST_URL, token, state.photosNewOrderList, updateState)
    }

    useEffect(() => {
        let active = true
        if (active) {
            if (!state.hcmItemSlider.length > 0) {
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
                                endpoint: OREST_ENDPOINT.HCMITEMSLD,
                                token: token,
                                params: {
                                    sort: 'id',
                                    hotelrefno: Number(companyId),
                                },
                            }).then((r1) => {
                                if (active) {
                                    if (r1.status === 200) {
                                        setToState('registerStepper', ['hcmItemSlider'], r1.data.data)
                                        setPhotosInitialized(true)
                                        if (r1.data.data.length > 0) {
                                            _getImagesCommonData(r1.data.data[0].id, '0')
                                        }
                                    } else {
                                        const retErr = isErrorMsg(r1)
                                        showError(retErr.errorMsg)
                                    }
                                }
                            })
                        }
                    }
                })
            } else {
                setPhotosInitialized(true)
            }
        }
        return () => {
            active = false
        }
    }, [])

    useEffect(() => {
        if (state.hcmItemSlider[state.roomSliderTabIndex]) {
            if (!state.hcmItemSlider[state.roomSliderTabIndex].hcmItemSliderItems) {
                _getImagesCommonData(state.hcmItemSlider[state.roomSliderTabIndex].id, state.roomSliderTabIndex)
            }
        }
    }, [state.roomSliderTabIndex])

    const handleTabChange = (event, newValue) => {
        _newHcmImgOrder()
        updateState('registerStepper', 'roomSliderTabIndex', newValue)
        _getImagesCommonData(event.currentTarget.dataset.id, newValue)
    }

    const handleOnDrag = (sourceId, sourceIndex, targetIndex) => {
        const nextState = swap(
            state.hcmItemSlider[String(state.roomSliderTabIndex)].hcmItemSliderItems,
            sourceIndex,
            targetIndex
        )

        if (
            JSON.stringify(state.hcmItemSlider[state.roomSliderTabIndex].hcmItemSliderItems) !==
            JSON.stringify(nextState)
        ) {
            setToState(
                'registerStepper',
                ['hcmItemSlider', String(state.roomSliderTabIndex), 'hcmItemSliderItems'],
                nextState
            )

            let photosNewOrderList = state.photosNewOrderList
            for (let i = 0; i < nextState.length; i++) {
                const orderIndex = photosNewOrderList.findIndex((data) => data.hcmItemImgGid === nextState[i].gid)
                if (orderIndex === -1) {
                    photosNewOrderList.push({
                        hcmItemImgGid: nextState[i].gid,
                        hcmItemImgOrderNo: i,
                        hcmItemImgID: nextState[i].id,
                    })
                } else {
                    photosNewOrderList[orderIndex].hcmItemImgOrderNo = i
                }
            }

            updateState('registerStepper', 'photosNewOrderList', photosNewOrderList)
        }
    }

    if (!photosInitialized) {
        return <LoadingSpinner />
    }

    return (
        <React.Fragment>
            <Grid container>
                <Grid item xs={12}>
                    <div className={cls.tabRoot}>
                        <Tabs
                            orientation="vertical"
                            variant="scrollable"
                            value={
                                state.roomSliderTabIndex < state.hcmItemSlider.length
                                    ? state.roomSliderTabIndex
                                    : state.hcmItemSlider.length - 1
                            }
                            onChange={handleTabChange}
                            className={cls.tabs}
                            TabIndicatorProps={{ style: { width: 6 } }}
                        >
                            {state.hcmItemSlider &&
                                state.hcmItemSlider.map((data, ind) => {
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
                        {state.hcmItemSlider &&
                            state.hcmItemSlider.map((data, ind) => {
                                return (
                                    <TabPanel
                                        key={ind}
                                        value={
                                            state.roomSliderTabIndex < state.hcmItemSlider.length
                                                ? state.roomSliderTabIndex
                                                : state.hcmItemSlider.length - 1
                                        }
                                        index={ind}
                                        style={{ width: '100%' }}
                                    >
                                        <Typography component="div" style={{ marginBottom: 20 }}>
                                            <Grid container>
                                                <Grid item>
                                                    <Typography variant="h5">{data.description}</Typography>
                                                </Grid>
                                                <Grid item style={{ marginLeft: 10 }}>
                                                    <NewHcmItemImg
                                                        groupIndex={ind}
                                                        hcmItemID={state.hcmItemID}
                                                        categoryID={data.id}
                                                        roomSlider={true}
                                                        orderCount={
                                                            data.hcmItemSliderItems &&
                                                            data.hcmItemSliderItems.length > 0
                                                                ? data.hcmItemSliderItems.length
                                                                : 0
                                                        }
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Typography>
                                        <GridContextProvider onChange={handleOnDrag}>
                                            <div className={cls.dragContainer}>
                                                <GridDropZone
                                                    id="items"
                                                    rowHeight={150}
                                                    boxesPerRow={4}
                                                    className={cls.dragZone}
                                                    disableDrag={state.photosGridDragAndDrop}
                                                    disableDrop={state.photosGridDragAndDrop}
                                                >
                                                    {data.hcmItemSliderItems && data.hcmItemSliderItems.length > 0 ? (
                                                        data.hcmItemSliderItems.map((hcmItemImgData, hcmItemImgInd) => (
                                                            <GridItem key={hcmItemImgInd.toString()}>
                                                                <div className={cls.dragGridItem}>
                                                                    <div className={cls.dragGridItemContent}>
                                                                        <HcmItemImgViewer
                                                                            groupIndex={ind}
                                                                            itemIndex={hcmItemImgInd}
                                                                            itemGid={hcmItemImgData.gid}
                                                                            itemID={hcmItemImgData.id}
                                                                            itemMid={hcmItemImgData.mid}
                                                                            itemTags={hcmItemImgData.hcmItemImgItemTags}
                                                                            categoryID={data.id}
                                                                            imageUrl={
                                                                                GENERAL_SETTINGS.STATIC_URL +
                                                                                hcmItemImgData.fileurl
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </GridItem>
                                                        ))
                                                    ) : (
                                                        <Typography component="h3" style={{ marginTop: 15 }}>
                                                            {t('str_pleaseAddItemGroup ')}
                                                        </Typography>
                                                    )}
                                                </GridDropZone>
                                            </div>
                                        </GridContextProvider>
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

export default connect(mapStateToProps, mapDispatchToProps)(RoomSlider)
