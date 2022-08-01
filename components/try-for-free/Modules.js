import axios from 'axios'
import React, { useEffect, useState, useContext } from 'react'
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Checkbox,
    Grid,
    InputAdornment,
    TextField,
    Typography,
} from '@material-ui/core'
import { TcTextField } from './components/fields'
import Skeleton from '@material-ui/lab/Skeleton'
import useTranslation from 'lib/translations/hooks/useTranslation'
import * as global from '@webcms-globals'
import { helper } from '@webcms-globals'
import Alert from '@material-ui/lab/Alert'
import { fieldOptions } from './style/theme'
import SpinEdit from '@webcms-ui/core/spin-edit'
import getSymbolFromCurrency from 'model/currency-symbol'
import CardActions from '@material-ui/core/CardActions'
import LoadingSpinner from '../LoadingSpinner'
import WebCmsGlobal from 'components/webcms-global'

const ModuleCardShadows = ({length = 1}) => {
    return (
        <React.Fragment>
            {Array.from({ length: length }).map((key, index) => {
                return (
                    <Grid item xs={12} key={index}>
                        <Card variant='outlined' style={{height: 165}}>
                            <CardContent>
                                <Grid container spacing={1} justify='space-between' alignItems='flex-start'>
                                    <Grid item xs={8}>
                                        <Typography variant='subtitle2' gutterBottom noWrap>
                                            <Skeleton animation='wave' height={15} width='100%' style={{ marginBottom: 6 }} />
                                        </Typography>
                                    </Grid>
                                    <Grid item></Grid>
                                    <Grid item xs={12}>
                                        <Typography variant='caption' display='block' align='justify' color='textSecondary'>
                                            <Skeleton animation='wave' height={15} width='100%' style={{ marginBottom: 6 }} />
                                            <Skeleton animation='wave' height={15} width='100%' style={{ marginBottom: 6 }} />
                                            <Skeleton animation='wave' height={15} width='100%' style={{ marginBottom: 6 }} />
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                )
            })}
        </React.Fragment>
    )
}

const ModuleCard = ({ id, isDemo, imageUrl, title, description, isPP, salePrice, priceCurr, targetRoom, isSelect, onSelect, onUpdate, removeSelect, disabled }) => {
    const { t } = useTranslation()
    const [amount, setAmount] = useState({value: 0})

    const getDescription = (str, useLength = 140, useShort = 140) => {
        if (str && str.length >= useLength) {
            return str.substring(0, useShort) + ' ...'
        }
        return str
    }

    const handleChange = (event) => {
        if(!disabled){
            if(event.target.checked){
                onSelect(id, isPP)
            }else{
                removeSelect(id)
            }
        }
    }

    const handleQty = (value, type) => {
        if(!disabled){
            if (type === "inc" && value > amount.value) {
                setAmount({ value: amount.value + 1})
            } else {
                setAmount({ value: amount.value - 1})
            }

            if(!isSelect(id) && type === "inc" && value === 1){
                onSelect(id, isPP)
            }else if((type === "inc" || type === "dec") && value >= 1){
                onUpdate(id, value)
            }else if(type === "dec" && value === 0){
                removeSelect(id)
            }
        }
    }

    return (
        <Card variant="outlined">
            <CardHeader
                avatar={<Avatar aria-label="recipe" src={imageUrl ? imageUrl : null}>{title.charAt(0)}</Avatar>}
                action={
                    <React.Fragment>
                        {isPP ? (
                            <Grid container spacing={1} justify="space-between" alignItems="center">
                                <Grid item>
                                    {!isDemo ?
                                        (<Box style={{ width: 114, padding: 5 }}>
                                            <TextField
                                                label={t('str_roomQty')}
                                                variant='outlined'
                                                size={fieldOptions.size}
                                                value={targetRoom}
                                                InputLabelProps={{ shrink: true }}
                                                InputProps={{
                                                    readOnly: true,
                                                }}
                                            />
                                        </Box>) : null}
                                </Grid>
                                <Grid item>
                                    <Checkbox
                                        style={{ padding: 0 }}
                                        disabled={disabled}
                                        onChange={handleChange}
                                        checked={isSelect(id)}
                                        inputProps={{ 'aria-label': 'primary checkbox' }}
                                    />
                                </Grid>
                            </Grid>
                        ) : <SpinEdit
                            label={t('str_pieces')}
                            fullWidth={true}
                            disabled={disabled}
                            style={{ width: 150, marginLeft: 'auto', padding: 5 }}
                            padding={0}
                            defaultValue={amount.value}
                            size='small'
                            onChange={(value, type) => handleQty(value, type)}
                        />}
                    </React.Fragment>
                }
                title={title}
            />
            <CardContent>
                <Typography variant="body2" color="textSecondary" component="p" align="justify">
                    {getDescription(description, 150, 150)}
                </Typography>
            </CardContent>
            {!isDemo ? (
                <CardActions disableSpacing>
                    <Box style={{ width: 115, padding: 5 }}>
                        <TextField
                            label={t('str_price')}
                            variant='outlined'
                            size={fieldOptions.size}
                            value={helper.formatPrice(salePrice)}
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                                readOnly: true,
                                endAdornment: (
                                    <InputAdornment position='start'>
                                        {getSymbolFromCurrency(priceCurr) || ''}
                                    </InputAdornment>
                                ),
                            }}
                            inputProps={{
                                style: { textAlign: 'right' },
                            }}
                        />
                    </Box>
                    <Box style={{ width: 145, padding: 5, marginLeft: 'auto' }}>
                        <TextField
                            label={t('str_totalPrice')}
                            variant='outlined'
                            size={fieldOptions.size}
                            value={helper.formatPrice((isPP && targetRoom || amount.value) * salePrice)}
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                                readOnly: true,
                                endAdornment: (
                                    <InputAdornment position='start'>
                                        {getSymbolFromCurrency(priceCurr) || ''}
                                    </InputAdornment>
                                ),
                            }}
                            inputProps={{
                                style: { textAlign: 'right' },
                            }}
                        />
                    </Box>
                </CardActions>
            ) : null}
        </Card>
    )
}

