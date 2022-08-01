import React, { useState } from 'react'
import { pushToState, setToState, updateState } from 'state/actions'
import { connect } from 'react-redux'
import PlayCircleFilledWhiteOutlinedIcon from '@material-ui/icons/PlayCircleFilledWhiteOutlined'
import IconButton from '@material-ui/core/IconButton'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import useTranslation from '../../../../../../lib/translations/hooks/useTranslation'

const HcmItemVidPlayer = (props) => {
    const { t } = useTranslation()
    const { setToState, updateState, state, videoUrl } = props
    const [open, setOpen] = useState(false)

    const handleOpen = () => {
        setOpen(true)
        updateState('registerStepper', 'videosGridDragAndDrop', true)
    }

    const handleClose = () => {
        setOpen(false)
        updateState('registerStepper', 'videosGridDragAndDrop', false)
    }

    return (
        <React.Fragment>
            <Tooltip title="Play Video">
                <IconButton style={{ marginLeft: 5 }} size="small" onClick={() => handleOpen()}>
                    <PlayCircleFilledWhiteOutlinedIcon size="small" />
                </IconButton>
            </Tooltip>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
                fullWidth={true}
                maxWidth="sm"
            >
                <DialogTitle id="form-dialog-title">{t('str_playVideo')}</DialogTitle>
                <DialogContent>
                    <video controls={true} style={{ width: '100%' }}>
                        <source src={videoUrl} type="video/mp4" />
                    </video>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        {t('str_close')}
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

export default connect(mapStateToProps, mapDispatchToProps)(HcmItemVidPlayer)
