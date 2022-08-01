import React, { useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
    Card,
    CardContent,
    Container,
    Grid,
    Typography,
} from '@material-ui/core'
import ForumIcon from '@material-ui/icons/Forum'
import axios from 'axios'
import useTranslation from '../../../../lib/translations/hooks/useTranslation'
import WebCmsGlobal from '../../../webcms-global'
import { REQUEST_METHOD_CONST } from '../../../../model/orest/constants'
import { makeStyles } from '@material-ui/core/styles'
import SurveyTreeDialog from '../../../survey/surveytree/dialog'
import useSurveyAction from '../../../../model/survey/useSurveyAction'
import RenderSurvey from '../../../survey/surveytree/RenderSurvey'

const useStyles = makeStyles((theme) => ({
    title: {
        color: theme.palette.primary.dark,
        fontWeight: '600',
        paddingBottom: '8px',
    },
    surveyName: {
        fontWeight: '600',
        paddingBottom: '8px',
    },
    borderWrapper: {
        border: 'dashed',
        borderColor: theme.palette.primary.main,
        borderRadius: '4px',
    },
    iconGrid: {
        backgroundColor: '#FAFAFA',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        width: '1.5em',
        height: '1.5em',
    },
    container: {
        marginLeft: 'inherit',
        marginRight: 'inherit',
    },
}))


