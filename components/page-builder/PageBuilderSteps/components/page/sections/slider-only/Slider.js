import React, { useContext, useEffect, useState } from 'react';
import Carousel from 'react-bootstrap/Carousel'
import { ViewList } from "@webcms/orest";
import {isErrorMsg, OREST_ENDPOINT} from "../../../../../../../model/orest/constants";
import WebCmsGlobal from "components/webcms-global";
import { useRouter } from "next/router";
import { makeStyles } from "@material-ui/core/styles";
import PrevIcon from '@material-ui/icons/KeyboardArrowLeft';
import NextIcon from '@material-ui/icons/KeyboardArrowRight';
import {Typography, Button} from "@material-ui/core";
import LoadingSpinner from "../../../../../../LoadingSpinner";
import {toast} from "react-toastify";
import {COLORS} from "../../../../constants";
import {useSelector} from "react-redux";
import ThumbnailSliderModal from "../../../../../../website/pages/SliderModal";

const useStyles = makeStyles(theme => ({
    box: {
        position: "relative",
        textAlign: "center",
        color: "white"
    },
    title: {
        fontSize: 30,
        fontFamily: 'sans-serif',
        fontWeight: 'bolder',
        "-webkit-text-fill-color": "#ffffff",
        "-webkit-text-stroke-width": "0.8px",
        "-webkit-text-stroke-color": "#000000"
    },
    description: {
        fontSize: 22,
        fontFamily: 'sans-serif',
        fontWeight: 'bolder',
        "-webkit-text-fill-color": "#ffffff",
        "-webkit-text-stroke-width": "0.8px",
        "-webkit-text-stroke-color": "#000000"
    },
    ctaButton: {
        marginRight: theme.spacing(1),
        marginTop: theme.spacing(1),
        borderRadius: 20,
        backgroundColor: "white"
    },
    sliderBg: {
        border: '1px solid white',
        backgroundColor: '#FFFFFF',
        borderRadius: '50%'
    },
    sliderArrow: {
        color: "#000000",
        fontSize: 40,
    },
    cursorPointer: {
        cursor: "pointer"
    }
}))

