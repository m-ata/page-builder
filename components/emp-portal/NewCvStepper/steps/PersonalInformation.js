import React, {useContext, useState, useEffect} from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Grid,
    Typography,
} from "@material-ui/core";
import useTranslation from "../../../../lib/translations/hooks/useTranslation";
import {makeStyles} from "@material-ui/core/styles";
import WebCmsGlobal from "../../../webcms-global";
import {connect, useSelector} from "react-redux";
import {
    isErrorMsg,
    mobileTelNoFormat,
    OREST_ENDPOINT,
    RAFILE_CODE,
    REQUEST_METHOD_CONST
} from "../../../../model/orest/constants";
import { setToState, updateState } from "../../../../state/actions";
import {LocaleContext} from "../../../../lib/translations/context/LocaleContext";
import {required} from "../../../../state/utils/form";
import moment from "moment";
import axios from 'axios'
import AddDialogActions from "../../../AddDialogActions";
import renderFormElements, {ELEMENT_TYPES} from "../../../render-form-elements";
import {helper} from "../../../../@webcms-globals";
import {SLASH} from "../../../../model/globals";
import {Patch, UseOrest, ViewList} from "@webcms/orest";
import {useSnackbar} from "notistack";
import {useOrestAction} from "../../../../model/orest";
import TrackedChangesDialog from "../../../TrackedChangesDialog";


const useStyles = makeStyles((theme) => ({
    title: {
        fontSize: '28px',
        fontWeight: 'bold'
    },
    avatarStyle: {
        width: '130px',
        height: '130px'
    },
    cardContentRoot: {
        padding: '24px 32px'
    },
    cardHeaderTitle: {
        fontSize: '25px',
        fontWeight: 'bold'
    },
    cardHeaderSubTitle: {
        textTransform: 'none',
        fontSize: '18px',
        '& .MuiButton-iconSizeMedium > *:first-child': {
            fontSize: '32px'
        },
    },
    dialogContentRoot: {
        padding: 24
    },
    dialogActionRoot: {
        padding: '8px 16px 24px 8px'
    }
}));
const VARIANT = 'outlined'

