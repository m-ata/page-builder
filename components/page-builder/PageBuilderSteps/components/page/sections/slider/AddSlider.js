import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { connect } from 'react-redux'
import 'regenerator-runtime/runtime'
import { toast } from 'react-toastify'
import validator from 'validator'
import axios from 'axios'
//material ui imports
import Card from '@material-ui/core/Card'
import IconButton from '@material-ui/core/IconButton'
import CancelIcon from '@material-ui/icons/Cancel'
import LoadingSpinner from '../../../../../../LoadingSpinner'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import { FormControlLabel, MenuItem, Radio, RadioGroup } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Switch from '@material-ui/core/Switch'
import Divider from '@material-ui/core/Divider'
import Checkbox from '@material-ui/core/Checkbox'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import FormControl from '@material-ui/core/FormControl'
import InputColor from 'react-input-color'
import { DropzoneDialog } from 'material-ui-dropzone'
//custom imports
import { PercentageSlider } from '../../../../../../../model/slider'
import { getSliderImages, patchListSliderImage } from '../../../../helpers/slider'
import TextEditor from '../text-editor'
import { COLORS, DELETE_SUCCESS, PERCENTAGE_VALUES, SAVED_SUCCESS, UPLOAD_SUCCESS } from '../../../../constants'
import {
    FIELDTYPE,
    isErrorMsg,
    OREST_ENDPOINT,
    OREST_UPLOAD,
    REQUEST_METHOD_CONST,
} from '../../../../../../../model/orest/constants'
import { Delete, Insert, Patch, UseOrest, ViewList } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import BorderColorSharpIcon from '@material-ui/icons/BorderColorSharp';
import { toSelfName } from './../../../../../../../lib/helpers/useFunction';
import { DatePicker, LocalizationProvider } from '@material-ui/pickers'
import MomentAdapter from '@date-io/moment'
import moment from 'moment';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    submit: {
        marginRight: theme.spacing(3),
        marginTop: theme.spacing(1),
        borderRadius: 20,
        float: 'right',
    },
    disableUpload: {
        pointerEvents: 'none',
        opacity: 0.5,
    },
    paperBlock: {
        height: 350,
        border: `2px solid ${COLORS?.secondary}`,
        overflow: 'auto',
    },
    disableEvent: {
        pointerEvents: 'none',
        opacity: 0.5,
    },
    uploadButton: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        marginLeft: theme.spacing(1),
        borderRadius: 20,
        float: 'right',
    },
    card: {
        height: 200,
        width: 300,
        margin: theme.spacing(1),
        cursor: 'pointer',
    },
    alignText: {
        textAlign: 'right',
        color: 'red',
    },
    text: {
        marginTop: 16,
        fontWeight: 'bold',
        fontSize: 15,
    },
    labelFont: {
        fontSize: 14,
    },
    alignRight: {
        float: 'right'
    }
}));

