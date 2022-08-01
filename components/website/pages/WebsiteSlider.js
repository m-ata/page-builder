import React, { memo, useContext, useEffect, useState } from 'react'
import {Carousel} from 'react-bootstrap';
import WebCmsGlobal from "components/webcms-global";
import {makeStyles} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import NextIcon from "@material-ui/icons/KeyboardArrowRight";
import PrevIcon from "@material-ui/icons/KeyboardArrowLeft";
import {Typography} from "@material-ui/core";
import ThumbnailSliderModal from "./SliderModal";
import {useRouter} from "next/router";
import moment from "moment";
import {OREST_ENDPOINT} from "../../../model/orest/constants";

const useStyles = makeStyles((theme) => ({
    title: {
        "-webkit-text-fill-color": props => props?.textColor ? props.textColor : "#ffffff",
        "-webkit-text-stroke-width": "0.8px",
        "-webkit-text-stroke-color": "#000000"
    },
    description: {
        "-webkit-text-fill-color": props => props?.textColor ? props.textColor : "#ffffff",
        "-webkit-text-stroke-width": "0.8px",
        "-webkit-text-stroke-color": "#000000"
    },
    image: {
        width: '100%',
        backgroundSize: "cover"
    },
    ctaButton: {
        borderRadius: 20,
        backgroundColor: props => props?.buttonColor ? props.buttonColor : "#ffffff",
        color: props => props?.textColor ? props.textColor : "#ffffff"
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
    imageBackgroundDiv: {
        width: "100vw",
        aspectRatio: 1.77,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        [theme.breakpoints.down("sm")]: {
            height: "31vh",
        },
    },
    twoThreeColImage: {
        width: "100%",
        position: "relative",
        height: 300,
        backgroundSize:"cover",
        backgroundPosition:"center",
        backgroundRepeat:"no-repeat",
        [theme.breakpoints.down("sm")]: {
            height: 150,
        },
        cursor: "pointer"
    }
}));

const WebsiteSlider = (props) => {

    const {
        sliderData,
        otherLangSlider,
        otherLangSliderImages,
        selectedLang,
        defaultLang,
        type,
        sliderType
    } = props;

    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal);
    const [sliderImages, setSliderImages] = useState([]);
    const [sliderObj, setSliderObj] = useState({});
    const [isImageCta, setImageCta] = useState(false);
    const [isImageTitleDesc, setImageTitleDesc] = useState(false);
    const [ isOpenSlider, setIsOpenSlider ] = useState(false);
    const [ showSlider, setShowSlider ] = useState(false);
    const router = useRouter();

    const classes = useStyles(sliderData);

    useEffect(() => {
        for (const img of sliderImages) {
            if (img.cta) setImageCta(true)
        }
        if (sliderObj?.expiryDate) {
            const currentDate = moment().format(OREST_ENDPOINT.DATEFORMAT_LOCALE);
            setShowSlider(moment(sliderObj?.expiryDate).isAfter(currentDate));
        } else {
            setShowSlider(true);
        }
    }, [sliderImages, sliderObj]);

    useEffect(() => {
        if (selectedLang === defaultLang) {
            setImageCta(false);
            setImageTitleDesc(false);
            if (sliderData?.gid) {
                setSliderObj({
                    title: sliderData?.gid?.title,
                    description: sliderData?.gid?.description,
                    cta: sliderData?.gid?.cta,
                    expiryDate: sliderData?.gid?.expiryDate
                })
                if (sliderData?.gid?.images?.length) {
                    setSliderImages(sliderData.gid.images);
                    for (const image of sliderData.gid.images) {
                        if (image.cta) {
                            setImageCta(true);
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
                        if (image.title || image.description) {
                            setImageTitleDesc(true);
                        }
                    }
                }
            }
        }
        if (selectedLang !== defaultLang) {
            setSliderObj(otherLangSlider);
            if (sliderData?.gid?.images?.length > 0) {
                const updatedSliderImages = [...sliderData.gid.images];
                setSliderImages(sliderData.gid.images);
                for (const img of sliderData.gid.images) {
                    if (img?.cta) setImageCta(true);
                    if (img?.title || img?.description) {
                        setImageTitleDesc(true);
                    }
                    if (selectedLang !== defaultLang && otherLangSliderImages && otherLangSliderImages.length > 0) {
                        const index = updatedSliderImages.indexOf(img);
                        img.title = otherLangSliderImages[index] && otherLangSliderImages[index]?.title;
                        img.description = otherLangSliderImages[index] && otherLangSliderImages[index]?.description;
                        img.cta = otherLangSliderImages[index] && otherLangSliderImages[index]?.cta;
                    }
                }
            }
        }
    },[sliderData, otherLangSlider, otherLangSliderImages]);

    return(
        <>
            {
                showSlider && <Typography component={'div'}>
                    {
                        sliderImages.length > 0 &&
                        <Carousel autoPlay={false} interval={null}
                            // slide={true}
                                  nextIcon={<Typography component={'div'} className={classes.sliderBg}><NextIcon
                                      className={classes.sliderArrow}/></Typography>}
                                  prevIcon={<Typography component={'div'} className={classes.sliderBg}><PrevIcon
                                      className={classes.sliderArrow}/></Typography>}
                        >
                            {
                                sliderImages.map((image, index) => {
                                    return (
                                        <Carousel.Item key={`crousel-item-${index}`}>
                                            {
                                                type === 'fullcol' &&
                                                <div className={classes.imageBackgroundDiv}
                                                     style={{
                                                         backgroundImage: `url(${GENERAL_SETTINGS.STATIC_URL + image?.fileurl})`,
                                                     }}></div>
                                            }
                                            {
                                                (type === 'twocol' || type === 'threecol') &&
                                                <div style={{backgroundImage: `url(${GENERAL_SETTINGS.STATIC_URL}${image.fileurl})`,}}
                                                     className={classes.twoThreeColImage} onClick={()=> setIsOpenSlider(true)} />
                                            }
                                            {
                                                sliderType !== 'sliderOnly' && <Carousel.Caption>
                                                    {
                                                        isImageTitleDesc ? <>
                                                            <div className={classes.title} dangerouslySetInnerHTML={{__html: image?.title}}></div>
                                                            <div className={classes.description} dangerouslySetInnerHTML={{__html: image?.description}}></div>
                                                        </> : <>
                                                            <div className={classes.title} dangerouslySetInnerHTML={{__html: sliderObj?.title}}></div>
                                                            <div className={classes.description} dangerouslySetInnerHTML={{__html: sliderObj?.description}}></div>
                                                        </>
                                                    }
                                                    {
                                                        isImageCta ? <div>
                                                            {
                                                                image?.cta && image?.ctaLinkType === 'external' && <Button
                                                                    variant="contained"
                                                                    size="small"
                                                                    color="primary"
                                                                    aria-label="add"
                                                                    className={classes.ctaButton}
                                                                >
                                                                    <div dangerouslySetInnerHTML={{__html: image.cta}}></div>
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
                                                                    {image.ctaTitleValue || ''}
                                                                </Button>
                                                            }
                                                        </div> : <div>
                                                            {
                                                                sliderObj?.cta && <Button
                                                                    variant="contained"
                                                                    size="small"
                                                                    color="primary"
                                                                    aria-label="add"
                                                                    className={classes.ctaButton}
                                                                >
                                                                    <div dangerouslySetInnerHTML={{__html: sliderObj.cta}}></div>
                                                                </Button>
                                                            }
                                                        </div>
                                                    }
                                                </Carousel.Caption>
                                            }
                                        </Carousel.Item>
                                    )
                                })
                            }
                        </Carousel>
                    }
                    <ThumbnailSliderModal open={isOpenSlider} sliderTitle={sliderObj?.title} sliderDesc={sliderObj?.description} onClose={(e)=> setIsOpenSlider(e)} sliderImages={sliderImages} />
                </Typography>
            }
        </>
    )
}

const memorizedWebsiteSlider = memo(WebsiteSlider)

export default memorizedWebsiteSlider
