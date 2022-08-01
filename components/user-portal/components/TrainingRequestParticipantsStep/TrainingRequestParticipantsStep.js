import React, {useContext, useEffect, useState, useRef} from 'react';
import {deleteFromState, pushToState, setToState, updateState} from '../../../../state/actions';
import axios from 'axios';
import {connect, useSelector} from 'react-redux';
import styles from '../style/TrainingRequestParticipantsStep.Style';
import {DEFAULT_OREST_TOKEN, isErrorMsg, OREST_ENDPOINT, REQUEST_METHOD_CONST} from '../../../../model/orest/constants';
import WebCmsGlobal from '../../../webcms-global';
import useNotifications from '../../../../model/notification/useNotifications';
import useTranslation from '../../../../lib/translations/hooks/useTranslation';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import FormControl from '@material-ui/core/FormControl';
import InputAdornment from '@material-ui/core/InputAdornment';
import Grid from '@material-ui/core/Grid'
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Paper from '@material-ui/core/Paper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import {SLASH} from '../../../../model/globals';
import {Insert, UseOrest, ViewList} from "@webcms/orest";
import {ListItem} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import DataFormDialog from "../../../DataFormDialog";
import {required} from "../../../../state/utils/form";
import renderFormElements, {ELEMENT_TYPES} from "../../../render-form-elements";
import CustomAutoComplete from "../../../CustomAutoComplete/CustomAutoComplete";
import {useSnackbar} from "notistack";
import TrackedChangesDialog from "../../../TrackedChangesDialog";

const useStyles = makeStyles(styles);


