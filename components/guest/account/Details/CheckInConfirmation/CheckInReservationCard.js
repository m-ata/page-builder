import React, {useContext} from 'react'
import styles from '../style/CheckInReservationCard.style'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Divider from '@material-ui/core/Divider'
import LoadingSpinner from 'components/LoadingSpinner'
import moment from 'moment'
import NumberFormat from 'react-number-format'
import getSymbolFromCurrency from 'model/currency-symbol'
import PaxImage from 'assets/img/loyalty/reservation/pax.svg'
import PaxImageActive from 'assets/img/loyalty/reservation/pax-active.svg'
import ChildImage from 'assets/img/loyalty/reservation/child.svg'
import ChildImageActive from 'assets/img/loyalty/reservation/child-active.svg'
import BabyImage from 'assets/img/loyalty/reservation/baby.svg'
import BabyImageActive from 'assets/img/loyalty/reservation/baby-active.svg'
import { makeStyles } from '@material-ui/core/styles'
import stylesTabPanel from '../../style/TabPanel.style'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { FULL_YEAR_INT, DAY_INT, SHORT_MOON_STR, SHORT_DAY_STR, EMPTY } from 'model/globals'
import WebCmsGlobal from 'components/webcms-global'

const useStyles = makeStyles(styles)
const useStylesTabPanel = makeStyles(stylesTabPanel)

