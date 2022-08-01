import React, {useContext, useEffect, useState} from "react";
import LoadingSpinner from "../../../../LoadingSpinner";
import {Button, FormControlLabel, Grid, Radio, RadioGroup, TextField} from "@material-ui/core";
import CustomAutoComplete from "../../../../CustomAutoComplete/CustomAutoComplete";
import {CustomToolTip} from "../../../../user-portal/components/CustomToolTip/CustomToolTip";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import FormatListBulletedIcon from "@material-ui/icons/FormatListBulleted";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import {setToState} from "../../../../../state/actions";
import {connect, useSelector} from "react-redux";
import {required} from "../../../../../state/utils/form";
import WebCmsGlobal from "../../../../webcms-global";
import useTranslation from "../../../../../lib/translations/hooks/useTranslation";
import Dialog from "@material-ui/core/Dialog";
import Typography from "@material-ui/core/Typography";
import {makeStyles} from "@material-ui/core/styles";
import {Insert, List, ViewList} from "@webcms/orest";
import {isErrorMsg, OREST_ENDPOINT} from "../../../../../model/orest/constants";
import DataFormDialog from "../../../../DataFormDialog";
import {useSnackbar} from "notistack";
import TrackedChangesDialog from "../../../../TrackedChangesDialog";

const useStyles = makeStyles((theme) => ({
    saveRequestWrapper: {
        position: 'relative',
    },
    saveRequestButton: {
        minWidth: 105,
    },
    saveRequestProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
    dialogKiosk: {
        marginTop: -285
    },
    container: {
        border: "1px solid #B2CECF",
        padding: "8px",
        textAlign: "center",
        height: "60vh",
        maxHeight: "60vh",
        overflow: "auto"
    },
    formControlLabelStyle: {
        whiteSpace: "nowrap",
        "& .MuiFormControlLabel-label": {
            fontSize: "13px"
        }
    },
    overflowContainer: {
        maxWidth: '255px',
        minWidth: '255px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    fieldSetStyle: {
        border: `1px solid rgba(0, 0, 0, 0.23)`,
        padding: '8px 14px',
        borderRadius: '4px'
    },
    legendStyle: {
        padding: '0 4px',
        marginLeft: '4px',
        marginBottom: '0',
        fontSize: '14px',
        width: 'unset'
    }
}))

