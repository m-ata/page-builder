import React, {useContext, useEffect, useState} from 'react';
import {ViewList} from "@webcms/orest";
import WebCmsGlobal from "components/webcms-global";
import {useRouter} from "next/router";
import {OREST_ENDPOINT} from "../../../../../../../model/orest/constants";
import {makeStyles} from "@material-ui/core/styles";
import {connect, useSelector} from "react-redux";
import LoadingSpinner from "../../../../../../LoadingSpinner";
import ThumbnailSliderModal from "../../../../../../website/pages/SliderModal";
import clsx from 'clsx'
import { COLORS } from '../../../../constants';

const useStyles = makeStyles(() => ({
    box: {
        position: "relative",
        textAlign: "center",
        color: "white",
    },
    text: {
        position: "absolute",
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 999,
        height: '100%',
        width: '100%'
    },
    textColor: {
        color: props => props?.imageComponent?.textColor ? props.imageComponent.textColor : "#000000"
    },
    image: {
        width: '100%',
        backgroundSize: "cover",
        borderRadius: 5,
        height: props => {
            if (props.sectionType === 'threecol')
                return  200
            if (props.sectionType === 'twocol')
                return 250
            if (props.sectionType === 'fullcol')
                return 'auto'
        }
    },
    cursorPointer: {
        cursor: "pointer"
    }
}))

const Image = (props) => {

    const {
        imageComponent,
        otherLangsImage,
        state,
        sectionType,
        sectionImages
    } = props;

    const {GENERAL_SETTINGS, token} = useContext(WebCmsGlobal);
    const router = useRouter();
    const clientToken = useSelector((state) => state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : router.query.authToken)
    const companyId = router.query.companyID || GENERAL_SETTINGS.HOTELREFNO;
    const classes = useStyles(props);
    const authToken = token || clientToken || router.query.authToken;
    const [ isOpenSlider, setIsOpenSlider ] = useState(false)

    const [image, setImage] = useState({});
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [cta, setCta] = useState('');
    const [isRequestSend, setRequestSend] = useState(false);
    const [sliderImages, setSliderImages] = useState(sectionImages);

    useEffect(() => {
        if(imageComponent && imageComponent.gid) {
            setRequestSend(true);
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMIMG,
                token: authToken,
                params: {
                    query: `gid:${imageComponent.gid}`,
                    chkselfish: false,
                    sort: 'orderno',
                    hotelrefno:  Number(companyId)
                }
            }).then(res => {
                setRequestSend(false);
                if (res.status === 200 && res?.data?.data?.length > 0) {
                    setImage(res.data.data[0]);
                    if (state.langCode !== state.defaultLang && otherLangsImage) {
                        setTitle(otherLangsImage?.title);
                        setDescription(otherLangsImage?.description);
                        setCta(res.data.data[0]?.cta);
                    } else {
                        setTitle(res.data.data[0]?.title);
                        setDescription(res.data.data[0]?.description);
                        setCta(res.data.data[0]?.cta);
                    }
                } else {
                    console.log(res);
                }
            });
        }
    }, [imageComponent, otherLangsImage]);

    useEffect(() => {
        if (sectionImages?.length) {
            const gid = sectionImages.map(s => s.gid);
            let updatedSliderImages = [];
            gid.map(g => {
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.HCMITEMIMG,
                    token: authToken,
                    params: {
                        query: `gid:${g}`,
                        chkselfish: false,
                        sort: 'orderno',
                        hotelrefno:  Number(companyId)
                    }
                }).then(res => {
                    if (res.status === 200) {
                        if (res?.data?.data?.length) {
                            updatedSliderImages.push(res.data.data[0]);
                            setSliderImages(updatedSliderImages)
                        }
                    }
                })
            })
        }
    }, [sectionImages]);

    if (isRequestSend) {
        return <LoadingSpinner size={40} style={{color: COLORS.secondary}} />
    }

    return (
        <>
            {
                image &&
                <div onClick={()=> {
                    if (sliderImages?.length) {
                        setIsOpenSlider(true);
                    }
                }} className={clsx({
                    [classes.box]: true,
                    [classes.cursorPointer]: sliderImages?.length,
                })}>
                    {
                        cta ? <a href={cta} target={'_blank'}>
                            <img alt={'img'} className={classes.image} src={GENERAL_SETTINGS.STATIC_URL + image?.fileurl} />
                        </a> : <img alt={'img'} className={classes.image} src={GENERAL_SETTINGS.STATIC_URL + image?.fileurl} />
                    }
                    <div className={classes.text}>
                        { title && <div className={classes.textColor} dangerouslySetInnerHTML={{__html: title}}></div> }
                        { description && <div className={classes.textColor} dangerouslySetInnerHTML={{__html: description}}></div> }
                    </div>
                </div>
            }
            <ThumbnailSliderModal open={isOpenSlider} sliderTitle={image?.title || 'Image'} sliderDesc={image?.description} onClose={(e)=> setIsOpenSlider(e)} sliderImages={sliderImages} />
        </>
    )
};

const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
};

export default connect(
    mapStateToProps,
)(Image);
