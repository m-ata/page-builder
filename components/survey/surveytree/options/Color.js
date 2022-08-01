import React, { useState, memo } from 'react'
import TextField from '@material-ui/core/TextField'
import { SURVEY_INPUT_VARIANT } from '../../../../assets/const'
import useSurveyAction from '../../../../model/survey/useSurveyAction'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import styles from '../../style/SurveyOptions.style'
import SurveyTooltip from 'components/survey/helper/SurveyTooltip'

const useStyles = makeStyles(styles)

//TODO - ask what is this for and improve component
function ColorOption(props) {
    const { option, optionTyp } = props

    //style
    const classes = useStyles()

    //redux
    const { setSurveyAnswerMulti, deleteSurveyAnswer } = useSurveyAction()
    const surveyTrans = useSelector((state) => state.survey.trans)
    const surveyIsValid = useSelector((state) => state.survey.isValid)
    const oldAnswer = useSelector(
        (state) =>
            state.survey.answers[surveyTrans] &&
            state.survey.answers[surveyTrans][option.parentid] &&
            state.survey.answers[surveyTrans][option.parentid][option.id],
    )

    //state
    const [optionValue, setOptionValue] = useState(oldAnswer ? oldAnswer.valuetext : '#ffffff')

    const handleChangeOption = (event) => {
        const value = event.target.value
        setOptionValue(value)

        if (value !== '') {
            setSurveyAnswerMulti(surveyTrans, option.parentid, option.id, {
                typ: optionTyp,
                parentid: option.parentid,
                valuetext: value,
            })
        } else {
            deleteSurveyAnswer(surveyTrans, option.parentid, option.id)
        }
    }

    return (
        <div className={classes.optionContainer}>
            <SurveyTooltip title={option && option.note || ''}>
                <TextField
                    onChange={handleChangeOption}
                    variant={SURVEY_INPUT_VARIANT}
                    fullWidth
                    type={'color'}
                    disabled={surveyIsValid}
                    name={String(option.id)}
                    value={optionValue}
                    label={option.langwordtxt || option.description}
                    className={classes.textField}
                    InputProps={{ classes: { input: classes.textFieldInput } }}
                    InputLabelProps={{ className: classes.textFieldLabel }}
                />
            </SurveyTooltip>
        </div>
    )
}

export default memo(ColorOption)