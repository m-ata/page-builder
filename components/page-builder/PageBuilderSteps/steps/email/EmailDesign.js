//react imports
import React, {useContext, useEffect, useState} from 'react';
//material ui imports
import Container  from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import EditIcon from '@material-ui/icons/Edit';
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
//custom imports
import EmailGenericDialog from "../../components/email/generic/EmailGenericDialog";
import EmailHeader from "../../components/email/header/EmailHeader";
import EmailFooter from "../../components/email/footer/EmailFooter";
import EditEmailSection from "../../components/email/body/EditEmailSection";
import Image from "../../components/page/sections/image/Image";
import Paragraph from "../../components/page/sections/paragraph/Paragraph";
import LoadingSpinner from "../../../../LoadingSpinner";
import {AlertDialog} from "../../components/alert";
//redux imports
import { connect } from 'react-redux';
import {setToState, pushToState, deleteFromState, updateState} from "../../../../../state/actions";
//toast import
import {toast} from "react-toastify";
//constants and config imports
import {DELETE_SUCCESS, emailWidth} from "../../constants";
import {useRouter} from "next/router";
import WebCmsGlobal from "../../../../webcms-global";
import axios from "axios";
import {
    FIELDTYPE,
    isErrorMsg,
    OREST_ENDPOINT,
    OREST_UPLOAD,
    REQUEST_METHOD_CONST
} from "../../../../../model/orest/constants";
import {Insert, ViewList} from "@webcms/orest";
import LanguageDropdown from "../../components/language/LanguageDropdown";
import {now} from "moment";


const defaultProps = {
    bgcolor: 'background.paper',
    border: 1,
    borderColor: 'silver',
};

const useStyles = makeStyles(() => ({
    centreContent: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: 8
    },
    cursorPointer: {
        cursor: 'pointer',
        color: 'silver'
    },
    disabledEvent: {
        pointerEvents: 'none',
        opacity: 0.5,
    },
    centerSection: {
        display: "block",
        marginTop: 8,
        textAlign: "center"
    }
}));

