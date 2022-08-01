import React, { useEffect, useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Container, Grid, InputAdornment, TextField, Typography } from '@material-ui/core'
import { AccountCircle, CreditCard, DateRange, Lock } from '@material-ui/icons'
import CreditCards from 'components/payment/credit-card/card'
import { formatCreditCardNumber, formatCVC, formatExpirationDate } from 'components/payment/credit-card/utils'
import useTranslation from 'lib/translations/hooks/useTranslation'

const styles = (theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    margin: {
        margin: theme.spacing(1),
    },
    cardContainer: {
        width: '100%',
        margin: 0,
    },
    cardInputContainer: {
        width: '100%',
        margin: 0,
    },
    cardInputIconContainer: {
        padding: 4,
        margin: 0,
    },
    cardInputIcon: {
        fontSize: 75,
        color: 'rgba(0,0,0,1)',
    },
    cardInputTextFieldFullContainer: {
        padding: 4,
        margin: 0,
        width: 'calc(100% - 84px)',
    },
    cardInputTextFieldContainer: {
        padding: 4,
        margin: 0,
        width: 'calc(50% - 84px)',
    },
    cardInputTextFieldLabel: {
        color: 'rgba(0,0,0,0.4)',
        font: 'bold normal 20px Verdana, Impact sans-serif',
        '&$cardInputTextFieldLabelFocused': {
            color: 'rgba(0,0,0,1)',
        },
    },
    cardInputTextFieldLabelFocused: {},
    cardInputTextField: {
        color: 'rgba(0,0,0,1)',
        font: 'bold normal 30px Verdana, Impact sans-serif',
    },
    cardInputTextFieldUnderline: {
        '&:before': {
            borderBottomColor: 'rgba(150,150,150,1)',
        },
        '&:after': {
            borderBottomColor: 'rgba(0,0,0,1)',
        },
    },
})

