import React, { useEffect, useState, useContext } from "react";
import {makeStyles} from '@material-ui/core/styles'
import {connect, useSelector} from 'react-redux'
import {ViewList, Insert, UseOrest, Patch} from '@webcms/orest'
import moment from 'moment'
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    TextField,
    Typography,
    FormControlLabel,
    ClickAwayListener,
    Checkbox,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    InputAdornment,
    Collapse
} from '@material-ui/core'
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import MomentAdapter from '@date-io/moment'
import {
    DatePicker,
    TimePicker,
    LocalizationProvider,
} from '@material-ui/pickers'
import {useSnackbar} from 'notistack'
import WebCmsGlobal from "../../../webcms-global";
import {isErrorMsg, OREST_ENDPOINT} from "../../../../model/orest/constants";
import useTranslation from "../../../../lib/translations/hooks/useTranslation";
import CustomAutoComplete from "../../../CustomAutoComplete/CustomAutoComplete";
import SpinEdit from "../../../../@webcms-ui/core/spin-edit";
import {MAX_MINUTE_VALUE, SLASH} from "../../../../model/globals";
import TrackedChangesDialog from "../../../TrackedChangesDialog";
import LoadingSpinner from "../../../LoadingSpinner";
import RaTagSelect from "../../../RaTagSelect";
import {InsertRaTag, PatchRaTag} from "../../../../model/orest/components/RaTag";
import TableColumnText from "../../../TableColumnText";
import MTableColumnSettings from '../../../MTableColumnSettings'
import CustomTable from "../../../CustomTable";
import {required} from "../../../../state/utils/form";
import AddDialogActions from "../../../AddDialogActions";
import {helper} from "../../../../@webcms-globals";
import RequestDetail from "../../../user-portal/components/RequestDetail";
import {setToState} from "../../../../state/actions";


const useStyles = makeStyles( theme => ({
    overflowContainer: {
        maxWidth: '255px',
        minWidth: '255px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    inputAdornmentStyle: {
        position:"absolute",
        right:"2px",
        top:"10px",
        "&.MuiInputAdornment-positionStart": {
            marginRight:"0"
        }
    },
    popoverStyle: {
        width:"140px",
    },
    dialogTitle: {
        '&.MuiTypography-h6': {
            fontWeight: '600'
        }
    }
}));

