import React, { useState, useEffect, useContext, useRef, createRef } from 'react'
import { connect, useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import { useRouter } from 'next/router';
import LocationOnIcon from '@material-ui/icons/LocationOn'
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import {
    IconButton,
    Typography,
    Paper,
    Button,
    Grid,
    Divider,
} from '@material-ui/core'
import clsx from 'clsx'
import {deleteFromState, pushToState, setToState, updateState} from "../../../../state/actions";
import WebCmsGlobal from "../../../webcms-global";
import useTranslation from "../../../../lib/translations/hooks/useTranslation";
import {CustomToolTip} from "../../../user-portal/components/CustomToolTip/CustomToolTip";
import {convertUrlStandard} from "../../../../model/orest/constants";
import RestaurantReservation from "../../../guest/public/components/info/event-reservation";
import {FALSE} from "../../../../model/globals";


const categoryItemFullCardStyle = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        background: '#FFFFFF 0% 0% no-repeat padding-box',
        boxShadow: '0px 4px 8px #00000029',
        opacity: 1,
        marginBottom: 20,
    },
    paper: {
        margin: 'auto',
    },
    image: {
        width: 128,
        height: 128,
    },
    img: {
        display: 'block',
        width: "100%",
        maxWidth: '100%',
        maxHeight: '100%',
        height: "100%",
        borderRadius: '5px 0 0 5px',
        [theme.breakpoints.down('sm')]: {
            width: '100%',
            borderRadius: '5px 5px 0 0',
            minWidth: "auto",
        },
    },
    topImage: {
        width: "100%",
        position: "relative",
        height: "inherit",
        backgroundSize:"cover",
        backgroundPosition:"center",
        backgroundRepeat:"no-repeat",
        [theme.breakpoints.only("xs")]: {
            height: "200px",
        },
        [theme.breakpoints.only("sm")]: {
            height: "300px",
        },
    },
    categoryItemFullCard: {},
    categoryItemPoint: {
        fontSize: 16,
        paddingLeft: 8,
        borderRadius: 4,
        letterSpacing: 3,
        fontWeight: 'bolder',
        "&.MuiButton-root.Mui-disabled": {
            color: "#FFFFFF"
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: "12px",
        },
    },
    highPoint: {
        backgroundColor: '#70CFA2',
        color: '#ffffff',
        "&:hover": {
            backgroundColor: '#70CFA2',
        }
    },
    mediumPoint: {
        backgroundColor: '#FFD740',
        color: '#ffffff',
        "&:hover": {
            backgroundColor: '#FFD740',
        }
    },
    lowPoint: {
        backgroundColor: '#ed5e4f',
        color: '#ffffff',
        "&:hover": {
            backgroundColor: '#ed5e4f',
        }
    },
    fullPoint: {
        fontSize: 15,
        color: '#ffffffba',
    },
    itemPoint: {
        letterSpacing: 0,
        marginRight: 3,
    },
    bookmarkFullCard: {
        position: 'absolute',
        top: 0,
        color: '#ffffff',
    },
    bottomActionMenu: {
        textAlign: 'right',
        padding: '0!important',
    },
    imgFullCard: {
        height: "100%",
        position: 'relative',
        [theme.breakpoints.down('sm')]: {
            width: '100%',
        },
    },
    categoryItemDetails: {
        position: 'relative',
        paddingBottom: '0!important',
        [theme.breakpoints.down('sm')]: {
            padding: 15,
        },
    },
    categoryItemName: {
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        paddingBottom: "8px",
        fontSize: "36px",
        fontWeight: '600',
        color: '#1A5588',
        [theme.breakpoints.down('xs')]: {
            fontSize: "24px",
        },
    },
    categoryItemDesc: {
        color: '#648B92',
    },
    categoryItemDescOverFlow: {
        minHeight: "48px",
        height: "48px",
        maxHeight: "48px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        color: '#648B92',
        display: "-webkit-box",
        WebkitLineClamp: 2,
        '-webkit-line-clamp': 2,
        '-webkit-box-orient': "vertical",
        [theme.breakpoints.down('xs')]: {
            WebkitLineClamp: 3,
            '-webkit-line-clamp': 3,
            minHeight: "72px",
            height: "72px",
            maxHeight: "72px",
        },

    },
    categoryItemLocation: {
        paddingTop: "24px",
        color: '#648B92',
        textAlign: 'right',
        paddingRight: 16,
        position: 'relative',
        [theme.breakpoints.down('sm')]: {
            paddingTop: 0,
        },
    },
    icon: {
        verticalAlign: "top",
        color: '#44B3E4',
        position: 'relative',
        top: -9,
        [theme.breakpoints.down('sm')]: {
            fontSize: 20,
        },
    },
    categoryItemLocationName: {
        position: 'relative',
        top: -10,
        [theme.breakpoints.down('sm')]: {
            top: -8
        },
        textTransform: "capitalize"
    },
    categoryItemBadgeIcon: {
        width: 30,
        height: 30,
        margin: 15,
        textAlign: 'right',
    },
    categoryItemWrapGrid: {
        paddingTop: "8px",
        display: "flex",
        paddingLeft: "64px",
        [theme.breakpoints.only('sm')]: {
            paddingLeft: "24px",
        },
        [theme.breakpoints.only('xs')]: {
            paddingLeft: "16px",
        },
    },
    fullCardContent: {
        padding: "8px 0 0 64px",
        [theme.breakpoints.only('xs')]: {
            paddingLeft: "16px",
            paddingRight: "16px",
        },
        [theme.breakpoints.only('sm')]: {
            paddingLeft: "24px",
            paddingRight: "24px",
        },
    },
    fullCardIconContent: {
        textAlign: "right",
        paddingTop: "8px",
        [theme.breakpoints.down('xs')]: {
            paddingTop: "0",
        },
    },
    bookButton: {
        marginLeft: "8px",
        width: "250px",
        [theme.breakpoints.down('xs')]: {
            width: "auto",
            fontSize: "12px"
        },
    },
    dividerStyle: {
        marginBottom: "8px",
        marginLeft: "64px",
        marginRight: "16px",
        backgroundColor: "#E2F0F4",
        color: "#E2F0F4",
        [theme.breakpoints.down('sm')]: {
            marginLeft: "24px",
        },
    },
    textShowButton: {
        zIndex: 1,
        position: "absolute",
        textAlign: "center",
        left: "50%",
        transform: "translateX(-50%)",
        msTransform: "translateX(-50%)",
        top: "0"
    },
    actionMoreButton: {
        fontSize: "14px",
        fontWeight: "bold",
        border: "1px solid",
        [theme.breakpoints.down('xs')]: {
            //width: "100%",
            fontSize: "12px"
        },

    },
}))


