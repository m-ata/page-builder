import React, { memo } from 'react'
import {useSelector} from 'react-redux'
import {makeStyles} from '@material-ui/core/styles'
import styles from '../../../style/SurveyOptions.style'
import useTranslation from 'lib/translations/hooks/useTranslation'

const useStyles = makeStyles(styles);

function AnswerAlign(props) {
    const { t } = useTranslation()

    //style
    const classes = useStyles();

    return <div className={classes.optionContainer}>{t('str_answerAlign')} {t('str_horizontal')}/{t('str_vertical')}</div>
}

export default memo(AnswerAlign)