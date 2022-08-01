import React, {useContext, useState, useEffect} from 'react';
import {
    Avatar,
    Button,
    Card,
    CardContent,
    CardHeader, FormControl, FormControlLabel,
    Grid, IconButton, InputAdornment, Radio, RadioGroup, TextField,
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
import FormLabel from "@material-ui/core/FormLabel";
import moment from 'moment'


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

function WorkStep(props) {
    const classes = useStyles();

    const {state, setToState, onChangePage} = props

    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal)
    const {t} = useTranslation()
    const {locale} = useContext(LocaleContext)

    const token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
    const loginfo = useSelector((state) => state?.orest?.currentUser?.loginfo || false);
    const hotelRefNo = useSelector((state) => state?.hotelinfo?.currentHotelRefNo || loginfo.hotelrefno)

    const [isSaving, setIsSaving] = useState(false);
    const [value, setValue] = React.useState('No');
    const [empWorkData, setempWorkData] = useState({
        company: {value: '', isError: false, required: true, helperText: ''},
        startdate: {value: '', isError: false, required: true, helperText: ''},
        enddate: {value: false, isError: false, required: true, helperText: ''},
        workpos: {value: '', isError: false, required: false, helperText: ''},
        worksalary: {value: '', isError: false, required: false, helperText: ''},
        leavereason: {value: '', isError: false, required: false, helperText: ''},
        workrefallowed: {value: '', isError: false, required: false, helperText: ''},
    })
    const [empRefData, setempRefData] = useState({
        reftypeid: {value: '', isError: false, required: true, helperText: ''},
        refname: {value: '', isError: false, required: false, helperText: ''},
        tel: {value: '', isError: false, required: true, helperText: ''},
        email: {value: '', isError: false, required: true, helperText: ''},
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

    const workCardList = state?.empWorkData?.map((item) => (
            {
                title: t('str_workExperience'),
                formElements: [
                    {
                        type: formElementTypes.textField,
                        id: 'company',
                        name: 'company',
                        value: item?.company?.value,
                        required: item?.company?.required,
                        error: item?.company?.isError,
                        label: t('str_company'),
                        helperText: item?.company?.helperText,
                        gridProps: {xs: 12, sm: 6, md: 3},
                    },
                    {
                        type: formElementTypes.datePicker,
                        id: 'startdate',
                        name: 'startdate',
                        value: item?.startdate?.value || null,
                        required: item?.startdate?.required,
                        error: item?.startdate?.isError,
                        label: t('str_startDate'),
                        helperText: item?.startdate?.helperText,
                        gridProps: {xs: 12, sm: 6, md: 3}
                    },
                    {
                        type: formElementTypes.datePicker,
                        id: 'enddate',
                        name: 'enddate',
                        value: item?.enddate?.value || null,
                        required: item?.enddate?.required,
                        error: item?.enddate?.isError,
                        label: t('str_endDate'),
                        helperText: item?.enddate?.helperText,
                        gridProps: {xs: 12, sm: 6, md: 3}
                    },
                    {
                        type: formElementTypes.textField,
                        id: 'workpos',
                        name: 'workpos',
                        value: item?.workpos?.value,
                        required: item?.workpos?.required,
                        error: item?.workpos?.isError,
                        label: t('str_position'),
                        helperText: item?.workpos?.helperText,
                        gridProps: {xs: 12, sm: 6, md: 3},
                    },
                    {
                        type: formElementTypes.numberFormat,
                        id: 'worksalary',
                        name: 'worksalary',
                        value: item?.worksalary?.value,
                        required: item?.worksalary?.required,
                        error: item?.worksalary?.isError,
                        label: t('str_salary'),
                        helperText: item?.worksalary?.helperText,
                        gridProps: {xs: 12, sm: 6, md: 3},
                    },
                    {
                        type: formElementTypes.textField,
                        id: 'leavereason',
                        name: 'leavereason',
                        value: item?.leavereason?.value,
                        required: item?.leavereason?.required,
                        error: item?.leavereason?.isError,
                        label: t('str_reasonForQuit'),
                        helperText: item?.leavereason?.helperText,
                        gridProps: {xs: 12, sm: 6, md: 9},
                    },
                ]
            }
        )
    )

    const refCardList = state?.empRefData?.map((item) => (
            {
                title: t('str_references'),
                formElements: [
                    {
                        type: formElementTypes.autoComplete,
                        id: 'reftypeid',
                        name: 'reftypeid',
                        value: item?.reftypeid?.value,
                        required: item?.reftypeid?.required,
                        error: item?.reftypeid?.isError,
                        label: t('str_references'),
                        helperText: item?.reftypeid?.helperText,
                        endpoint: 'empreftype/view/list',
                        initialId: typeof item?.reftypeid?.value === 'object' ? false : item?.reftypeid?.value,
                        showOptionLabel: 'description',
                        showOption: 'description',
                        searchParam: 'description',
                        gridProps: {xs: 12, sm: 6, md: 4},
                    },
                    {
                        type: formElementTypes.textField,
                        id: 'refname',
                        name: 'refname',
                        value: item?.refname?.value,
                        required: item?.refname?.required,
                        error: item?.refname?.isError,
                        label: t('str_fullName'),
                        helperText: item?.refname?.helperText,
                        gridProps: {xs: 12, sm: 6, md: 4},
                    },
                    {
                        type: formElementTypes.phoneInput,
                        id: 'tel',
                        name: 'tel',
                        value: item?.tel?.value,
                        required: item?.tel?.required,
                        error: item?.tel?.isError,
                        label: t('str_tel'),
                        helperText: item?.tel?.helperText,
                        gridProps: {xs: 12, sm: 6, md: 4}
                    },
                    {
                        type: formElementTypes.textField,
                        id: 'email',
                        name: 'email',
                        value: item?.email?.value,
                        required: item?.email?.required,
                        error: item?.email?.isError,
                        label: t('str_email'),
                        helperText: item?.email?.helperText,
                        gridProps: {xs: 12, sm: 6, md: 12},
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
                        gridProps: {xs: 12, sm: 6, md: 12},
                    },
                ]
            }
        )
    )


    const handleChangeTextField = (event, index, stateName) => {
        const name = event.target.name;
        const data = {...state[stateName][index]};
        data[name] = {
            ...state[stateName][index][name],
            value: event.target.value
        }
        setToState('employeePortal', [stateName, index], data)

    }

    const handleOnBlurTextField = (event, index, key, stateName) => {
        const name = key ? key : event.target.name;
        const data = {...state[stateName][index]}
        console.log(event.target.value)
        data[name] = {
            ...state[stateName][index][name],
            isError: state[stateName][index][name].required && (event.target.value ? event.target.value.length <= 0 : true),
            helperText: state[stateName][index][name].required && (event.target.value ? event.target.value.length <= 0 : true) && t('str_mandatory')
        }
        setToState('employeePortal', [stateName, index], data)
    }

    function handleAddWork() {
        let isError = false;
        if (!isError) {
            const data = [...state.empWorkData]
            data.push({
                company: {value: '', isError: false, required: true, helperText: ''},
                startdate: {value: '', isError: false, required: false, helperText: ''},
                enddate: {value: '', isError: false, required: false, helperText: ''},
                workpos: {value: '', isError: false, required: false, helperText: ''},
                worksalary: {value: '', isError: false, required: false, helperText: ''},
                leavereason: {value: '', isError: false, required: false, helperText: ''},
                workrefallowed: {value: '', isError: false, required: false, helperText: ''},
            });
            setToState('employeePortal', ['empWorkData'], data)
        }
    }

    function handleAddRef() {
        let isError = false;
        if (!isError) {
            const data = [...state.empRefData]
            data.push({
                reftypeid: {value: '', isError: false, required: true, helperText: ''},
                refname: {value: '', isError: false, required: false, helperText: ''},
                tel: {value: '', isError: false, required: false, helperText: ''},
                email: {value: '', isError: false, required: false, helperText: ''},
                note: {value: '', isError: false, required: false, helperText: ''},
            });
            setToState('employeePortal', ['empRefData'], data)
        }
    }


    function handleRemove(i) {
        const data = [...state.empAbilityData]
        data.splice(i, 1);
        setToState('employeePortal', ['empAbilityData'], data)
    }


    const handleChangeAutoComplete = (newValue, name, index, stateName) => {
        const data = {...state[stateName][index]}
        data[name] = {
            ...state[stateName][index][name],
            value: newValue,
            isError: state[stateName][index][name].required && (newValue ? newValue.length <= 0 : true),
            helperText: state[stateName][index][name].required && (newValue ? newValue.length <= 0 : true) && t('str_mandatory')
        }
        setToState('employeePortal', [stateName, index], data)
    }

    const handleChangeDatePicker = (newDate, name, index, statename) => {
        const data = {...state[statename][index]}
        data[name] = {
            ...state[statename][index][name],
            value: moment(newDate).format(OREST_ENDPOINT.DATEFORMAT),
        }
        setToState('employeePortal', [statename, index], data)
    }

    function handleAdd() {

    }


    function handleRemoveWork(i) {
        const data = [...state.empWorkData]
        data.splice(i, 1);
        setToState('employeePortal', ['empWorkData'], data)
    }

    function handleRemoveRef(i) {
        const data = [...state.empRefData]
        data.splice(i, 1);
        setToState('employeePortal', ['empRefData'], data)
    }

    const handleChangeNumberFormat = (event, statename) => {
        console.log(event [statename])

    }

    const handleChange = (event) => {
        if (event.target.value === 'Yes') {
            const data = [...state.empRefData]
            data.push({
                reftype: {value: '', isError: false, required: true, helperText: ''},
                refname: {value: '', isError: false, required: false, helperText: ''},
                tel: {value: '', isError: false, required: true, helperText: ''},
                email: {value: '', isError: false, required: true, helperText: ''},
                note: {value: '', isError: false, required: false, helperText: ''},
            });
            setToState('employeePortal', ['empRefData'], data)
        }
    };

    return (
        <React.Fragment>
            <Typography className={classes.title}>
                {t('str_workExperience')}
            </Typography>
            {workCardList.map((item, i) => (
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
                                                            onChange={e => handleChangeTextField(e, i, 'empWorkData')}
                                                            onBlur={e => handleOnBlurTextField(e, i, false, 'empWorkData')}
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
                                                                handleChangeAutoComplete(newValue, name, i, 'empWorkData')
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
                                                                        const data = {...state.empWorkData[i]}
                                                                        data[item2?.name].value = initialValue ? initialValue : state.empWorkData[item2?.name]
                                                                        setToState('employeePortal', ['empWorkData', i], data)
                                                                    }
                                                                } else {
                                                                    const data = {...state.empWorkData[i]}
                                                                    data[item2?.name].value = initialValue ? initialValue : state.empWorkData[item2?.name]
                                                                    setToState('employeePortal', ['empWorkData', i], data)
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
                                                            onBlur={(e) => handleOnBlurTextField(e, i, item2?.name, 'empWorkData')}
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
                                                            onValueChange={(values) => handleChangeNumberFormat(values, 'empWorkData')}
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
                                                    ) : item2?.type === formElementTypes.datePicker ? (
                                                        <CustomDatePicker
                                                            id={item2?.id}
                                                            name={item2?.name}
                                                            value={item2?.value}
                                                            label={item2?.label}
                                                            onChange={(newValue, name) => handleChangeDatePicker(newValue, name, i, 'empWorkData')}
                                                            onError={(e) => {
                                                                setempWorkData({
                                                                    ...empWorkData,
                                                                    [item2.name]: {
                                                                        ...empWorkData[item2.name],
                                                                        isError: !!e,
                                                                        helperText: 'invalidDate'
                                                                    }
                                                                })
                                                            }}
                                                            //disableFuture={item2?.disableFuture}
                                                            //disablePast={item2?.disablePast}
                                                            fullWidth
                                                        />
                                                    ) : null
                                                }
                                            </Grid>
                                        ))
                                    }
                                </Grid>
                                <Grid>
                                    <div>
                                        <Button style={{float: "right"}} onClick={() => handleRemoveWork(i)}>
                                            <Typography className={classes.deleteText}>
                                                <DeleteIcon
                                                    className={classes.deleteButton}/>{t("str_delete")}
                                            </Typography>
                                        </Button>
                                    </div>
                                </Grid>
                            </CardContent>
                        </Card>
                        {
                            i < workCardList.length - 1 && (
                                <div style={{paddingBottom: 48}}/>
                            )
                        }
                    </Grid>
                </Grid>
            ))}
            <Button onClick={handleAddWork}>
                <Typography className={classes.addText}>
                    <AddCircleIcon className={classes.addIcon}/>{t("str_addWorkExperience")}
                </Typography>
            </Button>
            <div style={{paddingTop: '24px'}}/>
            <Typography className={classes.title}>
                {t('str_reference')}
            </Typography>
            {refCardList.map((item, i) => (
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
                                                            onChange={e => handleChangeTextField(e, i, 'empRefData')}
                                                            onBlur={e => handleOnBlurTextField(e, i, false, 'empRefData')}
                                                            helperText={item2?.helperText}
                                                            fullWidth
                                                            variant={'outlined'}
                                                            color={'primary'}
                                                            inputProps={{
                                                                autoComplete: 'off',
                                                            }}
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
                                                            onValueChange={(values) => handleChangeNumberFormat(values, 'empRefData')}
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
                                                            onChange={(e)=> handleChangeAutoComplete(e, item2?.name, i, 'empRefData')}
                                                            error={item2?.isError}
                                                            helperText={item2?.helperText}
                                                            required={item2?.required}
                                                            //onBlur={() => getMobileTelExits(client.mobiletel.value)}
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
                                                                handleChangeAutoComplete(newValue, name, i, 'empRefData')
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
                                                                        const data = {...state.empRefData[i]}
                                                                        data[item2?.name].value = initialValue ? initialValue : state.empRefData[item2?.name]
                                                                        setToState('employeePortal', ['empRefData', i], data)
                                                                    }
                                                                } else {
                                                                    const data = {...state.empRefData[i]}
                                                                    data[item2?.name].value = initialValue ? initialValue : state.empRefData[item2?.name]
                                                                    setToState('employeePortal', ['empRefData', i], data)
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
                                                            onBlur={(e) => handleOnBlurTextField(e, i, item2?.name, 'empRefData')}
                                                        />
                                                    ) : null
                                                }
                                            </Grid>
                                        ))
                                    }
                                </Grid>
                                <Grid>
                                    <div>
                                        <Button style={{float: "right"}} onClick={() => handleRemoveRef(i)}>
                                            <Typography className={classes.deleteText}>
                                                <DeleteIcon
                                                    className={classes.deleteButton}/>{t("str_delete")}
                                            </Typography>
                                        </Button>
                                    </div>
                                </Grid>
                                <Grid style={{paddingBottom: "40px"}}/>
                            </CardContent>
                        </Card>
                        {
                            i < refCardList.length - 1 && (
                                <div style={{paddingBottom: 48}}/>
                            )
                        }
                    </Grid>
                </Grid>
            ))}
            <Button onClick={handleAddRef}>
                <Typography className={classes.addText}>
                    <AddCircleIcon className={classes.addIcon}/>{t("str_reference")}
                </Typography>
            </Button>
            <div style={{paddingTop: '24px'}}/>
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

export default connect(mapStateToProps, mapDispatchToProps)(WorkStep)