function CategoryItemFullCard(props) {
    const classes = categoryItemFullCardStyle();

    const { setToState, state } = props

    const { GENERAL_SETTINGS, locale} = useContext(WebCmsGlobal)
    const { t } = useTranslation();
    const router = useRouter();
    const isLogin = !!useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth)

    const { hotelName, imageUrl, description, isguestapp, country, city, town, hotelData } = props
    const [showFullText, setShowFullText] = useState(false);
    const descRef = useRef(null);
    const titleRef = useRef(null);
    const [isOverFlowTitle, setIsOverFlowTitle] = useState(false);
    const [isOverFlowDesc, setIsOverFlowDesc] = useState(false);
    const [openReservation, setOpenReservation] = useState(false);
    const [eventLocData, setEventLocData] = useState(null);


    const pointsColors = {
        high: hotelData ? hotelData.locrate >= 4.5 : false,
        medium: hotelData ? hotelData.locrate >= 3 && hotelData.locrate < 4.5 : false,
        low: hotelData ? hotelData.locrate < 3 : false,
    }

    const handleClickBookButton = () => {
        if(hotelData.noroom) {
            if(!isLogin) {
                setToState("guest", ["openLoginDialog"], true);
            } else {
                setToState("guest", ["changeHotelRefno"], hotelData.id)
                setOpenReservation(true);
            }
        } else {
            if(hotelData.webkey) {
                const win = window.open(`https://${hotelData.webkey}.vimahotels.com/booking`, '_blank');
                if (win != null) {
                    win.focus();
                }
            }
        }

    }

    const handleClickMoreButton = () => {
        let urlName = "";
        urlName = convertUrlStandard(hotelName?.removeHtmlTag());
        setToState("destinationPortal", ["selectedHotel"], hotelData)
        if(hotelData.webkey) {
            setToState("destinationPortal", ["webKey"], hotelData.webkey);
        }
        router.push({
            pathname: `guest/detail/${urlName}`,
            query: {lang: router.query.lang || locale, catid: router.query.catid, gid: hotelData.gid}
        });

    }

    useEffect(() => {
        if(hotelData) {
            const data = {
                id: hotelData.locid,
                locid: hotelData.locid,
                locdepartid: hotelData.locdepartid,
                lochasres: hotelData.lochasres,
                locismulti: hotelData.locismulti,
                lochasmenu: hotelData.lochasmenu,
                locmid: hotelData.locmid,
                gapptypeid: hotelData.gapptypeid,
                localtitle: hotelData.localtitle,
                locdesc: hotelData.localtitle,
                hotelrefno: hotelData.id
            }
            setEventLocData(data)
        }
    }, [])


    useEffect(() => {
        if(titleRef.current) {

            if(titleRef.current.offsetWidth < titleRef.current.scrollWidth) {
                setIsOverFlowTitle(true);
            }
        }
        if(descRef.current) {
            if(descRef.current.offsetHeight < descRef.current.scrollHeight) {
                setIsOverFlowDesc(true);
            }
        }
    }, [titleRef, descRef])



    return (
        <div className={classes.root}>
            {
                openReservation && eventLocData && (
                    <RestaurantReservation
                        isOpen={openReservation}
                        onClose={(e) => {
                            setOpenReservation(e)
                            updateState('guest', 'menuGroupAndProductList', FALSE)
                        }}
                        eventLocData={eventLocData}
                        isPortal
                        isFromDetailPage={false}
                        sliderTitle={hotelData.localtitle || hotelData.title}
                        sliderDesc={hotelData.description}
                        sliderImg={hotelData.url}
                    />
                )
            }
            <Paper className={classes.paper} elevation={3}>
                <Grid container>
                    <Grid item xs={12} sm={12} md={4} lg={3}>
                        <div className={classes.imgFullCard}>
                            <div className={classes.topImage} style={{backgroundImage: `url(${GENERAL_SETTINGS.STATIC_URL}${imageUrl}`}}/>
                            <IconButton color="primary" className={classes.bookmarkFullCard}>
                                <BookmarkBorderIcon/>
                            </IconButton>
                        </div>
                    </Grid>
                    <Grid item xs={12} sm={12} md={8} lg={9}>
                        <Grid container>
                            <Grid item xs={12} sm={8} md={9} lg={10}>
                                <div className={classes.fullCardContent}>
                                    {
                                        isOverFlowTitle ? (
                                            <CustomToolTip title={hotelName} placement={"top"}>
                                                <Typography ref={titleRef} className={classes.categoryItemName}>
                                                    {hotelName?.removeHtmlTag()}
                                                </Typography>
                                            </CustomToolTip>
                                        ) : (
                                            <Typography ref={titleRef} className={classes.categoryItemName}>
                                                {hotelName?.removeHtmlTag()}
                                            </Typography>
                                        )
                                    }
                                    <div>
                                        <Typography
                                            ref={descRef}
                                            className={!showFullText ? classes.categoryItemDescOverFlow : classes.categoryItemDesc}
                                        >
                                            {description?.removeHtmlTag()}
                                        </Typography>
                                        {
                                            isOverFlowDesc ?
                                                <div style={{position: "relative"}}>
                                                    <div className={classes.textShowButton}>
                                                        <Button
                                                            style={{color: "#648B92", textTransform: "capitalize"}}
                                                            endIcon={ !showFullText ?  <ExpandMoreIcon /> : <ExpandLessIcon /> }
                                                            onClick={() => setShowFullText(!showFullText)}
                                                        >
                                                            {showFullText ? t("str_hide") : t("str_showAll")}
                                                        </Button>
                                                    </div>
                                                </div> : null
                                        }
                                    </div>
                                </div>
                            </Grid>
                            <Grid item xs={12} sm={4} md={3} lg={2}>
                                <div className={classes.fullCardIconContent}>
                                    {hotelData.locrate > 3.5 ? (
                                        <img src="imgs/portal/like.png"
                                             className={classes.categoryItemBadgeIcon}/>
                                    ) : (
                                        <img src="imgs/portal/alert.png"
                                             className={classes.categoryItemBadgeIcon}/>
                                    )}
                                    {isguestapp && (
                                        <img src="imgs/portal/guestapp.png"
                                             className={classes.categoryItemBadgeIcon}/>
                                    )}
                                </div>
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container>
                                    <Grid item xs={12}>
                                        <Typography className={classes.categoryItemLocation}>
                                            <LocationOnIcon className={classes.icon}/> <span
                                            className={classes.categoryItemLocationName}>{town !== null && town !== "" ? (town.toLowerCase() +  ", ") : ""} {city !== null && city !== "" ? (city.toLowerCase() + ", ") : ""} {country !== null ? country.toLowerCase() : ""}</span>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Divider className={classes.dividerStyle} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <div style={{paddingBottom: "16px"}}>
                                            <Grid container>
                                                <Grid item xs={12}>
                                                    <div className={classes.categoryItemWrapGrid}>
                                                        <Button
                                                            disabled
                                                            className={clsx(classes.categoryItemPoint, {
                                                                [classes.highPoint]: pointsColors.high,
                                                                [classes.mediumPoint]: pointsColors.medium,
                                                                [classes.lowPoint]: pointsColors.low,
                                                            })}
                                                        >
                                                            {`${hotelData.locrate.toFixed(1)}/5`}
                                                        </Button>
                                                        <div style={{marginLeft: "auto", paddingRight: "16px"}}>
                                                            <Button
                                                                color={"primary"}
                                                                size={"medium"}
                                                                className={classes.actionMoreButton}
                                                                onClick={() => handleClickMoreButton()}
                                                            >
                                                                {t("str_discover")}
                                                            </Button>
                                                            {
                                                                hotelData.noroom ? (
                                                                    hotelData.lochasres && (
                                                                        <Button
                                                                            className={classes.bookButton}
                                                                            variant="contained"
                                                                            size="medium"
                                                                            disableElevation
                                                                            onClick={() => handleClickBookButton()}
                                                                        >
                                                                            {t("str_book")}
                                                                        </Button>
                                                                    )
                                                                ) : hotelData.webkey && hotelData.webkey !== "" && (
                                                                    <Button
                                                                        color={'primary'}
                                                                        className={classes.bookButton}
                                                                        variant="contained"
                                                                        size="medium"
                                                                        disableElevation
                                                                        onClick={() => handleClickBookButton()}
                                                                    >
                                                                        {t("str_book")}
                                                                    </Button>
                                                                )
                                                            }
                                                        </div>
                                                    </div>
                                                </Grid>
                                            </Grid>
                                        </div>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(CategoryItemFullCard)