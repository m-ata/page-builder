import React, { useState, useEffect, useContext, useRef } from 'react'
import { connect, useSelector } from 'react-redux'
import axios from 'axios'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import Box from '@material-ui/core/Box'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import SettingsIcon from '@material-ui/icons/Settings';
import NotificationsIcon from '@material-ui/icons/Notifications';
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Router from 'next/router'
import MainListItems, { secondaryListItems } from './menu/listItems'
import Notifications from 'model/notification/components/Notifications'
import {
    DEFAULT_OREST_TOKEN,
    OREST_ENDPOINT, REQUEST_METHOD_CONST
} from 'model/orest/constants';
import Menu from '@material-ui/core/Menu'
import MenuIcon from "@material-ui/icons/Menu";
import AccountCircle from '@material-ui/icons/AccountCircle'
import MenuItem from '@material-ui/core/MenuItem'
import CircularProgress from '@material-ui/core/CircularProgress'
import PopupState, {
    bindTrigger,
    bindMenu,
    bindPopover
} from 'material-ui-popup-state';
import { useOrestAction } from 'model/orest'
import useTranslation from 'lib/translations/hooks/useTranslation'
import LocaleSwitcher from '../LocaleSwitcher'
import {resetState, updateState} from 'state/actions'
import Popover from '@material-ui/core/Popover';
import Dialog from '@material-ui/core/Dialog';
import ChangeHotelStep from './components/ChangeHotelStep/ChangeHotelStep';
import useHotelInfoAction from '../../model/orest/components/ChangeHotel/redux_store/useHotelInfoAction';
import Hidden from '@material-ui/core/Hidden';
import WebCmsGlobal from '../webcms-global';
import MenuList from '@material-ui/core/MenuList';
import ListItem from '@material-ui/core/ListItem';
import Badge from '@material-ui/core/Badge';
import BaseLoader from "../common/base-loader";
import {UseOrest, ViewList} from "@webcms/orest";
import {SLASH} from "../../model/globals";
import {Avatar} from "@material-ui/core";
import {setOrestState} from "../../model/orest/actions";

function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            <a href={'https://hotech.systems/'} target={'_blank'}>
                <img src={'imgs/powered-by.png'} style={{ width: 150 }} alt="powered by hotech"/>
            </a>
        </Typography>
    )
}

const drawerWidth = 250

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    toolbar: {
        paddingRight: 24, // keep right padding when drawer closed
    },
    toolbarIcon: props => ({
        backgroundColor: theme.palette.primary.ultraDark,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    }),
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        [theme.breakpoints.down("sm")]: {
            width:"100%"
        },
    },
    menuButton: {
        marginRight: 36,
    },
    menuButtonHidden: {
        display: 'none',
    },
    title: {
        flexGrow:"1",
        [theme.breakpoints.down("sm")]: {
            fontSize:"12px"
        },
    },
    drawerPaper: props => ({
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        backgroundColor: theme.palette.primary.dark,
        color: '#ffffff',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9),
        },
    },
    appBarSpacer: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
    },
    container: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
    },
    paper: {
        padding:"30px 0px 0px 25px",
        //padding: theme.spacing(2),
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
    },
    fixedHeight: {
        height: 240,
    },
    iconButton: {
        padding:0
    },
    menuStyle: {
        paddingBottom: "0"
    },
    popoverStyle: {
        minWidth:"300px",

    },
    accountMenuTitle: {
        fontSize: "18px",
        fontWeight: "500",
        color: "#43425D"
    },
    accountMenuEmail: {
        fontSize: "13px",
        fontWeight: "500",
        color: "#43425D"
    },
    menuItemStyle: {
        "&.MuiListItem-gutters": {
            paddingLeft: "32px",
            paddingRight: "32px"
        },
        "&.MuiButtonBase-root": {
            cursor: "unset",
            "&:hover": {
                backgroundColor:"#FFF"
            },
            "&:focus-visible": {
                backgroundColor:"#FFF"
            }
        }
    },
    accountMenuButton: {
        padding: "4px 8px",
        width: "100%",
        border: "1px solid #43425D",
        borderRadius: "5px",
        textTransform: "none",
        fontSize: "13px",
        fontWeight: "500",
        color: "#43425D"
    },
    accountMenuSignOutButton: {
        padding: "4px 8px",
        width: "100%",
        textTransform: "none",
        fontSize: "13px",
        fontWeight: "500",
        color: "#43425D",
        textAlign: "left",
        justifyContent: "left"
    },
    headerIcon: {
        color: "#BCBCCB"
    },
    accountViewButton: {
        [theme.breakpoints.only('xs')]: {
            flexGrow: "1",
            textAlign: "right",
        },
    },
    dividerStyle: {
        display:"inline",
        margin: "0 24px 0 12px",
        padding:"8px 1px"
    },
    // notificationStyle:{
    //     "& .MuiList-root": {
    //         width: "330px",
    //     },
    // },
    // badgeStyle:{
    //     "& .MuiBadge-colorPrimary" :{
    //         backgroundColor:"#00b7f1",
    //     }
    // },
    // listItemStyle:{
    //     paddingLeft:"32px!important",
    //     paddingRight:"40px!important",
    // },
    // typStyle:{
    //     fontWeight:"bold",
    //     padding:"8px 24px",
    //     color:"#1d3557",
    // },
}))


