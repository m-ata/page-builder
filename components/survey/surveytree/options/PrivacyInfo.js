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
function PrivacyInfoOption(props) {
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
    const [optionValue, setOptionValue] = useState(oldAnswer ? oldAnswer.valuetext : '')
    const [isFocus, setIsFocus] = useState(false)

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
                    onFocus={() => {
                        setIsFocus(true)
                    }}
                    onBlur={() => {
                        setIsFocus(false)
                    }}
                    variant={SURVEY_INPUT_VARIANT}
                    fullWidth
                    disabled={surveyIsValid}
                    name={String(option.id)}
                    value={isFocus ? optionValue : optionValue.replace(/\S/gi, '*')}
                    label={option.langwordtxt || option.description}
                    className={classes.textField}
                    InputProps={{ classes: { input: classes.textFieldInput } }}
                    InputLabelProps={{ className: classes.textFieldLabel }}
                />
            </SurveyTooltip>
        </div>
    )
}

export default memo(PrivacyInfoOption)