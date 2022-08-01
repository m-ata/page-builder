import React, { useContext, useEffect, useState } from 'react'
import { connect, useSelector } from 'react-redux'
import { setToState, updateState } from 'state/actions'
import { Container, Paper, AppBar, Tabs } from '@material-ui/core'
import MuiTab from '@material-ui/core/Tab'
import useTranslation from 'lib/translations/hooks/useTranslation'
import WeeklyEvents from './components/events/WeeklyEvents'
import NearbyEvents from './components/events/NearbyEvents'
import HotelEvents from './components/events/HotelEvents'
import Router, { useRouter } from 'next/router'
import { ZERO } from 'model/globals'
import SelectHotel from './SelectHotel'
import Box from '@material-ui/core/Box'
import WebCmsGlobal from '../../webcms-global'
import { withStyles } from '@material-ui/core/styles'

import LoadingSpinner from '../../LoadingSpinner'
import ActivityRes from './components/events/activity-res'
const Tab = withStyles((theme) => ({
    root: {
        textTransform: 'uppercase',
        [theme.breakpoints.down('xs')]: {
            fontSize: '0.65em',
        },
    }
}))(MuiTab)

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

const Events = (props) => {
    const { state, onlyRes } = props
    const router = useRouter()
    const { t } = useTranslation()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const changeHotelRefno = useSelector((state) => state.formReducer.guest.changeHotelRefno && state.formReducer.guest.changeHotelRefno)

    const eventsTabMenu = [
        {
            code: 'WEEKLY_EVENTS',
            title: 'str_weeklyEvents',
            hashCode: 'weekly',
        },
        {
            code: 'NEARBY_EVENTS',
            title: 'str_nearbyEvents',
            hashCode: 'nearby',
        },
        {
            code: 'HOTEL_EVENTS',
            title: 'str_hotelEvents',
            hashCode: 'hotel',
        },
    ]

    const tabPanelHashCode = router.query.tab
    const [eventTabsHashCode, setEventTabsHashCode] = useState(
        eventsTabMenu.findIndex((menu) => menu.hashCode === tabPanelHashCode) > -1
            ? tabPanelHashCode
            : eventsTabMenu[ZERO].hashCode
    )

    const handleGuestEventsPanelTabChange = (event, newValue) => {
        if (eventTabsHashCode !== newValue) {
            setEventTabsHashCode(newValue)
            if (tabPanelHashCode) {
                Router.push({
                    pathname: router.pathname,
                    query: {
                        menu: router.query.menu,
                        tab: newValue,
                    },
                })
            }
        }
    }

    const renderEventComponent = (eventItem) => {
        let component
        switch (eventItem.code) {
            case 'WEEKLY_EVENTS':
                component = <WeeklyEvents onlyRes={onlyRes}/>
                break
            case 'NEARBY_EVENTS':
                component = <NearbyEvents onlyRes={onlyRes}/>
                break
            case 'HOTEL_EVENTS':
                component = <HotelEvents onlyRes={onlyRes}/>
                break
        }

        return component
    }

    if (GENERAL_SETTINGS.ISCHAIN && changeHotelRefno === false) {
        if(state.clientReservIsLoading){
            return (
                <Box p={4}>
                    <LoadingSpinner size={40} />
                </Box>
            )
        }

        return (
            <Box p={4}>
                <SelectHotel/>
            </Box>
        )
    }

    return (
        <React.Fragment>
            <Container maxWidth="lg" style={{ padding: 0 }}>
                <AppBar position="static" color="default">
                    <Tabs
                        value={eventTabsHashCode}
                        onChange={handleGuestEventsPanelTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        {eventsTabMenu.map((item, i) => (
                            <Tab label={t(item.title)} value={item.hashCode} {...a11yProps(i)} key={i} />
                        ))}
                    </Tabs>
                </AppBar>
                {eventsTabMenu.map((item, i) => (
                    <TabPanel value={eventTabsHashCode} hashCode={item.hashCode} index={i} key={i}>
                        {renderEventComponent(item)}
                    </TabPanel>
                ))}
            </Container>
            <ActivityRes />
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})


export default connect(mapStateToProps, mapDispatchToProps)(Events)
