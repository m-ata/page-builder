import React, { useState } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';
import Hidden from '@material-ui/core/Hidden';
import Dialog from '@material-ui/core/Dialog';
import styles from '../../../assets/jss/cloud-wiki/components/wikiHeader.style'
import {makeStyles} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import GoogleLogin from '../../../model/google/components/GoogleLogin/GoogleLogin';
import WikiNavMenu from '../WikiNavMenu/WikiNavMenu';
import {useRouter} from 'next/router';
import {resetState, setToState} from '../../../state/actions';
import {
    connect,
    useSelector
} from 'react-redux';
import PopupState, {
    bindMenu,
    bindTrigger
} from 'material-ui-popup-state';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import LocaleSwitcher from '../../LocaleSwitcher';
import useTranslation from '../../../lib/translations/hooks/useTranslation';
import {useOrestAction} from '../../../model/orest';
import useHotelInfoAction from '../../../model/orest/components/ChangeHotel/redux_store/useHotelInfoAction';
import LoginComponent from "../../LoginComponent/LoginComponent";



const useStyles = makeStyles(styles);

function WikiHeader(props){
    const classes =  useStyles();
    
    const { state, setToState } = props;
    const { t } = useTranslation();
    const [wikiLoginDialog, setWikiLoginDialog] = useState(false);

    const { deleteOrestCurrentUserInfo } = useOrestAction()
    const { deleteCurrentHotelInfo } = useHotelInfoAction()
    const orestCurrentUser = useSelector(state => state.orest.currentUser);
    const loginfo = useSelector(state => state.orest.currentUser && state.orest.currentUser.loginfo);
    const hotelName = useSelector(state => state.hotelinfo.currentHotelName);
    
    const [drawerOpen, setDrawerOpen] = useState(false);
    const router = useRouter();
    
    const handleGoToHome = () => {
        setToState('cloudWiki', ['googleDocId'], 'home' );
        router.push({
            pathname: `/userdoc`,
            query: {q: router.query.q, lang: router.query.lang}
        })
    }
    
    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    }
    
    const handleClickLogout = (popupProps) => {
        popupProps.close();
        deleteOrestCurrentUserInfo()
        deleteCurrentHotelInfo();
    }


    return(
        <div>
            <Dialog
                    open={wikiLoginDialog}
                    fullWidth
                    maxWidth={'sm'}
            >
                <div style={{padding:"24px"}}>
                    <div style={{float: "right"}}>
                        <IconButton onClick={() => setWikiLoginDialog(false)}>
                            <CloseIcon />
                        </IconButton>
                    </div>
                    <LoginComponent isUserPortalLogin={true} isCloudWikiLogin setWikiLoginDialog={setWikiLoginDialog}/>
                </div>
            </Dialog>
        <AppBar className={classes.appBar} position="fixed">
            <Toolbar>
                <Hidden mdUp>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={handleDrawerToggle}
                    >
                        <MenuIcon />
                    </IconButton>
                </Hidden>
                <div style={{display:"contents"}} onClick={() => handleGoToHome()}>
                    <svg className={classes.appBarLeftLinks} width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M30.3115 23.9908C29.9109 24.6809 29.3531 25.2124 28.705 25.5863C27.408 26.3354 25.7394 26.3951 24.3442 25.589L24.3281 25.58C22.1489 24.3211 20.8087 21.9938 20.813 19.4776L20.8146 18.5231L21.6697 18.0294C23.8461 16.7728 26.5273 16.7728 28.7034 18.029C30.7982 19.2301 31.5123 21.896 30.3115 23.9908Z" fill="#2697D4"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M12.0852 12.5072L12.0849 13.4766L11.2297 13.9703C9.05329 15.2269 6.37248 15.2269 4.19602 13.9707C2.10126 12.7696 1.38127 10.0939 2.58793 8.00853C3.79419 5.92359 6.45497 5.19968 8.54973 6.40084L8.57015 6.41262C10.7466 7.67034 12.0864 9.9937 12.0852 12.5072Z" fill="#FCB655"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M30.4208 8.19625C31.4994 10.3024 30.5547 12.8995 28.5051 14.0826C26.4512 15.2685 23.9205 15.2704 21.8646 14.0873L20.8115 13.4813L20.8135 12.2664C20.8166 9.89429 22.0834 7.70369 24.1377 6.51785L24.3459 6.39766C26.5035 5.15172 29.2707 5.95027 30.4208 8.19625Z" fill="#00A79E"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M11.0347 17.9123L12.0877 18.5184L12.0862 19.7337C12.0826 22.1054 10.8159 24.296 8.76158 25.4818C6.71239 26.6649 3.99112 26.1849 2.7063 24.1978C1.33624 22.0783 2.02834 19.2832 4.18595 18.0372L4.39413 17.9174C6.44843 16.7312 8.9788 16.7292 11.0347 17.9123Z" fill="#F16A4B"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M20.8191 4.37337C20.8191 6.88606 19.4785 9.20825 17.302 10.4648L16.4473 10.9585L15.6071 10.4742C13.4295 9.21846 12.0877 6.89627 12.0869 4.3828V4.35884C12.0846 1.94984 14.0458 -0.00783228 16.4603 2.35608e-05C18.8693 -0.00272598 20.8269 1.95888 20.8191 4.37337Z" fill="#67B548"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M17.28 21.5172C19.4615 22.7718 20.8065 25.0963 20.8073 27.6129V27.631C20.8073 29.2426 19.9219 30.6578 18.6151 31.412C17.9764 31.7808 17.2376 31.998 16.4394 32C14.0249 31.9925 12.0731 30.0412 12.0806 27.6267C12.0806 25.1136 13.4212 22.7918 15.5976 21.5352L16.4528 21.0415L17.28 21.5172Z" fill="#4666B0"/>
                    </svg>
                    <div className={classes.appBarLeftLinks} style={{cursor:'pointer'}} onClick={() => handleGoToHome()}>
                        <a className={classes.aStyle}>
                            <Typography className={classes.appBarTitle}>
                                {t("str_userDocs")}
                            </Typography>
                        </a>
                    </div>
                </div>
                    {
                        orestCurrentUser ? (
                            <div className={classes.appBarRightLinks}>
                                <div style={{display:"flex"}}>
                                    <Typography color="inherit" align="right" className={classes.title}
                                                style={{ marginRight:'auto', alignSelf:"center"}}>
                                        { hotelName !== null ? hotelName : loginfo && loginfo.hotelname}, {loginfo && loginfo.firstname}
                                    </Typography>
                                    <PopupState variant="popover" popupId="loginfo-menu">
                                        {(popupState) => (
                                            <React.Fragment>
                                                <IconButton color="inherit" {...bindTrigger(popupState)}>
                                                    <AccountCircle />
                                                </IconButton>
                                                <Menu
                                                    classes={{
                                                        paper: classes.menuPaper
                                                    }}
                                                    {...bindMenu(popupState)}
                                                    anchorOrigin={{
                                                        vertical: "top",
                                                        horizontal: "right"
                                                    }}
                                                    transformOrigin={{
                                                        vertical: "top",
                                                        horizontal: "left"
                                                    }}
                                                >

                                                    <MenuItem><LocaleSwitcher className={classes.withLoginTranslateButton}/></MenuItem>
                                                    {
                                                        loginfo.hotelrefno === 999999 || loginfo.hotelrefno === 115445176 ?
                                                            <MenuItem><GoogleLogin /></MenuItem>
                                                            : null
                                                    }
                                                    <MenuItem onClick={() => handleClickLogout(popupState)}>{t("str_logout")}</MenuItem>
                                                </Menu>
                                            </React.Fragment>
                                        )}
                                    </PopupState>
                                </div>
                            </div>
                        ) : (
                            <div className={classes.appBarRightLinks}>
                                <LocaleSwitcher className={classes.withoutLoginTranslateButton}/>
                                <Button color={"inherit"} onClick={() => setWikiLoginDialog(true)}>{t("str_login")}</Button>
                            </div>
                        )
                    }
            </Toolbar>
        </AppBar>
            <Hidden mdUp>
                <Drawer
                    variant="temporary"
                    anchor={"left"}
                    className={classes.drawerStyle}
                    classes={{
                        paper: classes.drawerStyle
                    }}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    open={drawerOpen}
                    onClose={handleDrawerToggle}
                >
                    <div className={classes.navMenu}>
                        <WikiNavMenu />
                    </div>
                </Drawer>
            </Hidden>
            <Hidden smDown implementation="js">
                <Drawer
                    variant="permanent"
                    className={classes.drawerStyle}
                    classes={{
                        paper: classes.drawerStyle
                    }}
                >
                    <div className={classes.navMenu}>
                        <WikiNavMenu />
                    </div>
                </Drawer>
            </Hidden>
        </div>
    )
    
}

const mapDispatchToProps = (dispatch) => ({
    resetState: () => dispatch(resetState()),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

const mapStateToProps = state => {
    return {
        state: state.formReducer.cloudWiki,
    }
}

export default connect(mapStateToProps, mapDispatchToProps,)(WikiHeader)
