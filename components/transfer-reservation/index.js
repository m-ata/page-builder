import React, { useContext, useEffect, useState } from 'react'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Grid,
    MenuItem,
    TextField,
    Typography,
    IconButton
} from '@material-ui/core'
import axios from 'axios'
import WebCmsGlobal from 'components/webcms-global'
import useTranslation from 'lib/translations/hooks/useTranslation'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { makeStyles } from '@material-ui/core/styles'
import moment from 'moment'
import MomentAdapter from '@date-io/moment'
import { DatePicker, LocalizationProvider, TimePicker } from '@material-ui/pickers'
import { useSnackbar } from 'notistack'
import { OREST_ENDPOINT, REQUEST_METHOD_CONST } from 'model/orest/constants'
import { required } from 'state/utils/form'
import DeleteIcon from '@material-ui/icons/Delete'
import Backdrop from '@material-ui/core/Backdrop'
import CircularProgress from '@material-ui/core/CircularProgress'

const useStyles = makeStyles(() => ({
    root: {
        marginTop: 16,
        border: '1px solid #ddd',
        background: '#F5F5F5',
    },
    infoTextField: {
        background: '#FFFFFF',
        '& fieldset': {
            borderRadius: 0,
        },
    },
    createAccountHelperText: {
        textAlign: 'right',
    },
    textRed: {
        color: 'red'
    },
    parent: {
        position: "relative",
        zIndex: 0,
    },
    backdrop: {
        position: "absolute",
        zIndex: 3,
    }
}))

const fieldTypes = {
    text: 'text',
    textarea: 'textarea',
    select: 'select',
    date: 'date',
    time: 'time'
}

const transferInitialState = {
    airportid: {
        isRequired: true,
        label: 'str_airports',
        key: 'airportid',
        value: '',
        type: 'select',
        list: false,
        fullWidth: true,
        isError: false,
        errorText: '',
        variant: 'outlined',
        size: 'small',
        isBase: true,
        defValKey: 'id',
        gridBreakpoints: {
            xs: 12,
            sm: 6,
            md: 6,
        },
    },
    airline: {
        isRequired: true,
        label: 'str_airline',
        key: 'airline',
        value: '',
        type: 'text',
        list: false,
        fullWidth: true,
        isError: false,
        errorText: '',
        variant: 'outlined',
        size: 'small',
        isBase: true,
        gridBreakpoints: {
            xs: 12,
            sm: 6,
            md: 6,
        },
    },
    flydate: {
        isRequired: true,
        label: 'Uçuş Tarihi',
        key: 'flydate',
        value: null,
        type: 'date',
        list: false,
        fullWidth: true,
        isError: false,
        errorText: '',
        variant: 'outlined',
        size: 'small',
        isBase: true,
        gridBreakpoints: {
            xs: 12,
            sm: 6,
            md: 6,
        },
    },
    flytime: {
        isRequired: true,
        label: 'str_flyTime',
        key: 'flytime',
        value: null,
        type: 'time',
        list: false,
        fullWidth: true,
        isError: false,
        errorText: '',
        variant: 'outlined',
        size: 'small',
        isBase: true,
        gridBreakpoints: {
            xs: 12,
            sm: 6,
            md: 6,
        },
    },
    flightno: {
        isRequired: false,
        label: 'str_flightNo',
        key: 'flightno',
        value: '',
        type: 'text',
        list: false,
        fullWidth: true,
        isError: false,
        errorText: '',
        variant: 'outlined',
        size: 'small',
        isBase: true,
        gridBreakpoints: {
            xs: 12,
            sm: 6,
            md: 6,
        },
    },
    vehicleid: {
        isRequired: false,
        label: 'str_vehicle',
        key: 'vehicleid',
        value: '',
        type: 'select',
        list: false,
        fullWidth: true,
        isError: false,
        errorText: '',
        variant: 'outlined',
        size: 'small',
        isBase: true,
        defValKey: 'id',
        gridBreakpoints: {
            xs: 12,
            sm: 6,
            md: 6,
        },
    },
    note: {
        isRequired: false,
        label: 'str_note',
        key: 'note',
        value: '',
        type: 'textarea',
        list: false,
        fullWidth: true,
        isError: false,
        errorText: '',
        variant: 'outlined',
        size: 'small',
        isBase: true,
        gridBreakpoints: {
            xs: 12,
            sm: 12,
            md: 12,
        },
    },
}

const arrivalTransferInitialState = {...transferInitialState}

const returnTransferInitialState = {...transferInitialState}

