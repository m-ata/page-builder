import React, { memo, useContext, useEffect, useState } from 'react'
import {makeStyles} from "@material-ui/core/styles";
import {Box, Button, Card, CardContent, CardMedia, Grid, Paper, Tooltip} from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import WebCmsGlobal from "../../webcms-global";
import {useRouter} from "next/router";
import moment from "moment";
import {OREST_ENDPOINT} from "../../../model/orest/constants";

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
        marginTop: 24,
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
    }
}));

const WebsiteCardSlider = (props) => {
    const { cardSlider, otherLangCardSlider, selectedLang, defaultLang } = props;
    const [localState, setLocalState] = useState({
        sliderImages: [],
        screenWidth: 0,
        viewMore: false,
        showSlider: false,
        langCardSliderData: [],
    });
    const router = useRouter();
    const classes = useStyles(cardSlider);
    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal);

    const [sliderImages, setSliderImages] = useState([]);
    const [showSlider, setShowSlider] = useState([]);

    const { viewMore, langCardSliderData } = localState;

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

    useEffect(() => {
        if (cardSlider?.gid?.images?.length > 0) {
            for (const image of cardSlider?.gid?.images) {
                const ctaLinkValue = image?.cta?.replace(`<a target="_blank" href="`,
                    '').replace('>',
                    '').replace('</a>', '').replace('"', '').trim()?.split(' ')[0];
                const linkMatch = ctaLinkValue?.match(/\bhttps?:\/\/\S+/gi);
                if (linkMatch) {
                    image['ctaLinkType'] = 'external';
                    const cta_title = image?.cta?.replace(`<a target="_blank" href="`,
                        '').replace(linkMatch[0] + '"', '').replace('>',
                        '').replace('</a>', '').trim();
                    image['ctaTitleValue'] = cta_title;
                } else {
                    image['ctaLinkType'] = 'internal';
                    const cta_title = image?.cta?.replace(`<a target="_blank" href="`,
                        '').replace(ctaLinkValue + '"', '').replace('>',
                        '').replace('</a>', '').trim();
                    image['ctaTitleValue'] = cta_title;
                }
                image['ctaLinkValue'] = ctaLinkValue;
            }
            setSliderImages(cardSlider.gid.images)
        }

        if (cardSlider?.gid?.expiryDate) {
            const currentDate = moment().format(OREST_ENDPOINT.DATEFORMAT_LOCALE);
            setShowSlider(moment(cardSlider?.gid?.expiryDate).isAfter(currentDate));
        } else {
            setShowSlider(true);
        }
    }, [cardSlider]);

    const handleGetScreenWidth = () => {
        setLocalState(prev => ({...prev, screenWidth: window.innerWidth}))
    }

    useEffect(() => {
        setLocalState(prev => ({...prev, screenWidth: window.innerWidth}))
        window.addEventListener("resize", handleGetScreenWidth);

        return () => window.removeEventListener("resize", handleGetScreenWidth)
    }, [])

    return (
        <React.Fragment>
            {
                showSlider && <React.Fragment>
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
                                                            <CardMedia
                                                                className={classes.media}
                                                                image={GENERAL_SETTINGS.STATIC_URL + image.fileurl}
                                                                title={image.title || ''}
                                                            />
                                                            <CardContent style={{height: 105}}>
                                                                <Tooltip title={<div dangerouslySetInnerHTML={{ __html: selectedLang === defaultLang ? image.title : langCardSliderData?.length > 0 && langCardSliderData[index]?.title }}/>}>
                                                                    <div className={classes.itemName}
    dangerouslySetInnerHTML={{ __html: selectedLang === defaultLang ? image.title : langCardSliderData?.length > 0 && langCardSliderData[index]?.title }}/>
                                                                </Tooltip>
                                                                <Tooltip title={<div dangerouslySetInnerHTML={{ __html: selectedLang === defaultLang ? image.description : langCardSliderData?.length > 0 && langCardSliderData[index]?.description }}/>}>
                                                                    <div className={classes.itemDescription}
    dangerouslySetInnerHTML={{ __html: selectedLang === defaultLang ? image.description : langCardSliderData?.length > 0 && langCardSliderData[index]?.description }}/>
                                                                </Tooltip>
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
    dangerouslySetInnerHTML={{ __html: selectedLang === defaultLang ? image.cta : langCardSliderData?.length > 0 && langCardSliderData[index]?.cta }}/>
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
                                                                            router.push({
                                                                                pathname: `${image?.ctaLinkValue}`
                                                                            });
                                                                        }}
                                                                    >
                                                                        {selectedLang === defaultLang ? image.ctaTitleValue : langCardSliderData?.length > 0 && langCardSliderData[index]?.ctaTitleValue}
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
            }
        </React.Fragment>
    )
}

const memorizedWebsiteCardSlider = memo(WebsiteCardSlider)

export default memorizedWebsiteCardSlider