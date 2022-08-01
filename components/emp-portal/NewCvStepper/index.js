import React, { useContext, useState } from 'react'
import { setToState, updateState } from '../../../state/actions'
import { connect, useSelector } from 'react-redux'
import { AppBar, Button, Dialog, Grid, IconButton, StepConnector, Toolbar } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import CheckIcon from '@material-ui/icons/Check'
import PersonalInformation from './steps/PersonalInformation'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import QontoStepIcon from '../../user-portal/components/StepperComponent/QontoStepIcon'
import { makeStyles } from '@material-ui/core/styles'
import useTranslation from '../../../lib/translations/hooks/useTranslation'
import ProfileStep from './steps/ProfileStep'
import EducationStep from './steps/EducationStep'
import WorkHistoryStep from './steps/WorkHistoryStep'
import SkillsStep from './steps/SkillsStep'
import { UseOrest } from '@webcms/orest'
import WebCmsGlobal from '../../webcms-global'
import { OREST_ENDPOINT, REQUEST_METHOD_CONST } from '../../../model/orest/constants'
import LoadingSpinner from '../../LoadingSpinner'
import {useSnackbar} from "notistack";

const useStyles = makeStyles((theme) => ({
    alternativeLabel: {
        top: 'calc(50% - 20px)',
        padding: "0 12px"
    },
    active: {
        '& $line': {
            //backgroundImage: 'linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)',
            backgroundColor: theme.palette.primary.main,
        },
    },
    completed: {
        '& $line': {
            backgroundColor: theme.palette.primary.main,
        },
    },
    line: {
        height: 2,
        border: 0,
        backgroundColor: theme.palette.primary.main,
        borderRadius: 1,
    },
}));


