import React, { useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import moment from 'moment'
import useTranslation from 'lib/translations/hooks/useTranslation'
import WebCmsGlobal from 'components/webcms-global'
import Image from 'next/image'
import * as global from '@webcms-globals'
import getSymbolFromCurrency from 'model/currency-symbol'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        margin: 'auto'
    },
    image: {
        width: 128,
        height: 128,
    },
    img: {
        margin: 'auto',
        display: 'block',
        maxWidth: '100%',
        maxHeight: '100%',
    },
}));

export default function RoomSummary(props) {
    const classes = useStyles()
    const { roomName, checkin, checkout, night, pax, child, thumbnail, price, pricecurr, guestList } = props
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { t } = useTranslation()

    return (
        <div className={classes.root}>
            <Paper className={classes.paper} variant="outlined" square>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <Image
                            src={thumbnail ? (GENERAL_SETTINGS.STATIC_URL + thumbnail) : '/imsg/no-image-available.png'}
                            alt={roomName}
                            width={500}
                            height={400}
                            quality={process.env.IMG_CACHE_QUALITY && process.env.IMG_CACHE_QUALITY || 60}
                        />
                    </Grid>
                    <Grid item xs={12} sm container>
                        <Grid item xs container direction="column" spacing={2}>
                            <Grid item xs>
                                <Typography gutterBottom variant="subtitle1">
                                    {roomName} <small>({night} {t(night > 1 ? 'str_nights' : 'str_night')})</small>
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" gutterBottom>
                                            {t('str_dates')}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {moment(checkin, 'YYYY-MM-DD').format('ddd, MMM DD, YYYY')}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {moment(checkout, 'YYYY-MM-DD').format('ddd, MMM DD, YYYY')} ({night} {t(night > 1 ? 'str_nights' : 'str_night')})
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" gutterBottom>
                                            {t('str_guests')}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                           {pax} {t(pax > 1 ? 'str_adults' : 'str_adult')}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {child} {t(child > 1 ? 'str_children' : 'str_child')}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="body2" gutterBottom>
                                            {t('str_guestInformation')}
                                        </Typography>
                                        {guestList && guestList.map((item, i) => (
                                            <Typography variant="body2" color="textSecondary" key={i}>
                                                {item.firstName.value + ' ' + item.lastName.value} {item.mail.value && (<small>({item.mail.value})</small>)}
                                            </Typography>
                                        ))}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Typography variant="subtitle1">{global.helper.formatPrice(price)} {getSymbolFromCurrency(pricecurr)}</Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        </div>
    );
}