function AgencyRequest(props){
    const { state, setToState, isDefLoading, isInitialStateLoad } = props
    const { enqueueSnackbar } = useSnackbar()

    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { t } = useTranslation()

    const classes = useStyles()

    const token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
    const clientBase = useSelector((state) => state?.orest?.state?.client || false)
    const reservBase = useSelector((state) => state?.formReducer?.guest?.clientReservation || false)
    const changeHotelRefno = useSelector((state) => state?.formReducer?.guest?.changeHotelRefno || false)
    const hotelRefNo =  reservBase?.hotelrefno || changeHotelRefno || GENERAL_SETTINGS.HOTELREFNO
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)

    const agencyInitialState = {
        code: {value: null, isRequired: true, isError: false, helperText: false},
        country: {value: '', isRequired: true, isError: false, helperText: false},
        city: {value: '', isRequired: true, isError: false, helperText: false},
    }

    const [agencyData, setAgencyData] = useState(agencyInitialState)
    const [agencyDataBase, setAgencyDataBase] = useState(agencyInitialState)
    const [openAgencyAdd, setOpenAgencyAdd] = useState(false)
    const [isDefLoadingAgency, setIsDefLoadingAgency] = useState(false)
    const [openTsDescDialog, setOpenTsDescDialog] = useState(false);
    const [tsCategoryList, setTsCategoryList] = useState([]);
    const [selectedTsCategory, setSelectedTsCategory] = useState(null);
    const [requestIsLoading, setRequestIsLoading] = useState(false)
    const [openTrackedDialog, setOpenTrackedDialog] = useState(false);

    const [tsTypeList, setTsTypeList] = useState([]);
    const [isTsTypeLoading, setIsTsTypeLoading] = useState(false);
    const [selectedTsType, setSelectedTsType] = useState(null);

    const [isSavingAgency, setIsSavingAgency] = useState(false)
    const [isAlreadyTakenCode, setIsAlreadyTakenCode] = useState(false)
    const [openTrackedAgencyDialog, setOpenTrackedAgencyDialog] = useState(false);

    const [tsDescList, setTsDescList] = useState([]);
    const [isTsDescLoading, setIsTsDescLoading] = useState(false);
    const [isTsDescLoadingFromMain, setIsTsDescLoadingFromMain] = useState(false);
    const [selectedTsDesc, setSelectedTsDesc] = useState(null);
    const [confirmedValue, setConfirmedValue] = useState(null);

    useEffect(() => {
        if(state.requestData.transtype.value && typeof state.requestData.transtype.value === 'object') {
            getTsCat("get");
            setIsTsDescLoadingFromMain(true);
        }
    }, [state.requestData.transtype.value])

    useEffect(() => {
        if(agencyData.code?.value?.length > 0) {
            const timer = setTimeout(() => {
                List({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.AGENCY,
                    token,
                    params: {
                        query: `code::${agencyData.code.value?.toUpperCase()}`,
                        hotelrefno: hotelRefNo || GENERAL_SETTINGS.HOTELREFNO,
                    }
                }).then(res => {
                    if(res.status === 200) {
                        const data = {...agencyData}
                        data.code = {
                            ...data['code'],
                            helperText: res.data.count > 0 ?  t('str_thereIsAlreadyExistUniqueValue') + agencyData.code.value : false,
                            isError: res.data.count > 0
                        }
                        setIsAlreadyTakenCode(res.data.count > 0)
                        setAgencyData(data)
                    }
                })
            }, 1000)
            return () => clearTimeout(timer);
        } else {
            setIsAlreadyTakenCode(false)
        }
    }, [agencyData.code.value])

    const getTsCat = (type, catId) => {
        if(type === "get") {
            List({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: "tscategory",
                token: token,
                params: {
                    query: "isactive:true",
                    hotelrefno: hotelRefNo,
                    field: "transtype",
                    text: `${typeof state.requestData.transtype?.value === 'object' ? state.requestData.transtype.value?.code : state.requestData.transtype.value},null`
                }
            }).then(res => {
                if(res.status === 200) {
                    if(res.data.count > 0) {
                        setSelectedTsCategory(res.data.data[0].id)
                        setTsCategoryList(res.data.data);
                        getTsType("get", res.data.data[0].id)
                    } else {
                        setSelectedTsCategory(null);
                    }

                }

            })
        } else if(type === "select") {
            getTsType("get" ,catId)
        }
    }

    const getTsType = (type, catId, tsTypeId) => {
        if(type === "get") {
            setIsTsTypeLoading(true);
            List({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.TSTYPE,
                token: token,
                params: {
                    query: `isactive:true,catid:${catId}`,
                    hotelrefno: hotelRefNo,
                }
            }).then(r1 => {
                if(r1.status === 200) {
                    setIsTsTypeLoading(false);
                    if(r1.data.count > 0) {
                        setSelectedTsType(r1.data.data[0].id)
                        setTsTypeList(r1.data.data)
                        getTsDesc(catId, r1.data.data[0].id)
                    } else {
                        setSelectedTsType(null);
                        setSelectedTsDesc(null);
                        setTsDescList([]);
                        setTsTypeList([]);
                        setIsTsDescLoading(false);
                    }
                } else {
                    setIsTsTypeLoading(false);
                }
            })
        } else if(type === "select") {
            setIsTsDescLoading(true);
            setTsDescList([]);
            getTsDesc(catId, tsTypeId);
        }
    }

    const getTsDesc = (catId, tsTypeId) => {
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.TSDESC,
            token: token,
            params: {
                hotelrefno: hotelRefNo,
                query: `isactive:true,tscatid${catId},tstypeid:${tsTypeId},transtype:${typeof state.requestData.transtype?.value === 'object' ? state.requestData.transtype.value?.code : state.requestData.transtype.value}`
            }
        }).then(r2 => {
            if(r2.status === 200) {
                setIsTsDescLoading(false);
                if(r2.data.count > 0) {
                    setTsDescList(r2.data.data);
                    setSelectedTsDesc(r2.data.data[0].id);
                } else {
                    setTsDescList([]);
                    setSelectedTsDesc(null);
                }

            } else {
                setIsTsDescLoading(false);
            }
        })
    }

    const handleOnChange = (event, key, isOnBlur, isAgency) => {
        const name = key ? key : event.target.name
        const value = event?.target ? event.target.value : event
        const data = {...state.requestData}


        if(isAgency) {
            setAgencyData(isOnBlur ? {
                ...agencyData,
                [name]: {
                    ...agencyData[name],
                    isError: name === 'code' ? isAlreadyTakenCode ? true : agencyData[name]?.isRequired && !!required(value) : agencyData[name]?.isRequired && !!required(value),
                    helperText: name === 'code' ? isAlreadyTakenCode ? t('str_thereIsAlreadyExistUniqueValue') + agencyData.code.value : agencyData[name]?.isRequired && !!required(value) && t('str_mandatory') : agencyData[name]?.isRequired && !!required(value) && t('str_mandatory'),
                }
            } : {
                ...agencyData,
                [name]: {
                    ...agencyData[name],
                    value: name === 'code' ? value.toUpperCase() : value,
                    isError: agencyData[name]?.isRequired && !!required(value),
                    helperText: agencyData[name]?.isRequired && !!required(value) && t('str_mandatory'),
                }
            })
        } else {
            if(name === 'transtype') {
                data['tsdescid'] = {
                    ...data['tsdescid'],
                    value: null,
                    isError: state.requestData[name]?.isRequired && !!required(value),
                    helperText: state.requestData[name]?.isRequired && !!required(value) && t('str_mandatory'),
                }
            }
            data[name] = isOnBlur ? {
                ...data[name],
                isError: state.requestData[name]?.isRequired && !!required(value),
                helperText: state.requestData[name]?.isRequired && !!required(value) && t('str_mandatory'),
            } : {
                ...data[name],
                value: value,
                isError: state.requestData[name]?.isRequired && !!required(value),
                helperText: state.requestData[name]?.isRequired && !!required(value) && t('str_mandatory'),
            }

        }
        setToState('guest', ['myRequest', 'requestData'], data)

    }

    const handleOnLoadAutoComplete = (initialValue, isSearch, isFinish, name, isAgency) => {
        if(isAgency) {
            const data = {...agencyData}
            data[name].value = initialValue
            setAgencyData(data)
        } else {
            const data = {...state.requestData}
            data[name].value = initialValue
            setToState('guest', ['myRequest', 'requestData'], data)
            setToState('guest', ['myRequest', 'requestDataBase'], data)
        }
    }

    const handleSaveAgency = () => {
        const data = {...agencyData}
        setIsSavingAgency(true)

        Object.keys(agencyInitialState).map((key) => {
            if(data[key].value) {
                data[key] = typeof data[key].value === 'object' ?  data[key].value?.descineng || data[key].value?.description : data[key].value
            } else {
                data[key] = null
            }
        })
        data.description = agencyData.code.value


        Insert({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.AGENCY,
            token,
            params: {
                hotelrefno: hotelRefNo || GENERAL_SETTINGS.HOTELREFNO
            },
            data: data
        }).then(res => {
            setIsSavingAgency(false)
            if(res.status === 200 && res.data.data) {
                setAgencyData(agencyInitialState)
                setToState(
                    'guest',
                    ['myRequest', 'requestData'],
                    {
                        ...state.requestData,
                        accid: {
                            ...state.requestData['accid'],
                            value: res.data.data
                        }
                    }
                )
                setOpenAgencyAdd(false)
                setTimeout(() => {
                    handleResetAgencyData()
                }, 100)
                enqueueSnackbar(t('str_processCompletedSuccessfully'), { variant: 'success' })
            } else {
                const error = isErrorMsg(res)
                enqueueSnackbar(error.errMsg, { variant: 'error' })
            }
        })
    }

    const handleResetAgencyData = () => {
        setAgencyData(agencyInitialState)
        setAgencyDataBase(agencyInitialState)
    }

    const AgencyDialogContent = () => {

        return(
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField
                        id={'code'}
                        name={'code'}
                        value={agencyData.code?.value || ''}
                        required={agencyData.code.isRequired}
                        error={agencyData.code.isError}
                        helperText={agencyData.code.helperText}
                        onKeyUp={(e) => handleOnChange(e, false, false, true)}
                        onKeyDown={(e) => handleOnChange(e, false, false, true)}
                        onChange={(e) => handleOnChange(e, false, false, true)}
                        onBlur={(e) => handleOnChange(e, false, true, true)}
                        disabled={isSavingAgency}
                        fullWidth
                        variant="outlined"
                        inputProps={{
                            autoComplete: 'off',
                        }}
                        label={t('str_code')}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <CustomAutoComplete
                        id={'country'}
                        name={'country'}
                        value={agencyData.country.value || null}
                        required={agencyData.country.isRequired}
                        error={agencyData.country.isError}
                        disabled={isSavingAgency}
                        endpoint={'country/view/list'}
                        variant={'outlined'}
                        params={{hotelrefno: hotelRefNo || GENERAL_SETTINGS.HOTELREFNO, limit: 25, field: 'code', text: ''}}
                        onChange={(event, newValue) => {handleOnChange(newValue, 'country', false, true)}}
                        onBlur={(event) => {handleOnChange(event, 'country', true, true)}}
                        onLoad={(initialValue, isSearch, isFinish) => handleOnLoadAutoComplete(initialValue, isSearch, isFinish, 'country', true)}
                        showOptionLabel={'descineng'}
                        showOption={'descineng'}
                        searchParam={'code,description'}
                        searchInitialParam={'descineng'}
                        initialId={openAgencyAdd && typeof agencyData.country.value !== 'object' && loginfo?.country}
                        label={t('str_country')}
                        helperText={agencyData.country.helperText}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <CustomAutoComplete
                        id={'city'}
                        name={'city'}
                        value={agencyData.city.value || null}
                        required={agencyData.city.isRequired}
                        error={agencyData.city.isError}
                        disabled={isSavingAgency}
                        endpoint={'city/view/list'}
                        variant={'outlined'}
                        params={typeof agencyData.country.value === 'object' ? {
                            query:`country:${agencyData.country.value?.descineng || agencyData.country.value?.description}`,
                            hotelrefno: hotelRefNo || GENERAL_SETTINGS.HOTELREFNO,
                            limit: 25,
                            field: 'code',
                            text: ''
                        } : {
                            hotelrefno: hotelRefNo || GENERAL_SETTINGS.HOTELREFNO,
                            limit: 25,
                            field: 'code',
                            text: ''
                        }}
                        onChange={(event, newValue) => {handleOnChange(newValue, 'city', false, true)}}
                        onInputChange={(event) => {handleOnChange(event, 'city', false, true)}}
                        onBlur={(event) => {handleOnChange(event, 'city', true, true)}}
                        onLoad={(initialValue, isSearch, isFinish) => handleOnLoadAutoComplete(initialValue, isSearch, isFinish, 'city', true)}
                        showOptionLabel={'description'}
                        showOption={'description'}
                        searchParam={'code,description'}
                        triggerValue={agencyData.country.value && typeof agencyData.country.value === 'object' ? agencyData.country.value?.descineng : false}
                        label={t('str_city')}
                        helperText={agencyData.city.helperText}
                        fullWidth
                        freeSolo
                    />
                </Grid>
            </Grid>
        )
    }


    return(
        <React.Fragment>
            {
                isDefLoading ? (
                    <LoadingSpinner size={72}/>
                ) : (
                    <React.Fragment>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <div style={{display: 'flex', width: '100%'}}>
                                    <CustomAutoComplete
                                        id={'accid'}
                                        name={'accid'}
                                        disabled={state.isSaving}
                                        value={state.requestData.accid.value || null}
                                        required={state.requestData.accid.isRequired}
                                        error={state.requestData.accid.isError}
                                        endpoint={'agency/view/list'}
                                        variant={'outlined'}
                                        params={{hotelrefno: hotelRefNo || GENERAL_SETTINGS.HOTELREFNO, limit: 25, field: 'code', text: ''}}
                                        onChange={(event, newValue) => {handleOnChange(newValue, 'accid')}}
                                        onLoad={(initialValue, isSearch, isFinish) => handleOnLoadAutoComplete(initialValue, isSearch, isFinish, 'accid')}
                                        showOptionLabel={'description'}
                                        searchParam={'description'}
                                        initialId={reservBase?.agencyid || false}
                                        label={t('str_company')}
                                        helperText={state.requestData.accid.helperText}
                                        fullWidth
                                    />
                                    <CustomToolTip title={t('str_add')}>
                                        <IconButton style={{marginLeft: 'auto'}} onClick={() => setOpenAgencyAdd(true)}>
                                            <AddIcon />
                                        </IconButton>
                                    </CustomToolTip>
                                </div>
                            </Grid>
                            <Grid item xs={12}>
                                <CustomAutoComplete
                                    id={'transtype'}
                                    name={'transtype'}
                                    value={state.requestData.transtype?.value || null}
                                    required={state.requestData.transtype.isRequired}
                                    error={state.requestData.transtype.isError}
                                    helperText={state.requestData.transtype.helperText}
                                    label={t('str_requestType')}
                                    disabled={state.isSaving}
                                    onLoad={(initialValue) => {
                                        const data = {...state.requestData}
                                        data.transtype.value = initialValue
                                        setToState('guest', ['myRequest', 'requestData'], data)
                                    }}
                                    onChange={(event, newValue) => {
                                        handleOnChange(newValue, 'transtype')

                                    }}
                                    onBlur={(event) => {handleOnChange(event, 'transtype', true)}}
                                    endpoint={'transtype/view/tstranstype'}
                                    params={{
                                        query: `isactive:true`,
                                        text: '',
                                        limit: 25,
                                        field: 'code',
                                        hotelrefno: hotelRefNo
                                    }}
                                    showOptionLabel={'description'}
                                    showOption={'description'}
                                    searchInitialParam={'code'}
                                    initialId={isInitialStateLoad && typeof state.requestData.transtype?.value !== 'object' ? state.requestData.transtype?.value : false}
                                    fullWidth
                                    useDefaultFilter
                                    variant={'outlined'}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <div style={{display: 'flex', width: '100%', alignItems: 'center'}}>
                                    <CustomAutoComplete
                                        id={'tsdescid'}
                                        name={'tsdescid'}
                                        value={state.requestData.tsdescid?.value || null}
                                        required={state.requestData.tsdescid.isRequired}
                                        error={state.requestData.tsdescid.isError}
                                        helperText={state.requestData.tsdescid.helperText}
                                        label={t('str_request')}
                                        disabled={state.isSaving}
                                        onLoad={(initialValue) => {
                                            const data = {...state.requestData}
                                            data.tsdescid.value = initialValue
                                            setToState('guest', ['myRequest', 'requestData'], data)
                                        }}
                                        onChange={(event, newValue) => {handleOnChange(newValue, 'tsdescid')}}
                                        onBlur={(event) => {handleOnChange(event, 'tsdescid', true)}}
                                        endpoint={'tsdesc/view/list'}
                                        params={
                                            state.requestData.transtype.value && typeof state.requestData.transtype.value === 'object' && isInitialStateLoad ? {
                                                query:`isactive:true,transtype:${state.requestData.transtype.value?.code}`,
                                                limit: 25,
                                                hotelrefno: hotelRefNo
                                            } : false
                                        }
                                        triggerValue={isInitialStateLoad && state.requestData.transtype.value?.code || false}
                                        showOptionLabel={'description'}
                                        showOption={'description'}
                                        searchParam={'code,description'}
                                        initialId={isInitialStateLoad && typeof state.requestData.tsdescid?.value !== 'object' ? state.requestData.tsdescid?.value : false}
                                        fullWidth
                                        variant={'outlined'}
                                    />
                                    <CustomToolTip title={t("str_selectTaskDescription")}>
                                        <IconButton
                                            style={{marginLeft: 'auto'}}
                                            disabled={state.isSaving}
                                            onClick={() => setOpenTsDescDialog(true)}
                                        >
                                            <FormatListBulletedIcon/>
                                        </IconButton>
                                    </CustomToolTip>
                                </div>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    id={'note'}
                                    name={'note'}
                                    value={state.requestData.note?.value || ''}
                                    onKeyUp={(e) => handleOnChange(e)}
                                    onKeyDown={(e) => handleOnChange(e)}
                                    onChange={(e) => handleOnChange(e)}
                                    disabled={state.isSaving}
                                    fullWidth
                                    variant="outlined"
                                    label={t('str_explanation')}
                                    multiline
                                    rows={4}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button startIcon={<CloudUploadIcon />} disabled={!state.requestData.tsdescid.value || state.isSaving}>{t('str_upload')}</Button>
                            </Grid>
                        </Grid>
                    </React.Fragment>
                )
            }
            <Dialog
                open={openTsDescDialog}
                fullWidth
                maxWidth={"md"}
                onClose={() => setOpenTsDescDialog(false)}
            >
                <div style={{padding: "24px"}}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography style={{fontSize: "24px"}}>
                                {t("str_tsDesc")}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <div className={classes.container}>
                                <div style={{display: "table", margin: "auto"}}>
                                    <RadioGroup
                                        value={selectedTsCategory ? selectedTsCategory.toString() : ""}
                                        name={"tsCategory"}
                                        onChange={(e) => {
                                            getTsCat("select", e.target.value)
                                            setSelectedTsCategory(e.target.value);
                                        }}>
                                        {
                                            tsCategoryList.length > 0 ? (
                                                tsCategoryList.map((item, i) => (
                                                    <FormControlLabel className={classes.formControlLabelStyle} id={`radio-${i}`} name={`radio-${i}`} value={String(item.id)} control={<Radio color={"primary"} />} label={item.code} />
                                                ))
                                            ) : (
                                                <Typography>{t("str_noRecordsToDisplay")}</Typography>
                                            )
                                        }
                                    </RadioGroup>
                                </div>
                            </div>

                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <div className={classes.container}>
                                <div style={{display: "table", margin: "auto"}}>
                                    {
                                        isTsTypeLoading ? (
                                            <LoadingSpinner size={50} />
                                        ) : (
                                            <RadioGroup
                                                value={selectedTsType ? selectedTsType.toString() : ""}
                                                name={"tsType"}
                                                onChange={(e) => {
                                                    getTsType("select", selectedTsCategory, e.target.value)
                                                    setSelectedTsType(e.target.value);
                                                }}>
                                                {
                                                    tsTypeList.length > 0 ? (
                                                        tsTypeList.map((item, i) => (
                                                            <FormControlLabel className={classes.formControlLabelStyle} id={`radio-${i}`} name={`radio-${i}`} value={String(item.id)} control={<Radio color={"primary"} />} label={item.code} />
                                                        ))
                                                    ) : (
                                                        <Typography>{t("str_noRecordsToDisplay")}</Typography>
                                                    )
                                                }
                                            </RadioGroup>
                                        )
                                    }
                                </div>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <div className={classes.container}>
                                <div style={{display: "table", margin: "auto"}}>
                                    {
                                        selectedTsType && !isTsTypeLoading && (
                                            isTsDescLoading ? (
                                                <LoadingSpinner size={30} />
                                            ) : (
                                                <RadioGroup
                                                    value={selectedTsDesc  ? selectedTsDesc.toString() : ""}
                                                    name={"tsDesc"}
                                                    onChange={(e) => {
                                                        setSelectedTsDesc(e.target.value);
                                                    }}>
                                                    {
                                                        tsDescList.length > 0 ? (
                                                            tsDescList.map((item, i) => (
                                                                <FormControlLabel className={classes.formControlLabelStyle} id={`radio-${i}`} name={`radio-${i}`} value={String(item.id)} control={<Radio color={"primary"}/>} label={item.code} />
                                                            ))
                                                        ) : (
                                                            <Typography>{t("str_noRecordsToDisplay")}</Typography>
                                                        )
                                                    }
                                                </RadioGroup>
                                            )
                                        )
                                    }
                                </div>
                            </div>
                        </Grid>
                        <Grid item xs={12} style={{textAlign: "right"}}>
                            <Button onClick={() => setOpenTsDescDialog(false)} color="primary" disabled={requestIsLoading}>
                                {t('str_cancel')}
                            </Button>
                            <Button
                                onClick={() => {
                                    const data = {...state.requestData}
                                    const tsCat = tsCategoryList.find(e => e.id === selectedTsCategory)
                                    const tsDesc = tsDescList.find(e => e.id === selectedTsDesc)
                                    const tsType = tsTypeList.find(e => e.id === selectedTsType)
                                    setOpenTsDescDialog(false);
                                    setConfirmedValue(tsDesc && tsDesc)
                                    data.tsdescid.value = tsDesc || null
                                    data.tstypeid.value = tsType || null
                                    data.tscatid.value = tsCat || null
                                    setToState('guest', ['myRequest', 'requestData'], data)
                                    setToState('guest', ['myRequest', 'tsDescFromDialog'], tsDesc)
                                }}
                                color="primary"
                                variant={"contained"}
                                disabled={requestIsLoading || !requestIsLoading && !selectedTsDesc}
                                className={classes.saveRequestButton}
                            >
                                {t('str_save')}
                                {requestIsLoading && (
                                    <LoadingSpinner size={24} className={classes.saveRequestProgress} />
                                )}
                            </Button>
                        </Grid>
                    </Grid>
                </div>
            </Dialog>
            <DataFormDialog
                fullWidth
                maxWidth={'sm'}
                title={t('str_addCompany')}
                open={openAgencyAdd}
                loadingDialog={isDefLoadingAgency}
                loadingAction={isSavingAgency}
                disabledActions={isSavingAgency}
                disabledSave={isSavingAgency || (required(agencyData.code.value) || agencyData.code.isError) || (required(agencyData.country.value) || agencyData.country.isError) || (required(agencyData.city.value) || agencyData.city.isError)}
                toolTipTitle={
                    <div>
                        <Typography
                            style={{
                                fontWeight: '600',
                                fontSize: 'inherit'
                            }}
                        >
                            {t('str_invalidFields')}
                        </Typography>
                        {
                            (required(agencyData.code.value) || agencyData.code.isError) && (
                                <Typography style={{fontSize: 'inherit'}}>{t('str_code')}</Typography>
                            )
                        }
                        {
                            (required(agencyData.country.value) || agencyData.country.isError) && (
                                <Typography style={{fontSize: 'inherit'}}>{t('str_country')}</Typography>
                            )
                        }
                        {
                            (required(agencyData.city.value) || agencyData.city.isError) && (
                                <Typography style={{fontSize: 'inherit'}}>{t('str_city')}</Typography>
                            )
                        }
                    </div>
                }
                render={AgencyDialogContent()}
                onCancelClick={() => {
                    const data = JSON.stringify(agencyData)
                    const baseData = JSON.stringify(agencyDataBase)
                    if(data !== baseData) {
                        setOpenTrackedDialog(true)
                    } else {
                        setOpenAgencyAdd(false)
                        handleResetAgencyData()
                    }
                }}
                onSaveClick={() => handleSaveAgency()}
            />
            <TrackedChangesDialog
                open={openTrackedDialog}
                onPressNo={(e) => {
                    setOpenTrackedDialog(e);
                }}
                onPressYes={(e) => {
                    setOpenTrackedDialog(e);
                    setTimeout(() => {
                        handleResetAgencyData()
                    }, 100)
                }}
            />
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest.myRequest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(AgencyRequest)