function PersonalInformation(props) {
    const classes = useStyles();

    const { state, setToState, open, onClose, empViewData } = props

    const {enqueueSnackbar} = useSnackbar();

    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { t } = useTranslation()
    const { locale } = useContext(LocaleContext)

    const { setOrestState } = useOrestAction()

    const token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
    const loginfo = useSelector((state) => state?.orest?.currentUser?.loginfo || false);
    const hotelRefNo = useSelector((state) => state?.hotelinfo?.currentHotelRefNo || loginfo.hotelrefno)

    const initialState = {
        firstname: {value: '', isError: false, isRequired: true, helperText: false},
        lastname: {value: '', isError: false, isRequired: true, helperText: false},
        tridno: {value: '', isError: false, isRequired: false, helperText: false},
        gender: {value: false, isError: false, isRequired: true, helperText: false},
        email: {value: '', isError: false, isRequired: true, helperText: false},
        mobiletel: {value: '', isError: false, isRequired: true, helperText: false},
        birthdate: {value: null, isError: false, isRequired: false, helperText: false},
        birthplace: {value: '', isError: false, isRequired: false, helperText: false},
        tel: {value: '', isError: false, isRequired: false, helperText: false},
        nationid: {value: false, isError: false, isRequired: true, helperText: false},
        address1: {value: '', isError: false, isRequired: false, helperText: false},
        address2: {value: '', isError: false, isRequired: false, helperText: false},
        city: {value: '', isError: false, isRequired: false, helperText: false},
        town: {value: '', isError: false, isRequired: false, helperText: false},
    }
    const [empData, setEmpData] = useState(initialState);
    const [empDataBase, setEmpDataBase] = useState(empData);
    const [isSaving, setIsSaving] = useState(false);
    const [isInitialStateLoad, setIsInitialStateLoad] = useState(false)
    const [openTrackedDialog, setOpenTrackedDialog] = useState(false);
    


    const mandatoryFields = [
        'firstname',
        'lastname',
        'gender',
        'email',
        'mobiletel',
        'nationid'
    ]
    const formElements = [
        {
            type: ELEMENT_TYPES.textField,
            id: 'firstname',
            name: 'firstname',
            value: empData.firstname?.value,
            required: empData.firstname.isRequired,
            error: empData.firstname.isError,
            onChange: (e) => handleOnChangeFormElement(e),
            onBlur: (e) => handleOnBlurFormElement(e),
            label: t('str_firstName'),
            helperText: empData.firstname?.helperText,
            fullWidth: true,
            variant: VARIANT,
            gridProps: {xs: 12, sm: 6, md: 3},
        },
        {
            type: ELEMENT_TYPES.textField,
            id: 'lastname',
            name: 'lastname',
            value: empData.lastname?.value,
            required: empData.lastname.isRequired,
            error: empData.lastname.isError,
            onChange: (e) => handleOnChangeFormElement(e),
            onBlur: (e) => handleOnBlurFormElement(e),
            label: t('str_lastName'),
            helperText: empData.lastname.helperText,
            fullWidth: true,
            variant: VARIANT,
            gridProps: {xs: 12, sm: 6, md: 3}
        },
        {
            type: ELEMENT_TYPES.textField,
            id: 'tridno',
            name: 'tridno',
            value: empData.tridno?.value,
            required: empData.tridno.isRequired,
            error: empData.tridno.isError,
            onChange: (e) => handleOnChangeFormElement(e),
            onBlur: (e) => handleOnBlurFormElement(e),
            label: t('str_trIdNo'),
            helperText: empData.tridno.helperText,
            fullWidth: true,
            variant: VARIANT,
            gridProps: {xs: 12, sm: 6, md: 3}
        },
        {
            type: ELEMENT_TYPES.autoComplete,
            id: 'gender',
            name: 'gender',
            value: typeof empData.gender.value === 'object' ?  empData.gender?.value : null,
            required: empData.gender.isRequired,
            error: empData.gender.isError,
            onChange: (newValue, name) => handleOnChangeFormElement(newValue, name),
            onBlur: (e, name) => handleOnBlurFormElement(e, name),
            onLoad: (initialValue) => { initialValue && handleOnLoad(initialValue, 'gender')},
            label: t('str_gender'),
            helperText: empData.gender.helperText,
            endpoint: 'transtype/view/gender',
            params: {field: 'code', text: '',  limit: 25, query: 'isactive:true'},
            initialId: isInitialStateLoad && typeof empData.gender.value !== 'object' ? empData.gender.value : false,
            searchInitialParam: 'code',
            showOptionLabel: 'description',
            showOption: 'description',
            useDefaultFilter: true,
            fullWidth: true,
            variant: VARIANT,
            gridProps: {xs: 12, sm: 6, md: 3},
        },
        {
            type: ELEMENT_TYPES.textField,
            id: 'email',
            name: 'email',
            value: empData.email?.value,
            required: empData.email.isRequired,
            error: empData.email.isError,
            onChange: (e) => handleOnChangeFormElement(e),
            onBlur: (e) => handleOnBlurFormElement(e),
            label: t('str_email'),
            helperText: empData.email.helperText,
            fullWidth: true,
            variant: VARIANT,
            gridProps: {xs: 12, sm: 6, md: 3}
        },
        {
            type: ELEMENT_TYPES.phoneInput,
            id: 'mobiletel',
            name: 'mobiletel',
            defaultCountry: loginfo?.countryiso?.toLowerCase() || locale,
            value: empData.mobiletel?.value,
            required: empData.mobiletel.isRequired,
            error: empData.mobiletel.isError,
            onChange: (phoneNumber, name) => handleOnChangeFormElement(phoneNumber, name),
            onBlur: (e, name) => handleOnBlurFormElement(e, name),
            label: t('str_mobile'),
            helperText: empData.mobiletel.helperText,
            fullWidth: true,
            variant: VARIANT,
            gridProps: {xs: 12, sm: 6, md: 3}
        },
        {
            type: ELEMENT_TYPES.datePicker,
            id: 'birthdate',
            name: 'birthdate',
            value: empData.birthdate?.value,
            required: empData.birthdate.isRequired,
            error: empData.birthdate.isError,
            label: t('str_birthDate'),
            onChange: (e, name) => handleChangeDatePicker(e, name),
            helperText: empData.birthdate.helperText,
            disableFuture: true,
            fullWidth: true,
            variant: VARIANT,
            gridProps: {xs: 12, sm: 6, md: 3}
        },
        {
            type: ELEMENT_TYPES.textField,
            id: 'birthplace',
            name: 'birthplace',
            value: empData.birthplace?.value,
            required: empData.birthplace.isRequired,
            error: empData.birthplace.isError,
            label: t('str_birthPlace'),
            onChange: (e) => handleOnChangeFormElement(e),
            onBlur: (e) => handleOnBlurFormElement(e),
            helperText: empData.birthplace.helperText,
            fullWidth: true,
            variant: VARIANT,
            gridProps: {xs: 12, sm: 6, md: 3}
        },
        {
            type: ELEMENT_TYPES.phoneInput,
            id: 'tel',
            name: 'tel',
            defaultCountry: loginfo?.countryiso?.toLowerCase() || locale,
            value: empData.tel?.value,
            required: empData.tel.isRequired,
            error: empData.tel.isError,
            onChange: (e, name) => handleOnChangeFormElement(e, name),
            onBlur: (e, name) => handleOnBlurFormElement(e, name),
            label: t('str_tel'),
            helperText: state.personalData.tel.helperText,
            fullWidth: true,
            variant: VARIANT,
            gridProps: {xs: 12, sm: 6, md: 3}
        },
        {
            type: ELEMENT_TYPES.autoComplete,
            id: 'nationid',
            name: 'nationid',
            value: typeof empData.nationid.value === 'object' ? empData.nationid?.value : null,
            required: empData.nationid.isRequired,
            error: empData.nationid.isError,
            onChange: (newValue, name) => handleOnChangeFormElement(newValue, name),
            onBlur: (e, name) => handleOnBlurFormElement(e, name),
            onLoad: (initialValue) => { initialValue && handleOnLoad(initialValue, 'nationid')},
            label: t('str_nation'),
            helperText: empData.nationid.helperText,
            endpoint: 'nation/view/list',
            params: {field: 'code', text: '', limit: 0, query: 'isactive:true'},
            initialId: isInitialStateLoad && typeof empData.nationid.value !== 'object' ? empData.nationid.value : false,
            showOptionLabel: 'description',
            showOption: 'description',
            searchParam: 'code,description',
            useDefaultFilter: true,
            fullWidth: true,
            variant: VARIANT,
            gridProps: {xs: 12, sm: 6, md: 3},
        },
        {
            type: ELEMENT_TYPES.textField,
            id: 'address1',
            name: 'address1',
            value: empData?.address1?.value,
            required: empData.address1.isRequired,
            error: empData.address1.isError,
            onChange: (e) => handleOnChangeFormElement(e),
            onBlur: (e) => handleOnBlurFormElement(e),
            label: t('str_address1'),
            helperText: empData.address1.helperText,
            fullWidth: true,
            variant: VARIANT,
            gridProps: {xs: 12},
        },
        {
            type: ELEMENT_TYPES.textField,
            id: 'address2',
            name: 'address2',
            value: empData.address2?.value,
            required: empData.address2.isRequired,
            error: state.personalData.address2.isError,
            onChange: (e) => handleOnChangeFormElement(e),
            onBlur: (e) => handleOnBlurFormElement(e),
            label: t('str_address2'),
            helperText: empData.address2.helperText,
            fullWidth: true,
            variant: VARIANT,
            gridProps: {xs: 12},
        },
        {
            type: ELEMENT_TYPES.autoComplete,
            id: 'city',
            name: 'city',
            value: isInitialStateLoad && empData.city?.value || null ,
            required: empData.city.isRequired,
            error: empData.city.isError,
            label: t('str_city'),
            helperText: empData.city.helperText,
            endpoint: 'city/view/list',
            onChange: (newValue, name) => handleOnChangeFormElement(newValue, name),
            onBlur: (e, name) => handleOnBlurFormElement(e, name),
            onInputChange: (e, name) => handleOnChangeFormElement(e, name),
            params: {field: 'code', text: '', limit: 25, query: 'isactive:true'},
            freeSolo: true,
            searchInitialParam: 'description',
            showOptionLabel: 'description',
            showOption: 'description',
            searchParam: 'code,description',
            fullWidth: true,
            variant: VARIANT,
            gridProps: {xs: 12, sm: 6, md: 3},
        },
        {
            type: ELEMENT_TYPES.autoComplete,
            id: 'town',
            name: 'town',
            value: isInitialStateLoad && empData.town?.value || null,
            required: empData.town.isRequired,
            error: empData.town.isError,
            onChange: (newValue, name) => handleOnChangeFormElement(newValue, name),
            onBlur: (e, name) => handleOnBlurFormElement(e, name),
            onInputChange: (e, name) => handleOnChangeFormElement(e, name),
            label: t('str_town'),
            helperText: empData.town.helperText,
            endpoint: 'town/view/list',
            params: {field: 'citydesc', text: `*${empData.city.value?.description || empData.city.value}`, limit: 25, query:`isactive:true`},
            trgValKey: 'description',
            triggerValue: isInitialStateLoad && typeof empData.city.value === 'object' && empData.city.value,
            freeSolo: true,
            searchInitialParam: 'description',
            showOptionLabel: 'description',
            showOption: 'description',
            searchParam: 'code,description',
            fullWidth: true,
            variant: VARIANT,
            gridProps: {xs: 12, sm: 6, md: 3},
        }
    ]



    useEffect(() => {
        let isEffect = true
        if (isEffect && empData && empViewData && !isInitialStateLoad) {
            const newInitialState = helper.objectMapper(empData, empViewData, mandatoryFields)
            setEmpData(newInitialState)
            setEmpDataBase(newInitialState)
            console.log(newInitialState)
            setIsInitialStateLoad(true)

        }
        return () => {
            isEffect = false
        }
    }, [empViewData])



    const handleSave = async () => {
        const data = {...empData}
        Object.keys(data).map((key) => {
            if(key === 'gender') {
                data[key] = typeof data.gender.value === 'object' ? data.gender.value?.code : data.gender.value
            } else if(key === 'mobiletel' || key === 'tel') {
                data[key] = mobileTelNoFormat(data[key].value)
            } else if(key === 'nationid'){
                data[key] = typeof data[key].value === 'object' ? data[key].value?.id : data[key].value
            } else {
                data[key] = typeof data[key].value === 'object' ? data[key].value?.description : data[key].value
            }
        })
        setIsSaving(true)
        const patchResponse = await handlePatch(data)
        const getEmpDataResponse = await handleGetEmployeeData(empViewData?.gid)
        if(!patchResponse.isError && !getEmpDataResponse.isError) {
            enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'})
            handleReset()
            if(typeof onClose === 'function') onClose()
        } else {
            enqueueSnackbar(patchResponse?.errorMsg || getEmpDataResponse?.errorMsg, {variant: 'error'})
        }
        setIsSaving(false)
    }

    const handlePatch = async (data) => {
         return Patch({
             apiUrl: GENERAL_SETTINGS.OREST_URL,
             endpoint: OREST_ENDPOINT.EMPLOYEE,
             gid: empViewData?.gid,
             data: data,
             token
         }).then(res => {
             if(res.status === 200) {
                 return {isError: false, errorMsg: false}
             } else {
                 const error = isErrorMsg(res)
                 return {isError: true, errorMsg: error.errorMsg}
             }
         })
    }

    const handleGetEmployeeData = async (gid) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.EMPLOYEE + SLASH + OREST_ENDPOINT.VIEW + SLASH + OREST_ENDPOINT.GET + SLASH + gid,
            params: {hotelrefno: hotelRefNo},
            token
        }).then(res => {
            if(res.status === 200) {
                setOrestState(['emp'], res.data.data)
              return {isError: false, errorMsg: false}
            } else {
                const error = isErrorMsg(res)
                return {isError: true, errorMsg: error.errorMsg}
            }
        })
    }

    const handleOnChangeFormElement = (event, key) => {
        const name = key ? key : event.target.name;
        const value = event?.target ? event.target.value : event

        setEmpData({
            ...empData,
            [name]: {
                ...empData[name],
                value: value,
                isError: name === 'mobiletel' && value.length < 10 || empData[name].isRequired && !!required(value),
                helperText: empData[name].isRequired && !!required(value) && t('str_mandatory')
            }
        })
        if(name === 'city') {
            const data = {...empData}
            data[name] = {
                ...empData[name],
                value: value,
                isError: empData[name].isRequired && !!required(value),
                helperText: empData[name].isRequired && !!required(value) && t('str_mandatory')
            }
            data['town'] = {
                ...empData[name],
                value: '',
                isError: empData[name].isRequired && !!required(value),
                helperText: empData[name].isRequired && !!required(value) && t('str_mandatory')
            }
            setEmpData(data)
        }
        if(typeof event?.preventDefault === 'function') event.preventDefault()
    }

    const handleOnBlurFormElement = (event, key) => {
        const name = key ? key : event.target.name;
        const value = event.target.value

        setEmpData({
            ...empData,
            [name]: {
                ...empData[name],
                isError: empData[name].isRequired && !!required(value),
                helperText: empData[name].isRequired && !!required(value) && t('str_mandatory')
            }
        })
    }



    const handleOnLoad = (value, key) => {
        const data = {...empData}
        data[key].value = value
        setEmpData(data)
        setEmpDataBase(data)
    }

    const handleReset = () => {
        setEmpData(initialState)
        setEmpDataBase(initialState)
        setIsInitialStateLoad(false)
    }


    const handleChangeDatePicker = (newDate, name) => {
        setEmpData({
            ...empData,
            [name]: {
                ...empData[name],
                value: moment(newDate).format(OREST_ENDPOINT.DATEFORMAT),
            }
        })
    }


    const handleClose = () => {
        if(JSON.stringify(empData) !== JSON.stringify(empDataBase)) {
            setOpenTrackedDialog(true)
        } else {
            handleReset()
            if(typeof onClose === 'function') {
                onClose()
            }
        }
    }

    return(
        <React.Fragment>
            <Dialog
                open={open}
                fullWidth
                maxWidth={'lg'}
                disableEnforceFocus
            >
                <DialogContent className={classes.dialogContentRoot}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography className={classes.title}>{t('str_personalInformation')}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container spacing={3}>
                                {
                                    formElements.map((item, index) => (
                                        <Grid key={`grid-${index}`} item {...item?.gridProps}>
                                            {renderFormElements(item)}
                                        </Grid>
                                    ))
                                }
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions className={classes.dialogActionRoot}>
                    <AddDialogActions
                        onCancelClick={() => handleClose()}
                        onSaveClick={() => handleSave()}
                        loading={isSaving}
                        disabled={isSaving}
                        showToolTip
                        toolTipTitle={
                            <div>
                                <Typography style={{fontSize: 'inherit', fontWeight: '600'}}>{t('str_invalidFields')}</Typography>
                                {
                                    empData.firstname.isError && (
                                        <Typography style={{fontSize: 'inherit'}}>{t('str_firstName')}</Typography>
                                    )
                                }
                                {
                                    empData.lastname.isError && (
                                        <Typography style={{fontSize: 'inherit'}}>{t('str_lastName')}</Typography>
                                    )
                                }
                                {
                                    empData.gender.isError && (
                                        <Typography style={{fontSize: 'inherit'}}>{t('str_gender')}</Typography>
                                    )
                                }
                                {
                                    empData.email.isError && (
                                        <Typography style={{fontSize: 'inherit'}}>{t('str_email')}</Typography>
                                    )
                                }
                                {
                                    empData.mobiletel.value.length < 10 && (
                                        <Typography style={{fontSize: 'inherit'}}>{t('str_mobile')}</Typography>
                                    )
                                }
                                {
                                    empData.nationid.isError && (
                                        <Typography style={{fontSize: 'inherit'}}>{t('str_nation')}</Typography>
                                    )
                                }
                            </div>
                        }
                        disabledSave={
                            helper.isEmpty(empData.firstname.value) || helper.isEmpty(empData.gender.value) ||
                            helper.isEmpty(empData.email.value) || helper.isEmpty(empData.mobiletel.value) ||
                            helper.isEmpty(empData.nationid.value) || empData.mobiletel.value.length < 10}
                    />
                </DialogActions>
            </Dialog>
            <TrackedChangesDialog
                open={openTrackedDialog}
                onPressNo={(e) => {
                    setOpenTrackedDialog(e);
                }}
                onPressYes={(e) => {
                    setOpenTrackedDialog(e);
                    handleReset()
                    typeof onClose === 'function' && onClose()
                }}
            />
        </React.Fragment>


    )
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

const mapStateToProps = state => {
    return {
        state: state.formReducer.employeePortal,
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PersonalInformation)