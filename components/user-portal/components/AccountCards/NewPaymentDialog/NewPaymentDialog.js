import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles'
import { connect } from 'react-redux';
import { Button, Grid, Typography, FormControl, RadioGroup, FormControlLabel, TextField, Divider, InputAdornment } from '@material-ui/core'
import { AccountCircle, CreditCard, DateRange, Lock } from '@material-ui/icons'
import useTranslation from '../../../../../lib/translations/hooks/useTranslation';
import CustomRadioButton from '../../CustomRadioButton/CustomRadioButton';
import { formatCreditCardNumber, formatCVC, formatExpirationDate } from '../../../../payment/credit-card/utils';
import CreditCards from '../../../../payment/credit-card/card';
import {setToState} from '../../../../../state/actions';
import useNotifications from '../../../../../model/notification/useNotifications';


const useStyles = makeStyles((theme) => ({
    root: {
        padding: "64px",
        [theme.breakpoints.down("md")]: {
            padding: "32px"
        },
        [theme.breakpoints.only("xs")]: {
            padding: "24px"
        },
        
    },
    mainTitle: {
        paddingBottom: "8px",
        fontSize: "25px",
        fontWeight: "600",
        color: "#43425D"
    },
    subTitle: {
        paddingBottom: "8px",
        fontSize: "15px",
        fontWeight: "500",
        color: "#43425D",
        
    },
    radioButtonLabel: {
        "&.MuiFormControlLabel-root": {
            paddingLeft:"35px",
            [theme.breakpoints.down("md")]: {
                paddingLeft:"0",
            },
        },
    },
    textFieldStyle: {
        fontSize: "15px",
        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                //border: "1px solid #4666B0",
            },
            "&:hover fieldset": {
                borderColor: "#4666B0"
            },
            "&.Mui-focused fieldset": {
                borderColor: "#4666B0",
            },
        },
        "& input": {
            fontSize: "15px",
        }
    },
    creditCardDiv: {
        alignSelf: "center",
        textAlign: "-webkit-center",
        [theme.breakpoints.down("sm")]: {
            textAlign:"left",
        },
    },
    cancelButton: {
        //fontSize: "20px",
        fontWeight: "500",
        color: "#43425D",
        textTransform: "none"
    },
    saveButton: {
        //fontSize: "20px",
        fontWeight: "500",
        color: "#FFF",
        textTransform: "none",
        backgroundColor: "#4666B0",
        "&:hover": {
            backgroundColor: "#4666B0",
        }
    }
}))

