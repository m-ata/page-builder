import React, { useContext, useState, memo, useEffect } from 'react'
import RadioGroup from '@material-ui/core/RadioGroup'
import Radio from '@material-ui/core/Radio'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import useSurveyAction from '../../../../model/survey/useSurveyAction'
import { useSelector } from 'react-redux'
import OnePageSurvey from '../render-types/OnePageSurvey'
import { makeStyles } from '@material-ui/core/styles'
import styles from '../../style/SurveyOptions.style'
import HasNote from './sub-components/HasNote'
import HasFile from './sub-components/HasFile'
import WebCmsGlobal from '../../../webcms-global'
import FormLabel from '@material-ui/core/FormLabel'
import FormControl from '@material-ui/core/FormControl'
import SurveyTooltip from 'components/survey/helper/SurveyTooltip'
import { useRouter } from 'next/router'

const useStyles = makeStyles(styles)

function getOptionFromOptionValue(options, optionValue) {
    if (options && options.length > 0 && optionValue) {
        let data = []
        options.map((k) => {
            data = { ...data, [k.id]: k }
        })

        return data[optionValue]
    } else {
        return null
    }
}

function RadioOption(props) {
    const { options, optionTyp, index, isHorzintal } = props
        , { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
        , router = useRouter()
        , surveyType = router.query.surveyType || false
        , answerId = router.query.answerId || false

    //style
    const classes = useStyles()

    //redux
    const { setSurveyAnswer } = useSurveyAction()
        , surveyTrans = useSelector((state) => state.survey.trans)
        , surveyIsValid = useSelector((state) => state.survey.isValid)
        , oldAnswers = useSelector((state) => state.survey.answers[surveyTrans] && state.survey.answers[surveyTrans][options[0].parentid],)
        , oldAnswer =
        oldAnswers &&
        Object.keys(oldAnswers)
            .map((k) => ({ ...oldAnswers[k], id: k }))
            .filter((j) => {
                return j.typ === optionTyp
            })

    //state
    const [option, setOption] = useState(getOptionFromOptionValue(options, oldAnswer && oldAnswer[0] ? oldAnswer[0].id : ''),)
        , [optionValue, setOptionValue] = useState(oldAnswer && oldAnswer[0] ? oldAnswer[0].id : '')
        , [answerNote, setAnswerNote] = useState(oldAnswer && oldAnswer[0] ? oldAnswer[0].answernote || '' : '')

    useEffect(() => {
        if(surveyType === 'NSP' && answerId){
            const value = answerId
                , option = options.filter(item => String(item.id) === String(value))
            setOption(option[0])

            //clear answerNote
            setAnswerNote('')
            setOptionValue(value)
            setSurveyAnswer(surveyTrans, options[0].parentid, option[0].id, {
                typ: optionTyp,
                parentid: options[0].parentid,
            })
        }
    }, [])

    const handleChangeOption = (event) => {
        const value = event.target.value
            , option = options.filter(item => String(item.id) === String(value))
        setOption(option[0])

        //clear answerNote
        setAnswerNote('')
        setOptionValue(value)
        setSurveyAnswer(surveyTrans, options[0].parentid, option[0].id, {
            typ: optionTyp,
            parentid: options[0].parentid,
        })
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
            <FormControl component="fieldset">
                <FormLabel component='legend' disabled={surveyIsValid}/>
                <RadioGroup
                    row={isHorzintal}
                    value={optionValue}
                    onChange={(event) => {
                        if(!surveyIsValid){
                            handleChangeOption(event)
                        }
                    }}
                >
                    {options.map((option, i) => {
                        if (option.typ === optionTyp) {
                            return (
                                <SurveyTooltip title={option && option.note || ''} key={i}>
                                    <FormControlLabel
                                        labelPlacement={option?.imageurl ? "bottom" : "end"}
                                        classes={{
                                            root: classes.formControlLabel,
                                            label: classes.answerText,
                                        }}
                                        name={String(option.id)}
                                        value={String(option.id)}
                                        control={
                                            <Radio
                                                classes={{
                                                    root: classes.controlRoot,
                                                    checked: classes.controlChecked,
                                                    disabled: classes.controlDisabled,
                                                }}
                                            />
                                        }
                                        label={
                                            <React.Fragment>
                                                <span>{option.langwordtxt || option.description}</span>
                                                {option.imageurl ? (
                                                    <img
                                                        src={GENERAL_SETTINGS.STATIC_URL + option.imageurl}
                                                        alt={option.langwordtxt || option.description}
                                                        className={classes.answerImage}
                                                    />
                                                ): null}
                                            </React.Fragment>
                                        }/>
                                </SurveyTooltip>
                            )
                        }
                    })}
                </RadioGroup>
            </FormControl>
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

export default memo(RadioOption)