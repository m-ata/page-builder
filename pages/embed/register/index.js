import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { setToState, updateState } from '../../../state/actions'
import RegisterStepper from '../../../components/register/RegisterStepper'
import Notifications from '../../../model/notification/components/Notifications'
import Backdrop from '@material-ui/core/Backdrop'
import Container from '@material-ui/core/Container'
import CircularProgress from '@material-ui/core/CircularProgress'
import { makeStyles } from '@material-ui/core/styles'
import { NextSeo } from 'next-seo'

const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    title: {
        fontSize: 14,
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 999,
        color: '#fff',
    },
}))

const Index = (props) => {
    const cls = useStyles()
    const { state, setToState, agencyTypes, countryList } = props

    return (
        <React.Fragment>
            <Container maxWidth="lg">
                <RegisterStepper pageStep={state.pageStep} />
            </Container>
            <Notifications />
            <Backdrop className={cls.backdrop} open={state.backDropStatus}>
                <CircularProgress color="inherit" />
            </Backdrop>
            <NextSeo title={'Register'} />
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
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Index)
