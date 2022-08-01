import React, { useContext } from "react";
import { makeStyles } from '@material-ui/core/styles'
import CheckIcon from '@material-ui/icons/Check';
import WebCmsGlobal from "../../../../../webcms-global";
import useTranslation from "../../../../../../lib/translations/hooks/useTranslation";
import {
    IconButton,
    Typography,
    Card,
    CardMedia,
    CardContent,
    Button,
    Grid,
    Box
} from '@material-ui/core'
import moment from 'moment'
import * as global from "../../../../../../@webcms-globals";
import getSymbolFromCurrency from "../../../../../../model/currency-symbol";
import {formatMoney} from "../../../../../../model/orest/constants";


const useStyles = makeStyles((theme) => ({
    title: {
        paddingTop: "24px",
        fontSize: "24px",
        fontWeight: "600",
        color: "#3E696F",
        [theme.breakpoints.down('sm')]: {
            paddingTop: "0",
            textAlign:'center',
            fontSize: '20px'
        },
    },
    confirmField: {
        backgroundColor:"#9CD294",
        padding: "24px 0",
        borderRadius: "8px"
    },
    confirmText: {
        [theme.breakpoints.down('sm')]: {
            textAlign:'center',
            paddingTop: '8px'
        },
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
            fontSize: '16px'
        },
    },
    qrImageStyle: {
        margin: '-24px',
        [theme.breakpoints.down('xs')]: {
            margin: '0',
        },
    },
    sliderImageStyle: {
        width: "100%",
        position: "relative",
        height: "100%",
        backgroundSize:"cover",
        backgroundPosition:"center",
        backgroundRepeat:"no-repeat",
        [theme.breakpoints.down("sm")]: {
            height: "386px",
        },
    },
    menuText: {
        fontSize: "18px",
        fontWeight: "600",
        color: "#122D31",
        [theme.breakpoints.down('sm')]: {
            fontSize: '12px'
        },
    }
}))