const propertyAddModule = ({propertyCode = false, transId = false, moduleId = false, qty = false, qtyId = null, registerType = false, currencyId = false, brand = false, market = false}) => {
    return axios({
        url: 'api/property/module/add',
        method: 'post',
        params: {
            propertyCode: propertyCode,
            transId: transId,
            moduleId: moduleId,
            registerType: registerType,
            qty: qty,
            currencyId: currencyId,
            brand: brand,
            market: market
        }
    }).then((response)=> {
        return response.data
    })
}

const propertyUpdModule = ({transId = false, lineGid = false, qty = false}) => {
    return axios({
        url: '/api/property/module/upd',
        method: 'post',
        params: {
            transId: transId,
            lineGid: lineGid,
            qty: qty
        }
    }).then((response)=> {
        return response.data
    })
}

const propertyDelModule = ({transId = false, lineGid = false}) => {
    return axios({
        url: '/api/property/module/del',
        method: 'post',
        params: {
            transId: transId,
            lineGid: lineGid
        }
    }).then((response)=> {
        return response.data
    })
}

const propertyConfirm = ({propertyId = false, propertyCode = false, propertyContact = false, propertyPhone = false, propertyEmail = false, transId = false, registerType = false, brand = false, lang}) => {
    return axios({
        url: '/api/property/confirm',
        method: 'post',
        params: {
            propertyId: propertyId,
            propertyCode: propertyCode,
            propertyContact: propertyContact,
            propertyPhone: propertyPhone,
            propertyEmail: propertyEmail,
            transId: transId,
            registerType: registerType,
            brand: brand,
            lang: lang
        }
    }).then((response)=> {
        return response.data
    })
}

