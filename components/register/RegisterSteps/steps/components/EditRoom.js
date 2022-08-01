import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import { useRouter } from 'next/router'
import { pushToState, setToState, updateState } from '../../../../../state/actions'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import IconButton from '@material-ui/core/IconButton'
import EditIcon from '@material-ui/icons/Edit'
import Tooltip from '@material-ui/core/Tooltip'
import { RoomPatch } from '../../../../../model/orest/components/Room'
import useNotifications from '../../../../../model/notification/useNotifications'
import { isErrorMsg } from '../../../../../model/orest/constants'
import WebCmsGlobal from 'components/webcms-global'
import useTranslation from 'lib/translations/hooks/useTranslation'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        height: '100%',
        maxHeight: '365px',
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
}))

const EditRoom = (props) => {
    const cls = useStyles()
    const { state, roomTypeIndex, roomIndex, setToState, isVisible } = props
    const { showSuccess, showError } = useNotifications()
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const { t } = useTranslation()
    const [code, setCode] = useState(state.roomTypes[roomTypeIndex].rooms[roomIndex].roomno)
    const [description, setDescription] = useState(state.roomTypes[roomTypeIndex].rooms[roomIndex].description)
    const [open, setOpen] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleCodeChange = (e) => {
        e: if (description === '' || description === code) {
            setDescription(e.target.value.toUpperCase())
        }
        setCode(e.target.value.toUpperCase())
    }

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value)
    }

    const handleSave = () => {
        setIsAdding(true)
        const body = { code, description }
        RoomPatch(
            GENERAL_SETTINGS.OREST_URL,
            token,
            companyId,
            state.roomTypes[roomTypeIndex].rooms[roomIndex].gid,
            body
        ).then((r1) => {
            if (r1.status === 200) {
                setToState(
                    'registerStepper',
                    ['roomTypes', String(roomTypeIndex), 'rooms', String(roomIndex), 'code'],
                    r1.data.data.code
                )
                setToState(
                    'registerStepper',
                    ['roomTypes', String(roomTypeIndex), 'rooms', String(roomIndex), 'description'],
                    r1.data.data.description
                )
                setToState(
                    'registerStepper',
                    ['roomTypes', String(roomTypeIndex), 'rooms', String(roomIndex), 'roomno'],
                    r1.data.data.roomno
                )
                handleClose()
                setTimeout(() => {
                    setIsAdding(false)
                }, 500)
            } else {
                setIsAdding(false)
                const retErr = isErrorMsg(r1)
                showError(retErr.errorMsg)
            }
        })
    }

    return (
        <React.Fragment>
            {isVisible && (
                <Tooltip title="Edit Room">
                    <IconButton onClick={handleClickOpen} size={'small'}>
                        <EditIcon fontSize={'small'} />
                    </IconButton>
                </Tooltip>
            )}
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{t('str_editRoom')}</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        name="code"
                        label="Room No"
                        type="text"
                        fullWidth
                        value={code}
                        onChange={handleCodeChange}
                    />
                    <TextField
                        margin="dense"
                        name="description"
                        label="Description"
                        type="text"
                        fullWidth
                        value={description}
                        onChange={handleDescriptionChange}
                    />
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

EditRoom.propTypes = {
    roomTypeIndex: PropTypes.number,
    roomIndex: PropTypes.number,
    isVisible: PropTypes.bool,
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

export default connect(mapStateToProps, mapDispatchToProps)(EditRoom)
