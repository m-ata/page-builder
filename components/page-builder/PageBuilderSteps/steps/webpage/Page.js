//react imports
import React, { useCallback, useContext, useEffect, useState } from 'react'
//material imports
import { Container } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
import BorderColorSharpIcon from '@material-ui/icons/BorderColorSharp'
import DeleteIcon from '@material-ui/icons/Delete'
import IconButton from '@material-ui/core/IconButton'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
//redux imports
import { connect } from 'react-redux'
import { updateState, pushToState, deleteFromState, setToState } from '../../../../../state/actions'
//custom  components imports
import Slider from '../../components/page/sections/slider/Slider'
import Image from '../../components/page/sections/image/Image'
import Paragraph from '../../components/page/sections/paragraph/Paragraph'
import WidgetBooking from '../../../../ibe/widget/booking'
import EditSection from '../../components/page/sections/EditSection'
import AddSection from '../../components/page/sections/AddSection'
import ContactForm from '../../components/page/sections/contact-form/ContactForm'
import WrappedMap from '../../components/page/sections/map/Map'
import SliderOnlyPreview from '../../components/page/sections/slider-only/Slider'
import LanguageDropdown from '../../components/language/LanguageDropdown'
import { AlertDialog } from '../../components/alert'
import LoadingSpinner from '../../../../LoadingSpinner'
import SliderGallery from '../../components/page/sections/slider-gallery/SliderGallery'
import CardSlider from '../../components/page/sections/card-type-slider/CardSlider'
import Video from '../../components/page/sections/video/Video'

import WebCmsGlobal from 'components/webcms-global'
import { useRouter } from 'next/router'
import {
    FIELDTYPE,
    isErrorMsg,
    OREST_ENDPOINT,
    OREST_UPLOAD,
    REQUEST_METHOD_CONST,
} from '../../../../../model/orest/constants'
import { toast } from 'react-toastify'
import axios from 'axios'
import { Insert, ViewList } from '@webcms/orest'
import { COLORS, DELETE_SUCCESS } from '../../constants'
import clsx from 'clsx'
import { now } from 'moment'
import {array} from "prop-types";

const useStyles = makeStyles((theme) => ({
    centreContent: {
        display: 'flex',
        justifyContent: 'center',
    },
    cursorPointer: {
        cursor: 'pointer',
        color: 'silver',
    },
    langFormControl: {
        minWidth: 250,
        marginRight: theme.spacing(1),
        marginTop: theme.spacing(2),
        float: 'right',
    },
    titleButton: {
        marginLeft: theme.spacing(2),
        marginTop: theme.spacing(3),
        borderRadius: 20,
    },
    disabledSectionTxt: {
        pointerEvents: 'none',
        opacity: 0.5,
    },
}))

const defaultProps = {
    bgcolor: 'background.paper',
    border: 1,
    borderColor: 'silver',
}

