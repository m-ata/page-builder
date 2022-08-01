import React, { useContext, useEffect, useState } from 'react'
import { connect, useSelector } from 'react-redux'
import styles from './style/Reservations.style'
import stylesTabPanel from '../style/TabPanel.style'
import Grid from '@material-ui/core/Grid'
import { UseOrest } from '@webcms/orest'
import { findStatusColor, renderReservStatus, RESERVATION_STATUS, ROLETYPES, SUBMODULE } from 'model/orest/constants'
import WebCmsGlobal from 'components/webcms-global'
import LoadingSpinner from '../../../LoadingSpinner'
import { makeStyles } from '@material-ui/core/styles'
import useTranslation from 'lib/translations/hooks/useTranslation'
import ReservationCancelDialog from './ReservationCancelDialog'
import CloseIcon from '@material-ui/icons/Close'
import EditIcon from '@material-ui/icons/Edit'
import RestoreIcon from '@material-ui/icons/Restore'
import { setToState } from '../../../../state/actions'
import TrackedChangesDialog from '../../../TrackedChangesDialog'
import CustomTable from '../../../CustomTable'
import TableColumnText from '../../../TableColumnText'
import moment from 'moment'
import MTableColumnSettings from '../../../MTableColumnSettings'
import BookerReservation from '../../../agency/BookerReservation'

const useStyles = makeStyles(styles)
const useStylesTabPanel = makeStyles(stylesTabPanel)

function RoomReservations(props) {
    const classes = useStyles()
    const classesTabPanel = useStylesTabPanel()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { t } = useTranslation()
    const { state } = props
    const showAddons = Boolean(GENERAL_SETTINGS.hotelSettings.product) || Boolean(GENERAL_SETTINGS.hotelSettings.remark) || Boolean(GENERAL_SETTINGS.hotelSettings.transport)

    //redux
    const token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
    const clientBase = useSelector((state) => state?.orest?.state?.client || false)
    const infoLogin = useSelector((state) => state?.orest?.currentUser?.loginfo || false)

    //state
    const [moduleHashRight, setModuleHashRight] = useState(false)
    const [cancelReservationData, setCancelReservationData] = useState(false)
    const [reservations, setReservations] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)
    const [openDialog, setOpenDialog] = useState(false)
    const [openTrackedDialog, setOpenTrackedDialog] = useState(false)
    const [isOnlyUpdate, setIsOnlyUpdate] = useState(false)
    const [isUpdReservation, setIsUpdReservation] = useState(false)
    const [updReservationGid, setUpdReservationGid] = useState(false)

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
            title: t('str_checkInDate'),
            field: 'checkin',
            render: (prop) => <TableColumnText>{moment(prop.checkin).format('L')}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_checkOutDate'),
            field: 'checkout',
            render: (prop) => <TableColumnText>{moment(prop.checkout).format('L')}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_roomType'),
            field: 'catdesc',
            render: (prop) => <TableColumnText>{prop.catdesc}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_confirmationNumber'),
            field: 'reservno',
            align: 'right',
            render: (prop) => <TableColumnText textAlign={'right'}>{prop.reservno}</TableColumnText>,
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


    const getReservationListData = () => {
        setIsLoading(true)

        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'client/history/res',
            token,
            params: {
                clientid: clientBase.id,
                increservat: true,
                incresevent: false,
                incroom: false,
                allstatus: true,
                allhotels: true,
                sort: 'reservno-'
            },
        }).then((r) => {
            setIsInitialized(true)
            if (r.status === 200) {
                setReservations(r.data.data)
                setIsLoading(false)
            } else {
                setIsLoading(false)
            }
        })
    }

    useEffect(() => {
        let active = true
        if (active) {
            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: 'tools/user/hasright',
                token,
                params: {
                    empid: infoLogin.id,
                    submoduleid: SUBMODULE.RESERVAT,
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

            if (token && clientBase) {
                getReservationListData()
            }
        }
        return () => {
            active = false
        }
    }, [token, clientBase])

    const handleReset = () => {
        setOpenDialog(false)
    }

    return (
        <React.Fragment>
            <ReservationCancelDialog reservation={cancelReservationData} isOnlyUpdate={isOnlyUpdate} type="room" open={Boolean(cancelReservationData)} onClose={(status) => setCancelReservationData(!status)} getCallbackData={()=> getReservationListData()}/>
            <Grid container justify={'center'}>
                {isInitialized ? (
                    <CustomTable
                        isHoverFirstColumn={false}
                        isActionFirstColumn
                        loading={isLoading}
                        getColumns={columns}
                        getRows={reservations}
                        onRefresh={() => getReservationListData()}
                        onAdd={moduleHashRight?.cana && infoLogin?.roletype === ROLETYPES.AGENCY ? () => setOpenDialog(true) : false}
                        addText={t('str_newReservation')}
                        firstColumnActions={[
                            {
                                icon: <EditIcon />,
                                title: t('str_edit'),
                                hidden: (!moduleHashRight?.canu || infoLogin?.roletype !== ROLETYPES.AGENCY),
                                onClick: (popupState, rowData) => {
                                    setUpdReservationGid(rowData.gid)
                                    setIsUpdReservation(true)
                                    setTimeout(() => {
                                        popupState.close()
                                    }, 100)
                                }
                            },
                            {
                                disabled: (rowData) => rowData?.status !== RESERVATION_STATUS.FUTURE && moduleHashRight?.canx,
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
                                    setIsOnlyUpdate(false)
                                    setTimeout(() => {
                                        popupState.close()
                                    }, 100)
                                }
                            },
                            {
                                disabled: (rowData) => rowData?.status !== RESERVATION_STATUS.FUTURE && moduleHashRight?.canu,
                                icon: <RestoreIcon />,
                                title: t('str_addChangeReason'),
                                disabledInfo: (rowData) => {
                                    return (
                                        rowData?.status === RESERVATION_STATUS.INHOUSE ? t('str_youCannotMakeChangesReservationsInHouseStatus') :
                                            rowData?.status === RESERVATION_STATUS.CANCEL ? t('str_youCannotMakeChangesReservationsCanceledStatus') :
                                                rowData?.status === RESERVATION_STATUS.CHECKOUT ? t('str_youCannotMakeChangesReservationsCheckoutStatus') : 'Cannot process'
                                    )
                                },
                                onClick: (popupState, rowData) => {
                                    setCancelReservationData(rowData)
                                    setIsOnlyUpdate(true)
                                    setTimeout(() => {
                                        popupState.close()
                                    }, 100)
                                }
                            }
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
                ) : (
                    <Grid item xs={12} className={classesTabPanel.gridItem}>
                        <LoadingSpinner />
                    </Grid>
                )}
            </Grid>
            <BookerReservation
                open={openDialog || isUpdReservation}
                isUpdate={isUpdReservation || false}
                reservationGid={updReservationGid || false}
                onClose={()=> {
                    setIsUpdReservation(false)
                    setUpdReservationGid(false)
                    setOpenDialog(false)
                    getReservationListData()
                }}
            />
            <TrackedChangesDialog
                open={openTrackedDialog}
                onPressNo={(e) => {
                    setOpenTrackedDialog(e);
                }}
                onPressYes={(e) => {
                    setOpenTrackedDialog(e);
                    setOpenDialog(false);
                    getReservationListData()
                    setTimeout(() => {
                        handleReset()
                    }, 100)
                }}
            />
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

export default connect(mapStateToProps, mapDispatchToProps)(RoomReservations)
