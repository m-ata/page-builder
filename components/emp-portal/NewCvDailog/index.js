import React, {useContext, useEffect, useState} from 'react'
import {setToState, updateState} from '../../../state/actions'
import {connect, useSelector} from 'react-redux'
import {
    AppBar,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    Grid,
    IconButton,
    StepConnector,
    Toolbar,
    Typography
} from '@material-ui/core'
import {makeStyles} from '@material-ui/core/styles'
import useTranslation from '../../../lib/translations/hooks/useTranslation'
import ProfileStep from '../NewCvStepper/steps/ProfileStep'
import {Insert, Patch, UseOrest} from '@webcms/orest'
import WebCmsGlobal from '../../webcms-global'
import {isErrorMsg, OREST_ENDPOINT, REQUEST_METHOD_CONST} from '../../../model/orest/constants'
import LoadingSpinner from '../../LoadingSpinner'
import {useSnackbar} from "notistack";
import renderFormElements, {ELEMENT_TYPES} from "../../render-form-elements";
import {required} from "../../../state/utils/form";
import moment from "moment";
import AddDialogActions from "../../AddDialogActions";
import {helper} from "../../../@webcms-globals";

const useStyles = makeStyles((theme) => ({
    title: {
        fontSize: '28px',
        fontWeight: 'bold'
    },
    cardContentRoot: {
        padding: '24px 32px'
    },
    dialogContentRoot: {
        padding: 0
    }
}));

const VARIANT = 'outlined'

