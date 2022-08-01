import React, { useContext, useEffect } from 'react'
import { connect } from 'react-redux'
import { setToState, updateState } from 'state/actions'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import { useRouter } from 'next/router'
import { makeStyles } from '@material-ui/core'
import { CHCK_EMAIL } from 'model/orest/constants'
import useNotifications from 'model/notification/useNotifications'
import AgencySearch from './components/AgencySearch'
import LoadingSpinner from 'components/LoadingSpinner'
import AgencyTypeSelect from './components/AgencyTypeSelect'
import ReCaptcha from 'react-google-recaptcha'
import Box from '@material-ui/core/Box'
import BasicsCountrySelect from './components/BasicsCountrySelect'
import Typography from '@material-ui/core/Typography'
import Checkbox from '@material-ui/core/Checkbox'
import FormGroup from '@material-ui/core/FormGroup'
import Link from '@material-ui/core/Link'
import {
    VALIDATE_HELPER_TEXT_EMAIL,
    VALIDATE_HELPER_TEXT_EMAIL_NOT_VALID,
    VALIDATE_HELPER_TEXT_FIRST_NAME,
    VALIDATE_HELPER_TEXT_LAST_NAME,
    VALIDATE_HELPER_TEXT_PHONE,
} from '../../constants'
import WebCmsGlobal from 'components/webcms-global'
import AgencyListSearch from './components/AgencyListSearch'
import useTranslation from 'lib/translations/hooks/useTranslation'
import PhoneInput from '@webcms-ui/core/phone-input'

const CONTACT_PLACEHOLDER_TEXT = 'Full name'
const EMAIL_PLACEHOLDER_TEXT = 'example@mail.com'
const WEB_PLACEHOLDER_TEXT = 'http://www.example.com'
const PHONE_PLACEHOLDER_TEXT2 = '(____) _____-________'
const PHONE_PLACEHOLDER_TEXT = '+1 (702) 123-4567'

const inputLabelStyle = makeStyles((theme) => ({
    root: {
        backgroundColor: 'white',
        paddingLeft: 5,
        paddingRight: 5,
    },
}))

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        '& > *': {
            margin: theme.spacing(1),
            width: theme.spacing(16),
            height: theme.spacing(16),
        },
    },
    fieldset: {
        width: '100%',
        marginTop: theme.spacing(2),
    },
    legends: {
        paddingTop: theme.spacing(2),
        fontSize: '1.1rem',
    },
    txtfiled: {
        width: '100%',
    },
    txtfiled2: {
        //width: "100%",
    },
    outlinedTextField: {
        borderRadius: 50,
    },
    textFieldLabel: {
        backgroundColor: 'white',
        paddingLeft: 5,
        paddingRight: 5,
    },
}))

