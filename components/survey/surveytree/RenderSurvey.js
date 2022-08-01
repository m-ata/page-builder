import React, { useCallback, useContext, useEffect, useState } from 'react'
import Button from '@material-ui/core/Button'
import {useSelector} from 'react-redux'
import { OREST_ENDPOINT, REQUEST_METHOD_CONST, ROLETYPES } from '../../../model/orest/constants'
import WebCmsGlobal from '../../webcms-global'
import useNotifications from '../../../model/notification/useNotifications'
import Grid from '@material-ui/core/Grid'
import axios from 'axios'
import {CircularProgress} from '@material-ui/core'
import {makeStyles} from '@material-ui/core/styles'
import styles from './style/RenderSurvey.style'
import CheckCircleOutlinedIcon from '@material-ui/icons/CheckCircleOutlined'
import {useRouter} from 'next/router'
import useSurveyAction from '../../../model/survey/useSurveyAction'
import OnePageSurvey from './render-types/OnePageSurvey'
import {Upload, UseOrest} from '@webcms/orest'
import LoadingSpinner from '../../LoadingSpinner'
import {Pagination, PaginationItem} from '@material-ui/lab'
import GroupPerPageSurvey from './render-types/GroupPerPageSurvey'
import QuestionPerPageSurvey from './render-types/QuestionPerPageSurvey'
import IconButton from '@material-ui/core/IconButton'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import {
    SURVEY_DISPLAY_TYPE_GROUP,
    SURVEY_DISPLAY_TYPE_ONE_PAGE,
    SURVEY_DISPLAY_TYPE_QUESTION,
    SURVEY_DISPLAY_TYPE_SUB_GROUP,
} from '../../../model/survey/constants'
import useTranslation from "lib/translations/hooks/useTranslation"
import { LocaleContext } from 'lib/translations/context/LocaleContext'
import useWidth from '@webcms-ui/hooks/use-width'
import { useSnackbar } from 'notistack'
import { sendGuestChangeNotifyMail } from '../../guest/account/Base/helper'
import { connect } from 'react-redux'
import TrackedChangesDialog from "../../TrackedChangesDialog"
import utfTransliteration from '@webcms-globals/utf-transliteration'

const useStyles = makeStyles(styles)

function RenderOptions(props) {
    const {survey, displayType} = props

    if (displayType === SURVEY_DISPLAY_TYPE_ONE_PAGE) {
        //0 - Single Page
        return <OnePageSurvey options={survey} displayType={displayType}/>
    } else if (displayType === SURVEY_DISPLAY_TYPE_GROUP) {
        //1 - Group Per Page
        return <GroupPerPageSurvey options={survey} displayType={displayType}/>
    } else if (displayType === SURVEY_DISPLAY_TYPE_SUB_GROUP) {
        //2 - SubGroup Per Page
        //TODO - Change this later
        return <GroupPerPageSurvey options={survey} displayType={displayType}/>
    } else if (displayType === SURVEY_DISPLAY_TYPE_QUESTION) {
        //9 - Question Per Page
        return <QuestionPerPageSurvey options={survey} displayType={displayType}/>
    } else {
        //if null - default display type
        return <OnePageSurvey options={survey} displayType={displayType}/>
    }
}

