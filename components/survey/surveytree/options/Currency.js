import React, { useState, memo } from 'react'
import TextField from '@material-ui/core/TextField'
import { SURVEY_INPUT_VARIANT } from '../../../../assets/const'
import NumberFormat from 'react-number-format'
import useSurveyAction from '../../../../model/survey/useSurveyAction'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import styles from '../../style/SurveyOptions.style'
import SurveyTooltip from 'components/survey/helper/SurveyTooltip'

const useStyles = makeStyles(styles)

function CurrencyOption(props) {
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
    const [optionValue, setOptionValue] = useState(oldAnswer ? oldAnswer.valuefloat : '')

    const handleChangeOption = (event) => {
        const value = event.target.value
        setOptionValue(value)

        if (value !== '') {
            setSurveyAnswerMulti(surveyTrans, option.parentid, option.id, {
                typ: optionTyp,
                parentid: option.parentid,
                valuefloat: value.replace(/,/g, ''),
            })
        } else {
            deleteSurveyAnswer(surveyTrans, option.parentid, option.id)
        }
    }

    return (
        <div className={classes.optionContainer}>
            <SurveyTooltip title={option && option.note || ''}>
                <NumberFormat
                    value={optionValue}
                    displayType={'input'}
                    decimalScale={2}
                    inputMode={'decimal'}
                    isNumericString={true}
                    thousandSeparator={true}
                    customInput={TextField}
                    onChange={handleChangeOption}
                    variant={SURVEY_INPUT_VARIANT}
                    fullWidth
                    disabled={surveyIsValid}
                    name={String(option.id)}
                    label={option.langwordtxt || option.description}
                    inputProps={{ style: { textAlign: 'right' } }}
                    className={classes.textField}
                    InputProps={{ classes: { input: classes.textFieldInput } }}
                    InputLabelProps={{ className: classes.textFieldLabel }}
                />
            </SurveyTooltip>
        </div>
    )
}

export default memo(CurrencyOption)
