import React, { useContext } from 'react'
import Dialog from '@material-ui/core/Dialog'
import Grid from '@material-ui/core/Grid'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Slide from '@material-ui/core/Slide'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import { makeStyles } from '@material-ui/core/styles'
import { languageNames, locales } from 'lib/translations/config'
import Typography from '@material-ui/core/Typography'
import Router from 'next/router'
import { connect } from 'react-redux'
import { setToState } from 'state/actions'
import useTranslation from 'lib/translations/hooks/useTranslation'
import WebCmsGlobal from '../../../../webcms-global'

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />
})

const useStyles = makeStyles({
    root: {
        maxWidth: 345,
    },
    media: {
        height: 140,
    },
    content: {
        paddingTop: 50,
        paddingBottom: 50
    }
})

const LanguageSelectionDialog = (props) => {
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { locale } = useContext(WebCmsGlobal)
    const { open, setToState } = props
    const { t } = useTranslation()
    const classes = useStyles()
    const useLocales = GENERAL_SETTINGS.useFilterLangs ? GENERAL_SETTINGS.useFilterLangs : locales

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

        setToState("guest", ["useKioskLanguage"],  query.lang)
        Router.push(url, urlAs)
        document.documentElement.lang = lang
    }

    return (
        <Dialog
            fullWidth
            maxWidth="md"
            open={open}
            TransitionComponent={Transition}
            keepMounted
            aria-labelledby='language-dialog-slide-title'
            aria-describedby='language-dialog-slide-description'
        >
            <DialogTitle id='language-dialog-slide-title'>{t('str_selectALanguage')}</DialogTitle>
            <DialogContent dividers className={classes.content}>
                <Grid container spacing={3}>
                    {useLocales.map((item)=> {
                        return (
                            <Grid item xs={6} sm={3}>
                                <Card className={classes.root} onClick={()=> handleLocaleChange(item)}>
                                    <CardActionArea>
                                        <CardMedia
                                            className={classes.media}
                                            image={`/imgs/flags/${item}.png`}
                                        />
                                        <CardContent>
                                            <Typography variant="h5" component="h2" align="center">
                                                {languageNames[item]}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        )
                    }) }
                </Grid>
            </DialogContent>
        </Dialog>
    )
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(null, mapDispatchToProps)(LanguageSelectionDialog)