const Modules = ({brand, market, classes, steps, nextStep, fieldOptions, propertyInfo, registerTypes, registerType, setPayableNow, setPaymentGid, setPaymentTransId, currencyInfo, setCurrencyInfo}) =>{
    const { t } = useTranslation()
    const { locale } = useContext(WebCmsGlobal)
    const [isLoading, setIsLoading] = useState(false)
    const [moduleListLoading, setModuleListLoading] = useState(false)
    const [transId, setTransId] = useState(false)
    const [selectionDisabled, setSelectionDisabled] = useState(false)
    const [moduleSelectionError, setModuleSelectionError] = useState(false)
    const [selectedModuleList, setSelectedModuleList] = useState([])
    const [moduleList, setModuleList] = useState([])
    const [totalPrice, setTotalPrice] = useState(0)

    useEffect(() => {
        let active = true
        if (active && moduleList.length === 0) {
            setModuleListLoading(true)
            axios({
                url: '/api/property/module/list',
                method: 'post',
                params: {
                    brand: brand,
                    market: market
                }
            }).then((moduleGroupResponse) => {
                if (active) {
                    if (moduleGroupResponse.status === 200) {
                        const moduleGroupData = moduleGroupResponse.data
                        if (moduleGroupData.success === true && moduleGroupData.data.length > 0) {
                            setCurrencyInfo(moduleGroupData.currencyInfo)
                            setModuleList(moduleGroupData)
                            setModuleListLoading(false)
                        } else {
                            setModuleList([])
                            setModuleListLoading(false)
                        }
                    } else {
                        setModuleList([])
                        setModuleListLoading(false)
                    }
                }
            })
        }

        return () => {
            setModuleListLoading(false)
        }

    }, [])

    const isSelected = (id) => {
        return selectedModuleList.findIndex(item => item.id === id) >= 0 || false
    }

    const handleOnSelect = async (id, isPP) =>{
        if(!selectionDisabled){
            if(moduleSelectionError){
                setModuleSelectionError(false)
            }

            setSelectionDisabled(true)
            const getModule = await propertyAddModule({
                propertyCode: propertyInfo.propertyCode,
                transId: transId,
                moduleId: id,
                qty: registerTypes.demo === registerType ? 1 : isPP ? propertyInfo.propertyTargetRoom : 1,
                currencyId: currencyInfo.id,
                brand: brand,
                market: market,
                registerType: registerType
            })

            if(getModule.success){
                setSelectionDisabled(false)
                setPaymentTransId(getModule.transid)
                setTransId(getModule.transid)
                setPaymentGid(getModule.transgid)
                setTotalPrice(getModule.nettotal)
                setPayableNow(getModule.nettotal)
                setSelectedModuleList([...selectedModuleList, { id: id, linegid: getModule.linegid }])
            }else {
                setSelectionDisabled(false)
            }
        }
    }

    const handleOnUpdate = async (id, qty) =>{
        if(!selectionDisabled){
            if (moduleSelectionError) {
                setModuleSelectionError(false)
            }

            const index = selectedModuleList.findIndex(item => item.id === id)
            if (index >= 0) {
                const moduleInfo = selectedModuleList[index]
                setSelectionDisabled(true)
                const getModule = await propertyUpdModule({
                    transId: transId,
                    lineGid: moduleInfo.linegid,
                    qty: qty
                })

                if (getModule.success) {
                    setSelectionDisabled(false)
                    setTotalPrice(getModule.nettotal)
                    setPayableNow(getModule.nettotal)
                } else {
                    setSelectionDisabled(false)
                }
            }
        }
    }

    const handleRemoveSelect = async (id) =>{
        if(!selectionDisabled) {
            setSelectionDisabled(true)
            const dataDelete = [...selectedModuleList]
            const index = selectedModuleList.findIndex(item => item.id === id)
            if (index >= 0) {
                const moduleInfo = selectedModuleList[index]
                const getModule = await propertyDelModule({
                    transId: transId,
                    lineGid: moduleInfo.linegid
                })

                if (getModule.success) {
                    setSelectionDisabled(false)
                    setTotalPrice(getModule.nettotal)
                    setPayableNow(getModule.nettotal)
                    dataDelete.splice(index, 1)
                    setSelectedModuleList([...dataDelete])
                } else {
                    setSelectionDisabled(false)
                }
            }
        }
    }

    const handleNext = async () => {
        if(!moduleListLoading && selectedModuleList.length > 0){
            if(registerTypes.demo === registerType){
                setIsLoading(true)
                const isDone = await propertyConfirm(
                    {
                        propertyId: propertyInfo.propertyId,
                        propertyCode: propertyInfo.propertyCode,
                        propertyContact: propertyInfo.propertyContact,
                        propertyPhone: propertyInfo.propertyPhone,
                        propertyEmail: propertyInfo.propertyEmail,
                        transId: transId,
                        registerType: registerType,
                        brand: brand,
                        lang: locale
                    }
                )

                if(isDone.success){
                    setIsLoading(false)
                    nextStep(steps.confirmation.index)
                }
            }else {
                setIsLoading(false)
                setModuleSelectionError(false)
                nextStep(steps.payment.index)
            }
        }else{
            setIsLoading(false)
            setModuleSelectionError(true)
        }
    }

    //Todo: Ay değerini ibeSettings den oku
    return (
        <Grid container spacing={2} justify='space-between'>
            {moduleSelectionError ? (
                <Grid item xs={12}>
                    <Alert severity="info">
                        {t('str_youMustSelectAModuleToContinue')}
                    </Alert>
                </Grid>
            ): null}
            <Grid item xs={12}>
                <Grid container spacing={2} justify='flex-start' style={{ height: 350, marginBottom: 5, overflowX: 'scroll', border: '1px solid rgb(226 232 240)', borderRadius: 4 }}>
                    {moduleListLoading ? (<ModuleCardShadows length={6} />)
                        : moduleList?.data?.length > 0 ? moduleList.data.sort((a, b) => a.orderno - b.orderno).map((module, index) => {
                            return (
                                <Grid item xs={12} key={index}>
                                    <ModuleCard
                                        id={module.id}
                                        title={module.title}
                                        description={module.description}
                                        salePrice={module.saleprice}
                                        priceCurr={module.pricecurr}
                                        imageUrl={module.imageurl}
                                        isPP={registerTypes.demo === registerType ? true : module.ispp}
                                        targetRoom={propertyInfo.propertyTargetRoom}
                                        disabled={isLoading || selectionDisabled}
                                        isSelect={isSelected}
                                        onSelect={handleOnSelect}
                                        onUpdate={handleOnUpdate}
                                        removeSelect={handleRemoveSelect}
                                        isDemo={registerTypes.demo === registerType}
                                    />
                                </Grid>
                            )
                        }) : (
                            <Box p={3}>
                                <Typography variant="body2" gutterBottom>
                                    {t('str_noModuleAvailable')}
                                </Typography>
                            </Box>
                        )}
                </Grid>
            </Grid>
            <Grid item xs={6} sm={3} style={{ textAlign: 'left' }}>
                {registerTypes.buynow === registerType ? (
                    <TcTextField
                        label={t('str_totalMonthly')}
                        variant={fieldOptions.variant}
                        fullWidth={fieldOptions.fullWidth}
                        size={fieldOptions.size}
                        value={global.helper.formatPrice(totalPrice)}
                        InputProps={{
                            readOnly: true,
                            endAdornment: (
                                <InputAdornment position="start">
                                    {currencyInfo?.code && getSymbolFromCurrency(currencyInfo?.code) || ''}
                                </InputAdornment>
                            ),
                        }}
                        inputProps={{
                            style: { textAlign: 'right' }
                        }}
                    />
                ): null}
            </Grid>
            <Grid item xs={6} sm={3} style={{ textAlign: 'left' }}>
                {registerTypes.buynow === registerType ? (
                    <TcTextField
                        label={t('str_totalAnnual')}
                        variant={fieldOptions.variant}
                        fullWidth={fieldOptions.fullWidth}
                        size={fieldOptions.size}
                        value={global.helper.formatPrice(totalPrice * 11)}
                        InputProps={{
                            readOnly: true,
                            endAdornment: (
                                <InputAdornment position="start">
                                    {currencyInfo?.code && getSymbolFromCurrency(currencyInfo?.code) || ''}
                                </InputAdornment>
                            ),
                        }}
                        inputProps={{
                            style: { textAlign: 'right' }
                        }}
                    />
                ): null}
            </Grid>
            <Grid item xs={12} sm={6} style={{ textAlign: 'right' }}>
                <Button
                    disabled={isLoading}
                    variant='contained'
                    size='large'
                    color='primary'
                    disableElevation onClick={() => handleNext()}
                    endIcon={isLoading ? <LoadingSpinner size={16}/> : null}
                >
                    {t('str_next')}
                </Button>
            </Grid>
        </Grid>
    )
}

export default Modules