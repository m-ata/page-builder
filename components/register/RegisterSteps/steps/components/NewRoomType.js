import React, { useContext, useState } from 'react'
import { useRouter } from 'next/router'
import { pushToState, setToState, updateState } from 'state/actions'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Grid from '@material-ui/core/Grid'
import { OREST_ENDPOINT } from 'model/orest/constants'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import { Insert, ViewList } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import { useSnackbar } from 'notistack'

const NewRoomType = (props) => {

    const { setToState, pushToState, state, open, onClose } = props
    const { enqueueSnackbar } = useSnackbar()

    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const [code, setCode] = useState('')
    const [description, setDescription] = useState('')
    const [longDescription, setLongDescription] = useState('')
    const [totalRoom, setTotalRoom] = useState(0)
    const [isAdding, setIsAdding] = useState(false)
    const [isGotBed, setIsGotBed] = useState(true)
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    const handleCodeChange = (e) => {
        if (description === '' || description === code) {
            setDescription(e.target.value.toUpperCase())
        }
        setCode(e.target.value.toUpperCase())
    }

    const handleLongDescriptionChange = (e) => {
        setLongDescription(e.target.value)
    }

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value)
    }

    const handleTotalRoomChange = (e) => {
        setTotalRoom(e.target.value)
    }

    const handleSave = () => {
        setIsAdding(true)
        Insert({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.ROOMTYPE,
            token: token,
            data: {
                code,
                description,
                shorttext: longDescription,
                totalroom: totalRoom,
                isroom: isGotBed,
                hotelrefno: Number(companyId),
            },
        }).then((r1) => {
            if (r1.status === 200) {
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.ROOMTYPE,
                    token: token,
                    params: {
                        query: 'id:' + r1.data.data.id,
                        hotelrefno: companyId,
                    },
                }).then((r2) => {
                    if (r2.status === 200) {
                        pushToState('registerStepper', ['roomTypes'], [r2.data.data[0]])
                        onClose(false)
                        setToState('registerStepper', ['layoutTabIndex'], state.roomTypes.length)
                        setCode('')
                        setDescription('')
                        setTotalRoom(0)
                        enqueueSnackbar('Room Type added successfully.', { variant: 'success' })
                        setIsAdding(false)
                        setIsGotBed(true)
                        if (state.roomTypes.length === state.layoutTabIndex) {
                            ViewList({
                                apiUrl: GENERAL_SETTINGS.OREST_URL,
                                endpoint: OREST_ENDPOINT.ROOM,
                                token: token,
                                params: {
                                    query: `roomtypeid:${r1.data.data.id}`,
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
                    }
                })
            } else {
                enqueueSnackbar(r1.data.message, { variant: 'error' })
                setIsAdding(false)
            }
        })
    }

    const handleIsGotBed = (value, newValue) => {
        setIsGotBed(newValue)
    }

    return (
        <React.Fragment>
            <Dialog open={open} onClose={()=> onClose(false)} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Add Room Type</DialogTitle>
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
                                name="title"
                                label="Title"
                                type="text"
                                fullWidth
                                value={description}
                                onChange={handleDescriptionChange}
                            />
                            <TextField
                                margin="dense"
                                name="description"
                                label="Short Description"
                                type="text"
                                fullWidth
                                value={longDescription}
                                onChange={handleLongDescriptionChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                type="number"
                                id="totalroom"
                                label="Total Room"
                                value={totalRoom}
                                onChange={handleTotalRoomChange}
                            />
                        </Grid>
                        <Grid item xs={6} style={{ alignSelf: 'flex-end' }}>
                            <FormGroup row>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={isGotBed}
                                            color="primary"
                                            value={isGotBed}
                                            onChange={handleIsGotBed}
                                            style={{ padding: 0, marginLeft: 50 }}
                                        />
                                    }
                                    label="Got Bed"
                                />
                            </FormGroup>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=> onClose(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={()=> handleSave()} disabled={isAdding} color="primary">
                        Save
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

export default connect(mapStateToProps, mapDispatchToProps)(NewRoomType)
