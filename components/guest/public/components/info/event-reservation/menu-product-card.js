import React, { useContext, useState, useRef, useEffect } from 'react'
import { connect } from 'react-redux'
import { pushToState, setToState, updateState } from 'state/actions'
import { makeStyles } from '@material-ui/core/styles'
import { UseOrest, Insert, Delete, Patch } from '@webcms/orest'
import { formatMoney, OREST_ENDPOINT, REQUEST_METHOD_CONST } from 'model/orest/constants'
import {
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    TextField,
    Typography,
} from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'
import SpinEdit from '@webcms-ui/core/spin-edit'
import WebCmsGlobal from 'components/webcms-global'
import useTranslation from 'lib/translations/hooks/useTranslation'
import getSymbolFromCurrency from 'model/currency-symbol'
import CardImage from '@webcms-ui/core/card-image'
import { CustomToolTip } from '../../../../../user-portal/components/CustomToolTip/CustomToolTip'
import TableColumnText from '../../../../../TableColumnText'
import DeleteIcon from '@material-ui/icons/Delete'
import AddIcon from '@material-ui/icons/Add'
import SpinEditV2 from '@webcms-ui/core/spin-edit-v2'
import { useSelector } from 'react-redux'

const useStyles = makeStyles((theme) => ({
    card: {
        display: 'flex',
        margin: 5,
    },
    caption: {
        textTransform: 'uppercase',
    },
    title: {
        textTransform: 'uppercase',
        color: theme.palette.primary.main,
        fontWeight: 'bold',
    },
    media: {
        width: 'auto',
        height: 'auto',
        [theme.breakpoints.up('sm')]: {
            width: 1500,
        },
        flexBasis: '30%',
        [theme.breakpoints.only('xs')]: {
            flexBasis: '0',
            display: 'none',
        },
    },
    dialogMedia: {
        width: 'auto',
        height: 'auto',
        [theme.breakpoints.up('sm')]: {
            width: 1500,
        },
        flexBasis: '30%',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        flexBasis: '70%',
        [theme.breakpoints.only('xs')]: {
            flexBasis: '100%',
        },
    },
    cardText: {
        flex: '1 0 auto',
        marginBottom: 15,
        [theme.breakpoints.up('sm')]: {
            marginBottom: 0,
        },
    },
    linkAction: {
        textDecoration: 'none',
        textTransform: 'uppercase',
        color: theme.palette.primary.main,
        fontWeight: 'bold',
    },
    prodImageBox: {
        display: 'none',
        [theme.breakpoints.only('xs')]: {
            display: 'block',
        },
    },
    productDesc: {
        fontSize: 18,
        fontWeight: 600,
        maxWidth: 200,
        whiteSpace: 'nowrap',
        '&::-webkit-scrollbar': {
            width: '0.12em',
            height: 4,
            background: '#0000000a',
        },
        '&::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
            webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(12, 12, 12, 0.17)',
            outline: '1px solid #29609747',
        },
    },
    prodImageContainer: {
        position: 'relative',
        width: '100%',
        height: '100%',
        [theme.breakpoints.only('xs')]: {
            minHeight: '150px',
        },
    },
    prodImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: '0.9',
        borderRadius: 5,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        [theme.breakpoints.only('xs')]: {
            minHeight: '150px',
        },
    },
    prodImageBackground: {
        filter: 'blur(8px)',
        '-webkit-filter': 'blur(8px)',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '200%',
        position: 'absolute',
        width: '97%',
        height: '100%',
    },
    categoryItemDescOverFlow: {
        minHeight: "48px",
        height: "48px",
        maxHeight: "48px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        color: '#648B92',
        display: "-webkit-box",
        WebkitLineClamp: 2,
        '-webkit-line-clamp': 2,
        '-webkit-box-orient': "vertical",
        [theme.breakpoints.down('xs')]: {
            WebkitLineClamp: 3,
            '-webkit-line-clamp': 3,
            minHeight: "64px",
            height: "64px",
            maxHeight: "64px",
        },

    },
    productIngrText: {
        minHeight: "42px",
        height: "42px",
        maxHeight: "42px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        '-webkit-line-clamp': 2,
        '-webkit-box-orient': "vertical",
        [theme.breakpoints.down('xs')]: {
            WebkitLineClamp: 3,
            '-webkit-line-clamp': 3,
            minHeight: "72px",
            height: "72px",
            maxHeight: "72px",
        },
    },
    priceText: {
        paddingRight: "16px",
        textAlign: "right",
        fontSize: "20px",
        fontWeight: "bold",
        color: "#383636"
    },
    productTitle: {
        paddingLeft: "16px",
        paddingTop: "4px",
        color: "#383636"
    },
    productText: {
        padding: "8px 16px",
        fontSize: "12px",
        color: "#959494",
        minHeight:"48px"
    },
    productCard: {
        marginBottom: "16px",
        "&:focus": {
            border: "3px solid blue"
        },
    },
    productCard2: {
        boxShadow: '0px 0px 10px 3px rgb(0 0 0 / 12%)'
    },
    contentContainer: {
        padding: '16px 16px 16px 0',
        [theme.breakpoints.down('sm')]: {
            padding: '0 16px 16px 16px',
        },
    }
}))

