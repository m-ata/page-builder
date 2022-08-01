import React, {useContext, useState, useEffect} from 'react';
import {
    Avatar,
    Button,
    Card,
    CardContent,
    CardHeader,
    Grid, IconButton, InputAdornment, TextField,
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
import AddCircleIcon from "@material-ui/icons/AddCircle";
import DeleteIcon from "@material-ui/icons/Delete";
import {showError} from "../../../../model/notification/actions";
import SendIcon from "@material-ui/icons/Send";
import AddIcon from "@material-ui/icons/Add";
import moment from 'moment';


const useStyles = makeStyles((theme) => ({
    deleteButton: {
        padding: "0",
        color: "#F16A4B"
    },
    addIcon: {
        paddingRight: "8px",
        width: "1.5em",
        height: "1.5em",
        color: "#67B548",
    },
    addText: {
        fontSize: "15px",
        fontWeight: "600",
        color: "#67B548",
    },
    deleteText: {
        fontSize: "15px",
        fontWeight: "600",
        color: "#F16A4B",
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        paddingBottom: '30px',
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

    const [isSaving, setIsSaving] = useState(false);
    const [empEduData, setEmpEduData] = useState({
        edutypeid: {value: '', isError: false, required: true, helperText: ''},
        graddate: {value: '', isError: false, required: false, helperText: ''},
        schoolname: {value: '', isError: false, required: true, helperText: ''},
        gradlevel: {value: false, isError: false, required: true, helperText: ''},
        schoolplace: {value: '', isError: false, required: false, helperText: ''},
        note: {value: '', isError: false, required: false, helperText: ''},
    })

    const formElementTypes = {
        textField: 'textField',
        autoComplete: 'autoComplete',
        selectAutoComplete: 'selectAutoComplete',
        phoneInput: 'phoneInput',
        datePicker: 'datePicker',
        numberFormat: 'numberFormat'
    }


    const carList = state?.empEduData?.map((item) => (
            {
                title: t('str_educationInformation'),
                formElements: [
                    {
                        type: formElementTypes.autoComplete,
                        id: 'edutypeid',
                        name: 'edutypeid',
                        value: item?.edutypeid?.value,
                        required: item?.edutypeid?.required,
                        error: item?.edutypeid?.isError,
                        label: t('str_educationType'),
                        helperText: item?.edutypeid?.helperText,
                        endpoint: 'edutype/view/list',
                        initialId: typeof item?.edutypeid?.value === 'object' ? false : item?.edutypeid?.value,
                        showOptionLabel: 'code',
                        showOption: 'code',
                        searchParam: 'code,description',
                        gridProps: {xs: 12, sm: 6, md: 3},
                    },
                    {
                        type: formElementTypes.datePicker,
                        id: 'graddate',
                        name: 'graddate',
                        value: item?.graddate?.value || moment().format('L'),
                        required: item?.graddate?.required,
                        error: item?.graddate?.isError,
                        label: t('str_graduateDate'),
                        helperText: item?.graddate?.helperText,
                        gridProps: {xs: 12, sm: 6, md: 3}
                    },
                    {
                        type: formElementTypes.textField,
                        id: 'schoolname',
                        name: 'schoolname',
                        value: item?.schoolname?.value,
                        required: item?.schoolname?.required,
                        error: item?.schoolname?.isError,
                        label: t('str_schoolName'),
                        helperText: item?.schoolname?.helperText,
                        gridProps: {xs: 12, sm: 6, md: 3},
                    },
                    {
                        type: formElementTypes.textField,
                        id: 'gradlevel',
                        name: 'gradlevel',
                        value: item?.gradlevel?.value,
                        required: item?.gradlevel?.required,
                        error: item?.gradlevel?.isError,
                        label: t('str_graduateLevel'),
                        helperText: item?.gradlevel?.helperText,
                        gridProps: {xs: 12, sm: 6, md: 3},
                    },
                    {
                        type: formElementTypes.textField,
                        id: 'schoolplace',
                        name: 'schoolplace',
                        value: item?.schoolplace?.value,
                        required: item?.schoolplace?.required,
                        error: item?.schoolplace?.isError,
                        label: t('str_schoolPlace'),
                        helperText: item?.schoolplace?.helperText,
                        gridProps: {xs: 12, sm: 6, md: 3},
                    },
                    {
                        type: formElementTypes.textField,
                        id: 'note',
                        name: 'note',
                        value: item?.note?.value,
                        required: item?.note?.required,
                        error: item?.note?.isError,
                        label: t('str_note'),
                        helperText: item?.note?.helperText,
                        gridProps: {xs: 12, sm: 6, md: 9},
                    },
                ]
            }
        )
    )


    const handleChangeTextField = (event, index) => {
        const name = event.target.name;
        const data = {...state.empEduData[index]};
        data[name] = {
            ...state.empEduData[index][name],
            value: event.target.value
        }
        setToState('employeePortal', ['empEduData', index], data)

    }

    const handleOnBlurTextField = (event, index, key) => {
        const name = key ? key : event.target.name;
        const data = {...state.empEduData[index]}
        console.log(event.target.value)
        data[name] = {
            ...state.empEduData[index][name],
            isError: empEduData[name].required && (event.target.value ? event.target.value.length <= 0 : true),
            helperText: empEduData[name].required && (event.target.value ? event.target.value.length <= 0 : true) && t('str_mandatory')
        }
        setToState('employeePortal', ['empEduData', index], data)
    }

    const handleChangeAutoComplete = (event, newValue, name, index) => {
        const data = {...state.empEduData[index]}
        data[name] = {
            ...state.empEduData[index][name],
            value: newValue,
            isError: empEduData[name].required && (newValue ? newValue.length <= 0 : true),
            helperText: empEduData[name].required && (newValue ? newValue.length <= 0 : true) && t('str_mandatory')
        }
        setToState('employeePortal', ['empEduData', index], data)
    }


    const handleOnBlurAutoComplete = (event, name) => {
        setEmpEduData({
            ...empEduData,
            [name]: {
                ...empEduData[name],
                isError: empEduData[name].required && (event?.target?.value ? event.target.value.length <= 0 : true),
                helperText: empEduData[name].required && (event?.target?.value?.length <= 0) && t('str_mandatory')
            }
        })
    }

    const handleChangeDatePicker = (newDate, name, index) => {
        const data = {...state.empEduData[index]}
        data[name] = {
            ...state.empEduData[index][name],
            value: moment(newDate).format(OREST_ENDPOINT.DATEFORMAT),
        }
        setToState('employeePortal', ['empEduData', index], data)
    }


    function handleAdd() {
        let isError = false;
        state.empEduData.map((data,i) => {
            if(data.edutypeid === "" || data.graddate === "" || data.schoolname === ""|| data.gradlevel === "" || data.schoolplace === ""|| data.schoolplace === "") {
                showError(t('you should add either school name ...'))
                isError = true;
            }
        })
        if (!isError) {
            const data = [...state.empEduData]
            data.push({
                edutypeid: {value: '', isError: false, required: true, helperText: ''},
                graddate: {value: '', isError: false, required: false, helperText: ''},
                schoolname: {value: '', isError: false, required: true, helperText: ''},
                gradlevel: {value: '', isError: false, required: true, helperText: ''},
                schoolplace: {value: '', isError: false, required: false, helperText: ''},
                note: {value: '', isError: false, required: false, helperText: ''},
            });
            setToState('employeePortal', ['empEduData'], data)
        }
    }

    function handleRemove(i) {
        const data = [...state.empEduData]
        data.splice(i, 1);
        setToState('employeePortal', ['empEduData'], data)
    }

    const handleChangeNumberFormat = (event) => {
        console.log(event)
    }

    return (
        <React.Fragment>
            <Typography className={classes.title}>
                {t('str_educationInformation')}
            </Typography>
            {carList.map((item, i) => (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Card elevation={2}>
                            <CardContent className={classes.cardContentRoot}>
                                <Grid container spacing={3}>
                                    {
                                        item?.formElements.map((item2, index) => (
                                            <Grid item {...item2?.gridProps}>
                                                {
                                                    item2?.type === formElementTypes.textField ? (
                                                        <TextField
                                                            id={item2?.id}
                                                            name={item2?.name}
                                                            value={item2?.value}
                                                            required={item2?.required}
                                                            error={item2?.error}
                                                            label={item2?.label}
                                                            onChange={e => handleChangeTextField(e, i)}
                                                            onBlur={e => handleOnBlurTextField(e, i)}
                                                            helperText={item2?.helperText}
                                                            fullWidth
                                                            variant={'outlined'}
                                                            color={'primary'}
                                                            inputProps={{
                                                                autoComplete: 'off',
                                                            }}
                                                        />
                                                    ) : item2?.type === formElementTypes.autoComplete ? (
                                                        <CustomAutoComplete
                                                            id={item2?.id}
                                                            name={item2?.name}
                                                            value={item2?.value}
                                                            error={item2?.error}
                                                            endpoint={item2?.endpoint}
                                                            label={item2?.label}
                                                            required={item2?.required}
                                                            onChange={(event, newValue, name) => {
                                                                handleChangeAutoComplete(event, newValue, name, i)
                                                            }}
                                                            params={{
                                                                hotelrefno: hotelRefNo,
                                                                limit: 25,
                                                                field: 'code',
                                                                text: ''
                                                            }}
                                                            onLoad={(initialValue, isSearch, isFinish) => {
                                                                if (isSearch) {
                                                                    if (isFinish) {
                                                                        const data = {...state.empEduData[i]}
                                                                        data[item2?.name].value = initialValue ? initialValue : state.empEduData[item2?.name]
                                                                        setEmpEduData(data)
                                                                    }
                                                                } else {
                                                                    const data = {...state.empEduData[i]}
                                                                    data[item2?.name].value = initialValue ? initialValue : state.personalDataBase[item2?.name]
                                                                    setEmpEduData(data)
                                                                }
                                                            }}
                                                            triggerValue={item2?.triggerValue || false}
                                                            initialId={item2?.initialId || false}
                                                            searchInitialParam={item2?.searchInitialParam || false}
                                                            showOptionLabel={item2?.showOptionLabel}
                                                            showOption={item2?.showOption}
                                                            searchParam={item2?.searchParam}
                                                            variant={'outlined'}
                                                            helperText={item2?.helperText}
                                                            onBlur={(e) => handleOnBlurTextField(e, i, item2?.name)}
                                                        />
                                                    ) : item2?.type === formElementTypes.phoneInput ? (
                                                        <PhoneInput
                                                            id={item2?.id}
                                                            name={item2?.name}
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
                                                            label={item2?.label}
                                                            fullWidth
                                                            value={item2?.value}
                                                            //onChange={(e)=> handleChangeTextField(e, 'mobiletel')}
                                                            error={item2?.isError}
                                                            helperText={item2?.helperText}
                                                            required={item2?.required}
                                                            //onBlur={() => getMobileTelExits(client.mobiletel.value)}
                                                        />
                                                    ) : item2?.type === formElementTypes.datePicker ? (
                                                        <CustomDatePicker
                                                            id={item2?.id}
                                                            name={item2?.name}
                                                            value={item2?.value}
                                                            label={item2?.label}
                                                            onChange={(newValue, name) => handleChangeDatePicker(newValue, name, i)}
                                                            onError={(e) => {
                                                                setEmpEduData({
                                                                    ...empEduData,
                                                                    [item2.name]: {
                                                                        ...empEduData[item2.name],
                                                                        isError: !!e,
                                                                        helperText: 'invalidDate'
                                                                    }
                                                                })
                                                            }}
                                                            disableFuture={item2?.disableFuture}
                                                            disablePast={item2?.disablePast}
                                                            fullWidth
                                                        />
                                                    ) : item2?.type === formElementTypes.numberFormat ? (
                                                        <NumberFormat
                                                            id={item2?.id}
                                                            name={item2?.name}
                                                            required={item2?.required}
                                                            displayType={'input'}
                                                            decimalScale={2}
                                                            fullWidth
                                                            inputMode={'decimal'}
                                                            isNumericString
                                                            thousandSeparator
                                                            customInput={TextField}
                                                            onValueChange={(values) => handleChangeNumberFormat(values)}
                                                            variant={'outlined'}
                                                            label={item2?.label}
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
                                <Grid style={{paddingTop: "40px"}}/>
                                <Grid>
                                    <div>
                                        <Button style={{float: "right"}} onClick={() => handleRemove(i)}>
                                            <Typography className={classes.deleteText}>
                                                <DeleteIcon className={classes.deleteButton}/>{t("str_delete")}
                                            </Typography>
                                        </Button>
                                    </div>
                                </Grid>
                                <Grid style={{paddingBottom: "40px"}}/>
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
            <Grid style={{paddingTop: "40px"}}/>
            <Button onClick={handleAdd}>
                <Typography className={classes.addText}>
                    <AddCircleIcon className={classes.addIcon}/>{t("str_addEducationInformation")}
                </Typography>
            </Button>
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