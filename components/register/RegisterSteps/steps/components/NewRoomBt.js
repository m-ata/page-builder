import React, { useContext, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useRouter } from 'next/router'
import { pushToState } from 'state/actions'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import useNotifications from 'model/notification/useNotifications'
import Grid from '@material-ui/core/Grid'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormGroup from '@material-ui/core/FormGroup'
import { isErrorMsg, OREST_ENDPOINT } from 'model/orest/constants'
import { Insert, ViewList } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import useTranslation from 'lib/translations/hooks/useTranslation'

const NewRoomBt = (props) => {
    const { t } = useTranslation()
    const { open, onClose, pushToState } = props
    const { showSuccess, showError } = useNotifications()
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const [code, setCode] = useState('')
    const [description, setDescription] = useState('')
    const [pax, setPax] = useState(0)
    const [isAdding, setIsAdding] = useState(false)
    const [isDefault, setIsDefault] = useState(false)
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    const handleCodeChange = (e) => {
        if (description === '' || description === code) {
            setDescription(e.target.value.toUpperCase())
        }
        setCode(e.target.value.toUpperCase())
    }

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value)
    }

    const handlePaxChange = (e) => {
        setPax(e.target.value)
    }

    const handleSave = () => {
        setIsAdding(true)
        Insert({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.ROOMBT,
            token: token,
            data: {
                code,
                description,
                pax,
                isdef: isDefault,
                hotelrefno: Number(companyId),
            },
        }).then((r1) => {
            if (r1.status === 200) {
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.ROOMBT,
                    token: token,
                    params: {
                        query: 'id:' + r1.data.data.id,
                        hotelrefno: companyId,
                    },
                }).then((r2) => {
                    if (r2.status === 200 && r2.data.count > 0) {
                        pushToState('registerStepper', ['roomBedTypes'], [r2.data.data[0]])
                        onClose(false)
                        setCode('')
                        setDescription('')
                        setPax(0)
                        setIsDefault(false)
                        showSuccess('Bed Type added successfully')
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

    const handleIsDefault = (value, newValue) => {
        setIsDefault(newValue)
    }

    return (
        <React.Fragment>
            <Dialog open={open} onClose={()=> onClose(false)} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{t('str_addNewBedType')}</DialogTitle>
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
                        <Grid item xs={12}>
                            <TextField
                                margin="dense"
                                name="description"
                                label="Description"
                                type="text"
                                fullWidth
                                value={description}
                                onChange={handleDescriptionChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                type="number"
                                id="bathrooms"
                                label="Pax"
                                value={pax}
                                onChange={handlePaxChange}
                            />
                        </Grid>
                        <Grid item xs={6} style={{ alignSelf: 'flex-end' }}>
                            <FormGroup row>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={isDefault}
                                            color="primary"
                                            value={isDefault}
                                            onChange={handleIsDefault}
                                            style={{ padding: 0, marginLeft: 50 }}
                                        />
                                    }
                                    label="Default"
                                />
                            </FormGroup>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=> onClose(false)} color="primary">
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
    pushToState: (stateType, stateName, value) => dispatch(pushToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(NewRoomBt)
