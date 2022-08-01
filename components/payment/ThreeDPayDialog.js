import React from 'react'
import { AppBar, Typography, Dialog, Toolbar, Slide, Box } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import useTranslation from 'lib/translations/hooks/useTranslation'
import LoadingSpinner from 'components/LoadingSpinner'

const useThreeDPayDialogStyles = makeStyles((theme) => ({
    appBar: {
        position: 'relative',
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
    payFrameLoadWrapper: {
        margin: '18% 0 auto',
        display: 'block',
        textAlign: 'center',
        padding: 20
    },
    payFrameLoadTitle: {
        background: '#f0f0f0',
        display: 'inline-flex',
        padding: 10,
        position: 'relative',
        top: 20,
        borderRadius: 20,
    }
}));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />
})

const ThreeDPayDialog = (props) => {
    const classes = useThreeDPayDialogStyles()
    const { open, onClose, iframeUrl, isPayFrameLoad, setIsPayFrameLoad, isPaySave } = props
    const { t } = useTranslation()

    return (
        <Dialog fullScreen open={Boolean(open)} onClose={() => onClose(false)} TransitionComponent={Transition}>
            <AppBar className={classes.appBar}>
                <Toolbar>
                    <Typography variant='h6' className={classes.title}>
                        {t('str_threeDPaySmsVerification')}
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box>
                <div style={{ height: '100vh', position: 'relative' }}>
                    {!isPayFrameLoad ? (
                        <React.Fragment>
                            <div className={classes.payFrameLoadWrapper}>
                                <LoadingSpinner size={40} />
                                <Typography variant="body2" gutterBottom className={classes.payFrameLoadTitle}>
                                    {t('str_youAreBeignRedirectedForThreeDSmsVerificationPleaseWait')}
                                </Typography>
                            </div>
                        </React.Fragment>
                    ): isPaySave ? (
                        <React.Fragment>
                            <div className={classes.payFrameLoadWrapper}>
                                <LoadingSpinner size={40} />
                                <Typography variant="body2" gutterBottom className={classes.payFrameLoadTitle}>
                                    {t('str_paymentTransactionVerifyingPleaseWait')}
                                </Typography>
                            </div>
                        </React.Fragment>
                    ): null}
                    <iframe
                        onLoad={() => setIsPayFrameLoad(true)}
                        allowpaymentrequest="true"
                        target="self"
                        src={iframeUrl}
                        style={{
                            width: '100%',
                            minHeight: '400px',
                            height: '100%',
                            border: '0px',
                            display: isPaySave ? 'none': 'block',
                        }}
                    />
                </div>
            </Box>
        </Dialog>
    )
}

export default ThreeDPayDialog