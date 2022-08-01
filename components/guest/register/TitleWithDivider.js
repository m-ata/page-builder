import React from 'react'
import styles from './style/TitleWithDivider.style'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'

const useStyles = makeStyles(styles)

export default function TitleWithDivider(props) {
    const { title } = props
    const classes = useStyles()

    return (
        <Grid container direction={'row'} justify={'space-between'} alignItems={'center'}>
            <Grid item>
                <Typography component="h2" variant="h5" className={classes.title}>
                    {title}
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Divider className={classes.divider} />
            </Grid>
        </Grid>
    )
}
