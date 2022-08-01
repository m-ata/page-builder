import React, { useState } from 'react'
import styles from './style/ReservationCard.style'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Divider from '@material-ui/core/Divider'
import LoadingSpinner from '../../../LoadingSpinner'
import moment from 'moment'
import NumberFormat from 'react-number-format'
import getSymbolFromCurrency from '../../../../model/currency-symbol'
import PaxImage from '../../../../assets/img/loyalty/reservation/pax.svg'
import PaxImageActive from '../../../../assets/img/loyalty/reservation/pax-active.svg'
import ChildImage from '../../../../assets/img/loyalty/reservation/child.svg'
import ChildImageActive from '../../../../assets/img/loyalty/reservation/child-active.svg'
import BabyImage from '../../../../assets/img/loyalty/reservation/baby.svg'
import BabyImageActive from '../../../../assets/img/loyalty/reservation/baby-active.svg'
import { makeStyles } from '@material-ui/core/styles'
import stylesTabPanel from '../style/TabPanel.style'
import useTranslation from 'lib/translations/hooks/useTranslation'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Fade from '@material-ui/core/Fade'
import IconButton from '@material-ui/core/IconButton'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import CloseIcon from '@material-ui/icons/Close'
import RestoreIcon from '@material-ui/icons/Restore';
import ListItemIcon from '@material-ui/core/ListItemIcon'

const useStyles = makeStyles(styles)
const useStylesTabPanel = makeStyles(stylesTabPanel)

