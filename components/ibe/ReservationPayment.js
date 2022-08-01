import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { connect, useSelector } from 'react-redux'
import { updateState } from 'state/actions'
import { makeStyles } from '@material-ui/core/styles'
import {
    AppBar,
    Box,
    Button,
    CircularProgress,
    Icon,
    Paper,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Typography,
} from '@material-ui/core'

import { FileCopy } from '@material-ui/icons'
import useTranslation from 'lib/translations/hooks/useTranslation'
import useNotifications from 'model/notification/useNotifications'
import WebCmsGlobal from 'components/webcms-global'
import PaymentForm from '../payment/credit-card/form'

function TabPanel(props) {
    const { children, value, index, ...other } = props

    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`scrollable-force-tabpanel-${index}`}
            aria-labelledby={`scrollable-force-tab-${index}`}
            {...other}
        >
            {value === index && <Box p={3}>{children}</Box>}
        </Typography>
    )
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
}

function a11yProps(index) {
    return {
        id: `scrollable-force-tab-${index}`,
        'aria-controls': `scrollable-force-tabpanel-${index}`,
    }
}

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
}))

const ReservationPayment = (props) => {
    const classes = useStyles()
    const [value, setValue] = useState(0)
    const { showSuccess, showError } = useNotifications()
    const { t } = useTranslation()
    const { updateState, state, isCcPay, ccInfo, ccValid } = props
    const [creditCardInfo, setCreditCardInfo] = useState(false)
    const [creditCardIsValid, setCreditCardIsValid] = useState(false)


    const [payTypeLoading, setPayTypeLoading] = useState(false)
    const { GENERAL_SETTINGS, locale } = useContext(WebCmsGlobal)

    const handleChange = (event, newValue) => {
        setValue(newValue)
        const paytypeid = state.paymentMethods[newValue].paytypeid
        const paytypecode = state.paymentMethods[newValue].paytype

        if(paytypecode === "str_payAtCC"){
            isCcPay(true)
        }else{
            isCcPay(false)
        }

        updateState('ibe', 'paytypeid', paytypeid)
    }

    const handleCopyIban = (e, iban) => {
        navigator.clipboard.writeText(iban)
        showSuccess(t('str_ibanCopied'))
    }

    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)

    let clientParams = {}
    clientParams.hotelrefno = loginfo && loginfo.hotelrefno || GENERAL_SETTINGS.HOTELREFNO

    if(loginfo && loginfo.hotelgidstr){
        clientParams.hoteltoken = loginfo && loginfo.hotelgidstr
    }

    useEffect(() => {
        let active = true
        if (active) {
            if (!state.paymentMethods.length > 0) {
                setPayTypeLoading(true)
                axios({
                    url: GENERAL_SETTINGS.BASE_URL + 'api/ors/paytype',
                    method: 'post',
                    params: clientParams,
                }).then(async (hotelPayTypeInfo) => {
                    if (active) {
                        const hotelPayTypeData = hotelPayTypeInfo.data
                        if (hotelPayTypeData.success && hotelPayTypeData.paytypes.length > 0) {
                            setPayTypeLoading(false)
                            updateState('ibe', 'paymentMethods', hotelPayTypeData.paytypes)
                            if (hotelPayTypeData.ibans.length > 0) {
                                updateState('ibe', 'bankTransfer', hotelPayTypeData.ibans)
                            }

                            let paytypes = await hotelPayTypeData.paytypes.sort((a, b) => a.orderno - b.orderno)
                            updateState('ibe', 'paytypeid', paytypes[0].paytypeid)

                            if(paytypes[0].paytype === "str_payAtCC"){
                                isCcPay(true)
                            }else{
                                isCcPay(false)
                            }

                        } else {
                            setPayTypeLoading(null)
                        }
                    }
                })
            }
        }

        return () => {
            active = false
        }
    }, [])

    useEffect(() => {

        ccInfo(creditCardInfo)
        ccValid(creditCardIsValid)

    }, [creditCardInfo, creditCardIsValid])

    if (payTypeLoading) {
        return <CircularProgress />
    }

    if (payTypeLoading === null) {
        return t('str_noPaymentManagement')
    }

    return (
        <div className={classes.root}>
            <AppBar position="static" color="default">
                <Tabs
                    value={value}
                    onChange={handleChange}
                    variant="fullWidth"
                    scrollButtons="auto"
                    indicatorColor="primary"
                    textColor="primary"
                    aria-label="scrollable force tabs"
                    centered
                >
                    {state.paymentMethods.length > 0 &&
                        state.paymentMethods
                            .sort((a, b) => a.orderno - b.orderno)
                            .map((paymentType, index) => (
                                <Tab
                                    key={index}
                                    label={t(paymentType.paytype)}
                                    icon={<Icon>{paymentType.iconname}</Icon>}
                                    {...a11yProps(paymentType.orderno)}
                                />
                            ))}
                </Tabs>
            </AppBar>
            {state.paymentMethods.length > 0 &&
                state.paymentMethods
                    .sort((a, b) => a.orderno - b.orderno)
                    .map((paymentType, index) => (
                        <TabPanel key={index} value={value} index={index} style={{ padding: 0 }}>
                            {paymentType.paytype === 'str_payTransfer' && (
                                <TableContainer component={Paper}>
                                    <Table className={classes.table} size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>{t('str_bankName')}</TableCell>
                                                <TableCell>{t('str_bankBranch')}</TableCell>
                                                <TableCell>{t('str_bankCurrency')}</TableCell>
                                                <TableCell>{t('' + 'str_accountNumber')}</TableCell>
                                                <TableCell>{t('str_bankIban')}</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {state.bankTransfer.map((row, i) => (
                                                <TableRow key={i}>
                                                    <TableCell component="th" scope="row">
                                                        {row.bankname}
                                                    </TableCell>
                                                    <TableCell>{row.bankbranch}</TableCell>
                                                    <TableCell>{row.currencycode}</TableCell>
                                                    <TableCell>{row.accountno}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            color="primary"
                                                            className={classes.button}
                                                            onClick={(e) => handleCopyIban(e, row.iban)}
                                                            startIcon={<FileCopy />}
                                                        >
                                                            {t('str_copyIban')}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}

                            {paymentType.paytype === 'str_payAtCC' && (
                                <React.Fragment>
                                    <Box p={1}>
                                        <PaymentForm
                                            showCard={false}
                                            onChange={(e) => setCreditCardInfo(e)}
                                            isValid={(e) => setCreditCardIsValid(e)}
                                        />
                                    </Box>
                                </React.Fragment>
                            )}

                            {paymentType.paytype === 'str_payAtHotel' && (
                                <Typography variant="subtitle1" gutterBottom>
                                    {t('str_payAtHotelMsg')}
                                </Typography>
                            )}
                        </TabPanel>
                    ))}
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.ibe,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ReservationPayment)
