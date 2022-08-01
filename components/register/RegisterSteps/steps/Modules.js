import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { connect } from 'react-redux'
import { deleteFromState, pushToState, setToState, updateState } from 'state/actions'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core'
import { useRouter } from 'next/router'
import Grid from '@material-ui/core/Grid'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import Checkbox from '@material-ui/core/Checkbox'
import WebCmsGlobal from 'components/webcms-global'
import Paper from '@material-ui/core/Paper'
import IconButton from '@material-ui/core/IconButton'
import AddCircleOutlineRounded from '@material-ui/icons/AddCircleOutlineRounded'
import RemoveCircleOutlineRounded from '@material-ui/icons/RemoveCircleOutlineRounded'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import Divider from '@material-ui/core/Divider'
import Input from '@material-ui/core/Input'
import InputAdornment from '@material-ui/core/InputAdornment'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Container from '@material-ui/core/Container'
import LoadingSpinner from 'components/LoadingSpinner'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { jsonGroupBy } from 'model/orest/constants'
import CardSlider from '../../../../@webcms-ui/core/card-slider'
import { NULL } from '../../../../model/globals'

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        maxWidth: '100%',
        backgroundColor: theme.palette.background.paper,
        position: 'relative',
        overflow: 'auto',
        maxHeight: 465,
    },
    listSection: {
        backgroundColor: 'inherit',
    },
    ul: {
        backgroundColor: 'inherit',
        padding: 0,
    },
    groupHeader: {
        padding: 0,
    },
    groupCheckBox: {
        padding: 3,
    },
    list: {
        width: '100%',
        padding: 0,
    },
    listItem: {
        padding: '0 15px',
    },
    listItemDetailPanel: {
        width: '100%',
        maxWidth: '100%',
        display: 'inline-block',
    },
    listCardHeader: {
        padding: 0,
    },
    listItemTextSecondarySpan: {
        width: '70%',
        display: 'block',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    listItemQtyInput: {
        width: '100px',
    },
    itemCheckBox: {
        paddingTop: 7,
    },
    qtyButtons: {
        paddingTop: 5,
        marginLeft: 'auto',
    },
    discountOptions: {
        padding: theme.spacing(1),
        marginLeft: 'auto',
        maxWidth: 500,
        marginBottom: 20,
    },
    orderSummary: {
        padding: theme.spacing(1),
        marginLeft: 'auto',
        maxWidth: 500,
    },
    infoBoxHeader: {
        background: '#e2e2e2',
        padding: 12,
        paddingBottom: 10,
        fontWeight: 500,
        borderRadius: 4,
        color: '#686868',
    },
    formControl: {
        marginLeft: 20,
    },
    secMaxWidth: {
        maxWidth: '75%',
    },
    selectYourProducts: {
        [theme.breakpoints.down('sm')]: {
            marginTop: 50,
            fontSize: '0.7rem',
        },
    },
}))

