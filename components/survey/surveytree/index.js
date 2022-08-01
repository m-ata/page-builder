import React, { useContext, useEffect, useState, memo } from 'react'
import { connect } from 'react-redux'
import styles from '../style/SurveyPage.style'
import { makeStyles } from '@material-ui/core/styles'
import { useRouter } from 'next/router'
import WebCmsGlobal from 'components/webcms-global'
import SurveyLayout from '../../layout/containers/SurveyLayout'
import CheckCircleOutlinedIcon from '@material-ui/icons/CheckCircleOutlined'
import { NextSeo } from 'next-seo'
import Container from '@material-ui/core/Container'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { isErrorMsg, OREST_ENDPOINT, REQUEST_METHOD_CONST, ROLETYPES } from 'model/orest/constants'
import { useSelector } from 'react-redux'
import axios from 'axios'
import RenderSurvey from './RenderSurvey'
import LoadingSpinner from '../../LoadingSpinner'
import { useOrestAction } from '../../../model/orest'
import { UseOrest } from '@webcms/orest'
import useSurveyAction from 'model/survey/useSurveyAction'
import useTranslation from 'lib/translations/hooks/useTranslation'
import SurveyBanner from '../banner'
import Button from '@material-ui/core/Button'
const useStyles = makeStyles(styles)
import { defaultLocale } from 'lib/translations/config'
import { useSnackbar } from 'notistack'
import { updateState } from 'state/actions'

