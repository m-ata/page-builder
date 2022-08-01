import React, { useEffect, useContext, useState } from 'react'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import styles from 'components/guest/register/style/Register.style'
import { makeStyles } from '@material-ui/core/styles'
import { DatePicker, LocalizationProvider } from '@material-ui/pickers'
import { UseOrest } from '@webcms/orest'
import MomentAdapter from '@date-io/moment'
import WebCmsGlobal from 'components/webcms-global'
import axios from 'axios'
import { OREST_ENDPOINT, REQUEST_METHOD_CONST, } from 'model/orest/constants'
import moment from 'moment'
import { required, validateEmail } from 'state/utils/form'
import Button from '@material-ui/core/Button'
import GenderSelect from 'components/guest/register/selects/GenderSelect'
import NationSelect from 'components/guest/register/selects/NationSelect'
import CountrySelect from 'components/guest/register/selects/CountrySelect'
import useTranslation from 'lib/translations/hooks/useTranslation'
import FrameCheckbox from '@webcms-ui/core/frame-checkbox'
import * as global from '@webcms-globals'
import { LocaleContext } from 'lib/translations/context/LocaleContext'
import PhoneInput from '@webcms-ui/core/phone-input'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import { useSnackbar } from 'notistack'
import { connect } from 'react-redux'
import { updateState } from 'state/actions'

const useStyles = makeStyles(styles)
const VARIANT = 'filled'

