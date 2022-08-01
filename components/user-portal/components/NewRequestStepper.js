import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios';
import { makeStyles } from '@material-ui/core/styles'
import styles from 'assets/jss/components/newRequestStepperStyle';
import { connect, useSelector } from 'react-redux'
import { deleteFromState, pushToState, setToState, updateState } from 'state/actions'
import {UseOrest, ViewList, Insert, List, Patch} from '@webcms/orest'
import {
    DEFAULT_OREST_TOKEN,
    getBrowserName,
    getOperationSystemName,
    isErrorMsg,
    OREST_ENDPOINT,
    REQUEST_METHOD_CONST,
    TRANSTYPES, useOrestQuery, XCODES
} from 'model/orest/constants';
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import IconButton from '@material-ui/core/IconButton'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import WebCmsGlobal from 'components/webcms-global'
import MaterialTable from 'material-table'
import DoneIcon from '@material-ui/icons/Done'
import ClearIcon from '@material-ui/icons/Clear';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import Paper from '@material-ui/core/Paper';
import useNotifications from 'model/notification/useNotifications'
import useTranslation from 'lib/translations/hooks/useTranslation'
import Tooltip from '@material-ui/core/Tooltip'
import ColorlibConnector from './StepperComponent/ColorlibConnector';
import QontoStepIcon from './StepperComponent/QontoStepIcon';
import CustomRadioButton from './CustomRadioButton/CustomRadioButton';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import InputAdornment from '@material-ui/core/InputAdornment';
import TrainingRequestConfirmStep from './TrainingRequestConfirmStep/TrainingRequestConfirmStep';
import TrainingRequestParticipantsStep from './TrainingRequestParticipantsStep/TrainingRequestParticipantsStep';
import {CustomToolTip} from './CustomToolTip/CustomToolTip';
import {SLASH} from '../../../model/globals';
import LoadingSpinner from '../../LoadingSpinner';
import { useSnackbar } from 'notistack';
import TrackedChangesDialog from "../../TrackedChangesDialog";
import CustomAutoComplete from "../../CustomAutoComplete/CustomAutoComplete";
import useOrest from "../../../@webcms-request";
import BugReportStep from "./steps/BugReportStep";

const useStyles = makeStyles(styles);

