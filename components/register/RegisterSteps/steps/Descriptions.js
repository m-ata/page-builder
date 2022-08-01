import React, { useRef, useContext, useEffect, useState } from 'react'
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
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import HcmItemTxtParItem from './components/descriptions/HcmItemTxtParItem'
import useNotifications from '../../../../model/notification/useNotifications'
import LoadingSpinner from '../../../LoadingSpinner'
import { isErrorMsg, OREST_ENDPOINT } from '../../../../model/orest/constants'
import { UseOrest, Insert, Delete, ViewList } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import NewHcmItemTxt from './components/descriptions/NewHcmItemTxt'
import NewHcmItemTxtPar from './components/descriptions/NewHcmItemTxtPar'
import EditHcmItemTxt from './components/descriptions/EditHcmItemTxt'
import useTranslation from 'lib/translations/hooks/useTranslation'
import MaterialTable, { MTableAction } from 'material-table'
import { TextField } from '@material-ui/core'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import { useSnackbar } from 'notistack'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state'
import EditHcmItemTxtPar from './components/descriptions/EditHcmItemTxtPar'

import AddIcon from '@material-ui/icons/Add'
import EditIcon from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete'

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

const useStyles = makeStyles(() => ({
    table: {
        '& tbody>.MuiTableRow-root:hover $roomtypeCtxMenu': {
            visibility: 'visible',
        },
    },
    roomtypeCtxMenu: {
        visibility: 'hidden',
    },
}))

