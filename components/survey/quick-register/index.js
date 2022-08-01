import React, { useContext, useState, useRef, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import moment from 'moment'
import ReCaptcha from 'react-google-recaptcha'
import * as global from '@webcms-globals'
import WebCmsGlobal from 'components/webcms-global'
import { LocaleContext } from 'lib/translations/context/LocaleContext'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { Grid, TextField, Icon, Box, Paper, Typography, Button } from '@material-ui/core'
import FrameCheckbox from '@webcms-ui/core/frame-checkbox'
import { required, validateEmail } from 'state/utils/form'
import { useSnackbar } from 'notistack'
import axios from 'axios'
import { useRouter } from 'next/router'
import ProgressButton from '@webcms-ui/core/progress-button'
import PhoneInput from "../../../@webcms-ui/core/phone-input";
import CustomAutoComplete from "../../CustomAutoComplete/CustomAutoComplete";
import {mobileTelNoFormat, OREST_ENDPOINT, REQUEST_METHOD_CONST} from "../../../model/orest/constants";
import CustomDatePicker from "../../CustomDatePicker/CustomDatePicker";


const useStyles = makeStyles((theme) => ({
    textFieldDestinationPortal: {
        borderRadius: '5px',
    },
}))

export default function QuickRegister(props) {
    const classes = useStyles()

    const { isRegisterWrapper,  showBackButton, onClickBackButton, variant, isEmpPortal, isOpenRegister } = props
    const { GENERAL_SETTINGS, WEBCMS_DATA } = useContext(WebCmsGlobal)
    const { locale } = useContext(LocaleContext)
    const { t } = useTranslation()
    const { enqueueSnackbar } = useSnackbar()
    const router = useRouter()
    const [isRegister, setIsRegister] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const reCaptchaRef = useRef({})
    const surveyGid = router.query.surveyGid
    const [phoneInfoData, setPhoneInfoData] = useState(false);
    const [iso2, setIso2] = useState('')


    const [client, setClient] = useState(
        Object.assign(
            GENERAL_SETTINGS.hotelSettings.regbirthdate && !isEmpPortal ? {
                birthdate: {
                    value: null,
                    isError: false,
                    isRequired: true,
                },
            } : {}, {
                firstname: {
                    value: '',
                    isError: false,
                    isRequired: true,
                },
                lastname: {
                    value: '',
                    isError: false,
                    isRequired: true,
                },
                email: {
                    value: '',
                    isError: false,
                    isRequired: true,
                },
                mobiletel: {
                    value: '',
                    isError: false,
                    isRequired: isEmpPortal,
                },
                country: {
                    value: null,
                    isError: false,
                    isRequired: isEmpPortal,
                },
                city: {
                    value: '',
                    isError: false,
                    isRequired: isEmpPortal,
                },
                datapolicy: {
                    value: false,
                    isError: false,
                    isRequired: true,
                },
                recaptcha: {
                    value: '',
                    isRequired: true,
                },
            }))

    const handleStrChange = (event, name) => {
        let key, value
        key = name ? name : event.target.name
        value = event ? event.target ? event.target.value : event : ''
        if(event?.target) {
            event.preventDefault()
        }

        setClient({
            ...client,
            [key]: {
                ...client[key],
                value: value,
                isError: client[key].isRequired && !!required(value),
            },
        })
    }

   useEffect(() => {
       if(isEmpPortal && isOpenRegister && !phoneInfoData) {
           if(client.mobiletel.value.length <= 0) getPhoneInfo(null)
       }
   }, [isOpenRegister])

    useEffect(() => {
        if(isEmpPortal && isOpenRegister && phoneInfoData) {
            const timer = setTimeout(() => {
                getPhoneInfo(mobileTelNoFormat(client.mobiletel.value))
            }, 700)
            return () => clearTimeout(timer);
        }
    }, [client.mobiletel.value, isOpenRegister])

    const getPhoneInfo = (tel) => {
        const params = {
            tel: tel
        }

        axios({
            url: GENERAL_SETTINGS.BASE_URL + 'api/get/phone/info',
            method: REQUEST_METHOD_CONST.POST,
            params: tel ? params : {}
        }).then(res => {
            if(res.status === 200 && res.data.success) {
                setPhoneInfoData(res.data.data)
            }
        })
    }

    const handleDateChange = (value) => {
        const key = 'birthdate'
        setClient({
            ...client,
            [key]: {
                ...client[key],
                value: moment(value).format(OREST_ENDPOINT.DATEFORMAT),
                renderValue: value,
                isError: client[key].isRequired && !!required(value),
            },
        })
    }

    const handleChckDataPolicy = (value) => {
        const key = 'datapolicy'

        setClient({
            ...client,
            [key]: {
                ...client[key],
                value: value,
                isError: client[key].isRequired && !!required(value),
                errorText: client[key].isRequired && required(value),
            },
        })
    }

    const handleVerifyRecaptcha = (value) => {
        const key = 'recaptcha'
        setClient({
            ...client,
            [key]: {
                ...client[key],
                value: value,
            },
        })
    }

    const handleClientRegister = () => {
        let isRequiredError = false, isEmailError = false
        const clientData = client

        Object.keys(clientData).forEach(function(key) {
            if (clientData[key].isRequired) {
                if (required(clientData[key].value)) {
                    clientData[key].isError = true
                    isRequiredError = true
                }
            }
        })

        if (validateEmail(client.email.value)) {
            clientData.email.isError = true
            isEmailError = true
        }

        if (!client.datapolicy.value) {
            clientData.datapolicy.isError = true
            isRequiredError = true
        }

        if (!client.recaptcha.value) {
            isRequiredError = true
        }

        setClient({ ...client })

        if (!isRequiredError && !isEmailError) {
            setIsLoading(true)
            let requestData =
                Object.assign(GENERAL_SETTINGS.hotelSettings.regbirthdate && !isEmpPortal ? { birthdate: client.birthdate.value } : {}, {
                    firstname: client.firstname.value,
                    lastname: client.lastname.value,
                    email: client.email.value,
                    datapolicy: client.datapolicy.value,
                    langcode: locale,
                    recaptcha: client.recaptcha.value,
                    surveygid: surveyGid,
                })

            if(isEmpPortal) {
                const data = {}
                data.mobiletel = clientData?.mobiletel?.value
                data.country = typeof clientData?.country?.value === 'object' ? clientData?.country?.value?.description : clientData?.country?.value
                data.city = typeof clientData?.city?.value === 'object' ? clientData?.city?.value?.description : clientData?.city?.value
                Object.assign(requestData, data)
                requestData.langcode = null
            }

            axios({
                url: `${GENERAL_SETTINGS.BASE_URL}${isEmpPortal ? 'api/hotel/emp/register' : 'api/ors/user/save'}`,
                method: REQUEST_METHOD_CONST.POST,
                data: requestData,
            }).then((response) => {
                if (response.status === 200 && response.data.success === true) {
                    enqueueSnackbar(t('str_dataSaveSuccessMsg'), { variant: 'success' })
                    setIsRegister(true)
                    setIsLoading(false)
                } else {
                    if (response.data.error === 'existed_email') {
                        reCaptchaRef.current.reset()
                        enqueueSnackbar(t('str_thisEmailAddressHasBeenUsedBefore'), { variant: 'error' })
                    } else {
                        reCaptchaRef.current.reset()
                        enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error' })
                    }
                    setIsLoading(false)
                }
            })
        } else {
            reCaptchaRef.current.reset()
            enqueueSnackbar(t('str_fillRequiredFields'), { variant: 'error' })
            setIsLoading(false)
        }
    }

    if (isRegister) {
        return (
            <Grid container direction='row' justify='center' alignItems='center' spacing={2}>
                <Grid item xs={12}>
                    <Paper variant='outlined'>
                        <Box p={3}>
                            <Typography variant='subtitle1' align='center'>
                                <Icon style={{ color: '#4CAF50' }} fontSize='large'>check_circle_outline</Icon>
                            </Typography>
                            <Typography variant='subtitle1' align='center'>
                                {t('str_pleaseCheckYourMailBoxPassword')}
                            </Typography>
                            <Typography>
                                {showBackButton && (
                                    <Button
                                        style={{marginRight: '8px'}}
                                        size={'large'}
                                        color={'primary'}
                                        variant={'outlined'}
                                        onClick={() => typeof onClickBackButton === 'function' && onClickBackButton()}
                                    >
                                        {t('str_back')}
                                    </Button>
                                )}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        )
    }

    return (
        <Grid container direction='row' justify='center' alignItems='center' spacing={2}>
            <Grid item xs={6}>
                <TextField
                    disabled={isLoading}
                    className={isRegisterWrapper ? classes.textFieldDestinationPortal : ''}
                    value={client.firstname.value}
                    error={client.firstname.isError}
                    onChange={(e) => handleStrChange(e)}
                    variant={variant ? variant : 'filled'}
                    color={'primary'}
                    required
                    fullWidth
                    id='firstname'
                    name='firstname'
                    label={t('str_firstName')}
                />
            </Grid>
            <Grid item xs={6}>
                <TextField
                    disabled={isLoading}
                    className={isRegisterWrapper ? classes.textFieldDestinationPortal : ''}
                    value={client.lastname.value}
                    error={client.lastname.isError}
                    onChange={(e) => handleStrChange(e)}
                    variant={variant ? variant : 'filled'}
                    color={'primary'}
                    required
                    fullWidth
                    id='lastname'
                    name='lastname'
                    label={t('str_lastName')}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    className={isRegisterWrapper ? classes.textFieldDestinationPortal : ''}
                    value={client.email.value}
                    error={client.email.isError}
                    onChange={(e) => handleStrChange(e)}
                    variant={variant || 'filled'}
                    color={'primary'}
                    required
                    fullWidth
                    id='email'
                    name='email'
                    label={t('str_email')}
                    disabled={isLoading}
                />
            </Grid>
            {isEmpPortal && (
                <Grid item xs={12}>
                    <PhoneInput
                        defaultCountry={iso2 || locale}
                        preferredCountries={['it', 'ie', 'de', 'fr', 'es', 'gb']}
                        regions={['america', 'europe', 'asia', 'oceania', 'africa',]}
                        id={'mobiletel'}
                        name={'mobiletel'}
                        value={client.mobiletel?.value}
                        required={client.mobiletel?.isRequired}
                        label={t('str_mobile')}
                        disabled={isLoading}
                        fullWidth
                        variant={variant || 'filled'}
                        onChange={(newValue, e) => handleStrChange(newValue, 'mobiletel', e)}
                        error={client.mobiletel?.isError}
                        helperText={client.mobiletel?.isError && client.mobiletel?.errorText}
                        //onBlur={field.isVerifyRequired ? () => handleOnVerify(field.key, field.value, field.type) : undefined}
                    />
                </Grid>
            )}
            {GENERAL_SETTINGS.hotelSettings.regbirthdate && !isEmpPortal && (
                <Grid item xs={12}>
                    <CustomDatePicker
                        id='birthdate'
                        name='birthdate'
                        required={client?.birthdate?.isRequired}
                        error={client?.birthdate?.isError}
                        value={client['birthdate'].value || moment()}
                        label={t('str_birthDate')}
                        onChange={(e) => handleDateChange(e)}
                        disableFuture
                        fullWidth
                        disabled={isLoading}
                        variant={isRegisterWrapper ? 'outlined' : 'filled'}
                    />
                </Grid>
            )}
            {isEmpPortal && isOpenRegister && (
                <Grid item xs={12} sm={6}>
                    <CustomAutoComplete
                        id={'country'}
                        name={'country'}
                        required={client.country?.isRequired}
                        error={client.country.isError}
                        value={client.country?.value || null}
                        variant={variant || 'filled'}
                        disabled={isLoading}
                        withoutToken
                        endpoint={'api/hotel/content/info/country'}
                        onChange={(event, newValue) => {handleStrChange(newValue, 'country')}}
                        //onInputChange={(inputValue) => handleStrChange(inputValue, 'country')}
                        onLoad={(initialValue) => {
                            setClient({
                                ...client,
                                ['country']: {
                                    ...client['country'],
                                    value: initialValue

                                }
                            })
                            setIso2(initialValue?.iso2 || false)
                        }}
                        showOptionLabel={'descineng'}
                        showOption={'descineng'}
                        searchInitialParam={'itu'}
                        initialId={phoneInfoData ? phoneInfoData?.itu : false}
                        //triggerValue={true}
                        useDefaultFilter
                        label={t('str_country')}
                        fullWidth
                        //freeSolo
                    />
                </Grid>
            )}
            {isEmpPortal && isOpenRegister &&(
                <Grid item xs={12} sm={6}>
                    <CustomAutoComplete
                        id={'city'}
                        name={'city'}
                        value={client.city?.value || null}
                        required={client.city?.isRequired}
                        error={client.city.isError}
                        disabled={isLoading}
                        variant={variant || 'filled'}
                        withoutToken={client.country?.value}
                        withoutTokenData={client.country?.value ? {country: typeof client.country?.value === 'object' ? client.country?.value?.description : client.country?.value} : false}
                        endpoint={'api/hotel/content/info/city'}
                        onChange={(event, newValue) => {handleStrChange(newValue, 'city')}}
                        onInputChange={(inputValue) => handleStrChange(inputValue, 'city')}
                        showOptionLabel={'description'}
                        showOption={'description'}
                        trgValKey={'description'}
                        triggerValue={typeof client.country?.value === 'object' ? client.country?.value?.description : false}
                        useDefaultFilter
                        label={t('str_city')}
                        fullWidth
                        freeSolo
                    />
                </Grid>
            )}
            <Grid item xs={12}>
                <FrameCheckbox
                    required={true}
                    value={client.datapolicy.value}
                    isError={client.datapolicy.isError}
                    disabled={isLoading}
                    fontSize='12px'
                    title='str_privacyAndPersonalDataProtectionPolicies'
                    linkText='str_iAcceptDataPolicy'
                    linkTextADesc='str_privacyAndPersonalDataProtectionPolicies'
                    ifamePageUrl={GENERAL_SETTINGS.BASE_URL + `info/${locale || global.common.strDefShortLangCode}/${global.guestWeb.strDataPolicy}?iframe=true`}
                    isCheck={(e) => handleChckDataPolicy(e)}
                    linkColor={WEBCMS_DATA.assets.colors.primary.main}
                />
            </Grid>
            <Grid item xs={12}>
                <ReCaptcha ref={reCaptchaRef} sitekey={GENERAL_SETTINGS.RECAPTCHA_SITE_KEY} onChange={(e) => handleVerifyRecaptcha(e)} />
            </Grid>
            <Grid item xs={12} style={showBackButton ? { textAlign: 'right'} : null}>
                {showBackButton && (
                    <Button
                        style={{marginRight: '8px'}}
                        size={'large'}
                        color={'primary'}
                        variant={'outlined'}
                        onClick={() => typeof onClickBackButton === 'function' && onClickBackButton()}
                    >
                        {t('str_back')}
                    </Button>
                )}
                <ProgressButton isLoading={isLoading}>
                    <Button variant='contained' disabled={isLoading} color='primary' size='large' onClick={() => handleClientRegister()} disableElevation fullWidth>
                        {t('str_register')}
                    </Button>
                </ProgressButton>
            </Grid>
        </Grid>
    )
}