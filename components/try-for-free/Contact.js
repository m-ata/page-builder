import axios from 'axios'
import React, { useEffect, useState, useContext } from 'react'
import { Button, Grid, Typography, FormControlLabel, Checkbox } from '@material-ui/core'
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab'
import { TcTextField, TcPhoneField, TcAutocomplete } from './components/fields'
import RadioButtonUncheckedOutlinedIcon from '@material-ui/icons/RadioButtonUncheckedOutlined'
import RadioButtonCheckedOutlinedIcon from '@material-ui/icons/RadioButtonCheckedOutlined'
import Alert from '@material-ui/lab/Alert'
import useTranslation from 'lib/translations/hooks/useTranslation'
import LoadingSpinner from 'components/LoadingSpinner'
import WebCmsGlobal from 'components/webcms-global'

const emailValidation = (email) => {
    const syntaxRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return syntaxRegex.test(String(email).toLowerCase());
}

const saveProperty = (data) => {
    return axios({
        url: 'api/property/save',
        method: 'post',
        data: data
    }).then((response)=> {
        return response.data
    })
}

const Contact = ({ brand, classes, setPropertyInfo, fieldOptions, steps, nextStep, registerTypes, registerType, registerTypeChange, setStepperLabelIsHide }) => {
    const { t } = useTranslation()
    const {locale} = useContext(WebCmsGlobal);
    const [isLoading, setIsLoading] = useState(false)
    const [isExistsProperty, setIsExistsProperty] = useState(false)
    const [contactData, setContactData] = useState(
        {
            propertyName: {
                value: "",
                helperText: "",
                isRequired: true
            },
            fullName:  {
                value: "",
                helperText: "",
                isRequired: true
            },
            phone:  {
                value: "",
                iso2: "",
                helperText: "",
                isRequired: true
            },
            email: {
                value: "",
                helperText: "",
                isRequired: true
            },
            country: {
                value: "",
                helperText: "",
                isRequired: true
            },
            numberOfRooms: {
                value: "",
                helperText: "",
                isRequired: true
            },
            registerType: {
                value: registerType,
                helperText: "",
                isRequired: true
            },
            isPrivacyTermsChecked: {
                value: false,
                helperText: "",
                isRequired: true
            },
        }
    )

    useEffect(()=> {
        if(registerType){
            setContactData({
                ...contactData,
                registerType: {
                    ...contactData.registerType,
                    value: registerType,
                    helperText: ""
                }
            })
        }

    }, [registerType])

    const handlePropertyNameChange = (e) =>{
        setContactData({
            ...contactData,
            propertyName: {
                ...contactData.propertyName,
                value: e.target.value,
                helperText: ""
            }
        })
    }

    const handleFullNameChange = (e) =>{
        setContactData({
            ...contactData,
            fullName: {
                ...contactData.fullName,
                value: e.target.value,
                helperText: ""
            }
        })
    }

    const handlePhoneChange = (value, e) => {
        if (value && value.length > 3 && e?.countryCode) {
            setContactData({
                ...contactData,
                phone: {
                    ...contactData.phone,
                    value: value,
                    iso2: e?.countryCode.toUpperCase(),
                    helperText: "",
                },
            })
        }else {
            setContactData({
                ...contactData,
                phone: {
                    ...contactData.phone,
                    value: value,
                    helperText: ""
                },
            })
        }
    }

    const handleEmailChange = (e) =>{
        setContactData({
            ...contactData,
            email: {
                ...contactData.email,
                value: e.target.value,
                helperText: ""
            }
        })
    }

    const handleCountryChange = (value) =>{
        setContactData({
            ...contactData,
            country: {
                ...contactData.country,
                value: value,
                helperText: ""
            }
        })
    }

    const handleNumberOfRoomsChange = (e) =>{
        setContactData({
            ...contactData,
            numberOfRooms: {
                ...contactData.numberOfRooms,
                value: e.target.value,
                helperText: ""
            }
        })
    }

    const handlePrivacyPolicyChecked = (e) =>{
        setContactData({
            ...contactData,
            isPrivacyTermsChecked: {
                ...contactData.isPrivacyTermsChecked,
                value: e.target.checked,
                helperText: ""
            }
        })
    }

    const handleNextStep = async () => {
        let newContactData = contactData, insertData = {}, isError = false
        const dataKeys = Object.keys(contactData)

        for (let dataKey of dataKeys){
            if(newContactData[dataKey].isRequired){
                if (newContactData[dataKey]?.value && (Object.keys(newContactData[dataKey].value).length > 0 || newContactData[dataKey].value == true)) {
                    if (dataKey === "email" && newContactData[dataKey].value) {
                        const emailCheck = emailValidation(newContactData[dataKey].value)
                        if (emailCheck) {
                            isError = false
                            newContactData[dataKey].helperText = ""
                            insertData = {...insertData, [dataKey]: newContactData[dataKey].value}
                        }else{
                            isError = true
                            newContactData[dataKey].helperText = t('str_invalidEmailAddress')
                        }
                    } else {
                        if(dataKey === "country"){
                            insertData = {...insertData, [dataKey]: newContactData[dataKey].value.code}
                            insertData = {...insertData, 'countryid': newContactData[dataKey].value.id}
                        }else{
                            insertData = {...insertData, [dataKey]: newContactData[dataKey].value}
                        }
                        newContactData[dataKey].helperText = ""
                    }
                } else {
                    isError = true
                    newContactData[dataKey].helperText = t('str_requiredField')
                }
            }else {
                insertData = {...insertData, [dataKey]: newContactData[dataKey].value}
            }
        }

        setContactData({ ...newContactData })
        if(!isError){
            setIsLoading(true)
            insertData.brand = brand
            insertData.registerType = registerType
            const getProperty = await saveProperty(insertData)
            if(getProperty.success){
                setIsLoading(false)
                setPropertyInfo(getProperty.data)
                nextStep(registerTypes.demo === registerType ? steps.moduleSelection.index : steps.addressDetails.index)
            }else {
                setStepperLabelIsHide(true)
                setIsLoading(false)
                setIsExistsProperty(true)
            }
        }
    }

    if(isExistsProperty){
        return (
            <Grid container spacing={2} justify='space-between'>
                <Grid item xs={12}>
                    <Alert severity="info">
                        {t('str_tryCloudExistsProperty')}
                    </Alert>
                </Grid>
            </Grid>
        )
    }

    return (
        <Grid container spacing={2} justify='space-between'>
            <Grid item xs={12}>
                <TcTextField
                    required={contactData.propertyName.isRequired}
                    label={t('str_propertyName')}
                    variant={fieldOptions.variant}
                    fullWidth={fieldOptions.fullWidth}
                    size={fieldOptions.size}
                    value={contactData.propertyName.value}
                    onChange={handlePropertyNameChange}
                    error={contactData.propertyName.helperText.length > 0}
                    helperText={contactData.propertyName.helperText}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TcTextField
                    required={contactData.fullName.isRequired}
                    label={t('str_fullName')}
                    variant={fieldOptions.variant}
                    fullWidth={fieldOptions.fullWidth}
                    size={fieldOptions.size}
                    value={contactData.fullName.value}
                    onChange={handleFullNameChange}
                    error={contactData.fullName.helperText.length > 0}
                    helperText={contactData.fullName.helperText}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TcPhoneField
                    defaultCountry={locale === 'en' ? 'us': locale}
                    required={contactData.phone.isRequired}
                    label={t('str_phone')}
                    variant={fieldOptions.variant}
                    fullWidth={fieldOptions.fullWidth}
                    size={fieldOptions.size}
                    preferredCountries={['it', 'ie', 'de', 'fr', 'es', 'gb']}
                    regions={['america', 'europe', 'asia', 'oceania', 'africa']}
                    value={contactData.phone.value}
                    onChange={handlePhoneChange}
                    error={contactData.phone.helperText.length > 0}
                    helperText={contactData.phone.helperText}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TcTextField
                    required={contactData.email.isRequired}
                    label={t('str_email')}
                    variant={fieldOptions.variant}
                    fullWidth={fieldOptions.fullWidth}
                    size={fieldOptions.size}
                    value={contactData.email.value}
                    onChange={handleEmailChange}
                    error={contactData.email.helperText.length > 0}
                    helperText={contactData.email.helperText}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TcAutocomplete
                    optionKey="id"
                    optionLabel="description"
                    optionApi="api/hotel/content/info/country"
                    onChange={handleCountryChange}
                    defValueKey="iso2"
                    defValue={contactData.phone.iso2}
                    value={contactData.country.value}
                    TextFieldProps={{
                        label: t('str_country'),
                        required: contactData.country.isRequired,
                        variant: fieldOptions.variant,
                        fullWidth: fieldOptions.fullWidth,
                        size: fieldOptions.size,
                        error: contactData.country.helperText.length > 0,
                        helperText: contactData.country.helperText,
                    }}
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <TcTextField
                    type="number"
                    InputProps={{
                        inputProps: {
                             min: 1
                        }
                    }}
                    required={contactData.numberOfRooms.isRequired}
                    label={t('str_numberOfRooms')}
                    variant={fieldOptions.variant}
                    fullWidth={fieldOptions.fullWidth}
                    size={fieldOptions.size}
                    value={contactData.numberOfRooms.value}
                    onChange={handleNumberOfRoomsChange}
                    error={contactData.numberOfRooms.helperText.length > 0}
                    helperText={contactData.numberOfRooms.helperText}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <ToggleButtonGroup
                    className={classes.toogleButtonGroup}
                    color='primary'
                    value={registerType}
                    exclusive
                    onChange={registerTypeChange}
                >
                    <ToggleButton
                        className={classes.toogleButton}
                        value={registerTypes.demo}
                    >
                        {registerType === registerTypes.demo ? <RadioButtonCheckedOutlinedIcon color='primary' /> : <RadioButtonUncheckedOutlinedIcon />} <span className={classes.toogleButtonLabel}>{t('str_useDemo')}</span>
                    </ToggleButton>
                    <ToggleButton
                        className={classes.toogleButton}
                        value={registerTypes.buynow}
                    >
                        {registerType === registerTypes.buynow ? <RadioButtonCheckedOutlinedIcon color='primary' /> : <RadioButtonUncheckedOutlinedIcon />} <span className={classes.toogleButtonLabel}>{t('str_buyNow')}</span>
                    </ToggleButton>
                </ToggleButtonGroup>
            </Grid>
            <Grid item xs={12} sm={8} style={{ textAlign: 'left' }}>
                <FormControlLabel
                    control={<Checkbox name='privacyPolicy' color='primary' value={contactData.isPrivacyTermsChecked.value} checked={contactData.isPrivacyTermsChecked.value} onChange={handlePrivacyPolicyChecked}/>}
                    label={<Typography variant='subtitle2' align='right'>{t('str_readAndAgreeToText')}{' '}<a href='https://hotech.systems/privacy-policy' target='_blank'> {t('str_privacyPolicy')} </a>.{' '}</Typography>}
                />
            </Grid>
            <Grid item xs={12} sm={4} style={{ textAlign: 'right' }}>
                <Button
                    disabled={isLoading}
                    variant='contained'
                    size='large'
                    color='primary'
                    disableElevation
                    onClick={() => handleNextStep()}
                    endIcon={isLoading ? <LoadingSpinner size={16}/> : null}
                >
                    {t('str_next')}
                </Button>
            </Grid>
        </Grid>
    )
}

export default Contact