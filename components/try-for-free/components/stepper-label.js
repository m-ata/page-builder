import React from 'react'
import {Stepper, Step, StepLabel} from '@material-ui/core'
import useTranslation from 'lib/translations/hooks/useTranslation'

const StepperLabel = ({ classes, steps, step }) => {
    const { t } = useTranslation()

    if(steps.confirmation.index === step){
        return null
    }

    return (
        <Stepper nonLinear activeStep={step} className={classes.stepperLabel}>
            {Object.keys(steps).map((key) => {
                if (steps[key].active) {
                    return (
                        <Step key={key}>
                            <StepLabel>
                                {t(steps[key].label)}
                            </StepLabel>
                        </Step>
                    )
                }
            })}
        </Stepper>
    )
}

export default StepperLabel