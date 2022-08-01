import React, {memo, useContext, useEffect, useRef, useState} from 'react'
import {makeStyles} from "@material-ui/core/styles";
import Slider from 'react-slick';
import Button from "@material-ui/core/Button";
import WebCmsGlobal from "../../webcms-global";
import { useSelector } from 'react-redux';
import moment from "moment";
import {OREST_ENDPOINT} from "../../../model/orest/constants";
import {Typography} from "@material-ui/core";
import ThumbnailSliderModal from "./SliderModal";

const useStyles = makeStyles((theme) => ({
    cardRoot: {
        width: '100%',
    },
    parentDiv: {
        display: "flex",
        flexWrap: 'wrap'
    },
    textDiv: {
        float: "left",
        width: '50%',
        [theme.breakpoints.down("xs")]: {
            width: '100%',
        },
    },
    heading: {
        letterSpacing: 2,
        marginBottom: 30,
        color: props => props?.textColor ? props.textColor : "#000000"
    },
    cardDiv: {
        display: "inline-block",
        width: '50%',
        [theme.breakpoints.down("xs")]: {
            width: '100%',
        },
    },
    cardImage: {
        width: '100%',
        height: '40vh',
        borderRadius: 5
    },
    description: {
        color: props => props?.textColor ? props.textColor : "#000000",
        display: 'block',
        overflow: 'hidden',
        textAlign: 'justify',
        fontSize: '0.95rem',
        height: 150,
    },
    line: {
        background: '#839FAD none repeat scroll 0 0',
        display: 'block',
        height: 1,
        marginTop: 10,
        marginBottom: 10,
        position: 'relative',
        width: '10%'
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
    moreInfoRoot: {
        position: 'relative',
        textAlign: 'center',
        marginTop: -8,
        marginBottom: 10,
        '&::before': {
            content: '""',
            width: '100%',
            marginTop: 12,
            display: 'block',
            position: 'absolute',
            borderBottom: '1px dashed #ededed',
            boxShadow: '0 -15px 15px 10px #ffffff',
        },
    },
    moreInfoButton: {
        fontSize: '0.7rem',
        padding: '2px 10px 1px',
        background: 'white',
    },
}));

const Description = ({ str = '', openSlider, moreInfoText, sliderGalleryProp, cta }) => {
    const classes = useStyles(sliderGalleryProp);
    const ref = useRef();
    const [offsetHeight, setOffsetHeight] = useState(null);

    useEffect(() => {
        setOffsetHeight(ref?.current?.offsetHeight)
    }, [str]);

        return (
            <React.Fragment>
                <Typography className={classes.description} variant='body1' gutterBottom>
                    <div ref={ref} dangerouslySetInnerHTML={{ __html: str + '...' }}/>
                </Typography>
                {
                    offsetHeight > 100 && <div className={classes.moreInfoRoot}>
                        <Button className={classes.moreInfoButton} variant='outlined' color='primary' size='small' onClick={() => openSlider()} style={{ fontSize: '0.7rem', padding: '2px 10px 1px' }}>
                            {moreInfoText}
                        </Button>
                    </div>

                }
            </React.Fragment>
        )
}

const WebsiteSliderGallery = (props) => {

    const { sliderGallery,
            otherLangSliderGallery,
            selectedLang,
            defaultLang,
            } = props;

    const [sliderImages, setSliderImages] = useState([]);
    const [sliderTitle, setSliderTitle] = useState('');
    const [sliderDescription, setSliderDescription] = useState('');
    const [sliderCta, setSliderCta] = useState('');
    const [filteredImages, setFilteredImages] = useState([]);
    const [showSlider, setShowSlider] = useState([]);
    const [ isOpenSlider, setIsOpenSlider ] = useState(false);
    const [hasMobileView, setMobileView] = useState(false);
    const website = useSelector((state) => state?.formReducer?.website);

    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal);
    const classes = useStyles(sliderGallery);
    const settings = {
        dots: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
    }

    useEffect(() => {
        if (sliderGallery?.gid?.images?.length > 0) {
            setSliderImages(sliderGallery.gid.images);
            setFilteredImages(sliderGallery.gid.images);
        }
        // handling expiry date
        if (sliderGallery?.gid?.expiryDate) {
            const currentDate = moment().format(OREST_ENDPOINT.DATEFORMAT_LOCALE)
            setShowSlider(moment(sliderGallery?.gid?.expiryDate).isAfter(currentDate))
        } else {
            setShowSlider(true)
        }
    }, [sliderGallery])

    useEffect(() => {
        const setResponsiveness = () => {
            return window.innerWidth < 767
                ? setMobileView(true)
                : setMobileView(false)
        }
        setResponsiveness()
        window.addEventListener('resize', () => setResponsiveness())
    }, []);

    const rotateImages = (nums, k) => {

        for (let i = 0; i < k; i++) {
            nums.unshift(nums.pop());
        }

        return nums;
    }

    return (
        <>
            {
                showSlider &&
                <Slider {...settings}>
                    {sliderImages.map((item, i) => {
                        return (
                            <div key={i} className={classes.cardRoot} >
                                <div className={classes.textDiv}>
                                    <h4 className={classes.heading} >
                                        <div dangerouslySetInnerHTML={{ __html: selectedLang === defaultLang ? item.title : otherLangSliderGallery?.length > 0 && otherLangSliderGallery[i]?.title }}/>
                                        <span className={classes.line}/>
                                    </h4>
                                    {
                                        hasMobileView ?
                                            <Description
                                                str={selectedLang === defaultLang ? item.description : otherLangSliderGallery?.length > 0 && otherLangSliderGallery[i]?.description}
                                                openSlider={()=> {
                                                    setIsOpenSlider(true);
                                                    setSliderTitle(item?.title);
                                                    setSliderDescription(item?.description);
                                                    setSliderCta(item?.cta);
                                                    setFilteredImages(rotateImages(sliderImages, i));
                                                }}
                                                moreInfoText={'Show more'}
                                                sliderGalleryProp={sliderGallery}
                                                cta={item?.cta}
                                            /> :
                                            <>
                                                <p className={classes.description}>
                                                    <div dangerouslySetInnerHTML={{ __html: selectedLang === defaultLang ? item.description : otherLangSliderGallery?.length > 0 && otherLangSliderGallery[i]?.description }}/>
                                                </p>
                                                {
                                                    item?.cta && <Button
                                                        variant="contained"
                                                        size="small"
                                                        color="primary"
                                                        aria-label="add"
                                                        className={classes.ctaButton}
                                                    >
                                                        <div dangerouslySetInnerHTML={{ __html: selectedLang === defaultLang ? item?.cta : otherLangSliderGallery?.length > 0 && otherLangSliderGallery[i]?.cta }} style={{ fontFamily: website?.assets?.font?.name ? website.assets.font.name : 'Roboto' }}/>
                                                    </Button>
                                                }
                                            </>
                                    }

                                </div>
                                <div className={classes.cardDiv}>
                                    <img alt={'image'} src={GENERAL_SETTINGS.STATIC_URL + item?.fileurl} className={classes.cardImage}  />
                                </div>
                                <ThumbnailSliderModal open={isOpenSlider} slider={sliderGallery} sliderTitle={sliderTitle} sliderDesc={sliderDescription} sliderCta={sliderCta} onClose={(e)=> setIsOpenSlider(e)} sliderImages={filteredImages} />
                            </div>
                        )
                    })}
                </Slider>
            }
        </>
    )
}

const memorizedWebsiteSliderGallery = memo(WebsiteSliderGallery)

export default memorizedWebsiteSliderGallery