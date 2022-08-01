import React, {useContext, useEffect, useState} from 'react';
import Carousel from 'react-bootstrap/Carousel'
import {ViewList} from "@webcms/orest";
import { isErrorMsg, OREST_ENDPOINT } from '../../../../../../../model/orest/constants'
import WebCmsGlobal from "components/webcms-global";
import {useRouter} from "next/router";
import {makeStyles} from "@material-ui/core/styles";
import {connect, useSelector} from "react-redux";
import Button from "@material-ui/core/Button";
import PrevIcon from '@material-ui/icons/KeyboardArrowLeft'
import NextIcon from '@material-ui/icons/KeyboardArrowRight'
import {Typography} from "@material-ui/core";
import LoadingSpinner from "../../../../../../LoadingSpinner";
import {toast} from "react-toastify";
import {COLORS} from "../../../../constants";
import {getSliderImages} from "../../../../helpers/slider";

const useStyles = makeStyles(theme => ({
    box: {
        position: "relative",
        textAlign: "center",
        color: "white"
    },
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
        marginRight: theme.spacing(1),
        marginTop: theme.spacing(1),
        borderRadius: 20,
        backgroundColor: props => props?.buttonColor ? props.buttonColor : "#ffffff",
        '& a': {
            color: props => props?.textColor ? props.textColor : "#ffffff"
        }
    },
    sliderArrow: {
        color: "#000000",
        fontSize: 40,
    },
    sliderBg: {
        border: '1px solid white',
        backgroundColor: '#FFFFFF',
        borderRadius: '50%'
    },
}))

const Slider = (props) => {

    const {
        sliderComponent,
        slider,
        otherLangSliderImages,
        state
    } = props;
    const {GENERAL_SETTINGS, token} = useContext(WebCmsGlobal);

    //local variable
    const [sliderImages, setSliderImages] = useState([]);
    const [sliderObj, setSliderObj] = useState({});
    const [isImageCta, setImageCta] = useState(false);
    const [isImageTitleDesc, setImageTitleDesc] = useState(false);
    const [isRequestSend, setRequestSend] = useState(false);

    const classes = useStyles(sliderComponent);
    const router = useRouter();
    const clientToken = useSelector((state) => state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : router.query.authToken)
    const companyId = router.query.companyID || GENERAL_SETTINGS.HOTELREFNO;
    const authToken = token || clientToken || router.query.authToken;

    useEffect(() => {
        if(sliderComponent?.gid) {
            setImageCta(false);
            setImageTitleDesc(false);
            setRequestSend(true);
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMSLD,
                token: authToken,
                params: {
                    query: `gid:${sliderComponent.gid}`,
                    chkselfish: false,
                    hotelrefno:  Number(companyId)
                }
            }).then(async res => {
                if (res.status === 200) {
                    if (res?.data?.data?.length) {
                        setSliderObj(res.data?.data[0]);
                        if (state.langCode !== state.defaultLang) {
                            slider && setSliderObj(slider);
                        }
                        const sldImages = await getSliderImages(GENERAL_SETTINGS.OREST_URL, authToken, companyId, res.data.data[0]?.id);
                        sldImages && sldImages.sort((a, b) => (a.orderno > b.orderno) ? 1 : -1);
                        setRequestSend(false);
                        if (sldImages) {
                            for (const img of sldImages) {
                                if (img.cta) setImageCta(true);
                                if (img.title || img.description) {
                                    setImageTitleDesc(true);
                                }
                                if (state.langCode !== state.defaultLang && otherLangSliderImages && otherLangSliderImages.length > 0) {
                                    const index = sldImages.indexOf(img);
                                    img.title = otherLangSliderImages[index]?.title;
                                    img.description = otherLangSliderImages[index]?.description;
                                    img.cta = otherLangSliderImages[index]?.cta;
                                }
                            }
                            setSliderImages(sldImages);
                        } else {
                            toast.warn('Something went wrong while fetching slider images. Please check network tab.', {
                                position: toast.POSITION.TOP_RIGHT
                            });
                        }
                    } else {
                        setRequestSend(false);
                        toast.warn('No image found in slider. Please add images.', {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    }
                } else {
                    setRequestSend(false);
                    const retErr = isErrorMsg(res);
                    toast.error(retErr.errorMsg, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
            });
        }
    }, [sliderComponent, otherLangSliderImages, slider]);

    if (isRequestSend) {
        return <LoadingSpinner size={40} style={{color: COLORS.secondary}} />
    }

    return(
        <React.Fragment>
            {
                sliderImages?.length > 0 && <Carousel slide={true}
                          nextIcon={<Typography component={'div'} className={classes.sliderBg}><NextIcon
                              className={classes.sliderArrow}/></Typography>}
                          prevIcon={<Typography component={'div'} className={classes.sliderBg}><PrevIcon
                              className={classes.sliderArrow}/></Typography>}
                >
                    {
                        sliderImages.map((image, index) => {
                            return (
                                <Carousel.Item key={`crousel-item-${index}`}>
                                    <div style={{ backgroundImage: `url(${GENERAL_SETTINGS.STATIC_URL + image?.fileurl})`, height: 'calc(100vh - 25vh)', width: '100%', backgroundSize: 'cover', }}/>
                                    <Carousel.Caption>
                                        {isImageTitleDesc ? <>
                                                    <span className={classes.title}>
                                                        <div className={classes.title} dangerouslySetInnerHTML={{ __html: image?.title }}/>
                                                    </span>
                                                    <div className={classes.description}>
                                                        <div dangerouslySetInnerHTML={{ __html: image?.description }}/>
                                                    </div>
                                                </> : <>
                                                <div className={classes.title} dangerouslySetInnerHTML={{ __html: sliderObj?.title }}/>
                                                <div className={classes.description} dangerouslySetInnerHTML={{ __html: sliderObj?.description }}/>
                                            </>
                                        }
                                        {isImageCta ? <div>
                                                {
                                                    image?.cta && <Button
                                                        variant="contained"
                                                        size="small"
                                                        color="primary"
                                                        aria-label="add"
                                                        className={classes.ctaButton}
                                                    >
                                                        <div dangerouslySetInnerHTML={{ __html: image?.cta }}/>
                                                    </Button>
                                                }
                                            </div> : <div>
                                                {
                                                    sliderObj?.cta && <Button
                                                        variant="contained"
                                                        size="small"
                                                        aria-label="add"
                                                        className={classes.ctaButton}
                                                    >
                                                        <div dangerouslySetInnerHTML={{ __html: sliderObj?.cta }}/>
                                                    </Button>
                                                }
                                            </div>
                                        }
                                    </Carousel.Caption>
                                </Carousel.Item>
                            )
                        })
                    }
                </Carousel>
            }
        </React.Fragment>
    )
}

const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
};

export default connect(
    mapStateToProps,
)(Slider);
