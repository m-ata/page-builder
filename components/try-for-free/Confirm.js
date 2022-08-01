import React from 'react'
import { Box, Grid, Typography } from '@material-ui/core'
import useTranslation from 'lib/translations/hooks/useTranslation'

const Confirm = ({ classes, propertyInfo, registerTypes, registerType }) => {
    const { t } = useTranslation()

    return (
        <Grid container spacing={2} justify='space-between'>
            <Grid item xs={12}>
                <Box p={1}>
                    <div className={classes.congratsWrapper}>
                        <Typography variant="h5" className={classes.congratsLabel} gutterBottom>
                            🎉 {t('str_congrats')}
                        </Typography>
                        {registerTypes.demo === registerType ? (
                            <Typography variant='body1' align='justify' className={classes.congratsDescription} gutterBottom>
                                {t('str_tryCloudConfirmMsgForDemo', {email: propertyInfo.propertyEmail})}
                            </Typography>
                        ) : (
                            <Typography variant='body1' align='justify' className={classes.congratsDescription} gutterBottom>
                                {t('str_tryCloudConfirmMsgForBuyNow', {email: propertyInfo.propertyEmail})}
                            </Typography>
                        )}
                    </div>
                </Box>
            </Grid>
        </Grid>
    )
}

export default Confirm