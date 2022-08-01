import React, { useContext, useEffect, useState } from 'react'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Divider from '@material-ui/core/Divider'
import styles from './style/ForgotPassword.style'
import { makeStyles } from '@material-ui/core/styles'
import BackToLoginLink from '../../layout/components/BackToLoginLink'
import { required, validateEmail } from '../../../state/utils/form'
import { isErrorMsg, REQUEST_METHOD_CONST } from '../../../model/orest/constants'
import WebCmsGlobal from '../../webcms-global'
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline'
import { useRouter } from 'next/router'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import useTranslation from 'lib/translations/hooks/useTranslation'

const useStyles = makeStyles(styles)

export default function GuestForgotPasswordAction(props) {
    const classes = useStyles();
    const { isDestinationPortal, setIsDestinationPortal } = props;
    const { enqueueSnackbar } = useSnackbar()

    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const router = useRouter()
    const emailParam = router.query.email

    //redux
    const { t } = useTranslation()

    //state
    const [email, setEmail] = useState({ address: '', isError: false, errorText: '' })
    const [isSending, setIsSending] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        if (emailParam) {
            setEmail({
                ...email,
                address: emailParam,
            })
        }
    }, [])

    const handleChangeEmail = (e) => {
        const value = e.target.value

        setEmail({
            ...email,
            address: value,
            isError: !!validateEmail(value),
            errorText: validateEmail(value),
        })
    }

    const handleClickSend = () => {
        if (!required(email.address) && !validateEmail(email.address)) {
            setIsSending(true)
            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/ors/user/forgot-password',
                method: REQUEST_METHOD_CONST.POST,
                data: {
                    email: email.address,
                },
            }).then((response) => {
                if (response.status === 200 && response.data.success === true) {
                    setIsSuccess(true)
                    enqueueSnackbar(t('str_passwordSuccessfullyReset'), { variant: 'success' })
                } else {
                    if (response.data.error === 'no_client') {
                        setEmail({
                            ...email,
                            isError: true,
                            errorText: t('str_thereIsNoUserForThisEmailPleaseCheckYourEmail')
                        })
                        setIsSending(false)
                    } else {
                        enqueueSnackbar(t('str_passwordCloudNotReset'), { variant: 'warning' })
                        setIsSending(false)
                    }
                }
            })
        } else {
            if (!!required(email.address)) {
                setEmail({
                    ...email,
                    isError: !!required(email.address),
                    errorText: required(email.address),
                })
            }
        }
    }

    return (
        <React.Fragment>
            <Grid container spacing={3} className={classes.gridContainer}>
                <Grid item xs={12}>
                    <Grid
                        container
                        spacing={3}
                        direction={'column'}
                        justify={'center'}
                        alignItems={isDestinationPortal ? 'unset' : 'center'}
                        className={classes.gridContainer}
                    >
                        {!isSuccess ? (
                            <React.Fragment>
                                {
                                    !isDestinationPortal ?
                                        <Grid item xs={12} className={classes.gridItem}>
                                            <Typography component="h1" variant="h5" className={classes.title}>
                                                {t('str_forgotYourPassword')}
                                            </Typography>
                                        </Grid> : null
                                }
                                <Grid item xs={12} className={classes.gridItem}>
                                    <TextField
                                        className={isDestinationPortal ? classes.textFieldDestinationPortal : ""}
                                        required
                                        id="email"
                                        name="email"
                                        type="email"
                                        label="Email Address"
                                        variant={!isDestinationPortal ? "filled" : "outlined"}
                                        color={"primary"}
                                        value={email.address}
                                        onKeyUp={handleChangeEmail}
                                        onKeyDown={handleChangeEmail}
                                        onChange={handleChangeEmail}
                                        error={email.isError}
                                        helperText={email.isError && email.errorText}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} className={classes.gridItem}>
                                    <Button
                                        onClick={handleClickSend}
                                        fullWidth
                                        variant="contained"
                                        disabled={isSending || email.isError}
                                        className={classes.sendButton}
                                        color="primary"
                                    >
                                        {t('str_send')}
                                    </Button>
                                </Grid>
                                {
                                    isDestinationPortal ?
                                        <Grid item xs={12} style={{ textAlign: "right" }}>
                                            <Button color={"primary"} onClick={() => (setIsDestinationPortal(false))}>{t("str_back")}</Button>
                                        </Grid> : null
                                }
                            </React.Fragment>
                        ) : (
                            <Grid item xs={12}>
                                <Grid
                                    container
                                    spacing={3}
                                    direction={'column'}
                                    justify={'center'}
                                    alignItems={'center'}
                                >
                                    <Grid item>
                                        <CheckCircleOutlineIcon className={classes.successIcon} />
                                    </Grid>
                                    <Grid item>
                                        <Typography component="h2" variant="h5" className={classes.titleSuccess1}>
                                            {t('str_weSentYouPasswordCreationMail')}
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography component="h3" variant="h5" className={classes.titleSuccess2}>
                                            {t('str_pleaseCheckYourMailbox')}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                        )}
                    </Grid>
                </Grid>
                {
                    !isDestinationPortal ?
                        <React.Fragment>
                            <Grid item xs={12}>
                                <Divider className={classes.divider} />
                            </Grid>
                            <Grid item xs={12} style={{ padding: '12px 12px 24px 12px' }}>
                                <BackToLoginLink />
                            </Grid>
                        </React.Fragment>
                         : null
                }
            </Grid>
        </React.Fragment>
    )
}
