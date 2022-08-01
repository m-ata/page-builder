import React, { useContext, useState } from 'react'
import GuestLayout from '../../layout/containers/GuestLayout'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import LoginBanner from '../../layout/components/LoginBanner'
import styles from './style/Register.style'
import { makeStyles } from '@material-ui/core/styles'
import { DatePicker, LocalizationProvider } from '@material-ui/pickers'
import MomentAdapter from '@date-io/moment'
import WebCmsGlobal from '../../webcms-global'
import { NextSeo } from 'next-seo'
import axios from 'axios'
import { OREST_ENDPOINT, REQUEST_METHOD_CONST } from 'model/orest/constants'
import moment from 'moment'
import SuccessRegister from './SuccessRegister'
import { required, validateEmail } from 'state/utils/form'
import Link from 'next/link'
import TitleWithDivider from './TitleWithDivider'
import Button from '@material-ui/core/Button'
import { useRouter } from 'next/router'
import GenderSelect from './selects/GenderSelect'
import NationSelect from './selects/NationSelect'
import CountrySelect from './selects/CountrySelect'
import IdTypeSelect from './selects/IdTypeSelect'
import TaxOfficeSelect from './selects/TaxOfficeSelect'
import ProfessionSelect from './selects/ProfessionSelect'
import useTranslation from 'lib/translations/hooks/useTranslation'
import FrameCheckbox from '@webcms-ui/core/frame-checkbox'
import * as global from '@webcms-globals'
import PhoneInput from '@webcms-ui/core/phone-input'
import { useSnackbar } from 'notistack'
import utfTransliteration from '@webcms-globals/utf-transliteration'

const useStyles = makeStyles(styles)
const VARIANT = 'filled'

