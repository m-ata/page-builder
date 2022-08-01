import React, { useContext, useEffect, useState } from 'react'
import { UseOrest, Patch } from '@webcms/orest'
import { connect, useSelector } from 'react-redux'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Alert from '@material-ui/lab/Alert'
import WebCmsGlobal from 'components/webcms-global'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { useSnackbar } from 'notistack'
import { OREST_ENDPOINT, REQUEST_METHOD_CONST } from 'model/orest/constants'
import { updateState } from 'state/actions'
import LoadingSpinner from 'components/LoadingSpinner'
import TabHeader from 'components/layout/components/TabHeader'
import CheckInReservationCard from '../../Details/CheckInConfirmation/CheckInReservationCard'
import PrimaryGuestCard from '../../Details/CheckInConfirmation/PrimaryGuestCard'
import { sendCheckInNotificationForHotelAndClient } from '../../Base/helper'

const CheckInConfirmation = ({ open, onClose, updateState, useClientOrestState, useClientReservation, confirmClassName }) => {
    const { t } = useTranslation()
    const { GENERAL_SETTINGS, locale } = useContext(WebCmsGlobal)
    const { enqueueSnackbar } = useSnackbar()
    const [isLoading, setIsLoading] = useState(false)
    const [useReservation, setUseReservation] = useState(false)
    const [isCheckinLoading, setIsCheckinLoading] = useState(false)
    const useToken = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)

    useEffect(() => {
        let isEffect = true

        if (isEffect && open && useClientReservation) {
            getReservation(useClientReservation.gid, useClientReservation.hotelrefno)
        }

        return () => {
            isEffect = false
        }
    }, [open])

    const getReservation = async (gid, hotelrefno) => {
        setIsLoading(true)
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'reservat/view/get',
            token: useToken,
            params: {
                gid: gid,
                chkselfish: false,
                hotelrefno: hotelrefno,
            },
        }).then((reservatViewGetResponse) => {
            if (reservatViewGetResponse.status === 200 && reservatViewGetResponse?.data?.data) {
                setUseReservation(reservatViewGetResponse.data.data)
                setIsLoading(false)
                return true
            } else {
                setIsLoading(false)
                return false
            }
        }).catch(()=> {
            setIsLoading(false)
            return false
        })
    }

    const handleReservatDoci = (reservno) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'reservat/doci',
            token: useToken,
            method: REQUEST_METHOD_CONST.PUT,
            params: {
                reservno: reservno,
            },
        }).then( (reservatDociResponse) => {
            return !!reservatDociResponse.data.data.res
        }).catch(()=> {
           return false
        })
    }

    const setTemporaryRoomNoForReservation = (gid, hotelrefno) => {
        return Patch({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RESERVAT,
            token: useToken,
            gid: gid,
            params: {
                hotelrefno: hotelrefno
            },
            data: {
                roomno: 'T'
            }
        }).then( (reservatPatchResponse) => {
            return !!reservatPatchResponse.data.data
        }).catch(()=> {
            return false
        })
    }

    const getClientReservno = (clientid) => {
        updateState('guest', 'clientReservIsLoading', true)
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'client/reservno',
            token: useToken,
            method: REQUEST_METHOD_CONST.GET,
            params: {
                clientid: clientid,
                isgapp: true,
            },
        }).then((clientReservnoResponse) => {
            if (clientReservnoResponse.status === 200 && clientReservnoResponse.data.count > 0) {
                updateState('guest', 'changeHotelRefno', clientReservnoResponse.data.data.hotelrefno)
                updateState('guest', 'changeHotelName', clientReservnoResponse.data.data.hotelname)
                updateState('guest', 'clientReservation', clientReservnoResponse.data.data)
                updateState('guest', 'clientReservIsLoading', false)
                return true
            } else {
                updateState('guest', 'clientReservation', null)
                updateState('guest', 'clientReservIsLoading', false)
                return false
            }
        })
    }

    const handleOnCheckin = async () =>{
        setIsCheckinLoading(true)
        if(!GENERAL_SETTINGS.hotelSettings.roomno && !useReservation.roomno){
            await setTemporaryRoomNoForReservation(useReservation.gid, useReservation.hotelrefno)
        }
        const isCheckin = await handleReservatDoci(useReservation.reservno)
        if(isCheckin){
            await sendCheckInNotificationForHotelAndClient(useReservation.gid, useReservation.reservno, useReservation.clientname, useReservation.email, locale, useReservation.hotelrefno)
            await getClientReservno(useReservation.clientid)
            enqueueSnackbar(t('str_checkInProccessSuccessful'), { variant: 'success' })
            setIsCheckinLoading(false)
        }else{
            enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'warning' })
            setIsCheckinLoading(false)
        }
    }

    return (
        <Dialog fullWidth maxWidth='md' open={open} onClose={() => onClose()}>
            <DialogTitle>{t('str_checkInConfirm')}</DialogTitle>
            <DialogContent dividers style={{ overflowX: 'hidden', overflowY: 'scroll' }}>
                {isLoading ? (
                    <LoadingSpinner size={40} />
                ): !isLoading && !useReservation ? (
                    <Alert severity="warning">{t('str_widgetReservatListNoRecordYet')}</Alert>
                ) : (
                    <React.Fragment>
                        <TabHeader title={t('str_checkInSummary')}/>
                        <CheckInReservationCard useReservation={useReservation}/>
                        <TabHeader title={t('str_guest1')}/>
                        <PrimaryGuestCard useClientOrestState={useClientOrestState} />
                    </React.Fragment>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    disabled={isCheckinLoading}
                    onClick={() => onClose()}
                    color='primary'
                >
                    {t('str_close')}
                </Button>
                <Button
                    disabled={isCheckinLoading}
                    startIcon={isCheckinLoading ? <LoadingSpinner size={16}/> : null}
                    className={confirmClassName}
                    onClick={() => handleOnCheckin()}
                >
                    {t('str_confirm')}
                </Button>
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
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(CheckInConfirmation)
