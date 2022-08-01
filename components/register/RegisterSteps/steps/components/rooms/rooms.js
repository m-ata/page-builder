import React, { useRef, useContext, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { useRouter } from 'next/router'
import { deleteFromState, pushToState, setToState, updateState } from 'state/actions'
import { ViewList, Insert, Delete, Patch, UseOrest } from '@webcms/orest'
import { TextField } from '@material-ui/core'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MaterialTable, {MTableAction}  from 'material-table'
import NewRoomBt from 'components/register/RegisterSteps/steps/components/NewRoomBt'
import NewRoomAttr from 'components/register/RegisterSteps/steps/components/NewRoomAttr'
import { useSnackbar } from 'notistack'
import useTranslation from 'lib/translations/hooks/useTranslation'

import IconButton from '@material-ui/core/IconButton'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state'
import WebCmsGlobal from 'components/webcms-global'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
    table: {
        '& tbody>.MuiTableRow-root:hover $roomCtxMenu': {
            visibility: 'visible',
        },
    },
    roomCtxMenu: {
        visibility: 'hidden',
    },
}))

const Rooms = (props) => {
    const classes = useStyles();
    const { state, setToState, pushToState } = props
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const { t } = useTranslation()
    const [roomTypesInitialized, setRoomTypesInitialized] = useState(false)
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { enqueueSnackbar } = useSnackbar()

    const [roomListIsLoading, setRoomListIsLoading] = useState(false)
    const [newBedModal, setNewBedModal] = useState(false)
    const [newRoomAttr, setNewRoomAttr] = useState(false)
    const useRoomTable = useRef()

    const getRoomList = (index, roomTypeId) => {
        setRoomListIsLoading(true)
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'room',
            token: token,
            params: {
                query: `roomtypeid:${roomTypeId}`,
                hotelrefno: companyId,
            },
        }).then((roomListResponse) => {
            if (roomListResponse.status === 200) {
                setRoomListIsLoading(false)
                setToState('registerStepper', ['roomTypes', String(index), 'rooms'], roomListResponse.data.data)
            } else {
                setRoomListIsLoading(false)
                enqueueSnackbar(roomListResponse.data.message, { variant: 'warning' })
            }
        })
    }

    useEffect(() => {
        let active = true
        if (active) {

            if (!state.roomTypes.length > 0) {
                setRoomTypesInitialized(true)
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: 'roomtype',
                    token: token,
                    params: {
                        hotelrefno: companyId,
                    },
                }).then((roomTypeViewListResponse) => {
                    if (active) {
                        if (roomTypeViewListResponse.status === 200 && roomTypeViewListResponse.data.count > 0) {
                            setRoomTypesInitialized(false)
                            pushToState('registerStepper', ['roomTypes'], roomTypeViewListResponse.data.data)
                            getRoomList(0, roomTypeViewListResponse.data.data[0].id)
                        } else {
                            setRoomTypesInitialized(false)
                            enqueueSnackbar(roomTypeViewListResponse.data.message, { variant: 'warning' })
                        }
                    }
                })
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: 'roombt',
                    token: token,
                    params: {
                        hotelrefno: companyId,
                    },
                }).then((roomBtViewListResponse) => {
                    if (active) {
                        if (roomBtViewListResponse.status === 200) {
                            pushToState('registerStepper', ['roomBedTypes'], roomBtViewListResponse.data.data)
                        } else {
                            enqueueSnackbar(roomBtViewListResponse.data.message, { variant: 'warning' })
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
            if (state.roomTypes[state.layoutTabIndex]) {
                if (!state.roomTypes[state.layoutTabIndex].rooms) {
                    getRoomList(state.layoutTabIndex, state.roomTypes[state.layoutTabIndex].id)
                }
            }
        }

        return () => {
            active = false
        }
    }, [state.layoutTabIndex])

    const handleRoomSync = (index, roomTypeId) => {
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'roomtype/roomchk',
            method: 'post',
            token,
            params: {
                roomtypeid: roomTypeId,
                forceslider: true,
                hotelrefno: Number(companyId),
            },
        }).then((roomSyncResponse) => {
            if (roomSyncResponse.status === 200 && roomSyncResponse.data.count > 0) {
                getRoomList(String(index), roomTypeId)
                enqueueSnackbar('Sync complete for room type.', { variant: 'success' })
            } else {
                enqueueSnackbar(roomSyncResponse.data.message, { variant: 'warning' })
            }
        }).catch((error) => {
            enqueueSnackbar(error.message, { variant: 'error' })
        })
    }

    return (
        <React.Fragment>
            {newBedModal && (<NewRoomBt open={newBedModal} onClose={(status) => setNewBedModal(status)}/>)}
            {newRoomAttr && (<NewRoomAttr open={newRoomAttr} onClose={(status) => setNewRoomAttr(status)}/>)}
            <div className={classes.table}>
            <MaterialTable
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
                tableRef={useRoomTable}
                options={{ search: false }}
                isLoading={roomListIsLoading || roomTypesInitialized}
                title={
                 <TextField
                    style={{
                        minWidth: 200,
                        width: 200,
                    }}
                    id="roomtype-select"
                    label={t('str_roomTypes')}
                    select
                    value={state.layoutTabIndex}
                    onChange={(event) => setToState('registerStepper', ['layoutTabIndex'], event.target.value)}
                >
                    {state.roomTypes && state.roomTypes.map((data, ind) => {
                        return (
                            <MenuItem key={ind} value={ind}> {data.description}</MenuItem>
                        )
                    })}
                </TextField>
                }
                columns={[
                    { title: 'Room No', field: 'roomno' },
                    { title: 'Description', field: 'roomdesc' },
                    {
                        title: 'Bed Type', field: 'bedtypeid',
                        render: props => (
                            <div>{props.bedtypedesc}</div>
                        ),
                        editComponent: props => (
                            <React.Fragment>
                                <TextField
                                    fullWidth
                                    id="bedtype-select"
                                    label={''}
                                    select
                                    value={props.value}
                                    onChange={e => props.onChange(e.target.value)}
                                >
                                    {state.roomBedTypes && state.roomBedTypes.map((data, ind) => {
                                        return (
                                            <MenuItem
                                                dense={true}
                                                name={data.description}
                                                value={data.id}
                                                pax={data.pax}
                                                key={ind}
                                            >
                                                {data.description + ' [Pax:' + data.pax + ']'}
                                            </MenuItem>
                                        )
                                    })}
                                </TextField>
                            </React.Fragment>
                        ),
                    },
                    {
                        title: 'Bed Pax', field: 'bedpax',
                        editComponent: props => (<TextField id="bedpax" fullWidth disabled InputProps={{ readOnly: true }} value={props.rowData.bedpax}/>),
                    },
                    { title: 'Beds', field: 'extrabed', type: 'numeric' },
                ]}
                data={state.roomTypes && state.roomTypes[state.layoutTabIndex] && state.roomTypes[state.layoutTabIndex].rooms || []}
                actions={[
                    {
                        icon: 'hotel',
                        tooltip: 'Add Bed Type',
                        isFreeAction: true,
                        onClick: () => setNewBedModal(true),
                    },
                    {
                        icon: 'sync',
                        tooltip: 'Auto Create Rooms',
                        isFreeAction: true,
                        onClick: () => handleRoomSync(state.layoutTabIndex, state.roomTypes[state.layoutTabIndex].id),
                    },{
                        icon: 'edit',
                        onClick: () => {}
                    },
                ]}
                components={{
                    Action: props => (
                        props.action.icon === "edit" ?
                            <div className={classes.roomCtxMenu}>
                                <PopupState variant="popover" popupId="room-ctx">
                                    {(popupState) => (
                                        <React.Fragment>
                                            <IconButton
                                                aria-label="more"
                                                aria-controls="long-menu"
                                                aria-haspopup="true"
                                                {...bindTrigger(popupState)}
                                            >
                                                <MoreVertIcon />
                                            </IconButton>
                                            <Menu {...bindMenu(popupState)}>
                                                <MenuItem onClick={()=>{
                                                    popupState.close()
                                                    useRoomTable.current.dataManager.changeRowEditing(props.data, "update");
                                                    useRoomTable.current.setState({
                                                        ...useRoomTable.current.dataManager.getRenderState(),
                                                        showAddRow: false
                                                    })
                                                }}>
                                                    Edit
                                                </MenuItem>
                                                <MenuItem onClick={()=>{
                                                    popupState.close()
                                                    useRoomTable.current.dataManager.changeRowEditing(props.data, "delete");
                                                    useRoomTable.current.setState({
                                                        ...useRoomTable.current.dataManager.getRenderState(),
                                                        showAddRow: false
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
                editable={{
                    isEditHidden: ()=> true,
                    isDeleteHidden: ()=> true,
                    onRowAdd: newData =>
                        new Promise((resolve) => {
                            Insert({
                                apiUrl: GENERAL_SETTINGS.OREST_URL,
                                endpoint: 'room',
                                token: token,
                                data: {
                                    code: newData.roomno,
                                    roomno: newData.roomno,
                                    description: newData.roomdesc,
                                    bedpax: newData.bedpax,
                                    extrabed: newData.extrabed,
                                    bedtypeid: newData.bedtypeid,
                                    roomtypeid: state.roomTypes[state.layoutTabIndex].id,
                                    hotelrefno: Number(companyId),
                                },
                            }).then((roomInsResponse) => {
                                if (roomInsResponse.status === 200) {
                                    getRoomList(state.layoutTabIndex, state.roomTypes[state.layoutTabIndex].id)
                                    enqueueSnackbar('New room added.', { variant: 'success' })
                                    resolve()
                                } else {
                                    enqueueSnackbar(roomInsResponse.data.message, { variant: 'warning' })
                                    resolve()
                                }
                            })
                        }),
                    onRowUpdate: (newData, oldData) =>
                        new Promise((resolve) => {
                            Patch({
                                apiUrl: GENERAL_SETTINGS.OREST_URL,
                                endpoint: 'room',
                                token: token,
                                gid: newData.gid,
                                data: {
                                    roomno: newData.roomno,
                                    description: newData.roomdesc,
                                    bedpax: newData.bedpax,
                                    extrabed: newData.extrabed,
                                    bedtypeid: newData.bedtypeid,
                                },
                            }).then((roomPatchResponse) => {
                                if (roomPatchResponse.status === 200 && roomPatchResponse.data.count > 0) {
                                    UseOrest({
                                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                                        endpoint: 'room/view/getbyid',
                                        token,
                                        params: {
                                            key: oldData.id,
                                            chkselfish: false,
                                        },
                                    }).then((roomViewResponse) => {
                                        if (roomViewResponse.status === 200 && roomViewResponse.data.count > 0) {
                                            setToState('registerStepper', ['roomTypes', String(state.layoutTabIndex), 'rooms', String(oldData.tableData.id), 'roomno'], roomViewResponse.data.data.roomno)
                                            setToState('registerStepper', ['roomTypes', String(state.layoutTabIndex), 'rooms', String(oldData.tableData.id), 'roomdesc'], roomViewResponse.data.data.roomdesc)
                                            setToState('registerStepper', ['roomTypes', String(state.layoutTabIndex), 'rooms', String(oldData.tableData.id), 'bedpax'], roomViewResponse.data.data.bedpax)
                                            setToState('registerStepper', ['roomTypes', String(state.layoutTabIndex), 'rooms', String(oldData.tableData.id), 'extrabed'], roomViewResponse.data.data.extrabed)
                                            setToState('registerStepper', ['roomTypes', String(state.layoutTabIndex), 'rooms', String(oldData.tableData.id), 'bedtypeid'], roomViewResponse.data.data.bedtypeid)
                                            setToState('registerStepper', ['roomTypes', String(state.layoutTabIndex), 'rooms', String(oldData.tableData.id), 'bedtypedesc'], roomViewResponse.data.data.bedtypedesc)
                                            enqueueSnackbar('Update complete for room.', { variant: 'success' })
                                            resolve()
                                        } else {
                                            resolve()
                                        }
                                    })
                                } else {
                                    enqueueSnackbar(roomPatchResponse.data.message, { variant: 'warning' })
                                    resolve()
                                }
                            })
                        }),
                    onRowDelete: (oldData) =>
                        new Promise((resolve) => {
                            Delete({
                                apiUrl: GENERAL_SETTINGS.OREST_URL,
                                endpoint: 'room',
                                token,
                                gid: oldData.gid,
                                params: {
                                    hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
                                },
                            }).then((roomDelResponse) => {
                                if (roomDelResponse.status === 200 && roomDelResponse.data.count > 0) {
                                    getRoomList(state.layoutTabIndex, oldData.roomtypeid)
                                    enqueueSnackbar('The room you selected has been deleted.', { variant: 'success' })
                                    resolve()
                                } else {
                                    enqueueSnackbar(roomDelResponse.data.message, { variant: 'warning' })
                                    resolve()
                                }
                            })
                        }),
                }}
            />
            </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(Rooms)
