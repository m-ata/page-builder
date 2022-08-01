import moment from 'moment'
import axios from 'axios'
import React, { useContext, useState } from 'react'
import { Button, CircularProgress, FormControl, Grid, InputLabel, Select } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { OREST_ENDPOINT } from 'model/orest/constants'
import WebCmsGlobal from 'components/webcms-global'
import { connect, useSelector } from 'react-redux'
import { setToState, updateState } from 'state/actions'
import useNotifications from 'model/notification/useNotifications'
import useTranslation from 'lib/translations/hooks/useTranslation'

const useStyles = makeStyles((theme) => ({
    addRoom: {
        minWidth: 90,
    },
    roomSelectInput: {
        padding: 6,
    },
    formControl: {
        minWidth: 100,
    },
    addRoomWrapper: {
        position: 'relative',
    },
    addRoomProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
}))

const AddRoom = (props) => {
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const classes = useStyles()
    const { t } = useTranslation()
    const { showSuccess, showError } = useNotifications()

    const { roomtypeid, resaction, totalroom, state, setToState, updateState } = props
    const [roomQty, setRoomQty] = useState(1)
    const [addRoomStatus, setAddRoomStatus] = useState(false)
    const inputID = 'roomselect-' + roomtypeid

    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)

    let clientParams = {}
    clientParams.hotelrefno = loginfo && loginfo.hotelrefno || GENERAL_SETTINGS.HOTELREFNO

    if (loginfo && loginfo.hotelgidstr) {
        clientParams.hoteltoken = loginfo && loginfo.hotelgidstr
    }

    const roomName = (roomid) => {
        return state.roomAvailabilityList && state.roomAvailabilityList.find((item) => item.id === roomid).description
    }

    const priceCurr = (roomid) => {
        return state.roomAvailabilityList && state.roomAvailabilityList.find((item) => item.id === roomid).pricecurr
    }

    const handleAddRoom = (e) => {
        e.stopPropagation()
        if (resaction >= 0 && roomtypeid && roomQty !== 0) {
            setAddRoomStatus(true)
            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/ors/room/add',
                method: 'post',
                params: Object.assign(clientParams, {
                    ci: moment(state.selectedDate[0]).format(OREST_ENDPOINT.DATEFORMAT),
                    co: moment(state.selectedDate[1]).format(OREST_ENDPOINT.DATEFORMAT),
                    resdate: moment(moment()).format(OREST_ENDPOINT.DATEFORMAT),
                    adult: state.adult,
                    child: state.child,
                    night: state.night,
                    childages: state.childAges,
                    resaction: resaction,
                    roomtype: roomtypeid,
                    qty: roomQty,
                    agencyid: state.agencyid,
                    pricecurrid: state.currencyid,
                    searchid: state.searchid,
                }),
            }).then((addRoomResponse) => {
                const roomResponse = addRoomResponse.data
                if (roomResponse.success) {
                    let newRoomData = state.listOfSelectedRooms.roomList
                    roomResponse.data.map((item, i) => {
                        let guestList = []
                        Array.from({ length: item.totalpax }).map(() => {
                            guestList.push({
                                firstName: '',
                                firstNameError: false,
                                lastName: '',
                                lastNameError: false,
                                mail: '',
                                mailError: false,
                                birthDate: '',
                                birthDateError: false,
                            })
                        })

                        newRoomData.push({
                            gid: item.gid,
                            roomtypeid: item.roomtypeid,
                            roomtypename: roomName(item.roomtypeid),
                            pricecurr: priceCurr(item.roomtypeid),
                            reservno: item.reservno,
                            totalpax: item.totalpax,
                            totalchd: item.totalchd,
                            totalnight: item.totalnight,
                            totalprice: item.totalprice,
                            roomsearchid: roomResponse.searchid,
                            guestList: guestList,
                        })
                    })
                    setToState('ibe', ['listOfSelectedRooms', 'roomList'], newRoomData)
                    setAddRoomStatus(false)
                    showSuccess(t(roomResponse.msgcode))
                    setRoomQty(1)
                } else {
                    setAddRoomStatus(false)
                    showError(t(roomResponse.msgcode))
                }
            })
        } else {
            setAddRoomStatus(false)
        }
    }

    return (
        <Grid container spacing={3} justify="flex-end" alignItems="flex-end">
            <Grid item xs={4}>
                <FormControl size="small" variant="outlined" className={classes.formControl}>
                    <InputLabel htmlFor={inputID}>Rooms</InputLabel>
                    <Select
                        native
                        label="Rooms"
                        classes={{ select: classes.roomSelectInput }}
                        inputProps={{
                            name: 'roomselect',
                            id: inputID,
                            style: {
                                padding: 6,
                                fontSize: 16,
                                paddingLeft: '40%',
                            },
                        }}
                        value={roomQty}
                        onChange={(e) => setRoomQty(e.currentTarget.value)}
                    >
                        {Array.from({ length: totalroom }).map((qty, i) => {
                            let roomQty = i + 1
                            return (
                                <option key={roomQty} value={roomQty}>
                                    {roomQty}
                                </option>
                            )
                        })}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={4}>
                <div className={classes.addRoomWrapper}>
                    <Button
                        disabled={addRoomStatus}
                        className={classes.addRoom}
                        onClick={(e) => handleAddRoom(e)}
                        size="small"
                        variant="outlined"
                        color="primary"
                    >
                        {t('str_addRoom')}
                    </Button>
                    {addRoomStatus && (
                        <CircularProgress size={24} className={classes.addRoomProgress} color="primary"/>
                    )}
                </div>
            </Grid>
        </Grid>
    )
}

AddRoom.propTypes = {}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.ibe,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(AddRoom)
