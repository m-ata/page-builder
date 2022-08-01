import React, { useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Radio } from '@material-ui/core'
import MaterialTable from 'material-table'
import Alert from '@material-ui/lab/Alert'
import moment from 'moment'
import { useSnackbar } from 'notistack'
import { makeStyles } from '@material-ui/core/styles'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { useOrestAction } from 'model/orest'

const useStyles = makeStyles(() => ({
    infoAlert: {
        position: 'absolute',
        padding: '0px 10px',
        marginLeft: '-6px',
        top: 10,
        left: 15
    }
}))

const GuestSelection = ({open, isLoading, data, auth, logInfo, onLoginCallback}) => {
    const {t} = useTranslation()
    const classes = useStyles()
    const { enqueueSnackbar } = useSnackbar()
    const { setOrestState } = useOrestAction()
    const [selectionGuestId, setSelectionGuestId] = useState(false)

    const handleOnLoginCallback = () => {
        if (selectionGuestId) {
            const getClient = data.find((guest) => guest.clientid === selectionGuestId) || false
            if (getClient) {
                const isOtherGuest =  logInfo.accid !== getClient.clientid
                logInfo.refid = getClient.clientid
                logInfo.accid = getClient.clientid
                logInfo.accgid = getClient.clientgid
                setOrestState(['otherGuestResname'], getClient)
                onLoginCallback(auth, logInfo, isOtherGuest ? getClient : false)
            }else{
                enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'info' })
            }

        } else {
            enqueueSnackbar(t('str_pleaseSelectClient'), { variant: 'info' })
        }
    }

    return (
        <Dialog fullWidth maxWidth="md" open={open}>
            <DialogTitle>
                {t('str_selectGuest')}
            </DialogTitle>
            <DialogContent dividers>
                <MaterialTable
                    isLoading={isLoading}
                    title={
                        <Alert className={classes.infoAlert} variant="outlined" severity="info">
                            {t('str_selectTheGuestYouWantToLogin')}
                        </Alert>
                    }
                    columns={[
                        {
                            title: t('str_firstName'),
                            field: 'firstname',
                            render: props => <React.Fragment>{props.firstname || '-'}</React.Fragment>
                        },
                        {
                            title: t('str_lastName'),
                            field: 'lastname',
                            render: props => <React.Fragment>{props.lastname || '-'}</React.Fragment>
                        },
                        {
                            title: t('str_birthDate'),
                            field: 'birthdate',
                            type: 'date',
                            render: props => <React.Fragment>{props.birthdate && moment(props.birthdate, 'YYYY-MM-DD').format('DD.MM.YYYY') || '-'}</React.Fragment>
                        },
                        {
                            title: t('str_resNo'),
                            field: 'reservno',
                            render: props => <React.Fragment>{props.refid || props.reservno || '-'}</React.Fragment>
                        },
                        {
                            title: t('str_roomNo'),
                            field: 'roomno',
                            render: props => <React.Fragment>{props.roomno || '-'}</React.Fragment>
                        },
                    ]}
                    data={data}
                    onSelectionChange={(rows, row) => setSelectionGuestId(row.id)}
                    localization={{
                        body: {
                            emptyDataSourceMessage: t('str_noRecords'),
                            addTooltip: t('str_add'),
                            deleteTooltip: t('str_delete'),
                            editTooltip: t('str_edit'),
                            filterRow: {
                                filterTooltip: t('str_filter')
                            },
                            editRow: {
                                deleteText: t('str_confirmDeleteRecord'),
                                cancelTooltip: t('str_cancel'),
                                saveTooltip: t('str_save')
                            }
                        },
                        toolbar: {
                            searchTooltip: t('str_search'),
                            searchPlaceholder: t('str_search')
                        },
                        pagination: {
                            labelRowsSelect: t('str_line'),
                            labelDisplayedRows: t('str_labelDisplayedRows'),
                            firstTooltip: t('str_firstPage'),
                            previousTooltip: t('str_previousPage'),
                            nextTooltip: t('str_nextPage'),
                            lastTooltip: t('str_lastPage')
                        },
                        header: {
                            actions: ''
                        },
                    }}
                    actions={[
                        {
                            onClick: (event, rowData) => setSelectionGuestId(rowData.data.id)
                        }
                    ]}
                    components={{
                        Action: props => (
                            <Radio
                                color='primary'
                                checked={selectionGuestId && props.data.clientid === selectionGuestId}
                                onChange={(event) => props.action.onClick(event, props)}
                                value={props.data.clientid}
                                name='clientid'
                            />
                        ),
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button variant="contained" disableElevation onClick={() => handleOnLoginCallback()} color="primary">
                    {t('str_loginWithSelectedGuest')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default GuestSelection