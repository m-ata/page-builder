import React, {useContext, useEffect, useState} from 'react';
import WebCmsGlobal from "../../../../../../webcms-global";
import {useSelector} from "react-redux";
import {useRouter} from "next/router";
import {ViewList} from "@webcms/orest";
import {isErrorMsg, OREST_ENDPOINT} from "../../../../../../../model/orest/constants";
import {toast} from "react-toastify";
import LoadingSpinner from "../../../../../../LoadingSpinner";
import {COLORS} from "../../../../constants";
import {Box, Button, Grid, Paper, Typography, CardContent, CardMedia, Card, Tooltip} from "@material-ui/core";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { makeStyles } from "@material-ui/core/styles";
import {getSliderImages} from "../../../../helpers/slider";

const useStyles = makeStyles((theme) => ({
    root: props => ({
        marginLeft: 10,
        marginRight: 10,
        background: '#FFFFFF 0% 0% no-repeat padding-box',
        border: `2px solid ${props.borderColor}`,
        borderRadius: 10,
        opacity: 1,
        width: '100%',
        [theme.breakpoints.down('xs')]: {
            maxWidth: 345,
            margin: "auto"
        },
        display: 'inline-block',
        marginTop: 4,
        height: 375,
        [theme.breakpoints.down('sm')]: {
            height: 315,
        },
    }),
    media: {
        height: 200,
        [theme.breakpoints.down('sm')]: {
            height: 150,
        },
    },
    mainPaper: {
        padding: "20px",
        marginBottom: 50,
        [theme.breakpoints.down('sm')]: {
            padding: "8px",
        },

    },
    cardTitle: {
        paddingLeft: "34px",
        fontWeight: 'bold',
        paddingTop: 5,
        [theme.breakpoints.down('xs')]: {
            paddingLeft: "24px"
        },
    },
    seeMore: {
        textAlign: 'right',
        float: "right",
        paddingRight: "34px",
        [theme.breakpoints.down("sm")]: {
            paddingRight: "20px",
        },
        [theme.breakpoints.down("sm")]: {
            paddingRight: "20px",
        },
    },
    seeMoreButton: {
        fontSize: "18px",
        fontWeight: "bold",
        textTransform: "none",
        [theme.breakpoints.down("sm")]: {
            fontSize: "16px"
        },
    },
    ctaButton: {
        borderRadius: 2,
        backgroundColor: props => props?.buttonColor ? props.buttonColor : "#000000",
        cursor: 'pointer',
        display: 'inline-block',
        fontSize: 14,
        letterSpacing: 1,
        textAlign: "center",
        '& a': {
            color: 'white'
        },
        width: '100%'
    },
    itemName: {
        paddingBottom: "8px",
        textTransform: "capitalize",
        color: props => props?.textColor ? props.textColor : "#000000",
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        maxHeight: 60,
        WebkitLineClamp: 2,
        '-webkit-line-clamp': 2,
        '-webkit-box-orient': "vertical",
    },
    itemDescription: {
        paddingBottom: "8px",
        color: props => props?.textColor ? props.textColor : "#000000",
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        maxHeight: 60,
        WebkitLineClamp: 2,
        '-webkit-line-clamp': 2,
        '-webkit-box-orient': "vertical",
        display: "-webkit-box"
    },
    cardItem: {
        width: '25%',
        marginLeft: -6,
        [theme.breakpoints.down('sm')]: {
            width: '100%',
        },
    },
}))

