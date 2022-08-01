import React, {useContext, useState, useEffect} from 'react';
import {
    Avatar,
    Button,
    Card,
    CardContent,
    CardHeader,
    Grid, InputAdornment, TextField,
    Typography,
} from "@material-ui/core";
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import CheckIcon from '@material-ui/icons/Check';
import useTranslation from "../../../../lib/translations/hooks/useTranslation";
import {Upload} from '@webcms/orest'
import {makeStyles} from "@material-ui/core/styles";
import {DropzoneDialog} from "material-ui-dropzone";
import WebCmsGlobal from "../../../webcms-global";
import {connect, useSelector} from "react-redux";
import {formatMoney, OREST_ENDPOINT, RAFILE_CODE} from "../../../../model/orest/constants";
import {setToState, updateState} from "../../../../state/actions";
import CustomAutoComplete from "../../../CustomAutoComplete/CustomAutoComplete";
import {LocaleContext} from "../../../../lib/translations/context/LocaleContext";
import PhoneInput from "../../../../@webcms-ui/core/phone-input";
import CustomDatePicker from "../../../CustomDatePicker/CustomDatePicker";
import {required} from "../../../../state/utils/form";
import NumberFormat from "react-number-format";
import getSymbolFromCurrency from "../../../../model/currency-symbol";
import {fieldOptions} from "../../../guest/account/Details/clientInitialState";
import SelectAutoComplete from "../../../../@webcms-ui/core/select-autocomplete";
import moment from "moment";


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
}));