const Page = (props) => {
    const { state, deleteFromState, setToState, updateState } = props

    const [renderDialog, setRenderDialog] = useState('')
    const [isAlert, setAlert] = React.useState(false)
    const [alertDialogType, setAlertDialogType] = useState('')
    const [deletedIndex, setDeletedIndex] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [isRequestSend, setRequestSend] = useState(false)
    const [isLoaded, setIsLoaded] = useState(true)

    const classes = useStyles()

    const router = useRouter()
    const companyId = router.query.companyID
    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal)
    const authToken = token || router.query.authToken

    useEffect(() => {
        //getting web page from rafile
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token: authToken,
            params: {
                hotelrefno: Number(companyId),
                query: `filetype:WEBPAGE`,
            },
        }).then((res) => {
            if (res.status === 200 && res.data && res.data.data) {
                const page = {
                    id: `page-${res.data.data.length + 1}`,
                    sections: state.page.sections,
                }
                setToState('pageBuilder', ['page'], page)
            }
        })
        if (state.isTemplate) {
            state?.previousStep === 0 ? handleGenerateNewTemplate() : null
        }
    }, [])

    const handleGenerateNewTemplate = async () => {
        setIsLoaded(false)
        let updatedSections = [...state.page.sections]
        let revampedSections = []
        for (let section of updatedSections) {
            let updatedSection = { ...section }
            for (let item of section.items) {
                const itemIndex = section.items.indexOf(item)
                const updatedItem = { ...item }
                if (item?.type === 'paragraph') {
                    const textGid = await handleParagraphCopy(item)
                    updatedItem['gid'] = textGid
                    updatedSection.items[itemIndex] = { ...updatedItem }
                }
                if (item?.type === 'image') {
                    const imageGid = await handleImageCopy(item)
                    updatedItem['gid'] = imageGid
                    updatedSection.items[itemIndex] = { ...updatedItem }
                }
                if (item?.type === 'slider' || item?.type === 'slider-gallery' || item?.type === 'card-slider') {
                    const sliderGid = await handleSliderCopy(item)
                    updatedItem['gid'] = sliderGid
                    updatedSection.items[itemIndex] = { ...updatedItem }
                }
            }
            revampedSections.push(updatedSection)
        }
        setToState('pageBuilder', ['page', 'sections'], revampedSections)
        setIsLoaded(true)
    }

    const handleSliderCopy = async (item) => {
        const HCMITEMSLD_OPTION = {
            url:
                GENERAL_SETTINGS.OREST_URL +
                OREST_ENDPOINT.SLASH +
                OREST_ENDPOINT.HCMITEMSLD +
                OREST_ENDPOINT.SLASH +
                'view/list',
            method: REQUEST_METHOD_CONST.GET,
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            params: {
                hotelrefno: Number(companyId),
                query: `gid::${item.gid}`,
            },
        }
        const slider = await getData(HCMITEMSLD_OPTION)
        const HCMITEMSLDINS_OPTIONS = {
            url:
                GENERAL_SETTINGS.OREST_URL +
                OREST_ENDPOINT.SLASH +
                OREST_ENDPOINT.HCMITEMSLD +
                OREST_ENDPOINT.SLASH +
                'ins',
            method: REQUEST_METHOD_CONST.POST,
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            data: {
                itemid: state.hcmItemId,
                hotelrefno: Number(companyId),
            },
        }

        const insSlider = await handleInsertData(HCMITEMSLDINS_OPTIONS)

        const HCMITEMIMG_OPTION = {
            url:
                GENERAL_SETTINGS.OREST_URL +
                OREST_ENDPOINT.SLASH +
                OREST_ENDPOINT.HCMITEMIMG +
                OREST_ENDPOINT.SLASH +
                'view/list',
            method: REQUEST_METHOD_CONST.GET,
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            params: {
                hotelrefno: Number(companyId),
                query: `sliderid::${slider[0].id}`,
            },
        }
        const images = await getData(HCMITEMIMG_OPTION)
        for (let image of images) {
            const insertedImage = await handleImageCopy(image, insSlider?.id)
        }
        return insSlider?.gid || null
    }

    const handleImageCopy = async (item, sliderID) => {
        const HCMITEMIMG_OPTION = {
            url:
                GENERAL_SETTINGS.OREST_URL +
                OREST_ENDPOINT.SLASH +
                OREST_ENDPOINT.HCMITEMIMG +
                OREST_ENDPOINT.SLASH +
                'view/list',
            method: REQUEST_METHOD_CONST.GET,
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            params: {
                hotelrefno: Number(companyId),
                query: `gid::${item.gid}`,
            },
        }
        const image = await getData(HCMITEMIMG_OPTION)
        if (image?.length > 0) {
            const FILEGET_OPTION = {
                url:
                    GENERAL_SETTINGS.OREST_URL +
                    OREST_ENDPOINT.SLASH +
                    OREST_ENDPOINT.RAFILE +
                    OREST_ENDPOINT.SLASH +
                    'view/list',
                method: REQUEST_METHOD_CONST.GET,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': '0000510',
                },
                params: {
                    hotelrefno: Number(companyId),
                    query: `masterid::${image[0].mid}`,
                },
            }
            const file = await getData(FILEGET_OPTION)
            if (file.length > 0) {
                const downloadedFile = await fileDownload({
                    url: `${GENERAL_SETTINGS.OREST_URL}/tools/file/download`,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                    method: 'get',
                    responseType: 'arraybuffer',
                    params: {
                        gid: file[0]?.gid,
                        hotelrefno: companyId,
                    },
                })
                let blob = new Blob([downloadedFile?.data], { type: downloadedFile?.data?.type })
                const imageUrl =
                    GENERAL_SETTINGS.STATIC_URL + file[0]?.url.replace('/var/otello', '').replace('/public', '')
                const m = imageUrl.replace(/^.*[\\\/]/, '')
                const imageType = m.split('.')[1]
                const fileObject = new File([blob], m, {
                    lastModified: new Date(now()),
                    type: 'image/' + imageType,
                })
                let data = {}
                sliderID
                    ? (data = {
                          itemid: state.hcmItemId,
                          imgtype: FIELDTYPE.IMG,
                          title: image[0]?.title,
                          description: image[0]?.description,
                          cta: image[0]?.cta,
                          orderno: 1,
                          hotelrefno: Number(companyId),
                          sliderid: sliderID,
                      })
                    : (data = {
                          itemid: state.hcmItemId,
                          imgtype: FIELDTYPE.IMG,
                          title: image[0]?.title,
                          description: image[0]?.description,
                          cta: image[0]?.cta,
                          orderno: 1,
                          hotelrefno: Number(companyId),
                      })
                const HCMITEMINS = {
                    url:
                        GENERAL_SETTINGS.OREST_URL +
                        OREST_ENDPOINT.SLASH +
                        OREST_ENDPOINT.HCMITEMIMG +
                        OREST_ENDPOINT.SLASH +
                        'ins',
                    method: REQUEST_METHOD_CONST.POST,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                    data: data,
                }
                const imageInsert = await handleInsertData(HCMITEMINS)
                if (imageInsert) {
                    let binaryData = []
                    binaryData.push(fileObject)
                    let formData = new FormData()
                    formData.append('file', new Blob(binaryData, { type: fileObject.type }), fileObject.name)
                    const uploadOptions = {
                        url: GENERAL_SETTINGS.OREST_URL + OREST_ENDPOINT.SLASH + OREST_ENDPOINT.RAFILE + OREST_UPLOAD,
                        method: 'post',
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                            'Content-Type': 'multipart/form-data',
                        },
                        params: {
                            orsactive: true,
                            masterid: imageInsert?.mid,
                            hotelrefno: companyId,
                        },
                        data: formData,
                    }
                    const uploadedFile = await handleInsertData(uploadOptions)
                    if (uploadedFile?.url) {
                        return imageInsert?.gid
                    }
                    return null
                }
            }
        }
    }

    useEffect(() => {
        if (state?.hcmItemId) {
            setRequestSend(true)
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMLANG,
                token: authToken,
                params: {
                    hotelrefno: Number(companyId),
                    query: `langid::${state?.langId},itemid::${state?.hcmItemId}`,
                },
            }).then((res) => {
                if (res.status === 200) {
                    if (res?.data?.data?.length === 0) {
                        // insert hcmitemlang for default language
                        Insert({
                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                            endpoint: OREST_ENDPOINT.HCMITEMLANG,
                            token: authToken,
                            data: {
                                itemid: state?.hcmItemId,
                                hotelrefno: Number(companyId),
                                langid: state?.langId,
                            },
                        }).then((res1) => {
                            if (res1.status === 200) {
                                if (res?.data?.success && res?.data?.data) {
                                    setRequestSend(false)
                                }
                            } else {
                                const retErr = isErrorMsg(res1)
                                toast.error(retErr.errorMsg, {
                                    position: toast.POSITION.TOP_RIGHT,
                                })
                            }
                        })
                    } else {
                        setRequestSend(false)
                    }
                } else {
                    setRequestSend(false)
                    const retErr = isErrorMsg(res)
                    toast.error(retErr.errorMsg, {
                        position: toast.POSITION.TOP_RIGHT,
                    })
                }
            })
        }
    }, [state?.hcmItemId])

    const handleParagraphCopy = async (item) => {
        const HCMITEMTXTPAR_OPTION = {
            url:
                GENERAL_SETTINGS.OREST_URL +
                OREST_ENDPOINT.SLASH +
                OREST_ENDPOINT.HCMITEMTXTPAR +
                OREST_ENDPOINT.SLASH +
                'view/list',
            method: REQUEST_METHOD_CONST.GET,
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            params: {
                hotelrefno: Number(companyId),
                query: `gid::${item.gid}`,
            },
        }
        const paragraph = await getData(HCMITEMTXTPAR_OPTION)
        if (paragraph?.length > 0) {
            const HCMITEM_OPTION = {
                url:
                    GENERAL_SETTINGS.OREST_URL +
                    OREST_ENDPOINT.SLASH +
                    OREST_ENDPOINT.HCMITEMTXT +
                    OREST_ENDPOINT.SLASH +
                    'ins',
                method: REQUEST_METHOD_CONST.POST,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                data: {
                    itemid: state?.hcmItemId,
                    hotelrefno: Number(companyId),
                },
            }
            const hcmitem = await handleInsertData(HCMITEM_OPTION)
            const HCMITEMTXTPAR_OPTION = {
                url:
                    GENERAL_SETTINGS.OREST_URL +
                    OREST_ENDPOINT.SLASH +
                    OREST_ENDPOINT.HCMITEMTXTPAR +
                    OREST_ENDPOINT.SLASH +
                    'ins',
                method: REQUEST_METHOD_CONST.POST,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                data: {
                    itemid: hcmitem?.id,
                    itemtext: paragraph[0]?.itemtext,
                    hotelrefno: Number(companyId),
                },
            }
            const hcmItemTxtPar = await handleInsertData(HCMITEMTXTPAR_OPTION)
            return hcmItemTxtPar?.gid || null
        }
    }

    const getData = (option) => {
        return new Promise(async (resv) => {
            return await axios(option)
                .then(async (response) => {
                    if (response.status === 200) {
                        if (response?.data?.data) resv(response.data.data)
                    } else {
                        const retErr = isErrorMsg(response)
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT,
                        })
                    }
                })
                .catch((error) => {
                    console.log(error)
                    resv(error.response || { status: 0 })
                })
        })
    }

    const handleInsertData = (option) => {
        return new Promise(async (resv) => {
            return await axios(option)
                .then(async (response) => {
                    if (response.status === 200) {
                        if (response?.data?.data) resv(response.data.data)
                    } else {
                        const retErr = isErrorMsg(response)
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT,
                        })
                    }
                })
                .catch((error) => {
                    console.log(error)
                    resv(error.response || { status: 0 })
                })
        })
    }

    const fileDownload = (option) => {
        return new Promise(async (resv) => {
            return await axios(option)
                .then(async (response) => {
                    if (response.status === 200) {
                        resv(response)
                    } else {
                        const retErr = isErrorMsg(response)
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT,
                        })
                    }
                })
                .catch((error) => {
                    console.log(error)
                    resv(error.response || { status: 0 })
                })
        })
    }

    const onAddSection = (section, order) => {
        const updatedPage = { ...state?.page }
        updatedPage?.sections?.splice(order - 1, 0, section)
        updateState('pageBuilder', 'page', updatedPage);
        handleAddOtherLangSections(section, order);
    }

    const handleAddOtherLangSections = async (section, order) => {
        const updatedlangs = { ...state.langsFile };
        for (let lang in updatedlangs) {
            updatedlangs[lang]?.items.splice(order - 1, 0, {
                title: section?.title,
                subItems: []
            });
            for (let item of section.items) {
                const itemIndex = section.items.indexOf(item);
                if (item.type === 'image') {
                    const REQUEST_OPTION_GET_IMAGE = {
                        url: GENERAL_SETTINGS.OREST_URL + '/' + OREST_ENDPOINT.HCMITEMIMG + '/view/list',
                        method: 'get',
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                            'Content-Type': 'application/json',
                        },
                        params: {
                            hotelrefno: Number(companyId),
                            chkselfish: false,
                            query: `gid:${item.gid}`,
                        },
                    }
                    const img = await getImageData(REQUEST_OPTION_GET_IMAGE)
                    updatedlangs[lang].items[order - 1].subItems[itemIndex] = {
                        image: {
                            title: img.title,
                            description: img.description,
                        },
                    }
                }
                if (item.type === 'paragraph') {
                    const REQUEST_OPTION_GET_TEXT = {
                        url: GENERAL_SETTINGS.OREST_URL + '/' + OREST_ENDPOINT.HCMITEMTXTPAR + '/view/list',
                        method: 'get',
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                            'Content-Type': 'application/json',
                        },
                        params: {
                            hotelrefno: Number(companyId),
                            chkselfish: false,
                            query: `gid:${item.gid}`,
                        },
                    }
                    const text = await getTextData(REQUEST_OPTION_GET_TEXT)
                    updatedlangs[lang].items[order - 1].subItems[itemIndex] = {
                        text: text,
                    }
                }
                if (item.type === 'slider-gallery' || item.type === 'card-slider') {
                    const REQUEST_OPTION_GET_SLD = {
                        url: GENERAL_SETTINGS.OREST_URL + '/' + OREST_ENDPOINT.HCMITEMSLD + '/view/list',
                        method: 'get',
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                            'Content-Type': 'application/json',
                        },
                        params: {
                            hotelrefno: Number(companyId),
                            chkselfish: false,
                            query: `gid:${item.gid}`,
                        },
                    }
                    const slider = await getSliderData(REQUEST_OPTION_GET_SLD)
                    if (item.type === 'slider-gallery') {
                        updatedlangs[lang].items[order - 1].subItems[itemIndex] = {
                            sliderGallery: slider,
                        }
                    } else {
                        updatedlangs[lang].items[order - 1].subItems[itemIndex] = {
                            cardSlider: slider,
                        }
                    }
                }
                if (item.type === 'slider') {
                    const REQUEST_OPTION_GET_SLD = {
                        url: GENERAL_SETTINGS.OREST_URL + '/' + OREST_ENDPOINT.HCMITEMSLD + '/view/list',
                        method: 'get',
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                            'Content-Type': 'application/json',
                        },
                        params: {
                            hotelrefno: Number(companyId),
                            chkselfish: false,
                            query: `gid:${item.gid}`,
                        },
                    }
                    const slider = await getSliderData(REQUEST_OPTION_GET_SLD)
                    if (slider instanceof Array) {
                        updatedlangs[lang].items[order - 1].subItems[itemIndex] = {
                            sliderImages: slider,
                        }
                    } else {
                        if (slider instanceof Object) {
                            updatedlangs[lang].items[order - 1].subItems[itemIndex] = {
                                slider: slider,
                            }
                        }
                    }
                }
                if (item.type === 'widgetbooking') {
                    updatedlangs[lang].items[order - 1].subItems[itemIndex] = {
                        booking: true,
                    }
                }
                if (item.type === 'contactForm') {
                    let labels = []
                    if (item.gid && item.gid.length > 0) {
                        for (const gid of item.gid) {
                            gid.isActive &&
                            labels.push({
                                id: gid.id,
                                label: gid.label,
                            })
                        }
                    }
                    updatedlangs[lang].items[order - 1].subItems[itemIndex] = {
                        contactForm: {
                            labels: labels,
                        },
                    }
                }
                if (item.type === 'map') {
                    updatedlangs[lang].items[order - 1].subItems[itemIndex] = {
                        map: true,
                    }
                }
                if (item.type === 'sliderOnly') {
                    updatedlangs[lang].items[order - 1].subItems[itemIndex] = {
                        sliderOnly: true,
                    }
                }
            }
        }
        updateState('pageBuilder', 'langsFile', updatedlangs);
    }

    const resetRender = () => {
        setRenderDialog('')
    }

    const addSectionDialog = () => {
        setRenderDialog(<AddSection onAddSection={onAddSection} resetRender={resetRender} />)
    }

    const onEditSection = (newSection, index, order) => {
        if (state.langCode === state.defaultLang) {
            let updatedSections = [...state.page.sections]
            updatedSections.splice(index, 1)
            updatedSections.splice(order - 1, 0, newSection)
            setToState('pageBuilder', ['page', 'sections'], updatedSections)
        } else {
            if (Object.keys(state.langsFile[state.langCode]).length > 0) {
                const updatedLangs = { ...state.langsFile }
                const updatedItems = state.langsFile[state.langCode].items
                const items = {
                    title: newSection?.title,
                    subItems: newSection.items,
                }
                updatedItems[index] = items
                updatedLangs[state.langCode].items = updatedItems
                updateState('pageBuilder', 'langsFile', updatedLangs)
            }
        }
    }

    const editSectionDialog = (section, otherLangSection) => {
        setRenderDialog(
            <EditSection
                section={section}
                onEditSection={onEditSection}
                dialogTitle="Edit Section"
                isDialogOpen={true}
                resetRender={resetRender}
                otherLangSection={otherLangSection}
            />
        )
    }

    const handleDeleteSection = async (index) => {
        const section = state.page.sections[index]
        setIsDeleting(true)
        let req = []
        for (let component of section.items) {
            if (component.type === 'slider' || component.type === 'slider-gallery' || component.type === 'card-slider') {
                const REQUEST_OPTIONS_VIEWLIST_HCMITEMSLD = {
                    url: GENERAL_SETTINGS.OREST_URL + '/hcmitemsld/view/list',
                    method: 'get',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                    params: {
                        query: `gid:${component.gid}`,
                        chkselfish: false,
                        hotelrefno: Number(companyId),
                    },
                }
                const slider = await deleteSlider(REQUEST_OPTIONS_VIEWLIST_HCMITEMSLD, component.gid)
                req.push(slider)
            }
            if (component.type === 'image') {
                const REQUEST_OPTIONS_DELETE_HCMITEMIMG = {
                    url:
                        GENERAL_SETTINGS.OREST_URL +
                        OREST_ENDPOINT.SLASH +
                        OREST_ENDPOINT.HCMITEMIMG +
                        OREST_ENDPOINT.SLASH +
                        'del/' +
                        component.gid,
                    method: REQUEST_METHOD_CONST.DELETE,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                    params: {
                        hotelrefno: Number(companyId),
                    },
                }
                const image = await deleteImage(REQUEST_OPTIONS_DELETE_HCMITEMIMG)
                req.push(image)
            }
            if (component.type === 'paragraph') {
                const REQUEST_OPTIONS_DELETE_HCMITEMTXTPAR = {
                    url:
                        GENERAL_SETTINGS.OREST_URL +
                        OREST_ENDPOINT.SLASH +
                        OREST_ENDPOINT.HCMITEMTXTPAR +
                        OREST_ENDPOINT.SLASH +
                        'del/' +
                        component.gid,
                    method: REQUEST_METHOD_CONST.DELETE,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                    params: {
                        hotelrefno: Number(companyId),
                    },
                }
                const paragrapgh = await deleteParagraph(REQUEST_OPTIONS_DELETE_HCMITEMTXTPAR)
                req.push(paragrapgh)
            }
            if (component.type === 'widgetbooking') {
                const booking = await deleteBooking()
                req.push(booking)
            }
        }
        await Promise.all(req).then(async (res) => {
            let isSuccess = true
            await res.map((r) => {
                if (r.status !== 200) {
                    isSuccess = false
                    return
                }
            })
            setIsDeleting(false)
            if (isSuccess) {
                deleteFromState('pageBuilder', ['page', 'sections'], [index, 1])
                const updatedOtherLangs = state.langsFile
                for (const lang in updatedOtherLangs) {
                    if (updatedOtherLangs[lang].items && updatedOtherLangs[lang].items.length > 0) {
                        updatedOtherLangs[lang].items.splice(index, 1)
                    }
                }
                updateState('pageBuilder', 'langsFile', updatedOtherLangs)
                toast.success(DELETE_SUCCESS, {
                    position: toast.POSITION.TOP_RIGHT,
                })
            } else {
                toast.error('Something went wrong', {
                    position: toast.POSITION.TOP_RIGHT,
                })
            }
        })
    }

    const deleteImage = async (header) => {
        return new Promise(async (resv, rej) => {
            return await axios(header)
                .then(async (response) => {
                    if (response.status === 200 && response.data && response.data.success) {
                        resv(response)
                    } else {
                        const retErr = isErrorMsg(response)
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT,
                        })
                    }
                })
                .catch((error) => {
                    console.log(error)
                    resv(error.response || { status: 0 })
                })
        })
    }

    const deleteSlider = async (header, sliderGID) => {
        return new Promise(async (resv, rej) => {
            return await axios(header)
                .then(async (response) => {
                    if (response.status === 200) {
                        if (response?.data?.data?.length) {
                            const REQUEST_OPTIONS_VIEWLIST_HCMITEMIMG = {
                                url: GENERAL_SETTINGS.OREST_URL + '/hcmitemimg/view/list',
                                method: 'get',
                                headers: {
                                    Authorization: `Bearer ${authToken}`,
                                    'Content-Type': 'application/json',
                                },
                                params: {
                                    query: `sliderid:${response.data.data[0].id}`,
                                    chkselfish: false,
                                    hotelrefno: Number(companyId),
                                },
                            }
                            return await axios(REQUEST_OPTIONS_VIEWLIST_HCMITEMIMG).then(async (res) => {
                                let gids = []
                                let data = []
                                await res.data.data.map((d) => {
                                    data.push(d)
                                })
                                for (let gid in data) {
                                    gids.push({ gid: data[gid].gid })
                                }
                                const REQUEST_OPTIONS_DELETE_HCMITEMIMG = {
                                    url:
                                        GENERAL_SETTINGS.OREST_URL +
                                        OREST_ENDPOINT.SLASH +
                                        OREST_ENDPOINT.HCMITEMIMG +
                                        OREST_ENDPOINT.SLASH +
                                        OREST_ENDPOINT.LIST +
                                        OREST_ENDPOINT.SLASH +
                                        OREST_ENDPOINT.DEL,
                                    method: REQUEST_METHOD_CONST.DELETE,
                                    headers: {
                                        Authorization: `Bearer ${authToken}`,
                                        'Content-Type': 'application/json',
                                    },
                                    data: gids,
                                }
                                return await axios(REQUEST_OPTIONS_DELETE_HCMITEMIMG).then(async (response1) => {
                                    if (response1.status === 200 && response1.data && response1.data.success) {
                                        const REQUEST_OPTIONS_DELETE_HCMITEMSLD = {
                                            url:
                                                GENERAL_SETTINGS.OREST_URL +
                                                OREST_ENDPOINT.SLASH +
                                                OREST_ENDPOINT.HCMITEMSLD +
                                                OREST_ENDPOINT.SLASH +
                                                'del/' +
                                                sliderGID,
                                            method: REQUEST_METHOD_CONST.DELETE,
                                            headers: {
                                                Authorization: `Bearer ${authToken}`,
                                                'Content-Type': 'application/json',
                                            },
                                            params: {
                                                hotelrefno: Number(companyId),
                                            },
                                        }
                                        return await axios(REQUEST_OPTIONS_DELETE_HCMITEMSLD).then(
                                            async (response2) => {
                                                if (
                                                    response2.status === 200 &&
                                                    response2.data &&
                                                    response2.data.success
                                                ) {
                                                    resv(response2)
                                                } else {
                                                    const retErr = isErrorMsg(response2)
                                                    toast.error(retErr.errorMsg, {
                                                        position: toast.POSITION.TOP_RIGHT,
                                                    })
                                                }
                                            }
                                        )
                                    } else {
                                        const retErr = isErrorMsg(response1)
                                        toast.error(retErr.errorMsg, {
                                            position: toast.POSITION.TOP_RIGHT,
                                        })
                                    }
                                })
                            })
                        } else {
                            resv(response)
                        }
                    } else {
                        const retErr = isErrorMsg(response)
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT,
                        })
                    }
                })
                .catch((error) => {
                    console.log(error)
                    resv(error.response || { status: 0 })
                })
        })
    }

    const deleteParagraph = async (header) => {
        return new Promise(async (resv, rej) => {
            return await axios(header)
                .then(async (response) => {
                    if (response.status === 200 && response.data && response.data.success) {
                        resv(response)
                    } else {
                        const retErr = isErrorMsg(response)
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT,
                        })
                    }
                })
                .catch((error) => {
                    console.log(error)
                    resv(error.response || { status: 0 })
                })
        })
    }

    const deleteBooking = async () => {
        return new Promise(async (resv, rej) => {
            resv({
                status: 200,
                msg: 'delete successfully',
            })
        })
    }

    const getColumnWidth = (width) => {
        return Math.floor((width / 100) * 12)
    }

    const handleDelete = (type, isDelete) => {
        if (isDelete) {
            handleDeleteSection(deletedIndex)
        }
        setAlert(false)
    }

    const handleLanguageChange = useCallback(
        (lang) => {
            setIsDeleting(true)
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMLANG,
                token: authToken,
                params: {
                    hotelrefno: Number(companyId),
                    query: `langid::${lang?.id},itemid::${state?.hcmItemId}`,
                },
            }).then((res) => {
                if (res.status === 200) {
                    if (res?.data?.data?.length === 0) {
                        if (lang?.code?.toLowerCase() !== state?.defaultLang) {
                            //insert specific language into hcmitemlang
                            Insert({
                                apiUrl: GENERAL_SETTINGS.OREST_URL,
                                endpoint: OREST_ENDPOINT.HCMITEMLANG,
                                token: authToken,
                                data: {
                                    itemid: state.hcmItemId,
                                    hotelrefno: Number(companyId),
                                    langid: lang?.id,
                                },
                            }).then((res1) => {
                                setIsDeleting(false)
                                if (res1.status === 200) {
                                    if (res?.data?.success && res?.data?.data) {
                                        handleSetLangContent(lang)
                                    }
                                } else {
                                    const retErr = isErrorMsg(res1)
                                    toast.error(retErr.errorMsg, {
                                        position: toast.POSITION.TOP_RIGHT,
                                    })
                                }
                            })
                        } else {
                            setIsDeleting(false)
                        }
                    } else {
                        setIsDeleting(false)
                        handleSetLangContent(lang)
                    }
                } else {
                    setIsDeleting(false)
                    const retErr = isErrorMsg(res)
                    toast.error(retErr.errorMsg, {
                        position: toast.POSITION.TOP_RIGHT,
                    })
                }
            })
        },
        [state.langId]
    )

    const handleSetLangContent = async (lang) => {
        const code = lang?.code.toLowerCase()
        updateState('pageBuilder', 'langCode', code)
        updateState('pageBuilder', 'langId', lang?.id)
        const updatelangsFile = { ...state.langsFile }
        if (code !== state.defaultLang) {
            if (!updatelangsFile[code]) {
                if (state.page.sections.length > 0) {
                    updatelangsFile[code] = {
                        items: [],
                    }
                    for (let section of state.page.sections) {
                        const sectionIndex = state.page.sections.indexOf(section)
                        updatelangsFile[code].items.push({
                            title: section?.title,
                            subItems: [],
                        })
                        for (let item of section.items) {
                            const itemIndex = section.items.indexOf(item)
                            if (item.type === 'image') {
                                const REQUEST_OPTION_GET_IMAGE = {
                                    url: GENERAL_SETTINGS.OREST_URL + '/' + OREST_ENDPOINT.HCMITEMIMG + '/view/list',
                                    method: 'get',
                                    headers: {
                                        Authorization: `Bearer ${authToken}`,
                                        'Content-Type': 'application/json',
                                    },
                                    params: {
                                        hotelrefno: Number(companyId),
                                        chkselfish: false,
                                        query: `gid:${item.gid}`,
                                    },
                                }
                                const img = await getImageData(REQUEST_OPTION_GET_IMAGE)
                                updatelangsFile[code].items[sectionIndex].subItems[itemIndex] = {
                                    image: {
                                        title: img.title,
                                        description: img.description,
                                    },
                                }
                            }
                            if (item.type === 'paragraph') {
                                const REQUEST_OPTION_GET_TEXT = {
                                    url: GENERAL_SETTINGS.OREST_URL + '/' + OREST_ENDPOINT.HCMITEMTXTPAR + '/view/list',
                                    method: 'get',
                                    headers: {
                                        Authorization: `Bearer ${authToken}`,
                                        'Content-Type': 'application/json',
                                    },
                                    params: {
                                        hotelrefno: Number(companyId),
                                        chkselfish: false,
                                        query: `gid:${item.gid}`,
                                    },
                                }
                                const text = await getTextData(REQUEST_OPTION_GET_TEXT)
                                updatelangsFile[code].items[sectionIndex].subItems[itemIndex] = {
                                    text: text,
                                }
                            }
                            if (item.type === 'slider-gallery' || item.type === 'card-slider') {
                                const REQUEST_OPTION_GET_SLD = {
                                    url: GENERAL_SETTINGS.OREST_URL + '/' + OREST_ENDPOINT.HCMITEMSLD + '/view/list',
                                    method: 'get',
                                    headers: {
                                        Authorization: `Bearer ${authToken}`,
                                        'Content-Type': 'application/json',
                                    },
                                    params: {
                                        hotelrefno: Number(companyId),
                                        chkselfish: false,
                                        query: `gid:${item.gid}`,
                                    },
                                }
                                const slider = await getSliderData(REQUEST_OPTION_GET_SLD)
                                if (item.type === 'slider-gallery') {
                                    updatelangsFile[code].items[sectionIndex].subItems[itemIndex] = {
                                        sliderGallery: slider,
                                    }
                                } else {
                                    updatelangsFile[code].items[sectionIndex].subItems[itemIndex] = {
                                        cardSlider: slider,
                                    }
                                }
                            }
                            if (item.type === 'slider') {
                                const REQUEST_OPTION_GET_SLD = {
                                    url: GENERAL_SETTINGS.OREST_URL + '/' + OREST_ENDPOINT.HCMITEMSLD + '/view/list',
                                    method: 'get',
                                    headers: {
                                        Authorization: `Bearer ${authToken}`,
                                        'Content-Type': 'application/json',
                                    },
                                    params: {
                                        hotelrefno: Number(companyId),
                                        chkselfish: false,
                                        query: `gid:${item.gid}`,
                                    },
                                }
                                const slider = await getSliderData(REQUEST_OPTION_GET_SLD)
                                if (slider instanceof Array) {
                                    updatelangsFile[code].items[sectionIndex].subItems[itemIndex] = {
                                        sliderImages: slider,
                                    }
                                } else {
                                    if (slider instanceof Object) {
                                        updatelangsFile[code].items[sectionIndex].subItems[itemIndex] = {
                                            slider: slider,
                                        }
                                    }
                                }
                            }
                            if (item.type === 'widgetbooking') {
                                updatelangsFile[code].items[sectionIndex].subItems[itemIndex] = {
                                    booking: true,
                                }
                            }
                            if (item.type === 'contactForm') {
                                let labels = []
                                if (item.gid && item.gid.length > 0) {
                                    for (const gid of item.gid) {
                                        gid.isActive &&
                                            labels.push({
                                                id: gid.id,
                                                label: gid.label,
                                            })
                                    }
                                }
                                updatelangsFile[code].items[sectionIndex].subItems[itemIndex] = {
                                    contactForm: {
                                        labels: labels,
                                    },
                                }
                            }
                            if (item.type === 'map') {
                                updatelangsFile[code].items[sectionIndex].subItems[itemIndex] = {
                                    map: true,
                                }
                            }
                            if (item.type === 'sliderOnly') {
                                updatelangsFile[code].items[sectionIndex].subItems[itemIndex] = {
                                    sliderOnly: true,
                                }
                            }
                        }
                        updateState('pageBuilder', 'langsFile', updatelangsFile)
                    }
                }

            } else {
                if (updatelangsFile[code].items.length !== state.page.sections) {
                    for(let i = 0; i < state.page.sections.length; i++ ) {
                        if (i > updatelangsFile[code]?.items?.length - 1) {
                            updatelangsFile[code].items.push({
                                title: state?.page?.sections[i]?.title,
                                subItems: [],
                            })
                        } else {
                            updatelangsFile[code].items[i].subItems.length = state.page.sections[i].items.length;
                        }
                        for (let item of state.page.sections[i].items) {
                            const itemIndex = state.page.sections[i].items.indexOf(item);
                            if (item.type === 'image') {
                                const REQUEST_OPTION_GET_IMAGE = {
                                    url: GENERAL_SETTINGS.OREST_URL + '/' + OREST_ENDPOINT.HCMITEMIMG + '/view/list',
                                    method: 'get',
                                    headers: {
                                        Authorization: `Bearer ${authToken}`,
                                        'Content-Type': 'application/json',
                                    },
                                    params: {
                                        hotelrefno: Number(companyId),
                                        chkselfish: false,
                                        query: `gid:${item.gid}`,
                                    },
                                }
                                const img = await getImageData(REQUEST_OPTION_GET_IMAGE);
                                if (!updatelangsFile[code]?.items[i]?.subItems[itemIndex]?.image) {
                                    updatelangsFile[code].items[i].subItems[itemIndex] = {
                                        image: {
                                            title: img.title,
                                            description: img.description,
                                        },
                                    }
                                }
                            }
                            if (item.type === 'paragraph') {
                                const REQUEST_OPTION_GET_TEXT = {
                                    url: GENERAL_SETTINGS.OREST_URL + '/' + OREST_ENDPOINT.HCMITEMTXTPAR + '/view/list',
                                    method: 'get',
                                    headers: {
                                        Authorization: `Bearer ${authToken}`,
                                        'Content-Type': 'application/json',
                                    },
                                    params: {
                                        hotelrefno: Number(companyId),
                                        chkselfish: false,
                                        query: `gid:${item.gid}`,
                                    },
                                }
                                const text = await getTextData(REQUEST_OPTION_GET_TEXT);
                                if (!updatelangsFile[code]?.items[i]?.subItems[itemIndex]?.text) {
                                    updatelangsFile[code].items[i].subItems[itemIndex] = {
                                        text: text,
                                    }
                                }
                            }
                            if (item.type === 'slider-gallery' || item.type === 'card-slider') {
                                const REQUEST_OPTION_GET_SLD = {
                                    url: GENERAL_SETTINGS.OREST_URL + '/' + OREST_ENDPOINT.HCMITEMSLD + '/view/list',
                                    method: 'get',
                                    headers: {
                                        Authorization: `Bearer ${authToken}`,
                                        'Content-Type': 'application/json',
                                    },
                                    params: {
                                        hotelrefno: Number(companyId),
                                        chkselfish: false,
                                        query: `gid:${item.gid}`,
                                    },
                                }
                                const slider = await getSliderData(REQUEST_OPTION_GET_SLD)
                                if (item.type === 'slider-gallery') {
                                    if (!updatelangsFile[code]?.items[i]?.subItems[itemIndex]?.sliderGallery) {
                                        updatelangsFile[code].items[i].subItems[itemIndex] = {
                                            sliderGallery: slider,
                                        }
                                    }
                                } else {
                                    if (!updatelangsFile[code]?.items[i]?.subItems[itemIndex]?.cardSlider) {
                                        updatelangsFile[code].items[i].subItems[itemIndex] = {
                                            cardSlider: slider,
                                        }
                                    }
                                }
                            }
                            if (item.type === 'slider') {
                                const REQUEST_OPTION_GET_SLD = {
                                    url: GENERAL_SETTINGS.OREST_URL + '/' + OREST_ENDPOINT.HCMITEMSLD + '/view/list',
                                    method: 'get',
                                    headers: {
                                        Authorization: `Bearer ${authToken}`,
                                        'Content-Type': 'application/json',
                                    },
                                    params: {
                                        hotelrefno: Number(companyId),
                                        chkselfish: false,
                                        query: `gid:${item.gid}`,
                                    },
                                }
                                const slider = await getSliderData(REQUEST_OPTION_GET_SLD)
                                if (slider instanceof Array) {
                                    if (!updatelangsFile[code]?.items[i]?.subItems[itemIndex]?.sliderImages) {
                                        updatelangsFile[code].items[i].subItems[itemIndex] = {
                                            sliderImages: slider,
                                        }
                                    }
                                } else {
                                    if (slider instanceof Object) {
                                        if (!updatelangsFile[code]?.items[i]?.subItems[itemIndex]?.slider) {
                                            updatelangsFile[code].items[i].subItems[itemIndex] = {
                                                slider: slider,
                                            }
                                        }
                                    }
                                }
                            }
                            if (item.type === 'widgetbooking') {
                                if (!updatelangsFile[code]?.items[i]?.subItems[itemIndex]?.booking) {
                                    updatelangsFile[code].items[i].subItems[itemIndex] = {
                                        booking: true,
                                    }
                                }
                            }
                            if (item.type === 'map') {
                                if (!updatelangsFile[code]?.items[i]?.subItems[itemIndex]?.map) {
                                    updatelangsFile[code].items[i].subItems[itemIndex] = {
                                        map: true,
                                    }
                                }
                            }
                            if (item.type === 'sliderOnly') {
                                if (!updatelangsFile[code]?.items[i]?.subItems[itemIndex]?.sliderOnly) {
                                    updatelangsFile[code].items[i].subItems[itemIndex] = {
                                        sliderOnly: true,
                                    }
                                }
                            }
                            if (item.type === 'contactForm') {
                                let labels = []
                                if (item.gid && item.gid.length > 0) {
                                    for (const gid of item.gid) {
                                        gid.isActive &&
                                        labels.push({
                                            id: gid.id,
                                            label: gid.label,
                                        })
                                    }
                                }
                                if (!updatelangsFile[code]?.items[i]?.subItems[itemIndex]?.contactForm) {
                                    updatelangsFile[code].items[i].subItems[itemIndex] = {
                                        contactForm: {
                                            labels: labels,
                                        },
                                    }
                                }
                            }
                        }
                    }
                    updateState('pageBuilder', 'langsFile', updatelangsFile)
                }
            }
        }
    }

    const getImageData = async (header) => {
        return new Promise(async (resv, rej) => {
            return await axios(header)
                .then(async (response) => {
                    if (response.status === 200 && response.data && response.data.data.length > 0) {
                        resv({
                            title: response.data.data[0].title,
                            description: response.data.data[0].description,
                        })
                    } else {
                        const retErr = isErrorMsg(response)
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT,
                        })
                    }
                })
                .catch((error) => {
                    console.log(error)
                    resv(error.response || { status: 0 })
                })
        })
    }

    const getTextData = async (header) => {
        return new Promise(async (resv, rej) => {
            return await axios(header)
                .then(async (response) => {
                    if (response.status === 200 && response.data && response.data.data.length > 0) {
                        resv(response.data.data[0].itemtext)
                    } else {
                        const retErr = isErrorMsg(response)
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT,
                        })
                    }
                })
                .catch((error) => {
                    console.log(error)
                    resv(error.response || { status: 0 })
                })
        })
    }

    const getSliderData = async (header) => {
        return new Promise(async (resv, rej) => {
            return await axios(header)
                .then(async (response) => {
                    if (response.status === 200 && response.data && response.data.data.length > 0) {
                        if (
                            response.data.data[0].title ||
                            response.data.data[0].description ||
                            response.data.data[0].cta
                        ) {
                            resv({
                                title: response.data.data[0].title,
                                description: response.data.data[0].description,
                                cta: response.data.data[0].cta,
                            })
                        } else {
                            const REQUEST_OPTIONS_GET_HCMITEMIMG = {
                                url: GENERAL_SETTINGS.OREST_URL + '/hcmitemimg/view/list',
                                method: 'get',
                                headers: {
                                    Authorization: `Bearer ${authToken}`,
                                    'Content-Type': 'application/json',
                                },
                                params: {
                                    query: `sliderid:${response.data.data[0].id}`,
                                    hotelrefno: Number(companyId),
                                    chkselfish: false,
                                    sort: 'orderno',
                                },
                            }
                            return await axios(REQUEST_OPTIONS_GET_HCMITEMIMG).then(async (res) => {
                                if (res.status === 200 && res.data && res.data.data.length > 0) {
                                    let updatedSliderImages = []
                                    await res.data.data.map((r) => {
                                        updatedSliderImages.push({
                                            title: r.title,
                                            description: r.description,
                                            cta: r.cta,
                                        })
                                    })
                                    resv(updatedSliderImages)
                                }
                            })
                        }
                    } else {
                        const retErr = isErrorMsg(response)
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT,
                        })
                    }
                })
                .catch((error) => {
                    console.log(error)
                    resv(error.response || { status: 0 })
                })
        })
    }

    if (isRequestSend || !isLoaded) {
        return <LoadingSpinner style={{ color: COLORS.secondary }} />
    }

    return (
        <Container className={isDeleting ? classes.disabledSectionTxt : ''}>
            <Typography
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                }}
                component={'div'}
                className={state?.page?.sections?.length === 0 ? classes.disabledSectionTxt : ''}
            >
                <LanguageDropdown handleChange={handleLanguageChange} langID={state?.langId} />
            </Typography>
            <Box {...defaultProps}>
                <div style={{ minHeight: '50vh' }}>
                    {state.langCode !== state.defaultLang &&
                        state.langsFile[state.langCode] &&
                        state.langsFile[state.langCode].items.length > 0 &&
                        state.langsFile[state.langCode].items.map((item, index) => {
                            return (
                                <div key={index}>
                                    <IconButton
                                        aria-label="Edit item"
                                        color="primary"
                                        onClick={() => editSectionDialog(state.page.sections[index], item)}
                                    >
                                        <BorderColorSharpIcon color="primary" />
                                    </IconButton>
                                    <Container style={{ pointerEvents: 'none' }}>
                                        {item?.title && (
                                            <Grid container spacing={1} justify={'flex-start'}>
                                                <Grid item xs={12}>
                                                    <div dangerouslySetInnerHTML={{ __html: item.title }}></div>
                                                </Grid>
                                            </Grid>
                                        )}
                                        <Grid container spacing={1} justify={'flex-start'}>
                                            {item.subItems.length > 0 &&
                                                item.subItems.map((subItem, i) => {
                                                    return (
                                                        <Grid
                                                            key={i}
                                                            item
                                                            xs={getColumnWidth(
                                                                state?.page?.sections[index]?.items[i]?.width
                                                            )}
                                                            style={{
                                                                minWidth:
                                                                    state?.page?.sections[index]?.items[i]?.width + '%',
                                                            }}
                                                        >
                                                            {'image' in subItem && (
                                                                <Image
                                                                    imageComponent={state.page.sections[index].items[i]}
                                                                    otherLangsImage={subItem.image}
                                                                    sectionType={state?.page?.sections[index]?.type}
                                                                />
                                                            )}
                                                            {'text' in subItem && (
                                                                <div
                                                                    style={{
                                                                        backgroundColor: state?.page?.sections[index]
                                                                            ?.items[i]?.useBgColor
                                                                            ? state?.assets?.colors?.message?.main
                                                                            : 'white',
                                                                        height: '100%',
                                                                    }}
                                                                >
                                                                    <Paragraph paragraph={subItem.text} />
                                                                </div>
                                                            )}
                                                            {'sliderGallery' in subItem && (
                                                                <SliderGallery
                                                                    sliderGallery={state.page.sections[index].items[i]}
                                                                    otherLangSliderGallery={subItem.sliderGallery}
                                                                />
                                                            )}
                                                            {'cardSlider' in subItem && (
                                                                <CardSlider
                                                                    cardSlider={state.page.sections[index].items[i]}
                                                                    otherLangCardSlider={subItem.cardSlider}
                                                                />
                                                            )}
                                                            {'slider' in subItem && (
                                                                <Slider
                                                                    sliderComponent={
                                                                        state.page.sections[index].items[i]
                                                                    }
                                                                    slider={subItem.slider}
                                                                />
                                                            )}
                                                            {'sliderImages' in subItem && (
                                                                <Slider
                                                                    sliderComponent={
                                                                        state.page.sections[index].items[i]
                                                                    }
                                                                    otherLangSliderImages={subItem.sliderImages}
                                                                />
                                                            )}
                                                            {('booking' in subItem || subItem?.service === 'hcmwidgetbooking') && <WidgetBooking />}
                                                            {'contactForm' in subItem && (
                                                                <div
                                                                    style={{
                                                                        backgroundColor: state?.page?.sections[index]
                                                                            ?.items[i]?.useBgColor
                                                                            ? state?.assets?.colors?.message?.main
                                                                            : 'white',
                                                                        height: '100%',
                                                                    }}
                                                                >
                                                                    <ContactForm
                                                                        formData={state.page.sections[index].items[i]}
                                                                        otherLangFormData={subItem.contactForm.labels}
                                                                    />
                                                                </div>
                                                            )}
                                                            {'map' in subItem && (
                                                                <WrappedMap
                                                                    googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAP_API_KEY}`}
                                                                    loadingElement={<div style={{ height: `100%` }} />}
                                                                    containerElement={
                                                                        <div
                                                                            style={{
                                                                                height: `350px`,
                                                                                borderRadius: 10,
                                                                            }}
                                                                        />
                                                                    }
                                                                    mapElement={<div style={{ height: `100%` }} />}
                                                                />
                                                            )}
                                                            {'sliderOnly' in subItem && (
                                                                <SliderOnlyPreview
                                                                    masterid={
                                                                        state.page.sections[index].items[i].masterid
                                                                    }
                                                                />
                                                            )}
                                                        </Grid>
                                                    )
                                                })}
                                        </Grid>
                                    </Container>
                                    <hr />
                                </div>
                            )
                        })}
                    {state.langCode === state.defaultLang && state.page.sections.length > 0 ? (
                        <>
                            {state?.page?.sections?.length > 0 &&
                                state.page.sections.map((section, i) => {
                                    return (
                                        section?.items?.length > 0 && (
                                            <div key={i}>
                                                <IconButton
                                                    aria-label="Edit item"
                                                    color="primary"
                                                    onClick={() => editSectionDialog(section)}
                                                >
                                                    <BorderColorSharpIcon color="primary" />
                                                </IconButton>
                                                <IconButton
                                                    aria-label="Delete item"
                                                    color="primary"
                                                    onClick={() => {
                                                        setDeletedIndex(i)
                                                        setAlert(true)
                                                        setAlertDialogType('section')
                                                    }}
                                                    className={
                                                        state.langCode !== state.defaultLang
                                                            ? classes.disabledSectionTxt
                                                            : ''
                                                    }
                                                >
                                                    <DeleteIcon color="primary" />
                                                </IconButton>
                                                <Container style={{ pointerEvents: 'none' }}>
                                                    {section?.title && (
                                                        <Grid container spacing={1} justify={'flex-start'}>
                                                            <Grid item xs={12}>
                                                                <div
                                                                    dangerouslySetInnerHTML={{ __html: section.title }}
                                                                ></div>
                                                            </Grid>
                                                        </Grid>
                                                    )}
                                                    <Grid container spacing={1} justify={'flex-start'}>
                                                        {section.items.map((component, index) => {
                                                            return (
                                                                <Grid
                                                                    style={{ minWidth: component?.width + '%' }}
                                                                    item
                                                                    xs={getColumnWidth(component?.width)}
                                                                    key={index}
                                                                >
                                                                    {component?.type === 'slider' && (
                                                                        <Slider
                                                                            sliderComponent={component}
                                                                            sectionID={section.id}
                                                                        />
                                                                    )}
                                                                    {component?.type === 'slider-gallery' && (
                                                                        <SliderGallery sliderGallery={component} />
                                                                    )}
                                                                    {component?.type === 'card-slider' && (
                                                                        <CardSlider cardSlider={component} />
                                                                    )}
                                                                    {component?.type === 'video' && (
                                                                        <Video videoComponent={component} />
                                                                    )}
                                                                    {component?.type === 'sliderOnly' && (
                                                                        <SliderOnlyPreview
                                                                            masterid={component.masterid}
                                                                        />
                                                                    )}
                                                                    {component?.type === 'image' && (
                                                                        <Image
                                                                            imageComponent={component}
                                                                            sectionType={section?.type}
                                                                        />
                                                                    )}
                                                                    {component?.type === 'paragraph' && (
                                                                        <div
                                                                            style={{
                                                                                backgroundColor: component?.useBgColor
                                                                                    ? state?.assets?.colors?.message
                                                                                          ?.main
                                                                                    : 'white',
                                                                                height: '100%',
                                                                            }}
                                                                        >
                                                                            <Paragraph
                                                                                paragraph={component}
                                                                                sectionID={section.id}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    {component?.type === 'widgetbooking' && (
                                                                        <WidgetBooking />
                                                                    )}
                                                                    {component?.type === 'contactForm' && (
                                                                        <div
                                                                            style={{
                                                                                backgroundColor: component?.useBgColor
                                                                                    ? state?.assets?.colors?.message
                                                                                          ?.main
                                                                                    : 'white',
                                                                                height: '100%',
                                                                            }}
                                                                        >
                                                                            <ContactForm formData={component} />
                                                                        </div>
                                                                    )}
                                                                    {component?.type === 'map' && (
                                                                        <WrappedMap
                                                                            googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAP_API_KEY}`}
                                                                            loadingElement={
                                                                                <div style={{ height: `100%` }} />
                                                                            }
                                                                            containerElement={
                                                                                <div
                                                                                    style={{
                                                                                        height: `350px`,
                                                                                        borderRadius: 10,
                                                                                    }}
                                                                                />
                                                                            }
                                                                            mapElement={
                                                                                <div style={{ height: `100%` }} />
                                                                            }
                                                                        />
                                                                    )}
                                                                </Grid>
                                                            )
                                                        })}
                                                    </Grid>
                                                </Container>
                                                <hr />
                                            </div>
                                        )
                                    )
                                })}
                            <h3 className={classes.centreContent}>
                                <span
                                    onClick={() => addSectionDialog()}
                                    className={clsx({
                                        [classes.cursorPointer]: true,
                                        [classes.disabledSectionTxt]:
                                            state.langCode !== state.defaultLang ? true : false,
                                    })}
                                >
                                    Click to define Section
                                </span>
                            </h3>
                        </>
                    ) : (
                        <h3 className={classes.centreContent}>
                            <span
                                onClick={() => addSectionDialog()}
                                className={clsx({
                                    [classes.cursorPointer]: true,
                                    [classes.disabledSectionTxt]: state.langCode !== state.defaultLang ? true : false,
                                })}
                            >
                                Click to define Section
                            </span>
                        </h3>
                    )}
                    <hr />
                </div>
            </Box>
            {renderDialog}
            {isAlert && <AlertDialog handleDelete={handleDelete} alertDialogType={alertDialogType} />}
        </Container>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.pageBuilder,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    pushToState: (stateType, stateName, value) => dispatch(pushToState(stateType, stateName, value)),
    deleteFromState: (stateType, stateName, value) => dispatch(deleteFromState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Page)
