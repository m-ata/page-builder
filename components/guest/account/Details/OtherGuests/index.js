import React, { useContext, useEffect, useState } from 'react'
import { UseOrest, ViewList } from '@webcms/orest'
import { connect, useSelector } from 'react-redux'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Icon from '@material-ui/core/Icon'
import WebCmsGlobal from 'components/webcms-global'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { useSnackbar } from 'notistack'
import { OREST_ENDPOINT } from 'model/orest/constants'
import { updateState } from 'state/actions'
import MaterialTable from 'material-table'
import { Alert } from '@material-ui/lab'
import ClientBase from '../ClientBase'
import { clientInitialState } from '../clientInitialState'
import LoadingSpinner from '../../../../LoadingSpinner'

const OtherGuestDetails = ({ resNameInfo, clientInfo, onClose, usePrimaryClientReservation }) => {
    const {t} = useTranslation()

    //For Other Guest
    const [useClientInitialState, setUseClientInitialState] = useState(clientInitialState)
    const useClientOrestState = clientInfo || false
    const useClientResName = resNameInfo || false

    return (
        <React.Fragment>
            <Button onClick={() => onClose()} style={{ marginLeft: 10, marginBottom: 10 }} startIcon={<Icon>arrow_back</Icon>} variant='outlined' color='primary' disableElevation>
                {t('str_back')}
            </Button>
            <ClientBase
                isPrimaryGuest={false}
                useClientInitialState={useClientInitialState}
                setUseClientInitialState={setUseClientInitialState}
                useClientOrestState={useClientOrestState}
                useClientReservation={useClientResName}
                usePrimaryClientReservation={usePrimaryClientReservation}
            />
        </React.Fragment>
    )
}

const getNumberOfOtherGuest = (useClientReservation) => {
    return Number((useClientReservation.totalpax + useClientReservation.totalchd) - 1)
}

