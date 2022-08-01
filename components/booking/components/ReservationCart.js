import React, { useEffect, useState, useRef } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import {
    IconButton,
    Grid,
    Typography,
    Button,
    Icon,
    Box,
    Badge,
    Divider
} from '@material-ui/core'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { setToState } from 'state/actions'
import { connect } from 'react-redux'
import RoomListItem from './RoomListItem'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import getSymbolFromCurrency from 'model/currency-symbol'
import * as global from '@webcms-globals'
import moment from 'moment'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import ProgressIconButton from './ProgressIconButton'
import { bookingStepCodes } from 'components/booking/commons'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        [theme.breakpoints.down('md')]: {
            position: 'fixed',
            background: '#fff',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            display: 'none',
        },
    },
    listRoot: {
        flexGrow: 1,
    },
    bottomMenu: {
        display: 'none',
        [theme.breakpoints.down('md')]: {
            display: 'block',
            position: 'fixed',
            left: 0,
            bottom: 0,
            zIndex: 3,
            width: '100%',
            padding: 15,
            background: '#f5f5f5',
            boxShadow: '0 -1px 5px 0px #00000047',
        },
    },
    wrapper: {
        margin: 'auto',
        backgroundColor: '#fff',
        border: '1px solid #dadadd',
        borderRadius: 6,
    },
    title: {
        fontWeight: 'bold',
    },
    description: {
        display: '-webkit-box',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        '-webkit-line-clamp': 2,
        '-webkit-box-orient': 'vertical',
        letterSpacing: 0,
    },
    thumbnail: {
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        width: '100%',
        height: '100%',
        minHeight: 222,
        borderRadius: 0,
    },
    rightColumn: {
        padding: 16,
    },
    attributeList: {
        display: 'inline-flex',
        padding: 0,
    },
    attributeItem: {
        position: 'relative',
        listStyleType: 'none',
        padding: '15px',
        borderRight: '1px solid #d2d2d26b',
        '&:last-child': {
            borderRight: 'none',
        },
    },
    attributeIcon: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        '-ms-transform': 'translate(-50%, -50%)',
        transform: 'translate(-50%, -50%)',
    },
    actionsContainer: {
        display: 'flex',
        alignItems: 'flex-end',
        '& > div': {
            textAlign: 'right',
        },
    },
    addRoomTitle: {
        paddingRight: 6,
    },
    addRoomButton: {
        padding: 6,
    },
    deleteRoomButton: {
        padding: 6,
    },
    addRoomTotal: {
        padding: 10,
        width: 50,
    },
    listItem: {
        marginTop: 8,
        marginBottom: 8,
        padding: theme.spacing(1, 0),
    },
    total: {
        fontWeight: 700,
    },
    otherSummary: {
        boxShadow: '0 0 0 1px #d2d2d26b',
        padding: 10,
        marginBottom: 20,
    },
    openReservationCard: {
        display: 'block!important',
        zIndex: 4,
    },
    continueButton: {
        display: 'block',
    },
    closeContinueButton: {
        display: 'none!important',
    },
    reservationSummary: {
        display: 'inline-block',
        marginTop: 7,
    },
    closeReservationSummary: {
        display: 'inline-block',
        float: 'right',
        [theme.breakpoints.up('md')]: {
            visibility: 'hidden',
        },
    },
    bottomMenuBadge: {
        width: '100%',
    },
    buttonPadding: {
        padding: 8
    },
    listItemAction:{
        flexGrow: 1,
        padding: '1px 10px 0px 0px',
        position: 'absolute',
        right: -7,
        top: -12,
        '& button[aria-label="close"]:not([disabled])': {
            color: '#a6a6a6',
            '-webkit-transition': 'color 0.4s',
            '-ms-transition': 'color 0.4s',
            transition: 'color 0.4s',
        },
        "&:hover": {
            '& button[aria-label="close"]:not([disabled])': {
                color: '#4d4d4d',
                '-webkit-transition': 'color 0.4s',
                '-ms-transition': 'color 0.4s',
                transition: 'color 0.4s',
            },
        }
    },
}))

