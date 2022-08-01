import React, { useContext, useEffect, useState } from 'react'
import styles from './style/SurveyCard.style'
import LoadingSpinner from 'components/LoadingSpinner'
import axios from "axios"
import { DEFAULT_OREST_TOKEN } from 'model/orest/constants'
import { connect, useSelector } from 'react-redux'
import WebCmsGlobal from 'components/webcms-global'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Image from 'next/image'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import DefaultSurveyImage from '../../../../assets/img/loyalty/default/survey.jpg'
import { makeStyles } from '@material-ui/core/styles'
import stylesTabPanel from '../style/TabPanel.style'
import moment from 'moment'
import useTranslation from 'lib/translations/hooks/useTranslation'
import SurveyTreeDialog from '../../../survey/surveytree/dialog'
import { useSnackbar } from 'notistack'

const useStyles = makeStyles(styles)
const useStylesTabPanel = makeStyles(stylesTabPanel)

const SurveyCard = (props) => {
    const { survey, clientId, state } = props
    const classes = useStyles()
    const classesTabPanel = useStylesTabPanel()
    const { t } = useTranslation()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const [openSurveyData, setOpenSurveyData] = useState(false)
    const { enqueueSnackbar } = useSnackbar()

    //redux
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
    let hotelRefno = loginfo && loginfo.hotelrefno || GENERAL_SETTINGS.HOTELREFNO
    const reservBase = state.clientReservation || false
    const token = useSelector((state) => state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN)
    const isClient = loginfo.roletype === '6500310'
    const isPortal = GENERAL_SETTINGS.ISPORTAL

    //state
    const [image, setImage] = useState(null)

    useEffect(() => {
        let active = true
        if (active) {
            if (survey.mid) {
                axios({
                    url: `${GENERAL_SETTINGS.OREST_URL}/tools/file/download`,
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    method: 'get',
                    responseType: 'arraybuffer',
                    params: {
                        mid: survey.mid,
                        code: 'PHOTO',
                        hotelrefno: hotelRefno
                    },
                }).then((r) => {
                    if (active) {
                        if (r.status === 200) {
                            let blob = new Blob([r.data], {
                                type: r.data.type,
                            })
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

    if (!survey) {
        return <LoadingSpinner />
    }

    const isCanUseSurvey = () => {
        const useHotelRefNo = GENERAL_SETTINGS.ISCHAIN ? state.changeHotelRefno : GENERAL_SETTINGS.HOTELREFNO
            , isReservation = reservBase?.reservno || false
            , isGroupSurvey = GENERAL_SETTINGS.ISCHAIN && GENERAL_SETTINGS.HOTELREFNO === survey.hotelrefno

        if(isClient && !isGroupSurvey && isReservation && Number(reservBase.hotelrefno) !== Number(useHotelRefNo)){
            enqueueSnackbar(t('str_youCanOnlyFillOutASurveyAtTheHotelYouAreStayingAt 12'), { variant: 'info' })
            return false
        }

        if(isClient && !isGroupSurvey && !loginfo?.emphotelids?.includes(Number(useHotelRefNo))){
            enqueueSnackbar(t('str_youCanOnlyUseItAtTheHotelYouAreConnectedTo 32'), { variant: 'info' })
            return false
        }

        if(isClient && survey?.onlyih && isReservation && reservBase?.status !== "I"){
            enqueueSnackbar(t('str_youMustBeInhouseInToTheHotelToFillAThisSurvey'), { variant: 'info' })
            return false
        }

        return true
    }

    return (
        <Grid item xs={12} className={classesTabPanel.gridItem}>
            <Paper className={classes.paper}>
                <Grid container className={classesTabPanel.gridContainer}>
                    <Grid item xs={12} md={5}>
                        <Image
                            alt="Mountains"
                            src={image || DefaultSurveyImage}
                            layout="responsive"
                            width={700}
                            height={475}
                        />
                    </Grid>
                    <Grid item xs={12} md={7}>
                        <Grid
                            container
                            spacing={3}
                            justify={'space-between'}
                            alignItems={'center'}
                            className={classesTabPanel.gridContainer}
                            style={{
                                height: '100%',
                            }}
                        >
                            <Grid item xs={12}>
                                <Grid container justify={'flex-end'} alignItems={'center'}>
                                    <Grid item>
                                        <Typography className={classes.surveyDate}>
                                            {moment(survey.startdate).format('DD/MM/YYYY')}
                                            {' - '}
                                            {moment(survey.enddate).format('DD/MM/YYYY')}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography noWrap className={classes.surveyTitle}>
                                    {survey.description}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography noWrap className={classes.fillSurvey}>
                                    {survey.note}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography noWrap className={classes.fillSurvey}>
                                    {survey.hotelname}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container justify={'flex-end'} alignItems={'center'}>
                                    <Grid item>
                                        <Button
                                            fullWidth
                                            variant='contained'
                                            color='primary'
                                            className={classes.fill}
                                            onClick={() => {
                                                if(isCanUseSurvey()){
                                                    setOpenSurveyData({
                                                        surveygid: survey.gid,
                                                        surveyrefno: survey.hotelrefno,
                                                        clientid: clientId || loginfo.refid,
                                                    })
                                                }
                                            }}
                                        >
                                            <Typography className={classes.fillButton}>
                                                {t('str_fillSurvey')}
                                            </Typography>
                                        </Button>
                                        <SurveyTreeDialog open={Boolean(openSurveyData)} clientId={clientId} data={openSurveyData} onClose={(status) => setOpenSurveyData(status)}/>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        </Grid>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

export default connect(mapStateToProps, null)(SurveyCard)