function SaleCalls(props) {
    const classes = useStyles();

    const { enqueueSnackbar } = useSnackbar()

    const { setToState } = props

    //context
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal);
    const { t } = useTranslation();

    //redux
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
    const token = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false);
    const clientBase = useSelector((state) => state?.orest?.state?.client || false)
    const hotelRefNo = useSelector(state => state?.hotelinfo?.currentHotelRefNo || null);
    const panelStatus = useSelector(state => state?.formReducer?.userPortal?.panelStatus);
    const panels = useSelector(state => state?.formReducer?.userPortal?.panels || false);


    //state
    const initialState = {
        duedate: {value: null, isRequired: false, isError: false, helperText: false},
        dueduserid: {value: null, isRequired: false, isError: false, helperText: false},
        duetime: {value: null, isRequired: false, isError: false, helperText: false},
        durhour: {value: 0, isRequired: false, isError: false, helperText: false},
        durmin: {value: 0, isRequired: false, isError: false, helperText: false},
        notecatid: {value: null, isRequired: false, isError: false, helperText: false},
        notetypeid: {value: null, isRequired: false, isError: false, helperText: false},
        reasonid: {value: null, isRequired: false, isError: false, helperText: false},
        refinfo: {value: '', isRequired: false, isError: false, helperText: false},
        salesnote: {value: '', isRequired: true, isError: false, helperText: false},
        transdate: {value: moment(), isRequired: false, isError: false, helperText: false},
        transtime: {value: moment(), isRequired: false, isError: false, helperText: false},
        isdone: {value: false, isRequired: false, isError: false, helperText: false},
    }
    const [saleCallData, setSaleCallData] = useState(initialState);
    const [saleCallDataBase, setSaleCallDataBase] = useState(initialState);
    const [getData, setGetData] = useState(null)
    const [isInitialStateLoad, setIsInitialStateLoad] = useState(false)
    const [selectedSaleCallInfo, setSelectedSaleCallInfo] = useState(false);

    const [callList, setCallList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaleDataLoading, setIsSaleDataLoading] = useState(false);

    const [selectedTagList, setSelectedTagList] = useState([]);
    const [selectedTagListBase, setSelectedTagListBase] = useState([]);
    const [raTagInfo, setRaTagInfo] = useState(null);

    const [isEdit, setIsEdit] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openTrackedDialog, setOpenTrackedDialog] = useState(false);
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [openReminderPicker, setOpenReminderPicker] = useState(false);

    const [columns, setColumns] = useState([
        {
            title: t('str_date'),
            field: 'transdate',
            headerStyle: {
                minWidth: '100px',
            },
            render: (state) => (
                <Typography style={{fontSize: 'inherit'}}>
                    {moment(state.transdate).format('L')}
                </Typography>
            ),
            hidden: false
        },
        {
            title: t('str_time'),
            field: 'transtime',
            hidden: false
        },
        {
            title: t('str_duration'),
            field: 'duration',
            hidden: false
        },
        {
            title: t('str_empCode'),
            field: 'empcode',
            hidden: false
        },
        {
            title: t('str_pipeStage'),
            field: 'pipestage',
            hidden: false
        },
        {
            title: t('str_company'),
            field: 'agency',
            hidden: false
        },
        {
            title: t('str_pipeDesc'),
            field: 'pipedesc',
            render: (state) => <TableColumnText minWidth={250} maxWidth={250} showToolTip>{state.pipedesc}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_contact'),
            field: 'contact',
            hidden: false
        },
        {
            title: t('str_salesNote'),
            field: 'salesnote',
            render: (state) => <TableColumnText minWidth={250} maxWidth={250} showToolTip>{state.salesnote}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_internalNote'),
            field: 'refinfo',
            render: (state) => <TableColumnText minWidth={250} maxWidth={250} showToolTip>{state.refinfo}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_type'),
            field: 'notetype',
            hidden: false
        },
        {
            title: t('str_category'),
            field: 'notecat',
            hidden: false
        },
        {
            title: t('str_town'),
            field: 'town',
            hidden: false
        },
        {
            title: t('str_city'),
            field: 'city',
            hidden: false
        },
        {
            title: t('str_country'),
            field: 'country',
            hidden: false
        },
        {
            title: t('str_done'),
            field: 'isdone',
            render: (state) => (
                <div style={{textAlign: 'center'}}>
                    {
                        state.isdone ? (
                            <CheckCircleIcon style={{color: 'green'}}/>
                        ) : (
                           <CancelIcon style={{color: 'red'}}/>
                        )
                    }
                </div>
            ),
            hidden: false
        },
        {
            title: t('str_id'),
            field: 'id',
            align: 'right',
            render: (state) =>  <TableColumnText textAlign={'right'}>{state.id}</TableColumnText>,
            hidden: false
        },
    ])

    useEffect(() => {
        getSaleCallList();
    }, [])

    useEffect(() => {
        let isEffect = true
        if (isEffect && saleCallData && getData) {
            const newClientInitialState = helper.objectMapper(saleCallData, getData, ['salesnote'])
            Object.keys(newClientInitialState).map((key) => {
                if(key === 'transtime' || key === 'duetime') {
                    if(newClientInitialState[key]?.value) {
                        newClientInitialState[key].value = moment(newClientInitialState[key].value, 'HH:mm:ss')
                    }
                }
            })
            setSaleCallData(newClientInitialState)
            setSaleCallDataBase(newClientInitialState)
            setIsInitialStateLoad(true)
        }
        return () => {
            isEffect = false
        }
    }, [getData])

    const getSaleCallList = () => {
        setIsLoading(true)
        let params = {};
        params.field = 'agencyid';
        params.text = clientBase?.id;
        params.hotelrefno = hotelRefNo || GENERAL_SETTINGS.HOTELREFNO;
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.SALECALL,
            token,
            params: params
        }).then(res => {
            setIsLoading(false);
            if(res.status === 200) {
                setCallList(res.data.data)
            }
        })
    }

    const handleGetSaleCall = (gid) => {
        setIsSaleDataLoading(true);
        setOpenAddDialog(true)
        setIsEdit(true)
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.SALECALL + SLASH + OREST_ENDPOINT.GET + SLASH + gid,
            token,
            params: {
                allhotels: true
            }
        }).then(res => {
            if(res.status === 200) {
                setGetData(res.data.data);
            } else {
                setIsSaleDataLoading(false);
            }
        }).then(() => {
            setIsSaleDataLoading(false);
        })
    }

    const handleDefRecord = () => {
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.SALECALL + SLASH + OREST_ENDPOINT.DEF,
            token,
            params: {
                hotelrefno: hotelRefNo || GENERAL_SETTINGS.HOTELREFNO
            }
        }).then(res => {
            if(res.status === 200) {
                const data = Object.assign({}, res.data.data, saleCallData)
                setSaleCallData(data);
            }
        })
    }

    const handleOpenDialog = () => {
        setIsEdit(false);
        setOpenAddDialog(true);
        handleDefRecord();
    }

    const handleCloseDialog = () => {
        const data = JSON.stringify(saleCallData)
        const baseData = JSON.stringify(saleCallDataBase)
        if(data !== baseData || selectedTagList.length !== selectedTagListBase.length) {
            setOpenTrackedDialog(true)
        } else {
            setOpenAddDialog(false)
            setTimeout(() => {
                handleReset()
            }, 100)
        }
    }


    const handleOnLoadAutoComplete = (initialValue, isSearch, isFinish, name) => {
        if(isSearch) {
            if(isFinish) {
                const data = {...saleCallData}
                data[name].value = initialValue
                setSaleCallData(data)
            }
        } else {
            const data = {...saleCallData}
            data[name].value = initialValue
            setSaleCallData(data)
        }
    }

    const handleSave = () => {
        setIsSaving(true);
        const data = {...saleCallData};
        data.agencyid = clientBase?.id
        let hour = data['durhour'].value
        let minute = data['durmin'].value
        if(hour > 0 || minute > 0) {
            hour = String(hour).length <= 1 ? `0${hour}h` : `${hour}h`
            minute = String(minute).length <= 1 ? `0${minute}m` : `${minute}m`
            data.duration = hour + minute
        }
        Object.keys(initialState).map((key) => {
            if(data[key].value) {
                if(key === 'transdate' || key === 'duedate') {
                    data[key] = moment(data[key].value).format(OREST_ENDPOINT.DATEFORMAT) || null
                } else if(key === 'transtime' || key === 'duetime') {
                    data[key] = moment(data[key].value).format('HH:mm') || null
                } else {
                    data[key] = typeof data[key].value === 'object' ?  data[key].value?.id : data[key].value
                }
            } else {
                data[key] = null
            }
        })


        if(isEdit && getData) {
            Patch({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.SALECALL,
                token,
                gid: getData?.gid,
                params: {
                    hotelrefno: hotelRefNo || GENERAL_SETTINGS.HOTELREFNO
                },
                data: data
            }).then(res => {
                if(res.status === 200) {
                    if(raTagInfo?.gid) {
                        PatchRaTag(GENERAL_SETTINGS.OREST_URL, token, raTagInfo?.gid, selectedTagList, hotelRefNo).then(raTagPatchResponse => {
                            handleAfterResponse(raTagPatchResponse)
                        })
                    } else {
                        if(selectedTagList.length > 0) {
                            InsertRaTag(GENERAL_SETTINGS.OREST_URL, token, getData?.mid, selectedTagList, hotelRefNo).then(r1 => {
                                handleAfterResponse(r1)
                            })
                        } else {
                            getSaleCallList();
                            handleReset();
                            enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'});
                            setOpenAddDialog(false);
                            setIsSaving(false);
                        }
                    }
                } else {
                    setIsSaving(false);
                    const error = isErrorMsg(res);
                    enqueueSnackbar(t(error.errMsg), {variant: 'error'});
                }
            })
        } else {
            Insert({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.SALECALL,
                token,
                params: {
                    hotelrefno: hotelRefNo || GENERAL_SETTINGS.HOTELREFNO
                },
                data: data
            }).then(res => {
                if(res.status === 200) {
                    if(selectedTagList.length > 0) {
                        InsertRaTag(GENERAL_SETTINGS.OREST_URL, token, res?.data?.data?.mid, selectedTagList, hotelRefNo).then(r1 => {
                            handleAfterResponse(r1)
                        })
                    } else {
                        setIsSaving(false);
                        getSaleCallList();
                        handleReset();
                        enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'});
                        setOpenAddDialog(false);
                    }
                } else {
                    const error = isErrorMsg(res);
                    enqueueSnackbar(t(error.errMsg), {variant: 'error'});
                }
            })
        }
    }

    const handleAfterResponse = (response) => {
        setIsSaving(false);
        if(response.status === 200) {
            getSaleCallList();
            handleReset();
            enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'});
            setOpenAddDialog(false);
        } else {
            const error = isErrorMsg(response);
            enqueueSnackbar(t(error.errMsg), {variant: 'error'});
        }
    }

    const handleOpenDetailPanel = (saleCallInfo) => {
        setSelectedSaleCallInfo(saleCallInfo)
        setToState('userPortal', ['panelStatus'], panels.requestDetail)
        setToState('userPortal', ['currentTask'], saleCallInfo)
    }

    const handleOnChange = (event, key, isOnBlur, isMomentObject) => {
        const name = key ? key : event.target.name
        const value = isMomentObject ? moment(event) : event?.target ? event.target.value : event

        if(isOnBlur) {
            setSaleCallData({
                ...saleCallData,
                [name]: {
                    ...saleCallData[name],
                    isError: saleCallData[name]?.isRequired && !!required(value),
                    helperText: saleCallData[name]?.isRequired && !!required(value) && t('str_mandatory')
                }
            })
        } else {
            setSaleCallData({
                ...saleCallData,
                [name]: {
                    ...saleCallData[name],
                    value: value,
                    isError: saleCallData[name]?.isRequired && !!required(value),
                    helperText: saleCallData[name]?.isRequired && !!required(value) && t('str_mandatory')
                }
            })
        }

    }


    const handleReset = () => {
        setSaleCallData(initialState);
        setSaleCallDataBase(initialState)
        setSelectedTagList([]);
        setSelectedTagListBase([]);
        setIsInitialStateLoad(false)
        setIsEdit(false)
    }

    return(
        <div>
            <Dialog
                fullWidth
                maxWidth={'md'}
                open={openAddDialog}
                disableEnforceFocus
            >
                <DialogTitle id="add-dialog-title" className={classes.dialogTitle}>{!isSaleDataLoading ? getData ? t('str_edit') : t('str_addNewRecord') : ''}</DialogTitle>
                <DialogContent dividers>
                    {
                        isSaleDataLoading ? (
                            <LoadingSpinner />
                        ) :(
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        value={clientBase?.fullname}
                                        fullWidth
                                        disabled
                                        variant={'outlined'}
                                        label={t('str_account')}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        id={'salesnote'}
                                        name={'salesnote'}
                                        value={saleCallData.salesnote?.value || ''}
                                        error={saleCallData.salesnote.isError}
                                        required={saleCallData.salesnote.isRequired}
                                        onChange={(e) => handleOnChange(e)}
                                        onBlur={e => handleOnChange(e, false, true)}
                                        fullWidth
                                        multiline
                                        rows={4}
                                        rowsMax={4}
                                        variant={'outlined'}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment
                                                    className={classes.inputAdornmentStyle}
                                                    position="start"
                                                >
                                                    <Typography style={{fontSize: '12px'}}>
                                                        {
                                                            saleCallData.salesnote.value ?
                                                                `${saleCallData.salesnote.value.length}/4096`
                                                                :
                                                                null
                                                        }
                                                    </Typography>
                                                </InputAdornment>
                                            )
                                        }}
                                        helperText={saleCallData.salesnote.helperText}
                                        label={t('str_note')}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <RaTagSelect
                                        id={'tags-outlined'}
                                        name={'tags-outlined'}
                                        value={selectedTagList}
                                        onChange={(event, newValue) => {
                                            setSelectedTagList(newValue)
                                        }}
                                        onLoad={(raTagInfo, tagList) => {
                                            setSelectedTagList(tagList);
                                            setSelectedTagListBase(tagList);
                                            setRaTagInfo(raTagInfo);
                                        }}
                                        tableName={OREST_ENDPOINT.SALECALL}
                                        variant={'outlined'}
                                        mid={getData?.mid || 0}
                                        label={t('str_tags')}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <CustomAutoComplete
                                        id={'reasonid'}
                                        name={'reasonid'}
                                        value={saleCallData.reasonid.value || null}
                                        required={saleCallData.reasonid.isRequired}
                                        error={saleCallData.reasonid.isError}
                                        endpoint={'screason/view/list'}
                                        variant={'outlined'}
                                        params={{
                                            query: 'isactive:true',
                                            hotelrefno: hotelRefNo || GENERAL_SETTINGS.HOTELREFNO,
                                            limit: 25,
                                            field: 'code',
                                            text: ''
                                        }}
                                        onChange={(event, newValue) => {handleOnChange(newValue, 'reasonid')}}
                                        onLoad={(initialValue, isSearch, isFinish) => handleOnLoadAutoComplete(initialValue, isSearch, isFinish, 'reasonid')}
                                        showOptionLabel={'code'}
                                        searchParam={'code'}
                                        initialId={isInitialStateLoad && typeof saleCallData?.reasonid.value !== 'object' && saleCallData?.reasonid.value || false}
                                        label={t('str_reason')}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Grid container spacing={1}>
                                        <Grid item xs={12} sm={6}>
                                            <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                                                <ClickAwayListener onClickAway={() => setOpenDatePicker(false)}>
                                                    <div>
                                                        <DatePicker
                                                            open={openDatePicker}
                                                            onClose={() => {setOpenDatePicker(false)}}
                                                            minDate={moment().startOf('year')}
                                                            value={saleCallData.transdate.value}
                                                            label={t("str_date")}
                                                            onChange={(newDate) => {handleOnChange(newDate, 'transdate', false, true)}}
                                                            onError={(e) => {
                                                                const data = {...saleCallData}
                                                                data.transdate.isError = !!e
                                                                setSaleCallData(data)
                                                            }}
                                                            inputFormat={"DD.MM.YYYY"}
                                                            mask={"__.__.____"}
                                                            renderInput={(props) => (
                                                                <TextField
                                                                    fullWidth
                                                                    variant={"outlined"}
                                                                    {...props}
                                                                    InputProps={{
                                                                        ...props.InputProps,
                                                                        endAdornment: (
                                                                            <React.Fragment>
                                                                         <span onClick={() => {setOpenDatePicker(true)}}>
                                                                             {props.InputProps.endAdornment}
                                                                         </span>
                                                                            </React.Fragment>
                                                                        ),
                                                                    }}
                                                                    FormHelperTextProps={{
                                                                        style:  {opacity: props.error ? '1' : '0'}
                                                                    }}
                                                                    helperText={ `(${props.inputProps.placeholder})`}
                                                                />
                                                            )}
                                                        />
                                                    </div>
                                                </ClickAwayListener>
                                            </LocalizationProvider>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                                                <TimePicker
                                                    ampm={false}
                                                    inputFormat="HH:mm"
                                                    mask="__:__"
                                                    value={saleCallData.transtime.value || null}
                                                    onChange={(newTime) => {
                                                        handleOnChange(newTime, 'transtime', false, true)
                                                    }}
                                                    onError={(e) => {
                                                        const data = {...saleCallData}
                                                        data.transtime.isError = !!e
                                                        setSaleCallData(data)
                                                    }}
                                                    label={t('str_time')}
                                                    renderInput={(props) => (
                                                        <TextField
                                                            id={'time'}
                                                            name={'time'}
                                                            variant={'outlined'}
                                                            {...props}
                                                            InputProps={{
                                                                ...props.InputProps,
                                                                endAdornment: (
                                                                    <React.Fragment>
                                                                        <span/>
                                                                    </React.Fragment>
                                                                ),
                                                            }}
                                                            FormHelperTextProps={{
                                                                style:  {opacity: props.error ? '1' : '0'}
                                                            }}
                                                            helperText={`(${props.inputProps.placeholder})`}
                                                        />
                                                    )
                                                    }
                                                />
                                            </LocalizationProvider>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Grid container spacing={1}>
                                        <Grid item xs={12} sm={4}>
                                            <SpinEdit
                                                id={'durhour'}
                                                name={'durhour'}
                                                defaultValue={saleCallData.durhour.value || 0}
                                                padding={0}
                                                label={t('str_hour')}
                                                onChange={(value) => handleOnChange(value, 'durhour')}
                                                isWritableText
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <SpinEdit
                                                id={'durmin'}
                                                name={'durmin'}
                                                max={MAX_MINUTE_VALUE}
                                                error={Number(saleCallData.durmin.value) > MAX_MINUTE_VALUE}
                                                helpText={Number(saleCallData.durmin.value) > MAX_MINUTE_VALUE ? t('str_invalidInput') : ''}
                                                defaultValue={saleCallData.durmin.value || 0}
                                                padding={0}
                                                label={t('str_minute')}
                                                onChange={(value) => handleOnChange(value, 'durmin')}
                                                isWritableText
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <div style={{marginTop: '4px'}}>
                                                <FormControlLabel
                                                    value={String(saleCallData.isdone.value)}
                                                    onChange={(e) => handleOnChange(e.target.checked, 'isdone')}
                                                    checked={saleCallData.isdone.value}
                                                    control={<Checkbox color="primary"/>}
                                                    label={t('str_done')}
                                                />
                                            </div>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12}>
                                    <Accordion>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography style={{fontWeight: '600'}}>{t('str_moreDetails')}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails style={{display: 'block'}}>
                                            <div style={{paddingTop: '16px'}}>
                                                <Grid container spacing={3}>
                                                    <Grid item xs={12} sm={6}>
                                                        <CustomAutoComplete
                                                            id={'notetypeid'}
                                                            name={'notetypeid'}
                                                            value={saleCallData.notetypeid.value || null}
                                                            required={saleCallData.notetypeid.isRequired}
                                                            error={saleCallData.notetypeid.isError}
                                                            endpoint={'notetype/list'}
                                                            variant={'outlined'}
                                                            params={{
                                                                hotelrefno: hotelRefNo || GENERAL_SETTINGS.HOTELREFNO,
                                                                limit: 25,
                                                                field: 'code',
                                                                text: ''
                                                            }}
                                                            onChange={(event, newValue) => {handleOnChange(newValue, 'notetypeid')}}
                                                            onLoad={(initialValue, isSearch, isFinish) => handleOnLoadAutoComplete(initialValue, isSearch, isFinish, 'notetypeid')}
                                                            showOptionLabel={'code'}
                                                            searchParam={'code'}
                                                            initialId={isInitialStateLoad && typeof saleCallData?.notetypeid.value !== 'object' && saleCallData?.notetypeid.value || false}
                                                            label={t('str_noteType')}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <CustomAutoComplete
                                                            id={'notecatid'}
                                                            name={'notecatid'}
                                                            value={saleCallData.notecatid.value || null}
                                                            required={saleCallData.notecatid.isRequired}
                                                            error={saleCallData.notecatid.isError}
                                                            endpoint={'notecat/list'}
                                                            variant={'outlined'}
                                                            params={{
                                                                hotelrefno: hotelRefNo || GENERAL_SETTINGS.HOTELREFNO,
                                                                limit: 25,
                                                                field: 'code',
                                                                text: ''
                                                            }}
                                                            onChange={(event, newValue) => {handleOnChange(newValue, 'notecatid', false, false)}}
                                                            onLoad={(initialValue, isSearch, isFinish) => handleOnLoadAutoComplete(initialValue, isSearch, isFinish, 'notecatid')}
                                                            showOptionLabel={'code'}
                                                            searchParam={'code'}
                                                            initialId={isInitialStateLoad && typeof saleCallData?.notecatid.value !== 'object' && saleCallData?.notecatid.value || false}
                                                            label={t('str_category')}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            value={saleCallData.refinfo.value}
                                                            id={'ref-info'}
                                                            name={'ref-info'}
                                                            variant={'outlined'}
                                                            onChange={e => handleOnChange(e.target.value)}
                                                            fullWidth
                                                            multiline
                                                            rows={4}
                                                            rowsMax={4}
                                                            label={t('str_internalNote')}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                </Grid>
                                <Grid item xs={12}>
                                    <Accordion>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography style={{fontWeight: '600'}}>{t('str_reminder')}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <div style={{paddingTop: '16px'}}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={4}>
                                                        <CustomAutoComplete
                                                            id={'dueduserid'}
                                                            name={'dudeuserid'}
                                                            value={saleCallData.dueduserid.value || null}
                                                            endpoint={'employee/worklist'}
                                                            variant={'outlined'}
                                                            params={{
                                                                hotelrefno: hotelRefNo || GENERAL_SETTINGS.HOTELREFNO,
                                                                limit: 25,
                                                                field: 'code',
                                                                text: ''
                                                            }}
                                                            onChange={(event, newValue) => {handleOnChange(newValue, 'dueduserid')}}
                                                            onLoad={(initialValue, isSearch, isFinish) => handleOnLoadAutoComplete(initialValue, isSearch, isFinish, 'dueduserid')}
                                                            showOptionLabel={'code,fullname'}
                                                            searchParam={'code,firstname,lastname,fullname'}
                                                            initialId={isInitialStateLoad && typeof saleCallData.dueduserid.value !== 'object' && saleCallData.dueduserid.value.id || loginfo.id}
                                                            label={t('str_assignTo')}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                                                            <ClickAwayListener onClickAway={() => setOpenReminderPicker(false)}>
                                                                <div>
                                                                    <DatePicker
                                                                        open={openReminderPicker}
                                                                        onClose={() => {setOpenReminderPicker(false)}}
                                                                        minDate={moment().startOf('year')}
                                                                        value={saleCallData.duedate.value || null}
                                                                        label={t("str_dueDate")}
                                                                        onChange={(newDate) => {
                                                                            handleOnChange(newDate, 'duedate', false, true)

                                                                        }}
                                                                        onError={(e) => {
                                                                            const data = {...saleCallData}
                                                                            data.duedate.isError = !!e
                                                                            setSaleCallData(data)
                                                                        }}
                                                                        inputFormat={"DD.MM.YYYY"}
                                                                        mask={"__.__.____"}
                                                                        renderInput={(props) => (
                                                                            <TextField
                                                                                id={'due-date'}
                                                                                name={'due-date'}
                                                                                fullWidth
                                                                                variant={"outlined"}
                                                                                {...props}
                                                                                InputProps={{
                                                                                    ...props.InputProps,
                                                                                    endAdornment: (
                                                                                        <React.Fragment>
                                                                         <span onClick={() => {setOpenReminderPicker(true)}}>
                                                                             {props.InputProps.endAdornment}
                                                                         </span>
                                                                                        </React.Fragment>
                                                                                    ),
                                                                                }}
                                                                                FormHelperTextProps={{
                                                                                    style:  {opacity: props.error ? '1' : '0'}
                                                                                }}
                                                                                helperText={`(${props.inputProps.placeholder})`}
                                                                            />
                                                                        )}
                                                                    />
                                                                </div>
                                                            </ClickAwayListener>
                                                        </LocalizationProvider>
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                                                            <TimePicker
                                                                ampm={false}
                                                                inputFormat="HH:mm"
                                                                mask="__:__"
                                                                value={saleCallData.duetime.value || null}
                                                                onChange={(newTime) => {
                                                                    handleOnChange(newTime, 'duetime', false, true)
                                                                }}
                                                                onError={(e) => {
                                                                    const data = {...saleCallData}
                                                                    data.duetime.isError = !!e
                                                                    setSaleCallData(data)
                                                                }}
                                                                label={t('str_dueTime')}
                                                                renderInput={(props) => (
                                                                    <TextField
                                                                        id={'due-time'}
                                                                        name={'due-time'}
                                                                        variant={'outlined'}
                                                                        {...props}
                                                                        InputProps={{
                                                                            ...props.InputProps,
                                                                            endAdornment: (
                                                                                <React.Fragment>
                                                                                    <span/>
                                                                                </React.Fragment>
                                                                            ),
                                                                        }}
                                                                        FormHelperTextProps={{
                                                                            style:  {opacity: props.error ? '1' : '0'}
                                                                        }}
                                                                        helperText={`(${props.inputProps.placeholder})`}
                                                                    />
                                                                )
                                                                }
                                                            />
                                                        </LocalizationProvider>
                                                    </Grid>
                                                </Grid>
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                </Grid>
                            </Grid>
                        )
                    }
                </DialogContent>
                <DialogActions>
                    <AddDialogActions
                        loading={isSaving}
                        disabled={isSaving}
                        disabledSave={saleCallData.transdate.isError || saleCallData.transtime.isError  || Number(saleCallData.durmin.value) > MAX_MINUTE_VALUE || saleCallData.duedate.isError || saleCallData.duetime.isError || required(saleCallData.salesnote?.value)}
                        toolTipTitle={
                            <div>
                                <Typography style={{fontWeight: '600', fontSize: 'inherit'}}>
                                    {t('str_invalidFields')}
                                </Typography>
                                {
                                    saleCallData.transdate.isError && (
                                        <Typography style={{fontSize: 'inherit'}}>{t('str_date')}</Typography>
                                    )
                                }
                                {
                                    saleCallData.transtime.isError && (
                                        <Typography style={{fontSize: 'inherit'}}>{t('str_time')}</Typography>
                                    )
                                }
                                {
                                    Number(saleCallData.durmin.value) > MAX_MINUTE_VALUE && (
                                        <Typography style={{fontSize: 'inherit'}}>{t('str_minute')}</Typography>
                                    )
                                }
                                {
                                    saleCallData.duedate.isError && (
                                        <Typography style={{fontSize: 'inherit'}}>{t('str_dueDate')}</Typography>
                                    )
                                }
                                {
                                    saleCallData.duetime.isError && (
                                        <Typography style={{fontSize: 'inherit'}}>{t('str_dueTime')}</Typography>
                                    )
                                }
                                {
                                    required(saleCallData.salesnote?.value) && (
                                        <Typography style={{fontSize: 'inherit'}}>{t('str_note')}</Typography>
                                    )
                                }
                            </div>
                        }
                        onCancelClick={() => handleCloseDialog()}
                        onSaveClick={() => handleSave()}
                    />
                </DialogActions>
            </Dialog>
            <Grid container>
                <Grid item xs={12}>
                    <Collapse in={panelStatus === panels.requestList}>
                        <CustomTable
                            isHoverFirstColumn
                            showMoreActionButton
                            showEditIcon
                            loading={isLoading}
                            getColumns={columns}
                            getRows={callList}
                            onRefresh={() => getSaleCallList()}
                            onAdd={() => handleOpenDialog()}
                            onClickDetailIcon={(rowData) => handleOpenDetailPanel(rowData)}
                            onClickEditIcon={(rowData) => handleGetSaleCall(rowData?.gid)}
                            onDoubleClickRow={(rowData) => handleGetSaleCall(rowData?.gid)}
                            moreActionList={[
                                {
                                    icon: <EditOutlinedIcon />,
                                    title: t('str_edit'),
                                    onClick: (popupState, rowData) => {
                                        popupState.close();
                                        handleGetSaleCall(rowData?.gid)
                                    },
                                },
                            ]}
                            options={{
                                selection: true
                            }}
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
                    </Collapse>
                    <Collapse in={panelStatus === panels.requestDetail}>
                        {selectedSaleCallInfo && <RequestDetail taskmid={selectedSaleCallInfo?.mid} taskHotelRefNo={selectedSaleCallInfo?.hotelrefno} tableName={OREST_ENDPOINT.COMM} gid={selectedSaleCallInfo?.gid}/>}
                    </Collapse>
                </Grid>
            </Grid>
            <TrackedChangesDialog
                open={openTrackedDialog}
                onPressNo={(e) => setOpenTrackedDialog(e)}
                onPressYes={(e) => {
                    setOpenAddDialog(e);
                    setOpenTrackedDialog(e)
                    setTimeout(() => {
                        handleReset()
                    }, 100)
                }}
            />
        </div>
    );
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(null, mapDispatchToProps)(SaleCalls);