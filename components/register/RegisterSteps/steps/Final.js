import React from 'react'
import { connect } from 'react-redux'
import { deleteFromState, pushToState, setToState, updateState } from 'state/actions'
import { Button, Grid, makeStyles, Typography } from '@material-ui/core'
import { useRouter } from 'next/router'
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline'
import useTranslation from 'lib/translations/hooks/useTranslation'

const useStyles = makeStyles((theme) => ({
    listItem: {
        padding: theme.spacing(1, 0),
    },
    total: {
        fontWeight: '700',
    },
    title: {
        marginTop: theme.spacing(2),
    },
}))

const Final = (props) => {
    const classes = useStyles()
    const router = useRouter()
    const isOnlyBasics = router.query.isOnlyBasics === '1'
    const preRegister = router.query.preRegister === '1'
    const { t } = useTranslation()
    const backUrl = router.query.backUrl || '/'

    const handleBackToHome = () => {
        top.location = backUrl
    }

    if (isOnlyBasics) {
        return (
            <React.Fragment>
                <Grid container direction="row" justify="center" alignItems="center">
                    <Grid item xs={12} style={{ paddingTop: '5%' }}>
                        <Typography variant="subtitle1" gutterBottom align="center">
                            <CheckCircleOutlineIcon style={{ color: '#4CAF50', fontSize: 70 }} />
                        </Typography>
                        <Typography variant="h6" gutterBottom align="center">
                            {t('str_registrationCompleted')}
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom align="center">
                        {/*    {t('str_detailsToMail')}*/}
                        </Typography>
                    </Grid>
                </Grid>
            </React.Fragment>
        )
    } else if (preRegister) {
        return (
            <React.Fragment>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: 32 }}>
                            <Typography variant="body1" gutterBottom>
                                {t('str_teamWillContact')}
                            </Typography>
                        </div>
                        <Button variant="contained" color="secondary" onClick={handleBackToHome}>
                            {t('str_backToHome')}
                        </Button>
                    </div>
                </div>
            </React.Fragment>
        )
    } else {
        return (
            <React.Fragment>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: 32 }}>
                            {/*<img width={250} src={RegisterFinishedLogo} alt="OtelloRegisterFinished"/>*/}
                            <Typography variant="body1" gutterBottom>
                                {t('str_settingsSaved')} {t('str_closeOrArrange')}
                            </Typography>

                            {/*  <Typography variant="h6" gutterBottom>
                            Order summary
                        </Typography>
                        <List disablePadding>
                            {products.map(product => (
                                <ListItem className={classes.listItem} key={product.name}>
                                    <ListItemText primary={product.name} secondary={product.desc} />
                                    <Typography variant="body2">{product.price}</Typography>
                                </ListItem>
                            ))}
                            <ListItem className={classes.listItem}>
                                <ListItemText primary="Total" />
                                <Typography variant="subtitle1" className={classes.total}>
                                    $34.06
                                </Typography>
                            </ListItem>
                        </List>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="h6" gutterBottom className={classes.title}>
                                    Shipping
                                </Typography>
                                <Typography gutterBottom>John Smith</Typography>
                                <Typography gutterBottom>{addresses.join(', ')}</Typography>
                            </Grid>
                            <Grid item container direction="column" xs={12} sm={6}>
                                <Typography variant="h6" gutterBottom className={classes.title}>
                                    Payment details
                                </Typography>
                                <Grid container>
                                    {payments.map(payment => (
                                        <React.Fragment key={payment.name}>
                                            <Grid item xs={6}>
                                                <Typography gutterBottom>{payment.name}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography gutterBottom>{payment.detail}</Typography>
                                            </Grid>
                                        </React.Fragment>
                                    ))}
                                </Grid>
                            </Grid>
                        </Grid>
*/}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.registerStepper,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    pushToState: (stateType, stateName, value) => dispatch(pushToState(stateType, stateName, value)),
    deleteFromState: (stateType, stateName, value) => dispatch(deleteFromState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Final)
