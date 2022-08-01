import React, { useContext, useEffect, useState, useRef } from 'react'
import { connect } from 'react-redux'
import { setToState, updateState } from 'state/actions'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Button from '@material-ui/core/Button'
import Container from '@material-ui/core/Container'
import Link from 'next/link'
import { makeStyles } from '@material-ui/core/styles'
import styles from './style/Header.style'
import WebCmsGlobal from 'components/webcms-global'
import LocaleSwitcher from 'components/LocaleSwitcher'
import Grid from '@material-ui/core/Grid'
import Hidden from '@material-ui/core/Hidden';
import { useOrestAction } from 'model/orest'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import axios from 'axios'
import useTranslation from 'lib/translations/hooks/useTranslation'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Avatar from '@material-ui/core/Avatar'
import ListItemText from '@material-ui/core/ListItemText'
import IconButton from '@material-ui/core/IconButton'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import Faq from 'components/guest/public/components/faq'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import SelectHotel from '../guest/public/SelectHotel'
import BusinessIcon from '@material-ui/icons/Business'
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state'
import DialogFaq from "../guest/public/components/DialogFaq"
import LoginDialog from "../LoginComponent/LoginDialog"
import MenuIcon from '@material-ui/icons/Menu'
import ChangePassword from '../guest/account/Details/ChangePassword'
import LockIcon from '@material-ui/icons/Lock'
import {Typography} from "@material-ui/core"
import Divider from "@material-ui/core/Divider"
const useStyles = makeStyles(styles)