export default function ConfirmInfo(props) {

    const classes = useStyles()
    const { reservationNo, sliderTitle, sliderImg, adult, child, date, time , guestDisc, qrImage, isFromQrPayment, productList, isSpaRes, eventResTotals } = props;
    const { GENERAL_SETTINGS, locale } = useContext(WebCmsGlobal)
    const { t } = useTranslation()

    return(
        <Grid container spacing={2}>
            <Grid item xs={12} sm={qrImage ? 9 : 12}>
                <Grid container className={classes.confirmField}>
                    <Box
                        component={Grid}
                        style={{textAlign: 'center', paddingBottom: '8px'}}
                        item
                        xs={12}
                        display={{xs: 'block', sm: 'none' }}
                    >
                        <CheckIcon style={{width: "3em", height: "3em", border: "1px solid #4CAD63", borderRadius: "50%", color: "#4CAD63"}}/>
                    </Box>
                    <Grid item xs={12}>
                        <Typography variant="h6" align="center">
                            {t('str_resNo') + global.common.strEmpty}
                            {global.common.strHastag}
                            {reservationNo}
                        </Typography>
                    </Grid>
                    <Box
                        component={Grid}
                        style={{textAlign: 'center'}}
                        item
                        xs={2}
                        display={{xs: 'none', sm: 'block'}}
                    >
                        <CheckIcon style={{width: "3em", height: "3em", border: "1px solid #4CAD63", borderRadius: "50%", color: "#4CAD63"}}/>
                    </Box>
                    <Grid item xs={12} sm={10} style={{alignItems: 'center', display: 'flex'}}>
                        <Typography className={classes.confirmText}>
                            {t('str_reservationSuccessAndCheckScreen')}
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
            {
                qrImage ? (
                    <Grid item xs={12} sm={3}>
                        {
                            qrImage && (
                                <Grid item xs={12} style={{textAlign: "center"}}>
                                    <img className={classes.qrImageStyle} src={qrImage}/>
                                </Grid>
                            )
                        }
                    </Grid>
                ) : null
            }
            <Grid item xs={12}/>
            <Grid item xs={12}>
                <Card>
                    <CardContent style={{padding: '0'}}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={3} >
                                <div className={classes.sliderImageStyle} style={sliderImg && {backgroundImage: `url(${GENERAL_SETTINGS.STATIC_URL + sliderImg})`} || {}}/>
                               {/* <img src={GENERAL_SETTINGS.STATIC_URL + sliderImg} style={{width: "100%"}}/>*/}
                            </Grid>
                            <Grid item xs={12} sm={9}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Typography className={classes.title}>{sliderTitle && t(sliderTitle)}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                        <Typography className={classes.cardTitle}>{t("str_guest")}</Typography>
                                        <Typography className={classes.cardText}>
                                            {adult && adult > 0 ? `${adult} ${isSpaRes ? t('str_ticket') : t("str_adult")}` : ""}
                                        </Typography>
                                        {child && child > 0 ? (
                                                <Typography className={classes.cardText}>
                                                    {`${child} ${t("str_child")}`}
                                                </Typography>
                                            ) : null
                                        }
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                        <Typography className={classes.cardTitle}>
                                            {t("str_date")}
                                        </Typography>
                                        <Typography className={classes.cardText}>
                                            {date && moment(date).format('L')}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                        <Typography className={classes.cardTitle}>
                                            {t("str_time")}
                                        </Typography>
                                        <Typography className={classes.cardText}>
                                            {time && moment(time, "HH:mm:ss").format("HH:mm")}
                                        </Typography>
                                    </Grid>
                                    {eventResTotals?.subtotalhc ? (
                                            <Grid item xs={12} sm={2}>
                                                <Typography className={classes.cardTitle}>
                                                    {t("str_price")}
                                                </Typography>
                                                <Typography className={classes.cardText}>
                                                    { eventResTotals?.subtotalhc > 0 && formatMoney(eventResTotals.subtotalhc) + getSymbolFromCurrency(eventResTotals.homecurr)}
                                                </Typography>
                                            </Grid>
                                        ) : null
                                    }
                                    {isFromQrPayment ? (
                                            <Grid item xs={12} sm={2}>
                                                <Typography className={classes.cardTitle}>
                                                    {t("str_discount")}
                                                </Typography>
                                                <Typography className={classes.cardText}>
                                                    {guestDisc && guestDisc > 0 ? `${guestDisc}%` : t('-')}
                                                </Typography>
                                            </Grid>
                                        ) : null
                                    }
                                    {eventResTotals?.totalpricehc > 0 ? (
                                            <Grid item xs={12} sm={2}>
                                                <Typography className={classes.cardTitle}>
                                                    {t("str_totalPrice")}
                                                </Typography>
                                                <Typography className={classes.cardText}>
                                                    {eventResTotals?.totalpricehc > 0 && formatMoney(eventResTotals.totalpricehc) + getSymbolFromCurrency(eventResTotals.homecurr)}
                                                </Typography>
                                            </Grid>
                                        ) : null
                                    }
                                    {productList && (
                                            <Grid item xs={12}>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={12}>
                                                        <Typography className={classes.cardTitle}>
                                                            {isSpaRes ? t('str_spa') : t("str_menu")}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Grid container>
                                                            {productList.map((item) => (
                                                                <Grid item xs={12}>
                                                                    <Typography className={classes.menuText}>
                                                                        {item?.title || ''}
                                                                    </Typography>
                                                                    {item?.note && item.note?.length > 0 && (
                                                                        <Typography style={{fontSize: '14px'}}>
                                                                            <a style={{fontWeight: '600'}}>{`${t('str_note')}:`}</a>
                                                                            {item.note}
                                                                        </Typography>
                                                                    )}
                                                                </Grid>
                                                           ))}
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        )
                                    }
                                    <Grid item xs={12}>
                                        <div style={{paddingBottom: '16px'}}/>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}