function QuickSurvey() {
    const classes = useStyles()

    const {
        setSurveyTrans,
        setSurveyIsValid,
        setSurveyAnswerMulti,
        setSurveyBgColor,
        setSurveyDisplayType,
        setSurveyThankYouFile,
    } = useSurveyAction()
    const { GENERAL_SETTINGS, locale } = useContext(WebCmsGlobal)
    const { t } = useTranslation()


    const clientBase = useSelector((state) => state?.orest?.state?.client || false)
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
    const surveyTrans = useSelector((state) => state.survey.trans)


    const [homeSurvey, setHomeSurvey] = useState(false)
    const [openSurveyData, setOpenSurveyData] = useState(false)
    const [surveyTreeData, setSurveyTreeData] = useState([])
    const [questionList, setQuestionList] = useState([])
    const [oneQuestionTree, setOneQuestionTree] = useState([])
    const [onlyQuestions, setOnlyQuestions] = useState([])
    const [onlyGroups, setOnlyGroups] = useState([])


    const clientParams = {}
    clientParams.hotelrefno = loginfo && loginfo.hotelrefno
    clientParams.isportal = GENERAL_SETTINGS.ISPORTAL


    if (GENERAL_SETTINGS.ISCHAIN && String(clientParams.hotelrefno) !== String(GENERAL_SETTINGS.HOTELREFNO)) {
        clientParams.chainid = loginfo && loginfo.hotelrefno
        clientParams.ischain = true
    }

    useEffect(() => {
        let active = true

        if (active && clientBase && !homeSurvey) {
            getHomeSurvey()
        }

        return () => {
            active = false
        }
    }, [clientBase])

    useEffect(() => {
        if (homeSurvey && clientBase) {
            getSurveyTree()
        }
    }, [homeSurvey, clientBase])

    const getHomeSurvey = () => {
        axios({
            url: GENERAL_SETTINGS.BASE_URL + 'api/guestweb/home-survey',
            method: REQUEST_METHOD_CONST.POST,
            params: {
                clientid: clientBase?.id,
                lancode: locale,
                limit: 1,
            },
        }).then(res => {
            if (res.status === 200 && res.data.count > 0) {
                const survey = res.data.data[0]
                setHomeSurvey(survey)
            }
        })
    }

    const getSurveyTree = () => {
        axios({
            url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/survey',
            method: REQUEST_METHOD_CONST.POST,
            params: clientParams,
            timeout: 1000 * 60, // Wait for 60 sec.
            data: {
                client: clientBase?.gid,
                survey: homeSurvey?.gid,
            },
        }).then((r) => {
            if (r.status === 200 && r.data?.survey) {
                const survey = r.data?.survey
                const onlyQuestions = [...r.data?.onlyQuestions]
                const surveyTransData = r.data.trans
                const oldAnswersData = r.data.answers
                const surveyIsValidData = r.data.isvalid
                const surveyDisplayType = r.data.disptype || 0
                const bgColor = r.data.bgcolor
                const thankYouFile = r.data.thankYouFile
                setQuestionList(r.data?.onlyQuestions)

                if (oldAnswersData && oldAnswersData?.length > 0) {
                    oldAnswersData.map((item) => {
                        const findQuestion = onlyQuestions.find(e => e.id === item?.parentid)
                        if (findQuestion) {
                            const index = onlyQuestions.findIndex(e => e.id === findQuestion.id)
                            index !== -1 && onlyQuestions.splice(index, 1)
                        }
                    })
                }

                setOldAnswers(surveyTransData, oldAnswersData)

                if (onlyQuestions.length > 0) {
                    const rand = onlyQuestions?.length === 1 ? 0 : Math.floor(Math.random() * onlyQuestions?.length)
                    const randomQuestion = onlyQuestions[rand]
                    setOneQuestionTree([randomQuestion])
                }

                setSurveyTreeData(survey)
                setSurveyTrans(surveyTransData)
                setSurveyIsValid(surveyIsValidData)
                setSurveyDisplayType(surveyDisplayType)
                setSurveyBgColor(bgColor)
                setSurveyThankYouFile(thankYouFile)
                setOnlyQuestions(onlyQuestions)
                setOnlyGroups(survey[0].children)
            }
        }).catch(() => {

        })
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

    const handleOpenSurveyDialog = () => {
        setOpenSurveyData({
            surveygid: homeSurvey?.gid,
            surveyrefno: homeSurvey?.hotelrefno,
            clientid: clientBase?.id || loginfo.refid,
        })
    }

    const handleReset = () => {
        setSurveyTreeData([])
        setOneQuestionTree([])
        setQuestionList([])
    }


    return (
        <React.Fragment>
            {
                oneQuestionTree.length > 0 && (
                    <Container className={classes.container} maxWidth={'sm'} disableGutters>
                        <Card>
                            <CardContent>
                                <Grid container>
                                    <Grid item xs={12}>
                                        <Typography
                                            className={classes.title}>{t('str_helpUnderstandBetter')}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <div className={classes.borderWrapper}>
                                            <Grid container>
                                                <Grid item xs={3} className={classes.iconGrid}>
                                                    <ForumIcon className={classes.icon} color={'primary'} />
                                                </Grid>
                                                <Grid item xs={9}>
                                                    <div style={{ padding: '12px' }}>
                                                        {
                                                            oneQuestionTree?.length > 0 && (
                                                                <RenderSurvey
                                                                    survey={oneQuestionTree}
                                                                    surveygid={homeSurvey?.gid}
                                                                    surveyrefno={homeSurvey?.hotelrefno}
                                                                    clientid={clientBase?.id}
                                                                    isOnlyOneQuestionRender
                                                                    noRequiredCheck
                                                                    questionLength={questionList?.length}
                                                                    handleOpenSurveyDialog={handleOpenSurveyDialog}
                                                                    handleReset={handleReset}
                                                                    onlyQuestions={onlyQuestions}
                                                                    onlyGroups={onlyGroups}
                                                                />
                                                            )
                                                        }
                                                    </div>
                                                </Grid>
                                            </Grid>
                                        </div>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Container>
                )}
            <SurveyTreeDialog
                open={openSurveyData}
                clientId={clientBase?.id}
                data={openSurveyData}
                onClose={(status) => {
                    setOpenSurveyData(status)
                    handleReset()
                }}
                isAlreadyLoadTree={surveyTreeData}
            />
        </React.Fragment>
    )

}

export default QuickSurvey