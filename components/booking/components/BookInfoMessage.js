import React from 'react'
import moment from 'moment'
import { makeStyles } from '@material-ui/core/styles'
import { Paper, Typography, Card, CardActions, Button, IconButton } from '@material-ui/core'
import {Close, CheckCircle} from '@material-ui/icons'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { green } from '@material-ui/core/colors'

const useStyles = makeStyles(() => ({
    card: {
        backgroundColor: '#fddc6c',
        width: '100%',
    },
    typography: {
        fontWeight: 'bold',
    },
    actionRoot: {
        padding: '8px 8px 8px 16px',
        justifyContent: 'space-between',
    },
    icons: {
        marginLeft: 'auto',
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
    collapse: {
        padding: 16,
        textAlign: 'end'
    },
    infoText: {
        textAlign: 'start'
    },
    checkIcon: {
        fontSize: 20,
        paddingRight: 4,
    },
    button: {
        backgroundColor: green[400],
        textTransform: 'none',
        '&:hover': {
            backgroundColor: green[500],
        },
    },
}))

const BookInfoMessage = ((props) => {
    const classes = useStyles()
    const { t } = useTranslation()

    return (
        <Card className={classes.card}>
            <CardActions classes={{ root: classes.actionRoot }}>
                <Typography variant='subtitle2' className={classes.typography}>
                    {t('str_wouldYouLikeToCompleteTheReservationBelow')}
                </Typography>
                <div className={classes.icons}>
                    <IconButton className={classes.expand} onClick={() => props.handleClose()}>
                        <Close />
                    </IconButton>
                </div>
            </CardActions>
            <Paper className={classes.collapse}>
                <Typography gutterBottom className={classes.infoText}>{t('str_bookInfoPersistMessage', {
                    ci: props?.useData?.checkinDate ? moment(props?.useData?.checkinDate).format('DD.MM.YYYY') : '',
                    co: props?.useData?.checkoutDate ? moment(props?.useData?.checkoutDate).format('DD.MM.YYYY') : '',
                    night: props?.useData?.checkinDate && props?.useData?.checkoutDate ? moment(props?.useData?.checkoutDate).diff(moment(props?.useData?.checkinDate), 'days') : 0,
                    adult: props?.useData?.adult || 0,
                    child: props?.useData?.child || 0,
                })}</Typography>
                <Button variant='contained' color='primary' className={classes.button} disableElevation onClick={()=> props.handleUse()}>
                    <CheckCircle className={classes.checkIcon} />
                    {t('str_yesUseThisInformation')}
                </Button>
            </Paper>
        </Card>
    )
})

export default BookInfoMessage