function NewCvStepper(props) {
    const classes = useStyles();
    const {t} = useTranslation()

    const {state, setToState, refreshList, updateState} = props

    const {enqueueSnackbar} = useSnackbar();

    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    const token = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false)
    const loginfo = useSelector((state) => state?.orest?.currentUser?.loginfo || false);
    const hotelRefNo = useSelector(state => state?.hotelinfo?.currentHotelRefNo || GENERAL_SETTINGS.HOTELREFNO || null);

    const [isSaving, setIsSaving] = useState(false)

    const cvSteps = {
        [t('str_personalInformation')]: 0,
        [t('str_profile')]: 1,
        [t('str_education')]: 2,
        [t('str_workHistory')]: 3,
        [t('str_skills')]: 4
    }

    const handleNext = async () => {
        if (state.activeStep < Object.keys(cvSteps).length - 1) {
            setToState('employeePortal', ['activeStep'], state.activeStep + 1)
        } else if(state.activeStep === cvSteps[t('str_skills')]) {
            await handleSave().then(() => {
                setIsSaving(false)
                handleClose()
                enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'})
            })
        }
    }
    const handleBack = () => {
        if (state.activeStep > 0) setToState('employeePortal', ['activeStep'], state.activeStep - 1)
    }

    const handleClose = () => {
        setToState('employeePortal', ['openCvDialog'], false)
        updateState('employeePortal', ['empEduData'], state?.initialEmpEduData)
        updateState('employeePortal', ['empWorkData'], state?.initialEmpWorkData)
        updateState('employeePortal', ['empRefData'], state?.initialEmpRefData)
        updateState('employeePortal', ['empAbilityData'], state?.initialEmpAbilityData)
        updateState('employeePortal', ['empLangData'], state?.initialEmpLangData)
        setTimeout(() => {
            refreshList()
            setToState('employeePortal', ['activeStep'], 0)
            setToState('employeePortal', ['personalData'], state?.initialPersonalData)
        }, 500)
    }

    const handleSave = async () => {
        const
            employee = state.personalData,
            empCv = state.empCvData,
            secondaryInfo = {
                empedu: state.empEduData,
                empwork: state.empWorkData,
                empref: state.empRefData,
                empability: state.empAbilityData,
                emplang: state.empLangData,
            }

        setIsSaving(true)
        for(let key of Object.keys(secondaryInfo)) {
            let arrayData = []
            let objectData = {}

            if(Array.isArray(secondaryInfo[key])) {
                objectData = false
                secondaryInfo[key].map((item) => {
                    const arrayObject = {}
                    arrayObject.empid = loginfo?.id
                    Object.keys(item).map((field) => {
                        arrayObject[field] = typeof item[field]?.value === 'object' ? item[field].value?.id : item[field]?.value
                    })
                    arrayData.push(arrayObject)
                })
            }

            const isDelFinish = await handleListDel(key)
            if(isDelFinish) {
                await handleListIns(key, arrayData)
            }
        }

        let empObjData = {}
        Object.keys(employee).map((field) => {
            if(typeof employee[field]?.value === 'object' && employee[field]?.value?.id){
                empObjData[field] =  employee[field].value.id || null
            }else {
                empObjData[field] =  employee[field].value || null
            }
        })
        await objUpdate('employee', empObjData)

        let empCvObjData = {}
        Object.keys(empCv).map((field) => {
            if(typeof empCv[field] === 'object' && empCv[field]?.id){
                empCvObjData[field] = field === 'maritalstatus' ? empCv[field].code || null : empCv[field].id || null
            }else {
                empCvObjData[field] =  empCv[field] || null
            }
        })
        await objUpdate('empcv', empCvObjData)

        return true
    }

    const objUpdate = async (table, data) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: table + '/' + OREST_ENDPOINT.LISTPATCH,
            method: REQUEST_METHOD_CONST.PATCH,
            token,
            params: {
                hotelrefno: hotelRefNo,
            },
            data: [data]
        }).then(res => {
            return res.status === 200;
        })
    }

    const handleListDel = async (tableName) => {
       return UseOrest({
           apiUrl: GENERAL_SETTINGS.OREST_URL,
           endpoint: tableName + '/' + OREST_ENDPOINT.LISTDEL,
           method: REQUEST_METHOD_CONST.DELETE,
           token,
           params: {
               query: `empid:${loginfo?.id}`,
               hotelrefno: hotelRefNo,
           },
       }).then(res => {
           return res.status === 200;
       })
    }

    const handleListIns = async (tableName, data) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: tableName + '/' + OREST_ENDPOINT.LISTINS,
            method: REQUEST_METHOD_CONST.POST,
            token,
            params: {
                hotelrefno: hotelRefNo,
            },
            data: data
        }).then(res => {
            return res.status === 200;
        })
    }

    return (
        <Dialog
            fullScreen
            open={state.openCvDialog}
            disableEnforceFocus
        >
            <AppBar color={'primary'} position={'static'}>
                <Toolbar style={{justifyContent: 'right'}}>
                    <IconButton onClick={handleClose}>
                        <CloseIcon style={{color: '#FFF'}}/>
                    </IconButton>
                </Toolbar>
            </AppBar>
            <div style={{padding: '16px 32px'}}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Stepper
                            activeStep={state.activeStep}
                            alternativeLabel
                            connector={
                                <StepConnector
                                    classes={{
                                        alternativeLabel: classes.alternativeLabel,
                                        active: classes.active,
                                        completed: classes.completed,
                                        line: classes.line
                                    }}
                                />
                            }
                        >
                            {Object.keys(cvSteps).map((label) => (
                                <Step key={label}>
                                    <StepLabel
                                        StepIconComponent={(e) => QontoStepIcon(Object.assign({}, e, {width: 64}))}>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Grid>
                    <Grid item xs={12}>
                        <div style={{paddingBottom: 24}}/>
                        {
                            state.openCvDialog ? (
                                state.activeStep === cvSteps[t('str_personalInformation')] ? (
                                    <PersonalInformation onChangePage={(personalData) => handleNext(personalData)}/>
                                ) : state.activeStep === cvSteps[t('str_profile')] ? (
                                    <ProfileStep/>
                                ) : state.activeStep === cvSteps[t('str_education')] ? (
                                    <EducationStep/>
                                ) : state.activeStep === cvSteps[t('str_workHistory')] ? (
                                    <WorkHistoryStep/>
                                ) : state.activeStep === cvSteps[t('str_skills')] ? (
                                    <SkillsStep/>
                                ) : null
                            ) : null
                        }
                    </Grid>
                    <Grid item xs={12} style={{textAlign: 'right'}}>
                        <Button
                            style={{marginRight: '8px'}}
                            disabled={state.activeStep === cvSteps[t('str_personalInformation')]}
                            size={'large'}
                            color={'primary'}
                            variant={'outlined'}
                            onClick={handleBack}
                        >
                            {t('str_back')}
                        </Button>
                        <Button
                            startIcon={state.activeStep === cvSteps[t('str_skills')] && <CheckIcon/>}
                            disabled={isSaving}
                            size={'large'}
                            color={'primary'}
                            variant={'contained'}
                            onClick={handleNext}
                        >
                            {isSaving && <LoadingSpinner size={24}/>}
                            {state.activeStep < cvSteps[t('str_skills')] ? t('str_next') : t('save')}
                        </Button>
                    </Grid>
                </Grid>

            </div>
        </Dialog>
    )


}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.employeePortal,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(NewCvStepper)