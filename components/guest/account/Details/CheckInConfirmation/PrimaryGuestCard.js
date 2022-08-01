import React, {useContext} from 'react'
import styles from '../style/PrimaryGuestCard.style'
import Grid from '@material-ui/core/Grid'
import LoadingSpinner from 'components/LoadingSpinner'
import { makeStyles } from '@material-ui/core/styles'
import stylesTabPanel from '../../style/TabPanel.style'

import { Typography } from '@material-ui/core'
import moment from 'moment'
import { OREST_ENDPOINT } from 'model/orest/constants'
import { useSelector } from 'react-redux'
import useTranslation from 'lib/translations/hooks/useTranslation'
import WebCmsGlobal from 'components/webcms-global'

const useStyles = makeStyles(styles)
const useStylesTabPanel = makeStyles(stylesTabPanel)

const EMPTY_STRING = '-'

export default function PrimaryGuestCard(props) {
    const { t } = useTranslation()

    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { reservatSignature } = props
    const classes = useStyles()
    const classesTabPanel = useStylesTabPanel()

    //redux
    const guest = useSelector((state) => state.orest.state && state.orest.state.client)

    if (!guest) {
        return <LoadingSpinner />
    }

    return (
        <Grid item xs={12} className={classesTabPanel.gridItem}>
            <Grid container spacing={3} className={classes.paper}>
                <Grid item xs={12} sm={6} md={3}>
                    <Typography noWrap variant="subtitle2" className={classes.title1}>
                        {t('str_name')}
                    </Typography>
                    <Typography noWrap variant="body2" className={classes.title2}>
                        {guest.fullname || EMPTY_STRING}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Typography noWrap variant="subtitle2" className={classes.title1}>
                        {t('str_birthday')}
                    </Typography>
                    <Typography noWrap variant="body2" className={classes.title2}>
                        {(guest.birthdate && moment(guest.birthdate).format(OREST_ENDPOINT.DATEFORMAT_USER)) ||
                        EMPTY_STRING}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Typography noWrap variant="subtitle2" className={classes.title1}>
                        {t('str_gender')}
                    </Typography>
                    <Typography noWrap variant="body2" className={classes.title2}>
                        {guest.genderdesc || EMPTY_STRING}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Typography noWrap variant="subtitle2" className={classes.title1}>
                        {t('str_email')}
                    </Typography>
                    <Typography noWrap variant="body2" className={classes.title2}>
                        {guest.email || EMPTY_STRING}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Typography noWrap variant="subtitle2" className={classes.title1}>
                        {t('str_mobile')}
                    </Typography>
                    <Typography noWrap variant="body2" className={classes.title2}>
                        {guest.mobiletel && guest.mobiletel.startsWith('00') ? guest.mobiletel.replace('00', '+') : guest.mobiletel || EMPTY_STRING}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Typography noWrap variant="subtitle2" className={classes.title1}>
                        {t('str_nationality')}
                    </Typography>
                    <Typography noWrap variant="body2" className={classes.title2}>
                        {guest.nationdesc || EMPTY_STRING}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Typography noWrap variant="subtitle2" className={classes.title1}>
                        {t('str_country')}
                    </Typography>
                    <Typography noWrap variant="body2" className={classes.title2}>
                        {guest.country || EMPTY_STRING}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Typography noWrap variant="subtitle2" className={classes.title1}>
                        {t('str_city')}
                    </Typography>
                    <Typography noWrap variant="body2" className={classes.title2}>
                        {guest.city || EMPTY_STRING}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Typography noWrap variant="subtitle2" className={classes.title1}>
                        {t('str_idNumber')}
                    </Typography>
                    <Typography noWrap variant="body2" className={classes.title2}>
                        {guest.idno || EMPTY_STRING}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Typography noWrap variant="subtitle2" className={classes.title1}>
                        {t('str_idType')}
                    </Typography>
                    <Typography noWrap variant="body2" className={classes.title2}>
                        {guest.idtypedesc || EMPTY_STRING}
                    </Typography>
                </Grid>
                {reservatSignature ? (
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography noWrap variant="subtitle2" className={classes.title1}>
                            {t('str_sign')}
                        </Typography>
                        <img style={{ height: 52, border: '1px dashed #e8e8e8', padding: 12, }} src={GENERAL_SETTINGS.STATIC_URL + reservatSignature}/>
                    </Grid>
                ): null}
                <Grid item xs={reservatSignature ? 12 : 6}>
                    <Typography noWrap variant="subtitle2" className={classes.title1}>
                        {t('str_address')}
                    </Typography>
                    <Typography noWrap variant="body2" className={classes.title2}>
                        {guest.address1 || EMPTY_STRING} {guest.address2}
                    </Typography>
                </Grid>
            </Grid>
        </Grid>
    )
}
