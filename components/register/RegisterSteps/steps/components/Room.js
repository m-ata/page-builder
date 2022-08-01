import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'
import { connect } from 'react-redux'
import { deleteFromState, pushToState, setToState, updateState } from '../../../../../state/actions'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import { makeStyles } from '@material-ui/core/styles'
import Input from '@material-ui/core/Input'
import Checkbox from '@material-ui/core/Checkbox'
import ListItemText from '@material-ui/core/ListItemText'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import DeleteIcon from '@material-ui/icons/Delete'
import { RoomCountSearch, RoomDelete, RoomFullRoomAttr, RoomPatch } from '../../../../../model/orest/components/Room'
import { useRouter } from 'next/router'
import { RoomPropDelete } from '../../../../../model/orest/components/RoomProp'
import EditRoom from './EditRoom'
import LoadingSpinner from '../../../../LoadingSpinner'
import useNotifications from '../../../../../model/notification/useNotifications'
import NewRoomBt from './NewRoomBt'
import NewRoomAttr from './NewRoomAttr'
import { isErrorMsg, OREST_ENDPOINT } from '../../../../../model/orest/constants'
import { Insert } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import useTranslation from 'lib/translations/hooks/useTranslation'

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(0),
        width: 490,
    },
    addBedType: {
        '&::before': {
            left: 0,
            right: 0,
            bottom: 0,
            content: '"\\00a0"',
            position: 'absolute',
            transition: 'border-bottom-color 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
            borderBottom: '1px solid rgba(0, 0, 0, 0.42)',
            pointerEvents: 'non',
        },
    },
}))

const ITEM_HEIGHT = 30
const ITEM_PADDING_TOP = 5
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 7.7 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
}