const Modules = (props) => {
    const classes = useStyles()
    const { state, setToState, updateState } = props
    const router = useRouter()
    const { t } = useTranslation()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const [useModuleCount, setUseModuleCount] = useState(null)
    const [isModuleList, setIsModuleList] = useState(true)
    const [isDiscountList, setIsDiscountList] = useState(true)
    const [currencyCode, setCurrencyCode] = useState('USD')
    const brandName = router.query.brand
    const DEMO = 'demo'
    const DEF_MIN_ROOM_COUNT_AMONRA = 30
    const DEF_MIN_ROOM_COUNT_OTELLO = 98
    const DEF_MIN_ROOM_COUNT = brandName === 'amonra' ? DEF_MIN_ROOM_COUNT_AMONRA : DEF_MIN_ROOM_COUNT_OTELLO
    const MIN_ROOM_COUNT =
        state.basics.agency.targetroom >= DEF_MIN_ROOM_COUNT ? state.basics.agency.targetroom : DEF_MIN_ROOM_COUNT

    useEffect(() => {
        let active = true
        if (active) {
            if (!state.moduleGroupList.length > 0) {
                setIsModuleList(true)
                let params = {}
                if (brandName) {
                    params.brand = brandName
                }
                axios({
                    url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/self-register/products/view',
                    method: 'post',
                    params,
                }).then((moduleGroupResponse) => {
                    if (active) {
                        if (moduleGroupResponse.status === 200) {
                            const moduleGroupData = moduleGroupResponse.data
                            if (moduleGroupData.success === true && moduleGroupData.data.length > 0) {
                                setToState(
                                    'registerStepper',
                                    ['moduleGroupList'],
                                    jsonGroupBy(moduleGroupData.data, 'spgroupdesc')
                                )
                                setCurrencyCode(moduleGroupData.currency)
                                setIsModuleList(false)
                            } else {
                                setIsModuleList(null)
                            }
                        } else {
                            setIsModuleList(null)
                        }
                    }
                })
            } else {
                setIsModuleList(false)
            }

            if (!state.salesDiscounts.length > 0 && state.moduleUseType !== DEMO) {
                setIsDiscountList(true)
                axios({
                    url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/self-register/products/disc',
                    method: 'post',
                }).then((salesDiscountResponse) => {
                    if (active) {
                        if (salesDiscountResponse.status === 200) {
                            const salesDiscountData = salesDiscountResponse.data
                            setToState('registerStepper', ['salesDiscounts'], salesDiscountData.data)
                            setIsDiscountList(false)
                        } else {
                            setIsDiscountList(null)
                        }
                    }
                })
            } else {
                setIsDiscountList(false)
            }
        }
        return () => {
            active = false
        }
    }, [])

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
    })

    const discountCheck = (ischecked, discountIndex) => {
        let moduleGroupList = state.moduleGroupList
        let salesDiscounts = state.salesDiscounts
        let checkStatus = false

        if (!ischecked) {
            checkStatus = true
        }

        salesDiscounts.map((discount, discountInd) => {
            if (discountIndex === discountInd) {
                salesDiscounts[discountInd].ischecked = checkStatus
            } else {
                salesDiscounts[discountInd].ischecked = false
            }
        })

        updateState('registerStepper', 'salesDiscounts', salesDiscounts)
        priceCal(moduleGroupList)
    }

    const productCheck = (isCheck, groupName, productIndex) => {
        let moduleGroupList = state.moduleGroupList
        let checkStatus = false
        let amount = 0

        if (isCheck === false) {
            checkStatus = true
            amount = 1
        }

        if (checkStatus && moduleGroupList[groupName][productIndex].ispp === true) {
            amount = MIN_ROOM_COUNT
        } else if (!checkStatus && moduleGroupList[groupName][productIndex].ispp === true) {
            amount = 0
        }

        moduleGroupList[groupName][productIndex].qtyamount = amount
        moduleGroupList[groupName][productIndex].ischecked = checkStatus
        updateState('registerStepper', 'moduleGroupList', moduleGroupList)
        priceCal(moduleGroupList)
    }

    const productAddQty = (oldValue, groupName, productIndex) => {
        let moduleGroupList = state.moduleGroupList
        let newValue = Number(oldValue) + 1
        if (newValue > 0 && state.moduleGroupList[groupName][productIndex].ischecked === false) {
            moduleGroupList[groupName][productIndex].ischecked = true
        }
        moduleGroupList[groupName][productIndex].qtyamount = newValue
        updateState('registerStepper', 'moduleGroupList', moduleGroupList)
        priceCal(moduleGroupList)
    }

    const productRemoveQty = (oldValue, groupName, productIndex) => {
        let moduleGroupList = state.moduleGroupList
        let newValue = Number(oldValue) - 1
        if (!newValue > 0 && state.moduleGroupList[groupName][productIndex].ischecked === true) {
            moduleGroupList[groupName][productIndex].ischecked = false
        }
        moduleGroupList[groupName][productIndex].qtyamount = newValue
        updateState('registerStepper', 'moduleGroupList', moduleGroupList)
        priceCal(moduleGroupList)
    }

    const productChange = (value, groupName, productIndex) => {
        let moduleGroupList = state.moduleGroupList
        let newValue = Number(value.currentTarget.value)
        if (!newValue > 0) {
            moduleGroupList[groupName][productIndex].ischecked = false
            moduleGroupList[groupName][productIndex].qtyamount = 0
        } else {
            moduleGroupList[groupName][productIndex].ischecked = true
            moduleGroupList[groupName][productIndex].qtyamount = newValue
        }
        updateState('registerStepper', 'moduleGroupList', moduleGroupList)
        priceCal(moduleGroupList)
    }

    const priceCal = (moduleGroupListState) => {
        let orderSummary = state.orderSummary
        let subtotal = 0
        let totalvat = 0

        Object.keys(moduleGroupListState).map((groupName) => {
            state.moduleGroupList[groupName].map((modules) => {
                let tempPrice = modules.saleprice * modules.qtyamount
                subtotal += tempPrice

                let priceTaxRate = 0
                if (modules.taxrate > 0) {
                    priceTaxRate = tempPrice * (modules.taxrate / 100)
                }
                totalvat += priceTaxRate
            })
        })

        let discount = 0
        for (let saleDiscount of state.salesDiscounts) {
            if (saleDiscount.ischecked) {
                discount += saleDiscount.discrate
            }
        }

        orderSummary.discountrate = discount
        orderSummary.subtotal = subtotal
        orderSummary.totalvat = totalvat
        orderSummary.nettotal = subtotal + totalvat

        let discPrice = (orderSummary.nettotal * (100 - discount)) / 100
        orderSummary.discount = discount !== 0 ? orderSummary.nettotal - discPrice : 0
        orderSummary.ordertotal = discPrice
        setToState('registerStepper', ['orderSummary'], orderSummary)
    }

    if (isModuleList) {
        return <LoadingSpinner size={50} />
    }

    if (!state.moduleGroupList && !state.moduleGroupList.length > 0) {
        return (
            <Typography variant="subtitle1" align="center" style={{ padding: 10 }}>
                {t('str_noModuleAvailable')}
            </Typography>
        )
    }

    return (
        <React.Fragment>
            <Container maxWidth={state.moduleUseType !== DEMO ? 'lg' : 'sm'}>
                <Grid container spacing={3}>
                    <Grid item xs={state.moduleUseType !== DEMO ? 8 : 12}>
                        {state.moduleUseType === DEMO && (
                            <Typography variant="h6" gutterBottom className={classes.selectYourProducts}>
                                {t('str_pleaseSelectProductsYouWantToUseADemo')}
                            </Typography>
                        )}
                        <Paper>
                            <List className={classes.root} subheader={<li />}>
                                {state.moduleGroupList &&
                                    Object.keys(state.moduleGroupList).map((groupName, index) => {
                                        return (
                                            <li key={`section-${groupName}-${index}`} className={classes.listSection}>
                                                <ul className={classes.ul}>
                                                    <ListSubheader style={{ backgroundColor: '#e2e2e2' }}>
                                                        <Typography variant="subtitle1" style={{ padding: 10 }}>
                                                            {groupName}
                                                        </Typography>
                                                    </ListSubheader>
                                                    {state.moduleGroupList[groupName].map((product, productIndex) => {
                                                        let labelID = `checkbox-list-label-${product.id}`
                                                        return (
                                                            <React.Fragment key={`item-${product.id}`}>
                                                                <ListItem role={undefined} dense>
                                                                    <ListItemIcon>
                                                                        <Checkbox
                                                                            color="primary"
                                                                            edge="start"
                                                                            tabIndex={-1}
                                                                            checked={product.ischecked}
                                                                            onClick={() =>
                                                                                productCheck(
                                                                                    product.ischecked,
                                                                                    groupName,
                                                                                    productIndex
                                                                                )
                                                                            }
                                                                            inputProps={{ 'aria-labelledby': labelID }}
                                                                        />
                                                                    </ListItemIcon>
                                                                    <ListItemText
                                                                        classes={{ secondary: classes.secMaxWidth }}
                                                                        id={labelID}
                                                                        onClick={() =>
                                                                            productCheck(
                                                                                product.ischecked,
                                                                                groupName,
                                                                                productIndex
                                                                            )
                                                                        }
                                                                        primary={`${product.description}`}
                                                                        secondary={
                                                                            product.product_description
                                                                                ? product.product_description
                                                                                : ''
                                                                        }
                                                                    />
                                                                    {state.moduleUseType !== DEMO && (
                                                                        <ListItemSecondaryAction>
                                                                            {product.ispp ? (
                                                                                <React.Fragment>
                                                                                    <Input
                                                                                        disabled
                                                                                        style={{ width: 100 }}
                                                                                        value={
                                                                                            state.basics.agency
                                                                                                .targetroom
                                                                                        }
                                                                                        endAdornment={
                                                                                            <InputAdornment position="end">
                                                                                                {t('str_room')}
                                                                                            </InputAdornment>
                                                                                        }
                                                                                    />
                                                                                </React.Fragment>
                                                                            ) : (
                                                                                <React.Fragment>
                                                                                    <IconButton
                                                                                        edge="start"
                                                                                        disabled={
                                                                                            !product.qtyamount > 0
                                                                                        }
                                                                                        onClick={() =>
                                                                                            productRemoveQty(
                                                                                                product.qtyamount,
                                                                                                groupName,
                                                                                                productIndex
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <RemoveCircleOutlineRounded />
                                                                                    </IconButton>
                                                                                    <Input
                                                                                        disabled={!product.ischecked}
                                                                                        style={{ width: 60 }}
                                                                                        value={product.qtyamount}
                                                                                        onChange={(e) =>
                                                                                            productChange(
                                                                                                e,
                                                                                                groupName,
                                                                                                productIndex
                                                                                            )
                                                                                        }
                                                                                        endAdornment={
                                                                                            <InputAdornment position="end">
                                                                                                {t('str_qty')}
                                                                                            </InputAdornment>
                                                                                        }
                                                                                    />
                                                                                    <IconButton
                                                                                        edge="end"
                                                                                        onClick={() =>
                                                                                            productAddQty(
                                                                                                product.qtyamount,
                                                                                                groupName,
                                                                                                productIndex
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <AddCircleOutlineRounded />
                                                                                    </IconButton>
                                                                                </React.Fragment>
                                                                            )}
                                                                        </ListItemSecondaryAction>
                                                                    )}
                                                                </ListItem>
                                                                <Divider />
                                                            </React.Fragment>
                                                        )
                                                    })}
                                                </ul>
                                            </li>
                                        )
                                    })}
                            </List>
                        </Paper>
                    </Grid>
                    {state.moduleUseType !== DEMO && (
                        <Grid item xs={4}>
                            <Paper className={classes.discountOptions}>
                                {!isDiscountList && state.salesDiscounts && state.salesDiscounts.length > 0 ? (
                                    <React.Fragment>
                                        <Typography variant="subtitle1" className={classes.infoBoxHeader} gutterBottom>
                                            {t('str_discountOptions')}
                                        </Typography>
                                        <FormControl component="fieldset" className={classes.formControl}>
                                            <FormGroup>
                                                {state.salesDiscounts.map((discount, discountIndex) => (
                                                    <FormControlLabel
                                                        key={`discount-${discount.id}`}
                                                        control={
                                                            <Checkbox
                                                                color="primary"
                                                                name={discount.code}
                                                                checked={discount.ischecked}
                                                                onClick={() =>
                                                                    discountCheck(discount.ischecked, discountIndex)
                                                                }
                                                            />
                                                        }
                                                        label={`%${discount.discrate} - ` + discount.description}
                                                    />
                                                ))}
                                            </FormGroup>
                                        </FormControl>
                                    </React.Fragment>
                                ) : isDiscountList ? (
                                    <LoadingSpinner size={50} />
                                ) : (
                                    t('str_noSelectableDiscount')
                                )}
                            </Paper>
                            <Paper className={classes.orderSummary}>
                                <Typography variant="subtitle1" className={classes.infoBoxHeader} gutterBottom>
                                    {t('str_orderSummary')}
                                </Typography>
                                <List disablePadding>
                                    <ListItem className={classes.listItem}>
                                        <ListItemText primary={t('str_numberOfRooms')} secondary="" />
                                        <Typography variant="body2">{state.basics.agency.targetroom}</Typography>
                                    </ListItem>
                                    <ListItem className={classes.listItem}>
                                        <ListItemText primary={t('str_subTotal')} secondary="" />
                                        <Typography variant="body2">
                                            {formatter.format(state.orderSummary.subtotal)}
                                        </Typography>
                                    </ListItem>
                                    <ListItem className={classes.listItem}>
                                        <ListItemText primary={t('str_totalVat')} secondary="" />
                                        <Typography variant="body2">
                                            {formatter.format(state.orderSummary.totalvat)}
                                        </Typography>
                                    </ListItem>
                                    <ListItem className={classes.listItem}>
                                        <ListItemText primary={t('str_netTotal')} secondary="" />
                                        <Typography variant="body2">
                                            {formatter.format(state.orderSummary.nettotal)}
                                        </Typography>
                                    </ListItem>
                                    <ListItem className={classes.listItem}>
                                        <ListItemText
                                            primary={`${t('str_discount')} (%${state.orderSummary.discountrate})`}
                                        />
                                        <Typography variant="body2">
                                            {formatter.format(state.orderSummary.discount)}
                                        </Typography>
                                    </ListItem>
                                    <ListItem className={classes.listItem}>
                                        <ListItemText
                                            style={{ fontWeight: 'bold' }}
                                            primary={
                                                <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                                                    {t('str_orderTotal') + ' / ' + t('str_monthly')}
                                                </Typography>
                                            }
                                            secondary=""
                                        />
                                        <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                                            {formatter.format(state.orderSummary.ordertotal)}
                                        </Typography>
                                    </ListItem>
                                </List>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Container>
        </React.Fragment>
    )
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

export default connect(mapStateToProps, mapDispatchToProps)(Modules)
