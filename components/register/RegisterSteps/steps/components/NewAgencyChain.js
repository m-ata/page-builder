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
import AddIcon from '@material-ui/icons/Add'
import useNotifications from '../../../../../model/notification/useNotifications'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import Grid from '@material-ui/core/Grid'
import { isErrorMsg, OREST_ENDPOINT } from '../../../../../model/orest/constants'
import { Insert, List, ViewList } from '@webcms/orest'
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

const NewAgencyChain = (props) => {
    const cls = useStyles()
    const { pushToState, isVisible } = props
    const { showSuccess, showError } = useNotifications()
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const [code, setCode] = useState('')
    const [open, setOpen] = useState(false)
    const { t } = useTranslation()
    const [isAdding, setIsAdding] = useState(false)
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleSave = () => {
        setIsAdding(true)
        List({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.AGENCYTYPE,
            token: token,
            params: {
                query: 'ischain:true',
            },
        }).then((r) => {
            if (r.status === 200 && r.data.count > 0) {
                Insert({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.AGENCY,
                    token: token,
                    data: {
                        code,
                        agencytypeid: r.data.data[0].id,
                    },
                }).then((r1) => {
                    if (r1.status === 200) {
                        ViewList({
                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                            endpoint: OREST_ENDPOINT.AGENCY,
                            token: token,
                            params: {
                                query: 'id:' + r1.data.data.id,
                            },
                        }).then((r2) => {
                            if (r2.status === 200 && r2.data.count > 0) {
                                pushToState('registerStepper', ['agencyChainList'], [r2.data.data[0]])
                                handleClose()
                                setCode('')
                                showSuccess('Chain added successfully')
                                setTimeout(() => {
                                    setIsAdding(false)
                                }, 500)
                            }
                        })
                    } else {
                        setIsAdding(false)
                        const retErr = isErrorMsg(r1)
                        showError(retErr.errorMsg)
                    }
                })
            }
        })
    }

    const handleCodeChange = (e) => {
        setCode(e.target.value.toUpperCase())
    }

    return (
        <React.Fragment>
            {isVisible && (
                <Tooltip title="Add Chain">
                    <IconButton size="small" onClick={handleClickOpen}>
                        <AddIcon fontSize={'small'} />
                    </IconButton>
                </Tooltip>
            )}
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{t('str_addNewChain')}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={1} style={{ width: 380 }}>
                        <Grid item xs={12}>
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

export default connect(mapStateToProps, mapDispatchToProps)(NewAgencyChain)
