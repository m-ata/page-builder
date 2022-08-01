import React, { useState, memo } from 'react'
import PropTypes from 'prop-types'
import Rating from '@material-ui/lab/Rating'
import useSurveyAction from 'model/survey/useSurveyAction'
import { useSelector } from 'react-redux'
import SentimentVeryDissatisfiedIcon from '@material-ui/icons/SentimentVeryDissatisfied'
import SentimentDissatisfiedIcon from '@material-ui/icons/SentimentDissatisfied'
import SentimentSatisfiedIcon from '@material-ui/icons/SentimentSatisfied'
import SentimentSatisfiedAltIcon from '@material-ui/icons/SentimentSatisfiedAltOutlined'
import SentimentVerySatisfiedIcon from '@material-ui/icons/SentimentVerySatisfied'
import { makeStyles } from '@material-ui/core/styles'
import styles from '../../style/SurveyOptions.style'
import SurveyTooltip from 'components/survey/helper/SurveyTooltip'

const useStyles = makeStyles(styles)

function IconContainer(props) {
    const { value, classes, ...other } = props

    const customIcons = {
        1: {
            icon: <SentimentVeryDissatisfiedIcon className={classes.scoreIcon}/>,
            label: 'Very Dissatisfied',
        },
        2: {
            icon: <SentimentDissatisfiedIcon className={classes.scoreIcon}/>,
            label: 'Dissatisfied',
        },
        3: {
            icon: <SentimentSatisfiedIcon className={classes.scoreIcon}/>,
            label: 'Neutral',
        },
        4: {
            icon: <SentimentSatisfiedAltIcon className={classes.scoreIcon}/>,
            label: 'Satisfied',
        },
        5: {
            icon: <SentimentVerySatisfiedIcon className={classes.scoreIcon}/>,
            label: 'Very Satisfied',
        },
    }

    return <span {...other}>{customIcons[value].icon}</span>
}

IconContainer.propTypes = {
    value: PropTypes.number.isRequired,
}

function ScoreOption(props) {
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
    const [optionValue, setOptionValue] = useState(oldAnswer ? oldAnswer.valuefloat : 0)

    const handleChangeOption = (event, value, option) => {
        setOptionValue(value)

        if (value && value !== '' && value !== 0) {
            setSurveyAnswerMulti(surveyTrans, option.parentid, option.id, {
                typ: optionTyp,
                parentid: option.parentid,
                valuefloat: value,
            })
        } else {
            deleteSurveyAnswer(surveyTrans, option.parentid, option.id)
        }
    }

    return (
        <div className={classes.optionContainer}>
            <SurveyTooltip title={option && option.note || ''}>
                <Rating
                    onChange={(event, newValue) => handleChangeOption(event, newValue, option)}
                    value={optionValue}
                    name={`${option.parentid}-${option.id}`}
                    disabled={surveyIsValid}
                    IconContainerComponent={(props) => IconContainer({ ...props, classes })}
                    style={{ flexWrap: 'wrap' }}
                />
            </SurveyTooltip>
        </div>
    )
}

export default memo(ScoreOption)