import React, { useState, useEffect, useContext } from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import LoginComponent from './LoginComponent'
import Typography from '@material-ui/core/Typography'
import Collapse from '@material-ui/core/Collapse'
import CloseIcon from '@material-ui/icons/Close'
import useTranslation from 'lib/translations/hooks/useTranslation'
import QuickRegister from "../survey/quick-register"
import GuestForgotPasswordAction from "../guest/reset-password/GuestForgotPasswordAction"


const useStyles = makeStyles((theme) => ({
    dialogRoot: {
        "& .MuiDialog-paper": {
            borderRadius: "20px",
            height: "645px",
            width: "548px"
        }
    },
    dialogTitle: {
        textAlign: "center",
        "& .MuiTypography-h6": {
            fontSize: "40px",
            fontWeight: "bold",
        },
        [theme.breakpoints.up("xl")]: {
            paddingTop: "36px",
        },
    },
    rootDiv: {
        padding: "0 48px",
        [theme.breakpoints.down("xs")]: {
            padding: "0 24px",
        },
    },
    bottomDiv: {
        paddingTop: "24px",
        textAlign: "center"
    },
    registerText: {
        fontSize: "15px",

    },
    forgotPasswordText: {
        paddingTop: "8px",
        fontSize: "15px",
    },
    dialogContent: {
        overflowY: "unset",
        padding: "16px 0",
        [theme.breakpoints.down("sm")]: {
            padding: "8px 0",
            "& .MuiDialogContent-dividers": {
                padding: "8px 0",
            }
        },
    },
    closeIcon: {
        position: "absolute",
        top: "16px",
        right: "0",
        [theme.breakpoints.down("sm")]: {
            top: "8px",
        },
    }

}))

function Copyright() {
    return (
        <Typography>
            <a href={'https://hotech.systems/'} target={'_blank'}>
                <img src={'imgs/powered-by.png'} style={{ width: 150 }} alt="powered by hotech" />
            </a>
        </Typography>
    )
}

const LoginDialog = (props) =>{
    const classes = useStyles();

    const { open, onClose, locationName, isLoginWrapper, disableRegister } = props
    const { t } = useTranslation()
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
    const [isRegister, setIsRegister] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);

   useEffect(() => {
       if(!open) {
           setIsRegister(false);
           setIsForgotPassword(false);
       }
   }, [open])

    useEffect(() => {
        if(loginfo){
            onClose(false)
        }

    }, [loginfo])

    return (
        <Dialog className={isLoginWrapper ? classes.dialogRoot : ""} onClose={()=> onClose(false)} aria-labelledby="login-dialog-title" open={open} disableEnforceFocus>
            <div style={{position: "relative", height: "100%"}}>
                <div style={{textAlign: "center", position: "absolute", bottom: "24px",left: "50%", transform: "translateX(-50%)"}}>
                    <Copyright />
                </div>
                <div className={isLoginWrapper ? classes.rootDiv : ""} style={ isLoginWrapper && isForgotPassword ? {display: "flex", flexDirection: "column", height: "100%", justifyContent: "center"} : null}>
                    { isLoginWrapper ?
                        <div style={{position: "relative"}}>
                            <div className={classes.closeIcon}>
                                <CloseIcon color={"primary"} onClick={() => onClose(false)} style={{cursor: "pointer"}}/>
                            </div>
                        </div>
                        : null
                    }
                    <Collapse in={!isRegister && !isForgotPassword}>
                        <React.Fragment>
                            <DialogTitle color={"primary"} className={classes.dialogTitle} id="login-dialog-title" onClose={()=> onClose(false)}>
                                {t('str_login')}
                            </DialogTitle>
                            <DialogContent className={classes.dialogContent} dividers>
                                <LoginComponent locationName={locationName} isLoginWrapper={isLoginWrapper}/>
                                {
                                    isLoginWrapper ? (
                                        <div className={classes.bottomDiv}>
                                            {!disableRegister && (<Typography color={"primary"} className={classes.registerText}>
                                                {t("str_dontHaveAnAccount")}
                                                <a onClick={() => setIsRegister(true)} style={{cursor: "pointer"}}>
                                                    {" " + t("str_register")}
                                                </a>
                                            </Typography>)}
                                            <Typography color={"primary"} className={classes.forgotPasswordText} style={{cursor: "pointer"}}>
                                                <a onClick={() => setIsForgotPassword(true)}>{t("str_forgotPassword")}</a>
                                            </Typography>
                                        </div>
                                    ) : null
                                }
                            </DialogContent>
                        </React.Fragment>
                    </Collapse>
                    <Collapse in={isLoginWrapper && isRegister}>
                        <React.Fragment>
                            <DialogTitle className={classes.dialogTitle} id="login-dialog-title" onClose={()=> onClose(false)}>
                                {t('str_register')}
                            </DialogTitle>
                            <DialogContent className={classes.dialogContent} dividers>
                                <QuickRegister
                                    isEmpPortal={false}
                                    variant={'outlined'}
                                    isRegisterWrapper={isRegister}
                                    showBackButton
                                    onClickBackButton={() => {
                                        setIsRegister(false)
                                    }}
                                />
                            </DialogContent>
                        </React.Fragment>
                    </Collapse>
                    <Collapse in={isLoginWrapper && isForgotPassword}>
                        <React.Fragment>
                            <div>
                                <DialogTitle className={classes.dialogTitle} id="login-dialog-title" onClose={()=> onClose(false)}>
                                    {t('str_forgotYourPassword')}
                                </DialogTitle>
                                <DialogContent className={classes.dialogContent} dividers>
                                    <GuestForgotPasswordAction
                                        isDestinationPortal
                                        setIsDestinationPortal={setIsForgotPassword}
                                    />
                                </DialogContent>
                            </div>
                        </React.Fragment>
                    </Collapse>
                    <DialogActions>
                        <Grid container>
                            <Grid item xs={12}>

                            </Grid>
                            {!isLoginWrapper ?
                                    <Grid item xs={12} style={{textAlign: "right"}}>
                                        <Button onClick={()=> onClose(false)} color="primary">
                                            {t('str_close')}
                                        </Button>
                                    </Grid> : null
                            }
                        </Grid>
                    </DialogActions>
                </div>
            </div>
        </Dialog>
    )
}

export default LoginDialog