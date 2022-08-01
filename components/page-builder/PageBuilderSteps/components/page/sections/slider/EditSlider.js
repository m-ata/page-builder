//react imports
import React, { useState, useEffect, useContext } from 'react'
//material ui imports
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import IconButton from '@material-ui/core/IconButton'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle'
import { FormControlLabel, MenuItem, Radio, RadioGroup } from '@material-ui/core'
import Checkbox from '@material-ui/core/Checkbox'
import CancelIcon from '@material-ui/icons/Cancel'
import Divider from '@material-ui/core/Divider'
import Switch from '@material-ui/core/Switch'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Container from '@material-ui/core/Container'
//dropzone related imports
import 'regenerator-runtime/runtime'
import { DropzoneDialog } from 'material-ui-dropzone'
import { useRouter } from 'next/router'
//custom imports
import WebCmsGlobal from '../../../../../../webcms-global'
import { Delete, Insert, Patch, UseOrest, ViewList } from '@webcms/orest'
import { COLORS, DELETE_SUCCESS, PERCENTAGE_VALUES, SAVED_SUCCESS, UPLOAD_SUCCESS } from '../../../../constants'
import LoadingSpinner from '../../../../../../LoadingSpinner'
import {
    FIELDTYPE,
    isErrorMsg,
    OREST_ENDPOINT,
    OREST_UPLOAD,
    REQUEST_METHOD_CONST,
} from '../../../../../../../model/orest/constants'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'
import validator from 'validator'
import axios from 'axios'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import InputColor from 'react-input-color'
import { PercentageSlider } from '../../../../../../../model/slider'
import { getSliderImages, patchListSliderImage } from '../../../../helpers/slider'
import TextEditor from '../text-editor'
import BorderColorSharpIcon from '@material-ui/icons/BorderColorSharp'
import { toSelfName } from './../../../../../../../lib/helpers/useFunction';
import moment from "moment";
import {DatePicker, LocalizationProvider} from "@material-ui/pickers";
import MomentAdapter from "@date-io/moment";

