import React, { Fragment } from 'react'
import Document, { Head, Html, Main, NextScript } from 'next/document'
import { ServerStyleSheets } from '@material-ui/core/styles'
import { defaultLocale } from '../lib/translations/config'

class _Document extends Document {
    render() {
        const { GENERAL_SETTINGS, WEBCMS_DATA, locale } = this.props
        return (
            <Html lang={locale}>
                <Head>
                    {WEBCMS_DATA.assets.font.name === 'default' || WEBCMS_DATA.assets.font.name === 'Roboto' ? (
                        <link type="text/css" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"/>
                    ) : (
                        <link type="text/css" href={'https://fonts.googleapis.com/css?family=' + WEBCMS_DATA.assets.font.name.split(' ').join('+') + ':300,400,500,700&display=swap'}/>
                    )}
                    {WEBCMS_DATA.assets.images.favIcon ? (
                        <link rel="shortcut icon" href={GENERAL_SETTINGS.STATIC_URL + WEBCMS_DATA.assets.images.favIcon}/>
                    ) : (
                        <link rel="shortcut icon" href="//cloud.vimahotels.com/files/7C3F5C18-1A47-4D4A-92E2-FE024ABED03E/AGENCY/135363/favicon.png"/>
                    )}
                    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
                    {(WEBCMS_DATA?.assets?.meta?.googleAnalyticsTag) ? (
                        <React.Fragment>
                            <script async src={`https://www.googletagmanager.com/gtag/js?id=${WEBCMS_DATA?.assets?.meta?.googleAnalyticsTag}`} />
                            <script dangerouslySetInnerHTML={{ __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${WEBCMS_DATA?.assets?.meta?.googleAnalyticsTag}');`}} />
                        </React.Fragment>
                    ) : null}
                </Head>
                <body dir={locale === 'ar' ? 'rtl' : 'ltr' || WEBCMS_DATA.assets.meta.dir} style={locale === 'ar' ? {textAlign: 'right'}: {}}>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

_Document.getInitialProps = async (ctx) => {
    const sheets = new ServerStyleSheets()
    const originalRenderPage = ctx.renderPage

    ctx.renderPage = () => originalRenderPage({
        enhanceApp: (WrappedComponent) => (props) => sheets.collect(<WrappedComponent {...props} />),
    })

    const initialProps = await Document.getInitialProps(ctx)

    let GENERAL_SETTINGS, WEBCMS_DATA, locale
    if (ctx.res) {
        // server side
        GENERAL_SETTINGS = ctx.res.GENERAL_SETTINGS
        WEBCMS_DATA = ctx.res.REDIS_WEBCMS_DATA
    }

    if (ctx.query.lang) {
        locale = ctx.query.lang
    } else {
        locale = WEBCMS_DATA?.assets?.meta?.langs || defaultLocale
    }

    return {
        ...initialProps,
        GENERAL_SETTINGS,
        WEBCMS_DATA,
        locale,
        styles: (
            <Fragment>
                {initialProps.styles}
                {sheets.getStyleElement()}
            </Fragment>
        ),
    }
}

export default _Document
