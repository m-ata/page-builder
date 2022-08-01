import React from "react";
//material ui imports
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepConnector from '@material-ui/core/StepConnector';
import BrushIcon from '@material-ui/icons/Brush';
import WebAssetIcon from '@material-ui/icons/WebAsset';
import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles'
//custom improts
import Style from "../../steps/assets/Style";
import Asset from "../../steps/assets/Asset";
import {COLORS} from "../../constants";
//redux import
import {connect} from "react-redux";
import {updateState} from "../../../../../state/actions";
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    actionButtons: {
        display: 'flex',
        justifyContent: 'flex-start',
        marginTop: theme.spacing(2),
    },
    actionButton: {
        borderRadius: 20,
        marginBottom: 16,
        backgroundColor: COLORS?.secondary
    },
    backButton: {
        borderRadius: 20,
        marginBottom: 16,
    }
}))

const useColorStepIconStyle = makeStyles(() => ({
    root: {
        backgroundColor: '#ccc',
        zIndex: 1,
        color: '#fff',
        width: 65,
        height: 65,
        display: 'flex',
        borderRadius: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        '& img': {
            width: 35,
        },
    },
    iconSize: {
        height: 50,
        width: 50,
    },
    active: {
        backgroundColor: COLORS?.secondary,
        boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
    },
    completed: {
        backgroundColor: COLORS?.primary,
        color: '#fff',
    },
}))

const ColorlibConnector = withStyles({
    alternativeLabel: {
        top: 30,
        left: 'calc(-50% + 10px)',
        right: 'calc(50% + 10px)',
    },
    active: {
        '& $line': {
            background: 'transparent linear-gradient(270deg, #269DD4 0%, #0F4571 100%) 0% 0% no-repeat padding-box',
        },
    },
    completed: {
        '& $line': {
            backgroundColor: COLORS.primary,
        },
    },
    line: {
        height: 4,
        border: 0,
        backgroundColor: '#eaeaf0',
        borderRadius: 1,
    },
})(StepConnector)

const getStepsIcons = (step, isActive, isCompleted) => {
    const icon_classes = useColorStepIconStyle()
    let icons = {
        0: <BrushIcon className={icon_classes.iconSize} />,
        1: <WebAssetIcon className={icon_classes.iconSize} />,
    }

    return (
        <div
            className={clsx(icon_classes.root, {
                [icon_classes.active]: isActive,
                [icon_classes.completed]: isCompleted,
            })}
        >
            {icons[step]}
        </div>
    )
}

const GenericAsset = (props) => {

    const { state, updateState, handleSaveAssets } = props;
    const steps = ['Style', 'Assets'];
    const classes = useStyles();

    const handleNext = () => {
        if (state.pageStep === 1) {
            handleSaveAssets()
        } else {
            updateState('pageBuilder', 'previousStep', state.pageStep);
            updateState('pageBuilder', 'pageStep', state.pageStep + 1);
        }
    }

    const handleBack =  () => {
        updateState('pageBuilder', 'pageStep', state.pageStep - 1);
    }

    return(
        <React.Fragment>
            <Stepper activeStep={state.pageStep } alternativeLabel connector={<ColorlibConnector />}>
                {steps.map((label, index) => {
                    return (
                        <Step key={`step-${index}`}>
                            <StepLabel
                                color="secondary"
                                StepIconComponent={() =>
                                    getStepsIcons(index, state.pageStep === index, state.pageStep > index )
                                }
                            >
                                {label}
                            </StepLabel>
                        </Step>
                    )
                })}
            </Stepper>
            <Grid container direction="row" justify="flex-start" alignItems="flex-start">
                {
                    state.pageStep === 0 && <Style />
                }
                {
                    state.pageStep === 1 && <Asset />
                }
            </Grid>
            <Grid container direction="row" justify="flex-end" alignItems="flex-end">
                <div className={classes.actionButtons}>
                    {
                        state.pageStep !== 0 && (
                            <Button
                                onClick={handleBack}
                                variant="contained"
                                size="small"
                                aria-label="add"
                                className={classes.backButton}
                                style={{marginRight: 8}}
                            >
                                BACK
                            </Button>
                        )
                    }
                    <Button
                        onClick={handleNext}
                        variant="contained"
                        size="small"
                        color="primary"
                        aria-label="add"
                        className={classes.actionButton}
                        style={{marginRight: 24}}
                        // disabled={handleNextDisable() ? true : false}
                    >
                        {state.pageStep === 1 ? 'SAVE' : 'NEXT'}
                    </Button>
                </div>
            </Grid>
        </React.Fragment>
    );
};

const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
};

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(GenericAsset)