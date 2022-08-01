import React, {
    useContext,
    useEffect,
    useState,
} from 'react';
import axios from 'axios';
import { connect, useSelector } from 'react-redux'
import { deleteFromState, pushToState, setToState, updateState } from 'state/actions'
import Grid from '@material-ui/core/Grid'
import { ViewList, List, Patch, UseOrest } from '@webcms/orest'
import {isErrorMsg, OREST_ENDPOINT, REQUEST_METHOD_CONST, XCODES} from 'model/orest/constants'
import WebCmsGlobal from 'components/webcms-global'
import useNotifications from 'model/notification/useNotifications'
import { makeStyles } from '@material-ui/core/styles'
import RequestDetail from './RequestDetail'
import { FormControlLabel } from '@material-ui/core';
import NewRequestStepper from './NewRequestStepper'
import Collapse from '@material-ui/core/Collapse'
import Checkbox from '@material-ui/core/Checkbox'
import useTranslation from 'lib/translations/hooks/useTranslation'
import styles from 'assets/jss/pages/myRequestStyle';
import Typography from '@material-ui/core/Typography';
import CustomSelect from './CustomSelect/CustomSelect';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import StarRateIcon from '@material-ui/icons/StarRate';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import {CustomToolTip} from './CustomToolTip/CustomToolTip';
import {SLASH} from '../../../model/globals';
import TableColumnText from "../../TableColumnText";
import moment from 'moment'
import CustomTable from "../../CustomTable";
import {decimalColorToHexCode} from "../../../@webcms-globals/helpers";
import LoadingSpinner from "../../LoadingSpinner";
import {useSnackbar} from "notistack";



const useStyles = makeStyles(styles);