function TrainingRequestParticipantsStep(props){
    const classes = useStyles();
    
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal);
    const { showError } = useNotifications()
    const { t } = useTranslation();

    const { enqueueSnackbar } = useSnackbar()
    
    const { state, setToState } = props;
    const token = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false);
    const hotelRefNo = useSelector(state => state?.hotelinfo?.currentHotelRefNo || false);

    const [selectedRow, setSelectedRow] = useState(-1);
    const [departmentList, setDepartmentList] = useState([]);
    const [filterEmployeeList, setFilterEmployeeList] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [reason, setReason] = useState(null);

    const initialPositionState = {
        description: {value: '', isRequired: true, isError: false, helperText: false}
    }
    const [openPositionAdd, setOpenPositionAdd] = useState(false)
    const [positionData, setPositionData] = useState(initialPositionState)
    const [positionDataBase, setPositionDataBase] = useState(initialPositionState)
    const [isSavingPosition, setIsSavingPosition] = useState(false)
    const [openTrackedDialog, setOpenTrackedDialog] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)

    
    const tableTitles = [
        t("str_firstName") + "*",
        t("str_lastName") + "*",
        t("str_department"),
        t("str_position"),
        t("str_email"),
        t("str_phone"),
        t("str_empId")
    ]

    const formElements = [
        {
            type: ELEMENT_TYPES.textField,
            id: 'description',
            name: 'description',
            value: positionData.description.value,
            error: positionData.description.isError,
            required: positionData.description.isRequired,
            onChange: (e) => handleChangeFormElements(e, false, false),
            onBlur: (e) => handleChangeFormElements(e, false, true),
            disabled: isSavingPosition,
            label: t('str_description'),
            variant: 'outlined',
            fullWidth: true,
            helperText: positionData.description.helperText,
            gridProps: {xs: 12}
        }
    ]
    
    function handleSelectRow(i) {
        if(selectedRow !== undefined) {
            setSelectedRow(i);
        }
    }
    
    function handleChange(i, event, key) {
        const name = key ? key : event.target.name
        const value = event?.target ? event.target.value : event
        const partList = [...state.newRequestStepper.participantList];
        partList[i][name] = value;
        setToState("userPortal", ["newRequestStepper", "participantList"], partList)
    }

    
    function handleAdd() {
        let isError = false;
        state.newRequestStepper.participantList.map((data,i) => {
            if(data.firstName === "" || data.lastName === "") {
                showError(t('str_errorFirstNameOrLastName'))
                isError = true;
            }
        })
        if(!isError) {
            const values = [...state.newRequestStepper.participantList];
            values.push({
                firstName: "",
                lastName: "",
                department: "",
                positionId: "",
                position: "",
                email: "",
                telephone: "",
                isDatabaseInfo: false
            });
            setToState("userPortal", ["newRequestStepper", "participantList"], values)
        }
       
    }
    
    
    function handleRemove(i) {
        const values = [...state.newRequestStepper.participantList];
        values.splice(i,1);
        setToState("userPortal", ["newRequestStepper", "participantList"], values)
    }

    
    function selectEmployee(newValue) {
        const values = [...state.newRequestStepper.participantList];
        if(values.length === 0) {
            values.push({
                firstName: newValue.firstname || undefined,
                lastName: newValue.lastname || undefined,
                department: newValue.empdepid || undefined,
                positionId: newValue.empposid || undefined,
                position: newValue.empposcode || undefined,
                email: newValue.email || undefined,
                telephone: newValue.mobiletel || undefined,
                isDatabaseInfo: true,
                empId:newValue.id,
            });
        } else {
            if(values.length === 1 && values[0].firstName === "") {
                values[0] = {
                    firstName: newValue.firstname || undefined,
                    lastName: newValue.lastname || undefined,
                    department: newValue.empdepid || undefined,
                    positionId: newValue.empposid || undefined,
                    position: newValue.empposcode || undefined,
                    email: newValue.email || undefined,
                    telephone: newValue.mobiletel || undefined,
                    isDatabaseInfo: true,
                    empId:newValue.id || undefined,
                }
            } else {
                if(values[state.newRequestStepper.participantList.length - 1].firstName === "") {
                    values[state.newRequestStepper.participantList.length - 1] = {
                        firstName: newValue.firstname || undefined,
                        lastName: newValue.lastname || undefined,
                        department: newValue.empdepid || undefined,
                        positionId: newValue.empposid || undefined,
                        position: newValue.empposcode || undefined,
                        email: newValue.email || undefined,
                        telephone: newValue.mobiletel || undefined,
                        isDatabaseInfo: true,
                        empId:newValue.id || undefined,
                    }
                } else {
                    values.push({
                        firstName: newValue.firstname || undefined,
                        lastName: newValue.lastname || undefined,
                        department: newValue.empdepid || undefined,
                        positionId: newValue.empposid || undefined,
                        position: newValue.empposcode || undefined,
                        email: newValue.email || undefined,
                        telephone: newValue.mobiletel || undefined,
                        isDatabaseInfo: true,
                        empId:newValue.id || undefined,
                    });
                }
        
            }
        }
        
       
        setToState("userPortal", ["newRequestStepper", "participantList"], values)
    }


    const handleFindEmployee = (event, inputValue, reason) => {
        if(inputValue === "") {
            setFilterEmployeeList(state.newRequestStepper.employeeList)
        }
        setSearchName(inputValue);
        setReason(reason);
    }

    useEffect(() => {
        if(reason && reason !== "reset" && searchName !== "") {
            const timer = setTimeout(() => {
                axios({
                    url: GENERAL_SETTINGS.OREST_URL + SLASH + OREST_ENDPOINT.EMPLOYEE + SLASH + OREST_ENDPOINT.WORKLIST,
                    method: REQUEST_METHOD_CONST.GET,
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        hotelrefno: state.newRequestStepper.selectedHotelRefNo,
                        text: searchName.toUpperCase(),
                        field: "firstname,lastname,empdepartcode,empposcode",
                        limit: 25
                    }
                }).then(res => {
                    if(res.status === 200) {
                        setFilterEmployeeList(res.data.data);
                        setIsLoading(false);
                    } else {
                        const retErr = isErrorMsg(res)
                        showError(retErr.errorMsg)
                        setIsLoading(false);
                    }
                })
            }, 700)
            return () => clearTimeout(timer);
        }

    }, [searchName])
    
    useEffect(() => {
        setIsLoading(true);
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.EMPLOYEE + SLASH + OREST_ENDPOINT.WORKLIST,
            params: {
                hotelrefno: state.newRequestStepper.selectedHotelRefNo,
                start: 0,
                limit: 25
            },
            token,
        }).then(res => {
            if(res.status === 200) {
                setToState("userPortal", ["newRequestStepper", "employeeList"], res.data.data)
                setFilterEmployeeList(res.data.data);
                setIsLoading(false);
            } else {
                const retErr = isErrorMsg(res)
                showError(retErr.errorMsg)
                setIsLoading(false);
            }
        })
    },[])
    
    useEffect(() => {
        const options = {
            url: GENERAL_SETTINGS.OREST_URL + SLASH +
                OREST_ENDPOINT.EMPLOYEE + SLASH +
                OREST_ENDPOINT.WORKLIST + SLASH +
                OREST_ENDPOINT.DEP,
            method: REQUEST_METHOD_CONST.GET,
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                hotelrefno: state.newRequestStepper.selectedHotelRefNo,
                query: `hotelrefno:${state.newRequestStepper.selectedHotelRefNo}`
            }
        }
        axios(options).then(res => {
            if(res.status === 200) {
                setDepartmentList(res.data.data);
            } else {
                const retErr = isErrorMsg(res)
                showError(retErr.errorMsg)
            }
        })
        
    },[])

    useEffect(() => {
        if(state.defMyRequest?.transno && !state.newRequestStepper?.participantListLoaded) {
            const partList = []
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.TASKSUB,
                token,
                params: {
                    query: `transno:${state.defMyRequest.transno},isdone:false,worktypeid:${112}`
                }
            }).then(async res => {
                if(res.data.count > 0) {
                    for (let i = 0; i < res.data.count; i++) {
                        const empData = await getEmployeeFromSubTask(res.data.data[i].empid)
                        if(empData) partList.push(empData)
                    }
                    setToState('userPortal', ['newRequestStepper', 'participantList'], partList)
                    setToState('userPortal', ['newRequestStepper', 'participantListLoaded'], true)
                }
            })
        }
    }, [])


    const getEmployeeFromSubTask = async (empid) => {
        if(empid) {
            return ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.EMPLOYEE,
                token,
                params: {
                    query: 'id:' + empid
                }
            }).then(res => {
                if(res.status === 200) {
                    const empData = res?.data?.data[0] || false
                    if(empData) {
                        return {
                            firstName: empData.firstname || undefined,
                            lastName: empData.lastname || undefined,
                            department: empData.empdepid || undefined,
                            positionId: empData.empposid || undefined,
                            position: empData.empposcode || undefined,
                            email: empData.email || undefined,
                            telephone: empData.mobiletel || empData.tel || empData.tel2 || undefined,
                            isDatabaseInfo: true,
                            empId: empData.id || undefined,
                        }
                    } else {
                        return false
                    }
                }
            })
        }
    }

    const handleChangeFormElements = (event, key, isOnBlur) => {
        const name = key ? key : event.target.name
        const value = event?.target ? event.target.value : event
        if(isOnBlur) {
            setPositionData({
                ...positionData,
                [name]: {
                    ...positionData[name],
                    isError: positionData[name]?.isRequired && !!required(value),
                    helperText: positionData[name]?.isRequired && !!required(value) && t('str_mandatory'),
                }
            })
        } else {
            setPositionData({
                ...positionData,
                [name]: {
                    ...positionData[name],
                    value: value,
                    isError: positionData[name]?.isRequired && !!required(value),
                    helperText: positionData[name]?.isRequired && !!required(value) && t('str_mandatory'),
                }
            })
        }
    }

    const handleSavePosition = () => {
        const data = {...positionData}
        const partList = [...state.newRequestStepper.participantList]
        Object.keys(positionData).map((key) => {
            data[key] = positionData[key].value
        })
        data.code = data.description.toUpperCase()
        data.empdepartid = state.newRequestStepper.participantList[selectedIndex]?.department || null
        setIsSavingPosition(true)
        Insert({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.EMPPOS,
            token,
            params: {
                hotelrefno: hotelRefNo
            },
            data: data
        }).then(res => {
            if(res.status === 200) {
                partList[selectedIndex] = {
                    ...partList[selectedIndex],
                    positionId: res.data.data
                }
                setToState('userPortal', ['newRequestStepper', 'participantList'], partList)
                enqueueSnackbar(t('str_processCompletedSuccessfully'), { variant: 'success' });
                setOpenPositionAdd(false)
                handleReset()
            } else {
                const retErr = isErrorMsg(res)
                enqueueSnackbar(retErr.errMsg, {variant: "error"})
            }
            setIsSavingPosition(false)
        })
    }

    const handleOpenPositionDialog = (index) => {
        setOpenPositionAdd(true)
        setSelectedIndex(index)

    }

    const handleReset = () => {
        setPositionData(initialPositionState)
        setPositionDataBase(initialPositionState)
        setSelectedIndex(-1)
    }


    const renderPositionContent = () => {
        return(
            <Grid container spacing={3}>
                {
                    formElements.map((item) => (
                        <Grid {...item.gridProps}>
                            {renderFormElements(item)}
                        </Grid>
                    ))
                }
            </Grid>
        )
    }
    
    return(
        <React.Fragment>
            <Typography className={classes.requestTitle}>
                {t("str_pleaseAddTheParticipants")}
            </Typography>
            <Grid container>
                <Grid item xs={12} sm={12} md={6}>
                    <FormControl
                        className={classes.searchCombo}
                        variant={"outlined"}
                        fullWidth
                    >
                        <Autocomplete
                            classes={{
                                option: classes.searchCombo,
                                input: classes.searchCombo
                            }}
                            value={userInfo}
                            autoSelect={false}
                            selectOnFocus
                            noOptionsText={t("str_notFound")}
                            loading={isLoading}
                            onChange={(e, newValue) => {
                                if(newValue !== null) {
                                    selectEmployee(newValue)
                                    setUserInfo(newValue)
                                } else {
                                    setUserInfo(null)
                                }
                            }}
                            inputValue={searchName}
                            onInputChange={(event, newInputValue, reason) => {handleFindEmployee(event, newInputValue, reason)}}
                            filterOptions={(options, state) => options}
                            options={filterEmployeeList}
                            getOptionLabel={(option) =>
                                option.fullname + "-" + option.empdepartcode + "-" + option.empposcode
                            }
                            renderInput={(params) => (
                                <TextField
                                    value={searchName}
                                    {...params}
                                    fullWidth={true}
                                    required
                                    InputLabelProps={{shrink: false}}
                                    variant="outlined"
                                />
                            )}
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={12} md={6}>
                    <div style={{float:"right",paddingBottom:"12px"}}>
                        <IconButton onClick={handleAdd}>
                            <Typography className={classes.addText}><AddCircleIcon className={classes.addIcon} />{t("str_addNew")}</Typography>
                        </IconButton>
                    </div>
                </Grid>
            </Grid>
            <TableContainer className={classes.tableContainer}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {
                                tableTitles.map((title,i) => {
                                    return(
                                        <TableCell
                                            className={title !== "" ?
                                                title === t("str_email") || title === t("str_department") ?
                                                    classes.tableCellHeaderEmail : classes.tableCellHeader
                                                :
                                                classes.tableCellHeaderAction
                                            }
                                            key={i}
                                        >
                                            {title}
                                        </TableCell>
                                    );
                                })
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody className={classes.tableBody}>
                        {state.newRequestStepper.participantList.map((field, idx) => {
                            return (
                                <React.Fragment>
                                    <TableRow
                                        className={"containerDiv"}
                                        onClick={(e) => handleSelectRow(idx,e)}
                                        key={idx}
                                    >
                                        <TableCell className={classes.tableCellBody}>
                                            <TextField
                                                autoFocus={state.newRequestStepper.participantList.length === 1}
                                                name={"firstName"}
                                                value={field.firstName !== "" ? field.firstName : undefined}
                                                className={classes.textField}
                                                variant={"outlined"}
                                                onChange={(e) => handleChange(idx,e)}
                                                disabled={field.isDatabaseInfo}
                                            />
                                        </TableCell>
                                        <TableCell className={classes.tableCellBody}>
                                            <TextField
                                                name={"lastName"}
                                                value={field.lastName !== "" ? field.lastName : undefined}
                                                className={classes.textField}
                                                variant={"outlined"}
                                                onChange={(e) => handleChange(idx,e)}
                                                disabled={field.isDatabaseInfo}
                                            />
                                        </TableCell>
                                        <TableCell className={classes.tableCellBody}>
                                            <FormControl
                                                className={classes.textField}
                                                variant={"outlined"}
                                            >
                                                <Select
                                                    style={{fontSize:"13px"}}
                                                    name={"department"}
                                                    value={field.department}
                                                    onChange={(e) => handleChange(idx,e)}
                                                    disabled={field.isDatabaseInfo}
                                                >
                                                    {
                                                        departmentList.length > 0 ?
                                                            departmentList.map((item,i) => {
                                                                return(
                                                                    <MenuItem key={`${i}-${item.id}`} value={item.id}>{item.code}</MenuItem>
                                                                );
                                                            })
                                                            :
                                                            <MenuItem>{t("str_notFound")}</MenuItem>

                                                    }
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell className={classes.tableCellBody} style={{minWidth: "220px"}}>
                                            <CustomAutoComplete
                                                fullWidth
                                                showAddIcon
                                                id={'positionid'}
                                                name={'positionid'}
                                                value={field.isDatabaseInfo ? field.position : field.positionId || null}
                                                endpoint={'employee/worklist/pos'}
                                                disabled={field.isDatabaseInfo}
                                                variant={'outlined'}
                                                fontSize={13}
                                                params={!field.isDatabaseInfo ? {
                                                    hotelrefno: hotelRefNo || GENERAL_SETTINGS.HOTELREFNO,
                                                    limit: 25,
                                                    field: 'empdepartid',
                                                    text: state.newRequestStepper.participantList[idx]?.department || 'null'
                                                } : false}
                                                onChange={(event, newValue) => {handleChange(idx, newValue, 'positionId')}}
                                                showOptionLabel={'code'}
                                                searchParam={'code,description'}
                                                triggerValue={!field.isDatabaseInfo ? state.newRequestStepper.participantList[idx]?.department : false}
                                                handleAddIconClick={() => handleOpenPositionDialog(idx)}
                                            />
                                            {/*<ClickAwayListener onClickAway={() =>handleClosePositionMenu(idx)}>
                                                <TextField
                                                    onClick={(e) => handleOpenPositionMenu(e, idx)}
                                                    ref={positionRef}
                                                    autoComplete={"off"}
                                                    name={"position"}
                                                    value={field.position}
                                                    className={classes.textField}
                                                    variant={"outlined"}
                                                    onChange={(e) => handleChange(idx,e)}
                                                    disabled={field.isDatabaseInfo}
                                                    InputProps={{
                                                        ...props.InputProps,
                                                        endAdornment: (
                                                            <div className={classes.addIconContainer}>
                                                                <IconButton size={'small'}>
                                                                    <AddIcon fontSize={'small'}/>
                                                                </IconButton>
                                                            </div>
                                                        ),
                                                    }}
                                                />
                                            </ClickAwayListener>*/}
                                        </TableCell>
                                        <TableCell className={classes.tableCellBody}>
                                            <TextField
                                                name={"email"}
                                                value={field.email}
                                                className={classes.textField}
                                                variant={"outlined"}
                                                onChange={(e) => handleChange(idx,e)}
                                                disabled={field.isDatabaseInfo}
                                            />
                                        </TableCell>
                                        <TableCell className={classes.tableCellBody}>
                                            <TextField
                                                name={"telephone"}
                                                value={field.telephone}
                                                className={classes.textField}
                                                variant={"outlined"}
                                                onChange={(e) => handleChange(idx,e)}
                                                disabled={field.isDatabaseInfo}
                                            />
                                        </TableCell>
                                        <TableCell className={classes.tableCellBody}>
                                            <div style={{position:"relative"}}>
                                                <TextField
                                                    name={"empId"}
                                                    value={field.empId}
                                                    className={classes.textFieldEmployeeId}
                                                    variant={"outlined"}
                                                    disabled
                                                />
                                                <div className={"menu"}>
                                                    <IconButton onClick={() => handleRemove(idx)}>
                                                        <DeleteIcon className={classes.deleteButton} />
                                                    </IconButton>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <Typography className={classes.counterText}>
                {t("str_totalCount") + ":" + state.newRequestStepper.participantList.length}
            </Typography>
            <DataFormDialog
                fullWidth
                maxWidth={'sm'}
                title={t('str_position')}
                open={openPositionAdd}
                loadingAction={isSavingPosition}
                disabledActions={isSavingPosition}
                disabledSave={isSavingPosition || (required(positionData.description.value) || positionData.description.isError) }
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
                            (required(positionData.description.value) || positionData.description.isError) && (
                                <Typography style={{fontSize: 'inherit'}}>{t('str_description')}</Typography>
                            )
                        }
                    </div>
                }
                render={renderPositionContent()}
                onCancelClick={() => {
                    const data = JSON.stringify(positionData)
                    const baseData = JSON.stringify(positionDataBase)
                    if(data !== baseData) {
                        setOpenTrackedDialog(true)
                    } else {
                        setOpenPositionAdd(false)
                        handleReset()
                    }
                }}
                onSaveClick={() => handleSavePosition()}
            />
            <TrackedChangesDialog
                open={openTrackedDialog}
                onPressNo={(e) => setOpenTrackedDialog(e)}
                onPressYes={(e) => {
                    setOpenTrackedDialog(e)
                    setOpenPositionAdd(e)
                    setTimeout(() => {
                        handleReset();
                    }, 150)
                }}
            />
        </React.Fragment>
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

export default connect(mapStateToProps, mapDispatchToProps)(TrainingRequestParticipantsStep)