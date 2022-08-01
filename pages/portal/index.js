import React, { useState, useEffect, useContext, useRef } from 'react'
import axios from 'axios';
import Carousel from 'react-bootstrap/Carousel';
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router';
import { connect } from 'react-redux'
import { fade, makeStyles } from '@material-ui/core/styles'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import {
    Typography,
    Container,
    Paper,
    Box,
    Card,
    CardContent,
    Button,
    Grid,
    FormControl,
    TextField,
} from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete';
import Skeleton from '@material-ui/lab/Skeleton';
import Slider from 'react-slick'
import {
    convertUrlStandard,
    getHyperlinkParser,
    jsonGroupBy,
    OREST_ENDPOINT,
    REQUEST_METHOD_CONST
} from '../../model/orest/constants'
import useTranslation from 'lib/translations/hooks/useTranslation';
import WebCmsGlobal from "../../components/webcms-global";
import LoadingSpinner from "../../components/LoadingSpinner";
import {deleteFromState, pushToState, setToState, updateState} from "../../state/actions";
import DestinationPortalWrapper from "../../components/destination-portal/components/DestinationPortalWrapper";
import {DetailCardPlaceHolder} from "../../assets/svg/destination-portal/DetailCardPlaceHolder";
import CategoryItemFullCard from "../../components/destination-portal/components/CategoryItemFullCard";
import CategoryItemCard from "../../components/destination-portal/components/CategoryItemCard";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    mainPaper: {
        padding: "20px",
        marginBottom: 50,
        [theme.breakpoints.down('sm')]: {
            padding: "8px",
        },

    },
    mainSelectPaper: {
        background: '#ffffff00',
    },
    mainContainter: {
        paddingLeft: "64px",
        paddingRight: "64px",
        [theme.breakpoints.down('sm')]: {
            paddingLeft: "24px",
            paddingRight: "24px",
        },
    },
    hotelListTitle: {
        paddingLeft: "34px",
        fontWeight: 'bold',
        paddingTop: 5,
        [theme.breakpoints.down('xs')]: {
            paddingLeft: "24px"
        },
    },
    hotelListTitleWithoutPadding: {
        fontWeight: 'bold',
        paddingTop: 5,
        paddingBottom: "16px"
    },
    seeMore: {
        textAlign: 'right',
        float: "right",
        paddingRight: "34px",
        [theme.breakpoints.down("sm")]: {
            paddingRight: "31px",
        },
        [theme.breakpoints.down("sm")]: {
            paddingRight: "24px",
        },
    },
    seeMoreWithoutPadding: {
        textAlign: 'right',
        paddingBottom: "16px"
    },
    seeMoreButton: {
        fontSize: "18px",
        fontWeight: "bold",
        textTransform: "none",
        [theme.breakpoints.down("sm")]: {
            fontSize: "16px"
        },
    },
    searchBackground: {
        width: "100%",
        position: "relative",
        height: "650px",
        backgroundSize:"cover",
        backgroundPosition:"center",
        backgroundRepeat:"no-repeat",
        [theme.breakpoints.down("sm")]: {
            height: "386px",
        },
    },
    searchCard: {
        position: "absolute",
        width: "100%",
        top: "96px",
        [theme.breakpoints.down("sm")]: {
            top: "32px",
        },
        "& .MuiCardContent-root:last-child": {
            paddingBottom: "16px"
        },
        zIndex: "2"
    },
    textFieldStyle: {
        borderRadius: "5px",
        textTransform: "capitalize",
        "& .MuiInputLabel-root": {
            fontSize: "14px",
            fontWeight: "600",
        },
        "& input": {
            fontSize: "14px",
        },
        "& .MuiFormHelperText-root": {
            display: "none"
        }
    },
    mainTitle: {
        paddingBottom: "24px",
        fontSize: "50px",
        fontWeight: "bold",
        maxWidth: "510px",
        letterSpacing: "0",
        color:"#FFFFFF",
        [theme.breakpoints.down("sm")]: {
            fontSize: "24px",
        },

    },
    subTitle: {
        fontSize: "30px",
        fontWeight: "bold",
        letterSpacing: "0",
        color:"#FFFFFF",
        [theme.breakpoints.down("sm")]: {
            fontSize: "16px",
        },
    },
    firstGridItemInCard: {
        display: "flex",
        [theme.breakpoints.down("xs")]: {
            display: "grid",
        },
    },
    dialogContent: {
        padding: "24px",
        color: "#122D31",
        [theme.breakpoints.down("sm")]: {
            padding: "16px",
        },

    },
    cardRoot: {
        marginLeft: 10,
        marginRight: 10,
        background: '#FFFFFF 0% 0% no-repeat padding-box',
        borderRadius: 10,
        opacity: 1,
    },
}))