const getFormComponent = (classes, field, disabled, onChange, useArrivalTransfer = false) => {
    const { t } = useTranslation()
    switch (field.type) {
        case fieldTypes.text:
            return (
                <TextField
                    className={classes.infoTextField}
                    id={field.key}
                    name={field.key}
                    label={t(field.label)}
                    required={field.isRequired}
                    disabled={disabled}
                    fullWidth={field.fullWidth}
                    size={field.size}
                    variant={field.variant}
                    value={field.value}
                    onChange={(e) => onChange(field.key, e.target.value, field.type)}
                    error={field.isError}
                    helperText={field.isError && field.errorText}
                />
            )
        case fieldTypes.textarea:
            return (
                <TextField
                    className={classes.infoTextField}
                    id={field.key}
                    name={field.key}
                    label={t(field.label)}
                    required={field.isRequired}
                    disabled={disabled}
                    fullWidth={field.fullWidth}
                    size={field.size}
                    variant={field.variant}
                    value={field.value}
                    onChange={(e) => onChange(field.key, e.target.value, field.type)}
                    error={field.isError}
                    helperText={field.isError && field.errorText}
                    multiline
                    rows={3}
                />
            )
        case fieldTypes.select:
            return (
                <TextField
                    className={classes.infoTextField}
                    id={field.key}
                    name={field.key}
                    label={t(field.label)}
                    required={field.isRequired}
                    disabled={disabled}
                    fullWidth={field.fullWidth}
                    size={field.size}
                    variant={field.variant}
                    value={field.value}
                    onChange={(e) => onChange(field.key, e.target.value, field.type)}
                    error={field.isError}
                    helperText={field.isError && field.errorText}
                    select
                >
                    {field.list && field.list.length > 0 ?
                        field.list.map((listItem, listKey) =>
                            <MenuItem key={listKey} value={listItem.id}>{listItem.description}</MenuItem>,
                        ) : <MenuItem value={-1}>{t('str_notFound')}</MenuItem>}
                </TextField>
            )
        case fieldTypes.date:
            return (
                <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                    <DatePicker
                        disablePast
                        minDate={useArrivalTransfer && useArrivalTransfer[transferInitialState.flydate.key]?.value && moment(useArrivalTransfer[transferInitialState.flydate.key]?.value).add(1, 'days') || null}
                        required={field.isRequired}
                        allowKeyboardControl
                        disabled={disabled}
                        autoOk
                        id={field.key}
                        name={field.key}
                        label={t(field.label)}
                        inputFormat='DD/MM/YYYY'
                        openTo={'date'}
                        views={['year', 'month', 'date']}
                        value={field.value || null}
                        onChange={(newValue) => onChange(field.key, newValue, field.type)}
                        renderInput={(props) => {
                            return (
                                <TextField
                                    {...props}
                                    className={classes.infoTextField}
                                    fullWidth={field.fullWidth}
                                    size={field.size}
                                    variant={field.variant}
                                    required={field.isRequired}
                                    error={field.isError}
                                    helperText={field.isError && field.errorText}
                                />
                            )
                        }}
                    />
                </LocalizationProvider>
            )
        case fieldTypes.time:
            return (
                <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                    <TimePicker
                        ampm={true}
                        inputFormat='HH:mm'
                        mask='__:__'
                        value={field.value && moment(field.value, OREST_ENDPOINT.TIMEFORMAT) || null}
                        onChange={(newValue) => onChange(field.key, newValue, field.type)}
                        id={field.key}
                        name={field.key}
                        label={t(field.label)}
                        renderInput={(props) => (
                            <TextField
                                {...props}
                                className={classes.infoTextField}
                                fullWidth={field.fullWidth}
                                size={field.size}
                                variant={field.variant}
                                required={field.isRequired}
                                error={field.isError}
                                helperText={field.isError && field.errorText}
                            />
                        )}
                    />
                </LocalizationProvider>
            )
        default:
            return
    }
}