function PersonalInformation(props) {
    const classes = useStyles();

    const {state, setToState, onChangePage} = props

    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal)
    const {t} = useTranslation()
    const {locale} = useContext(LocaleContext)

    const token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
    const loginfo = useSelector((state) => state?.orest?.currentUser?.loginfo || false);
    const hotelRefNo = useSelector((state) => state?.hotelinfo?.currentHotelRefNo || loginfo.hotelrefno)
    const profilePictureUrl = useSelector((state) => state?.formReducer?.guest?.clientProfilePhoto || '')

    const [isSaving, setIsSaving] = useState(false);
    const [empCvData, setEmpCvData] = useState({
        description: {value: '', isError: false, required: false, helperText: ''},
        maritalstatus: {value: '', isError: false, required: false, helperText: ''},
        militarystatus: {value: '', isError: false, required: false, helperText: ''},
        healthinfo: {value: state.empCv?.healthinfo, isError: false, required: false, helperText: ''},
        hobby: {value: state.empCv?.hobby, isError: false, required: false, helperText: ''},
    })

    const formElementTypes = {
        textField: 'textField',
        autoComplete: 'autoComplete',
        selectAutoComplete: 'selectAutoComplete',
        phoneInput: 'phoneInput',
        datePicker: 'datePicker',
        numberFormat: 'numberFormat'
    }


    const carList = [
        {
            title: t('Application Information'),
            formElements: [
                {
                    type: formElementTypes.textField,
                    id: 'description',
                    name: 'description',
                    value: state.empCvData?.description?.value,
                    error: state.empCvData?.description?.isError,
                    required: state.empCvData?.description?.required,
                    label: t('str_introduction'),
                    helperText: state.empCvData?.description?.helperText,
                    gridProps: {xs: 12}
                },
                {
                    type: formElementTypes.autoComplete,
                    id: 'maritalstatus',
                    name: 'maritalstatus',
                    value: state.empCvData?.maritalstatus,
                    required: state?.empCvData?.maritalstatus?.required,
                    error: state?.empCvData?.maritalstatus?.isError,
                    label: t('str_maritalStatus'),
                    helperText: state.empCvData?.maritalstatus?.helperText,
                    endpoint: 'transtype/view/maritalstatus',
                    initialId: state.empCvData?.maritalstatus,
                    defValKey: 'code',
                    showOptionLabel: 'description',
                    showOption: 'description',
                    searchParam: 'code,description',
                    gridProps: {xs: 12, sm: 6, md: 3},
                },
                {
                    type: formElementTypes.autoComplete,
                    id: 'militarystatus',
                    name: 'militarystatus',
                    value: state?.empCvData?.militarystatus,
                    required: state?.empCvData?.militarystatus?.required,
                    error: state?.empCvData?.militarystatus?.isError,
                    label: t('str_militaryStatus'),
                    helperText: state?.empCvData?.militarystatus?.helperText,
                    endpoint: 'transtype/milstatus',
                    initialId: state.empCvData?.militarystatus,
                    showOptionLabel: 'description',
                    showOption: 'description',
                    searchParam: 'code,description',
                    gridProps: {xs: 12, sm: 6, md: 3},
                },
                {
                    type: formElementTypes.textField,
                    id: 'healthinfo',
                    name: 'healthinfo',
                    value: state?.empCvData?.healthinfo?.value,
                    required: state?.empCvData?.healthinfo?.required,
                    error: state?.empCvData?.healthinfo?.isError,
                    label: t('str_healthNote'),
                    helperText: state?.empCvData?.healthinfo?.helperText,
                    gridProps: {xs: 12},
                },
                {
                    type: formElementTypes.textField,
                    id: 'hobby',
                    name: 'hobby',
                    value: state?.empCvData?.hobby?.value,
                    required: state?.empCvData?.hobby?.required,
                    error: state?.empCvData?.hobby?.isError,
                    label: t('str_hobbies'),
                    helperText: state.empCvData?.hobby?.helperText,
                    gridProps: {xs: 12},
                },
            ]
        }
    ]

    const handleChangeTextField = (event) => {
        const name = event.target.name;
        setToState('employeePortal', ['empCvData', name], event.target.value)
        setEmpCvData({
            ...empCvData,
            [name]: {
                ...empCvData[name],
                value: event.target.value,
            }
        })
    }

    const handleOnBlurTextField = (event) => {
        const name = event.target.name;
        setEmpCvData({
            ...empCvData,
            [name]: {
                ...empCvData[name],
                isError: empCvData[name].required && !!required(event.target.value),
                helperText: empCvData[name].required && !!required(event.target.value) && t('str_mandatory')
            }
        })
    }

    const handleChangeAutoComplete = (event, newValue, name) => {
        setEmpCvData({
            ...empCvData,
            [name]: {
                ...empCvData[name],
                value: newValue,
                isError: empCvData[name].required && (newValue ? newValue.length <= 0 : true),
                helperText: empCvData[name].required && (newValue ? newValue.length <= 0 : true) && t('str_mandatory')
            }
        })
        setToState('employeePortal', ['empCvData', name], newValue)
    }


    const handleOnBlurAutoComplete = (event, name) => {
        setEmpCvData({
            ...empCvData,
            [name]: {
                ...empCvData[name],
                isError: empCvData[name].required && (event?.target?.value ? event.target.value.length <= 0 : true),
                helperText: empCvData[name].required && (event?.target?.value?.length <= 0) && t('str_mandatory')
            }
        })
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

    const handleChangeNumberFormat = (event, name) => {
        console.log(event, name, 'employeePortal', ['empCvData', name], event?.floatValue)
        setToState('employeePortal', ['empCvData', name], event?.floatValue)
    }


    return (
        <React.Fragment>
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
                                                {
                                                    item?.type === formElementTypes.textField ? (
                                                        <TextField
                                                            id={item?.id}
                                                            name={item?.name}
                                                            value={item?.value}
                                                            required={item?.required}
                                                            error={item?.error}
                                                            label={item?.label}
                                                            onChange={e => handleChangeTextField(e)}
                                                            onBlur={e => handleOnBlurTextField(e)}
                                                            helperText={item?.helperText}
                                                            fullWidth
                                                            variant={'outlined'}
                                                            color={'primary'}
                                                            inputProps={{
                                                                autoComplete: 'off',
                                                            }}
                                                        />
                                                    ) : item?.type === formElementTypes.autoComplete ? (
                                                        <CustomAutoComplete
                                                            id={item?.id}
                                                            name={item?.name}
                                                            value={item?.value}
                                                            error={item?.error}
                                                            endpoint={item?.endpoint}
                                                            label={item?.label}
                                                            required={item?.required}
                                                            onChange={(event, newValue, name) => {
                                                                handleChangeAutoComplete(event, newValue, name)
                                                            }}
                                                            params={item?.paramQuery ? {
                                                                query: item?.paramQuery,
                                                                hotelrefno: hotelRefNo,
                                                                limit: 25,
                                                                field: 'code',
                                                                text: ''
                                                            } : {
                                                                hotelrefno: hotelRefNo,
                                                                limit: 25,
                                                                field: 'code',
                                                                text: ''
                                                            }}
                                                            onLoad={(initialValue, isSearch, isFinish) => {
                                                                if (isSearch) {
                                                                    if (isFinish) {
                                                                        const data = {...state.empCvData}
                                                                        data[item?.name].value = initialValue ? initialValue : state.empCvData[item?.name]
                                                                        setEmpCvData(data)
                                                                        setToState('employeePortal', ['empCvData', [item?.name]], initialValue ? initialValue : state.empCvData[item?.name])
                                                                    }
                                                                } else {
                                                                    console.log(initialValue ? initialValue : state.empCvData[item?.name])
                                                                    const data = {...empCvData}
                                                                    data[item?.name].value = initialValue ? initialValue : state.empCvData[item?.name]
                                                                    setEmpCvData(data)
                                                                    setToState('employeePortal', ['empCvData', [item?.name]], initialValue ? initialValue : state.empCvData[item?.name])
                                                                }
                                                            }}
                                                            triggerValue={item?.triggerValue || false}
                                                            initialId={item?.initialId || false}
                                                            searchInitialParam={item?.searchInitialParam || false}
                                                            showOptionLabel={item?.showOptionLabel}
                                                            showOption={item?.showOption}
                                                            searchParam={item?.searchParam}
                                                            variant={'outlined'}
                                                            helperText={item?.helperText}
                                                            onBlur={(e) => handleOnBlurAutoComplete(e, item?.name)}
                                                        />
                                                    ) : item?.type === formElementTypes.phoneInput ? (
                                                        <PhoneInput
                                                            id={item?.id}
                                                            name={item?.name}
                                                            defaultCountry={locale === 'en' ? 'us' : locale}
                                                            preferredCountries={[
                                                                'it',
                                                                'ie',
                                                                'de',
                                                                'fr',
                                                                'es',
                                                                'gb',
                                                            ]}
                                                            regions={[
                                                                'america',
                                                                'europe',
                                                                'asia',
                                                                'oceania',
                                                                'africa',
                                                            ]}
                                                            variant={'outlined'}
                                                            disabled={isSaving}
                                                            label={item?.label}
                                                            fullWidth
                                                            value={item?.value}
                                                            //onChange={(e)=> handleChangeTextField(e, 'mobiletel')}
                                                            error={item?.isError}
                                                            helperText={item?.helperText}
                                                            required={item?.required}
                                                            //onBlur={() => getMobileTelExits(client.mobiletel.value)}
                                                        />
                                                    ) : item?.type === formElementTypes.datePicker ? (
                                                        <CustomDatePicker
                                                            id={item?.id}
                                                            name={item?.name}
                                                            value={item?.value}
                                                            label={item?.label}
                                                            onChange={(newValue, name) => handleChangeDatePicker(newValue, name)}
                                                            onError={(e) => {
                                                                setEmpCvData({
                                                                    ...empCvData,
                                                                    [item.name]: {
                                                                        ...empCvData[item.name],
                                                                        isError: !!e,
                                                                        helperText: 'invalidDate'
                                                                    }
                                                                })
                                                            }}
                                                            //disableFuture={item?.disableFuture}
                                                            //disablePast={item?.disablePast}
                                                            fullWidth
                                                        />
                                                    ) : item?.type === formElementTypes.numberFormat ? (
                                                        <NumberFormat
                                                            id={item?.id}
                                                            name={item?.name}
                                                            value={Number(item?.value)}
                                                            required={item?.required}
                                                            displayType={'input'}
                                                            decimalScale={2}
                                                            fullWidth
                                                            inputMode={'decimal'}
                                                            isNumericString
                                                            thousandSeparator
                                                            customInput={TextField}
                                                            onValueChange={(values) => handleChangeNumberFormat(values, item?.name)}
                                                            variant={'outlined'}
                                                            label={item?.label}
                                                            inputProps={{
                                                                style: {
                                                                    textAlign: 'right',
                                                                    paddingRight: '8px'
                                                                }
                                                            }}
                                                            InputProps={{
                                                                endAdornment: (
                                                                    <InputAdornment position="start">
                                                                        {getSymbolFromCurrency('TL')}
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                        />
                                                    ) : null
                                                }
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