const useStyles = makeStyles((theme) => ({
    submit: {
        marginRight: theme.spacing(3),
        marginTop: theme.spacing(1),
        borderRadius: 20,
        float: 'right',
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
        width: 320,
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
    alignRight: {
        float: 'right'
    }
}))

const EditSlider = (props) => {
    const { sliderComponent, handleCmponent, state, handleApplyDisable, handleSliderValues, otherLangSlider } = props

    const [sliderImages, setSliderImages] = useState([])
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [isCta, setIsCta] = useState(false)
    const [ctaTitle, setCtaTitle] = useState('')
    const [ctaLink, setCtaLink] = useState('')
    const [cta, setCta] = useState('')
    const [isLoaded, setIsLoaded] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isItemDesc, setItemDesc] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState()
    const [showDeleteBtn, setShowDeleteBtn] = useState(false)
    const [hoverIndex, setHoverIndex] = useState()
    const [sliderGID, setSliderGID] = useState('')
    const [sliderID, setSliderID] = useState('')
    const [imageGID, setImageGID] = useState('')
    const [isDialogOpen, setDialogOpen] = useState(false)
    const [itemCount, setItemCount] = useState(1)
    const [gappID, setGappID] = useState('')
    const [otherLangSliderImages, setOtherLangSliderImages] = useState([])
    const [editedSliderComponent, setEditedSliderComponent] = useState(sliderComponent)
    const [isImageSelected, setImageSelected] = useState(false)
    const [itemDescRequest, setItemDescRequest] = useState(false)
    const [isOptimizeImages, setOptimizeImages] = useState(false)
    const [quality, setQuality] = useState(
        state?.assets?.meta?.imageQuality ? state.assets.meta.imageQuality * 100 : 50
    )
    const [catId, setCatId] = useState(null)
    const [categories, setCategories] = useState([])
    const [isActive, setIsActive] = useState(false)
    const [textColor, setTextColor] = useState(sliderComponent?.textColor ? sliderComponent.textColor : '#fff')
    const [buttonColor, setButtonColor] = useState(sliderComponent?.buttonColor ? sliderComponent.buttonColor : '#fff')
    const [localState, setLocalState] = useState({
        isTextEditorDialogOpen: false,
        editorValue: '',
        dialogType: '',
        pageData: [],
        ctaLinkType: '',
        expiryDate: moment().format(OREST_ENDPOINT.DATEFORMAT_LOCALE)
    })

    const { dialogType, editorValue, isTextEditorDialogOpen, ctaLinkType, pageData, expiryDate } = localState

    const router = useRouter()
    const companyId = router.query.companyID
    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal)
    const authToken = token || router.query.authToken

    const classes = useStyles()

    const openDialog = () => {
        //it opens dialog for image upload
        setDialogOpen(true)
    }

    const closeDialog = () => {
        ////it closes dialog for image upload
        setDialogOpen(false)
    }

    useEffect(() => {
        if (otherLangSlider && 'sliderImages' in otherLangSlider) {
            setOtherLangSliderImages(otherLangSlider.sliderImages)
        }
    }, [otherLangSlider])

    useEffect(() => {
        if (router.query.sliderOnly) {
            if (sliderImages.length === 0) {
                handleApplyDisable(true)
            } else {
                handleApplyDisable(false)
            }
        } else {
            if (sliderImages.length > 0) {
                if (state.langCode === state.defaultLang) {
                    handleCmponent({
                        service: 'hcmitemsld',
                        type: 'slider',
                        gid: editedSliderComponent.gid,
                        width: editedSliderComponent.width,
                        id: editedSliderComponent.id,
                        textColor: textColor,
                        buttonColor: buttonColor,
                    })
                } else {
                    if (!isItemDesc) {
                        handleCmponent({
                            slider: {
                                title: title,
                                description: description,
                                cta: cta,
                            },
                        })
                    } else {
                        handleCmponent({
                            sliderImages: otherLangSliderImages,
                        })
                    }
                }
            }
        }
    }, [sliderImages, title, description, cta, otherLangSliderImages, textColor, buttonColor])

    useEffect(() => {
        if (router.query.sliderOnly) {
            handleSliderValues(title, description, cta, state.slider.gid, textColor, buttonColor)
        }
    }, [title, description, cta, textColor, buttonColor])

    useEffect(() => {
        setIsLoaded(false);
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMCAT,
            token: authToken,
            params: {
                hotelrefno: Number(companyId),
            },
        }).then((res) => {
            if (res?.status === 200) {
                res?.data?.data?.length > 0 && setCategories(res.data.data)
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
            }
        }).then(res => {
            setIsLoaded(true)
            if (res.status === 200 && res?.data?.data) {
                setLocalState(prev => ({...prev, pageData: res.data.data}))
            } else {
                const retErr = isErrorMsg(res);
                toast.error(retErr.errorMsg, {
                    position: toast.POSITION.TOP_RIGHT
                });
            }
        })
    }, [])

    useEffect(() => {
        // get all slider images against gid
        setIsLoaded(false)
        if (editedSliderComponent?.gid) {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMSLD,
                token: authToken,
                params: {
                    query: `gid:${editedSliderComponent.gid}`,
                    hotelrefno: Number(companyId),
                },
            }).then((r) => {

                if (r.status === 200) {
                    if (r?.data?.data?.length > 0) {
                        setGappID(r.data.data[0].itemid)
                        setCatId(r.data.data[0].catid)
                        setIsActive(r.data.data[0].isactive)
                        if (state.langCode === state.defaultLang || router.query.sliderOnly) {
                            if (r.data.data[0].title || r.data.data[0].description) {
                                setTitle(r.data.data[0].title)
                                setDescription(r.data.data[0].description)
                            }
                            if (r.data.data[0].cta) {
                                setIsCta(true)
                                const matchLink = r.data.data[0].cta.match(/\bhttps?:\/\/\S+/gi)
                                if (matchLink) {
                                    const title = r.data.data[0].cta
                                        .replace(`<a target="_blank" href="`, '')
                                        .replace(matchLink[0], '')
                                        .replace('>', '')
                                        .replace('</a>', '')
                                        .trim()
                                    setCtaLink(matchLink[0])
                                    setCtaTitle(title)
                                    setLocalState((prev) => ({ ...prev, ctaLinkType: 'external' }))
                                } else {
                                    const ctaGid = r.data.data[0].cta
                                        .replace(`<a target="_blank" href="`, '')
                                        .replace('>', '')
                                        .replace('</a>', '')
                                        .replace('"', '')
                                        .trim()
                                        ?.split(' ')[0]
                                    const cta_title = r.data.data[0].cta
                                        .replace(`<a target="_blank" href="`, '')
                                        .replace(ctaGid + '"', '')
                                        .replace('>', '')
                                        .replace('</a>', '')
                                        .trim()
                                    setCtaLink(ctaGid)
                                    setCtaTitle(cta_title)
                                    setLocalState((prev) => ({ ...prev, ctaLinkType: 'internal' }))
                                }
                            }
                        } else {
                            if (otherLangSlider && 'slider' in otherLangSlider) {
                                setTitle(otherLangSlider.slider.title)
                                setDescription(otherLangSlider.slider.description)
                                if (otherLangSlider.slider.cta) {
                                    setIsCta(true)
                                    const matchLink = otherLangSlider.slider.cta.match(/\bhttps?:\/\/\S+/gi)
                                    if (matchLink) {
                                        const title = otherLangSlider.slider.cta
                                            .replace(`<a target="_blank" href="`, '')
                                            .replace(matchLink[0], '')
                                            .replace('>', '')
                                            .replace('</a>', '')
                                            .trim()
                                        setCtaLink(matchLink[0])
                                        setCtaTitle(title)
                                        setLocalState((prev) => ({ ...prev, ctaLinkType: 'external' }))
                                    } else {
                                        const ctaGid = otherLangSlider.slider.cta
                                            .replace(`<a target="_blank" href="`, '')
                                            .replace('>', '')
                                            .replace('</a>', '')
                                            .replace('"', '')
                                            .trim()
                                            ?.split(' ')[0]
                                        const cta_title = otherLangSlider.slider.cta
                                            .replace(`<a target="_blank" href="`, '')
                                            .replace(ctaGid + '"', '')
                                            .replace('>', '')
                                            .replace('</a>', '')
                                            .trim()
                                        setCtaLink(ctaGid)
                                        setCtaTitle(cta_title)
                                        setLocalState((prev) => ({ ...prev, ctaLinkType: 'internal' }))
                                    }
                                }
                            }
                        }
                        setSliderGID(r.data.data[0].gid);
                        setSliderID(r.data.data[0].id);
                        setLocalState({...localState, expiryDate: r?.data?.data[0]?.expiredt});
                        ViewList({
                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                            endpoint: OREST_ENDPOINT.HCMITEMIMG,
                            token: authToken,
                            params: {
                                query: `sliderid:${r.data.data[0].id}`,
                                sort: 'orderno',
                                hotelrefno: Number(companyId),
                            },
                        }).then((res) => {
                            setIsLoaded(true)
                            if (res.status === 200) {
                                let updatedImages = []
                                res.data.data.map(async (data, index) => {
                                    updatedImages.push(data)
                                    if (state.langCode === state.defaultLang) {
                                        if (data.cta || data.title || data.description) {
                                            if (index === 0) {
                                                setItemDesc(true)
                                                setSelectedIndex(index)
                                                setImageGID(data.gid)
                                                ViewList({
                                                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                                                    endpoint: OREST_ENDPOINT.HCMITEMIMG,
                                                    token: authToken,
                                                    params: {
                                                        query: `gid:${data.gid}`,
                                                        sort: 'orderno',
                                                        hotelrefno: Number(companyId),
                                                    },
                                                }).then((res1) => {
                                                    if (res1.status === 200) {
                                                        if (res1.data && res1.data.data && res1.data.data.length > 0) {
                                                            res1.data.data[0].title
                                                                ? setTitle(res1.data.data[0].title)
                                                                : setTitle('')
                                                            res1.data.data[0].description
                                                                ? setDescription(res1.data.data[0].description)
                                                                : setDescription('')
                                                            res1.data.data[0].cta
                                                                ? setCta(res1.data.data[0].cta)
                                                                : setCta('')
                                                            if (res1.data.data[0].cta) {
                                                                setIsCta(true)
                                                                setCta(res1.data.data[0].cta)
                                                                const matchs = res1.data.data[0].cta.match(
                                                                    /\bhttps?:\/\/\S+/gi
                                                                )
                                                                if (matchs?.length > 0) {
                                                                    const cta_title = res1.data.data[0].cta
                                                                        .replace(`<a target="_blank" href="`, '')
                                                                        .replace(matchs[0], '')
                                                                        .replace('>', '')
                                                                        .replace('</a>', '')
                                                                        .trim()
                                                                    setCtaLink(matchs[0])
                                                                    setCtaTitle(cta_title)
                                                                    setLocalState((prev) => ({ ...prev, ctaLinkType: 'external' }))
                                                                } else {
                                                                    const ctaGid = res1.data.data[0].cta
                                                                        .replace(`<a target="_blank" href="`, '')
                                                                        .replace('>', '')
                                                                        .replace('</a>', '')
                                                                        .replace('"', '')
                                                                        .trim()
                                                                        ?.split(' ')[0]
                                                                    const cta_title = res1.data.data[0].cta
                                                                        .replace(`<a target="_blank" href="`, '')
                                                                        .replace(ctaGid + '"', '')
                                                                        .replace('>', '')
                                                                        .replace('</a>', '')
                                                                        .trim()
                                                                    setCtaLink(ctaGid)
                                                                    setCtaTitle(cta_title)
                                                                    setLocalState((prev) => ({ ...prev, ctaLinkType: 'internal' }))
                                                                }
                                                            } else {
                                                                setIsCta(false)
                                                            }
                                                        }
                                                    } else {
                                                        const retErr = isErrorMsg(res1)
                                                        toast.error(retErr.errorMsg, {
                                                            position: toast.POSITION.TOP_RIGHT,
                                                        })
                                                    }
                                                })
                                            }
                                        }
                                    } else {
                                        if (
                                            otherLangSlider &&
                                            otherLangSlider.sliderImages &&
                                            otherLangSlider.sliderImages.length > 0
                                        ) {
                                            setSelectedIndex(0)
                                            setItemDesc(true)
                                            setTitle(otherLangSlider.sliderImages[0].title)
                                            setDescription(otherLangSlider.sliderImages[0].description)
                                            if (otherLangSlider.sliderImages[0].cta) {
                                                setIsCta(true)
                                                setCta(otherLangSlider.sliderImages[0].cta)
                                                const matchs = otherLangSlider.sliderImages[0].cta.match(
                                                    /\bhttps?:\/\/\S+/gi
                                                )
                                                if (matchs?.length > 0) {
                                                    const cta_title = otherLangSlider.sliderImages[0].cta
                                                        .replace(`<a target="_blank" href="`, '')
                                                        .replace(matchs[0], '')
                                                        .replace('>', '')
                                                        .replace('</a>', '')
                                                        .trim()
                                                    setCtaLink(matchs[0])
                                                    setCtaTitle(cta_title)
                                                    setLocalState((prev) => ({ ...prev, ctaLinkType: 'external' }))
                                                } else {
                                                    const ctaGid = otherLangSlider.sliderImages[0].cta
                                                        .replace(`<a target="_blank" href="`, '')
                                                        .replace('>', '')
                                                        .replace('</a>', '')
                                                        .replace('"', '')
                                                        .trim()
                                                        ?.split(' ')[0]
                                                    const cta_title = otherLangSlider.sliderImages[0].cta
                                                        .replace(`<a target="_blank" href="`, '')
                                                        .replace(ctaGid + '"', '')
                                                        .replace('>', '')
                                                        .replace('</a>', '')
                                                        .trim()
                                                    setCtaLink(ctaGid)
                                                    setCtaTitle(cta_title)
                                                    setLocalState((prev) => ({ ...prev, ctaLinkType: 'internal' }))
                                                }
                                            } else {
                                                setIsCta(false)
                                                setCtaTitle('')
                                                setCtaLink('')
                                            }
                                        }
                                    }
                                })
                                setSliderImages(updatedImages)
                                setItemCount(updatedImages + 1)
                            } else {
                                console.log(res)
                            }
                        })
                    } else {
                        setIsLoaded(true)
                    }
                } else {
                    setIsLoaded(true)
                    const retErr = isErrorMsg(r)
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
                    hotelrefno: Number(companyId),
                },
            }).then((res) => {
                if (res.status === 200 && res.data.data) {
                    setIsLoaded(true)
                    const updatedSliderComponent = { ...editedSliderComponent }
                    updatedSliderComponent.gid = res.data.data.gid
                    setEditedSliderComponent(updatedSliderComponent)
                }
            })
        }
    }, [editedSliderComponent])

    useEffect(() => {
        if (ctaTitle && ctaLink) {
            setCta(`<a target="_blank" href="${ctaLink}" > ${ctaTitle} </a>`)
        }
    }, [ctaTitle, ctaLink])

    const handleUpdate = () => {
        // update slider/image descriptions
        if (state.langCode === state.defaultLang) {
            if (isItemDesc) {
                if (isImageSelected) {
                    setIsSaving(true)
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
                            setIsSaving(false)
                            toast.success(SAVED_SUCCESS, {
                                position: toast.POSITION.TOP_RIGHT,
                            })
                        } else {
                            console.log(res)
                        }
                    })
                } else {
                    handleResetState()
                    toast.warn('Please Select Image', {
                        position: toast.POSITION.TOP_RIGHT,
                    })
                }
            } else {
                setIsSaving(true)
                Patch({
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
                    setIsSaving(false)
                    if (res.status === 200) {
                        toast.success(SAVED_SUCCESS, {
                            position: toast.POSITION.TOP_RIGHT,
                        })
                    } else {
                        console.log(res)
                    }
                })
            }
        } else {
            const updateOtherLangSliderImages = [...otherLangSliderImages]
            updateOtherLangSliderImages[selectedIndex] = {
                title: title,
                description: description,
                cta: cta,
            }
            setOtherLangSliderImages(updateOtherLangSliderImages)
            toast.success(SAVED_SUCCESS, {
                position: toast.POSITION.TOP_RIGHT,
            })
        }
    }

    const handleDeleteImage = (imageGid) => {
        // delete image against gid
        setIsDeleting(true)
        Delete({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMITEMIMG,
            token: authToken,
            gid: imageGid,
            params: {
                hotelrefno: Number(companyId),
            },
        }).then(async (res) => {
            setIsDeleting(false)
            if (res.status === 200) {
                const sldImages = await getSliderImages(GENERAL_SETTINGS.OREST_URL, authToken, companyId, sliderID)
                sldImages.sort((a, b) => (a.orderno > b.orderno ? 1 : -1))
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
                const retErr = isErrorMsg(res)
                toast.error(retErr.errorMsg, {
                    position: toast.POSITION.TOP_RIGHT,
                })
                setIsDeleting(false)
            }
        })
    }

    const handleSelectedImage = (index, image) => {
        if (isItemDesc) {
            setSelectedIndex(index)
            setImageSelected(true)
            if (state.langCode === state.defaultLang) {
                setImageGID(image.gid)
                setItemDescRequest(true)
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
                    setItemDescRequest(false)
                    if (res.status === 200) {
                        if (res.data && res.data.data && res.data.data.length > 0) {
                            res.data.data[0].title ? setTitle(res.data.data[0].title) : setTitle('')
                            res.data.data[0].description
                                ? setDescription(res.data.data[0].description)
                                : setDescription('')
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
                                    const ctaGid = res.data.data[0].cta
                                        .replace(`<a target="_blank" href="`, '')
                                        .replace('>', '')
                                        .replace('</a>', '')
                                        .replace('"', '')
                                        .trim()
                                        ?.split(' ')[0]
                                    const cta_title = res.data.data[0].cta
                                        .replace(`<a target="_blank" href="`, '')
                                        .replace(ctaGid + '"', '')
                                        .replace('>', '')
                                        .replace('</a>', '')
                                        .trim()
                                    setCtaLink(ctaGid)
                                    setCtaTitle(cta_title)
                                    setLocalState((prev) => ({ ...prev, ctaLinkType: 'internal' }))
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
            } else {
                if (otherLangSliderImages.length > 0) {
                    setTitle(otherLangSliderImages[index].title)
                    setDescription(otherLangSliderImages[index].description)
                    if (otherLangSliderImages[index].cta) {
                        setIsCta(true)
                        setCta(otherLangSliderImages[index].cta)
                        const matchs = otherLangSliderImages[index].cta.match(/\bhttps?:\/\/\S+/gi)
                        if (matchs.length > 0) {
                            const cta_title = otherLangSliderImages[index].cta
                                .replace(`<a target="_blank" href="`, '')
                                .replace(matchs[0], '')
                                .replace('>', '')
                                .replace('</a>', '')
                                .trim()
                            setCtaLink(matchs[0])
                            setCtaTitle(cta_title)
                            setLocalState((prev) => ({ ...prev, ctaLinkType: 'external' }))
                        } else {
                            const ctaGid = otherLangSliderImages[index - 1].cta
                                .replace(`<a target="_blank" href="`, '')
                                .replace('>', '')
                                .replace('</a>', '')
                                .replace('"', '')
                                .trim()
                                ?.split(' ')[0]
                            const cta_title = otherLangSliderImages[index - 1].cta
                                .replace(`<a target="_blank" href="`, '')
                                .replace(ctaGid + '"', '')
                                .replace('>', '')
                                .replace('</a>', '')
                                .trim()
                            setCtaLink(ctaGid)
                            setCtaTitle(cta_title)
                            setLocalState((prev) => ({ ...prev, ctaLinkType: 'internal' }))
                        }
                    } else {
                        setIsCta(false)
                        setCtaTitle('')
                        setCtaLink('')
                    }
                } else {
                    setTitle(otherLangSliderImages?.sliderImages[index - 1]?.title)
                    setDescription(otherLangSliderImages?.sliderImages[index - 1]?.description)
                    if (otherLangSliderImages?.sliderImages[0]?.cta) {
                        setLocalState((prev) => ({ ...prev, isCta: true }))
                        const matchs = otherLangSliderImages?.sliderImages[0].cta.match(/\bhttps?:\/\/\S+/gi)
                        if (matchs?.length > 0) {
                            const cta_title = otherLangSliderImages?.sliderImages[0].cta
                                .replace(`<a target="_blank" href="`, '')
                                .replace(matchs[0], '')
                                .replace('>', '')
                                .replace('</a>', '')
                                .trim()
                            setCtaLink(matchs[0])
                            setCtaTitle(cta_title)
                            setLocalState((prev) => ({ ...prev, ctaLinkType: 'external' }))
                        } else {
                            const ctaGid = otherLangSliderImages?.sliderImages[0].cta
                                .replace(`<a target="_blank" href="`, '')
                                .replace('>', '')
                                .replace('</a>', '')
                                .replace('"', '')
                                .trim()
                                ?.split(' ')[0]
                            const cta_title = otherLangSliderImages?.sliderImages[0].cta
                                .replace(`<a target="_blank" href="`, '')
                                .replace(ctaGid + '"', '')
                                .replace('>', '')
                                .replace('</a>', '')
                                .trim()
                            setCtaLink(ctaGid)
                            setCtaTitle(cta_title)
                            setLocalState((prev) => ({ ...prev, ctaLinkType: 'internal' }))
                        }
                    } else {
                        setLocalState((prev) => ({ ...prev, ctaLink: '', ctaTitle: '', isCta: false }))
                    }
                }
            }
        }
    }

    const handleResetState = () => {
        setCta('')
        setCtaTitle('')
        setCtaLink('')
        setTitle('')
        setDescription('')
        setIsCta(false)
        setImageSelected(false)
        setSelectedIndex(null)
    }

    const handleItemDescription = () => {
        setItemDesc(!isItemDesc)
        if (isItemDesc) {
            setItemDescRequest(true)
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
                setItemDescRequest(false)
                if (res?.status === 200 && res?.data?.data?.length > 0) {
                    setTitle(res.data.data[0]?.title)
                    setDescription(res.data.data[0]?.description)
                    if (res.data.data[0].cta) {
                        setIsCta(true)
                        setCta(res.data.data[0].cta)
                        const matchs = res.data.data[0].cta.match(/\bhttps?:\/\/\S+/gi)
                        if (matchs.length > 0) {
                            const cta_title = res.data.data[0].cta
                                .replace(`<a target="_blank" href="`, '')
                                .replace(matchs[0], '')
                                .replace('>', '')
                                .replace('</a>', '')
                                .trim()
                            setCtaLink(matchs[0])
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
            if (state.langCode === state.defaultLang) {
                setImageGID(sliderImages[0]?.gid)
                setItemDescRequest(true)
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
                    setItemDescRequest(false)
                    if (res.status === 200) {
                        if (res.data && res.data.data && res.data.data.length > 0) {
                            res.data.data[0].title ? setTitle(res.data.data[0].title) : setTitle('')
                            res.data.data[0].description
                                ? setDescription(res.data.data[0].description)
                                : setDescription('')
                            res.data.data[0].cta ? setCta(res.data.data[0].cta) : setCta('')
                            if (res.data.data[0].cta) {
                                setIsCta(true)
                                setCta(res.data.data[0].cta)
                                const matchs = res.data.data[0].cta.match(/\bhttps?:\/\/\S+/gi)
                                if (matchs.length > 0) {
                                    const cta_title = res.data.data[0].cta
                                        .replace(`<a target="_blank" href="`, '')
                                        .replace(matchs[0], '')
                                        .replace('>', '')
                                        .replace('</a>', '')
                                        .trim()
                                    setCtaLink(matchs[0])
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
            } else {
                if (otherLangSliderImages?.length > 0) {
                    setTitle(otherLangSliderImages[0].title)
                    setDescription(otherLangSliderImages[0].description)
                    if (otherLangSliderImages[0].cta) {
                        setIsCta(true)
                        setCta(otherLangSliderImages[0].cta)
                        const matchs = otherLangSliderImages[0].cta.match(/\bhttps?:\/\/\S+/gi)
                        if (matchs.length > 0) {
                            const cta_title = otherLangSliderImages[0].cta
                                .replace(`<a target="_blank" href="`, '')
                                .replace(matchs[0], '')
                                .replace('>', '')
                                .replace('</a>', '')
                                .trim()
                            setCtaLink(matchs[0])
                            setCtaTitle(cta_title)
                        }
                    } else {
                        setIsCta(false)
                        setCtaTitle('')
                        setCtaLink('')
                    }
                }
            }
        }
    }

    const saveImage = (files) => {
        setIsLoaded(false)
        let orderNo = itemCount
        let requests = files.map((file) => {
            return new Promise((resolve) => {
                asyncUpload(file, orderNo, resolve)
                orderNo++
            })
        })
        Promise.all(requests).then(async () => {
            const sldImages = await getSliderImages(GENERAL_SETTINGS.OREST_URL, authToken, companyId, sliderID)
            setIsLoaded(true)
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
                toast.warn('Something went wrong while saving image. Please check network tab.', {
                    position: toast.POSITION.TOP_RIGHT,
                })
            }
        })
    }

    function asyncUpload(file, itemTreated, callback) {
        if (router.query.sliderOnly) {
            if (gappID && editedSliderComponent.gid) {
                setTimeout(() => {
                    ViewList({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.HCMITEMSLD,
                        token: authToken,
                        params: {
                            query: `gid:${editedSliderComponent.gid}`,
                            hotelrefno: Number(companyId),
                        },
                    }).then((r) => {
                        if (r.status === 200) {
                            Insert({
                                apiUrl: GENERAL_SETTINGS.OREST_URL,
                                endpoint: OREST_ENDPOINT.HCMITEMIMG,
                                token: authToken,
                                data: {
                                    itemid: gappID,
                                    sliderid: r.data.data[0].id,
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
                        }
                    })
                }, 100)
            }
        } else {
            if (state.hcmItemId && editedSliderComponent.gid) {
                setTimeout(() => {
                    ViewList({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.HCMITEMSLD,
                        token: authToken,
                        params: {
                            query: `gid:${editedSliderComponent.gid}`,
                            hotelrefno: Number(companyId),
                        },
                    }).then((r) => {
                        if (r.status === 200) {
                            Insert({
                                apiUrl: GENERAL_SETTINGS.OREST_URL,
                                endpoint: OREST_ENDPOINT.HCMITEMIMG,
                                token: authToken,
                                data: {
                                    itemid: state.hcmItemId,
                                    sliderid: r.data.data[0].id,
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
            setIsDeleting(true)
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
            setIsDeleting(false)
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

    const handleImageQualityChange = (value) => {
        if (value >= 10 && value <= 100 && value % 10 === 0) {
            if (sliderImages.length) {
                setIsLoaded(false)
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
                        setIsLoaded(true)
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
            setIsDeleting(true);
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
                setIsDeleting(false);
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

    if (!isLoaded) {
        return <LoadingSpinner style={{ color: COLORS.secondary }} />
    }

    return (
        <React.Fragment>
            {
                !router.query.sliderOnly && (
                    <Grid container={true}>
                        <Grid item xs={12}>
                            <div className={classes.alignRight}>
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
            <Grid container={true} justify={'flex-start'}>
                <Grid item xs={router?.query?.sliderOnly ? 8 : 5}>
                    <FormControlLabel
                        disabled={state.langCode !== state.defaultLang && !router.query.sliderOnly}
                        control={
                            <Checkbox
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
                        control={
                            <Checkbox
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
            <Grid container={true} justify={'flex-start'} spacing={3} className={isSaving ? classes.disableEvent : ''}>
                <Grid
                    item
                    xs={5}
                    className={
                        otherLangSlider && 'slider' in otherLangSlider && state.langCode !== state.defaultLang
                            ? classes.disableEvent
                            : ''
                    }
                >
                    <Paper className={classes.paperBlock}>
                        {sliderImages.length > 0 &&
                            sliderImages.map((image, index) => {
                                return (
                                    <Grid
                                        key={index}
                                        container
                                        justify={'center'}
                                        className={isDeleting ? classes.disableEvent : ''}
                                    >
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
                                                            GENERAL_SETTINGS.STATIC_URL + image.fileurl
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
                                                    onClick={() => handleSelectedImage(index, image)}
                                                >
                                                    {showDeleteBtn && hoverIndex === index && (
                                                        <IconButton
                                                            disabled={
                                                                state.langCode !== state.defaultLang &&
                                                                !router.query.sliderOnly
                                                            }
                                                            component="span"
                                                            color={'primary'}
                                                            className={
                                                                index === sliderImages.length - 1
                                                                    ? classes.disableEvent
                                                                    : ''
                                                            }
                                                            onClick={() =>
                                                                handleUpdateOrderNo(
                                                                    image.gid,
                                                                    image.orderno + 1,
                                                                    'increment'
                                                                )
                                                            }
                                                        >
                                                            <AddCircleIcon />
                                                        </IconButton>
                                                    )}
                                                    {showDeleteBtn && hoverIndex === index && (
                                                        <Typography component="span" color={'primary'}>
                                                            {image.orderno}
                                                        </Typography>
                                                    )}
                                                    {showDeleteBtn && hoverIndex === index && (
                                                        <IconButton
                                                            disabled={
                                                                state.langCode !== state.defaultLang &&
                                                                !router.query.sliderOnly
                                                            }
                                                            component="span"
                                                            color={'primary'}
                                                            className={index === 0 ? classes.disableEvent : ''}
                                                            onClick={() =>
                                                                handleUpdateOrderNo(
                                                                    image.gid,
                                                                    image.orderno - 1,
                                                                    'decrement'
                                                                )
                                                            }
                                                        >
                                                            <RemoveCircleIcon />
                                                        </IconButton>
                                                    )}
                                                    {showDeleteBtn && hoverIndex === index && (
                                                        <IconButton
                                                            disabled={
                                                                state.langCode !== state.defaultLang &&
                                                                !router.query.sliderOnly
                                                            }
                                                            onClick={() => handleDeleteImage(image.gid)}
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
                <Grid item xs={7} className={itemDescRequest ? classes.disableEvent : ''}>
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
                                    <Typography component={'div'} style={{ marginTop: 16 }}>
                                        <Switch
                                            size={'small'}
                                            checked={isCta}
                                            onChange={() => {
                                                setIsCta(!isCta)
                                                setCtaTitle('')
                                                setCtaLink('')
                                                setCta('')
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
                                    <FormControl component="fieldset" disabled={state?.langCode !== state?.defaultLang}>
                                        <RadioGroup
                                            aria-label="link-type"
                                            row
                                            value={ctaLinkType}
                                            onChange={(e) => {
                                                const { value } = e?.target
                                                setLocalState((prev) => ({
                                                    ...prev,
                                                    ctaLinkType: value,
                                                    ctaLink: value === 'internal' ? pageData[0]?.code : '',
                                                }))
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
                                <Grid container justify={'flex-start'} spacing={1}>
                                    <Grid item xs={6}>
                                        <TextField
                                            size={'small'}
                                            id="cta-title"
                                            variant={'outlined'}
                                            label={'Title'}
                                            fullWidth
                                            value={ctaTitle}
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
                                                id="cta-link"
                                                variant={'outlined'}
                                                label={'Link'}
                                                fullWidth
                                                value={ctaLink}
                                                error={ctaLink ? !validator.isURL(ctaLink) : false}
                                                onChange={(e) => setCtaLink(e.target.value)}
                                                style={{ marginTop: 8 }}
                                                disabled={state.langCode !== state.defaultLang}
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
                                                disabled={state?.langCode !== state?.defaultLang}
                                            >
                                                <Select
                                                    value={ctaLink}
                                                    onChange={(e) => {
                                                        const { value } = e?.target
                                                        setCtaLink(value);
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
                onClose={closeDialog}
                filesLimit={5}
            />
            {isTextEditorDialogOpen && (
                <TextEditor
                    handleSaveTextEditor={handleTextEditorValue}
                    handleCancelTextEditor={handleCancelEditor}
                    data={editorValue}
                />
            )}
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.pageBuilder,
    }
}

export default connect(mapStateToProps)(EditSlider)
