import React, {useContext, useState} from 'react'
import {useSelector, connect } from 'react-redux'
import { setToState, updateState } from 'state/actions'
import { Container, Paper } from '@material-ui/core'
import useTranslation from 'lib/translations/hooks/useTranslation'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Box from '@material-ui/core/Box'
import RoomReservations from '../Reservations/RoomReservations'
import EventReservations from '../Reservations/EventReservations'
import BonusHistory from '../Transactions/BonusHistory'
import Router, { useRouter } from 'next/router'
import { ZERO } from 'model/globals'
import GuestComments from "../GuestComments/GuestComments";
import {ROLETYPES} from "../../../../model/orest/constants";
import WebCmsGlobal from "../../../webcms-global";

const TabPanel = (props) => {
    const { children, value, hashCode, index, ...other } = props

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

const a11yProps = (index) => {
    return {
        id: `scrollable-auto-tab-${index}`,
        'aria-controls': `scrollable-auto-tabpanel-${index}`,
    }
}

const History = (props) => {
    const { state, setToState } = props
    const router = useRouter()
    const { t } = useTranslation()
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
    const isClient = loginfo.roletype === ROLETYPES.GUEST
    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal)
    const hotelSettings = GENERAL_SETTINGS.hotelSettings

    function getTabsSettings(settName) {
        if(isClient){
            //Todo: Ayar servisi düzeldikten sonra diğer kısım aktif edilecek
            return true

            return hotelSettings[settName]
        }else {
            return hotelSettings.agencyTabs[settName]
        }
    }

    const historyTabMenu = [
        {
            code: 'RESERVATION',
            title: 'str_reservation',
            hashCode: 'reservation',
            isShow: getTabsSettings('showreserv')
        },
        {
            code: 'EVENTS',
            title: 'str_events',
            hashCode: 'events',
            isShow: getTabsSettings('showresevent')
        },
        {
            code: 'BONUS',
            title: 'str_bonus',
            hashCode: 'bonus',
            isShow: getTabsSettings('showbonus')
        },
        {
            code: 'COMMENTS',
            title: 'str_comments',
            hashCode: 'comments',
            isShow: getTabsSettings('showreviews')
        }
    ]

    const tabPanelHashCode = router.query.tab
    const [historyTabsHashCode, setHistoryTabsHashCode] = useState(
        historyTabMenu.findIndex((menu) => menu.hashCode === tabPanelHashCode && menu.isShow) > -1
            ? tabPanelHashCode
            : historyTabMenu.filter(menu => menu.isShow)[ZERO].hashCode
    )

    const handleGuestHistoryPanelTabChange = (event, newValue) => {
        if (historyTabsHashCode !== newValue) {
            setHistoryTabsHashCode(newValue)
            if (tabPanelHashCode) {
               /* Router.push({
                    pathname: router.pathname,
                    query: {
                        menu: router.query.menu,
                        tab: newValue,
                    },
                })*/
            }
        }
    }

    const renderEventComponent = (historyItem) => {
        let component
        switch (historyItem.code) {
            case 'RESERVATION':
                component = <RoomReservations />
                break
            case 'EVENTS':
                component = <EventReservations />
                break
            case 'BONUS':
                component = <BonusHistory />
                break
            case 'COMMENTS':
                component = <GuestComments />
                break
        }

        return component
    }

    return (
        <React.Fragment>
            <Container maxWidth="lg">
                <AppBar position="static" color="default">
                    <Tabs
                        value={historyTabsHashCode}
                        onChange={handleGuestHistoryPanelTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        {historyTabMenu.filter(tab => tab.isShow).map((item, i) => (
                            <Tab label={t(item.title)} value={item.hashCode} {...a11yProps(i)} key={i} />
                        ))}
                    </Tabs>
                </AppBar>
                {historyTabMenu.filter(tab => tab.isShow).map((item, i) => (
                    <TabPanel value={historyTabsHashCode} hashCode={item.hashCode} index={i} key={i}>
                        <Box p={3}>{renderEventComponent(item)}</Box>
                    </TabPanel>
                ))}
            </Container>
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

export default connect(mapStateToProps, mapDispatchToProps)(History)
