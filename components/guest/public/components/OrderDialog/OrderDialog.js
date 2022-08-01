import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogContent,
    Grid,
    Paper,
    Container,
    DialogTitle,
    AppBar,
    Toolbar,
    Typography,
    ButtonBase,
    Divider,
    IconButton,
    TextField,
} from '@material-ui/core'
import { connect, useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import LoginDialog from '../../../../LoginComponent/LoginDialog'
import useTranslation from '../../../../../lib/translations/hooks/useTranslation'
import axios from 'axios'
import WebCmsGlobal from '../../../../webcms-global'
import { setToState, updateState } from '../../../../../state/actions'
import { formatMoney, jsonGroupBy, OREST_ENDPOINT, REQUEST_METHOD_CONST } from '../../../../../model/orest/constants'
import getSymbolFromCurrency from '../../../../../model/currency-symbol'
import clsx from 'clsx'
import BackIcon from '@material-ui/icons/KeyboardBackspace'
import DeleteIcon from '@material-ui/icons/Delete'
import CheckIcon from '@material-ui/icons/Check'
import CloseIcon from '@material-ui/icons/Close'
import FastfoodIcon from '@material-ui/icons/Fastfood'
import InfoIcon from '@material-ui/icons/Info';
import SpinEditV2 from '../../../../../@webcms-ui/core/spin-edit-v2'
import { UseOrest, ViewList } from '@webcms/orest'
import { useSnackbar } from 'notistack'
import LoadingSpinner from '../../../../LoadingSpinner'
import { CustomToolTip } from '../../../../user-portal/components/CustomToolTip/CustomToolTip'
import * as global from '../../../../../@webcms-globals'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import { Alert } from '@material-ui/lab'
import ExtraDialog from './ExtraDialog'
import PayDialog from './PayDialog'
import OverflowTextContainer from '../../../../OverflowTextContainer/OverflowTextContainer'
import {LocaleContext} from "lib/translations/context/LocaleContext"

const useStyles = makeStyles((theme) => ({
    appBarSpacer: theme.mixins.toolbar,
    image: {
        position: 'relative',
        height: 100,
        [theme.breakpoints.down('xs')]: {
            width: '100% !important', // Overrides inline-style
            height: 100,
        },
        '&:hover, &$focusVisible': {
            zIndex: 1,
            '& $imageBackdrop': {
                opacity: 0.3,
            },
            '& $imageMarked': {
                opacity: 0,
            },
            '& $imageTitle': {
                border: '4px solid currentColor',
            },
        },
    },
    imageSrc: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        borderRadius: 10,
    },
    imageBackdrop: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: theme.palette.common.black,
        opacity: 0.6,
        transition: theme.transitions.create('opacity'),
        borderRadius: 10,
    },
    imageTitle: {
        position: 'relative',
        padding: `${theme.spacing(2)}px ${theme.spacing(4)}px ${theme.spacing(1) + 6}px`,
    },
    imageMarked: {
        height: 3,
        width: 18,
        backgroundColor: theme.palette.common.white,
        position: 'absolute',
        bottom: -2,
        left: 'calc(50% - 9px)',
        transition: theme.transitions.create('opacity'),
    },
    imageButton: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.common.white,
    },
    active: {
        border: '4px solid currentColor',
    },
    activeDot: {
        '&:after': {
            content: "''",
            width: 10,
            height: 10,
            position: 'absolute',
            borderRadius: '50%',
            backgroundColor: '#4caf50'
        },
    },
    backButtonContainer: {
        zIndex: 1,
        position: 'static',         
        width: '100%'
    },
    productName: {
        fontSize: '18px',
        fontWeight: '600'
    },
    productListContainer: {
        visibility: 'visible',
        position: 'relative',
        '&:hover $productDeleteIcon': {
            visibility: 'visible'
        },
        '&:hover $productListIconContainer': {
            visibility: 'hidden'
        }
    },
    productDeleteIcon: {
        position: 'absolute',
        visibility: 'hidden'
    },
    reservationCardIconContainer: {
        display: 'flex',
    },
    productListIconContainer: {
        visibility: 'visible'
    },
    reservationCardIcon: {
        marginRight: "8px",
        fontSize: "16px"
    },
    reservationCardText: {
        fontSize: "13px",
        color: "#122D31"
    },
    totalPriceText: {
        fontSize: "18px",
        fontWeight: "600",
    },
    confirmField: {
        backgroundColor:"#9CD294",
        padding: "24px 0",
        borderRadius: "8px"
    },
    cardTitle: {
        fontSize: "20px",
        fontWeight: "500",
        color: "#2697D4",
        whiteSpace: 'nowrap',
        [theme.breakpoints.down('sm')]: {
            textAlign:'center',
            fontSize: '14px'
        },
    },
    cardText: {
        fontSize: "20px",
        fontWeight: "600",
        color: "#122D31",
        whiteSpace: 'nowrap',
        [theme.breakpoints.down('sm')]: {
            textAlign:'center',
            fontSize: '13px'
        },
    },
    menuGroupAndProductListBox: {
        height: '80vh',
        padding: 10,
        overflow: 'inherit'
    },
    confirmIcon: {
        width: "3em",
        height: "3em",
        border: "1px solid #4CAD63",
        borderRadius: "50%",
        color: "#4CAD63",
        [theme.breakpoints.down('sm')]: {
            width: "1.5em",
            height: "1.5em",
        },
    },
    confirmTextContainer: {
        alignItems: 'center',
        display: 'flex',
        [theme.breakpoints.down('sm')]: {
            display: 'block',
            textAlign: 'center'
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
}))