const Update = (props) =>{
    const classes = useStyles()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { t } = useTranslation()
    const { locale } = useContext(LocaleContext)
    const { enqueueSnackbar } = useSnackbar()

    const { open, auth, logInfo, locationName, onCallback, updateState } = props
    const token = auth.access_token

    //state
    const [isRegistering, setIsRegistering] = useState(false)
    const [clientInfoData, setClientInfoData] = useState(false)
    const isReqField = (locationName !== 'survey' ? true : false)
    const [client, setClient] = useState({
        firstname: { value: '', isRequired: true, isError: false, errorText: '' },
        lastname: { value: '', isRequired: true, isError: false, errorText: '' },
        birthdate: { value: '', isRequired: true, isError: false, errorText: '' },
        gender: { value: '', isRequired: false, isError: false, errorText: '' },
        email: { value: '', isRequired: true, isError: false, errorText: '' },
        mobiletel: { value: '', isRequired: false, isError: false, errorText: '' },
        nationid: { value: '', isRequired: false, isError: false, errorText: '' },
        country: { value: '', isRequired: false, isError: false, errorText: '' },
        address1: { value: '', isRequired: false, isError: false, errorText: '' },
        city: { value: '', isRequired: false, isError: false, errorText: '' },
        zip: { value: '', isRequired: false, isError: false, errorText: '' },
        hasdatapolicy: { value: false, isRequired: true, isError: false, errorText: '' },
        haspref: { value: false, isRequired: isReqField, isError: false, errorText: '' },
    })

    useEffect(() => {
        updateState('guest', 'loginTo', 60)
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'client/getbyid',
            token,
            params: {
                key: logInfo.refid,
                allhotels: true
            },
        }).then((clientResponse) => {
            if (clientResponse.status === 200 && clientResponse.data.count > 0) {
                let clientResponseData = clientResponse.data.data
                setClientInfoData(clientResponseData)
                clientResponseData.hasdatapolicy = logInfo.hasdatapolicy || false
                clientResponseData.haspref = logInfo.haspref || false

                let newClient = client
                Object.keys(newClient).forEach((key) => {
                    const value = clientResponseData[key]
                    if (value) {
                        newClient = {
                            ...newClient,
                            [key]: {
                                ...newClient[key],
                                value: value || '',
                            },
                        }
                    }
                })

                setClient(newClient)
            }
        })
    }, [])

    const handleChangeTextField = (event, type) => {

        let key, value
        if (type === 'phone') {
            key = 'mobiletel'
            value = event.replace(/ /g, '')
        } else {
            event.preventDefault()
            key = event.target.name
            value = event.target.value
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
                errorText: '*Invalid date',
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
            hasdatapolicy: {
                ...client.hasdatapolicy,
                value: isAccept,
                isError: client.hasdatapolicy.isRequired && !!required(isAccept),
                errorText: client.hasdatapolicy.isRequired && required(isAccept),
            },
        })
    }

    const handleClickTravelPolicyButtons = (isAccept) => {
        setClient({
            ...client,
            haspref: {
                ...client.haspref,
                value: isAccept,
                isError: client.haspref.isRequired && !!required(isAccept),
                errorText: client.haspref.isRequired && required(isAccept),
            },
        })
    }

    const handleClickRegister = () => {
        let isRequiredError = false
        let isEmailError = false
        const clientData = client

        Object.keys(clientData).forEach(function(key) {
            if (clientData[key].isRequired) {
                if (required(clientData[key].value)) {
                    clientData[key].isError = true
                    clientData[key].errorText = '*Required'
                    isRequiredError = true
                }
            }
        })

        if (validateEmail(client.email.value)) {
            clientData.email.isError = true
            clientData.email.errorText = '*Invalid email address'
            isEmailError = true
        }

        setClient({ ...client })
        if (!isEmailError && !isRequiredError) {
            setIsRegistering(true)
            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/ors/user/update',
                method: REQUEST_METHOD_CONST.POST,
                data: {
                    firstname: client.firstname.value,
                    lastname: client.lastname.value,
                    birthdate: client.birthdate.value,
                    gender: client.gender.value,
                    email: client.email.value,
                    mobiletel: client.mobiletel.value,
                    nationid: client.nationid.value,
                    country: client.country.value,
                    address1: client.address1.value,
                    city: client.city.value,
                    zip: client.zip.value,
                    hasdatapolicy: client.hasdatapolicy.value,
                    haspref: client.haspref.value,
                    refid: logInfo.refid,
                    refgid: clientInfoData.gid,
                    updatetoken: token,
                    location: locationName,
                    clienthotelrefno: clientInfoData.hotelrefno || logInfo.hoteltopid || logInfo.hotelpid || logInfo.hotelrefno,
                    hotelrefno: GENERAL_SETTINGS.HOTELREFNO
                },
            }).then((response) => {
                if (response.data && response.data.success) {
                    UseOrest({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: 'info/login',
                        token: token,
                        method: REQUEST_METHOD_CONST.GET,
                    }).then((infoLoginResponse) => {
                        if (infoLoginResponse.data && infoLoginResponse.data.success) {
                            onCallback(auth, infoLoginResponse.data.data)
                            enqueueSnackbar(t('str_clientInfoUpdateSuccess'), { variant: 'success' })
                        }
                    })
                } else {
                    if(response?.data?.msg === 'client_duplicate_mail'){
                        setIsRegistering(false)
                        enqueueSnackbar(t('str_thisEmailAddressHasBeenUsedBefore'), { variant: 'error' })
                    }else{
                        enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error' })
                    }
                }
            })
        } else {
            setIsRegistering(false)
            enqueueSnackbar(t('str_fillRequiredFields'), { variant: 'error' })
        }
    }

    return (
        <div className={classes.registerContainer}>
                <React.Fragment>
                    <Dialog open={open} aria-labelledby="form-dialog-title" maxWidth="md" disableEscapeKeyDown disableBackdropClick>
                        <DialogTitle id="form-dialog-title">{t('str_updateYourInformation')}</DialogTitle>
                        <DialogContent dividers={true}>
                            <Grid container className={classes.gridContainer}>
                                <Grid item xs={12}>
                                    <Grid container spacing={3} className={classes.grid}>
                                        <Grid item xs={12} sm={6}>
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
                                        <Grid item xs={12} sm={6}>
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
                                        <Grid item xs={12} sm={6}>
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
                                                }}
                                                error={client.email.isError}
                                                helperText={client.email.isError && client.email.errorText}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                                                <DatePicker
                                                    id="birthdate"
                                                    name="birthdate"
                                                    label={t('str_birthDate')}
                                                    value={client.birthdate.value}
                                                    inputFormat="DD/MM/YYYY"
                                                    required={client.birthdate.isRequired}
                                                    disableFuture
                                                    disabled={isRegistering}
                                                    onChange={handleChangeDatePicker}
                                                    renderInput={(props) => <TextField {...props} fullWidth variant={VARIANT} required={client.lastname.isRequired} error={client.birthdate.isError} helperText={client.birthdate.isError && client.birthdate.errorText}/>}
                                                />
                                            </LocalizationProvider>
                                        </Grid>
                                        {locationName !== "survey" && (
                                            <React.Fragment>
                                                <Grid item xs={12} sm={6}>
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
                                                <Grid item xs={12} sm={6}>
                                                    <PhoneInput
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
                                                <Grid item xs={12} sm={6}>
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
                                                <Grid item xs={12} sm={6}>
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
                                                <Grid item xs={12} sm={6}>
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
                                                <Grid item xs={12} sm={6}>
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
                                                <Grid item xs={12} sm={6}>
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
                                            </React.Fragment>
                                        )}
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid container className={classes.gridContainer}>
                                <Grid item xs={12}>
                                    <Grid container className={classes.grid} style={{ margin: '12px 0' }}>
                                        <Grid item xs={12}>
                                            <div style={{ paddingLeft: 18 }}>
                                                <FrameCheckbox
                                                    required={true}
                                                    value={client.hasdatapolicy.value || false}
                                                    title="str_privacyAndPersonalDataProtectionPolicies"
                                                    linkText="str_iAcceptDataPolicy"
                                                    linkTextADesc="str_privacyAndPersonalDataProtectionPolicies"
                                                    ifamePageUrl={GENERAL_SETTINGS.BASE_URL + `info/${locale || global.common.strDefShortLangCode}/${global.guestWeb.strDataPolicy}?iframe=true`}
                                                    isCheck={(e) => handleClickDataPolicyButtons(e)}
                                                />
                                            </div>
                                        </Grid>
                                        {locationName !== "survey" && (
                                            <Grid item xs={12}>
                                                <div style={{ paddingLeft: 18 }}>
                                                    <FrameCheckbox
                                                        required={true}
                                                        value={client.haspref.value || false}
                                                        title="str_hygieneAndTravelPolicies"
                                                        linkText="str_iAcceptTravelPolicy"
                                                        linkTextADesc="str_hygieneAndTravelPolicies"
                                                        ifamePageUrl={GENERAL_SETTINGS.BASE_URL + `info/${locale || global.common.strDefShortLangCode}/${global.guestWeb.strTravelPolicy}?iframe=true`}
                                                        isCheck={(e) => handleClickTravelPolicyButtons(e)}
                                                    />
                                                </div>
                                            </Grid>
                                        )}
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
                                                onClick={()=> handleClickRegister()}
                                                disabled={isRegistering}
                                                fullWidth
                                                variant="contained"
                                                className={classes.submit}
                                                color="primary"
                                            >
                                                {t('str_update')}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </DialogContent>
                    </Dialog>
                </React.Fragment>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Update)
