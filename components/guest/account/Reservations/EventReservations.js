import React, { useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import styles from './style/Reservations.style'
import stylesTabPanel from '../style/TabPanel.style'
import Grid from '@material-ui/core/Grid'
import { ViewList, UseOrest } from '@webcms/orest'
import {
    findStatusColor,
    isErrorMsg,
    OREST_ENDPOINT, renderReservStatus,
    RESERVATION_STATUS,
    SUBMODULE
} from 'model/orest/constants'
import WebCmsGlobal from 'components/webcms-global'
import LoadingSpinner from 'components/LoadingSpinner'
import useNotifications from 'model/notification/useNotifications'
import { makeStyles } from '@material-ui/core/styles'
import useTranslation from 'lib/translations/hooks/useTranslation'
import ReservationCancelDialog from './ReservationCancelDialog'
import CloseIcon from "@material-ui/icons/Close";
import MTableColumnSettings from "../../../MTableColumnSettings";
import CustomTable from "../../../CustomTable";
import TableColumnText from "../../../TableColumnText";
import moment from "moment";

const useStyles = makeStyles(styles)
const useStylesTabPanel = makeStyles(stylesTabPanel)

export default function EventReservation(props) {
    const { isWidget } = props
    const classes = useStyles()
    const classesTabPanel = useStylesTabPanel()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { t } = useTranslation()

    //redux
    const { showError } = useNotifications()
    const token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
    const clientBase = useSelector((state) => state?.orest?.state?.client || false)
    const loginBase = useSelector((state) => state?.orest?.currentUser?.loginfo || false)

    //state
    const [moduleHashRight, setModuleHashRight] = useState(false)
    const [cancelReservationData, setCancelReservationData] = useState(false)
    const [events, setEvents] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)

    const [columns, setColumns] = useState([
        {
            title: t('str_status'),
            field: 'status',
            align: 'center',
            render: (prop) => (
                <div style={{borderRadius: '8px', color: '#FFF', backgroundColor: findStatusColor(prop?.status)}}>
                    <TableColumnText textAlign={'center'} fontWeight={'600'}>{t(renderReservStatus(prop.status))}</TableColumnText>
                </div>
            ),
            hidden: false
        },
        {
            title: t('str_startDate'),
            field: 'startdate',
            render: (prop) => <TableColumnText>{prop?.startdate && moment(prop.startdate).format('L')}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_startTime'),
            field: 'starttime',
            render: (prop) => <TableColumnText>{prop?.starttime && moment(prop.starttime, 'HH:mm:ss').format('LT')}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_endDate'),
            field: 'enddate',
            render: (prop) => <TableColumnText>{prop?.enddate && moment(prop.enddate).format('L')}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_endTime'),
            field: 'endtime',
            render: (prop) => <TableColumnText>{prop?.endtime && moment(prop.endtime, 'HH:mm:ss').format('LT')}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_location'),
            field: 'eventloc',
            render: (prop) => <TableColumnText>{prop?.eventloc}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_pax'),
            field: 'totalpax',
            align: 'right',
            render: (prop) => <TableColumnText textAlign={'right'}>{prop?.totalpax}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_child'),
            field: 'totalchd',
            align: 'right',
            render: (prop) => <TableColumnText textAlign={'right'}>{prop?.totalchd}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_baby'),
            field: 'totalbaby',
            align: 'right',
            render: (prop) => <TableColumnText textAlign={'right'}>{prop?.totalbaby}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_confirmationNumber'),
            field: 'reservno',
            align: 'right',
            render: (prop) => <TableColumnText textAlign={'right'}>{prop?.reservno}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_company'),
            field: 'agency',
            render: (prop) => <TableColumnText minWidth={150}>{prop?.agency || ''}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_hotelName'),
            field: 'hotelname',
            render: (prop) => <TableColumnText minWidth={150}>{prop?.hotelname || ''}</TableColumnText>,
            hidden: false
        }
    ])

    const getEventListData = (active, fullReload = false) => {
        setIsLoading(true)
        if(fullReload){
            setIsInitialized(false)
            setEvents([])
        }
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RESEVENT,
            token,
            params: {
                query: `clientid:${clientBase.id}`,
                sort: 'startdate-',
                chkselfish: false,
                allhotels: true
            },
        }).then((r) => {
            if (active) {
                if (r.status === 200) {
                    setEvents(r.data.data)
                    setIsInitialized(true)
                    setIsLoading(false)
                } else {
                    const retErr = isErrorMsg(r)
                    showError(retErr.errorMsg)
                    setIsInitialized(true)
                    setIsLoading(false)
                }
            }
        })
    }

    useEffect(() => {
        let active = true
        if (active) {

        }
        return () => {
            active = false
        }
    }, [])

    useEffect(() => {
        let active = true
        if (active) {
            if (isLoading) {
                return undefined
            }

            if (clientBase && clientBase.id) {
                UseOrest({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: 'tools/user/hasright',
                    token: token,
                    params: {
                        empid: loginBase.id,
                        submoduleid: SUBMODULE.RESEVENT,
                    },
                }).then((toolsUserHasRightResponse) => {
                    if (toolsUserHasRightResponse.status === 200 && toolsUserHasRightResponse?.data?.data) {
                        setModuleHashRight(toolsUserHasRightResponse.data.data)
                    }else{
                        setModuleHashRight(false)
                    }
                }).catch(() => {
                    setModuleHashRight(false)
                })
                getEventListData(true)
            } else {
                setIsInitialized(true)
            }
        }
        return () => {
            active = false
        }
    }, [])


    return (
        <React.Fragment>
            <Grid container justify={'center'}>
                <ReservationCancelDialog reservation={cancelReservationData} type="event" open={Boolean(cancelReservationData)} onClose={(status) => setCancelReservationData(!status)} getCallbackData={()=> getEventListData(true, true)}/>
                {isInitialized ? (
                    <CustomTable
                        isHoverFirstColumn={false}
                        isActionFirstColumn
                        loading={isLoading}
                        getColumns={columns}
                        getRows={events}
                        onRefresh={() => getEventListData(true)}
                        firstColumnActions={[
                            {
                                disabled: (rowData) => rowData?.status !== RESERVATION_STATUS.FUTURE || !moduleHashRight?.canx,
                                icon: <CloseIcon />,
                                title: t('str_resActionCancel'),
                                disabledInfo: (rowData) => {
                                    return (
                                        rowData?.status === RESERVATION_STATUS.INHOUSE ? t('str_youCannotMakeChangesReservationsInHouseStatus') :
                                            rowData?.status === RESERVATION_STATUS.CANCEL ? t('str_youCannotMakeChangesReservationsCanceledStatus') :
                                                rowData?.status === RESERVATION_STATUS.CHECKOUT ? t('str_youCannotMakeChangesReservationsCheckoutStatus') : 'Cannot process'
                                    )
                                },
                                onClick: (popupState, rowData) => {
                                    setCancelReservationData(rowData)
                                    setTimeout(() => {
                                        popupState.close()
                                    }, 100)
                                }
                            },
                        ]}
                        filterComponentAlign={'right'}
                        filterComponent={
                            <React.Fragment>
                                <Grid container spacing={3} alignItems={'center'}>
                                    <Grid item xs={12} sm={true}>
                                        <MTableColumnSettings tableId="historyReservation" columns={columns} setColumns={setColumns}/>
                                    </Grid>
                                </Grid>
                            </React.Fragment>
                        }
                    />
                    /*events.length > 0 ? (
                        Object.keys(jsonGroupBy(events, 'eventtypedesc')).map((eventtype, etIndex) => {
                            return(
                                <Grid item xs={12} key={etIndex} style={{padding: 10}}>
                                    <Typography variant="h6" gutterBottom className={classes.subTitle}>
                                        {t(eventtype)}
                                    </Typography>
                                    <Grid container justify={'center'}>
                                        {jsonGroupBy(events, 'eventtypedesc')[eventtype].map((eventitem, i) => {
                                            return (<EventReservationCard event={eventitem} key={i} isCancel={moduleHashRight.canx || false}  cancelReservation={()=> setCancelReservationData(eventitem)} />)
                                        })}
                                    </Grid>
                                </Grid>
                            )
                        })
                    ) : (
                        <Typography component="h3" className={classesTabPanel.nothingToShow}>
                            {t('str_widgetReservatListNoRecordYet')}
                        </Typography>
                    )*/
                ) : (
                    <Grid item xs={12} className={classesTabPanel.gridItem}>
                        <LoadingSpinner />
                    </Grid>
                )}

            </Grid>
        </React.Fragment>
    )
}