const MyRequests = (props) => {
    const classes = useStyles();

    const { enqueueSnackbar } = useSnackbar()
    
    const { setToState, state } = props
    const { t } = useTranslation()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { showError } = useNotifications()

    const loginfo = useSelector((state) => state?.orest?.currentUser?.loginfo || false)
    const token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
    const hotelRefNo = useSelector(state =>  state?.hotelinfo?.currentHotelRefNo || null);

    const [isInitialized, setIsInitialized] = useState(false)
    const [selectedTaskInfo, setSelectedTaskInfo] = useState(false);
    const [openChecked, setOpenChecked] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [cancelDialog, setCancelDialog] = useState(false);
    const [cancelStatusId, setCancelStatusId] = useState(-1);
    const [cancelTaskState, setCancelTaskState] = useState(null);
    const [isTaskBeCanceled, setIsTaskBeCanceled] = useState(false);
    const [menuPopupState, setMenuPopupState] = useState(null);
    const [selectedRows, setSelectedRows] = useState([])
    const [isMenuLoading, setIsMenuLoading] = useState(false)
    const [isLoadingTransTypes, setIsLoadingTransType] = useState(false)
    const [frontDeskLocationInfo, setFrontDeskLocationInfo] = useState(null);

    
    const levels = {
        my:5010621,
        all:5010699,
        myDep:5010623,
        myPos:5010622
    }
    
    const getCancelStatusId = () => {
        axios({
            url: `${GENERAL_SETTINGS.OREST_URL}/${OREST_ENDPOINT.TSSTATUS}/cancel`,
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            },
        }).then(res => {
            if(res.status === 200) {
                const cancelStatusId = res.data.data[0].res;
                List({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.TSSTATUS,
                    token,
                    params: {
                        query: `id:${cancelStatusId}`
                    }
                }).then(r1 => {
                    if(r1.status === 200) {
                        setCancelStatusId(r1.data.data[0].id)
                    }
                })
            }
        })
    }
    
    const getCancelTaskInfo = (popupState, state) => {
        setCancelTaskState(state);
        setMenuPopupState(popupState);
        setCancelDialog(true);
        if(cancelStatusId === -1) getCancelStatusId();
    };
    
    const handlePatchTask = (popupState, taskState) => {
        if(popupState !== null || taskState !== null) {
            Patch({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.TSTRANS,
                token,
                gid: taskState.gid,
                params: {
                    hotelrefno: hotelRefNo,
                },
                data: {
                    statusid: cancelStatusId
                }
            }).then(res => {
                if(res.status === 200) {
                    popupState.close();
                    getRequestList(true)
                    setCancelDialog(false);
                } else {
                    const retErr = isErrorMsg(res)
                    showError(retErr.errorMsg)
                    setCancelDialog(false);
                }
            })
        }
    }
    
    const handleOpenCtxMenu = (rowData) => {
        setIsMenuLoading(true)
        axios({
            url: `${GENERAL_SETTINGS.OREST_URL}${SLASH}${OREST_ENDPOINT.TSTRANS}${SLASH}${OREST_ENDPOINT.CANCX}`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                transno: rowData.transno
            }
        }).then(res => {
            if(res.status === 200) {
                setIsTaskBeCanceled(res.data.data.res);
            } else {
                setIsTaskBeCanceled(false);
            }
            setIsMenuLoading(false)
        }).catch(err => {
            const retErr = isErrorMsg(err)
            showError(retErr.errorMsg)
            setCancelDialog(false);
        })
        
    }
    
    const handleClickDialogOpen = (rowData) => {
        if(rowData) {
            setToState('userPortal', ['newRequestStepper', 'taskType'], rowData?.transtype)
            setToState('userPortal', ['newRequestStepper', 'tsType'], rowData?.tstypeid)
            setToState('userPortal', ['defMyRequest'], rowData)
            setToState('userPortal', ['defMyRequestBase'], rowData)
            setToState('userPortal', ['newRequestStepper', 'useModuleActive'], true)
            setToState('userPortal', ['newRequestStepper', 'activeStep'], 1)
        }
        setDialogOpen(true);
    };
    const handleClickDialogClose = () => {
        setDialogOpen(false);
        setCancelDialog(false);
    };
    
    const handleChangeSelect = (event) => {
        setToState("userPortal", ["myLevel"],event.target.value)
    };
    
    function handleOpenCheckBoxClick(event){
        setOpenChecked(event.target.checked);
    }
    
    function handleAllCompCheckBoxClick(){
        setToState('userPortal', ['isAllRequest'], !state.isAllRequest)
    }

    useEffect(() => {
        let active = true
        if (active) {
            setIsInitialized(true)
            if (loginfo.id) {
                getRequestList(active, state.isAllRequest)
                if(!state.userTaskRights) {
                    UseOrest({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.TOOLS + SLASH +
                            OREST_ENDPOINT.USER + SLASH + OREST_ENDPOINT.HASRIGHT,
                        token: token,
                        method: REQUEST_METHOD_CONST.GET,
                        params: {
                            empid: loginfo.id,
                            submoduleid: 9796,
                        }
                    }).then(res => {
                        if(res.status === 200) {
                            setToState('userPortal', ['userTaskRights'], res.data.data)
                        } else if(res.status === 401) {
                            setToState('userPortal', ['userTaskRights'], false)
                        } else if(res.status === 403) {
                            setToState('userPortal', ['userTaskRights'], false)
                        }
                    })
                }

            } else {
                setIsInitialized(false)
            }
        }
        return () => {
            active = false
        }
    }, [state.isAllRequest, openChecked, hotelRefNo])

    useEffect(() => {
        let active = true
        if (active) {
            if (!state.requestModuleList.length > 0) {
                List({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: 'hotel/tslocation',
                    token,
                    params: {
                        gid: loginfo.hotelgidstr,
                        limit: 100
                    },
                }).then((r) => {
                    if (active) {
                        if (r.status === 200) {
                            setToState('userPortal', ['requestModuleList'], r.data.data)
                            r.data.data.find((x) => {
                                if(x.code === "FRONTDESK") {
                                    setFrontDeskLocationInfo(x);
                                }
                            })
                        } else if(r.status === 403) {
                            enqueueSnackbar(t('str_noModulesFoundError'), {variant: "error"})
                        }
                    }
                })
            }

            if (state.finishStatusID === 0) {
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.TSSTATUS,
                    token,
                    params: {
                        query: `isactive:true,isclose:true,isclosed:true,reqtrans:true`,
                        limit: 1,
                    },
                }).then((r) => {
                    if (active) {
                        if (r.status === 200) {
                            setToState('userPortal', ['finishStatusID'], r.data.data[0].id)
                        } else if(r.status === 403) {
                            enqueueSnackbar("Access denied", {variant: "error"})
                        }
                    }
                })
            }
        }
        if(state.newRequestStepper.requestTypes.length <= 0) {
            setIsLoadingTransType(true);
            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.TRANSTYPE + SLASH + OREST_ENDPOINT.VIEW + SLASH + OREST_ENDPOINT.TSTRANSTYPE,
                token: token,
                method: REQUEST_METHOD_CONST.GET,
            }).then(async res => {
                if(res.status === 200) {
                    let array = [];
                    const transTypeList = res.data.data
                    for(let i = 0; i < transTypeList.length; i++) {
                        const taskArray = await handleGetTaskType(transTypeList[i]?.code)
                        if(taskArray) {
                            taskArray.map((item) => {
                                array.push(item)
                            })
                        }
                    }
                    setToState('userPortal', ['newRequestStepper', 'taskTypeList'], array);
                    setToState('userPortal', ['newRequestStepper', 'requestTypes'], res.data.data);
                    setIsLoadingTransType(false);
                } else if(res.status === 403) {
                    enqueueSnackbar("Access denied", {variant: "error"})
                    setIsLoadingTransType(false)
                }
            })
        }

        return () => {
            active = false
        }
    }, [])

    const handleGetTaskType = async (transtype) => {
        return List({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: "tstype",
            token,
            params: {
                query: `transtype:${transtype}`
            }
        }).then(r1 => {
            if(r1.status === 200) {
                if(r1.data.data.length > 0) {
                    return r1.data.data
                }
            } else {
                setIsLoadingTransType(false);
                return false
            }
        })
    }

    const getRequestList = (active) => {
        setIsInitialized(true)
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.TSTRANS,
            token,
            params: state.isAllRequest ? {
                onlyopen: openChecked,
                allhotels: state.isAllRequest,
                mylevel:state.myLevel,
                increg:false,
                start: 0,
                limit: 100
            } : {
                onlyopen: openChecked,
                hotelrefno:hotelRefNo,
                mylevel:state.myLevel,
                increg:false,
                start: 0,
                limit: 100
            }
        }).then((r) => {
            if (active) {
                if (r.status === 200) {
                    setToState('userPortal', ['request'], r.data.data)
                    setIsInitialized(false);
                } else {
                    const retErr = isErrorMsg(r)
                    showError(retErr.errorMsg)
                    setIsInitialized(false)
                }
            }
        })
    }
    
    const StatusDot = (state) => {
        const backgroundColor = decimalColorToHexCode(state?.statuscolor)
        const textColor = decimalColorToHexCode(state?.statuscolor)

        return(
            <div className={classes.status}>
                <div className={classes.statusDot} style={{backgroundColor:backgroundColor}}/>
                <Typography className={classes.statusText} style={{color: textColor || 'inherit'}}>
                    {state.status}
                </Typography>
            </div>
        );
    }
    
    const transDateCalculator = (stringTransDate) => {
        const newDate = moment().format(OREST_ENDPOINT.DATEFORMAT);
        let color;
        const today = Date.parse(newDate.toString())
        let transDate = Date.parse(stringTransDate);
        if(today < transDate) {
            color = "#4666B0";
        } else if(today === transDate) {
            color = "#FCB655";
        } else {
            color = "#F16A4B";
        }
        
        return(
            <div style={{minWidth:"100px"}}>
                <Typography className={classes.dataDateText} style={{color:color}}>
                    {moment(stringTransDate).format('L')}
                </Typography>
            </div>
         
        );
    }
    
    const Stars = (key) => {
        return(
            <StarRateIcon key={key} style={{color:"#A5A4BF"}} />
        );
    }
    
    const priorityStar = (priorityId) => {
        let starCount;
        let title;
        if(priorityId === 23) {
            starCount = 1;
            title = t('str_low');
        } else if(priorityId === 3){
            starCount = 2;
            title = t('str_normal');
        } else if(priorityId === 21) {
            starCount = 3;
            title = t('str_high');
        } else if(priorityId === 20) {
            starCount = 4;
            title = t('str_urgent');
        } else {
            starCount = 0;
            title = "";
        }
        
        let priorityStarArray = [];
        for (let i = 0; i < starCount ; i++){
            priorityStarArray.push(Stars(i));
        }
        return(
            <CustomToolTip title={title} placement="top-start" arrow>
                <div style={{minWidth:"120px"}}>
                    {priorityStarArray}
                </div>
            </CustomToolTip>
        );
      
    }

    
    const [columns, setColumns] = useState([
        {
            title: t('str_status'),
            field: 'status',
            minWidth: 100,
            maxWidth: 100,
            render: state => StatusDot(state),
            hidden: false
        },
        {
            title: t('str_description'),
            field: 'description',
            minWidth: 280,
            maxWidth: 280,
            render: state => <TableColumnText minWidth={280} maxWidth={280} showToolTip>{state?.description}</TableColumnText>,
            hidden: false
            
        },
        {
            title: t("str_location"),
            field: 'locationcode',
            render: state => <TableColumnText>{state?.locationcode}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_requestDate'),
            field: 'taskdate',
            render: state => transDateCalculator(state.taskdate),
            hidden: false
        },
        {
            title: t("str_requestedBy"),
            field: 'requestedbycode',
            render: state => <TableColumnText>{state?.requestedbycode}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_priority'),
            field: 'taskrating',
            render: state => priorityStar(state.priorityid),
            hidden: false
        },
        {
            title: t("str_taskType"),
            field: "tasktype",
            render: state => <TableColumnText>{state?.tasktype}</TableColumnText>,
            hidden: false
        },
        {
            title: t("str_companyName"),
            field: "hotelname",
            render: props => <TableColumnText minWidth={200} maxWidth={200} showToolTip>{props?.hotelname}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_transNo'),
            field: 'transno',
            align: 'right',
            render: props => <TableColumnText textAlign={'right'}>{props?.transno}</TableColumnText>,
            hidden: false
        },
    ])
    

    const handleOpenRequest = (taskInfo) => {
        setSelectedTaskInfo(taskInfo)
        setToState('userPortal', ['currentTask'], taskInfo)
        setToState('userPortal', ['panelStatus'], state.panels.requestDetail)
    }


    return (
        <React.Fragment>
            <Dialog
                open={cancelDialog}
                fullWidth
                maxWidth={'xs'}
            >
                <div>
                    <DialogTitle className={classes.dialogTitle}>{t("str_warning")}</DialogTitle>
                    <DialogContentText className={classes.dialogText}>
                        {t('str_areYouSure')}
                    </DialogContentText>
                    <DialogActions style={{padding: "8px 24px 16px 24px"}}>
                        <Button style={{textTransform:"none"}} onClick={handleClickDialogClose}>
                            {t("str_no")}
                        </Button>
                        <Button className={classes.dialogButton} variant="contained" onClick={() => handlePatchTask(menuPopupState, cancelTaskState)}>
                            {t("str_yes")}
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
            <Dialog
                className={classes.requestDialog}
                open={dialogOpen}
                fullWidth
                maxWidth={state.newRequestStepper.isTrainingRequest && state.newRequestStepper.activeStep === 2 ?  'xl' : 'sm'}
            >
                <NewRequestStepper
                    openTask={openChecked}
                    allComp={state.isAllRequest}
                    closeDialog={() => handleClickDialogClose()}
                    refreshList={() => getRequestList(true)}
                    frontDeskLocationInfo={frontDeskLocationInfo}
                />
            </Dialog>
            <div style={{ marginBottom: 34 }}>
                {
                    state.panelStatus === state.panels.requestList && (
                        <div>
                            <Typography className={classes.mainTitle}>{t("str_request")}</Typography>
                        </div>
                    )
                }
            </div>
            <Grid container direction="row" justify="center" alignItems="center">
                <Grid item xs={12}>
                    <Collapse in={state.panelStatus === state.panels.requestDetail}>
                        {selectedTaskInfo && <RequestDetail taskmid={selectedTaskInfo?.mid} taskHotelRefNo={selectedTaskInfo?.hotelrefno} tableName={OREST_ENDPOINT.TSTRANS} gid={selectedTaskInfo?.gid} />}
                    </Collapse>
                    <Collapse in={state.panelStatus === state.panels.requestList}>
                        <CustomTable
                            isHoverFirstColumn
                            showMoreActionButton
                            showEditIcon
                            loading={isInitialized}
                            getColumns={columns}
                            getRows={state.request}
                            selected={selectedRows}
                            addText={t('str_newEntry')}
                            isDisabledAdd={!state?.userTaskRights?.cana}
                            isDisabledRefresh={!state?.userTaskRights?.canl}
                            disabledAddInfoText={t('str_notAuthorizedToAccess')}
                            disabledRefreshInfoText={t('str_notAuthorizedToAccess')}
                            onClickDetailIcon={(rowData) => handleOpenRequest(rowData)}
                            onClickMoreIcon={(rowData) => handleOpenCtxMenu(rowData)}
                            onClickEditIcon={(rowData) => handleClickDialogOpen(rowData)}
                            onRefresh={() => getRequestList(true)}
                            onAdd={() => handleClickDialogOpen()}
                            onRowSelect={(selectList) => setSelectedRows(selectList)}
                            onDoubleClickRow={(rowData) => handleClickDialogOpen(rowData)}
                            moreActionList={[
                                {
                                    icon: isMenuLoading ? <LoadingSpinner size={16}/> : <CancelOutlinedIcon />,
                                    title: t('str_cancel'),
                                    disabled: !isTaskBeCanceled || isMenuLoading,
                                    disabledInfo: t('str_cannotCancelRequest'),
                                    onClick: (popupState, rowData) => getCancelTaskInfo(popupState, rowData),
                                }
                            ]}
                            options={{
                                selection: true
                            }}
                            showFilterDivider
                            filterComponent={
                                <React.Fragment>
                                    <Grid container spacing={3} alignItems={'center'}>
                                        <Grid item xs={12} sm={true}>
                                            <CustomSelect
                                                value={state.myLevel}
                                                onChange={handleChangeSelect}
                                            >
                                                <MenuItem className={classes.selectItem} value={levels.my}>
                                                    {t('str_my')}
                                                </MenuItem>
                                                <MenuItem className={classes.selectItem} value={levels.all}>
                                                    {t('str_all')}
                                                </MenuItem>
                                                <MenuItem className={classes.selectItem} value={levels.myDep}>
                                                    {t('str_myDepartment')}
                                                </MenuItem>
                                                <MenuItem className={classes.selectItem} value={levels.myPos}>
                                                    {t('str_myPosition')}
                                                </MenuItem>
                                            </CustomSelect>
                                        </Grid>
                                        <Grid item xs={12} sm={true}>
                                            <FormControlLabel
                                                className={classes.checkIcon}
                                                control={<Checkbox checked={openChecked} onChange={(e) => handleOpenCheckBoxClick(e)} name="openTask" />}
                                                label={t('str_open')}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={true}>
                                            <FormControlLabel
                                                className={classes.checkIcon}
                                                control={<Checkbox checked={state.isAllRequest} onChange={(e) => handleAllCompCheckBoxClick(e)} name="allHotels" />}
                                                label={t('str_allHotels')}
                                            />
                                        </Grid>
                                    </Grid>
                                </React.Fragment>
                            }
                        />
                    </Collapse>
                </Grid>
            </Grid>
        </React.Fragment>
    )
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

export default connect(mapStateToProps, mapDispatchToProps)(MyRequests)