const NewRequestStepper = (props) => {
    const { state, setToState, closeDialog, openTask, allComp, refreshList, frontDeskLocationInfo } = props;

    const classes = useStyles()
    const { showError } = useNotifications()
    const { t } = useTranslation()
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
    const token = useSelector((state) => state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN)
    const hotelRefNo = useSelector(state => state.hotelinfo.currentHotelRefNo !== null ? state.hotelinfo.currentHotelRefNo : null);
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { enqueueSnackbar } = useSnackbar()
    const [infoDialog, setInfoDialog] = useState(false);
    const [radioGroupIndex, setRadioGroupIndex] = useState("-1");
    const [isStartSaveRequest, setIsStartSaveRequest] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSelectTaskType, setIsSelectTaskType] = useState(false);
    const [openTrackedDialog, setOpenTrackedDialog] = useState(false);
    
    const newRequestSteps = {
        about: 0,
        details: 1,
        participants: 2
    }

    useEffect(() => {
        if(state.newRequestStepper.requestTypes?.length > 0) {
            const task = state.newRequestStepper.requestTypes.find(e => e.code === '5010200').code
            const tsForm = state.newRequestStepper.requestTypes.find(e => e.code === '5010205').code
            const bug = state.newRequestStepper.requestTypes.find(e => e.code === '5010250').code
            const tsType = state.newRequestStepper.taskTypeList.find(e => e.id === state.newRequestStepper.tsType)
            if(state.newRequestStepper.taskType === task) {
                if(tsType?.code === 'DEV.REQ') {
                    setRadioGroupIndex('0')
                    setToState("userPortal", ["newRequestStepper", "isTransTypeTsForm"], false);
                    setToState("userPortal", ["newRequestStepper", "isTransTypeBug"], false);
                    setToState("userPortal", ["newRequestStepper", "isTransTypeTask"], true);
                } else if(tsType?.code === 'TRAINING') {
                    setToState("userPortal", ["newRequestStepper", "isTransTypeTsForm"], false);
                    setToState("userPortal", ["newRequestStepper", "isTransTypeBug"], false);
                    setToState("userPortal", ["newRequestStepper", "isTransTypeTask"], true);
                    setToState('userPortal', ['newRequestStepper', 'isTrainingRequest'], true)
                    setToState("userPortal", ["newRequestStepper", "selectedHotelRefNo"], state.defMyRequest?.hotelrefno);
                    setToState("userPortal", ["newRequestStepper", "selectedHotelName"], state.defMyRequest?.hotelname);
                    setRadioGroupIndex('4');
                } else {
                    setRadioGroupIndex('5');
                    setToState("userPortal", ["newRequestStepper", "isTransTypeTsForm"], false);
                    setToState("userPortal", ["newRequestStepper", "isTransTypeBug"], false);
                    setToState("userPortal", ["newRequestStepper", "isTransTypeTask"], true);
                }
            } else if(state.newRequestStepper.taskType === bug) {
                setRadioGroupIndex('1');
                setToState("userPortal", ["newRequestStepper", "isTransTypeTsForm"], false);
                setToState("userPortal", ["newRequestStepper", "isTransTypeBug"], true);
                setToState("userPortal", ["newRequestStepper", "isTransTypeTask"], false);
            } else if(state.newRequestStepper.taskType === tsForm) {
                setRadioGroupIndex('2');
                setToState("userPortal", ["newRequestStepper", "isTransTypeTsForm"], true);
                setToState("userPortal", ["newRequestStepper", "isTransTypeBug"], false);
                setToState("userPortal", ["newRequestStepper", "isTransTypeTask"], false);
            }
            const moduleInfo = state.requestModuleList.find((e => e.id === state.defMyRequest?.locationid))
            setToState("userPortal", ['newRequestStepper','module'], moduleInfo || null);
        }

    }, [])

    useEffect(() => {
        if(state.newRequestStepper.isTrainingRequest) {
            if(!state.newRequestStepper.trainingDepartId) {
                UseOrest({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.EMPDEPART + SLASH + 'trn',
                    token,
                }).then(res => {
                    if(res.status === 200) {
                        setToState('userPortal', ['newRequestStepper', 'trainingDepartId'], res.data.data.res);
                    }
                })
            }
        } else {
            if(!state.newRequestStepper.defaultDepartId) {
                UseOrest({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.EMPDEPART + SLASH + 'ts',
                    token
                }).then(res => {
                    if(res.status === 200) {
                        setToState('userPortal', ['defMyRequest', 'defempid'], res.data.data.res)
                        setToState('userPortal', ['defMyRequestBase', 'defempid'], res.data.data.res)
                        setToState('userPortal', ['newRequestStepper', 'defaultDepartId'], res.data.data.res)
                    } else {
                        const retErr = isErrorMsg(res)
                        enqueueSnackbar(retErr, {variant: "error"})
                    }
                }).catch(err => {
                    const retErr = isErrorMsg(err)
                    enqueueSnackbar(retErr, {variant: "error"})
                })
            } else {
                setToState('userPortal', ['defMyRequest', 'defempid'], state.newRequestStepper.defaultDepartId)
                setToState('userPortal', ['defMyRequestBase', 'defempid'], state.newRequestStepper.defaultDepartId)
            }
        }
    }, [state.newRequestStepper.isTrainingRequest])

    useEffect(() => {
        let active = true
        if (active) {
            setToState('userPortal', ['defMyRequest', 'requestedby'], loginfo.description)
            setToState('userPortal', ['defMyRequest', 'xcode'], XCODES.HUP)
            setToState('userPortal', ['defMyRequestBase', 'requestedby'], loginfo.description)
            setToState('userPortal', ['defMyRequestBase', 'xcode'], XCODES.HUP)
        }
        return () => {
            active = false
        }
    }, [])

    useEffect(() => {
        if (state.newRequestStepper.incident && state.defMyRequest.tsdescid) {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.TSDESCSOL,
                token,
                params: {
                    query: `tsdescid:${state.defMyRequest.tsdescid}`,
                    hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
                },
            }).then((r) => {
                if (r.status === 200) {
                    setToState('userPortal', ['newRequestStepper', 'tsolution'], r.data.data)
                } else {
                    showError(t('str_noRelatedSolutionError'))
                }
            })
        }
    }, [state.newRequestStepper.incident])

    useEffect(() => {
        if (state.newRequestStepper.isTransTypeBug) {
            if (!state.requestTransTypes.devproject.length > 0) {
                UseOrest({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.TRANSTYPE + SLASH + OREST_ENDPOINT.VIEW + SLASH + TRANSTYPES.DEV_PROJECT,
                    token,
                    method: REQUEST_METHOD_CONST.GET,
                    params: {
                        page: 1,
                        start: 0,
                        limit: 25,
                        sort: 'id'
                    },
                }).then((r) => {
                    if (r.status === 200) {
                        setToState('userPortal', ['requestTransTypes', 'devproject'], r.data.data)
                    }
                })
            }

            if (!state.requestTransTypes.raver.length > 0) {
                List({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.RAVER,
                    token,
                    params: {
                        page: 1,
                        start: 0,
                        limit: 25,
                    },
                }).then((r) => {
                    if (r.status === 200) {
                        setToState('userPortal', ['requestTransTypes', 'raver'], r.data.data)
                    }
                })
            }

            if (!state.requestTransTypes.browser.length > 0) {
                UseOrest({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.TRANSTYPE + '/' + OREST_ENDPOINT.VIEW + '/' + TRANSTYPES.BROWSER,
                    token,
                    method: REQUEST_METHOD_CONST.GET,
                    params: {
                        page: 1,
                        start: 0,
                        limit: 25,
                    },
                }).then((r) => {
                    if (r.status === 200) {
                        let nameFromFunc = "";
                        const browserFullName = getBrowserName(window).split(" ");
                        if(browserFullName.length > 1) {
                            nameFromFunc = browserFullName[1].toUpperCase();
                        } else {
                            nameFromFunc = browserFullName[0].toUpperCase()
                        }
                        const browserName = r.data.data.find((browser) =>
                            browser.description.toUpperCase() === nameFromFunc
                        )
                        if(browserName !== undefined) {
                            setToState('userPortal', ['defMyRequest', 'browserdesc'], browserName.description);
                            setToState('userPortal', ['defMyRequest', 'browser'], browserName.code)
                        }
                        setToState('userPortal', ['requestTransTypes', 'browser'], r.data.data)
                    }
                })
            }

            if (!state.requestTransTypes.ostype.length > 0) {
                UseOrest({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.TRANSTYPE + '/' + OREST_ENDPOINT.VIEW + '/' + TRANSTYPES.OSTYPE,
                    token,
                    method: REQUEST_METHOD_CONST.GET,
                    params: {
                        page: 1,
                        start: 0,
                        limit: 25,
                    },
                }).then((r) => {
                    if (r.status === 200) {
                        const osType = r.data.data.find((ostype) => ostype.description.toUpperCase() === getOperationSystemName().os.toUpperCase())
                        if(osType !== undefined) {
                            setToState('userPortal', ['defMyRequest', 'ostype'], osType.code)
                            setToState('userPortal', ['defMyRequest', 'ostypedesc'], osType.description)
                        }
                        setToState('userPortal', ['requestTransTypes', 'ostype'], r.data.data)
                    }
                })
            }
        }
    }, [state.newRequestStepper.tsType, state.newRequestStepper.isTransTypeBug])

    useEffect(() => {
        if (state.defMyRequest.devproject) {
            List({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RAVER,
                token,
                params: {
                    page: 1,
                    start: 0,
                    limit: 25,
                    query: `devproject::${state.defMyRequest.devproject}`,
                },
            }).then((r) => {
                if (r.status === 200 && r.data.data.length > 0) {
                    setToState('userPortal', ['requestTransTypes', 'raver'], r.data.data)
                } else {
                    setToState('userPortal', ['requestTransTypes', 'raver'], [])
                }
            })
        }
    }, [state.defMyRequest.devproject])

    const getSteps = () => {
        if(state.newRequestStepper.isTrainingRequest) {
            if(state.newRequestStepper.activeStep === newRequestSteps.details || state.newRequestStepper.activeStep === newRequestSteps.participants) {
                return [t('str_request'), t('str_confirm'), t('str_participants')]
            } else {
                return [t('str_request'), t('str_details')]
            }
        } else {
            return [t('str_request'), t('str_details')]
        }

    }

    const closeInfoDialogHandler = () => {
        setInfoDialog(infoDialog);
        handleRequestReset();
        closeDialog();
    }

    const closeDialogButtonHandler = () => {
        if(JSON.stringify(state.defMyRequest) !== JSON.stringify(state.defMyRequestBase)) {
            setOpenTrackedDialog(true)
        } else {
            closeDialog();
            state.newRequestStepper.activeStep = 0;
            handleRequestReset();
        }

    }

    const steps = getSteps()

    const handleNext = () => {
        if(state.newRequestStepper.activeStep === newRequestSteps.about &&
            !state.defMyRequest.transtype) {
            enqueueSnackbar(t('str_errorRequestType'), { variant: 'warning' })
        } else {
            if(state.newRequestStepper.isTrainingRequest) {
                let isError = false;
                if(state.newRequestStepper.activeStep === newRequestSteps.participants) {

                    state.newRequestStepper.participantList.map((data,i) => {
                        if(data.firstName === "" || data.lastName === "") {
                            enqueueSnackbar(t('str_errorFirstNameOrLastName'), { variant: 'warning' })
                            isError = true;
                        }
                    })

                    if(!isError) {
                        handleTrainingRequestConfirm(false)
                    }

                } else {
                    if (state.newRequestStepper.activeStep === newRequestSteps.details) {
                        if(state.newRequestStepper.selectedHotelRefNo && state.newRequestStepper.selectedHotelRefNo !== "") {
                            if(state.newRequestStepper.selectedModules.length > 0) {
                                setToState('userPortal', ['newRequestStepper', 'activeStep'], state.newRequestStepper.activeStep + 1)
                            } else {
                                enqueueSnackbar(t('str_errorModuleEmpty'), { variant: 'warning' })
                                isError = true;
                            }
                        } else {
                            enqueueSnackbar('Please select a hotel', { variant: 'warning' })
                        }

                    } else {
                        setToState('userPortal', ['newRequestStepper', 'activeStep'], state.newRequestStepper.activeStep + 1)
                    }
                }
            } else {
                if (state.newRequestStepper.activeStep === newRequestSteps.details) {
                    let isError = false

                    if (!state.newRequestStepper.inputModuleValue) {
                        setToState('userPortal', ['newRequestStepper', 'fieldError', 'modules'], true)
                        isError = true
                    }

                    if (!state.newRequestStepper.useModuleActive) {
                        showError(t('str_moduleNotValidError'))
                        setToState('userPortal', ['newRequestStepper', 'fieldError', 'modules'], true)
                        isError = true
                    }

                    if (state.newRequestStepper.isTransTypeTask ||
                        state.newRequestStepper.isRequestActive
                    ) {
                        if (!state.defMyRequest.description || state.defMyRequest.description.length < 30) {
                            setToState('userPortal', ['newRequestStepper', 'fieldError', 'description'], true)
                            enqueueSnackbar(t('str_errorRequestDescriptionNumber30'), {variant: "warning"})
                            isError = true
                        }
                    }

                    if (state.newRequestStepper.isTransTypeBug) {
                        if (!state.defMyRequest.devprojectdesc) {
                            if(state.defMyRequest.locationid) {
                                setToState('userPortal', ['newRequestStepper', 'fieldError', 'platform'], true)
                            }
                            isError = true
                        }

                        if (!state.defMyRequest.raverid) {
                            if(state.defMyRequest.devprojectdesc) {
                                setToState('userPortal', ['newRequestStepper', 'fieldError', 'version'], true)
                            }
                            isError = true
                        }

                        if (!state.defMyRequest.ostypedesc) {
                            if(state.defMyRequest.locationid && state.defMyRequest.devprojectdesc && state.defMyRequest.raverid) {
                                setToState('userPortal', ['newRequestStepper', 'fieldError', 'ostype'], true)
                            }
                            isError = true
                        }

                        if (!state.defMyRequest.browserdesc) {
                            setToState('userPortal', ['newRequestStepper', 'fieldError', 'browser'], true)
                            isError = true
                        }

                        if (!state.defMyRequest.repsteps) {
                            setToState('userPortal', ['newRequestStepper', 'fieldError', 'repsteps'], true)
                            isError = true
                        }

                        if (!state.defMyRequest.curres) {
                            setToState('userPortal', ['newRequestStepper', 'fieldError', 'result'], true)
                            isError = true
                        }

                        if (!state.defMyRequest.expres) {
                            setToState('userPortal', ['newRequestStepper', 'fieldError', 'expected'], true)
                            isError = true
                        }
                    }

                    if (!isError) {
                        handleConfirm(false)
                    }else{
                        enqueueSnackbar(t('str_pleaseCheckMandatoryFields'), {variant: "warning"})
                    }
                } else {
                    setToState('userPortal', ['newRequestStepper', 'activeStep'], state.newRequestStepper.activeStep + 1)
                }
            }
        }

    }

    const handleBack = () => {
        if (state.newRequestStepper.activeStep === newRequestSteps.details) {
            setToState('userPortal', ['newRequestStepper', 'isRequestActive'], false)
            setToState('userPortal', ['newRequestStepper', 'incident'], null)
            setToState('userPortal', ['newRequestStepper', 'inputIncidentValue'], '')
            setToState('userPortal', ['newRequestStepper', 'useRequestIncidentList'], null)
            setToState('userPortal', ['requestIncidentList'], [])
        }
        setToState('userPortal', ['newRequestStepper', 'activeStep'], state.newRequestStepper.activeStep - 1)
    }
    
    const findTaskType = (transTypeCode, taskTypeCode, radioButtonIndex) => {
        setRadioGroupIndex(radioButtonIndex);
        if(state.newRequestStepper.taskTypeList && state.newRequestStepper.taskTypeList.length > 0) {
            if(state.newRequestStepper.taskTypeList.find(e => e.code.toUpperCase() === taskTypeCode.toUpperCase()) !== undefined) {
                setToState("userPortal", ["newRequestStepper", "taskType"], state.newRequestStepper.taskTypeList.find(e => e.code.toUpperCase() === taskTypeCode.toUpperCase()).id);
                setToState('userPortal', ['defMyRequest', 'tstypeid'], state.newRequestStepper.taskTypeList.find(e => e.code.toUpperCase() === taskTypeCode.toUpperCase()).id)
            } else {
                setToState("userPortal", ["newRequestStepper", "taskType"], "");
                setToState('userPortal', ['defMyRequest', 'tstypeid'], "")
            }
        }
    }
    
    const isBug = (item) => {
        setToState("userPortal", ["newRequestStepper", "isTransTypeBug"], true);
        setToState("userPortal", ["newRequestStepper", "isTransTypeTsForm"], false);
        setToState("userPortal", ["newRequestStepper", "isTransTypeTask"], false);
        return item.description === 'SWBUG';
    }
    
    const isTsForm = (item) => {
        setToState("userPortal", ["newRequestStepper", "isTransTypeTsForm"], true);
        setToState("userPortal", ["newRequestStepper", "isTransTypeBug"], false);
        setToState("userPortal", ["newRequestStepper", "isTransTypeTask"], false);
        return item.description === 'TSFORM';
    }
    
    const isTask = (item) => {
        setToState("userPortal", ["newRequestStepper", "isTransTypeTask"], true);
        setToState("userPortal", ["newRequestStepper", "isTransTypeBug"], false);
        setToState("userPortal", ["newRequestStepper", "isTransTypeTsForm"], false);
        return item.description === 'TASK';
    }
    
    const handleTsTypeChange = (event) => {
        let index = event.target.value
        if(index === "0") {
            findTaskType(state.newRequestStepper.requestTypes.find(isTask).code, "DEV.REQ", index)
            setToState('userPortal', ['newRequestStepper', 'tsType'], state.newRequestStepper.requestTypes.find(isTask).code)
            setToState('userPortal', ['defMyRequest', String(event.target.name)], state.newRequestStepper.requestTypes.find(isTask).code)
            setToState('userPortal', ['newRequestStepper', 'isTrainingRequest'], false)
        } else if(index === "1") {
            findTaskType(state.newRequestStepper.requestTypes.find(isBug).code, "DEV.BUG", index)
            setToState('userPortal', ['newRequestStepper', 'tsType'], state.newRequestStepper.requestTypes.find(isBug).code)
            setToState('userPortal', ['defMyRequest', String(event.target.name)], state.newRequestStepper.requestTypes.find(isBug).code)
            setToState('userPortal', ['newRequestStepper', 'isTrainingRequest'], false)
        } else if(index === "2") {
            findTaskType(state.newRequestStepper.requestTypes.find(isTsForm).code, "GENERAL", index);
            setToState('userPortal', ['newRequestStepper', 'tsType'], state.newRequestStepper.requestTypes.find(isTsForm).code)
            setToState('userPortal', ['defMyRequest', String(event.target.name)], state.newRequestStepper.requestTypes.find(isTsForm).code)
            setToState('userPortal', ['newRequestStepper', 'isTrainingRequest'], false)
        } else if(index === "3") {
            findTaskType(state.newRequestStepper.requestTypes.find(isTask).code, "other", index);
            setToState('userPortal', ['newRequestStepper', 'tsType'], state.newRequestStepper.requestTypes.find(isTask).code)
            setToState('userPortal', ['defMyRequest', String(event.target.name)], state.newRequestStepper.requestTypes.find(isTask).code)
            setToState('userPortal', ['newRequestStepper', 'isTrainingRequest'], false)
        } else if(index === "4") {
            findTaskType(state.newRequestStepper.requestTypes.find(isTask).code, "TRAINING", index);
            setToState('userPortal', ['newRequestStepper', 'tsType'], state.newRequestStepper.requestTypes.find(isTask).code)
            setToState('userPortal', ['defMyRequest', String(event.target.name)], state.newRequestStepper.requestTypes.find(isTask).code)
            setToState('userPortal', ['newRequestStepper', 'isTrainingRequest'], true)
        }
        
    }
    
    const handleChange = (e, state) => {
        if (e && e.target) {
            setToState('userPortal', ['defMyRequest', String(e.target.name)], e.target.value)
        } else {
            setToState('userPortal', ['defMyRequest', String(state.name)], state.value)
        }
    }
    
    const handleGetLocationID = (id) => {
        setToState('userPortal', ['requestIncidentList'], [])
        setToState('userPortal', ['newRequestStepper', 'incident'], null)
        setToState('userPortal', ['newRequestStepper', 'inputIncidentValue'], '')
        setToState('userPortal', ['newRequestStepper', 'useModuleActive'], true)
        handleChange(null, { name: 'locationid', value: id })
        if (state.newRequestStepper.isTransTypeTsForm) {
            handleGetIncident(id)
        }
    }
    
    const handleGetIncident = (id) => {
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.TSDESC,
            token,
            params: {
                query: `locid::${id}`,
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
            },
        }).then((r) => {
            if (r.status === 200 && r.data.data.length > 0) {
                setToState('userPortal', ['requestIncidentList'], r.data.data)
                setToState('userPortal', ['newRequestStepper', 'useRequestIncidentList'], true)
            } else {
                setToState('userPortal', ['newRequestStepper', 'useRequestIncidentList'], false)
            }
        })
    }
    
    const tsolutionColumns = [
        {
            title: 'Description',
            field: 'tsoldesc',
            cellStyle: {
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                maxWidth: 200,
            },
        },
    ]
    
    const handleRequestReset = () => {
        setToState('userPortal', ['newRequestStepper', 'isSaveRequest'], false)
        setToState('userPortal', ['panelStatus'], state.panels.requestList)
        setToState('userPortal', ['newRequestStepper', 'useModuleActive'], false)
        setToState('userPortal', ['newRequestStepper', 'module'], null)
        setToState('userPortal', ['newRequestStepper', 'isRequestActive'], false)
        setToState('userPortal', ['newRequestStepper', 'incident'], null)
        setToState('userPortal', ['newRequestStepper', 'inputIncidentValue'], '')
        setToState('userPortal', ['newRequestStepper', 'tsType'], '')
        setToState('userPortal', ['newRequestStepper', 'useRequestIncidentList'], null)
        setToState('userPortal', ['requestIncidentList'], [])
        setToState('userPortal', ['defMyRequest'], {});
        setToState('userPortal', ['defMyRequestBase'], {});
        setToState('userPortal', ['newRequestStepper', 'fieldError'], {
            modules: false,
            description: false,
            platform: false,
            version: false,
            ostype: false,
            browser: false,
            repsteps: false,
            result: false,
            expected: false,
        })
        setToState('userPortal', ['newRequestStepper', 'activeStep'], 0)
        setToState('userPortal', ['newRequestStepper', 'confirmTermsAndCondition'], false)
        setToState('userPortal', ['newRequestStepper', 'participantList'], [{
            firstName: "",
            lastName: "",
            department: "",
            positionId:"",
            position: "",
            email: "",
            telephone: "",
            isDatabaseInfo: false
        }])
        setToState('userPortal', ['newRequestStepper', 'selectedModules'], []);
        setToState('userPortal', ['newRequestStepper', 'isTrainingModulesSelected'], false)
        setToState('userPortal', ['newRequestStepper', 'isTrainingRequest'], false);
        setToState('userPortal', ['newRequestStepper', 'transType'], "");
        setToState('userPortal', ['newRequestStepper', 'taskType'], "");
        setToState('userPortal', ['newRequestStepper', 'isTransTypeTask'], false);
        setToState('userPortal', ['newRequestStepper', 'isTransTypeBug'], false);
        setToState('userPortal', ['newRequestStepper', 'isTransTypeTsForm'], false);
        setToState('userPortal', ['newRequestStepper', 'participantListLoaded'], false)
        setToState("userPortal", ["newRequestStepper", "loadedModuleList"], false)
    }
    
    const handleConfirm = (isFinish = false) => {
        setIsStartSaveRequest(true);
        state.defMyRequest.hotelrefno = hotelRefNo
        state.defMyRequest.accid = hotelRefNo
        
        if (isFinish) {
            state.defMyRequest.statusid = state.finishStatusID
        }
        
        setToState('userPortal', ['newRequestStepper', 'isSaveRequest'], true)
        if(state.defMyRequest?.gid) {
            Patch({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.TSTRANS,
                token: token,
                gid: state.defMyRequest?.gid,
                params: {
                    hotelrefno: hotelRefNo,
                },
                data: state.defMyRequest,
            }).then(async (res) => {
                if(state.newRequestStepper.isTransTypeBug) {
                   await handleTaskBugIns(res.data.data.transno, state.newRequestStepper.taskBugData?.gid)
                }
                setToState('userPortal', ['newRequestStepper', 'isSaveRequest'], false)
                setIsStartSaveRequest(false);
                typeof refreshList === 'function' && refreshList();
                typeof closeDialog == 'function' && closeDialog();
                enqueueSnackbar( state.defMyRequest?.transno ? t('str_updateIsSuccessfullyDone') : t('str_processCompletedSuccessfully'), { variant: 'success' });
            })

        } else {
            Insert({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.TSTRANS,
                token: token,
                params: {
                    hotelrefno: hotelRefNo,
                },
                data: state.defMyRequest,
            }).then(async (r1) => {
                if (r1.status === 200) {
                    if (state.newRequestStepper.isTransTypeTask) {
                        const raNoteData = {
                            masterid: r1.data.data.mid,
                            note: state.defMyRequest.note
                        }
                        if (!state.defMyRequest?.transno && raNoteData.note && raNoteData.note !== "") {
                            await handleInsertRaNote(raNoteData)
                        }
                        setToState('userPortal', ['newRequestStepper', 'isSaveRequest'], false)
                        setIsStartSaveRequest(false);
                        typeof refreshList === 'function' && refreshList();
                        typeof closeDialog == 'function' && closeDialog();
                        enqueueSnackbar( state.defMyRequest?.transno ? t('str_updateIsSuccessfullyDone') : t('str_processCompletedSuccessfully'), { variant: 'success' });
                    } else {
                        if(state.newRequestStepper.isTransTypeBug) {
                            await handleTaskBugIns(r1.data.data.transno, state.newRequestStepper.taskBugData?.gid)
                        }
                        setToState('userPortal', ['newRequestStepper', 'isSaveRequest'], false)
                        setIsStartSaveRequest(false);
                        typeof refreshList === 'function' && refreshList();
                        typeof closeDialog == 'function' && closeDialog();
                        enqueueSnackbar( state.defMyRequest?.transno ? t('str_updateIsSuccessfullyDone') : t('str_processCompletedSuccessfully'), { variant: 'success' });
                        setTimeout(() => {
                            handleRequestReset()
                        }, 100)
                    }
                } else {
                    setIsStartSaveRequest(false);
                }
            })
        }

    }

    const handleTaskBugIns = (transno, gid) => {
        const data = {
            transno: transno,
            browser: state.defMyRequest.browser ? state.defMyRequest.browser : "",
            browserdesc: state.defMyRequest.browserdesc ? state.defMyRequest.browserdesc : "",
            curres: state.defMyRequest.curres ? state.defMyRequest.curres : "",
            devproject: state.defMyRequest.devproject ? state.defMyRequest.devproject : "",
            devprojectdesc: state.defMyRequest.devprojectdesc ? state.defMyRequest.devprojectdesc : "",
            expres: state.defMyRequest.expres ? state.defMyRequest.expres : "",
            envurl: GENERAL_SETTINGS.OREST_URL,
            hotelrefno: Number(hotelRefNo),
            ostype: state.defMyRequest.ostype ? state.defMyRequest.ostype : "",
            ostypedesc: state.defMyRequest.ostypedesc ? state.defMyRequest.ostypedesc : "",
            raverid: state?.defMyRequest?.raverid || null,
            repsteps: state.defMyRequest.repsteps ? state.defMyRequest.repsteps : "",
        }
        if(gid) {
            delete data.transno
            delete data.hotelrefno
            return Patch({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.TASKBUG,
                token: token,
                gid: gid,
                data: data
            }).then(res => {
                if(res.status === 200) {
                    return res.status === 200 ? res.data.data : false
                } else {
                    enqueueSnackbar("Bug report cant update", {variant: "error"})
                    return false
                }
            })
        } else {
            return Insert({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.TASKBUG,
                token: token,
                data: data
            }).then(res => {
                if(res.status === 200) {
                    return res.status === 200 ? res.data.data : false
                } else {
                    enqueueSnackbar("Bug report cant save", {variant: "error"})
                    return false
                }

            })
        }

    }
    
    const handleTrainingRequestConfirm = async (isFinish = false) => {
        setIsStartSaveRequest(true);
        setToState('userPortal', ['newRequestStepper', 'isSaveRequest'], true)
        let noteData = "";
        let empIdList = [];
        const newEmployeeList = []
        const trainingType = `${t("str_trainingType")}: ${ state.newRequestStepper.trainingType}<br><br>`;
        let moduleInfo = "**" + t("str_modules") + "<br>";
        state.newRequestStepper.selectedModules.map((module, ind) => {
            let temp = "";
            if(ind >= state.newRequestStepper.selectedModules.length) {
                temp = module;
            } else {
                temp = module + ", ";
            }
            moduleInfo = moduleInfo + temp;
        })

        const contactInfo = `<br><br>** ${t("str_contactInfo")}<br>${t("str_fullName")}: ${loginfo.firstname} ${loginfo.lastname} <br> ${t("str_email")}: ${loginfo.email}<br> ${t("str_phone")}: ${loginfo.mobiletel && loginfo.mobiletel ? loginfo.mobiletel : "-"} `

        noteData = trainingType + moduleInfo + contactInfo;
        state.newRequestStepper.participantList.map((item,i) => {
            if(!item.isDatabaseInfo) {
                newEmployeeList.push({
                    firstname: item.firstName.toUpperCase(),
                    lastname: item.lastName.toUpperCase(),
                    email: item.email || "",
                    empdepartid: item.department || "",
                    empposid: typeof item.positionId === 'object' ? item.positionId?.id : item.positionId,
                    mobiletel: item.telephone || "",
                    contactaccid: state.newRequestStepper.selectedHotelRefNo
                })
            } else {
                if(item.empId !== undefined) {
                    empIdList.push({
                        empid: item.empId,
                        description: item.firstName + " " + item.lastName
                    });
                }
            }
        })
        let empInsRes = false
        let noteInsRes = false
        let subTaskInsRes = false
        let subTaskDelRes = false
        if(newEmployeeList.length > 0) {
            empInsRes = await handleInsertEmployee(newEmployeeList)
            if(empInsRes) {
                empInsRes.map((item) => {
                    empIdList.push({
                        empid: item.id,
                        description: item?.fullname
                    })
                })
            }
        } else {
            empInsRes = true
        }
        const transInsRes = await addTrainingRequest()
        if(transInsRes) {
            for(let i = 0; i < empIdList.length; i++) {
                empIdList[i] = {
                    ...empIdList[i],
                    transno: transInsRes.transno,
                    worktypeid: 112
                }
            }
            const raNoteData = {
                masterid: transInsRes?.mid,
                note:noteData
            }
            if(state.defMyRequest?.transno) {
                subTaskDelRes = await handleDeleteSubTask(transInsRes?.transno)
            }
            if(!state.defMyRequest?.transno) {
                noteInsRes = await handleInsertRaNote(raNoteData)
            }
            subTaskInsRes = await handleInsertSubTask(empIdList)
            if((empInsRes && transInsRes && noteInsRes && subTaskInsRes) || (state.defMyRequest?.transno && empInsRes && transInsRes && subTaskDelRes  && subTaskInsRes)) {
                enqueueSnackbar( state.defMyRequest?.transno ? t('str_updateIsSuccessfullyDone') : t('str_processCompletedSuccessfully'), { variant: 'success' });
                setIsStartSaveRequest(false);
                typeof closeDialog === 'function' && closeDialog()
                typeof refreshList === 'function' && refreshList()
                handleRequestReset()
            }
            setToState('userPortal', ['newRequestStepper', 'isSaveRequest'], false);
        }
    }
    
    const addTrainingRequest = () => {
        let info = {
            trainingType: state.newRequestStepper.trainingType,
            moduleList: state.newRequestStepper.selectedModules
        }
        info = JSON.stringify(info)
        if(state.defMyRequest?.gid) {
            return Patch({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.TSTRANS,
                token: token,
                gid: state.defMyRequest?.gid,
                params: {
                    hotelrefno: state.newRequestStepper.selectedHotelRefNo,
                },
                data: {
                    note: info
                },
            }).then(r1 => {
                if(r1.status === 200) {
                    return r1.data.data
                } else {
                    const retErr = isErrorMsg(r1);
                    enqueueSnackbar(retErr.errorMsg, { variant: 'error' })
                    setIsStartSaveRequest(false);
                    setToState('userPortal', ['newRequestStepper', 'isSaveRequest'], false)
                }
            })
        } else {
            return Insert({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.TSTRANS,
                token: token,
                params: {
                    hotelrefno: state.newRequestStepper.selectedHotelRefNo,
                },
                data: {
                    accid: state.newRequestStepper.selectedHotelRefNo,
                    transtype: state.defMyRequest.transtype,
                    description: `${state.newRequestStepper.selectedHotelName} ${t("str_trainingRequest")}` ,
                    requestedby: loginfo.description,
                    defempid: state.newRequestStepper.trainingDepartId || "",
                    locationid: frontDeskLocationInfo !== null ? frontDeskLocationInfo.id : "",
                    tstypeid: state.newRequestStepper.taskType || "",
                    note: info,
                    xcode: XCODES.HUP
                },
            }).then(r1 => {
                if(r1.status === 200) {
                    return r1.data.data
                } else {
                    const retErr = isErrorMsg(r1);
                    enqueueSnackbar(retErr.errorMsg, { variant: 'error' })
                    setIsStartSaveRequest(false);
                    setToState('userPortal', ['newRequestStepper', 'isSaveRequest'], false)
                }
            })
        }

    }

    const handleInsertEmployee = async (empList) => {
        return Insert({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.EMPLOYEE + SLASH + OREST_ENDPOINT.LIST,
            token,
            params: {
                hotelrefno: state.newRequestStepper.selectedHotelRefNo
            },
            data: empList
        }).then(res => {
            if(res.status === 200) {
                return res.data.data
            } else if(res.status === 403) {
                enqueueSnackbar(t('str_notAuthorizedToAddEmployee'), { variant: 'error' })
                setIsStartSaveRequest(false);
                setToState('userPortal', ['newRequestStepper', 'isSaveRequest'], false)
                return false
            } else {
                const retErr = isErrorMsg(res);
                enqueueSnackbar(retErr.errorMsg, { variant: 'error' })
                setIsStartSaveRequest(false);
                setToState('userPortal', ['newRequestStepper', 'isSaveRequest'], false)
                return false
            }
        })
    }

    const handleInsertSubTask = async (empIdList) => {
        return Insert({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.TASKSUB + SLASH + OREST_ENDPOINT.LIST,
            token,
            params: {
                hotelrefno: state.newRequestStepper.selectedHotelRefNo
            },
            data: empIdList
        }).then(res => {
            if(res.status === 200) {
                return res.data.data
            } else {
                const retErr = isErrorMsg(res);
                enqueueSnackbar(retErr.errorMsg, { variant: 'error' })
                setIsStartSaveRequest(false);
                setToState('userPortal', ['newRequestStepper', 'isSaveRequest'], false)
                return false
            }
        })
    }

    const handleDeleteSubTask = async (transno) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            method: REQUEST_METHOD_CONST.DELETE,
            endpoint: OREST_ENDPOINT.TASKSUB + SLASH + OREST_ENDPOINT.LIST + SLASH + OREST_ENDPOINT.DEL,
            token,
            params: {
                query: useOrestQuery({
                    transno: transno
                }),
                hotelrefno: state.newRequestStepper.selectedHotelRefNo
            },
        }).then(res => {
            if(res.status === 200) {
                return true
            } else {
                const retErr = isErrorMsg(res);
                enqueueSnackbar(retErr.errorMsg, { variant: 'error' })
                setIsStartSaveRequest(false);
                setToState('userPortal', ['newRequestStepper', 'isSaveRequest'], false)
                return false
            }
        })
    }

    const handleInsertRaNote = async (noteData) => {
        return Insert({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RANOTE,
            token: token,
            params: {
                hotelrefno: state.newRequestStepper.selectedHotelRefNo,
            },
            data: noteData
        }).then(r2 => {
            if(r2.status === 200) {
                return r2.data.data
            } else {
                const retErr = isErrorMsg(r2);
                enqueueSnackbar(retErr.errMsg, { variant: 'error' });
                setIsStartSaveRequest(false);
                setToState('userPortal', ['newRequestStepper', 'isSaveRequest'], false);
                return false
            }
        });
    }
    
    const fieldDisabled = !state.newRequestStepper.inputModuleValue || !state.newRequestStepper.useModuleActive
    
    return (
        <React.Fragment>
            <Dialog
                open={infoDialog}
                maxWidth={'md'}
            >
                <DialogTitle className={classes.dialogTitle}>{t("str_info")}</DialogTitle>
                <DialogContentText className={classes.dialogText}>
                    {t('str_processCompletedSuccessfully')}
                </DialogContentText>
                <DialogActions>
                    <Button className={classes.buttonStyle} variant="contained" onClick={closeInfoDialogHandler}>
                        {t("str_ok")}
                    </Button>
                </DialogActions>
            </Dialog>
            <Container maxWidth={false} style={{padding: '24px 48px'}} disableGutters>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Stepper activeStep={state.newRequestStepper.activeStep} alternativeLabel connector={<ColorlibConnector />}>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel StepIconComponent={QontoStepIcon}>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Grid>
                    <Grid item xs={12}>
                        {state.newRequestStepper.activeStep === steps.length && !state.newRequestStepper.isTrainingRequest ? (
                            <Typography className={classes.instructions}>{t('str_allStepsCompleted')}</Typography>
                        ) : (
                            <React.Fragment>
                                <Grid
                                    container
                                    direction="row"
                                    spacing={3}
                                >
                                    {state.newRequestStepper.activeStep === newRequestSteps.about && (
                                        <React.Fragment>
                                            {isLoading ?
                                                <Grid item style={{margin:"auto"}}>
                                                    <LoadingSpinner />
                                                </Grid>
                                                :
                                                <Grid item>
                                                    { isSelectTaskType ?
                                                        <Paper className={classes.pleaseWaitPaper} elevation={6}>
                                                            {t("str_pleaseWait")}
                                                        </Paper>
                                                        :
                                                        null
                                                    }
                                                    {state.newRequestStepper.requestTypes.length > 0 ? (
                                                        <FormControl component="fieldset">
                                                            <RadioGroup
                                                                disabled={isSelectTaskType}
                                                                name="transtype"
                                                                value={radioGroupIndex}
                                                                onChange={handleTsTypeChange}
                                                            >
                                                                <FormControlLabel
                                                                    disabled={isSelectTaskType}
                                                                    value={"0"}
                                                                    control={<CustomRadioButton />}
                                                                    label={t('str_newFeature')}
                                                                />
                                                                <FormControlLabel
                                                                    disabled={isSelectTaskType}
                                                                    value={"1"}
                                                                    control={<CustomRadioButton  />}
                                                                    label={t('str_bugReport')}
                                                                />
                                                                <FormControlLabel
                                                                    disabled={isSelectTaskType}
                                                                    value={"2"}
                                                                    control={<CustomRadioButton />}
                                                                    label={t('str_support')}
                                                                />
                                                                <FormControlLabel
                                                                    disabled={isSelectTaskType}
                                                                    value={"4"}
                                                                    control={<CustomRadioButton  />}
                                                                    label={t('str_training')}
                                                                />
                                                                <FormControlLabel
                                                                    disabled={isSelectTaskType}
                                                                    value={"3"}
                                                                    control={<CustomRadioButton  />}
                                                                    label={t('str_other')}
                                                                />
                                                            </RadioGroup>
                                                        </FormControl>
                                                    ) : null
                                                    }
                                                </Grid>
                                            }
                                        </React.Fragment>
                                    )}
                                    {state.newRequestStepper.activeStep === newRequestSteps.details && state.newRequestStepper.isTrainingRequest ? (
                                        <React.Fragment>
                                            <Grid item xs={12}>
                                                <Typography className={classes.requestTitle}>
                                                    {t("str_whatIsYourRequestAbout")}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TrainingRequestConfirmStep />
                                            </Grid>
                                        </React.Fragment>
                                        ) :
                                        state.newRequestStepper.activeStep === newRequestSteps.participants && state.newRequestStepper.isTrainingRequest ? (
                                            <Grid item xs={12}>
                                                <TrainingRequestParticipantsStep />
                                            </Grid>
                                            ) :
                                            state.newRequestStepper.activeStep === newRequestSteps.details && (
                                                <React.Fragment>
                                                    <Grid item xs={12}>
                                                        <Typography className={classes.requestTitle}>
                                                            {t("str_whatIsYourRequestAbout")}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Typography className={classes.requestSubTitle}>
                                                            {t("str_module") + "*"}
                                                        </Typography>
                                                        <div style={{paddingTop: '8px'}} />
                                                        <Autocomplete
                                                            className={classes.autoCompleteStyle}
                                                            value={state.newRequestStepper.module}
                                                            onChange={(event, newValue) => {
                                                                setToState(
                                                                    'userPortal',
                                                                    ['newRequestStepper', 'module'],
                                                                    newValue
                                                                )
                                                                if (newValue?.id) {
                                                                    handleGetLocationID(newValue.id)
                                                                } else {
                                                                    enqueueSnackbar(t('str_moduleNotValidError'), {variant: 'warning'})
                                                                    setToState(
                                                                        'userPortal',
                                                                        ['newRequestStepper', 'useModuleActive'],
                                                                        true
                                                                    )
                                                                }
                                                            }}
                                                            inputValue={state.newRequestStepper.inputModuleValue}
                                                            onInputChange={(event, newInputValue) => {
                                                                setToState(
                                                                    'userPortal',
                                                                    ['newRequestStepper', 'inputModuleValue'],
                                                                    newInputValue
                                                                )
                                                                setToState(
                                                                    'userPortal',
                                                                    ['newRequestStepper', 'fieldError', 'modules'],
                                                                    false
                                                                )
                                                            }}
                                                            options={state.requestModuleList}
                                                            getOptionLabel={(option) =>
                                                                option.code + ' - ' + option.description
                                                            }
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    classes={{root:classes.textFieldStyle}}
                                                                    {...params}
                                                                    fullWidth={true}
                                                                    required
                                                                    InputLabelProps={{shrink: false}}
                                                                    variant="outlined"
                                                                    error={state.newRequestStepper.fieldError.modules}
                                                                />
                                                            )}
                                                        />
                                                    </Grid>
                                                    {state.newRequestStepper.isTransTypeTask || state.newRequestStepper.isRequestActive ? (
                                                        <React.Fragment>
                                                            <Grid item xs={12}>
                                                                <Typography className={classes.requestSubTitle}>
                                                                    {t("str_description") + "*"}
                                                                </Typography>
                                                                <TextField
                                                                    classes={fieldDisabled ? null : {root:classes.textFieldStyle}}
                                                                    fullWidth={true}
                                                                    required
                                                                    variant="outlined"
                                                                    id="description"
                                                                    name="description"
                                                                    InputLabelProps={{shrink: false}}
                                                                    InputProps={{
                                                                        endAdornment: <InputAdornment
                                                                            className={classes.inputAdornmentStyle}
                                                                            position="start"
                                                                        >
                                                                            <Typography className={classes.characterCountText}>
                                                                                {
                                                                                    state.defMyRequest.description ?
                                                                                        `${state.defMyRequest.description.length}/255`
                                                                                        :
                                                                                        null
                                                                                }
                                                                            </Typography>
                                                                        </InputAdornment>,
                                                                    }}
                                                                    disabled={fieldDisabled}
                                                                    value={state.defMyRequest.description || ''}
                                                                    onChange={(e) => {
                                                                        handleChange(e, null)
                                                                        setToState(
                                                                            'userPortal',
                                                                            ['newRequestStepper', 'fieldError', 'description'],
                                                                            false
                                                                        )
                                                                    }}
                                                                    error={state.newRequestStepper.fieldError.description}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={12}>
                                                                <Typography className={classes.requestSubTitle}>
                                                                    {t("str_note")}
                                                                </Typography>
                                                                <TextField
                                                                    classes={fieldDisabled ? null : {root:classes.textFieldStyleMultiLine}}
                                                                    fullWidth={true}
                                                                    variant="outlined"
                                                                    multiline
                                                                    rows={3}
                                                                    id="note"
                                                                    name="note"
                                                                    InputLabelProps={{shrink: false}}
                                                                    //label={t('str_note')}
                                                                    value={state.defMyRequest.note || ''}
                                                                    disabled={fieldDisabled}
                                                                    onChange={(e) => handleChange(e, null)}
                                                                />
                                                            </Grid>
                                                        </React.Fragment>
                                                    ) : null}
                                                    {state.newRequestStepper.isTransTypeBug && (
                                                        <BugReportStep fieldDisabled={fieldDisabled}/>
                                                    )}
                                                    {state.newRequestStepper.isTransTypeTsForm && (
                                                        <React.Fragment>
                                                            <Grid item xs={12}>
                                                                <Typography className={classes.requestSubTitle}>
                                                                    {t("str_incident")}
                                                                </Typography>
                                                                {!state.newRequestStepper.isRequestActive && (
                                                                    <Autocomplete
                                                                        disabled={
                                                                            fieldDisabled ||
                                                                            state.newRequestStepper.useRequestIncidentList !==
                                                                            true
                                                                        }
                                                                        value={state.newRequestStepper.incident}
                                                                        onChange={(event, newValue) => {
                                                                            setToState(
                                                                                'userPortal',
                                                                                ['newRequestStepper', 'incident'],
                                                                                newValue
                                                                            )
                                                                            handleChange(null, {
                                                                                name: 'tsdescid',
                                                                                value: newValue.id,
                                                                            })
                                                                            handleChange(null, {
                                                                                name: 'description',
                                                                                value: newValue.description,
                                                                            })
                                                                        }}
                                                                        inputValue={state.newRequestStepper.inputIncidentValue}
                                                                        onInputChange={(event, newInputValue) => {
                                                                            setToState(
                                                                                'userPortal',
                                                                                ['newRequestStepper', 'inputIncidentValue'],
                                                                                newInputValue
                                                                            )
                                                                        }}
                                                                        options={state.requestIncidentList}
                                                                        getOptionLabel={(option) => option.description}
                                                                        renderInput={(params) => (
                                                                            <TextField
                                                                                classes={fieldDisabled ? null : {root:classes.textFieldStyle}}
                                                                                {...params}
                                                                                fullWidth={true}
                                                                                InputLabelProps={{shrink: false}}
                                                                                //label={t('str_incident')}
                                                                                variant="outlined"
                                                                            />
                                                                        )}
                                                                    />
                                                                )}
                                                                {!state.newRequestStepper.isRequestActive &&
                                                                state.newRequestStepper.useRequestIncidentList ===
                                                                false && (
                                                                    <Typography
                                                                        variant="subtitle1"
                                                                        align="center"
                                                                        style={{
                                                                            border: '1px solid #efefef',
                                                                            padding: 25,
                                                                            lineHeight: 1,
                                                                            marginTop: 14,
                                                                        }}
                                                                    >
                                                                        {t('str_noModelCreateRequest')}
                                                                        <IconButton
                                                                            aria-label="continue"
                                                                            onClick={() =>
                                                                                setToState(
                                                                                    'userPortal',
                                                                                    [
                                                                                        'newRequestStepper',
                                                                                        'isRequestActive',
                                                                                    ],
                                                                                    true
                                                                                )
                                                                            }
                                                                        >
                                                                            <ArrowForwardIcon
                                                                                style={{ color: '#2196F3' }}
                                                                            />
                                                                        </IconButton>
                                                                    </Typography>
                                                                )}
                                                            </Grid>
                                                            <Grid item xs={12}>
                                                                {state.newRequestStepper.inputIncidentValue &&
                                                                state.newRequestStepper.tsolution &&
                                                                state.newRequestStepper.tsolution.length > 0 &&
                                                                !state.newRequestStepper.isRequestActive && (
                                                                    <React.Fragment>
                                                                        <MaterialTable
                                                                            title={t('str_solutions')}
                                                                            columns={tsolutionColumns}
                                                                            data={state.newRequestStepper.tsolution}
                                                                            localization={{
                                                                                body: {
                                                                                    emptyDataSourceMessage: t('str_noRecords'),
                                                                                    addTooltip: t('str_add'),
                                                                                    deleteTooltip: t('str_delete'),
                                                                                    editTooltip: t('str_edit'),
                                                                                    filterRow: {
                                                                                        filterTooltip: t('str_filter')
                                                                                    },
                                                                                    editRow: {
                                                                                        deleteText: t('str_confirmDeleteRecord'),
                                                                                        cancelTooltip: t('str_cancel'),
                                                                                        saveTooltip: t('str_save')
                                                                                    }
                                                                                },
                                                                                toolbar: {
                                                                                    searchTooltip: t('str_search'),
                                                                                    searchPlaceholder: t('str_search')
                                                                                },
                                                                                pagination: {
                                                                                    labelRowsSelect: t('str_line'),
                                                                                    labelDisplayedRows: t('str_labelDisplayedRows'),
                                                                                    firstTooltip: t('str_firstPage'),
                                                                                    previousTooltip: t('str_previousPage'),
                                                                                    nextTooltip: t('str_nextPage'),
                                                                                    lastTooltip: t('str_lastPage')
                                                                                }
                                                                            }}
                                                                        />
                                                                        <Typography
                                                                            variant="subtitle1"
                                                                            align="center"
                                                                            style={{
                                                                                border: '1px solid #efefef',
                                                                                padding: 25,
                                                                                lineHeight: 1,
                                                                                marginTop: 14,
                                                                            }}
                                                                        >
                                                                            {t('str_didSolutionHelp')}
                                                                            <Tooltip
                                                                                title={t('str_requestCanTerm')}
                                                                                aria-label="yes"
                                                                            >
                                                                                <IconButton
                                                                                    aria-label="done"
                                                                                    onClick={() => handleConfirm(true)}
                                                                                    disabled={
                                                                                        state.newRequestStepper
                                                                                            .isSaveRequest
                                                                                    }
                                                                                >
                                                                                    <DoneIcon
                                                                                        style={{ color: '#4CAF50' }}
                                                                                    />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                            <Tooltip
                                                                                title={t('str_continueRequestGeneration')}
                                                                                aria-label="no"
                                                                            >
                                                                                <IconButton
                                                                                    aria-label="continue"
                                                                                    onClick={() =>
                                                                                        setToState(
                                                                                            'userPortal',
                                                                                            [
                                                                                                'newRequestStepper',
                                                                                                'isRequestActive',
                                                                                            ],
                                                                                            true
                                                                                        )
                                                                                    }
                                                                                    disabled={
                                                                                        state.newRequestStepper
                                                                                            .isSaveRequest
                                                                                    }
                                                                                >
                                                                                    <ArrowForwardIcon
                                                                                        style={{ color: '#2196F3' }}
                                                                                    />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </Typography>
                                                                    </React.Fragment>
                                                                )}
                                                            </Grid>
                                                        </React.Fragment>
                                                    )}
                                                </React.Fragment>
                                            )
                                    }
                                </Grid>
                            </React.Fragment>
                        )}
                    </Grid>
                    <Grid item xs={12}>
                        <Grid
                            container
                            direction="row"
                            justify="flex-end"
                            alignItems="center"
                            spacing={1}
                        >
                            <Grid item>
                                <Button
                                    startIcon={state.defMyRequest?.transno && state.newRequestStepper.activeStep === state.newRequestStepper.reqSteps.details ? <ClearIcon /> : state.newRequestStepper.activeStep === state.newRequestStepper.reqSteps.about ? <ClearIcon /> : <ArrowBackIcon />}
                                    color={'primary'}
                                    variant={'outlined'}
                                    disabled={state.newRequestStepper.isSaveRequest}
                                    onClick={() => state.defMyRequest?.transno && state.newRequestStepper.activeStep === state.newRequestStepper.reqSteps.details ? closeDialogButtonHandler() : state.newRequestStepper.activeStep === state.newRequestStepper.reqSteps.about ? closeDialogButtonHandler() : handleBack()}
                                    className={classes.backButton}
                                >
                                    {state.defMyRequest?.transno && state.newRequestStepper.activeStep === state.newRequestStepper.reqSteps.details ? t('str_cancel') : state.newRequestStepper.activeStep === state.newRequestStepper.reqSteps.about ? t('str_cancel') : t('str_back')}
                                </Button>
                            </Grid>
                            <Grid item>
                                {
                                    (state.newRequestStepper.isTrainingRequest &&
                                        state.newRequestStepper.activeStep === newRequestSteps.details &&
                                        !state.newRequestStepper.confirmTermsAndCondition) ?
                                        <CustomToolTip title={t("str_termsAndConditionsMsg")} placement={"top"} arrow>
                                            <div>
                                                <Button
                                                    className={classes.buttonStyle}
                                                    endIcon={<ArrowForwardIcon />}
                                                    variant="contained"
                                                    startIcon={state.newRequestStepper.activeStep === (steps.length - 1) ? isStartSaveRequest ? <LoadingSpinner size={16}/> : <DoneIcon /> : null}
                                                    disabled={
                                                        (state.newRequestStepper.isTrainingRequest && state.newRequestStepper.activeStep === newRequestSteps.details &&
                                                            !state.newRequestStepper.confirmTermsAndCondition) ||
                                                        (state.newRequestStepper.activeStep === newRequestSteps.details &&
                                                            state.newRequestStepper.isTransTypeTsForm &&
                                                            !state.newRequestStepper.isRequestActive) ||
                                                        state.newRequestStepper.isSaveRequest
                                                    }
                                                    onClick={handleNext}
                                                >
                                                    {state.newRequestStepper.activeStep === steps.length - 1 ?
                                                        t('str_save')
                                                        : t('str_next')
                                                    }
                                                </Button>
                                            </div>
                                        </CustomToolTip>
                                        :
                                        <Button
                                            color={'primary'}
                                            variant="contained"
                                            startIcon={state.newRequestStepper.activeStep === (steps.length - 1) ? isStartSaveRequest ? <LoadingSpinner size={16}/> : <DoneIcon /> : null}
                                            endIcon={state.newRequestStepper.activeStep !== (steps.length - 1) && <ArrowForwardIcon />}
                                            disabled={
                                                (state.newRequestStepper.activeStep === newRequestSteps.about && isSelectTaskType) ||
                                                (state.newRequestStepper.isTrainingRequest && state.newRequestStepper.activeStep === newRequestSteps.details &&
                                                    !state.newRequestStepper.confirmTermsAndCondition) ||
                                                (state.newRequestStepper.activeStep === newRequestSteps.details &&
                                                    state.newRequestStepper.isTransTypeTsForm &&
                                                    !state.newRequestStepper.isRequestActive) ||
                                                state.newRequestStepper.isSaveRequest || (state.newRequestStepper.activeStep === newRequestSteps.about && isLoading)
                                            }
                                            onClick={handleNext}
                                        >
                                            {state.newRequestStepper.activeStep === steps.length - 1
                                                ? t('str_save')
                                                : t('str_next')}
                                        </Button>
                                }
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Container>
            <TrackedChangesDialog
                open={openTrackedDialog}
                onPressNo={(e) => {
                    setOpenTrackedDialog(e);
                }}
                onPressYes={(e) => {
                    setOpenTrackedDialog(e);
                    closeDialog();
                    state.newRequestStepper.activeStep = 0;
                    handleRequestReset();
                }}
            />
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

export default connect(mapStateToProps, mapDispatchToProps)(NewRequestStepper)
