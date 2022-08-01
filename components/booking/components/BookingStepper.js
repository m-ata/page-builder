import React from 'react'
import { Stepper, Step, StepLabel, Hidden, Typography, CircularProgress, Box } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import useTranslation from 'lib/translations/hooks/useTranslation'

const mobileStepper = makeStyles(() => ({
    root: {
        display: 'flex',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        border: '1px solid #dadadd',
        borderRadius: 6,
        '& > div': {
            textAlign: 'start',
            padding: '16px 20px 16px 20px',
            borderLeft: '1px solid #d2d2d26b',
            '&:first-child': {
                borderLeft: 'none',
            },
        },
    },
    progress: {
        flexGrow: 3,
        textAlign: 'center!important',
        padding: '19px 16px 13px 16px!important'
    },
    stepper: {
        flexGrow: 8,
    },
    circle: {
        borderRadius: '60%',
        boxShadow: 'inset 0 0 1px 3px #ebebeb'
    }
}))

function StepperProgress(props) {
    const mobileClasses = mobileStepper()

    return (
        <Box position="relative" display="inline-flex">
            <CircularProgress
                classes={{
                    root: mobileClasses.circle,
                }}
                variant="determinate" value={Math.round(props.value * 100 / props.total)}/>
            <Box
                top={0}
                left={0}
                bottom={0}
                right={0}
                position="absolute"
                display="flex"
                alignItems="center"
                justify="center"
            >
                <Typography variant="caption" component="div" style={{ marginLeft: 8, marginTop: 2 }} color="textSecondary">{`${Math.round(props.value)} / ${Math.round(props.total)}`}</Typography>
            </Box>
        </Box>
    )
}

const BookingStepper = (props) => {
    const { activeStep, steps, classes } = props
        , forMobile = ['md', 'lg', 'xl']
        , forDesktop = ['xs', 'sm']
        , mobileClasses = mobileStepper()
        , { t } = useTranslation()
        , nextStep = steps.findIndex(step => step.code === activeStep) + 1
        , isFinalStep = nextStep === steps.length

    const getActiveStep = (isFinalStep, nextStep, steps, activeStep) => {
        if (isFinalStep) {
            return steps.length
        } else {
            const getStepIndex = steps.findIndex(step => step.code === activeStep)
            if (getStepIndex >= 0) {
                return getStepIndex
            } else {
                return 0
            }
        }
    }

    return (
        <React.Fragment>
            <Hidden only={forMobile}>
                <div className={mobileClasses.root}>
                    <div className={mobileClasses.progress}>
                        <StepperProgress value={nextStep} total={steps.length}/>
                    </div>
                    <div className={mobileClasses.stepper}>
                        <Typography component="div" variant="body1" color="textPrimary">
                            {t(steps[steps.findIndex(step => step.code === activeStep)].label)}
                        </Typography>
                        {!isFinalStep ? (
                            <Typography component="div" variant="subtitle2" color="textSecondary">
                                {t('str_nextStep')}: {t(steps[nextStep].label)}
                            </Typography>
                        ) : <Typography component="div" variant="subtitle2" color="textSecondary">
                            {t('str_youAreInTheLastStep')}
                        </Typography>
                        }
                    </div>
                </div>
            </Hidden>
            <Hidden only={forDesktop}>
                <Stepper classes={classes} activeStep={getActiveStep(isFinalStep, nextStep, steps, activeStep)}>
                    {steps.map((step) => {
                        return (
                            <Step key={step.code}>
                                <StepLabel>{t(step.label)}</StepLabel>
                            </Step>
                        )
                    })}
                </Stepper>
            </Hidden>
        </React.Fragment>
    )
}

export default BookingStepper