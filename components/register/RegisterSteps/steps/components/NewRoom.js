import React, { useContext, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useRouter } from 'next/router'
import { pushToState, setToState, updateState } from 'state/actions'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import AddIcon from '@material-ui/icons/AddCircle'
import useNotifications from 'model/notification/useNotifications'
import Grid from '@material-ui/core/Grid'
import { isErrorMsg, OREST_ENDPOINT } from 'model/orest/constants'
import { Insert, ViewList } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import { RoomCountSearch } from '../../../../../model/orest/components/Room'
import { RoomTypePatch } from '../../../../../model/orest/components/RoomType'
import useTranslation from '../../../../../lib/translations/hooks/useTranslation'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        height: '100%',
        maxHeight: '365px',
    },
    formControl: {
        minWidth: '100%',
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
}))

const NewRoom = (props) => {
    const { t } = useTranslation()
    const cls = useStyles()
    const { state, setToState, pushToState, data, index } = props
    const { showSuccess, showError } = useNotifications()
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    //state
    const [open, setOpen] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const [roomNo, setRoomNo] = useState('')
    const [description, setDescription] = useState('')

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleChangeRoomNo = (event) => {
        setRoomNo(event.target.value)
    }

    const handleChangeDescription = (event) => {
        setDescription(event.target.value)
    }

    const handleSave = () => {
        setIsAdding(true)

        Insert({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.ROOM,
            token: token,
            data: {
                roomno: roomNo,
                description: description,
                roomtypeid: data.id,
                hotelrefno: Number(companyId),
            },
        }).then((res1) => {
            if (res1.status === 200) {
                handleClose()
                setIsAdding(false)
                setRoomNo('')
                setDescription('')

                const query = 'roomtypeid:' + data.id
                return RoomCountSearch(GENERAL_SETTINGS.OREST_URL, token, companyId, query).then((res2) => {
                    if (res2.status === 200) {
                        let body
                        if (res2.data.data > data.totalroom) {
                            setToState('registerStepper', ['roomTypes', String(index), 'totalroom'], res2.data.data)
                            body = { totalRoom: res2.data.data }
                        } else {
                            body = { totalRoom: data.totalroom }
                        }
                        return RoomTypePatch(GENERAL_SETTINGS.OREST_URL, token, companyId, data.gid, body).then(
                            (res3) => {
                                if (res3.status === 200) {
                                    return ViewList({
                                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                                        endpoint: OREST_ENDPOINT.ROOM,
                                        token: token,
                                        params: {
                                            query: 'id:' + res1.data.data.id,
                                            hotelrefno: companyId,
                                        },
                                    }).then((res4) => {
                                        if (res4.status === 200 && res4.data.count > 0) {
                                            showSuccess('Room added successfully')
                                            if (state.roomTypes[index].rooms) {
                                                pushToState(
                                                    'registerStepper',
                                                    ['roomTypes', String(index), 'rooms'],
                                                    [res4.data.data[0]]
                                                )
                                            } else {
                                                setToState(
                                                    'registerStepper',
                                                    ['roomTypes', String(index), 'rooms'],
                                                    [res4.data.data[0]]
                                                )
                                            }
                                        } else {
                                            const retErr = isErrorMsg(res4)
                                            showError(retErr.errorMsg)
                                        }
                                    })
                                } else {
                                    const retErr = isErrorMsg(res3)
                                    showError(retErr.errorMsg)
                                }
                            }
                        )
                    } else {
                        const retErr = isErrorMsg(res2)
                        showError(retErr.errorMsg)
                    }
                })
            } else {
                const retErr = isErrorMsg(res1)
                showError('Could not added! ' + retErr.errorMsg)
                setIsAdding(false)
            }
        })
    }

    return (
        <React.Fragment>
            <Tooltip style={{ verticalAlign: 'super', marginRight: 4 }} title="Add Room">
                <span>
                    <IconButton size={'small'} onClick={handleClickOpen}>
                        <AddIcon fontSize={'default'} />
                    </IconButton>
                </span>
            </Tooltip>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{t('str_addRoom')}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={1} style={{ width: 380 }}>
                        <Grid item xs={12}>
                            <TextField
                                required
                                margin="dense"
                                name="room no"
                                label="Room No"
                                type="text"
                                fullWidth
                                value={roomNo}
                                onChange={handleChangeRoomNo}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                margin="dense"
                                name="description"
                                label="Description"
                                type="text"
                                fullWidth
                                value={description}
                                onChange={handleChangeDescription}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        {t('str_cancel')}
                    </Button>
                    <Button onClick={handleSave} disabled={isAdding} color="primary">
                        {t('str_save')}
                    </Button>
                </DialogActions>
            </Dialog>
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
})

export default connect(mapStateToProps, mapDispatchToProps)(NewRoom)
