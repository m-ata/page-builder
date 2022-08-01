import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import useTranslation from 'lib/translations/hooks/useTranslation'

const useStyles = makeStyles({
    card: {
        maxWidth: 325,
    },
    media: {
        height: 140,
    },
})

export default function ProductCard() {
    const classes = useStyles()
    const { t } = useTranslation()

    return (
        <div className={classes.root}>
            <Grid container spacing={3}>
                <Grid item xs={4}>
                    <Card className={classes.card}>
                        <CardActionArea>
                            <CardMedia
                                className={classes.media}
                                image="https://limakthermal.com/files/CE867584-562D-43EE-9CEA-075680C5DE88/pythia/thumbs/IMG_09101.jpg"
                                title="Contemplative Reptile"
                            />
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="h2">
                                    {t('str_chivaSpecialPackage')}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" component="p">
                                   1 {t('str_x')} {t('str_turkishBathCutFoam')} 1 {t('str_x')} {t('str_indianHeadMassage')} 1 {t('str_x')} {t('str_traditionalBaliMassage')} {t('str_timeWithDoubleDot')} 1
                                    {t('str_hour')} 20 {t('str_minute')}
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                        <CardActions>
                            <Button size="small" color="primary">
                                {t('str_share')}
                            </Button>
                            <Button size="small" color="primary">
                                {t('str_learnMore')}
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
                <Grid item xs={4}>
                    <Card className={classes.card}>
                        <CardActionArea>
                            <CardMedia
                                className={classes.media}
                                image="https://limakthermal.com/files/CE867584-562D-43EE-9CEA-075680C5DE88/pythia/thumbs/IMG_09101.jpg"
                                title="Contemplative Reptile"
                            />
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="h2">
                                    {t('str_purityAndVitality')}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" component="p">
                                   1 {t('str_x')} {t('str_turkishBathCutFoam')} 1 {t('str_x')} {t('str_indianHeadMassage')} 1 {t('str_x')} {t('str_traditionalBaliMassage')} {t('str_timeWithDoubleDot')} 1
                                    {t('str_hour')} 20 {t('str_minute')}
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                        <CardActions>
                            <Button size="small" color="primary">
                                {t('str_share')}
                            </Button>
                            <Button size="small" color="primary">
                                {t('str_learnMore')}
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
                <Grid item xs={4}>
                    <Card className={classes.card}>
                        <CardActionArea>
                            <CardMedia
                                className={classes.media}
                                image="https://limakthermal.com/files/CE867584-562D-43EE-9CEA-075680C5DE88/pythia/thumbs/IMG_09101.jpg"
                                title="Contemplative Reptile"
                            />
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="h2">
                                    {t('str_pamperYourself')}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" component="p">
                                    1 {t('str_x')} {t('str_turkishBathCutFoam')} 1 {t('str_x')} {t('str_indianHeadMassage')} 1 {t('str_x')} {t('str_traditionalBaliMassage')} {t('str_timeWithDoubleDot')} 1
                                    {t('str_hour')} 20 {t('str_minute')}
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                        <CardActions>
                            <Button size="small" color="primary">
                                {t('str_share')}
                            </Button>
                            <Button size="small" color="primary">
                                {t('str_learnMore')}
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>
        </div>
    )
}
