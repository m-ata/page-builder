import React, { useContext } from 'react'
import Alert from '@material-ui/lab/Alert'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import * as global from '@webcms-globals'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { LocaleContext } from 'lib/translations/context/LocaleContext'

const useStyles = makeStyles({
    root: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        maxWidth: 400,
        margin: 30,
        zIndex: 99999,
        display: 'none',
        visibility: 'hidden'
    },
    alertCookie: {
        background: '#ffffffba'
    },
    moreInformation: {
        fontWeight: 'bold'
    },
    visible: {
        display: 'block',
        visibility: 'visible'
    }
})

export default function CookiePolicy(props) {
    const classes = useStyles()
    const { isActive, onClose } = props
    const { t } = useTranslation()
    const { locale } = useContext(LocaleContext)

    return (
        <React.Fragment>
            <div className={clsx(classes.root, {[classes.visible]: isActive})}>
                <Alert className={classes.alertCookie} variant="outlined" severity="info" onClose={() => onClose()}>
                    {t('str_cookiePolicyInfo')}{' '}
                    <a className={classes.moreInformation} href={ `info/${locale || global.common.strDefShortLangCode}/${global.guestWeb.strDataPolicy}`} target="_blank"> {t('str_moreInfo')} </a>
                </Alert>
            </div>
        </React.Fragment>
    )
}
