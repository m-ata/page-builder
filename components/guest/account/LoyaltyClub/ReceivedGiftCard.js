import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import LoyaltyOutlinedIcon from '@material-ui/icons/LoyaltyOutlined'
import CalendarTodayRoundedIcon from '@material-ui/icons/CalendarTodayRounded'
import moment from 'moment'
import useTranslation from 'lib/translations/hooks/useTranslation'
import stylesGiftCard from 'components/guest/account/style/GiftCard.style'
const useStylesGiftCard = makeStyles(stylesGiftCard)

const ReceivedGiftCard = (props) => {
    const { isClosed, title, bonusUsed, receivedDate, giftThumbnail } = props
    const { t } = useTranslation()
    const classes = useStylesGiftCard()

    return (
        <Paper className={classes.paper}>
            <Grid container spacing={2} alignItems='center'>
                <Grid item xs={12} style={{ borderBottom: '1px solid #dddddd'}}>
                    <Grid container spacing={2} containerdirection="row" justifyContent="space-between" alignItems="center">
                        <Grid item xs>
                            <Typography variant='body2' style={{color: '#b3b3b3'}}>
                                {title ? t(title?.removeHtmlTag()) : '-'}
                            </Typography>
                        </Grid>
                        <Grid item xs>
                            <Typography variant='body2' align="right" style={isClosed ? {color: '#4caf50'}:{color: '#ebb514'}}>
                                {isClosed ? t('str_delivered'):t('str_preparing')}
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item>
                    <div className={classes.image}>
                        <img className={classes.img} alt={title} src={giftThumbnail} />
                    </div>
                </Grid>
                <Grid item xs={12} sm container alignItems='center'>
                    <Grid item xs={12} container spacing={3} alignItems='center'>
                        <Grid item xs={6}>
                            <div className={classes.textAndIcon}>
                                <LoyaltyOutlinedIcon/>
                                <Typography variant='body2'>
                                    {t('str_status')}
                                </Typography>
                            </div>
                            <Typography variant='body1' color='textSecondary' className={classes.propValue}>
                                {bonusUsed}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <div className={classes.textAndIcon}>
                                <LoyaltyOutlinedIcon/>
                                <Typography variant='body2'>
                                    {t('str_bonusUsed')}
                                </Typography>
                            </div>
                            <Typography variant='body1' color='textSecondary' className={classes.propValue}>
                                {bonusUsed}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <div className={classes.textAndIcon}>
                                <CalendarTodayRoundedIcon/>
                                <Typography variant='body2'>
                                    {t('str_receivedDate')}
                                </Typography>
                            </div>
                            <Typography variant='body1' color='textSecondary' className={classes.propValue}>
                                {moment(receivedDate, 'YYYY-MM-DD').format('dd, MMM DD, YYYY')}
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Paper>
    )
}

export default ReceivedGiftCard