import React, { useContext, useEffect } from 'react'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import GuestLayout from 'components/layout/containers/GuestLayout'
import LoginBanner from 'components/layout/components/LoginBanner'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import useWidth from '@webcms-ui/hooks/use-width'
import Link from 'next/link'
import { makeStyles } from '@material-ui/core/styles'
import styles from './style/LoyaltyLogin.style'
import stylesTabPanel from '../account/style/TabPanel.style'
import LoginComponent from 'components/LoginComponent/LoginComponent'
import { NextSeo } from 'next-seo'
import WebCmsGlobal from 'components/webcms-global'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { useSelector } from 'react-redux'
import Router, { useRouter } from 'next/router'
import { CircularProgress } from '@material-ui/core'

const useStyles = makeStyles(styles)
const useStylesTabPanel = makeStyles(stylesTabPanel)

const urlFixer = (retUrl, lang, suffix) => {
    let isLang = lang ? true : false
    if (isLang) {
        return retUrl + `${suffix}lang=${lang}`
    } else {
        return retUrl
    }
}

function GuestLogin(props) {
    const { redirectUrl, logoBanner } = props
    const width = useWidth()
    const classes = useStyles()
    const { t } = useTranslation()
    const classesTabPanel = useStylesTabPanel()
    const { GENERAL_SETTINGS, WEBCMS_DATA } = useContext(WebCmsGlobal)
    const router = useRouter()
    const refUrlParam = router.query.refurl
    const isLogin = !!useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth)
    const infoLogin = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)

    useEffect(() => {
        if ((refUrlParam && isLogin && infoLogin)) {
            let refUrlDec = decodeURIComponent(refUrlParam)
            if (refUrlParam.includes('eventlocid')) {
                Router.push(urlFixer(refUrlDec, infoLogin.langshort, '&'))
            } else {
                if (!refUrlDec.includes('?lang')) {
                    if (refUrlDec.includes('&')) {
                        Router.push(urlFixer(refUrlDec, infoLogin.langshort, '&'))
                    } else {
                        Router.push(urlFixer(refUrlDec, infoLogin.langshort, '&'))
                    }
                } else {
                    Router.push(refUrlDec)
                }
            }
        }
    }, [])

    return (
        <GuestLayout>
            <NextSeo title={`${t('str_login')} - ${t('str_guestWeb')} - ` + WEBCMS_DATA.assets.meta.title} />
            <LoginBanner logoBanner={logoBanner} />
            {(refUrlParam && isLogin && infoLogin) ? (
                <Grid container spacing={3} justify='center'>
                    <Grid item>
                        <Typography variant='h6' style={{ marginTop: 20, fontSize: '1.2rem', textAlign: 'center' }}>{t('str_pleaseWait')}</Typography>
                    </Grid>
                </Grid>) : (
                <Grid container spacing={3} justify={'space-evenly'} className={classes.grid}>
                    <Grid item xs={12} md={5} className={classes.gridItem}>
                        <Grid container spacing={3} className={classesTabPanel.gridContainer}>
                            <Grid item xs={12}>
                                <Typography variant='h6' style={{ fontSize: '1.2rem' }}>{t('str_alreadyHaveBookingLogIn')}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <LoginComponent redirectUrl={redirectUrl} locationName='guest' />
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container>
                                    <Grid item>
                                        <Typography className={classes.forgetPw}>
                                            <Link href={'/guest/login/forgot-password'}>
                                                <a>{t('str_forgotPasswordOrGetPassword')}</a>
                                            </Link>
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    {GENERAL_SETTINGS.hotelSettings.regenable ? (
                        <React.Fragment>
                            <Grid item xs={12} md={1}>
                                <Divider
                                    className={classes.divider}
                                    orientation={width === 'xs' || width === 'sm' ? 'horizontal' : 'vertical'}
                                />
                            </Grid>
                            <Grid item xs={12} md={5} className={classes.gridItem}>
                                <Grid container spacing={3} className={classesTabPanel.gridContainer}>
                                    <Grid item xs={12}>
                                        <Typography variant='h6'>{t('str_orSignUpWith')}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Link href={'/guest/register'}>
                                            <a>
                                                <Button fullWidth variant='contained' color='primary'
                                                        className={classes.submit}>
                                                    {t('str_register')}
                                                </Button>
                                            </a>
                                        </Link>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </React.Fragment>
                    ) : null}
                </Grid>)}
        </GuestLayout>
    )
}

export default GuestLogin
