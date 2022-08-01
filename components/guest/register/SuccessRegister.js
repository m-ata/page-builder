import React from 'react'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import styles from './style/SuccessRegister.style'
import { makeStyles } from '@material-ui/core/styles'
import BackToLoginLink from '../../layout/components/BackToLoginLink'
import useTranslation from 'lib/translations/hooks/useTranslation'

const useStyles = makeStyles(styles)

export default function SuccessRegister() {
    const { t } = useTranslation()
    const classes = useStyles()

    return (
        <Grid container direction={'column'} justify={'center'} alignItems={'center'} className={classes.grid}>
            <Grid item xs={12} className={classes.gridItem}>
                <Typography component="h1" variant="h5" className={classes.title}>
                    {t('str_successfulSignUpMessage')}
                </Typography>
            </Grid>
            <Grid item xs={12} className={classes.gridItem}>
                <Typography component="h1" variant="h5" className={classes.paragraph1}>
                    {t('str_pleaseCheckYourMailBoxPassword')}
                </Typography>
            </Grid>
            <Grid item xs={12} className={classes.gridItem}>
                <Divider className={classes.divider} />
            </Grid>
            <Grid item xs={12} style={{ marginBottom: 40 }}>
                <BackToLoginLink />
            </Grid>
        </Grid>
    )
}
