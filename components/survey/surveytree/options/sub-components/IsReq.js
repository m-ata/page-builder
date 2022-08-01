import React, {memo} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import styles from 'components/survey/style/SurveyOptions.style'
import useTranslation from 'lib/translations/hooks/useTranslation'

const useStyles = makeStyles(styles)

function IsReq() {
    const classes = useStyles()
        , { t } = useTranslation()

    return (
        <div className={classes.optionContainer}>
            <span title={t('str_mandatory')} className={classes.isRequiredQuestion}>*</span>
        </div>
    )
}

export default memo(IsReq)