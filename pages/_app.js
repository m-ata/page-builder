//react
import React, { useEffect, useState } from 'react'
//next
import Head from 'next/head'
import Router, { useRouter } from 'next/router'
import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()
//redux
import withRedux from 'next-redux-wrapper'
import { Provider } from 'react-redux'
import store from 'state/store'
//material-ui
import rtl from 'jss-rtl'
import { create } from 'jss'
import { createMuiTheme, MuiThemeProvider, makeStyles, StylesProvider, jssPreset } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import WebCmsGlobal from 'components/webcms-global'
//webcms
import axios from 'axios'
import { LOCAL_STORAGE_OREST_TOKEN_TEXT } from 'model/orest/constants'
import { SnackbarProvider } from 'notistack'
import CookiePolicy from 'components/common/cookie-policy'
import { LocaleProvider } from 'lib/translations/context/LocaleContext'
import { pathRedirection } from 'lib/helpers/usePathRedirection'
import { getDeviceType, getBrowser } from  'lib/helpers/useFunction'
import WebCmsProgress from 'nprogress'
WebCmsProgress.configure({ showSpinner: publicRuntimeConfig.NProgressShowSpinner })
import TagManager from '@webcms-globals/tag-manager'
//import all css
import 'slick-carousel/slick/slick.css'
import 'assets/css/slick-theme.css'
import '@webcms-ui/core/phone-input/styles.css'
import 'react-toastify/dist/ReactToastify.min.css'
import 'froala-editor/css/froala_style.min.css'
import 'froala-editor/css/froala_editor.pkgd.min.css'
import 'froala-editor/css/plugins/char_counter.min.css'
import 'components/payment/credit-card/card.css'
import 'public/static/styles/panel/style.css'
import 'public/static/css/bootstrap.min.css'
import 'assets/css/myRequest.css'
import 'assets/css/TrainingRequest.css'
import 'assets/css/dashboardCarousel.css'
import 'assets/css/portalHomeSlider.css'
import 'public/static/styles/overwrite.css'
import 'nprogress/nprogress.css'
import { isLocale, isLocaleViaList } from 'lib/translations/types'
import { defaultLocale } from 'lib/translations/config'
//import moment
import moment from 'moment'
import 'moment/locale/de'
import 'moment/locale/tr'
import 'moment/locale/ru'
import 'moment/locale/es'
import 'moment/locale/mk'
import 'moment/locale/sq'

const getHotelAppLang = require('@api/core/get-hotel-app-lang')

const noCookieAndChatPaths = ['/editor', '/embed', '/page-builder', '/guest', '/emp', '/survey', '/epay']

function hasPath(paths, path) {
    return paths.find(pathItem => path.includes(pathItem)) || false
}

//progress bar for router
Router.onRouteChangeStart = () => {
    WebCmsProgress.start()
}

Router.onRouteChangeComplete = () => {
    WebCmsProgress.done()
}

Router.onRouteChangeError = () => {
    WebCmsProgress.done()
}

const appStyles = makeStyles((theme) => ({
    snackbarContainerRoot: {
        [theme.breakpoints.down('sm')]: {
            bottom: 125,
        },
    }
}))

const directions = {
    ltr: create({ plugins: [...jssPreset().plugins] }),
    rtl: create({ plugins: [...jssPreset().plugins, rtl()] }),
}

