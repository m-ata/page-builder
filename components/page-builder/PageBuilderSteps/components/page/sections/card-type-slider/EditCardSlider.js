import React, {useContext, useEffect, useState} from 'react';
import {Delete, Insert, Patch, UseOrest, ViewList} from "@webcms/orest";
import {
    FIELDTYPE,
    isErrorMsg,
    OREST_ENDPOINT,
    OREST_UPLOAD,
    REQUEST_METHOD_CONST
} from "../../../../../../../model/orest/constants";
import {toast} from "react-toastify";
import WebCmsGlobal from "components/webcms-global";
import {useRouter} from "next/router";
import {makeStyles} from "@material-ui/core/styles";
import {COLORS, DELETE_SUCCESS, PERCENTAGE_VALUES, SAVED_SUCCESS, UPLOAD_SUCCESS} from "../../../../constants";
import Grid from "@material-ui/core/Grid";
import {
    Button,
    Card,
    Container,
    Divider, FormControl,
    FormControlLabel,
    IconButton,
    Paper, Radio, RadioGroup,
    TextField,
    Typography
} from "@material-ui/core";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import CancelIcon from "@material-ui/icons/Cancel";
import Switch from "@material-ui/core/Switch";
import validator from "validator";
import {DropzoneDialog} from "material-ui-dropzone";
import LoadingSpinner from "../../../../../../LoadingSpinner";
import axios from "axios";
import {useSelector} from "react-redux";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";
import Checkbox from "@material-ui/core/Checkbox";
import {PercentageSlider} from "../../../../../../../model/slider";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import {getSliderImages, patchListSliderImage} from "../../../../helpers/slider";
import InputColor from "react-input-color";
import TextEditor from "../text-editor";
import BorderColorSharpIcon from "@material-ui/icons/BorderColorSharp";
import { toSelfName } from './../../../../../../../lib/helpers/useFunction';
import moment from "moment";
import {DatePicker, LocalizationProvider} from "@material-ui/pickers";
import MomentAdapter from "@date-io/moment";

const useStyles = makeStyles(theme => ({
    submit: {
        marginRight: theme.spacing(3),
        marginTop: theme.spacing(1),
        borderRadius: 20,
        float: "right"
    },
    paperBlock: {
        height: 350,
        border: `2px solid ${COLORS?.secondary}`,
        overflow: "auto"
    },
    disableEvent: {
        pointerEvents: "none",
        opacity: 0.5
    },
    uploadButton: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        marginLeft: theme.spacing(1),
        borderRadius: 20,
        float: 'right'
    },
    card: {
        height: 200,
        width: 320,
        margin: theme.spacing(1),
        cursor: "pointer"
    },
    alignText: {
        textAlign: "right",
        color: "red"
    },
    text: {
        marginTop: 16,
        fontWeight: "bold",
        fontSize: 15
    },
    alignRight: {
        float: 'right'
    }
}));

