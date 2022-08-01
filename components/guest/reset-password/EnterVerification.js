import React from 'react'
import GuestLayout from '../../layout/containers/GuestLayout'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Divider from '@material-ui/core/Divider'
import LoginBanner from '../../layout/components/LoginBanner'
import Link from 'next/link'
import styles from './style/EnterVerification.style'
import { makeStyles } from '@material-ui/core/styles'
import BackToLoginLink from '../../layout/components/BackToLoginLink'
import useTranslation from 'lib/translations/hooks/useTranslation'

const useStyles = makeStyles(styles)

export default function EnterVerification() {
    const { t } = useTranslation()
    const classes = useStyles()

    return (
        <GuestLayout>
            <LoginBanner />
            <Grid container spacing={3} className={classes.grid}>
                <Grid item xs={12}>
                    <form className={classes.form} noValidate>
                        <Grid
                            container
                            spacing={3}
                            direction={'column'}
                            justify={'center'}
                            alignItems={'center'}
                            className={classes.grid}
                        >
                            <Grid item xs={12} className={classes.gridItem1}>
                                <Typography component="h1" variant="h5" className={classes.title}>
                                    {t('str_enterTheVerificationCode')}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} className={classes.gridItem1}>
                                <TextField
                                    required
                                    variant="filled"
                                    id="verificationcode"
                                    name="verificationcode"
                                    label="Verification Code"
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} className={classes.gridItem1}>
                                <Link href={'/login/resetpassword/verify'}>
                                    <a>
                                        <Button fullWidth variant="contained" className={classes.submit}>
                                            {t('str_verify')}
                                        </Button>
                                    </a>
                                </Link>
                            </Grid>
                        </Grid>
                    </form>
                </Grid>
                <Grid item xs={12}>
                    <Divider className={classes.divider} />
                </Grid>
                <Grid item xs={12} style={{ marginBottom: 40 }}>
                    <BackToLoginLink />
                </Grid>
            </Grid>
        </GuestLayout>
    )
}
