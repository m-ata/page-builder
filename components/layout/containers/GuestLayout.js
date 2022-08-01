import React, { useState, useContext, useEffect, memo } from 'react'
import Header from '../Header'
import Footer from '../Footer'
import Notifications from 'model/notification/components/Notifications'
import { makeStyles } from '@material-ui/core/styles'
import styles from '../style/RootLayout.style'
import BaseLoader from 'components/common/base-loader'
import QuickSurvey from '../../guest/account/QuickSurvey'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import OrderDialog from '../../guest/public/components/OrderDialog/OrderDialog'
import { Card, CardContent, CardHeader, Grid, IconButton, Button } from '@material-ui/core'
import ClearIcon from '@material-ui/icons/Clear';
import useTranslation from 'lib/translations/hooks/useTranslation'
import { getOperationSystemName, LOCAL_STORAGE_REDIRECT_TO_MOBILE_APP } from 'model/orest/constants'
import WebCmsGlobal from 'components/webcms-global'

const useStyles = makeStyles(styles)

function GuestLayout(props) {

    const { isKiosk, isHideLoginButton, isShowFullName, isGuestProfile } = props
        , classes = useStyles()
        , isLogin = useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth || false)
        , tabPanelHashCode = useSelector((state) => state?.formReducer?.guest?.tabPanelHashCode || false)
        , router = useRouter()
        , { t } = useTranslation()
        , [showRedirectToMobileApp, setShowRedirectToMobileApp] = useState(false)
        , [browserOperationSystem, setBrowserOperationSystem] = useState(false)
        , { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    useEffect(() => {
        const getOperationSystem = getOperationSystemName()
            , hideSnackbarLocalStorage = localStorage.getItem(LOCAL_STORAGE_REDIRECT_TO_MOBILE_APP)
        setBrowserOperationSystem(getOperationSystem?.os || false)
        setShowRedirectToMobileApp(hideSnackbarLocalStorage !== 'false')
    }, [])

    const handleCloseSnackBar = () => {
        setShowRedirectToMobileApp(false)
        localStorage.setItem(LOCAL_STORAGE_REDIRECT_TO_MOBILE_APP, 'false')
    }

    const handleOpenStore = (storeUrl) => {
        handleCloseSnackBar()
        const win = window.open(storeUrl, '_blank')
        if (win != null) {
            win.focus()
        }
    }

    return (
        <BaseLoader>            
            {showRedirectToMobileApp ? (
                (browserOperationSystem === 'Android' || browserOperationSystem === 'iOS') ? (
                    (GENERAL_SETTINGS.ASTOREURL || GENERAL_SETTINGS.ISTOREURL) ? (
                        <div style={{ position: 'fixed', zIndex: 1400, width: '100%' }}>
                            <Card className={classes.appCardRoot}>
                                <CardContent className={classes.appCardContent}>
                                    <Grid container spacing={1} alignItems={'center'}>
                                        <Grid item xs={1}>
                                            <IconButton size={'small'} onClick={() => handleCloseSnackBar()} style={{ padding: 0 }}>
                                                <ClearIcon />
                                            </IconButton>
                                        </Grid>
                                        <Grid item xs={11}>
                                            <CardHeader
                                                className={classes.cardHeaderRoot}
                                                avatar={
                                                    <img style={{ width: '48px' }} src='imgs/guest/vima-gapp-icon.png'  alt='GuestApp'/>
                                                }
                                                action={
                                                    <Button
                                                        onClick={() => handleOpenStore((browserOperationSystem === 'Android' && GENERAL_SETTINGS?.ASTOREURL || browserOperationSystem === 'iOS' && GENERAL_SETTINGS.ISTOREURL))}
                                                        size={'small'}
                                                        color='primary'
                                                        variant='contained'
                                                        style={{ fontSize: '12px' }}
                                                    >
                                                        {t('str_openApp')}
                                                    </Button>
                                                }
                                                title={t('str_guestApp')}
                                                subheader={t('str_openInGuestApp')}
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </div>
                    ): null
                ): null
            ): null}
            <Header langSelect={true} loginButton={!isHideLoginButton} redirectToLoginPage={true} isShowFullName={isShowFullName} isGuestProfile={isGuestProfile}/>
            <main className={classes.main}>{props.children}</main>
            {(isLogin && tabPanelHashCode === 'home') ? (
                <div style={{marginLeft: 'auto'}}>
                    <QuickSurvey />
                </div>
            ): null}
            {!isKiosk ? <Footer /> : null}
            <Notifications />
            {(router?.query?.menuid && router?.query?.makeorder) ? (
                <OrderDialog />
            ): null}
        </BaseLoader>
    )
}

const memorizedGuestLayout = memo(GuestLayout)

export default memorizedGuestLayout