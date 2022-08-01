import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import SentimentVerySatisfiedIcon from '@material-ui/icons/SentimentVerySatisfied';
import SentimentSatisfiedAltIcon from '@material-ui/icons/SentimentSatisfiedAlt';
import SentimentSatisfiedIcon from '@material-ui/icons/SentimentSatisfied';
import SentimentDissatisfiedIcon from '@material-ui/icons/SentimentDissatisfied';
import SentimentVeryDissatisfiedIcon from '@material-ui/icons/SentimentVeryDissatisfied';

import { COLORS } from '../../constants';

import { connect } from 'react-redux';
import { updateState, setToState } from 'state/actions';

import FooterActions from './FooterActions';
import Layout from '../layout'
import useTranslation from 'lib/translations/hooks/useTranslation'




const useStyles = makeStyles({
    root: {
        maxHeight: '100%'
    },
    headerStyles: {
        padding: '20px 0',
        fontSize: 16
    },
    ratingFeedBack: {
        maxHeight: '100%',
        position: 'relative',
        cursor: 'pointer',
        color: COLORS.backgroundLight,
        display: 'flex',
        alignItems: 'center',
        margin: '0px 0 15px 15px'
    },
    ratingFeedBackLabel: {
        color: COLORS.secondaryDark,
        marginLeft: '10px'
    }
});





const Rating = (props) => {
    const { t } = useTranslation()
    const classes = useStyles()
    const { state, setToState, updateState } = props

    const setSentimentColor = (userRating) => {
        if (userRating == state.rating.figure) {
            return {
                color: state.rating.color
            }
        } return {
            color: ""
        }
    }

    const renderLabel = (labelText) => {
        return (
            <Typography variant="subtitle2"
                className={classes.ratingFeedBackLabel}
            >
                {labelText}
            </Typography>
        )
    }

    const onClickNext = () => {
        if (state.rating.figure < 4) {
            updateState(
                'oLiveChat',
                'initialScreen',
                2
            )
        } else {
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
                <section className={classes.root}>
                    <Typography variant="h6" component={'div'} fontWeight={700}
                        className={classes.headerStyles}>
                        {t('str_howSatisfiedAreYou')}
                        </Typography>
                    <div
                        onClick={() => {
                            setToState('oLiveChat', ['rating', 'color'], COLORS.colorSatisfied)
                            setToState('oLiveChat', ['rating', 'figure'], 5)
                        }}
                        className={classes.ratingFeedBack}
                    >
                        <SentimentVerySatisfiedIcon
                            style={{
                                ...setSentimentColor(5),
                                fontSize: '40px'
                            }}
                        />
                        <Typography variant="subtitle2"
                            className={classes.ratingFeedBackLabel}
                            style={setSentimentColor(5)}
                        >
                            {t('str_verySatisfied')}
                        </Typography>
                    </div>
                    <div
                        onClick={() => {
                            setToState('oLiveChat', ['rating', 'color'], COLORS.secondaryDark)
                            setToState('oLiveChat', ['rating', 'figure'], 4)
                        }}
                        className={classes.ratingFeedBack}>
                        <SentimentSatisfiedAltIcon
                            style={{
                                ...setSentimentColor(4),
                                fontSize: '40px'
                            }}
                        />
                        <Typography variant="subtitle2"
                            className={classes.ratingFeedBackLabel}
                            style={setSentimentColor(4)}
                        >
                            {t('str_somewhatSatisfied')}
                            </Typography>
                    </div>
                    <div
                        onClick={() => {
                            setToState('oLiveChat', ['rating', 'color'], COLORS.secondaryDark)
                            setToState('oLiveChat', ['rating', 'figure'], 3)
                        }}
                        className={classes.ratingFeedBack}>
                        <SentimentSatisfiedIcon
                            style={{
                                ...setSentimentColor(3),
                                fontSize: '40px'
                            }} />
                        <Typography variant="subtitle2"
                            className={classes.ratingFeedBackLabel}
                            style={setSentimentColor(3)}
                        >
                            {t('str_noSatisfiedNoDissatisfied')}
                            </Typography>
                    </div>
                    <div
                        onClick={() => {
                            setToState('oLiveChat', ['rating', 'color'], COLORS.secondaryDark)
                            setToState('oLiveChat', ['rating', 'figure'], 2)
                        }}
                        className={classes.ratingFeedBack}>
                        <SentimentDissatisfiedIcon
                            style={{
                                ...setSentimentColor(2),
                                fontSize: '40px'
                            }} />
                        <Typography variant="subtitle2"
                            className={classes.ratingFeedBackLabel}
                            style={setSentimentColor(2)}
                        >
                            {t('str_somewhatDissatisfied')}
                            </Typography>
                    </div>
                    <div
                        onClick={() => {
                            setToState('oLiveChat', ['rating', 'color'], COLORS.colorDisatisfied)
                            setToState('oLiveChat', ['rating', 'figure'], 1)
                        }}
                        className={classes.ratingFeedBack}
                    >
                        <SentimentVeryDissatisfiedIcon
                            style={{
                                ...setSentimentColor(1),
                                fontSize: '40px'
                            }}
                        />
                        <Typography variant="subtitle2"
                            className={classes.ratingFeedBackLabel}
                            style={setSentimentColor(1)}
                        >
                            {t('str_veryDisSatisfied')}
                            </Typography>
                    </div>
                </section>
            }
            footerContent={
                <FooterActions
                    handleSkipClick={onClickSkip}
                    handleNextClick={onClickNext}
                    primaryBtnText={state.rating.figure > 3 ? "Submit" : "Next"}
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


export default connect(mapStateToProps, mapDispatchToProps)(Rating)