const EditCardSlider = (props) => {

    const { cardSlider, handleCmponent, langCardSlider } = props;

    const [localState, setLocalState] = useState({
        isRequested: false,
        openDialog: false,
        title: '',
        description: '',
        selectedIndex: null,
        hoverIndex: null,
        showDeleteButton: false,
        itemCount: 1,
        sliderID: null,
        sliderImages: [],
        selectedImage: null,
        isCta: false,
        ctaTitle: '',
        ctaLink: '',
        cta: '',
        isOptimizeImages: false,
        quality: 50,
        ctaLinkType: '',
        pageData: [],
        langCardSliderData: [],
        textColor: cardSlider?.textColor ? cardSlider.textColor : '#000000',
        buttonColor: cardSlider?.buttonColor ? cardSlider.buttonColor : '#000000',
        isDialogOpen: false,
        editorValue: '',
        dialogType: '',
    });
    const [expireDate, setExpireDate] = useState('')

    const { isRequested, openDialog, description, title, selectedIndex,
        hoverIndex, showDeleteButton, itemCount, sliderID, sliderImages,
        selectedImage, isCta, ctaLink, ctaTitle, cta, quality, isOptimizeImages,
        ctaLinkType, pageData, langCardSliderData, buttonColor, textColor,
        isDialogOpen, dialogType, editorValue} = localState;

    const state = useSelector(state => state.formReducer.pageBuilder);

    const classes = useStyles();

    const router = useRouter();
    const companyId = router.query.companyID;
    const {GENERAL_SETTINGS, token} = useContext(WebCmsGlobal);
    const authToken = token || router.query.authToken;

    useEffect(() => {
        //getting data from rafile
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token: authToken,
            params: {
                hotelrefno: Number(companyId),
                query: `filetype::WEBPAGE,istemplate::false}`,
            }
        }).then(res => {
            if (res.status === 200 && res?.data?.data) {
                setLocalState(prev => ({...prev, pageData: res.data.data}))
            } else {
                const retErr = isErrorMsg(res);
                toast.error(retErr.errorMsg, {
                    position: toast.POSITION.TOP_RIGHT
                });
            }
        })
    }, []);

    useEffect(() => {
        if (state?.langCode === state?.defaultLang) {
            handleCmponent({
                service: "hcmitemsld",
                type: "card-slider",
                gid: cardSlider?.gid,
                width: cardSlider?.width,
                id: cardSlider?.id,
                textColor: textColor,
                buttonColor: buttonColor
            });
        } else {
            handleCmponent({
                cardSlider: langCardSliderData
            })
        }
    }, [sliderImages, title, description, cta, langCardSliderData, textColor, buttonColor]);

    useEffect(() => {
        if (cardSlider?.gid) {
            setLocalState(prev => ({...prev, isRequested: true}))
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMSLD,
                token: authToken,
                params: {
                    query: `gid:${cardSlider.gid}`,
                    hotelrefno:  Number(companyId)
                }
            }).then(async res => {
                if (res?.status === 200) {
                    setLocalState(prev => ({...prev, sliderID: res?.data?.data[0]?.id}));
                    setExpireDate(res?.data?.data[0]?.expiredt);
                    const sldImages = await getSliderImages(GENERAL_SETTINGS.OREST_URL, authToken, companyId, res?.data?.data[0]?.id);
                    sldImages.sort((a, b) => (a.orderno > b.orderno) ? 1 : -1);
                    setLocalState(prev => ({...prev, isRequested: false}));
                    if (sldImages) {
                        let updatedImages = [];
                        sldImages.map((data) => {
                            updatedImages.push(data);
                        });
                        setLocalState(prev => ({...prev, sliderImages: updatedImages, itemCount: updatedImages.length + 1, openDialog: false}));
                        handleSelectedImage(1, updatedImages[0]);
                    } else {
                        toast.warn('Something went wrong while fetching images. Please check network tab.', {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    }
                } else {
                    const retErr = isErrorMsg(res);
                    setLocalState(prev => ({...prev, isRequested: false}))
                    toast.error(retErr.errorMsg, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
            })
        }
    }, [cardSlider]);

    useEffect(() => {
        if(ctaTitle && ctaLink) {
            setLocalState(prev => ({...prev, cta: `<a target="_blank" href="${ctaLink}" > ${ctaTitle} </a>`}));
        }
    }, [ctaTitle, ctaLink]);

    useEffect(() => {
        if (langCardSlider?.cardSlider) {
            setLocalState(prev => ({...prev, langCardSliderData: langCardSlider.cardSlider}))
        }
    }, [langCardSlider]);

    const handleSelectedImage = (index, image) => {
        setLocalState(prev => ({...prev, selectedIndex: index, selectedImage: image}));
        if (state?.langCode === state?.defaultLang) {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMIMG,
                token: authToken,
                params: {
                    query: `gid:${image.gid}`,
                    sort: 'orderno',
                    hotelrefno:  Number(companyId)
                }
            }).then(res => {
                if (res?.status === 200) {
                    if (res?.data?.data?.length > 0) {
                        setLocalState(prev => ({...prev, title: res.data.data[0]?.title ? res.data.data[0]?.title : '',
                            description: res.data.data[0]?.description ? res.data.data[0]?.description : '',
                            cta: res.data.data[0]?.cta}));
                        if (res.data.data[0].cta) {
                            setLocalState(prev => ({...prev, isCta: true}));
                            const matchs = res.data.data[0].cta.match(/\bhttps?:\/\/\S+/gi)
                            if (matchs?.length > 0) {
                                const cta_title = res.data.data[0].cta.replace(`<a target="_blank" href="`,
                                    '').replace(matchs[0], '').replace('>',
                                    '').replace('</a>', '').trim();
                                setLocalState(prev => ({...prev, ctaLink: matchs[0], ctaTitle: cta_title, ctaLinkType: 'external'}));
                            } else {
                                const ctaGid = res.data.data[0].cta.replace(`<a target="_blank" href="`,
                                    '').replace('>',
                                    '').replace('</a>', '').replace('"', '').trim()?.split(' ')[0];
                                const cta_title = res.data.data[0].cta.replace(`<a target="_blank" href="`,
                                    '').replace(ctaGid + '"', '').replace('>',
                                    '').replace('</a>', '').trim();
                                setLocalState(prev => ({...prev, ctaLink: ctaGid, ctaTitle: cta_title, ctaLinkType: 'internal'}));
                            }
                        } else {
                            setLocalState(prev => ({...prev, ctaLink: '', ctaTitle: '', isCta: false}));
                        }
                    }
                } else {
                    const retErr = isErrorMsg(res);
                    toast.error(retErr.errorMsg, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
            })
        } else {
            if (langCardSliderData?.length > 0) {
                setLocalState(prev => ({...prev, title: langCardSliderData[index - 1]?.title,
                    description: langCardSliderData[index - 1]?.description}))
                if (langCardSliderData[index - 1]?.cta) {
                    setLocalState(prev => ({...prev, isCta: true}));
                    const matchs = langCardSliderData[index - 1].cta.match(/\bhttps?:\/\/\S+/gi);
                    if (matchs?.length > 0) {
                        const cta_title = langCardSliderData[index - 1].cta.replace(`<a target="_blank" href="`,
                            '').replace(matchs[0], '').replace('>',
                            '').replace('</a>', '').trim();
                        setLocalState(prev => ({...prev, ctaLink: matchs[0], ctaTitle: cta_title, ctaLinkType: 'external'}));
                    } else {
                        const ctaGid = langCardSliderData[index - 1].cta.replace(`<a target="_blank" href="`,
                            '').replace('>',
                            '').replace('</a>', '').replace('"', '').trim()?.split(' ')[0];
                        const cta_title = langCardSliderData[index - 1].cta.replace(`<a target="_blank" href="`,
                            '').replace(ctaGid + '"', '').replace('>',
                            '').replace('</a>', '').trim();
                        setLocalState(prev => ({...prev, ctaLink: ctaGid, ctaTitle: cta_title, ctaLinkType: 'internal'}));
                    }
                } else {
                    setLocalState(prev => ({...prev, ctaLink: '', ctaTitle: '', isCta: false}));
                }
            } else {
                setLocalState(prev => ({...prev, title: langCardSlider?.cardSlider[index - 1]?.title,
                    description: langCardSlider?.cardSlider[index - 1]?.description }))   ;
                if (langCardSlider?.cardSlider[0]?.cta) {
                    setLocalState(prev => ({...prev, isCta: true}));
                    const matchs = langCardSlider?.cardSlider[0].cta.match(/\bhttps?:\/\/\S+/gi)
                    if (matchs?.length > 0) {
                        const cta_title = langCardSlider?.cardSlider[0].cta.replace(`<a target="_blank" href="`,
                            '').replace(matchs[0], '').replace('>',
                            '').replace('</a>', '').trim();
                        setLocalState(prev => ({...prev, ctaLink: matchs[0], ctaTitle: cta_title, ctaLinkType: 'external'}));
                    } else {
                        const ctaGid = langCardSlider?.cardSlider[0].cta.replace(`<a target="_blank" href="`,
                            '').replace('>',
                            '').replace('</a>', '').replace('"', '').trim()?.split(' ')[0];
                        const cta_title = langCardSlider?.cardSlider[0].cta.replace(`<a target="_blank" href="`,
                            '').replace(ctaGid + '"', '').replace('>',
                            '').replace('</a>', '').trim();
                        setLocalState(prev => ({...prev, ctaLink: ctaGid, ctaTitle: cta_title, ctaLinkType: 'internal'}));
                    }
                } else {
                    setLocalState(prev => ({...prev, ctaLink: '', ctaTitle: '', isCta: false}));
                }
            }
        }
    }

    const ImageUpload = (apiUrl, endPoint, token, masterID, file) => {
        const url = apiUrl + '/' + endPoint + OREST_UPLOAD;
        let binaryData = [];
        binaryData.push(file);
        let formData = new FormData();
        formData.append('file', new Blob(binaryData, {type: file.type}), toSelfName(file.name));

        const options = {
            url: url,
            method: 'post',
            headers: {
                "Authorization": `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            },
            params: {
                orsactive: true,
                masterid: masterID,
                hotelrefno: companyId,
                quality: quality/100,
                scale: quality/100
            },
            data: formData
        };

        return axios(options).then(response => {
            return response
        }).catch(error => {
            return error.response || {status: 0};
        });
    };

    const asyncUpload = (file, itemTreated, callback) => {
        if (state.hcmItemId) {
            setTimeout(() => {
                Insert({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.HCMITEMIMG,
                    token: authToken,
                    data: {
                        itemid: state.hcmItemId,
                        imgtype: FIELDTYPE.IMG,
                        orderno: itemTreated,
                        sliderid: sliderID,
                        hotelrefno: Number(companyId),
                        imgquality: quality/100,
                        imgscale: quality/100
                    },
                }).then(r1 => {
                    if (r1.status === 200 && r1?.data?.data) {
                        let updatedImages = [...sliderImages];
                        updatedImages.push(r1?.data?.data);
                        ImageUpload(
                            GENERAL_SETTINGS.OREST_URL,
                            OREST_ENDPOINT.RAFILE,
                            authToken,
                            r1.data.data.mid,
                            file
                        ).then(r => {
                            if (r.status === 200) {
                                callback();
                            } else {
                                callback();
                            }
                        });
                    } else {
                        callback();
                    }
                });
            }, 100);
        }
    }

    const handleSaveImage = (files) => {
        setLocalState(prev => ({...prev, isRequested: true}))
        let orderNo = itemCount;
        let requests = files.map((file) => {
            return new Promise( (resolve) => {
                asyncUpload(file, orderNo, resolve);
                orderNo ++ ;
            });
        });

        Promise.all(requests).then(async () => {
            const sldImages = await getSliderImages(GENERAL_SETTINGS.OREST_URL, authToken, companyId, sliderID);
            sldImages.sort((a, b) => (a.orderno > b.orderno) ? 1 : -1)
            setLocalState(prev => ({...prev, isRequested: false}));
            if (sldImages) {
                let updatedImages = [];
                sldImages.map((data) => {
                    updatedImages.push(data);
                });
                setLocalState(prev => ({...prev, sliderImages: updatedImages, itemCount: updatedImages.length + 1, openDialog: false}));
                handleSelectedImage(1, updatedImages[0]);
                toast.success(UPLOAD_SUCCESS, {
                    position: toast.POSITION.TOP_RIGHT
                });
            } else {
                setLocalState(prev => ({...prev, isRequestSend: false}));
                toast.warn('Images not found', {
                    position: toast.POSITION.TOP_RIGHT
                });
            }
        });
    }

    const handleDeleteImage = (gid) => {
        setLocalState(prev => ({...prev, isRequested: true}))
        Delete({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMITEMIMG,
            token: authToken,
            gid: gid,
            params: {
                hotelrefno: Number(companyId)
            }
        }).then(async res => {
            if (res.status === 200) {
                const sldImages = await getSliderImages(GENERAL_SETTINGS.OREST_URL, authToken, companyId, sliderID);
                sldImages.sort((a, b) => (a.orderno > b.orderno) ? 1 : -1)
                setLocalState(prev => ({...prev, isRequested: false}));
                if (sldImages) {
                    let updatedImages = [];
                    sldImages.map((data, index) => {
                        data.orderno = index + 1;
                        updatedImages.push(data);
                    });
                    let requestPassed = true;
                    for (const sldImage of sldImages) {
                        const updatedSliderImage = patchListSliderImage(GENERAL_SETTINGS.OREST_URL, authToken, companyId, {orderno: sldImage.orderno}, {hotelrefno: Number(companyId)}, sldImage.gid);
                        updatedSliderImage ? requestPassed = true : requestPassed = false;
                    }
                    if (requestPassed) {
                        setLocalState(prev => ({...prev, sliderImages: updatedImages, selectedIndex: 1}));
                        handleSelectedImage(1, updatedImages[0]);
                    } else {
                        setLocalState(prev => ({...prev, selectedIndex: null}));
                    }
                    toast.success(DELETE_SUCCESS, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                } else {
                    setLocalState(prev => ({...prev, isRequestSend: false}));
                    toast.warn('Images not found', {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
            } else {
                const retErr = isErrorMsg(res);
                setLocalState(prev => ({...prev, isRequested: false}))
                toast.error(retErr.errorMsg, {
                    position: toast.POSITION.TOP_RIGHT
                });
            }
        });
    }

    const handleUpdateImage = () => {
        setLocalState(prev => ({...prev, isRequested: true}));
        if (state?.langCode === state?.defaultLang) {
            Patch({ // update image
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMIMG,
                token: authToken,
                gid: selectedImage?.gid,
                params: {
                    hotelrefno: Number(companyId),
                },
                data: {
                    title: title,
                    description: description,
                    cta: cta
                }
            }).then(res => {
                if(res.status === 200) {
                    setLocalState(prev => ({...prev, isRequested: false}));
                    toast.success(SAVED_SUCCESS, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                } else {
                    setLocalState(prev => ({...prev, isRequested: false}));
                    const retErr = isErrorMsg(res);
                    toast.error(retErr.errorMsg, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
            })
        } else {
            const updatedlangCardSliderData = [...langCardSliderData];
            updatedlangCardSliderData[selectedIndex - 1] = {
                title: title,
                description: description,
                cta: cta
            }
            setLocalState(prev => ({...prev, langCardSliderData: updatedlangCardSliderData}));
            setLocalState(prev => ({...prev, isRequested: false}));
            toast.success(SAVED_SUCCESS, {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    }

    const handleUpdateOrderNo = async (gid, orderNo, orderType) => { // update order no of slider images
        if (orderNo <= 0 || orderNo > sliderImages.length) {
            setLocalState(prev => ({...prev, selectedIndex: null}))
        } else {
            const tmpSliderImages = [...sliderImages];
            if (orderType === 'increment') {
                const tmp = tmpSliderImages[orderNo - 1];
                tmpSliderImages[orderNo - 1] = tmpSliderImages[orderNo - 2];
                tmpSliderImages[orderNo - 2] = tmp;
            } else {
                const tmp = tmpSliderImages[orderNo - 1];
                tmpSliderImages[orderNo - 1] = tmpSliderImages[orderNo];
                tmpSliderImages[orderNo] = tmp;
            }
            tmpSliderImages.map((data, index) => {
                data.orderno = index + 1;
            });
            setLocalState(prev => ({...prev, isRequested: true}));
            let requestPassed = true;
            for (const sldImage of tmpSliderImages) {
                const updatedSliderImage = patchListSliderImage(GENERAL_SETTINGS.OREST_URL, authToken, companyId, {orderno: sldImage.orderno}, {hotelrefno: Number(companyId)}, sldImage.gid);
                updatedSliderImage ? requestPassed = true : requestPassed = false;
            }
            setLocalState(prev => ({...prev, isRequested: false}));
            if (requestPassed) {
                setLocalState(prev => ({...prev, sliderImages: tmpSliderImages, itemCount: tmpSliderImages?.length + 1}));
                handleSelectedImage(1, tmpSliderImages[0]);
                toast.success('Order No Updated Successfully', {
                    position: toast.POSITION.TOP_RIGHT
                });
            } else {
                toast.error('Something went wrong while updating order no. Please check network tab.', {
                    position: toast.POSITION.TOP_RIGHT
                });
            }
        }
    }

    const handleImageQualityChange = (value) => {
        if (value >= 10 && value <= 90 && value % 10 === 0) {
            if (sliderImages.length) {
                setLocalState(prev => ({...prev, isRequested: true}));
                const gids = sliderImages.map(image => {
                    return {gid: image.gid, imgquality: value / 100, imgscale: value / 100};
                });
                UseOrest({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.HCMITEMIMG + '/' + OREST_ENDPOINT.LIST + '/' + OREST_ENDPOINT.PATCH,
                    token: authToken,
                    method: REQUEST_METHOD_CONST.PATCH,
                    data: gids,
                    params: {
                        hotelrefno: Number(companyId),
                    },
                }).then(res => {
                    if (res?.status === 200 && res?.data?.data) {
                        setLocalState(prev => ({...prev, isRequested: false, quality: value}))
                    } else {
                        const retErr = isErrorMsg(res);
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    }
                })
            } else {
                setLocalState(prev => ({...prev, quality: value}))
            }
        }
    }

    const handleTextEditorValue = (value) => {
        if (dialogType === 'title') {
            setLocalState(prev => ({...prev, title: value}));
        }
        if (dialogType === 'description') {
            setLocalState(prev => ({...prev, description: value}));
        }
        setLocalState(prev => ({...prev, isDialogOpen: false, dialogType: '', editorValue: ''}));
    }

    const handleCancelEditor = () => {
        setLocalState(prev => ({...prev, isDialogOpen: false, dialogType: '', editorValue: ''}));
    }

    const handleDialogOpen = (type) => {
        if (type === 'title') {
            setLocalState(prev => ({...prev, isDialogOpen: true, dialogType: type, editorValue: title}));
        }
        if (type === 'description') {
            setLocalState(prev => ({...prev, isDialogOpen: true, dialogType: type, editorValue: description}));
        }
    }

    const handleChangeDatePicker = (date) => {
        const dateValue = moment(date).format(OREST_ENDPOINT.DATEFORMAT_LOCALE);

        if (dateValue !== 'Invalid date') {
            setLocalState({...localState, isRequested: true});
            Patch({
                // update slider
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMSLD,
                token: authToken,
                gid: cardSlider?.gid,
                params: {
                    hotelrefno: Number(companyId),
                },
                data: {
                    expiredt: dateValue,
                },
            }).then((res) => {
                setLocalState({...localState, isRequested: false});
                if (res.status === 200) {
                    res?.data?.data && setExpireDate(res?.data?.data?.expiredt);
                    toast.success(SAVED_SUCCESS, {
                        position: toast.POSITION.TOP_RIGHT,
                    })
                } else {
                    console.log(res)
                }
            })
        }
    }

    if (isRequested) {
        return <LoadingSpinner size={50} style={{color: COLORS?.secondary}} />
    }

    return (
        <React.Fragment>
            <Grid container={true}>
                <Grid item xs={12}>
                    <div className={classes.alignRight}>
                        <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                            <DatePicker
                                id="sliderExpiryDate"
                                name="sliderExpiryDate"
                                label={'Select Expiry'}
                                value={expireDate}
                                inputFormat="DD/MM/YYYY"
                                disablePast
                                onChange={handleChangeDatePicker}
                                renderInput={(props) => <TextField {...props}
                                                                   variant={'filled'}
                                                                   required={true}
                                />}
                            />
                        </LocalizationProvider>
                    </div>
                </Grid>
            </Grid>
            <Grid container={true} justify={'flex-end'} className={isRequested ? classes.disableEvent : ''}  >
                <Grid item xs={5}>
                    <FormControlLabel
                        className={classes.labelFont}
                        disabled={state?.langCode !== state?.defaultLang}
                        control={
                            <Checkbox
                                size={'small'}
                                checked={isOptimizeImages}
                                onChange={() => setLocalState(prev => ({...prev, isOptimizeImages: !isOptimizeImages}))}
                                color="primary"
                            />
                        }
                        label="Optimize Images"
                    />
                </Grid>
                <Grid item xs={7} >
                    <Grid container>
                        <Grid item xs={1} style={{marginTop: 6, marginLeft: 16}}>
                            <Typography component={'span'} style={{marginLeft: -8}}>Text</Typography>
                        </Grid>
                        <Grid item xs={2} style={{marginTop: 8}}>
                            <InputColor
                                onChange={(color) => setLocalState(prevState => ({...prevState, textColor: color.hex}))}
                                placement="right"
                                initialValue={textColor}
                            />
                        </Grid>
                        <Grid item xs={2} style={{marginTop: 6}}>
                            <Typography component={'span'}>Button</Typography>
                        </Grid>
                        <Grid item xs={4} style={{marginTop: 8}}>
                            <InputColor
                                onChange={(color) => setLocalState(prevState => ({...prevState, buttonColor: color.hex}))}
                                placement="right"
                                initialValue={buttonColor}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <Button
                                onClick={() => setLocalState(prev => ({...prev, openDialog: true}))}
                                variant="contained"
                                size="small"
                                color="primary"
                                aria-label="upload"
                                className={classes.uploadButton}
                                disabled={state?.langCode !== state?.defaultLang}
                            >
                                <CloudUploadIcon />
                                UPLOAD
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            {
                isOptimizeImages && <Grid container>
                    <Grid item xs={12}>
                        <Grid container>
                            <Grid item xs={12}>
                                <PercentageSlider
                                    marks={PERCENTAGE_VALUES}
                                    value={quality}
                                    onChange={(e, value) => handleImageQualityChange(value)}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            }
            <Grid container justify={'flex-start'} spacing={3} className={isRequested ? classes.disableEvent : ''}>
                <Grid item xs={5}>
                    <Paper className={classes.paperBlock}>
                        {
                            sliderImages?.length > 0 && sliderImages.map((value, index) => {
                                return (
                                    <Grid key={index} container justify={'center'}>
                                        <Grid item={true}>
                                            <Card  className={classes.card}
                                                   style={{border: index + 1 === selectedIndex ? '2px solid red' :
                                                           `1px solid ${COLORS?.secondary}`}}>
                                                <div style={{
                                                    backgroundImage: `url(${GENERAL_SETTINGS.STATIC_URL + value.fileurl})`,
                                                    height: '100%',
                                                    width: '100%',
                                                    backgroundSize: 'cover',
                                                    borderRadius: 5,
                                                }}
                                                     onMouseEnter={() => {setLocalState(prev => ({...prev, showDeleteButton: true, hoverIndex: index}))}}
                                                     onMouseLeave={() => {setLocalState(prev => ({...prev, showDeleteButton: false, hoverIndex: index}))}}
                                                     onClick={() => handleSelectedImage(index + 1, value)}
                                                >
                                                    {
                                                        showDeleteButton && hoverIndex === index && <IconButton
                                                            disabled={isRequested}
                                                            component="span"
                                                            color={'primary'}
                                                            className={index === sliderImages.length - 1 || state?.langCode !== state?.defaultLang ? classes.disableEvent : ''}
                                                            onClick={() => handleUpdateOrderNo(value.gid, value.orderno + 1, 'increment')}
                                                        >
                                                            <AddCircleIcon />
                                                        </IconButton>
                                                    }
                                                    {
                                                        showDeleteButton && hoverIndex === index && <Typography
                                                            component="span"
                                                            color={'primary'}
                                                        >
                                                            {value.orderno}
                                                        </Typography>
                                                    }
                                                    {
                                                        showDeleteButton && hoverIndex === index && <IconButton
                                                            disabled={isRequested}
                                                            component="span"
                                                            color={'primary'}
                                                            className={index === 0 || state?.langCode !== state?.defaultLang ? classes.disableEvent : ''}
                                                            onClick={() => handleUpdateOrderNo(value.gid, value.orderno - 1, 'decrement')}
                                                        >
                                                            <RemoveCircleIcon />
                                                        </IconButton>
                                                    }
                                                    {
                                                        showDeleteButton && hoverIndex === index && <IconButton
                                                            onClick={() => handleDeleteImage(value.gid)}
                                                            disabled={isRequested || state?.langCode !== state?.defaultLang}
                                                            aria-label="upload picture"
                                                            component="span"
                                                            style={{float: "right"}}
                                                            color={'primary'}
                                                        >
                                                            <CancelIcon/>
                                                        </IconButton>
                                                    }
                                                </div>
                                            </Card>
                                        </Grid>
                                    </Grid>
                                )
                            })
                        }
                    </Paper>
                </Grid>
                <Grid item xs={7}>
                    <Paper className={classes.paperBlock}>
                        {
                            selectedIndex &&
                            <>
                                <Container>
                                    <Grid container justify={'flex-start'}>
                                        <Grid item xs={3}>
                                            <Typography
                                                component={'h6'}
                                                variant={'h6'}
                                                className={classes.text}
                                            >
                                                Title
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={9}>
                                            <IconButton
                                                aria-label="Edit Title"
                                                color="primary"
                                                onClick={() => handleDialogOpen('title')}
                                                style={{float: 'right'}}
                                            >
                                                <BorderColorSharpIcon color="primary"/>
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Container>
                                <Container>
                                    <Grid container justify={'flex-start'}>
                                        <Grid item xs={3}>
                                            <Typography
                                                component={'h6'}
                                                variant={'h6'}
                                                className={classes.text}
                                            >
                                                Description
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={9}>
                                            <IconButton
                                                aria-label="Edit Title"
                                                color="primary"
                                                onClick={() => handleDialogOpen('description')}
                                                style={{float: 'right'}}
                                            >
                                                <BorderColorSharpIcon color="primary" />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Container>
                                <Container>
                                    <Grid container justify={'flex-start'}>
                                        <Grid item xs={11}>
                                            <Typography
                                                component={'h6'}
                                                variant={'h6'}
                                                className={classes.text}
                                            >
                                                Do you want to add button for image ?
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={1} >
                                            <Typography component={'div'} style={{marginTop: 20}}>
                                                <Switch
                                                    size={'small'}
                                                    checked={isCta}
                                                    onChange={() => {
                                                        setLocalState(prev => ({...prev, cta: '', isCta: !isCta, ctaTitle: '', ctaLink: ''}))
                                                    }}
                                                    disabled={state?.langCode !== state?.defaultLang}
                                                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                                                    color={'primary'}
                                                />
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Container>
                                {
                                    isCta &&
                                    <Container>
                                        <Grid container>
                                            <FormControl component="fieldset" disabled={state?.langCode !== state?.defaultLang}>
                                                <RadioGroup aria-label="link-type" row value={ctaLinkType} onChange={(e) => {
                                                    const { value } = e?.target;
                                                    setLocalState(prev => ({...prev, ctaLinkType: value, ctaLink: value === 'internal' ? pageData[0]?.code : ''}));
                                                }}>
                                                    <FormControlLabel value="external" control={<Radio color={'primary'} size={'small'} />} label="External Link" />
                                                    <FormControlLabel value="internal" control={<Radio color={'primary'} size={'small'} />} label="Internal Link" />
                                                </RadioGroup>
                                            </FormControl>
                                        </Grid>
                                        <Grid container justify={'flex-start'} spacing={3}>
                                            <Grid item xs={6}>
                                                <TextField
                                                    size={'small'}
                                                    id="button-title"
                                                    variant={"outlined"}
                                                    label={'Title'}
                                                    value={ctaTitle}
                                                    fullWidth
                                                    onChange={(e) => setLocalState(prev => ({...prev, ctaTitle: e?.target?.value}))}
                                                    style={{marginTop: 8}}
                                                    helperText={
                                                        ctaTitle && <Typography
                                                            variant="caption"
                                                            className={classes.alignText}
                                                            display="block"
                                                        >
                                                            { `${ctaTitle?.length} < 100` }
                                                        </Typography>
                                                    }
                                                    inputProps={{maxLength: 99}}
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                {
                                                    ctaLinkType === 'external' ?
                                                        <TextField
                                                            size={'small'}
                                                            id="button-link"
                                                            variant={"outlined"}
                                                            label={'Link'}
                                                            value={ctaLink}
                                                            error={ctaLink ? !validator.isURL(ctaLink) : false}
                                                            onChange={(e) => setLocalState(prev => ({
                                                                ...prev,
                                                                ctaLink: e?.target?.value
                                                            }))}
                                                            style={{marginTop: 8}}
                                                            fullWidth
                                                            helperText={
                                                                ctaLink && <Typography
                                                                    variant="caption"
                                                                    className={classes.alignText}
                                                                    display="block"
                                                                >
                                                                    {`${ctaLink?.length} < 100`}
                                                                </Typography>
                                                            }
                                                            disabled={state?.langCode !== state?.defaultLang}
                                                            inputProps={{maxLength: 99}}
                                                        />
                                                        :
                                                        <FormControl variant="outlined"
                                                                     size={'small'}
                                                                     style={{marginTop: 8}}
                                                                     fullWidth
                                                                     disabled={state?.langCode !== state?.defaultLang}
                                                        >
                                                            <Select
                                                                value={ctaLink}
                                                                onChange={(e) => {
                                                                    const {value} = e?.target;
                                                                    setLocalState(prev => ({...prev, ctaLink: value}))
                                                                }}
                                                                label="Web Pages"
                                                            >
                                                                {
                                                                    pageData.map((option, index) => {
                                                                        return (
                                                                            <MenuItem value={option.code} key={index}>
                                                                                {' '}
                                                                                {option.code}{' '}
                                                                            </MenuItem>
                                                                        )
                                                                    })
                                                                }
                                                            </Select>
                                                        </FormControl>
                                                }
                                            </Grid>
                                        </Grid>
                                    </Container>
                                }
                                <Divider style={{marginTop: 8}} />
                                <Button
                                    onClick={handleUpdateImage}
                                    variant="contained"
                                    size="small"
                                    color="primary"
                                    aria-label="add"
                                    className={classes.submit}
                                >
                                    SUBMIT
                                </Button>
                            </>
                        }
                    </Paper>
                </Grid>
            </Grid>
            <DropzoneDialog
                open={openDialog}
                onSave={handleSaveImage}
                acceptedFiles={['image/jpeg', 'image/png', 'image/bmp']}
                showPreviews={true}
                maxFileSize={5000000}
                filesLimit={5}
                onClose={() => setLocalState(prev => ({...prev, openDialog: false}))}
            />
            {
                isDialogOpen &&
                <TextEditor
                    handleSaveTextEditor={handleTextEditorValue}
                    handleCancelTextEditor={handleCancelEditor}
                    data={editorValue}
                />
            }
        </React.Fragment>
    )
}
export default EditCardSlider