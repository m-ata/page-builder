import React, {memo} from 'react'
import { useSelector } from 'react-redux'
import OnePageSurvey from '../render-types/OnePageSurvey'
import { makeStyles } from '@material-ui/core/styles'
import styles from '../../style/SurveyOptions.style'
import GroupPerPageSurvey from '../render-types/GroupPerPageSurvey'
import { SURVEY_DISPLAY_TYPE_GROUP, SURVEY_DISPLAY_TYPE_QUESTION } from 'model/survey/constants'
import QuestionPerPageSurvey from '../render-types/QuestionPerPageSurvey'
import SurveyTooltip from 'components/survey/helper/SurveyTooltip'

const useStyles = makeStyles(styles)

function RenderSurveyOption(props){
    const { displayType, option } = props
    switch (displayType) {
        case SURVEY_DISPLAY_TYPE_GROUP:
            return <GroupPerPageSurvey options={option.children} />
        case SURVEY_DISPLAY_TYPE_QUESTION:
            return <QuestionPerPageSurvey options={option.children} />
        default:
            return <OnePageSurvey options={option.children} />
    }
}

const MemoizedRenderSurveyOption = memo(RenderSurveyOption)

function SurveyOption(props) {
    const { option, optionTyp } = props

    //style
    const classes = useStyles()

    //redux
    const surveyIsValid = useSelector((state) => state.survey.isValid)
    const displayType = useSelector((state) => state.survey.displayType)

    return (
        <div>
            <SurveyTooltip title={option && option.note || ''}>
            <h1 style={{ color: surveyIsValid ? '#00000061' : '#122D31', }} className={classes.surveyTitle}>
                {option.langwordtxt || option.description}
            </h1>
            </SurveyTooltip>
            {option.children ? <MemoizedRenderSurveyOption displayType={displayType} option={option}/>: null}
        </div>
    )
}

export default memo(SurveyOption)