export default function Register(props) {
    const classes = useStyles()
        , { maxAge, minAge } = props
        , { GENERAL_SETTINGS, locale } = useContext(WebCmsGlobal)
        , router = useRouter()
        , { t } = useTranslation()
        , { transliteration } = utfTransliteration()
        , preArrival = Boolean(router.query.preArrival === 'true' || router.query.prearrival === 'true')

    //redux
    const { enqueueSnackbar } = useSnackbar()

    //state
    const [isRegistering, setIsRegistering] = useState(false)
    const [isRegistered, setIsRegistered] = useState(false)
    const [client, setClient] = useState(Object.assign(
        GENERAL_SETTINGS.hotelSettings.regbirthdate ? {
            birthdate: {
                value: moment().subtract(minAge, 'year'),
                isRequired: true,
                isError: false,
                errorText: ''
            }
        }
        : {}, {
        firstname: { value: '', isRequired: true, isError: false, errorText: '' },
        lastname: { value: '', isRequired: true, isError: false, errorText: '' },
        gender: { value: '', isRequired: false, isError: false, errorText: '' },
        email: { value: '', isRequired: true, isError: false, errorText: '' },
        mobiletel: { value: '', isRequired: true, isError: false, errorText: '' },
        nationid: { value: '', isRequired: false, isError: false, errorText: '' },
        country: { value: '', isRequired: false, isError: false, errorText: '' },
        address1: { value: '', isRequired: false, isError: false, errorText: '' },
        city: { value: '', isRequired: false, isError: false, errorText: '' },
        zip: { value: '', isRequired: false, isError: false, errorText: '' },
        idtypeid: { value: '', isRequired: false, isError: false, errorText: '' },
        idno: { value: '', isRequired: false, isError: false, errorText: '' },
        birthplace: { value: '', isRequired: false, isError: false, errorText: '' },
        title: { value: '', isRequired: false, isError: false, errorText: '' },
        taxoid: { value: '', isRequired: false, isError: false, errorText: '' },
        taxnumber: { value: '', isRequired: false, isError: false, errorText: '' },
        occupationid: { value: '', isRequired: false, isError: false, errorText: '' },
        note: { value: '', isRequired: false, isError: false, errorText: '' },
        terms: { value: false, isRequired: true, isError: false, errorText: '' },
        isprivate: { value: false, isRequired: true, isError: false, errorText: '' },
    }))

    const [isForgotPassword, setIsForgotPassword] = useState(false)

    const handleChangeTextField = (event, type) => {
        let key, value
        if (type === 'phone') {
            key = 'mobiletel'
            value = event.replace(/ /g, '')
        } else {
            event.preventDefault()
            key = event.target.name
            value = transliteration(event.target.value)
        }

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

    const handleChangeDatePicker = (date) => {
        const dateValue = moment(date).format(OREST_ENDPOINT.DATEFORMAT)
        setClient({
            ...client,
            birthdate: {
                ...client.birthdate,
                value: dateValue,
                isError: dateValue === 'Invalid date',
                errorText: `*${t('str_invalidDate')}`,
            },
        })
    }

    const handleChangeSelect = (event) => {
        setClient({
            ...client,
            [event.target.name]: {
                ...client[event.target.name],
                value: event.target.value,
                isError: client[event.target.name].isRequired && !!required(event.target.value),
                errorText: client[event.target.name].isRequired && required(event.target.value),
            },
        })
    }

    const handleClickDataPolicyButtons = (isAccept) => {
        setClient({
            ...client,
            isprivate: {
                ...client.isprivate,
                value: isAccept,
                isError: client.isprivate.isRequired && !!required(isAccept),
                errorText: client.isprivate.isRequired && required(isAccept),
            },
        })
    }

    const handleClickTravelPolicyButtons = (isAccept) => {
        setClient({
            ...client,
            terms: {
                ...client.terms,
                value: isAccept,
                isError: client.terms.isRequired && !!required(isAccept),
                errorText: client.terms.isRequired && required(isAccept),
            },
        })
    }

    const handleClickRegister = () => {
        let isRequiredError = false, isEmailError = false, isBirthdateError = false
        const clientData = client

        Object.keys(clientData).forEach(function (key) {
            if (clientData[key].isRequired) {
                if (required(clientData[key].value)) {
                    clientData[key].isError = true
                    clientData[key].errorText = `*${t('str_required')}`
                    isRequiredError = true
                }
            }
        })

        if (validateEmail(client.email.value)) {
            clientData.email.isError = true
            clientData.email.errorText = `*${t('str_invalidEmailAddress')}`
            isEmailError = true
        }

        if (GENERAL_SETTINGS.hotelSettings.regbirthdate) {
            let diffDate = moment(new Date()).diff(moment(client.birthdate.value), 'year')
            if (diffDate > maxAge) {
                clientData.birthdate.isError = true
                clientData.birthdate.errorText = t('str_yourMustBeMaxAgeOrOlder', { maxage: maxAge })
                isBirthdateError = true
            }

            if (diffDate < minAge) {
                clientData.birthdate.isError = true
                clientData.birthdate.errorText = t('str_yourMustBeMinAgeOrOlder', { minage: minAge })
                isBirthdateError = true
            }
        }

        setClient({ ...client })

        if (!isEmailError && !isRequiredError && !isBirthdateError) {
            setIsRegistering(true)
            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/ors/user/register',
                method: REQUEST_METHOD_CONST.POST,
                data: Object.assign(
                    GENERAL_SETTINGS.hotelSettings.regbirthdate ? {
                        birthdate: client.birthdate.value
                    }: {} ,{
                    firstname: client.firstname.value,
                    lastname: client.lastname.value,
                    gender: client.gender.value,
                    email: client.email.value,
                    mobiletel: client.mobiletel.value,
                    nationid: client.nationid.value,
                    country: client.country.value,
                    address1: client.address1.value,
                    city: client.city.value,
                    zip: client.zip.value,
                    idtypeid: client.idtypeid.value,
                    idno: client.idno.value,
                    birthplace: client.birthplace.value,
                    title: client.title.value,
                    taxoid: client.taxoid.value,
                    taxnumber: client.taxnumber.value,
                    occupationid: client.occupationid.value,
                    note: client.note.value,
                    isprivate: true,
                    langcode: locale
                })
            }).then((response) => {
                    if (response.data.success) {
                        setIsRegistered(true)
                    } else {
                        setIsRegistering(false)
                        if (response.data && response.data.error === 'existed_email') {
                            setClient({
                                ...client,
                                email: {
                                    ...client.email,
                                    isError: true,
                                    errorText: `*${t('str_thisEmailIsAlreadyRegistered')}`,
                                },
                            })
                            setIsForgotPassword(true)
                        } else if (response.data && response.data.error === 'existed_mobiletel') {
                            setClient({
                                ...client,
                                mobiletel: {
                                    ...client.mobiletel,
                                    isError: true,
                                    errorText: `*${t('str_thisMobileTelIsAlreadyRegistered')}`,
                                },
                            })
                        }else{
                            enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error' })
                        }
                    }
                })
        } else {
            enqueueSnackbar(t('str_fillRequiredFields'), { variant: 'error' })
        }
    }

    return (
        <GuestLayout>
            <NextSeo title={t('str_register')} />
            <LoginBanner />
            <div className={classes.registerContainer}>
                {isRegistered ? (
                    <SuccessRegister />
                ) : (
                    <React.Fragment>
                        <Grid container className={classes.gridContainer}>
                            <Grid item xs={12}>
                                <TitleWithDivider title={t('str_registrationForm')} />
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container spacing={3} className={classes.grid}>
                                    <Grid item xs={6} md={3}>
                                        <TextField
                                            id="firstname"
                                            name="firstname"
                                            label={t('str_firstName')}
                                            required={client.firstname.isRequired}
                                            fullWidth
                                            variant={VARIANT}
                                            disabled={isRegistering}
                                            value={client.firstname.value}
                                            onChange={handleChangeTextField}
                                            error={client.firstname.isError}
                                            helperText={client.firstname.isError && client.firstname.errorText}
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <TextField
                                            id="lastname"
                                            name="lastname"
                                            label={t('str_lastName')}
                                            required={client.lastname.isRequired}
                                            fullWidth
                                            variant={VARIANT}
                                            disabled={isRegistering}
                                            value={client.lastname.value}
                                            onChange={handleChangeTextField}
                                            error={client.lastname.isError}
                                            helperText={client.lastname.isError && client.lastname.errorText}
                                        />
                                    </Grid>
                                    {GENERAL_SETTINGS.hotelSettings.regbirthdate && (
                                        <Grid item xs={6} md={3}>
                                        <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                                            <DatePicker
                                                id="birthdate"
                                                name="birthdate"
                                                maxDate={moment().subtract(minAge, 'year')}
                                                label={t('str_birthDate')}
                                                value={client.birthdate.value}
                                                inputFormat="DD/MM/YYYY"
                                                required={client.birthdate.isRequired}
                                                disableFuture
                                                disabled={isRegistering}
                                                onChange={handleChangeDatePicker}
                                                renderInput={(props) => <TextField {...props} fullWidth variant={VARIANT} required={client.lastname.isRequired} error={client.birthdate.isError} helperText={client.birthdate.isError && client.birthdate.errorText} />}
                                            />
                                        </LocalizationProvider>
                                    </Grid>)}
                                    <Grid item xs={6} md={3}>
                                        <GenderSelect
                                            id="gender"
                                            name="gender"
                                            inputLabel={t('str_gender')}
                                            value={client.gender.value}
                                            onChange={handleChangeSelect}
                                            disabled={isRegistering}
                                            variant={VARIANT}
                                            error={client.gender.isError}
                                            helperText={client.gender.isError && client.gender.errorText}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            id="email"
                                            name="email"
                                            label={t('str_email')}
                                            required={client.email.isRequired}
                                            fullWidth
                                            variant={VARIANT}
                                            disabled={isRegistering}
                                            value={client.email.value}
                                            onChange={(event) => {
                                                handleChangeTextField(event)
                                                setIsForgotPassword(false)
                                            }}
                                            error={client.email.isError}
                                            helperText={client.email.isError && client.email.errorText}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <PhoneInput
                                            required={true}
                                            defaultCountry={locale === 'en' ? 'us': locale}
                                            preferredCountries={[
                                                'it',
                                                'ie',
                                                'de',
                                                'fr',
                                                'es',
                                                'gb',
                                            ]}
                                            regions={[
                                                'america',
                                                'europe',
                                                'asia',
                                                'oceania',
                                                'africa',
                                            ]}
                                            variant={VARIANT}
                                            id="mobiletel"
                                            name="mobiletel"
                                            label={t('str_phone')}
                                            fullWidth
                                            disabled={isRegistering}
                                            value={client.mobiletel.value}
                                            onChange={e => handleChangeTextField(e, 'phone')}
                                            error={client.mobiletel.isError}
                                            helperText={client.mobiletel.isError && client.mobiletel.errorText}
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <NationSelect
                                            id="nationid"
                                            name="nationid"
                                            inputLabel={t('str_nationality')}
                                            value={client.nationid.value}
                                            onChange={handleChangeSelect}
                                            disabled={isRegistering}
                                            variant={VARIANT}
                                            error={client.nationid.isError}
                                            helperText={client.nationid.isError && client.nationid.errorText}
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <CountrySelect
                                            id="country"
                                            name="country"
                                            inputLabel={t('str_country')}
                                            value={client.country.value}
                                            onChange={handleChangeSelect}
                                            disabled={isRegistering}
                                            variant={VARIANT}
                                            error={client.country.isError}
                                            helperText={client.country.isError && client.country.errorText}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            id="address1"
                                            name="address1"
                                            label={t('str_address')}
                                            required={client.address1.isRequired}
                                            fullWidth
                                            variant={VARIANT}
                                            disabled={isRegistering}
                                            value={client.address1.value}
                                            onChange={handleChangeTextField}
                                            error={client.address1.isError}
                                            helperText={client.address1.isError && client.address1.errorText}
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <TextField
                                            id="city"
                                            name="city"
                                            label={t('str_city')}
                                            required={client.city.isRequired}
                                            fullWidth
                                            variant={VARIANT}
                                            disabled={isRegistering}
                                            value={client.city.value}
                                            onChange={handleChangeTextField}
                                            error={client.city.isError}
                                            helperText={client.city.isError && client.city.errorText}
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <TextField
                                            id="zip"
                                            name="zip"
                                            label={t('str_zip')}
                                            required={client.zip.isRequired}
                                            fullWidth
                                            variant={VARIANT}
                                            disabled={isRegistering}
                                            value={client.zip.value}
                                            onChange={handleChangeTextField}
                                            error={client.zip.isError}
                                            helperText={client.zip.isError && client.zip.errorText}
                                        />
                                    </Grid>
                                    {isForgotPassword && (
                                        <Grid item xs={12}>
                                            <Grid container spacing={3} justify={'center'} alignItems={'center'}>
                                                <Grid item>
                                                    <Typography className={classes.forgetPw}>
                                                        <Link
                                                            href={{
                                                                pathname: '/guest/login/forgot-password',
                                                                query: { email: client.email.value },
                                                            }}
                                                        >
                                                            <a>{t('str_forgotPasswordOrGetPassword')}</a>
                                                        </Link>
                                                    </Typography>
                                                </Grid>
                                                <Grid item>{t('str_or')}</Grid>
                                                <Grid item>
                                                    <Typography className={classes.forgetPw}>
                                                        <Link
                                                            href={{
                                                                pathname: '/guest/login',
                                                                query: { email: client.email.value },
                                                            }}
                                                        >
                                                            <a>{t('str_login')}</a>
                                                        </Link>
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    )}
                                </Grid>
                            </Grid>
                        </Grid>
                        {preArrival && (
                            <React.Fragment>
                                <Grid container className={classes.gridContainer}>
                                    <Grid item xs={12}>
                                        <TitleWithDivider title={'ID'} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Grid container spacing={3} className={classes.grid}>
                                            <Grid item xs={6} md={3}>
                                                <IdTypeSelect
                                                    id="idtypeid"
                                                    name="idtypeid"
                                                    inputLabel={'ID Type'}
                                                    value={client.idtypeid.value}
                                                    onChange={handleChangeSelect}
                                                    disabled={isRegistering}
                                                    variant={VARIANT}
                                                    error={client.idtypeid.isError}
                                                    helperText={client.idtypeid.isError && client.idtypeid.errorText}
                                                />
                                            </Grid>
                                            <Grid item xs={6} md={3}>
                                                <TextField
                                                    id="idno"
                                                    name="idno"
                                                    label="ID Number"
                                                    required={client.idno.isRequired}
                                                    fullWidth
                                                    variant={VARIANT}
                                                    disabled={isRegistering}
                                                    value={client.idno.value}
                                                    onChange={handleChangeTextField}
                                                    error={client.idno.isError}
                                                    helperText={client.idno.isError && client.idno.errorText}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={3}>
                                                <TextField
                                                    id="birthplace"
                                                    name="birthplace"
                                                    label="Birth Place"
                                                    required={client.birthplace.isRequired}
                                                    fullWidth
                                                    variant={VARIANT}
                                                    disabled={isRegistering}
                                                    value={client.birthplace.value}
                                                    onChange={handleChangeTextField}
                                                    error={client.birthplace.isError}
                                                    helperText={
                                                        client.birthplace.isError && client.birthplace.errorText
                                                    }
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid container className={classes.gridContainer}>
                                    <Grid item xs={12}>
                                        <TitleWithDivider title={'Invoice'} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Grid container spacing={3} className={classes.grid}>
                                            <Grid item xs={6} md={3}>
                                                <TextField
                                                    id="title"
                                                    name="title"
                                                    label="Invoice Title"
                                                    required={client.title.isRequired}
                                                    fullWidth
                                                    variant={VARIANT}
                                                    disabled={isRegistering}
                                                    value={client.title.value}
                                                    onChange={handleChangeTextField}
                                                    error={client.title.isError}
                                                    helperText={client.title.isError && client.title.errorText}
                                                />
                                            </Grid>
                                            <Grid item xs={6} md={3}>
                                                <TaxOfficeSelect
                                                    id="taxoid"
                                                    name="taxoid"
                                                    inputLabel={'Tax Office'}
                                                    value={client.taxoid.value}
                                                    onChange={handleChangeSelect}
                                                    disabled={isRegistering}
                                                    variant={VARIANT}
                                                    error={client.taxoid.isError}
                                                    helperText={client.taxoid.isError && client.taxoid.errorText}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={3}>
                                                <TextField
                                                    id="taxnumber"
                                                    name="taxnumber"
                                                    label="Tax Number"
                                                    required={client.taxnumber.isRequired}
                                                    fullWidth
                                                    variant={VARIANT}
                                                    disabled={isRegistering}
                                                    value={client.taxnumber.value}
                                                    onChange={handleChangeTextField}
                                                    error={client.taxnumber.isError}
                                                    helperText={client.taxnumber.isError && client.taxnumber.errorText}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid container className={classes.gridContainer}>
                                    <Grid item xs={12}>
                                        <TitleWithDivider title={'Others'} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Grid container spacing={3} className={classes.grid}>
                                            <Grid item xs={12} md={3}>
                                                <ProfessionSelect
                                                    id="occupationid"
                                                    name="occupationid"
                                                    inputLabel={'Profession'}
                                                    value={client.occupationid.value}
                                                    onChange={handleChangeSelect}
                                                    disabled={isRegistering}
                                                    variant={VARIANT}
                                                    error={client.occupationid.isError}
                                                    helperText={
                                                        client.occupationid.isError && client.occupationid.errorText
                                                    }
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={9}>
                                                <TextField
                                                    id="note"
                                                    name="note"
                                                    label="Note"
                                                    required={client.note.isRequired}
                                                    fullWidth
                                                    variant={VARIANT}
                                                    disabled={isRegistering}
                                                    value={client.note.value}
                                                    onChange={handleChangeTextField}
                                                    error={client.note.isError}
                                                    helperText={client.note.isError && client.note.errorText}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </React.Fragment>
                        )}
                        <Grid container className={classes.gridContainer}>
                            <Grid item xs={12}>
                                <Grid container className={classes.grid} style={{ margin: '12px 0' }}>
                                    <Grid item xs={12}>
                                        <div style={{ paddingLeft: 18 }}>
                                            <FrameCheckbox
                                                required={true}
                                                value={client.isprivate.value}
                                                title="str_privacyAndPersonalDataProtectionPolicies"
                                                linkText="str_iAcceptDataPolicy"
                                                linkTextADesc="str_privacyAndPersonalDataProtectionPolicies"
                                                ifamePageUrl={GENERAL_SETTINGS.BASE_URL + `info/${locale || global.common.strDefShortLangCode}/${global.guestWeb.strDataPolicy}?iframe=true`}
                                                isCheck={(e) => handleClickDataPolicyButtons(e)}
                                            />
                                        </div>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <div style={{ paddingLeft: 18}}>
                                            <FrameCheckbox
                                                required={true}
                                                value={client.terms.value}
                                                title="str_hygieneAndTravelPolicies"
                                                linkText="str_iAcceptTravelPolicy"
                                                linkTextADesc="str_hygieneAndTravelPolicies"
                                                ifamePageUrl={GENERAL_SETTINGS.BASE_URL + `info/${locale || global.common.strDefShortLangCode}/${global.guestWeb.strTravelPolicy}?iframe=true`}
                                                isCheck={(e) => handleClickTravelPolicyButtons(e)}
                                            />
                                        </div>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid container className={classes.gridContainer}>
                            <Grid item xs={12}>
                                <Grid
                                    container
                                    spacing={3}
                                    className={classes.grid}
                                    justify={'center'}
                                    style={{ textAlign: 'center' }}
                                >
                                    <Grid item xs={12}>
                                        <Button
                                            onClick={handleClickRegister}
                                            disabled={isRegistering}
                                            fullWidth
                                            variant="contained"
                                            className={classes.submit}
                                            color="primary"
                                        >
                                            {preArrival ? t('str_save') : t('str_register')}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </React.Fragment>
                )}
            </div>
        </GuestLayout>
    )
}
