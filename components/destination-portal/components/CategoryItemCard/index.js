import React, { useState, useEffect, useContext } from 'react'
import { connect, useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import {
    Typography,
    Card,
    CardMedia,
    CardContent,
    Button,
    Grid,
} from '@material-ui/core'
import { useRouter } from 'next/router';
import {deleteFromState, pushToState, setToState, updateState} from "../../../../state/actions";
import WebCmsGlobal from "../../../webcms-global";
import useTranslation from "../../../../lib/translations/hooks/useTranslation";
import RestaurantReservation from "../../../guest/public/components/info/event-reservation";
import {FALSE} from "../../../../model/globals";
import {convertUrlStandard} from "../../../../model/orest/constants";



const categoryItemCardStyle = makeStyles((theme) => ({
    root: props => ({
        marginLeft: 10,
        marginRight: 10,
        background: '#FFFFFF 0% 0% no-repeat padding-box',
        border: `2px solid ${props.borderColor}`,
        borderRadius: 10,
        opacity: 1,
        [theme.breakpoints.down('xs')]: {
            maxWidth: 345,
            margin: "auto"
        },
    }),
    media: {
        height: 180,
        [theme.breakpoints.down('sm')]: {
            height: 150,
        },
    },
    itemName: {
        paddingBottom: "8px",
        fontSize: "24px",
        textTransform: "capitalize",
        fontWeight: 'bold',
        color: '#716C72',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    itemDescription: {
        fontSize: "14px",
        color: '#716C72',
        minHeight: "3em",
        height: "3em",
        maxHeight: "3em",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        '-webkit-line-clamp': 2,
        '-webkit-box-orient': "vertical",
    },
    location: {
        textTransform: 'capitalize',
        color: '#716C72',
        [theme.breakpoints.down('sm')]: {
            textAlign: 'center',
        },
    },
    icon: {
        color: '#44B3E4',
        [theme.breakpoints.down('sm')]: {
            fontSize: 20,
        },
    },
    priceInfo: {
        color: '#716C72',
        padding: 5,
        [theme.breakpoints.down('sm')]: {
            textAlign: 'center',
        },
    },
    priceDesc: {
        fontSize: '0.9em',
    },
    price: {
        fontSize: '1em',
        fontWeight: 'bold',
    },
    smTopZero: {
        [theme.breakpoints.down('sm')]: {
            paddingTop: 0,
        },
    },
    smBottomZero: {
        [theme.breakpoints.down('sm')]: {
            paddingBottom: 0,
        },
    },
    actionBookButton: {
        textTransform: 'capitalize',
        fontWeight: "bold",
    }
}))

function CategoryItemCard(props) {
    const { GENERAL_SETTINGS, WEBCMS_DATA, locale } = useContext(WebCmsGlobal)
    const isLogin = !!useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth);

    const classes = categoryItemCardStyle({borderColor: WEBCMS_DATA.assets.colors.primary.main})
    const { hotelName, imageUrl, description, isPrice, city, price, hotelData, setToState, key, state } = props

    const [openReservation, setOpenReservation] = useState(false);
    const [eventLocData, setEventLocData] = useState(null);

    const { t } = useTranslation();
    const router = useRouter();


    const handleClickMoreButton = () => {
        let urlName = "";
        urlName = convertUrlStandard(hotelName?.removeHtmlTag());
        setToState("destinationPortal", ["selectedHotel"], hotelData)
        if(hotelData.webkey) {
            setToState("destinationPortal", ["webKey"], hotelData.webkey);
        }
        router.push({
            pathname: `guest/detail/${urlName}`,
            query: {lang: router.query.lang || locale, gid: hotelData.gid}
        });

    }

    const handleClickBookButton = () => {
        if(hotelData.noroom) {
            if(!isLogin) {
                setTimeout(() => {
                    setToState("guest", ["openLoginDialog"], true);
                }, 200)
            } else {
                setToState("guest", ["changeHotelRefno"], hotelData.id)
                setOpenReservation(true);
            }
        } else {
            if(hotelData.webkey) {
                let useHotelUrl
                if (!hotelData.webkey.includes('.')) {
                    useHotelUrl = `${hotelData.webkey}.vimahotels.com`
                } else {
                    useHotelUrl = hotelData.webkey
                }

                const win = window.open(`https://${useHotelUrl}/booking/rooms`, '_blank');
                if (win != null) {
                    win.focus();
                }
            }
        }
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

    return (
        <React.Fragment>
            {
                openReservation && eventLocData ? (
                    <RestaurantReservation
                        isOpen={openReservation}
                        onClose={(e) => {
                            setOpenReservation(e)
                            updateState('guest', 'menuGroupAndProductList', FALSE)
                        }}
                        sliderTitle={hotelData.localtitle || hotelData.title}
                        sliderImg={hotelData.url}
                        sliderDesc={hotelData.localdesc || hotelData.description}
                        eventLocData={eventLocData}
                        isPortal
                        isFromDetailPage={false}
                    />
                ) : null
            }
            <Card className={classes.root} variant="outlined" key={key}>
                <CardContent style={{padding: "0", display:"relative"}}>
                    <CardMedia
                        className={classes.media}
                        image={GENERAL_SETTINGS.STATIC_URL + imageUrl}
                        title={hotelName?.removeHtmlTag()}
                    />
                    <CardContent>
                        <Typography
                            align="left"
                            color="textSecondary"
                            className={classes.itemName}
                        >
                            {hotelName?.removeHtmlTag().toLowerCase()}
                        </Typography>
                        <Typography className={classes.itemDescription}>
                            {description?.removeHtmlTag()}
                        </Typography>
                        <div style={{paddingTop: '12px'}}>
                            <Grid container spacing={1}>
                                <Grid item xs={12} sm={6} className={classes.smTopZero}>
                                    <div style={{display: "flex"}}>
                                        <LocationOnIcon className={classes.icon}/>
                                        <Typography className={classes.location}>
                                            {city?.toLowerCase()}
                                        </Typography>
                                    </div>
                                </Grid>
                                {isPrice && (
                                    <Grid item xs={12} sm={6} className={classes.smBottomZero}>
                                        <Typography variant="subtitle2" align="right" className={classes.priceInfo}>
                                            <span className={classes.priceDesc}>prices starting from</span> <span
                                            className={classes.price}>{price}</span>
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </div>
                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={6}>
                                <Button color={"primary"} className={classes.actionBookButton} size={'small'} onClick={() => handleClickMoreButton()} variant="outlined" fullWidth disableElevation>
                                    {t("str_discover")}
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {
                                    hotelData.noroom ? (
                                        hotelData.lochasres && (
                                            <Button className={classes.actionBookButton} size={'small'} color={"primary"} variant="contained" onClick={() => handleClickBookButton()} fullWidth disableElevation>
                                                {t("str_book")}
                                            </Button>
                                        )
                                    ) : (
                                        hotelData.webkey && hotelData.webkey !== "" && (
                                            <Button className={classes.actionBookButton} size={'small'} color={"primary"} variant="contained" onClick={() => handleClickBookButton()} fullWidth disableElevation>
                                                {t("str_book")}
                                            </Button>
                                        )
                                    )
                                }
                            </Grid>
                        </Grid>
                    </CardContent>
                </CardContent>
            </Card>
        </React.Fragment>
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

export default connect(mapStateToProps, mapDispatchToProps)(CategoryItemCard)