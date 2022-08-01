import React, {memo} from 'react'
import {useSelector} from 'react-redux'
import {makeStyles} from '@material-ui/core/styles'
import styles from '../../../style/SurveyOptions.style'
import TextField from '@material-ui/core/TextField'
import {SURVEY_INPUT_VARIANT} from '../../../../../assets/const'

const useStyles = makeStyles(styles)

function HasNote(props) {
    const {name, value, label, labelvisible, onChange} = props

    //style
    const classes = useStyles()

    //redux
    const surveyIsValid = useSelector((state) => state.survey.isValid)

    return (
        <div className={classes.optionContainer}>
            <TextField
                onChange={onChange}
                variant={SURVEY_INPUT_VARIANT}
                multiline
                rows={4}
                fullWidth
                disabled={surveyIsValid}
                name={String(name) + '-answer-note'}
                label={labelvisible ? label : ""}
                value={value}
                className={classes.textField}
                InputProps={{classes: {input: classes.textFieldInput}}}
                InputLabelProps={{className: classes.textFieldLabel}}
            />
        </div>
    )
}

export default memo(HasNote)