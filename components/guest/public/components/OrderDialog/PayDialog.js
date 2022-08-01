import React, { useEffect, useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    AppBar,
    Tabs,
    Tab,
    Box,
    Button
} from '@material-ui/core'
import { Alert, AlertTitle } from '@material-ui/lab'
import PaymentIcon from '@material-ui/icons/Payment'
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom'
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet'
import { cyan } from '@material-ui/core/colors'
import useTranslation from 'lib/translations/hooks/useTranslation'
import PaymentForm from 'components/payment/credit-card/form'
import axios from 'axios'
import { LocaleContext } from 'lib/translations/context/LocaleContext'
import { useSnackbar } from 'notistack'
import LoadingSpinner from 'components/LoadingSpinner'
import RefreshIcon from '@material-ui/icons/Refresh'
import FrameCheckbox from '@webcms-ui/core/frame-checkbox'
import * as global from '@webcms-globals'
import WebCmsGlobal from 'components/webcms-global'
import { useSelector } from 'react-redux'

const TRANSACTION_STATUS = {
    USE_PAY_FORM:0,
    SUCCESSFUL:1,
    ERROR:2
}

const SAVE_ERROR_TYPE = {
    SESSION_TIMEOUT: 'payment_transaction_completed_but_not_posted',
    PAYMENT_FAIL: 'payment_fail'
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`payOptions-auto-tabpanel-${index}`}
            aria-labelledby={`payOptions-auto-tab-${index}`}
            {...other}
        >
            {value === index ? (
                <React.Fragment>
                    {children}
                </React.Fragment>
            ): null}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

function a11yProps(index) {
    return {
        id: `scrollable-auto-tab-${index}`,
        'aria-controls': `scrollable-auto-tabpanel-${index}`,
    };
}

const useStyles = makeStyles({
    avatar: {
        backgroundColor: cyan[100],
        color: cyan[600],
    },
    postToRoomAlert: {
        marginTop: 20,
        marginBottom: 20
    }
})

