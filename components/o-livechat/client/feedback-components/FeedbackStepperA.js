import React from 'react';
import Layout from '../layout'
import FooterActions from './FooterActions';
import FeedBackForm from './forms/FeedBackForm'

import { connect } from 'react-redux';
import { updateState, setToState } from 'state/actions';

const FeedBackStepperA = (props) => {
    const { state, updateState } = props



    const handleChange = (e) => {
        console.log(e);
    }

    const onClickNext = () => {
        updateState(
            'oLiveChat',
            'initialScreen',
            3
        )
    }

    const onClickSkip = () => {
        updateState(
            'oLiveChat',
            'initialScreen',
            0
        )
        updateState(
            'oLiveChat',
            'widgetVisibility',
            false
        )
    }

    return (
        <Layout
            stemContent={
                <FeedBackForm
                    handleChange={handleChange}
                    formHeader={"1. Why Do You Think So ?"}
                />
            }
            footerContent={
                <FooterActions
                    handleSkipClick={onClickSkip}
                    handleNextClick={onClickNext}
                    primaryBtnText={"Next"}
                    secondaryBtnText={"Skip"}
                />
            }
        />
    )
}


const mapStateToProps = (state) => {
    return {
        state: state.formReducer.oLiveChat,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value))
})


export default connect(mapStateToProps, mapDispatchToProps)(FeedBackStepperA)

