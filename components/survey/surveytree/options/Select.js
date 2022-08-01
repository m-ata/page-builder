import React, { useState, memo } from 'react'
import { Select } from '@material-ui/core'
import FormControl from '@material-ui/core/FormControl'
import { SURVEY_INPUT_VARIANT } from '../../../../assets/const'
import useSurveyAction from '../../../../model/survey/useSurveyAction'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import styles from '../../style/SurveyOptions.style'
import OnePageSurvey from '../render-types/OnePageSurvey'
import HasNote from './sub-components/HasNote'
import HasFile from './sub-components/HasFile'
import SurveyTooltip from 'components/survey/helper/SurveyTooltip'

const useStyles = makeStyles(styles)

function getOptionFromOptionValue(options, optionValue) {
    if (options && options.length > 0) {
        let data = []
        options.map((k) => {
            data = { ...data, [k.id]: k }
        })

        return data[optionValue]
    } else {
        return null
    }
}

function SelectOption(props) {
    const { options, optionTyp, index } = props

    //style
    const classes = useStyles()

    //redux
    const { setSurveyAnswer } = useSurveyAction()
    const surveyTrans = useSelector((state) => state.survey.trans)
    const surveyIsValid = useSelector((state) => state.survey.isValid)
    const oldAnswers = useSelector(
        (state) => state.survey.answers[surveyTrans] && state.survey.answers[surveyTrans][options[0].parentid],
    )
    const oldAnswer =
        oldAnswers &&
        Object.keys(oldAnswers)
            .map((k) => ({ ...oldAnswers[k], id: k }))
            .filter((j) => {
                return j.typ === optionTyp
            })

    //state
    const [option, setOption] = useState(
        getOptionFromOptionValue(options, oldAnswer && oldAnswer[0] ? oldAnswer[0].id : ''),
    )
    const [optionValue, setOptionValue] = useState(oldAnswer && oldAnswer[0] ? oldAnswer[0].id : '')
    const [answerNote, setAnswerNote] = useState(oldAnswer && oldAnswer[0] ? oldAnswer[0].answernote || '' : '')

    const handleChangeOption = (event) => {
        const value = event.target.value
        setOption(getOptionFromOptionValue(options, value))

        //clear answerNote
        setAnswerNote('')
        setOptionValue(value)
        if (value && value !== '' && value !== 0) {
            setSurveyAnswer(surveyTrans, options[0].parentid, value, {
                typ: optionTyp,
                parentid: options[0].parentid,
            })
        }
    }

    const handleChangeAnswerNote = (event) => {
        const value = event.target.value
        setAnswerNote(value)

        setSurveyAnswer(surveyTrans, options[0].parentid, optionValue, {
            typ: optionTyp,
            parentid: options[0].parentid,
            answernote: value,
        })
    }

    return (
        <React.Fragment>
            <div className={classes.optionContainer}>
                <SurveyTooltip title={option && option.note || ''}>
                    <FormControl variant={SURVEY_INPUT_VARIANT} fullWidth disabled={surveyIsValid}>
                        <Select
                            native
                            value={optionValue}
                            onChange={handleChangeOption}
                            className={classes.textField}
                            inputProps={{
                                name: 'language-native-select',
                                id: 'language-native-select',
                                className: classes.textFieldInput,
                            }}
                        >
                            <option aria-label="None" value=""/>
                            {options.map((option, i) => {
                                if (option.typ === optionTyp) {
                                    return (
                                        <option value={String(option.id)} key={i}>
                                            {option.langwordtxt || option.description}
                                        </option>
                                    )
                                }
                            })}
                        </Select>
                    </FormControl>
                </SurveyTooltip>
            </div>
            {option && option.hasnote && (
                <HasNote
                    labelvisible={option.itemlabelvisible}
                    name={option.id}
                    label={option.customvalue}
                    value={answerNote}
                    onChange={handleChangeAnswerNote}
                />
            )}
            {option && option.hasfile && <HasFile option={option}/>}
            {option && option.children && <OnePageSurvey options={option.children} index={index}/>}
        </React.Fragment>
    )
}

export default memo(SelectOption)