function OrderPaymentCheck(props) {
    const classes = useStyles()
        , { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
        , { open, transGid, transId, onFinish } = props
        , { t } = useTranslation()
        , { locale } = useContext(LocaleContext)
        , { enqueueSnackbar } = useSnackbar()

    const [value, setValue] = useState(0)
        , [isLoadingDialog, setIsLoadingDialog] = useState(true)
        , [creditCardInfo, setCreditCardInfo] = useState(false)
        , [creditCardIsValid, setCreditCardIsValid] = useState(false)
        , [, setCcNumberFocus] = useState(false)
        , [isLoading, setIsLoading] = useState(false)
        , [redirectUrl, setRedirectUrl] = useState(false)
        , [transactionStatus, setTransactionStatus] = useState(0)
        , [transactionId, setTransactionId] = useState(false)
        , [errorMsg, setErrorMsg] = useState(false)
        , [isSaveError, setIsSaveError] = useState(false)
        , [isPayLoading, setIsPayLoading] = useState(false)
        , [payTerms, setPayTerms] = useState(false)
        , paymentTypeCode = {
            PAY_CC: 0,
            PAY_ROOM: 1,
            PAY_CASH: 2
        }
        , [paymentTypeList, setPaymentTypeList] = useState([])

    const infoLogin = useSelector((state) => state?.orest?.currentUser?.loginfo || false)
        , clientReservation = useSelector((state) => state?.formReducer?.guest?.clientReservation || false)
        , isLogin = !!infoLogin

    useEffect(() => {
        async function onLoadPayDialog(open) {
            if (open) {
                const vPosIsAvailable = await checkVPos()
                let usePayList = []
                if (isLogin && vPosIsAvailable) {
                    usePayList.push({
                        id: paymentTypeCode.PAY_CC,
                        label: 'str_payAtCC',
                        icon: <PaymentIcon />,
                        isActive: true,
                    })
                }

                if (isLogin && clientReservation?.roomno && clientReservation?.status === 'I') {
                    usePayList.push({
                        id: paymentTypeCode.PAY_ROOM,
                        label: 'str_postToRoom',
                        icon: <MeetingRoomIcon />,
                        isActive: true ,
                    })
                }

                usePayList.push({
                    id: paymentTypeCode.PAY_CASH,
                    label: 'str_cashPayment',
                    icon: <AccountBalanceWalletIcon />,
                    isActive: true ,
                })

                setPaymentTypeList(usePayList)
                if (!(isLogin && clientReservation?.roomno) && clientReservation?.status !== 'I') {
                    onFinish()
                    setIsLoadingDialog(true)
                } else {
                    if(usePayList && usePayList.length > 0){
                        const paymentTypeId = usePayList.filter(paymentType => paymentType.isActive)[0]?.id
                        if(usePayList.length === 1 && paymentTypeId === paymentTypeCode.PAY_CASH){
                            onFinish()
                            setIsLoadingDialog(true)
                        }else{
                            setValue(paymentTypeId)
                            setIsLoadingDialog(false)
                        }
                    }else{
                        onFinish()
                        setIsLoadingDialog(true)
                    }
                }
            }
        }

        onLoadPayDialog(open).then(() => {
            return true
        })

    }, [open])

    useEffect(() => {
        if (redirectUrl) {
            window.addEventListener('message', paymentSaveListener, true)
        }
    }, [redirectUrl])

    const checkVPos = () => {
        return axios({
            url: 'api/ors/payment/check/vpos',
            method: 'post',
        }).then((responseCheckVPos) => {
            return !!responseCheckVPos.data.success;
        }).catch(() => {
            return false
        })
    }

    const savePaymentNote = () => {
        return axios({
            url: 'api/hotel/posmain/pay/save',
            method: 'post',
            params: {
                refgid: transGid,
                refpay: value
            }
        }).then(() => {
            return true
        }).catch(() => {
            return false
        })
    }

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
                    gid: transGid,
                    refno: transId,
                    reftype: 'POSMAIN',
                },
            }).then(async (responsePaymentSave) => {
                if (responsePaymentSave.data.success) {
                    if (responsePaymentSave.data.processMsg === SAVE_ERROR_TYPE.PAYMENT_FAIL) {
                        setTransactionStatus(TRANSACTION_STATUS.ERROR)
                        setErrorMsg(response.errormsg)
                        setIsLoading(false)
                    } else {
                        await savePaymentNote()
                        setTransactionStatus(TRANSACTION_STATUS.SUCCESSFUL)
                        setTransactionId(response.orderid)
                        setIsLoading(false)
                        onFinish()
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

    const handlePayment = async () => {
        if(value === paymentTypeCode.PAY_CC){
            if(creditCardIsValid.isError || !creditCardIsValid.isValid){
                enqueueSnackbar(t('str_pleaseCheckYourCardInformation'), { variant: 'warning' })
            }else if(!payTerms){
                enqueueSnackbar(t('str_pleaseAcceptTheTermsAndConditions'), { variant: 'warning' })
            }else{
                setIsPayLoading(true)
                let postData = {
                    cardOwner: creditCardInfo.cardOwner,
                    cardNumber: creditCardInfo.cardNumber.replace(/\\s/g, '').replace(/ /g, ''),
                    cardExpiry: creditCardInfo.cardExpiry,
                    cardCvc: creditCardInfo.cardCvc
                }

                return axios({
                    url: 'api/ors/payment/do',
                    method: 'post',
                    timeout: 1000 * 60, // Wait for 60 sec.
                    params: {
                        gid: transGid
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
                        setIsPayLoading(false)
                        return false
                    }
                }).catch(() => {
                    setTransactionStatus(TRANSACTION_STATUS.ERROR)
                    setErrorMsg(t('str_checkCCorPayInfoError'))
                    setIsPayLoading(false)
                    return false
                })
            }
        }else {
            await savePaymentNote()
            onFinish()
        }
    }

    const handlePayTryAgain = () => {
        setIsLoading(true)
        setTimeout(()=> {
            setIsLoading(false)
            setErrorMsg(false)
            setIsPayLoading(false)
            setRedirectUrl(false)
            setCreditCardInfo(false)
            setCreditCardIsValid(false)
            setCcNumberFocus(false)
            setTransactionStatus(0)
        }, 1000)
    }

    const handleChange = (event, newValue) => {
        if(!isPayLoading && !(transactionStatus === TRANSACTION_STATUS.USE_PAY_FORM && redirectUrl))
            setValue(newValue)
    }

    return (
        <Dialog
            open={open}
            onClose={onFinish}
            disableBackdropClick
            disableEnforceFocus
            disableEscapeKeyDown
            aria-labelledby='paymentOptions-dialog-title'
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle id="paymentOptions-dialog-title" onClose={onFinish}>
                {t('str_paymentOptions')}
            </DialogTitle>
            <DialogContent dividers>
                {isLoadingDialog ? (
                    <LoadingSpinner size={40} />
                ): (
                    <React.Fragment>
                        <AppBar position="static" color="default">
                            <Tabs
                                value={value}
                                onChange={handleChange}
                                variant="fullWidth"
                                indicatorColor="primary"
                                textColor="primary"
                            >
                                {paymentTypeList && paymentTypeList.length > 0 && paymentTypeList.filter(paymentType => paymentType.isActive).map((paymentType, paymentTypeKey) => {
                                    return (
                                        <Tab
                                            key={paymentTypeKey}
                                            icon={paymentType.icon}
                                            label={t(paymentType.label)}
                                            {...a11yProps(paymentType.id)}
                                            value={paymentType.id}
                                            disabled={isPayLoading || (transactionStatus === TRANSACTION_STATUS.USE_PAY_FORM && redirectUrl)}
                                        />
                                    )
                                })}
                            </Tabs>
                        </AppBar>
                        <TabPanel value={value} index={paymentTypeCode.PAY_CC}>
                            <Box p={1} style={{paddingTop: 20}}>
                                {(isLoading || isPayLoading) ? (
                                    <div style={{ height: 400, position: 'relative' }}>
                                        <LoadingSpinner size={40} style={{ position: 'absolute', top: '40%', left: '50%' }} />
                                    </div>
                                ) : transactionStatus === TRANSACTION_STATUS.USE_PAY_FORM && redirectUrl ? (
                                    <div>
                                        <iframe
                                            allowpaymentrequest='true'
                                            target='self'
                                            src={redirectUrl}
                                            style={{
                                                width: '100%',
                                                minHeight: '400px',
                                                height: '100%',
                                                border: '0px',
                                                display: 'block',
                                            }}
                                        />
                                    </div>
                                ) : transactionStatus === TRANSACTION_STATUS.ERROR ? (
                                    <React.Fragment>
                                        {isSaveError ? (
                                            <React.Fragment>
                                                <Alert severity='error' style={{ marginBottom: 20 }}>
                                                    <AlertTitle>{t('str_error')}</AlertTitle>
                                                    {errorMsg}
                                                </Alert>
                                                <Button variant='outlined' color='primary' startIcon={<RefreshIcon />} onClick={() => handlePayTryAgain()}>{t('str_tryAgain')}</Button>
                                            </React.Fragment>
                                        ) : (
                                            <React.Fragment>
                                                <Alert severity='error' style={{ marginBottom: 20 }}>
                                                    {t('str_paymentTransactionError')}<br />
                                                    <strong>{t('str_detail')}:</strong> {errorMsg || ''}
                                                </Alert>
                                                <Button variant='outlined' color='primary' startIcon={<RefreshIcon />} onClick={() => handlePayTryAgain()}>{t('str_tryAgain')}</Button>
                                            </React.Fragment>
                                        )}
                                    </React.Fragment>
                                ) : (
                                    <React.Fragment>
                                        <PaymentForm
                                            isDisabled={isPayLoading}
                                            showCard={true}
                                            onChange={(e) => setCreditCardInfo(e)}
                                            isValid={(e) => setCreditCardIsValid(e)}
                                            fieldVariant="filled"
                                            fieldSize="small"
                                            customInputProps={{ disableUnderline: true }}
                                            setCcNumberFocus={(e)=> setCcNumberFocus(e)}
                                        />
                                        <FrameCheckbox
                                            disabled={isPayLoading}
                                            value={payTerms}
                                            title="str_termsAndConditions"
                                            linkText="str_iAcceptLinkAndDesc"
                                            linkTextADesc="str_termsAndConditions"
                                            ifamePageUrl={GENERAL_SETTINGS.BASE_URL + `info/${locale || global.common.strDefShortLangCode}/${global.guestWeb.strPayTerms}?iframe=true`}
                                            isCheck={(e) => setPayTerms(e)}
                                        />
                                    </React.Fragment>
                                )}
                            </Box>
                        </TabPanel>
                        <TabPanel value={value} index={paymentTypeCode.PAY_ROOM}>
                            <Alert variant="outlined" severity="info" className={classes.postToRoomAlert}>
                                <AlertTitle>{t('str_info')}</AlertTitle>
                                {t('str_youCanPayWhenYourOrdersArriveInTheRoom')}
                            </Alert>
                        </TabPanel>
                        <TabPanel value={value} index={paymentTypeCode.PAY_CASH}>
                            <Alert variant="outlined" severity="info" className={classes.postToRoomAlert}>
                                <AlertTitle>{t('str_info')}</AlertTitle>
                                {t('str_youCanPayInCashAfterOrdering')}
                            </Alert>
                        </TabPanel>
                    </React.Fragment>
                )}
            </DialogContent>
            {!isLoadingDialog ? (
                <DialogActions>
                    <Button disabled={value === paymentTypeCode.PAY_CC && (isPayLoading || (transactionStatus === TRANSACTION_STATUS.USE_PAY_FORM && redirectUrl))} onClick={() => handlePayment()} color="primary">
                        {t(value === 0 ? 'str_pay': 'str_done')}
                    </Button>
                </DialogActions>
            ): null}
        </Dialog>
    )
}

OrderPaymentCheck.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    selectedValue: PropTypes.string.isRequired,
    transGid: PropTypes.string.isRequired,
    transId: PropTypes.string.isRequired
}

export default OrderPaymentCheck