const _App = ({ Component, pageProps, store, DB_GENERAL_SETTINGS, DB_REDIS_WEBCMS_DATA, QUERY_LOCALE, DEFAULT_LOCALE, __NEXT_DATA__, DEFAULT_LANGUAGE_FILE, DEFAULT_HTL_LANGUAGE_FILE, host}) => {
    let GENERAL_SETTINGS, WEBCMS_DATA, locale
        , [GENERAL_SETTINGS_CACHE, setGENERAL_SETTINGS_CACHE] = useState(null)
        , [WEBCMS_DATA_CACHE, setWEBCMS_DATA_CACHE] = useState(null)
        , [LOCALE_CACHE, setLOCALE_CACHE] = useState('')
        , [COOKIE_ENABLED, setCOOKIE_ENABLED] = useState(false)
        , [VERNO, setVERNO] = useState('')
        , router = useRouter()
        , iframe = router.query.iframe === 'true'
        , isOnlyBasics = router.query.isOnlyBasics === '1'
        , classes = appStyles()
        , [token, setToken] = useState(router.query.authToken)

    useEffect(() => {
        setGENERAL_SETTINGS_CACHE(DB_GENERAL_SETTINGS)
        setWEBCMS_DATA_CACHE(DB_REDIS_WEBCMS_DATA)
        setVERNO(window.__NEXT_DATA__.buildId || '')

        if (!QUERY_LOCALE) {
            setLOCALE_CACHE(QUERY_LOCALE)
        }

        if(DB_REDIS_WEBCMS_DATA?.assets?.meta?.googleTag){
            TagManager.initialize({ gtmId: DB_REDIS_WEBCMS_DATA.assets.meta.googleTag })
        }

        let cookieEnabled = localStorage.getItem("is-cookie")
        if(!cookieEnabled) {
            setCOOKIE_ENABLED(true)
        }

        const jssStyles = document.querySelector('#jss-server-side')
        if (jssStyles) {
            jssStyles.parentElement.removeChild(jssStyles)
        }

        window.addEventListener('message', function(event) {
            if (event?.data?.tokenUpdate !== token) {
                setToken(event.data.tokenUpdate)
            }
        })

        useLogger()
        Router.events.on('routeChangeComplete', () => useLogger())

    }, [])

    const useLogger = () => {
        let getData = {
            url: `${location.protocol}//${location.host}${Router.router.asPath}`,
            pagelang: locale,
            pagesize: `${window.outerWidth}x${window.outerHeight}`,
            brdesc: getBrowser().name,
            brver: getBrowser().version,
            brlang: navigator.language || navigator.userLanguage || 'non',
            devicetype: getDeviceType(),
            ckenabled: navigator.cookieEnabled || false,
        }

        let getAuth = localStorage.getItem(LOCAL_STORAGE_OREST_TOKEN_TEXT) || false
        if(getAuth){
            getAuth = JSON.parse(getAuth)
            getData.islogin = getAuth ? 'true' : 'false'
            getData.loginrefid = getAuth?.loginfo?.refid || '0'
            getData.loginrefcode = getAuth?.loginfo?.refcode || ''
        }

        return axios({
            url: 'api/browser/info',
            method: 'post',
            params: {
                ver: window.__NEXT_DATA__.buildId || '0'
            },
            data: {
                value: Buffer.from(JSON.stringify(getData)).toString('base64'),
            },
        }).then(() => {
            return true
        }).catch(() => {
            return false
        })
    }

    if (DB_GENERAL_SETTINGS) {
        GENERAL_SETTINGS = DB_GENERAL_SETTINGS
    } else {
        GENERAL_SETTINGS = GENERAL_SETTINGS_CACHE
    }

    if (DB_REDIS_WEBCMS_DATA) {
        WEBCMS_DATA = DB_REDIS_WEBCMS_DATA
    } else {
        WEBCMS_DATA = WEBCMS_DATA_CACHE
    }

    if (QUERY_LOCALE) {
        locale = QUERY_LOCALE
    } else if (LOCALE_CACHE) {
        locale = LOCALE_CACHE
    } else {
        locale = DEFAULT_LOCALE
    }

    if(locale){
        moment.locale(locale)
    }

    const handleCookie = () => {
        localStorage.setItem("is-cookie", "active")
        setCOOKIE_ENABLED(false)
    }

    let fontName = WEBCMS_DATA?.assets?.font?.name
    fontName = fontName !== 'default' ? fontName : 'Roboto'

    if(WEBCMS_DATA?.assets?.colors?.primary && host?.includes('cloud') || host?.includes('portal')) {
        WEBCMS_DATA.assets.colors.primary.main = router.pathname.indexOf('emp') !== -1 ? '#064E42' : '#4666B0'
        WEBCMS_DATA.assets.colors.primary.dark = router.pathname.indexOf('emp') !== -1 ? '#122D31' : '#43425C'
        WEBCMS_DATA.assets.colors.primary.light = router.pathname.indexOf('emp') !== -1 ? '#4E8179' : '#43425C'
        WEBCMS_DATA.assets.colors.primary.ultraDark = router.pathname.indexOf('emp') !== -1 ? '#0E2326' : '#3C3B53'
        WEBCMS_DATA.assets.colors.text = {
            main: router.pathname.indexOf('emp') !== -1 ? '#064E42' : '#43425D',
            light: router.pathname.indexOf('emp') !== -1 ? '#4E8179' : '#43425D',
            ultraDark: router.pathname.indexOf('emp') !== -1 ? '#122D31' : '#43425D'
        }
    }

    const theme = createMuiTheme({
        typography: {
            fontFamily: ['\'' + fontName + '\'', 'sans-serif'].join(','),
        },
        palette: WEBCMS_DATA?.assets?.colors,
        direction: locale === 'ar' ? 'rtl' : 'ltr',
    })

    return (
        <React.Fragment>
            <Head>
                <meta charSet="utf-8" />
                <meta name="theme-color" content="#ffffff" />
                <meta name="webcms-ver" content={VERNO}/>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no"/>
                {WEBCMS_DATA?.assets?.meta?.fbVerificationCode && <meta name="facebook-domain-verification" content={WEBCMS_DATA.assets.meta.fbVerificationCode} />}
                {host && host === "docs.hotech.systems" ? <meta name="google-signin-client_id" content="161176593651-khs1j4eatnfian8ll774gq7c1v2f2ffc.apps.googleusercontent.com"/> : null}
                <base href={GENERAL_SETTINGS?.BASE_URL || ''}/>
                <title>{WEBCMS_DATA?.assets?.meta?.title || ''}</title>
                {(WEBCMS_DATA?.assets?.meta?.chatBox && !hasPath(noCookieAndChatPaths, router.pathname)) ? <script dangerouslySetInnerHTML={{ __html: `${WEBCMS_DATA.assets.meta.chatBox}`, }} />: null}
            </Head>
            <StylesProvider jss={locale === 'ar' ? directions.rtl : directions.ltr}>
                <MuiThemeProvider theme={theme}>
                    <CssBaseline/>
                    <Provider store={store}>
                        <WebCmsGlobal.Provider value={{ GENERAL_SETTINGS, WEBCMS_DATA, token, locale }}>
                            <LocaleProvider lang={locale} defaultHotelLanguageFile={DEFAULT_HTL_LANGUAGE_FILE} defaultLanguageFile={DEFAULT_LANGUAGE_FILE}>
                                <SnackbarProvider maxSnack={3} classes={{ containerRoot: classes.snackbarContainerRoot, }}>
                                    <Component {...pageProps} />
                                    {(!isOnlyBasics && !hasPath(noCookieAndChatPaths, router.pathname)) ? <CookiePolicy isActive={!iframe && COOKIE_ENABLED} onClose={()=> handleCookie()} />: null}
                                </SnackbarProvider>
                            </LocaleProvider>
                        </WebCmsGlobal.Provider>
                    </Provider>
                </MuiThemeProvider>
            </StylesProvider>
         </React.Fragment>
    )
}