function NewPaymentDialog(props) {
    const classes = useStyles();
    
    const { onChange, isValid, locale, setToState, state, dialogClose, editCardInfo, isEdit, arrayIndex, handleEditComplete } = props;
    
    const { t } = useTranslation();
    const { showSuccess, showError } = useNotifications();
    const [paymentType, setPaymentType] = useState("1");
    
    const paymentTypes = {
        paypal: "0",
        creditCard: "1",
        internetBanking: "2"
    }
    
    const [creditCardInfo, setCreditCardInfo] = useState(isEdit ? editCardInfo : {
        cardType: undefined,
        cardNumber: '',
        cardOwner: '',
        cardExpiry: '',
        cardCvc: '',
        cardIssuer: '',
        cardFocused: '',
        cardFormData: undefined,
        cardIsValid: false,
        paymentType: 'str_creditCard'
    })
    
    const [ccIsError, setCcIsError] = useState({
        cardNumber: false,
        cardOwner: false,
        cardExpiry: false,
        cardCvc: false,
    })
    
    const ccConst = {
        numberTextFieldId: 'credit-card-number',
        expiryTextFieldId: 'credit-card-expiry',
        cvcTextFieldId: 'credit-card-cvc',
        ownerTextFieldId: 'credit-card-name',
    }
    
    const handlePaymentChange = (event) => {
        setPaymentType(event.target.value);
    }
    
    const handleSave = () => {
        if( creditCardInfo.cardOwner !== '' && creditCardInfo.cardNumber !== '' &&
            creditCardInfo.cardExpiry !== '' && creditCardInfo.cardCvc !== '') {
            if(creditCardInfo.cardIsValid) {
                let array = state.account.paymentList;
                if(isEdit) {
                    array[arrayIndex] = creditCardInfo;
                    dialogClose();
                    handleEditComplete();
                } else {
                    array.push(creditCardInfo);
                    setToState("userPortal", ['account' , 'paymentList'], array)
                    if(array.length > 0) {
                        dialogClose();
                    }
                }
            } else {
                showError("Please enter a valid card number")
            }
        } else {
            showError("Fields cannot be empty")
        }
        
    }
    
    const handleCancel = () => {
        dialogClose();
        handleEditComplete();
    }
    
    useEffect(() => {
        onChange(creditCardInfo)
        isValid(isCardComplete())
    }, [creditCardInfo])
    
    const handleCallback = (cardType, isValid) => {
        let issuer = cardType.issuer
        if (!issuer) isValid = false
        if (isValid) {
            setCreditCardInfo({
                ...creditCardInfo,
                cardType: cardType,
                cardIssuer: issuer,
                cardIsValid: true,
            })
        } else {
            issuer = ''
            setCreditCardInfo({
                ...creditCardInfo,
                cardType: cardType,
                cardIssuer: issuer,
                cardIsValid: false,
            })
        }
    }
    
    const handleInputFocus = ({ target }) => {
        if (target.id === ccConst.numberTextFieldId) {
            setCreditCardInfo({ ...creditCardInfo, cardFocused: 'number' })
        } else if (target.id === ccConst.ownerTextFieldId) {
            setCreditCardInfo({ ...creditCardInfo, cardFocused: 'name' })
        } else if (target.id === ccConst.expiryTextFieldId) {
            setCreditCardInfo({ ...creditCardInfo, cardFocused: 'expiry' })
        } else if (target.id === ccConst.cvcTextFieldId) {
            setCreditCardInfo({ ...creditCardInfo, cardFocused: 'cvc' })
        }
    }
    
    const handleInputBlur = ({ target }) => {
        const id = target.id
        let numberTextFieldId = ccConst.numberTextFieldId
        let expiryTextFieldId = ccConst.expiryTextFieldId
        let cvcTextFieldId = ccConst.cvcTextFieldId
        let ownerTextFieldId = ccConst.ownerTextFieldId
        
        let creditCard = isCardNumberComplete()
        if (id === ownerTextFieldId) {
            if (isCardOwnerComplete() && creditCard.isError) {
                setCcIsError({
                    ...ccIsError,
                    cardOwner: true,
                })
            }
        }
        
        if (id === numberTextFieldId) {
            if (creditCard && creditCard.isError) {
                setCcIsError({
                    ...ccIsError,
                    cardNumber: true,
                })
            }
        }
        
        if (id === expiryTextFieldId) {
            creditCard = isCardExpiryComplete(creditCard)
            if (creditCard && creditCard.isError) {
                setCcIsError({
                    ...ccIsError,
                    cardExpiry: true,
                })
            }
        }
        
        if (id === cvcTextFieldId) {
            creditCard = isCardCvcComplete(creditCard)
            if (creditCard && creditCard.isError) {
                setCcIsError({
                    ...ccIsError,
                    cardCvc: true,
                })
            }
        }
        
        setCreditCardInfo({ ...creditCardInfo, cardFocused: '' })
    }
    
    const handleInputChange = ({ target }) => {
        let cardFormData = [
            creditCardInfo.cardNumber,
            creditCardInfo.cardExpiry,
            creditCardInfo.cardCvc,
            creditCardInfo.cardOwner,
            creditCardInfo.cardIssuer,
        ]
        if (target.id === ccConst.numberTextFieldId) {
            setCcIsError({ ...ccIsError, cardNumber: false })
            target.value = formatCreditCardNumber(target.value)
            cardFormData[0] = target.value
            setCreditCardInfo({ ...creditCardInfo, cardNumber: target.value, cardFormData: cardFormData })
        } else if (target.id === ccConst.ownerTextFieldId) {
            setCcIsError({ ...ccIsError, cardOwner: false })
            target.value = target.value.toUpperCase()
            cardFormData[3] = target.value
            setCreditCardInfo({ ...creditCardInfo, cardOwner: target.value, cardFormData: cardFormData })
        } else if (target.id === ccConst.expiryTextFieldId) {
            setCcIsError({ ...ccIsError, cardExpiry: false })
            cardFormData[1] = target.value
            target.value = formatExpirationDate(target.value)
            setCreditCardInfo({ ...creditCardInfo, cardExpiry: target.value, cardFormData: cardFormData })
        } else if (target.id === ccConst.cvcTextFieldId) {
            setCcIsError({ ...ccIsError, cardCvc: false })
            cardFormData[2] = target.value
            target.value = formatCVC(target.value)
            setCreditCardInfo({ ...creditCardInfo, cardCvc: target.value, cardFormData: cardFormData })
        }
    }
    
    const onKeyUp = (id, event) => {
        let numberTextFieldId = ccConst.numberTextFieldId
        let expiryTextFieldId = ccConst.expiryTextFieldId
        let cvcTextFieldId = ccConst.cvcTextFieldId
        let ownerTextFieldId = ccConst.ownerTextFieldId
        
        let creditCard = isCardNumberComplete()
        if (id === numberTextFieldId) {
            if (creditCard && !creditCard.isError) {
                document.getElementById(expiryTextFieldId).focus()
            }
        } else if (id === expiryTextFieldId) {
            if (creditCard && !creditCard.isError) {
                creditCard = isCardExpiryComplete(creditCard)
            }
            if (creditCard && !creditCard.isError) {
                document.getElementById(cvcTextFieldId).focus()
            }
        } else if (id === cvcTextFieldId) {
            if (creditCard && !creditCard.isError) creditCard = isCardExpiryComplete(creditCard)
            if (creditCard && !creditCard.isError) creditCard = isCardCvcComplete(creditCard)
            if (creditCard && !creditCard.isError) {
                document.getElementById(ownerTextFieldId).focus()
            }
        }
    }
    
    const isCardComplete = () => {
        let creditCard = isCardNumberComplete()
        if (creditCard && !creditCard.isError) {
            creditCard = isCardExpiryComplete(creditCard)
        }
        
        if (creditCard && !creditCard.isError) {
            creditCard = isCardCvcComplete(creditCard)
        }
        if (creditCard && !creditCard.isError) {
            let cardOwner = creditCardInfo.cardOwner
            creditCard.owner = cardOwner
            let _isError = cardOwner && cardOwner.length >= 2 ? false : true
            creditCard.isError = _isError
        }
        return creditCard
    }
    
    const isCardOwnerComplete = () => {
        let cardOwner = creditCardInfo.cardOwner
        let _isError = cardOwner.length > 2 ? false : true
        return _isError
    }
    
    const isCardNumberComplete = () => {
        let cardType = creditCardInfo.cardType
        let cardIsValid = creditCardInfo.cardIsValid
        let cardNumber = creditCardInfo.cardNumber
        
        let creditCard = {}
        creditCard.type = cardType
        creditCard.isValid = cardIsValid
        creditCard.number = cardNumber
        
        let _isError = cardType && cardIsValid && cardType.issuer && cardType.maxLength ? false : true
        if (!_isError) {
            _isError = cardNumber && !isNaN(cardNumber.replace(/ /g, '')) ? false : true
        }
        
        if (!_isError) {
            creditCard.number = cardNumber.replace(/ /g, '')
        }
        
        creditCard.isError = _isError
        return creditCard
    }
    
    const isCardExpiryComplete = (creditCard) => {
        if (creditCard.isError) return creditCard
        
        let cardExpiry = creditCardInfo.cardExpiry
        creditCard.expiry = cardExpiry
        
        let _isError = cardExpiry && cardExpiry.length === 7 ? false : true
        
        if (!_isError) _isError = isNaN(cardExpiry.replace(/\//g, ''))
        
        if (!_isError) {
            _isError = true
            
            let today = new Date()
            let currentMonth = today.getMonth() + 1
            let currentYear = today.getFullYear()
            let maxYear = currentYear + 10
            let maxMonth = 12
            
            let month = parseInt(cardExpiry.slice(0, 2), 0)
            let year = parseInt(cardExpiry.slice(3, 7), 0)
            if (year > currentYear) {
                _isError = year > maxYear ? true : false
            } else if (year === currentYear) {
                _isError = currentMonth > month || month > maxMonth ? true : false
            }
        }
        
        if (!_isError) {
            creditCard.expiryMonth = parseInt(creditCard.expiry.slice(0, 2), 0)
            creditCard.expiryYear = parseInt(creditCard.expiry.slice(3, 7), 0)
        }
        
        creditCard.isError = _isError
        return creditCard
    }
    
    const isCardCvcComplete = (creditCard) => {
        if (creditCard.isError) return creditCard
        
        let cardCvc = creditCardInfo.cardCvc
        creditCard.cvc = cardCvc
        
        let _isError =
            creditCard.type &&
            creditCard.type.issuer &&
            cardCvc &&
            ((creditCard.type.issuer !== 'amex' && cardCvc.length === 3) ||
                (creditCard.type.issuer === 'amex' && cardCvc.length === 4))
                ? false
                : true
        if (!_isError) _isError = isNaN(cardCvc)
        if (!_isError) creditCard.cvc = parseInt(cardCvc, 0)
        
        creditCard.isError = _isError
        return creditCard
    }
    
    const acceptedCards = ['visa', 'mastercard', 'discover', 'amex', 'jcb', 'dinersclub', 'maestro']
    
    let cardLocale = locale
        ? locale
        : {
            fullname: 'Full Name',
            cardNumber: 'Card Number',
            validThruCaption: 'Valid Thru',
            expiryDate: 'MM/YYYY',
            cvc: 'Cvc',
        }

    
    return(
        <div className={classes.root}>
            <Typography className={classes.mainTitle}>{t("str_payment")}</Typography>
            <Divider style={{backgroundColor:"#43425D"}}/>
            <div style={{paddingBottom:"24px"}}/>
            <FormControl component="fieldset">
                <RadioGroup
                    row
                    name="payment-type"
                    value={paymentType}
                    onChange={handlePaymentChange}
                >
                    <FormControlLabel
                        value={paymentTypes.paypal}
                        control={<CustomRadioButton />}
                        label={
                            <svg width={"64px"} xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 566.93 137.35">
                                <defs>
                                    <style>{".cls-1{fill:#009ee3}.cls-1,.cls-2,.cls-3{fillRule:evenodd}.cls-2{fill: #113984}.cls-3{fill: #172c70}"}</style>
                                </defs>
                                <title>paypal</title>
                                <path className="cls-1"
                                      d="M192.95,386.87h38.74c20.8,0,28.63,10.53,27.42,26-2,25.54-17.44,39.67-37.92,39.67H210.85c-2.81,0-4.7,1.86-5.46,6.9L201,488.74c-0.29,1.9-1.29,3-2.79,3.15H173.87c-2.29,0-3.1-1.75-2.5-5.54l14.84-93.93C186.79,388.66,188.85,386.87,192.95,386.87Z"
                                      transform="translate(-143.48 -354.54)"/>
                                <path className="cls-2"
                                      d="M361.14,385.13c13.07,0,25.13,7.09,23.48,24.76-2,21-13.25,32.62-31,32.67H338.11c-2.23,0-3.31,1.82-3.89,5.55l-3,19.07c-0.45,2.88-1.93,4.3-4.11,4.3H312.68c-2.3,0-3.1-1.47-2.59-4.76L322,390.29c0.59-3.76,2-5.16,4.57-5.16h34.54Zm-23.5,40.92h11.75c7.35-.28,12.23-5.37,12.72-14.55,0.3-5.67-3.53-9.73-9.62-9.7l-11.06.05-3.79,24.2h0Zm86.21,39.58c1.32-1.2,2.66-1.82,2.47-.34l-0.47,3.54c-0.24,1.85.49,2.83,2.21,2.83h12.82c2.16,0,3.21-.87,3.74-4.21l7.9-49.58c0.4-2.49-.21-3.71-2.1-3.71H436.32c-1.27,0-1.89.71-2.22,2.65l-0.52,3.05c-0.27,1.59-1,1.87-1.68.27-2.39-5.66-8.49-8.2-17-8-19.77.41-33.1,15.42-34.53,34.66-1.1,14.88,9.56,26.57,23.62,26.57,10.2,0,14.76-3,19.9-7.7h0ZM413.11,458c-8.51,0-14.44-6.79-13.21-15.11s9.19-15.11,17.7-15.11,14.44,6.79,13.21,15.11S421.63,458,413.11,458h0Zm64.5-44h-13c-2.68,0-3.77,2-2.92,4.46l16.14,47.26L462,488.21c-1.33,1.88-.3,3.59,1.57,3.59h14.61a4.47,4.47,0,0,0,4.34-2.13l49.64-71.2c1.53-2.19.81-4.49-1.7-4.49H516.63c-2.37,0-3.32.94-4.68,2.91l-20.7,30L482,416.82C481.46,415,480.11,414,477.62,414Z"
                                      transform="translate(-143.48 -354.54)"/>
                                <path className="cls-1"
                                      d="M583.8,385.13c13.07,0,25.13,7.09,23.48,24.76-2,21-13.25,32.62-31,32.67H560.78c-2.23,0-3.31,1.82-3.89,5.55l-3,19.07c-0.45,2.88-1.93,4.3-4.11,4.3H535.35c-2.3,0-3.1-1.47-2.59-4.76l11.93-76.45c0.59-3.76,2-5.16,4.57-5.16H583.8Zm-23.5,40.92h11.75c7.35-.28,12.23-5.37,12.72-14.55,0.3-5.67-3.53-9.73-9.62-9.7l-11.06.05-3.79,24.2h0Zm86.21,39.58c1.32-1.2,2.66-1.82,2.47-.34l-0.47,3.54c-0.24,1.85.49,2.83,2.21,2.83h12.82c2.16,0,3.21-.87,3.74-4.21l7.9-49.58c0.4-2.49-.21-3.71-2.1-3.71H659c-1.27,0-1.89.71-2.22,2.65l-0.52,3.05c-0.27,1.59-1,1.87-1.68.27-2.39-5.66-8.49-8.2-17-8-19.77.41-33.1,15.42-34.53,34.66-1.1,14.88,9.56,26.57,23.62,26.57,10.2,0,14.76-3,19.9-7.7h0ZM635.78,458c-8.51,0-14.44-6.79-13.21-15.11s9.19-15.11,17.7-15.11,14.44,6.79,13.21,15.11S644.29,458,635.78,458h0Zm59.13,13.74h-14.8a1.75,1.75,0,0,1-1.81-2l13-82.36a2.55,2.55,0,0,1,2.46-2h14.8a1.75,1.75,0,0,1,1.81,2l-13,82.36A2.55,2.55,0,0,1,694.91,471.76Z"
                                      transform="translate(-143.48 -354.54)"/>
                                <path className="cls-2"
                                      d="M168.72,354.54h38.78c10.92,0,23.88.35,32.54,8,5.79,5.11,8.83,13.24,8.13,22-2.38,29.61-20.09,46.2-43.85,46.2H185.2c-3.26,0-5.41,2.16-6.33,8l-5.34,34c-0.35,2.2-1.3,3.5-3,3.66H146.6c-2.65,0-3.59-2-2.9-6.42L160.9,361C161.59,356.62,164,354.54,168.72,354.54Z"
                                      transform="translate(-143.48 -354.54)"/>
                                <path className="cls-3"
                                      d="M179.43,435.29l6.77-42.87c0.59-3.76,2.65-5.56,6.75-5.56h38.74c6.41,0,11.6,1,15.66,2.85-3.89,26.36-20.94,41-43.26,41H185C182.44,430.72,180.56,432,179.43,435.29Z"
                                      transform="translate(-143.48 -354.54)"/>
                            </svg>
                        }
                        disabled
                    />
                    <FormControlLabel
                        className={classes.radioButtonLabel}
                        value={paymentTypes.creditCard}
                        control={<CustomRadioButton  />}
                        label={t('str_creditCard')}
                    />
                    <FormControlLabel
                        className={classes.radioButtonLabel}
                        value={paymentTypes.internetBanking}
                        control={<CustomRadioButton />}
                        label={"Internet Banking"}
                        disabled
                    />
                </RadioGroup>
            </FormControl>
            <div style={{paddingBottom:"48px"}}/>
            {
                paymentType === paymentTypes.paypal ?
                    null
                    :
                    paymentType === paymentTypes.creditCard ? (
                        <>
                            <Grid container spacing={3}>
                                <Grid className={classes.creditCardDiv} item xs={12} sm={6}>
                                    <Grid container >
                                        <Grid item xs={12}>
                                            <CreditCards
                                                variant="outlined"
                                                number={creditCardInfo.cardNumber}
                                                name={creditCardInfo.cardOwner}
                                                expiry={creditCardInfo.cardExpiry}
                                                cvc={creditCardInfo.cardCvc}
                                                focused={creditCardInfo.cardFocused}
                                                locale={{ valid: cardLocale.validThruCaption.toUpperCase() }}
                                                placeholders={{ name: cardLocale.fullname.toUpperCase() }}
                                                acceptedCards={acceptedCards}
                                                issuer={undefined}
                                                callback={handleCallback}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <Typography className={classes.subTitle}>
                                                {t('str_cardNo')}
                                            </Typography>
                                            <TextField
                                                value={creditCardInfo.cardNumber}
                                                className={classes.textFieldStyle}
                                                id={ccConst.numberTextFieldId}
                                                key={ccConst.numberTextFieldId}
                                                name={ccConst.numberTextFieldId}
                                                variant={"outlined"}
                                                error={ccIsError.cardNumber}
                                                placeholder={"0000 0000 0000 0000"}
                                                fullWidth
                                                type="tel"
                                                pattern="[\d| ]{16,22}"
                                                required
                                                onChange={handleInputChange}
                                                onFocus={handleInputFocus}
                                                onBlur={handleInputBlur}
                                                //onKeyUp={(e) => onKeyUp(ccConst.numberTextFieldId, e)}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <CreditCard style={{color:"#4666B0"}}/>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography className={classes.subTitle}>
                                                {t('str_fullName')}
                                            </Typography>
                                            <TextField
                                                value={creditCardInfo.cardOwner}
                                                className={classes.textFieldStyle}
                                                id={ccConst.ownerTextFieldId}
                                                key={ccConst.ownerTextFieldId}
                                                name={ccConst.ownerTextFieldId}
                                                variant={"outlined"}
                                                error={ccIsError.cardOwner}
                                                placeholder={"JOHN DOE"}
                                                fullWidth
                                                type="text"
                                                pattern={undefined}
                                                required
                                                onChange={handleInputChange}
                                                onFocus={handleInputFocus}
                                                onBlur={handleInputBlur}
                                                //onKeyUp={(e) => onKeyUp(ccConst.numberTextFieldId, e)}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <AccountCircle style={{color:"#4666B0"}}/>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography className={classes.subTitle}>
                                                {t('str_expiryDate')}
                                            </Typography>
                                            <TextField
                                                value={creditCardInfo.cardExpiry}
                                                className={classes.textFieldStyle}
                                                id={ccConst.expiryTextFieldId}
                                                key={ccConst.expiryTextFieldId}
                                                name={ccConst.expiryTextFieldId}
                                                variant={"outlined"}
                                                error={ccIsError.cardExpiry}
                                                placeholder={"MM/YYYY"}
                                                fullWidth
                                                type="tel"
                                                pattern="\d\d/\d\d\d\d"
                                                required
                                                onChange={handleInputChange}
                                                onFocus={handleInputFocus}
                                                onBlur={handleInputBlur}
                                                //onKeyUp={(e) => onKeyUp(ccConst.expiryTextFieldId, e)}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <DateRange style={{color:"#4666B0"}}/>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography className={classes.subTitle}>
                                                {t('str_cvv')}
                                            </Typography>
                                            <TextField
                                                value={creditCardInfo.cardCvc}
                                                className={classes.textFieldStyle}
                                                id={ccConst.cvcTextFieldId}
                                                key={ccConst.cvcTextFieldId}
                                                name={ccConst.cvcTextFieldId}
                                                variant={"outlined"}
                                                error={ccIsError.cardCvc}
                                                placeholder={t('str_cvv')}
                                                fullWidth
                                                type="tel"
                                                pattern="\d{3,4}"
                                                required
                                                onChange={handleInputChange}
                                                onFocus={handleInputFocus}
                                                onBlur={handleInputBlur}
                                                //onKeyUp={(e) => onKeyUp(ccConst.cvcTextFieldId, e)}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Lock style={{color:"#4666B0"}}/>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12} style={{textAlign: "right"}}>
                                    <Button className={classes.cancelButton} onClick={handleCancel}>{t('str_cancel')}</Button>
                                    <Button className={classes.saveButton} onClick={handleSave}>{t('str_save')}</Button>
                                </Grid>
                            </Grid>
                        </>
                    ) : null
            }
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.userPortal,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(NewPaymentDialog)