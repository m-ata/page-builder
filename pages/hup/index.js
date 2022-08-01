import React from 'react'
import Grid from '@material-ui/core/Grid'
import {Card, CardContent, Box, Container} from '@material-ui/core'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import LoginComponent from 'components/LoginComponent/LoginComponent'
import Notifications from 'model/notification/components/Notifications'
import { NextSeo } from 'next-seo'
import useTranslation from 'lib/translations/hooks/useTranslation'
import ForgotPassword from '../../components/common/forgot-password';
import PortalLoginWrapper from "../../components/PortalLoginWrapper";

function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            <a href={'https://hotech.systems/'} target={'_blank'}>
                <img src={'imgs/powered-by.png'} style={{ width: 150 }} alt="powered by hotech" />
            </a>
        </Typography>
    )
}

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
        backgroundColor: "#F0F0F7"
    },
    image: {
        textAlign: "center",
        padding: 20,
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
    paper: {
        padding: "32px 64px",
        textAlign: "center",
        [theme.breakpoints.down('sm')]: {
            padding: "32px 24px",
        },
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: 'rgb(60, 59, 83)',
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    cardRoot: {
        borderRadius: "20px",
        maxWidth: "548px",
        [theme.breakpoints.down('md')]: {
            margin: "auto"
        },
    },
    loginTitle: {
        paddingBottom:"32px",
        fontSize: "40px",
        fontWeight: "bold",
        color: "#466EB6",
        letterSpacing: "0"
    },
    tabsRoot: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    }
}))

export default function SignInSide() {
    const { t } = useTranslation()
    const classes = useStyles()
   

    return (
        <React.Fragment>
            <NextSeo title={'Hotech - User Portal - ' + 'Login'} />
            <PortalLoginWrapper
                isUserPortal
                redirectUrl={'/hup/request'}
                leftSideLogo={'imgs/hotech/logo-text.png'}
                leftSideImage={'imgs/hotech/left-side.png'}
                locationName={'hup'}
            />
        </React.Fragment>
    )
}
