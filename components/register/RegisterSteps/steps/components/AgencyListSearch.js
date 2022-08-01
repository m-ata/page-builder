import React, { useContext, useEffect, useState } from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import CircularProgress from '@material-ui/core/CircularProgress'
import { setToState, updateState } from 'state/actions'
import { connect } from 'react-redux'
import { makeStyles } from '@material-ui/core'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import WebCmsGlobal from 'components/webcms-global'
import Grid from '@material-ui/core/Grid'
import useTranslation from 'lib/translations/hooks/useTranslation'
import Typography from '@material-ui/core/Typography'
import ReCaptcha from 'react-google-recaptcha'
import { CHCK_EMAIL } from 'model/orest/constants'
import useNotifications from 'model/notification/useNotifications'
import axios from 'axios'
import LoadingSpinner from 'components/LoadingSpinner'
import PhoneInput from '../../../../../@webcms-ui/core/phone-input'

const useStyles = makeStyles((theme) => ({
    endAdornment: {
        marginRight: 15,
    },
}))

const useStylesOther = makeStyles((theme) => ({
    wrapper: {
        margin: theme.spacing(1),
        position: 'relative',
    },
    buttonProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
    checkYourRegistrationTitle: {
        [theme.breakpoints.down('sm')]: {
            marginTop: 50,
            fontSize: '0.8rem',
        },
    },
}))