const Basics = (props) => {
    const cls = useStyles()
    const inputLabelStyleClass = inputLabelStyle()
    const { state, setToState, pageStep, reCaptchaRef } = props

    const { showSuccess, showError } = useNotifications()
    const { t } = useTranslation()
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const isOnlyBasics = router.query.isOnlyBasics === '1'
    const preRegister = router.query.preRegister === '1'
    const privacyPolicyUrl =
        router.query.backUrl !== undefined ? router.query.backUrl + '/pages/privacy-policy' : '/pages/privacy-policy'
    const { GENERAL_SETTINGS, locale } = useContext(WebCmsGlobal)

    useEffect(() => {
        if (isOnlyBasics || preRegister) {
            let data
            if (isOnlyBasics) {
                data = {
                    code: '',
                    contact: '',
                    tel: '',
                    email: '',
                    validateEmail: { helperText: '', error: false },
                    web: '',
                    agencytype: '',
                    agencytypeid: '',
                    country: '',
                    countryid: false,
                    targetroom: 0,
                }
            } else if (preRegister) {
                data = {
                    code: '',
                    contact: '',
                    firstName: '',
                    lastName: '',
                    tel: '',
                    email: '',
                    web: '',
                    agencytype: '',
                    agencytypeid: '',
                    country: '',
                    countryid: false,
                    privacyPolicy: false,
                    validateFirstName: { helperText: '', error: false },
                    validateLastName: { helperText: '', error: false },
                    validatePhone: { helperText: '', error: false },
                    validateEmail: { helperText: '', error: false },
                    validateProfile: { helperText: '', error: false },
                }
            }
            setToState('registerStepper', ['basics', 'agency'], data)
            setToState('registerStepper', ['basics', 'agencyBase'], data)
        }
    }, [])

    const handleChange = (event) => {
        if (event.target.value === 'false') {
            setToState('registerStepper', ['basics', 'agency', 'chainid'], null)
        } else {
            if (state.basics.agencyBase.chainid !== null) {
                setToState('registerStepper', ['basics', 'agency', 'chainid'], state.basics.agencyBase.chainid)
            } else {
                setToState('registerStepper', ['basics', 'agency', 'chainid'], 0)
            }
        }
    }

    const handleTextFieldChange = (event) => {
        if (event.target.name === 'code') {
            setToState(
                'registerStepper',
                ['basics', 'agency', String(event.target.name)],
                event.target.value.toUpperCase()
            )
        } else {
            if (event.target.name === 'targetroom') {
                const room = Number(event.target.value)
                if (room > 0 || event.target.value === '') {
                    setToState('registerStepper', ['basics', 'agency', String(event.target.name)], event.target.value)
                } else {
                    setToState('registerStepper', ['basics', 'agency', String(event.target.name)], 1)
                }
            } else {
                setToState('registerStepper', ['basics', 'agency', String(event.target.name)], event.target.value)
            }
        }
    }

    const handlePhoneInputChange = (event, value) => {
        if (isOnlyBasics || preRegister) {
            if (event.countryCode && state.countryList) {
                const selectedCountry = state.countryList[state.countryList.findIndex((data) => data.iso2 === event.countryCode.toUpperCase())]
                if (selectedCountry && selectedCountry.description && selectedCountry.description !== state.basics.agency.country) {
                    setToState('registerStepper', ['basics', 'agency', 'countryid'], String(selectedCountry.id))
                    setToState('registerStepper', ['basics', 'agency', 'country'], String(selectedCountry.description))
                }
            }
        }
        setToState('registerStepper', ['basics', 'agency', 'tel'], value)
    }

    if (!state.basics.agency && !isOnlyBasics && !preRegister) {
        return <LoadingSpinner />
    }

    const onVerifyReCaptcha = (value) => {
        setToState('registerStepper', ['reCaptcha'], value)
    }

    const handleIsPrivacyPolicyChecked = (value, newValue) => {
        setToState('registerStepper', ['basics', 'agency', 'privacyPolicy'], Boolean(newValue))
    }

    if (preRegister) {
        return (
            <React.Fragment>
                <Grid container spacing={3} justify={'center'}>
                    <Grid item xs={6}>
                        <TextField
                            size="small"
                            required
                            variant={'outlined'}
                            InputProps={{
                                className: cls.outlinedTextField,
                            }}
                            InputLabelProps={{
                                classes: inputLabelStyleClass,
                            }}
                            id="firstName"
                            name="firstName"
                            label="First Name"
                            helperText={(state.basics.agency && state.basics.agency.validateFirstName.helperText) || ''}
                            error={(state.basics.agency && state.basics.agency.validateFirstName.error) || false}
                            value={state.basics.agency ? state.basics.agency.firstName || '' : ''}
                            onChange={handleTextFieldChange}
                            onBlur={() => {
                                if (state.basics.agency.firstName === '') {
                                    setToState(
                                        'registerStepper',
                                        ['basics', 'agency', 'validateFirstName', 'error'],
                                        true
                                    )
                                    setToState(
                                        'registerStepper',
                                        ['basics', 'agency', 'validateFirstName', 'helperText'],
                                        VALIDATE_HELPER_TEXT_FIRST_NAME
                                    )
                                } else {
                                    setToState(
                                        'registerStepper',
                                        ['basics', 'agency', 'validateFirstName', 'error'],
                                        false
                                    )
                                    setToState(
                                        'registerStepper',
                                        ['basics', 'agency', 'validateFirstName', 'helperText'],
                                        ''
                                    )
                                }
                            }}
                            fullWidth
                            className={cls.txtfiled2}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            size="small"
                            required
                            variant={'outlined'}
                            InputProps={{
                                className: cls.outlinedTextField,
                            }}
                            InputLabelProps={{
                                classes: inputLabelStyleClass,
                            }}
                            id="lastName"
                            name="lastName"
                            label="Last Name"
                            helperText={(state.basics.agency && state.basics.agency.validateLastName.helperText) || ''}
                            error={(state.basics.agency && state.basics.agency.validateLastName.error) || false}
                            value={state.basics.agency ? state.basics.agency.lastName || '' : ''}
                            onChange={handleTextFieldChange}
                            onBlur={() => {
                                if (state.basics.agency.lastName === '') {
                                    setToState(
                                        'registerStepper',
                                        ['basics', 'agency', 'validateLastName', 'error'],
                                        true
                                    )
                                    setToState(
                                        'registerStepper',
                                        ['basics', 'agency', 'validateLastName', 'helperText'],
                                        VALIDATE_HELPER_TEXT_LAST_NAME
                                    )
                                } else {
                                    setToState(
                                        'registerStepper',
                                        ['basics', 'agency', 'validateLastName', 'error'],
                                        false
                                    )
                                    setToState(
                                        'registerStepper',
                                        ['basics', 'agency', 'validateLastName', 'helperText'],
                                        ''
                                    )
                                }
                            }}
                            fullWidth
                            className={cls.txtfiled2}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <PhoneInput
                            size="small"
                            defaultCountry={locale === 'en' ? 'us': locale}
                            preferredCountries={['it', 'ie', 'de', 'fr', 'es', 'gb']}
                            regions={['america', 'europe', 'asia', 'oceania', 'africa']}
                            required
                            variant="outlined"
                            InputProps={{
                                className: cls.outlinedTextField,
                            }}
                            InputLabelProps={{
                                classes: {
                                    root: cls.textFieldLabel,
                                },
                            }}
                            id="tel"
                            name="tel"
                            label="Phone"
                            helperText={(state.basics.agency && state.basics.agency.validatePhone.helperText) || ''}
                            error={(state.basics.agency && state.basics.agency.validatePhone.error) || false}
                            placeholder={PHONE_PLACEHOLDER_TEXT}
                            value={state.basics.agency ? state.basics.agency.tel || '' : ''}
                            onChange={(event) => {
                                setToState('registerStepper', ['basics', 'agency', 'tel'], event)
                            }}
                            onBlur={() => {
                                if (state.basics.agency.tel === '' || state.basics.agency.tel.length < 8) {
                                    setToState('registerStepper', ['basics', 'agency', 'validatePhone', 'error'], true)
                                    setToState(
                                        'registerStepper',
                                        ['basics', 'agency', 'validatePhone', 'helperText'],
                                        VALIDATE_HELPER_TEXT_PHONE
                                    )
                                } else {
                                    setToState('registerStepper', ['basics', 'agency', 'validatePhone', 'error'], false)
                                    setToState(
                                        'registerStepper',
                                        ['basics', 'agency', 'validatePhone', 'helperText'],
                                        ''
                                    )
                                }
                            }}
                            onFocus={() => {
                                if (state.basics.agency.tel === '' || state.basics.agency.tel === '+') {
                                    setToState('registerStepper', ['basics', 'agency', 'tel'], '+')
                                }
                            }}
                            fullWidth
                            className={cls.txtfiled2}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            size="small"
                            required
                            variant={'outlined'}
                            InputProps={{
                                className: cls.outlinedTextField,
                            }}
                            InputLabelProps={{
                                classes: {
                                    root: cls.textFieldLabel,
                                },
                            }}
                            id="email"
                            name="email"
                            label="Email"
                            helperText={(state.basics.agency && state.basics.agency.validateEmail.helperText) || ''}
                            error={(state.basics.agency && state.basics.agency.validateEmail.error) || false}
                            placeholder={EMAIL_PLACEHOLDER_TEXT}
                            value={state.basics.agency ? state.basics.agency.email || '' : ''}
                            onChange={handleTextFieldChange}
                            onBlur={() => {
                                if (state.basics.agency.email === '') {
                                    setToState('registerStepper', ['basics', 'agency', 'validateEmail', 'error'], true)
                                    setToState(
                                        'registerStepper',
                                        ['basics', 'agency', 'validateEmail', 'helperText'],
                                        VALIDATE_HELPER_TEXT_EMAIL
                                    )
                                } else {
                                    if (!CHCK_EMAIL.test(state.basics.agency.email)) {
                                        setToState(
                                            'registerStepper',
                                            ['basics', 'agency', 'validateEmail', 'error'],
                                            true
                                        )
                                        setToState(
                                            'registerStepper',
                                            ['basics', 'agency', 'validateEmail', 'helperText'],
                                            VALIDATE_HELPER_TEXT_EMAIL_NOT_VALID
                                        )
                                    } else {
                                        setToState(
                                            'registerStepper',
                                            ['basics', 'agency', 'validateEmail', 'error'],
                                            false
                                        )
                                        setToState(
                                            'registerStepper',
                                            ['basics', 'agency', 'validateEmail', 'helperText'],
                                            ''
                                        )
                                    }
                                }
                            }}
                            fullWidth
                            className={cls.txtfiled2}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <AgencyTypeSelect />
                    </Grid>
                    <Grid item xs={12}>
                        {state.countryList && <BasicsCountrySelect />}
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            size="small"
                            variant={'outlined'}
                            InputProps={{
                                className: cls.outlinedTextField,
                            }}
                            InputLabelProps={{
                                classes: {
                                    root: cls.textFieldLabel,
                                },
                            }}
                            id="web"
                            name="web"
                            label="Website"
                            placeholder={WEB_PLACEHOLDER_TEXT}
                            value={state.basics.agency ? state.basics.agency.web || '' : ''}
                            onChange={handleTextFieldChange}
                            fullWidth
                            className={cls.txtfiled2}
                        />
                    </Grid>
                    <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
                        <FormGroup row>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        color="primary"
                                        value={state.basics.agency && state.basics.agency.privacyPolicy}
                                        onChange={handleIsPrivacyPolicyChecked}
                                    />
                                }
                                label={
                                    <Typography variant="subtitle1">
                                        {t('str_agreeTo')}{' '}
                                        <Link href={privacyPolicyUrl} target="_blank" color="primary">
                                            {' '}
                                            {t('str_terms')}
                                        </Link>
                                    </Typography>
                                }
                            />
                        </FormGroup>
                    </Grid>
                    <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
                        <ReCaptcha sitekey={GENERAL_SETTINGS.RECAPTCHA_SITE_KEY} onChange={onVerifyReCaptcha} />
                    </Grid>
                </Grid>
            </React.Fragment>
        )
    } else {
        return (
            <React.Fragment>
                <Grid container spacing={3} justify={'center'} style={{ paddingTop: 20 }}>
                    {!state.isCheckCompany ? (
                        <Grid container direction="row" justify="center" alignItems="center">
                            <Grid item xs={7} style={{ marginTop: '8%' }}>
                                <AgencyListSearch />
                            </Grid>
                        </Grid>
                    ) : (
                        <React.Fragment>
                            <Grid item xs={12} sm={7}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField
                                            size="small"
                                            required
                                            variant="outlined"
                                            placeholder="Name your place..."
                                            id="property"
                                            name="code"
                                            label="Property Name"
                                            value={state.basics.agency ? state.basics.agency.code || '' : ''}
                                            onChange={handleTextFieldChange}
                                            fullWidth
                                            className={cls.txtfiled}
                                        />
                                    </Grid>
                                    <Grid item xs={12} style={{ paddingBottom: 0 }}>
                                        <Typography variant="body1">{t('str_propertyContactDetails')}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            size="small"
                                            required
                                            variant="outlined"
                                            id="contact"
                                            name="contact"
                                            label="Full Name"
                                            placeholder={CONTACT_PLACEHOLDER_TEXT}
                                            value={state.basics.agency ? state.basics.agency.contact || '' : ''}
                                            onChange={handleTextFieldChange}
                                            fullWidth
                                            className={cls.txtfiled}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <PhoneInput
                                            size="small"
                                            preferredCountries={['it', 'ie', 'de', 'fr', 'es', 'gb']}
                                            regions={['america', 'europe', 'asia', 'oceania', 'africa']}
                                            required
                                            variant="outlined"
                                            id="tel"
                                            name="tel"
                                            label="Phone"
                                            placeholder={PHONE_PLACEHOLDER_TEXT}
                                            value={state.basics.agency ? state.basics.agency.tel || '' : ''}
                                            onChange={(value, event) => {
                                                handlePhoneInputChange(event, value)
                                            }}
                                            fullWidth
                                            className={cls.txtfiled2}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            size="small"
                                            required
                                            variant="outlined"
                                            id="email"
                                            name="email"
                                            label="Email"
                                            placeholder={EMAIL_PLACEHOLDER_TEXT}
                                            value={state.basics.agency ? state.basics.agency.email || '' : ''}
                                            helperText={(state.basics.agency && state.basics.agency.validateEmail.helperText) || ''}
                                            error={(state.basics.agency && state.basics.agency.validateEmail.error) || false}
                                            onChange={(e) => {
                                                setToState('registerStepper', ['basics', 'agency', 'validateEmail', 'helperText'], '')
                                                setToState('registerStepper', ['basics', 'agency', 'validateEmail', 'error'], false)
                                                handleTextFieldChange(e)
                                            }}
                                            fullWidth
                                            className={cls.txtfiled}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            size="small"
                                            id="web"
                                            variant="outlined"
                                            name="web"
                                            label="Website"
                                            placeholder={WEB_PLACEHOLDER_TEXT}
                                            value={state.basics.agency ? state.basics.agency.web || '' : ''}
                                            onChange={handleTextFieldChange}
                                            fullWidth
                                            className={cls.txtfiled}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12} sm={7}>
                                <Grid container spacing={3} justify="space-between">
                                    <Grid item xs={12} sm={6}>
                                        {state.countryList && <BasicsCountrySelect />}
                                    </Grid>
                                    {!isOnlyBasics && (
                                        <Grid item xs={12}>
                                            <React.Fragment>
                                                <FormControl component="fieldset" className={cls.fieldset}>
                                                    <FormLabel component="legend" className={cls.legends}>
                                                        {t('str_ownMultiplePropertiesOrGroup')}
                                                    </FormLabel>
                                                    <RadioGroup
                                                        aria-label="isChain"
                                                        style={{ marginTop: 20 }}
                                                        name="isChain"
                                                        value={
                                                            state.basics.agency
                                                                ? state.basics.agency.chainid !== null
                                                                    ? 'true'
                                                                    : 'false'
                                                                : 'false'
                                                        }
                                                        onChange={handleChange}
                                                    >
                                                        <FormControlLabel
                                                            value="false"
                                                            control={<Radio />}
                                                            label="No"
                                                        />
                                                        <FormControlLabel
                                                            value="true"
                                                            control={<Radio />}
                                                            label="Yes"
                                                        />
                                                    </RadioGroup>
                                                </FormControl>
                                                {state.basics.agency && state.basics.agency.chainid !== null && (
                                                    <AgencySearch />
                                                )}
                                            </React.Fragment>
                                        </Grid>
                                    )}
                                    {isOnlyBasics && (
                                        <React.Fragment>
                                            <Grid item xs={12} sm={6}>
                                                <Grid container spacing={0}>
                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            size="small"
                                                            required
                                                            variant="outlined"
                                                            id="targetroom"
                                                            name="targetroom"
                                                            label="Number Of Rooms"
                                                            value={
                                                                state.basics.agency
                                                                    ? state.basics.agency.targetroom || ''
                                                                    : ''
                                                            }
                                                            onChange={handleTextFieldChange}
                                                            fullWidth
                                                            type="number"
                                                            className={cls.txtfiled}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                            <Grid item xs={12} container>
                                                <FormControl component="fieldset" style={{ width: '100%' }}>
                                                    <RadioGroup
                                                        aria-label="whichonedoyouwant"
                                                        name="moduleusetype"
                                                        value={state.moduleUseType}
                                                        onChange={(e, v) =>
                                                            setToState('registerStepper', ['moduleUseType'], v)
                                                        }
                                                    >
                                                        <Grid container spacing={0}>
                                                            <Grid item xs={12} sm={6} style={{ textAlign: 'center' }}>
                                                                <FormControlLabel
                                                                    value="demo"
                                                                    control={
                                                                        <Radio disableRipple={true} size="small" />
                                                                    }
                                                                    label={t('str_iWantToUseAsADemo')}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={12} sm={6} style={{ textAlign: 'center' }}>
                                                                <FormControlLabel
                                                                    value="subscribe"
                                                                    control={
                                                                        <Radio disableRipple={true} size="small" />
                                                                    }
                                                                    label={t('str_iWantToUseAsASubscriber')}
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                    </RadioGroup>
                                                </FormControl>
                                            </Grid>
                                            {isOnlyBasics && state.isCheckCompany && pageStep === 0 && (
                                                <Grid item xs={12} style={{ textAlign: 'center', padding: 0 }}>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                name="privacyPolicy"
                                                                checked={state.isPrivacyPolicy}
                                                                onChange={() =>
                                                                    setToState(
                                                                        'registerStepper',
                                                                        ['isPrivacyPolicy'],
                                                                        state.isPrivacyPolicy ? false : true
                                                                    )
                                                                }
                                                            />
                                                        }
                                                        label={
                                                            <Typography variant="subtitle2" align="center">
                                                                {t('str_readAndAgreeToText')}{' '}
                                                                <a
                                                                    href="https://hotech.systems/privacy-policy"
                                                                    target="_blank"
                                                                >
                                                                    {t('str_privacyPolicy')}
                                                                </a>
                                                                .{' '}
                                                            </Typography>
                                                        }
                                                    />
                                                </Grid>
                                            )}
                                            <Grid item xs={12} style={{ marginBottom: 20 }}>
                                                <Box style={{ width: 300, margin: '0 auto' }}>
                                                    <ReCaptcha
                                                        ref={reCaptchaRef}
                                                        sitekey={GENERAL_SETTINGS.RECAPTCHA_SITE_KEY}
                                                        onChange={onVerifyReCaptcha}
                                                    />
                                                </Box>
                                            </Grid>
                                        </React.Fragment>
                                    )}
                                </Grid>
                            </Grid>
                        </React.Fragment>
                    )}
                </Grid>
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.registerStepper,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Basics)
