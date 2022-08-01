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
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import { RemarkPatch } from '../../../../../model/orest/components/Remark'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import EditIcon from '@material-ui/icons/Edit'
import useNotifications from '../../../../../model/notification/useNotifications'
import { isErrorMsg } from '../../../../../model/orest/constants'
import WebCmsGlobal from 'components/webcms-global'
import useTranslation from '../../../../../lib/translations/hooks/useTranslation'

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

const EditRemark = (props) => {
    const cls = useStyles()
    const { setToState, pushToState, state, grIndex, grID, remarkGrp, itemIndex, key } = props
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID

    const [code, setCode] = useState(state.remarkGr[grIndex].remarks[itemIndex].code)
    const [description, setDescription] = useState(state.remarkGr[grIndex].remarks[itemIndex].description)
    const [note, setNote] = useState(state.remarkGr[grIndex].remarks[itemIndex].note)
    const { t } = useTranslation()
    const [active, setActive] = useState(state.remarkGr[grIndex].remarks[itemIndex].isactive)
    const [hasDate, setHasDate] = useState(state.remarkGr[grIndex].remarks[itemIndex].hasdate)
    const [open, setOpen] = useState(false)
    const { showSuccess, showError } = useNotifications()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleCodeChange = (e) => {
        if (description === '' || description === code) {
            setDescription(e.target.value.toUpperCase())
        }
        setCode(e.target.value.toUpperCase())
    }

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value)
    }

    const handleNoteChange = (e) => {
        setNote(e.target.value)
    }

    const handleActiveChange = (value, newValue) => {
        setActive(newValue)
    }

    const handleHasDateChange = (value, newValue) => {
        setHasDate(newValue)
    }

    const handleSave = () => {
        const gid = state.remarkGr[grIndex].remarks[itemIndex].gid
        const body = { code, description, note, active, hasDate, gid }
        if (code === '') {
            showError('Name field cannot be empty!')
        } else if (description === '') {
            showError('Description field cannot be empty!')
        } else {
            RemarkPatch(GENERAL_SETTINGS.OREST_URL, token, companyId, body).then((r1) => {
                if (r1.status === 200) {
                    setToState(
                        'registerStepper',
                        ['remarkGr', String(grIndex), 'remarks', String(itemIndex), 'code'],
                        r1.data.data.code
                    )
                    setToState(
                        'registerStepper',
                        ['remarkGr', String(grIndex), 'remarks', String(itemIndex), 'description'],
                        r1.data.data.description
                    )
                    setToState(
                        'registerStepper',
                        ['remarkGr', String(grIndex), 'remarks', String(itemIndex), 'note'],
                        r1.data.data.note
                    )
                    setToState(
                        'registerStepper',
                        ['remarkGr', String(grIndex), 'remarks', String(itemIndex), 'hasdate'],
                        r1.data.data.hasdate
                    )
                    handleClose()
                    showSuccess('Chosen item has been updated!')
                } else {
                    const retErr = isErrorMsg(r1)
                    showError(retErr.errorMsg)
                }
            })
        }
    }

    return (
        <React.Fragment>
            <Tooltip title="Edit Item">
                <IconButton size={'small'} onClick={handleClickOpen}>
                    <EditIcon fontSize={'small'} />
                </IconButton>
            </Tooltip>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{t('str_editItem')}</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        name="code"
                        label="Name"
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
                    <TextField
                        margin="dense"
                        name="note"
                        label="Note"
                        type="text"
                        fullWidth
                        value={note === null ? '' : note}
                        onChange={handleNoteChange}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox checked={active} color="primary" value={active} onChange={handleActiveChange} />
                        }
                        label="Active"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={hasDate}
                                color="primary"
                                value={hasDate}
                                onChange={handleHasDateChange}
                            />
                        }
                        label="Has Date"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        {t('str_cancel')}
                    </Button>
                    <Button onClick={handleSave} color="primary">
                        {t('str_save')}
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}

EditRemark.propTypes = {
    grIndex: PropTypes.number,
    grID: PropTypes.number,
    remarkGrp: PropTypes.number,
    itemIndex: PropTypes.number,
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

export default connect(mapStateToProps, mapDispatchToProps)(EditRemark)
