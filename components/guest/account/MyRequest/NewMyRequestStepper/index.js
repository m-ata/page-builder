import React, {useContext, useEffect, useState} from 'react'
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton} from '@material-ui/core'
import {setToState} from "../../../../../state/actions";
import {connect, useSelector} from "react-redux";
import RequestTypeSelection from "./steps/RequestTypeSelection";
import useTranslation from "../../../../../lib/translations/hooks/useTranslation";
import BackIcon from "@material-ui/icons/KeyboardBackspace";
import ClearIcon from "@material-ui/icons/Clear";
import CheckIcon from "@material-ui/icons/Check";
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import LoadingSpinner from "../../../../LoadingSpinner";
import RequestDescStep from "./steps/RequestDescStep";
import {CustomToolTip} from "../../../../user-portal/components/CustomToolTip/CustomToolTip";
import Typography from "@material-ui/core/Typography";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Stepper from "@material-ui/core/Stepper";
import StepConnector from "@material-ui/core/StepConnector";
import clsx from "clsx";
import ListIcon from "@material-ui/icons/List";
import PhotoCameraIcon from "@material-ui/icons/PhotoCamera";
import DoneIcon from "@material-ui/icons/Done";
import {makeStyles} from "@material-ui/core/styles";
import {Insert, Patch, Upload} from "@webcms/orest";
import {isErrorMsg, OREST_ENDPOINT} from "../../../../../model/orest/constants";
import {sendGuestChangeNotifyMail} from "../../Base/helper";
import WebCmsGlobal from "../../../../webcms-global";
import {useSnackbar} from "notistack";
import ConfirmStep from "./steps/ConfirmStep";
import TrackedChangesDialog from "../../../../TrackedChangesDialog";
import CloseIcon from "@material-ui/icons/Close";
import AgencyRequest from "../AgencyRequest";
import utfTransliteration from '@webcms-globals/utf-transliteration'


const useStyles = makeStyles((theme) => ({
    stepperRoot: {
        '& .MuiStep-horizontal': {
            paddingLeft: 0,
            paddingRight: 0
        },
    },
    stepRoot: {
        '& .MuiStepLabel-iconContainer': {
            paddingRight: 0
        }
    },
    dialogKiosk: {
        marginTop: -285
    },
}))

const useColorlibStepIconStyles = makeStyles(theme => ({
    root: {
        backgroundColor: '#ccc',
        zIndex: 1,
        padding: 10,
        color: '#fff',
        display: 'flex',
        borderRadius: '50%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    active: {
        backgroundImage: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.main,
        boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
    },
    completed: {
        backgroundColor: theme.palette.primary.main,
        backgroundImage: theme.palette.primary.main,
    },
}));

const connectorStyle = makeStyles(theme => ({
    alternativeLabel: {
        top: 22,
    },
    active: {
        '& .MuiStepConnector-lineHorizontal': {
            backgroundImage: 'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
            borderColor: theme.palette.primary.main,
        },
    },
    completed: {
        '& .MuiStepConnector-lineHorizontal': {
            backgroundImage: 'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
            borderColor: theme.palette.primary.main,
        },
    },
    line: {
        height: 3,
        border: 0,
        backgroundColor: '#eaeaf0',
        borderRadius: 1,
    },
}))

