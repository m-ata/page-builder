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
import { RoomTypePatch } from '../../../../../model/orest/components/RoomType'
import IconButton from '@material-ui/core/IconButton'
import EditIcon from '@material-ui/icons/Edit'
import Tooltip from '@material-ui/core/Tooltip'
import useNotifications from '../../../../../model/notification/useNotifications'
import Grid from '@material-ui/core/Grid'
import { isErrorMsg } from '../../../../../model/orest/constants'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
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

const EditRoomType = (props) => {
    const cls = useStyles()
    const { state, roomTypeIndex, setToState, open, onClose } = props
    const { showSuccess, showError } = useNotifications()
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const [code, setCode] = useState(state.roomTypes[roomTypeIndex].code)
    const { t } = useTranslation()
    const [description, setDescription] = useState(state.roomTypes[roomTypeIndex].description)
    const [longDescription, setLongDescription] = useState(state.roomTypes[roomTypeIndex].shorttext)
    const [totalRoom, setTotalRoom] = useState(state.roomTypes[roomTypeIndex].totalroom)
    const [isAdding, setIsAdding] = useState(false)
    const [isGotBed, setIsGotBed] = useState(state.roomTypes[roomTypeIndex].isroom)
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

    const handleLongDescriptionChange = (e) => {
        setLongDescription(e.target.value)
    }

    const handleTotalRoomChange = (e) => {
        setTotalRoom(e.target.value)
    }

    const handleSave = () => {
        setIsAdding(true)
        const body = { code, description, longDescription, totalRoom, isGotBed }
        RoomTypePatch(GENERAL_SETTINGS.OREST_URL, token, companyId, state.roomTypes[roomTypeIndex].gid, body).then(
            (r1) => {
                if (r1.status === 200) {
                    setToState('registerStepper', ['roomTypes', String(roomTypeIndex), 'code'], r1.data.data.code)
                    setToState(
                        'registerStepper',
                        ['roomTypes', String(roomTypeIndex), 'description'],
                        r1.data.data.description
                    )
                    setToState(
                        'registerStepper',
                        ['roomTypes', String(roomTypeIndex), 'shorttext'],
                        r1.data.data.shorttext
                    )
                    setToState(
                        'registerStepper',
                        ['roomTypes', String(roomTypeIndex), 'totalroom'],
                        r1.data.data.totalroom
                    )
                    setToState('registerStepper', ['roomTypes', String(roomTypeIndex), 'isroom'], r1.data.data.isroom)
                    onClose(false)
                    setTimeout(() => {
                        setIsAdding(false)
                    }, 500)
                } else {
                    setIsAdding(false)
                    const retErr = isErrorMsg(r1)
                    showError(retErr.errorMsg)
                }
            }
        )
    }

    const handleIsGotBed = (value, newValue) => {
        setIsGotBed(newValue)
    }

    return (
        <React.Fragment>
            <Dialog open={open} onClose={()=>onClose(false)} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{t('str_editRoomType')}</DialogTitle>
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
                    <Button onClick={()=>onClose(false)} color="primary">
                        {t('str_cancel')}
                    </Button>
                    <Button onClick={()=> handleSave()} disabled={isAdding} color="primary">
                        {t('str_save')}
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}

EditRoomType.propTypes = {
    roomTypeIndex: PropTypes.number,
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

export default connect(mapStateToProps, mapDispatchToProps)(EditRoomType)
