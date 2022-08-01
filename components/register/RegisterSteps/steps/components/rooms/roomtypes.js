import React, { useRef, useContext, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { useRouter } from 'next/router'
import { deleteFromState, pushToState, setToState, updateState } from 'state/actions'
import { ViewList, Insert, Delete, Patch, UseOrest } from '@webcms/orest'
import { Typography, Checkbox, Tooltip } from '@material-ui/core'
import { Check, Close } from '@material-ui/icons'
import MaterialTable, { MTableAction } from 'material-table'
import NewRoomAttr from 'components/register/RegisterSteps/steps/components/NewRoomAttr'
import RoomTypeSliderFrame from './roomtype-slider-frame'
import { useSnackbar } from 'notistack'
import useTranslation from 'lib/translations/hooks/useTranslation'
import WebCmsGlobal from 'components/webcms-global'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import IconButton from '@material-ui/core/IconButton'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state'
import { makeStyles } from '@material-ui/core/styles'
import RoomTypeFeatures from './roomtype-features'

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

const RoomTypes = (props) => {
    const classes = useStyles()
    const { state, setToState, pushToState } = props
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const { t } = useTranslation()
    const [roomTypesInitialized, setRoomTypesInitialized] = useState(false)
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { enqueueSnackbar } = useSnackbar()

    const [roomListIsLoading, setRoomListIsLoading] = useState(false)
    const [newRoomAttr, setNewRoomAttr] = useState(false)
    const [roomTypeMid, setRoomTypeMid] = useState(false)
    const [roomTypeRoomGid, setRoomTypeRoomGid] = useState(false)
    const useRoomTypeTable = useRef()

    const getRoomTypeList = () => {
        setRoomTypesInitialized(true)
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'roomtype',
            token: token,
            params: {
                hotelrefno: companyId,
            },
        }).then((roomTypeViewListResponse) => {
            if (roomTypeViewListResponse.status === 200 && roomTypeViewListResponse.data.count > 0) {
                setRoomTypesInitialized(false)
                setToState('registerStepper', ['roomTypes'], roomTypeViewListResponse.data.data)
                getRoomList(0, roomTypeViewListResponse.data.data[0].id)
            } else {
                setRoomTypesInitialized(false)
                enqueueSnackbar(roomTypeViewListResponse.data.message || roomTypeViewListResponse.data.error_description, { variant: 'warning' })
            }
        })
    }

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
                enqueueSnackbar(roomListResponse.data.message || roomListResponse.data.error_description, { variant: 'warning' })
            }
        })
    }

    useEffect(() => {
        let active = true
        if (active) {

            if (!state.roomTypes.length > 0) {
                getRoomTypeList()
                if (state.roomTypes.length > 0) {
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
                                setToState('registerStepper', ['roomBedTypes'], roomBtViewListResponse.data.data)
                            } else {
                                enqueueSnackbar(roomBtViewListResponse.data.message || roomTypeViewListResponse.data.error_description, { variant: 'warning' })
                            }
                        }
                    })
                }
            }
        }
        return () => {
            active = false
        }
    }, [])

    const statusIconRender = (status) => {
        if (status) return <Check/>
        return <Close/>
    }

    return (
        <React.Fragment>
            {roomTypeMid && (<RoomTypeSliderFrame open={Boolean(roomTypeMid)} masterid={roomTypeMid || false}
                                                  onClose={(status) => setRoomTypeMid(status)}/>)}
            {roomTypeRoomGid && (<RoomTypeFeatures open={Boolean(roomTypeRoomGid)} roomGid={roomTypeRoomGid}
                                                   onClose={(status) => setRoomTypeRoomGid(status)}/>)}
            {newRoomAttr && (<NewRoomAttr open={Boolean(newRoomAttr)} onClose={(status) => setNewRoomAttr(status)}/>)}

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
                    tableRef={useRoomTypeTable}
                    options={{ search: false }}
                    isLoading={roomListIsLoading || roomTypesInitialized}
                    title=""
                    columns={[
                        {
                            title: 'Code', field: 'code',
                            render: props => (
                                <Typography style={{ maxWidth: 150 }} noWrap>
                                    {props.code}
                                </Typography>
                            ),
                        },
                        {
                            title: 'Title', field: 'description',
                            render: props => (
                                <Typography style={{ maxWidth: 150 }} noWrap>
                                    {props.description}
                                </Typography>
                            ),
                        },
                        {
                            title: 'Description', field: 'shorttext',
                            render: props => (
                                <Tooltip title={props.shorttext} interactive>
                                    <Typography style={{ maxWidth: 150 }} noWrap>
                                        {props.shorttext}
                                    </Typography>
                                </Tooltip>
                            ),
                        },
                        { title: 'Total Pax', field: 'totalpax', type: 'numeric' },
                        { title: 'Total Child', field: 'totalchd', type: 'numeric' },
                        { title: 'Total Bed', field: 'totalbed', type: 'numeric' },
                        {
                            title: 'Total Room',
                            field: 'totalroom',
                            type: 'numeric',
                            render: props => (
                                <Typography>{props.totalroom > 0 ? props.totalroom : 1}</Typography>
                            )
                        },
                        {
                            title: 'Got Bed', field: 'isroom', type: 'numeric',
                            render: props => (
                                statusIconRender(props.isroom)
                            ),
                            editComponent: props => (
                                <Checkbox
                                    checked={props.value}
                                    onChange={e => props.onChange(e.target.checked)}
                                    inputProps={{ 'aria-label': 'primary checkbox' }}
                                />
                            ),
                        },
                    ]}
                    data={state.roomTypes && state.roomTypes.length > 0 && state.roomTypes || []}
                    actions={[
                        {
                            icon: 'category',
                            tooltip: 'Add New Feature',
                            isFreeAction: true,
                            onClick: () => setNewRoomAttr(true),
                        },
                        {
                            icon: 'edit',
                            onClick: () => {}
                        },
                    ]}
                    components={{
                        Action: props => (
                            props.action.icon === 'edit' ?
                                <div className={classes.roomtypeCtxMenu}>
                                    <PopupState variant="popover" popupId="roomrtypes-ctx">
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
                                                        useRoomTypeTable.current.dataManager.changeRowEditing(props.data, 'update')
                                                        useRoomTypeTable.current.setState({
                                                            ...useRoomTypeTable.current.dataManager.getRenderState(),
                                                            showAddRow: false,
                                                        })
                                                    }}>
                                                        Edit
                                                    </MenuItem>
                                                    <MenuItem onClick={() => {
                                                        popupState.close()
                                                        useRoomTypeTable.current.dataManager.changeRowEditing(props.data, 'delete')
                                                        useRoomTypeTable.current.setState({
                                                            ...useRoomTypeTable.current.dataManager.getRenderState(),
                                                            showAddRow: false,
                                                        })
                                                    }}>
                                                        Delete
                                                    </MenuItem>
                                                    <MenuItem onClick={() => {
                                                        popupState.close()
                                                        setRoomTypeMid(props.data.mid)
                                                    }}>
                                                        Slider
                                                    </MenuItem>
                                                    <MenuItem onClick={() => {
                                                        popupState.close()
                                                        setRoomTypeRoomGid(props.data.roomgid)
                                                    }}>
                                                        Features
                                                    </MenuItem>
                                                </Menu>
                                            </React.Fragment>
                                        )}
                                    </PopupState>
                                </div> : <MTableAction {...props}/>
                        ),
                    }}
                    editable={{
                        isEditHidden: () => true,
                        isDeleteHidden: () => true,
                        onRowAdd: newData =>
                            new Promise((resolve) => {
                                Insert({
                                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                                    endpoint: 'roomtype',
                                    token: token,
                                    data: {
                                        code: newData.code,
                                        description: newData.description,
                                        shorttext: newData.shorttext,
                                        totalpax: newData.totalpax,
                                        totalchd: newData.totalchd,
                                        totalbed: newData.totalbed,
                                        isroom: newData.isroom,
                                        hotelrefno: Number(companyId),
                                    },
                                }).then((roomInsResponse) => {
                                    if (roomInsResponse.status === 200) {
                                        getRoomTypeList()
                                        enqueueSnackbar('New room type added.', { variant: 'success' })
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
                                    endpoint: 'roomtype',
                                    token: token,
                                    gid: newData.gid,
                                    data: {
                                        code: newData.code,
                                        description: newData.description,
                                        shorttext: newData.shorttext,
                                        totalpax: newData.totalpax,
                                        totalchd: newData.totalchd,
                                        totalbed: newData.totalbed,
                                        isroom: newData.isroom,
                                    },
                                }).then((roomPatchResponse) => {
                                    if (roomPatchResponse.status === 200 && roomPatchResponse.data.count > 0) {
                                        UseOrest({
                                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                                            endpoint: 'roomtype/view/getbyid',
                                            token,
                                            params: {
                                                key: oldData.id,
                                                chkselfish: false,
                                            },
                                        }).then((roomViewResponse) => {
                                            if (roomViewResponse.status === 200 && roomViewResponse.data.count > 0) {
                                                setToState('registerStepper', ['roomTypes', String(oldData.tableData.id), 'code'], roomViewResponse.data.data.code)
                                                setToState('registerStepper', ['roomTypes', String(oldData.tableData.id), 'description'], roomViewResponse.data.data.description)
                                                setToState('registerStepper', ['roomTypes', String(oldData.tableData.id), 'shorttext'], roomViewResponse.data.data.shorttext)
                                                setToState('registerStepper', ['roomTypes', String(oldData.tableData.id), 'totalpax'], roomViewResponse.data.data.totalpax)
                                                setToState('registerStepper', ['roomTypes', String(oldData.tableData.id), 'totalchd'], roomViewResponse.data.data.totalchd)
                                                setToState('registerStepper', ['roomTypes', String(oldData.tableData.id), 'totalbed'], roomViewResponse.data.data.totalbed)
                                                setToState('registerStepper', ['roomTypes', String(oldData.tableData.id), 'isroom'], roomViewResponse.data.data.isroom)
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
                                    endpoint: 'roomtype',
                                    token,
                                    gid: oldData.gid,
                                    params: {
                                        hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
                                    },
                                }).then((roomDelResponse) => {
                                    if (roomDelResponse.status === 200 && roomDelResponse.data.count > 0) {
                                        getRoomTypeList()
                                        enqueueSnackbar('The room type you selected has been deleted.', { variant: 'success' })
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

export default connect(mapStateToProps, mapDispatchToProps)(RoomTypes)