function SurveyTree(props) {
    const { t } = useTranslation()
        , classes = useStyles()
        , { updateState, surveygid, surveyrefno, clientid, isWidget, isAlreadyLoadTree } = props
        , { GENERAL_SETTINGS, WEBCMS_DATA, locale } = useContext(WebCmsGlobal)
        , router = useRouter()
        , surveyGid = router.query.surveyGid || surveygid
        , surveyHotelRefno = router.query.hotelrefno || surveyrefno
        , cache = router.query.cache
        , refid = router?.query?.refid || clientid || false
        , refgid = router?.query?.refgid || false
        , reftoken = router.query.reftoken
        , langcode = locale || defaultLocale
        , isGapp = router?.query?.isGapp === 'true' || false
        , nonWeb = router?.query?.isOweb === '1' || isGapp
        , clientGid = router?.query?.clientGid || false
        , empGid = router?.query?.empGid || false
        , { enqueueSnackbar } = useSnackbar()
        , { setOrestState, deleteOrestCurrentUserInfo } = useOrestAction()
        , isPortal = GENERAL_SETTINGS.ISPORTAL
        , [clientBase, setClientBase] = useState(false)
        , [onlyQuestions, setOnlyQuestions] = useState([])
        , [onlyGroups, setOnlyGroups] = useState([])

    //redux
    const {
            setSurveyTrans,
            setSurveyIsValid,
            setSurveyAnswerMulti,
            setSurveyDisplayType,
            setSurveyBgColor,
            setSurveyThankYouFile,
            setSurveyInfo
        } = useSurveyAction()
        , token = reftoken || useSelector((state) => state.orest.currentUser !== null && state.orest.currentUser.auth.access_token)
        , reservationInfo = useSelector((state) => state?.formReducer?.guest?.clientReservation || null)
        , changeHotelRefNo = useSelector((state) => state?.formReducer?.guest?.changeHotelRefno || null)

    let infoLogin = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)

    if(!infoLogin && refid && surveyHotelRefno){
        infoLogin = {
            refid: refid,
            hotelrefno: surveyHotelRefno,
        }
    }

    let clientParams = {
        hotelrefno: infoLogin && infoLogin.hotelrefno,
        isportal: isPortal,
        surveyrefno: surveyrefno
    }

    if(isPortal) {
        clientParams.portalrefno = changeHotelRefNo
    }

    if(GENERAL_SETTINGS.ISCHAIN && String(clientParams.hotelrefno) !== String(GENERAL_SETTINGS.HOTELREFNO)){
        clientParams.chainid = infoLogin && infoLogin.hotelrefno
        clientParams.ischain = true
    }

    //state
    const [surveyTree, setSurveyTree] = useState([])
        , [isRequest, setIsRequest] = useState(false)
        , [isLoading, setIsLoading] = useState(true)
        , [isError, setIsError] = useState(false)
        , [isSurveyExpreid, setIsSurveyExpreid] = useState(false)
        , [isSurveyNotStarted, setIsSurveyNotStarted] = useState(false)
        , [title, setTitle] = useState(null)

    useEffect(() => {
        let active = true

        if(isRequest === false){
            if(isAlreadyLoadTree) {
                setIsRequest(false)
                setIsLoading(false)
                setSurveyTree(isAlreadyLoadTree)
            } else {
                setIsRequest(true)
                getSurveyLoad(active)
            }
        }

        return () => {
            active = false
        }
    }, [langcode])

    const tryLoadingAgainAction = () =>  {
        setIsError(false)
        return (
            <React.Fragment>
                <Button onClick={() => getSurveyLoad(true)} color="inherit">
                    {t('str_tryAgain')}
                </Button>
            </React.Fragment>
        )
    }

    const getSurveyLoad = (active) => {

        async function getClientInfo() {
            return axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/client/info',
                method: REQUEST_METHOD_CONST.POST,
                params: {
                    gid: clientGid
                }
            }).then((clientResponse) => {
                if (clientResponse.status === 200) {
                    let clientResponseData = clientResponse.data.data
                    setOrestState(['client'], clientResponseData)
                    setClientBase(clientResponseData)
                    return clientResponseData
                } else {
                    const retErr = isErrorMsg(clientResponse)
                    enqueueSnackbar(t(retErr.errorMsg), { variant: 'warning' })
                    return null
                }
            })
        }

        async function getClient() {
            return UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: 'client/getbyid',
                timeout: 1000 * 30, // Wait for 30 sec.
                token,
                params: {
                    key: refid || infoLogin?.refid || false,
                    allhotels: true,
                },
            }).then((clientResponse) => {
                if (clientResponse.status === 200 && clientResponse.data.count > 0) {
                    let clientResponseData = clientResponse.data.data
                    setClientBase(clientResponseData)
                    setOrestState(['client'], clientResponseData)
                    return clientResponseData
                } else if (clientResponse.status === 401) {
                    deleteOrestCurrentUserInfo()
                    setOrestState(['client'], null)
                } else {
                    setOrestState(['client'], null)
                    const retErr = isErrorMsg(clientResponse)
                    enqueueSnackbar(t(retErr.errorMsg), { variant: 'warning' })
                    return null
                }
            }).catch(() => deleteOrestCurrentUserInfo())
        }

        async function getReservationInfo(clientId) {
            return axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/reservation/info',
                method: REQUEST_METHOD_CONST.POST,
                params: {
                    id: clientId
                }
            }).then((clientReservnoResponse) => {
                if (clientReservnoResponse.status === 200) {
                    updateState('guest', 'clientReservation', clientReservnoResponse.data.data)
                    return clientReservnoResponse.data.data
                } else {
                    const retErr = isErrorMsg(clientReservnoResponse)
                    enqueueSnackbar(t(retErr.errorMsg), { variant: 'warning' })
                    return null
                }
            })
        }

        async function getReservno() {
            return UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: 'client/reservno',
                token,
                params: {
                    clientid: refid || infoLogin?.refid || false,
                    isgapp: true,
                },
            }).then((clientReservnoResponse) => {
                if (clientReservnoResponse.status === 200 && clientReservnoResponse?.data?.data) {
                    return clientReservnoResponse.data.data
                } else if (clientReservnoResponse.status === 401) {
                    deleteOrestCurrentUserInfo()
                } else {
                    const retErr = isErrorMsg(clientReservnoResponse)
                    enqueueSnackbar(t(retErr.errorMsg), { variant: 'warning' })
                    return null
                }
            }).catch(() => {
                return null
            })
        }

        async function getSurvey() {
            let reservation = null, client = null
            if (infoLogin?.roletype === ROLETYPES.GUEST || infoLogin?.roletype === ROLETYPES.EMPLOYEE || clientGid || empGid || nonWeb) {
                if (infoLogin?.roletype === ROLETYPES.GUEST || clientGid) {
                    client = clientBase

                    if(!client && clientGid){
                        client = await getClientInfo()
                    }else if(!client && !clientGid) {
                        client = await getClient()
                    }

                    if (!reservationInfo && clientGid) {
                        reservation = await getReservationInfo(client.id)
                    }

                    if(!reservation && !reservationInfo && !clientGid){
                        reservation = await getReservno()
                    }

                    if(reservationInfo) {
                        reservation = reservationInfo
                    }
                }

                return axios({
                    url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/survey',
                    method: REQUEST_METHOD_CONST.POST,
                    params: clientParams,
                    timeout: 1000 * 30, // Wait for 30 sec.
                    data: {
                        reservno: nonWeb ? null : (clientGid || infoLogin?.roletype === ROLETYPES.GUEST) && reservation?.reservno || null,
                        clientid: (clientGid || infoLogin?.roletype === ROLETYPES.GUEST) ? refid || client?.id : null,
                        client: client?.gid || null,
                        employee: infoLogin?.roletype === ROLETYPES.EMPLOYEE && infoLogin?.gid || empGid || null,
                        survey: surveyGid,
                        trans: refgid,
                        cache: cache,
                        langcode: langcode,
                        nonWeb: nonWeb,
                        isGapp: isGapp
                    },
                }).then((apiHotelSurveyResponse) => {
                    if (active) {
                        if (apiHotelSurveyResponse?.data?.survey && apiHotelSurveyResponse?.data) {
                            const surveyData = apiHotelSurveyResponse.data.survey
                                , surveyTransData = apiHotelSurveyResponse.data.trans
                                , surveyIsValidData = apiHotelSurveyResponse.data.isvalid
                                , surveyDisplayType = apiHotelSurveyResponse.data.disptype || 0
                                , oldAnswersData = apiHotelSurveyResponse.data.answers
                                , bgColor = apiHotelSurveyResponse.data.bgcolor
                                , thankYouFile = apiHotelSurveyResponse.data.thankYouFile
                                , resOnlyQuestions = apiHotelSurveyResponse.data?.onlyQuestions

                            setSurveyTree(surveyData)
                            setSurveyTrans(surveyTransData)
                            setSurveyIsValid(surveyIsValidData)
                            setSurveyDisplayType(surveyDisplayType)
                            setSurveyBgColor(bgColor)
                            setOldAnswers(surveyTransData, oldAnswersData)
                            setSurveyThankYouFile(thankYouFile)
                            setOnlyQuestions(resOnlyQuestions)
                            setOnlyGroups(surveyData[0]?.children)
                            setSurveyInfo(surveyData)                          
                            if (surveyData[0] && surveyData[0].description) {
                                setTitle(surveyData[0].description)
                            }
                            return true
                        } else {
                            if(apiHotelSurveyResponse.data.error==="survey_not_yet_in_use") {
                                setIsSurveyNotStarted(true)
                            }else if(apiHotelSurveyResponse.data.error==="survey_has_been_expired"){
                                setIsSurveyExpreid(true)
                            } else{
                                enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error', autoHideDuration: 10000, action: tryLoadingAgainAction() })
                            }
                            setIsError(true)
                            return false
                        }
                    }
                }).catch(() => {
                    enqueueSnackbar(t('str_unexpectedProblem'), {
                        variant: 'error',
                        autoHideDuration: 10000,
                        action: tryLoadingAgainAction(),
                    })
                    setIsError(true)
                    return false
                })
            }
        }

        if (active) {
            if ((surveyGid && refgid) || (token && infoLogin) || clientGid || empGid) {
                setIsLoading(true)
                getSurvey().then(() => {
                    setIsRequest(false)
                    setIsLoading(false)
                })
            }
        }
    }

    const setOldAnswers = (surveyTrans, oldAnswers) => {
        if (oldAnswers.length > 0) {
            oldAnswers.map((answer) => {
                if (surveyTrans && answer.questionid && answer.answerid && answer.typ) {
                    setSurveyAnswerMulti(surveyTrans, answer.questionid, answer.answerid, {
                        typ: answer.typ,
                        parentid: answer.questionid,
                        answernote: answer.answernote,
                        valuetext: answer.valuetext,
                        valuelongtext: answer.valuelongtext,
                        valueint: answer.valueint,
                        valuefloat: answer.valuefloat,
                        valuedate: answer.valuedate,
                        valuetime: answer.valuetime,
                    })
                }
            })
        }
    }

    const UseSurveyPage = () => {
        return (
            <Container maxWidth={'lg'} className={classes.container}>
                {(isLoading || isRequest) ? (
                    <Box p={3} m={1}>
                        <Typography variant="h4" align="center" gutterBottom>
                            <LoadingSpinner size={50}/>
                        </Typography>
                    </Box>
                ) : (isSurveyNotStarted && isError) ? (
                    <Box p={3} m={1} style={{ textAlign: 'center' }}>
                        <CheckCircleOutlinedIcon style={{ fontSize: 100, color: '#4caf50', marginBottom: 20 }} />
                        <Typography variant="h4" align="center" gutterBottom>
                            {t('str_thankYouForYourParticipationButTheSurveyHasNotStartedYet')}
                        </Typography>
                    </Box>
                ) : (isSurveyExpreid && isError) ? (
                    <Box p={3} m={1} style={{ textAlign: 'center' }}>
                        <CheckCircleOutlinedIcon style={{ fontSize: 100, color: '#4caf50', marginBottom: 20 }} />
                        <Typography variant="h4" align="center" gutterBottom>
                            {t('str_thankYouForYourParticipationTheThisSurveyHasBeenExpired')}
                        </Typography>
                    </Box>
                ) : isError ? (
                    <Box p={3} m={1}>
                        <Typography variant="h4" align="center" gutterBottom>
                            {t('str_somethingWentWrong')}
                        </Typography>
                    </Box>
                ) : surveyTree && surveyTree.length > 0 ? (
                    <RenderSurvey survey={surveyTree} surveygid={surveyGid} surveyrefno={surveyHotelRefno} clientid={refid} onlyQuestions={onlyQuestions} onlyGroups={onlyGroups} />
                ) : (
                    <Box p={3} m={1}>
                        <Typography variant="h4" align="center" gutterBottom>
                            {t('str_noSurveyQuestion')}
                        </Typography>
                    </Box>
                )}
            </Container>
        )
    }

    if(isWidget){
        return (<UseSurveyPage />)
    }

    return (
        <SurveyLayout>
            {title ? (<NextSeo title={title + ' - ' + WEBCMS_DATA.assets.meta.title} />) : (<NextSeo title={WEBCMS_DATA.assets.meta.title} />)}
            <SurveyBanner />
            <UseSurveyPage />
        </SurveyLayout>
    )
}

const memorizedSurveyTree = memo(SurveyTree)

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(memorizedSurveyTree)