function NewMyRequestStepper(props) {
    const classes = useStyles()
        , { state, setToState, isClient, refreshList, isInitialStateLoad, isDefLoading, isKiosk, getData, setGetData, isTsTypeLoading } = props
        , {enqueueSnackbar} = useSnackbar()
        , {GENERAL_SETTINGS} = useContext(WebCmsGlobal)
        , {t} = useTranslation()
        , {transliteration} = utfTransliteration()
        , token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
        , clientBase = useSelector((state) => state?.orest?.state?.client || false)
        , reservBase = useSelector((state) => state?.formReducer?.guest?.clientReservation || false)
        , changeHotelRefno = useSelector((state) => state?.formReducer?.guest?.changeHotelRefno || false)
        , hotelRefNo = reservBase?.hotelrefno || changeHotelRefno || GENERAL_SETTINGS.HOTELREFNO


    const initialState = {
        accid: {value: null, isRequired: true, isError: false, helperText: false},
        transtype: {value: null, isRequired: true, isError: false, helperText: false},
        tsdescid: {value: null, isRequired: true, isError: false, helperText: false},
        note: {value: '', isRequired: true, isError: false, helperText: false},
        tscatid: {value: null, isRequired: false, isError: false, helperText: false},
        tstypeid: {value: null, isRequired: false, isError: false, helperText: false}
    }
    const [openTrackedDialog, setOpenTrackedDialog] = useState(false);
    const [openTooltip, setOpenTooltip] = useState(false)

    const handleBack = () => {
        if (state.currentStep === state.steps.requestType) {
            handleClose()
        } else {
            if (state.currentStep === state.steps.confirm) {
                handleClose()
            } else {
                setToState('guest', ['myRequest', 'currentStep'], state.currentStep - 1)
            }
        }
    }

    const handleClose = () => {
        if (state.currentStep === state.steps.confirm) {
            setToState('guest', ['myRequest', 'openDialog'], false)
            setTimeout(() => {
                handleReset()
            }, 100)
            typeof refreshList === 'function' && refreshList()
        } else {
            const data = JSON.stringify(state.requestData)
            const baseData = JSON.stringify(state.requestDataBase)
            if (data !== baseData || state.currentStep > state.steps.requestType) {
                setOpenTrackedDialog(true)
            } else {
                setToState('guest', ['myRequest', 'openDialog'], false)
                setTimeout(() => {
                    handleReset()
                }, 100)
            }
        }

    }

    const handleNext = () => {
        if (state.currentStep === state.steps.requestDescription) {
            handleSave()
        } else {
            setToState('guest', ['myRequest', 'currentStep'], state.currentStep + 1)
        }
    }

    const handleSave = async () => {
        setToState('guest', ['myRequest', 'isSaving'], true)

        if (Number(changeHotelRefno) !== Number(reservBase?.hotelrefno)) {
            enqueueSnackbar(t('str_youCanOnlyCreateARequestFromTheHotelYouAreStayingAt'), {variant: 'warning'})
            return false
        }

        const requestResponse = await handleInsertTask()
        if (state.fileList.length > 0) {
            await handleUploadImage(requestResponse?.mid, state.fileList)
        }
        if (isClient) {
            const notifyValues = {
                "roomno": reservBase?.roomno || "",
                "clientname": transliteration(clientBase.clientname) || "",
                "request": t(requestResponse.description, false, GENERAL_SETTINGS.hotelLocalLangGCode) || "",
                "description": requestResponse.note || ""
            }
            await sendGuestChangeNotifyMail('tstrans', 'upd', clientBase.id, clientBase.gid, reservBase.gid, reservBase.reservno, notifyValues, reservBase?.hotelrefno || GENERAL_SETTINGS.HOTELREFNO)
        }
        setToState('guest', ['myRequest', 'isSaving'], false)
        setToState('guest', ['myRequest', 'requestNumber'], requestResponse?.transno || '')
        requestResponse && setToState('guest', ['myRequest', 'currentStep'], state.steps.confirm)
        if(!isClient) {
            setToState('guest', ['myRequest', 'openDialog'], false)
            typeof refreshList === 'function' && refreshList()
            setTimeout(() => {
                handleReset()
            }, 100)
        }
    }

    const handleInsertTask = async () => {
        const data = {...state.requestData}

        Object.keys(initialState).map((key) => {
            if (data[key].value) {
                data[key] = typeof data[key].value === 'object' ? key === 'transtype' ?  data[key].value?.code : data[key].value?.id : data[key].value
            } else {
                data[key] = null
            }
        })

        data.description = state.requestData.tsdescid.value?.description || state.tsDescFromDialog?.description || data.note || ''
        data.requestedbyid = clientBase.id
        data.requestedby = transliteration(clientBase?.fullname || '')
        data.accid = isClient ? clientBase.id : data.accid
        data.hotelrefno = hotelRefNo
        if (getData) {
            return Patch({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.TSTRANS,
                token: token,
                gid: getData?.gid,
                params: {
                    hotelrefno: hotelRefNo
                },
                data: data,
            }).then(res => {
                if (res.status === 200) {
                    !isClient && enqueueSnackbar(t('str_updateIsSuccessfullyDone'), {variant: 'success'})
                    return res.data.data
                } else {
                    const retErr = isErrorMsg(res)
                    enqueueSnackbar(retErr.errMsg, {variant: 'error'})
                    return false
                }
            })
        } else {
            return Insert({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.TSTRANS,
                token: token,
                params: {
                    hotelrefno: hotelRefNo
                },
                data: data,
            }).then(res => {
                if (res.status === 200) {
                    !isClient && enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'})
                    return res.data.data
                } else {
                    const retErr = isErrorMsg(res)
                    enqueueSnackbar(retErr.errMsg, {variant: 'error'})
                    return false
                }
            })
        }

    }

    const handleUploadImage = async (mid, files) => {
        if (mid) {
            return Upload({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                token: token,
                params: {
                    masterid: mid,
                    orsactive: true,
                    hotelrefno: hotelRefNo
                },
                files: files,
            }).then(res => {
                if (res.status === 200) {
                    return true
                } else {
                    const retErr = isErrorMsg(res)
                    enqueueSnackbar(retErr.errMsg, {variant: 'error'})
                    return false
                }
            })
        }
    }

    const handleReset = () => {
        setToState('guest', ['myRequest', 'requestData'], initialState)
        setToState('guest', ['myRequest', 'requestDataBase'], initialState)
        setToState('guest', ['myRequest', 'fileList'], [])
        setToState('guest', ['myRequest', 'requestNumber'], '')
        setToState('guest', ['myRequest', 'getData'], null)
        setToState('guest', ['myRequest', 'currentStep'], state.steps.requestType)
        typeof setGetData === 'function' && setGetData(null)
    }

    const ColorlibConnector = (props) => {
        const classes = connectorStyle()
        const {active, completed} = props


        return (
            <StepConnector
                className={clsx('', {
                    [classes.active]: active,
                    [classes.completed]: completed,
                })}
            />
        )
    }

    const ColorLibStepIcon = (props) => {
        const classes = useColorlibStepIconStyles();
        const {active, completed} = props;

        const icons = {
            1: <ListIcon/>,
            2: <PhotoCameraIcon/>,
            3: <DoneIcon/>,
        };

        return (
            <div
                className={clsx(classes.root, {
                    [classes.active]: active,
                    [classes.completed]: completed,
                })}
            >
                {icons[String(props.icon)]}
            </div>
        );
    }

    return (
        <React.Fragment>
            <Dialog
                fullWidth
                open={state.openDialog}
                maxWidth={isClient ? 'xs' : 'sm'}
                aria-labelledby="add-new-request-dialog-title"
                aria-describedby="add-new-request-dialog-description"
                classes={{ paper: clsx(null, { [classes.dialogKiosk]: isKiosk }) }}
                disableEnforceFocus
            >
                <DialogTitle>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        {!state.isSaving ? getData ? t('str_edit') : t('str_newRequest') : ''}
                        <IconButton
                            size={'small'}
                            disabled={state.isSaving}
                            style={{marginLeft: 'auto'}}
                            onClick={() => handleClose()}
                        >
                            <CloseIcon/>
                        </IconButton>
                    </div>

                </DialogTitle>
                <DialogContent dividers>
                    {isClient ? (
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Stepper className={classes.stepperRoot} activeStep={state.currentStep}
                                             connector={<ColorlibConnector/>}>
                                        {Object.keys(state.steps).map((label) => (
                                            <Step className={classes.stepRoot} key={label}>
                                                <StepLabel StepIconComponent={ColorLibStepIcon}/>
                                            </Step>
                                        ))}
                                    </Stepper>
                                </Grid>
                                <Grid item xs={12}>
                                    {
                                        state.currentStep === state.steps.requestType ? (
                                            <RequestTypeSelection isTsTypeLoading={isTsTypeLoading}/>
                                        ) : state.currentStep === state.steps.requestDescription ? (
                                            <RequestDescStep getData={getData}/>
                                        ) : state.currentStep === state.steps.confirm ? (
                                            <ConfirmStep/>
                                        ) : null
                                    }
                                </Grid>
                            </Grid>
                        ) : (
                            <AgencyRequest isInitialStateLoad={isInitialStateLoad} isDefLoading={isDefLoading}/>
                        )
                    }
                </DialogContent>
                <DialogActions>
                    {
                        isClient ? (
                            <React.Fragment>
                                <Button
                                    color={'primary'}
                                    onClick={() => handleBack()}
                                    startIcon={state.currentStep === state.steps.requestType ?
                                        <ClearIcon/> : state.currentStep !== state.steps.confirm ? <BackIcon/> : null}
                                    disabled={state.isSaving}
                                    variant={'outlined'}
                                >
                                    {state.currentStep === state.steps.requestType ? t('str_cancel') : state.currentStep === state.steps.confirm ? t('str_close') : t('str_back')}
                                </Button>
                                {
                                    !state.requestData?.transtype?.value || (state.currentStep === state.steps.requestDescription && state.requestData.note.value?.length <= 0) ? (
                                        <CustomToolTip
                                            title={
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
                                                        !state.requestData?.transtype?.value && (
                                                            <Typography
                                                                style={{fontSize: 'inherit'}}>{t('str_requestType')}</Typography>
                                                        )
                                                    }
                                                    {
                                                        state.requestData.note.value?.length <= 0 && (
                                                            <Typography
                                                                style={{fontSize: 'inherit'}}>{t('str_description')}</Typography>
                                                        )
                                                    }
                                                </div>
                                            }
                                        >
                                            <span>
                                                <Button
                                                    color={'primary'}
                                                    startIcon={state.currentStep === state.steps.requestDescription ? state.isSaving ? <LoadingSpinner size={18}/> : <CheckIcon/> : null}
                                                    endIcon={state.currentStep !== state.steps.requestDescription && <ArrowRightAltIcon/>}
                                                    disabled
                                                    variant={'contained'}
                                                >
                                                    {state.currentStep === state.steps.requestDescription ? t('str_save') : t('str_next')}
                                                </Button>
                                            </span>
                                        </CustomToolTip>
                                    ) : (
                                        state.currentStep !== state.steps.confirm && (
                                            <Button
                                                color={'primary'}
                                                onClick={() => handleNext()}
                                                startIcon={state.currentStep === state.steps.requestDescription ? state.isSaving ? <LoadingSpinner size={18}/> : <CheckIcon/> : null}
                                                endIcon={state.currentStep !== state.steps.requestDescription &&
                                                <ArrowRightAltIcon/>}
                                                disabled={state.isSaving}
                                                variant={'contained'}
                                            >
                                                {state.currentStep === state.steps.requestDescription ? t('str_save') : t('str_next')}
                                            </Button>
                                        )
                                    )
                                }
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <Button
                                    color={'primary'}
                                    onClick={() => handleClose()}
                                    startIcon={<ClearIcon />}
                                    disabled={state.isSaving}
                                    variant={'outlined'}
                                >
                                    {state.currentStep === state.steps.requestType ? t('str_cancel') : state.currentStep === state.steps.confirm ? t('str_close') : t('str_back')}
                                </Button>
                                <CustomToolTip
                                    open={openTooltip}
                                    onOpen={() => (!state.requestData.transtype.value || !state.requestData.tsdescid.value) && setOpenTooltip(true) }
                                    onClose={() => setOpenTooltip(false)}
                                    title={
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
                                                !state.requestData?.transtype?.value && (
                                                    <Typography style={{fontSize: 'inherit'}}>{t('str_requestType')}</Typography>
                                                )
                                            }
                                            {
                                                !state.requestData.tsdescid.value && (
                                                    <Typography style={{fontSize: 'inherit'}}>{t('str_request')}</Typography>
                                                )
                                            }
                                        </div>
                                    }
                                >
                                    <div>
                                        <Button
                                            color={'primary'}
                                            onClick={() => (!state.requestData.transtype.value || !state.requestData.tsdescid.value || state.isSaving) ? {} : handleSave()}
                                            startIcon={state.isSaving ? <LoadingSpinner size={18}/> : <CheckIcon/>}
                                            disabled={!state.requestData.transtype.value || !state.requestData.tsdescid.value || state.isSaving}
                                            variant={'contained'}
                                        >
                                            {t('str_save')}
                                        </Button>
                                    </div>
                                </CustomToolTip>
                            </React.Fragment>
                        )
                    }
                </DialogActions>
            </Dialog>
            <TrackedChangesDialog
                open={openTrackedDialog}
                onPressNo={(e) => {
                    setOpenTrackedDialog(e);
                }}
                onPressYes={(e) => {
                    setOpenTrackedDialog(e);
                    setToState('guest', ['myRequest', 'openDialog'], false)
                    setTimeout(() => {
                        handleReset()
                    }, 100)
                }}
            />
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest.myRequest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(NewMyRequestStepper)

