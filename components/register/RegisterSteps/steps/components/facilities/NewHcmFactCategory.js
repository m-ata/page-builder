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
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import useNotifications from '../../../../../../model/notification/useNotifications'
import Grid from '@material-ui/core/Grid'
import { isErrorMsg, OREST_ENDPOINT } from '../../../../../../model/orest/constants'
import { Insert, ViewList } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import useTranslation from '../../../../../../lib/translations/hooks/useTranslation'

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

const NewHcmFactCategory = (props) => {
    const { t } = useTranslation()
    const cls = useStyles()
    const { setToState, pushToState, state, hcmItemID } = props
    const { showSuccess, showError } = useNotifications()
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const [categoryName, setCategoryName] = useState('')
    const [open, setOpen] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleCategoryName = (event) => {
        setCategoryName(event.target.value)
    }

    const handleSave = () => {
        if (!categoryName) {
            showError('Group name field cannot be empty!')
        } else {
            setIsAdding(true)
            Insert({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMCAT,
                token: token,
                data: {
                    itemid: hcmItemID,
                    code: categoryName,
                    description: categoryName,
                    isfact: true,
                    isactive: true,
                    hotelrefno: Number(companyId),
                },
            }).then((r1) => {
                if (r1.status === 200) {
                    ViewList({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.HCMCAT,
                        token: token,
                        params: {
                            query: 'id:' + r1.data.data.id,
                            hotelrefno: Number(companyId),
                        },
                    }).then((r2) => {
                        if (r2.status === 200) {
                            pushToState('registerStepper', ['hcmFacilities'], [r2.data.data[0]])
                            handleClose()
                            setCategoryName('')
                            setToState('registerStepper', ['facilitiesTabIndex'], state.hcmFacilities.length)
                            showSuccess('Group added successfully')
                            setIsAdding(false)
                        } else {
                            showError("Couldn't add group")
                            setIsAdding(false)
                        }
                    })
                } else {
                    setIsAdding(false)
                    const retErr = isErrorMsg(r1)
                    showError(retErr.errorMsg)
                }
            })
        }
    }

    return (
        <React.Fragment>
            <Fab
                variant="extended"
                size="small"
                style={{ display: 'flex', margin: 'auto' }}
                color="primary"
                onClick={handleClickOpen}
            >
                <AddIcon className={cls.extendedIcon} />
                Group
            </Fab>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Add New Group</DialogTitle>
                <DialogContent>
                    <Grid container spacing={1} style={{ width: 380 }}>
                        <Grid item xs={12}>
                            <TextField
                                required
                                margin="dense"
                                name="code"
                                label="Group Name"
                                type="text"
                                fullWidth
                                value={categoryName}
                                onChange={handleCategoryName}
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

export default connect(mapStateToProps, mapDispatchToProps)(NewHcmFactCategory)