const CardSlider = (props) => {

    const { cardSlider, handleSelectedLink, otherLangCardSlider } = props;
    const [localState, setLocalState] = useState({
        isRequestSend: false,
        sliderImages: [],
        langCardSliderData: [],
        viewMore: false
    });
    const state = useSelector(state => state?.formReducer?.pageBuilder);
    const {GENERAL_SETTINGS, token} = useContext(WebCmsGlobal);
    const router = useRouter();
    const clientToken = useSelector((state) => state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : router.query.authToken)
    const companyId = router.query.companyID || GENERAL_SETTINGS.HOTELREFNO;
    const authToken = token || clientToken || router.query.authToken;

    const classes = useStyles(cardSlider);

    const { isRequestSend, sliderImages, viewMore, langCardSliderData } = localState;

    useEffect(() => {
        if (cardSlider?.gid) {
            setLocalState(prev => ({...prev, isRequestSend: true}));
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMSLD,
                token: authToken,
                params: {
                    query: `gid:${cardSlider.gid}`,
                    chkselfish: false,
                    hotelrefno:  Number(companyId)
                }
            }).then(async res => {
                if (res?.status === 200) {
                    if (res?.data?.data?.length > 0) {
                        const sldImages = await getSliderImages(GENERAL_SETTINGS.OREST_URL, authToken, companyId, res.data.data[0]?.id);
                        sldImages.sort((a, b) => (a.orderno > b.orderno) ? 1 : -1)
                        if (sldImages) {
                            let updatedImages = [];
                            sldImages.map(data => {
                                const ctaLinkValue = data?.cta?.replace(`<a target="_blank" href="`,
                                    '').replace('>',
                                    '').replace('</a>', '').replace('"', '').trim()?.split(' ')[0];
                                const linkMatch = ctaLinkValue?.match(/\bhttps?:\/\/\S+/gi);
                                if (linkMatch) {
                                    data['ctaLinkType'] = 'external';
                                    const cta_title = data?.cta?.replace(`<a target="_blank" href="`,
                                        '').replace(linkMatch[0] + '"', '').replace('>',
                                        '').replace('</a>', '').trim();
                                    data['ctaTitleValue'] = cta_title;
                                } else {
                                    data['ctaLinkType'] = 'internal';
                                    const cta_title = data?.cta?.replace(`<a target="_blank" href="`,
                                        '').replace(ctaLinkValue + '"', '').replace('>',
                                        '').replace('</a>', '').trim();
                                    data['ctaTitleValue'] = cta_title;
                                }
                                data['ctaLinkValue'] = ctaLinkValue;
                                updatedImages.push(data);
                            });
                            setLocalState(prev => ({...prev, sliderImages: updatedImages, isRequestSend: false}));
                        } else {
                            setLocalState(prev => ({...prev, isRequestSend: false}));
                            toast.warn('Images not found', {
                                position: toast.POSITION.TOP_RIGHT
                            });
                        }
                    }
                } else {
                    setLocalState(prev => ({...prev, isRequestSend: false}));
                    const retErr = isErrorMsg(res);
                    toast.error(retErr.errorMsg, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
            })
        }
    }, [cardSlider]);

    useEffect(() => {
        const updatedLangCardSlider = [];
        if (otherLangCardSlider?.length) {
            for (const data of otherLangCardSlider) {
                const ctaLinkValue = data?.cta?.replace(`<a target="_blank" href="`,
                    '').replace('>',
                    '').replace('</a>', '').replace('"', '').trim()?.split(' ')[0];
                const linkMatch = ctaLinkValue?.match(/\bhttps?:\/\/\S+/gi);
                if (linkMatch) {
                    data['ctaLinkType'] = 'external';
                    const cta_title = data?.cta?.replace(`<a target="_blank" href="`,
                        '').replace(linkMatch[0] + '"', '').replace('>',
                        '').replace('</a>', '').trim();
                    data['ctaTitleValue'] = cta_title;
                } else {
                    data['ctaLinkType'] = 'internal';
                    const cta_title = data?.cta?.replace(`<a target="_blank" href="`,
                        '').replace(ctaLinkValue + '"', '').replace('>',
                        '').replace('</a>', '').trim();
                    data['ctaTitleValue'] = cta_title;
                }
                data['ctaLinkValue'] = ctaLinkValue;
                updatedLangCardSlider.push(data);
            }
        }
        setLocalState(prev => ({...prev, langCardSliderData: updatedLangCardSlider}));
    }, [otherLangCardSlider]);

    if (isRequestSend) {
        return <LoadingSpinner size={40} style={{color: COLORS?.secondary}} />
    }

    return (
        <React.Fragment>
            <Paper elevation={3} className={classes.mainPaper}>
                <Grid container direction="row" justify="space-between" alignItems="center">
                    <Grid item xs={6}>
                    </Grid>
                    <Grid item xs={6} className={classes.seeMore}>
                        {
                            sliderImages.length > 4 && <Button
                                className={classes.seeMoreButton}
                                endIcon={viewMore ? <ArrowBackIosIcon color={"inherit"} style={{fontSize:"18px"}}/> : <ArrowForwardIosIcon color={"inherit"} style={{fontSize:"18px"}}/>}
                                color="primary"
                                onClick={() => setLocalState(prev => ({...prev, viewMore: !viewMore}))}
                            >
                                { !viewMore ? 'View More' : 'View Less'  }
                            </Button>
                        }
                    </Grid>
                </Grid>
                <Box p={3}>
                    <Grid container spacing={3}>
                        {
                            sliderImages?.length > 0 && sliderImages.map((image, index) => {
                                return (
                                    (index > 3 && !viewMore) ? '' :
                                        <Grid item key={index} className={classes.cardItem}>
                                            <Card className={classes.root} variant="outlined">
                                                <CardContent style={{padding: "0", display: "relative"}}>
                                                    <CardMedia className={classes.media}
                                                               image={GENERAL_SETTINGS.STATIC_URL + image.fileurl}
                                                               title={image.title || ''}/>
                                                    <CardContent>
                                                        <Typography style={{height: 105}}>
                                                            <Tooltip
                                                                title={state?.langCode === state?.defaultLang ? image.title : langCardSliderData?.length > 0 && langCardSliderData[index]?.title}>
                                                                <div className={classes.itemName}
                                                                     dangerouslySetInnerHTML={{__html: state.langCode === state?.defaultLang ? image.title : langCardSliderData?.length > 0 && langCardSliderData[index]?.title}}></div>
                                                            </Tooltip>
                                                            <Tooltip
                                                                title={state?.langCode === state?.defaultLang ? image.description : langCardSliderData?.length > 0 && langCardSliderData[index]?.description}>
                                                                <div className={classes.itemDescription}
                                                                     dangerouslySetInnerHTML={{__html: state.langCode === state?.defaultLang ? image.description : langCardSliderData?.length > 0 && langCardSliderData[index]?.description}}></div>
                                                            </Tooltip>
                                                        </Typography>
                                                        {
                                                            image?.cta && image?.ctaLinkType === 'external' &&
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                color="primary"
                                                                aria-label="add"
                                                                className={classes.ctaButton}
                                                            >
                                                                <div
                                                                    dangerouslySetInnerHTML={{__html: state?.langCode === state?.defaultLang ? image.cta : langCardSliderData?.length > 0 && langCardSliderData[index]?.cta}}></div>
                                                            </Button>
                                                        }
                                                        {
                                                            image?.cta && image?.ctaLinkType === 'internal' &&
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                color="primary"
                                                                aria-label="add"
                                                                className={classes.ctaButton}
                                                                onClick={() => {
                                                                    handleSelectedLink && handleSelectedLink(image?.ctaLinkValue);
                                                                }}
                                                            >
                                                                {state?.langCode === state?.defaultLang ? image.ctaTitleValue : langCardSliderData?.length > 0 && langCardSliderData[index]?.ctaTitleValue}
                                                            </Button>
                                                        }
                                                    </CardContent>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                )
                            })
                        }
                    </Grid>
                </Box>
            </Paper>
        </React.Fragment>
    )
}

export default CardSlider;