const AddSlider = (props) => {
    const { state, handleSectionComponent, handleNextDisable, handleApplyDisable, handleSliderValues } = props

    const router = useRouter()
    const companyId = router.query.companyID
    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal)
    const authToken = token || router.query.authToken
    //local state
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [sliderGID, setSliderGID] = useState('')
    const [sliderID, setSliderID] = useState('')
    const [isCta, setIsCta] = useState(false)
    const [ctaTitle, setCtaTitle] = useState('')
    const [ctaLink, setCtaLink] = useState('')
    const [cta, setCta] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [isItemDesc, setItemDesc] = useState(false)
    const [isDialogOpen, setDialogOpen] = useState(false)
    const [isRequested, setIsRequested] = useState(false)
    const [itemCount, setItemCount] = useState(1)
    const [sliderImages, setSliderImages] = useState([])
    const [imageGID, setImageGID] = useState('')
    const [showDeleteBtn, setShowDeleteBtn] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(null)
    const [isImageSelected, setImageSelected] = useState(false)
    const [selectImageRequest, setSelectImageReq] = useState(false)
    const [hoverIndex, setHoverIndex] = useState()
    const [gappID, setGappID] = useState('')
    const [isOptimizeImages, setOptimizeImages] = useState(false)
    const [quality, setQuality] = useState(
        state?.assets?.meta?.imageQuality ? state.assets.meta.imageQuality * 100 : 50
    )
    const [catId, setCatId] = useState(null)
    const [categories, setCategories] = useState([])
    const [isActive, setIsActive] = useState(false)
    const [textColor, setTextColor] = useState(
        state?.assets?.colors?.slider?.main ? state.assets.colors.slider.main : '#fff'
    )
    const [buttonColor, setButtonColor] = useState(
        state?.assets?.colors?.button?.main ? state.assets.colors.button.main : '#fff'
    )
    const [localState, setLocalState] = useState({
        isTextEditorDialogOpen: false,
        editorValue: '',
        dialogType: '',
        ctaLinkType: 'external',
        pageData: [],
        expiryDate: moment().format(OREST_ENDPOINT.DATEFORMAT_LOCALE)
    })

    const { dialogType, editorValue, isTextEditorDialogOpen, ctaLinkType, pageData, expiryDate } = localState

    const classes = useStyles();

    useEffect(() => {
        if (router.query.sliderOnly) {
            handleSliderValues(title, description, cta, sliderGID, textColor, buttonColor)
        }
    }, [title, description, cta, sliderGID, textColor, buttonColor])

    useEffect(() => {
        if (router.query.sliderOnly) {
            sliderImages.length > 0 ? handleApplyDisable(false) : handleApplyDisable(true)
        } else {
            if (sliderImages.length === 0) {
                setItemDesc(false)
                handleNextDisable(true)
            } else {
                handleNextDisable(false)
            }
        }
    }, [sliderImages])

    useEffect(() => {
        handleSectionComponent &&
            handleSectionComponent({
                service: 'hcmitemsld',
                type: 'slider',
                gid: sliderGID,
                textColor: textColor,
                buttonColor: buttonColor,
            })
    }, [textColor, buttonColor])

    useEffect(() => {
        setIsSaving(true)
        if (router.query.sliderOnly) {
            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEM + '/' + OREST_ENDPOINT.GAPP,
                token: authToken,
                method: 'get',
            }).then((res) => {
                if (res.status === 200 && res?.data?.data?.id) {
                    setGappID(res.data.data.id)
                    ViewList({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.HCMCAT,
                        token: authToken,
                        params: {
                            hotelrefno: Number(companyId),
                        },
                    }).then((res1) => {
                        if (res1.status === 200) {
                            if (res1?.data?.data?.length > 0) {
                                setCategories(res1.data.data)
                                setCatId(res1.data.data[0].id)
                            }
                            Insert({
                                // insert slider
                                apiUrl: GENERAL_SETTINGS.OREST_URL,
                                endpoint: OREST_ENDPOINT.HCMITEMSLD,
                                token: authToken,
                                data: {
                                    itemid: res?.data?.data?.id,
                                    hotelrefno: Number(companyId),
                                    masterid: router?.query?.masterid,
                                    catid: res1?.data?.data?.length > 0 ? res1?.data?.data[0]?.id : null,
                                },
                            }).then((res2) => {
                                if (res2.status === 200 && res2.data.data) {
                                    setSliderGID(res2.data.data.gid)
                                    setSliderID(res2.data.data.id)
                                    setIsSaving(false)
                                } else {
                                    const retErr = isErrorMsg(res2)
                                    setIsSaving(false)
                                    toast.error(retErr.errorMsg, {
                                        position: toast.POSITION.TOP_RIGHT,
                                    })
                                }
                            })
                        } else {
                            const retErr = isErrorMsg(res1)
                            setIsSaving(false)
                            toast.error(retErr.errorMsg, {
                                position: toast.POSITION.TOP_RIGHT,
                            })
                        }
                    })
                } else {
                    const retErr = isErrorMsg(res)
                    toast.error(retErr.errorMsg, {
                        position: toast.POSITION.TOP_RIGHT,
                    })
                }
            })
        } else {
            Insert({
                // insert slider
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMSLD,
                token: authToken,
                data: {
                    itemid: state.hcmItemId,
                    expiredt: expiryDate,
                    hotelrefno: Number(companyId),
                },
            }).then((res) => {
                if (res.status === 200 && res.data.data) {
                    setSliderGID(res.data.data.gid)
                    setSliderID(res.data.data.id)
                    setIsSaving(false)
                    handleSectionComponent({
                        service: 'hcmitemsld',
                        type: 'slider',
                        gid: res.data.data.gid,
                        textColor: textColor,
                        buttonColor: buttonColor,
                    })
                } else {
                    const retErr = isErrorMsg(res)
                    toast.error(retErr.errorMsg, {
                        position: toast.POSITION.TOP_RIGHT,
                    })
                }
            })

            //getting data from rafile
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RAFILE,
                token: authToken,
                params: {
                    hotelrefno: Number(companyId),
                    query: `filetype::WEBPAGE,istemplate::false}`,
                },
            }).then((res) => {
                if (res.status === 200 && res?.data?.data) {
                    setLocalState((prev) => ({ ...prev, pageData: res.data.data }))
                } else {
                    const retErr = isErrorMsg(res)
                    toast.error(retErr.errorMsg, {
                        position: toast.POSITION.TOP_RIGHT,
                    })
                }
            })
        }
    }, [])

    useEffect(() => {
        if (ctaTitle && ctaLink) {
            setCta(`<a target="_blank" href="${ctaLink}" > ${ctaTitle} </a>`)
        }
    }, [ctaTitle, ctaLink])

    const openDialog = () => {
        //it opens dialog for image upload
        setDialogOpen(true)
    }

    const closeDialog = () => {
        ////it closes dialog for image upload
        setDialogOpen(false)
    }

    const handleUpdate = () => {
        // update slider/image descriptions
        if (isItemDesc) {
            if (isImageSelected) {
                setIsRequested(true)
                Patch({
                    // update image
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.HCMITEMIMG,
                    token: authToken,
                    gid: imageGID,
                    params: {
                        hotelrefno: Number(companyId),
                    },
                    data: {
                        title: title,
                        description: description,
                        cta: cta,
                    },
                }).then((res) => {
                    if (res.status === 200) {
                        setIsRequested(false)
                        toast.success(SAVED_SUCCESS, {
                            position: toast.POSITION.TOP_RIGHT,
                        })
                    } else {
                        console.log(res)
                    }
                })
            } else {
                toast.warn('Please Select Image', {
                    position: toast.POSITION.TOP_RIGHT,
                })
            }
        } else {
            setIsRequested(true)
            Patch({
                // update slider
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMSLD,
                token: authToken,
                gid: sliderGID,
                params: {
                    hotelrefno: Number(companyId),
                },
                data: {
                    title: title,
                    description: description,
                    cta: cta,
                },
            }).then((res) => {
                setIsRequested(false)
                if (res.status === 200) {
                    toast.success(SAVED_SUCCESS, {
                        position: toast.POSITION.TOP_RIGHT,
                    })
                } else {
                    console.log(res)
                }
            })
        }
    }

    const saveImage = (files) => {
        // save slider images
        setIsSaving(true)
        let orderNo = itemCount
        let requests = files.map((file) => {
            return new Promise((resolve) => {
                asyncUpload(file, orderNo, resolve)
                orderNo++
            })
        })

        Promise.all(requests).then(async () => {
            const sldImages = await getSliderImages(GENERAL_SETTINGS.OREST_URL, authToken, companyId, sliderID)
            setIsSaving(false)
            if (sldImages) {
                let updatedImages = []
                sldImages.map((data) => {
                    updatedImages.push(data)
                })
                setSliderImages(updatedImages)
                setItemCount(updatedImages.length + 1)
                toast.success(UPLOAD_SUCCESS, {
                    position: toast.POSITION.TOP_RIGHT,
                })
                closeDialog()
            } else {
                toast.warn('Images not found', {
                    position: toast.POSITION.TOP_RIGHT,
                })
            }
        })
    }

    function asyncUpload(file, itemTreated, callback) {
        if (router.query.sliderOnly) {
            if (gappID && sliderID) {
                setTimeout(() => {
                    Insert({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.HCMITEMIMG,
                        token: authToken,
                        data: {
                            itemid: gappID,
                            sliderid: sliderID,
                            imgtype: FIELDTYPE.IMG,
                            orderno: itemTreated,
                            hotelrefno: Number(companyId),
                            masterid: router.query.masterid,
                            imgquality: quality / 100,
                            imgscale: quality / 100,
                        },
                    }).then((r1) => {
                        if (r1.status === 200) {
                            ImageUpload(
                                GENERAL_SETTINGS.OREST_URL,
                                OREST_ENDPOINT.RAFILE,
                                authToken,
                                r1.data.data.mid,
                                file
                            ).then((r) => {
                                if (r.status === 200) {
                                    callback()
                                } else {
                                    callback()
                                }
                            })
                        } else {
                            callback()
                        }
                    })
                }, 100)
            }
        } else {
            if (state.hcmItemId && sliderID) {
                setTimeout(() => {
                    Insert({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.HCMITEMIMG,
                        token: authToken,
                        data: {
                            itemid: state.hcmItemId,
                            sliderid: sliderID,
                            imgtype: FIELDTYPE.IMG,
                            orderno: itemTreated,
                            hotelrefno: Number(companyId),
                            imgquality: quality / 100,
                            imgscale: quality / 100,
                        },
                    }).then((r1) => {
                        if (r1.status === 200) {
                            ImageUpload(
                                GENERAL_SETTINGS.OREST_URL,
                                OREST_ENDPOINT.RAFILE,
                                authToken,
                                r1.data.data.mid,
                                file
                            ).then((r) => {
                                if (r.status === 200) {
                                    callback()
                                } else {
                                    callback()
                                }
                            })
                        } else {
                            callback()
                        }
                    })
                }, 100)
            }
        }
    }

    const ImageUpload = (apiUrl, endPoint, token, masterID, file) => {
        const url = apiUrl + '/' + endPoint + OREST_UPLOAD
        let binaryData = []
        binaryData.push(file)
        let formData = new FormData()
        formData.append('file', new Blob(binaryData, { type: file.type }), toSelfName(file.name));

        const options = {
            url: url,
            method: 'post',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
            params: {
                orsactive: true,
                masterid: masterID,
                hotelrefno: companyId,
                quality: quality / 100,
                scale: quality / 100,
            },
            data: formData,
        }

        return axios(options)
            .then((response) => {
                return response
            })
            .catch((error) => {
                return error.response || { status: 0 }
            })
    }

    const handleDeleteImage = (imageGid) => {
        // delete image against gid
        setIsRequested(true)
        Delete({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMITEMIMG,
            token: authToken,
            gid: imageGid,
            params: {
                hotelrefno: Number(companyId),
            },
        }).then(async (res) => {
            if (res.status === 200) {
                const sldImages = await getSliderImages(GENERAL_SETTINGS.OREST_URL, authToken, companyId, sliderID)
                sldImages.sort((a, b) => (a.orderno > b.orderno ? 1 : -1))
                setIsRequested(false)
                if (sldImages) {
                    let updatedImages = []
                    sldImages.map((data, index) => {
                        data.orderno = index + 1
                        updatedImages.push(data)
                    })
                    let requestPassed = true
                    for (const sldImage of sldImages) {
                        const updatedSliderImage = patchListSliderImage(
                            GENERAL_SETTINGS.OREST_URL,
                            authToken,
                            companyId,
                            { orderno: sldImage.orderno },
                            { hotelrefno: Number(companyId) },
                            sldImage.gid
                        )
                        updatedSliderImage ? (requestPassed = true) : (requestPassed = false)
                    }
                    setIsRequested(false)
                    if (requestPassed) {
                        setSliderImages(updatedImages)
                        setSelectedIndex(null)
                        setItemCount(updatedImages.length + 1)
                        toast.success(DELETE_SUCCESS, {
                            position: toast.POSITION.TOP_RIGHT,
                        })
                    } else {
                        toast.error('Something went wrong while deleting image. Please check network tab.', {
                            position: toast.POSITION.TOP_RIGHT,
                        })
                    }
                } else {
                    toast.error('Something went wrong while deleting image. Please check network tab.', {
                        position: toast.POSITION.TOP_RIGHT,
                    })
                }
            } else {
                toast.error('Something went wrong while deleting image. Please check network tab.', {
                    position: toast.POSITION.TOP_RIGHT,
                })
                setIsRequested(false)
            }
        })
    }

    const handleSelectedImage = (index, image) => {
        if (isItemDesc) {
            setSelectedIndex(index)
            setImageSelected(true)
            setImageGID(image.gid)
            setSelectImageReq(true)
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMIMG,
                token: authToken,
                params: {
                    query: `gid:${image.gid}`,
                    sort: 'orderno',
                    hotelrefno: Number(companyId),
                },
            }).then((res) => {
                setSelectImageReq(false)
                if (res.status === 200) {
                    if (res?.data?.data?.length > 0) {
                        res.data.data[0].title ? setTitle(res.data.data[0].title) : setTitle('')
                        res.data.data[0].description ? setDescription(res.data.data[0].description) : setDescription('')
                        res.data.data[0].cta ? setCta(res.data.data[0].cta) : setCta('')
                        if (res.data.data[0].cta) {
                            setIsCta(true)
                            setCta(res.data.data[0].cta)
                            const matchs = res.data.data[0].cta.match(/\bhttps?:\/\/\S+/gi)
                            if (matchs?.length > 0) {
                                const cta_title = res.data.data[0].cta
                                    .replace(`<a target="_blank" href="`, '')
                                    .replace(matchs[0], '')
                                    .replace('>', '')
                                    .replace('</a>', '')
                                    .trim()
                                setCtaLink(matchs[0])
                                setCtaTitle(cta_title)
                                setLocalState((prev) => ({ ...prev, ctaLinkType: 'external' }))
                            } else {
                                const gid = res.data.data[0].cta
                                    .replace(`<a target="_blank" href="`, '')
                                    .replace('" >', '')
                                    .replace('</a>', '')
                                    .split(' ')[0]
                                const cta_title = res.data.data[0].cta
                                    .replace(`<a target="_blank" href="`, '')
                                    .replace(gid, '')
                                    .replace('" >', '')
                                    .replace('</a>', '')
                                    .trim()
                                setLocalState((prev) => ({ ...prev, ctaLinkType: 'internal' }))
                                setCtaLink(gid)
                                setCtaTitle(cta_title)
                            }
                        } else {
                            setIsCta(false)
                            setCtaTitle('')
                            setCtaLink('')
                        }
                    }
                } else {
                    const retErr = isErrorMsg(res)
                    toast.error(retErr.errorMsg, {
                        position: toast.POSITION.TOP_RIGHT,
                    })
                }
            })
        }
    }

    const handleUpdateOrderNo = async (gid, orderNo, orderType) => {
        // update order no of slider images

        if (orderNo <= 0 || orderNo > sliderImages.length) {
            setSelectedIndex(null)
            setImageSelected(false)
        } else {
            const tmpSliderImages = [...sliderImages]
            if (orderType === 'increment') {
                const tmp = tmpSliderImages[orderNo - 1]
                tmpSliderImages[orderNo - 1] = tmpSliderImages[orderNo - 2]
                tmpSliderImages[orderNo - 2] = tmp
            } else {
                const tmp = tmpSliderImages[orderNo - 1]
                tmpSliderImages[orderNo - 1] = tmpSliderImages[orderNo]
                tmpSliderImages[orderNo] = tmp
            }
            tmpSliderImages.map((data, index) => {
                data.orderno = index + 1
            })
            setIsRequested(true)
            let requestPassed = true
            for (const sldImage of tmpSliderImages) {
                const updatedSliderImage = patchListSliderImage(
                    GENERAL_SETTINGS.OREST_URL,
                    authToken,
                    companyId,
                    { orderno: sldImage.orderno },
                    { hotelrefno: Number(companyId) },
                    sldImage.gid
                )
                updatedSliderImage ? (requestPassed = true) : (requestPassed = false)
            }
            setIsRequested(false)
            if (requestPassed) {
                setSliderImages(tmpSliderImages)
                setItemCount(sliderImages.length + 1)
                handleResetState()
                toast.success('Order No Updated Successfully', {
                    position: toast.POSITION.TOP_RIGHT,
                })
            } else {
                toast.error('Something went wrong while updating order no. Please check network tab.', {
                    position: toast.POSITION.TOP_RIGHT,
                })
            }
        }
    }

    const handleResetState = () => {
        setSelectedIndex(null)
        setImageSelected(false)
        setTitle('')
        setDescription('')
        setIsCta(false)
        setCtaTitle('')
        setCtaLink('')
        setCta('')
    }

    const handleItemDescription = () => {
        if (isItemDesc) {
            setSelectImageReq(true)
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMSLD,
                token: authToken,
                params: {
                    query: `gid:${sliderGID}`,
                    sort: 'orderno',
                    hotelrefno: Number(companyId),
                },
            }).then((res) => {
                setSelectImageReq(false)
                if (res?.status === 200 && res?.data?.data?.length > 0) {
                    setTitle(res.data.data[0]?.title)
                    setDescription(res.data.data[0]?.description)
                    if (res.data.data[0].cta) {
                        setIsCta(true)
                        setCta(res.data.data[0].cta)
                        const matchs = res.data.data[0].cta.match(/\bhttps?:\/\/\S+/gi)
                        if (matchs?.length > 0) {
                            const cta_title = res.data.data[0].cta
                                .replace(`<a target="_blank" href="`, '')
                                .replace(matchs[0], '')
                                .replace('>', '')
                                .replace('</a>', '')
                                .trim()
                            setCtaLink(matchs[0])
                            setCtaTitle(cta_title)
                            setLocalState((prev) => ({ ...prev, ctaLinkType: 'external' }))
                        } else {
                            const gid = res.data.data[0].cta
                                .replace(`<a target="_blank" href="`, '')
                                .replace('" >', '')
                                .replace('</a>', '')
                                .split(' ')[0]
                            const cta_title = res.data.data[0].cta
                                .replace(`<a target="_blank" href="`, '')
                                .replace(gid, '')
                                .replace('" >', '')
                                .replace('</a>', '')
                                .trim()
                            setLocalState((prev) => ({ ...prev, ctaLinkType: 'internal' }))
                            setCtaLink(gid)
                            setCtaTitle(cta_title)
                        }
                    } else {
                        setIsCta(false)
                        setCtaTitle('')
                        setCtaLink('')
                        setCta('')
                    }
                }
            })
            handleResetState()
        } else {
            setSelectedIndex(0)
            setImageSelected(true)
            setImageGID(sliderImages[0]?.gid)
            setSelectImageReq(true)
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMIMG,
                token: authToken,
                params: {
                    query: `gid:${sliderImages[0]?.gid}`,
                    sort: 'orderno',
                    hotelrefno: Number(companyId),
                },
            }).then((res) => {
                setSelectImageReq(false)
                if (res.status === 200) {
                    if (res.data && res.data.data && res.data.data.length > 0) {
                        res.data.data[0].title ? setTitle(res.data.data[0].title) : setTitle('')
                        res.data.data[0].description ? setDescription(res.data.data[0].description) : setDescription('')
                        res.data.data[0].cta ? setCta(res.data.data[0].cta) : setCta('')
                        if (res.data.data[0].cta) {
                            setIsCta(true)
                            setCta(res.data.data[0].cta)
                            const matchs = res.data.data[0].cta.match(/\bhttps?:\/\/\S+/gi)
                            if (matchs?.length > 0) {
                                const cta_title = res.data.data[0].cta
                                    .replace(`<a target="_blank" href="`, '')
                                    .replace(matchs[0], '')
                                    .replace('>', '')
                                    .replace('</a>', '')
                                    .trim()
                                setCtaLink(matchs[0])
                                setCtaTitle(cta_title);
                                setLocalState((prev) => ({ ...prev, ctaLinkType: 'external' }));
                            } else {
                                const gid = res.data.data[0].cta
                                    .replace(`<a target="_blank" href="`, '')
                                    .replace('" >', '')
                                    .replace('</a>', '')
                                    .split(' ')[0]
                                const cta_title = res.data.data[0].cta
                                    .replace(`<a target="_blank" href="`, '')
                                    .replace(gid, '')
                                    .replace('" >', '')
                                    .replace('</a>', '')
                                    .trim()
                                setLocalState((prev) => ({ ...prev, ctaLinkType: 'internal' }))
                                setCtaLink(gid)
                                setCtaTitle(cta_title)
                            }
                        } else {
                            setIsCta(false)
                            setCtaTitle('')
                            setCtaLink('')
                        }
                    }
                } else {
                    const retErr = isErrorMsg(res)
                    toast.error(retErr.errorMsg, {
                        position: toast.POSITION.TOP_RIGHT,
                    })
                }
            })
        }
        setItemDesc(!isItemDesc)
    }

    const handleImageQualityChange = (value) => {
        if (value >= 10 && value <= 100 && value % 10 === 0) {
            if (sliderImages.length) {
                setIsSaving(true)
                const gids = sliderImages.map((image) => {
                    return { gid: image.gid, imgquality: value / 100, imgscale: value / 100 }
                })
                UseOrest({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.HCMITEMIMG + '/' + OREST_ENDPOINT.LIST + '/' + OREST_ENDPOINT.PATCH,
                    token: authToken,
                    method: REQUEST_METHOD_CONST.PATCH,
                    data: gids,
                    params: {
                        hotelrefno: Number(companyId),
                    },
                }).then((res) => {
                    if (res?.status === 200 && res?.data?.data) {
                        setQuality(value)
                        setIsSaving(false)
                    } else {
                        const retErr = isErrorMsg(res)
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT,
                        })
                    }
                })
            } else {
                setQuality(value)
            }
        }
    }

    const handleTextEditorValue = (value) => {
        if (dialogType === 'title') {
            setTitle(value)
        }
        if (dialogType === 'description') {
            setDescription(value)
        }
        setLocalState((prev) => ({ ...prev, isTextEditorDialogOpen: false, dialogType: '', editorValue: '' }))
    }

    const handleCancelEditor = () => {
        setLocalState((prev) => ({ ...prev, isTextEditorDialogOpen: false, dialogType: '', editorValue: '' }))
    }

    const handleDialogOpen = (type) => {
        if (type === 'title') {
            setLocalState((prev) => ({ ...prev, isTextEditorDialogOpen: true, dialogType: type, editorValue: title }))
        }
        if (type === 'description') {
            setLocalState((prev) => ({
                ...prev,
                isTextEditorDialogOpen: true,
                dialogType: type,
                editorValue: description,
            }))
        }
    }

    const handleChangeDatePicker = (date) => {
        const dateValue = moment(date).format(OREST_ENDPOINT.DATEFORMAT_LOCALE)
        setLocalState({...localState, expiryDate: dateValue});
        if (dateValue !== 'Invalid date') {
            setIsRequested(true);
            Patch({
                // update slider
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMSLD,
                token: authToken,
                gid: sliderGID,
                params: {
                    hotelrefno: Number(companyId),
                },
                data: {
                    expiredt: dateValue,
                },
            }).then((res) => {
                setIsRequested(false)
                if (res.status === 200) {
                    toast.success(SAVED_SUCCESS, {
                        position: toast.POSITION.TOP_RIGHT,
                    })
                } else {
                    console.log(res)
                }
            })
        }

    }

    if (isSaving) {
        return <LoadingSpinner style={{ color: COLORS.secondary }} />
    }

    return (
        <React.Fragment>
            {state.hcmItemId && (
                <React.Fragment>
                    {
                        !router.query.sliderOnly && (
                            <Grid container={true}>
                                <Grid item xs={12}>
                                    <div className={classes.alignRight} className={clsx(classes.alignRight, { [classes.disableEvent]: !sliderImages?.length })}>
                                        <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                                            <DatePicker
                                                id="sliderExpiryDate"
                                                name="sliderExpiryDate"
                                                label={'Select Expiry'}
                                                value={expiryDate}
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
                        )
                    }
                    <Grid container={true} justify={'flex-start'} className={isRequested ? classes.disableEvent : ''}>
                        <Grid item xs={router?.query?.sliderOnly ? 8 : 5}>
                            <FormControlLabel
                                className={classes.labelFont}
                                control={
                                    <Checkbox
                                        size={'small'}
                                        checked={isItemDesc}
                                        onChange={handleItemDescription}
                                        name="isitem"
                                        color="primary"
                                        disabled={sliderImages.length === 0}
                                    />
                                }
                                label="Items Description"
                            />
                            <FormControlLabel
                                className={classes.labelFont}
                                control={
                                    <Checkbox
                                        size={'small'}
                                        checked={isOptimizeImages}
                                        onChange={() => setOptimizeImages(!isOptimizeImages)}
                                        color="primary"
                                    />
                                }
                                label="Optimize Images"
                            />
                            {router?.query?.sliderOnly && (
                                <>
                                    <FormControlLabel
                                        className={classes.labelFont}
                                        control={
                                            <Checkbox
                                                size={'small'}
                                                checked={isActive}
                                                onChange={() => {
                                                    setIsActive(!isActive)
                                                    Patch({
                                                        // update slider
                                                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                                                        endpoint: OREST_ENDPOINT.HCMITEMSLD,
                                                        token: authToken,
                                                        gid: sliderGID,
                                                        params: {
                                                            hotelrefno: Number(companyId),
                                                        },
                                                        data: {
                                                            isactive: !isActive,
                                                        },
                                                    }).then((res) => {
                                                        if (res.status !== 200) {
                                                            const retErr = isErrorMsg(res)
                                                            toast.error(retErr.errorMsg, {
                                                                position: toast.POSITION.TOP_RIGHT,
                                                            })
                                                        }
                                                    })
                                                }}
                                                color="primary"
                                            />
                                        }
                                        label="Active"
                                    />
                                    <FormControl size={'small'}>
                                        <InputLabel htmlFor="age-native-simple">Category</InputLabel>
                                        <Select
                                            native
                                            name="cat_id"
                                            variant={'outlined'}
                                            value={catId}
                                            onChange={(e) => {
                                                setCatId(e.target.value)
                                                Patch({
                                                    // update slider
                                                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                                                    endpoint: OREST_ENDPOINT.HCMITEMSLD,
                                                    token: authToken,
                                                    gid: sliderGID,
                                                    params: {
                                                        hotelrefno: Number(companyId),
                                                    },
                                                    data: {
                                                        catid: e.target.value,
                                                    },
                                                }).then((res) => {
                                                    if (res.status !== 200) {
                                                        const retErr = isErrorMsg(res)
                                                        toast.error(retErr.errorMsg, {
                                                            position: toast.POSITION.TOP_RIGHT,
                                                        })
                                                    }
                                                })
                                            }}
                                        >
                                            <option style={{ display: 'none' }} value=""></option>
                                            {categories.length > 0 &&
                                                categories.map((cat) => {
                                                    return (
                                                        <option key={cat.id} value={cat.id}>
                                                            {cat.description}
                                                        </option>
                                                    )
                                                })}
                                        </Select>
                                    </FormControl>
                                </>
                            )}
                        </Grid>
                        {!router?.query?.sliderOnly && (
                            <Grid item xs={5}>
                                <Grid container spacing={1}>
                                    <Grid item xs={1} style={{ marginTop: 6, marginLeft: 16 }}>
                                        <Typography component={'span'} style={{ marginLeft: -8 }}>
                                            Text
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={2} style={{ marginTop: 8 }}>
                                        <InputColor
                                            onChange={(color) => setTextColor(color.hex)}
                                            placement="right"
                                            initialValue={textColor}
                                        />
                                    </Grid>
                                    <Grid item xs={2} style={{ marginTop: 6 }}>
                                        <Typography component={'span'}>Button</Typography>
                                    </Grid>
                                    <Grid item xs={3} style={{ marginTop: 8 }}>
                                        <InputColor
                                            onChange={(color) => setButtonColor(color.hex)}
                                            placement="right"
                                            initialValue={buttonColor}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        )}
                        <Grid item xs={router?.query?.sliderOnly ? 4 : 2}>
                            {router?.query?.sliderOnly ? (
                                <Grid container spacing={1}>
                                    <Grid item xs={1} style={{ marginTop: 6 }}>
                                        <Typography component={'span'} style={{ marginLeft: -8 }}>
                                            Text
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={2} style={{ marginTop: 8 }}>
                                        <InputColor
                                            onChange={(color) => setTextColor(color.hex)}
                                            placement="right"
                                            initialValue={textColor}
                                        />
                                    </Grid>
                                    <Grid item xs={2} style={{ marginTop: 6 }}>
                                        <Typography component={'span'}>Button</Typography>
                                    </Grid>
                                    <Grid item xs={3} style={{ marginTop: 8 }}>
                                        <InputColor
                                            onChange={(color) => setButtonColor(color.hex)}
                                            placement="right"
                                            initialValue={buttonColor}
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Button
                                            onClick={openDialog}
                                            variant="contained"
                                            size="small"
                                            color="primary"
                                            aria-label="upload"
                                            className={classes.uploadButton}
                                        >
                                            <CloudUploadIcon />
                                            UPLOAD
                                        </Button>
                                    </Grid>
                                </Grid>
                            ) : (
                                <Button
                                    onClick={openDialog}
                                    variant="contained"
                                    size="small"
                                    color="primary"
                                    aria-label="upload"
                                    className={classes.uploadButton}
                                >
                                    <CloudUploadIcon />
                                    UPLOAD
                                </Button>
                            )}
                        </Grid>
                    </Grid>
                    {isOptimizeImages && (
                        <Grid container>
                            <Grid item xs={12}>
                                <PercentageSlider
                                    marks={PERCENTAGE_VALUES}
                                    value={quality}
                                    onChange={(e, value) => handleImageQualityChange(value)}
                                />
                            </Grid>
                        </Grid>
                    )}
                    <Grid
                        container
                        justify={'flex-start'}
                        spacing={3}
                        className={isRequested ? classes.disableEvent : ''}
                    >
                        <Grid item xs={5}>
                            <Paper className={classes.paperBlock}>
                                {sliderImages.map((value, index) => {
                                    return (
                                        <Grid key={index} container justify={'center'}>
                                            <Grid item={true}>
                                                <Card
                                                    className={classes.card}
                                                    style={{
                                                        border:
                                                            index === selectedIndex
                                                                ? '2px solid red'
                                                                : `1px solid ${COLORS?.secondary}`,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            backgroundImage: `url(${
                                                                GENERAL_SETTINGS.STATIC_URL + value.fileurl
                                                            })`,
                                                            height: '100%',
                                                            width: '100%',
                                                            backgroundSize: 'cover',
                                                            borderRadius: 5,
                                                        }}
                                                        onMouseEnter={() => {
                                                            setShowDeleteBtn(true)
                                                            setHoverIndex(index)
                                                        }}
                                                        onMouseLeave={() => {
                                                            setShowDeleteBtn(false)
                                                            setHoverIndex(index)
                                                        }}
                                                        onClick={() => handleSelectedImage(index, value)}
                                                    >
                                                        {showDeleteBtn && hoverIndex === index && (
                                                            <IconButton
                                                                disabled={isRequested}
                                                                component="span"
                                                                color={'primary'}
                                                                className={
                                                                    index === sliderImages.length - 1
                                                                        ? classes.disableEvent
                                                                        : ''
                                                                }
                                                                onClick={() =>
                                                                    handleUpdateOrderNo(
                                                                        value.gid,
                                                                        value.orderno + 1,
                                                                        'increment'
                                                                    )
                                                                }
                                                            >
                                                                <AddCircleIcon />
                                                            </IconButton>
                                                        )}
                                                        {showDeleteBtn && hoverIndex === index && (
                                                            <Typography component="span" color={'primary'}>
                                                                {value.orderno}
                                                            </Typography>
                                                        )}
                                                        {showDeleteBtn && hoverIndex === index && (
                                                            <IconButton
                                                                disabled={isRequested}
                                                                component="span"
                                                                color={'primary'}
                                                                className={index === 0 ? classes.disableEvent : ''}
                                                                onClick={() =>
                                                                    handleUpdateOrderNo(
                                                                        value.gid,
                                                                        value.orderno - 1,
                                                                        'decrement'
                                                                    )
                                                                }
                                                            >
                                                                <RemoveCircleIcon />
                                                            </IconButton>
                                                        )}
                                                        {showDeleteBtn && hoverIndex === index && (
                                                            <IconButton
                                                                onClick={() => handleDeleteImage(value.gid)}
                                                                disabled={isRequested}
                                                                aria-label="upload picture"
                                                                component="span"
                                                                style={{ float: 'right' }}
                                                                color={'primary'}
                                                            >
                                                                <CancelIcon />
                                                            </IconButton>
                                                        )}
                                                    </div>
                                                </Card>
                                            </Grid>
                                        </Grid>
                                    )
                                })}
                            </Paper>
                        </Grid>
                        <Grid item xs={7} className={selectImageRequest ? classes.disableEvent : ''}>
                            <Paper className={classes.paperBlock}>
                                <Container>
                                    <Grid container justify={'flex-start'}>
                                        <Grid item xs={3}>
                                            <Typography component={'h6'} variant={'h6'} className={classes.text}>
                                                Title
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={9}>
                                            <IconButton
                                                aria-label="Edit Title"
                                                color="primary"
                                                onClick={() => handleDialogOpen('title')}
                                                style={{ float: 'right' }}
                                            >
                                                <BorderColorSharpIcon color="primary" />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Container>
                                <Container>
                                    <Grid container justify={'flex-start'}>
                                        <Grid item xs={3}>
                                            <Typography component={'h6'} variant={'h6'} className={classes.text}>
                                                Description
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={9}>
                                            <IconButton
                                                aria-label="Edit Title"
                                                color="primary"
                                                onClick={() => handleDialogOpen('description')}
                                                style={{ float: 'right' }}
                                            >
                                                <BorderColorSharpIcon color="primary" />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Container>
                                <Container>
                                    <Grid container justify={'flex-start'}>
                                        <Grid item xs={11}>
                                            <Typography component={'h6'} variant={'h6'} className={classes.text}>
                                                Do you want to add button for slider ?
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Typography component={'div'} style={{ marginTop: 20 }}>
                                                <Switch
                                                    size={'small'}
                                                    checked={isCta}
                                                    onChange={() => {
                                                        setIsCta(!isCta)
                                                        setCtaTitle('')
                                                        setCtaLink('')
                                                        setCta('');
                                                        setLocalState((prev) => ({ ...prev, ctaLinkType: 'external' }))
                                                    }}
                                                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                                                    color={'primary'}
                                                />
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Container>
                                {isCta && (
                                    <Container>
                                        <Grid container>
                                            <FormControl component="fieldset">
                                                <RadioGroup
                                                    aria-label="link-type"
                                                    row
                                                    value={ctaLinkType}
                                                    onChange={(e) => {
                                                        const { value } = e?.target
                                                        setLocalState((prev) => ({
                                                            ...prev,
                                                            ctaLinkType: value,
                                                        }))
                                                        value === 'internal' ? setCtaLink(pageData[0]?.code) : ''
                                                    }}
                                                >
                                                    <FormControlLabel
                                                        value="external"
                                                        control={<Radio color={'primary'} size={'small'} />}
                                                        label="External Link"
                                                    />
                                                    <FormControlLabel
                                                        value="internal"
                                                        control={<Radio color={'primary'} size={'small'} />}
                                                        label="Internal Link"
                                                    />
                                                </RadioGroup>
                                            </FormControl>
                                        </Grid>
                                        <Grid container justify={'flex-start'} spacing={3}>
                                            <Grid item xs={6}>
                                                <TextField
                                                    size={'small'}
                                                    id="button-title"
                                                    variant={'outlined'}
                                                    label={'Title'}
                                                    value={ctaTitle}
                                                    fullWidth
                                                    onChange={(e) => setCtaTitle(e.target.value)}
                                                    style={{ marginTop: 8 }}
                                                    helperText={
                                                        ctaTitle && (
                                                            <Typography
                                                                variant="caption"
                                                                className={classes.alignText}
                                                                display="block"
                                                            >
                                                                {`${ctaTitle?.length} < 100`}
                                                            </Typography>
                                                        )
                                                    }
                                                    inputProps={{ maxLength: 99 }}
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                {ctaLinkType === 'external' && (
                                                    <TextField
                                                        size={'small'}
                                                        id="button-link"
                                                        variant={'outlined'}
                                                        label={'Link'}
                                                        value={ctaLink}
                                                        error={ctaLink ? !validator.isURL(ctaLink) : false}
                                                        onChange={(e) => setCtaLink(e.target.value)}
                                                        style={{ marginTop: 8 }}
                                                        fullWidth
                                                        helperText={
                                                            ctaLink && (
                                                                <Typography
                                                                    variant="caption"
                                                                    className={classes.alignText}
                                                                    display="block"
                                                                >
                                                                    {`${ctaLink?.length} < 100`}
                                                                </Typography>
                                                            )
                                                        }
                                                        inputProps={{ maxLength: 99 }}
                                                    />
                                                )}
                                                {ctaLinkType === 'internal' && (
                                                    <FormControl
                                                        variant="outlined"
                                                        size={'small'}
                                                        style={{ marginTop: 8 }}
                                                        fullWidth
                                                    >
                                                        <Select
                                                            value={ctaLink}
                                                            onChange={(e) => {
                                                                const { value } = e?.target
                                                                setCtaLink(value)
                                                            }}
                                                            label="Web Pages"
                                                        >
                                                            {pageData.map((option, index) => {
                                                                return (
                                                                    <MenuItem value={option.code} key={index}>
                                                                        {' '}
                                                                        {option.code}{' '}
                                                                    </MenuItem>
                                                                )
                                                            })}
                                                        </Select>
                                                    </FormControl>
                                                )}
                                            </Grid>
                                        </Grid>
                                    </Container>
                                )}
                                <Divider style={{ marginTop: 8 }} />
                                <Button
                                    onClick={handleUpdate}
                                    variant="contained"
                                    size="small"
                                    color="primary"
                                    aria-label="add"
                                    className={classes.submit}
                                >
                                    SUBMIT
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                    <DropzoneDialog
                        open={isDialogOpen}
                        onSave={saveImage}
                        acceptedFiles={['image/jpeg', 'image/png', 'image/bmp']}
                        showPreviews={true}
                        maxFileSize={5000000}
                        filesLimit={5}
                        onClose={closeDialog}
                    />
                    {isTextEditorDialogOpen && (
                        <TextEditor
                            handleSaveTextEditor={handleTextEditorValue}
                            handleCancelTextEditor={handleCancelEditor}
                            data={editorValue}
                        />
                    )}
                </React.Fragment>
            )}
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.pageBuilder,
    }
}

export default connect(mapStateToProps)(AddSlider)
