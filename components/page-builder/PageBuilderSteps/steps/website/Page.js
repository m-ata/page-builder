//react imports
import React, {useState, useEffect, useContext} from 'react';
//material imports
import {
    Checkbox,
    Container,
    FormControlLabel,
    Grid
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import BorderColorSharpIcon from '@material-ui/icons/BorderColorSharp';
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from '@material-ui/core/IconButton';
//redux imports
import { connect } from 'react-redux';
import {setToState, updateState, pushToState, deleteFromState} from "../../../../../state/actions";

import axios from "axios";
//custom  components imports
import Header from "../../components/website/header/Header";
import Footer from "../../components/website/footer/Footer";
import WebsiteGenericDialog from "../../components/website/generic/GenericDialog";
import EditPage from "../../components/website/pages/EditPage";
import Page from "../../components/website/pages/Page";
import {AlertDialog} from "../../components/alert";

import {toast} from "react-toastify";
import {COLORS, DELETE_SUCCESS} from "../../constants";
import {ViewList, UseOrest, Insert} from "@webcms/orest";
import {isErrorMsg, OREST_ENDPOINT, REQUEST_METHOD_CONST} from "../../../../../model/orest/constants";
import {useRouter} from "next/router";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import WebCmsGlobal from "../../../../webcms-global";
import LoadingSpinner from "../../../../LoadingSpinner";

const useStyles = makeStyles(theme => ({
    centreContent: {
        display: 'flex',
        justifyContent: 'center'
    },
    cursorPointer: {
        cursor: 'pointer',
        color: 'silver'
    },
    langFormControl: {
        minWidth: 250,
        marginRight: theme.spacing(1),
        marginTop: theme.spacing(2),
        float: "right"
    },
    titleButton: {
        marginLeft: theme.spacing(2),
        marginTop: theme.spacing(3),
        borderRadius: 20,
    },
    disabledEvent: {
        pointerEvents: 'none',
        opacity: 0.5
    }
}));

const defaultProps = {
    bgcolor: 'background.paper',
    border: 1,
    borderColor: 'silver',
};

const WebsitePage = (props) => {

    const {
        state,
        setToState,
        updateState
    } = props;

    const [renderDialog, setRenderDialog] = React.useState('');
    const [footer, setFooter] = React.useState(state.website.footer);
    const [header, setHeader] = React.useState(state.website.header);
    const [isAlert, setAlert] = React.useState(false);
    const [alertDialogType, setAlertDialogType] = useState('');
    const [languages, setLanguages] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [pageLangFile, setPageLangFile] = useState([]);
    const [hcmItemId, setHcmItemId] = useState(null);
    const [isRequestSend, setRequestSend] = useState(false);
    const [isLoaded, setIsLoaded] = useState(true);

    const classes = useStyles();

    const router = useRouter();
    const companyId = router.query.companyID;
    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal);
    const authToken = token || router.query.authToken;

    useEffect(() => {
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMITEM,
            token: authToken,
            params: {
                hotelrefno: Number(companyId),
                query: `code::WEBSITE-BUILDER-ITEM`,
            },
        }).then(res => {
            if (res.status === 200) {
                if (res?.data?.data?.length === 0) {
                    Insert({ // insert hcmitemtxt for website builder
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.HCMITEM,
                        token: authToken,
                        data: {
                            code: 'WEBSITE-BUILDER-ITEM',
                            hotelrefno: Number(companyId),
                        },
                    }).then(res1 => {
                        if (res1.status === 200) {
                            setHcmItemId(res1?.data?.data?.id);
                        } else {
                            const retErr = isErrorMsg(res1);
                            toast.error(retErr.errorMsg, {
                                position: toast.POSITION.TOP_RIGHT
                            });
                        }
                    })
                } else {
                    setHcmItemId(res?.data?.data[0]?.id);
                }
            } else {
                const retErr = isErrorMsg(res);
                toast.error(retErr.errorMsg, {
                    position: toast.POSITION.TOP_RIGHT
                });
            }
        })

        if (state?.isTemplate) {
            // handleGenerateTemplate();
        }

    }, []);

    useEffect(() => {
        if (hcmItemId) {
            setRequestSend(true);
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMLANG,
                token: authToken,
                params: {
                    hotelrefno: Number(companyId),
                    query: `langid::${state?.langId},itemid::${hcmItemId}`,
                },
            }).then(res => {
                if (res.status === 200) {
                    if (res?.data?.data?.length === 0) {
                        // insert hcmitemlang for default language
                        Insert({
                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                            endpoint: OREST_ENDPOINT.HCMITEMLANG,
                            token: authToken,
                            data: {
                                itemid: hcmItemId,
                                hotelrefno: Number(companyId),
                                langid: state?.langId
                            },
                        }).then(res1 => {
                            if (res1.status === 200) {
                                if (res?.data?.success && res?.data?.data) {
                                    setRequestSend(false);
                                }
                            } else {
                                const retErr = isErrorMsg(res1);
                                toast.error(retErr.errorMsg, {
                                    position: toast.POSITION.TOP_RIGHT
                                });
                            }
                        })
                    } else {
                        setRequestSend(false);
                    }
                } else {
                    const retErr = isErrorMsg(res);
                    toast.error(retErr.errorMsg, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
            })
            //Querying hcmitemlang to populate languages for website
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMLANG,
                token: authToken,
                params: {
                    hotelrefno: Number(companyId),
                    query: `itemid::${hcmItemId}`,
                },
            }).then((res) => {
                if (res.status === 200) {
                    let websiteLanguages = [];
                    if (res?.data?.data?.length > 0) {
                        res.data.data.map(itemLang => {
                            const lang = state?.languages?.find(lang => lang?.id === itemLang?.langid);
                            (lang && websiteLanguages.indexOf(lang) === -1)&& websiteLanguages.push(lang);
                            setLanguages(websiteLanguages);
                        });
                        const selectedLang = state?.languages?.find(lang => lang?.code?.toLowerCase() === state?.langCode);
                        selectedLang && setSelectedLanguage(selectedLang);
                    }
                } else {
                    const retErr = isErrorMsg(res);
                    toast.error(retErr.errorMsg, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
            });
        }
    }, [hcmItemId]);

    useEffect(() => {
        let gids = []
        if (state.website.pages.length > 0) {
            Promise.all(state.website.pages.map(page => {
                gids.push(page.gid);
            }))
            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: 'rafile/list/get/gid',
                token: authToken,
                method: REQUEST_METHOD_CONST.POST,
                data: JSON.stringify(gids),
                params: {
                    hotelrefno:  Number(companyId)
                }
            }).then(res => {
                if (res.status === 200 && res.data && res.data.data.length > 0) {
                    if (res?.data?.data?.length) {
                        let mids = []
                        Promise.all(res.data.data.map(data => {
                            mids.push(data.mid);
                        }))
                        UseOrest({
                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                            endpoint: OREST_ENDPOINT.RAFILE + '/' + OREST_ENDPOINT.LIST + '/get/masterid',
                            token: authToken,
                            method: REQUEST_METHOD_CONST.POST,
                            data: mids,
                            params: {
                                hotelrefno:  Number(companyId)
                            }
                        }).then(res1 => {
                            if (res1.status === 200) {
                                if (res1?.data?.data?.length) {
                                    let otherLangsGids = [];
                                    Promise.all(res1.data.data.map(data => {
                                        otherLangsGids.push({
                                            gid: data.gid
                                        });
                                    }))
                                    setPageLangFile(otherLangsGids);
                                } else {
                                    toast.warn('Page language data is not available as per selected language', {
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
                    } else {
                        toast.warn('Page language data is not available as per selected language', {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    }
                } else {
                    const retErr = isErrorMsg(res);
                    toast.error(retErr.errorMsg, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
            })
        }
    }, [state.website.pages, state.langCode]);

    const handleGenerateTemplate = async () => {
        setIsLoaded(false);
        let updatedPages = [...state?.website?.pages];
        for (let page of updatedPages) {
            const index = updatedPages.indexOf(page);
            const RAFILE_GET = {
                url:
                    GENERAL_SETTINGS.OREST_URL +
                    OREST_ENDPOINT.SLASH +
                    OREST_ENDPOINT.RAFILE +
                    OREST_ENDPOINT.SLASH +
                    'view/list',
                method: REQUEST_METHOD_CONST.GET,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                params: {
                    hotelrefno: Number(companyId),
                    query: `gid::${page?.gid}`
                },
            }
            const rafile = await getData(RAFILE_GET);
            if (rafile?.length > 0) {
                const RAFILE_INS = {
                    url:
                        GENERAL_SETTINGS.OREST_URL +
                        OREST_ENDPOINT.SLASH +
                        OREST_ENDPOINT.RAFILE +
                        OREST_ENDPOINT.SLASH +
                        'ins',
                    method: REQUEST_METHOD_CONST.POST,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                    data: {
                        code: rafile[0]?.code,
                        description: rafile[0]?.description,
                        filetype: 'WEBPAGE',
                        filedata: rafile[0]?.filedata,
                        langid: state.langId,
                        hotelrefno: Number(companyId),
                    },
                }
                const rafileIns = await handleInsertData(RAFILE_INS);
                updatedPages[index] = {gid: rafileIns?.gid}
            }
        }
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
                    resv(error.response || { status: 0 })
                })
        })
    }

    const selectedFooter = (footer) => {
        setToState('pageBuilder', ['website', 'footer'], footer);
    }

    const onSelectHeader = (header) => {
        setToState('pageBuilder', ['website', 'header'], header);
    }

    const onAddPage = (pages) => {
        setToState('pageBuilder', ['website', 'pages'], pages);
    }

    const resetRender = () => {
        setRenderDialog('');
    }

    const onEditFooter = (footer) => {
        if (state.langCode === state.defaultLang) {
            setToState('pageBuilder', ['website', 'footer'], footer);
        } else {
            const updatedlangsFile = {...state.langsFile};
            if (updatedlangsFile.footer[state.langCode]) {
                setToState('pageBuilder', ['langsFile', 'footer', state.langCode], footer);
            }
        }
    }

    const onEditHeader = (header) => {
        if (state.langCode === state.defaultLang) {
            setToState('pageBuilder', ['website', 'header'], header);
        } else {
            const updatedlangsFile = {...state.langsFile};
            if (updatedlangsFile.header[state.langCode]) {
                setToState('pageBuilder', ['langsFile', 'header', state.langCode], header);
            }
        }
    }

    const renderGenericDialog = (type) => {
        switch (type) {
            case 'header':
                setRenderDialog(<WebsiteGenericDialog dialogTitle="Select Header" type='header' isDialogOpen={true}
                                               selectedHeader={onSelectHeader} resetRender={resetRender}/>);
                break;
            case 'footer':
                setRenderDialog(<WebsiteGenericDialog dialogTitle="Select Footer" type="footer" onSelectFooter={selectedFooter}
                                               isDialogOpen={true} resetRender={resetRender}/>);
                break;
            case 'page':
                setRenderDialog(<WebsiteGenericDialog dialogTitle="Add Page" type="page" onAddPage={onAddPage}
                                               isDialogOpen={true} resetRender={resetRender}/>);
                break;
            case 'edit-header':
                setRenderDialog(<WebsiteGenericDialog dialogTitle="Edit Header" type="edit-header" headerType={header}
                                               onEditHeader={onEditHeader} isDialogOpen={true}
                                               resetRender={resetRender}/>);
                break;
            case 'edit-footer':
                setRenderDialog(<WebsiteGenericDialog dialogTitle="Edit Footer" type="edit-footer" footerType={footer}
                                               onEditFooter={onEditFooter} isDialogOpen={true}
                                               resetRender={resetRender}/>);
                break;
            default:
                setRenderDialog('');
        }
    }

    const onEditPage = (pages) => {
        setToState('pageBuilder', ['website', 'pages'], pages);
    }

    const editSectionDialog = (webPages) => {
        setRenderDialog(<EditPage
                            webPages={webPages}
                            onEditPage={onEditPage}
                            dialogTitle="Edit Page"
                            isDialogOpen={true}
                            resetRender={resetRender}
        />);
    }

    const deleteHeader = () => {
        setToState('pageBuilder', ['website', 'header'], {});
        setToState('pageBuilder', ['langsFile', 'header'], {});
        toast.success(DELETE_SUCCESS, {
            position: toast.POSITION.TOP_RIGHT
        });
    }

    const deleteFooter = () => {
        setToState('pageBuilder', ['website', 'footer'], {});
        setToState('pageBuilder', ['langsFile', 'footer'], {});
        toast.success(DELETE_SUCCESS, {
            position: toast.POSITION.TOP_RIGHT
        });
    }

    const handleDelete = (type, isDelete) => {
        if (isDelete) {
            switch (type) {
                case 'header':
                    deleteHeader();
                    break;
                case 'footer':
                    deleteFooter();
                    break;
                case 'footerOnly':
                    handleDeleterFooterOnly();
                    break;
            }
        }
        setAlert(false);
    }

    const handleFooterOnly = () => {
        if (Object.keys(state.website.header).length > 0 || state.website.length > 0) {
            setAlert(true);
            setAlertDialogType('footerOnly');
        } else {
            updateState('pageBuilder', 'footerOnly', !state.footerOnly);
        }
    }

    const handleDeleterFooterOnly = () => {
        updateState('pageBuilder', 'footerOnly', !state.footerOnly);
        setToState('pageBuilder', ['website', 'header'], {});
        setToState('pageBuilder', ['website', 'pages'], []);
    }

    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setRequestSend(true);
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMITEMLANG,
            token: authToken,
            params: {
                hotelrefno: Number(companyId),
                query: `langid::${lang?.id},itemid::${hcmItemId}`,
            },
        }).then(res => {
            if (res.status === 200) {
                if (res?.data?.data?.length === 0) {
                    // inser language into hcmitemlang
                    Insert({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.HCMITEMLANG,
                        token: authToken,
                        data: {
                            itemid: hcmItemId,
                            hotelrefno: Number(companyId),
                            langid: lang?.id
                        },
                    }).then(res1 => {
                        if (res1.status === 200) {
                            if (res?.data?.success && res?.data?.data) {
                                setRequestSend(false);
                                handleSetLangContent(lang);
                            }
                        } else {
                            const retErr = isErrorMsg(res1);
                            toast.error(retErr.errorMsg, {
                                position: toast.POSITION.TOP_RIGHT
                            });
                        }
                    })
                } else {
                    setRequestSend(false);
                    handleSetLangContent(lang);
                }
            } else {
                const retErr = isErrorMsg(res);
                toast.error(retErr.errorMsg, {
                    position: toast.POSITION.TOP_RIGHT
                });
            }
        })

    }

    const handleSetLangContent = async (lang) => {
        const code = lang?.code;
        setSelectedLanguage(lang);
        updateState('pageBuilder', 'langCode', code);
        updateState('pageBuilder', 'langId', lang?.id);
        const updatedlangsFile = {...state.langsFile};
        if (code !== state.defaultLang) {
            if (Object.keys(state.langsFile).length === 0) {
                updatedlangsFile['header'] = {};
                updatedlangsFile['footer'] = {};
                updatedlangsFile['pages'] = [];
            } else {
                if (!state.langsFile.header) {
                    updatedlangsFile['header'] = {};
                }
                if (!state.langsFile.footer) {
                    updatedlangsFile['footer'] = {};
                }
                if (!state.langsFile.pages) {
                    updatedlangsFile['pages'] = [];
                }
            }
            if (!updatedlangsFile.header[code]) {
                updatedlangsFile.header[code] = {
                    items: []
                }
                handleSetDefaultHeader(updatedlangsFile, code);
            } else {
                if (updatedlangsFile.header[code].items.length < state.website.header.items.length) {
                    for (let i = updatedlangsFile.header[code].items.length; i < state.website.header.items.length; i++) {
                        updatedlangsFile.header[code].items.push({
                            items: []
                        });
                        for (let item of state.website.header.items[i].items) {
                            const itemIndex = state.website.header.items[i].items.indexOf(item);
                            updatedlangsFile.header[code].items[i].items.push({
                                value: []
                            });
                            item.value.map((val, index) => {
                                if (val.type === 'social-link' || val.type === 'internal-link' ||
                                    val.type === 'external-link' || val.type === 'address' ||
                                    val.type === 'button') {
                                    updatedlangsFile.header[code].items[i].items[itemIndex].value[index] = {
                                        value: val.value.title
                                    }
                                }
                                if (val.type === 'phone' || val.type === 'email' || val.type === 'logo') {
                                    updatedlangsFile.header[code].items[i].items[itemIndex].value[index] = {
                                        value: val.value
                                    }
                                }
                            })
                        }
                    }
                    updateState('pageBuilder', 'langsFile', updatedlangsFile);
                }
                if (updatedlangsFile.header[code].items.length > state.website.header.items.length) {
                    handleSetDefaultHeader(updatedlangsFile, code);
                }
                if (updatedlangsFile.header[code].items.length === state.website.header.items.length) {
                    Promise.all(state.website.header.items.map((item, index) => {
                        if (item.items.length > updatedlangsFile.header[code].items[index].items.length) {
                            for (let i = updatedlangsFile.header[code].items[index].items.length; i < state.website.header.items[index].items.length; i++) {
                                updatedlangsFile.header[code].items[index].items.push({
                                    value: []
                                });
                                item.items[i].value.map((val, itemIndex) => {
                                    if (val.type === 'social-link' || val.type === 'internal-link' ||
                                        val.type === 'external-link' || val.type === 'address' ||
                                        val.type === 'button') {
                                        updatedlangsFile.header[code].items[index].items[i].value[itemIndex] = {
                                            value: val.value.title
                                        }
                                    }
                                    if (val.type === 'phone' || val.type === 'email' || val.type === 'logo') {
                                        updatedlangsFile.header[code].items[index].items[i].value[itemIndex] = {
                                            value: val.value
                                        }
                                    }
                                })
                            }
                        }
                        if (item.items.length < updatedlangsFile.header[code].items[index].items.length) {
                            for (let i = item.items.length; i < updatedlangsFile.header[code].items[index].items.length; i++) {
                                updatedlangsFile.header[code].items[index].items.length = item.items.length;
                            }
                        }
                    }))
                }
                Promise.all(state.website.header.items.map((item, index) => {
                    for (let i = 0; i < item.items.length; i++) {
                        if (item.items[i].value.length > updatedlangsFile.header[code].items[index].items[i].value.length) {
                            for (let j = updatedlangsFile.header[code].items[index].items[i].value.length; j < item.items[i].value.length; j++ ) {
                                if (item.items[i].value[j].type === 'social-link' ||
                                    item.items[i].value[j].type === 'internal-link' ||
                                    item.items[i].value[j].type === 'external-link' ||
                                    item.items[i].value[j].type === 'address' ||
                                    item.items[i].value[j].type === 'button') {
                                    updatedlangsFile.header[code].items[index].items[i].value[j] = {
                                        value: item.items[i].value[j].value.title
                                    }
                                }
                                if (item.items[i].value[j].type === 'phone' || item.items[i].value[j].type === 'email' ||
                                    item.items[i].value[j].type === 'logo') {
                                    updatedlangsFile.header[code].items[index].items[i].value[j] = {
                                        value: item.items[i].value[j].value
                                    }
                                }
                            }
                        }
                        if (item.items[i].value.length < updatedlangsFile.header[code].items[index].items[i].value.length) {
                            updatedlangsFile.header[code].items[index].items[i].value.length = item.items[i].value.length;
                        }
                    }
                }))
                updateState('pageBuilder', 'langsFile', updatedlangsFile);
            }
            if (!updatedlangsFile?.footer?.[code]) {
                updatedlangsFile.footer[code] = {
                    items: []
                }
                handleSetDefaultFooter(updatedlangsFile, code);
            } else {
                if (updatedlangsFile.footer[code].items.length < state.website.footer.items.length) {
                    for (let i = updatedlangsFile.footer[code].items.length; i < state.website.footer.items.length; i++) {
                        updatedlangsFile.footer[code].items.push({
                            items: []
                        });
                        for (let item of state.website.footer.items[i].items) {
                            const itemIndex = state.website.footer.items[i].items.indexOf(item);
                            updatedlangsFile.footer[code].items[i].items.push({
                                value: []
                            });
                            item.value.map((val, index) => {
                                if (val.type === 'social-link' ||
                                    val.type === 'link' || val.type === 'button' ||
                                    val.type === 'address' || val.type === 'internal-link') {
                                    updatedlangsFile.footer[code].items[i].items[itemIndex].value[index] = {
                                        value: val.value.title
                                    }
                                }
                                if (val.type === 'phone' || val.type === 'email' || val.type === 'logo' ||
                                    val.type === 'paragraph' || val.type === 'heading' || val.type === 'image') {
                                    updatedlangsFile.footer[code].items[i].items[itemIndex].value[index] = {
                                        value: val.value
                                    }
                                }
                            })
                        }
                    }
                }
                if (updatedlangsFile.footer[code].items.length > state.website.footer.items.length) {
                    updatedlangsFile.footer[code].items.length = state.website.footer.items.length;
                }
                if (updatedlangsFile.footer[code].items.length === state.website.footer.items.length) {
                    Promise.all(state.website.footer.items.map((item, index) => {
                        if (item.items.length > updatedlangsFile.footer[code].items[index].items.length) {
                            for (let i = updatedlangsFile.footer[code].items[index].items.length; i < state.website.footer.items[index].items.length; i++) {
                                updatedlangsFile.footer[code].items[index].items.push({
                                    value: []
                                });
                                item.items[i].value.map((val, itemIndex) => {
                                    if (val.type === 'social-link' ||
                                        val.type === 'link' || val.type === 'button' ||
                                        val.type === 'address' || val.type === 'internal-link') {
                                        updatedlangsFile.footer[code].items[index].items[i].value[itemIndex] = {
                                            value: val.value.title
                                        }
                                    }
                                    if (val.type === 'phone' || val.type === 'email' || val.type === 'logo' ||
                                        val.type === 'paragraph' || val.type === 'heading' || val.type === 'image') {
                                        updatedlangsFile.footer[code].items[index].items[i].value[itemIndex] = {
                                            value: val.value
                                        }
                                    }
                                })
                            }
                        }
                        if (item.items.length < updatedlangsFile.footer[code].items[index].items.length) {
                            updatedlangsFile.footer[code].items[index].items.length = item.items.length;
                        }
                    }))
                }
                Promise.all(state.website.footer.items.map((item, index) => {
                    for (let i = 0; i < item.items.length; i++) {
                        if (item.items[i].value.length > updatedlangsFile.footer[code].items[index].items[i].value.length) {
                            for (let j = updatedlangsFile.footer[code].items[index].items[i].value.length; j < item.items[i].value.length; j++ ) {
                                if (item.items[i].value[j].type === 'social-link' ||
                                    item.items[i].value[j].type === 'link' ||
                                    item.items[i].value[j].type === 'button' ||
                                    item.items[i].value[j].type === 'address' ||
                                    item.items[i].value[j].type === 'internal-link') {
                                    updatedlangsFile.footer[code].items[index].items[i].value[j] = {
                                        value: item.items[i].value[j].value.title
                                    }
                                }
                                if (item.items[i].value[j].type === 'phone' || item.items[i].value[j].type === 'email' ||
                                    item.items[i].value[j].type === 'logo' ||
                                    item.items[i].value[j].type === 'paragraph' ||
                                    item.items[i].value[j].type === 'heading' ||
                                    item.items[i].value[j].type === 'image') {
                                    updatedlangsFile.footer[code].items[index].items[i].value[j] = {
                                        value: item.items[i].value[j].value
                                    }
                                }
                            }
                        }
                    }
                }))
            }
            setToState('pageBuilder', ['langsFile', 'pages'], pageLangFile);
        }
    }

    const handleSetDefaultHeader = (updatedlangsFile, code) => {
        Promise.all(state.website.header.items.map((rowItem, rowIndex) => {
            updatedlangsFile.header[code].items[rowIndex] = {
                items: []
            }
            rowItem.items.map((colItem, colIndex) => {
                updatedlangsFile.header[code].items[rowIndex].items[colIndex] = {
                    value: []
                };
                colItem.value.map((val, i) => {
                    if (val.type === 'social-link' ||
                        val.type === 'internal-link' ||
                        val.type === 'external-link' ||
                        val.type === 'address' ||
                        val.type === 'button') {
                        updatedlangsFile.header[code].items[rowIndex].items[colIndex].value[i] = {
                            value: val.value.title
                        };
                    }
                    if (val.type === 'phone' || val.type === 'email' || val.type === 'logo') {
                        updatedlangsFile.header[code].items[rowIndex].items[colIndex].value[i] = {
                            value: val.value
                        };
                    }
                })
            });
        }))
        updateState('pageBuilder', 'langsFile', updatedlangsFile);
    }

    const handleSetDefaultFooter = (updatedlangsFile, code) => {
        Promise.all(state.website.footer.items.map((rowItem, rowIndex) => {
            updatedlangsFile.footer[code].items[rowIndex] = {
                items: []
            }
            rowItem.items.map((colItem, colIndex) => {
                updatedlangsFile.footer[code].items[rowIndex].items[colIndex] = {
                    value: []
                };
                colItem.value.map((val, i) => {
                    if (val.type === 'social-link' ||
                        val.type === 'link' || val.type === 'button'||
                        val.type === 'address' || val.type === 'internal-link' ) {
                        updatedlangsFile.footer[code].items[rowIndex].items[colIndex].value[i] = {
                            value: val.value.title
                        };
                    }
                    if (val.type === 'phone' || val.type === 'email' || val.type === 'logo'
                        || val.type === 'paragraph' || val.type === 'heading' || val.type === 'image') {
                        updatedlangsFile.footer[code].items[rowIndex].items[colIndex].value[i] = {
                            value: val.value
                        };
                    }
                })
            });
        }))
        updateState('pageBuilder', 'langsFile', updatedlangsFile);
    }

    if (!isLoaded) {
        return <LoadingSpinner style={{color: COLORS.secondary}} />
    }

    return (
        <Container className={isRequestSend ? classes.disabledEvent : ''}>
            <Grid container={true}>
                <Grid item={true} xs={6}>
                    <FormControl size={'small'}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={state.footerOnly}
                                    onChange={handleFooterOnly}
                                    name="footerOnly"
                                    color="primary"
                                />
                            }
                            label="Footer Only"
                        />
                    </FormControl>
                </Grid>
                <Grid item={true} xs={6}>
                    <FormControl
                        variant="outlined"
                        style={{float: "right"}}
                        disabled={(Object.keys(state.website.header).length === 0 ||
                            state.website.pages.length === 0 ||
                            Object.keys(state.website.footer).length === 0)}
                        size={'small'}
                    >
                        <Select
                            value={selectedLanguage}
                            onChange={handleLanguageChange}
                            label="Language"
                        >
                            {
                                languages.length > 0 && languages.map((lang, index) => {
                                    return (
                                        <MenuItem value={lang} key={index}>
                                            {' '}
                                            {lang.description}{' '}
                                        </MenuItem>
                                    )
                                })
                            }
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            <Box {...defaultProps}>
                <div>
                    {
                        Object.keys(state.website.header).length > 0 ?
                            <>
                                <Button onClick={() => renderGenericDialog('edit-header')}>
                                    <BorderColorSharpIcon color="primary" />
                                </Button>
                                {
                                    state.langCode === state.defaultLang && <IconButton
                                        aria-label="Delete item"
                                        color="primary"
                                        onClick={() => {
                                            setAlert(true);
                                            setAlertDialogType('header');
                                        }}
                                    >
                                        <DeleteIcon color="primary" />
                                    </IconButton>
                                }
                                <div style={{pointerEvents: 'none'}}>
                                    {
                                        state.langCode === state.defaultLang &&
                                        <Header headerItems={state.website.header.items}/>
                                    }
                                    {
                                        state.langCode !== state.defaultLang &&
                                        Object.keys(state.langsFile).length > 0 &&
                                        state.langsFile.header &&
                                        <Header headerItems={state?.langsFile?.header?.[state.langCode]?.items}/>
                                    }
                                </div>
                            </>
                            :
                            <h3 className={classes.centreContent} >
                                <span onClick={() => renderGenericDialog('header')}
                                      className={classes.cursorPointer}
                                      style={{pointerEvents: state.footerOnly ? 'none' : '', opacity: state.footerOnly ? 0.5 : 1}}
                                >
                                    Click to define Header
                                </span>
                            </h3>
                    }
                </div>

                <hr />

                <div style={{minHeight: '50vh'}}>
                    {
                        state.website.pages.length > 0 && <Container>
                            {
                                state.langCode === state.defaultLang &&
                                <Button
                                    onClick={() => editSectionDialog(state.website.pages)}
                                    color="primary"
                                >
                                    <BorderColorSharpIcon/>
                                </Button>
                            }
                            {
                                state.langCode === state.defaultLang && state.website.pages && state.website.pages.length > 0 &&
                                state.website.pages[0] && state.website.pages[0].gid &&
                                <Page gid={state.website.pages[0].gid}/>
                            }
                            {
                                state.langCode !== state.defaultLang && state.website.pages && state.website.pages.length > 0 &&
                                state.website.pages[0] && state.website.pages[0].gid && state.langsFile && state.langsFile.pages &&
                                state.langsFile.pages.length > 0 && state.langsFile.pages[0] && state.langsFile.pages[0].gid &&
                                <Page gid={state.website.pages[0].gid}
                                        otherLangGID={state?.langsFile?.pages[0]?.gid}
                                />
                            }
                            </Container>
                    }
                    {
                        state.website.pages.length === 0 && <h3 className={classes.centreContent}

                        >
                                <span
                                    onClick={() => renderGenericDialog('page')}
                                    className={classes.cursorPointer}
                                    style={{pointerEvents: state.footerOnly ? 'none' : '', opacity: state.footerOnly ? 0.5 : 1}}
                                >
                                    Click to define Page
                                </span>
                        </h3>
                    }
                    {
                        state.website.pages.length === 0 && <hr />
                    }
                </div>

                <hr />

                <div>
                    {
                        Object.keys(state.website.footer).length > 0 ?
                            <>
                                <Button onClick={() => renderGenericDialog('edit-footer')}>
                                    <BorderColorSharpIcon color="primary"/>
                                </Button>
                                {
                                    state.langCode === state.defaultLang && <IconButton
                                        aria-label="Delete item"
                                        color="primary"
                                        onClick={() => {
                                            setAlert(true);
                                            setAlertDialogType('footer');
                                        }}
                                    >
                                        <DeleteIcon color="primary"/>
                                    </IconButton>
                                }
                                <div style={{pointerEvents: 'none'}}>
                                    {
                                        state.langCode === state.defaultLang &&
                                        <Footer footerItems={state?.website?.footer?.items}/>
                                    }
                                    {
                                        state.langCode !== state.defaultLang &&
                                        <Footer footerItems={state?.langsFile?.footer?.[state.langCode]?.items}/>
                                    }
                                </div>
                            </> :
                            <h3 className={classes.centreContent}>
                                <span onClick={() => renderGenericDialog('footer')}
                                      className={classes.cursorPointer}>
                                    Click to define Footer
                                </span>
                            </h3>
                    }
                </div>

            </Box>
            {renderDialog}
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
}

const mapDispatchToProps = dispatch => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    pushToState: (stateType, stateName, value) => dispatch(pushToState(stateType, stateName, value)),
    deleteFromState: (stateType, stateName, value) => dispatch(deleteFromState(stateType, stateName, value))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WebsitePage)
