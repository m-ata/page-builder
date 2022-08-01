import React, {memo} from 'react'
import {useSelector} from 'react-redux'
import {makeStyles} from '@material-ui/core/styles'
import styles from '../../../style/SurveyOptions.style'
import useTranslation from 'lib/translations/hooks/useTranslation'

const useStyles = makeStyles(styles);

function TitleAlign() {
    const { t } = useTranslation()

    //style
    const classes = useStyles();


    return <div className={classes.optionContainer}>{t('str_titleAlign')} {t('str_left')}/{t('str_right')}</div>
}

export default memo(TitleAlign)