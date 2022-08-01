import React, { useContext, useEffect, useState } from 'react'
import { UseOrest } from '@webcms/orest'
import { connect, useSelector } from 'react-redux'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Grid from '@material-ui/core/Grid'
import Alert from '@material-ui/lab/Alert'
import WebCmsGlobal from 'components/webcms-global'
import useTranslation from 'lib/translations/hooks/useTranslation'
import RoomCard from './RoomCard'
import { useSnackbar } from 'notistack'
import { updateState } from 'state/actions'
import LoadingSpinner from 'components/LoadingSpinner'
const CleanAndCheckInRoomStatus = 'VC'

const RoomSelection = ({ updateState, open, onClose, useClientOrestState, useClientReservation, confirmClassName }) => {
    const { t } = useTranslation()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { enqueueSnackbar } = useSnackbar()
    const [chooseRoomNo, setChooseRoomNo] = useState(null)
    const [roomBookListData, setRoomBookListData] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isPatchLoading, setIsPatchLoading] = useState(false)
    const useToken = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)

    useEffect(() => {
        let active = true
        if (active && open) {
            setIsLoading(true)
            const roomBookListQuery = {
                startdate: useClientReservation.checkin,
                enddate: useClientReservation.checkout,
                reservno: useClientReservation.reservno,
                roomtypeid: useClientReservation?.roomtypeid || null,
                hotelrefno: useClientReservation.hotelrefno,
                limit: 0,
            }

            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: 'room/book/list',
                token: useToken,
                params: roomBookListQuery,
            }).then((roomBookListResponse) => {
                if (active) {
                    if (roomBookListResponse.status === 200 && roomBookListResponse.data.count > 0) {
                        setRoomBookListData(roomBookListResponse.data.data)
                        setIsLoading(false)
                    } else {
                        setRoomBookListData(null)
                        setIsLoading(false)
                    }
                }
            }).catch(() => {
                setRoomBookListData(null)
                setIsLoading(false)
            })
        }

        return () => {
            active = false
        }

    }, [open])

    const setRoomNoForReservation = (roomNo, hotelrefno) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: `reservat/patch/${useClientReservation.gid}`,
            method: 'patch',
            token: useToken,
            params: {
                hotelrefno: hotelrefno
            },
            data: {
                roomno: roomNo,
            },
        }).then((reservatPatchResponse) => {
            if (reservatPatchResponse.status === 200 && reservatPatchResponse.data.count > 0) {
                return true
            } else {
                return false
            }
        }).catch(() => {
            return false
        })
    }

    const getClientReservNo = async (clientId) =>{
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'client/reservno',
            token: useToken,
            params: {
                clientid: clientId,
                isgapp: true,
            },
        }).then((clientReservnoResponse) => {
            if (clientReservnoResponse.status === 200 && clientReservnoResponse.data.count > 0) {
                updateState('guest', 'changeHotelRefno', clientReservnoResponse.data.data.hotelrefno)
                updateState('guest', 'changeHotelName', clientReservnoResponse.data.data.hotelname)
                updateState('guest', 'clientReservation', clientReservnoResponse.data.data)
            } else {
                updateState('guest', 'clientReservation', null)
            }
        })
    }

    const handleSetRoomNo = async () => {
        setIsPatchLoading(true)
        const isRoomSelected = await setRoomNoForReservation(chooseRoomNo, useClientReservation.hotelrefno)
        if(isRoomSelected){
            updateState('guest', 'clientReservIsLoading', true)
            await getClientReservNo(useClientOrestState.id)
            enqueueSnackbar(t('str_theRoomHasBeenSelectedYouCanCheckIn'), { variant: 'success' })
            updateState('guest', 'clientReservIsLoading', false)
            setIsPatchLoading(false)
            onClose()
        }else {
            enqueueSnackbar(t('str_theRoomWasNotSelectedYouCanTryAgainWithADifferentRoom'), { variant: 'warning' })
            setIsPatchLoading(false)
        }
    }

    return (
        <Dialog fullWidth maxWidth='md' open={open} onClose={() => onClose()}>
            <DialogTitle>{t('str_selectYourRoom')}</DialogTitle>
            <DialogContent dividers style={{ overflowX: 'hidden', overflowY: 'scroll' }}>
                {isLoading ? <LoadingSpinner size={40} />
                    : <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Alert severity="info">
                                {t('str_clickOnTheRoomYouWantToSelectAndThenPressTheConfirmButton')}
                            </Alert>
                        </Grid>
                        {roomBookListData
                        && roomBookListData.filter(room => room.roomstate === CleanAndCheckInRoomStatus).length > 0
                            ? roomBookListData.filter(room => room.roomstate === CleanAndCheckInRoomStatus).map((item, i) => {
                                return (
                                    <Grid item xs={12} sm={6} key={i}>
                                        <RoomCard
                                            roomNo={item.roomno}
                                            roomType={item.roomtypedesc}
                                            roomTypeThumbnail={item.imgfileurl ? GENERAL_SETTINGS.STATIC_URL + item.imgfileurl : '/imgs/not-found.png'}
                                            bedType={item.bedtypedesc}
                                            isSelect={String(item.roomno) === String(chooseRoomNo)}
                                            onSelect={(roomNo) => setChooseRoomNo(roomNo)}
                                        />
                                    </Grid>
                                )
                            })
                            : <Grid item xs={12}>
                                <Alert variant='outlined' severity='warning'>
                                    {t('str_thereAreNoSelectableRoomsAvailableForThisRoomType')}
                                </Alert>
                            </Grid>
                        }
                    </Grid>
                }
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => onClose()}
                    color='primary'
                    disabled={isPatchLoading}
                >
                    {t('str_close')}
                </Button>
                <Button
                    startIcon={isPatchLoading ? <LoadingSpinner size={16}/> : null}
                    className={confirmClassName}
                    onClick={() => handleSetRoomNo()}
                    disabled={isPatchLoading}
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

export default connect(mapStateToProps, mapDispatchToProps)(RoomSelection)
