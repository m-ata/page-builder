import React, { useState, memo } from 'react'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import AddIcon from '@material-ui/icons/Add'
import RemoveIcon from '@material-ui/icons/Remove'
import { SURVEY_INPUT_VARIANT } from '../../../../assets/const'
import useSurveyAction from 'model/survey/useSurveyAction'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import styles from '../../style/SurveyOptions.style'
import SurveyTooltip from 'components/survey/helper/SurveyTooltip'

const useStyles = makeStyles(styles)

//TODO - ask what is this for and improve component
function SpinEditOption(props) {
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
    const [optionValue, setOptionValue] = useState(oldAnswer ? oldAnswer.valueint : '')

    const handleClickIncrement = () => {
        const value = Number(optionValue) + 1

        setOptionValue(value)
        setValueToRedux(value)
    }

    const handleClickDecrement = () => {
        const value = Number(optionValue) - 1

        setOptionValue(value)
        setValueToRedux(value)
    }

    const handleChangeTextField = (e) => {
        const value = e.target.value === '' ? '' : parseInt(e.target.value) || optionValue

        setOptionValue(value)
        setValueToRedux(value)
    }

    const setValueToRedux = (value) => {
        if (value !== '') {
            setSurveyAnswerMulti(surveyTrans, option.parentid, option.id, {
                typ: optionTyp,
                parentid: option.parentid,
                valueint: value,
            })
        } else {
            deleteSurveyAnswer(surveyTrans, option.parentid, option.id)
        }
    }

    return (
        <div className={classes.optionContainer}>
            <SurveyTooltip title={option && option.note || ''}>
                <TextField
                    onChange={handleChangeTextField}
                    label={option.langwordtxt || option.description}
                    value={optionValue}
                    variant={SURVEY_INPUT_VARIANT}
                    fullWidth
                    disabled={surveyIsValid}
                    className={classes.textField}
                    inputProps={{ style: { textAlign: 'center' } }}
                    InputProps={{
                        startAdornment: (
                            <IconButton disabled={surveyIsValid} size={'medium'} onClick={handleClickDecrement}>
                                <RemoveIcon/>
                            </IconButton>
                        ),
                        endAdornment: (
                            <IconButton disabled={surveyIsValid} size={'medium'} onClick={handleClickIncrement}>
                                <AddIcon/>
                            </IconButton>
                        ),
                        classes: { input: classes.textFieldInput },
                    }}
                    InputLabelProps={{ className: classes.textFieldLabel }}
                />
            </SurveyTooltip>
        </div>
    )
}

export default memo(SpinEditOption)