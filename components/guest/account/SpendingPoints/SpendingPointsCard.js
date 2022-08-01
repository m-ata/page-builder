import React, { useContext, useEffect, useState } from 'react'
import styles from './style/SpendingPointsCard.style'
import LoadingSpinner from '../../../LoadingSpinner'
import Grid from '@material-ui/core/Grid'
import { Card, CardActions, CardContent } from '@material-ui/core'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos'
import useNotifications from '../../../../model/notification/useNotifications'
import axios from 'axios'
import { DEFAULT_OREST_TOKEN } from '../../../../model/orest/constants'
import WebCmsGlobal from '../../../webcms-global'
import { useSelector } from 'react-redux'
import NotFoundImage from '../../../../assets/img/loyalty/default/not-found.png'
import { makeStyles } from '@material-ui/core/styles'
import stylesTabPanel from '../style/TabPanel.style'
import useTranslation from 'lib/translations/hooks/useTranslation'
import CardImage from '../../../../@webcms-ui/core/card-image';

const useStyles = makeStyles(styles)
const useStylesTabPanel = makeStyles(stylesTabPanel)

export default function SpendingPointsCard(props) {
    const { t } = useTranslation()
    const { spendingPoint } = props
    const classes = useStyles()
    const classesTabPanel = useStylesTabPanel()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    //redux
    const { showMessage, showError } = useNotifications()
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
    const token = useSelector((state) => state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN)

    //state
    const [image, setImage] = useState(null)

    useEffect(() => {
        let active = true
        if (active) {
            if (spendingPoint.mid) {
                axios({
                    url: `${GENERAL_SETTINGS.OREST_URL}/tools/file/download`,
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    method: 'get',
                    responseType: 'arraybuffer',
                    params: {
                        mid: spendingPoint.mid,
                        code: 'PHOTO',
                        hotelrefno: loginfo.hotelrefno || GENERAL_SETTINGS.HOTELREFNO
                    },
                }).then((r) => {
                    if (active) {
                        if (r.status === 200) {
                            let blob = new Blob([r.data], { type: r.data.type })
                            let url = URL.createObjectURL(blob)
                            setImage(url)
                        }
                    }
                })
            }
        }

        return () => {
            active = false
        }
    }, [])

    if (!spendingPoint) {
        return <LoadingSpinner />
    }

    function handleButtonMoreInfo() {
        showMessage('Very Soon!')
    }

    return (
        <Grid item xs={12} sm={6} md={4} className={classesTabPanel.gridItem}>
            <Card className={classes.root}>
                <CardImage src={image || NotFoundImage}/>
                <CardContent>
                    <Grid container direction={'row'} justify={'center'} alignItems={'center'}>
                        <Grid item xs={12}>
                            <Typography noWrap className={classes.photoTitle}>
                                {spendingPoint.code}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body2" className={classes.description}>
                                {spendingPoint.description}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions>
                    <Grid container direction={'row'} justify={'center'} alignItems={'center'}>
                        <Grid item>
                            <Button onClick={handleButtonMoreInfo}>
                                <Typography variant="h5" className={classes.more}>
                                    {t('str_moreInfo')}
                                </Typography>
                                <ArrowForwardIosIcon style={{ color: '#198C9B', fontSize: 17 }} />
                            </Button>
                        </Grid>
                    </Grid>
                </CardActions>
            </Card>
        </Grid>
    )
}
