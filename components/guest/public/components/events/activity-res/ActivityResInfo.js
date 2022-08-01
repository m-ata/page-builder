import React, { useEffect, useState } from "react";
import { makeStyles } from '@material-ui/core/styles'
import { Button, Card, CardContent, Container, Divider, Grid, IconButton, Typography } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search';
import CheckIcon from '@material-ui/icons/Check';
import { connect, useSelector } from 'react-redux'
import { setToState } from "../../../../../../state/actions";
import moment from "moment";
import useTranslation from "../../../../../../lib/translations/hooks/useTranslation";
import { formatMoney } from "../../../../../../@api/core/helpers";
import getSymbolFromCurrency from "../../../../../../model/currency-symbol";
import SpinEditV2 from "../../../../../../@webcms-ui/core/spin-edit-v2";
import { OREST_ENDPOINT } from "../../../../../../model/orest/constants";
import HorizontalList from "../../../../../HorizontalList";
import { CustomToolTip } from "../../../../../user-portal/components/CustomToolTip/CustomToolTip";
import { async } from "regenerator-runtime";
import { ViewList } from "@webcms/orest";

const useStyles = makeStyles((theme) => ({
    sliderTitle: {
        fontSize: '36px',
        fontWeight: '600'
    },
    sliderImage: {
        width: '100%',
        objectFit: 'fill',
        borderRadius: '4px'
    },
    dateText: {
        color: '#778486'
    },
    ticketText: {
        fontSize: '22px',
        fontWeight: '600'
    }
}))

function ActivityResInfo(props) {
    const classes = useStyles()

    const { t } = useTranslation()

    const { state, setToState } = props

    const [adultCount, setAdultCount] = useState(1)
    const [availableDates, setAvailableDates] = useState([])
    const [availableTimes, setAvailableTimes] = useState([])
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedTime, setSelectedTime] = useState(null)    


    useEffect(() => {
        if (state.selectedActivity) {
            const startDate = moment(state.selectedActivity.startdate)
            const endDate = moment(state.selectedActivity.enddate)
            const diffDate = endDate.diff(startDate, 'days')
            if(diffDate > 0) {
                for(let i = 0; i < diffDate; i++) {
                     
                }
            } else {
                setAvailableDates([{ item: moment(state.selectedActivity.startdate) }])
            }
            setAvailableTimes([{ item: moment(state.selectedActivity.starttime, 'HH:mm:ss') }])
        }       
    }, [state.selectedActivity])




    return(
        <Grid container spacing={3}>
            <Grid item xs={8}>
                <Typography className={classes.dateText}>{moment().format('LL')}</Typography> 
                <Typography className={classes.sliderTitle}>{state.selectedActivity?.localtitle || state.selectedActivity?.title}</Typography> 
                <Typography>{state.selectedActivity?.localdesc || state.selectedActivity?.description}</Typography>        
            </Grid>
            <Grid item xs={4}>
                {state.selectedActivity?.imageurl && (
                    <img className={classes.sliderImage} src={'https://beta.hotech.systems' + state.selectedActivity?.imageurl} />
                )}               
            </Grid>
            <Grid item xs={12} sm={8}>
                <Card>
                    <CardContent>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography className={classes.ticketText}>
                                    How Many Tickets do you need ?
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container spacing={2}>
                                    <Grid item xs sm md={7}>
                                        <Typography>{t('str_adult')}</Typography>
                                    </Grid>
                                    <Grid item xs sm md={3}>
                                        <Typography style={{ fontWeight:600, color: '#316401'}}>{formatMoney(state?.selectedActivity?.price)}{getSymbolFromCurrency(state?.selectedActivity?.currcode)}</Typography>
                                    </Grid>
                                    <Grid item xs sm md={2}>
                                        <SpinEditV2
                                            disabled={false}
                                            defaultValue={adultCount}
                                            size={'small'}
                                            min={1}
                                            max={99}
                                            onChange={async (value) => {
                                               setAdultCount(value)
                                            }}
                                        />
                                    </Grid>
                                </Grid>                               
                            </Grid>
                        </Grid>                      
                    </CardContent>
                </Card>               
            </Grid>
            <Grid item xs={12} sm={4}>
                <Card>
                    <CardContent>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography style={{fontSize: '18px', fontWeight: 600}}>{t('str_reservationSummary')}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography><SearchIcon/> {state.selectedActivity?.localtitle || state.selectedActivity?.title}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider />
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container spacing={2}>
                                    <Grid item xs sm={8}>
                                        <Typography style={{fontSize: 20, fontWeight: 600}}>{t('str_total')}</Typography>
                                    </Grid>    
                                    <Grid item xs sm={4}>
                                        <Typography style={{ fontWeight: 600 }}>
                                            {formatMoney(state?.selectedActivity?.price * adultCount)}{getSymbolFromCurrency(state?.selectedActivity?.currcode)}
                                        </Typography>
                                    </Grid>                                 
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>                                            
            </Grid>
            <Grid item xs={8}>
                <Card>
                    <CardContent>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography className={classes.ticketText}>{t('str_availableDates')}</Typography>
                            </Grid>
                            <Grid item xs={12}>                                
                                <HorizontalList
                                    showLeftButton
                                    showRightButton
                                    list={availableDates}
                                    value={selectedDate}
                                    fields={[
                                        {
                                            useMoment: true,
                                            name: 'item',
                                            convertFormat: OREST_ENDPOINT.DATEFORMAT,
                                            renderFormat: 'DD'
                                        },
                                        {
                                            useMoment: true,
                                            name: 'item',
                                            convertFormat: OREST_ENDPOINT.DATEFORMAT,
                                            renderFormat: 'ddd',
                                            uppercase: true
                                        }
                                    ]}
                                    onClick={(e) => {
                                        setSelectedDate(e)
                                    }}
                                />
                            </Grid>
                            {
                                selectedDate && (
                                    <Grid item xs={12}>
                                        <HorizontalList
                                            showLeftButton
                                            showRightButton
                                            list={availableTimes}
                                            value={selectedTime}
                                            fields={[
                                                {
                                                    useMoment: true,
                                                    name: 'item',
                                                    convertFormat: 'HH:mm',
                                                    renderFormat: 'HH:mm'
                                                }
                                            ]}
                                            onClick={(e) => {                                            
                                                setSelectedTime(e)
                                            }}
                                        />
                                    </Grid>
                                )
                            }                         
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>            
        </Grid>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest.activityRes,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ActivityResInfo)