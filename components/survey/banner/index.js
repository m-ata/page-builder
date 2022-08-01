import React, { useContext } from 'react'
//import styles from './style/LoginBanner.style'
import Typography from '@material-ui/core/Typography'
import ListItem from '@material-ui/core/ListItem'
import List from '@material-ui/core/List'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import WebCmsGlobal from 'components/webcms-global'

const useStyles = makeStyles((theme) => ({
    loginBannerGrid: {
        background: `transparent radial-gradient(closest-side at 50% 42%, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.light} 49%, ${theme.palette.secondary.dark} 200%) 0% 0% no-repeat padding-box`,
        opacity: 1,
    },
    listItem: {
        paddingTop: 10,
        paddingBottom: 10,
        justifyContent: 'center',
    },
    loginBannerLogo: {
        width: '100%',
    },
}))

const SurveyBanner = () => {
    const classes = useStyles()
    const { GENERAL_SETTINGS, WEBCMS_DATA } = useContext(WebCmsGlobal)
    let logoUrl = WEBCMS_DATA.assets.images.logoBanner ? WEBCMS_DATA.assets.images.logoBanner : WEBCMS_DATA.assets.images.logo

    if(logoUrl){
        return (
            <Grid container justify="center" className={classes.loginBannerGrid}>
                <Grid item>
                    <List>
                        <ListItem className={classes.listItem}>
                            <img
                                src={GENERAL_SETTINGS.STATIC_URL + logoUrl}
                                alt="login banner"
                                className={classes.loginBannerLogo}
                            />
                        </ListItem>
                    </List>
                </Grid>
            </Grid>
        )
    }

    return null
}

export default SurveyBanner
