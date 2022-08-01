import React, { useContext } from 'react'
import { useRouter } from 'next/router'
import { languageNames, locales } from 'lib/translations/config'
import { LocaleContext } from 'lib/translations/context/LocaleContext'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state'
import Avatar from '@material-ui/core/Avatar'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import { makeStyles } from '@material-ui/core/styles'
import WebCmsGlobal from '../webcms-global'

const useStyles = makeStyles(() => ({
    root: {
        width: 16,
        height: 'auto'
    },
    listItem: {
      paddingTop: 3,
      paddingBottom: 3,
      borderBottom: '1px solid #00000014'
    },
    listItemIcon: {
        minWidth: 30,
    },
    listItemText: {
        paddingTop: 2,
        fontSize: 16
    }
}))

const LocaleSwitcher = (props) => {
    const Router = useRouter()
    const { isPortal, className } = props;
    const { locale } = useContext(LocaleContext)
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const classes = useStyles()

    const getLocales = () => {
        if (GENERAL_SETTINGS.useFilterLangs) {
            let useLocales = []
            Object.keys(GENERAL_SETTINGS.useFilterLangs).forEach((keyIndex) => {
                const key = GENERAL_SETTINGS.useFilterLangs[keyIndex]
                if (locales.includes(key)) {
                    useLocales.push(key)
                }
            })
            return useLocales
        }

        return locales
    }

    const handleLocaleChange = (lang) => {
        const basePath = Router.asPath.split('?')[0] || Router.asPath
        const query = Router.query
        query.lang = lang || locale

        Object.keys(query).map(function(k) {
            if (Router.pathname.includes(`[${k}]`)) {
                delete query[k]
            }
        })

        const url = { pathname: Router.pathname, query }
        const urlAs = { pathname: basePath, query }

        Router.push(url, urlAs)
        document.documentElement.lang = lang
        document.body.style.direction = lang === 'ar' ? 'rtl' : 'ltr'
        document.body.style.textAlign = lang === 'ar' ? 'right' : ''
    }

    return (
        <PopupState variant="popover" popupId="lang-popup-menu">
            {(popupState) => (
                <React.Fragment>
                    <Button
                        className={className || ""}
                        style={isPortal ? {textTransform: "none"} : null}
                        startIcon={<Avatar classes={{ root: classes.root }} variant="rounded" src={`/imgs/flags/icons/${locale}.png`} />}
                        {...bindTrigger(popupState)}
                        endIcon={<ExpandMoreIcon />}
                    >
                        {languageNames[locale]}
                    </Button>
                    <Menu
                        {...bindMenu(popupState)}
                        getContentAnchorEl={null}
                        anchorOrigin= {{
                            vertical: "bottom",
                            horizontal: "left"
                        }}
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "left"
                        }}
                    >
                        {getLocales().map((locale) => (
                            <MenuItem
                                classes={{ root: classes.listItem }}
                                key={locale}
                                onClick={() => {
                                    handleLocaleChange(locale)
                                    popupState.close()
                                }}>
                                <ListItemIcon classes={{ root: classes.listItemIcon }}>
                                    <Avatar classes={{ root: classes.root }} variant="rounded" src={`/imgs/flags/icons/${locale}.png`} />
                                </ListItemIcon>
                                <ListItemText classes={{ root: classes.listItemText }} primary={languageNames[locale]}/>
                            </MenuItem>
                        ))}
                    </Menu>
                </React.Fragment>
            )}
        </PopupState>
    )
}
export default LocaleSwitcher
