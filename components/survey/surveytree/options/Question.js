import React, {memo, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import OnePageSurvey from '../render-types/OnePageSurvey'
import { makeStyles } from '@material-ui/core/styles'
import styles from '../../style/SurveyOptions.style'
import {
    SURVEY_DISPLAY_TYPE_QUESTION, SURVEY_DISPLAY_TYPE_QUESTION_IS_HORIZONTAL,
} from 'model/survey/constants'
import IsReq from './sub-components/IsReq'
import Grid from '@material-ui/core/Grid'
import SurveyTooltip from 'components/survey/helper/SurveyTooltip'

const useStyles = makeStyles(styles)

function QuestionOption(props) {
    const { option, optionTyp, index } = props

    //style
    const classes = useStyles()

    //redux
    const surveyIsValid = useSelector((state) => state.survey.isValid)
    const displayType = useSelector((state) => state.survey.displayType)
    const surveyData = useSelector((state) => state.survey.surveyInfo)
    const [optionParent, setOptionParent] = useState(false);

    useEffect(() => {
        if(option) {
            if(surveyData) {
                const findGroup = surveyData[0]?.children.find(e => e.id === option.parentid)
                setOptionParent(findGroup && findGroup || false)
            }
        }
    }, [option])

    const getIndex = () => {
        if (index && typeof index === 'string' && displayType === SURVEY_DISPLAY_TYPE_QUESTION) {
            return index.split('.')[0]
        } else {
            return index
        }
    }

    const isHorizontal = (answeralign) =>{
        return  answeralign === SURVEY_DISPLAY_TYPE_QUESTION_IS_HORIZONTAL
    }

    if (optionTyp === option.typ) {
        return (
            <div className={classes.questionContainer}>
                <SurveyTooltip title={option && option.note || ''}>
                    <h3 style={{ color: surveyIsValid ? '#00000061' : '#707070' }} className={classes.questionTitle}>
                        <Grid container direction={'row'} justify={'flex-start'} alignItems={'center'}>
                            {getIndex() + '.'} {option.langwordtxt || option.description}
                            {(option && option.isreq || optionParent?.isreq) && <IsReq option={option}/>}
                        </Grid>
                    </h3>
                </SurveyTooltip>
                {option.children && <OnePageSurvey options={option.children} isHorzintal={isHorizontal(option.answeralign)} index={index}/>}
            </div>
        )
    } else {
        return option.children && <OnePageSurvey options={option.children} isHorzintal={isHorizontal(option.answeralign)} index={index}/>
    }
}

export default memo(QuestionOption)