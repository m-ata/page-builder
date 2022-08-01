import moment from 'moment'
import React, { useContext } from 'react'
import { connect } from 'react-redux'
import { pushToState, setToState, updateState } from 'state/actions'
import { Grid, TextField } from '@material-ui/core'
import MomentAdapter from '@date-io/moment'
import { DatePicker, LocalizationProvider } from '@material-ui/pickers'
import useTranslation from 'lib/translations/hooks/useTranslation'
import WebCmsGlobal from 'components/webcms-global'

const OtherGuestInfos = (props) => {
    const { t } = useTranslation()
    const { state, updateState, roomIndex, paxIndex } = props
    const { GENERAL_SETTINGS, locale } = useContext(WebCmsGlobal)
    let listOfSelectedRooms = state.listOfSelectedRooms

    const handleFirstName = (e) => {
        listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].firstName = e.currentTarget.value
        listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].firstNameError = false
        updateState('ibe', 'listOfSelectedRooms', listOfSelectedRooms)
    }

    const handleLastName = (e) => {
        listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].lastName = e.currentTarget.value
        listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].lastNameError = false
        updateState('ibe', 'listOfSelectedRooms', listOfSelectedRooms)
    }

    const handleMail = (e) => {
        listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].mail = e.currentTarget.value
        listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].mailError = false
        updateState('ibe', 'listOfSelectedRooms', listOfSelectedRooms)
    }

    const handleDateOfBirth = (date) => {
        if (date) {
            if (date._isValid) {
                listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].birthDate = date._d
                listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].birthDateError = false
            } else {
                listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].birthDate = date._d
                listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].birthDateError = true
            }
            updateState('ibe', 'listOfSelectedRooms', listOfSelectedRooms)
        }
    }

    let id = roomIndex + '-' + paxIndex + '-'

    return (
        <React.Fragment>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        margin="dense"
                        variant="outlined"
                        required
                        id={id + 'fistName'}
                        name="fistName"
                        label={t('str_firstName')}
                        fullWidth
                        value={listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].firstName || ''}
                        onChange={handleFirstName}
                        error={listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].firstNameError || false}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        margin="dense"
                        variant="outlined"
                        required
                        id={id + 'lastName'}
                        name="lastName"
                        label={t('str_lastName')}
                        fullWidth
                        value={listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].lastName || ''}
                        onChange={handleLastName}
                        error={listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].lastNameError || false}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        margin="dense"
                        variant="outlined"
                        id={id + 'mail'}
                        name="mail"
                        label={t('str_email')}
                        fullWidth
                        value={listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].mail || ''}
                        error={listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].mailError || false}
                        onChange={handleMail}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                        <DatePicker
                            autoOk
                            id={id + '-birthDate'}
                            name="birthdate"
                            fullWidth
                            disableFuture
                            openTo={'date'}
                            views={['year', 'month', 'date']}
                            margin="dense"
                            onChange={handleDateOfBirth}
                            value={
                                listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].birthDate
                                    ? moment(listOfSelectedRooms.roomList[roomIndex].guestList[paxIndex].birthDate)
                                    : moment().subtract(state.maxChildAge > 0 ? state.maxChildAge : 12, 'years')
                            }
                            inputFormat="DD/MM/YYYY"
                            renderInput={(props) => <TextField {...props} variant="outlined" margin="dense" fullWidth error={state.clientsInfo.birthDateError}/>}
                        />
                    </LocalizationProvider>
                </Grid>
            </Grid>
        </React.Fragment>
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

export default connect(mapStateToProps, mapDispatchToProps)(OtherGuestInfos)