const EmailDesign = (props) => {

    const {
        state,
        setToState,
        pushToState,
        deleteFromState,
        updateState
    } = props;

    const classes = useStyles();
    //local states
    const [isRenderDialog, setRenderDialog] = useState(false);
    const [dialogType, setDialogType] = useState('');
    const [dialogTitle, setDialogTitle] = useState('');
    const [editSectionDialog, setEditSectionDialog] = useState('');
    const [isAlert, setAlert] = React.useState(false);
    const [alertDialogType, setAlertDialogType] = useState('');
    const [deletedIndex, setDeletedIndex] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoaded, setIsLoaded] = useState(true);

    const router = useRouter();
    const companyId = router.query.companyID
    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal);
    const authToken = token || router.query.authToken;

    useEffect(() => {
        if (state?.isTemplate) {
            state?.previousStep === 0 ?
                handleGenerateNewTemplate(`code::${state.code},filetype::PB-EMAIL`) : null
        } else {
            if (router.query.emailOnly) {
                if (router.query.masterid) {
                    if (!Object.keys(state?.email?.header).length  && !Object.keys(state?.email?.footer).length && !state?.email?.body?.length) {
                        setIsLoaded(false);
                        ViewList({
                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                            endpoint: OREST_ENDPOINT.RAFILE,
                            token: authToken,
                            params: {
                                hotelrefno: Number(companyId),
                                query: `masterid::${router.query.masterid},filetype::PB-EMAIL`,
                            }
                        }).then(res => {
                            if (res.status === 200) {
                                if (res?.data?.data?.length > 0) {
                                    // setTimeout(() => {
                                    //     console.log(res.data.data[0].langcode.toLowerCase())
                                    //     updateState('pageBuilder', 'langId', res.data.data[0].langid);
                                    //     updateState('pageBuilder', 'langCode', res.data.data[0].langcode.toLowerCase());
                                    //     updateState('pageBuilder', 'defaultLangId', res.data.data[0].langid);
                                    //     updateState('pageBuilder', 'defaultLang', res.data.data[0].langcode.toLowerCase());
                                    //     setIsLoaded(true);
                                    // }, 300);
                                    setIsLoaded(true);
                                    const email = JSON.parse(Buffer.from(res.data.data[0].filedata, 'base64').toString('utf-8'));
                                    updateState('pageBuilder', 'email', email);
                                    updateState('pageBuilder', 'code', res.data.data[0].code);
                                    ViewList({
                                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                                        endpoint: OREST_ENDPOINT.RAFILE,
                                        token: authToken,
                                        params: {
                                            hotelrefno: Number(companyId),
                                            query: `filetype:LANG.EMAIL,masterid::${router.query.masterid}`,
                                        }
                                    }).then(res => {
                                        if (res.status === 200 && res.data && res.data.data.length > 0) {
                                            const langFile = JSON.parse(Buffer.from(res.data.data[0].filedata, 'base64').toString('utf-8'));
                                            updateState('pageBuilder', 'langsFile', langFile);
                                        }
                                    })
                                } else {
                                    setIsLoaded(true);
                                }
                            } else {
                                setIsLoaded(true);
                                const retErr = isErrorMsg(res);
                                toast.error(retErr.errorMsg, {
                                    position: toast.POSITION.TOP_RIGHT
                                });
                            }
                        })
                    }
                }
            }
        }
    }, []);

    const handleGenerateNewTemplate = async (query) => {
        setIsLoaded(false);
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token: authToken,
            params: {
                hotelrefno: Number(companyId),
                query: query,
            }
        }).then(res => {
            if (res?.status === 200) {
                if (res?.data?.data?.length > 0) {
                    const emailData = JSON.parse(Buffer.from(res.data.data[0].filedata, 'base64').toString('utf-8'));
                    setToState('pageBuilder', ['email', 'header'], emailData?.header);
                    setToState('pageBuilder', ['email', 'footer'], emailData?.footer);
                    const body = emailData?.body;
                    Promise.all(body.map((b, i) => {
                        Promise.all(b.items.map(async (item, j) => {
                            if (item.type === 'image') {
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
                                        query: `gid::${item.gid}`
                                    },
                                }
                                const image = await getData(HCMITEMIMG_OPTION);
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
                                            query: `masterid::${image[0].mid}`
                                        },
                                    }
                                    const file = await getData(FILEGET_OPTION);
                                    if (file.length > 0) {
                                        const downloadedFile = await fileDownload({
                                            url: `${GENERAL_SETTINGS.OREST_URL}/tools/file/download`,
                                            headers: {
                                                "Authorization": `Bearer ${authToken}`
                                            },
                                            method: 'get',
                                            responseType: 'arraybuffer',
                                            params: {
                                                gid: file[0]?.gid,
                                                hotelrefno: companyId
                                            },
                                        });
                                        let blob = new Blob([downloadedFile?.data], { type: downloadedFile?.data?.type });
                                        const imageUrl = GENERAL_SETTINGS.STATIC_URL + file[0]?.url.replace('/var/otello', '').replace('/public', '');
                                        const m = imageUrl.replace(/^.*[\\\/]/, '')
                                        const imageType = m.split('.')[1];
                                        const fileObject = new File([blob], m, {
                                            lastModified: new Date(now()),
                                            type: 'image/' + imageType
                                        });
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
                                            data: {
                                                itemid: state.hcmItemId,
                                                imgtype: FIELDTYPE.IMG,
                                                title: image[0]?.title,
                                                description: image[0]?.description,
                                                cta: image[0]?.cta,
                                                orderno: 1,
                                                hotelrefno: Number(companyId)
                                            },
                                        }
                                        const imageInsert = await handleInsertData(HCMITEMINS);
                                        if (imageInsert) {
                                            let binaryData = [];
                                            binaryData.push(fileObject);
                                            let formData = new FormData();
                                            formData.append('file', new Blob(binaryData, {type: fileObject.type}), fileObject.name);
                                            const uploadOptions = {
                                                url: GENERAL_SETTINGS.OREST_URL + OREST_ENDPOINT.SLASH + OREST_ENDPOINT.RAFILE + OREST_UPLOAD,
                                                method: 'post',
                                                headers: {
                                                    "Authorization": `Bearer ${authToken}`,
                                                    'Content-Type': 'multipart/form-data',
                                                },
                                                params: {
                                                    orsactive: true,
                                                    masterid: imageInsert?.mid,
                                                    hotelrefno: companyId
                                                },
                                                data: formData,
                                            }
                                            const uploadedFile = await handleInsertData(uploadOptions);
                                            if (i === body.length - 1)
                                                setIsLoaded(true)
                                            if (uploadedFile?.url) {
                                                b.items[j] = {
                                                    service: "hcmitemimg",
                                                    type: "image",
                                                    gid: imageInsert?.gid,
                                                    width: item?.width,
                                                    id: item?.id
                                                }
                                            } else {
                                                toast.error('Upload failed', {position: toast.POSITION.TOP_RIGHT})
                                            }
                                        }
                                    }
                                }
                            }
                            if (item.type === 'paragraph') {
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
                                        query: `gid::${item.gid}`
                                    },
                                }
                                const paragraph = await getData(HCMITEMTXTPAR_OPTION);
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
                                            hotelrefno: Number(companyId)
                                        },
                                    }
                                    const hcmitem = await handleInsertData(HCMITEM_OPTION);
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
                                            hotelrefno: Number(companyId)
                                        },
                                    }
                                    const hcmItemTxtPar = await handleInsertData(HCMITEMTXTPAR_OPTION);
                                    if (i === body.length - 1)
                                        setIsLoaded(true)
                                    if (hcmItemTxtPar) {
                                        b.items[j] = {
                                            service: "hcmitemtxtpar",
                                            type: "paragraph",
                                            gid: hcmItemTxtPar?.gid,
                                            width: item?.width,
                                            id: item?.id
                                        }
                                    }
                                }
                            }
                        }));
                    }));
                    setToState('pageBuilder', ['email', 'body'], body);
                    ViewList({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.RAFILE,
                        token: authToken,
                        params: {
                            hotelrefno: Number(companyId),
                            query: `filetype:LANG.EMAIL,refid::${res.data.data[0].id}`,
                        }
                    }).then(res2 => {
                        if (res2.status === 200 && res2?.data?.data?.length > 0) {
                            const langFile = JSON.parse(Buffer.from(res2.data.data[0].filedata, 'base64').toString('utf-8'));
                            updateState('pageBuilder', 'langsFile', langFile);
                        }
                    })
                }
            } else {
                const retErr = isErrorMsg(res);
                toast.error(retErr.errorMsg, {
                    position: toast.POSITION.TOP_RIGHT
                });
            }
        });
    }

    const fileDownload = (option) => {
        return new Promise(async (resv) => {
            return await axios(option)
                .then(async (response) => {
                    if (response.status === 200) {
                        resv(response);
                    } else {
                        const retErr = isErrorMsg(response);
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    }
                })
                .catch((error) => {
                    console.log(error)
                    resv(error.response || { status: 0 })
                })
        })
    }

    const getData = (option) => {
        return new Promise(async (resv) => {
            return await axios(option)
                .then(async (response) => {
                    if (response.status === 200) {
                        if (response?.data?.data?.length > 0)
                            resv(response.data.data)
                    } else {
                        const retErr = isErrorMsg(response);
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT
                        });
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
                        if (response?.data?.data)
                            resv(response.data.data)
                    } else {
                        const retErr = isErrorMsg(response);
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    }
                })
                .catch((error) => {
                    console.log(error)
                    resv(error.response || { status: 0 })
                })
        })
    }

    useEffect(() => {
        state?.languages?.length > 0 && state.languages.forEach(lang => {
            if (state?.langsFile?.header?.[lang?.code?.toLowerCase()] &&
                state?.langsFile?.body?.[lang?.code?.toLowerCase()] &&
                state?.langsFile?.footer?.[lang?.code?.toLowerCase()]) {
                const isExist = state?.translatedLanguages?.find(x => x.id === lang.id);
                !isExist ?  pushToState('pageBuilder', ['translatedLanguages'], [lang]) : null
            }
        })
    }, [state.langsFile]);

    const resetRenderDialog = () => {
        setRenderDialog(false);
    }

    const handleSelectedHeader = (header) => { // saving header into redux
        if (state.langCode === state.defaultLang) {
            setToState('pageBuilder', ['email', 'header'], header);
        } else {
            const updatedlangsFile = {...state.langsFile};
            if (updatedlangsFile.header[state.langCode]) {
                setToState('pageBuilder', ['langsFile', 'header', state.langCode], header);
            }
        }
    }

    const handleSelectedFooter = (footer) => { // saving footer into redux
        if (state.langCode === state.defaultLang) {
            setToState('pageBuilder', ['email', 'footer'], footer);
        } else {
            const updatedlangsFile = {...state.langsFile};
            if (updatedlangsFile.footer[state.langCode]) {
                setToState('pageBuilder', ['langsFile', 'footer', state.langCode], footer);
            }
        }
    }

    const handleAddEmailSection = (body, order) => {
        if (body && body.items && body.items.length > 0) {
            if (body.items[body.items.length - 1].type === 'paragraph') {
                Insert({ // insert paragraph into hcmitemtxt
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.HCMITEMTXT,
                    token: authToken,
                    data: {
                        itemid: state.hcmItemId,
                        hotelrefno: Number(companyId)
                    },
                }).then(res => {
                    if(res.status === 200 && res.data.data) {
                        Insert({ // insert textpar
                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                            endpoint: OREST_ENDPOINT.HCMITEMTXTPAR,
                            token: authToken,
                            data: {
                                itemid: res.data.data.id,
                                itemtext: body.items[body.items.length - 1].service,
                                hotelrefno: Number(companyId)
                            },
                        }).then(res1 => {
                            if (res1?.status === 200 && res1?.data?.data) {
                                body.items[body.items.length - 1] = {
                                    service: "hcmitemtxtpar",
                                    type: "paragraph",
                                    gid: res1.data.data.gid,
                                    width: body?.items[body.items.length - 1]?.width,
                                    id: `item-${body?.items?.length}`,
                                    useBgColor: body?.items[body.items.length - 1]?.useBgColor
                                }
                                const updatedEmailObj = {...state?.email};
                                updatedEmailObj?.body?.splice(order - 1, 0, body);
                                updateState('pageBuilder', 'email', updatedEmailObj);
                            }
                        })
                    }
                });
            } else {
                const updatedEmailObj = {...state?.email};
                updatedEmailObj?.body?.splice(order - 1, 0, body);
                updateState('pageBuilder', 'email', updatedEmailObj);
            }
        }
    }

    const handleDeleteHeader = () => { // deleting header from redux
        setToState('pageBuilder', ['email', 'header'], {});
        setToState('pageBuilder', ['langsFile', 'header'], {});
        toast.success(DELETE_SUCCESS, {
            position: toast.POSITION.TOP_RIGHT
        });
    }

    const handleDeleteFooter = () => { // deleting footer from redux
        setToState('pageBuilder', ['email', 'footer'], {});
        setToState('pageBuilder', ['langsFile', 'footer'], {});
        toast.success(DELETE_SUCCESS, {
            position: toast.POSITION.TOP_RIGHT
        });
    }

    const handleDeleteEmailSection = async (index) => { // deleting body from redux
        setIsDeleting(true);
        const body = state.email.body[index];
        let req = []
        for (let component of body.items) {
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
        }
        await Promise.all(req).then(async (res) => {
            let isSuccess = true
            await res.map((r) => {
                if (r.status !== 200) {
                    isSuccess = false
                }
            });
            setIsDeleting(false);
            if (isSuccess) {
                deleteFromState('pageBuilder', ['email', 'body'], [index, 1]);
                const updatedOtherLangs = {...state.langsFile.body};
                for (const lang in updatedOtherLangs ) {
                    if (updatedOtherLangs[lang].items && updatedOtherLangs[lang].items.length > 0) {
                        updatedOtherLangs[lang].items.splice(index, 1);
                    }
                }
                setToState('pageBuilder', ['langsFile', 'body'], updatedOtherLangs);
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

    const deleteImage = async (header) => { //delete image from hcmitem img
        return new Promise(async (resv) => {
            return await axios(header)
                .then(async (response) => {
                    if (response.status === 200 && response.data && response.data.success) {
                        resv(response)
                    } else {
                        const retErr = isErrorMsg(response);
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    }
                })
                .catch((error) => {
                    console.log(error)
                    resv(error.response || { status: 0 })
                })
        })
    }

    const deleteParagraph = async (header) => { // delete text from hcmitemtxtpar
        return new Promise(async (resv) => {
            return await axios(header)
                .then(async (response) => {
                    if (response.status === 200 && response.data && response.data.success) {
                        resv(response)
                    } else {
                        const retErr = isErrorMsg(response);
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    }
                })
                .catch((error) => {
                    console.log(error)
                    resv(error.response || { status: 0 })
                })
        })
    }

    const onEditSection = (newSection, index, order) => {
        if (state.langCode === state.defaultLang) {
            let updatedBody = [...state.email.body];
            updatedBody.splice(index, 1);
            updatedBody.splice(order - 1, 0, newSection);
            setToState('pageBuilder', ['email', 'body'], updatedBody);
        } else {
            if (Object.keys(state.langsFile.body[state.langCode]).length > 0) {
                const updatedLangs = {...state.langsFile};
                const updatedItems = state.langsFile.body[state.langCode].items;
                const items = {
                    items: newSection.items
                };
                updatedItems[index] = items;
                updatedLangs.body[state.langCode].items = updatedItems;
                updateState('pageBuilder', 'langsFile', updatedLangs);
            }
        }
    }

    const handleEditSectionDialog = (section, otherLangSection) => {
        setEditSectionDialog(
            <EditEmailSection
                section={section}
                onEditSection={onEditSection}
                dialogTitle="Edit Section"
                isDialogOpen={true}
                resetRender={() => setEditSectionDialog('')}
                otherLangSection={otherLangSection}
            />
        )
    }

    const handleDelete = (type, isDelete) => {
        if (isDelete) {
            switch (type) {
                case 'header':
                    handleDeleteHeader();
                    break;
                case 'footer':
                    handleDeleteFooter();
                    break;
                case 'section':
                    handleDeleteEmailSection(deletedIndex);
                    break;
            }
        }
        setAlert(false);
    }

    const handleLanguageChange = async (lang) => {
        const code = lang?.code.toLowerCase();
        updateState('pageBuilder', 'langCode', code);
        updateState('pageBuilder', 'langId', lang?.id);
        const updatedlangsFile = {...state.langsFile};
        if (code !== state.defaultLang) {
            !state?.langsFile?.header ? updatedlangsFile['header'] = {} : null;
            !state?.langsFile?.footer ? updatedlangsFile['footer'] = {} : null;
            !state?.langsFile?.body ? updatedlangsFile['body'] = {} : null

            if (!updatedlangsFile.header[code]) {
                if (state?.email?.header?.items?.length > 0) {
                    updatedlangsFile.header[code] = {
                        items: []
                    }
                    Promise.all(state.email.header.items.map((rowItem, rowIndex) => {
                        if (rowItem.type === 'logo') {
                            updatedlangsFile.header[code].items[rowIndex] = {
                                value: rowItem.value.link
                            }
                        }
                        if (rowItem.type === 'link') {
                            updatedlangsFile.header[code].items[rowIndex] = {
                                value: []
                            }
                            rowItem.value.map((colItem) => {
                                updatedlangsFile.header[code].items[rowIndex].value.push({
                                    value: colItem.title
                                });
                            });
                        }
                        if (rowItem.type === 'social-link') {
                            updatedlangsFile.header[code].items[rowIndex] = {
                                value: []
                            }
                            rowItem.value.map((colItem) => {
                                updatedlangsFile.header[code].items[rowIndex].value.push({
                                    value: colItem.title
                                });
                            });
                        }
                    }))
                    updateState('pageBuilder', 'langsFile', updatedlangsFile);
                }
            } else {
                if (state?.email?.header?.items?.length > 0) {
                    if (state?.email?.header?.items?.length > updatedlangsFile?.header[code]?.items?.length) {
                        for (let i = updatedlangsFile.header[code].items.length; i < state.email.header.items.length; i++) {
                            if (state.email.header.items[i].type === 'social-link' ||
                                state.email.header.items[i].type === 'link') {
                                updatedlangsFile.header[code].items.push({
                                    value: []
                                });
                                for (let value of state.email.header.items[i].value) {
                                    updatedlangsFile.header[code].items[i].value.push({
                                        value: value.title
                                    });
                                }
                            }
                            if (state.email.header.items[i].type === 'logo') {
                                updatedlangsFile.header[code].items.push({
                                    value: state.email.header.items[i].value.value
                                });
                            }
                        }
                    }
                    if (state?.email?.header?.items?.length < updatedlangsFile?.header[code]?.items?.length) {
                        updatedlangsFile.header[code].items.length = state.email.header.items.length
                    }
                    Promise.all(state.email.header.items.map((item, index) => {
                        if (item.type === 'social-link' || item.type === 'link') {
                            if (item.value.length > updatedlangsFile.header[code].items[index].value.length) {
                                for (let i = updatedlangsFile.header[code].items[index].value.length; i < item.value.length; i++) {
                                    updatedlangsFile.header[code].items[index].value.push({
                                        value: item.value[i].title
                                    })
                                }
                            }
                            if (item.value.length < updatedlangsFile.header[code].items[index].value.length) {
                                updatedlangsFile.header[code].items[index].value.length = item.value.length
                            }
                        }
                    }));
                    updateState('pageBuilder', 'langsFile', updatedlangsFile);
                }
            }
            // footer related conditions
            if (!updatedlangsFile.footer[code]) {
                if (state?.email?.footer?.items?.length > 0) {
                    updatedlangsFile.footer[code] = {
                        items: []
                    }
                    Promise.all(state.email.footer.items.map((rowItem, rowIndex) => {
                        updatedlangsFile.footer[code].items[rowIndex] = {
                            items: []
                        }
                        rowItem.items.map((colItem, colIndex) => {
                            if (colItem.type === 'social-link' || colItem.type === 'link') {
                                updatedlangsFile.footer[code].items[rowIndex].items[colIndex] = {
                                    value: colItem.value.title
                                }
                            }
                            if (colItem.type === 'image') {
                                updatedlangsFile.footer[code].items[rowIndex].items[colIndex] = {
                                    value: colItem.value.image
                                }
                            }
                            if (colItem.type === 'heading' || colItem.type === 'paragraph') {
                                updatedlangsFile.footer[code].items[rowIndex].items[colIndex] = {
                                    value: colItem.value
                                }
                            }
                            if (colItem.type === 'address') {
                                updatedlangsFile.footer[code].items[rowIndex].items[colIndex] = {
                                    value: []
                                }
                                colItem.value.map((val, i) => {
                                    updatedlangsFile.footer[code].items[rowIndex].items[colIndex].value[i] = {
                                        value: val.title
                                    }
                                })
                            }
                        })
                    }))
                    updateState('pageBuilder', 'langsFile', updatedlangsFile);
                }
            } else {
                if (state?.email?.footer?.length > 0) {
                    if (state.email.footer.items.length > updatedlangsFile.footer[code].items.length) {
                        for (let i = updatedlangsFile.footer[code].items.length; i < state.email.footer.items.length; i++) {
                            updatedlangsFile.footer[code].items.push({
                                items: []
                            });
                            for (let item of state.email.footer.items[i].items) {
                                const index = state.email.footer.items[i].items.indexOf(item);
                                if (item.type === 'social-link' || item.type === 'link') {
                                    updatedlangsFile.footer[code].items[i].items[index] = {
                                        value: item.value.title
                                    }
                                }
                                if (item.type === 'heading' || item.type === 'paragraph') {
                                    updatedlangsFile.footer[code].items[i].items[index] = {
                                        value: item.value
                                    }
                                }
                                if (item.type === 'address') {
                                    updatedlangsFile.footer[code].items[i].items[index] = {
                                        value: []
                                    }
                                    item.value.map((val, j) => {
                                        updatedlangsFile.footer[code].items[i].items[index].value[j] = {
                                            value: val.title
                                        }
                                    })
                                }
                            }
                        }
                    }
                    if (state.email.footer.items.length < updatedlangsFile.footer[code].items.length) {
                        updatedlangsFile.footer[code].items.length = state.email.footer.items.length
                    }
                    if (state.email.footer.items.length === updatedlangsFile.footer[code].items.length) {
                        Promise.all(state.email.footer.items.map((item, index) => {
                            if (item.items.length > updatedlangsFile.footer[code].items[index].items.length) {
                                for (let i = updatedlangsFile.footer[code].items[index].items.length; i < state.email.footer.items[index].items.length; i++) {
                                    if (item.items[i].type === 'social-link' || item.items[i].type === 'link') {
                                        updatedlangsFile.footer[code].items[index].items[i] = {
                                            value: item.items[i].value.title
                                        }
                                    }
                                    if (item.items[i].type === 'heading' || item.items[i].type === 'paragraph') {
                                        updatedlangsFile.footer[code].items[index].items[i] = {
                                            value: item.items[i].value
                                        }
                                    }
                                    if (item.items[i].type === 'address') {
                                        updatedlangsFile.footer[code].items[index].items[i] = {
                                            value: []
                                        }
                                        item.items[i].value.map((val, j) => {
                                            updatedlangsFile.footer[code].items[index].items[i].value[j] = {
                                                value: val.title
                                            }
                                        })
                                    }
                                }
                            }
                            if (item.items.length < updatedlangsFile.footer[code].items[index].items.length) {
                                updatedlangsFile.footer[code].items[index].items.length = item.items.length
                            }
                        }))
                    }
                    Promise.all(state.email.footer.items.map((item, index) => {
                        item.items.length > 0 && item.items.map((subItem, i) => {
                            if (subItem.type === 'address') {
                                if (subItem.value.length > updatedlangsFile.footer[code].items[index].items[i].value.length) {
                                    for (let j = updatedlangsFile.footer[code].items[index].items[i].value.length; j < subItem.value.length; j ++) {
                                        updatedlangsFile.footer[code].items[index].items[i].value[j] = {
                                            value: subItem.value[j].title
                                        }
                                    }
                                }
                                if (subItem.value.length < updatedlangsFile.footer[code].items[index].items[i].value.length) {
                                    updatedlangsFile.footer[code].items[index].items[i].value.length = subItem.value.length;
                                }
                            }
                        })
                    }))
                    updateState('pageBuilder', 'langsFile', updatedlangsFile);
                }
            }
            //body related condition
            if (!updatedlangsFile.body[code]) {
                if (state.email.body.length > 0) {
                    updatedlangsFile.body[code] = {
                        items: []
                    };
                    for (let section of state.email.body) {
                        const sectionIndex = state.email.body.indexOf(section);
                        updatedlangsFile.body[code].items.push({
                            items: []
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
                                const img = await getImageData(REQUEST_OPTION_GET_IMAGE);
                                updatedlangsFile.body[code].items[sectionIndex].items[itemIndex] = {
                                    image: {
                                        title: img.title,
                                        description: img.description
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
                                updatedlangsFile.body[code].items[sectionIndex].items[itemIndex] = {
                                    text: text
                                }
                            }
                        }
                    }
                }
                updateState('pageBuilder', 'langsFile', updatedlangsFile);
            } else {
                if (updatedlangsFile.body[code].items.length < state.email.body.length) {
                    for (let i = updatedlangsFile.body[code].items.length; i < state.email.body.length; i++) {
                        updatedlangsFile.body[code].items.push({
                            items: []
                        });
                        for (let item of state.email.body[i].items) {
                            const itemIndex = state.email.body[i].items.indexOf(item);
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
                                updatedlangsFile.body[code].items[i].items[itemIndex] = {
                                    image: {
                                        title: img.title,
                                        description: img.description
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
                                updatedlangsFile.body[code].items[i].items[itemIndex] = {
                                    text: text
                                }
                            }
                        }
                    }
                    updateState('pageBuilder', 'langsFile', updatedlangsFile);
                }
            }
        }
    }

    const getImageData = async (header) => {
        return new Promise(async (resv) => {
            return await axios(header)
                .then(async (response) => {
                    if (response.status === 200 && response.data && response.data.data.length > 0) {
                        resv({
                            title: response.data.data[0].title,
                            description: response.data.data[0].description
                        })
                    } else {
                        const retErr = isErrorMsg(response);
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    }
                })
                .catch((error) => {
                    console.log(error)
                    resv(error.response || { status: 0 })
                })
        })
    }

    const getTextData = async (header) => {
        return new Promise(async (resv) => {
            return await axios(header)
                .then(async (response) => {
                    if (response.status === 200 && response.data && response.data.data.length > 0) {
                        resv(response.data.data[0].itemtext)
                    } else {
                        const retErr = isErrorMsg(response);
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    }
                })
                .catch((error) => {
                    console.log(error)
                    resv(error.response || { status: 0 })
                })
        })
    }

    return (
        <Container className={isDeleting ? classes.disabledEvent : ''}>
            {
                !isLoaded ? <LoadingSpinner /> :
                    <>
                    <Typography
                        style={{
                            display: "flex",
                            justifyContent: 'flex-end',
                        }}
                        component={'div'}
                    >
                        <FormControl
                            variant="outlined"
                            style={{ marginRight: 8}}
                            size={'small'}
                        >
                            <InputLabel style={{fontSize: 15}} >Width</InputLabel>
                            <Select
                                value={state?.emailWidth}
                                onChange={(e) => {
                                    updateState('pageBuilder', 'emailWidth', e.target.value);
                                }}
                                label="Width"
                            >
                                {emailWidth.map((width, index) => {
                                    return (
                                        <MenuItem value={width} key={index}>
                                            {width}
                                        </MenuItem>
                                    )
                                })}
                            </Select>
                        </FormControl>
                        <Typography component={'div'}
                                    className={state?.email?.body?.length === 0 ? classes.disabledEvent : ''} >
                            <LanguageDropdown handleChange={handleLanguageChange} langID={state?.langId} />
                        </Typography>
                    </Typography>
                        <Box {...defaultProps} >
                            <Typography component={'div'} style={{height: 'auto', overflow: 'auto'}}>
                                {
                                    Object.keys(state.email.header).length > 0 ? <div>
                                            <IconButton
                                                aria-label="Delete item"
                                                color="primary"
                                                onClick={() => {
                                                    setDialogType('edit-header');
                                                    setDialogTitle('Edit Header');
                                                    setRenderDialog(true);
                                                }}
                                            >
                                                <EditIcon color={'primary'}/>
                                            </IconButton>
                                            {
                                                state.langCode === state.defaultLang && <IconButton
                                                    aria-label="Delete item"
                                                    color="primary"
                                                    onClick={() => {
                                                        setAlert(true);
                                                        setAlertDialogType('header');
                                                    }}
                                                >
                                                    <DeleteIcon color={'primary'}/>
                                                </IconButton>
                                            }
                                            <div style={{
                                                pointerEvents: "none",
                                                backgroundColor: state?.assets?.colors?.primary?.main,
                                            }}>
                                                {
                                                    state.langCode === state.defaultLang &&
                                                    <EmailHeader
                                                        tpl={state.email.header.tpl}
                                                        items={state.email.header.items}
                                                    />
                                                }
                                                {
                                                    state?.langCode !== state?.defaultLang &&
                                                    state?.langsFile?.header?.[state.langCode]?.items &&
                                                    <EmailHeader
                                                        tpl={state.email.header.tpl}
                                                        items={state.langsFile?.header?.[state.langCode]?.items}
                                                    />
                                                }
                                            </div>
                                        </div> :
                                        <h3 className={classes.centreContent}>
                                            <span className={classes.cursorPointer}
                                                  onClick={() => {
                                                      setDialogType('add-header');
                                                      setDialogTitle('Add Header')
                                                      setRenderDialog(true);
                                                  }}
                                            >
                                                Click to define Header
                                            </span>
                                        </h3>
                                }
                            </Typography>
                            <Divider/>
                            <Typography component={'div'} >
                                {
                                    state?.langCode !== state?.defaultLang &&
                                    state?.langsFile?.body?.[state.langCode]?.items?.length > 0 &&
                                    state.langsFile.body[state.langCode].items.map((item, index) => {
                                        return (
                                            <Typography component={'div'} key={index}>
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => {
                                                        handleEditSectionDialog(state.email.body[index],
                                                            item.items);
                                                    }}
                                                >
                                                    <EditIcon/>
                                                </IconButton>
                                                <Container style={{pointerEvents: "none"}}>
                                                    <Grid container spacing={3} >
                                                        {
                                                            item?.items?.length > 0 && item.items.map((subItem, i) => {
                                                                return (
                                                                    <Grid item
                                                                          style={{width: state?.email?.body[index]?.items[i]?.width + '%'}}
                                                                          key={i}
                                                                    >
                                                                        {
                                                                            ('image' in subItem) &&
                                                                                <Image
                                                                                    imageComponent={state?.email?.body[index]?.items[i]}
                                                                                    otherLangsImage={subItem.image}
                                                                                    sectionType={state?.email?.body[index]?.type}
                                                                                />
                                                                        }
                                                                        {
                                                                            ('text' in subItem) &&
                                                                            <div
                                                                                style={{backgroundColor: state?.email?.body[index]?.items[i]?.useBgColor ? state?.assets?.colors?.message?.main : 'white', height: '100%'}}
                                                                            >
                                                                                <Paragraph
                                                                                    paragraph={subItem.text}
                                                                                />
                                                                            </div>
                                                                        }
                                                                    </Grid>
                                                                )
                                                            })
                                                        }
                                                    </Grid>
                                                </Container>
                                            </Typography>
                                        )
                                    })
                                }
                                {
                                    state?.langCode === state?.defaultLang && state?.email?.body?.length > 0 &&
                                    state.email.body.map((body, index) => {
                                        return (
                                            <Typography component={'div'} key={index}>
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => {
                                                        handleEditSectionDialog(body)
                                                    }}
                                                >
                                                    <EditIcon/>
                                                </IconButton>
                                                {
                                                    state.langCode === state.defaultLang && <IconButton
                                                        aria-label="Delete item"
                                                        color="primary"
                                                        onClick={() => {
                                                            setDeletedIndex(index);
                                                            setAlert(true);
                                                            setAlertDialogType('section');
                                                        }}
                                                    >
                                                        <DeleteIcon/>
                                                    </IconButton>
                                                }
                                                <Container style={{pointerEvents: "none"}}>
                                                    <Grid container spacing={3} >
                                                        {
                                                            body?.items?.length > 0 && body.items.map((item, i) => {
                                                                return (
                                                                    <Grid
                                                                        item
                                                                        style={{width: item.width + '%'}} key={i}
                                                                    >
                                                                        {
                                                                            item?.type === 'image' &&
                                                                            <Image
                                                                                imageComponent={item}
                                                                                sectionType={body?.type}
                                                                            />
                                                                        }
                                                                        {
                                                                            item?.type === 'paragraph' &&
                                                                            <div
                                                                                style={{backgroundColor: item?.useBgColor ? state?.assets?.colors?.message?.main : 'white', height: '100%'}}
                                                                            >
                                                                                <Paragraph paragraph={item} />
                                                                            </div>
                                                                        }
                                                                    </Grid>
                                                                )
                                                            })
                                                        }
                                                    </Grid>
                                                </Container>
                                            </Typography>
                                        )
                                    })
                                }
                            </Typography>
                            {
                                state?.email?.body?.length > 0 && <Divider style={{marginTop: 16}} />
                            }
                            <Typography component={'div'}
                                        style={{
                                            minHeight: state.email.body.length === 0 ?
                                                500 : 0
                                        }}
                            >
                                <h3 className={state?.email?.body?.length === 0 ? classes.centreContent : classes.centerSection}>
                                    <span className={classes.cursorPointer}
                                          onClick={() => {
                                              setDialogType('add-section');
                                              setDialogTitle('Add Section')
                                              setRenderDialog(true);
                                          }}
                                    >
                                        Click to define Section
                                    </span>
                                </h3>
                                {
                                    state?.email?.body?.length === 0 && <Divider />
                                }
                            </Typography>
                            <Divider/>
                            <Typography component={'div'}>
                                {
                                    Object.keys(state.email.footer).length > 0 ? <div>
                                            <IconButton
                                                aria-label="Delete item"
                                                color="primary"
                                                onClick={() => {
                                                    setDialogType('edit-footer');
                                                    setDialogTitle('Edit Footer');
                                                    setRenderDialog(true);
                                                }}
                                            >
                                                <EditIcon/>
                                            </IconButton>
                                            {
                                                state.langCode === state.defaultLang &&
                                                <IconButton
                                                    aria-label="Delete item"
                                                    color="primary"
                                                    onClick={() => {
                                                        setAlert(true);
                                                        setAlertDialogType('footer');
                                                    }}
                                                >
                                                    <DeleteIcon/>
                                                </IconButton>
                                            }
                                            <div style={{pointerEvents: "none"}}>
                                                {
                                                    state.langCode === state.defaultLang &&
                                                    <EmailFooter items={state.email.footer.items}/>
                                                }
                                                {
                                                    state.langCode && state.langCode !== state.defaultLang &&
                                                    state?.langsFile?.footer?.[state.langCode]?.items &&
                                                    <EmailFooter items={state.langsFile.footer[state.langCode].items}/>
                                                }
                                            </div>
                                        </div> :
                                        <h3 className={classes.centreContent}>
                                            <span className={classes.cursorPointer}
                                                  onClick={() => {
                                                      setDialogType('add-footer');
                                                      setDialogTitle('Add Footer')
                                                      setRenderDialog(true);
                                                  }}
                                            >
                                                Click to define Footer
                                            </span>
                                        </h3>
                                }
                            </Typography>
                        </Box>
                    </>
            }
            {
                isRenderDialog && <EmailGenericDialog
                    type={dialogType}
                    title={dialogTitle}
                    resetRenderDialog={resetRenderDialog}
                    onSelectHeader={handleSelectedHeader}
                    onSelectFooter={handleSelectedFooter}
                    onAddEmailSection={handleAddEmailSection}
                />
            }
            {
                editSectionDialog
            }
            {
                isAlert && <AlertDialog
                    handleDelete={handleDelete}
                    alertDialogType={alertDialogType}
                />
            }
        </Container>
    )
}

const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
};

const mapDispatchToProps = dispatch => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    pushToState: (stateType, stateName, value) => dispatch(pushToState(stateType, stateName, value)),
    deleteFromState: (stateType, stateName, value) => dispatch(deleteFromState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EmailDesign);