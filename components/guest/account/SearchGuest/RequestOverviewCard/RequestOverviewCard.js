import React, {useContext, useEffect, useState} from 'react'
import {Card, CardContent, Grid, Typography} from "@material-ui/core";
import useTranslation from "../../../../../lib/translations/hooks/useTranslation";
import ErrorIcon from '@material-ui/icons/Error';
import HelpIcon from '@material-ui/icons/Help';
import CancelIcon from '@material-ui/icons/Cancel';
import ViewModuleIcon from '@material-ui/icons/ViewModule';
import {makeStyles} from "@material-ui/core/styles";
import {OREST_ENDPOINT, useOrestQuery} from "../../../../../model/orest/constants";
import WebCmsGlobal from "../../../../webcms-global";
import {useSelector} from "react-redux";
import {ViewList} from "@webcms/orest";
import LoadingSpinner from "../../../../LoadingSpinner";


const useStyles = makeStyles((theme) => ({
    cardTitle: {
        fontSize: '24px',
        fontWeight: '600',
    },
    subTitle: {
        fontWeight: '600',
    },
    icon: {
        color: theme.palette.primary.main,
        "&.MuiSvgIcon-root": {
            width:"1.5em",
            height:"1.5em"
        }
    },
    countText: {
        fontWeight: 'bold'
    }
}))


function RequestOverviewCard() {
    const classes = useStyles()

    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal);
    const { t } = useTranslation();

    const token = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false);
    const clientBase = useSelector((state) => state?.orest?.state?.client || false)
    const hotelRefNo = useSelector((state) => state?.formReducer?.guest?.changeHotelRefno || state?.formReducer?.guest?.clientReservation?.hotelrefno) || GENERAL_SETTINGS.HOTELREFNO

    const [requestList, setRequestList] = useState({
        requestCount: 0,
        suggestionCount: 0,
        complaintsCount: 0,
        otherCount: 0
    })
    const [isLoading, setIsLoading] = useState(false)


    const cardList = [
        {
            icon: <ErrorIcon className={classes.icon}/>,
            title: t('str_requests'),
            count: requestList.requestCount
        },
        {
            icon: <HelpIcon className={classes.icon}/>,
            title: t('str_suggestions'),
            count: requestList.suggestionCount
        },
        {
            icon: <CancelIcon className={classes.icon}/>,
            title: t('str_complaints'),
            count: requestList.complaintsCount
        },
        {
            icon: <ViewModuleIcon className={classes.icon}/>,
            title: t('str_other'),
            count: requestList.otherCount
        }
    ]

    useEffect(() => {
        if(token) {
            setIsLoading(true)
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.TSTRANS,
                token,
                params: {
                    query: useOrestQuery({
                        requestedbyid: clientBase?.id
                    }),
                    hotelrefno: hotelRefNo
                }
            }).then(res => {
                setIsLoading(false)
                if(res.status === 200) {
                    const data = res.data.data
                    const requestLength = data.filter(e => e?.tstypedesc === 'Request').length
                    const complaintLength = data.filter(e => e?.tstypedesc === 'Complaint').length
                    const suggestionLength = data.filter(e => e?.tstypedesc === 'Suggestion').length
                    const otherLength = res.data.data.length - (requestLength + complaintLength + suggestionLength)
                    setRequestList({
                        ...requestList,
                        requestCount: requestLength,
                        suggestionCount: suggestionLength,
                        complaintsCount: complaintLength,
                        otherCount: otherLength
                    })
                }
            })
        }
    }, [token])

    return(
        <React.Fragment>
            <Card>
                <CardContent>
                    <Grid container spacing={1} alignItems={'center'} justify={'center'}>
                        <Grid item xs={12}>
                            <Typography className={classes.cardTitle}>{t('str_requests')}</Typography>
                        </Grid>
                        {
                            cardList.map((item) => (
                                <Grid item style={{textAlign: 'center'}}>
                                    <Grid container spacing={1}>
                                        <Grid item xs={12}>
                                            {item?.icon}
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography className={classes.subTitle}>
                                                {item?.title || ''}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            {
                                                isLoading ? (
                                                    <LoadingSpinner size={16}/>
                                                ) : (
                                                    <Typography className={classes.countText}>
                                                        {item?.count}
                                                    </Typography>
                                                )
                                            }
                                        </Grid>
                                    </Grid>
                                </Grid>
                            ))
                        }
                    </Grid>
                </CardContent>
            </Card>
        </React.Fragment>
    )
}

export default RequestOverviewCard;