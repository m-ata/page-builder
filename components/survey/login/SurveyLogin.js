import React, { useContext } from 'react'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import useWidth from '@webcms-ui/hooks/use-width'
import { makeStyles } from '@material-ui/core/styles'
import styles from './style/SurveyLogin.style'
import stylesTabPanel from '../../guest/account/style/TabPanel.style'
import LoginComponent from '../../LoginComponent/LoginComponent'
import SurveyLayout from '../../layout/containers/SurveyLayout'
import useTranslation from 'lib/translations/hooks/useTranslation'
import QuickRegister from '../quick-register'
import ForgotPassword from 'components/common/forgot-password'
import SurveyBanner from 'components/survey/banner'
const useStyles = makeStyles(styles)
const useStylesTabPanel = makeStyles(stylesTabPanel)
import { useRouter } from 'next/router'
import WebCmsGlobal from 'components/webcms-global'

function SurveyLogin() {
    const { t } = useTranslation()
    const width = useWidth()
    const classes = useStyles()
    const classesTabPanel = useStylesTabPanel()
    const router = useRouter()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const isOnyEmail = false

    return (
        <SurveyLayout>
            <SurveyBanner />
            <Grid container spacing={3} justify={'space-evenly'} className={classes.grid}>
                {GENERAL_SETTINGS.hotelSettings.regenable ? (
                    <React.Fragment>
                        <Grid item xs={12} md={5} className={classes.gridItem}>
                            <Grid container spacing={3} className={classesTabPanel.gridContainer}>
                                <Grid item xs={12}>
                                    <Typography component="h1" variant="h5" className={classes.title}>
                                        {t('str_register')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <QuickRegister isEmpPortal={false}/>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} md={1}>
                            <Divider
                                className={classes.divider}
                                orientation={width === 'xs' || width === 'sm' ? 'horizontal' : 'vertical'}
                            />
                        </Grid>
                    </React.Fragment>): null}
                <Grid item xs={12} md={5} className={classes.gridItem}>
                    <Grid container spacing={2} className={classesTabPanel.gridContainer}>
                        <Grid item xs={12}>
                            <Typography component="h1" variant="h5" className={classes.title}>
                                {t('str_login')}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <LoginComponent redirectUrl={router.asPath || '/survey'} locationName="survey" isOnlyEmail={isOnyEmail}/>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container>
                                <Grid item>
                                    <ForgotPassword />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </SurveyLayout>
    )
}

export default SurveyLogin
