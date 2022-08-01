import React from 'react'
import styles from './style/BackToLoginLink.style'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import Typography from '@material-ui/core/Typography'
import Link from 'next/link'
import useTranslation from 'lib/translations/hooks/useTranslation'

const useStyles = makeStyles(styles)

export default function BackToLoginLink() {
    const { t } = useTranslation()
    const classes = useStyles()

    return (
        <Grid container direction={'row'} justify={'center'} alignItems={'center'}>
            <Grid item>
                <ArrowBackIcon className={classes.arrowIcon} />
            </Grid>
            <Grid item>
                <Typography variant="h5" className={classes.text}>
                    <Link href={'/guest/login'}>
                        <a>{t('str_backToLoginPage')}</a>
                    </Link>
                </Typography>
            </Grid>
        </Grid>
    )
}
