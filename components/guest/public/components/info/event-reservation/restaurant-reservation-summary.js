import React, { useContext, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
    Typography,
    Card,
    CardContent,
    Grid,
    Divider,
    IconButton
} from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import PeopleIcon from '@material-ui/icons/People'
import CalendarTodayIcon from '@material-ui/icons/CalendarToday'
import FastfoodIcon from '@material-ui/icons/Fastfood'
import SpaIcon from '@material-ui/icons/Spa'
import moment from 'moment'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { formatMoney, OREST_ENDPOINT } from 'model/orest/constants'
import DeleteIcon from '@material-ui/icons/Delete'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import { CustomToolTip } from 'components/user-portal/components/CustomToolTip/CustomToolTip'
import * as global from '@webcms-globals'
import getSymbolFromCurrency from 'model/currency-symbol'
import WebCmsGlobal from 'components/webcms-global'
import { Delete } from '@webcms/orest'
import { useSelector } from 'react-redux'

const useStyles = makeStyles(() => ({
    cardContent: (props) =>  ({
        padding: "0 24px",
        '&.MuiCardContent-root:last-child': {
            paddingBottom: props.removeLastChildPadding ? '0' : '24px'
        }
    }),
    reservationCardTitle: {
        paddingTop: '48px',
        paddingBottom: "16px",
        fontSize: "18px",
        fontWeight: "600",
        color: "#122D31"
    },
    reservationCardText: {
        fontSize: "13px",
        color: "#122D31"
    },
    reservationCardIcon: {
        marginRight: "8px",
        fontSize: "16px"
    },
    totalPriceText: {
        fontSize: "18px",
        fontWeight: "600",
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
    }
}))

