import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import LoyaltyOutlinedIcon from '@material-ui/icons/LoyaltyOutlined';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import useTranslation from 'lib/translations/hooks/useTranslation'
import stylesGiftCard from 'components/guest/account/style/GiftCard.style'
const useStylesGiftCard = makeStyles(stylesGiftCard)

const ReceivableGiftCard = (props) => {
    const { code, title, requiredBonus, sliderID, giftThumbnail, disabled, onSelect, onDetail } = props
    const { t } = useTranslation()
    const classes = useStylesGiftCard()

    return (
        <Paper className={classes.paper}>
            <Grid container spacing={2} alignItems='center'>
                <Grid item xs={12} style={{ borderBottom: '1px solid #dddddd'}}>
                    <Grid container spacing={2}>
                        <Grid item xs>
                            <div className={classes.textAndIcon}>
                                <Typography variant='body2'>
                                    {title ? t(title?.removeHtmlTag()) : '-'}
                                </Typography>
                            </div>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item>
                    <div className={classes.image} onClick={() => onDetail(sliderID)}>
                        <img className={classes.img} alt={title ? t(title?.removeHtmlTag()) : '-'} src={giftThumbnail} />
                    </div>
                </Grid>
                <Grid item xs={12} sm container alignItems='center'>
                    <Grid item xs={12} container spacing={3} alignItems='center'>
                        <Grid item xs={12}>
                            <div className={classes.textAndIcon}>
                                <LoyaltyOutlinedIcon/>
                                <Typography variant='body2'>
                                    {t('str_requiredBonus')}
                                </Typography>
                            </div>
                            <Typography variant='body1' color='textSecondary' className={classes.propValue}>
                                {requiredBonus}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Button variant="outlined" color="primary" size="small" disabled={!sliderID} className={classes.button} startIcon={<InfoOutlinedIcon/>} onClick={() => onDetail(sliderID)}>
                                        {t('str_details')}
                                    </Button>
                                </Grid>
                                <Grid item xs={6} style={{ textAlign: 'right' }}>
                                    <Button disabled={disabled} variant="contained" color="primary" size="small" className={classes.button} startIcon={<AddIcon />} onClick={() => onSelect(code, requiredBonus)}>
                                        {t('str_select')}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Paper>
    )
}

export default ReceivableGiftCard