const SliderOnlyPreview = (props) => {

    const { masterid, handleDisable } = props;
    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal);
    //local variable
    const [sliderImages, setSliderImages] = useState([]);
    const [sliderObj, setSliderObj] = useState({});
    const [isImageCta, setImageCta] = useState(false);
    const [isImageTitleDesc, setImageTitleDesc] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [ isOpenSlider, setIsOpenSlider ] = useState(false)

    const classes = useStyles();

    const router = useRouter();
    const clientToken = useSelector((state) => state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : router.query.authToken)
    const companyId = router.query.companyID || GENERAL_SETTINGS.HOTELREFNO;
    const authToken = token || clientToken || router.query.authToken;

    useEffect(() => {
        if (masterid) {
            resetSlider();
            setIsLoaded(false);
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMSLD,
                token: authToken,
                params: {
                    query: `masterid:${masterid}`,
                    chkselfish: false,
                    hotelrefno: Number(companyId)
                }
            }).then(res1 => {
                setIsLoaded(true);
                if (res1.status === 200) {
                    if (res1?.data?.data?.length > 0) {
                        setIsLoaded(false);
                        setSliderObj(res1.data.data[0]);
                        ViewList({
                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                            endpoint: OREST_ENDPOINT.HCMITEMIMG,
                            token: authToken,
                            params: {
                                query: `sliderid:${res1.data.data[0].id}`,
                                sort: 'orderno',
                                hotelrefno: Number(companyId)
                            }
                        }).then(res2 => {
                            setIsLoaded(true);
                            if (res2.status === 200) {
                                if (res2.data.data.length > 0) {
                                    let updatedImages = [];
                                    res2.data.data.map((data) => {
                                        updatedImages.push(data);
                                    });
                                    for (const img of updatedImages) {
                                        if (img.cta) setImageCta(true);
                                        if (img.title || img.description) {
                                            setImageTitleDesc(true);
                                        }
                                    }
                                    setSliderImages(updatedImages);
                                } else {
                                    toast.error('Image not found against the slider. Please add images first!', {
                                        position: toast.POSITION.TOP_RIGHT
                                    });
                                }
                            } else {
                                const retErr = isErrorMsg(res2);
                                toast.error(retErr.errorMsg, {
                                    position: toast.POSITION.TOP_RIGHT
                                });
                            }
                        })
                    } else {
                        toast.error('Slider not found against the selection. Please add slider first!', {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    }
                } else {
                    const retErr = isErrorMsg(res1);
                    toast.error(retErr.errorMsg, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
            })
        }
    }, [masterid]);

    useEffect(() => {
        if (handleDisable)
        {
            sliderImages.length > 0 ? handleDisable(false) : handleDisable(true);
        }
    }, [sliderImages]);

    const resetSlider = () => {
        setSliderImages([]);
        setSliderObj({});
        setImageCta(false);
        setImageTitleDesc(false);
    }

    return (
        <React.Fragment>
            {
                !isLoaded ? <LoadingSpinner size={40} style={{color: COLORS.secondary}} /> :
                    <Typography component={'div'}>
                    {
                        sliderImages.length > 0 &&
                            <Carousel slide={true}
                                      nextIcon={<Typography component={'div'} className={classes.sliderBg}><NextIcon
                                          className={classes.sliderArrow}/></Typography>}
                                      prevIcon={<Typography component={'div'} className={classes.sliderBg}><PrevIcon
                                          className={classes.sliderArrow}/></Typography>}
                            >
                                {
                                    sliderImages.map((image, index) => {
                                        return (
                                            <Carousel.Item key={`crousel-item-${index}`}>
                                                <div style={{
                                                    backgroundImage: `url(${GENERAL_SETTINGS.STATIC_URL + image?.fileurl})`,
                                                    minHeight: 'calc(100vh - 50vh)',
                                                    width: '100%',
                                                    backgroundSize: 'cover',
                                                    height: '100%',
                                                    cursor: 'pointer'
                                                }} onClick={()=> setIsOpenSlider(true)}></div>
                                                <Carousel.Caption>
                                                    {
                                                        isImageTitleDesc ? <>
                                                            <div className={classes.title} dangerouslySetInnerHTML={{__html: image?.title}}></div>
                                                            <div dangerouslySetInnerHTML={{__html: image?.description}}></div>
                                                        </> : <>
                                                            <div className={classes.title} dangerouslySetInnerHTML={{__html: sliderObj?.title}}></div>
                                                            <div className={classes.description} dangerouslySetInnerHTML={{__html: sliderObj?.description}}></div>
                                                        </>
                                                    }
                                                    {
                                                        isImageCta ? <div>
                                                            {
                                                                image.cta && <Button
                                                                    variant="contained"
                                                                    size="small"
                                                                    color="primary"
                                                                    aria-label="add"
                                                                    className={classes.ctaButton}
                                                                >
                                                                    <div dangerouslySetInnerHTML={{ __html: image.cta }}></div>
                                                                </Button>
                                                            }
                                                        </div> : <div>
                                                            {
                                                                sliderObj.cta && <Button
                                                                    variant="contained"
                                                                    size="small"
                                                                    color="primary"
                                                                    aria-label="add"
                                                                    className={classes.ctaButton}
                                                                >
                                                                    <div dangerouslySetInnerHTML={{ __html: sliderObj.cta }}></div>
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
                        <ThumbnailSliderModal open={isOpenSlider} sliderTitle={sliderObj?.title} sliderDesc={sliderObj?.description} onClose={(e)=> setIsOpenSlider(e)} sliderImages={sliderImages} />
                </Typography>
            }
        </React.Fragment>
    )

}

export default SliderOnlyPreview;