export default function CheckInReservationCard({useReservation}) {
    const classes = useStyles()
    const classesTabPanel = useStylesTabPanel()

    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const currencyTypeSymbol = useReservation?.pricecurr && getSymbolFromCurrency(useReservation.pricecurr) || EMPTY
    const { t } = useTranslation()
    let visiblePrice = useReservation?.paytype === '1510100' ? true : false

    if (!useReservation) {
        return <LoadingSpinner />
    }

    return (
        <Grid item xs={12} className={classesTabPanel.gridItem}>
            <Grid container justify={'space-between'} alignItems={'center'} className={classes.paper}>
                <Grid item xs={12} sm={6} className={classes.resGridItems}>
                    <Grid container spacing={3} direction="column" className={classesTabPanel.gridContainer}>
                        <Grid item xs={12}>
                            <Typography gutterBottom variant="subtitle1" className={classes.hotel}>
                                {useReservation.hotelname}
                            </Typography>
                            {GENERAL_SETTINGS?.hotelSettings?.roomno ? (
                                <Typography gutterBottom variant="subtitle2" className={classes.roomNo}>
                                <span className={classes.roomNoText}>
                                    {t('str_roomNo')}{':'}
                                </span>
                                    {useReservation.roomno}
                                </Typography>
                            ): null}
                            {visiblePrice ? (
                                <React.Fragment>
                                    <NumberFormat
                                        value={useReservation.totalprice / useReservation.totalday}
                                        displayType={'text'}
                                        decimalScale={2}
                                        isNumericString={true}
                                        thousandSeparator={true}
                                        renderText={(value) => (
                                            <React.Fragment>
                                                <Typography
                                                    variant="body2"
                                                    display={'inline'}
                                                    gutterBottom
                                                    className={classes.textStyleDailyPrice}
                                                >
                                                    {currencyTypeSymbol}
                                                    {value} {!currencyTypeSymbol && useReservation.pricecurrcode}
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    display={'inline'}
                                                    gutterBottom
                                                    className={classes.textStyleDailyPriceNight}
                                                >
                                                    / {t('str_night')} X {' '}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    display={'inline'}
                                                    gutterBottom
                                                    className={classes.textStyleDailyPriceDay}
                                                >
                                                    {useReservation.totalday}
                                                </Typography>
                                            </React.Fragment>
                                        )}
                                    />
                                    <NumberFormat
                                        value={useReservation.totalprice}
                                        displayType={'text'}
                                        decimalScale={2}
                                        isNumericString={true}
                                        thousandSeparator={true}
                                        renderText={(value) => (
                                            <Typography
                                                variant="body2"
                                                color="textSecondary"
                                                className={classes.textStyleTotalPrice}
                                            >
                                                {currencyTypeSymbol}
                                                {value} {!currencyTypeSymbol && useReservation.pricecurrcode}
                                            </Typography>
                                        )}
                                    />
                                </React.Fragment>
                            ) : useReservation.totalday ? (
                                <React.Fragment>
                                    <Typography
                                        variant="body2"
                                        display={'inline'}
                                        gutterBottom
                                        className={classes.textStyleDailyPriceNight}
                                    >
                                        {t('str_night')} x
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        display={'inline'}
                                        gutterBottom
                                        className={classes.textStyleDailyPriceDay}
                                    >
                                        {useReservation.totalday}
                                    </Typography>
                                </React.Fragment>
                            ): null}
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={6} className={classes.resGridItems}>
                    <Grid container justify={'space-evenly'} alignItems={'center'} className={classes.cardContainer}>
                        <Grid item xs={12} sm={6}>
                            <Grid
                                container
                                spacing={3}
                                direction={'column'}
                                justify={'center'}
                                alignItems={'flex-start'}
                                className={classesTabPanel.gridContainer}
                            >
                                <Grid item xs={12}>
                                    <Grid container spacing={2}>
                                        <Grid item>
                                            <Typography className={classes.textStylePaxNumbers}>
                                                {useReservation.totalpax}
                                                <img src={useReservation.totalpax && useReservation.totalpax > 0 ? PaxImageActive : PaxImage} className={classes.paxImage} alt="pax" />
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography className={classes.textStylePaxNumbers}>
                                                {useReservation.totalchd}
                                                <img src={useReservation.totalchd && useReservation.totalchd > 0 ? ChildImageActive: ChildImage} className={classes.paxImage} alt="child" />
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography className={classes.textStylePaxNumbers}>
                                                {useReservation.totalbaby}
                                                <img src={useReservation.totalbaby && useReservation.totalbaby > 0 ? BabyImageActive : BabyImage} className={classes.paxImage} alt="baby" />
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12}>
                                    <Grid container spacing={1}>
                                        <Grid item xs={12}>
                                            <Typography
                                                display="inline"
                                                className={classes.textStyleLeftP}
                                            >
                                                {t('str_roomType')}{':'}
                                            </Typography>
                                            <Typography
                                                noWrap
                                                display="block"
                                                className={classes.textStyleRightP2}
                                            >
                                                {useReservation.bookedrtypedesc}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography
                                                display="inline"
                                                className={classes.textStyleLeftP}
                                            >
                                                {t('str_reservationNumber')}{':'}
                                            </Typography>
                                            <Typography
                                                noWrap
                                                display="block"
                                                className={classes.textStyleRightP2}
                                            >
                                                {useReservation.reservno}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Grid container justify={'center'} alignItems={'center'}>
                                <Grid item xs={5}>
                                    <List>
                                        <ListItem className={classes.listItem}>
                                            <Typography className={classes.textStyleCheckInOut}>Check - In</Typography>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <Typography className={classes.textStyleDay}>
                                                {moment(useReservation.checkin).format(DAY_INT)}
                                            </Typography>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <Typography className={classes.textStyleMonth}>
                                                {moment(useReservation.checkin).format(SHORT_MOON_STR)}
                                            </Typography>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <Typography className={classes.textStyleYear}>
                                                {moment(useReservation.checkin).format(FULL_YEAR_INT)}
                                            </Typography>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <Typography className={classes.textStyleDayText}>
                                                {moment(useReservation.checkin).format(SHORT_DAY_STR)}
                                            </Typography>
                                        </ListItem>
                                    </List>
                                </Grid>
                                <Grid item>
                                    <Divider className={classes.midDivider} orientation="vertical" />
                                </Grid>
                                <Grid item xs={5}>
                                    <List>
                                        <ListItem className={classes.listItem}>
                                            <Typography className={classes.textStyleCheckInOut}>Check - Out</Typography>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <Typography className={classes.textStyleDay}>
                                                {moment(useReservation.checkout).format(DAY_INT)}
                                            </Typography>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <Typography className={classes.textStyleMonth}>
                                                {moment(useReservation.checkout).format(SHORT_MOON_STR)}
                                            </Typography>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <Typography className={classes.textStyleYear}>
                                                {moment(useReservation.checkout).format(FULL_YEAR_INT)}
                                            </Typography>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <Typography className={classes.textStyleDayText}>
                                                {moment(useReservation.checkout).format(SHORT_DAY_STR)}
                                            </Typography>
                                        </ListItem>
                                    </List>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}
