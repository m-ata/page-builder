import React, {memo} from 'react'
import { useSelector } from 'react-redux'
import OnePageSurvey from '../render-types/OnePageSurvey'
import { makeStyles } from '@material-ui/core/styles'
import styles from '../../style/SurveyOptions.style'
import SurveyTooltip from 'components/survey/helper/SurveyTooltip'

const useStyles = makeStyles(styles)

function SubQuestionOption(props) {
    const { option, optionTyp, index } = props

    //style
    const classes = useStyles()

    //redux
    const surveyIsValid = useSelector((state) => state.survey.isValid)

    return (
        <div className={classes.subQuestionContainer}>
            <SurveyTooltip title={option && option.note || ''}>
                <h3 style={{ color: surveyIsValid ? '#00000061' : '#707070' }} className={classes.questionTitle}>
                    {index + '.'} {option.langwordtxt || option.description}
                </h3>
            </SurveyTooltip>
            {option.children && <OnePageSurvey options={option.children} index={index}/>}
        </div>
    )
}

export default memo(SubQuestionOption)