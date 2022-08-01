import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import useTranslation from 'lib/translations/hooks/useTranslation'
import stylesRoomCard from '../../style/RoomCard.style'

const useStylesRoomCard = makeStyles(stylesRoomCard)

const RoomCard = (props) => {
    const { roomNo, roomType, roomTypeThumbnail, bedType, isSelect, onSelect } = props
    const { t } = useTranslation()
    const classes = useStylesRoomCard()

    return (
        <Paper variant="outlined" className={clsx(classes.paper, { [classes.active]: isSelect })} onClick={() => onSelect(roomNo)}>
            <Grid container spacing={2}>
                <Grid item>
                    <div className={classes.image}>
                        <img className={classes.img} alt='complex' src={roomTypeThumbnail} />
                    </div>
                </Grid>
                <Grid item xs={12} sm container direction="row" justify="space-between" alignItems="center">
                    <Grid item xs container spacing={3}>
                        <Grid item xs={6}>
                            <Typography variant='body2' color="primary">
                                {t('str_roomType')}
                            </Typography>
                            <Typography variant='body2' color='textSecondary'>
                                {roomType}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant='body2' color="primary">
                                {t('str_roomNo')}
                            </Typography>
                            <Typography variant='body2' color='textSecondary'>
                              {roomNo}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant='body2' color="primary">
                                {t('str_bedType')}
                            </Typography>
                            <Typography variant='body2' color='textSecondary'>
                                {bedType}
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Paper>
    )
}

export default RoomCard