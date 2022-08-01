import React, { useState, memo } from 'react'
import { SURVEY_INPUT_VARIANT } from '../../../../assets/const'
import { LocalizationProvider, TimePicker } from '@material-ui/pickers'
import MomentAdapter from '@date-io/moment'
import moment from 'moment'
import { OREST_ENDPOINT } from '../../../../model/orest/constants'
import TextField from '@material-ui/core/TextField'
import useSurveyAction from 'model/survey/useSurveyAction'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import styles from '../../style/SurveyOptions.style'
import SurveyTooltip from 'components/survey/helper/SurveyTooltip'

const useStyles = makeStyles(styles)

const timeToDate = (time) => {
    let times = []
    times = time.split(':')
    if (times.length > 0) {
        const dateValue = new Date()
        dateValue.setHours(Number(times[0]), Number(times[1]), Number(times[2]))

        return dateValue
    } else {
        return null
    }
}

function TimeOption(props) {
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
    const [optionValue, setOptionValue] = useState(oldAnswer ? timeToDate(oldAnswer.valuetime) : null)

    const handleChangeOption = (date) => {
        const timeValue = moment(date).format(OREST_ENDPOINT.TIMEFORMAT)
        setOptionValue(date)

        if (timeValue !== '' && timeValue !== 'Invalid date') {
            setSurveyAnswerMulti(surveyTrans, option.parentid, option.id, {
                typ: optionTyp,
                parentid: option.parentid,
                valuetime: timeValue,
            })
        } else {
            deleteSurveyAnswer(surveyTrans, option.parentid, option.id)
        }
    }

    return (
        <div className={classes.optionContainer}>
            <SurveyTooltip title={option && option.note || ''}>
                <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                    <TimePicker
                        onKeyUp={handleChangeOption}
                        onKeyDown={handleChangeOption}
                        onChange={handleChangeOption}
                        ampm={false}
                        views={['hours', 'minutes', 'seconds']}
                        inputFormat="HH:mm:ss"
                        mask="__:__:__"
                        disabled={surveyIsValid}
                        id={String(option.id)}
                        name={String(option.id)}
                        label={option.langwordtxt || option.description}
                        value={optionValue}
                        KeyboardButtonProps={{
                            'aria-label': 'change time',
                        }}
                        className={classes.textField}
                        InputProps={{ classes: { input: classes.textFieldInput } }}
                        InputLabelProps={{ className: classes.textFieldLabel }}
                        renderInput={(props) => <TextField {...props} variant={SURVEY_INPUT_VARIANT} fullWidth/>}
                    />
                </LocalizationProvider>
            </SurveyTooltip>
        </div>
    )
}

export default memo(TimeOption)