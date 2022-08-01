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
import AddIcon from '@material-ui/icons/AddCircle'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import { isErrorMsg, OREST_ENDPOINT } from '../../../../../model/orest/constants'
import Tooltip from '@material-ui/core/Tooltip'
import useNotifications from '../../../../../model/notification/useNotifications'
import IconButton from '@material-ui/core/IconButton'
import { Insert } from '@webcms/orest'
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

const NewRemark = (props) => {
    const cls = useStyles()
    const { setToState, pushToState, state, grIndex, grID } = props
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const [code, setCode] = useState('')
    const [description, setDescription] = useState('')
    const [note, setNote] = useState('')
    const [active, setActive] = useState(true)
    const [hasDate, setHasDate] = useState(false)
    const { t } = useTranslation()
    const [isAdding, setIsAdding] = useState(false)
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
        setIsAdding(true)
        if (code === '') {
            showError('Name field cannot be empty!')
        } else if (description === '') {
            showError('Description field cannot be empty!')
        } else {
            const remarks = state.remarkGr[grIndex].remarks
            let checkCode = -1
            if (remarks) {
                checkCode = remarks.findIndex((x) => x.code === code)
            }
            if (checkCode === -1) {
                Insert({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.REMARK,
                    token: token,
                    data: {
                        code,
                        description,
                        note,
                        isorsactive: active,
                        hasdate: hasDate,
                        remarkgrid: grID,
                        hotelrefno: Number(companyId),
                    },
                }).then((res1) => {
                    if (res1.status === 200) {
                        if (state.remarkGr[grIndex].remarks) {
                            pushToState('registerStepper', ['remarkGr', String(grIndex), 'remarks'], [res1.data.data])
                        } else {
                            setToState('registerStepper', ['remarkGr', String(grIndex), 'remarks'], [res1.data.data])
                        }
                        handleClose()
                        setCode('')
                        setDescription('')
                        setNote('')
                        setActive(true)
                        setHasDate(false)
                        showSuccess('New item added!')
                        setIsAdding(false)
                    } else {
                        setIsAdding(false)
                        const retErr = isErrorMsg(res1)
                        showError(retErr.errorMsg)
                    }
                })
            } else {
                setIsAdding(false)
                showError('The code field must be unique!')
            }
        }
    }

    return (
        <React.Fragment>
            <Tooltip style={{ verticalAlign: 'super', marginRight: 4 }} title="Add Group Item">
                <span>
                    <IconButton size={'small'} onClick={handleClickOpen}>
                        <AddIcon fontSize={'default'} />
                    </IconButton>
                </span>
            </Tooltip>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{t('str_addNewItem')}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
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
                        value={note}
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
                    <Button onClick={handleSave} disabled={isAdding} color="primary">
                        {t('str_save')}
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}

NewRemark.propTypes = {
    grIndex: PropTypes.number,
    grID: PropTypes.number,
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

export default connect(mapStateToProps, mapDispatchToProps)(NewRemark)