const Room = (props) => {
    const { t } = useTranslation()
    const classes = useStyles()
    const { state, setToState, deleteFromState, roomTypeIndex, room, roomIndex, isRoom } = props
    const { showSuccess, showError } = useNotifications()
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const activeBedroom = state.bedRooms
    const [isDeleting, setIsDeleting] = useState(false)
    const [isRoomPropsInitialized, setIsRoomPropsInitialized] = useState(false)
    const [isRoomHover, setIsRoomHover] = useState(false)
    const [isBedTypeHover, setIsBedTypeHover] = useState(false)
    const [isRoomPropertiesHover, setIsRoomPropertiesHover] = useState(false)
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    useEffect(() => {
        let active = true
        if (active) {
            if (room && !isRoomPropsInitialized) {
                if (!room.roomProps) {
                    RoomFullRoomAttr(GENERAL_SETTINGS.OREST_URL, token, companyId, room.gid).then((r) => {
                        if (active) {
                            if (r.status === 200 && r.data.count > 0) {
                                setIsRoomPropsInitialized(true)
                                setToState(
                                    'registerStepper',
                                    ['roomTypes', String(roomTypeIndex), 'rooms', String(roomIndex), 'roomProps'],
                                    r.data.data
                                )
                                const data = []
                                r.data.data.map((e) => {
                                    if (e.ischk) {
                                        data.push(e)
                                    }
                                })
                                setToState(
                                    'registerStepper',
                                    ['roomTypes', String(roomTypeIndex), 'rooms', String(roomIndex), 'activeRoomProps'],
                                    data
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
    }, [room])

    const handleBedTypeOnChange = (event) => {
        try {
            const body = { bedTypeId: event.target.value, extraBed: event.currentTarget.getAttribute('pax') }
            return RoomPatch(GENERAL_SETTINGS.OREST_URL, token, companyId, room.gid, body).then((r) => {
                if (r.status === 200) {
                    setToState(
                        'registerStepper',
                        ['roomTypes', String(roomTypeIndex), 'rooms', String(roomIndex), 'bedtypeid'],
                        r.data.data.bedtypeid
                    )
                    setToState(
                        'registerStepper',
                        ['roomTypes', String(roomTypeIndex), 'rooms', String(roomIndex), 'extrabed'],
                        r.data.data.extrabed
                    )
                } else {
                    const retErr = isErrorMsg(r)
                    showError(retErr.errorMsg)
                }
            })
        } catch (error) {
            showError(error)
        }
    }

    const handleNumberOfBedsOnChange = (event) => {
        const value = event.target.value
        try {
            const body = { extraBed: value }
            return RoomPatch(GENERAL_SETTINGS.OREST_URL, token, companyId, room.gid, body).then((r) => {
                if (r.status === 200) {
                    setToState(
                        'registerStepper',
                        ['roomTypes', String(roomTypeIndex), 'rooms', String(roomIndex), 'extrabed'],
                        value
                    )
                } else {
                    const retErr = isErrorMsg(r)
                    showError(retErr.errorMsg)
                }
            })
        } catch (error) {
            showError(error)
        }
    }

    const handleRoomPropertiesOnChange = (event) => {
        setToState(
            'registerStepper',
            ['roomTypes', String(roomTypeIndex), 'rooms', String(roomIndex), 'activeRoomProps'],
            event.target.value
        )
    }

    const handleRoomPropertiesOnClose = () => {
        if (room) {
            if (room.activeRoomProps) {
                const notDeleteList = []
                room.activeRoomProps.map((data, ind) => {
                    notDeleteList.push(data.attrid)
                    if (data.gid === null) {
                        Insert({
                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                            endpoint: OREST_ENDPOINT.ROOMPROP,
                            token: token,
                            data: {
                                roomid: data.locid,
                                roomattrid: data.attrid,
                                hotelrefno: Number(companyId),
                            },
                        }).then((res) => {
                            if (res.status === 200) {
                                const aRP = room.activeRoomProps[ind]
                                aRP.gid = res.data.data.gid
                                setToState(
                                    'registerStepper',
                                    [
                                        'roomTypes',
                                        String(roomTypeIndex),
                                        'rooms',
                                        String(roomIndex),
                                        'activeRoomProps',
                                        String(ind),
                                    ],
                                    aRP
                                )
                            } else {
                                const retErr = isErrorMsg(res)
                                showError(retErr.errorMsg)
                            }
                        })
                    }
                })
                room.roomProps.map((data, ind) => {
                    if (!notDeleteList.includes(data.attrid) && data.gid) {
                        RoomPropDelete(GENERAL_SETTINGS.OREST_URL, token, companyId, data.gid).then((res) => {
                            if (res.status === 200) {
                                setToState(
                                    'registerStepper',
                                    [
                                        'roomTypes',
                                        String(roomTypeIndex),
                                        'rooms',
                                        String(roomIndex),
                                        'roomProps',
                                        String(ind),
                                        'gid',
                                    ],
                                    null
                                )
                            } else {
                                const retErr = isErrorMsg(res)
                                showError(retErr.errorMsg)
                            }
                        })
                    }
                })
            }
        }
    }

    const handleDeleteRoom = (room) => {
        setIsDeleting(true)
        RoomDelete(GENERAL_SETTINGS.OREST_URL, token, companyId, room.gid).then((res1) => {
            if (res1.status === 200) {
                const query = 'roomtypeid:' + room.roomtypeid
                return RoomCountSearch(GENERAL_SETTINGS.OREST_URL, token, companyId, query).then((res2) => {
                    if (res2.status === 200) {
                        setIsDeleting(false)
                        showSuccess('Room deleted succeesfully')
                        //setToState('registerStepper', ['roomTypes', String(roomTypeIndex), 'totalroom'], res2.data.data);
                        deleteFromState(
                            'registerStepper',
                            ['roomTypes', String(roomTypeIndex), 'rooms'],
                            [String(roomIndex), 1]
                        )
                    } else {
                        setIsDeleting(false)
                        const retErr = isErrorMsg(res2)
                        showError(retErr.errorMsg)
                    }
                })
            } else {
                setIsDeleting(false)
                const retErr = isErrorMsg(res1)
                showError(retErr.errorMsg)
            }
        })
    }

    if (!room) {
        return <LoadingSpinner />
    }

    return (
        <React.Fragment>
            <Grid
                container
                style={{
                    border: '1px solid #dadde9',
                    marginBottom: '10px',
                    padding: 10,
                    paddingBottom: 12,
                    borderRadius: 5,
                    boxShadow: '0 1px 0px rgba(0,0,0,0.10), 0 1px 1px rgba(0,0,0,0.20)',
                }}
                onMouseEnter={() => {
                    setIsRoomHover(true)
                }}
                onMouseLeave={() => {
                    setIsRoomHover(false)
                }}
            >
                <Grid item xs={12} style={{ marginBottom: 12 }}>
                    <Grid container spacing={3} style={{ minHeight: 55 }}>
                        <Grid item md={4} xs={12}>
                            <Typography>
                                <span style={{ color: 'rgba(0, 0, 0, 0.54)', marginRight: 3, fontSize: '13px' }}>
                                    {t('str_roomNoWithDots')}
                                </span>
                                {room ? room.roomno : 'NewRoom'}
                            </Typography>
                        </Grid>
                        <Grid item md={4} xs={12}>
                            <Typography>
                                <span style={{ color: 'rgba(0, 0, 0, 0.54)', marginRight: 3, fontSize: '13px' }}>
                                    {t('str_description')}:
                                </span>
                                {room ? room.description : 'NewRoom'}
                            </Typography>
                        </Grid>
                        <Grid item style={{ marginLeft: 'auto', marginRight: 5 }}>
                            <EditRoom roomTypeIndex={roomTypeIndex} roomIndex={roomIndex} isVisible={isRoomHover} />
                            {isRoomHover && (
                                <Tooltip title="Delete Room">
                                    <IconButton
                                        disabled={isDeleting}
                                        size="small"
                                        onClick={() => handleDeleteRoom(room)}
                                    >
                                        <DeleteIcon fontSize={'small'} />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={3} alignItems={'flex-end'}>
                        {isRoom && (
                            <React.Fragment>
                                <Grid
                                    item
                                    xs={9}
                                    md={4}
                                    onMouseEnter={() => {
                                        setIsBedTypeHover(true)
                                    }}
                                    onMouseLeave={() => {
                                        setIsBedTypeHover(false)
                                    }}
                                >
                                    <FormControl style={{ width: '100%' }}>
                                        <InputLabel>Bed Type</InputLabel>
                                        <Select value={room ? room.bedtypeid : ''} onChange={handleBedTypeOnChange}>
                                            {state.roomBedTypes &&
                                                state.roomBedTypes.map((data, ind) => {
                                                    return (
                                                        <MenuItem
                                                            dense={true}
                                                            name={data.description}
                                                            value={data.id}
                                                            pax={data.pax}
                                                            key={'br' + activeBedroom + 'b' + data.id + 'i' + ind}
                                                        >
                                                            {data.description + ' [Pax:' + data.pax + ']'}
                                                        </MenuItem>
                                                    )
                                                })}
                                        </Select>
                                    </FormControl>
                                    <NewRoomBt isVisible={isBedTypeHover} />
                                </Grid>
                                <Grid item xs={3} md={1}>
                                    <TextField
                                        type="number"
                                        id="bathrooms"
                                        label="Beds"
                                        fullWidth
                                        onChange={handleNumberOfBedsOnChange}
                                        value={room ? room.extrabed || 0 : 0}
                                    />
                                </Grid>
                            </React.Fragment>
                        )}
                        <Grid
                            item
                            xs={12}
                            md={isRoom ? 7 : 12}
                            onMouseEnter={() => {
                                setIsRoomPropertiesHover(true)
                            }}
                            onMouseLeave={() => {
                                setIsRoomPropertiesHover(false)
                            }}
                        >
                            <FormControl className={classes.formControl} style={{ width: '100%' }}>
                                <InputLabel id="demo-mutiple-checkbox-label">Room Features</InputLabel>
                                <Select
                                    labelId="demo-mutiple-checkbox-label"
                                    id="demo-mutiple-checkbox"
                                    multiple
                                    value={room ? room.activeRoomProps || [] : []}
                                    onChange={handleRoomPropertiesOnChange}
                                    onClose={handleRoomPropertiesOnClose}
                                    input={<Input />}
                                    renderValue={(selected) => selected.map((e) => e.attrdesc).join(', ')}
                                    MenuProps={MenuProps}
                                >
                                    {room &&
                                        room.roomProps &&
                                        room.roomProps.map((data) => {
                                            return (
                                                <MenuItem
                                                    key={data.attrdesc}
                                                    value={data}
                                                    dense={true}
                                                    disableGutters={true}
                                                >
                                                    <Checkbox
                                                        checked={
                                                            room &&
                                                            room.activeRoomProps &&
                                                            room.activeRoomProps.findIndex(
                                                                (x) => x.attrid === data.attrid
                                                            ) > -1
                                                        }
                                                    />
                                                    <ListItemText primary={data.attrdesc} />
                                                </MenuItem>
                                            )
                                        })}
                                </Select>
                            </FormControl>
                            <NewRoomAttr isVisible={isRoomPropertiesHover} />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </React.Fragment>
    )
}

Room.propTypes = {
    roomTypeIndex: PropTypes.number,
    roomIndex: PropTypes.number,
    isRoom: PropTypes.bool,
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

export default connect(mapStateToProps, mapDispatchToProps)(Room)
