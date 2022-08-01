import React, { useContext, useEffect, useState } from 'react'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import { required, validateEmail } from 'state/utils/form'
import { REQUEST_METHOD_CONST } from 'model/orest/constants'
import useNotifications from 'model/notification/useNotifications'
import WebCmsGlobal from 'components/webcms-global'
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline'
import { useRouter } from 'next/router'
import axios from 'axios'
import useTranslation from 'lib/translations/hooks/useTranslation'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Container from '@material-ui/core/Container'
import styles from 'components/guest/reset-password/style/ForgotPassword.style'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx';

const useStyles = makeStyles(styles)

export default function ForgotPassword(props) {
    const { isUserPortalLogin, isEmpPortal, emailFromLogin, noClient } = props;
    const { GENERAL_SETTINGS, locale } = useContext(WebCmsGlobal)
    const router = useRouter()
    const surveyGid = router.query.surveyGid || false
    const emailParam = router.query.email

    //redux
    const { showSuccess, showError } = useNotifications()
    const { t } = useTranslation()

    //state
    const [email, setEmail] = useState({ address: '', isError: false, errorText: '' })
    const [isSending, setIsSending] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const [open, setOpen] = React.useState(false);

    const colorObject = {
        textColor: isUserPortalLogin ? '#063E8D' : isEmpPortal ? '#064E42' : 'inherit'
    }
    const classes = useStyles({textColor: colorObject.textColor})

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        if (emailParam) {
            setEmail({
                ...email,
                address: emailParam,
            })
        }
        if(emailFromLogin) {
            setEmail({
                ...email,
                address: emailFromLogin,
                isError: !!validateEmail(emailFromLogin),
                errorText: validateEmail(emailFromLogin),
            })
        } else {
            setEmail({
                ...email,
                address: '',
                isError: !!validateEmail(''),
                errorText: validateEmail(''),
            })
        }
    }, [emailFromLogin])

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
                    surveygid: surveyGid,
                    langcode: locale,
                    noclient: noClient
                },
            })
                .then((response) => {
                    if (response.status === 200 && response.data.success === true) {
                        setIsSuccess(true)
                        showSuccess(t('str_passwordSuccessfullyReset'))
                    } else {
                        setIsSending(false)
                        showError(t('str_passwordCloudNotReset'))
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
            {
                isUserPortalLogin || isEmpPortal ? (
                    <Typography onClick={handleClickOpen} className={classes.textStyle}>
                        {t("str_forgotYourPassword")}
                    </Typography>
                ) : (
                    <Button variant="outlined" color="primary" onClick={handleClickOpen}>
                        {t('str_forgotYourPassword')}
                    </Button>
                )
            }
            <Dialog open={open} onClose={handleClose} aria-labelledby="forgot-dialog-title" maxWidth="md">
                <DialogTitle id="forgot-dialog-title">{t('str_forgotYourPassword')}</DialogTitle>
                <DialogContent dividers={true}>
                    <Container maxWidth="md">
                    <Grid container spacing={3} className={classes.gridContainer}>
                        <Grid item xs={12}>
                            <Grid
                                container
                                spacing={3}
                                justify={'center'}
                            >
                                {!isSuccess ? (
                                    <React.Fragment>
                                        <Grid item xs={12}>
                                            <TextField
                                                className={clsx("", {
                                                    [classes.textFieldUserPortal]: isUserPortalLogin,
                                                })}
                                                variant={!isUserPortalLogin ? "filled" : "outlined"}
                                                required
                                                id="email"
                                                name="email"
                                                type="email"
                                                label={t("str_email")}
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
                                                className={clsx(classes.sendButton, {
                                                    [classes.sendButtonUserPortal]: isUserPortalLogin,
                                                })}
                                                onClick={handleClickSend}
                                                fullWidth
                                                size="large"
                                                variant="contained"
                                                disabled={isSending || email.isError}
                                                color="primary"
                                            >
                                                {t('str_send')}
                                            </Button>
                                        </Grid>
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
                    </Grid>
                    </Container>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    )
}
