import React, {useContext, useEffect, useState} from "react";
import {ViewList} from "@webcms/orest";
import {isErrorMsg, OREST_ENDPOINT} from "../../../../../../../model/orest/constants";
import {toast} from "react-toastify";
import WebCmsGlobal from "components/webcms-global";
import {useRouter} from "next/router";
import LoadingSpinner from "../../../../../../LoadingSpinner";
import {COLORS} from "../../../../constants";
import Slider from 'react-slick';
import {makeStyles} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { useSelector } from 'react-redux'

const useStyles = makeStyles(() => ({
    cardRoot: {
        width: '100%',
        display: 'flex !important',
        position: 'relative'
    },
    textDiv: {
        float: "left",
        width: '50%',
    },
    heading: {
        letterSpacing: 2,
        marginBottom: 30,
        color: props => props?.textColor ? props.textColor : "#000000"
    },
    cardDiv: {
        display: "inline-block",
        width: '50%',
    },
    cardImage: {
        width: '100%',
        height: '40vh',
        borderRadius: 5
    },
    description: {
        color: props => props?.textColor ? props.textColor : "#000000"
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
}));

const SliderGallery = (props) => {

    const { sliderGallery, otherLangSliderGallery } = props
    const [localState, setLocalState] = useState({
        isRequestSend: false,
        sliderImages: [],
    });
    const {GENERAL_SETTINGS, token} = useContext(WebCmsGlobal);
    const state = useSelector(state => state?.formReducer?.pageBuilder);
    const router = useRouter();
    // const token = useSelector((state) => state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : router.query.authToken)
    const companyId = router.query.companyID || GENERAL_SETTINGS.HOTELREFNO;
    const authToken = token || router.query.authToken;

    const classes = useStyles(sliderGallery);
    const settings = {
        dots: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
    }

    const { isRequestSend, sliderImages } = localState;

    useEffect(() => {
         (sliderGallery?.gid) && fetchGalleryData(sliderGallery.gid);
    }, [sliderGallery]);

    const fetchGalleryData = (gid) => {
        setLocalState(prev => ({...prev, isRequestSend: true}));
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMITEMSLD,
            token: authToken,
            params: {
                query: `gid:${gid}`,
                chkselfish: false,
                hotelrefno:  Number(companyId)
            }
        }).then(res => {
            if (res?.status === 200) {
                if (res?.data?.data?.length > 0) {
                    ViewList({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.HCMITEMIMG,
                        token: authToken,
                        params: {
                            query: `sliderid:${res.data.data[0]?.id}`,
                            sort: 'orderno',
                            hotelrefno:  Number(companyId)
                        }
                    }).then(res1 => {
                        if (res1?.status === 200) {
                            if (res1?.data?.data?.length > 0) {
                                let updatedImages = [];
                                res1.data.data.map(data => {
                                    updatedImages.push(data);
                                });
                                setLocalState(prev => ({...prev, sliderImages: updatedImages, isRequestSend: false}));
                            } else {
                                setLocalState(prev => ({...prev, isRequestSend: false}));
                                toast.warn('Images not found', {
                                    position: toast.POSITION.TOP_RIGHT
                                });
                            }
                        } else {
                            setLocalState(prev => ({...prev, isRequestSend: false}));
                            const retErr = isErrorMsg(res1);
                            toast.error(retErr.errorMsg, {
                                position: toast.POSITION.TOP_RIGHT
                            });
                        }
                    })
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

    if (isRequestSend) {
        return <LoadingSpinner size={40} style={{color: COLORS?.secondary}} />
    }

    return (
        <>
            <Slider {...settings}>
                {sliderImages.map((item, i) => {

                    return (
                        <div key={i} className={classes.cardRoot} >
                            <div className={classes.textDiv}>
                                <div className={classes.heading} >
                                    <div dangerouslySetInnerHTML={{__html: state.langCode === state?.defaultLang ? item.title : otherLangSliderGallery?.length > 0 && otherLangSliderGallery[i]?.title}}></div>
                                    <span className={classes.line}></span>
                                </div>
                                <div className={classes.description}>
                                    <div dangerouslySetInnerHTML={{__html: state?.langCode === state?.defaultLang ? item.description : otherLangSliderGallery?.length > 0 && otherLangSliderGallery[i]?.description}}></div>
                                </div>
                                {
                                    item?.cta &&
                                    <div style={{position: 'absolute',
                                        left: `${item?.alignhor === '0000192' ? '16.5%' : (item?.alignhor === '0000190' && 0)}`,
                                        top: `${(item?.alignver === '0000182' && '50%')}`,
                                        bottom: `${item?.alignver === '0000184' ? 0 : (item?.alignver === '0000182' && '50%')}`,
                                        right: `${(item?.alignhor === '0000194' && '52%')}`}}>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            color="primary"
                                            aria-label="add"
                                            className={classes.ctaButton}
                                        >
                                            <div style={{fontFamily: state?.assets?.font?.name ? state.assets.font.name : 'Roboto'}}
                                                dangerouslySetInnerHTML={{__html: state?.langCode === state?.defaultLang ? item?.cta : otherLangSliderGallery?.length > 0 && otherLangSliderGallery[i]?.cta}}></div>
                                        </Button>
                                    </div>
                                }
                            </div>
                            <div className={classes.cardDiv}>
                                <img alt={'image'} src={GENERAL_SETTINGS.STATIC_URL + item?.fileurl} className={classes.cardImage}  />
                            </div>
                        </div>
                    )
                })}
            </Slider>
        </>
    )
}

export default SliderGallery;