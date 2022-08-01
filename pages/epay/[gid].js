//React And Redux
import React, { useContext, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { setToState, updateState } from 'state/actions'
//Icons
import RefreshIcon from '@material-ui/icons/Refresh'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
//Library
import axios from 'axios'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { LocaleContext } from 'lib/translations/context/LocaleContext'
import moment from 'moment'
//Material-Ui
import { makeStyles } from '@material-ui/core/styles'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Container,
    Grid,
    List,
    ListItem,
    ListItemText,
    Paper,
    Typography,
    Card,
    CardContent,
    Collapse
} from '@material-ui/core'

import Dialog from '@material-ui/core/Dialog'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Slide from '@material-ui/core/Slide'

import { Alert, AlertTitle } from '@material-ui/lab'
//WebCMS-Ui
import FrameCheckbox from '@webcms-ui/core/frame-checkbox'
import PaymentForm from 'components/payment/credit-card/form'
import LoadingSpinner from 'components/LoadingSpinner'
import WebCmsGlobal from 'components/webcms-global'
import ProgressButton from 'components/booking/components/ProgressButton'
import InstallmentRates from 'components/payment/InstallmentRates'
import * as global from '@webcms-globals'
//Helpers
import getSymbolFromCurrency from 'model/currency-symbol'
import { useSnackbar } from 'notistack'
//Styles
import EpayLayout from 'components/layout/containers/EpayLayout'
import styles from 'components/epay/epay.style'

const useStyles = makeStyles(styles)

const TRANSACTION_STATUS = {
    USE_PAY_FORM:0,
    SUCCESSFUL:1,
    ERROR:2
}

const SAVE_ERROR_TYPE = {
    SESSION_TIMEOUT: 'payment_transaction_completed_but_not_posted',
    PAYMENT_FAIL: 'payment_fail'
}

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
        , { open, onClose, iframeUrl, isPayFrameLoad, setIsPayFrameLoad} = props
        , { t } = useTranslation()

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
                            display: 'block',
                        }}
                    />
                </div>
            </Box>
        </Dialog>
    )
}