const AgencyListSearch = (props) => {
    const { state, setToState, updateState } = props
    const cls = useStyles()
    const classes = useStylesOther()
    const [open, setOpen] = useState(false)
    const { t } = useTranslation()
    const { showSuccess, showError } = useNotifications()
    const { GENERAL_SETTINGS, locale } = useContext(WebCmsGlobal)
    const [activeClientModal, setActiveClientModal] = useState(false)
    const [passiveClientModal, setPassiveClientModal] = useState(false)
    const [isSelected, setIsSelected] = useState(false)
    const [isReCaptcha, setIsReCaptcha] = useState('')
    const [contactMail, setContactMail] = useState('')
    const [contactMailValid, setContactMailValid] = useState(false)
    const [contactTel, setContactTel] = useState('')
    const [contactTelValid, setContactTelValid] = useState(false)
    const [contactMailLoading, setContactMailLoading] = useState(false)
    const [isPageLoaded, setIsPageLoaded] = useState(false)

    useEffect(() => {
        if (!isPageLoaded) {
            setIsPageLoaded(true)
        }
    })

    useEffect(() => {
        const source = axios.CancelToken.source()
        let active = true
        if (
            state.agencyListSearch.inputAgencyValue &&
            state.agencyListSearch.inputAgencyValue.length > 2 &&
            isSelected === false
        ) {

            setTimeout(() => {
                setToState('registerStepper', ['agencyListSearch', 'isInitialized'], true)
                axios({
                    url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/self-register/search',
                    cancelToken: source.token,
                    method: 'post',
                    params: {
                        name: String(state.agencyListSearch.inputAgencyValue),
                    },
                })
                    .then((hotelListResponse) => {
                        if (active) {
                            const hotelListData = hotelListResponse.data
                            if (hotelListData.success) {
                                setToState('registerStepper', ['agencyListSearch', 'isInitialized'], false)
                                setOpen(true)
                                setToState('registerStepper', ['agencyList'], hotelListData.data)
                            } else {
                                setOpen(false)
                                setToState('registerStepper', ['agencyListSearch', 'isContinue'], false)
                                setToState('registerStepper', ['agencyListSearch', 'isInitialized'], false)
                            }
                        }
                    })

            }, 500)

        } else {
            setOpen(false)
            setToState('registerStepper', ['agencyListSearch', 'isInitialized'], false)
        }

        return () => {
            source.cancel()
            active = false
        }
    }, [state.agencyListSearch.inputAgencyValue])

    const handleOnChange = (newValue) => {
        setIsSelected(true)
        setToState('registerStepper', ['agencyListSearch', 'selectedAgency'], newValue)
        setToState('registerStepper', ['agencyListSearch', 'isContinue'], true)

        if (newValue) {
            if (newValue.isactive === true) {
                setActiveClientModal(true)
            }

            if (newValue.isactive === false) {
                setPassiveClientModal(true)
            }
        }
    }

    const sendContactMail = () => {
        if (!contactMail || !CHCK_EMAIL.test(contactMail)) {
            setContactMailValid(true)
            showError(t('str_checkYourEmailError'))
        }else if(!contactTel || 10 > contactTel.length) {
            setContactTelValid(true)
        }else if(!isReCaptcha) {
            showError(t('str_confirmCaptchaError'))
        }else {
            setContactMailLoading(true)
            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/self-register/send',
                method: 'post',
                params: {
                    hotelname: state.agencyListSearch.inputAgencyValue,
                    email: contactMail,
                    tel: contactTel,
                    recaptcha: isReCaptcha,
                },
            }).then((sendContactMailResponse) => {
                if (sendContactMailResponse.data.success === true) {
                    showSuccess(t('str_contactMailSendMsg'))
                    setContactMailLoading(false)
                    setPassiveClientModal(false)
                } else {
                    showError(t('str_contactMailNotSendError'))
                    setContactMailLoading(false)
                }
            })
        }
    }

    const reCaptchaChange = (value) => {
        setIsReCaptcha(value)
    }

    return (
        <React.Fragment>
            <Dialog
                open={activeClientModal}
                onClose={() => setActiveClientModal(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{'Info'}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">{t('str_haveActiveRecordMsg')}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setActiveClientModal(false)} color="primary">
                        {t('str_no')}
                    </Button>
                    <Button
                        onClick={() => (window.top.location.href = 'https://portal.hotech.systems/hup')}
                        color="primary"
                    >
                        {t('str_yes')}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={passiveClientModal}
                onClose={() => setPassiveClientModal(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{'Info'}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">{t('str_haveRecordModuleMsg')}</DialogContentText>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                required={true}
                                id="outlined-basic"
                                label="Email"
                                onChange={(e) => {
                                    setContactMail(e.target.value)
                                    setContactMailValid(false)
                                }}
                                variant="outlined"
                                fullWidth={true}
                                error={contactMailValid}
                                value={contactMail}
                            />
                        </Grid>
                        <Grid item xs={12}>
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
                                variant="outlined"
                                id="username"
                                name="username"
                                label={t('str_phone')}
                                fullWidth
                                value={contactTel}
                                onChange={e =>  {
                                    setContactTelValid(false)
                                    setContactTel(e)
                                }}
                                error={contactTelValid}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <ReCaptcha sitekey={GENERAL_SETTINGS.RECAPTCHA_SITE_KEY} onChange={reCaptchaChange}/>
                        </Grid>
                        <Grid item xs={12}>
                            <div className={classes.wrapper}>
                                <Button
                                    style={{ marginRight: 'auto' }}
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    onClick={() => sendContactMail()}
                                    disabled={!isReCaptcha || !contactMail || !contactTel || contactMailLoading}
                                    disableElevation
                                >
                                    {t('str_send')}
                                </Button>
                                {contactMailLoading && (
                                    <CircularProgress size={24} className={classes.buttonProgress}/>
                                )}
                            </div>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPassiveClientModal(false)} color="primary">
                        {t('str_close')}
                    </Button>
                </DialogActions>
            </Dialog>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h6" align="center" className={classes.checkYourRegistrationTitle} gutterBottom>
                        {t('str_checkYourRegistration')}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    {isPageLoaded ? (
                        <Autocomplete
                            clearOnBlur={false}
                            filterOptions={(x) => x}
                            id="agency-list-search"
                            options={state.agencyList}
                            loading={state.agencyListSearch.isInitialized}
                            autoComplete
                            blurOnSelect
                            includeInputInList
                            filterSelectedOptions
                            getOptionDisabled={(option) => (typeof option === 'string' ? true : false)}
                            classes={cls}
                            forcePopupIcon={false}
                            noOptionsText={t('str_agencylistNoOptionRegisterContinue')}
                            loadingText={state.agencyListSearch.isInitialized && t('str_pleaseWait')}
                            open={open}
                            value={!state.isCheckCompany ? state.agencyListSearch.selectedAgency : ''}
                            getOptionLabel={(option) => (typeof option === 'string' ? option : option.code)}
                            onChange={(event, newValue) => {
                                handleOnChange(newValue)
                            }}
                            inputValue={state.agencyListSearch.inputAgencyValue}
                            onInputChange={(event, newInputValue) => {
                                setIsSelected(false)
                                setToState('registerStepper', ['agencyListSearch', 'isContinue'], false)
                                setToState(
                                    'registerStepper',
                                    ['agencyListSearch', 'inputAgencyValue'],
                                    newInputValue.toUpperCase(),
                                )
                                setToState('registerStepper', ['basics', 'agency', 'code'], newInputValue.toUpperCase())
                            }}
                            renderOption={(option) => (
                                <React.Fragment>
                                    {state.agencyListSearch.inputAgencyValue && option && option.code && (
                                        <React.Fragment>
                                            <span style={{ color: '#000000', fontSize: '12px' }}> {option.code}</span>
                                            <span
                                                style={{
                                                    color: 'grey',
                                                    fontSize: '12px',
                                                    textAlign: 'right',
                                                    marginLeft: 20,
                                                }}
                                            >
                                                {option.town}
                                                {option.city && option.town && ' - '}
                                                {option.city}
                                                {option.city && ', '}
                                                {option.rescountrycode}
                                            </span>
                                        </React.Fragment>
                                    )}
                                </React.Fragment>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    required
                                    size="small"
                                    label={t('str_propertyName')}
                                    fullWidth
                                    helperText={
                                        state.agencyListSearch.inputAgencyValue &&
                                        3 > state.agencyListSearch.inputAgencyValue.length
                                            ? t('str_enterThreeToSearch')
                                            : ''
                                    }
                                    InputLabelProps={{
                                        style: { backgroundColor: 'white', paddingLeft: 5, paddingRight: 5 },
                                    }}
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <React.Fragment>
                                                {state.agencyListSearch.isInitialized ? (
                                                    <CircularProgress color="inherit" size={20}/>
                                                ) : null}
                                                {params.InputProps.endAdornment}
                                            </React.Fragment>
                                        ),
                                    }}
                                />
                            )}
                        />
                    ) : (
                        <LoadingSpinner size={30}/>
                    )}
                </Grid>
            </Grid>
        </React.Fragment>
    )
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

export default connect(mapStateToProps, mapDispatchToProps)(AgencyListSearch)