function OrderDialog(props) {
    const classes = useStyles()
        , { setToState, updateState, state } = props
        , router = useRouter()
        , { enqueueSnackbar } = useSnackbar()
        , { t } = useTranslation()
        , { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
        , {locale} = useContext(LocaleContext)
        , baseUrl = GENERAL_SETTINGS.BASE_URL[GENERAL_SETTINGS.BASE_URL.length - 1] === '/' ? GENERAL_SETTINGS.BASE_URL.substring(0, GENERAL_SETTINGS.BASE_URL.length - 1) : GENERAL_SETTINGS.BASE_URL

    //redux
    const loginfo = useSelector((state) => state?.orest?.currentUser?.loginfo || false)
        , clientReservation = useSelector((state) => state?.formReducer?.guest?.clientReservation || false)
        , isLogin = !!loginfo

    //router query data
    const makeOrder = router.query?.makeorder === 'true'
        , departId = router.query?.menuid || false
        , departCode = router.query?.departcode || false
        , tableNo = router.query?.tableno || false
        , [isOpenLoginDialog, setIsOpenLoginDialog] = useState(false)
        , [isLoadingMenu, setIsLoadingMenu] = useState(false)
        , [sPGroupName, setSPGroupName] = useState(null)
        , [amountArray, setAmountArray] = useState(false)
        , [posSlipData, setPosSlipData] = useState(false)
        , [open, setOpen] = useState(!!(makeOrder && departId))
        , [isSaving, setIsSaving] = useState(false)
        , [openTooltip, setOpenTooltip] = useState(false)
        , [openTooltip2, setOpenTooltip2] = useState(false)
        , [isOrderComplete, setIsOrderComplete] = useState(false)
        , [openPropsDialog, setOpenPropsDialog] = useState(false)
        , [selectedProduct, setSelectedProduct] = useState(false)
        , [isOpenPaymentDialog, setIsOpenPaymentDialog] = useState(false)


    useEffect(() => {
        if (open && departId && !state.menuGroupAndProductList) {
            setIsLoadingMenu(true)
            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/products/product-list',
                method: 'post',
                params: {
                    departid: departId,
                    hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
                    ischain: GENERAL_SETTINGS.ISCHAIN,
                    langcode: locale
                }
            }).then((productListResponse) => {
                const productListData = productListResponse.data
                if (productListData.success && productListData.count > 0) { 
                    const groupData = jsonGroupBy(productListData.data, 'localspgroupdesc')
                    updateState('guest', ['menuGroupAndProductList'], groupData)
                    setIsLoadingMenu(false)                
                    const data = {}
                    Object.keys(groupData).map((key) => {
                        const array = []
                        for(let i = 0; i < groupData[key].length; i++) {
                            array.push({amount: 1})
                            data[key] = array
                        }                    
                    })                   
                    setAmountArray(data)
                } else {
                    updateState('guest', ['menuGroupAndProductList'], null)     
                    setIsLoadingMenu(false)
                }
            })
        } else {
            const data = {}
            Object.keys(state.menuGroupAndProductList).map((key) => {
                const array = []
                for(let i = 0; i < state.menuGroupAndProductList[key].length; i++) {
                    array.push({amount: 1})
                    data[key] = array
                }                    
            })                   
            setAmountArray(data)
        }
    }, [open])

    const handleGetSprops = (product) => {
        setOpenPropsDialog(true)
        setSelectedProduct(product)
        
    }

    const handlePosmainInsline = async (isWithLogin) => {
        const params = {}

        params.depart = departCode
        params.isclosed = false

        if (tableNo) {
            params.tableno = tableNo
        }        

        if(isWithLogin) {
            if(loginfo) {
                params.accid = loginfo?.refid || loginfo?.id
            } 

            if (clientReservation?.status !== 'O' && clientReservation?.roomno) {
                params.roomno = clientReservation?.roomno
            } else {
                params.roomno = await handleGetRoomNo()
                if (params.roomno?.roomno) {
                    params.roomno = params.roomno?.roomno
                }
            }
        } else {
            params.roomno = await handleGetRoomNo()
            if (params.roomno?.roomno) {
                params.roomno = params.roomno?.roomno
            }
        }
            
        return UseOrest({
            apiUrl: baseUrl,
            method: REQUEST_METHOD_CONST.POST,
            endpoint: 'api/hotel/posmain/insline',
            params: params,
        }).then(res => {
            if (res.data.data) {
                setPosSlipData(res.data.data)
                return res.data.data
            } else {
                enqueueSnackbar(t('str_unexpectedProblem 2'), { variant: 'error' })
                return false
            }
        })
    }

    const handleGetRoomNo = async () => {
        return UseOrest({
            apiUrl: baseUrl,
            method: REQUEST_METHOD_CONST.POST,
            endpoint: 'api/hotel/sett/folio/cash',         
        }).then(res => {
            if (res.status === 200 && res.data.success) {
                return res.data.data
            } else {
                return false;
            }
        })
    }

    const handleClose = () => {
        const routerQuery = {...router.query}
        delete routerQuery?.menuid
        delete routerQuery?.makeorder
        if(routerQuery?.tableno) {
            delete routerQuery?.tableno
        }
        if (routerQuery?.departcode) {
            delete routerQuery?.departcode
        }
        router.push({
            pathname: 'guest',
            query: routerQuery
        })
        setOpen(false)
        updateState('guest', 'selectGuestProductList', [])
        updateState('guest', 'selectGuestProductPropList', false)

    }

    const handleAddProduct = (productItem, groupName, index) => {
        const list = [...state.selectGuestProductList]
        const data = {
            title: productItem.description,
            productcodeid: productItem.productid,              
            groupname: productItem.spgroupdesc,
            qty: productItem.qty,
            amount: amountArray[groupName][index]?.amount,
            price: productItem.saleprice,
            pricecurr: productItem.pricecurr,
            pricecurrid: productItem.pricecurrid,
            showprice: productItem.showprice,
            ismenu: true,  
            refcode: ''                           
        }
        list.push(data)
        updateState('guest', 'selectGuestProductList', list)
    }

    const handleSave = async (isWithLogin) => {
        setIsSaving(true)
        const posData = await handlePosmainInsline(isWithLogin)
        if(posData) {            
            const insList = []
                , selectedProductList = [...state.selectGuestProductList]
            selectedProductList.map((item) => {
                insList.push({
                    linetotal: item?.amount * item?.price,
                    price: item?.price,
                    quantity: item.amount,
                    stockcodeid: item?.productcodeid,
                    transno: posData?.transno,
                    refcode: item?.refcode,
                    hotelrefno: GENERAL_SETTINGS.HOTELREFNO
                })
            })

            UseOrest({
                apiUrl: baseUrl,
                endpoint: 'api/hotel/posline/ins/list',
                method: REQUEST_METHOD_CONST.POST,        
                data: insList,
            }).then(async res => {
                if(res.data.success) {
                    if(state.selectGuestProductPropList) {
                        const spropsDataList = []
                        res.data.data.map((item) => {
                            const propData = state.selectGuestProductPropList[item.stockcodeid]
                            if(propData && propData?.length > 0) {
                                propData.map((propDataItem) => {
                                    spropsDataList.push({
                                        lineid: item.linecounter,
                                        propid: propDataItem?.propcodeid
                                    })
                                })

                            }                                                       
                        })
                        if (spropsDataList.length > 0) {
                            await handleInsertSProps(spropsDataList)
                        }
                    }
                   
                    UseOrest({
                        apiUrl: baseUrl,
                        endpoint: 'api/hotel/posmain/view/list',
                        method: REQUEST_METHOD_CONST.POST,
                        params: {
                            transno: posData?.transno
                        }
                    }).then(posmainData => {
                        if (posmainData?.data?.success) {
                            if (posmainData.data.data.length > 0) {
                                setPosSlipData(posmainData.data.data[0])
                            }
                            setIsOpenPaymentDialog(true)
                        }
                    })                                                   
                }
                setIsSaving(false)
            })
        } else {
            setIsSaving(false)
        }
    }

    const handleInsertSProps = (array) => {       
        return UseOrest({
            apiUrl: baseUrl,
            endpoint: 'api/hotel/sprops/list/ins',
            method: REQUEST_METHOD_CONST.POST,
            data: array
        }).then(res => {
            if (res?.data?.success) {
                if (res.data.data.length > 0) {
                    return res.data.data
                }  else {
                    return false
                }              
            } else {
                return false
            }
        })
    }

    const handleOpenLoginDialog = () => {
        setIsOpenLoginDialog(true)
    }

    const handleRemoveItem = (removeItem) => {
        if(removeItem){ 
            const newList = state.selectGuestProductList.filter(e => e.productcodeid !== removeItem.productcodeid)        
            setToState('guest', ['selectGuestProductList'], newList)
        }
    }

    const checkIsAdd = (index) => {return state.selectGuestProductList.findIndex(e => e.productcodeid === state.menuGroupAndProductList[sPGroupName][index]?.id)}
    
    const totalPrice = () => {
        let total = 0
        let curr = ''
        state.selectGuestProductList.map((item) => {
            total += (item?.price * item?.amount)
            curr = item?.pricecurr
        })

        return{
            total: total,
            curr: curr
        }
    }

    const handleSubtract = (index) => {
        const selectedArray = [...state.selectGuestProductList]
        selectedArray.splice(checkIsAdd(index), 1)    
        updateState('guest', ['selectGuestProductList'], selectedArray)
    }

    let showInfoIcon = (id) => {
        return state.selectGuestProductList.find(e => e.productcodeid === id)  
    }


    return(
        <Dialog open={open} fullScreen>
            <DialogContent style={{backgroundColor: 'rgb(241, 241, 241)'}}>
                <AppBar>
                    <Toolbar>
                        <Typography>
                            {t('str_menu')}
                        </Typography>
                        <Typography style={{marginLeft: 'auto'}}>
                            <IconButton
                                style={{color: 'inherit'}}
                                onClick={() => handleClose()}
                            >
                                <CloseIcon />
                            </IconButton>                        
                        </Typography>
                    </Toolbar>            
                </AppBar> 
                <div className={classes.appBarSpacer}/> 
                <Container>
                    {isOrderComplete ? (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Grid container className={classes.confirmField}>
                                    <Box
                                        component={Grid}
                                        style={{ textAlign: 'center', paddingBottom: '8px' }}
                                        item
                                        xs={12}
                                        display={{ xs: 'block', sm: 'none' }}
                                    >
                                        <CheckIcon className={classes.confirmIcon} />
                                    </Box>
                                    <Box
                                        component={Grid}
                                        style={{ textAlign: 'center' }}
                                        item
                                        xs={2}
                                        display={{ xs: 'none', sm: 'block' }}
                                    >
                                        <CheckIcon className={classes.confirmIcon} />
                                    </Box>
                                    <Grid item xs={12} sm={10} className={classes.confirmTextContainer}>
                                        <div>
                                            <Typography variant="h6">
                                                {t('str_orderNo') + global.common.strEmpty}
                                                {global.common.strHastag}
                                                {posSlipData?.transno}
                                            </Typography>
                                            <Typography className={classes.confirmText}>
                                                {t('str_orderCreatedSuccessfully')}
                                            </Typography>
                                        </div>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={4}>
                                                        <Typography className={classes.cardTitle}>{t('str_productName')}</Typography>
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <Typography className={classes.cardTitle}>{t('str_quantity')}</Typography>
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <Typography className={classes.cardTitle}>{t('str_price')}</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                            <Grid item xs={12}>
                                                {state.selectGuestProductList.map((item, index) => (
                                                    <Grid container spacing={2} key={index}>
                                                        <Grid item xs={4}>
                                                            <Typography className={classes.cardText}>{item.title}</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography className={classes.cardText}>{item.amount}</Typography>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Typography className={classes.cardText}>{formatMoney(item.price)}{getSymbolFromCurrency(item.pricecurr)}</Typography>
                                                        </Grid>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Divider />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={4}>
                                                        <Typography className={classes.cardText}>{t('str_total')}</Typography>
                                                    </Grid>
                                                    <Grid item xs={4}></Grid>
                                                    <Grid item xs={4}>
                                                        <Typography className={classes.cardText}>{posSlipData?.subtotal ? (formatMoney(posSlipData?.subtotal) + getSymbolFromCurrency(posSlipData?.paycurrcode)) : '-'}</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                    </CardContent>
                                </Card>
                                <div style={{ paddingTop: '8px', textAlign: 'right' }}>
                                    <Button
                                        color={'primary'}
                                        variant={'outlined'}
                                        onClick={() => handleClose()}
                                    >
                                        {t('str_close')}
                                    </Button>
                                </div>
                            </Grid>
                        </Grid>
                    ) : (
                        <Grid container spacing={3}>
                            {sPGroupName && (
                                <Grid item xs={12} sm={8}>
                                    <div style={{ position: 'relative' }}>
                                        <div className={classes.backButtonContainer}>
                                            <Button
                                                disabled={isSaving}
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => {
                                                    setSPGroupName(null)
                                                }}
                                                startIcon={<BackIcon />}
                                            >
                                                {t('str_menu')}
                                            </Button>
                                        </div>
                                    </div>
                                </Grid>
                            )}
                            <Grid item xs={12} sm={8} style={{overflowY: 'auto'}}>
                                <Paper className={classes.menuGroupAndProductListBox}>
                                    {isLoadingMenu && (
                                        <Grid item xs={12}>
                                            <LoadingSpinner />
                                        </Grid>
                                    )}
                                    {!sPGroupName ? (
                                        <Grid container spacing={2}>
                                            {state.menuGroupAndProductList && Object.keys(state.menuGroupAndProductList).map((groupName, index) => (
                                                <Grid item xs={6} onClick={() => setSPGroupName(groupName)} key={index}>
                                                    <ButtonBase
                                                        key={index}
                                                        className={classes.image}
                                                        focusVisibleClassName={classes.focusVisible}
                                                        style={{ width: '100%' }}
                                                        disabled={isSaving}
                                                    >

                                                        <span className={classes.imageSrc} style={state.menuGroupAndProductList[groupName][0].spgroupimageurl ? { backgroundImage: `url(${GENERAL_SETTINGS.STATIC_URL + state.menuGroupAndProductList[groupName][0].spgroupimageurl})` } : {}} />
                                                        <span className={classes.imageBackdrop} />
                                                        <span className={classes.imageButton}>
                                                            <Typography
                                                                component="span"
                                                                variant="subtitle1"
                                                                color="inherit"
                                                                className={clsx(classes.imageTitle, {
                                                                    [classes.active]: groupName === sPGroupName ? true : false,
                                                                    //[classes.activeDot]: checkIsAdd(index) > -1 ? true : false,
                                                                })}
                                                            >
                                                                {groupName}
                                                                <span className={classes.imageMarked} />
                                                            </Typography>
                                                        </span>
                                                    </ButtonBase>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    ) : (
                                        <React.Fragment>
                                            <Grid container>
                                                {state.menuGroupAndProductList[sPGroupName].map((item, index) => (
                                                    <Grid item xs={12}>
                                                        <Card key={index} style={{ marginBottom: '8px' }}>
                                                            <Grid container>
                                                                <Grid item xs={12} sm={12} md={4}>
                                                                    {
                                                                        showInfoIcon(item?.id) && (
                                                                            <div style={{ position: 'relative' }}>
                                                                                <div style={{ position: 'absolute', top: '0', right: '0' }}>
                                                                                    <IconButton color="primary" onClick={() => handleGetSprops(item)}>
                                                                                        <InfoIcon />
                                                                                    </IconButton>
                                                                                </div>
                                                                            </div> 
                                                                        )
                                                                    }
                                                                    <div className={classes.prodImageContainer}>
                                                                        <div
                                                                            className={classes.prodImageBackground}
                                                                            style={{backgroundImage: `url(${item?.spgroupimageurl ? GENERAL_SETTINGS.STATIC_URL + item.spgroupimageurl : '/imgs/not-found.png'})`}}
                                                                        />
                                                                        <div
                                                                            className={classes.prodImage}
                                                                            style={{backgroundImage: `url(${item?.spgroupimageurl ? GENERAL_SETTINGS.STATIC_URL + item.spgroupimageurl : '/imgs/not-found.png'})`}}
                                                                        />
                                                                    </div>
                                                                </Grid>
                                                                <Grid item xs={12} sm={12} md={8}>
                                                                    <CardContent>
                                                                        <Grid container spacing={1}>
                                                                            <Grid item xs={12}>
                                                                                <Typography className={classes.productName}>{item?.description || ''}</Typography>
                                                                                <Divider />
                                                                            </Grid>
                                                                            <Grid item xs={12}>
                                                                                <OverflowTextContainer showButton>
                                                                                    <div dangerouslySetInnerHTML={{ __html: item?.ingrtext }} />
                                                                                </OverflowTextContainer>
                                                                            </Grid>
                                                                            <Grid item xs={12}>
                                                                                <Typography style={{ fontWeight: 600, textAlign: 'right' }}>
                                                                                    {formatMoney(item.saleprice)}{getSymbolFromCurrency(item.pricecurr)}
                                                                                </Typography>
                                                                            </Grid>
                                                                            <Grid item xs={12} sm={6}>
                                                                                <SpinEditV2
                                                                                    defaultValue={amountArray.length > 0 ? amountArray[sPGroupName][index]?.amount : 1}
                                                                                    disabled={isSaving}
                                                                                    label={t('str_pieces')}
                                                                                    size={'small'}
                                                                                    min={1}
                                                                                    max={99}
                                                                                    onChange={(value) => {
                                                                                        const amountObject = { ...amountArray }
                                                                                        const selectedArray = [...state.selectGuestProductList]
                                                                                        amountObject[sPGroupName][index].amount = value
                                                                                        setAmountArray(amountObject)
                                                                                        const description = state.menuGroupAndProductList[sPGroupName][index]?.description
                                                                                        const selectGuestProductListIndex = state.selectGuestProductList.findIndex(e => e.title === description)
                                                                                        if (selectGuestProductListIndex !== -1) {
                                                                                            selectedArray[selectGuestProductListIndex].amount = value
                                                                                            updateState('guest', ['selectGuestProductList', selectGuestProductListIndex], selectedArray)
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            </Grid>
                                                                            <Grid item xs={12} sm={6} style={{ textAlign: 'right' }}>
                                                                                {checkIsAdd(index) === -1 ? (
                                                                                    <Button
                                                                                        disabled={isSaving}
                                                                                        color={'primary'}
                                                                                        variant={'contained'}
                                                                                        onClick={() => {
                                                                                            handleAddProduct(item, sPGroupName, index)
                                                                                            handleGetSprops(state.menuGroupAndProductList[sPGroupName][index])
                                                                                        }}                                                                    
                                                                                    >
                                                                                        {t('str_add')}
                                                                                    </Button>
                                                                                ) : (
                                                                                    <Button
                                                                                        disabled={isSaving}
                                                                                        style={{ textTransform: 'none', color: 'red', padding: '8px' }}
                                                                                        startIcon={<DeleteIcon style={{ color: 'red' }} />}
                                                                                        variant="outlined"
                                                                                        size="small"
                                                                                        onClick={() => handleSubtract(index)}
                                                                                    >
                                                                                        {t('str_removeSelection')}
                                                                                    </Button>
                                                                                )}
                                                                            </Grid>
                                                                        </Grid>
                                                                    </CardContent>
                                                                </Grid>
                                                            </Grid>
                                                        </Card>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </React.Fragment>
                                    )
                                    }
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Card>
                                    <CardContent>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12}>
                                                <Typography style={{fontWeight: '600'}}>{t('str_productCart')}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                {state?.selectGuestProductList?.length > 0 ? state.selectGuestProductList.map((item, itemIndex) => (
                                                    <div className={classes.productListContainer} key={itemIndex}>
                                                        <Grid container>
                                                            <Grid item xs={7}>
                                                                <div className={classes.productDeleteIcon}>
                                                                    <IconButton
                                                                        onClick={() => handleRemoveItem(item)}
                                                                        style={{ padding: 0 }}
                                                                        size={'small'}
                                                                    >
                                                                        <DeleteIcon style={{ fontSize: '16px', color: 'red' }} />
                                                                    </IconButton>
                                                                </div>
                                                                <div className={classes.reservationCardIconContainer}>
                                                                    <div className={classes.productListIconContainer}>
                                                                        <FastfoodIcon className={classes.reservationCardIcon} />
                                                                    </div>
                                                                    <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                                                        <Typography className={classes.reservationCardText}>
                                                                            {item.title}
                                                                            <a>
                                                                                {((item?.refcode && item?.refcode?.length > 0) || state.selectGuestProductPropList[item?.productcodeid]) && (
                                                                                    <CustomToolTip 
                                                                                        title={
                                                                                            <div style={{fontSize: 'inherit'}}>
                                                                                                {
                                                                                                    state.selectGuestProductPropList[item?.productcodeid] && (
                                                                                                        <React.Fragment>
                                                                                                            <Typography style={{ fontWeight: '600', fontSize: 'inherit' }}>
                                                                                                                {t('str_extras')}
                                                                                                            </Typography>
                                                                                                            {state.selectGuestProductPropList[item?.productcodeid]?.length > 0 && state.selectGuestProductPropList[item?.productcodeid].map((item, index) => (
                                                                                                                <Typography key={`extra-${index}`} style={{ fontSize: 'inherit' }}>
                                                                                                                    {item?.propcode}
                                                                                                                </Typography>
                                                                                                            ))}
                                                                                                        </React.Fragment>
                                                                                                    )
                                                                                                }                                                                                            
                                                                                                {
                                                                                                    item?.refcode?.length > 0 && (
                                                                                                        <React.Fragment>
                                                                                                            <Typography style={{ fontWeight: '600', fontSize: 'inherit' }}>
                                                                                                                {t('str_note')}
                                                                                                            </Typography>
                                                                                                            <Typography style={{ fontSize: 'inherit' }}>
                                                                                                                {state.selectGuestProductList[itemIndex]?.refcode}
                                                                                                            </Typography>
                                                                                                        </React.Fragment>
                                                                                                    )
                                                                                                }
                                                                                               
                                                                                            </div>
                                                                                        }
                                                                                    >
                                                                                        <InfoOutlinedIcon style={{ fontSize: '16px' }} />
                                                                                    </CustomToolTip>
                                                                                )}
                                                                            </a>
                                                                        </Typography>
                                                                    </div>
                                                                </div>
                                                            </Grid>
                                                            <Grid item xs={2}>
                                                                <Typography className={classes.reservationCardText} style={{ textAlign: 'right' }}>x {item.amount}</Typography>
                                                            </Grid>
                                                            <Grid item xs={3}>
                                                                <Typography className={classes.reservationCardText} style={{ textAlign: 'right' }}>
                                                                    {(item.price > 0) ? formatMoney(item.price) : ' - '}{getSymbolFromCurrency(item.pricecurr)}
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>
                                                    </div>
                                                )): (
                                                    <Alert severity="info">
                                                        {t('str_thereAreNoProductsInYourCart')}
                                                    </Alert>
                                                )}
                                            </Grid>
                                            {state.selectGuestProductList.length > 0 && (
                                                <React.Fragment>
                                                    <Grid item xs={12}>
                                                        <div style={{ padding: "4px 0" }}>
                                                            <Divider />
                                                        </div>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Grid container>
                                                            <Grid item xs={6}>
                                                                <Typography className={classes.totalPriceText}>{t("str_total")}</Typography>
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <Typography className={classes.totalPriceText} style={{ textAlign: "right" }}>
                                                                    {formatMoney(totalPrice().total)}{getSymbolFromCurrency(totalPrice().curr)}
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                </React.Fragment>
                                            )}
                                        </Grid>
                                    </CardContent>
                                </Card>
                                <div style={{ paddingTop: '16px', textAlign: 'right' }}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                                <CustomToolTip
                                                    title={t('str_pleaseSelectAtLeastSelectOneProduct')}
                                                    open={openTooltip}
                                                    onOpen={() => state.selectGuestProductList.length <= 0 && setOpenTooltip(true)}
                                                    onClose={() => setOpenTooltip(false)}
                                                >
                                                    <span>
                                                        <Button
                                                            fullWidth
                                                            disabled={state.selectGuestProductList.length <= 0 || isSaving}
                                                            color={'primary'}
                                                            startIcon={isSaving ? <LoadingSpinner size={16} /> : <CheckIcon />}
                                                            variant={'contained'}
                                                            onClick={() => state.selectGuestProductList.length >= 0 ? !isLogin ? handleOpenLoginDialog() : handleSave(true) : {}}
                                                        >
                                                            {t('str_confirmOrder')}
                                                        </Button>
                                                    </span>
                                                </CustomToolTip>
                                        </Grid>
                                        {(tableNo && !isLogin) ? (
                                            <Grid item xs={12}>
                                                <CustomToolTip
                                                    title={t('str_pleaseSelectAtLeastSelectOneProduct')}
                                                    open={openTooltip2}
                                                    onOpen={() => state.selectGuestProductList.length <= 0 && setOpenTooltip2(true)}
                                                    onClose={() => setOpenTooltip2(false)}
                                                >
                                                <span>
                                                    <Button
                                                        fullWidth
                                                        disabled={state.selectGuestProductList.length <= 0 || isSaving}
                                                        color={'primary'}
                                                        startIcon={isSaving ? <LoadingSpinner size={16} /> :
                                                            <CheckIcon />}
                                                        variant={'contained'}
                                                        onClick={() => handleSave(false)}
                                                    >
                                                            {t('str_confirmOrderWithoutLogin')}
                                                    </Button>
                                                </span>
                                                </CustomToolTip>
                                            </Grid>
                                        ) : null}
                                    </Grid>                                   
                                </div>
                            </Grid>
                        </Grid>
                    )}
                </Container>
                <PayDialog
                    open={isOpenPaymentDialog}
                    transGid={posSlipData?.gid || null}
                    transId={posSlipData?.transno || null}
                    onFinish={() => {
                        setIsOpenPaymentDialog(false)
                        enqueueSnackbar(t('str_processCompletedSuccessfully'), { variant: 'success' })
                        setIsOrderComplete(true)
                    }}
                />
                <ExtraDialog
                    open={openPropsDialog}
                    onClose={() => setOpenPropsDialog(false)}
                    product={selectedProduct}
                />
                {isOpenLoginDialog ? (
                    <LoginDialog open={isOpenLoginDialog} onClose={(status) => setIsOpenLoginDialog(status)} locationName='guest' isLoginWrapper disableRegister />
                ): null}
            </DialogContent>                 
        </Dialog>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value))
})

export default connect(mapStateToProps, mapDispatchToProps)(OrderDialog)