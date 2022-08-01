import axios from 'axios'
import React, { useContext, useState } from 'react'
import { CircularProgress, IconButton } from '@material-ui/core'
import { Delete } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'
import WebCmsGlobal from 'components/webcms-global'
import { connect, useSelector } from 'react-redux'
import { setToState, updateState } from 'state/actions'
import useTranslation from 'lib/translations/hooks/useTranslation'
import useNotifications from 'model/notification/useNotifications'

const useStyles = makeStyles((theme) => ({
    deleteRoomWrapper: {
        position: 'relative',
    },
    deleteRoomProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
}))

const DeleteRoom = (props) => {
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const classes = useStyles()
    const { gid, state, setToState, ind, updateState } = props
    const [deleteRoomStatus, setDeleteRoomStatus] = useState(false)
    const { t } = useTranslation()
    const { showSuccess, showError } = useNotifications()

    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)

    let clientParams = {}
    clientParams.hotelrefno = loginfo && loginfo.hotelrefno || GENERAL_SETTINGS.HOTELREFNO

    if(loginfo && loginfo.hotelgidstr){
        clientParams.hoteltoken = loginfo && loginfo.hotelgidstr
    }

    const handleDeleteRoom = (gid) => {
        setDeleteRoomStatus(true)
        if (gid) {
            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/ors/room/delete',
                method: 'post',
                params: Object.assign(clientParams, {
                    gid: gid,
                }),
            }).then((deleteRoomResponse) => {
                const roomResponse = deleteRoomResponse.data
                if (roomResponse.success && roomResponse.count > 0) {
                    let listOfSelectedRooms = state.listOfSelectedRooms
                    const roomIndex = listOfSelectedRooms.roomList.findIndex((item) => item.gid === String(gid))
                    if (roomIndex > -1) {
                        let newRoomData = state.listOfSelectedRooms.roomList
                        newRoomData.splice(roomIndex, 1)
                        setToState('ibe', ['listOfSelectedRooms', 'roomList'], newRoomData)
                        if (state.listOfSelectedRooms && !state.listOfSelectedRooms.roomList.length > 0) {
                            updateState('ibe', 'reservationConfirmDialog', false)
                        }
                    }
                    showSuccess(t('str_deleteRoomSuccess'))
                } else {
                    setDeleteRoomStatus(false)
                    showError(t('str_deleteRoomError'))
                }
            })
        } else {
            setDeleteRoomStatus(false)
            showSuccess(t('str_unexpectedProblem'))
        }
    }

    return (
        <React.Fragment>
            {gid ? (
                <div className={classes.deleteRoomWrapper}>
                    <IconButton
                        disabled={deleteRoomStatus}
                        edge="end"
                        aria-label="delete"
                        size="small"
                        onClick={() => handleDeleteRoom(gid)}
                    >
                        <Delete fontSize="inherit" />
                    </IconButton>
                    {deleteRoomStatus && (
                        <CircularProgress size={24} className={classes.deleteRoomProgress} color="primary" />
                    )}
                </div>
            ) : null}
        </React.Fragment>
    )
}

DeleteRoom.propTypes = {}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.ibe,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(DeleteRoom)
