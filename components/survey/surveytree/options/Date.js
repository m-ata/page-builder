import React, { useState, memo } from 'react'
import MomentAdapter from '@date-io/moment'
import { MobileDatePicker, DatePicker, LocalizationProvider } from '@material-ui/pickers'
import { SURVEY_INPUT_VARIANT } from '../../../../assets/const'
import moment from 'moment'
import { OREST_ENDPOINT } from '../../../../model/orest/constants'
import useSurveyAction from '../../../../model/survey/useSurveyAction'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import styles from '../../style/SurveyOptions.style'
import SurveyTooltip from 'components/survey/helper/SurveyTooltip'
import { useRouter } from 'next/router'
import exp from 'constants'

const useStyles = makeStyles(styles)

function DateOption(props) {
    const { option, optionTyp } = props
    const router = useRouter()
    const isKiosk = router.query.kiosk === 'true' ? true : false
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
    const [optionValue, setOptionValue] = useState(oldAnswer ? oldAnswer.valuedate : null)

    const handleChangeOption = (date) => {
        const dateValue = moment(date).format(OREST_ENDPOINT.DATEFORMAT_LOCALE)
        setOptionValue(date)

        if (dateValue !== '' && dateValue !== 'Invalid date') {
            setSurveyAnswerMulti(surveyTrans, option.parentid, option.id, {
                typ: optionTyp,
                parentid: option.parentid,
                valuedate: dateValue,
            })
        } else {
            deleteSurveyAnswer(surveyTrans, option.parentid, option.id)
        }
    }

    return (
        <div className={classes.optionContainer}>
            <SurveyTooltip title={option && option.note || ''}>
                <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                    {isKiosk ? (
                        <MobileDatePicker
                            autoOk
                            disableFuture
                            margin="dense"
                            name={String(option.id)}
                            label={option.langwordtxt || option.description}
                            showTodayButton
                            openTo={!optionValue ? 'year' : 'date'}
                            views={['year', 'month', 'date']}
                            fullWidth
                            disabled={surveyIsValid}
                            value={optionValue}
                            onChange={handleChangeOption}
                            className={classes.textField}
                            inputFormat="DD/MM/YYYY"
                            InputProps={{ classes: { input: classes.textFieldInput } }}
                            InputLabelProps={{ className: classes.textFieldLabel }}
                            renderInput={(props) => <TextField {...props} variant={SURVEY_INPUT_VARIANT} fullWidth/>}
                        />
                    ): (
                        <DatePicker
                            autoOk
                            disableFuture
                            margin="dense"
                            name={String(option.id)}
                            label={option.langwordtxt || option.description}
                            showTodayButton
                            openTo={!optionValue ? 'year' : 'date'}
                            views={['year', 'month', 'date']}
                            fullWidth
                            disabled={surveyIsValid}
                            value={optionValue}
                            onChange={handleChangeOption}
                            className={classes.textField}
                            inputFormat="DD/MM/YYYY"
                            InputProps={{ classes: { input: classes.textFieldInput } }}
                            InputLabelProps={{ className: classes.textFieldLabel }}
                            renderInput={(props) => <TextField {...props} variant={SURVEY_INPUT_VARIANT} fullWidth/>}
                        />
                    )}
                </LocalizationProvider>
            </SurveyTooltip>
        </div>
    )
}

export default memo(DateOption)