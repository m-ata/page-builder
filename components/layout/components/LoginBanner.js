import React, { useContext } from 'react'
import styles from './style/LoginBanner.style'
import Typography from '@material-ui/core/Typography'
import ListItem from '@material-ui/core/ListItem'
import List from '@material-ui/core/List'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import WebCmsGlobal from '../../webcms-global'
import { useRouter } from 'next/router'
import useTranslation from 'lib/translations/hooks/useTranslation'

const useStyles = makeStyles(styles)

const LoginBanner = (props) => {
    const { logoBanner } = props
    const classes = useStyles()
    const { GENERAL_SETTINGS, WEBCMS_DATA } = useContext(WebCmsGlobal)
    const { t } = useTranslation()
    const router = useRouter()
    const preArrival = Boolean(router.query.preArrival === 'true' || router.query.prearrival === 'true')
    let logoUrl = WEBCMS_DATA.assets.images.logoBanner ? WEBCMS_DATA.assets.images.logoBanner : WEBCMS_DATA.assets.images.logo

    return (
        <Grid container justify="center" className={classes.loginBannerGrid}>
            <Grid item>
                <List>
                    <ListItem className={classes.listItem}>
                        <Typography variant="h6" className={classes.title} style={{ color: WEBCMS_DATA.assets.colors.primary.contrastText || '#ffffff' }}>
                            {t('str_welcome')}
                        </Typography>
                    </ListItem>
                    <ListItem className={classes.listItem}>
                        <img
                            src={GENERAL_SETTINGS.STATIC_URL + logoUrl}
                            alt="login banner"
                            className={classes.loginBannerLogo}
                        />
                    </ListItem>
                    {!preArrival && (
                        <ListItem className={classes.listItem}>
                            { logoBanner ?
                                <div
                                    dangerouslySetInnerHTML={{ __html: logoBanner && Buffer.from(logoBanner, 'base64').toString('utf-8') }}
                                /> :
                                <Typography variant="h6" className={classes.memberClubText} style={{ color: WEBCMS_DATA.assets.colors.primary.contrastText || '#ffffff' }}>
                                    {t('str_guestPortal')}
                                </Typography>
                            }
                        </ListItem>
                    )}
                </List>
            </Grid>
        </Grid>
    )
}

export default LoginBanner
