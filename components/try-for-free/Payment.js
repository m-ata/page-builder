import React, { useContext, useEffect, useState } from 'react'
import { Button, Grid, InputAdornment } from '@material-ui/core'
import { Alert, AlertTitle, ToggleButton, ToggleButtonGroup } from '@material-ui/lab'
import { TcTextField, useStylesTc } from './components/fields'
import useTranslation from 'lib/translations/hooks/useTranslation'
import PaymentForm from 'components/payment/credit-card/form'
import * as global from '@webcms-globals'
import LoadingSpinner from 'components/LoadingSpinner'
import RefreshIcon from '@material-ui/icons/Refresh'
import WebCmsGlobal from 'components/webcms-global'
import getSymbolFromCurrency from 'model/currency-symbol'
import RadioButtonUncheckedOutlinedIcon from '@material-ui/icons/RadioButtonUncheckedOutlined'
import RadioButtonCheckedOutlinedIcon from '@material-ui/icons/RadioButtonCheckedOutlined'
import axios from 'axios'

const TRANSACTION_STATUS = {
    USE_PAY_FORM:0,
    SUCCESSFUL:1,
    ERROR:2
}

const SAVE_ERROR_TYPE = {
    SESSION_TIMEOUT: 'payment_transaction_completed_but_not_posted',
    PAYMENT_FAIL: 'payment_fail'
}

const propertyConfirm = ({propertyId = false, propertyCode = false, propertyContact = false, propertyPhone = false, propertyEmail = false, transId = false, registerType = false, brand = false, lang = false}) => {
    return axios({
        url: '/api/property/confirm',
        method: 'post',
        params: {
            propertyId: propertyId,
            propertyCode: propertyCode,
            propertyContact: propertyContact,
            propertyPhone: propertyPhone,
            propertyEmail: propertyEmail,
            transId: transId,
            registerType: registerType,
            brand: brand,
            lang: lang
        }
    }).then((response)=> {
        return response.data
    })
}

const propertyAltPayReq = ({propertyId = false, propertyCode = false, propertyContact = false, propertyPhone = false, propertyEmail = false, transId = false, registerType = false, brand = false}) => {
    return axios({
        url: '/api/property/alt/pay/request',
        method: 'post',
        params: {
            propertyId: propertyId,
            propertyCode: propertyCode,
            propertyContact: propertyContact,
            propertyPhone: propertyPhone,
            propertyEmail: propertyEmail,
            transId: transId,
            registerType: registerType,
            brand: brand
        }
    }).then((response)=> {
        return response.data
    })
}

