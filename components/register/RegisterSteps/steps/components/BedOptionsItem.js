import React from 'react'
import { connect } from 'react-redux'
import { updateState } from '../../../../../state/actions'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'

const BedOptionsItem = (props) => {
    return (
        <React.Fragment>
            <Grid container>
                <Grid item xs={12}>
                    <TextField type="number" id="bathrooms" label="Bed Type" />
                    x
                    <TextField type="number" id="bathrooms" label="Number of Beds" />
                    <TextField type="number" id="bathrooms" label="Pax" />
                </Grid>
            </Grid>
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.registerStepper,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(BedOptionsItem)