const RenderSurvey = (props) => {
    const { state, survey, surveygid, surveyrefno, clientid, isOnlyOneQuestionRender, questionLength, handleOpenSurveyDialog, onlyQuestions, handleReset, onlyGroups, noRequiredCheck } = props
        , width = useWidth()
        , classes = useStyles()
        , {GENERAL_SETTINGS} = useContext(WebCmsGlobal)
        , {t} = useTranslation()
        , { transliteration } = utfTransliteration()
        , router = useRouter()
        , surveyGid = router.query.surveyGid || surveygid
        , surveyHotelRefno = router.query.hotelrefno || surveyrefno
        , reftoken = router.query.reftoken
        , isOweb = router?.query?.isOweb === '1'
        , isGapp = router?.query?.isGapp === 'true' || false
        , clientGid = router?.query?.clientGid || false
        , empGid = router?.query?.empGid || false
        , { enqueueSnackbar } = useSnackbar()
        , clientBase = useSelector((state) => state?.orest?.state?.client || false)
        , changeHotelRefNo = useSelector((state) => state?.formReducer?.guest?.changeHotelRefno || null)
        , isPortal = GENERAL_SETTINGS.ISPORTAL

    const trySavingAgainAction = () =>  {
        return (
            <React.Fragment>
                <Button onClick={() => handleClickSaveSurvey()} color="inherit">
                    {t('str_tryAgain')}
                </Button>
            </React.Fragment>
        )
    }

    let infoLogin = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)

    //redux
    const {showError} = useNotifications()
        , {setSurveyIsValid, setSurveyPage, setSurveyGroup} = useSurveyAction()
        , token = reftoken || useSelector((state) => state.orest.currentUser !== null && state.orest.currentUser.auth.access_token)
        , reservBase = state.clientReservation || false
        , { locale } = useContext(LocaleContext)
        , refid = router?.query?.refid || clientid || infoLogin?.id || null


    if(!infoLogin && refid && surveyHotelRefno){
        infoLogin = {
            refid: refid,
            hotelrefno: surveyHotelRefno
        }
    }

    let clientParams = {}
    clientParams.hotelrefno = infoLogin && infoLogin.hotelrefno
    clientParams.isportal = isPortal
    clientParams.surveyrefno = surveyrefno
    clientParams.isgapp = isGapp

    if(isPortal) {
        clientParams.portalrefno = changeHotelRefNo;
    }

    if(GENERAL_SETTINGS.ISCHAIN &&  String(clientParams.hotelrefno) !== String(GENERAL_SETTINGS.HOTELREFNO)){
        clientParams.chainid = infoLogin && infoLogin.hotelrefno
        clientParams.ischain = true
    }

    const surveyTrans = useSelector((state) => state.survey.trans)
        , surveyIsValid = useSelector((state) => state.survey.isValid)
        , displayType = useSelector((state) => state.survey.displayType)
        , surveyAnswers = useSelector((state) => state.survey.answers[surveyTrans])
        , surveyFiles = useSelector((state) => state.survey.files[surveyTrans])
        , surveyPage = useSelector((state) => state.survey.page)
        , surveyLastPage = useSelector((state) => state.survey.lastPage)
        , surveyGroup = useSelector((state) => state.survey.group)
        , surveyLastGroup = useSelector((state) => state.survey.lastGroup)
        , surveyThankYouFile = useSelector((state) => state.survey.thankYouFile)

    //state
    const [isSaving, setIsSaving] = useState(false)
        , [surveySaved, setSurveySaved] = useState(false)
        , [showSurveyAnyway, setShowSurveyAnyway] = useState(false)
        , [confirmationNumber, setConfirmationNumber] = useState(null)
        , [sendClientMail, setSendClientMail] = useState(false)
        , [clientMail, setClientMail] = useState(null)
        , [isFilesUploading, setIsFilesUploading] = useState(false)
        , [openTrackedDialog, setOpenTrackedDialog]= useState(false)

    useEffect(()=> {
        if(surveyIsValid && isOweb){
            setShowSurveyAnyway(true)
        }

    }, [surveyIsValid])

    const handleSave = () => {
        const answerList = Object.keys(surveyAnswers).length
        if(answerList < questionLength) {
            setOpenTrackedDialog(true)
        } else {
            handleClickSaveSurvey()
        }
    }

    const handleClickSaveSurvey = () => {
        const data = []
        let checkRequired = true
        let checkRequiredGroup = true


        if(!noRequiredCheck && onlyGroups && onlyGroups?.length > 0) {
            onlyGroups.map((item) => {
                if (item.isreq) {
                    item.children.map((question) => {                    
                        const reqAnswer = surveyAnswers?.[question.id]
                        if (!reqAnswer) {
                            checkRequiredGroup = false
                        }
                    })
                  
                }
            })
        }
        
        if(!surveyAnswers || surveyAnswers && !Object.keys(surveyAnswers)?.length > 0){
            enqueueSnackbar(t('str_atLeastOneQuestionMustBeAnswered'), { variant: 'info', autoHideDuration: 3000 })
            return
        }

        //prepare survey answers to be sent    
        if (surveyAnswers) {
            if(!noRequiredCheck) {
                onlyQuestions.map((item) => {
                    if (item.isreq) {
                        const reqAnswer = surveyAnswers?.[item.id]
                        if (!reqAnswer) {
                            checkRequired = false
                        }
                    }
                })
            }
         
            Object.keys(surveyAnswers).map((questionId) => {
                Object.keys(surveyAnswers[questionId]).map((answerId) => {
                    data.push({
                        questionid: questionId,
                        answerid: answerId,
                        ...surveyAnswers[questionId][answerId],
                        hotelrefno: isPortal ? changeHotelRefNo : GENERAL_SETTINGS.HOTELREFNO,
                    })
                })
            })
        }

        if (!checkRequired) {
            enqueueSnackbar(t('str_pleaseCheckMandatoryFields'), { variant: 'warning', autoHideDuration: 3000 })
            return
        }

        if (!checkRequiredGroup) {
            enqueueSnackbar(t('str_pleaseCheckMandatoryFields'), { variant: 'warning', autoHideDuration: 3000 })
            return
        }

        let fileUploadCounter = 0
        setIsSaving(true)
        //for make disable inputs
        setShowSurveyAnyway(true)
        setSurveyIsValid(true)
        clientParams.reservno = reservBase?.reservno || false
        clientParams.client = infoLogin?.roletype === ROLETYPES.GUEST ? clientBase.gid : clientGid ? clientGid : null
        clientParams.employee = infoLogin?.roletype === ROLETYPES.EMPLOYEE ? infoLogin?.gid : empGid ? empGid : null
        const answerLength = Object.keys(surveyAnswers)?.length

        //survey save api
        if (data.length > 0) {
            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/survey/save',
                method: REQUEST_METHOD_CONST.POST,
                timeout: 1000 * 300, // Wait for 5 min.
                params:{
                    onlyAnswer: isOnlyOneQuestionRender && answerLength < questionLength,
                    trans: surveyTrans,
                    survey: surveyGid,
                    langcode: locale,
                    ...clientParams
                },
                data: data,
            }).then(async (r) => {
                if (r.status === 200 && r.data.success) {
                    const resData = r.data
                    if (resData) {
                        if (clientBase) {
                            const notifyValues = {
                                roomno: reservBase?.roomno || "-",
                                clientname: transliteration(clientBase?.clientname) || "-",
                                transno: resData.confirmationNumber
                            }

                            await sendGuestChangeNotifyMail('surveytrans', 'upd', clientBase.id, clientBase.gid, reservBase.gid, reservBase.reservno, notifyValues, reservBase?.hotelrefno || GENERAL_SETTINGS.HOTELREFNO)
                        }
                        //upload files
                        if (resData.answers && surveyFiles) {
                            resData.answers.map((answer) => {
                                Object.keys(surveyFiles).map((answerId) => {
                                    const files = surveyFiles[answerId]
                                    if (files) {
                                        if (String(answer.answerid) === String(answerId)) {
                                            setIsFilesUploading(true)
                                            fileUploadCounter++
                                            Upload({
                                                apiUrl: GENERAL_SETTINGS.OREST_URL,
                                                token,
                                                params: {
                                                    masterid: answer.mid,
                                                    hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
                                                },
                                                files: files,
                                            }).then((r1) => {
                                                if (r1.status === 200) {
                                                    const data = r1.data.data

                                                    //set refid to uploaded files
                                                    if (data && infoLogin && infoLogin.refid) {
                                                        const arrayData = []
                                                        if (Array.isArray(data)) {
                                                            data.map((file) => {
                                                                arrayData.push({
                                                                    gid: file.gid,
                                                                    refid: infoLogin.refid,
                                                                })
                                                            })
                                                        } else {
                                                            if (data.gid) {
                                                                arrayData.push({
                                                                    gid: data.gid,
                                                                    refid: infoLogin.refid,
                                                                })
                                                            }
                                                        }
                                                        if (arrayData.length > 0) {
                                                            UseOrest({
                                                                apiUrl: GENERAL_SETTINGS.OREST_URL,
                                                                endpoint:
                                                                    OREST_ENDPOINT.RAFILE +
                                                                    '/' +
                                                                    OREST_ENDPOINT.LIST +
                                                                    '/' +
                                                                    OREST_ENDPOINT.PATCH,
                                                                method: REQUEST_METHOD_CONST.PATCH,
                                                                token,
                                                                data: arrayData,
                                                                params: {
                                                                    hotelrefno: surveyHotelRefno,
                                                                },
                                                            }).then((r2) => {
                                                                if (r2.status === 200) {
                                                                    //console.log(r2.data)
                                                                }
                                                            })
                                                        }
                                                    }
                                                } else {
                                                    if (r1.data && r1.data.error_description) {
                                                        showError(
                                                            'File upload failed! ' + r1.data.error_description
                                                        )
                                                    } else {
                                                        showError('File upload failed!')
                                                    }
                                                }
                                                fileUploadCounter--
                                                if (fileUploadCounter === 0) {
                                                    setIsFilesUploading(false)
                                                }
                                            })
                                        }
                                    }
                                })
                            })
                        }

                        setConfirmationNumber(String(resData.confirmationNumber))
                        setSendClientMail(resData.sendmail)
                        setClientMail(String(resData.email))
                    }

                    typeof handleReset === 'function' && handleReset()
                    enqueueSnackbar(t('str_thankYouForYourFeedback'), { variant: 'success', autoHideDuration: 10000 })
                    setSurveySaved(true)
                } else {
                    if (r.data && r.data.error_description) {
                        enqueueSnackbar(r.data.error_description, { variant: 'error', autoHideDuration: 10000 })
                    } else {
                        enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error', autoHideDuration: 10000 })
                    }
                }
            })
                .then(() => {
                    setIsSaving(false)
                    setSurveyIsValid(false)
                })
                .catch(() => {
                    enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error', autoHideDuration: 10000, action: trySavingAgainAction() })
                    setIsSaving(false)
                    setSurveyIsValid(false)
                })
        } else {
            setIsSaving(false)
            setSurveyIsValid(false)
        }
    }

    const handleClickShowMyAnswers = () => {
        setShowSurveyAnyway(true)
    }

    const onChangePagination = (event, page) => {
        setSurveyPage(page - 1)
    }

    const onClickPageBack = () => {
        window.scrollTo(0, 0)
        setSurveyGroup(surveyGroup - 1)
    }

    const onClickPageNext = () => {
        window.scrollTo(0, 0)
        setSurveyGroup(surveyGroup + 1)
    }

    const getSiblingCount = () => {
        if (width === 'xl') {
            return 2
        } else if (width === 'lg') {
            return 2
        } else if (width === 'md') {
            return 2
        } else if (width === 'sm') {
            return 2
        } else {
            return 1
        }
    }

    const getBoundaryCount = () => {
        if (width === 'xl') {
            return 2
        } else if (width === 'lg') {
            return 2
        } else if (width === 'md') {
            return 2
        } else if (width === 'sm') {
            return 2
        } else {
            return 1
        }
    }

    if (isSaving) {
        return (
            <Grid container direction={'column'} justify={'center'} alignItems={'center'} style={{height: '100%'}}>
                <Grid item>
                    <LoadingSpinner/>
                </Grid>
                <Grid item>
                    <h3
                        style={{
                            fontSize: 28,
                            fontWeight: 500,
                            color: '#2F3434',
                            textAlign: 'center',
                            margin: '12px 6px',
                        }}
                    >
                        {t('str_answerSavingMessage')}
                    </h3>
                </Grid>
            </Grid>
        )
    } else if (isFilesUploading) {
        return (
            <Grid container direction={'column'} justify={'center'} alignItems={'center'} style={{height: '100%'}}>
                <Grid item>
                    <LoadingSpinner/>
                </Grid>
                <Grid item>
                    <h3
                        style={{
                            fontSize: 28,
                            fontWeight: 500,
                            color: '#2F3434',
                            textAlign: 'center',
                            margin: '12px 6px',
                        }}
                    >
                        {t('str_filesUploading')}
                    </h3>
                </Grid>
            </Grid>
        )
    } else if (surveySaved) {
        return (
            <React.Fragment>
                {(surveyThankYouFile) ? (
                    <div
                        dangerouslySetInnerHTML={{
                            __html: surveyThankYouFile && Buffer.from(surveyThankYouFile, 'base64').toString('utf-8')
                                .replaceAll('{email}', clientMail)
                                .replaceAll('{transno}', confirmationNumber || '0')
                        }}
                    />
                ) : (
                    <Grid container direction={'column'} justify={'center'} alignItems={'center'} style={{height: '100%'}}>
                        <Grid item>
                            <CheckCircleOutlinedIcon style={{fontSize: 150, color: '#4caf50'}}/>
                        </Grid>
                        <Grid item>
                            <h3 style={{fontSize: 34, fontWeight: 500, color: '#2F3434', textAlign: 'center'}}>
                                {t('str_thankForPart')}
                            </h3>
                        </Grid>
                        {(clientMail && sendClientMail) && (
                            <Grid item>
                                <p
                                    style={{
                                        fontSize: 22,
                                        fontWeight: 500,
                                        color: '#2F3434',
                                        textAlign: 'center',
                                        margin: '24px 0',
                                    }}
                                >
                                    {t('str_receiveAnEmailSpace')}
                                    {' '}
                                    <span style={{fontSize: 23, fontWeight: 700}}>{clientMail}</span>
                                    {' '}
                                    {t('str_spaceConfirmTheSurvey')}
                                </p>
                            </Grid>
                        )}
                        {confirmationNumber && (
                            <Grid item>
                                <h3 style={{fontSize: 20, fontWeight: 500, color: '#2F3434', textAlign: 'center'}}>
                                    {t('str_confirmationNumber')} {confirmationNumber}
                                </h3>
                            </Grid>
                        )}
                    </Grid>
                )}
            </React.Fragment>
        )
    }

    if (surveyIsValid && !showSurveyAnyway && !isOweb) {
        return (
            <Grid container direction={'column'} justify={'center'} alignItems={'center'} style={{height: '100%'}}>
                <Grid item>
                    <h2 style={{fontSize: 34, fontWeight: 600, color: '#2F3434', textAlign: 'center'}}>
                        {t('str_surveyComplete')}
                    </h2>
                </Grid>
                <Grid item>
                    <Button
                        variant={'outlined'}
                        onClick={handleClickShowMyAnswers}
                        style={{
                            fontSize: 17,
                            fontWeight: 500,
                            color: '#2F3434',
                            textTransform: 'initial',
                            margin: '12px 0',
                        }}
                    >
                        {t('str_showMyAnswers')}
                    </Button>
                </Grid>
            </Grid>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', }}>
            <RenderOptions survey={survey} displayType={displayType}/>
            <div style={{flexGrow: 1}}/>
            <Grid container spacing={3} justify={'space-between'} className={classes.paginationGrid}>
                <Grid item style={{alignSelf: 'center'}} className={classes.bottomGridForMobile}>
                    {displayType === SURVEY_DISPLAY_TYPE_QUESTION && (
                        <Pagination
                            variant={'outlined'}
                            shape={'round'}
                            siblingCount={getSiblingCount()}
                            boundaryCount={getBoundaryCount()}
                            renderItem={(item) => {
                                return (
                                    <PaginationItem
                                        {...item}
                                        variant={item.type === 'page' ? 'text' : item.variant}
                                        size={'small'}
                                        classes={{
                                            root: classes.paginationItemRoot,
                                            selected: classes.paginationItemSelected,
                                            sizeSmall: classes.paginationItemSize,
                                            ellipsis: classes.paginationItemEllipsis,
                                        }}
                                    />
                                )
                            }}
                            count={surveyLastPage}
                            page={surveyPage + 1}
                            onChange={onChangePagination}
                            classes={{ul: classes.paginationUl}}
                        />
                    )}
                    {displayType === SURVEY_DISPLAY_TYPE_GROUP && surveyLastGroup !== 1 && (
                        <Grid
                            container
                            spacing={3}
                            className={classes.bottomGridForMobile}
                            style={{margin: 0, width: '100%'}}
                        >
                            <Grid item>
                                <IconButton
                                    onClick={onClickPageBack}
                                    disabled={surveyGroup <= 0}
                                    classes={{
                                        root: classes.arrowIconButton,
                                        disabled: classes.arrowIconButtonDisabled,
                                    }}
                                >
                                    <ArrowBackIcon className={classes.arrowIcon}/>
                                </IconButton>
                                <span className={classes.arrowText} style={{opacity: surveyGroup <= 0 && 0.5}}>
                                    {t('str_previous')}
                                </span>
                            </Grid>
                            <div className={classes.arrowIconDivider}/>
                            <Grid item>
                                <span
                                    className={classes.arrowText}
                                    style={{opacity: surveyGroup === surveyLastGroup - 1 && 0.5}}
                                >
                                    {t('str_next')}
                                </span>
                                <IconButton
                                    onClick={onClickPageNext}
                                    disabled={surveyGroup === surveyLastGroup - 1}
                                    classes={{
                                        root: classes.arrowIconButton,
                                        disabled: classes.arrowIconButtonDisabled,
                                    }}
                                >
                                    <ArrowForwardIcon className={classes.arrowIcon}/>
                                </IconButton>
                            </Grid>
                        </Grid>
                    )}
                </Grid>
                <Grid item className={classes.bottomGridForMobile}>
                    {!surveyIsValid && !isOnlyOneQuestionRender && (
                        <Button
                            onClick={handleClickSaveSurvey}
                            fullWidth
                            variant="contained"
                            color={'primary'}
                            disabled={isSaving}
                            className={classes.saveButton}
                        >
                            {t('str_completeTheSurvey')}
                            {isSaving && <CircularProgress size={24} className={classes.buttonProgress}/>}
                        </Button>

                    )}
                    {!surveyIsValid && isOnlyOneQuestionRender && (
                        <Button
                            onClick={handleSave}
                            fullWidth
                            color={'primary'}
                            variant="contained"
                            disabled={isSaving}
                            className={classes.saveButton}
                        >
                            {t('str_send')}
                            {isSaving && <CircularProgress size={24} className={classes.buttonProgress}/>}
                        </Button>
                    )}
                </Grid>
            </Grid>
            <TrackedChangesDialog
                open={openTrackedDialog}
                onPressNo={(e) => {
                    setOpenTrackedDialog(e);
                    handleClickSaveSurvey()
                }}
                onPressYes={(e) => {
                    setOpenTrackedDialog(e);
                    typeof handleOpenSurveyDialog === 'function' && handleOpenSurveyDialog()
                }}
                dialogDesc={'Would you like to complete the survey?'}
            />
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

export default connect(mapStateToProps, null)(RenderSurvey)