_App.getInitialProps = async ({ Component, ctx }) => {
    await pathRedirection(ctx)

    const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {}
    let DB_GENERAL_SETTINGS, DB_REDIS_WEBCMS_DATA, QUERY_LOCALE, DEFAULT_LOCALE, DEFAULT_LANGUAGE_FILE = false, DEFAULT_HTL_LANGUAGE_FILE = false, host

    if (ctx.req) {
        host = ctx.req.headers.host
    }

    if (ctx.res) {
        // server side
        DB_GENERAL_SETTINGS = ctx.res.GENERAL_SETTINGS
        DB_REDIS_WEBCMS_DATA = ctx.res.REDIS_WEBCMS_DATA
    }

    const currentLanguage = ctx.req && ctx.req.currentLanguage && ctx.req.currentLanguage || false
    if (ctx.req && currentLanguage && DB_GENERAL_SETTINGS?.useFilterLangs?.length > 0 && isLocaleViaList(DB_GENERAL_SETTINGS.useFilterLangs, currentLanguage)) {
        DEFAULT_LOCALE = currentLanguage
    } else {
        if((!DB_GENERAL_SETTINGS?.useFilterLangs || (DB_GENERAL_SETTINGS?.useFilterLangs?.length === 0)) && ctx.req && currentLanguage && isLocale(currentLanguage)){
            DEFAULT_LOCALE = currentLanguage
        } else if (ctx.res) {
            DEFAULT_LOCALE = DB_GENERAL_SETTINGS.hotelLocalLangGCode
        } else {
            DEFAULT_LOCALE = defaultLocale
        }
    }

    if (DB_REDIS_WEBCMS_DATA && DB_REDIS_WEBCMS_DATA?.default?.pages && Object.keys(DB_REDIS_WEBCMS_DATA.default.pages).length && DB_REDIS_WEBCMS_DATA?.defaultLanguage){
        DEFAULT_LOCALE = DB_REDIS_WEBCMS_DATA?.defaultLanguage?.gcode || DEFAULT_LOCALE
    }

    if (ctx.query.lang) {
        QUERY_LOCALE = ctx.query.lang
        if(Array.isArray(QUERY_LOCALE)){
            QUERY_LOCALE = QUERY_LOCALE[0]
        }
    }

    if (pageProps && Object.keys(pageProps).length > 0) {
        return {
            pageProps,
            DB_GENERAL_SETTINGS,
            DB_REDIS_WEBCMS_DATA,
            QUERY_LOCALE,
            DEFAULT_LOCALE,
            DEFAULT_LANGUAGE_FILE,
            DEFAULT_HTL_LANGUAGE_FILE,
            host,
        }
    } else {
        if (DB_GENERAL_SETTINGS) {
            DEFAULT_LANGUAGE_FILE = await getHotelAppLang(ctx.req, ctx.res,QUERY_LOCALE || DEFAULT_LOCALE)
            DEFAULT_HTL_LANGUAGE_FILE = await getHotelAppLang(ctx.req, ctx.res, DB_GENERAL_SETTINGS.hotelLocalLangGCode)
        }

        return { DB_GENERAL_SETTINGS, DB_REDIS_WEBCMS_DATA, QUERY_LOCALE, DEFAULT_LOCALE, DEFAULT_LANGUAGE_FILE, DEFAULT_HTL_LANGUAGE_FILE, host }
    }
}

export default withRedux(store)(_App)