export default function RestaurantReservationSummary(props) {
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
        , { companyTitle, adult, child, date, time, selectedProductList, isHaveProductList, elevation, isHideTitle, removeLastChildPadding, isSpaRes, setToState, eventResTotals, onUpdatePrice } = props
        , classes = useStyles({removeLastChildPadding: removeLastChildPadding})
        , token = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false)
        , [isLoading, setIsLoading] = useState(false)
        , { t } = useTranslation()

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

    const handleRemoveItem = async (removeItem) => {
        if(removeItem){
            setIsLoading(true)
            const isDone = await deleteEventMenu(removeItem.gid, removeItem.hotelrefno)
            if(isDone){
                await onUpdatePrice()
                const newList = selectedProductList.filter(item => item?.productcodeid !== removeItem?.productcodeid)
                setToState('guest', ['selectGuestProductList'], newList)
                setIsLoading(false)
            }else{
                setIsLoading(false)
            }
        }
    }

    return(
        <Card elevation={String(elevation) || 1}>
            <CardContent className={classes.cardContent}>
                <Grid container spacing={1}>
                    {!isHideTitle ? (
                        <Grid item xs={12}>
                            <Typography className={classes.reservationCardTitle}>{t('str_reservationSummary')}</Typography>
                        </Grid>
                    ): null}
                    <Grid item xs={12}>
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <Typography className={classes.reservationCardText}>
                                    <SearchIcon className={classes.reservationCardIcon}/>
                                    {companyTitle && t(companyTitle) || ""}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography className={classes.reservationCardText}>
                                    <PeopleIcon className={classes.reservationCardIcon}/>
                                    {adult && adult > 0 ? `${adult} ${t("str_adult")}` : ""}
                                    {child && child > 0 ? `, ${child} ${t("str_child")}`: ""}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography className={classes.reservationCardText}>
                                    <CalendarTodayIcon className={classes.reservationCardIcon}/>
                                    {date && moment(date).format("DD.MM.YYYY") + " / "}
                                    {time && moment(time, "HH:mm:ss").format("HH:mm")}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    {isHaveProductList ? (
                            <React.Fragment>
                                <Grid item xs={12}>
                                    <div style={{paddingTop: "24px"}}>
                                        {selectedProductList && selectedProductList.length > 0 && selectedProductList.map((item, itemIndex) => {
                                            return(
                                                <div className={classes.productListContainer} key={itemIndex}>
                                                    <Grid container>
                                                        <Grid item xs={7}>
                                                            <div className={classes.productDeleteIcon}>
                                                                <IconButton
                                                                    disabled={isLoading}
                                                                    onClick={() => handleRemoveItem(item)}
                                                                    style={{padding: 0}}
                                                                    size={'small'}
                                                                >
                                                                    <DeleteIcon style={{fontSize: '16px', color: 'red'}}/>
                                                                </IconButton>
                                                            </div>
                                                            <div className={classes.reservationCardIconContainer}>
                                                                <div className={classes.productListIconContainer}>
                                                                    {isSpaRes ? <SpaIcon className={classes.reservationCardIcon}/> : <FastfoodIcon className={classes.reservationCardIcon}/>}
                                                                </div>
                                                                <div style={{display: 'flex', alignItems: 'center', position: 'relative'}}>
                                                                    <Typography className={classes.reservationCardText}>
                                                                        {item.title}
                                                                        <a>
                                                                            {item?.note && item.note?.length > 0 && (
                                                                                <CustomToolTip title={item.note}>
                                                                                    <InfoOutlinedIcon style={{fontSize: '16px'}}/>
                                                                                </CustomToolTip>
                                                                            )}
                                                                        </a>
                                                                    </Typography>
                                                                </div>
                                                            </div>
                                                        </Grid>
                                                        <Grid item xs={2}>
                                                            <Typography className={classes.reservationCardText} style={{textAlign: 'right'}}>x {item.amount}</Typography>
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            {item?.showprice ? (
                                                                <Typography className={classes.reservationCardText} style={{ textAlign: 'right' }}>
                                                                    {(item.price > 0) ? formatMoney(item.amount * item.price) : ' - '}{getSymbolFromCurrency(item.pricecurr)}
                                                                </Typography>
                                                            ) : null}
                                                        </Grid>
                                                    </Grid>
                                                </div>
                                            )
                                        })}

                                        {eventResTotals?.locpricehc && eventResTotals.locpricehc > 0 ? (
                                            <React.Fragment>
                                                <Grid item xs={12}>
                                                    <div style={{padding: "8px 0"}}>
                                                        <Divider/>
                                                    </div>
                                                </Grid>
                                                <div className={classes.productListContainer}>
                                                    <Grid container>
                                                        <Grid item xs={7}>
                                                            <div className={classes.reservationCardIconContainer}>
                                                                <div style={{display: 'flex', alignItems: 'center', position: 'relative'}}>
                                                                    <Typography className={classes.reservationCardText}>
                                                                        {t('str_additionalCharges')}
                                                                    </Typography>
                                                                </div>
                                                            </div>
                                                        </Grid>
                                                        <Grid item xs={2}>
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            <Typography className={classes.reservationCardText} style={{textAlign: 'right'}}>
                                                                {global.helper.formatPrice(eventResTotals.locpricehc)}{getSymbolFromCurrency(eventResTotals.homecurr)}
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                </div>
                                            </React.Fragment>
                                        ): null}
                                    </div>
                                </Grid>
                                {eventResTotals?.totalpricehc && eventResTotals.totalpricehc > 0 ? (
                                    <React.Fragment>
                                        <Grid item xs={12}>
                                            <div style={{padding: "4px 0"}}>
                                                <Divider/>
                                            </div>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Grid container>
                                                <Grid item xs={6}>
                                                    <Typography className={classes.totalPriceText}>{t("str_total")}</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography className={classes.totalPriceText} style={{textAlign: "right"}}>
                                                        {formatMoney(eventResTotals.totalpricehc)}{getSymbolFromCurrency(eventResTotals.homecurr)}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </React.Fragment>
                                ): null}
                            </React.Fragment>
                        ) : null
                    }
                </Grid>
            </CardContent>
        </Card>
    )
}