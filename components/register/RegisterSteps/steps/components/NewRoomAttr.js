import React, { useContext, useState } from 'react'
import { useRouter } from 'next/router'
import { setToState } from 'state/actions'
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
import { OREST_ENDPOINT } from 'model/orest/constants'
import { Insert, ViewList } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { useSnackbar } from 'notistack'

const NewRoomAttr = (props) => {
    const { state, open, onClose, setToState } = props
    const { enqueueSnackbar } = useSnackbar()
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const [code, setCode] = useState('')
    const { t } = useTranslation()
    const [description, setDescription] = useState('')
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

    const handleSave = () => {
        if(!code){
            enqueueSnackbar('Please do not leave the name empty.', { variant: 'warning' })
        } else if(!description){
            enqueueSnackbar('Please do not leave the description empty.', { variant: 'warning' })
        }else{
            setIsAdding(true)
            Insert({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.ROOMATTR,
                token: token,
                data: {
                    code,
                    description,
                    isdef: isDefault,
                    hotelrefno: Number(companyId),
                },
            }).then((r1) => {
                if (r1.status === 200) {
                    onClose(false)
                    setCode('')
                    setDescription('')
                    setIsDefault(false)
                    setIsAdding(false)
                    enqueueSnackbar('Room Features added successfully.', { variant: 'success' })
                    ViewList({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.ROOMTYPE,
                        token: token,
                        params: {
                            hotelrefno: companyId,
                        },
                    }).then((r) => {
                        if (r.status === 200) {
                            setToState('registerStepper', ['roomTypes'], r.data.data)
                            if (r.data.count > 0) {
                                ViewList({
                                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                                    endpoint: OREST_ENDPOINT.ROOM,
                                    token: token,
                                    params: {
                                        query: `roomtypeid:${r.data.data[state.layoutTabIndex].id}`,
                                        hotelrefno: companyId,
                                    },
                                }).then((res) => {
                                    if (res.status === 200) {
                                        setToState(
                                            'registerStepper',
                                            ['roomTypes', String(state.layoutTabIndex), 'rooms'],
                                            res.data.data
                                        )
                                    } else {
                                        enqueueSnackbar(res.data.message, { variant: 'error' })
                                    }
                                })
                            }
                        } else {
                            enqueueSnackbar(r.data.message, { variant: 'error' })
                        }
                    })
                } else {
                    setIsAdding(false)
                    enqueueSnackbar(r1.data.message, { variant: 'error' })
                }
            })
        }

    }

    const handleIsDefault = (value, newValue) => {
        setIsDefault(newValue)
    }

    return (
        <React.Fragment>
            <Dialog open={open} onClose={()=> onClose(false)} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{t('str_addNewRoomFeatures')}</DialogTitle>
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
                        <Grid item xs={6} style={{ alignSelf: 'flex-end', marginTop: 10 }}>
                            <FormGroup row>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={isDefault}
                                            color="primary"
                                            value={isDefault}
                                            onChange={handleIsDefault}
                                            style={{ padding: 6, marginLeft: 5 }}
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
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(NewRoomAttr)