const UserPortalWrapper = (props) => {
    const classes = useStyles()

    //context
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal);
    const { t } = useTranslation()

    //redux
    const profilePictureUrl = useSelector((state) => state?.formReducer?.guest?.clientProfilePhoto || false)
    const hotelName = useSelector(state => state.hotelinfo.currentHotelName);
    const hotelRefNo = useSelector(state => state?.hotelinfo?.currentHotelRefNo || false);
    const hotelRefNoIsInitializing = useSelector(state => state.hotelinfo.isInitializing);
    const loginfo = useSelector(state => state.orest.currentUser && state.orest.currentUser.loginfo)
    const token = useSelector(state => state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN)
    const isLoggedIn = useSelector(state => state.orest.currentUser && state.orest.currentUser.auth)
    const empBase = useSelector((state) => state?.orest?.state?.emp || false)

    // orest redux
    const { setOrestState, deleteOrestCurrentUserInfo } = useOrestAction()
    const { deleteCurrentHotelInfo, updateLicenceMenuStatus, deleteLicenceMenuStatus } = useHotelInfoAction()

    //state
    const [userSettingsDialogOpen, setUserSettingsDialogOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [hotelInfo, setHotelInfo] = useState(null);
    const [open, setOpen] = useState(true)

    //props
    const { resetState, isSupplierPortal, isEmpPortal, updateState } = props

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    }
    const menuClickHandler = (popupProps) => {
        popupProps.close();
        setUserSettingsDialogOpen(true);
    }
    
    const dialogCloser = () => {
        setUserSettingsDialogOpen(false)
    }

    useEffect(() => {
        if (!isLoggedIn) {
            Router.push(isSupplierPortal ? '/supplier' : isEmpPortal ? '/emp' : '/hup')
        }
    }, [isLoggedIn])
    
    useEffect(() => {
        const options = {
            url: `${GENERAL_SETTINGS.OREST_URL}/${OREST_ENDPOINT.INFO}/${OREST_ENDPOINT.HOTEL}`,
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                keyval: hotelRefNo
            }
        }
        if(hotelRefNoIsInitializing) {
            axios(options).then(res => {
                setHotelInfo(res.data.data);
                const hotelChainStatus = res.data.data.ischain;
                if(!hotelChainStatus) {
                    updateLicenceMenuStatus(true);
                    localStorage.setItem("licenceMenuStatus", "true");
                } else {
                    updateLicenceMenuStatus(false);
                    localStorage.setItem("licenceMenuStatus", "false");
                }
                
            })
        }
    }, [hotelRefNo])

    useEffect(() => {
        if(loginfo?.mid && !profilePictureUrl && token) {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RAFILE,
                token,
                params: {
                    query: `code:PHOTO,masterid:${loginfo?.mid}`,
                }
            }).then(res => {
                if(res.status === 200) {
                    const raFileResponse = res.data.data
                    if(raFileResponse.length > 0) {
                        axios({
                            url: GENERAL_SETTINGS.OREST_URL + SLASH + OREST_ENDPOINT.TOOLS + SLASH + OREST_ENDPOINT.FILE + SLASH + OREST_ENDPOINT.DOWNLOAD,
                            headers: {
                                "Authorization": `Bearer ${token}`
                            },
                            method: REQUEST_METHOD_CONST.GET,
                            responseType: 'blob',
                            params: {
                                gid: raFileResponse[0]?.gid,
                            },
                        }).then(r1 => {
                            if(r1.status === 200) {
                                let url = URL.createObjectURL(r1.data)
                                updateState('guest', ['clientProfilePhoto'], url)
                            }
                        })
                    }
                }
            })
        }
        if(!empBase && token) {
            getEmpView(loginfo?.gid)
        }
    }, [token])

    const getEmpView = (gid) => {
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.EMPLOYEE + SLASH + OREST_ENDPOINT.VIEW + SLASH + 'get' + SLASH + gid,
            token,
            params: {
                hotelrefno: hotelRefNo
            }
        }).then(res => {
            if(res.status === 200) {
                setOrestState(['emp'], res.data.data)
            }
        })
    }

    const handleClickLogout = (popupProps) => {
        popupProps.close();
        resetState()
        deleteOrestCurrentUserInfo()
        deleteCurrentHotelInfo();
        deleteLicenceMenuStatus();
        Router.push(isSupplierPortal ? '/supplier' : isEmpPortal ? '/emp' : '/hup')
    }
    
    const handleAccountPageOpen = (popupProps) => {
        popupProps.close();
        Router.push(isSupplierPortal ? '/supplier/account' : isEmpPortal ? '/emp/account' : '/hup/account');
    }

    if (isLoggedIn) {
        return (
            <BaseLoader>
                <div className={classes.root}>
                    <Dialog className={classes.requestDialog}
                            open={userSettingsDialogOpen}
                            maxWidth={'sm'}>
                        <ChangeHotelStep dialogCloser={dialogCloser} />
                    </Dialog>
                    <AppBar position="absolute" color="inherit"
                            className={clsx(classes.appBar, open && classes.appBarShift)}>
                        <Toolbar className={classes.toolbar}>
                            <Hidden mdUp>
                                <IconButton
                                    className={classes.iconButton}
                                    color="inherit"
                                    aria-label="open drawer"
                                    onClick={handleDrawerToggle}
                                >
                                    <MenuIcon />
                                </IconButton>
                            </Hidden>
                            <Hidden xsDown>
                                <div className={classes.title} style={{marginRight: "auto", textAlign: "right"}}>
                                    <PopupState variant="popover" popupId="settings-menu">
                                        {(popupState) => (
                                            <React.Fragment>
                                                <IconButton color="inherit" {...bindTrigger(popupState)}>
                                                    <SettingsIcon className={classes.headerIcon}/>
                                                </IconButton>
                                                <Menu
                                                    {...bindMenu(popupState)}
                                                    getContentAnchorEl={null}
                                                    anchorOrigin={{
                                                        vertical: "bottom",
                                                        horizontal: "right"
                                                    }}
                                                    transformOrigin={{
                                                        vertical: "top",
                                                        horizontal: "right"
                                                    }}
                                                >
                                                    <MenuItem> <LocaleSwitcher/></MenuItem>
                                                    <MenuItem onClick={() => menuClickHandler(popupState)}>{t("str_changeHotel")}</MenuItem>
                                                </Menu>
                                            </React.Fragment>
                                        )}
                                    </PopupState>
                                    {/* Notification Panel
                                    <PopupState variant="popover" popupId="notification-panel">
                                        {(popupState) => (
                                            <React.Fragment>
                                                <IconButton color="inherit" {...bindTrigger(popupState)}>
                                                    <NotificationsIcon className={classes.headerIcon} />
                                                </IconButton>
                                                <Menu className={classes.notificationStyle}
                                                      {...bindMenu(popupState)}
                                                      getContentAnchorEl={null}
                                                      anchorOrigin={{
                                                          vertical: "bottom",
                                                          horizontal: "right"
                                                      }}
                                                      transformOrigin={{
                                                          vertical: "top",
                                                          horizontal: "right"
                                                      }}
                                                >
                                                    <MenuList>
                                                        <Typography variant="h6"
                                                                    className={classes.typStyle}>Notifications</Typography>
                                                        <ListItem button className={classes.listItemStyle}>
                                                            <Badge className={classes.badgeStyle}
                                                                   anchorOrigin={{
                                                                       vertical: 'top',
                                                                       horizontal: 'left',
                                                                   }}
                                                                   color="primary" variant="dot">
                                                            </Badge>
                                                            <Typography style={{ paddingLeft: "32px" }}>A very long text
                                                                that A very long text that A very long text
                                                                that </Typography>
                                                        </ListItem>
                                                    </MenuList>
                                                </Menu>
                                            </React.Fragment>
                                        )}
                                    </PopupState>
                               */}
                                    <Divider className={classes.dividerStyle} orientation="vertical" flexItem  />
                                    <Typography variant="subtitle1" color="inherit" align="right"
                                                style={{ display:"inline", fontSize:"13px" }}>
                                        { hotelName !== null ? hotelName : loginfo && loginfo.hotelname}, {loginfo && loginfo.firstname}
                                    </Typography>
                                </div>
                            </Hidden>
                            <PopupState variant="popover" popupId="loginfo-menu">
                                {(popupState) => (
                                    <React.Fragment>
                                        <div className={classes.accountViewButton}>
                                            <IconButton color="inherit" {...bindTrigger(popupState)}>
                                                <Avatar src={profilePictureUrl}/>
                                            </IconButton>
                                        </div>
                                        <Menu
                                            {...bindMenu(popupState)}
                                            getContentAnchorEl={null}
                                            classes={{
                                                paper: classes.popoverStyle,
                                                list: classes.menuStyle
                                            }}
                                            anchorOrigin={{
                                                vertical: "bottom",
                                                horizontal: "right"
                                            }}
                                            transformOrigin={{
                                                vertical: "top",
                                                horizontal: "right"
                                            }}
                                        >
                                            <MenuItem className={classes.menuItemStyle} disableTouchRipple>
                                                <div style={{display: "contents"}}>
                                                    <Avatar src={profilePictureUrl} style={{width: '64px', height: '64px'}}/>
                                                    <div style={{paddingLeft: "24px"}}>
                                                        <Typography className={classes.accountMenuTitle}>{loginfo.description}</Typography>
                                                        <Typography className={classes.accountMenuEmail}>{loginfo.email}</Typography>
                                                    </div>
                                                </div>
                                            </MenuItem>
                                            <MenuItem
                                                className={classes.menuItemStyle}
                                                style={{paddingTop: '18px', paddingBottom:"18px"}}
                                                disableTouchRipple
                                            >
                                                <Button className={classes.accountMenuButton} onClick={() => handleAccountPageOpen(popupState)}>
                                                    {t("str_viewAccount")}
                                                </Button>
                                            </MenuItem>
                                            <Hidden smUp>
                                                <MenuItem className={classes.menuItemStyle}>
                                                    <PopupState variant="popover" popupId="settings-menu">
                                                        {(popupState) => (
                                                            <React.Fragment>
                                                                <Button className={classes.accountMenuButton} {...bindTrigger(popupState)}>
                                                                    {t("str_settings")}
                                                                </Button>
                                                                <Menu
                                                                    {...bindMenu(popupState)}
                                                                    getContentAnchorEl={null}
                                                                    anchorOrigin={{
                                                                        vertical: "bottom",
                                                                        horizontal: "left"
                                                                    }}
                                                                    transformOrigin={{
                                                                        vertical: "top",
                                                                        horizontal: "left"
                                                                    }}
                                                                >
                                                                    <MenuItem> <LocaleSwitcher/></MenuItem>
                                                                    <MenuItem onClick={() => menuClickHandler(popupState)}>{t("str_changeHotel")}</MenuItem>
                                                                </Menu>
                                                            </React.Fragment>
                                                        )}
                                                    </PopupState>
                                                </MenuItem>
                                            </Hidden>
                                            <MenuItem
                                                className={classes.menuItemStyle}
                                                style={{backgroundColor:"#00000029"}}
                                                disableTouchRipple
                                            >
                                                <Button
                                                    className={classes.accountMenuSignOutButton}
                                                    onClick={() => handleClickLogout(popupState)}
                                                >
                                                    {t("str_logout")}
                                                </Button>
                                            </MenuItem>
                                        </Menu>
                                    </React.Fragment>
                                )}
                            </PopupState>
                        </Toolbar>
                        <Hidden mdUp>
                            <Drawer
                                variant="temporary"
                                anchor={"left"}
                                classes={{
                                    paper: classes.drawerPaper
                                }}
                                open={drawerOpen}
                                onClose={handleDrawerToggle}
                            >
                                <div className={classes.toolbarIcon}>
                                    <img src="imgs/hotech/hotech-user-portal-new-logo.png"/>
                                </div>
                                <Divider/>
                                <List><MainListItems isEmpPortal={isEmpPortal} hotelInfo={hotelInfo && hotelInfo !== null ? hotelInfo : null}/></List>
                                <Divider/>
                                <List>{secondaryListItems}</List>
                            </Drawer>
                        </Hidden>
                    </AppBar>
                    <Hidden smDown implementation="js">
                        <Drawer
                            variant="permanent"
                            classes={{
                                paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
                            }}
                            open={open}
                        >
                            <div className={classes.toolbarIcon}>
                                <img src={isSupplierPortal? 'imgs/supplier-portal/supplier-portal-logo-svg.svg' : isEmpPortal ? 'imgs/emp-portal/emp-portal-logo.svg' : 'imgs/hotech/hotech-user-portal-new-logo.png'}/>
                            </div>
                            <Divider/>
                            <List><MainListItems hotelInfo={hotelInfo && hotelInfo !== null ? hotelInfo : null} isEmpPortal={isEmpPortal} isSupplierPortal={isSupplierPortal}/></List>
                            <Divider/>
                            <List>{secondaryListItems}</List>
                        </Drawer>
                    </Hidden>
                    <main className={classes.content} style={{ backgroundColor: isEmpPortal ? '#EBEBEB' : '#F0F0F7'}}>
                        <div className={classes.appBarSpacer}/>
                        <Container maxWidth="xl" className={classes.container}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    {props.children}
                                </Grid>
                            </Grid>
                            <Box pt={4}>
                                <Copyright/>
                            </Box>
                        </Container>
                    </main>
                    <Notifications/>
                </div>
            </BaseLoader>
        )
    } else {
        return (
            <React.Fragment>
                <Typography variant="h6" style={{ paddingTop: '20%' }} align="center" gutterBottom>
                    <CircularProgress color="inherit" size={20}/>{' '} {t('str_pleaseKeepWaiting')}
                </Typography>
            </React.Fragment>
        )

    }

}

const mapDispatchToProps = (dispatch) => ({
    resetState: () => dispatch(resetState()),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

const mapStateToProps = state => {
    return {
        state: state.formReducer.userPortal,
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(UserPortalWrapper)