function DestinationPortal(props) {
    const classes = useStyles()

    const { setToState, state } = props

    const { GENERAL_SETTINGS, WEBCMS_DATA, locale} = useContext(WebCmsGlobal)
    const { t } = useTranslation();
    const router = useRouter();

    const [isLoaded, setIsLoaded] = useState(false);
    const [detailCardsIsLoaded, setDetailCardsIsLoaded] = useState(false);
    const [screenWidth, setScreenWidth] = useState(0);
    const [isHomeSliderLoaded, setIsHomeSliderLoaded] = useState(false);
    const [topNFactor, setTopNFactor] = useState(1);
    const topN = 6;
    const ref = useRef(null);

    const getListData = (catid, topn) => {
        let options = {
            url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/app/portal/list',
            method: REQUEST_METHOD_CONST.POST,
            params: {}
        }
        if(catid) {
            options.params.catid = catid;
        }
        if(topn) {
            options.params.topn = topn;
        }
        axios(options).then(res => {
            if(res.status === 200) {
                if(res.data.success) {
                    let array = [];
                    if(res.data.data.length > 0) {
                        res.data.data.map((item) => {
                            if(item.title !== null) {
                                if(item.catid !== null) {
                                    array.push(item);
                                }
                            }
                        })
                    }
                    if(!catid && !topn) {
                        let data;
                        data = jsonGroupBy(array, "catdesc");
                        setToState("destinationPortal", ["notGroupedPortalList"], array);
                        setToState("destinationPortal", ["portalList"], data);
                        setIsLoaded(true);
                    } else {
                        if(router.query.catid) {
                            setToState("destinationPortal", ["selectedCategory"], array[0].catdesc);
                            setToState("destinationPortal", ["catId"], array[0].catid);
                        }
                        setToState("destinationPortal", ["selectedCategoryList"], array);
                        setDetailCardsIsLoaded(true)
                    }

                } else {
                    if(!catid && !topn) {
                        setIsLoaded(true);
                    } else {
                        setDetailCardsIsLoaded(true)
                    }

                }
            } else {
                if(!catid && !topn) {
                    setIsLoaded(true);
                } else {
                    setDetailCardsIsLoaded(true)
                }
            }
        })
    }

    const getSliderSetting = (length, slidesToShow) => {
        return {
            dots: true,
            lazyLoad: true,
            speed: 500,
            slidesToShow: slidesToShow,
            infinite: length > slidesToShow ,
            slidesToScroll: 1,
            centerMode: false,
            swipeToSlide: true,
            touchMove: true,
            responsive: [
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 1,
                        centerMode: false,
                    },
                },
                {
                    breakpoint: 900,
                    settings: {
                        infinite: length > 2,
                        slidesToShow: 2,
                        centerMode: false,
                    },
                },
                {
                    breakpoint: 1200,
                    settings: {
                        infinite: length > 3,
                        slidesToShow: 3,
                        centerMode: false,
                    },
                },

            ],
        }
    }

    const placeHolderSlideSetting = (length, slideToShow) => {
        return {
            dots: true,
            lazyLoad: true,
            speed: 500,
            slidesToShow: slideToShow,
            infinite: length > 2 ,
            slidesToScroll: 1,
            centerMode: false,
            swipeToSlide: true,
            touchMove: true,
            responsive: [
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 1,
                        centerMode: false,
                    },
                },
                {
                    breakpoint: 960,
                    settings: {
                        slidesToShow: 2,
                        centerMode: false,
                    },
                },
                {
                    breakpoint: 1280,
                    settings: {
                        slidesToShow: 3,
                        centerMode: false,
                    },
                },

            ],

        }
    }

    const findDestination = (event, newValue) => {
        const data = newValue;
        if(data !== null) {
            setToState("destinationPortal", ["selectedHotel"], data)
            router.push({
                pathname: `guest/detail/${convertUrlStandard(data.title)}`,
                query: {lang: locale, gid: data.gid}
            });
        } else {
            setToState("destinationPortal", ["selectedHotel"], null)
        }

    }

    const handleSelectedCategoryList = (categoryName) => {
        const catId = state.portalList[categoryName][0].catid;
        setToState("destinationPortal", ["selectedCategory"], categoryName)
        setToState("destinationPortal", ["catId"], catId);
        if(catId) {
            const routerQuery = {
                lang: router.query.lang || locale,
                catid: catId
            };
            router.push({
                query: routerQuery},
                undefined,
                {scroll: false});
            setDetailCardsIsLoaded(false);
            getListData(catId, (topN * topNFactor))
            if(ref) {
                ref.current.scrollIntoView();
                window.scrollTo({
                    top: ref.current.offsetTop,
                    behavior: 'smooth'
                })
            }

        }

    }

    const handleGetScreenWidth = () => {
        setScreenWidth(window.innerWidth);
    }

    const handleGetScroll = () => {
        setToState("destinationPortal", ["scrollIndex"], window.scrollY);
    }

    useEffect(() => {
        window.addEventListener("scroll", handleGetScroll);

        return () => window.removeEventListener("scroll", handleGetScroll)
    }, [])

    useEffect(() => {
        setScreenWidth(window.innerWidth);
        window.addEventListener("resize", handleGetScreenWidth);

        return () => window.removeEventListener("resize", handleGetScreenWidth)
    }, [])

    useEffect(() => {
        if(topNFactor > 1) {
            getListData(state.catId, (topN * topNFactor))
        }
    }, [topNFactor])


    useEffect(() => {
        let routerQuery = router.query;
        routerQuery.lang = router.query.lang || locale
        router.push({query: routerQuery})
        setToState("destinationPortal", ["selectedHotel"], null);
        if(router.query.catid) {
            getListData(router.query.catid, (topN * topNFactor))
            if(ref) {
                if(isHomeSliderLoaded) {
                    window.scrollTo({
                        top: ref.current.offsetTop,
                        behavior: 'smooth'
                    })
                }
            }
        }
        if(state.notGroupedPortalList.length <= 0) {
           getListData();
        } else {
            setIsLoaded(true);
        }
        if(state.homeSlider.length <= 0) {
            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/guestweb/home-slider',
                method: REQUEST_METHOD_CONST.POST,
            }).then(res => {
                if(res.status === 200) {
                    if(res.data.success) {
                        if(res.data.data.length > 0) {
                            let array = [];
                            res.data.data.map((item) => {
                                if(item.url) {
                                    array.push(item);
                                }
                            })
                            setToState("destinationPortal", ["homeSlider"], array)
                        }
                        setIsHomeSliderLoaded(true);
                    }

                } else {
                    setIsHomeSliderLoaded(true);
                }
            })
        } else {
            setIsHomeSliderLoaded(true)
        }
        if(state.catId && state.catId !== "") {
            setDetailCardsIsLoaded(true);
        }
    }, [])

    useEffect(() => {
        if(state.lastScrollIndex > 0 && state.scrollIndex === 0) {
            window.scrollTo(0, state.lastScrollIndex);
            setTimeout(() => {
                setToState("destinationPortal", ["lastScrollIndex"], 0)
            }, 500)
        }
    })

    const renderCtaButton = (cta) => {
        if(cta) {
            let link = getHyperlinkParser(cta)

            if(link === false){
                return
            }

            let href = link.href
            let text = link?.text || ''
            let host = window.location.host

            let isExternalLink = false
            if(href.includes('http') && !href.includes(host)){
                isExternalLink = true
            }

            if(isExternalLink) {
                return (
                    <Button
                        style={{color: "#FFFF"}}
                        variant="contained"
                        color="primary"
                        target={"_blank"}
                        href={href}
                    >
                        {t(text)}
                    </Button>
                )
            } else {
                return (
                    <Button
                        style={{color: "#FFFF"}}
                        variant="contained"
                        color="primary"
                        href={href}
                    >
                        {t(text)}
                    </Button>
                )
            }
        }
    }

    return (
        <DestinationPortalWrapper>
            <React.Fragment>
                <NextSeo title={WEBCMS_DATA.assets.meta.title} />
                <div style={{position: "relative"}}>
                    <Container maxWidth="xl" className={classes.mainContainter}>
                        <div style={{position: "relative"}}>
                            <Card className={classes.searchCard} elevation={8}>
                                <CardContent>
                                    <Grid container spacing={4}>
                                        <Grid item xs={12} sm={12} md={3 > 5 ?  5 : 12}>
                                            <div className={classes.firstGridItemInCard}>
                                                <FormControl fullWidth color={"primary"}>
                                                    <Autocomplete
                                                        disabled={!isLoaded}
                                                        value={state.selectedHotel}
                                                        onChange={(e, newValue) => findDestination(e, newValue)}
                                                        fullWidth
                                                        options={state.notGroupedPortalList}
                                                        getOptionSelected={(option, value) => option.id === value.id}
                                                        getOptionLabel={(option) =>
                                                            `${option.title}${option.city ? "," + option.city : ""}`
                                                        }
                                                        renderInput={(params) =>
                                                            <TextField
                                                                className={classes.textFieldStyle}
                                                                color="primary"
                                                                {...params}
                                                                InputProps={{
                                                                    ...params.InputProps,
                                                                    endAdornment: (
                                                                        <React.Fragment>
                                                                            {!isLoaded ? <LoadingSpinner size={18} /> : null}
                                                                            {params.InputProps.endAdornment}
                                                                        </React.Fragment>
                                                                    ),
                                                                }}
                                                                label={t("str_location")}
                                                                placeholder={t("str_whereAreYouGoing")}
                                                                variant={"outlined"}
                                                            />
                                                        }
                                                    />
                                                </FormControl>
                                            </div>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </div>
                    </Container>
                    <Carousel
                        className={"home-slider"}
                        pause={"hover"}
                        indicators={!!(state.homeSlider && state.homeSlider.length > 1)}
                    >
                        {
                            isHomeSliderLoaded && state.homeSlider.length > 0 ?
                               state.homeSlider && state.homeSlider.map((item, ind) => {
                                    return(
                                        <Carousel.Item key={ind}>
                                            <div className={classes.searchBackground} style={{backgroundImage: `url(${GENERAL_SETTINGS.STATIC_URL}${item.url})`}}/>
                                            <Carousel.Caption className={"carousel-description"}>
                                                <Container maxWidth="xl" className={classes.mainContainter}>
                                                    <Typography className={classes.mainTitle}>{item.title}</Typography>
                                                    <Typography className={classes.subTitle}>{item.description}</Typography>
                                                    {
                                                        item.cta && (
                                                            <div style={{paddingTop: "24px"}}>
                                                                {renderCtaButton(item.cta)}
                                                            </div>
                                                        )
                                                    }
                                                </Container>
                                            </Carousel.Caption>
                                        </Carousel.Item>
                                    )
                            }) :
                                <img className={classes.searchBackground} style={{maxHeight: "650px"}} src={"/imgs/no-image available-placeholder.png"} />
                        }
                    </Carousel>
                </div>
                <Container maxWidth="xl" className={classes.mainContainter} style={{marginTop: "30px"}}>
                    <div id={"category"} ref={ref}>
                        {
                             router.query.catid ? (

                                <Paper elevation={0} className={classes.mainSelectPaper} key={state.selectedCategory}>
                                    <Grid container direction="row" justify="space-between" alignItems="center">
                                        <Grid item xs={6}>
                                            <Typography color={"primary"} variant="h6" gutterBottom className={classes.hotelListTitleWithoutPadding}>
                                                {state.selectedCategory}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6} className={classes.seeMoreWithoutPadding}>
                                            <Button
                                                startIcon={<ArrowBackIcon />}
                                                className={classes.seeMoreButton}
                                                color="primary"
                                                onClick={() => {
                                                    setToState("destinationPortal", ["selectedCategory"], null)
                                                    router.push({
                                                            query: {lang: router.query.lang || locale}},
                                                        undefined,
                                                        {scroll: false});
                                                }}
                                            >
                                                {t("str_back")}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                    <Grid container direction="row" spacing={2}>
                                        {detailCardsIsLoaded ? (
                                            <React.Fragment>
                                                {
                                                    state.selectedCategoryList && state.selectedCategoryList.map((item, itemKey) => {
                                                        return (
                                                            <Grid item xs={12} key={itemKey}>
                                                                <CategoryItemFullCard
                                                                    imageUrl={item.url}
                                                                    hotelName={item.title}
                                                                    location={item.location}
                                                                    point={item.point}
                                                                    isguestapp={item.hasgapp}
                                                                    description={item.description}
                                                                    country={item.country}
                                                                    city={item.city}
                                                                    town={item.town}
                                                                    price={item.price}
                                                                    hotelData={item}
                                                                />
                                                            </Grid>
                                                        )
                                                    })
                                                }
                                                <Grid item xs={12}>
                                                    {
                                                        state.selectedCategoryList.length > (topN * topNFactor) ?
                                                            <div style={{textAlign: "center", paddingBottom: "16px"}}>
                                                                <Button onClick={() => setTopNFactor(topNFactor + 1)} color={"primary"} variant={"contained"}>{t("str_showMore")}</Button>
                                                            </div> : null
                                                    }
                                                </Grid>
                                            </React.Fragment>
                                            ) : (
                                                [...Array(3)].map((index) => (
                                                    <Grid item xs={12} key={index}>
                                                        <DetailCardPlaceHolder />
                                                    </Grid>

                                                ))
                                            )
                                        }
                                    </Grid>
                                </Paper>
                            ) : (isLoaded ?
                                    state.portalList && Object.keys(state.portalList).map((category, categoryKey) => {
                                        return (
                                            <Paper elevation={3} className={classes.mainPaper} key={categoryKey}>
                                                <Grid container direction="row" justify="space-between" alignItems="center">
                                                    <Grid item xs={6}>
                                                        <Typography
                                                            className={classes.hotelListTitle}
                                                            color={"primary"}
                                                            variant="h6"
                                                            gutterBottom
                                                        >
                                                            {category}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6} className={classes.seeMore}>
                                                        <Button
                                                            className={classes.seeMoreButton}
                                                            endIcon={<ArrowForwardIosIcon color={"inherit"} style={{fontSize:"18px"}}/>}
                                                            color="primary"
                                                            onClick={() => handleSelectedCategoryList(category)}
                                                        >
                                                            {t("str_list")}
                                                        </Button>
                                                    </Grid>
                                                </Grid>
                                                <Box p={3}>
                                                    <Slider className={state.portalList[category].length === 1 || (state.portalList[category].length <= 3 && screenWidth > 900) ? "portal-slick" : ""} {...getSliderSetting(state.portalList[category].length,  screenWidth <= 1366 ? 4 : 5)}>
                                                        {state.portalList && state.portalList[category].map((item, itemKey) => {
                                                            return (
                                                                <CategoryItemCard
                                                                    key={itemKey}
                                                                    imageUrl={item.url}
                                                                    hotelName={item.title}
                                                                    location={item.location}
                                                                    point={item.point}
                                                                    description={item.description}
                                                                    isPrice={category.isPrice}
                                                                    country={item.country}
                                                                    city={item.city}
                                                                    town={item.town}
                                                                    price={item.price}
                                                                    hotelData={item}
                                                                />
                                                            )
                                                        })}
                                                    </Slider>
                                                </Box>
                                            </Paper>
                                        )}): (
                                        <Paper elevation={3} className={classes.mainPaper}>
                                            <Grid container direction="row" justify="space-between" alignItems="center">
                                                <Grid item xs={6}>
                                                    <Typography
                                                        className={classes.hotelListTitle}
                                                        variant="h6"
                                                        gutterBottom
                                                    >
                                                        <Skeleton width={100} height={40} />
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6} className={classes.seeMore}>
                                                    <Skeleton width={100} height={60} style={{float: "right"}} />
                                                </Grid>
                                            </Grid>
                                            <Box p={3}>
                                                <Slider {...placeHolderSlideSetting(screenWidth >= 1920 ? 5 : 4, screenWidth >= 1920 ? 5 : 4)}>
                                                    {
                                                        [...Array(screenWidth >= 1920 ? 5 : 4)].map((index) => (
                                                            <div className={classes.cardRoot} key={index}>
                                                                <svg style={{maxWidth: "100%"}} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="393" height="489" viewBox="0 0 393 489">
                                                                    <defs>
                                                                        <filter id="Rectangle_25490" x="0" y="0" width="393" height="489" filterUnits="userSpaceOnUse">
                                                                            <feOffset dy="3" input="SourceAlpha"/>
                                                                            <feGaussianBlur stdDeviation="3" result="blur"/>
                                                                            <feFlood floodOpacity={"0.161"} />
                                                                            <feComposite operator="in" in2="blur"/>
                                                                            <feComposite in="SourceGraphic"/>
                                                                        </filter>
                                                                    </defs>
                                                                    <g id="Group_17244" data-name="Group 17244" transform="translate(-51 -433)">
                                                                        <g id="Group_17179" data-name="Group 17179" transform="translate(-29 -406)">
                                                                            <g transform="matrix(1, 0, 0, 1, 80, 839)" filter="url(#Rectangle_25490)">
                                                                                <rect id="Rectangle_25490-2" data-name="Rectangle 25490" width="375" height="471" rx="7" transform="translate(9 6)" fill="#fff"/>
                                                                            </g>
                                                                            <path id="Path_9059" data-name="Path 9059" d="M7,0H368a7,7,0,0,1,7,7V207a7,7,0,0,1-7,7H7a7,7,0,0,1-7-7V7A7,7,0,0,1,7,0Z" transform="translate(89 845)" fill="#c2d8da"/>
                                                                            <rect id="Rectangle_25494" data-name="Rectangle 25494" width="145" height="18" rx="9" transform="translate(116 1089)" fill="#c2d8da"/>
                                                                            <rect id="Rectangle_25495" data-name="Rectangle 25495" width="322" height="13" rx="6.5" transform="translate(116 1137)" fill="#c2d8da"/>
                                                                            <rect id="Rectangle_25496" data-name="Rectangle 25496" width="140" height="13" rx="6.5" transform="translate(116 1163)" fill="#c2d8da"/>
                                                                            <rect id="Rectangle_25497" data-name="Rectangle 25497" width="150" height="36" rx="5" transform="translate(115 1254)" fill="#c2d8da"/>
                                                                            <rect id="Rectangle_25498" data-name="Rectangle 25498" width="150" height="36" rx="5" transform="translate(288 1254)" fill="#c2d8da"/>
                                                                        </g>
                                                                    </g>
                                                                </svg>
                                                            </div>
                                                        ))
                                                    }
                                                </Slider>
                                            </Box>
                                        </Paper>
                                    )
                            )
                        }
                    </div>
                </Container>
            </React.Fragment>
        </DestinationPortalWrapper>

    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.destinationPortal,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    pushToState: (stateType, stateName, value) => dispatch(pushToState(stateType, stateName, value)),
    deleteFromState: (stateType, stateName, value) => dispatch(deleteFromState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(DestinationPortal)