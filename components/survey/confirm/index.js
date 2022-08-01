import React, { useContext, useEffect, useState } from 'react'
import styles from '../style/SurveyPage.style'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import { useRouter } from 'next/router'
import WebCmsGlobal from '../../webcms-global'
import SurveyLayout from '../../layout/containers/SurveyLayout'
import { NextSeo } from 'next-seo'
import Container from '@material-ui/core/Container'
import { REQUEST_METHOD_CONST } from '../../../model/orest/constants'
import axios from 'axios'
import LoadingSpinner from '../../LoadingSpinner'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import CheckCircleOutlinedIcon from '@material-ui/icons/CheckCircleOutlined'
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined'
import useTranslation from 'lib/translations/hooks/useTranslation'
import SurveyBanner from '../banner'
import { useSnackbar } from 'notistack'
const useStyles = makeStyles(styles)

export default function SurveyConfirm() {
    const { t } = useTranslation()
    const classes = useStyles()
    const { GENERAL_SETTINGS, WEBCMS_DATA } = useContext(WebCmsGlobal)
    const { enqueueSnackbar } = useSnackbar()

    //router
    const router = useRouter()
    const surveyHotelRefno = router.query.hotelrefno
    const surveyGid = router.query.surveyGid
    const refgid = router.query.refgid
    const refmid = router.query.refmid

    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
    let clientParams = {}
    clientParams.hotelrefno = surveyHotelRefno || loginfo && loginfo.hotelrefno

    if(GENERAL_SETTINGS.ISCHAIN &&  String(clientParams.hotelrefno) !== String(GENERAL_SETTINGS.HOTELREFNO)){
        clientParams.chainid = surveyHotelRefno || loginfo && loginfo.hotelrefno
        clientParams.ischain = true
    }

    //state
    const [isLoading, setIsLoading] = useState(true)
    const [isSuccess, setIsSuccess] = useState(false)
    const [isError, setIsError] = useState(false)
    const [confirmationNumber, setConfirmationNumber] = useState(null)

    const tryConfirmAgainAction = () =>  {
        return (
            <React.Fragment>
                <Button onClick={() => {
                    setIsLoading(true)
                    setIsError(false)
                    confirmSurvey(true)
                }} color="inherit">
                    {t('str_tryAgain')}
                </Button>
            </React.Fragment>
        )
    }

    const confirmSurvey = async (active) => {
        await axios({
            url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/survey/confirm',
            method: REQUEST_METHOD_CONST.POST,
            timeout: 1000 * 30, // Wait for 30 sec.
            params: clientParams,
            data: {
                survey: surveyGid,
                trans: refgid,
                mid: refmid,
            },
        }).then((surveyConfirmResponse) => {
                if (active) {
                    if (surveyConfirmResponse.status === 200) {
                        const successData = surveyConfirmResponse.data.success
                        const confirmationNumber = surveyConfirmResponse.data.confirmationNumber
                        setConfirmationNumber(confirmationNumber)
                        setIsSuccess(successData)
                    } else {
                        setIsError(true)
                        enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error', autoHideDuration: 10000, action: tryConfirmAgainAction() })
                    }
                }
            }).catch(() => {
                setIsError(true)
                enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error', autoHideDuration: 10000, action: tryConfirmAgainAction() })
            })
    }

    useEffect(() => {
        let active = true

        if (active) {
            setIsLoading(true)
            confirmSurvey(active).then(() => {
                setIsLoading(false)
            })
        }

        return () => {
            active = false
        }
    }, [])

    return (
        <SurveyLayout>
            <NextSeo title={t('str_confirm') + ' - ' + WEBCMS_DATA.assets.meta.title} />
            <SurveyBanner />
            <Container maxWidth={'lg'} className={classes.container}>
                {isLoading ? (
                    <LoadingSpinner style={{ height: '100%' }} />
                ) : isError ? (
                    <Grid
                        container
                        direction={'column'}
                        justify={'center'}
                        alignItems={'center'}
                        style={{ height: '100%' }}
                    >
                        <Grid item>
                            <CancelOutlinedIcon style={{ fontSize: 150, color: '#f44336' }} />
                        </Grid>
                        <Grid item>
                            <h3 style={{ fontSize: 34, fontWeight: 500, color: '#2F3434', textAlign: 'center' }}>
                                {t('str_surveyConfirmationFailed')}
                            </h3>
                        </Grid>
                    </Grid>
                ) : isSuccess ? (
                    <Grid
                        container
                        direction={'column'}
                        justify={'center'}
                        alignItems={'center'}
                        style={{ height: '100%' }}
                    >
                        <Grid item>
                            <CheckCircleOutlinedIcon style={{ fontSize: 150, color: '#4caf50' }} />
                        </Grid>
                        <Grid item>
                            <h3 style={{ fontSize: 34, fontWeight: 500, color: '#2F3434', textAlign: 'center' }}>
                                {t('str_surveyComplete')}
                            </h3>
                        </Grid>
                        {confirmationNumber && (
                            <Grid item>
                                <h3 style={{ fontSize: 20, fontWeight: 500, color: '#2F3434', textAlign: 'center' }}>
                                    {t('str_confirmationNumber')} {confirmationNumber}
                                </h3>
                            </Grid>
                        )}
                    </Grid>
                ) : (
                    <Grid
                        container
                        direction={'column'}
                        justify={'center'}
                        alignItems={'center'}
                        style={{ height: '100%' }}
                    >
                        <Grid item>
                            <CancelOutlinedIcon style={{ fontSize: 150, color: '#FDD835' }} />
                        </Grid>
                        <Grid item>
                            <h3 style={{ fontSize: 34, fontWeight: 500, color: '#2F3434', textAlign: 'center' }}>
                                {t('str_surveyAlreadyConfirmed')}
                            </h3>
                        </Grid>
                    </Grid>
                )}
            </Container>
        </SurveyLayout>
    )
}