const Description = (props) => {
    const classes = useStyles()
    const { state, setToState, updateState, deleteFromState } = props
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const { showSuccess, showError } = useNotifications()
    const [descriptionInitialized, setDescriptionInitialized] = useState(false)
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { t } = useTranslation()
    const { enqueueSnackbar } = useSnackbar()
    const useHcmTxtTable = useRef()
    const [newHcmItemTxt, setNewHcmItemTxt] = useState(false)
    const [editHcmItemTxt, setEditHcmItemTxt] = useState(false)
    const [newHcmItemTxtPar, setNewHcmItemTxtPar] = useState(false)
    const [editHcmItemTxtPar, setEditHcmItemTxtPar] = useState(false)
    const HOTEL_INFO = 'HOTEL_INFO'

    const createHotelInfo = () => {
        return new Promise((resolve) => {
            Insert({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEM,
                token: token,
                data: {
                    code: HOTEL_INFO,
                    description: 'Hotel Info',
                    isactive: true,
                    isdef: true,
                    hotelrefno: companyId,
                },
            }).then((hcmItemResponse) => {
                let hcmItemResponseData = hcmItemResponse.data
                if (hcmItemResponseData.count > 0) {
                    resolve(hcmItemResponseData.data.id)
                }
            })
        })
    }

    const getHotelInfo = () =>{
        return new Promise( (resolve) => {
            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: 'hcmitem/list',
                token,
                params: {
                    query: `code::${HOTEL_INFO},isactive:true,isdef:true`,
                    hotelrefno: companyId,
                },
            }).then(async (hcmItemResponse) => {
                let hcmItemResponseData = hcmItemResponse.data
                if (hcmItemResponseData.count > 0) {
                    resolve(hcmItemResponseData.data[0].id)
                } else {
                    let hcmItemId = await createHotelInfo()
                    resolve(hcmItemId)
                }
            })
        })
    }

    const getHcmItemTxtPar = (hcmTxtID, hcmTxtIndex) => {
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMITEMTXTPAR,
            token: token,
            params: {
                query: `itemid:${hcmTxtID}`,
                sort: 'seccode',
                hotelrefno: companyId,
            },
        }).then((res) => {
            if (res.status === 200) {
                setToState('registerStepper', ['hcmItemTxt', String(hcmTxtIndex), 'hcmItemTxtPar'], res.data.data)
            } else {
                const retErr = isErrorMsg(res)
                showError(retErr.errorMsg)
            }
        })
    }

    const getHcmItemTxt = (hcmItemId) => {
        setDescriptionInitialized(true)
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMITEMTXT,
            token: token,
            params: {
                query: `itemid:${hcmItemId}`,
                sort: 'id',
                hotelrefno: Number(companyId),
            },
        }).then((hcmItemTxtResponse) => {
            if (hcmItemTxtResponse.status === 200) {
                setToState('registerStepper', ['hcmItemTxt'], hcmItemTxtResponse.data.data)
                if (hcmItemTxtResponse.data.data.length > 0) {
                    getHcmItemTxtPar(hcmItemTxtResponse.data.data[0].id, '0')
                    setDescriptionInitialized(false)
                }else{
                    setDescriptionInitialized(false)
                }
            }
        })
    }

    useEffect(() => {
        let active = true
        if (active) {

            if (!state.hcmItemTxt.length > 0) {
                (async function hcmItemTextLoad() {
                    let hcmItemId = await getHotelInfo();
                    setToState('registerStepper', ['hcmItemID'], hcmItemId)
                    getHcmItemTxt(hcmItemId)
                })()
            }
        }
        return () => {
            active = false
        }
    }, [])

    useEffect(() => {
        if (state.hcmItemTxt[state.descriptionTabIndex]) {
            if (!state.hcmItemTxt[state.descriptionTabIndex].hcmItemTxtPar) {
                getHcmItemTxtPar(state.hcmItemTxt[state.descriptionTabIndex].id, state.descriptionTabIndex)
            }
        }
    }, [state.descriptionTabIndex])

    const handleItemTxtDelete = () => {
        Delete({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMITEMTXT,
            token: token,
            gid: state.hcmItemTxt[state.descriptionTabIndex].gid,
            params: {
                hotelrefno: Number(companyId),
            },
        }).then((hcmItemTxtDelResponse) => {
            if (hcmItemTxtDelResponse.status === 200) {
                getHcmItemTxt(state.hcmItemID)
                setToState('registerStepper', ['descriptionTabIndex'], 0)
            }
        })
    }

    return (
        <React.Fragment>
            {newHcmItemTxt && (
                <NewHcmItemTxt
                    open={newHcmItemTxt}
                    onClose={(status) => setNewHcmItemTxt(status)}
                    itemID={state.hcmItemID && state.hcmItemID}
                    useCallBack={()=> [getHcmItemTxt(state.hcmItemID), setToState('registerStepper', ['descriptionTabIndex'], state.hcmItemTxt.length)]}
                />
            )}
            {editHcmItemTxt && (
                <EditHcmItemTxt
                    open={editHcmItemTxt}
                    onClose={(status) => setEditHcmItemTxt(status)}
                    groupIndex={state.descriptionTabIndex}
                    useCallBack={()=> [getHcmItemTxt(state.hcmItemID), setToState('registerStepper', ['descriptionTabIndex'], state.descriptionTabIndex)]}
                />
            )}
            {newHcmItemTxtPar && (
                <NewHcmItemTxtPar
                    open={newHcmItemTxtPar}
                    onClose={(status) => setNewHcmItemTxtPar(status)}
                    groupIndex={state.descriptionTabIndex}
                    itemID={state.hcmItemTxt && state.hcmItemTxt[state.descriptionTabIndex].id}
                    useCallBack={()=> getHcmItemTxtPar(state.hcmItemTxt && state.hcmItemTxt[state.descriptionTabIndex].id, state.descriptionTabIndex)}
                />)}
            {editHcmItemTxtPar && (
                <EditHcmItemTxtPar
                    open={editHcmItemTxtPar}
                    onClose={(status) => setEditHcmItemTxtPar(status)}
                    groupIndex={state.descriptionTabIndex}
                    itemIndex={editHcmItemTxtPar}
                />)}
            <Grid container>
                <Grid item xs={12}>
                    <div className={classes.table}>
                        <MaterialTable
                            title={
                                <Grid container direction="row" justify="center" alignItems="center">
                                    <Grid item>
                                        <TextField
                                            style={{
                                                minWidth: 200,
                                                width: 200,
                                            }}
                                            id="category-select"
                                            label={t('str_category')}
                                            select
                                            value={state.descriptionTabIndex}
                                            onChange={(event) => setToState('registerStepper', ['descriptionTabIndex'], event.target.value)}
                                        >
                                            {state.hcmItemTxt && state.hcmItemTxt.map((data, ind) => {
                                                return (
                                                    <MenuItem key={ind} value={ind}>{data.catdesc} [{data.langcode}]</MenuItem>
                                                )
                                            })}
                                        </TextField>
                                    </Grid>
                                    <Grid item>
                                        <IconButton
                                            style={{ marginTop: 15 }}
                                            onClick={()=> setNewHcmItemTxt(true)}>
                                            <AddIcon fontSize="small"/>
                                        </IconButton>
                                    </Grid>
                                    <Grid item>
                                        <IconButton
                                            disabled={state.hcmItemTxt && !state.hcmItemTxt.length > 0}
                                            style={{ marginTop: 15 }}
                                            onClick={()=> setEditHcmItemTxt(true)}>
                                            <EditIcon fontSize="small"/>
                                        </IconButton>
                                    </Grid>
                                    <Grid item>
                                        <IconButton
                                            disabled={state.hcmItemTxt && !state.hcmItemTxt.length > 0}
                                            style={{ marginTop: 15 }}
                                            onClick={()=> handleItemTxtDelete()}>
                                            <DeleteIcon fontSize="small"/>
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            }
                            localization={{
                                body: {
                                    emptyDataSourceMessage: t('str_noRecords'),
                                    addTooltip: t('str_add'),
                                    deleteTooltip: t('str_delete'),
                                    editTooltip: t('str_edit'),
                                    filterRow: {
                                        filterTooltip: t('str_filter')
                                    },
                                    editRow: {
                                        deleteText: t('str_confirmDeleteRecord'),
                                        cancelTooltip: t('str_cancel'),
                                        saveTooltip: t('str_save')
                                    }
                                },
                                toolbar: {
                                    searchTooltip: t('str_search'),
                                    searchPlaceholder: t('str_search')
                                },
                                pagination: {
                                    labelRowsSelect: t('str_line'),
                                    labelDisplayedRows: t('str_labelDisplayedRows'),
                                    firstTooltip: t('str_firstPage'),
                                    previousTooltip: t('str_previousPage'),
                                    nextTooltip: t('str_nextPage'),
                                    lastTooltip: t('str_lastPage')
                                }
                            }}
                            tableRef={useHcmTxtTable}
                            options={{ search: false }}
                            isLoading={descriptionInitialized}
                            columns={[
                                { title: 'Section', field: 'secdesc'},
                                { title: 'Title', field: 'title'},
                                { title: 'Description', field: 'itemtext',
                                    render: props => (
                                        <Typography style={{ maxWidth: 400 }} noWrap>
                                            <div dangerouslySetInnerHTML={{__html: props.itemtext && props.itemtext.replace(/<[^>]*>?/gm, '')}} />
                                        </Typography>
                                    ),
                                }
                            ]}
                            actions={[
                                {
                                    icon: 'add',
                                    tooltip: 'Add New Text',
                                    isFreeAction: true,
                                    onClick: () => setNewHcmItemTxtPar(true),
                                },
                                {
                                    icon: 'edit',
                                    onClick: () => {}
                                },
                            ]}
                            editable={{
                                isEditHidden: () => true,
                                isDeleteHidden: () => true,
                                onRowDelete: (oldData) =>
                                    new Promise((resolve) => {
                                        Delete({
                                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                                            endpoint:  OREST_ENDPOINT.HCMITEMTXTPAR,
                                            token,
                                            gid: oldData.gid,
                                            params: {
                                                hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
                                            },
                                        }).then((roomDelResponse) => {
                                            if (roomDelResponse.status === 200 && roomDelResponse.data.count > 0) {
                                                getHcmItemTxtPar(state.hcmItemTxt && state.hcmItemTxt[state.descriptionTabIndex].id, state.descriptionTabIndex)
                                                enqueueSnackbar('The text you selected has been deleted.', { variant: 'success' })
                                                resolve()
                                            } else {
                                                enqueueSnackbar(roomDelResponse.data.message, { variant: 'warning' })
                                                resolve()
                                            }
                                        })
                                    }),
                            }}
                            components={{
                                Action: props => (
                                    props.action.icon === 'edit' ?
                                        <div className={classes.roomtypeCtxMenu}>
                                            <PopupState variant="popover" popupId="hcmTxtItemPar-ctx">
                                                {(popupState) => (
                                                    <React.Fragment>
                                                        <IconButton
                                                            aria-label="more"
                                                            aria-controls="long-menu"
                                                            aria-haspopup="true"
                                                            {...bindTrigger(popupState)}
                                                        >
                                                            <MoreVertIcon/>
                                                        </IconButton>
                                                        <Menu {...bindMenu(popupState)}>
                                                            <MenuItem onClick={() => {
                                                                popupState.close()
                                                                setEditHcmItemTxtPar(String(props.data.tableData.id))
                                                            }}>
                                                                Edit
                                                            </MenuItem>
                                                            <MenuItem onClick={() => {
                                                                popupState.close()
                                                                useHcmTxtTable.current.dataManager.changeRowEditing(props.data, 'delete')
                                                                useHcmTxtTable.current.setState({
                                                                    ...useHcmTxtTable.current.dataManager.getRenderState(),
                                                                    showAddRow: false,
                                                                })
                                                            }}>
                                                                Delete
                                                            </MenuItem>
                                                        </Menu>
                                                    </React.Fragment>
                                                )}
                                            </PopupState>
                                        </div> : <MTableAction {...props}/>
                                ),
                            }}
                            data={
                                state.hcmItemTxt &&
                                state.hcmItemTxt.length > 0 &&
                                state.hcmItemTxt[state.descriptionTabIndex] &&
                                state.hcmItemTxt[state.descriptionTabIndex].hcmItemTxtPar || []
                            }
                        />
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

export default connect(mapStateToProps, mapDispatchToProps)(Description)