const Payment = ({ classes, fieldOptions, payableNow, paymentGid, currencyInfo, nextStep, steps, propertyInfo, paymentTransId, registerType, brand, setStepperLabelIsHide }) =>{
    const { t } = useTranslation()
    const payFormInputClasses = useStylesTc()
    const { locale } = useContext(WebCmsGlobal)
    const paymentRanges = { monthly: 0, annual: 1 }
    const [creditCardInfo, setCreditCardInfo] = useState(false)
    const [creditCardIsValid, setCreditCardIsValid] = useState(false)
    const [creditCardError, setCreditCardError] = useState(false)
    const [redirectUrl, setRedirectUrl] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [payIsLoading, setPayIsLoading] = useState(false)
    const [transactionStatus, setTransactionStatus] = useState(0)
    const [transactionId, setTransactionId] = useState(false)
    const [errorMsg, setErrorMsg] = useState(false)
    const [isSaveError, setIsSaveError] = useState(false)
    const [numberOfAttempts, setNumberOfAttempts] = useState(0)
    const [paymentRange, setPaymentRange] = useState(paymentRanges.monthly)
    const [listenerMsg, setListenerMsg] = useState(false)
    const [isAltPayReqInfoPage, setIsAltPayReqInfoPage] = useState(false)

    useEffect(() => {
        window.addEventListener('message', (event)=> setListenerMsg(event) , false)
    }, [redirectUrl])

    useEffect(() => {
        if(redirectUrl && listenerMsg){
            getRedirectUrlCheckStatus(listenerMsg, paymentGid, paymentTransId, locale)
        }
    }, [listenerMsg])

    useEffect(() => {
        window.onbeforeunload = function (e) {
            if(isLoading){
                e.preventDefault();
                return e.returnValue = ''
            }
        }
    }, [isLoading])

    const getRedirectUrlCheckStatus = (event, paymentGid, paymentTransId, locale) =>{
        const response = event.data.response
        if (response && !isLoading) {
            setIsLoading(true)
            axios({
                url: '/api/ors/payment/save',
                method: 'post',
                params: {
                    isfail: !response.success,
                    transactionid: transactionId,
                    orderid: response.orderid,
                    langcode: locale,
                    sptransgid: paymentGid,
                    payrange: paymentRange,
                    reftype: 'SPTRANS',
                    refno: paymentTransId,
                },
            }).then(async (responsePaymentSave) => {
                if (responsePaymentSave.data.success) {
                    if(responsePaymentSave.data.processMsg === SAVE_ERROR_TYPE.PAYMENT_FAIL){
                        setTransactionStatus(TRANSACTION_STATUS.ERROR)
                        setErrorMsg(response.errormsg)
                        setTransactionId(false)
                        setIsLoading(false)
                        setListenerMsg(false)
                    }else{
                        const isDone = await propertyConfirm(
                            {
                                propertyId: propertyInfo.propertyId,
                                propertyCode: propertyInfo.propertyCode,
                                propertyContact: propertyInfo.propertyContact,
                                propertyPhone: propertyInfo.propertyPhone,
                                propertyEmail: propertyInfo.propertyEmail,
                                registerType: registerType,
                                brand: brand,
                                lang: locale
                            }
                        )

                        if(isDone.success){
                            setTransactionStatus(TRANSACTION_STATUS.SUCCESSFUL)
                            setTransactionId(false)
                            setIsLoading(false)
                            nextStep(steps.confirmation.index)
                        }
                    }
                }else{
                    setTransactionStatus(TRANSACTION_STATUS.ERROR)
                    if(responsePaymentSave.data.processMsg === SAVE_ERROR_TYPE.SESSION_TIMEOUT){
                        setIsSaveError(true)
                        setErrorMsg(t('str_paymentTransactionSuccessButSessionTimeout', {transid: response.orderid || ''}))
                        setIsLoading(false)
                        setTransactionId(false)
                        setListenerMsg(false)
                    }else{
                        setErrorMsg(response.errormsg)
                        setIsLoading(false)
                        setTransactionId(false)
                        setListenerMsg(false)
                    }
                }
            }).catch(() => {
                setTransactionStatus(TRANSACTION_STATUS.ERROR)
                setErrorMsg(response.errormsg)
                setIsLoading(false)
                setTransactionId(false)
                setListenerMsg(false)
            })
        } else {
            setTransactionStatus(TRANSACTION_STATUS.ERROR)
            setErrorMsg(response.errormsg)
            setIsLoading(false)
            setTransactionId(false)
            setListenerMsg(false)
        }
    }

    const handlePaymentRangeChange = (event, newPaymentRange) => {
        if(!payIsLoading){
            setPaymentRange(newPaymentRange === null ? paymentRanges.monthly : newPaymentRange)
        }
    }

    const handlePayTryAgain = () => {
        setIsLoading(true)
        setTimeout(()=> {
            setIsLoading(false)
            setErrorMsg(false)
            setRedirectUrl(false)
            setTransactionStatus(0)
        }, 1000)
    }

    const handlePayment = () => {
        if (creditCardIsValid.isError || !creditCardIsValid.isValid) {
            setCreditCardError(true)
        } else {
            setCreditCardError(false)
            setNumberOfAttempts(prevState => prevState + 1)
            setPayIsLoading(true)
            const postData = {
                cardOwner: creditCardInfo.cardOwner,
                cardNumber: creditCardInfo.cardNumber.replace(/\\s/g, ''),
                cardExpiry: creditCardInfo.cardExpiry,
                cardCvc: creditCardInfo.cardCvc,
            }

            setPayIsLoading(true)
            return axios({
                url: '/api/ors/payment/do',
                method: 'post',
                params: {
                    gid: paymentGid,
                    masterId: false,
                    paymentRange: paymentRange
                },
                data: postData,
            }).then((response) => {
                if (response.data.success) {
                    setPayIsLoading(false)
                    setTransactionId(response.data.transactionid)
                    setRedirectUrl(response.data.redirecturl)
                    return true
                } else {
                    setPayIsLoading(false)
                    return false
                }
            }).catch(() => {
                setPayIsLoading(false)
                return false
            })
        }
    }

    const handleAltPayRequest = async () => {
        const isDone = await propertyAltPayReq(
            {
                propertyId: propertyInfo.propertyId,
                propertyCode: propertyInfo.propertyCode,
                propertyPhone: propertyInfo.propertyPhone,
                propertyContact: propertyInfo.propertyContact,
                propertyEmail: propertyInfo.propertyEmail,
                registerType: registerType,
                brand: brand
            }
        )

        if(isDone.success){
            setStepperLabelIsHide(true)
            setIsAltPayReqInfoPage(true)
        }
    }

    if(isAltPayReqInfoPage){
        return (
            <Alert severity='info' style={{ marginBottom: 20 }}>
                {t('str_yourRequestHasBeenForwardedToOurTeamTheyWillPerformTheChecksAndContactYouAsSoonAsPossible')}
            </Alert>
        )
    }

    return (
        <React.Fragment>
            {redirectUrl ?
                (
                    <Grid container spacing={2} justify='space-between'>
                        <Grid item xs={12}>
                            {isLoading ? (
                                <div style={{ height: 400, position: 'relative' }}>
                                    <LoadingSpinner size={40} style={{ position: 'absolute', top: '40%', left: '50%' }} />
                                </div>
                            ) : transactionStatus === TRANSACTION_STATUS.USE_PAY_FORM && redirectUrl ? (
                                <div>
                                    <iframe
                                        allowpaymentrequest='true'
                                        target='self'
                                        src={redirectUrl}
                                        style={{
                                            width: '100%',
                                            minHeight: '400px',
                                            height: '100%',
                                            border: '0px',
                                            display: 'block',
                                        }}
                                    />
                                </div>
                            ) : transactionStatus === TRANSACTION_STATUS.ERROR ? (
                                <React.Fragment>
                                    {isSaveError ? (
                                        <React.Fragment>
                                            <Alert severity='error' style={{ marginBottom: 20 }}>
                                                <AlertTitle>{t('str_error')}</AlertTitle>
                                                {errorMsg}
                                            </Alert>
                                            <Button variant='outlined' color='primary' startIcon={<RefreshIcon />} onClick={() => handlePayTryAgain()}>{t('str_tryAgain')}</Button>
                                        </React.Fragment>
                                    ) : (
                                        <React.Fragment>
                                            <Alert severity='error' style={{ marginBottom: 20 }}>
                                                {t('str_paymentTransactionError')}<br />
                                                <strong>{t('str_detail')}:</strong> {errorMsg || ''}
                                            </Alert>
                                            {numberOfAttempts >= 2 ? (
                                                <Alert action={<Button color='inherit' size='small' variant='outlined' onClick={()=> handleAltPayRequest()}>{t('str_yes')}</Button>} severity='info' style={{ marginBottom: 20 }}>
                                                    {t('str_wouldYouLikeUsToContactYouForAnAlternativePaymentMethod')}
                                                </Alert>
                                            ) : null}
                                            <Button variant='outlined' color='primary' startIcon={<RefreshIcon />} onClick={() => handlePayTryAgain()}>{t('str_tryAgain')}</Button>
                                        </React.Fragment>
                                    )}
                                </React.Fragment>
                            ) : null}
                        </Grid>
                    </Grid>) : (
                    <Grid container spacing={2} justify='space-between'>
                        <Grid item xs={12}>
                            {creditCardError ? (
                                <Alert severity='warning' style={{ marginBottom: 15 }}>
                                    {t('str_pleaseCheckYourCardInformation')}
                                </Alert>
                            ) : null}
                            <PaymentForm
                                isDisabled={payIsLoading}
                                showCard={true}
                                onChange={(e) => setCreditCardInfo(e)}
                                isValid={(e) => setCreditCardIsValid(e)}
                                fieldVariant={fieldOptions.variant}
                                fieldSize={fieldOptions.size}
                                customInputProps={{ classes: payFormInputClasses, disableUnderline: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <Grid container spacing={1}>
                                <Grid item xs={7}>
                                    <ToggleButtonGroup
                                        className={classes.toogleButtonGroup}
                                        color='primary'
                                        value={paymentRange}
                                        exclusive
                                        onChange={handlePaymentRangeChange}
                                    >
                                        <ToggleButton
                                            className={classes.toogleButton}
                                            value={paymentRanges.monthly}
                                        >
                                            {paymentRange === paymentRanges.monthly ?
                                                <RadioButtonCheckedOutlinedIcon color='primary' /> :
                                                <RadioButtonUncheckedOutlinedIcon />} <span
                                            className={classes.toogleButtonLabel}>{t('str_monthly')}</span>
                                        </ToggleButton>
                                        <ToggleButton
                                            className={classes.toogleButton}
                                            value={paymentRanges.annual}
                                        >
                                            {paymentRange === paymentRanges.annual ?
                                                <RadioButtonCheckedOutlinedIcon color='primary' /> :
                                                <RadioButtonUncheckedOutlinedIcon />} <span
                                            className={classes.toogleButtonLabel}>{t('str_yearly')}</span>
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </Grid>
                                <Grid item xs={5}>
                                    <TcTextField
                                        label={t('str_payableNow')}
                                        variant={fieldOptions.variant}
                                        fullWidth={fieldOptions.fullWidth}
                                        size={fieldOptions.size}
                                        value={global.helper.formatPrice(paymentRanges.annual === paymentRange ? payableNow * 11 : payableNow * 1)}
                                        InputProps={{
                                            readOnly: true,
                                            endAdornment: (
                                                <InputAdornment position='start'>
                                                    {currencyInfo?.code && getSymbolFromCurrency(currencyInfo.code) || ''}
                                                </InputAdornment>
                                            ),
                                        }}
                                        inputProps={{
                                            style: { textAlign: 'right' },
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} sm={4} style={{ textAlign: 'right' }}>
                            <Button
                                disabled={payIsLoading}
                                variant='contained'
                                size='large'
                                color='primary'
                                disableElevation onClick={() => handlePayment()}
                                endIcon={payIsLoading ? <LoadingSpinner size={16}/> : null}
                            >
                                {t('str_next')}
                            </Button>
                        </Grid>
                    </Grid>
                )}
        </React.Fragment>
    )
}

export default Payment