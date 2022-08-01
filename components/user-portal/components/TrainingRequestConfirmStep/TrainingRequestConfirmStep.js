import React, {useContext, useEffect, useState} from 'react';
import useTranslation from '../../../../lib/translations/hooks/useTranslation';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import styles from '../style/TrainingRequestConfirmStep.Style';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import {deleteFromState, pushToState, setToState, updateState} from '../../../../state/actions';
import {connect, useSelector} from 'react-redux';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import {List} from '@webcms/orest';
import {
    DEFAULT_OREST_TOKEN,
    isErrorMsg,
    OREST_ENDPOINT,
    OREST_FULL
} from '../../../../model/orest/constants';
import {SLASH} from '../../../../model/globals';
import WebCmsGlobal from '../../../webcms-global';
import axios from 'axios';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import CustomRadioButton from '../CustomRadioButton/CustomRadioButton';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import useNotifications from 'model/notification/useNotifications';
import LoadingSpinner from "../../../LoadingSpinner";

const useStyles = makeStyles(styles);

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
    anchorOrigin: {
        vertical: "bottom",
        horizontal: "left"
    },
    transformOrigin: {
        vertical: "top",
        horizontal: "left"
    },
    getContentAnchorEl: null
};


function TrainingRequestConfirmStep(props){
    const classes = useStyles();
    
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal);
    const { t } = useTranslation();
    const { showError } = useNotifications();
    
    const { state, setToState } = props;
    const token = useSelector((state) =>
        state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN
    );
    const hotelRefNo = useSelector(state =>
        state.hotelinfo.currentHotelRefNo !== null ? state.hotelinfo.currentHotelRefNo : null);
    const hotelName = useSelector(state =>
        state.hotelinfo.currentHotelName !== null ? state.hotelinfo.currentHotelName : null);
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo);
    const [filterEmpHotelList, setFilterEmpHotelList] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [loading, setLoading] = useState(false);
    const [moduleListLoading, setModuleListLoading] = useState(false);
    
    const types = {
        remote: t("str_remote"),
        onsite: t("str_onSite")
    }
    
    const handleConfirmCheckBox = (event) => {
        setToState('userPortal', ['newRequestStepper', 'confirmTermsAndCondition',], event.target.checked)
    }
    
    const handleRadioButtonChange = (event) => {
        setToState("userPortal", ["newRequestStepper", "trainingType"], event.target.value)
    }
    
    const handleChange = (event) => {
        setToState("userPortal", ["newRequestStepper", "selectedModules"], event.target.value)
    };

    const handleFindHotel = (event, inputValue, reason) => {
        setSearchName(inputValue);
        if(reason !== "reset" && inputValue !== "") {
            setLoading(true);
            List({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.TOOLS + SLASH + OREST_ENDPOINT.USER + SLASH + OREST_ENDPOINT.HOTEL,
                token,
                params: {
                    empid:loginfo.id,
                    hotelname:`${inputValue.toUpperCase()}`,
                    start: 0,
                    limit: 25,
                },
            }).then((r) => {
                if(r.status === 200) {
                    setFilterEmpHotelList(r.data.data);
                    setLoading(false);
                } else {
                    const retErr = isErrorMsg(r)
                    showError(retErr.errorMsg)
                }
            })
        }
    }


    
    useEffect(() => {
        if(filterEmpHotelList.length <= 0) {
            setFilterEmpHotelList(state.newRequestStepper.empHotelList);
        }
        if(state.newRequestStepper.empHotelList <= 0) {
            setLoading(true);
            List({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.TOOLS + SLASH + OREST_ENDPOINT.USER + SLASH + OREST_ENDPOINT.HOTEL,
                token,
                params: {
                    empid: loginfo.id,
                    start: 0,
                    limit: 25,
                },
            }).then((r) => {
                if(r.status === 200) {
                    setToState('userPortal', ['newRequestStepper', 'empHotelList'], r.data.data);
                    setFilterEmpHotelList(r.data.data);
                    setLoading(false);
                } else {
                    const retErr = isErrorMsg(r)
                    showError(retErr.errorMsg)
                }
            })
            if(hotelRefNo) {
                List({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.TOOLS + SLASH + OREST_ENDPOINT.USER + SLASH + OREST_ENDPOINT.HOTEL,
                    token,
                    params: {
                        empid: loginfo.id,
                        hotelid: hotelRefNo
                    },
                }).then((r) => {
                    if(r.status === 200) {
                        setToState("userPortal", ["newRequestStepper", "selectedHotelInfo"], r.data.data[0]);
                        setLoading(false);
                    } else {
                        const retErr = isErrorMsg(r)
                        showError(retErr.errorMsg);
                        setLoading(false);
                    }
                })
            }
        }
        if(state.defMyRequest?.note && !state.newRequestStepper?.loadedModuleList) {
            const note = JSON.parse(state.defMyRequest?.note)
            setToState(
                "userPortal",
                ["newRequestStepper"],
                {
                    ...state.newRequestStepper,
                    selectedModules: note.moduleList,
                    loadedModuleList: true,
                    trainingType: note.trainingType,
                    confirmTermsAndCondition: true,
                    selectedHotelRefNo: hotelRefNo,
                    selectedHotelName: hotelName
                }
            )
        } else {
            setToState("userPortal", ["newRequestStepper", "selectedHotelRefNo"], hotelRefNo);
            setToState("userPortal", ["newRequestStepper", "selectedHotelName"], hotelName);
            setToState("userPortal", ["newRequestStepper", "trainingType"], types.remote);
        }
    },[])
    
    useEffect(() => {
        if(state.newRequestStepper.isTrainingModulesSelected) {
            const newSelecteds = state.newRequestStepper.trainingModules.map((d) => d.localdesc)
            setToState("userPortal", ["newRequestStepper", "selectedModules"], newSelecteds)
        } else if(state.newRequestStepper.isTrainingModulesSelected === null){
            setToState("userPortal", ["newRequestStepper", "selectedModules"], [])
        } else {
            if(state.newRequestStepper.trainingModules.length > 0 &&
                state.newRequestStepper.selectedModules.length === state.newRequestStepper.trainingModules.length
            ) {
                setToState("userPortal", ["newRequestStepper", "isTrainingModulesSelected"], true);
            } else {
                setToState("userPortal", ["newRequestStepper", "isTrainingModulesSelected"], false);
            }
        }
    },[state.newRequestStepper.selectedModules.length])
    
    useEffect(() => {
        if(state.newRequestStepper.selectedHotelRefNo && state.newRequestStepper.selectedHotelRefNo !== "") {
            setModuleListLoading(true);
            const hotelInfoRequestOptions = {
                url: `${GENERAL_SETTINGS.OREST_URL}${SLASH}${OREST_ENDPOINT.INFO}${SLASH}${OREST_ENDPOINT.HOTEL}`,
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                params: {
                    keyval: state.newRequestStepper.selectedHotelRefNo
                }
            }
            axios(hotelInfoRequestOptions).then(res => {
                if(res.status === 200) {
                    List({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: `${OREST_ENDPOINT.HOTEL}/tslocation`,
                        token,
                        params: {
                            gid: res.data.data.hotelgidstr,
                            onlydur: true
                        }
                    }).then(r1 => {
                        if(r1.status === 200) {
                            setModuleListLoading(false);
                            setToState('userPortal', ['newRequestStepper', 'trainingModules'], r1.data.data )
                        } else {
                            setModuleListLoading(false);
                            const retErr = isErrorMsg(r1)
                            showError(retErr.errorMsg)
                        }
                    }).catch(err => {
                        const retErr = isErrorMsg(err)
                        showError(retErr.errorMsg)
                    })
                } else {
                    setModuleListLoading(false);
                    const retErr = isErrorMsg(res)
                    showError(retErr.errorMsg)
                }
            }).catch(err => {
                const retErr = isErrorMsg(err)
                showError(retErr.errorMsg)
            })
        }

    }, [state.newRequestStepper.selectedHotelRefNo])


    return(
            <Grid container>
                <Grid item xs={12}>
                    <Typography className={classes.title}>{t("str_hotel") + "*"}</Typography>
                    <FormControl
                        className={state.newRequestStepper.empHotelList.length > 1 ? classes.formControl : ""}
                        fullWidth
                    >
                        <Autocomplete
                            loading={loading}
                            disabled={state.newRequestStepper.empHotelList.length <= 1}
                            loadingText={t("str_loading")}
                            noOptionsText={t("str_notFound")}
                            value={state.newRequestStepper.selectedHotelInfo}
                            onChange={(event, newValue) => {
                                if(newValue !== null) {
                                    setToState("userPortal", ["newRequestStepper", "selectedHotelInfo"], newValue);
                                    setToState("userPortal", ["newRequestStepper", "selectedHotelRefNo"], newValue.hotelrefno);
                                    setToState("userPortal", ["newRequestStepper", "selectedHotelName"], newValue.hotelname);
                                    setToState('userPortal', ['newRequestStepper', 'selectedModules'], []);
                                    setToState('userPortal', ['newRequestStepper', 'isTrainingModulesSelected'], null);

                                } else {
                                    setToState("userPortal", ["newRequestStepper", "selectedHotelInfo"], null);
                                    setToState("userPortal", ["newRequestStepper", "selectedHotelRefNo"], "");
                                    setToState("userPortal", ["newRequestStepper", "selectedHotelName"], "");
                                    setToState('userPortal', ['newRequestStepper', 'selectedModules'], []);
                                    setToState('userPortal', ['newRequestStepper', 'isTrainingModulesSelected'], null);
                                }
                            }}
                            inputValue={searchName}
                            onInputChange={(event, newInputValue, reason) => {handleFindHotel(event, newInputValue, reason)}}
                            options={filterEmpHotelList}
                            filterOptions={(options, params) => options}
                            getOptionSelected={(option, value) => option.hotelname === value.hotelname}
                            getOptionLabel={(option) => {
                                if (typeof option === 'string') {
                                    return option;
                                }
                                if (option.inputValue) {
                                    return option.inputValue;
                                }
                                return option.hotelname;
                            }}
                            renderInput={(params) => (
                                <TextField
                                    classes={{root:state.newRequestStepper.empHotelList.length > 1 ? classes.textFieldStyle : ""}}
                                    {...params}
                                    fullWidth={true}
                                    required
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <React.Fragment>
                                                {loading ? <LoadingSpinner size={18} /> : null}
                                                {params.InputProps.endAdornment}
                                            </React.Fragment>
                                        ),
                                    }}
                                    InputLabelProps={{shrink: false}}
                                    variant="outlined"
                                />
                            )}
                        />
                    </FormControl>
                    <div style={{paddingTop:"28px"}}/>
                </Grid>
                <Grid item xs={12}>
                    <Typography className={classes.title}>{t("str_modules") + "*"}</Typography>
                    <FormControl className={classes.formControl} variant="outlined">
                        <Select
                            labelId="demo-mutiple-chip-label"
                            id="demo-mutiple-chip"
                            multiple
                            value={state.newRequestStepper.selectedModules || null}
                            onChange={handleChange}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="start">
                                        {moduleListLoading ? <LoadingSpinner size={18} /> : null}
                                    </InputAdornment>
                                ),
                            }}
                            renderValue={(selected) => (
                                <div className={classes.chips}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={value} className={classes.chip} />
                                    ))}
                                </div>
                            )}
                            MenuProps={MenuProps}
                        >
                            {
                                state.newRequestStepper.trainingModules.length > 0 ?
                                    <MenuItem className={classes.menuItem}
                                              onClick={() => state.newRequestStepper.isTrainingModulesSelected ?
                                                  setToState("userPortal", ["newRequestStepper", "isTrainingModulesSelected"], null) :
                                                  setToState("userPortal", ["newRequestStepper", "isTrainingModulesSelected"], true)
                                              }
                                    >
                                        <Checkbox style={{color:"#4666B0"}} checked={state.newRequestStepper.trainingModules.length > 0 && state.newRequestStepper.selectedModules.length === state.newRequestStepper.trainingModules.length}/>
                                        <ListItemText primary={t("str_selectAll")} />
                                    </MenuItem>
                                    :
                                    <MenuItem className={classes.menuItem} >
                                        <ListItemText primary={t("str_notFound")} />
                                    </MenuItem>
                            }
                            {state.newRequestStepper.trainingModules.map((data) => (
                                <MenuItem
                                    className={classes.menuItem}
                                    key={data.id}
                                    value={data.localdesc}
                                    onClick={() => state.newRequestStepper.isTrainingModulesSelected || state.newRequestStepper.isTrainingModulesSelected === null ?
                                        setToState("userPortal", ["newRequestStepper", "isTrainingModulesSelected"], false) : ""}
                                >
                                    <Checkbox style={{color:"#4666B0"}} checked={state.newRequestStepper.selectedModules.indexOf(data.localdesc) > -1} />
                                    <ListItemText primary={data.localdesc} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <div style={{padding:"42px 0 16px 0 "}}>
                        <RadioGroup
                            value={state.newRequestStepper.trainingType}
                            onChange={handleRadioButtonChange}
                            row
                        >
                            <FormControlLabel
                                value={types.remote}
                                control={<CustomRadioButton />}
                                label={t('str_remote')}
                            />
                            <div style={{paddingLeft:"40px"}}/>
                            <FormControlLabel
                                value={types.onsite}
                                control={<CustomRadioButton />}
                                label={t('str_onSite')}
                            />
                        </RadioGroup>
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <Typography className={classes.title}>{t("str_termsAndConditions")}</Typography>
                    <div className={classes.textAreaStyle}>
                        {
                            state.newRequestStepper.trainingType === types.remote ?(
                                    <div>
                                        <Typography style={{paddingBottom:"8px"}}>{t("str_trainingRemoteTerms1")}</Typography>
                                        <Typography style={{paddingBottom:"8px"}}>{t("str_trainingRemoteTerms2")}</Typography>
                                    </div>
                                )
                                :
                                (
                                    <div>
                                        <Typography style={{paddingBottom:"8px",fontWeight:"bold"}}>{t("str_trainingOnsiteTerms1")}</Typography>
                                        <Typography style={{paddingBottom:"8px"}}>{t("str_trainingOnsiteTerms2")}</Typography>
                                        <Typography style={{paddingBottom:"8px"}}>{t("str_trainingOnsiteTerms3")}</Typography>
                                        <Typography style={{paddingBottom:"8px"}}>{t("str_trainingOnsiteTerms4")}</Typography>
                                        <Typography style={{paddingBottom:"8px"}}>{t("str_trainingOnsiteTerms5")}</Typography>
                                        <Typography style={{paddingBottom:"8px"}}>{t("str_trainingOnsiteTerms6")}</Typography>
                                        <Typography style={{paddingBottom:"8px"}}>{t("str_trainingOnsiteTerms7")}</Typography>
                                    </div>
                                )
                        }
                    </div>
                    <div style={{paddingTop:"24px"}}/>
                    <div style={{display:"flex"}}>
                        <FormControl className={classes.checkBoxDesc}>
                            <FormControlLabel
                                checked={state.newRequestStepper.confirmTermsAndCondition}
                                onChange={handleConfirmCheckBox}
                                control={<Checkbox className={classes.checkBoxStyle} />}
                                label={<span className={classes.checkBoxDesc}>{t('str_checkBoxDescription')}</span>}
                            />
                        </FormControl>
                    </div>
                </Grid>
            </Grid>
    );
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.userPortal,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    pushToState: (stateType, stateName, value) => dispatch(pushToState(stateType, stateName, value)),
    deleteFromState: (stateType, stateName, value) => dispatch(deleteFromState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(TrainingRequestConfirmStep)