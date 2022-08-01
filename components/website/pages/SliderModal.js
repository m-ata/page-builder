import React, { memo, useContext, useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import {
    Typography,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Box,
    CardMedia,
} from '@material-ui/core';
import useTranslation from 'lib/translations/hooks/useTranslation';
import Slider from "react-slick";
import WebCmsGlobal from "../../webcms-global";
import {useSelector} from "react-redux";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        marginTop: 16
    },
    wrapper: {
        margin: 'auto',
        boxShadow: '0 0 0 1px #d2d2d26b',
    },
    title: {
        fontWeight: 'bold',
    },
    description: {
        display: '-webkit-box',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        '-webkit-line-clamp': 2,
        '-webkit-box-orient': 'vertical',
        letterSpacing: 0,
    },
    thumbnail: {
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        width: '100%',
        height: '100%',
        borderRadius: 0,
        cursor: 'pointer',
        [theme.breakpoints.down("md")]: {
            minHeight: 480
        },
        [theme.breakpoints.down("xs")]: {
            minHeight: 220
        }
    },
    rightColumn: {
        padding: 16,
    },
    attributeList: {
        display: 'inline-flex',
        padding: 0,
    },
    attributeItem: {
        position: 'relative',
        listStyleType: 'none',
        padding: '15px',
        borderRight: '1px solid #ababab59',
        '&:last-child': {
            borderRight: 'none',
        },
    },
    attributeIcon: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        '-ms-transform': 'translate(-50%, -50%)',
        transform: 'translate(-50%, -50%)',
    },
    actionsContainer: {
        display: 'flex',
        alignItems: 'flex-end',
        '& > div': {
            textAlign: 'right',
        },
    },
    addRoomTitle:{
        paddingRight: 6
    },
    addRoomButton: {
        padding: 6,
    },
    deleteRoomButton: {
        padding: 6,
    },
    addRoomTotal: {
        padding: 10,
        width: 50,
    },
    noRoomAlert: {
        width: '100%'
    },
    sliderImage: {
        padding: '0px 10px 10px 10px',
        [theme.breakpoints.only('xs')]: {
            padding: '0px 5px 5px 5px',
        },
    },
    sliderDesc: {
        marginTop: 50
    },
    media: {
        height: '50vh',
        [theme.breakpoints.only('xs')]: {
            height: '25vh',
        },
    },
    roomCardTotalPerInfoBox: {
        position: 'relative',
        display: 'inline-block',
        top: -45,
        left: 10,
        [theme.breakpoints.down("md")]: {
            top: -290,
        },
    },
    roomCardTotalPerInfo: {
        backgroundColor: '#ffffff',
        borderRadius: 0,
        marginLeft: 5,
        boxShadow: 'inset 0 0 0px 1px #c8c8c8',
        fontSize: 16,
        color: '#616161',
        opacity: 0.8
    },
    sliderBg: {
        border: '1px solid white',
        backgroundColor: '#FFFFFF',
        borderRadius: '50%'
    },
    sliderArrow: {
        color: "#000000",
        fontSize: 40,
        [theme.breakpoints.down("sm")]: {
            fontSize: 30,
        },
    },
    ctaButton: {
        borderRadius: 2,
        backgroundColor: props => props?.buttonColor ? props.buttonColor : "#000000",
        cursor: 'pointer',
        display: 'inline-block',
        fontSize: 14,
        letterSpacing: 3,
        lineHeight: '45px',
        padding: '0 45px',
        textAlign: "center",
        '& a': {
            color: 'white'
        }
    },
}));

const ThumbnailSliderModal = (props) => {

    const { sliderTitle, sliderDesc, open, onClose, sliderImages, sliderCta, slider } = props;
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal);
    const { t } = useTranslation();
    const classes = useStyles(slider);
    const settings = {
        dots: true,
        infinite: true,
        lazyLoad: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        centerMode: true,
        swipeToSlide: true,
        touchMove: true
    };
    const [title, setTitle] = useState(sliderTitle);
    const [description, setDescription] = useState(sliderDesc);
    const [cta, setCta] = useState(sliderCta);

    const website = useSelector((state) => state?.formReducer?.website)

    useEffect(() => {
        setTitle(sliderTitle);
        setDescription(sliderDesc);
    }, [sliderTitle, sliderDesc]);

    const handleSlideChange = (index) => {
        setTitle(sliderImages[index]?.title || sliderTitle);
        setDescription(sliderImages[index]?.description || sliderDesc);
        setCta(sliderImages[index]?.cta);
    }

    return (
        <Dialog open={open} onClose={()=> onClose(false)} maxWidth="md" fullWidth>
            <DialogTitle>
                <div dangerouslySetInnerHTML={{ __html: title }}/>
            </DialogTitle>
            <DialogContent dividers style={{overflow: 'overlay', padding: 40}}>
                <Slider {...settings} afterChange={handleSlideChange}>
                    {
                        sliderImages &&
                        sliderImages.map((item, i) => {
                            return (
                                <Box key={i} className={classes.sliderImage}>
                                    <CardMedia
                                        className={classes.media}
                                        image={GENERAL_SETTINGS.STATIC_URL + item?.fileurl}
                                        title="Contemplative Reptile"
                                    />
                                </Box>
                            )
                        })
                    }
                </Slider>
                <Typography variant="body1" gutterBottom className={classes.sliderDesc}>
                    <div dangerouslySetInnerHTML={{ __html: description }}/>
                </Typography>
                {
                    cta && <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        aria-label="add"
                        className={classes.ctaButton}
                    >
                        <div dangerouslySetInnerHTML={{ __html: cta }} style={{ fontFamily: website?.assets?.font?.name ? website.assets.font.name : 'Roboto' }}/>
                    </Button>
                }
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={()=> onClose(false)}>{t('str_close')}</Button>
            </DialogActions>
        </Dialog>
    )
}


const memorizedThumbnailSliderModal = memo(ThumbnailSliderModal)

export default memorizedThumbnailSliderModal