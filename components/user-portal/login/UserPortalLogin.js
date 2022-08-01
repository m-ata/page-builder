import React, { useContext } from 'react'
import Grid from '@material-ui/core/Grid'
import LoginComponent from '../../LoginComponent/LoginComponent'
import { NextSeo } from 'next-seo'
import WebCmsGlobal from 'components/webcms-global'
import { makeStyles } from '@material-ui/core/styles'
import styles from './style/UserPortalLogin.style'
import UserPortalLayout from '../../layout/containers/UserPortalLayout'
import stylesTabPanel from '../../guest/account/style/TabPanel.style'

const useStyles = makeStyles(styles)
const useStylesTabPanel = makeStyles(stylesTabPanel)

export default function UserPortalLogin() {
    const classes = useStyles()
    const classesTabPanel = useStylesTabPanel()
    const { WEBCMS_DATA } = useContext(WebCmsGlobal)

    return (
        <UserPortalLayout>
            <NextSeo title={'Login - User Portal - ' + WEBCMS_DATA.assets.meta.title} />
            <Grid
                container
                spacing={3}
                justify={'space-evenly'}
                alignItems={'center'}
                className={classesTabPanel.gridContainer}
            >
                <Grid item xs={12} md={6}>
                    <LoginComponent redirectUrl={'/hup'} locationName="hup"/>
                </Grid>
            </Grid>
        </UserPortalLayout>
    )
}