const PaymentForm = ({ setCcNumberFocus, onChange, isValid, showCard, locale, className, textFieldsClass, iconColor, isEdit, editCardInfo, isDisabled, customInputProps = {}, fieldSize, fieldVariant }) => {
    const { t } = useTranslation()
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
    })

    useEffect(() => {
        if(creditCardInfo && typeof onChange === "function"  && typeof isValid === "function"){
            onChange(creditCardInfo)
            isValid(isCardComplete())
        }

    }, [creditCardInfo])

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

    const onKeyUp = (id) => {
        let numberTextFieldId = ccConst.numberTextFieldId
        let expiryTextFieldId = ccConst.expiryTextFieldId
        let cvcTextFieldId = ccConst.cvcTextFieldId

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

        let _isError = !(cardType && cardIsValid && cardType.issuer && cardType.maxLength)
        if (!_isError) {
            _isError = !(cardNumber && !isNaN(cardNumber.replace(/ /g, '')))
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

        let _isError = !(cardExpiry && cardExpiry.length === 5)

        if (!_isError) _isError = isNaN(cardExpiry.replace(/\//g, ''))

        if (!_isError) {
            _isError = true

            let today = new Date()
            let currentMonth = today.getMonth() + 1
            let currentYear = today.getFullYear()
            let maxYear = currentYear + 100
            let maxMonth = 12

            let month = parseInt(cardExpiry.slice(0, 2), 0)
            let year = '20' + parseInt(cardExpiry.slice(3, 5), 0)

            year = Number(year)
            currentYear = Number(currentYear)
            maxYear = Number(maxYear)

            if (year > currentYear) {
                _isError = year > maxYear ? true : false
            } else if (year === currentYear) {
                _isError = currentMonth > month || month > maxMonth ? true : false
            }
        }

        if (!_isError) {
            creditCard.expiryMonth = parseInt(creditCard.expiry.slice(0, 2), 0)
            creditCard.expiryYear = parseInt(creditCard.expiry.slice(3, 5), 0)
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

    let cardLocale = {
            fullname: t('str_ccFullName'),
            cardNumber: t('str_ccNumber'),
            validThruCaption: 'Valid Thru',
            expiryDate: t('str_ccExpiryDate'),
            cvc: t('str_ccCvc'),
    }

    return (
        <Grid container direction="row" justify="center" alignItems="center" spacing={1}>
            <Grid item xs={12} sm={6} style={{ display: showCard ? 'inline-block' : 'none' }}>
                <CreditCards
                    variant="outlined"
                    number={creditCardInfo.cardNumber}
                    name={creditCardInfo.cardOwner}
                    expiry={creditCardInfo.cardExpiry}
                    cvc={creditCardInfo.cardCvc}
                    focused={creditCardInfo.cardFocused}
                    locale={{ valid: cardLocale.validThruCaption.toUpperCase()}}
                    placeholders={{ name: t('str_fullName').toUpperCase()}}
                    acceptedCards={acceptedCards}
                    issuer={undefined}
                    callback={(cardType, isValid) => handleCallback(cardType, isValid)}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <Grid container direction="row" justify="flex-end" alignItems="center" spacing={1}>
                    <Grid item xs={12}>
                        <TextField
                            disabled={isDisabled}
                            className={textFieldsClass || null}
                            value={creditCardInfo.cardOwner}
                            size={fieldSize}
                            variant={fieldVariant}
                            style={{margin: '5px 0 0 6px'}}
                            id={ccConst.ownerTextFieldId}
                            key={ccConst.ownerTextFieldId}
                            label={cardLocale.fullname}
                            type="text"
                            name={ccConst.ownerTextFieldId}
                            pattern={undefined}
                            required
                            error={ccIsError.cardOwner}
                            fullWidth={true}
                            onChange={(e) => handleInputChange(e)}
                            onFocus={(e) => handleInputFocus(e)}
                            onBlur={(e) => handleInputBlur(e)}
                            onKeyUp={(e) => onKeyUp(ccConst.ownerTextFieldId, e)}
                            InputProps={{
                                ...(customInputProps && customInputProps || {}),
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AccountCircle style={iconColor !== undefined ? {color:iconColor} : null }/>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            disabled={isDisabled}
                            className={textFieldsClass || null}
                            value={creditCardInfo.cardNumber}
                            size={fieldSize}
                            variant={fieldVariant}
                            style={{margin: '5px 0 0 6px'}}
                            id={ccConst.numberTextFieldId}
                            key={ccConst.numberTextFieldId}
                            label={cardLocale.cardNumber}
                            type="tel"
                            name={ccConst.numberTextFieldId}
                            pattern="[\d| ]{16,22}"
                            required
                            error={ccIsError.cardNumber}
                            fullWidth={true}
                            onChange={(e) => handleInputChange(e)}
                            onFocus={(e) => {
                                setCcNumberFocus(true)
                                handleInputFocus(e)
                            }}
                            onBlur={(e) => {
                                setCcNumberFocus(false)
                                handleInputBlur(e)
                            }}
                            onKeyUp={(e) => onKeyUp(ccConst.numberTextFieldId, e)}
                            InputProps={{
                                ...(customInputProps && customInputProps || {}),
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <CreditCard style={iconColor !== undefined ? {color:iconColor} : null }/>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={7}>
                        <TextField
                            disabled={isDisabled}
                            className={textFieldsClass || null}
                            value={creditCardInfo.cardExpiry}
                            size={fieldSize}
                            variant={fieldVariant}
                            style={{margin: '5px 0 0 6px'}}
                            id={ccConst.expiryTextFieldId}
                            key={ccConst.expiryTextFieldId}
                            label={cardLocale.expiryDate}
                            type="tel"
                            name={ccConst.expiryTextFieldId}
                            pattern="\d\d/\d\d\d\d"
                            required
                            error={ccIsError.cardExpiry}
                            fullWidth={true}
                            onChange={(e) => handleInputChange(e)}
                            onFocus={(e) => handleInputFocus(e)}
                            onBlur={(e) => handleInputBlur(e)}
                            onKeyUp={(e) => onKeyUp(ccConst.expiryTextFieldId, e)}
                            InputProps={{
                                ...(customInputProps && customInputProps || {}),
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <DateRange style={iconColor !== undefined ? {color:iconColor} : null }/>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                        <TextField
                            disabled={isDisabled}
                            className={textFieldsClass || null}
                            value={creditCardInfo.cardCvc}
                            size={fieldSize}
                            variant={fieldVariant}
                            style={{margin: '5px 0 0 6px'}}
                            id={ccConst.cvcTextFieldId}
                            key={ccConst.cvcTextFieldId}
                            label={cardLocale.cvc}
                            type="tel"
                            name={ccConst.cvcTextFieldId}
                            pattern="\d{3,4}"
                            required
                            error={ccIsError.cardCvc}
                            fullWidth={true}
                            onChange={(e) => handleInputChange(e)}
                            onFocus={(e) => handleInputFocus(e)}
                            onBlur={(e) => handleInputBlur(e)}
                            onKeyUp={(e) => onKeyUp(ccConst.cvcTextFieldId, e)}
                            InputProps={{
                            ...(customInputProps && customInputProps || {}),
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock style={iconColor !== undefined ? {color:iconColor} : null }/>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}

PaymentForm.defaultProps = {
    showCard: true,
    isDisabled: false,
    fieldVariant: 'outlined',
    fieldSize: 'small',
    customInputProps: {}
}

export default withStyles(styles)(PaymentForm)