import React, {useEffect, useContext, useState} from "react";
import {makeStyles} from '@material-ui/core/styles'
import {useRouter} from 'next/router';
import {connect, useSelector} from 'react-redux'
import { ViewList, UseOrest } from '@webcms/orest'
import WebCmsGlobal from "../../../../components/webcms-global";
import useTranslation from "../../../../lib/translations/hooks/useTranslation";
import {DEFAULT_OREST_TOKEN} from "../../../../model/orest/constants";
import {
    Button,
    Card,
    CardContent,
    Container,
    Dialog,
    Divider,
    Grid,
    LinearProgress,
    List,
    ListItem,
    Menu,
    MenuItem,
    Paper,
    TextField,
    Typography,
    InputAdornment
} from '@material-ui/core'
import GuestLayout from "../../../../components/layout/containers/GuestLayout";
import LoginComponent from "../../../../components/LoginComponent/LoginComponent";
import moment from 'moment'
import getSymbolFromCurrency from "../../../../model/currency-symbol";
import LoadingSpinner from "../../../../components/LoadingSpinner";


const useStyles = makeStyles((theme) => ({
    cardTitle: {
        fontSize: '20px',
        fontWeight:'600'
    },
    cardSubTitle: {
        fontWeight:'600'
    }

}))

const Copyright = () => {
    return (
        <Typography align="center">
            <a href={'https://hotech.systems/'} target={'_blank'}>
                <img src={'imgs/powered-by.png'} style={{ width: 150 }} alt="powered by hotech" />
            </a>
        </Typography>
    )
}

function ResEventQRInfo(){
    const classes = useStyles();

    const router = useRouter();
    const resEventGid = router.query.gid
    const reservNo = router.query.reservno

    //context
    const { GENERAL_SETTINGS, locale} = useContext(WebCmsGlobal);
    const { t } = useTranslation();


    //redux
    const token = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false);
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
    const isLogin = !!useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth)
    const isClient = loginfo && loginfo.roletype === '6500310'

    //state
    const [qrInfo, setQrInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        if(resEventGid && isLogin) {
            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: 'resevent/guest/qrcode',
                token,
                params: {
                    reservno: reservNo
                }
            }).then(res => {
                if(res.status === 200) {
                    setIsLoading(false)
                    setQrInfo(res.data.data);
                } else {
                    setIsLoading(false);
                }
            })
        } else {
            setIsLoading(false);
        }
    },[isLogin])


    return(
        <GuestLayout isHideLoginButton={true}>
            {
                isLoading && (
                    <LoadingSpinner />
                )
            }
            {
                isLogin ? (
                    isClient ? (
                        <Typography>{t('str_notAuthorizedToAccess')}</Typography>
                    ) : (
                        <Container maxWidth={"md"}>
                            <Grid container>
                                <Grid item xs={12}>
                                    <Card>
                                        <CardContent>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <Typography className={classes.cardTitle}>
                                                        {t('str_information')}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography className={classes.cardSubTitle}>
                                                        {`${t('str_resNo')}: `}
                                                        <a style={{fontWeight: '500'}}>
                                                            {qrInfo?.reservno}
                                                        </a>
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography className={classes.cardSubTitle}>
                                                        {`${t('str_date')}: `}
                                                        <a style={{fontWeight: '500'}}>
                                                            {qrInfo ? moment(qrInfo.startdate).format('L') : ''}
                                                        </a>
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography className={classes.cardSubTitle}>
                                                        {`${t('str_time')}: `}
                                                        <a style={{fontWeight: '500'}}>
                                                            {qrInfo ? moment(qrInfo.starttime, "HH:mm:ss").format('LT') : ''}
                                                        </a>
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography className={classes.cardSubTitle}>
                                                        {`${t('str_totalPrice')}: `}
                                                        <a style={{fontWeight: '500'}}>
                                                            {qrInfo?.totalprice + getSymbolFromCurrency(qrInfo?.pricecurrcode)}
                                                        </a>
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Container>
                    )
                ) : (
                    <Container maxWidth={"sm"}>
                        <Grid container alignItems={'center'} justify='center' style={{height: '50vh'}}>
                            <Grid item xs={12}>
                                <Card elevation={6}>
                                    <CardContent>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12}>
                                                <Typography style={{textAlign:"center", fontSize: 20, fontWeight: 600}}>{t('str_login')}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <LoginComponent noQuery={true} isOnlyEmail={true}/>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Copyright/>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>

                            </Grid>
                        </Grid>
                    </Container>
                )
            }
        </GuestLayout>
    );

}

export default ResEventQRInfo;