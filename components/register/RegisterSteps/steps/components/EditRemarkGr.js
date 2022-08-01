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
import { RemarkGrPatch } from '../../../../../model/orest/components/RemarkGr'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import EditIcon from '@material-ui/icons/Edit'
import useNotifications from '../../../../../model/notification/useNotifications'
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

const EditRemarkGr = (props) => {
    const cls = useStyles()
    const { setToState, state, grIndex } = props
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const [code, setCode] = useState(state.remarkGr[grIndex].code)
    const [description, setDescription] = useState(state.remarkGr[grIndex].description)
    const [active, setActive] = useState(state.remarkGr[grIndex].isactive)
    const [multi, setMulti] = useState(state.remarkGr[grIndex].multiselect)
    const { t } = useTranslation()
    const [open, setOpen] = React.useState(false)
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

    const handleActiveChange = (value, newValue) => {
        setActive(newValue)
    }

    const handleMultiChange = (value, newValue) => {
        setMulti(newValue)
    }

    const handleSave = () => {
        const gid = state.remarkGr[grIndex].gid
        const body = { code, description, active, multi, gid }
        if (code === '') {
            showError('Name field cannot be empty!')
        } else if (description === '') {
            showError('Description field cannot be empty!')
        } else {
            const checkCode = state.remarkGr.filter((x) => x.code === code).length
            if (checkCode !== 1 || code === state.remarkGr[grIndex].code) {
                RemarkGrPatch(GENERAL_SETTINGS.OREST_URL, token, companyId, body).then((r1) => {
                    if (r1.status === 200) {
                        const remarkGrItems = state.remarkGr[grIndex].remarks
                        setToState('registerStepper', ['remarkGr', String(grIndex)], r1.data.data)
                        setToState('registerStepper', ['remarkGr', String(grIndex), 'remarks'], remarkGrItems)
                        handleClose()
                        showSuccess('Chosen group has been updated!')
                    } else {
                        const retErr = isErrorMsg(r1)
                        showError(retErr.errorMsg)
                    }
                })
            } else {
                showError('The code field must be unique!')
            }
        }
    }

    return (
        <React.Fragment>
            <Tooltip style={{ marginBottom: 10 }} title="Edit Group">
                <IconButton size={'small'} onClick={handleClickOpen}>
                    <EditIcon fontSize={'small'} />
                </IconButton>
            </Tooltip>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{t('str_editGroup')}</DialogTitle>
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
                    <FormControlLabel
                        control={
                            <Checkbox checked={active} color="primary" value={active} onChange={handleActiveChange} />
                        }
                        label="Active"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox checked={multi} color="primary" value={multi} onChange={handleMultiChange} />
                        }
                        label="Multi Selection"
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

EditRemarkGr.propTypes = {
    grIndex: PropTypes.number,
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

export default connect(mapStateToProps, mapDispatchToProps)(EditRemarkGr)
