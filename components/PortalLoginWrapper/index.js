import React, { useState } from 'react'
import Grid from '@material-ui/core/Grid'
import {Card, CardContent, Box, Container, Collapse, Button} from '@material-ui/core'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import LoginComponent from 'components/LoginComponent/LoginComponent'
import Notifications from 'model/notification/components/Notifications'
import useTranslation from 'lib/translations/hooks/useTranslation'
import ForgotPassword from '../../components/common/forgot-password';
import PropTypes from "prop-types";
import QuickRegister from "../survey/quick-register";

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
        display: 'flex',
        alignItems: 'center',
        height: '100vh'
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
    cardRoot: {
        borderRadius: "20px",
        [theme.breakpoints.down('lg')]: {
            maxWidth: "450px",
        },
        [theme.breakpoints.up('xl')]: {
            maxWidth: "520px",
            minHeight: '300px'
        },
        [theme.breakpoints.down('md')]: {
            margin: "auto"
        },
    },
    loginTitle: {
        paddingBottom:"32px",
        fontSize: "40px",
        fontWeight: "bold",
        letterSpacing: "0"
    },
    leftSideLogo: {
        width: '100%',
        paddingBottom:"24px",
        maxWidth:"500px",
        [theme.breakpoints.down('lg')]: {
            maxWidth:"300px",
        },
    },
    leftSideImage: {
        width: '100%',
        maxWidth:'680px',
        [theme.breakpoints.down('lg')]: {
            maxWidth:"500px",
        },
    }
}))

export default function PortalLoginWrapper(props) {
    const { t } = useTranslation()
    const classes = useStyles()

    const {isSupplierPortal, isEmpPortal, isUserPortal, leftSideImage, leftSideLogo, groundColor, redirectUrl, locationName} = props

    const [isCollapseLogin, setIsCollapseLogin] = useState(true);
    const [isCollapseRegister, setIsCollapseRegister] = useState(false);
    const [email, setEmail] = useState('')

    return (
        <div className={classes.root} style={{backgroundColor: groundColor ? groundColor : "#F0F0F7"}}>
            <Container maxWidth="xl">
                <Grid container>
                    <Grid item sm={false} md={6} className={classes.image}>
                        {
                            leftSideLogo && (
                                <img
                                    className={classes.leftSideLogo}
                                    src={leftSideLogo}
                                />
                            )
                        }
                        {
                            leftSideImage && (
                                <img
                                    src={leftSideImage}
                                    className={classes.leftSideImage}
                                />
                            )
                        }
                    </Grid>
                    <Grid item xs={12} sm={12} md={6}>
                        <div style={{display: 'flex', justifyContent: 'center'}}>
                            <Card className={classes.cardRoot} elevation={6}>
                                <CardContent className={classes.paper}>
                                    <Typography className={classes.loginTitle} color={'primary'}>
                                        { isCollapseLogin ?  t('str_login') : isEmpPortal && isCollapseRegister ? t('str_register') : ''}
                                    </Typography>
                                    <Collapse in={isCollapseLogin}>
                                        <Grid container>
                                            <Grid item xs={12}>
                                                <LoginComponent
                                                    redirectUrl={redirectUrl}
                                                    isEmpPortal={isEmpPortal}
                                                    isUserPortalLogin={isUserPortal}
                                                    locationName={locationName}
                                                    getEmail={(value) => setEmail(value)}/>
                                            </Grid>
                                            <Grid item xs={12}>
                                                {
                                                    isEmpPortal && (
                                                        <React.Fragment>
                                                            <div style={{paddingTop: "16px"}}/>
                                                            <Button
                                                                style={{fontWeight: '600', textTransform: 'none'}}
                                                                onClick={() => {
                                                                    setIsCollapseRegister(true)
                                                                    setIsCollapseLogin(false)
                                                                }}
                                                            >
                                                                {t('str_dontHaveAnAccount')}
                                                                {t('str_register')}
                                                            </Button>
                                                        </React.Fragment>
                                                    )
                                                }
                                                <ForgotPassword isEmpPortal={isEmpPortal} isUserPortalLogin={isUserPortal} emailFromLogin={email} noClient={true}/>
                                            </Grid>
                                        </Grid>
                                    </Collapse>
                                    {isEmpPortal && (
                                        <Collapse in={isCollapseRegister}>
                                            <QuickRegister
                                                isEmpPortal={isEmpPortal}
                                                variant={'outlined'}
                                                isOpenRegister={isCollapseRegister}
                                                showBackButton
                                                onClickBackButton={() => {
                                                    setIsCollapseLogin(true)
                                                    setIsCollapseRegister(false)
                                                }}
                                            />
                                        </Collapse>
                                    )}
                                    <br />
                                    <Copyright />
                                    <Notifications />
                                </CardContent>
                            </Card>
                        </div>
                    </Grid>
                </Grid>
            </Container>
        </div>
    )
}

PortalLoginWrapper.propTypes = {
    isSupplierPortal: PropTypes.bool,
    isEmpPortal: PropTypes.bool,
    isUserPortal: PropTypes.bool,
    leftSideImage: PropTypes.string,
    leftSideLogo: PropTypes.string,
    groundColor: PropTypes.string,
    redirectUrl: PropTypes.string
}