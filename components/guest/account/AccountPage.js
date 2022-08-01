import React, { useEffect, useState, useContext } from 'react'
import PropTypes from 'prop-types'
import GuestLayout from 'components/layout/containers/GuestLayout'
import Tabs from '@material-ui/core/Tabs'
import MuiTab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import styles from './style/AccountPage.style'
import AccountBanner from 'components/layout/components/AccountBanner'
import withWidth from '@material-ui/core/withWidth/withWidth'
import { makeStyles } from '@material-ui/core/styles'
import { withStyles } from '@material-ui/core'
import { connect, useSelector } from 'react-redux'
import useTranslation from 'lib/translations/hooks/useTranslation'
import Home from 'components/guest/public/Home'
import Info from 'components/guest/public/Info'
import Events from 'components/guest/public/Events'
import MyProfile from './MyProfile'
import History from './History'
import Router, { useRouter } from 'next/router'
import { ZERO } from 'model/globals'
import AccountKiosk from './AccountKiosk'
import { setToState } from 'state/actions'
import { ROLETYPES } from '../../../model/orest/constants'
import WebCmsGlobal from '../../webcms-global'

const useStyles = makeStyles(styles)

const Tab = withStyles((theme) => ({
    root: {
        textTransform: 'uppercase',
        [theme.breakpoints.down('xs')]: {
            fontSize: '0.8em',
        },
    }
}))(MuiTab)

const TabPanel = (props) => {
    const { children, value, hashCode, index, ...other } = props
    const classes = useStyles()

    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={value !== hashCode}
            id={`scrollable-auto-tabpanel-${index}`}
            aria-labelledby={`scrollable-auto-tab-${index}`}
            className={classes.tabPanel}
            {...other}
        >
            {value === hashCode && <React.Fragment>{children}</React.Fragment>}
        </Typography>
    )
}

TabPanel.propTypes = {
    children: PropTypes.node,
    hashCode: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
}

function a11yProps(index) {
    return {
        id: `scrollable-auto-tab-${index}`,
        'aria-controls': `scrollable-auto-tabpanel-${index}`,
    }
}

const Account = (props) => {
    const { width, setToState } = props
    const classes = useStyles()
    const router = useRouter()
    const isKiosk = router.query.kiosk === 'true'
    const { t } = useTranslation()
    const isLogin = useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth || false)
    const infoLogin = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo || false)
    const isClient = infoLogin && infoLogin?.roletype === ROLETYPES.GUEST || false
    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal)
    const hotelSettings = GENERAL_SETTINGS?.hotelSettings || false

    function getHistoryTabsSettings() {
        if (isClient) {
            //Todo: Ayar servisi düzeldikten sonra diğer kısım aktif edilecek
            return true
            return hotelSettings?.showreserv || hotelSettings?.showresevent || hotelSettings?.showbonus || hotelSettings?.showreviews
        } else {
            return hotelSettings?.agencyTabs?.showreserv || hotelSettings?.agencyTabs?.showresevent || hotelSettings?.agencyTabs?.showbonus || hotelSettings?.agencyTabs?.showreviews
        }
    }

    let guestMenu = [
        {
            componentId: 'HOME',
            name: 'str_home',
            hashCode: 'home',
            onlylogin: false,
            isShow: true
        },
        {
            componentId: 'INFO',
            name: 'str_hotelInfo',
            hashCode: 'info',
            onlylogin: false,
            isShow: true
        },
        {
            componentId: 'EVENTS',
            name: 'str_events',
            hashCode: 'events',
            onlylogin: false,
            isShow: true
        },
        {
            componentId: 'MY_PROFILE',
            name: 'str_myProfile',
            hashCode: 'profile',
            onlylogin: true,
            isShow: true
        },
        {
            componentId: 'HISTORY',
            name: 'str_history',
            hashCode: 'history',
            onlylogin: true,
            isShow: getHistoryTabsSettings()
        },
    ]

    guestMenu = !isLogin ? guestMenu.filter((item) => item.onlylogin === false) : guestMenu
    const tabPanelHashCode = router.query.menu
    const [guestTabPanelHashCode, setGuestTabPanelHashCode] = useState(
        guestMenu.findIndex((menu) => menu.hashCode === tabPanelHashCode) > -1
            ? router.query.menu
            : guestMenu && guestMenu[ZERO] && guestMenu[ZERO].hashCode
            ? guestMenu[ZERO].hashCode
            : false
    )

    useEffect(() => {
        setToState('guest', ['tabPanelHashCode'], guestTabPanelHashCode)
    }, [])

    useEffect(()=> {
        if(router.query.menu){
           const menuIndex = guestMenu.findIndex((menu) => menu.hashCode === tabPanelHashCode)
           if(menuIndex > -1){
               setGuestTabPanelHashCode(router.query.menu)
               setToState('guest', ['tabPanelHashCode'], router.query.menu)
           }
        }
    }, [router.query.menu])

    if (!guestTabPanelHashCode) {
        return (
            <GuestLayout>
                <Typography variant="h6" align="center" style={{ marginTop: 50 }} gutterBottom>
                    {t('str_youMustLoginFirst')}
                </Typography>
            </GuestLayout>
        )
    }

    const handleGuestPanelTabChange = (event, newValue) => {
        if (guestTabPanelHashCode !== newValue) {
            setGuestTabPanelHashCode(newValue)
            setToState('guest', ['tabPanelHashCode'], newValue)
            if (tabPanelHashCode) {
                Router.push({
                    pathname: router.pathname,
                    query: {
                        menu: newValue,
                    },
                })
            }

            setToState('guest', ['infoListOneGroup', 'id'], false)
            setToState('guest', ['infoListOneGroup', 'groupName'], false)
            setToState('guest', ['infoListOneGroup', 'data'], false)
            setToState('guest', ['infoListOneGroup', 'langcode'], false)
            setToState('guest', ['infoListOneGroup', 'chainid'], false)
        }
    }

    const renderMenuComponent = (menuItem) => {
        switch (menuItem.componentId) {
            case 'HOME':
                return <Home />
            case 'INFO':
                return <Info />
            case 'EVENTS':
                return <Events />
            case 'MY_PROFILE':
                return <MyProfile isGuest/>
            case 'HISTORY':
                return <History />
        }
    }

    if(isKiosk){
        return <AccountKiosk />
    }

    return (
        <GuestLayout>
            {isLogin && <AccountBanner />}
            <Tabs
                value={guestTabPanelHashCode}
                onChange={handleGuestPanelTabChange}
                variant={guestMenu.length > 3 && width === 'xs' ? 'scrollable' : 'fullWidth'}
                scrollButtons="on"
                classes={{
                    root: classes.tabsRoot,
                    indicator: classes.tabsIndicator,
                    flexContainer: classes.tabsFlexContainer,
                }}
                indicatorColor="primary"
                textColor="primary"
                aria-label="menu tabs"
            >
                {guestMenu.filter(menu => menu.isShow).map((menuItem, i) => {
                    return <Tab className={classes.tab} value={menuItem.hashCode} label={t(menuItem.name)} {...a11yProps(i)} key={i} />
                })}
            </Tabs>
            {guestMenu.filter(menu => menu.isShow).map((menuItem, i) => {
                return (
                    <TabPanel value={guestTabPanelHashCode} hashCode={menuItem.hashCode} index={i} key={i}>
                        {renderMenuComponent(menuItem)}
                    </TabPanel>
                )
            })}
        </GuestLayout>
    )
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(null, mapDispatchToProps)(withWidth()(Account))