const ReservationCart = (props) => {
    useEffect(() => window.addEventListener('scroll', () => handleScroll()), [])
    const reservationCart = useRef(null)
    const classes = useStyles()
    const { t } = useTranslation()
    const { state, setToState, handleNextStep, handleBackStep, bookingActiveStep, isDisabled } = props
    const [openReservationCart, setOpenReservationCart] = useState(false)

    const handleScroll = () => {
        const currentOffsetTop = reservationCart.current && reservationCart.current.getAttribute('lastOffsetTop') || reservationCart && reservationCart.current && reservationCart.current.offsetTop || false
        if (currentOffsetTop && window.pageYOffset > currentOffsetTop) {
            if (reservationCart.current && !reservationCart.current.getAttribute('lastOffsetTop')) {
                reservationCart.current.setAttribute('lastOffsetTop', reservationCart.current.offsetTop)
            }
            reservationCart.current.setAttribute('style', `position: fixed; top: 10px; width: ${reservationCart.current.offsetWidth}px;`)
        }else {
            if(reservationCart.current){
                reservationCart.current.removeAttribute('lastOffsetTop')
                reservationCart.current.removeAttribute('style')
            }
        }
    }

    const settings = {
        containerMaxWidth: 'lg',
        containerSpacing: 0,
        wrapper: {
            elevation: 3,
            square: true,
        },
        leftColumn: {
            xs: 12,
            sm: 12,
            md: 12,
            lg: 4,
            xl: 4,
        },
        rightColumn: {
            xs: 12,
            sm: 12,
            md: 12,
            lg: 8,
            xl: 8,
        },
    }

    const reservationInfo = () => {
        let totalPrice = 0
        state.selectedRooms.map((item) => {
            totalPrice = totalPrice + item.totalprice
        })

        if(state.flyTransferInfo){
            totalPrice = totalPrice + state.flyTransferInfo.priceInfo.res
        }

        if(state.flyTransferReturnInfo){
            totalPrice = totalPrice + state.flyTransferReturnInfo.priceInfo.res
        }

        return {
            totalPrice: totalPrice
        }
    }

    return (
        <React.Fragment>
            <div className={classes.bottomMenu}>
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <Badge color="secondary" variant="dot" className={classes.bottomMenuBadge} invisible={!(state.selectedRooms && state.selectedRooms.length > 0)}>
                            <Button
                                disabled={isDisabled}
                                className={classes.buttonPadding}
                                variant="outlined"
                                color="primary"
                                disableElevation
                                fullWidth
                                onClick={() => setOpenReservationCart(true)}
                            >
                                {t('str_yourStay')} ({state.diffCurrency.use ?  getSymbolFromCurrency(state.diffCurrency.use) : state.hotelBookingInfo.currencycode && getSymbolFromCurrency(state.hotelBookingInfo.currencycode)} {global.helper.formatPrice(reservationInfo().totalPrice)})
                            </Button>
                        </Badge>
                    </Grid>
                    <Grid item xs={6}>
                        <Button
                            className={classes.buttonPadding}
                            color="primary"
                            disableElevation
                            fullWidth
                            onClick={() => handleBackStep()}
                            disabled={isDisabled || state.isHandleContinue || !(state.selectedRooms && state.selectedRooms.length > 0)}
                            startIcon={<ArrowBackIcon />}
                        >
                            {t('str_back')}
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button
                            className={classes.buttonPadding}
                            variant="contained"
                            color="primary"
                            disableElevation
                            fullWidth
                            onClick={() => handleNextStep()}
                            disabled={isDisabled || !(state.isHandleContinue || state.selectedRooms && state.selectedRooms.length > 0)}
                            endIcon={<ArrowForwardIcon />}
                        >
                            {t('str_continue')}
                        </Button>
                    </Grid>
                </Grid>
            </div>
            <div className={clsx(classes.root, { [classes.openReservationCard]: openReservationCart })}>
                <Box p={2} className={classes.wrapper} ref={reservationCart}>
                    <Grid container spacing={settings.containerSpacing}>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom className={classes.reservationSummary}>
                                {t('str_yourStay')}
                            </Typography>
                            <IconButton edge="end" color="inherit" aria-label="close" onClick={() => setOpenReservationCart(false)} className={classes.closeReservationSummary}>
                                <Icon>close</Icon>
                            </IconButton>
                        </Grid>
                        <Grid item xs={12}>
                            <List className={classes.listRoot}>
                                {state.selectedRooms && state.selectedRooms.length > 0 && state.selectedRooms.map((item, i) => (
                                    <RoomListItem
                                        key={i}
                                        roomtypeId={item.roomtypeid}
                                        roomName={item.roomtypename}
                                        checkin={item.checkin}
                                        checkout={item.checkout}
                                        pax={item.totalpax}
                                        child={item.totalchd}
                                        night={item.totalnight}
                                        price={item.totalprice}
                                        pricecurr={item.pricecurr}
                                        gid={item.gid}
                                        reservno={item.reservno}
                                        dailyrate={item.dailyrate}
                                    />
                                ))}
                            </List>
                        </Grid>
                        <Grid item xs={12}>
                            <List disablePadding className={classes.otherSummary}>
                                {state.flyTransfer && state.flyTransferInfo && (
                                    <React.Fragment>
                                        <ListItem className={classes.listItem}>
                                            <ListItemText primary={t('str_arrivalTransfer')} secondary={`${moment(state.flyTransferInfo.flydate, 'YYYY-MM-DD').format('dd, MMM DD, YYYY')} - ${moment(state.flyTransferInfo.flytime, "HH:mm:ss").format("HH:mm")}`}/>
                                            <Typography variant="body2">
                                                {getSymbolFromCurrency(state.flyTransferInfo.priceInfo.pricecurr)} {global.helper.formatPrice(state.flyTransferInfo.priceInfo.res)}
                                            </Typography>
                                            <div className={classes.listItemAction}>
                                                <ProgressIconButton edge="end" ariaLabel="close" onClick={() => {
                                                    setToState("ibe", ["flyTransfer"], false)
                                                    setToState("ibe", ["flyTransferInfo"], false)
                                                }}>
                                                    <Icon fontSize="small">close</Icon>
                                                </ProgressIconButton>
                                            </div>
                                        </ListItem>
                                        <Divider component="li"/>
                                    </React.Fragment>
                                )}
                                {state.flyTransferReturn && state.flyTransferReturnInfo && (
                                    <React.Fragment>
                                        <ListItem className={classes.listItem}>
                                            <ListItemText primary={t('str_departureTransfer')} secondary={`${moment(state.flyTransferReturnInfo.flydate, 'YYYY-MM-DD').format('dd, MMM DD, YYYY')} - ${moment(state.flyTransferReturnInfo.flytime, "HH:mm:ss").format("HH:mm")}`}/>
                                            <Typography variant="body2">
                                                {getSymbolFromCurrency(state.flyTransferReturnInfo.priceInfo.pricecurr)} {global.helper.formatPrice(state.flyTransferReturnInfo.priceInfo.res)}
                                            </Typography>
                                            <div className={classes.listItemAction}>
                                                <ProgressIconButton edge="end" ariaLabel="close" onClick={() => {
                                                    setToState("ibe", ["flyTransferReturn"], false)
                                                    setToState("ibe", ["flyTransferReturnInfo"], false)
                                                }}>
                                                    <Icon fontSize="small">close</Icon>
                                                </ProgressIconButton>
                                            </div>
                                        </ListItem>
                                        <Divider component="li"/>
                                    </React.Fragment>
                                )}
                                <ListItem className={classes.listItem}>
                                    <ListItemText primary={t('str_total')}/>
                                    <Typography variant="subtitle1" className={classes.total}>
                                        {state.diffCurrency.use ? getSymbolFromCurrency(state.diffCurrency.use) : state.hotelBookingInfo.currencycode && getSymbolFromCurrency(state.hotelBookingInfo.currencycode)} {global.helper.formatPrice(reservationInfo().totalPrice)}
                                    </Typography>
                                </ListItem>
                            </List>
                        </Grid>
                        {(bookingActiveStep === bookingStepCodes.rooms || bookingActiveStep === bookingStepCodes.addons) && (
                            <Grid item xs={12} className={clsx(classes.continueButton, { [classes.closeContinueButton]: openReservationCart })}>
                                <Button fullWidth onClick={() => handleNextStep()} variant="contained" color="primary" disableElevation disabled={isDisabled || state.bookingIsLoading}>
                                    {t('str_continueReservation')}
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </div>
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.ibe,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ReservationCart)
