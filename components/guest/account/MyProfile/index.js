import React, {useEffect, useState, useContext} from 'react'
import {connect, useSelector} from 'react-redux'
import {setToState, updateState} from 'state/actions'
import {Container, Paper} from '@material-ui/core'
import useTranslation from 'lib/translations/hooks/useTranslation'
import Details from '../Details'
import Preferences from '../Preferences'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Box from '@material-ui/core/Box'
import Surveys from './Surveys'
import LoyaltyClub from '../LoyaltyClub'
import Router, {useRouter} from 'next/router'
import {ZERO} from 'model/globals'
import MyRequest from '../MyRequest'
import History from '../History'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import LoyaltyIcon from '@material-ui/icons/Loyalty'

function TabPanel(props) {
    const {children, value, hashCode, index, ...other} = props

    return (
        <div
            role="tabpanel"
            hidden={value !== hashCode}
            id={`scrollable-auto-tabpanel-${index}`}
            aria-labelledby={`scrollable-auto-tab-${index}`}
            {...other}
        >
            {value === hashCode && <Paper square>{children}</Paper>}
        </div>
    )
}

function a11yProps(index) {
    return {
        id: `scrollable-auto-tab-${index}`,
        'aria-controls': `scrollable-auto-tabpanel-${index}`,
    }
}

import {makeStyles} from '@material-ui/core/styles'
import Notes from "../Notes";
import SaleCalls from "../SaleCalls";
import CallLog from "../CallLog";
import SearchGuest from "../SearchGuest";
import TrackedChangesDialog from "../../../TrackedChangesDialog";
import WebCmsGlobal from "../../../webcms-global";
import {ROLETYPES} from "../../../../model/orest/constants";
import Contacts from "../../../emp-portal/tabs/Contacts";
import Education from "../../../emp-portal/tabs/Education";
import Abilities from "../../../emp-portal/tabs/Abilities";
import Languages from "../../../emp-portal/tabs/Languages";
import WorkExperience from "../../../emp-portal/tabs/Work";
import References from "../../../emp-portal/tabs/References";
import Files from "../../../emp-portal/tabs/Files";

const dashboardOverview = (theme) => ({
    mainTitle: {
        paddingTop: "38px",
        fontSize: "28px",
        fontWeight: "normal",
        color: "#43425D",
    },
    iconStyle: {
        color: "#FFF",
        "&.MuiSvgIcon-root": {
            width: "1.75em",
            height: "2.188em"
        }
    },
    iconDiv: {
        top: -12,
        width: 65,
        height: 65,
        marginLeft: '-15px',
        padding: '7px 12px',
        position: 'absolute',
        borderRadius: 5,
        boxShadow: '0 1px 12px #d0d0d0'
    },
    cardStyle: {
        minHeight: "130px",
        boxShadow: 'inset 0 -7px 0 0px #009688, -1px 1px 10px 1px #69696940',
        [theme.breakpoints.down('xs')]: {
            width: "100%",
        },
    },
    cardLeft: {
        boxShadow: 'inset 0 -7px 0 0px #2196f3, -1px 1px 10px 1px #69696940',
    },
    cardLeftHc: {
        boxShadow: 'inset 0 -7px 0 0px #4caf50, -1px 1px 10px 1px #69696940',
    },
    cardUsed: {
        boxShadow: 'inset 0 -7px 0 0px #ff9800, -1px 1px 10px 1px #69696940',
    },
    cardGained: {
        boxShadow: 'inset 0 -7px 0 0px #009688, -1px 1px 10px 1px #69696940',
    },
    cardContent: {
        padding: "16px 32px",
    },
    cardTitle: {
        fontSize: "18px",
        fontWeight: "normal",
        textAlign: "right",
        [theme.breakpoints.down('xs')]: {
            textAlign: "right",
        },
    },
    loyaltyInfoCardWrapper: {
        [theme.breakpoints.down('xs')]: {
            marginTop: 20
        },
        marginBottom: 20
    },
    cardCountText: {
        fontSize: "30px",
        fontWeight: "bold",
        textAlign: "right",
    },
    dividerStyle: {
        width: "calc(100% - 30px)",
        color: "#CECECE",
        [theme.breakpoints.down('xs')]: {
            width: "100%",
        },
    },
    detailTitle: {
        fontSize: "14px",
        fontWeight: "500",
        textTransform: "uppercase",
        color: "#43425D",
        textDecoration: "underline"
    },
    detailDoneCountText: {
        fontSize: "18px",
        fontWeight: "bold",
        color: "#5B5A72"
    },
    detailProcessCountText: {
        fontSize: "18px",
        fontWeight: "bold",
        color: "#43425D"
    }
})