const MenuProductCard = (props) => {
    const classes = useStyles()
        , { t } = useTranslation()
        , { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
        , { productItem, isAddActive, state, updateState, isOnlyProduct, resEventDef } = props
        , checkGuestProduct = state.selectGuestProductList.findIndex((item) => Number(item.productcodeid) === Number(isOnlyProduct ? productItem?.id : productItem?.productid))
        , [productQty, setProductQty] = useState(1)
        , [note, setNote] = useState('')
        , [open, setOpen] = useState(false)
        , [eventMenuGid, setEventMenuGid] = useState(false)
        , [openToolTip, setOpenToolTip] = useState(false)
        , [isLoading, setIsLoading] = useState(false)
        , isPortal = GENERAL_SETTINGS.ISPORTAL
        , cardRef = useRef()
        , actionButtonDivRef = useRef()
        , token = useSelector(state => state?.orest?.currentUser?.auth?.access_token || false)

    let selectGuestProductList = state.selectGuestProductList
        , imageWithDomainUrl = productItem?.imageurl

    useEffect(() => {
        if(checkGuestProduct > -1) {
            setNote(selectGuestProductList[checkGuestProduct].note)
            setProductQty(selectGuestProductList[checkGuestProduct].amount)
        }
    }, [checkGuestProduct])

    const insertEventMenu = (data) => {
        return Insert({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.EVENTMENU,
            method: REQUEST_METHOD_CONST.POST,
            token,
            data: data,
        }).then(eventMenuInsertResponse => {
            if (eventMenuInsertResponse.status === 200) {
                if (eventMenuInsertResponse?.data?.data) {
                    return eventMenuInsertResponse.data.data
                } else {
                    return false
                }
            } else if (eventMenuInsertResponse.status === 401) {
                return false
            }
        })
    }

    const patchEventMenu = (data, gid) => {
        return Patch({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.EVENTMENU,
            token,
            gid: gid,
            data: data,
        }).then(eventMenuPatchResponse => {
            if (eventMenuPatchResponse.status === 200) {
                if (eventMenuPatchResponse?.data?.data) {
                    return eventMenuPatchResponse.data.data
                } else {
                    return false
                }
            } else if (eventMenuPatchResponse.status === 401) {
                return false
            }
        })
    }

    const deleteEventMenu = (gid) => {
        return Delete({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.EVENTMENU,
            token,
            gid: gid,
            params: {
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
            }
        }).then(eventMenuDeleteResponse => {
            if (eventMenuDeleteResponse.status === 200) {
                return true
            } else if (eventMenuDeleteResponse.status === 401) {
                return false
            }else{
                return false
            }
        })
    }

    const getResEventCalcPrice = (reservno, doUpdate = false) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'resevent/calc/price',
            method: REQUEST_METHOD_CONST.GET,
            token,
            params: {
                reservno: reservno,
                doupdate: doUpdate
            }
        }).then((response) => {
            if (response?.data?.data) {
                if(Array.isArray(response.data.data)) {
                    return response.data.data[0]
                }else{
                    return response.data.data
                }
            } else {
                return false
            }
        }).catch(() => {
            return false
        })
    }

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleAddProduct = async () => {
        if (checkGuestProduct > -1) {
            setIsLoading(true)
            const isDone = await patchEventMenu({ amount: productQty, note: note }, eventMenuGid)
            if (isDone) {
                const resEventTotals = await getResEventCalcPrice(resEventDef.reservno, true)
                if (resEventTotals) {
                    updateState('guest', 'eventResTotals', resEventTotals)
                }
                selectGuestProductList[checkGuestProduct].amount = productQty
                selectGuestProductList[checkGuestProduct].note = note
                setIsLoading(false)
            } else {
                setIsLoading(false)
            }
        } else {
            setIsLoading(true)
            let defEventMenu = {
                title: productItem.description,
                productcodeid: isOnlyProduct ? productItem.id : productItem.productid,
                reservno: resEventDef.reservno,
                groupname: isOnlyProduct ? productItem.description : productItem.spgroupdesc,
                qty: productItem.qty,
                amount: productQty,
                price: productItem.saleprice,
                pricecurr: productItem.pricecurr,
                pricecurrid: productItem.pricecurrid,
                showprice: productItem.showprice,
                ismenu: true,
                note: note,
                totalpax: resEventDef.totalpax,
                hotelrefno: resEventDef.hotelrefno,
            }

            const useEventMenu = await insertEventMenu(defEventMenu)
            if (useEventMenu) {
                const resEventTotals = await getResEventCalcPrice(resEventDef.reservno, true)
                if (resEventTotals) {
                    updateState('guest', 'eventResTotals', resEventTotals)
                }
                defEventMenu.gid = useEventMenu.gid
                setEventMenuGid(useEventMenu.gid)
                selectGuestProductList.push(defEventMenu)
                setIsLoading(false)
            } else {
                setIsLoading(false)
            }
        }

        updateState('guest', 'selectGuestProductList', selectGuestProductList)
        setOpen(false)
    }

    const handleSubtract = async () => {
        if(eventMenuGid){
            setIsLoading(true)
            await deleteEventMenu(eventMenuGid)
            const resEventTotals = await getResEventCalcPrice(resEventDef.reservno, true)
            if(resEventTotals){
                updateState('guest', 'eventResTotals', resEventTotals)
            }
            selectGuestProductList.splice(checkGuestProduct, 1)
            updateState('guest', 'selectGuestProductList', selectGuestProductList)
            setProductQty(1)
            setNote('')
            setIsLoading(false)
        }
    }

    let isPriceShow = productItem && productItem.showprice && GENERAL_SETTINGS.hotelSettings.productprice || false

    if(productItem.imageurl){
        if(!imageWithDomainUrl.includes(GENERAL_SETTINGS.STATIC_URL)){
            imageWithDomainUrl =  GENERAL_SETTINGS.STATIC_URL + imageWithDomainUrl
        }
    }else{
        imageWithDomainUrl = GENERAL_SETTINGS.BASE_URL + 'imgs/not-found.png'
    }

    const handleOnFocus = (e) => {
        if(isAddActive) {
            if (e.currentTarget === e.target) {
                cardRef.current.style.border = "2px solid #44B3E4";
                actionButtonDivRef.current.style.display = "block";
            }
        }
    }

    const handleOnBlur = (e) => {
        if(isAddActive) {
            if (!e.currentTarget.contains(e.relatedTarget) && !open) {
                cardRef.current.style.border = "none";
                actionButtonDivRef.current.style.display = "none";
            }
        }
    }

    const handleCalculateAmount = (array) => {
        let totalAmount = 0
        if(array) {
            array.map((item) => {
                totalAmount += item?.amount
            })
        }
      return totalAmount
    }

    const isSameProduct = (id) => {
        const array = [...state.selectGuestProductList]
        return array.every(e => e.productcodeid === id)
    }

    return (
        <React.Fragment>
            {
                isPortal ? (
                    <React.Fragment>
                        <div
                            onFocus={(e) => handleOnFocus(e)}
                            onBlur={(e) => handleOnBlur(e)}
                            tabIndex={1}
                            onContextMenu={() => {}}
                        >
                            <Card
                                ref={cardRef}
                                className={classes.productCard}
                                style={{cursor: isAddActive ?  "pointer" : "default"}}
                            >
                                <CardContent style={{padding: "0"}}>
                                    <Grid container>
                                        <Grid item xs={4}>
                                            <div style={{position: 'relative', maxWidth: "100%", height: "100%"}}>
                                                <img src={productItem.imageurl} style={{position: "absolute", width: "100%", height: "100%"}}/>
                                            </div>
                                        </Grid>
                                        <Grid item xs={8}>
                                            <Grid container>
                                                <Grid item xs={12}>
                                                    <div style={{paddingTop: "8px"}}/>
                                                </Grid>
                                                <Grid item xs={8}>
                                                    <Typography className={classes.productTitle}>
                                                        {t(productItem?.localtitle?.removeHtmlTag() || productItem?.description || '')}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    {isPriceShow && (
                                                        <Typography className={classes.priceText}>
                                                            {(productItem.saleprice > 0) ? formatMoney(productItem.saleprice) : ' - '}
                                                            {getSymbolFromCurrency(productItem.pricecurr)}
                                                        </Typography>
                                                    )}
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <div style={{paddingTop: "8px"}}/>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Divider style={{marginLeft: "16px", marginRight: "16px"}}/>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography className={classes.productText}>{t(productItem?.localdesc?.removeHtmlTag() || productItem?.ingrtext || '')}</Typography>
                                                    {isOnlyProduct && productItem?.durationmin && (
                                                            <Typography className={classes.productText}>
                                                                <a style={{fontWeight: '600'}}>{`${t('str_duration')}: `}</a>
                                                                {`${productItem?.durationmin} ${t('str_minute')}`}
                                                            </Typography>
                                                        )}
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                            <div ref={actionButtonDivRef} style={{paddingBottom: "16px", textAlign: "right", display: "none"}}>
                                <Grid container>
                                    <Grid item xs={12}>
                                        <Button
                                            disabled={isLoading}
                                            onClick={() => {
                                                actionButtonDivRef.current.style.display = "none";
                                                cardRef.current.style.border = "none";
                                            }}
                                            size={"small"}
                                            style={{fontSize: "12px", textTransform: "capitalize"}}
                                            color={"primary"}
                                            variant={"outlined"}
                                        >
                                            {t("str_back")}
                                        </Button>
                                        {checkGuestProduct > -1 ? (
                                            <Button
                                                disabled={isLoading}
                                                size={"small"}
                                                style={{marginLeft: "8px"}}
                                                color={"primary"}
                                                variant={"contained"}
                                                onClick={handleSubtract}
                                            >
                                                {t("str_extract")}
                                            </Button>
                                        ) : (
                                            <CustomToolTip
                                                title={'cant'}
                                                open={openToolTip}
                                                onOpen={() => isOnlyProduct && state.selectGuestProductList.length >= state.totalPax && setOpenToolTip(true)}
                                                onClose={() => setOpenToolTip(false)}
                                            >
                                                <Button
                                                    disabled={isLoading}
                                                    fullWidth
                                                    size={"small"}
                                                    style={{fontSize: "10px", marginLeft: "8px"}}
                                                    color={"primary"}
                                                    variant={"contained"}
                                                    onClick={handleClickOpen}
                                                >
                                                    {t("str_add")}
                                                </Button>
                                            </CustomToolTip>
                                        )}
                                    </Grid>
                                </Grid>
                            </div>
                        </div>
                    </React.Fragment>
                ) : (
                    <Card className={classes.productCard2}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4} >
                                <div className={classes.prodImageContainer}>
                                    <div
                                        className={classes.prodImageBackground}
                                        style={{backgroundImage: `url(${imageWithDomainUrl})`}}
                                    />
                                    <div
                                        className={classes.prodImage}
                                        style={{backgroundImage: `url(${imageWithDomainUrl})`}}
                                    />
                                </div>
                            </Grid>
                            <Grid item xs={12} sm={8} >
                                <div className={classes.contentContainer} >
                                    <Grid container spacing={1}>
                                        <Grid item xs={12}>
                                            <TableColumnText fontSize={18} fontWeight={600} showToolTip>
                                                {t(productItem?.localtitle?.removeHtmlTag() || productItem?.description || '')}
                                            </TableColumnText>
                                            {
                                                isOnlyProduct && productItem?.durationmin && productItem?.durationmin > 0 && (
                                                    <Typography style={{fontSize: '12px'}}>{`(${productItem?.durationmin} ${t('str_minute')})`}</Typography>
                                                )
                                            }
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Divider light />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography className={classes.productIngrText} title={t(productItem?.localdesc?.removeHtmlTag() || productItem?.ingrtext || '')}>
                                                {t(productItem?.localdesc?.removeHtmlTag() || productItem?.ingrtext || '')}
                                            </Typography>
                                        </Grid>
                                        {!isAddActive && isPriceShow && (
                                            <Grid item xs={12}>
                                                <Typography style={{fontWeight: '600', textAlign: 'right'}} >
                                                    {(productItem.saleprice > 0) ? formatMoney(productItem.saleprice) : ' - '}
                                                    {getSymbolFromCurrency(productItem.pricecurr)}
                                                </Typography>
                                            </Grid>
                                        )}
                                        {isAddActive && (
                                            <React.Fragment>
                                                <Grid item xs={12}>
                                                    <Alert
                                                        variant="outlined"
                                                        severity="warning"
                                                        style={{ fontSize: 12, textAlign: 'center'}}
                                                    >
                                                        {t('str_allergicInformation')}
                                                    </Alert>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        fullWidth
                                                        variant="outlined"
                                                        label={t('str_note')}
                                                        multiline
                                                        rows={2}
                                                        value={note}
                                                        onChange={(e) => {
                                                            setNote(e.target.value)
                                                            if(checkGuestProduct !== -1) {
                                                                const data = [...state.selectGuestProductList]
                                                                data[checkGuestProduct].note = e.target.value
                                                                updateState('guest', ['selectGuestProductList'], data)
                                                            }
                                                        }}
                                                    />
                                                </Grid>
                                                {isPriceShow && (
                                                    <Grid item xs={12}>
                                                        <Typography style={{fontWeight: '600', textAlign: 'right'}} >
                                                            {(productItem.saleprice > 0) ? formatMoney(productItem.saleprice) : ' - '}
                                                            {getSymbolFromCurrency(productItem.pricecurr)}
                                                        </Typography>
                                                    </Grid>
                                                )}
                                                <Grid item xs={12} sm={12} md={7}>
                                                    <SpinEditV2
                                                        disabled={isLoading}
                                                        defaultValue={productQty}
                                                        label={t('str_pieces')}
                                                        size={'small'}
                                                        min={1}
                                                        max={isOnlyProduct && productItem?.ispp ? (state.totalPax > 1 ? isSameProduct(productItem?.id) ? state.totalPax : (state.totalPax - state.selectGuestProductList.length) : 1) : 99}
                                                        onChange={async (value) => {
                                                            setProductQty(value)
                                                            if(checkGuestProduct !== -1) {
                                                                setIsLoading(true)
                                                                const isDone = await patchEventMenu({ amount: value }, eventMenuGid)
                                                                if(isDone){
                                                                    const resEventTotals = await getResEventCalcPrice(resEventDef.reservno, true)
                                                                    if(resEventTotals){
                                                                        updateState('guest', 'eventResTotals', resEventTotals)
                                                                    }
                                                                    const data = [...state.selectGuestProductList]
                                                                    data[checkGuestProduct].amount = value
                                                                    updateState('guest', ['selectGuestProductList'], data)
                                                                    setIsLoading(false)
                                                                }else{
                                                                    setIsLoading(false)
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={12} md={5}>
                                                    <div>
                                                        {checkGuestProduct > -1 ? (
                                                            <Button
                                                                disabled={isLoading}
                                                                fullWidth
                                                                style={{textTransform: 'none', color: 'red', padding: '8px'}}
                                                                startIcon={<DeleteIcon style={{color: 'red'}}/>}
                                                                variant="outlined"
                                                                size="small"
                                                                onClick={handleSubtract}
                                                            >
                                                                {t('str_removeSelection')}
                                                            </Button>
                                                        ) : (
                                                            <CustomToolTip
                                                                title={isOnlyProduct && handleCalculateAmount(state.selectGuestProductList) >= state.totalPax ? t('str_productSelectionWasMadeInfo') : t('str_add')}
                                                                open={openToolTip}
                                                                onOpen={() => isOnlyProduct && productItem?.ispp && handleCalculateAmount(state.selectGuestProductList) >= state.totalPax && setOpenToolTip(true)}
                                                                onClose={() => setOpenToolTip(false)}
                                                            >
                                                            <span>
                                                                 <Button
                                                                     fullWidth
                                                                     disabled={isLoading || isOnlyProduct && productItem?.ispp && handleCalculateAmount(state.selectGuestProductList) >= state.totalPax}
                                                                     style={{textTransform: 'none'}}
                                                                     startIcon={<AddIcon />}
                                                                     color={"primary"}
                                                                     variant={"contained"}
                                                                     onClick={() => !(isOnlyProduct && productItem?.ispp && state.selectGuestProductList.length >= state.totalPax) && handleAddProduct()}
                                                                 >
                                                                     {t("str_add")}
                                                                 </Button>
                                                            </span>
                                                            </CustomToolTip>
                                                        )}
                                                    </div>
                                                </Grid>
                                            </React.Fragment>
                                        )}
                                    </Grid>
                                </div>
                            </Grid>
                        </Grid>
                    </Card>
                )
            }
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    pushToState: (stateType, stateName, value) => dispatch(pushToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(MenuProductCard)
