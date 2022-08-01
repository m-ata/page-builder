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
import {formatMoney, RAFILE_CODE} from "../../../../model/orest/constants";
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
        paddingTop: '30px',
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
    const [empAbilityData, setempAbilityData] = useState({
        ability: {value: '', isError: false, required: true, helperText: ''},
        abilitylevel: {value: '', isError: false, required: false, helperText: ''},
        abilityid: {value: '', isError: false, required: true, helperText: ''},
        description: {value: false, isError: false, required: true, helperText: ''},
    })
    const [empLangData, setempLangData] = useState({
        langcode: {value: '', isError: false, required: true, helperText: ''},
        verbalevel: {value: '', isError: false, required: false, helperText: ''},
        writenlevel: {value: '', isError: false, required: true, helperText: ''},
        speaklevel: {value: false, isError: false, required: true, helperText: ''},
        readlevel: {value: '', isError: false, required: false, helperText: ''},
    })

    const formElementTypes = {
        textField: 'textField',
        autoComplete: 'autoComplete',
        selectAutoComplete: 'selectAutoComplete',
        phoneInput: 'phoneInput',
        datePicker: 'datePicker',
        numberFormat: 'numberFormat'
    }

    const abilityCardList = state?.empAbilityData?.map((item) => (
            {
                title: t('str_abilities'),
                formElements: [
                    {
                        type: formElementTypes.autoComplete,
                        id: 'abilityid',
                        name: 'abilityid',
                        value: item?.abilityid?.value,
                        required: item?.abilityid?.required,
                        error: item?.abilityid?.isError,
                        label: t('str_abilities'),
                        helperText: item?.abilityid?.helperText,
                        endpoint: 'ability/view/list',
                        initialId: typeof item?.abilityid?.value === 'object' ? false : item?.abilityid?.value,
                        showOptionLabel: 'code',
                        showOption: 'code',
                        gridProps: {xs: 12, sm: 6, md: 3},
                    },
                    {
                        type: formElementTypes.textField,
                        id: 'abilitylevel',
                        name: 'abilitylevel',
                        value: item?.abilitylevel?.value,
                        required: item?.abilitylevel?.required,
                        error: item?.abilitylevel?.isError,
                        label: t('str_level'),
                        helperText: item?.abilitylevel?.helperText,
                        gridProps: {xs: 12, sm: 6, md: 3},
                    },
                    {
                        type: formElementTypes.textField,
                        id: 'description',
                        name: 'description',
                        value: item?.description?.value,
                        required: item?.description?.required,
                        error: item?.description?.isError,
                        label: t('str_description'),
                        helperText: item?.description?.helperText,
                        gridProps: {xs: 12, sm: 6, md: 3},
                    },
                ]
            }
        )
    )

    const langCardList = state?.empLangData?.map((item) => (
            {
                title: t('str_languages'),
                formElements: [
                    {
                        type: formElementTypes.autoComplete,
                        id: 'langid',
                        name: 'langid',
                        value: item?.langid?.value,
                        required: item?.langid?.required,
                        error: item?.langid?.isError,
                        label: t('str_language'),
                        helperText: item?.langid?.helperText,
                        endpoint: 'ralang/view/list',
                        initialId: typeof item?.langid?.value === 'object' ? false : item?.langid?.value,
                        showOptionLabel: 'description',
                        showOption: 'description',
                        gridProps: {xs: 12, sm: 6, md: 3},
                   },
                    {
                        type: formElementTypes.textField,
                        id: 'verbalevel',
                        name: 'verbalevel',
                        value: item?.verbalevel?.value,
                        required: item?.verbalevel?.required,
                        error: item?.verbalevel?.isError,
                        label: t('str_verbalLevel'),
                        helperText: item?.verbalevel?.helperText,
                        gridProps: {xs: 12, sm: 6, md: 3},
                    },
                    {
                        type: formElementTypes.textField,
                        id: 'writenlevel',
                        name: 'writenlevel',
                        value: item?.writenlevel?.value,
                        required: item?.writenlevel?.required,
                        error: item?.writenlevel?.isError,
                        label: t('str_writingLevel'),
                        helperText: item?.writenlevel?.helperText,
                        gridProps: {xs: 12, sm: 6, md: 3},
                    },
                    {
                        type: formElementTypes.textField,
                        id: 'readlevel',
                        name: 'readlevel',
                        value: item?.readlevel?.value,
                        required: item?.readlevel?.required,
                        error: item?.readlevel?.isError,
                        label: t('str_readingLevel'),
                        helperText: item?.readlevel?.helperText,
                        gridProps: {xs: 12, sm: 6, md: 3},
                    },
                    {
                        type: formElementTypes.textField,
                        id: 'description',
                        name: 'description',
                        value: item?.description?.value,
                        required: item?.description?.required,
                        error: item?.description?.isError,
                        label: t('str_description'),
                        helperText: item?.description?.helperText,
                        gridProps: {xs: 12, sm: 6, md: 3},
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



    const handleOnBlurAutoComplete = (event, name) => {
        setempAbilityData({
            ...empAbilityData,
            [name]: {
                ...empAbilityData[name],
                isError: empAbilityData[name].required && (event?.target?.value ? event.target.value.length <= 0 : true),
                helperText: empAbilityData[name].required && (event?.target?.value?.length <= 0) && t('str_mandatory')
            }
        })
    }


    function handleAddAbility() {
        let isError = false;
        if (!isError) {
            const data = [...state.empAbilityData]
            data.push({
                abilityid: {value: '', isError: false, required: true, helperText: ''},
                abilitylevel: {value: '', isError: false, required: false, helperText: ''},
                edudesc: {value: '', isError: false, required: false, helperText: ''},
                description: {value: '', isError: false, required: false, helperText: ''},
            });
            setToState('employeePortal', ['empAbilityData'], data)
        }
    }
    function handleAddLang() {
        let isError = false;
        if (!isError) {
            const data = [...state.empLangData]
            data.push({
                langid: {value: '', isError: false, required: true, helperText: ''},
                verbalevel  : {value: '', isError: false, required: false, helperText: ''},
                writenlevel: {value: '', isError: false, required: false, helperText: ''},
                readlevel: {value: '', isError: false, required: false, helperText: ''},
                description: {value: '', isError: false, required: false, helperText: ''},
            });
            setToState('employeePortal', ['empLangData'], data)
        }
    }

    function handleRemoveAbility(i) {
        const data = [...state.empAbilityData]
        data.splice(i, 1);
        setToState('employeePortal', ['empAbilityData'], data)
    }

    function handleRemoveLang(i) {
        const data = [...state.empLangData]
        data.splice(i, 1);
        setToState('employeePortal', ['empLangData'], data)
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


    const handlOnBlurAutoComplete = (event, name) => {
        seteempLangData({
            ...empLangData,
            [name]: {
                ...empLangData[name],
                isError: empLangData[name].required && (event?.target?.value ? event.target.value.length <= 0 : true),
                helperText: empLangData[name].required && (event?.target?.value?.length <= 0) && t('str_mandatory')
            }
        })
    }



    function handlAdd() {
        let isError = false;
        state.empLangData.map((data,i) => {
            if(data.langcode === "" || data.verbalevel === "") {
                showError(t('str_errorFirstNameOrLastName'))
                isError = true;
            }
        })
        if (!isError) {
            const data = [...state.empLangData]
            data.push({
                langcode: {value: '', isError: false, required: true, helperText: ''},
                verbalevel  : {value: '', isError: false, required: true, helperText: ''},
                writenlevel: {value: '', isError: false, required: true, helperText: ''},
                readlevel: {value: '', isError: false, required: true, helperText: ''},
                description: {value: '', isError: false, required: false, helperText: ''},
            });
            setToState('employeePortal', ['empLangData'], data)
        }
    }


    function handlRemove(i) {
        const data = [...state.empLangData]
        data.splice(i, 1);
        setToState('employeePortal', ['empLangData'], data)
    }

    const handlChangeNumberFormat = (event) => {
        console.log(event)
    }

    return (
        <React.Fragment>
            <Typography className={classes.title}>
                {t('str_abilities')}
            </Typography>
            {abilityCardList.map((item, i) => (
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
                                                            onChange={e => handleChangeTextField(e, i, 'empAbilityData')}
                                                            onBlur={e => handleOnBlurTextField(e, i, false, 'empAbilityData')}
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
                                                                handleChangeAutoComplete(newValue, name, i, 'empAbilityData')
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
                                                                        const data = {...state.empAbilityData[i]}
                                                                        data[item2?.name].value = initialValue ? initialValue : state.empAbilityData[item2?.name]
                                                                        setToState('employeePortal', ['empAbilityData', i], data)
                                                                    }
                                                                } else {
                                                                    const data = {...state.empAbilityData[i]}
                                                                    data[item2?.name].value = initialValue ? initialValue : state.empAbilityData[item2?.name]
                                                                    setToState('employeePortal', ['empAbilityData', i], data)
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
                                                            onBlur={(e) => handleOnBlurTextField(e, i, item2?.name, 'empAbilityData')}
                                                        />
                                                    ) :  null
                                                }
                                            </Grid>
                                        ))
                                    }
                                </Grid>
                                <Grid>
                                    <div>
                                        <Button style={{float: "right"}} onClick={() => handleRemoveAbility(i, empAbilityData)}>
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
                            i < abilityCardList.length - 1 && (
                                <div style={{paddingBottom: 48}}/>
                            )
                        }
                    </Grid>
                </Grid>
            ))}
            <Button onClick={handleAddAbility}>
                <Typography className={classes.addText}>
                    <AddCircleIcon className={classes.addIcon}/>{t("str_addAbilities")}
                </Typography>
            </Button>
            <div style={{paddingTop: '24px'}}/>
            <Typography className={classes.title}>
                {t('str_languages')}
            </Typography>
            {langCardList.map((item, i) => (
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
                                                            onChange={e => handleChangeTextField(e, i, 'empLangData')}
                                                            onBlur={e => handleOnBlurTextField(e, i, false, 'empLangData')}
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
                                                                handleChangeAutoComplete(newValue, name, i, 'empLangData')
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
                                                                        const data = {...state.empLangData[i]}
                                                                        data[item2?.name].value = initialValue ? initialValue : state.empLangData[item2?.name]
                                                                        setToState('employeePortal', ['empLangData', i], data)
                                                                    }
                                                                } else {
                                                                    const data = {...state.empLangData[i]}
                                                                    data[item2?.name].value = initialValue ? initialValue : state.empLangData[item2?.name]
                                                                    setToState('employeePortal', ['empLangData', i], data)
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
                                                            onBlur={(e) => handleOnBlurTextField(e, i, item2?.name, 'empLangData')}
                                                        />
                                                    ) :  null
                                                }
                                            </Grid>
                                        ))
                                    }
                                </Grid>
                                <Grid>
                                    <div>
                                        <Button style={{float: "right"}} onClick={() => handleRemoveLang(i, empLangData)}>
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
                            i < langCardList.length - 1 && (
                                <div style={{paddingBottom: 48}}/>
                            )
                        }
                    </Grid>
                </Grid>
            ))}
            <Button onClick={handleAddLang}>
                <Typography className={classes.addText}>
                    <AddCircleIcon className={classes.addIcon}/>{t("str_addLanguage")}
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