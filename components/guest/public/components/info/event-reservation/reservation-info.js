import React, { useContext } from "react";
import { makeStyles } from '@material-ui/core/styles'
import {
    IconButton,
    Typography,
    Card,
    CardMedia,
    CardContent,
    Button,
    Grid,
} from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import PeopleIcon from '@material-ui/icons/People';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import moment from 'moment'
import WebCmsGlobal from "../../../../../webcms-global";
import useTranslation from "../../../../../../lib/translations/hooks/useTranslation";
import RestaurantReservationSummary from "./restaurant-reservation-summary";

const useStyles = makeStyles((theme) => ({
    title: {
        fontSize: "38px",
        fontWeight: "600",
        color: "#122D31"
    },
    sliderDesc: {
        paddingTop: "16px",
        color: "#122D31"
    },
    dateTitle: {
        paddingBottom: "24px",
        fontSize: "18px",
        fontWeight: "500",
        color: "#778486"
    },
    cardContent: {
        padding: "48px 24px 0 24px"
    },
    reservationCardTitle: {
        paddingBottom: "16px",
        fontSize: "18px",
        fontWeight: "600",
        color: "#122D31"
    },
    reservationCardText: {
        fontSize: "12px",
        color: "#122D31"
    },
    reservationCardIcon: {
        marginRight: "8px",
        fontSize: "16px"
    }

}))

export default function ReservationInfo(props) {
    const classes = useStyles();
    const { date, time, adult, child, sliderTitle, sliderDesc, sliderImg } = props;

    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { t } = useTranslation();

    return(
        <React.Fragment>
            <div style={{paddingTop: "48px"}}/>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={7} style={{alignItems: "center"}}>
                    <Typography className={classes.dateTitle}>{date && moment(date).format("DD [ ] MMMM [ ] YYYY, dddd")}</Typography>
                    <Typography className={classes.title}>{sliderTitle && sliderTitle}</Typography>
                    <Typography className={classes.sliderDesc}>{sliderDesc && sliderDesc}</Typography>
                </Grid>
                <Grid item xs={12} sm={5}>
                    <img src={GENERAL_SETTINGS.STATIC_URL + sliderImg} style={{width: "100%", borderRadius: "8px"}}/>
                </Grid>
                <Grid item xs={12} sm={7}>
                </Grid>
                <Grid item xs={12} sm={5}>
                  <RestaurantReservationSummary
                      date={date}
                      adult={adult}
                      child={child}
                      time={time}
                      companyTitle={sliderTitle}
                      isHaveProductList={false}
                  />
                </Grid>
            </Grid>
        </React.Fragment>
    )
}