import React, { useState, useEffect, useContext } from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import { connect, useSelector } from 'react-redux'
import { setToState } from 'state/actions'
import useTranslation from 'lib/translations/hooks/useTranslation'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import { Insert, Patch, UseOrest, ViewList } from '@webcms/orest'
import { DEFAULT_OREST_TOKEN, OREST_ENDPOINT, REQUEST_METHOD_CONST } from 'model/orest/constants'
import WebCmsGlobal from 'components/webcms-global'
import { useSnackbar } from 'notistack'
import { sendGuestChangeNotifyMail } from '../Base/helper'
import { CustomToolTip } from '../../../user-portal/components/CustomToolTip/CustomToolTip'
import Typography from '@material-ui/core/Typography'
import utfTransliteration from '@webcms-globals/utf-transliteration'

const ReservationCancelDialog = (props) =>{
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
        , { state, reservation, open, onClose, getCallbackData, type, isOnlyUpdate } = props
        , token = useSelector((state) => state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN)
        , hotelRefNo = useSelector((state) => state?.formReducer?.guest?.changeHotelRefno || state?.hotelinfo?.currentHotelRefNo || GENERAL_SETTINGS.HOTELREFNO)
        , clientBase = useSelector((state) => state?.orest?.state?.client || false)
        , reservBase = state.clientReservation || false
        , { t } = useTranslation()
        , { transliteration } = utfTransliteration()
        , { enqueueSnackbar } = useSnackbar()
        , [isLoading, setIsLoading] = useState(false)
        , [resxreasonID, setResxreasonID] = useState(false)
        , [resxReasonList, setResxReasonList] = useState(false)
        , [resxReasonUpdateList, setResxReasonUpdateList] = useState(false)
        , [resxreasonNote, setResxreasonNote] = useState("")
        , [renderList, setRenderList] = useState([])
        , [openToolTip, setOpenToolTip] = useState(false)

    useEffect(() => {
        let active = true

        if (active) {

            const array = [
                {
                    title: 'cancelList',
                    params: type === 'room' && {query: 'isactive:true,isresa:true,isgapp:true', hotelrefno: hotelRefNo}
                },
                {
                    title: 'updateList',
                    params: type === 'room' && {query: 'isactive:true,isresa:true,isupd:true,isgapp:true', hotelrefno: hotelRefNo}
                }
            ]

            array.map((item, index) => {
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.RESXREASON,
                    token: token,
                    params: item?.params
                }).then((response) => {
                        if (response.status === 200 && response.data.count > 0) {
                            const responseData = response.data.data
                            setRenderList(responseData)
                            if(item.title === 'cancelList') {
                                setResxReasonList(responseData)
                            } else if(item.title === 'updateList') {
                                setResxReasonUpdateList(responseData)
                            }
                        } else {
                            setResxReasonList(false)
                            setResxReasonUpdateList(false);
                        }
                    },
                ).catch(() => {
                    setResxReasonList(false)
                })
            })

        }

        return () => {
            setIsLoading(false)
            active = false
        }

    }, [])

    useEffect(() => {
        if (isOnlyUpdate) {
            setRenderList(resxReasonUpdateList)
        } else {
            setRenderList(resxReasonList)
        }

    }, [isOnlyUpdate])

    const cancelEventReservation = () => {
        const reasonForCancel = resxReasonList.find(item => Number(item.id) === Number(resxreasonID))
        const notifyValues = {
            roomno: reservBase?.roomno || "-",
            clientname: transliteration(clientBase?.clientname) || "-",
            details: JSON.stringify({
                description: reasonForCancel.description,
                note: resxreasonNote ? resxreasonNote : "-",
                loc: reservation.description,
                date: reservation.startdate,
                time: reservation.starttime,
                totalpax: reservation.totalpax,
                totalchd: reservation.totalchd
            })
        }

        Insert({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RESXREASONLIST,
            token: token,
            data: {
                resxreasonid: resxreasonID,
                note: resxreasonNote,
                reservno: reservation.reservno,
                hotelrefno: reservation.hotelrefno
            },
        }).then((response) => {
                if (response.status === 200) {
                    Patch({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.RESEVENT,
                        token: token,
                        gid: reservation.gid,
                        params: {
                            hotelrefno: reservation.hotelrefno
                        },
                        data: {
                            status: 'X',
                        },
                    }).then(async (response) => {
                        if (response.status === 200) {
                            getCallbackData()
                            enqueueSnackbar(t('str_updatedSuccessfully'), { variant: 'success' })
                            onClose(true)
                            setResxreasonID(false)
                            setResxreasonNote("")
                            setIsLoading(false)
                            await sendGuestChangeNotifyMail('resevent', 'cnl', clientBase.id, clientBase.gid, reservBase.gid, reservBase.reservno, notifyValues,reservBase?.hotelrefno || GENERAL_SETTINGS.HOTELREFNO)
                        } else {
                            enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'warning' })
                            onClose(true)
                            setIsLoading(false)
                        }
                    }).catch(() => {
                        enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'warning' })
                        onClose(true)
                        setIsLoading(false)
                    })
                } else {
                    enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'warning' })
                    onClose(true)
                    setIsLoading(false)
                }
            },
        ).catch(() => {
            enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'warning' })
            onClose(true)
            setIsLoading(false)
        })
    }

    const cancelRoomReservation = () => {
        const reasonForCancel = resxReasonList.find(item => Number(item.id) === Number(resxreasonID))
        const notifyValues = {
            roomno: reservBase?.roomno || "-",
            clientname: transliteration(clientBase?.clientname) || "-",
            details: JSON.stringify({
                description: reasonForCancel.description,
                note: resxreasonNote ? resxreasonNote : "-",
                roomtype: reservation?.roomtypedesc || "-",
                resdate: reservation?.resdate || "-",
                cidate: reservation?.checkin || "-",
                codate: reservation?.checkout || "-",
                totalpax: reservation?.totalpax || "-",
                totalchd: reservation?.totalchd || "-"
            })
        }

        Insert({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RESXREASONLIST,
            token: token,
            data: {
                resxreasonid: resxreasonID,
                note: resxreasonNote,
                reservno: reservation.reservno,
                hotelrefno: reservation.hotelrefno
            },
        }).then((response) => {
            if (response.status === 200) {
                if(isOnlyUpdate) {
                    getCallbackData()
                    enqueueSnackbar(t('str_updatedSuccessfully'), { variant: 'success' })
                    onClose(true)
                    setResxreasonID(false)
                    setResxreasonNote("")
                    setIsLoading(false)
                } else {
                    UseOrest({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.RESERVAT_DOX,
                        method: REQUEST_METHOD_CONST.PUT,
                        token: token,
                        params: {
                            reservno: reservation.reservno,
                            hotelrefno: reservation.hotelrefno
                        },
                    }).then(async (response) => {
                        if (response.status === 200) {
                            getCallbackData()
                            enqueueSnackbar(t('str_updatedSuccessfully'), { variant: 'success' })
                            onClose(true)
                            setResxreasonID(false)
                            setResxreasonNote("")
                            setIsLoading(false)
                            await sendGuestChangeNotifyMail('reservat','cnl', clientBase.id, clientBase.gid, reservBase.gid, reservBase.reservno, notifyValues,reservBase?.hotelrefno || GENERAL_SETTINGS.HOTELREFNO)
                        } else {
                            enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'warning' })
                            onClose(true)
                            setIsLoading(false)
                        }
                    }).catch(() => {
                        enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'warning' })
                        onClose(true)
                        setIsLoading(false)
                    })
                }
            } else {
                enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'warning' })
                onClose(true)
                setIsLoading(false)
            }}).catch(() => {
            enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'warning' })
            onClose(true)
            setIsLoading(false)
        })
    }

    const handleCancelReservation = () => {
        if(!resxreasonID){
            enqueueSnackbar(t('str_pleaseSelectCancellationReason'), { variant: 'warning' })
        }else{
            setIsLoading(true)
            if(type === "event"){
                cancelEventReservation()
            }else if(type === "room"){
                cancelRoomReservation()
            }
        }
    }

    const handleCloseDialog = (prop) => {
        typeof onClose === 'function' && onClose(prop)
        handleReset()
    }

    const handleReset = () => {
        setResxreasonID(false)
        setResxreasonNote('')
    }

    return (
        <Dialog
            maxWidth="sm"
            fullWidth
            open={open}
            onClose={()=> onClose(true)}
            aria-labelledby="cancellation-reason-title"
        >
            <DialogTitle id="cancellation-reason-title">{isOnlyUpdate ? t('str_changeReason') : t('str_cancellationReason')}</DialogTitle>
            <DialogContent dividers>
                <Box p={3}>
                    <Container maxWidth="sm">
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <FormControl variant="outlined" fullWidth required disabled={isLoading}>
                                    <InputLabel htmlFor="resxreasonid-select">{isOnlyUpdate ? t('str_changeReason') : t('str_cancellationReason')}</InputLabel>
                                    <Select
                                        native
                                        value={resxreasonID}
                                        onChange={(e) => setResxreasonID(e.target.value)}
                                        label={isOnlyUpdate ? t('str_changeReason') : t('str_cancellationReason')}
                                        inputProps={{ name: 'resxreasonid', id: 'resxreasonid-select' }}
                                    >
                                        <option aria-label="None" value="" />
                                        {renderList && renderList.length > 0 && renderList.map((item, i) => {
                                            return (
                                                <option key={i} value={item.id}>{item.description}</option>
                                            )
                                        })}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    disabled={isLoading}
                                    fullWidth
                                    id="resxreason-description"
                                    label={t('str_note')}
                                    multiline
                                    rows={4}
                                    variant="outlined"
                                    value={resxreasonNote}
                                    onChange={(e)=> setResxreasonNote(transliteration(e.target.value))}
                                />
                            </Grid>
                        </Grid>
                    </Container>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={()=> handleCloseDialog(true)} color="primary" variant={'outlined'} disabled={isLoading} >
                    {t('str_close')}
                </Button>
                <CustomToolTip open={openToolTip} onOpen={() => setOpenToolTip(!resxreasonID)} onClose={() => setOpenToolTip(false)} title={
                    <div>
                        {!resxreasonID ? (
                                <React.Fragment>
                                    <Typography style={{fontWeight: '600', fontSize: 'inherit'}}>{t('str_invalidFields')}</Typography>
                                    <Typography style={{fontSize: 'inherit'}}>
                                        {isOnlyUpdate ? t('str_changeReason') : t('str_cancellationReason')}
                                    </Typography>
                                </React.Fragment>
                            ) : ('')}
                    </div>
                }>
                    <span>
                         <Button onClick={() => resxreasonID ? handleCancelReservation() : {}} color="primary" variant={'contained'} disabled={isLoading || !resxreasonID}>
                             {t('str_save')}
                         </Button>
                    </span>
                </CustomToolTip>

            </DialogActions>
        </Dialog>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ReservationCancelDialog)
