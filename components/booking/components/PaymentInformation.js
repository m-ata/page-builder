import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { updateState } from 'state/actions'
import { makeStyles } from '@material-ui/core/styles'
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Grid,
} from '@material-ui/core'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormLabel from '@material-ui/core/FormLabel'
import { FileCopy } from '@material-ui/icons'
import InputAdornment from '@material-ui/core/InputAdornment'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import IconButton from '@material-ui/core/IconButton'
import useTranslation from 'lib/translations/hooks/useTranslation'
import PaymentForm from 'components/payment/credit-card/form'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Alert from '@material-ui/lab/Alert'
import { useSnackbar } from 'notistack'

const NON_ALPHANUM = /[^a-zA-Z0-9]/g,
    EVERY_FOUR_CHARS =/(.{4})(?!$)/g;

const electronicFormat = (iban) => {
    return iban.replace(NON_ALPHANUM, '').toUpperCase();
}

const ibanPrintFormat = (iban, separator) => {
    if (typeof separator == 'undefined'){
        separator = ' ';
    }
    return electronicFormat(iban).replace(EVERY_FOUR_CHARS, "$1" + separator);
}

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
    },
    copyButton: {
      visibility: 'hidden'
    },
    tableRowHover: {
        "&:hover $copyButton": {
            visibility: 'visible',
        }
    }
}))

const PaymentInformation = (props) => {
    const classes = useStyles()
    const { enqueueSnackbar } = useSnackbar()
    const { t } = useTranslation()
    const { updateState, state, className, customRadioButton, isDisabled } = props

    const handleChange = (event) => {
        const payType = state.hotelPaymentType.paymentypes.filter((item) => Number(item.id) === Number(event.target.value))[0]
        updateState('ibe', 'selectedPaymentType', payType)
        updateState('ibe', 'selectedPaymentTypeId', Number(event.target.value))
        updateState('ibe', 'selectedPaymentTypeMid', Number(payType.mid))
        updateState('ibe', 'selectedPaymentIbanId', null)
    }

    const handleCopyIban = (e, iban, ibanId) => {
        updateState('ibe', 'selectedPaymentIbanId', ibanId)
        enqueueSnackbar(t('str_ibanCopied'), { variant: 'success' })
        navigator.clipboard.writeText(iban)
    }

    const hasPayType = (id, filter) => {
        const payType = state.hotelPaymentType && state.hotelPaymentType.paymentypes.length > 0 && state.hotelPaymentType.paymentypes.filter((item) => item[filter])[0]
        return Boolean(payType && Number(id) === Number(payType.id))
    }

    return (
        <div className={classes.root}>
            <Grid container spacing={3}>
                {(state.hotelPaymentType.paymentypes && state.hotelPaymentType.paymentypes.length <= 3) ? (
                    <Grid item xs={12}>
                        <FormControl component="fieldset" required disabled={isDisabled}>
                            <FormLabel component="legend">{t('str_paymentOptions')}</FormLabel>
                            <RadioGroup aria-label="payment-options" name="payment-options" value={state.selectedPaymentTypeId} onChange={handleChange} row disabled={isDisabled}>
                                {state.hotelPaymentType.paymentypes.sort((a, b) => a.index - b.index).sort((a, b) => b.isdef - a.isdef).map((item, index) =>
                                    <FormControlLabel disabled={isDisabled} key={index} value={item.id} control={customRadioButton !== undefined ? customRadioButton : <Radio color="primary"/>} label={t(item.description)} />
                                )}
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                ): (state.hotelPaymentType.paymentypes && state.hotelPaymentType.paymentypes.length > 3) ? (
                    <Grid item xs={12} sm={6}>
                        <FormControl required fullWidth variant="outlined" className={classes.formControl} disabled={isDisabled}>
                            <InputLabel id="payment-options-label">{t('str_paymentOptions')}</InputLabel>
                            <Select
                                disabled={isDisabled}
                                className={className || null}
                                labelId="payment-options-label"
                                id="payment-options"
                                value={state.selectedPaymentTypeId}
                                onChange={handleChange}
                                label={t('str_paymentOptions')}
                            >
                                {state.hotelPaymentType.paymentypes && state.hotelPaymentType.paymentypes.sort((a, b) => a.index - b.index).sort((a, b) => b.isdef - a.isdef).map((item, index) =>
                                        <MenuItem key={index} value={item.id}>{t(item.description)}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                ): (<Grid item xs={12}>
                        <Alert className={className || null} variant="outlined" severity="info">
                            {t('str_noPaymentOptionAvailable')}
                        </Alert>
                    </Grid>
                )}
                {hasPayType(state.selectedPaymentTypeId, 'isccpay') && (
                    <Grid item xs={12}>
                        <Alert className={className || null} variant="outlined" severity="info">
                            {t('str_atTheNextStepYourCCInformationWillBeRequestedThreeDSecurePayment')}
                        </Alert>
                    </Grid>
                )}
                {hasPayType(state.selectedPaymentTypeId, 'iscash') && (
                    <Grid item xs={12}>
                        <Alert className={className || null} variant="outlined" severity="info">
                            {t('str_payAtHotelMsg')}
                        </Alert>
                    </Grid>
                )}
                {hasPayType(state.selectedPaymentTypeId, 'istransfer') && (
                    <Grid item xs={12}>
                        <TableContainer component={Paper}>
                            <Table className={classes.table} size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('str_bankName')}</TableCell>
                                        <TableCell>{t('str_branch')}</TableCell>
                                        <TableCell>{t('str_currency')}</TableCell>
                                        <TableCell>{t('str_bankIban')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {state.hotelPaymentType && state.hotelPaymentType && state.hotelPaymentType.bankiban ? state.hotelPaymentType.bankiban.filter(bankiban => bankiban.iban).map((row, i) => (
                                        <TableRow hover key={i} classes={{hover: classes.tableRowHover}}>
                                            <TableCell component="th" scope="row">{row.bankname}</TableCell>
                                            <TableCell>{row.bankbranch}</TableCell>
                                            <TableCell>{row.currencycode}</TableCell>
                                            <TableCell>
                                                <FormControl variant='outlined' size='small' style={{ width: '100%' }}>
                                                    <OutlinedInput
                                                        style={{ background: '#ffffff' }}
                                                        readOnly={true}
                                                        id='copy-iban'
                                                        value={row.iban && ibanPrintFormat(row.iban) || ""}
                                                        variant='outlined'
                                                        size='small'
                                                        endAdornment={
                                                            <InputAdornment position='end'>
                                                                <IconButton
                                                                    className={classes.copyButton}
                                                                    size='small'
                                                                    aria-label='copy-iban-button'
                                                                    onClick={(e) => handleCopyIban(e, row.iban, row.id)}
                                                                    onMouseDown={(e) => e.preventDefault()}
                                                                >
                                                                    <FileCopy />
                                                                </IconButton>
                                                            </InputAdornment>
                                                        }
                                                    />
                                                </FormControl>
                                            </TableCell>
                                        </TableRow>
                                    )): <Box p={3}> {t('str_noDefaultRecord')} </Box>}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                )}
                {hasPayType(state.selectedPaymentTypeId, 'ismailorder') && (
                    <Grid item xs={12}>
                        <PaymentForm
                            isDisabled={isDisabled}
                            showCard={true}
                            onChange={(e) => updateState('ibe', 'mailOrderInfo', e)}
                            isValid={(e) => { return; }}
                        />
                    </Grid>
                )}
            </Grid>
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

export default connect(mapStateToProps, mapDispatchToProps)(PaymentInformation)
