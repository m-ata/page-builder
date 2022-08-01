import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import GuestLayout from 'components/layout/containers/GuestLayout'
import AccountBanner from 'components/layout/components/AccountBanner'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { BottomNavigation, BottomNavigationAction, Icon } from '@material-ui/core'
import Home from './components/Home'
import Map from './components/Map'
import Faqs from './components/Faqs'
import Events from 'components/guest/public/Events'
import { IdleTimeoutManager } from "idle-timer-manager"
import { useOrestAction } from 'model/orest'
import { useSelector } from 'react-redux'
import { useSnackbar } from 'notistack'
import { useRouter } from "next/router"
import { connect } from 'react-redux'
import LanguageSelectionDialog from './components/LanguageSelectionDialog'

const useStyles = makeStyles({
    root: {
        position: 'fixed',
        width: '100%',
        bottom: 0,
        boxShadow: '0 -1px 8px 3px #5858584f',
        height: 85
    },
    buttonRoot: {

    },
    buttonLabel: {
        fontSize: '1rem!important'
    }
});

const AccountKiosk = (props) =>{
    const { state } = props
    const classes = useStyles();
    const [value, setValue] = useState(0)
    const { t } = useTranslation()
    const { enqueueSnackbar } = useSnackbar()
    const { deleteOrestCurrentUserInfo } = useOrestAction()
    const router = useRouter()
    const loginto = router.query.loginto ? Number(router.query.loginto) : false
    const isLogin = useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth) ? true : false
    //const useKioskStyle = ``

    useEffect(() => {
      /*
      const useStyle = document.createElement('style')
      document.head.appendChild(useStyle)
      useStyle.sheet.insertRule(useKioskStyle)
      */

        const screenActionControl = new IdleTimeoutManager({
            timeout: loginto || state.loginTo,
            events: ['mousemove', 'mousedown', 'scroll', 'keydown', 'click'],
            onExpired: () => {
                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'info' })
                deleteOrestCurrentUserInfo()
                window.location.href = `/guest?kiosk=true${loginto ? `&loginto=${loginto}` : ''}`
            },
        })

        return () => {
            screenActionControl.clear()
        }
    }, [])

    let guestMenu = [
        {
            componentId: 'SERVICES',
            name: 'str_services',
            hashCode: 'services',
            iconName: 'room_service',
            onlylogin: false,
        },
        {
            componentId: 'MAP',
            name: 'str_map',
            hashCode: 'info',
            iconName: 'map',
            onlylogin: false,
        },
        {
            componentId: 'FAQ',
            name: 'str_faq',
            hashCode: 'faq',
            iconName: 'help',
            onlylogin: false,
        },
        {
            componentId: 'EVENTS',
            name: 'str_events',
            hashCode: 'events',
            iconName: 'event_available',
            onlylogin: true,
        }
    ]

    const renderMenuComponent = (menuItem) => {
        let component
        switch (menuItem.componentId) {
            case 'SERVICES':
                component = <Home />
                break
            case 'MAP':
                component = <Map />
                break
            case 'FAQ':
                component = <Faqs />
                break
            case 'EVENTS':
                component = <Events />
                break
        }

        return component
    }

    return (
        <GuestLayout isKiosk={true}>
            <LanguageSelectionDialog open={!state.useKioskLanguage}/>
            {isLogin && <AccountBanner isKiosk={true}/>}
            <div style={{ paddingTop: 40, paddingBottom: 100 }}>
                {renderMenuComponent(guestMenu[value])}
            </div>
            <BottomNavigation
                value={value}
                onChange={(event, newValue) => setValue(newValue)}
                showLabels
                className={classes.root}
            >{guestMenu.map((item, i) => {
                return (
                    <BottomNavigationAction
                        key={i}
                        classes={{
                            root: classes.buttonRoot,
                            selected: classes.buttonSelected,
                            label: classes.buttonLabel
                        }}
                        label={t(item.name)}
                        icon={<Icon fontSize='large'>{item.iconName}</Icon>}
                    />
                )
            })}
            </BottomNavigation>
        </GuestLayout>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

export default connect(mapStateToProps, null)(AccountKiosk)
