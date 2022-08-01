import React, {useState} from 'react'
import StepperLabel from './components/stepper-label'
import StepperWizard from './components/stepper-wizard'
import Container from '@material-ui/core/Container'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { createTheme, registerTypes, fieldOptions } from './style/theme'
import tryForFreeStyle from './style'

const TryForFree = ({brand, market}) => {
    const classes = tryForFreeStyle()
    const [step, setStep] = useState(0)
    const [propertyInfo, setPropertyInfo] = useState(false)
    const [registerType, setRegisterType] = useState('demo')
    const [payableNow, setPayableNow] = useState(0)
    const [paymentTransId, setPaymentTransId] = useState(false)
    const [paymentGid, setPaymentGid] = useState(false)
    const [currencyInfo, setCurrencyInfo] = useState(false)
    const [stepperLabelIsHide, setStepperLabelIsHide] = useState(false)

    const handleNextStep = (step) => {
        setStep(step)
    }

    const handleRegisterTypeChange = (event, newRegisterType) => {
        setRegisterType(prevState => newRegisterType ? newRegisterType : prevState)
    }

    const steps = {
        contactDetails: {
            index: 0,
            label: 'str_contact',
            active: true
        },
        addressDetails: {
            index: registerTypes.demo === registerType ? -1 : 1,
            label: 'str_address',
            active: registerTypes.demo !== registerType,
        },
        moduleSelection: {
            index: registerTypes.demo === registerType ? 1 : 2,
            label: 'str_modules',
            active: true
        },
        payment: {
            index: registerTypes.demo === registerType ? -3 : 3,
            label: 'str_payment',
            active: registerTypes.demo !== registerType,
        },
        confirmation: {
            index: registerTypes.demo === registerType ? 2 : 4,
            label: 'str_confirm',
            active: false
        }
    }

    return (
        <MuiThemeProvider theme={createTheme(brand)}>
            <Container className={classes.tryCloudContainer} maxWidth='sm'>
                {!stepperLabelIsHide ? <StepperLabel classes={classes} steps={steps} step={step} /> : null}
                <StepperWizard
                    brand={brand}
                    market={market}
                    classes={classes}
                    steps={steps}
                    step={step}
                    nextStep={handleNextStep}
                    propertyInfo={propertyInfo}
                    setPropertyInfo={setPropertyInfo}
                    registerTypes={registerTypes}
                    registerType={registerType}
                    registerTypeChange={handleRegisterTypeChange}
                    fieldOptions={fieldOptions}
                    payableNow={payableNow}
                    setPayableNow={setPayableNow}
                    paymentTransId={paymentTransId}
                    setPaymentTransId={setPaymentTransId}
                    paymentGid={paymentGid}
                    setPaymentGid={setPaymentGid}
                    currencyInfo={currencyInfo}
                    setCurrencyInfo={setCurrencyInfo}
                    setStepperLabelIsHide={setStepperLabelIsHide}
                />
            </Container>
        </MuiThemeProvider>
    )
}

export default TryForFree