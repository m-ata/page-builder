import React, {useEffect, useState, useContext} from 'react'
import { connect, useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import CloseIcon from '@material-ui/icons/Close'
import Slide from '@material-ui/core/Slide'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { DEFAULT_OREST_TOKEN, OREST_ENDPOINT } from 'model/orest/constants'
import { ViewList } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import RenderWebPage from 'components/page-builder/PageBuilderSteps/steps/RenderWebPage'
import { setToState } from 'state/actions'
import LoadingSpinner from 'components/LoadingSpinner'
import Alert from '@material-ui/lab/Alert'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import Container from '@material-ui/core/Container'

const useStyles = makeStyles((theme) => ({
    appBar: {
        position: 'relative',
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
        textTransform: 'capitalize'
    },
    dialogTitle: {
        padding: 0
    },
    container:{
        paddingTop: 50 ,
        paddingBottom: 120
    }
}))

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
})

const SeeAdvantages = (props) => {
    const classes = useStyles();
    const { open, onClose, state, setToState } = props
    const { GENERAL_SETTINGS, locale } = useContext(WebCmsGlobal)
    const { t } = useTranslation()
    const token = useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth.access_token)
    const [isLoading, setIsLoading] = useState(false)

    const handleClose = () => {
        onClose(false)
    }

    useEffect(() => {
        let active = true
        if (active && !isLoading && (!state.loyaltyAdvantages.data || state.loyaltyAdvantages.langcode !== locale)) {
            setToState('guest', ['loyaltyAdvantages', 'data'], false)
            setIsLoading(true)
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RAFILE,
                token: token,
                params: {
                    query: `code::GAPP.LOYALTY.ADV,filetype::WEBPAGE,langcode:${locale}`,
                    allhotels: true
                }
            }).then(res => {
                if (res.status === 200 && res.data && res.data.data.length > 0) {
                    setIsLoading(false)
                    const webPageData = JSON.parse(Buffer.from(res.data.data[0].filedata, 'base64').toString('utf-8'))
                    setToState('guest', ['loyaltyAdvantages', 'data'], webPageData)
                    setToState('guest', ['loyaltyAdvantages', 'langcode'], locale)
                }else{
                    setIsLoading(false)
                    setToState('guest', ['loyaltyAdvantages', 'data'], null)
                    setToState('guest', ['loyaltyAdvantages', 'langcode'], locale)
                }
            }).catch(()=> {
                setIsLoading(false)
                setToState('guest', ['loyaltyAdvantages', 'data'], null)
                setToState('guest', ['loyaltyAdvantages', 'langcode'], locale)
            })
        }

        return () => {
            setIsLoading(false)
            active = false
        }
    }, [locale])

    return (
        <Dialog open={open} maxWidth="lg" fullWidth onClose={handleClose} TransitionComponent={Transition}>
            <DialogTitle className={classes.dialogTitle}>
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <Typography variant="h6" className={classes.title}>
                            {t('str_seeTheAdvantages')}
                        </Typography>
                        <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
            </DialogTitle>
            <DialogContent dividers>
                <Container maxWidth="md" className={classes.container}>
                    {isLoading ?
                        <LoadingSpinner style={{ marginTop: '5%' }}  /> :
                        state.loyaltyAdvantages.data?.sections?.length > 0 ?
                            (<RenderWebPage sections={state.loyaltyAdvantages.data.sections} />) :
                            (<Alert style={{ margin: '0 auto', marginTop: '5%', width: '100%', maxWidth: 400 }} variant="outlined" severity="info">{t('str_noDefaultRecord')}</Alert>)
                    }
                </Container>
            </DialogContent>
        </Dialog>
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

export default connect(mapStateToProps, mapDispatchToProps)(SeeAdvantages)
