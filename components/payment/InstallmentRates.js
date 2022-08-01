//React And Redux
import React, { useEffect, useState } from 'react'
//Library
import axios from 'axios'
//Material-Ui
import { makeStyles } from '@material-ui/core/styles'
import {
    Grid,
    Typography,
    Card,
    CardContent,
    Collapse
} from '@material-ui/core'
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked'
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline'
import clsx from 'clsx'
import useTranslation from 'lib/translations/hooks/useTranslation'
import getSymbolFromCurrency from 'model/currency-symbol'

const installmentRatesStyles = makeStyles(() => ({
    instCardTitle: {
        marginTop: 20,
        marginBottom: 14,
        borderBottom: '1px solid #e4e4e4',
        paddingBottom: 5,
        fontWeight: 500,
    },
    instCard: {
        position: 'relative',
    },
    instCardContent: {
        cursor: 'pointer',
        padding: '10px!important',
        paddingLeft: '0px!important',
        paddingRight: '0px!important',
    },
    instAmountTitle: {
        fontSize: 12,
        lineHeight: 1,
        marginTop: 5,
    },
    instAmount: {
        fontSize: 14,
        marginBottom: 5,
    },
    instTotalAmountTitle: {
        fontSize: 12,
        lineHeight: 1,
        marginTop: 10,
    },
    instTotalAmount: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    instActive: {
        borderColor: '#8bc34a',
        background: '#e9f3e9',
    },
    instRadioBox: {
        top: -2,
        right: 1,
        position: 'absolute',
    },
    instRadioUndone: {
        fontSize: '1rem',
        color: '#e0e0e0',
    },
    instRadioDone: {
        fontSize: '1rem',
        color: '#8bc34a',
    },
}))

const InstallmentRates = ({ ccNumber, payGid, selectCcInstId, setSelectCcInstId, setIsLoading, isLoading, ccNumberFocus }) => {
    const classes = installmentRatesStyles()
        , [installmentInformation, setInstallmentInformation] = useState(false)
        , [ccNumberMemorize, setCcNumberMemorize] = useState(false)
        , [showInstallment, setShowInstallment] = useState(false)
        , ccNumberFormat = ccNumber && ccNumber.replace(/ /g, '') || ''
        , { t } = useTranslation()

    useEffect(() => {
        if ((!isLoading && !ccNumberFocus && payGid && ccNumberFormat && ccNumberFormat.length >= 15) && (!ccNumberMemorize || ccNumberMemorize && String(ccNumberMemorize) !== String(ccNumber))) {
            async function fetchPaymentInstData() {
                setIsLoading(true)
                setInstallmentInformation(false)
                await axios({
                    url: 'api/payment/installment',
                    method: 'post',
                    params: {
                        ccno: ccNumberFormat,
                        gid: payGid,
                    },
                }).then((response) => {
                    if (response?.data?.installmentInformation && response?.data?.installmentInformation.length > 0) {
                        setCcNumberMemorize(ccNumberFormat)
                        setSelectCcInstId(response.data.installmentInformation[0].ccinstid)
                        setInstallmentInformation(response.data.installmentInformation)
                        if(response.data.installmentInformation.length === 1 && response.data.installmentInformation[0].ccinstid === 0){
                            setShowInstallment(false)
                        }else{
                            setShowInstallment(true)
                        }
                    } else {
                        setCcNumberMemorize(false)
                        setInstallmentInformation(false)
                    }
                })
            }

            fetchPaymentInstData().then(() =>
                setIsLoading(false),
            )

        } else if (!isLoading && ccNumberFocus && payGid && ccNumberFormat && ccNumberFormat.length < 15) {
            setCcNumberMemorize(false)
            setInstallmentInformation(false)
        } else if (payGid && ((ccNumberFormat && ccNumberFormat.length === 0) || ccNumberFormat === '')) {
            setCcNumberMemorize(false)
            setInstallmentInformation(false)
        }

    }, [ccNumber, ccNumberFocus])

    if(!showInstallment){
        return null
    }

    return (
        <Collapse in={installmentInformation && installmentInformation.length > 0}>
            <React.Fragment>
                <Typography className={classes.instCardTitle} variant='body1' component='p'>
                    {t('str_installmentOptions')}
                </Typography>
                <Grid
                    container
                    direction='row'
                    justify='center'
                    alignItems='center'
                    spacing={1}
                >
                    {installmentInformation && installmentInformation.length > 0 && installmentInformation.map((instInfo, instIndex) => {
                        return (
                            <Grid item xs={3} sm={2} key={instIndex}>
                                <Card variant='outlined' onClick={isLoading ? void (0) : () => setSelectCcInstId(instInfo.ccinstid)} className={clsx(classes.instCard, { [classes.instActive]: instInfo.ccinstid === selectCcInstId })}>
                                    <CardContent className={classes.instCardContent}>
                                        <Typography className={classes.instAmountTitle} color='textSecondary' align='center'>
                                            {instInfo.instcount === 0 ? t('str_paidInFull') : `${instInfo.instcount} ${t('str_instalment')}`}
                                        </Typography>
                                        <Typography className={classes.instAmount} variant='body1' component='p' align='center'>
                                            {instInfo.instamountfrt} {getSymbolFromCurrency(instInfo.currency)}
                                        </Typography>
                                        <Typography className={classes.instTotalAmountTitle} color='textSecondary' align='center'>
                                            {t('str_total')}
                                        </Typography>
                                        <Typography className={classes.instTotalAmount} variant='body1' component='p' align='center'>
                                            {instInfo.totalamountfrt} {getSymbolFromCurrency(instInfo.currency)}
                                        </Typography>
                                        <span className={classes.instRadioBox}>
                                           {instInfo.ccinstid === selectCcInstId ?
                                               <CheckCircleOutlineIcon className={classes.instRadioDone} fontSize='small' /> :
                                               <RadioButtonUncheckedIcon className={classes.instRadioUndone} fontSize='small' />
                                           }
                                         </span>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )
                    })}
                </Grid>
            </React.Fragment>
        </Collapse>
    )

}

export default InstallmentRates