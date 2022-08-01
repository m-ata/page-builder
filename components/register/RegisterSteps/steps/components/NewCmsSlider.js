import React, { useContext, useState } from 'react'
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
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import useNotifications from '../../../../../model/notification/useNotifications'
import { isErrorMsg, OREST_ENDPOINT } from '../../../../../model/orest/constants'
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

const NewCmsSlider = (props) => {
    const cls = useStyles()
    const { setToState, pushToState, state } = props
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const [code, setCode] = useState('')
    const [description, setDescription] = useState('')
    const [active, setActive] = useState(true)
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

    const handleSave = () => {
        if (code === '') {
            showError('Name field cannot be empty!')
        } else if (description === '') {
            showError('Description field cannot be empty!')
        } else {
            const checkCode = state.cmsSlider.findIndex((x) => x.code === code)
            if (checkCode === -1) {
                Insert({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.CMSSLIDER,
                    token: token,
                    data: {
                        code,
                        description,
                        active,
                        hotelrefno: Number(companyId),
                    },
                }).then((r1) => {
                    if (r1.status === 200) {
                        pushToState('registerStepper', ['cmsSlider'], [r1.data.data])
                        setToState('registerStepper', ['cmsSliderTabIndex'], state.cmsSlider.length)
                        setCode('')
                        setDescription('')
                        setActive(false)
                        handleClose()
                        showSuccess('Slider has been created!')
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
            <Fab
                variant="extended"
                size="small"
                color="primary"
                onClick={handleClickOpen}
                style={{ display: 'flex', margin: 'auto' }}
            >
                <AddIcon className={cls.extendedIcon} />
                Category
            </Fab>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{t('str_addNewCategory')}</DialogTitle>
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
                    <FormControlLabel
                        control={
                            <Checkbox checked={active} color="primary" value={active} onChange={handleActiveChange} />
                        }
                        label="Active"
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

export default connect(mapStateToProps, mapDispatchToProps)(NewCmsSlider)