const Header = (props) => {
    const { langSelect, loginButton, state, setToState, updateState, isLoginWrapper, isShowFullName, isGuestProfile } = props
        , classes = useStyles()
        , Router = useRouter()
        , { GENERAL_SETTINGS, WEBCMS_DATA } = useContext(WebCmsGlobal)
        , { t } = useTranslation()
        , appBarRef = useRef()

    //redux
    const { deleteOrestCurrentUserInfo, resetOrestState } = useOrestAction()
        , isLoggedIn = useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth)
        , token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
        , clientBase = useSelector((state) => state?.orest?.state?.client || false)
        , loginfo = useSelector(state => state?.orest?.currentUser?.loginfo || false)

    //state
    const [faqDialog, setFaqDialog] = useState(false)
        , [open, setOpen] = useState(false)
        , [changePassDialogOpen, setChangePassDialogOpen] = useState(false)

    const clientBeforeLoader = async (active, mid, type) => {
        if ((type === 'client' && state.clientProfilePhoto !== null || type === 'agency' && state.agencyProfilePhoto !== null) && mid && token) {
            await axios({
                url: `${GENERAL_SETTINGS.OREST_URL}/tools/file/download`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                method: 'get',
                responseType: 'arraybuffer',
                params: {
                    code: 'PHOTO',
                    masterid: mid,
                    hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
                },
            }).then((r) => {
                if (active) {
                    if (r.status === 200) {
                        let blob = new Blob([r.data], { type: r.data.type })
                        let url = URL.createObjectURL(blob)
                        if (type === 'client') {
                            updateState('guest', 'clientProfilePhoto', url)
                        } else if (type === 'agency') {
                            updateState('guest', 'agencyProfilePhoto', url)
                        }
                    } else {
                        if (type === 'client') {
                            updateState('guest', 'clientProfilePhoto', null)
                        } else if (type === 'agency') {
                            updateState('guest', 'agencyProfilePhoto', null)
                        }
                    }
                    if (type === 'client') updateState('guest', 'clientMid', clientBase.mid)
                }
            })
        }
    }

    useEffect(() => {
        let active = true
        clientBeforeLoader(active, clientBase?.mid, 'client').then(() => {
            return true
        })

        if (isGuestProfile) {
            clientBeforeLoader(active, loginfo?.mid, 'agency').then(() => {
                return true
            })
        }

        return () => {
            active = false
        }
    }, [clientBase])

    const handleResetState = () => {
        updateState('guest', 'memCardNext', false)
        updateState('guest', 'clientMid', false)
        updateState('guest', 'clientProfilePhoto', false)
        updateState('guest', 'clientLoyaltyCard', false)
        setToState('guest', ['profile', 'loadGuest'], true)
        deleteOrestCurrentUserInfo()
        resetOrestState()
    }

    const handleClickLogout = () => {
        if (!GENERAL_SETTINGS.ISPORTAL && Router.pathname === '/guest') {
            Router.push({
                pathname: Router.pathname,
                query: {
                    menu: 'home',
                },
                shallow: true,
            })
        }

        if (!GENERAL_SETTINGS.ISPORTAL) {
            updateState('guest', 'changeHotelRefno', false)
        }

        handleResetState()
    }

    const isKiosk = Router.query.kiosk === 'true'
        , isChangeHotel = GENERAL_SETTINGS?.ISCHAIN || false

    return (
        <React.Fragment>
            <LoginDialog
                open={open || state.openLoginDialog}
                onClose={(status) => {
                    setOpen(status)
                    setToState("guest", ["openLoginDialog"], status)
                }}
                locationName='destinationPortal'
                isLoginWrapper
            />
            <div style={{minHeight: appBarRef?.current?.offsetHeight || 64}} />
            <AppBar position="fixed" className={classes.appBar} ref={appBarRef}>
                <Toolbar className={isLoginWrapper ? classes.toolbarDestinationPortal : classes.toolBar}>
                    <Container maxWidth="xl" className={isLoginWrapper ? classes.container : ""}>
                       <Grid container>
                           <Hidden xsDown>
                               <Grid item xs={2}>
                                   {!Router.pathname.includes('epay') ? (
                                       <Link href={'/'}>
                                           <a>
                                               <img
                                                   src={GENERAL_SETTINGS.STATIC_URL + WEBCMS_DATA.assets.images.logo}
                                                   alt="logo"
                                                   className={classes.headerLogo}
                                               />
                                           </a>
                                       </Link>
                                   ) : (
                                       <img
                                           src={GENERAL_SETTINGS.STATIC_URL + WEBCMS_DATA.assets.images.logo}
                                           alt="logo"
                                           className={classes.headerLogo}
                                       />
                                   )}
                               </Grid>
                           </Hidden>
                           <Hidden smUp>
                               <Grid item xs={2}>
                                   {WEBCMS_DATA.assets.images.favIcon ? <IconButton><Avatar style={{objectFit: 'fill'}} variant="square" alt="Logo" src={GENERAL_SETTINGS.STATIC_URL + WEBCMS_DATA.assets.images.favIcon} /></IconButton> : null}
                               </Grid>
                           </Hidden>
                           <Grid item xs={10}  style={{alignSelf: "center"}} className={classes.noPrint}>
                               <Grid container justify={'flex-end'} alignItems={'center'} style={{ width: 'unset' }}>
                                   <Hidden xsDown>
                                       {isChangeHotel || isLoggedIn ? (
                                           <Grid item>
                                               <Button disableElevation={!(isChangeHotel && !isLoginWrapper)} disableFocusRipple={!(isChangeHotel && !isLoginWrapper)} disableRipple={!(isChangeHotel && !isLoginWrapper)}  startIcon={<BusinessIcon />} onClick={()=> (isChangeHotel && !isLoginWrapper) ? setToState("guest", ["isHotelListOpen"], true): false}>
                                                   {(isChangeHotel && !isLoginWrapper) ? state.changeHotelRefno ? state.changeHotelName : t('str_chooseHotel'): WEBCMS_DATA?.assets?.meta?.title || ""}
                                               </Button>
                                           </Grid>
                                       ): null}
                                   {langSelect ? (
                                       <Grid item>
                                           {isLoginWrapper ? <LocaleSwitcher isPortal/> : <LocaleSwitcher />}
                                       </Grid>
                                   ): null}
                                   {(!Router.pathname.includes('survey') && loginButton && !isLoggedIn && !isKiosk) ? (
                                           <Grid item>
                                               {isLoginWrapper ? (
                                                   <Button
                                                       color={"primary"}
                                                       variant="contained"
                                                       className={classes.headerLoginButton}
                                                       onClick={() => setOpen(true)}
                                                   >
                                                       {t("str_login")}
                                                   </Button>
                                               ) : (
                                                   <Link href={'/guest/login'}>
                                                       <a>
                                                           <Button onClick={handleResetState}>{t('str_login')}</Button>
                                                       </a>
                                                   </Link>
                                               )}
                                           </Grid>
                                       ): null}
                                   </Hidden>
                                   {(isLoggedIn && isKiosk) ? (
                                       <Grid item className={classes.noPrint}>
                                           <Button onClick={handleClickLogout}>{t('str_logout')}</Button>
                                       </Grid>
                                   ): null}
                                   {!isLoggedIn ? (
                                       <Grid item className={classes.noPrint}>
                                           <Hidden smUp>
                                               <PopupState variant='popover' popupId='base-menu'>
                                           {(popupState) => (
                                               <React.Fragment>
                                                   <IconButton  {...bindTrigger(popupState)} style={{ padding: 8, marginLeft: 6 }}>
                                                       <MenuIcon />
                                                   </IconButton>
                                                   <Menu {...bindMenu(popupState)}>
                                                           {isChangeHotel && !isLoginWrapper ? (
                                                               <MenuItem>
                                                                   <Button startIcon={<BusinessIcon />} onClick={()=> setToState("guest", ["isHotelListOpen"], true)}>
                                                                       { state.changeHotelRefno ? state.changeHotelName : t('str_chooseHotel')}
                                                                   </Button>
                                                               </MenuItem>
                                                           ) : null}
                                                           {langSelect && (
                                                               <MenuItem>
                                                                   {isLoginWrapper ? <LocaleSwitcher isPortal/> : <LocaleSwitcher />}
                                                               </MenuItem>
                                                           )}
                                                       {!Router.pathname.includes('survey') && loginButton && !isLoggedIn && (
                                                           <MenuItem>
                                                               {isLoginWrapper ? (
                                                                   <Button
                                                                       color={"primary"}
                                                                       variant="contained"
                                                                       className={classes.headerLoginButton}
                                                                       onClick={() => setOpen(true)}
                                                                   >
                                                                       {t("str_login")}
                                                                   </Button>
                                                               ) : (
                                                                   <Link href={'/guest/login'}>
                                                                       <a>
                                                                           <Button onClick={handleResetState}>{t('str_login')}</Button>
                                                                       </a>
                                                                   </Link>
                                                               )}
                                                           </MenuItem>
                                                       )}
                                                   </Menu>
                                               </React.Fragment>
                                           )}
                                       </PopupState>
                                           </Hidden>
                                       </Grid>
                                   ): null}
                                   {isLoggedIn && !isKiosk ? (
                                       <Grid item  className={classes.noPrint}>
                                           <PopupState variant='popover' popupId='login-avatar-menu'>
                                               {(popupState) => (
                                                   <React.Fragment>
                                                       {isShowFullName ? (
                                                           <div style={{display: 'flex', alignItems: 'center'}}>
                                                               <Hidden xsDown><Divider className={classes.dividerStyle} orientation="vertical" flexItem  /></Hidden>
                                                               <Typography className={classes.loginName}>{loginfo?.fullname}</Typography>
                                                               <IconButton  {...bindTrigger(popupState)} style={{ padding: 8, marginLeft: 6 }}>
                                                                   <Avatar src={isGuestProfile ? state?.agencyProfilePhoto || '' : state?.clientProfilePhoto || ''} />
                                                               </IconButton>
                                                           </div>
                                                       ) : (
                                                           <IconButton  {...bindTrigger(popupState)} style={{ padding: 8, marginLeft: 6 }}>
                                                               <Avatar src={isGuestProfile ? state?.agencyProfilePhoto || '' : state?.clientProfilePhoto || ''} />
                                                           </IconButton>
                                                       )}
                                                       <Menu {...bindMenu(popupState)}>
                                                           <Hidden smUp>
                                                           {isChangeHotel && !isLoginWrapper ? (
                                                               <MenuItem>
                                                                   <Button startIcon={<BusinessIcon />} onClick={()=> setToState("guest", ["isHotelListOpen"], true)}>
                                                                       { state.changeHotelRefno ? state.changeHotelName : t('str_chooseHotel')}
                                                                   </Button>
                                                               </MenuItem>
                                                           ) : null}
                                                           {langSelect ? (
                                                               <MenuItem>
                                                                   {isLoginWrapper ? <LocaleSwitcher isPortal/> : <LocaleSwitcher />}
                                                               </MenuItem>
                                                           ): null}
                                                           </Hidden>
                                                           <MenuItem onClick={() => {
                                                               popupState.close()
                                                               setFaqDialog(true)
                                                           }}>
                                                               <ListItemIcon className={classes.listItemIcon}>
                                                                   <HelpOutlineIcon />
                                                               </ListItemIcon>
                                                               <ListItemText primary={t('str_faq')} />
                                                           </MenuItem>
                                                           <MenuItem onClick={() => {
                                                               popupState.close()
                                                               setChangePassDialogOpen(true)
                                                           }}>
                                                               <ListItemIcon className={classes.listItemIcon}>
                                                                   <LockIcon />
                                                               </ListItemIcon>
                                                               <ListItemText primary={t('str_changePassword')} />
                                                           </MenuItem>
                                                           {isLoggedIn ? (
                                                               <MenuItem onClick={() => {
                                                                   popupState.close()
                                                                   handleClickLogout()
                                                               }}>
                                                                   <ListItemIcon className={classes.listItemIcon}>
                                                                       <ExitToAppIcon />
                                                                   </ListItemIcon>
                                                                   <ListItemText primary={t('str_logout')} />
                                                               </MenuItem>
                                                           ): null}
                                                       </Menu>
                                                   </React.Fragment>
                                               )}
                                           </PopupState>
                                       </Grid>
                                   ): null}
                               </Grid>
                           </Grid>
                       </Grid>
                    </Container>
                </Toolbar>
            </AppBar>
            {(GENERAL_SETTINGS.hotelSettings.faqshow && isLoggedIn) ? (
                <Faq>
                    <DialogFaq
                        open={faqDialog}
                        onClose={() => setFaqDialog(false)}
                    />
                </Faq>
            ): null}
            {isChangeHotel ? (
            <Dialog open={state.isHotelListOpen} onClose={()=> setToState("guest", ["isHotelListOpen"], false)} aria-labelledby="form-dialog-title" maxWidth="md" fullWidth>
                <DialogTitle id="form-dialog-title">{t('str_chooseYourHotel')}</DialogTitle>
                <DialogContent>
                    <SelectHotel onClose={()=>  setToState("guest", ["isHotelListOpen"], false)}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=> setToState("guest", ["isHotelListOpen"], false)} color="primary">
                        {t('str_cancel')}
                    </Button>
                </DialogActions>
            </Dialog>
            ): null}
            {isLoggedIn ? <ChangePassword dialogOpen={changePassDialogOpen} onClose={(e)=> setChangePassDialogOpen(e)} buttonVisible={false}/>: null}
        </React.Fragment>
    )
}


const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Header)