const useStyles = makeStyles(dashboardOverview);

const MyProfile = (props) => {
    const { state, setToState, isHistory, clientParams, isEmpPortal, isGuest } = props
    const router = useRouter()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { t } = useTranslation()
    const hotelSettings = GENERAL_SETTINGS.hotelSettings
    const classes = useStyles()
    const clientBase = useSelector((state) => isEmpPortal && state?.orest?.state?.emp || state?.orest?.state?.client || false)
    const panels = useSelector(state => state?.formReducer?.userPortal?.panels || false)
    const infoLogin = useSelector((state) => state?.orest?.currentUser?.loginfo || false)
    const [openTrackedDialog, setOpenTrackedDialog] = useState(false)
    const [routerHashCode, setRouterHashCode] = useState('')

    function getTabsSettings(hotelSettings) {
        //Todo: Servis düzeldikten sonra commentli olanlar devreye alınaacak.
        hotelSettings.showdetails = true
        if(isEmpPortal && infoLogin && infoLogin?.roletype === ROLETYPES.EMPLOYEE){
            hotelSettings.showdashboard = false
            hotelSettings.showrequests = false
            hotelSettings.showremarks = false
            hotelSettings.showgifts = false
            hotelSettings.showsurvey = false
            hotelSettings.showreserv = false
            hotelSettings.showresevent = false
            hotelSettings.showreviews = false
            hotelSettings.showbonus = false
            hotelSettings.shownotes = false
            hotelSettings.showsc = false
            hotelSettings.showcomm = false
            hotelSettings.showwork = true
            hotelSettings.showcontacts = true
            hotelSettings.showeducation = true
            hotelSettings.showreferences = true
            hotelSettings.showabilities = true
            hotelSettings.showlanguages = true
            hotelSettings.showfiles = true
        }else if(infoLogin && infoLogin?.roletype === ROLETYPES.GUEST){
            hotelSettings.showdashboard = false
            hotelSettings.showrequests = true // hotelSettings?.showrequests
            hotelSettings.showremarks = true // hotelSettings?.showremarks
            hotelSettings.showgifts = true // hotelSettings?.showgifts
            hotelSettings.showsurvey = true // hotelSettings?.showsurvey
            hotelSettings.showreserv = false  // hotelSettings?.showreserv
            hotelSettings.showresevent = true // hotelSettings?.showresevent
            hotelSettings.showreviews = false  // hotelSettings?.showreviews
            hotelSettings.showbonus = true // hotelSettings?.showbonus
            hotelSettings.shownotes = false
            hotelSettings.showsc = false // hotelSettings?.showsc
            hotelSettings.showcomm = false // hotelSettings?.showcomm
            hotelSettings.showwork = false
            hotelSettings.showcontacts = false  // hotelSettings?.showcontacts
            hotelSettings.showeducation = false
            hotelSettings.showreferences = false
            hotelSettings.showabilities = false
            hotelSettings.showlanguages = false
            hotelSettings.showfiles = false
        }else {
            hotelSettings.showdashboard = true
            hotelSettings.showrequests = hotelSettings?.agencyTabs?.showrequests
            hotelSettings.showremarks = hotelSettings?.agencyTabs?.showremarks
            hotelSettings.showgifts = hotelSettings?.agencyTabs?.showgifts
            hotelSettings.showsurvey = hotelSettings?.agencyTabs?.showsurvey
            hotelSettings.showreserv = hotelSettings?.agencyTabs?.showreserv
            hotelSettings.showresevent = hotelSettings?.agencyTabs?.showresevent
            hotelSettings.showreviews = hotelSettings?.agencyTabs?.showreviews
            hotelSettings.showbonus = hotelSettings?.agencyTabs?.showbonus
            hotelSettings.shownotes = true
            hotelSettings.showsc = hotelSettings?.agencyTabs?.showsc
            hotelSettings.showcomm = hotelSettings?.agencyTabs?.showcomm
            hotelSettings.showwork = false
            hotelSettings.showcontacts = hotelSettings?.agencyTabs?.showcontacts
            hotelSettings.showeducation = false
            hotelSettings.showreferences = false
            hotelSettings.showabilities = false
            hotelSettings.showlanguages = false
            hotelSettings.showfiles = false
        }

        return hotelSettings
    }

    function myProfileTabHashShow(settName) {
        if(Array.isArray(settName)){
            for(let name of settName){
                if(getTabsSettings(hotelSettings)[name]){
                    return true
                }
            }
            return false
        }else{
            return getTabsSettings(hotelSettings)[settName]
        }
    }

    function getTabsOrderNo(ordName) {
        let orderList
        if (isEmpPortal && infoLogin.roletype === ROLETYPES.EMPLOYEE) {
            orderList = {
                dashboard: 0,
                details: 1,
                request: 2,
                prefs: 3,
                loyalty: 4,
                surveys: 5,
                contacts: 6,
                education: 7,
                work: 8,
                references: 9,
                abilities: 10,
                languages: 11,
                files: 12,
                history: 13,
                notes: 14,
                calls: 15,
                calllogs: 16,
            }
        } else if (infoLogin.roletype === ROLETYPES.GUEST) {
            orderList = {
                dashboard: 0,
                details: 1,
                request: 2,
                prefs: 3,
                loyalty: 4,
                surveys: 5,
                contacts: 6,
                education: 7,
                work: 8,
                references: 9,
                abilities: 10,
                languages: 11,
                files: 12,
                history: 13,
                notes: 14,
                calls: 15,
                calllogs: 16,
            }
        } else {
            orderList = {
                dashboard: 0,
                details: 1,
                history: 2,
                request: 3,
                prefs: 4,
                loyalty: 5,
                surveys: 6,
                contacts: 7,
                education: 8,
                work: 9,
                references: 10,
                abilities: 11,
                languages: 12,
                files: 13,
                notes: 14,
                calls: 15,
                calllogs: 16,
            }
        }

        return orderList[ordName]
    }

    const myProfileTabMenu = [
        {
            code: 'DASHBOARD',
            title: 'str_dashboard',
            hashCode: 'dashboard',
            isShow: myProfileTabHashShow('showdashboard'),
            orderNo: getTabsOrderNo('dashboard')
        },
        {
            code: 'DETAILS',
            title: isEmpPortal ? 'str_details' : 'str_myDetails',
            hashCode: 'details',
            isShow: myProfileTabHashShow('showdetails'),
            orderNo: getTabsOrderNo('details')
        },
        {
            code: 'MY_REQUEST',
            title: 'str_requests',
            hashCode: 'request',
            isShow: myProfileTabHashShow('showrequests'),
            orderNo: getTabsOrderNo('request')
        },
        {
            code: 'PREFERENCES',
            title: 'str_preferences',
            hashCode: 'prefs',
            isShow: myProfileTabHashShow('showremarks'),
            orderNo: getTabsOrderNo('prefs')
        },
        {
            code: 'LOYALTY_CLUB',
            title: 'str_loyaltyClub',
            hashCode: 'loyalty',
            isShow: myProfileTabHashShow('showgifts'),
            orderNo: getTabsOrderNo('loyalty')
        },
        {
            code: 'SURVEYS',
            title: 'str_surveys',
            hashCode: 'surveys',
            isShow: myProfileTabHashShow('showsurvey'),
            orderNo: getTabsOrderNo('surveys')
        },
        {
            code: 'CONTACTS',
            title: 'str_contacts',
            hashCode: 'contacts',
            isShow: myProfileTabHashShow('showcontacts'),
            orderNo: getTabsOrderNo('contacts')
        },
        {
            code: 'EDUCATION',
            title: 'str_education',
            hashCode: 'education',
            isShow: myProfileTabHashShow('showeducation'),
            orderNo: getTabsOrderNo('education')
        },
        {
            code: 'WORK',
            title: 'str_work',
            hashCode: 'work',
            isShow: myProfileTabHashShow('showwork'),
            orderNo: getTabsOrderNo('work')
        },
        {
            code: 'REFERENCES',
            title: 'str_references',
            hashCode: 'references',
            isShow: myProfileTabHashShow('showreferences'),
            orderNo: getTabsOrderNo('references')
        },
        {
            code: 'ABILITIES',
            title: 'str_abilities',
            hashCode: 'abilities',
            isShow: myProfileTabHashShow('showabilities'),
            orderNo: getTabsOrderNo('abilities')
        },
        {
            code: 'LANGUAGES',
            title: 'str_languages',
            hashCode: 'languages',
            isShow: myProfileTabHashShow('showlanguages'),
            orderNo: getTabsOrderNo('languages')
        },
        {
            code: 'FILES',
            title: 'str_files',
            hashCode: 'files',
            isShow: myProfileTabHashShow('showfiles'),
            orderNo: getTabsOrderNo('files')
        },
        {
            code: 'HISTORY',
            title: 'str_history',
            hashCode: 'history',
            isShow: isHistory && myProfileTabHashShow(['showreserv', 'showresevent', 'showreviews', 'showbonus']),
            orderNo: getTabsOrderNo('history')
        },
        {
            code: 'NOTES',
            title: 'str_notes',
            hashCode: 'notes',
            isShow: myProfileTabHashShow('shownotes'),
            orderNo: getTabsOrderNo('notes')
        },
        {
            code: 'SALE_CALLS',
            title: 'str_saleCalls',
            hashCode: 'calls',
            isShow: myProfileTabHashShow('showsc'),
            orderNo: getTabsOrderNo('calls')
        },
        {
            code: 'CALL_LOG',
            title: 'str_callLog',
            hashCode: 'call-logs',
            isShow: myProfileTabHashShow('showcomm'),
            orderNo: getTabsOrderNo('calllogs')
        }
    ]

    let tabPanelHashCode = router.query.tab
    if (!router.query.tab && clientBase) {
        tabPanelHashCode = 'details'
    }
    if (clientParams && Object.keys(clientParams).length > 0 && !router.query.tab && !clientBase) {
        let isAnyTrue = false;
        Object.keys(clientParams).map((item, i) => {
            if (clientParams[item]) {
                isAnyTrue = true
            }
        })
        if (isAnyTrue) {
            tabPanelHashCode = 'details'
        } else {
            tabPanelHashCode = 'dashboard'
        }
    }
    const [myProfileTabsHashCode, setMyProfileTabsHashCode] = useState(
        myProfileTabMenu.findIndex((menu) => menu.hashCode === tabPanelHashCode && menu.isShow) > -1
            ? tabPanelHashCode
            : myProfileTabMenu.filter(menu => menu.isShow).sort((a, b) => a.orderNo - b.orderNo)[ZERO].hashCode
    )

    useEffect(() => {
        setMyProfileTabsHashCode(
            myProfileTabMenu.findIndex((menu) => menu.hashCode === tabPanelHashCode && menu.isShow) > -1
                ? tabPanelHashCode
                : myProfileTabMenu.filter(menu => menu.isShow).sort((a, b) => a.orderNo - b.orderNo)[ZERO].hashCode
        )
    }, [router.query])

    const handleGuestProfilePanelTabChange = (event, newValue) => {
        if (myProfileTabsHashCode !== newValue) {
            setTimeout(() => {
                setToState('userPortal', ['panelStatus'], panels.requestList)
            }, 100)
            setRouterHashCode(newValue)
            if (tabPanelHashCode) {
                const routerQuery = router.query;
                if (routerQuery.tab === 'prefs') {
                    if (JSON.stringify(state.profile.checkboxGroupAllBase) !== JSON.stringify(state.profile.checkboxGroupAll) || JSON.stringify(state.profile.radioGroupAllGid) !== JSON.stringify(state.profile.radioGroupAllGidBase)) {
                        setOpenTrackedDialog(true)
                    } else {
                        setToState('guest', ['profile', 'checkboxGroupAllBase'], {})
                        setToState('guest', ['profile', 'checkboxGroupAll'], {})
                        setToState('guest', ['profile', 'radioGroupAllGid'], {})
                        setToState('guest', ['profile', 'radioGroupAllGidBase'], {})
                        setMyProfileTabsHashCode(newValue)
                        routerQuery.menu = router.query.menu
                        routerQuery.tab = newValue
                        Router.push({
                                pathname: router.pathname,
                                query: routerQuery
                            },
                            undefined,
                            {scroll: false}
                        )
                    }
                } else {
                    routerQuery.menu = router.query.menu || 'profile'
                    routerQuery.tab = newValue
                    Router.push({
                            pathname: router.pathname,
                            query: routerQuery
                        },
                        undefined,
                        {scroll: false}
                    )
                    setMyProfileTabsHashCode(newValue)
                }
            }
        }
    }

    const renderEventComponent = (profileItem) => {
        switch (profileItem.code) {
            case 'DASHBOARD':
                return <SearchGuest clientParams={clientParams}/>
            case 'DETAILS':
                return <Details clientParams={clientParams} isEmpPortal={isEmpPortal} isGuest={isGuest}/>
            case 'CONTACTS':
                return <Contacts mid={clientBase?.mid} empId={clientBase?.id}/>
            case 'EDUCATION':
                return <Education empId={clientBase?.id}/>
            case 'WORK':
                return <WorkExperience empId={clientBase?.id}/>
            case 'REFERENCES':
                return <References empId={clientBase?.id}/>
            case 'ABILITIES':
                return <Abilities empId={clientBase?.id}/>
            case 'LANGUAGES':
                return <Languages empId={clientBase?.id}/>
            case 'FILES':
                return <Files mid={clientBase?.mid} empId={clientBase?.id}/>
            case 'MY_REQUEST':
                return <MyRequest/>
            case 'PREFERENCES':
                return <Preferences/>
            case 'LOYALTY_CLUB':
                return <LoyaltyClub/>
            case 'SURVEYS':
                return <Surveys isWidget={true} limit={3} loadMore={true}/>
            case 'HISTORY':
                return <History/>
            case 'NOTES':
                return <Notes/>
            case 'SALE_CALLS':
                return <SaleCalls/>
            case 'CALL_LOG':
                return <CallLog/>
        }
    }

    const bonusInfoList = [
        {
            icon: (
                <LoyaltyIcon className={classes.iconStyle}/>
            ),
            color: "#009688",
            cardName: t("str_bonusGained"),
            className: classes.cardGained,
            totalBonus: new Intl.NumberFormat('en-IN', {maximumSignificantDigits: 3}).format((state.bonusTransPoints && state.bonusTransPoints.bonusgained) || '0')
        },
        {
            icon: (
                <LoyaltyIcon className={classes.iconStyle}/>
            ),
            color: "#2196f3",
            cardName: t("str_bonusLeft"),
            className: classes.cardLeft,
            totalBonus: new Intl.NumberFormat('en-IN', {maximumSignificantDigits: 3}).format((state.bonusTransPoints && state.bonusTransPoints.bonusleft) || '0')
        },
        {
            icon: (
                <LoyaltyIcon className={classes.iconStyle}/>
            ),
            color: "#4caf50",
            cardName: t("str_bonusUsed"),
            className: classes.cardLeftHc,
            totalBonus: new Intl.NumberFormat('en-IN', {maximumSignificantDigits: 3}).format((state.bonusTransPoints && state.bonusTransPoints.bonusused) || '0')
        },
        {
            icon: (
                <LoyaltyIcon className={classes.iconStyle}/>
            ),
            color: "#ff9800",
            cardName: t("str_bonusExpired"),
            className: classes.cardUsed,
            totalBonus: new Intl.NumberFormat('en-IN', {maximumSignificantDigits: 3}).format((state.bonusTransPoints && state.bonusTransPoints.bonusexpired) || '0')
        }
    ]

    return (
        <React.Fragment>
            <Container maxWidth="lg">
                <Grid container spacing={4} className={classes.loyaltyInfoCardWrapper}>
                    {(clientBase || (!clientBase && hotelSettings?.agencyTabs?.showbonus)) && state.bonusTransPoints ?
                        bonusInfoList.map((data, i) => {
                            return (
                                <Grid item key={i} xs={12} sm={6} md={6} lg={3}>
                                    <div style={{position: "relative"}}>
                                        <Card className={classes.cardStyle + ' ' + data.className}>
                                            <CardContent className={classes.cardContent}>
                                                <div className={classes.iconDiv} style={{backgroundColor: data.color}}>
                                                    {data.icon}
                                                </div>
                                                <Typography color="textSecondary" className={classes.cardTitle}>{data.cardName}</Typography>
                                                <div>
                                                    <Grid container>
                                                        <Grid item xs={12}>
                                                            <Typography className={classes.cardCountText} style={{color: data.color}}>
                                                                {data.totalBonus} <small>pts</small>
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </Grid>
                            )
                        }) : null
                    }
                </Grid>
                <AppBar position="static" color="default">
                    <Tabs
                        value={myProfileTabsHashCode}
                        onChange={handleGuestProfilePanelTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        {myProfileTabMenu.filter(tabMenuItem => tabMenuItem.isShow).sort((a, b) => a.orderNo - b.orderNo).map((item, i) => (
                            <Tab label={t(item.title)} value={item.hashCode} {...a11yProps(i)} key={i}/>
                        ))}
                    </Tabs>
                </AppBar>
                {myProfileTabMenu.filter(tabMenuItem => tabMenuItem.isShow).sort((a, b) => a.orderNo - b.orderNo).map((item, i) => (
                    <TabPanel value={myProfileTabsHashCode} hashCode={item.hashCode} index={i} key={i}>
                        <Box style={{backgroundColor: '#FAFAFA'}} p={3}>{renderEventComponent(item)}</Box>
                    </TabPanel>
                ))}
            </Container>
            <TrackedChangesDialog
                open={openTrackedDialog}
                onPressNo={(e) => setOpenTrackedDialog(e)}
                onPressYes={(e) => {
                    setOpenTrackedDialog(e);
                    setMyProfileTabsHashCode(routerHashCode)
                    const routerQuery = router.query;
                    routerQuery.menu = router.query.menu
                    routerQuery.tab = routerHashCode
                    Router.push({
                        pathname: router.pathname,
                        query: routerQuery
                    })
                    setToState('guest', ['profile', 'checkboxGroupAllBase'], {})
                    setToState('guest', ['profile', 'checkboxGroupAll'], {})
                    setToState('guest', ['profile', 'radioGroupAllGid'], {})
                    setToState('guest', ['profile', 'radioGroupAllGidBase'], {})
                }}
            />
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

export default connect(mapStateToProps, mapDispatchToProps)(MyProfile)