export default function RoomReservationCard(props) {
    const { reservation, cancelReservation, isCancel } = props
    const classes = useStyles()
    const classesTabPanel = useStylesTabPanel()
    const currencyTypeSymbol = getSymbolFromCurrency(reservation.pricecurr) || ''
    const { t } = useTranslation()

    if (!reservation) {
        return <LoadingSpinner />
    }

    const [anchorEl, setAnchorEl] = useState(null)
    const open = Boolean(anchorEl)

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null);
    }

    const renderReservStatus = (status) => {
        switch (status) {
            case "A":
                return 'str_future'
            case "I":
                return 'str_resInhouse'
            case "O":
                return 'str_resCheckedOut'
            case "X":
                return 'str_resCancelled'
            default:
                return 'str_unclear'
        }
    }

    let visiblePrice = reservation.paytype === '1510100'

    return (
        <Grid item xs={12} sm={6} className={classesTabPanel.gridItem}>
            <Grid container justify={'space-between'} alignItems={'center'} className={classes.paper}>
                <Grid item xs={12} className={classes.resGridItems}>
                    {(reservation.status === 'A' && isCancel) ? (
                        <IconButton
                            className={classes.ctxMenu}
                            aria-label="ctx-menu"
                            aria-controls="ctx-menu"
                            aria-haspopup="true"
                            onClick={handleClick}
                        >
                            <MoreVertIcon />
                        </IconButton>
                    ): null}
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
                                            <Typography variant="button">
                                                {reservation.hotelname}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    {reservation.totalpax || reservation.totalchd || reservation.totalbaby ?
                                    <Grid container spacing={2}>
                                        <Grid item>
                                            <Typography className={classes.textStylePaxNumbers}>
                                                {reservation.totalpax}
                                                <img src={reservation.totalpax && reservation.totalpax > 0 ? PaxImageActive : PaxImage} className={classes.paxImage} alt="pax" />
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography className={classes.textStylePaxNumbers}>
                                                {reservation.totalchd}
                                                <img src={reservation.totalchd && reservation.totalchd > 0 ? ChildImageActive : ChildImage} className={classes.paxImage} alt="child" />
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography className={classes.textStylePaxNumbers}>
                                                {reservation.totalbaby}
                                                <img src={reservation.totalbaby && reservation.totalbaby > 0 ? BabyImageActive : BabyImage} className={classes.paxImage} alt="baby" />
                                            </Typography>
                                        </Grid>
                                    </Grid>: null}
                                </Grid>
                                <Grid item xs={12}>
                                    <Grid container spacing={1}>
                                        <Grid item xs={12}>
                                            <Typography
                                                display={'inline'}
                                                gutterBottom
                                                className={classes.textStyleLeftP}
                                            >
                                                {t('str_status') + ': '}
                                            </Typography>
                                            <Typography
                                                noWrap
                                                gutterBottom
                                                display={'inline'}
                                                className={classes.textStyleRightP1}
                                            >
                                                {t(renderReservStatus(reservation.status))}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography
                                                display="inline"
                                                gutterBottom
                                                className={classes.textStyleLeftP}
                                            >
                                                {t('str_roomType') + ': '}
                                            </Typography>
                                            <Typography
                                                display="inline"
                                                gutterBottom
                                                className={classes.textStyleRightP1}
                                            >
                                                {reservation.roomtype || reservation.roomtypedesc}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography
                                                display={'inline'}
                                                gutterBottom
                                                className={classes.textStyleLeftP}
                                            >
                                                {t('str_confirmationNumber')}
                                            </Typography>
                                            <Typography
                                                noWrap
                                                display={'inline'}
                                                gutterBottom
                                                className={classes.textStyleRightP2}
                                            >
                                                {' '}{reservation.reservno}
                                            </Typography>
                                        </Grid>
                                        {visiblePrice && reservation.dailynetprice ?
                                            (<Grid item xs={12}>
                                                <NumberFormat
                                                    value={reservation.dailynetprice}
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
                                                                {value} {!currencyTypeSymbol && reservation.pricecurr || reservation.currency}
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                display={'inline'}
                                                                gutterBottom
                                                                className={classes.textStyleDailyPriceNight}
                                                            >
                                                                / {t('str_night')} x
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                display={'inline'}
                                                                gutterBottom
                                                                className={classes.textStyleDailyPriceDay}
                                                            >
                                                                {reservation.roomnight}
                                                            </Typography>
                                                        </React.Fragment>
                                                    )}
                                                />
                                                <NumberFormat
                                                    value={reservation.totalprice}
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
                                                            {value} {!currencyTypeSymbol && reservation.pricecurrcode}
                                                        </Typography>
                                                    )}
                                                />
                                            </Grid>): reservation.dailynetprice ? (
                                                <Grid item xs={12}>
                                                    <NumberFormat
                                                        value={reservation.dailynetprice}
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
                                                                    className={classes.textStyleDailyPriceNight}
                                                                >{t('str_night')} x
                                                                </Typography>
                                                                <Typography
                                                                    variant="body2"
                                                                    display={'inline'}
                                                                    gutterBottom
                                                                    className={classes.textStyleDailyPriceDay}
                                                                >
                                                                    {reservation.roomnight}
                                                                </Typography>
                                                            </React.Fragment>
                                                        )}
                                                    />
                                                </Grid>) : null}
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
                                                {moment(reservation.checkin).format('D')}
                                            </Typography>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <Typography className={classes.textStyleMonth}>
                                                {moment(reservation.checkin).format('MMM')}
                                            </Typography>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <Typography className={classes.textStyleYear}>
                                                {moment(reservation.checkin).format('YYYY')}
                                            </Typography>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <Typography className={classes.textStyleDayText}>
                                                {moment(reservation.checkin).format('ddd')}
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
                                                {moment(reservation.checkout).format('D')}
                                            </Typography>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <Typography className={classes.textStyleMonth}>
                                                {moment(reservation.checkout).format('MMM')}
                                            </Typography>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <Typography className={classes.textStyleYear}>
                                                {moment(reservation.checkout).format('YYYY')}
                                            </Typography>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <Typography className={classes.textStyleDayText}>
                                                {moment(reservation.checkout).format('ddd')}
                                            </Typography>
                                        </ListItem>
                                    </List>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <Menu
                id="ctx-menu-popup"
                anchorEl={anchorEl}
                keepMounted
                open={open}
                onClose={handleClose}
                TransitionComponent={Fade}
            >
                <MenuItem onClick={() => { cancelReservation(reservation.reservno, false); handleClose(); }}>
                    <ListItemIcon>
                        <CloseIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="inherit">{t('str_resActionCancel')}</Typography>
                </MenuItem>
                <MenuItem onClick={() => { cancelReservation(reservation.reservno, true); handleClose(); }}>
                    <ListItemIcon>
                        <RestoreIcon />
                    </ListItemIcon>
                    <Typography>{t('str_addChangeReason')}</Typography>
                </MenuItem>
            </Menu>
        </Grid>
    )
}
