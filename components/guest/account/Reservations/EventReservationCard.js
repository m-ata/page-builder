import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styles from './style/ReservationCard.style'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Divider from '@material-ui/core/Divider'
import LoadingSpinner from 'components/LoadingSpinner'
import moment from 'moment'
import PaxImage from 'assets/img/loyalty/reservation/pax.svg'
import PaxImageActive from 'assets/img/loyalty/reservation/pax-active.svg'
import ChildImage from 'assets/img/loyalty/reservation/child.svg'
import ChildImageActive from 'assets/img/loyalty/reservation/child-active.svg'
import BabyImage from 'assets/img/loyalty/reservation/baby.svg'
import BabyImageActive from 'assets/img/loyalty/reservation/baby-active.svg'
import { makeStyles } from '@material-ui/core/styles'
import stylesTabPanel from '../style/TabPanel.style'
import useTranslation from 'lib/translations/hooks/useTranslation'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Fade from '@material-ui/core/Fade'
import IconButton from '@material-ui/core/IconButton'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import CloseIcon from '@material-ui/icons/Close'
import ListItemIcon from '@material-ui/core/ListItemIcon'

const useStyles = makeStyles(styles)
const useStylesTabPanel = makeStyles(stylesTabPanel)

export default function EventReservationCard(props) {
    const { event, fullWidth, hideStatus, isCancel, cancelReservation } = props
    const classes = useStyles()
    const classesTabPanel = useStylesTabPanel()
    const { t } = useTranslation()

    const [anchorEl, setAnchorEl] = useState(null)
    const open = Boolean(anchorEl)

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null);
    }

    if (!event) {
        return <LoadingSpinner />
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

    return (
        <Grid item xs={12} sm={fullWidth ? 12 : 6} className={classesTabPanel.gridItem}>
            <Grid container justify={'space-between'} alignItems={'center'} className={classes.paper}>
                <Grid item xs={12} className={classes.resGridItems}>
                    {(event.status === 'A' && isCancel && !hideStatus) && (
                        <IconButton
                            className={classes.ctxMenu}
                            aria-label="ctx-menu"
                            aria-controls="ctx-menu"
                            aria-haspopup="true"
                            onClick={handleClick}
                        >
                            <MoreVertIcon />
                        </IconButton>
                    )}
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
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <Typography variant="button" noWrap display="inline" gutterBottom>
                                                {event.hotelname}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle1" display="inline" gutterBottom>
                                               {event.localtitle && t(event.localtitle) || event.description && t(event.description)}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    <Grid container spacing={3} style={{ display: hideStatus ? 'none' : 'block' }}>
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
                                                {t(renderReservStatus(event.status))}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12}>
                                    <Grid container spacing={2}>
                                        <Grid item>
                                            <Typography className={classes.textStylePaxNumbers}>
                                                {event.totalpax}
                                                <img
                                                    src={event.totalpax && event.totalpax > 0 ? PaxImageActive : PaxImage}
                                                    className={classes.paxImage}
                                                    alt="pax"
                                                />
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography className={classes.textStylePaxNumbers}>
                                                {event.totalchd}
                                                <img
                                                    src={
                                                        event.totalchd && event.totalchd > 0
                                                            ? ChildImageActive
                                                            : ChildImage
                                                    }
                                                    className={classes.paxImage}
                                                    alt="child"
                                                />
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography className={classes.textStylePaxNumbers}>
                                                {event.totalbaby}
                                                <img
                                                    src={
                                                        event.totalbaby && event.totalbaby > 0
                                                            ? BabyImageActive
                                                            : BabyImage
                                                    }
                                                    className={classes.paxImage}
                                                    alt="baby"
                                                />
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
                                            <Typography className={classes.textStyleCheckInOut}>
                                                {t('str_date')}
                                            </Typography>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <Typography className={classes.textStyleDay}>
                                                {moment(event.startdate).format('D')}
                                            </Typography>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <Typography className={classes.textStyleMonth}>
                                                {moment(event.startdate).format('MMM')}
                                            </Typography>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <Typography className={classes.textStyleYear}>
                                                {moment(event.startdate).format('YYYY')}
                                            </Typography>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <Typography className={classes.textStyleDayText}>
                                                {moment(event.startdate).format('ddd')}
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
                                            <Typography className={classes.textStyleCheckInOut}>
                                                {t('str_time')}
                                            </Typography>
                                        </ListItem>
                                        <ListItem className={classes.listItem}>
                                            <Typography className={classes.textStyleMonth}>
                                                {event.starttime}
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
                <MenuItem onClick={() => { cancelReservation(event.reservno); handleClose(); }}>
                    <ListItemIcon>
                        <CloseIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="inherit">{t('str_cancelEvent')}</Typography>
                </MenuItem>
            </Menu>
        </Grid>
    )
}

EventReservationCard.defaultProps = {
    fullWidth: false,
}

EventReservationCard.propTypes = {
    fullWidth: PropTypes.bool,
    event: PropTypes.object,
}
