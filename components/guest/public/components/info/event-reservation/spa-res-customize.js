import React, { useContext } from "react";
import { makeStyles } from '@material-ui/core/styles'
import {
    Typography,
    Grid,
} from '@material-ui/core'
import moment from 'moment'
import WebCmsGlobal from "../../../../../webcms-global";
import useTranslation from "../../../../../../lib/translations/hooks/useTranslation";
import RestaurantReservationSummary from "./restaurant-reservation-summary";
import {connect, useSelector} from "react-redux";
import {setToState, updateState} from "../../../../../../state/actions";
import Confirmation from "./confirmation";
import SpaMenu from "./spa-menu";

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

function SpaResCustomizeStep(props) {
    const classes = useStyles();
    const { date, time, adult, sliderTitle, sliderDesc, sliderImg, event, eventLocData, objLogInfo, setLocPrice, isConfirmLoad, isHaveProductList, selectedProductList, setToState } = props;



    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { t } = useTranslation();

    return(
        <React.Fragment>
            <div style={{paddingTop: "48px"}}/>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={7} style={{alignItems: "center"}}>
                    <Typography className={classes.dateTitle}>{date && moment(date).format("DD [ ] MMMM [ ] YYYY, dddd")}</Typography>
                    <Typography className={classes.title}>{sliderTitle && sliderTitle}</Typography>
                    {sliderDesc && <Typography className={classes.sliderDesc}>{sliderDesc}</Typography>}
                    <div style={{padding: 16}}/>
                </Grid>
                <Grid item xs={12} sm={5}>
                    <img src={GENERAL_SETTINGS.STATIC_URL + sliderImg} style={{width: "100%", borderRadius: "8px"}}/>
                </Grid>
                <Grid item xs={12}>
                    <Typography className={classes.sliderDesc}>{t('str_customizeYourTherapy')}</Typography>
                </Grid>
                <Grid item xs={12} sm={7}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={12}>
                            <SpaMenu />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={5}>
                    <RestaurantReservationSummary
                        date={date}
                        adult={adult}
                        child={false}
                        time={time}
                        companyTitle={sliderTitle}
                        isSpaRes
                        isHaveProductList={isHaveProductList}
                        selectedProductList={selectedProductList}
                        setToState={setToState}
                    />
                    <div style={{paddingTop: '16px'}}>
                        <Confirmation
                            event={event}
                            eventLocData={eventLocData}
                            objLogInfo={objLogInfo}
                            isConfirmLoad={(e)=> isConfirmLoad(e)}
                            setLocPrice={(price) => setLocPrice(price)}
                        />
                    </div>
                </Grid>
            </Grid>
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(SpaResCustomizeStep)