const EpaymentPage = (props) => {

    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
        , { locale } = useContext(LocaleContext)
        , { t } = useTranslation()
        , classes = useStyles()
        , { enqueueSnackbar } = useSnackbar()
        , { gid } = props
        , notAvailable = '-'
        , [pageStatus, setPageStatus] = useState(false)
        , [pageData, setPageData] = useState(false)
        , [creditCardInfo, setCreditCardInfo] = useState(false)
        , [creditCardIsValid, setCreditCardIsValid] = useState(false)
        , [errorMsg, setErrorMsg] = useState(false)
        , [isSaveError, setIsSaveError] = useState(false)
        , [isPageLoaded, setIsPageLoaded] = useState(true)
        , [isLoading, setIsLoading] = useState(false)
        , [isPayLoading, setIsPayLoading] = useState(false)
        , [ccNumberFocus, setCcNumberFocus] = useState(false)
        , [selectCcInstId, setSelectCcInstId] = useState(false)
        , [isInstLoading, setIsInstLoading] = useState(false)
        , [isPayFrameLoad, setIsPayFrameLoad] = useState(false)
        , [redirectUrl, setRedirectUrl] = useState(false)
        , [transID, setTransID] = useState(false)
        , [transactionStatus, setTransactionStatus] = useState(0)
        , [transactionId, setTransactionId] = useState(false)
        , [payTerms, setPayTerms] = useState(false)

    useEffect(() => {
        async function fetchPaymentInformationData() {
            await axios({
                url: 'api/ors/payment/information',
                method: 'post',
                params: {
                    gid: gid,
                },
            }).then((response) => {
                if (response.status === 200 && response.data.success) {
                    const data = response.data && response.data
                    setPageStatus(data && data.success)
                    setPageData(data && data || null)
                    setIsPageLoaded(false)
                } else {
                    setPageStatus(false)
                    setPageData(null)
                    setIsPageLoaded(false)
                }
            }).catch(() => {
                setPageStatus(false)
                setPageData(null)
                setIsPageLoaded(false)
            })
        }

        fetchPaymentInformationData().then(() => {
            return true
        })
    }, [])

    useEffect(() => {
        if (redirectUrl) {
            window.addEventListener('message', paymentSaveListener, true)
        }
    }, [redirectUrl])

    const paymentSaveListener = (event) => {
        window.removeEventListener('message', paymentSaveListener, true)
        const response = event.data.response
        if (!isLoading) {
            setIsLoading(true)
            return axios({
                url: 'api/ors/payment/save',
                method: 'post',
                params: {
                    isfail: !response.success,
                    transactionid: transactionId,
                    orderid: response.orderid,
                    langcode: locale,
                    gid: pageData.gid,
                    reftype: pageData.paymentDetails.reftablename,
                    refno: pageData.paymentDetails.reservno || pageData.paymentDetails.transno || pageData.paymentDetails.foliono,
                },
            }).then((responsePaymentSave) => {
                if (responsePaymentSave.data.success) {
                    if (responsePaymentSave.data.processMsg === SAVE_ERROR_TYPE.PAYMENT_FAIL) {
                        setTransactionStatus(TRANSACTION_STATUS.ERROR)
                        setErrorMsg(response.errormsg)
                        setIsLoading(false)
                    } else {
                        setTransactionStatus(TRANSACTION_STATUS.SUCCESSFUL)
                        setTransID(response.orderid)
                        setIsLoading(false)
                    }
                } else {
                    setTransactionStatus(TRANSACTION_STATUS.ERROR)
                    if (responsePaymentSave.data.processMsg === SAVE_ERROR_TYPE.SESSION_TIMEOUT) {
                        setIsSaveError(true)
                        setErrorMsg(t('str_paymentTransactionSuccessButSessionTimeout', { transid: response.orderid || '' }))
                        setIsLoading(false)
                    } else {
                        setErrorMsg(response.errormsg)
                        setIsLoading(false)
                    }
                }
            }).catch(() => {
                setTransactionStatus(TRANSACTION_STATUS.ERROR)
                setErrorMsg(response.errormsg)
                setIsLoading(false)
            })
        } else {
            setTransactionStatus(TRANSACTION_STATUS.ERROR)
            setErrorMsg(response.errormsg)
            setIsLoading(false)
        }
    }

    const handlePayment = () => {
        if(creditCardIsValid.isError || !creditCardIsValid.isValid){
            enqueueSnackbar(t('str_pleaseCheckYourCardInformation'), { variant: 'warning' })
        }else if(!payTerms){
            enqueueSnackbar(t('str_pleaseAcceptTheTermsAndConditions'), { variant: 'warning' })
        }else{
            setIsPayLoading(true)
            let postData = {}
            postData.cardOwner = creditCardInfo.cardOwner
            postData.cardNumber = creditCardInfo.cardNumber.replace(/\\s/g, '').replace(/ /g, '')
            postData.cardExpiry = creditCardInfo.cardExpiry
            postData.cardCvc = creditCardInfo.cardCvc
            postData.ccInstId = selectCcInstId

            return axios({
                url: 'api/ors/payment/do',
                method: 'post',
                timeout: 1000 * 60, // Wait for 60 sec.
                params: {
                    gid: pageData.gid
                },
                data: postData
            }).then((response) => {
                if (response.data.success) {
                    setIsPayLoading(false)
                    setTransactionId(response.data.transactionid)
                    setRedirectUrl(response.data.redirecturl)
                    return true
                } else {
                    setTransactionStatus(TRANSACTION_STATUS.ERROR)
                    setErrorMsg(t('str_checkCCorPayInfoError'))
                    setIsPayLoading(true)
                    return false
                }
            }).catch(() => {
                setTransactionStatus(TRANSACTION_STATUS.ERROR)
                setErrorMsg(t('str_checkCCorPayInfoError'))
                setIsPayLoading(true)
                return false
            })
        }
    }

    const handlePayTryAgain = () => {
        setIsLoading(true)
        setTimeout(()=> {
            setIsLoading(false)
            setErrorMsg(false)
            setIsPayLoading(false)
            setRedirectUrl(false)
            setIsPayFrameLoad(false)
            setCreditCardInfo(false)
            setCreditCardIsValid(false)
            setCcNumberFocus(false)
            setSelectCcInstId(false)
            setTransactionStatus(0)
        }, 1000)
    }

    if (isPageLoaded) {
        return (
            <EpayLayout>
                <Container maxWidth="md" className={classes.wrapper}>
                    <Paper className={classes.paperBottomWrap}>
                        <Box p={3}>
                            <div style={{ height: 300, position: 'relative' }}>
                                <LoadingSpinner size={40} style={{ position: 'absolute', top: '40%', left: '50%' }}/>
                            </div>
                        </Box>
                    </Paper>
                </Container>
            </EpayLayout>
        )
    }

    if (!pageStatus) {
        return (
            <EpayLayout>
                <Container maxWidth="md" className={classes.wrapper}>
                    <Paper className={classes.paperBottomWrap}>
                        <Box p={3}>
                            <Alert variant="outlined" severity="error">
                                {t('str_urlIsWrong')}
                            </Alert>
                        </Box>
                    </Paper>
                </Container>
            </EpayLayout>
        )
    }

    return (
        <EpayLayout>
            <Container className={classes.wrapper}>
                {pageData.isReservation ? (
                    <Accordion>
                        <AccordionSummary classes={{content: classes.accordionSummaryContent, expanded: classes.accordionSummaryExpanded}} expandIcon={<ExpandMoreIcon/>}>
                            <Typography variant="h6" className={classes.infoTitle}>
                                {t('str_reservationInfo')}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails classes={{ root: classes.detailsRoot }}>
                            <Grid container direction="row" justify="center" alignItems="center" spacing={0}>
                                <Grid item xs={12}>
                                    <Box p={1}>
                                        <List disablePadding>
                                            <ListItem className={classes.listItem}>
                                                <ListItemText classes={{ primary: classes.listItemTitlePrimary }} primary={t('str_reservationHolder')}/>
                                                <Typography variant="body2" className={classes.listItemBody2}>{pageData.invoiceInformation.fullname || notAvailable}</Typography>
                                            </ListItem>
                                            <ListItem className={classes.listItem}>
                                                <ListItemText classes={{ primary: classes.listItemTitlePrimary }} primary={t('str_reservationDate')}/>
                                                <Typography variant="body2" className={classes.listItemBody2}>{pageData?.invoiceInformation?.resdate && moment(pageData.invoiceInformation.resdate, 'YYYY-MM-DD').format('ddd, MMM DD, YYYY') || notAvailable}</Typography>
                                            </ListItem>
                                            <ListItem className={classes.listItem}>
                                                <ListItemText classes={{ primary: classes.listItemTitlePrimary }} primary={t('str_checkIn')}/>
                                                <Typography variant="body2" className={classes.listItemBody2}>{pageData?.invoiceInformation?.checkin && moment(pageData.invoiceInformation.checkin, 'YYYY-MM-DD').format('ddd, MMM DD, YYYY') || notAvailable}</Typography>
                                            </ListItem>
                                            <ListItem className={classes.listItem}>
                                                <ListItemText classes={{ primary: classes.listItemTitlePrimary }} primary={t('str_checkOut')}/>
                                                <Typography variant="body2" className={classes.listItemBody2}>{pageData?.invoiceInformation?.checkout && moment(pageData.invoiceInformation.checkout, 'YYYY-MM-DD').format('ddd, MMM DD, YYYY') || notAvailable}</Typography>
                                            </ListItem>
                                            <ListItem className={classes.listItem}>
                                                <ListItemText classes={{ primary: classes.listItemTitlePrimary }} primary={t('str_adult')}/>
                                                <Typography variant="body2" className={classes.listItemBody2}>{pageData.invoiceInformation.totalpax || notAvailable}</Typography>
                                            </ListItem>
                                            <ListItem className={classes.listItem}>
                                                <ListItemText classes={{ primary: classes.listItemTitlePrimary }} primary={t('str_child1')}/>
                                                <Typography variant="body2" className={classes.listItemBody2}>{pageData.invoiceInformation.totalchd1 || notAvailable}</Typography>
                                            </ListItem>
                                            <ListItem className={classes.listItem}>
                                                <ListItemText classes={{ primary: classes.listItemTitlePrimary }} primary={t('str_child2')}/>
                                                <Typography variant="body2" className={classes.listItemBody2}>{pageData.invoiceInformation.totalchd2 || notAvailable}</Typography>
                                            </ListItem>
                                            <ListItem className={classes.listItem}>
                                                <ListItemText classes={{ primary: classes.listItemTitlePrimary }} primary={t('str_totalPrice')}/>
                                                <Typography variant="body2" className={classes.listItemBody2}>{pageData.invoiceInformation.totalprice && global.helper.formatPrice(pageData.invoiceInformation.totalprice) || notAvailable} {pageData.invoiceInformation.pricecurrcode && getSymbolFromCurrency(pageData.invoiceInformation.pricecurrcode) || notAvailable}</Typography>
                                            </ListItem>
                                            <ListItem className={classes.listItem}>
                                                <ListItemText classes={{ primary: classes.listItemTitlePrimary }} primary={t('str_boardType')}/>
                                                <Typography variant="body2" className={classes.listItemBody2}>{pageData.invoiceInformation.boardtypedesc || notAvailable}</Typography>
                                            </ListItem>
                                        </List>
                                    </Box>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>): null}
                <Accordion>
                    <AccordionSummary classes={{content: classes.accordionSummaryContent, expanded: classes.accordionSummaryExpanded}} expandIcon={<ExpandMoreIcon/>}>
                        <Typography variant="h6" className={classes.infoTitle}>
                            {t('str_invoicing')}
                        </Typography>
                        <div className={classes.payAmount}>
                            <strong className={classes.payAmountTitle}>{t('str_balance')}:</strong> {pageData.paymentDetails.paybalance && global.helper.formatPrice(pageData.paymentDetails.paybalance) || notAvailable} {pageData.paymentDetails.currency && getSymbolFromCurrency(pageData.paymentDetails.currency) || notAvailable}
                        </div>
                    </AccordionSummary>
                    <AccordionDetails classes={{ root: classes.detailsRoot }}>
                        <Grid container direction="row" justify="center" alignItems="center" spacing={1}>
                            <Grid item xs={12}>
                                <Box p={1}>
                                    <List disablePadding>
                                        <ListItem className={classes.listItem}>
                                            <ListItemText classes={{ primary: classes.listItemTitlePrimary }} primary={t('str_invoiceTitle')}/>
                                            <Typography variant="body2" className={classes.listItemBody2}>{pageData.paymentDetails.invtitle || notAvailable}</Typography>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <ListItemText classes={{ primary: classes.listItemTitlePrimary }} primary={t('str_invoiceEmail')}/>
                                            <Typography variant="body2" className={classes.listItemBody2}>{pageData.paymentDetails.email || notAvailable}</Typography>
                                        </ListItem>
                                        {pageData.paymentDetails.reservno ? (
                                            <ListItem className={classes.listItem}>
                                                <ListItemText classes={{ primary: classes.listItemTitlePrimary }} primary={t('str_resNo')}/>
                                                <Typography variant="body2" className={classes.listItemBody2}>{pageData?.paymentDetails?.refid || pageData?.paymentDetails?.reservno || notAvailable}</Typography>
                                            </ListItem>
                                        ): null}
                                        <ListItem className={classes.listItem}>
                                            <ListItemText classes={{ primary: classes.listItemTitlePrimary }} primary={t('str_balance')}/>
                                            <Typography variant="body2" className={classes.listItemBody2}>{pageData.paymentDetails.paybalance && global.helper.formatPrice(pageData.paymentDetails.paybalance) || notAvailable} {pageData.paymentDetails.currency && getSymbolFromCurrency(pageData.paymentDetails.currency) || notAvailable}</Typography>
                                        </ListItem>
                                    </List>
                                </Box>
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>
                <Paper className={classes.paperBottomWrap}>
                    {(pageData.paymentDetails && !pageData.paymentDetails.paybalance || !(pageData.paymentDetails.paybalance > 0)) ? (
                        <Box p={3}>
                            <Alert variant="outlined" severity="error">
                                {t('str_paymentBalanceIsInvalid')}
                            </Alert>
                        </Box>
                    ) : (pageData.paymentDetails && !pageData.paymentDetails.currency) ? (
                        <Box p={3}>
                            <Alert variant="outlined" severity="error">
                                {t('str_currencyIsInvalid')}
                            </Alert>
                        </Box>
                    ) : (pageData.paymentDetails && !pageData.paymentDetails.email) ? (
                        <Box p={3}>
                            <Alert variant="outlined" severity="error">
                                {t('str_emailIsInvalid')}
                            </Alert>
                        </Box>
                    ) : (
                        <Box p={3}>
                            {isLoading ? (
                                <div style={{ height:400, position: 'relative' }}>
                                    <LoadingSpinner size={40} style={{ position: 'absolute', top: '40%', left: '50%' }}/>
                                </div>
                            ): transactionStatus === TRANSACTION_STATUS.USE_PAY_FORM && redirectUrl ? (
                                <div>
                                    <ThreeDPayDialog open={transactionStatus === TRANSACTION_STATUS.USE_PAY_FORM && redirectUrl} iframeUrl={redirectUrl} isPayFrameLoad={isPayFrameLoad} setIsPayFrameLoad={(e)=> setIsPayFrameLoad(e)} />
                                </div>
                            ): transactionStatus === TRANSACTION_STATUS.SUCCESSFUL ? (
                                    <React.Fragment>
                                        <Alert severity="success">
                                            <AlertTitle>{t('str_successful')}</AlertTitle>
                                            {t('str_paymentTransactionSuccessful', {transid: transID || notAvailable, email: pageData.paymentDetails.email || notAvailable})}
                                        </Alert>
                                    </React.Fragment>
                                ) : transactionStatus === TRANSACTION_STATUS.ERROR  ? (
                                        <React.Fragment>
                                            {isSaveError ? (
                                                <React.Fragment>
                                                    <Alert severity="error" style={{marginBottom: 20}}>
                                                        <AlertTitle>{t('str_error')}</AlertTitle>
                                                        {errorMsg}
                                                    </Alert>
                                                </React.Fragment>
                                            ):(
                                                <React.Fragment>
                                                    <Alert severity="error" style={{marginBottom: 20}}>
                                                        <AlertTitle>{t('str_error')}</AlertTitle>
                                                        {t('str_paymentTransactionError')}<br/>
                                                        <strong>{t('str_detail')}:</strong> {errorMsg || ''}
                                                    </Alert>
                                                    <Button variant="outlined" color="primary" startIcon={<RefreshIcon />} onClick={()=> handlePayTryAgain()}>{t('str_tryAgain')}</Button>
                                                </React.Fragment>
                                            )}
                                        </React.Fragment>
                                    ) : null }
                            {(!isLoading && transactionStatus !== TRANSACTION_STATUS.ERROR && transactionStatus !== TRANSACTION_STATUS.SUCCESSFUL) && (
                                <Grid container direction="row" justify="center" alignItems="center" spacing={1}>
                                    <Grid item xs={12}>
                                        <PaymentForm
                                            isDisabled={isPayLoading}
                                            showCard={true}
                                            onChange={(e) => setCreditCardInfo(e)}
                                            isValid={(e) => setCreditCardIsValid(e)}
                                            setCcNumberFocus={(e)=> setCcNumberFocus(e)}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <InstallmentRates
                                            ccNumber={creditCardIsValid?.number || ''}
                                            payGid={gid}
                                            setIsLoading={(val)=> setIsInstLoading(val)}
                                            isLoading={isInstLoading}
                                            selectCcInstId={selectCcInstId}
                                            setSelectCcInstId={setSelectCcInstId}
                                            ccNumberFocus={ccNumberFocus}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box className={classes.textAlignRight}>
                                            <FrameCheckbox
                                                disabled={isPayLoading}
                                                value={payTerms}
                                                title="str_termsAndConditions"
                                                linkText="str_iAcceptLinkAndDesc"
                                                linkTextADesc="str_termsAndConditions"
                                                ifamePageUrl={GENERAL_SETTINGS.BASE_URL + `info/${locale || global.common.strDefShortLangCode}/${global.guestWeb.strPayTerms}?iframe=true`}
                                                isCheck={(e) => setPayTerms(e)}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} className={classes.textAlignRight}>
                                        <ProgressButton isLoading={isPayLoading}>
                                            <Button
                                                onClick={() => handlePayment()}
                                                classes={{ root: classes.payButton }}
                                                disabled={isPayLoading || isInstLoading}
                                                variant='contained'
                                                size='medium'
                                                color='primary'
                                                fullWidth={true}
                                            >
                                                {t('str_pay')}
                                            </Button>
                                        </ProgressButton>
                                    </Grid>
                                </Grid>
                            )}
                        </Box>
                    )}
                </Paper>
                <Grid container direction="row" justify="center" alignItems="center" spacing={3}>
                    <Grid item xs={12}>
                        <Box className={classes.bottomBanner} p={1}>
                            <img className={classes.bottomBannerImg} src={'imgs/epay-std-banner.png'}/>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </EpayLayout>
    )
}

export const getServerSideProps = async (ctx) => {
    const { query } = ctx
    const gid = await query.gid

    return {
        props: {
            gid: gid && gid.toLowerCase() || ""
        }
    }
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(EpaymentPage)
