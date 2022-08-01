import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios';
import { connect, useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { ViewList, List } from '@webcms/orest'
import {setToState} from '../../../../state/actions';
import {Typography, Card, CardHeader, CardContent, Collapse, Avatar, Button, Grid} from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import { red } from '@material-ui/core/colors';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import WebCmsGlobal from '../../../webcms-global';
import useTranslation from '../../../../lib/translations/hooks/useTranslation';
import {
    DEFAULT_OREST_TOKEN,
    jsonGroupBy,
    OREST_ENDPOINT,
    OREST_FULL
} from '../../../../model/orest/constants';
import {SLASH} from '../../../../model/globals';
import LoadingSpinner from '../../../LoadingSpinner';

const useStyles = makeStyles( theme => ({
    mainTitle: {
        paddingBottom:"20px",
        fontSize:"48px",
        fontWeight:"600"
    },
    detailTitle: {
        paddingBottom: "8px",
        [theme.breakpoints.down('sm')]: {
            paddingBottom: "2px",
            marginTop: "10px",
        },
        fontSize: "12px",
        fontWeight: "bold",
        color: "#43425D"
    },
    productTitle: {
        fontSize: "20px",
        fontWeight: "600",
        color: "#43425D"
    },
    detailText: {
        fontSize: "12px",
        fontWeight: "500",
        color: "#43425D"
    },
    root: {
        width:"100%"
        //maxWidth: 345,
    },
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
    },
    cardHeader: {
        padding: "16px 24px 16px 48px",
        "& .MuiCardHeader-action": {
            alignSelf:"center",
            marginTop:"0"
        },
        "&:title": {
            fontSize:"20px",
            fontWeight: "600",
            color: "#43425D"
        }
    },
    cardContent: {
        padding:"0 16px",
        "&:last-child": {
            paddingBottom: "0"
        }
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
    avatar: {
        width:"50px",
        height:"50px",
        marginRight:"8px",
        backgroundColor: red[500],
    },
    divider: {
        margin: "0 48px",
        borderBottom:"2px solid #F0F0F7"
    }
    
    
}));

function MyLicenceList() {
    const classes = useStyles();
    
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal);
    const { t } = useTranslation();
    
    const token = useSelector((state) =>
        state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN
    )
    const hotelRefNo = useSelector(state =>
        state.hotelinfo.currentHotelRefNo !== null ? state.hotelinfo.currentHotelRefNo : null);
    
    const [expandList, setExpandList] = useState([{
        expandStatus: false
    }]);
    const [productList, setProductList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const calculateExpirationDate = (purchaseDate) => {
        const dateObj = new Date(purchaseDate);
        const expiredDate = `${dateObj.getFullYear() + 1}-${dateObj.getMonth() + 1 < 10 ? `0${dateObj.getMonth() + 1}` : dateObj.getMonth() + 1}-${dateObj.getDate() < 10 ? `0${dateObj.getDate()}`: dateObj.getDate()}`
        return expiredDate;
    }
    
    const handleExpandClick = (i) => {
        let list = [...expandList];
        list[i].expandStatus = !list[i].expandStatus;
        setExpandList(list);
    };
    
    useEffect(() => {
        setIsLoading(true);
        List({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: `${OREST_ENDPOINT.HOTEL}${SLASH}${OREST_ENDPOINT.PRODUCT}`,
            token,
            params: {
                islic: true,
                hotelid: hotelRefNo,
            }
        }).then(res => {
            if(res.status === 200) {
                setProductList(res.data.data);
                let list = [...expandList];
                if(list.length !== res.data.data.length) {
                    for(let i = 0; i < res.data.data.length - 1; i++) {
                        list.push({expandStatus: false});
                    }
                }
                setExpandList(list);
                setIsLoading(false);
            } else {
                setIsLoading(false);
            }
        }).catch(error => {
            console.log(error);
            setIsLoading(false);
        })
    },[hotelRefNo])
    
    return(
        <>
            <Typography className={classes.mainTitle}>{t("str_myLicences")}</Typography>
            {
                !isLoading ?
                productList && productList.length > 0 ?
                productList.map((item,i) => {
                    return(
                        <div key={`root-div-${i}`}>
                            <Card key={`card-${i}`} className={classes.root} >
                                <CardHeader
                                    key={`card-header-${i}`}
                                    className={classes.cardHeader}
                                    avatar={
                                        item.description.toLowerCase().includes('otello') ?
                                        <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#F8C9BE"/>
                                            <path d="M15.9999 25.9048C13.3333 25.9048 10.8952 24.8381 8.9904 23.0095C8.07612 22.0952 8.07612 20.6476 8.9904 19.8095C9.90469 18.8952 11.3523 18.8952 12.1904 19.8095C13.1809 20.8 14.5523 21.4095 15.9999 21.4095C17.4475 21.4095 18.7428 20.8762 19.7333 19.8857C20.7237 18.8952 21.3333 17.5238 21.3333 16.0762C21.3333 14.7809 22.3237 13.7905 23.619 13.7905C24.9142 13.7905 25.9047 14.7809 25.9047 16.0762C25.9047 18.7428 24.838 21.1809 23.0094 23.0857C21.1047 24.8381 18.6666 25.9048 15.9999 25.9048Z" fill="#AE3222"/>
                                            <path d="M23.619 18.2857C22.3238 18.2857 21.3333 17.2952 21.3333 16C21.3333 14.5524 20.8 13.2571 19.7333 12.1905C18.7428 11.2 17.3714 10.6667 16 10.6667C14.6285 10.6667 13.2571 11.2 12.1905 12.2667C11.2 13.2572 10.6666 14.6286 10.6666 16C10.6666 17.2952 9.67617 18.2857 8.38093 18.2857C7.08569 18.2857 6.09521 17.2952 6.09521 16C6.09521 13.3333 7.16188 10.8952 8.99045 8.99048C10.8952 7.16191 13.3333 6.09525 16 6.09525C18.6666 6.09525 21.1047 7.16191 23.0095 8.99048C24.9143 10.8952 25.9047 13.3333 25.9047 16C25.9047 17.2952 24.9143 18.2857 23.619 18.2857Z" fill="#E34B34"/>
                                            <path d="M10.5905 23.6952C9.98093 23.6952 9.4476 23.4667 8.99045 23.0095C7.16188 21.1048 6.09521 18.6667 6.09521 16C6.09521 14.7048 7.08569 13.7143 8.38093 13.7143C9.67617 13.7143 10.6666 14.7048 10.6666 16C10.6666 17.4476 11.2 18.7429 12.2666 19.8095C13.1809 20.7238 13.1809 22.1714 12.2666 23.0095C11.8095 23.4667 11.2 23.6952 10.5905 23.6952Z" fill="#F1856E"/>
                                        </svg>
                                            : item.description.toLowerCase().includes('amonra') ?
                                            <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#B2DFDD"/>
                                                <path d="M8.38093 24.3809C7.99998 24.3809 7.61903 24.3047 7.23807 24.0762C6.17141 23.4666 5.71426 22.0952 6.32379 20.9524L13.9428 7.23807C14.5524 6.17141 15.9238 5.71426 17.0666 6.32379C18.1333 6.93331 18.5905 8.30474 17.9809 9.4476L10.3619 23.1619C9.98093 23.9238 9.21903 24.3809 8.38093 24.3809Z" fill="#064E42"/>
                                                <path d="M23.6188 24.3809C22.7807 24.3809 22.0188 23.9238 21.6379 23.2381L14.0188 9.5238C13.4093 8.45714 13.7903 7.00952 14.9331 6.39999C15.9998 5.79047 17.4474 6.17142 18.0569 7.31428L25.676 21.0286C26.2855 22.0952 25.9045 23.5429 24.7617 24.1524C24.3807 24.3048 23.9998 24.3809 23.6188 24.3809Z" fill="#138A7F"/>
                                                <path d="M23.6189 24.3809H16.7618C15.4666 24.3809 14.4761 23.3905 14.4761 22.0952C14.4761 20.8 15.4666 19.8095 16.7618 19.8095H23.6189C24.9142 19.8095 25.9046 20.8 25.9046 22.0952C25.9046 23.3905 24.9142 24.3809 23.6189 24.3809Z" fill="#49B7B0"/>
                                            </svg>
                                            :
                                            <Avatar key={`avatar-${i}`} aria-label="recipe" className={classes.avatar}>
                                                R
                                            </Avatar>
                                    }
                                    action={
                                        <>
                                        {/*<Button style={{border:"1px solid black"}}>View Invoice</Button>*/}
                                            <IconButton
                                                key={`icon-button-${i}`}
                                                className={clsx(classes.expand, {
                                                    [classes.expandOpen]: productList.length === expandList.length ? expandList[i].expandStatus : false,
                                                })}
                                                onClick={() => handleExpandClick(i)}
                                                aria-expanded={productList.length === expandList.length ? expandList[i].expandStatus : false}
                                                aria-label="show more"
                                            >
                                                <ExpandMoreIcon />
                                            </IconButton>
                                        </>
                
                                    }
                                    title={<Typography className={classes.productTitle}>{item.code}</Typography>}
                                    subheader=""
                                />
                                <div className={clsx("classes.expand", {
                                    [classes.divider]: productList.length === expandList.length ? expandList[i].expandStatus : false,
                                })}/>
                                <CardContent className={classes.cardContent}>
                                    <Collapse in={productList.length === expandList.length ? expandList[i].expandStatus : false} timeout="auto" unmountOnExit>
                                        <CardContent>
                                            <div style={{paddingLeft:"24px"}}>
                                                <Grid container>
                                                    <Grid item xs={6} md={1}>
                                                        <Typography className={classes.detailTitle}>{t('str_code')}</Typography>
                                                        <Typography className={classes.detailText}>{item.id}</Typography>
                                                    </Grid>
                                                    <Grid item xs={6} md={2}>
                                                        <Typography className={classes.detailTitle}>{t('str_description')}</Typography>
                                                        <Typography className={classes.detailText}>{item.description}</Typography>
                                                    </Grid>
                                                    <Grid item xs={6} md={2}>
                                                        <Typography className={classes.detailTitle}>{t('str_purchaseDate')}</Typography>
                                                        <Typography className={classes.detailText}>{item.transdate}</Typography>
                                                    </Grid>
                                                    <Grid item xs={6} md={2}>
                                                        <Typography className={classes.detailTitle}>{t('str_expiryDate')}</Typography>
                                                        <Typography className={classes.detailText}>{calculateExpirationDate(item.transdate)}</Typography>
                                                    </Grid>
                                                </Grid>
                                            </div>
                                        </CardContent>
                                    </Collapse>
                                </CardContent>
                            </Card>
                            <div style={{paddingTop: '20px'}}/>
                        </div>
                    );
                    
                }): (<Typography>Licences not found</Typography>)
                    :<LoadingSpinner />
            }
           
        </>
    );
}


const mapStateToProps = (state) => {
    return {
        state: state.formReducer.userPortal,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value))
})

export default connect(mapStateToProps, mapDispatchToProps)(MyLicenceList)