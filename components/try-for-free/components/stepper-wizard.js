import React from 'react'
import Contact from '../Contact'
import Address from '../Address'
import Modules from '../Modules'
import Payment from '../Payment'
import Confirm from '../Confirm'

const StepperWizard = ({ brand, market, classes, steps, step, nextStep, propertyInfo, setPropertyInfo, registerTypes, registerType, registerTypeChange, fieldOptions, setPayableNow, payableNow, paymentGid, setPaymentGid, paymentTransId, setPaymentTransId, currencyInfo, setCurrencyInfo, setStepperLabelIsHide }) => {
    switch (step) {
        case steps.contactDetails.index:
            return <Contact brand={brand} classes={classes} fieldOptions={fieldOptions} steps={steps} nextStep={nextStep} propertyInfo={propertyInfo} setPropertyInfo={setPropertyInfo} registerTypes={registerTypes} registerType={registerType} registerTypeChange={registerTypeChange} setStepperLabelIsHide={setStepperLabelIsHide}/>
        case steps.addressDetails.index:
            return <Address classes={classes} fieldOptions={fieldOptions} steps={steps} nextStep={nextStep} propertyInfo={propertyInfo}/>
        case steps.moduleSelection.index:
            return <Modules brand={brand} market={market} classes={classes} fieldOptions={fieldOptions} registerTypes={registerTypes} registerType={registerType} steps={steps} nextStep={nextStep} propertyInfo={propertyInfo} setPayableNow={setPayableNow} setPaymentGid={setPaymentGid} setPaymentTransId={setPaymentTransId} currencyInfo={currencyInfo} setCurrencyInfo={setCurrencyInfo}/>
        case steps.payment.index:
            return <Payment brand={brand} registerType={registerType} classes={classes} fieldOptions={fieldOptions} steps={steps} nextStep={nextStep} propertyInfo={propertyInfo} payableNow={payableNow} paymentGid={paymentGid} paymentTransId={paymentTransId} currencyInfo={currencyInfo} setStepperLabelIsHide={setStepperLabelIsHide}/>
        case steps.confirmation.index:
            return <Confirm classes={classes} propertyInfo={propertyInfo} registerTypes={registerTypes} registerType={registerType}/>
        default:
            return <React.Fragment> Blank Page </React.Fragment>
    }
}

export default StepperWizard