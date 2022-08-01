import React from 'react'
import moment from 'moment'
import { connect } from 'react-redux'
import { setToState } from 'state/actions'
import { Grid, TextField } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import MomentAdapter from '@date-io/moment'
import { DatePicker, LocalizationProvider } from '@material-ui/pickers'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { updateState } from 'state/actions'

const useStyles = makeStyles((theme) => ({
    infoTextField: {
        background: '#FFFFFF',
        '& fieldset': {
            borderRadius: 0,
        },
    }
}))

const OtherGuestInfo = (props) => {
    const classes = useStyles()
    const { t } = useTranslation()
    const { state, updateState, roomIndex, paxIndex, isDisabled } = props
    let selectedRooms = state.selectedRooms

    const handleFirstName = (e) => {
        selectedRooms[roomIndex].guestList[paxIndex].firstName.value = e.currentTarget.value
        selectedRooms[roomIndex].guestList[paxIndex].firstName.iserror = false
        updateState('ibe', 'selectedRooms', selectedRooms)
    }

    const handleLastName = (e) => {
        selectedRooms[roomIndex].guestList[paxIndex].lastName.value = e.currentTarget.value
        selectedRooms[roomIndex].guestList[paxIndex].lastName.iserror = false
        updateState('ibe', 'selectedRooms', selectedRooms)
    }

    const handleMail = (e) => {
        selectedRooms[roomIndex].guestList[paxIndex].mail.value = e.currentTarget.value
        selectedRooms[roomIndex].guestList[paxIndex].mail.iserror = false
        updateState('ibe', 'selectedRooms', selectedRooms)
    }

    const handleDateOfBirth = (date) => {
        if (date) {
            if (date._isValid) {
                selectedRooms[roomIndex].guestList[paxIndex].birthDate.value = date._d
            } else {
                selectedRooms[roomIndex].guestList[paxIndex].birthDate.value = date._d
            }
            selectedRooms[roomIndex].guestList[paxIndex].birthDate.iserror = false
            updateState('ibe', 'selectedRooms', selectedRooms)
        }
    }

    let id = roomIndex + '-' + paxIndex + '-'
    return (
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        disabled={isDisabled}
                        className={classes.infoTextField}
                        size="small"
                        variant="outlined"
                        id={id + 'fistName'}
                        name="fistName"
                        label={t('str_firstName')}
                        fullWidth
                        value={selectedRooms[roomIndex].guestList[paxIndex].firstName.value || ''}
                        required={selectedRooms[roomIndex].guestList[paxIndex].firstName.isrequired}
                        error={selectedRooms[roomIndex].guestList[paxIndex].firstName.iserror}
                        onChange={handleFirstName}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        disabled={isDisabled}
                        className={classes.infoTextField}
                        size="small"
                        variant="outlined"
                        id={id + 'lastName'}
                        name="lastName"
                        label={t('str_lastName')}
                        fullWidth
                        value={selectedRooms[roomIndex].guestList[paxIndex].lastName.value || ''}
                        required={selectedRooms[roomIndex].guestList[paxIndex].lastName.isrequired}
                        error={selectedRooms[roomIndex].guestList[paxIndex].lastName.iserror}
                        onChange={handleLastName}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        disabled={isDisabled}
                        className={classes.infoTextField}
                        size="small"
                        variant="outlined"
                        id={id + 'mail'}
                        name="mail"
                        label={t('str_email')}
                        fullWidth
                        value={selectedRooms[roomIndex].guestList[paxIndex].mail.value || ''}
                        required={selectedRooms[roomIndex].guestList[paxIndex].mail.isrequired}
                        error={selectedRooms[roomIndex].guestList[paxIndex].mail.iserror}
                        onChange={handleMail}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                        <DatePicker
                            disabled={isDisabled}
                            autoOk
                            id={id + '-birthDate'}
                            name="birthdate"
                            fullWidth
                            disableFuture
                            openTo={'date'}
                            views={['year', 'month', 'date']}
                            margin="dense"
                            onChange={handleDateOfBirth}
                            value={selectedRooms[roomIndex].guestList[paxIndex].birthDate.value ? moment(selectedRooms[roomIndex].guestList[paxIndex].birthDate.value) : moment().subtract(state.maxChildAge > 0 ? state.maxChildAge : 12, 'years')}
                            inputFormat="DD/MM/YYYY"
                            renderInput={(props) =>
                                <TextField
                                    {...props}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    className={classes.infoTextField}
                                    required={selectedRooms[roomIndex].guestList[paxIndex].birthDate.isrequired}
                                    error={selectedRooms[roomIndex].guestList[paxIndex].birthDate.iserror}
                                    helperText=""
                                />
                            }
                        />
                    </LocalizationProvider>
                </Grid>
            </Grid>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.ibe,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    pushToState: (stateType, stateName, value) => dispatch(pushToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(OtherGuestInfo)
