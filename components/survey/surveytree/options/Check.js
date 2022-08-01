import React, { useContext, useState, memo } from 'react'
import FormGroup from '@material-ui/core/FormGroup'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import useSurveyAction from '../../../../model/survey/useSurveyAction'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import styles from '../../style/SurveyOptions.style'
import WebCmsGlobal from '../../../webcms-global'
import SurveyTooltip from 'components/survey/helper/SurveyTooltip'

const useStyles = makeStyles(styles)

function CheckItem(props) {
    const { option, optionTyp } = props
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

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
    const [optionValue, setOptionValue] = useState(!!oldAnswer)

    const handleChangeOption = (event) => {
        const checked = event.target.checked
        setOptionValue(checked)

        if (checked) {
            setSurveyAnswerMulti(surveyTrans, option.parentid, option.id, {
                typ: optionTyp,
                parentid: option.parentid,
            })
        } else {
            deleteSurveyAnswer(surveyTrans, option.parentid, option.id)
        }
    }

    return (
        <SurveyTooltip title={option && option.note || ''}>
            <FormControlLabel
                onChange={handleChangeOption}
                checked={optionValue}
                disabled={surveyIsValid}
                name={String(option.id)}
                value={String(option.id)}
                control={
                    <Checkbox
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
                        {option.imageurl && (
                            <img
                                src={GENERAL_SETTINGS.STATIC_URL + option.imageurl}
                                alt={option.langwordtxt || option.description}
                                className={classes.answerImage}
                            />
                        )}
                    </React.Fragment>
                }
                classes={{
                    root: classes.formControlLabel,
                    label: classes.answerText,
                }}
            />
        </SurveyTooltip>
    )
}

const MemoizedCheckItem = memo(CheckItem)

function CheckOption(props) {
    const { options, optionTyp, isHorzintal } = props

    return (
        <FormGroup row={isHorzintal}>
            {options.map((option, i) => {
                if (option.typ === optionTyp) {
                    return <MemoizedCheckItem option={option} optionTyp={optionTyp} key={i}/>
                }
            })}
        </FormGroup>
    )
}

export default memo(CheckOption)
