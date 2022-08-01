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
import { Insert, ViewList } from '@webcms/orest'
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

const NewRemarkGr = (props) => {
    const cls = useStyles()
    const { setToState, pushToState, state } = props
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const [code, setCode] = useState('')
    const [description, setDescription] = useState('')
    const [active, setActive] = useState(true)
    const [multi, setMulti] = useState(false)
    const { t } = useTranslation()
    const [isAdding, setIsAdding] = useState(false)
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
        setIsAdding(true)
        if (code === '') {
            showError('Name field cannot be empty!')
        } else if (description === '') {
            showError('Description field cannot be empty!')
        } else {
            const checkCode = state.remarkGr.findIndex((x) => x.code === code)
            if (typeof checkCode !== 'undefined' && checkCode === -1) {
                Insert({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.REMARKGR,
                    token: token,
                    data: {
                        code,
                        description,
                        isactive: active,
                        multiselect: multi,
                        hotelrefno: Number(companyId),
                    },
                }).then((r1) => {
                    if (r1.status === 200) {
                        ViewList({
                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                            endpoint: OREST_ENDPOINT.REMARKGR,
                            token: token,
                            params: {
                                query: 'id:' + r1.data.data.id,
                                hotelrefno: companyId,
                            },
                        }).then((r2) => {
                            if (r2.status === 200 && r2.data.count > 0) {
                                pushToState('registerStepper', ['remarkGr'], [r2.data.data[0]])
                                handleClose()
                                setToState('registerStepper', ['remarkTabIndex'], state.remarkGr.length)
                                setCode('')
                                setDescription('')
                                setActive(true)
                                setMulti(false)
                                showSuccess('New group added!')
                                setIsAdding(false)
                                if (state.remarkGr.length === state.remarkTabIndex) {
                                    ViewList({
                                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                                        endpoint: OREST_ENDPOINT.REMARK,
                                        token: token,
                                        params: {
                                            query: `remarkgrid:${r2.data.data[0].id}`,
                                            hotelrefno: companyId,
                                        },
                                    }).then((r3) => {
                                        if (r3.status === 200) {
                                            setToState(
                                                'registerStepper',
                                                ['remarkGr', String(state.remarkTabIndex), 'remarks'],
                                                r3.data.data
                                            )
                                        } else {
                                            const retErr = isErrorMsg(r3)
                                            showError(retErr.errorMsg)
                                        }
                                    })
                                }
                            } else {
                                const retErr = isErrorMsg(r2)
                                showError(retErr.errorMsg)
                            }
                        })
                    } else {
                        setIsAdding(false)
                        const retErr = isErrorMsg(r1)
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
            <Fab
                variant="extended"
                size="small"
                color="primary"
                onClick={handleClickOpen}
                style={{ display: 'flex', margin: 'auto' }}
            >
                <AddIcon className={cls.extendedIcon} />
                Group
            </Fab>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{t('str_addNewGroup')}</DialogTitle>
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
                    <FormControlLabel
                        control={
                            <Checkbox checked={multi} color="primary" value={multi} onChange={handleMultiChange} />
                        }
                        label="Multi Select"
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

export default connect(mapStateToProps, mapDispatchToProps)(NewRemarkGr)