const OtherGuests = ({ open, onClose, useClientReservation, isCheckInPossible, onCallBackCheckInButton, otherGuestRequiredFieldCheck, confirmClassName }) => {
    const { t } = useTranslation()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { enqueueSnackbar } = useSnackbar()
    const [isLoading, setIsLoading] = useState(false)
    const [useResNameList, setUseResNameList] = useState(false)
    const [useResNameInfo, setUseResNameInfo] = useState(false)
    const [useOtherGuestsClientList, setUseOtherGuestsClientList] = useState([])
    const [useSelectClientIndex, setUseSelectClientIndex] = useState(false)
    const useToken = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
    const numberOfOtherGuest = getNumberOfOtherGuest(useClientReservation)
    const isRequired = GENERAL_SETTINGS.hotelSettings.cichkallcards || false

    useEffect(() => {
        let isEffect = true

        if (isEffect && open && useClientReservation) {
            getClientLoader(useClientReservation.reservno)
        }

        return () => {
            isEffect = false
        }
    }, [open])

    const getClientLoader = async (reservno) => {
        setIsLoading(true)
        const otherGuestsClientIdList = await getOtherGuestsClientIdList(reservno)
        if (otherGuestsClientIdList) {
            const otherGuestsClientList = await getOtherGuestsClientList(otherGuestsClientIdList)
            setUseOtherGuestsClientList(otherGuestsClientList)
            setIsLoading(false)
        } else {
            setIsLoading(false)
        }
    }

    const getOtherGuestsClientIdList = (reservno) => {
        return ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RESNAME,
            token: useToken,
            params: {
                query: `reservno:${reservno}`,
                allhotels: true,
            },
        }).then((resnameResponse) => {
            if (resnameResponse.status === 200 && resnameResponse?.data?.data && resnameResponse?.data?.data.length > 0) {
                setUseResNameList(resnameResponse.data.data)
                return resnameResponse.data.data.map((resname) => resname.clientid)
            } else {
                return false
            }
        }).catch(() => {
            return false
        })
    }

    const getOtherGuestsClientList = (otherGuestsClientIdList) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'client/view/list/get/id',
            method: 'POST',
            token: useToken,
            params: {
                allhotels: true,
                chkselfish: false,
            },
            data: otherGuestsClientIdList,
        }).then((clientViewListGetIdResponse) => {
            if (clientViewListGetIdResponse.status === 200 && clientViewListGetIdResponse?.data?.data) {
                return clientViewListGetIdResponse.data.data
            } else {
                return false
            }
        }).catch(() => {
            return false
        })
    }

    const createClient = (numberOfClient) => {
        const getList = Array.from({ length: numberOfClient }).map(() => {
            return {
                firstname: '',
                lastname: '',
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
            }
        })

        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'client/list/ins',
            method: 'POST',
            token: useToken,
            params: {
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO
            },
            data: getList,
        }).then((clientListInsResponse) => {
            if (clientListInsResponse.status === 200 && clientListInsResponse?.data?.data) {
                return clientListInsResponse.data.data
            } else {
                return false
            }
        }).catch(() => {
            return false
        })
    }

    const createClientLoginId = (clientId) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'client/loginid',
            method: 'PUT',
            token: useToken,
            params: {
                id: clientId,
                pref: true,
                datapolicy: true,
                force: true
            }
        }).then((clientLoginIdResponse) => {
            return !!(clientLoginIdResponse.status === 200 && clientLoginIdResponse?.data?.data);
        }).catch(() => {
            return false
        })
    }

    const createClientLoginIdList = async (getClientList) => {
        for (let client of getClientList) {
            await createClientLoginId(client.id)
        }
    }

    const createResName = async (getClientList, reservno) => {
        const getList = getClientList.map((client) => {
            return {
                firstname: '',
                lastname: '',
                clientid: client.id,
                reservno: reservno,
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
            }
        })

        await createClientLoginIdList(getClientList)

        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: '/resname/list/ins',
            method: 'POST',
            token: useToken,
            params: {
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO
            },
            data: getList,
        }).then((resnameListInsResponse) => {
            return !!(resnameListInsResponse.status === 200 && resnameListInsResponse?.data?.data)
        }).catch(() => {
            return false
        })
    }

    const createMissingGuests = async (numberOfOtherGuest) => {
        setIsLoading(true)
        const getClientList = await createClient(numberOfOtherGuest)
        const isCreateResName = await createResName(getClientList, useClientReservation.reservno)

        if(isCreateResName){
            await getClientLoader(useClientReservation.reservno)
            enqueueSnackbar(t('str_missingGuestRecordsHaveBeenCreatedYouCanEditNewlyAddedRecords'), { variant: 'success' });
            setIsLoading(false)
        }else {
            setIsLoading(false)
        }
    }

    const otherGuestColumns = [
        {
            title: `${t('str_firstName')} ${isRequired ? `*` : ''}`,
            field: 'firstname',
            render: (state) => (
                <React.Fragment>{state.firstname || "-"}</React.Fragment>
            ),
        },
        {
            title: `${t('str_lastName')} ${isRequired ? `*` : ''}`,
            field: 'lastname',
            render: (state) => (
                <React.Fragment>{state.lastname || "-"}</React.Fragment>
            ),
        },
        {
            title: `${t('str_birthDate')} ${isRequired ? `*` : ''}`,
            field: 'birthdate',
            type: 'date',
            render: (state) => (
                <React.Fragment>{state.birthdate || "-"}</React.Fragment>
            ),
        },
        {
            title: `${t('str_nationality')} ${isRequired ? `*` : ''}`,
            field: 'nationdesc',
            render: (state) => (
                <React.Fragment>{state.nationdesc || "-"}</React.Fragment>
            ),
        },
        {
            title: `${t('str_idNumber')} ${isRequired ? `*` : ''}`,
            field: 'idno',
            render: (state) => (
                <React.Fragment>{state.idno || state.tridno || "-"}</React.Fragment>
            ),
        },
    ]

    const handleOnClose = async () =>{
        setUseSelectClientIndex(false)
        onClose()
        return true
    }

    const handleOnCallBackCheckInButton = async () =>{
        const getOtherGuestRequiredFieldCheck = await otherGuestRequiredFieldCheck(numberOfOtherGuest)
        if (!getOtherGuestRequiredFieldCheck) {
            return false
        }

        onCallBackCheckInButton()
        onClose()
        return true
    }

    const showCreateMissingGuestsAlert = (useOtherGuestsClientList, numberOfOtherGuest) => {
        return useOtherGuestsClientList && useOtherGuestsClientList.length !== numberOfOtherGuest && useOtherGuestsClientList.length <= numberOfOtherGuest
    }

    return (
        <Dialog fullWidth maxWidth='md' open={open} onClose={() => onClose()}>
            <DialogTitle>{t('str_otherGuests')}</DialogTitle>
            <DialogContent dividers style={{ overflowX: 'hidden', overflowY: 'scroll' }}>
                {isLoading ? (
                    <LoadingSpinner size={40} />
                ): (
                    <React.Fragment>
                        {useSelectClientIndex !== false && useSelectClientIndex >= 0 ? (
                            <OtherGuestDetails
                                usePrimaryClientReservation={useClientReservation}
                                resNameInfo={useResNameInfo}
                                clientInfo={useOtherGuestsClientList[useSelectClientIndex]}
                                onClose={async () => {
                                    setUseSelectClientIndex(false)
                                    await getClientLoader(useClientReservation.reservno)
                                }}
                            />
                        ) : (
                            <React.Fragment>
                                {showCreateMissingGuestsAlert(useOtherGuestsClientList, numberOfOtherGuest) ? (
                                    <Alert severity="info" action={<Button onClick={() => createMissingGuests(numberOfOtherGuest - useOtherGuestsClientList.length)} variant="outlined" color="inherit" size="small">{t('str_yes')}</Button>}>
                                        {t('str_theNumberOfGuestsInTheReservationIsNotEqualToTheNumberOfRegisteredGuestsWouldYouLikeToAddTheMissingRecordsToTheList')}
                                    </Alert>
                                ): null}
                                <br />
                                <MaterialTable
                                    title={t('str_guestList')}
                                    columns={otherGuestColumns}
                                    data={useOtherGuestsClientList}
                                    options={{ search: false }}
                                    isLoading={isLoading}
                                    actions={[
                                        {
                                            icon: 'edit',
                                            onClick: (e, rowData) => {
                                                const getResName = useResNameList.find(resname => resname.clientid === rowData.id)
                                                setUseResNameInfo(getResName)
                                                setUseSelectClientIndex(rowData.tableData.id)
                                            },
                                        },
                                    ]}
                                    localization={{
                                        body: {
                                            emptyDataSourceMessage: t('str_noRecords'),
                                            addTooltip: t('str_add'),
                                            deleteTooltip: t('str_delete'),
                                            editTooltip: t('str_edit'),
                                            filterRow: {
                                                filterTooltip: t('str_filter'),
                                            },
                                            editRow: {
                                                deleteText: t('str_confirmDeleteRecord'),
                                                cancelTooltip: t('str_cancel'),
                                                saveTooltip: t('str_save'),
                                            },
                                        },
                                        toolbar: {
                                            searchTooltip: t('str_search'),
                                            searchPlaceholder: t('str_search'),
                                        },
                                        pagination: {
                                            labelRowsSelect: t('str_line'),
                                            labelDisplayedRows: t('str_labelDisplayedRows'),
                                            firstTooltip: t('str_firstPage'),
                                            previousTooltip: t('str_previousPage'),
                                            nextTooltip: t('str_nextPage'),
                                            lastTooltip: t('str_lastPage'),
                                        },
                                        header: {
                                            actions: '',
                                        },
                                    }}
                                />
                            </React.Fragment>
                          )}
                    </React.Fragment>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    disabled={isLoading}
                    color='primary'
                    onClick={() => handleOnClose()}
                >
                    {t('str_close')}
                </Button>
                {isCheckInPossible ?
                    <Button
                        disabled={isLoading}
                        className={confirmClassName}
                        onClick={() => handleOnCallBackCheckInButton()}
                    >
                        {t('str_proceedToCheckin')}
                    </Button>: null
                }
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

export default connect(mapStateToProps, mapDispatchToProps)(OtherGuests)