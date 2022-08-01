import React, { useState, memo } from 'react'
import Rating from '@material-ui/lab/Rating'
import useSurveyAction from '../../../../model/survey/useSurveyAction'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import styles from '../../style/SurveyOptions.style'
import SurveyTooltip from 'components/survey/helper/SurveyTooltip'

const useStyles = makeStyles(styles);

//TODO - Improve component with example
function RatingOption(props) {
    const { option, optionTyp } = props;

    //style
    const classes = useStyles();

    //redux
    const { setSurveyAnswerMulti, deleteSurveyAnswer } = useSurveyAction();
    const surveyTrans = useSelector((state) => state.survey.trans);
    const surveyIsValid = useSelector((state) => state.survey.isValid);
    const oldAnswer = useSelector(
        (state) =>
            state.survey.answers[surveyTrans] &&
            state.survey.answers[surveyTrans][option.parentid] &&
            state.survey.answers[surveyTrans][option.parentid][option.id]
    );

    //state
    const [optionValue, setOptionValue] = useState(oldAnswer ? oldAnswer.valuefloat : 0);

    const handleChangeOption = (event, value, option) => {
        setOptionValue(value);

        if (value && value !== '' && value !== 0) {
            setSurveyAnswerMulti(surveyTrans, option.parentid, option.id, {
                typ: optionTyp,
                parentid: option.parentid,
                valuefloat: value,
            })
        } else {
            deleteSurveyAnswer(surveyTrans, option.parentid, option.id)
        }
    };

    return (
        <div className={classes.optionContainer}>
            <SurveyTooltip title={option && option.note || ''}>
                <Rating
                    onChange={(event, newValue) => handleChangeOption(event, newValue, option)}
                    value={optionValue}
                    name={String(option.id)}
                    max={10}
                    disabled={surveyIsValid}
                    style={{ flexWrap: 'wrap' }}
                />
            </SurveyTooltip>
        </div>

    )
}

export default memo(RatingOption)