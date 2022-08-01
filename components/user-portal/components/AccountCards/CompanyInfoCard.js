import React, {useState, useEffect, useContext} from 'react';
import {connect, useSelector} from 'react-redux';
import axios from 'axios';
import { ViewList } from '@webcms/orest'
import { makeStyles } from '@material-ui/core/styles'
import { Button, Typography, Grid, Card, CardContent, CardActions, Avatar } from '@material-ui/core'
import useTranslation from '../../../../lib/translations/hooks/useTranslation';
import {
    DEFAULT_OREST_TOKEN,
    OREST_ENDPOINT, REQUEST_METHOD_CONST
} from '../../../../model/orest/constants';
import {setToState} from '../../../../state/actions';
import WebCmsGlobal from '../../../webcms-global';
import {SLASH} from "../../../../model/globals";
import clsx from "clsx";



const useStyles = makeStyles(theme => ({
    subText: {
        fontSize: "14px",
        fontWeight: "600",
    },
    textColor: {
        color: theme.palette.text.main
    },
    cardContent: {
        padding: "48px",
        "&.MuiCardContent-root:last-child": {
            paddingBottom: "48px"
        }
    },
    logoStyle: {
        verticalAlign: "middle",
        alignSelf: "center",
        [theme.breakpoints.down("md")]: {
            textAlign: "center",
        },
    },
    gridStyle: {
        alignSelf: "center",
        [theme.breakpoints.down("md")]: {
            textAlign: "center",
        },
        
    },
    editButton: {
        border: "1px solid #3C4C6E",
        borderRadius: "8px",
        fontSize: "14px",
        textTransform: "none",
        [theme.breakpoints.down("md")]: {
            width: "92px"
        },
    }
}))


function CompanyInfoCard() {
    const classes = useStyles();


    const { t } = useTranslation()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal);
    
    const token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo);
    const hotelRefNo = useSelector(state => state?.hotelinfo?.currentHotelRefNo) || loginfo.hotelrefno || false;
    
    const [logoUrl, setLogoUrl] = useState("");
    const [hotelInfo, setHotelInfo] = useState(null);
    
    function getLogo() {
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token,
            params: {
                query:`code:LOGO,masterid:${loginfo.hotelmid}`,
                hotelrefno: loginfo.hotelrefno
            }
        }).then(res => {
            if(res.status === 200) {
                const logoGid = res.data.data[0].gid
                axios({
                    url: GENERAL_SETTINGS.OREST_URL + SLASH + OREST_ENDPOINT.TOOLS + SLASH + OREST_ENDPOINT.FILE + SLASH + OREST_ENDPOINT.DOWNLOAD,
                    method: REQUEST_METHOD_CONST.GET,
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    params: {
                        gid: logoGid,
                        hotelrefno: loginfo.hotelrefno
                    },
                    responseType: 'blob'
                }).then(r1 => {
                    console.log(r1)
                    if(r1.status === 200) {
                        let url = URL.createObjectURL(r1.data);
                        setLogoUrl(url);
                    }
                }).catch(error => {
                    console.log(error);
                })
            }
        }).catch(error => {
            console.log(error)
        })
    }
    
    useEffect(() => {
        const options = {
            url: `${GENERAL_SETTINGS.OREST_URL}/${OREST_ENDPOINT.INFO}/${OREST_ENDPOINT.HOTEL}`,
            method: REQUEST_METHOD_CONST.GET,
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
        axios(options).then(res => {
            if(res.status === 200) {
                setHotelInfo(res.data.data);
            }
        })
        getLogo();
    },[hotelRefNo])
    
    return(
        <Card>
            <CardContent className={classes.cardContent}>
                <Grid container spacing={2} alignItems={'center'} justify={'space-between'}>
                    <Grid className={classes.gridStyle} item xs={12} sm={12} md={12} lg={2}>
                        <img src={logoUrl ||  "/imgs/empty_image.jpg"} width={"120px"} />
                    </Grid>
                    <Grid className={classes.gridStyle} item xs={12} sm={6} md={6} lg={2}>
                        <Typography className={clsx(classes.subText, classes.textColor)} style={{ opacity: ".7"}}>
                            {t("str_companyName")}
                        </Typography>
                        <Typography className={classes.subText}>
                            {hotelInfo?.hotelname || ''}
                        </Typography>
                    </Grid>
                    <Grid className={classes.gridStyle} item xs={12} sm={6} md={6} lg={2}>
                        <Typography className={clsx(classes.subText, classes.textColor)} style={{ opacity: ".7"}}>
                            {t("str_companyType")}
                        </Typography>
                        <Typography className={classes.subText}>
                            {hotelInfo?.typedesc || ''}
                        </Typography>
                    </Grid>
                    <Grid className={classes.gridStyle} item xs={12} sm={6} md={6} lg={3}>
                        <Typography className={clsx(classes.subText, classes.textColor)} style={{ opacity: ".7"}}>
                            {t("str_email")}
                        </Typography>
                        <Typography className={classes.subText}>
                            {hotelInfo?.email || ''}
                        </Typography>
                    </Grid>
                    <Grid className={classes.gridStyle} item xs={12} sm={6} md={6} lg={2}>
                        <Typography className={clsx(classes.subText, classes.textColor)} style={{ opacity: ".7"}}>
                            {t("str_phoneNumber")}
                        </Typography>
                        <Typography className={classes.subText}>
                            {hotelInfo?.tel || ''}
                        </Typography>
                    </Grid>
                    <Grid className={classes.gridStyle} item xs={12} sm={12} md={12} lg={1}>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.userPortal,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(CompanyInfoCard)