function NewCvDialog(props) {
    const classes = useStyles();
    const {t} = useTranslation()

    const {state, setToState, refreshList, updateState} = props

    const {enqueueSnackbar} = useSnackbar();

    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal)

    const token = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false)
    const loginfo = useSelector((state) => state?.orest?.currentUser?.loginfo || false);
    const hotelRefNo = useSelector(state => state?.hotelinfo?.currentHotelRefNo || GENERAL_SETTINGS.HOTELREFNO || null);

    const initialState = {
        maritalstatus: {value: '', isError: false, isRequired: false, helperText: false},
        militarystatus: {value: '', isError: false, isRequired: false, helperText: false},
        healthinfo: {value: '', isError: false, isRequired: false, helperText: false},
        hobby: {value: '', isError: false, isRequired: false, helperText: false},
        note: {value: '', isError: false, isRequired: false, helperText: false},
        description: {value: '', isError: false, isRequired: false, helperText: false},
    }
    const [openTrackedDialog, setOpenTrackedDialog] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isInitialStateLoad, setIsInitialStateLoad] = useState(false)
    const [empCvData, setEmpCvData] = useState(initialState)
    const [empCvDataBase, setEmpCvDataBase] = useState(empCvData)


    const carList = [
        {
            title: t('Application Information'),
            formElements: [
                {
                    type: ELEMENT_TYPES.textField,
                    id: 'description',
                    name: 'description',
                    value: empCvData.description?.value,
                    error: empCvData.description?.isError,
                    required: empCvData.description?.isRequired,
                    disabled: isSaving,
                    label: t('str_introduction'),
                    helperText: empCvData.description?.helperText,
                    onChange: (e) => handleOnChangeFormElements(e),
                    onBlur: (e) => handleOnBlurFormElements(e),
                    variant: VARIANT,
                    multiLine: true,
                    rows: 4,
                    rowsMax: 4,
                    fullWidth: true,
                    gridProps: {xs: 12}
                },
                {
                    type: ELEMENT_TYPES.autoComplete,
                    id: 'maritalstatus',
                    name: 'maritalstatus',
                    value: empCvData.maritalstatus?.value,
                    required: empCvData.maritalstatus.isRequired,
                    disabled: isSaving,
                    error: empCvData.maritalstatus.isError,
                    label: t('str_maritalStatus'),
                    helperText: empCvData.maritalstatus.helperText,
                    onChange: (newValue, name) => handleOnChangeFormElements(newValue, name),
                    onBlur: (e, name) => handleOnBlurFormElements(e, name),
                    onLoad: (initialValue, name) => {
                        const data = {...empCvData}
                        data[name].value = initialValue ? initialValue : null
                        setEmpCvData(data)
                    },
                    endpoint: 'transtype/view/maritalstatus',
                    params: {field: 'code', text: '', limit: 25},
                    initialId: isInitialStateLoad && typeof empCvData.maritalstatus.value !== 'object' && empCvData.maritalstatus?.value || false,
                    searchInitialParam: 'code',
                    showOptionLabel: 'description',
                    showOption: 'description',
                    searchParam: 'code,description',
                    fullWidth: true,
                    variant: VARIANT,
                    gridProps: {xs: 12, sm: 6}
                },
                {
                    type: ELEMENT_TYPES.autoComplete,
                    id: 'militarystatus',
                    name: 'militarystatus',
                    value: empCvData.militarystatus?.value,
                    required: empCvData.militarystatus.isRequired,
                    disabled: isSaving,
                    error: empCvData.militarystatus.isError,
                    label: t('str_militaryStatus'),
                    helperText: empCvData.militarystatus.helperText,
                    onChange: (newValue, name) => handleOnChangeFormElements(newValue, name),
                    onBlur: (e, name) => handleOnBlurFormElements(e, name),
                    onLoad: (initialValue, name) => {
                        const data = {...empCvData}
                        data[name].value = initialValue ? initialValue : null
                        setEmpCvData(data)
                    },
                    endpoint: 'transtype/milstatus',
                    params: {field: 'code', text: '', limit: 25},
                    initialId: isInitialStateLoad && typeof empCvData.militarystatus.value !== 'object' ? empCvData.militarystatus.value : false,
                    defValKey: 'code',
                    showOptionLabel: 'description',
                    showOption: 'description',
                    searchParam: 'code,description',
                    fullWidth: true,
                    variant: VARIANT,
                    gridProps: {xs: 12, sm: 6}
                },
                {
                    type: ELEMENT_TYPES.textField,
                    id: 'healthinfo',
                    name: 'healthinfo',
                    value: empCvData.healthinfo?.value,
                    error: empCvData.healthinfo?.isError,
                    required: empCvData.healthinfo?.isRequired,
                    disabled: isSaving,
                    label: t('str_healthNote'),
                    helperText: empCvData.healthinfo?.helperText,
                    onChange: (e) => handleOnChangeFormElements(e),
                    onBlur: (e) => handleOnBlurFormElements(e),
                    variant: VARIANT,
                    multiLine: true,
                    rows: 4,
                    rowsMax: 4,
                    fullWidth: true,
                    gridProps: {xs: 12}
                },
                {
                    type: ELEMENT_TYPES.textField,
                    id: 'hobby',
                    name: 'hobby',
                    value: empCvData.hobby?.value,
                    error: empCvData.hobby?.isError,
                    required: empCvData.hobby?.isRequired,
                    disabled: isSaving,
                    label: t('str_hobbies'),
                    helperText: empCvData.hobby?.helperText,
                    onChange: (e) => handleOnChangeFormElements(e),
                    onBlur: (e) => handleOnBlurFormElements(e),
                    variant: VARIANT,
                    multiLine: true,
                    rows: 4,
                    rowsMax: 4,
                    fullWidth: true,
                    gridProps: {xs: 12}
                },
            ]
        }
    ]


    useEffect(() => {
        let isEffect = true
        if (isEffect && empCvData && state.empCv) {
            const newClientInitialState = helper.objectMapper(empCvData, state.empCv, ['maritalstatus'])
            setEmpCvData(newClientInitialState)
            setEmpCvDataBase(newClientInitialState)
            setIsInitialStateLoad(true)
        }

        return () => {
            isEffect = false
        }

    }, [state.empCv])

    const handleSave = () => {
        const data = {...empCvData}
        Object.keys(empCvData).map((key) => {
            if (key === 'maritalstatus' || key === 'militarystatus') {
                data[key] = typeof data[key].value === 'object' ? data[key].value?.code : data[key].value
            } else {
                data[key] = typeof data[key].value === 'object' ? data[key].value?.id : data[key].value
            }
        })
        setIsSaving(true)
        if (state.empCv && state.empCv?.gid) {
            Patch({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: 'empcv',
                gid: state.empCv.gid,
                data: data,
                token
            }).then(res => {
                if (res.status === 200) {
                    getCvData(state.empCv.gid)
                } else {
                    const error = isErrorMsg(res)
                    enqueueSnackbar(error.errorMsg, {variant: 'error'})
                    setIsSaving(false)
                }

            })
        } else {
            data.hotelrefno = hotelRefNo
            data.empid = loginfo?.id
            Insert({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: 'empcv',
                data: data,
                token
            }).then(res => {
                if (res.status === 200) {
                    const gid = res?.data?.data?.gid || false
                    if (gid) {
                        getCvData(gid)
                    }
                } else {
                    const error = isErrorMsg(res)
                    enqueueSnackbar(error.errorMsg, {variant: 'error'})
                    setIsSaving(false)
                }

            })
        }
    }

    const handleOnChangeFormElements = (event, key, isOnBlur) => {
        const name = key ? key : event.target.name
        const value = event?.target ? event.target.value : event

        if (isOnBlur) {
            setEmpCvData({
                ...empCvData,
                [name]: {
                    ...empCvData[name],
                    isError: empCvData[name]?.isRequired && !!required(value),
                    helperText: empCvData[name]?.isRequired && !!required(value) && t('str_mandatory'),
                }
            })
        } else {
            setEmpCvData({
                ...empCvData,
                [name]: {
                    ...empCvData[name],
                    value: value,
                    isError: empCvData[name]?.isRequired && !!required(value),
                    helperText: empCvData[name]?.isRequired && !!required(value) && t('str_mandatory'),
                }
            })
        }
    }

    const handleOnBlurFormElements = (event, key) => {
        handleOnChangeFormElements(event, key, true)
    }

    const handleChangeDatePicker = (newDate, name) => {
        setEmpCvData({
            ...empCvData,
            [name]: {
                ...empCvData[name],
                value: moment(newDate).format(OREST_ENDPOINT.DATEFORMAT),
            }
        })
    }

    const handleChangeNumberFormat = (value, name) => {
        setEmpCvData({
            ...empCvData,
            [name]: {
                ...empCvData[name],
                value: value?.floatValue,
            }
        })
    }

    const handleCloseDialog = () => {
        if (JSON.stringify(empCvData) !== JSON.stringify(empCvData)) {
            setOpenTrackedDialog(true)
        } else {
            setToState('employeePortal', ['openCvDialog'], false)
            //handleReset()
        }
    }

    const getCvData = (gid) => {
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'empcv/view/get',
            params: {gid: gid},
            token
        }).then(empCvRes => {
            if (empCvRes.status === 200) {
                setToState('employeePortal', ['empCv'], empCvRes.data.data)
                setToState('employeePortal', ['openCvDialog'], false)
                enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'})
            } else {
                const error = isErrorMsg(empCvRes)
                enqueueSnackbar(error.errorMsg, {variant: 'error'})
            }
            setIsSaving(false)
        })
    }


    return (
        <Dialog
            fullWidth
            maxWidth={'md'}
            open={state.openCvDialog}
            disableEnforceFocus
        >
            <DialogContent className={classes.dialogContentRoot}>
                <div style={{padding: '16px 32px'}}>
                    {carList.map((item, i) => (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography className={classes.title}>{item?.title}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Card elevation={2}>
                                    <CardContent className={classes.cardContentRoot}>
                                        <Grid container spacing={3}>
                                            {
                                                item?.formElements.map((item, index) => (
                                                    <Grid item {...item?.gridProps}>
                                                        {renderFormElements(item)}
                                                    </Grid>
                                                ))
                                            }
                                        </Grid>
                                    </CardContent>
                                </Card>
                                {
                                    i < carList.length - 1 && (
                                        <div style={{paddingBottom: 48}}/>
                                    )
                                }
                            </Grid>
                        </Grid>
                    ))}
                </div>
            </DialogContent>
            <DialogActions>
                <AddDialogActions
                    loading={isSaving}
                    disabled={isSaving}
                    disabledSave={!empCvData.maritalstatus.value}
                    toolTipTitle={
                        <div>
                            <Typography style={{fontWeight: '600', fontSize: 'inherit'}}>{t('str_invalidFields')}</Typography>
                            {
                                empCvData.maritalstatus.isError || required(empCvData.maritalstatus.value) && (
                                    <Typography style={{fontSize: 'inherit'}}>{t('str_branch')}</Typography>
                                )
                            }
                        </div>
                    }
                    onCancelClick={() => handleCloseDialog()}
                    onSaveClick={() => handleSave()}
                />
            </DialogActions>
        </Dialog>
    )


}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.employeePortal,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(NewCvDialog)