const  TransferReservation = ({disabled, flyTransfer, flyTransferReturn, onCallbackArrivalTransfer, onCallbackReturnTransfer, onCallbackTransferReservationReset}) => {
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { enqueueSnackbar } = useSnackbar()
    const { t } = useTranslation()
    const classes = useStyles()

    const [isLoaded, setIsLoaded] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [useArrivalTransfer, setUseArrivalTransfer] = useState(flyTransfer || arrivalTransferInitialState)
    const [arrivalTransferAccordionOpen, setArrivalTransferAccordionOpen] = useState(!!flyTransfer || true)

    const [useReturnTransfer, setUseReturnTransfer] = useState(flyTransferReturn || returnTransferInitialState)
    const [returnTransferAccordionOpen, setReturnTransferAccordionOpen] = useState(!!flyTransferReturn)

    useEffect(() => {
        let active = true
        if (active) {
            async function loadListData() {
               setIsLoading(true)
               const airportList = await axios({
                    url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/airport/list',
                    method: REQUEST_METHOD_CONST.POST,
                }).then((hotelAirportListResponse) => {
                    if (active) {
                        const hotelAirportListResponseData = hotelAirportListResponse?.data?.data
                        if (hotelAirportListResponse.data.success && hotelAirportListResponseData.length > 0) {
                            return hotelAirportListResponseData
                        }else{
                            return false
                        }
                    }
                })

                const vehicleList =  await axios({
                    url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/vehicle/list',
                    method: REQUEST_METHOD_CONST.POST,
                }).then((hotelVehicleListResponse) => {
                    if (active) {
                        const hotelAirportListResponseData = hotelVehicleListResponse?.data?.data
                        if (hotelVehicleListResponse.data.success && hotelAirportListResponseData.length > 0) {
                            return hotelAirportListResponseData
                        }else{
                            return false
                        }
                    }
                })

                setIsLoading(false)

                return {
                    airportList: airportList || false,
                    vehicleList: vehicleList || false
                }
            }

            if(!isLoaded){
                loadListData().then((list) => {
                    setUseArrivalTransfer({
                        ...useArrivalTransfer,
                        [arrivalTransferInitialState.airportid.key]: {
                            ...useArrivalTransfer[arrivalTransferInitialState.airportid.key],
                            list: list.airportList,
                        },
                        [arrivalTransferInitialState.vehicleid.key]: {
                            ...useArrivalTransfer[arrivalTransferInitialState.vehicleid.key],
                            list: list.vehicleList,
                        },
                    })

                    setUseReturnTransfer({
                        ...useReturnTransfer,
                        [returnTransferInitialState.airportid.key]: {
                            ...useReturnTransfer[returnTransferInitialState.airportid.key],
                            list: list.airportList,
                        },
                        [returnTransferInitialState.vehicleid.key]: {
                            ...useReturnTransfer[returnTransferInitialState.vehicleid.key],
                            list: list.vehicleList,
                        },
                    })

                    setIsLoaded(true)
                })
            }
        }

        return () => {
            active = false
        }
    }, [isLoaded])

    useEffect(() => {

        if (!flyTransfer) {
            setUseArrivalTransfer(arrivalTransferInitialState)
            setIsLoaded(false)
        } else if (!flyTransferReturn) {
            setUseReturnTransfer(returnTransferInitialState)
            setIsLoaded(false)
        }

    }, [flyTransfer, flyTransferReturn])

    const getOnChangeValue = (type, value, isRequired) => {
        switch (type) {
            case fieldTypes.date:
                const newDateValue = moment(value).format(OREST_ENDPOINT.DATEFORMAT)
                return {
                    value: newDateValue,
                    isError: newDateValue === 'Invalid date',
                    errorText: newDateValue === 'Invalid date' ? `*${t('str_invalidDate')}` : false,
                    isRequired: isRequired,
                }
            case fieldTypes.time:
                const newTimeValue = moment(value).format(OREST_ENDPOINT.TIMEFORMAT)
                return {
                    value: newTimeValue,
                    isError: newTimeValue === 'Invalid date',
                    errorText: newTimeValue === 'Invalid date' ? `*${t('str_invalidDate')}` : false,
                    isRequired: isRequired,
                }
            default:
                return {
                    value: value,
                    isError: isRequired && !!required(value),
                    errorText: isRequired && !!required(value),
                    isRequired: isRequired,
                }
        }
    }

    const onChangeArrivalTransfer = (key, value, type) => {
        const useData = getOnChangeValue(type, value, useArrivalTransfer[key].isRequired)
        setUseArrivalTransfer({
            ...useArrivalTransfer,
            [key]: {
                ...useArrivalTransfer[key],
                value: useData.value,
                isError: useData.isError,
                isRequired: useData.isRequired,
                errorText: useData.errorText,
            },
        })
    }

    const onChangeReturnTransfer = (key, value, type) => {
        const useData = getOnChangeValue(type, value, useReturnTransfer[key].isRequired)
        setUseReturnTransfer({
            ...useReturnTransfer,
            [key]: {
                ...useReturnTransfer[key],
                value: useData.value,
                isError: useData.isError,
                isRequired: useData.isRequired,
                errorText: useData.errorText,
            },
        })
    }

    const transferRequiredFieldCheck = (stateData, onChange) => {
        let isRequiredFieldMistake = false
        const newStateData = {...stateData}

        for (let key of Object.keys(newStateData)) {
            const getField = newStateData[key]
            if (getField.isRequired && !getField.value || getField.isError) {
                isRequiredFieldMistake = true
                newStateData[key].isError = true
            }
        }

        if(isRequiredFieldMistake){
            enqueueSnackbar(t('str_pleaseCheckMandatoryFields'), { variant: 'warning' })
            onChange(newStateData)
            return false
        }

        return true
    }

    const handleTransferReservationData = (stateData) => {
        return stateData
    }

    const handleArrivalTransfer = () => {
        const isValid = transferRequiredFieldCheck(useArrivalTransfer, setUseArrivalTransfer)
        if(isValid){
            return onCallbackArrivalTransfer(handleTransferReservationData(useArrivalTransfer))
        }
    }

    const handleReturnTransfer = () => {
        const isValid = transferRequiredFieldCheck(useReturnTransfer, setUseReturnTransfer)
        if(isValid){
            return onCallbackReturnTransfer(handleTransferReservationData(useReturnTransfer))
        }
    }

    const handleResetTransferReservation = (isReturn = false) => {
        if(isReturn){
            setUseReturnTransfer(returnTransferInitialState)
        }else{
            setUseArrivalTransfer(arrivalTransferInitialState)
        }
        onCallbackTransferReservationReset(isReturn)
        setIsLoaded(false)
    }

    return (
        <React.Fragment>
            <Typography variant="h6" gutterBottom>
                {t('str_transferService')}
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Accordion expanded={arrivalTransferAccordionOpen} onChange={() => setArrivalTransferAccordionOpen(!arrivalTransferAccordionOpen)} className={classes.parent}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="ArrivalTransfer-content" id="ArrivalTransfer-header">
                            <Typography className={classes.heading}>{t('str_arrivalTransfer')}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2} direction='row' justify='space-between' alignItems='center'>
                                {Object.keys(useArrivalTransfer).map((fieldItem, keyIndex) => {
                                    const useField = useArrivalTransfer[fieldItem]
                                    return (
                                        <Grid item xs={useField.gridBreakpoints.xs} sm={useField.gridBreakpoints.sm} md={useField.gridBreakpoints.md} key={keyIndex}>
                                            {getFormComponent(classes, useField, disabled, onChangeArrivalTransfer)}
                                        </Grid>
                                    )
                                })}
                                <Grid item>
                                    <Button variant="outlined" color="primary" disableElevation onClick={()=> handleArrivalTransfer()} disabled={disabled}>
                                        {flyTransfer ? t('str_update'): t('str_add')}
                                    </Button>
                                </Grid>
                                {flyTransfer ?
                                    <Grid item>
                                        <IconButton aria-label="delete" onClick={() => handleResetTransferReservation()} disabled={disabled}>
                                            <DeleteIcon fontSize="small"/>
                                        </IconButton>
                                    </Grid> : null}
                            </Grid>
                        </AccordionDetails>
                        <Backdrop className={classes.backdrop} open={isLoading}>
                            <CircularProgress color="primary" />
                        </Backdrop>
                    </Accordion>
                    <Accordion expanded={returnTransferAccordionOpen} onChange={() => setReturnTransferAccordionOpen(!returnTransferAccordionOpen)} className={classes.parent}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="ReturnTransfer-content" id="ReturnTransfer-header">
                            <Typography className={classes.heading}>{t('str_departureTransfer')}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2} direction='row' justify='space-between' alignItems='center'>
                                {Object.keys(useReturnTransfer).map((fieldItem, keyIndex) => {
                                    const useField = useReturnTransfer[fieldItem]
                                    return (
                                        <Grid item xs={useField.gridBreakpoints.xs} sm={useField.gridBreakpoints.sm} md={useField.gridBreakpoints.md} key={keyIndex}>
                                            {getFormComponent(classes, useField, disabled, onChangeReturnTransfer, useArrivalTransfer)}
                                        </Grid>
                                    )
                                })}
                                <Grid item>
                                    <Button variant="outlined" color="primary" disableElevation onClick={()=> handleReturnTransfer()} disabled={disabled}>
                                        {flyTransferReturn ? t('str_update'): t('str_add')}
                                    </Button>
                                </Grid>
                                {flyTransferReturn ?
                                    <Grid item>
                                        <IconButton aria-label="delete" onClick={() => handleResetTransferReservation(true)} disabled={disabled}>
                                            <DeleteIcon fontSize="small"/>
                                        </IconButton>
                                    </Grid> : null}
                            </Grid>
                        </AccordionDetails>
                        <Backdrop className={classes.backdrop} open={isLoading}>
                            <CircularProgress color="primary" />
                        </Backdrop>
                    </Accordion>
                </Grid>
            </Grid>
        </React.Fragment>
    )
}

export default TransferReservation